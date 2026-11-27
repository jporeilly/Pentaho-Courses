"""Check the Pentaho MCP server against a running Carte, outside Pentaho Data Integration.

Does what an MCP client does: starts the server as a child process (stdio transport), initializes
the session, lists its tools and resources, and calls every tool the server has so far: reads Carte's
status, runs a transformation and two jobs (one fails on purpose), reads a log, stops a run, and asks
the server to run files it must refuse. Then it starts the server again in read-only mode and lists
the tools that are left. A tool the server does not have yet is reported as "not built yet".

    python check_pentaho_mcp.py                                         checks .\\pentaho_mcp_server.py
    python check_pentaho_mcp.py ..\\solution\\pentaho_mcp_server.py       checks another copy

The server gets ONLY the environment this script passes it (the MCP SDK does not hand a child
process your whole environment), so Carte's address and credentials are read here and passed on:
CARTE_URL (default http://127.0.0.1:8081), CARTE_USER and CARTE_PASSWORD (default cluster / cluster,
Carte's defaults) and PDI_ALLOWED_DIR (default: the samples folder of the lab folder).
"""
import asyncio
import json
import os
import sys
import time
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import get_default_environment, stdio_client

HERE = Path(__file__).resolve().parent
SERVER = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else HERE / "pentaho_mcp_server.py"
ENV = get_default_environment() | {
    "CARTE_URL": os.environ.get("CARTE_URL", "http://127.0.0.1:8081"),
    "CARTE_USER": os.environ.get("CARTE_USER", "cluster"),
    "CARTE_PASSWORD": os.environ.get("CARTE_PASSWORD", "cluster"),
    "PDI_ALLOWED_DIR": os.environ.get("PDI_ALLOWED_DIR") or str(HERE.parent / "samples"),
    "PDI_MCP_AUDIT_LOG": str(SERVER.parent / "audit_log.jsonl"),
}


class Checker:
    def __init__(self, session, tools):
        self.s, self.tools = session, tools

    async def call(self, tool, args=None):
        """Calls a tool; returns (ok, parsed JSON or the error text), or (None, None) if it is not built yet."""
        if tool not in self.tools:
            print(f"{tool}: not built yet")
            return None, None
        r = await self.s.call_tool(tool, args or {})
        text = r.content[0].text if r.content else ""
        return (False, text) if r.isError else (True, json.loads(text))


def show(label, ok, out, keys=None):
    if ok is None:
        return
    if not ok:
        print(f"{label}: REFUSED: {out.removeprefix('Error executing tool ').split(': ', 1)[-1]}")
    elif keys:
        print(f"{label}: " + ", ".join(f"{k}={out.get(k)}" for k in keys))


async def main() -> None:
    params = StdioServerParameters(command=sys.executable, args=[str(SERVER)], env=ENV)
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            init = await session.initialize()
            print(f"Server: {init.serverInfo.name}, protocol {init.protocolVersion}, Carte {ENV['CARTE_URL']}")
            tools = [t.name for t in (await session.list_tools()).tools]
            print(f"{len(tools)} tools: " + ", ".join(tools))
            res = (await session.list_resources()).resources
            print(f"{len(res)} resources: " + ", ".join(str(r.uri) for r in res))
            c = Checker(session, tools)

            print("\n-- M1: read")
            ok, out = await c.call("list_files")
            if ok:
                print(f"list_files: {out['count']} files: " + ", ".join(f["path"] for f in out["files"]))
            ok, out = await c.call("get_status")
            show("get_status", ok, out, ["state", "transformation_count", "job_count"])

            print("\n-- M2: run and status")
            ok, run = await c.call("run_transformation", {"path": "hello_carte.ktr", "wait_seconds": 30,
                                                          "params": {"GREETING": "Hello from MCP"}})
            show("run_transformation hello_carte.ktr", ok, run, ["name", "status", "errors", "succeeded"])
            if ok:
                ok2, out = await c.call("get_transformation_status", {"name": run["name"], "id": run["id"]})
                if ok2:
                    print("get_transformation_status: " + ", ".join(f"{st['step']} wrote {st['written']}"
                                                                    for st in out["steps"]))
            ok, job = await c.call("run_job", {"path": "daily_sales.kjb", "wait_seconds": 30})
            show("run_job daily_sales.kjb", ok, job, ["name", "status", "errors", "succeeded"])
            if ok:
                ok2, out = await c.call("get_job_status", {"name": job["name"], "id": job["id"]})
                show("get_job_status daily_sales", ok2, out, ["status", "errors", "result"])
            ok, bad = await c.call("run_job", {"path": "broken_feed.kjb", "wait_seconds": 30})
            show("run_job broken_feed.kjb", ok, bad, ["name", "status", "errors", "succeeded"])

            print("\n-- M3: logs, errors and stopping")
            if run and isinstance(run, dict):
                ok, out = await c.call("get_log", {"name": run["name"], "id": run["id"], "tail_lines": 200})
                if ok:
                    said = next((ln.split(" - ")[-1] for ln in out["tail"] if "message =" in ln), "")
                    print(f"get_log hello_carte: {out['line_count']} lines, {said}")
            if bad and isinstance(bad, dict):
                ok, out = await c.call("get_log", {"name": bad["name"], "id": bad["id"], "kind": "job"})
                if ok:
                    print(f"get_log broken_feed: {len(out['error_lines'])} ERROR lines:")
                    for ln in out["error_lines"]:
                        print("  " + ln.split(" : ", 1)[-1][:110])
            # heartbeat.ktr runs until it is stopped, so start it only once the server can stop it
            ok, hb = await c.call("run_transformation" if "stop_transformation" in tools else "stop_transformation",
                                  {"path": "heartbeat.ktr"})
            show("run_transformation heartbeat.ktr", ok, hb, ["status", "finished"])
            if ok:
                time.sleep(3)
                ok2, out = await c.call("stop_transformation", {"name": hb["name"], "id": hb["id"]})
                show("stop_transformation heartbeat", ok2, out, ["status", "finished"])

            print("\n-- the allow-list")
            for args in ({"path": r"C:\Windows\Temp\cleanup.kjb"}, {"path": r"..\..\22-mcp-tools\job.kjb"},
                         {"path": "hello_carte.ktr"}, {"path": "daily_sales.kjb", "params": {"KETTLE_HOME": "C:\\"}}):
                ok, out = await c.call("run_job", args)
                show(f"run_job {json.dumps(args)}", ok, out)

            if res:
                r = await session.read_resource("carte://status")
                st = json.loads(r.contents[0].text)
                print(f"\ncarte://status: state {st['state']}, {st['transformation_count']} transformations, "
                      f"{st['job_count']} jobs")

    print("\n-- M4: read-only mode")
    params = StdioServerParameters(command=sys.executable, args=[str(SERVER)], env=ENV | {"PDI_MCP_READ_ONLY": "1"})
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = [t.name for t in (await session.list_tools()).tools]
            print(f"{len(tools)} tools: " + ", ".join(tools))

    log = SERVER.parent / "audit_log.jsonl"
    if log.exists():
        lines = log.read_text(encoding="utf-8").splitlines()
        print(f"\naudit_log.jsonl: {len(lines)} lines; the last: {lines[-1]}")
    else:
        print("\naudit_log.jsonl: none yet")


if __name__ == "__main__":
    asyncio.run(main())
