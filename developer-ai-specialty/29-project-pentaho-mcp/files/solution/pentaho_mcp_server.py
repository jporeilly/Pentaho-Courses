"""Pentaho MCP server: lets an AI assistant list, run and monitor Pentaho Data Integration work on Carte.

A Model Context Protocol (MCP) server, written with the official MCP Python SDK (FastMCP), in front of
Carte, Pentaho Data Integration's lightweight server. It talks to Carte's REST API and offers:

  list_files()                                   the .ktr and .kjb files in the allowed folder
  get_status()                                   Carte's state and every transformation and job it holds
  get_transformation_status(name, id)            one transformation's status, errors and step counts
  get_job_status(name, id)                       one job's status, errors and result
  run_transformation(path, params, wait_seconds) runs a .ktr from the allowed folder on Carte
  run_job(path, params, wait_seconds)            runs a .kjb from the allowed folder on Carte
  get_log(name, id, kind, tail_lines)            the last lines of a run's log, and its ERROR lines
  stop_transformation(name, id)                  stops a running transformation
  stop_job(name, id)                             stops a running job
  carte://status, pdi://files                    the same status and file list, as resources

Settings, from environment variables only (never from a tool's arguments):
  CARTE_URL          Carte's address, default http://127.0.0.1:8081
  CARTE_USER         Carte user name    (required: no default, never logged)
  CARTE_PASSWORD     Carte password     (required: no default, never logged)
  PDI_ALLOWED_DIR    the only folder whose files may run (required: no default)
  PDI_MCP_READ_ONLY  1 = only the read tools exist: no run_ and no stop_ tool is offered at all
  PDI_MCP_AUDIT_LOG  the JSON Lines audit log, default audit_log.jsonl beside this file

Start it with:  python pentaho_mcp_server.py              (stdio: an MCP client starts it)
           or:  python pentaho_mcp_server.py --http      (Streamable HTTP on http://127.0.0.1:8766/mcp)
Over stdio the client talks to it through its standard input and output, so it writes nothing else there.

Needs the MCP Python SDK:  python -m pip install "mcp<2"
"""
import argparse
import base64
import functools
import gzip
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from mcp.server.fastmcp import FastMCP

HERE = Path(__file__).resolve().parent
CARTE_URL = os.environ.get("CARTE_URL", "http://127.0.0.1:8081").rstrip("/")
CARTE_USER = os.environ.get("CARTE_USER", "")
CARTE_PASSWORD = os.environ.get("CARTE_PASSWORD", "")
# No default: until PDI_ALLOWED_DIR names a folder, the server lists and runs nothing.
ALLOWED_DIR = Path(os.environ["PDI_ALLOWED_DIR"]).resolve() if os.environ.get("PDI_ALLOWED_DIR") else None
READ_ONLY = os.environ.get("PDI_MCP_READ_ONLY", "").strip().lower() in ("1", "true", "yes", "y")
AUDIT_LOG = Path(os.environ.get("PDI_MCP_AUDIT_LOG") or HERE / "audit_log.jsonl")

cli = argparse.ArgumentParser(description="Pentaho MCP server in front of Carte")
cli.add_argument("--http", action="store_true", help="serve Streamable HTTP instead of stdio")
cli.add_argument("--port", type=int, default=8766, help="the HTTP port (with --http), default 8766")
ARGS, _ = cli.parse_known_args()

# 127.0.0.1 only: Streamable HTTP here has no token yet (a stretch goal), so it must not listen on the network.
# WARNING keeps the SDK's per-request INFO lines out of the client's log (they go to stderr).
mcp = FastMCP("pentaho-carte", host="127.0.0.1", port=ARGS.port, log_level="WARNING")


# ================================================================== M1: Carte's REST API

