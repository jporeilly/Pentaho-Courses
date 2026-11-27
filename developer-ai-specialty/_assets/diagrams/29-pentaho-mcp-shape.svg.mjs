// What the Pentaho MCP Server project builds: one Python MCP server in front
// of Carte, used by three MCP clients. Shown on the project page
// (29-project-pentaho-mcp).
//
// Facts it encodes (lesson 29 and its files):
//   - Three clients start the server over stdio: check_pentaho_mcp.py (the
//     mcp stdio client, calls every tool); Pentaho Data Integration, through
//     the connection pentaho-carte (MCP Client calls run_transformation and
//     get_status; AI Chat's Tools tab lets qwen2.5:7b choose); a desktop AI
//     assistant that supports MCP (command, args, env).
//   - The server pentaho_mcp_server.py (FastMCP, mcp<2) is built in four
//     milestones: M1 list_files, get_status and two resources; M2
//     run_transformation, run_job, their status tools, the allow-list and
//     declared parameters; M3 get_log, stop_transformation, stop_job; M4
//     read-only mode and the audit log (credentials come from env from M1).
//     Settings from environment variables only: CARTE_URL, CARTE_USER,
//     CARTE_PASSWORD, PDI_ALLOWED_DIR, PDI_MCP_READ_ONLY.
//   - It calls Carte's REST API with HTTP Basic: /kettle/status,
//     /kettle/registerTrans + /kettle/startTrans, /kettle/executeJob,
//     /kettle/transStatus, /kettle/jobStatus, /kettle/stopTrans. The lab's
//     Carte runs on 127.0.0.1:8081 (8080 is the Pentaho Server).
//   - Only files in the allowed folder, samples\, can run.
//
// Run from this folder:   node 29-pentaho-mcp-shape.svg.mjs
// It writes 29-pentaho-mcp-shape.svg here and ../images/29-pentaho-mcp-shape.png.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 560);
const CW = 248, CH = 80, CY = 16;

// Top: the three MCP clients.
const c1 = d.box({ x: 16, y: CY, w: CW, h: CH, role: 'check', iconName: 'list-checks', title: 'check_pentaho_mcp.py', lines: ['the mcp stdio client', 'calls every tool'] });
const c2 = d.box({ x: 276, y: CY, w: CW, h: CH, role: 'source', iconName: 'workflow', title: 'Pentaho Data Integration', lines: ['MCP Client: run, then status', 'AI Chat Tools tab: qwen2.5:7b'] });
const c3 = d.box({ x: 536, y: CY, w: CW, h: CH, role: 'source', iconName: 'laptop', title: 'Desktop AI assistant', lines: ['any that supports MCP', 'command, args, env'] });

// Middle: the server, its four milestones.
const PY = 152, PH = 196;
d.panel({ x: 16, y: PY, w: W - 32, h: PH, role: 'support', title: 'pentaho_mcp_server.py (FastMCP, mcp<2)', sub: 'settings from environment variables only' });
const MW = 176, MY = PY + 56, MH = 92;
const ms = [
  ['plug-zap', 'M1 Read', ['list_files, get_status', 'carte://status', 'pdi://files']],
  ['play', 'M2 Run', ['run_transformation', 'run_job, status tools', 'allow-list, parameters']],
  ['scroll-text', 'M3 Logs', ['get_log', 'stop_transformation', 'stop_job']],
  ['shield', 'M4 Safety', ['read-only mode', 'audit_log.jsonl', 'credentials from env']],
].map(([ic, t, l], i) => d.box({ x: 32 + i * (MW + 12), y: MY, w: MW, h: MH, role: i === 3 ? 'check' : 'engine', iconName: ic, title: t, lines: l }));
d.raw(`<text x="${W / 2}" y="${PY + PH - 14}" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="12" fill="#475569">CARTE_URL, CARTE_USER, CARTE_PASSWORD, PDI_ALLOWED_DIR, PDI_MCP_READ_ONLY</text>`);

for (const c of [c1, c2, c3]) d.arrow({ x1: c.cx, y1: c.b, x2: c.cx, y2: PY - 3, straight: true });
d.pill(c2.cx, (c2.b + PY) / 2, 'tools/call over stdio');

// Carte, then the allowed folder.
const carte = d.bar({ x: 16, y: 392, w: W - 32, h: 64, role: 'server', iconName: 'server-cog', title: 'Carte on 127.0.0.1:8081 (HTTP Basic, from the environment)', line: '/kettle/status, registerTrans + startTrans, executeJob, transStatus, jobStatus, stopTrans' });
d.arrow({ x1: W / 2, y1: PY + PH, x2: W / 2, y2: carte.y - 3, straight: true, label: 'Carte REST API', lx: W / 2, ly: (PY + PH + carte.y) / 2 });
const folder = d.bar({ x: 16, y: 488, w: W - 32, h: 56, role: 'store', iconName: 'folder-open', title: 'samples\\ (PDI_ALLOWED_DIR): the only files that can run', line: 'hello_carte.ktr, heartbeat.ktr, daily_sales.kjb, broken_feed.kjb and their transformations' });
d.arrow({ x1: W / 2, y1: carte.b, x2: W / 2, y2: folder.y - 3, straight: true });

d.write(import.meta.url);