def _carte(path: str, query: dict | None = None, body: bytes | None = None) -> ET.Element:
    """Calls Carte and returns its XML answer. Credentials come from the environment, never from a tool."""
    if not CARTE_USER or not CARTE_PASSWORD:
        raise ValueError("CARTE_USER and CARTE_PASSWORD are not set in the server's environment.")
    url = f"{CARTE_URL}{path}?{urllib.parse.urlencode(dict(query or {}, xml='Y'))}"
    token = base64.b64encode(f"{CARTE_USER}:{CARTE_PASSWORD}".encode()).decode()
    req = urllib.request.Request(url, data=body, headers={"Authorization": f"Basic {token}",
                                                          "Content-Type": "text/xml; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            text = r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        if e.code == 401:
            raise ValueError("Carte refused the user name or password (HTTP 401).") from None
        text = e.read().decode("utf-8", "replace")
        msg = re.search(r"<message>(.*?)</message>", text, re.S)
        first = (msg.group(1) if msg else text).strip().splitlines()
        raise ValueError(f"Carte answered HTTP {e.code}: {first[0] if first else ''}".strip()) from None
    except urllib.error.URLError as e:
        raise ValueError(f"Cannot reach Carte at {CARTE_URL}: {e.reason}") from None
    root = ET.fromstring(text.strip())
    if root.tag == "webresult" and root.findtext("result") == "ERROR":
        raise ValueError(f"Carte: {(root.findtext('message') or '').strip().splitlines()[0]}")
    return root


def _num(el: ET.Element, tag: str) -> int:
    try:
        return int(el.findtext(tag) or 0)
    except ValueError:
        return 0


# ================================================================== M1: the allowed folder and the read tools

def _allowed() -> Path:
    if ALLOWED_DIR is None or not ALLOWED_DIR.is_dir():
        raise ValueError("PDI_ALLOWED_DIR is not set to an existing folder in the server's environment.")
    return ALLOWED_DIR


def _declared(full: Path) -> tuple[str, dict]:
    """The file's name and its declared parameters with their defaults, read from its XML."""
    root = ET.parse(full).getroot()
    info = root.find("info") if root.tag == "transformation" else root
    params = {p.findtext("name"): p.findtext("default_value") or ""
              for p in info.iterfind("parameters/parameter")}
    return info.findtext("name") or full.stem, params


def _files() -> dict:
    files, allowed = [], _allowed()
    for f in sorted(allowed.rglob("*")):
        if f.suffix.lower() in (".ktr", ".kjb") and f.is_file():
            name, params = _declared(f)
            files.append({"path": f.relative_to(allowed).as_posix(), "name": name, "parameters": params,
                          "kind": "transformation" if f.suffix.lower() == ".ktr" else "job"})
    return {"read_only": READ_ONLY, "count": len(files), "files": files}


def _server_status() -> dict:
    root = _carte("/kettle/status/")
    trans = [{"name": t.findtext("transname"), "id": t.findtext("id"), "status": t.findtext("status_desc")}
             for t in root.iterfind("transstatuslist/transstatus")]
    jobs = [{"name": j.findtext("jobname"), "id": j.findtext("id"), "status": j.findtext("status_desc")}
            for j in root.iterfind("jobstatuslist/jobstatus")]
    return {"server": CARTE_URL, "state": root.findtext("statusdesc"), "threads": _num(root, "thread_count"),
            "memory_free_mb": _num(root, "memory_free") // 1048576, "uptime_seconds": _num(root, "uptime") // 1000,
            "transformation_count": len(trans), "job_count": len(jobs), "transformations": trans, "jobs": jobs}


def list_files() -> dict:
    """List the transformations (.ktr) and jobs (.kjb) this server may run, with the parameters each
    declares and their defaults. Only files in the allowed folder are listed, and only they can run.
    Use the path exactly as listed with run_transformation or run_job."""
    return _files()


def get_status() -> dict:
    """Get the Carte server's state (Online), its threads, free memory and uptime, and every
    transformation and job it holds, each with its name, Carte id and status."""
    return _server_status()


@mcp.resource("carte://status", mime_type="application/json")
def status_resource() -> str:
    """The Carte server's status, as returned by get_status."""
    return json.dumps(_server_status(), indent=2)


@mcp.resource("pdi://files", mime_type="application/json")
def files_resource() -> str:
    """The transformations and jobs this server may run, as returned by list_files."""
    return json.dumps(_files(), indent=2)


READ_TOOLS = [list_files, get_status]  # tools that only read
RUN_TOOLS = []                         # tools that change something on Carte


# ================================================================== M2: run and status

DONE = ("Finished", "Stopped")  # Carte's status_desc starts with one of these when a run has ended
PARAM_NAME = re.compile(r"^[A-Za-z_][A-Za-z0-9_.]{0,63}$")


def _run_summary(el: ET.Element, kind: str) -> dict:
    """The fields every status answer shares, from a <transstatus> or <jobstatus> element."""
    status = el.findtext("status_desc") or ""
    if status.startswith("Finished") and el.findtext("result/is_stopped") == "Y":
        status = "Stopped"  # Carte reports a stopped run as Finished; its result says it was stopped
    errors = _num(el, "result/nr_errors")
    if kind == "transformation":
        errors = max(errors, sum(_num(s, "errors") for s in el.iter("stepstatus")))
    finished = status.startswith(DONE)
    return {"kind": kind, "name": el.findtext("transname") or el.findtext("jobname") or "",
            "id": el.findtext("id") or "", "status": status, "errors": errors, "finished": finished,
            "succeeded": (status == "Finished" and errors == 0) if finished else None,
            "error_desc": (el.findtext("error_desc") or "").strip()}


def _status(kind: str, name: str, carte_id: str) -> ET.Element:
    path = "/kettle/transStatus/" if kind == "transformation" else "/kettle/jobStatus/"
    return _carte(path, {"name": name, "id": carte_id})


def _wait(kind: str, name: str, carte_id: str, seconds: int) -> dict:
    end = time.monotonic() + max(0, min(seconds, 120))
    while True:
        out = _run_summary(_status(kind, name, carte_id), kind)
        if out["finished"] or time.monotonic() >= end:
            return out
        time.sleep(1)


def _resolve(path: str, suffix: str) -> Path:
    """A file the server may run: relative, inside PDI_ALLOWED_DIR, with the right extension, and existing."""
    allowed = _allowed()
    p = Path((path or "").strip())
    if not p.parts:
        raise ValueError("No path given. Call list_files to see what can run.")
    if p.is_absolute() or p.drive or p.anchor:
        raise ValueError(f"Refused {path!r}: give a path relative to the allowed folder, as list_files shows it.")
    if ".." in p.parts:
        raise ValueError(f"Refused {path!r}: '..' is not allowed.")
    if p.suffix.lower() != suffix:
        raise ValueError(f"Refused {path!r}: this tool runs {suffix} files only.")
    full = (allowed / p).resolve()
    if not full.is_relative_to(allowed):
        raise ValueError(f"Refused {path!r}: it is outside the allowed folder.")
    if not full.is_file():
        raise ValueError(f"No file {path!r} in the allowed folder. Call list_files to see what can run.")
    return full


def _check_params(full: Path, params: dict | None) -> dict:
    """Only parameters the file declares, with short text values: nothing else reaches Carte."""
    _, declared = _declared(full)
    out = {}
    for k, v in (params or {}).items():
        if not PARAM_NAME.match(str(k)) or k not in declared:
            raise ValueError(f"Refused parameter {k!r}: {full.name} declares "
                             f"{', '.join(declared) if declared else 'no parameters'}.")
        v = str(v)
        if len(v) > 500:
            raise ValueError(f"Refused parameter {k!r}: values are at most 500 characters.")
        out[k] = v
    return out


def _xml(v: str) -> str:
    return v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def run_transformation(path: str, params: dict[str, str] | None = None, wait_seconds: int = 0) -> dict:
    """Run a transformation (.ktr) from the allowed folder on Carte. path is relative, as list_files
    shows it; params sets the parameters the file declares. With wait_seconds above 0 (at most 120),
    waits for the run to end and returns its final status. Returns the run's name and Carte id."""
    full = _resolve(path, ".ktr")
    values = _check_params(full, params)
    xml = re.sub(r"^<\?xml[^>]*\?>\s*", "", full.read_text(encoding="utf-8"))
    ps = "".join(f"<parameter><name>{k}</name><value>{_xml(v)}</value></parameter>" for k, v in values.items())
    config = ("<transformation_configuration>\n" + xml + "<transformation_execution_configuration>"
              "<exec_remote>Y</exec_remote><log_level>Basic</log_level>"
              f"<parameters>{ps}</parameters></transformation_execution_configuration>\n"
              "</transformation_configuration>\n")
    carte_id = _carte("/kettle/registerTrans/", body=config.encode("utf-8")).findtext("id")
    name, _ = _declared(full)
    _carte("/kettle/startTrans/", {"name": name, "id": carte_id})
    out = _wait("transformation", name, carte_id, wait_seconds)
    return out | {"path": path, "params": values}


def run_job(path: str, params: dict[str, str] | None = None, wait_seconds: int = 0) -> dict:
    """Run a job (.kjb) from the allowed folder on Carte. path is relative, as list_files shows it;
    params sets the parameters the file declares. With wait_seconds above 0 (at most 120), waits for
    the job to end and returns its final status. Returns the run's name and Carte id."""
    full = _resolve(path, ".kjb")
    values = _check_params(full, params)
    carte_id = _carte("/kettle/executeJob/", {"job": str(full), "level": "Basic", **values}).findtext("id")
    name, _ = _declared(full)
    out = _wait("job", name, carte_id, wait_seconds)
    return out | {"path": path, "params": values}


def get_transformation_status(name: str, id: str) -> dict:
    """Get one transformation run's status (Running, Finished, Finished (with errors) or Stopped),
    its error count, whether it succeeded, and the rows each step read, wrote and rejected.
    Give the name and Carte id that run_transformation or get_status returned."""
    el = _status("transformation", name, id)
    out = _run_summary(el, "transformation")
    out["steps"] = [{"step": s.findtext("stepname"), "written": _num(s, "linesWritten"),
                     "read": _num(s, "linesRead"), "rejected": _num(s, "linesRejected"),
                     "errors": _num(s, "errors"), "status": s.findtext("statusDescription")}
                    for s in el.iter("stepstatus")]
    return out


def get_job_status(name: str, id: str) -> dict:
    """Get one job run's status (Running, Finished, Finished (with errors) or Stopped), its error count
    and whether it succeeded. Give the name and Carte id that run_job or get_status returned."""
    el = _status("job", name, id)
    out = _run_summary(el, "job")
    out["result"] = (el.findtext("result/result") or "") == "Y"
    return out


READ_TOOLS += [get_transformation_status, get_job_status]
RUN_TOOLS += [run_transformation, run_job]


# ================================================================== M3: logs, errors and stopping

def get_log(name: str, id: str, kind: Literal["transformation", "job"] = "transformation",
            tail_lines: int = 40) -> dict:
    """Get the log of one run: its last tail_lines lines (at most 200) and every line that contains
    ERROR, which says why a run failed. kind is transformation or job."""
    el = _status(kind, name, id)
    raw = (el.findtext("logging_string") or "").strip()
    raw = raw.removeprefix("<![CDATA[").removesuffix("]]>").strip()
    text = gzip.decompress(base64.b64decode(raw)).decode("utf-8", "replace") if raw else ""
    lines = [ln for ln in text.splitlines() if ln.strip()]
    tail = max(1, min(tail_lines, 200))
    return {"kind": kind, "name": name, "id": id, "status": el.findtext("status_desc") or "",
            "line_count": len(lines), "error_lines": [ln for ln in lines if " ERROR " in ln or "ERROR (" in ln][:20],
            "tail": lines[-tail:]}


def stop_transformation(name: str, id: str) -> dict:
    """Stop a running transformation. Give the name and Carte id that run_transformation returned."""
    _carte("/kettle/stopTrans/", {"name": name, "id": id})
    return _wait("transformation", name, id, 10)  # Halting first, then Stopped


def stop_job(name: str, id: str) -> dict:
    """Stop a running job. Give the name and Carte id that run_job returned."""
    _carte("/kettle/stopJob/", {"name": name, "id": id})
    return _wait("job", name, id, 10)


READ_TOOLS += [get_log]
RUN_TOOLS += [stop_transformation, stop_job]


# ================================================================== M4: the audit log

def _audit(tool: str, arguments: dict, outcome: str, detail: str = "") -> None:
    rec = {"time": datetime.now(timezone.utc).isoformat(timespec="seconds"), "tool": tool,
           "arguments": arguments, "outcome": outcome, "detail": detail[:300]}
    try:
        with AUDIT_LOG.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(rec) + "\n")
    except OSError:
        pass  # an unwritable audit log must not break the tool; the client still gets its answer


def audited(fn):
    """Records every call of a tool, with its arguments and whether it succeeded, in the audit log."""
    @functools.wraps(fn)
    def wrapper(*a, **kw):
        try:
            out = fn(*a, **kw)
        except Exception as e:
            _audit(fn.__name__, kw, "error", str(e))
            raise
        _audit(fn.__name__, kw, "ok", out.get("status", "") if isinstance(out, dict) else "")
        return out
    return wrapper


# ================================================================== register the tools (M4 version)
# In read-only mode the run and stop tools are never registered: a client cannot list them,
# so no model can call them, whatever it is asked.

for fn in READ_TOOLS + ([] if READ_ONLY else RUN_TOOLS):
    mcp.tool()(audited(fn))


if __name__ == "__main__":
    mcp.run(transport="streamable-http" if ARGS.http else "stdio")
