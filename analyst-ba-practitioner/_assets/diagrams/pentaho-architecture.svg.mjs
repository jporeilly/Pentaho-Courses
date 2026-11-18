// The Pentaho architecture: the client design tools on the designer's
// PC, the Pentaho Server with its Data Integration Server and Analytics
// Server plugins, and the repository and data sources the server stands
// on, with each design-tool arrow labeled by the file that travels along
// it. It is the "Pentaho Architecture" figure near the top of
// 03-user-console/guide.md.
//
// This is a port of the course's earlier hand-written script (its own
// ROLE and ICON tables) to the shared kit, scripts/diagram-kit.mjs. The
// content is the same; only the parts and the colors now follow the kit.
// The earlier script left the PNG to be rendered by hand, and the guide
// and README had drifted to two different PNG names
// (1793631012928.png and getting_started_pentaho_architecture.png). The
// kit now writes ../images/pentaho-architecture.png, and the guide shows
// that file.
//
// Facts it encodes:
//   - Lesson 03 (03-user-console), "The Pentaho BA platform": the BA
//     platform is a server, design tools and plugins, in three groups:
//     Pentaho Server and User Console, web-based tools and plugins, and
//     client-based design tools. The Pentaho Server hosts the
//     centralized repository and provides scheduling; it is managed
//     through the User Console. The server's Data Integration Server
//     has the plugins Pipeline Designer, Carte, the Scheduler and the
//     Semantic Model Editor; the course works in the Analytics Server's.
//   - Lesson 03, "The tools you will use": Analyzer, Interactive Reports
//     and Dashboard Designer are web-based tools; Report Designer is a
//     desktop tool.
//   - Lesson 05: a metadata model is created with Pentaho Metadata
//     Editor; Report Designer report files have a .prpt extension.
//   - Lesson 09: a Mondrian schema is created with Schema Workbench.
//   - The files on each arrow (.ktr and .kjb, .mondrian.xml, .xmi,
//     .prpt), the plugins in each server panel, what the repository
//     holds and the dashed "connect straight to the data" path are
//     carried over unchanged from the earlier figure.
//
// Icons: shuffle Data Integration, box Schema Workbench, layers Metadata
// Editor, file-chart-column Report Designer, server the Pentaho Server,
// folder-tree the repository, database the data sources. This folder's
// README has the table.
//
// Run from this folder:   node pentaho-architecture.svg.mjs
// It writes pentaho-architecture.svg here and
// ../images/pentaho-architecture.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide, the reading column, so the figure shows at its own
// size. Two columns side by side (design tools, then the server), with a
// 120px channel between them for the file arrows, and the repository and
// data sources in a row underneath the server.
const W = 800;
const d = new Diagram(W, 660);

/** A small-caps section label inside the design-tools panel. */
function section(cx, y, text) {
  d.raw(`<text x="${cx}" y="${y}" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.5" fill="${ROLE.support.head}">${esc(text)}</text>`);
}

/** A one-line text note in a role's text color, centered on cx. */
function note(cx, y, text, role) {
  d.raw(`<text x="${cx}" y="${y}" text-anchor="middle" font-size="12" fill="${ROLE[role].text}">${esc(text)}</text>`);
}

// ── Column 1: the client design tools, on the designer's own PC ───────
// Slate panel (a group of supporting things); each tool is a blue box,
// since each is a tool you use. Data Integration sits apart from the
// three tools for analytics content, under its own section label.
const LX = 16, LW = 244, BX = LX + 12, BW = LW - 24, BH = 60;
const TOP = 16, FOOT = 436; // both top panels run from y 16 to y 436
d.panel({ x: LX, y: TOP, w: LW, h: FOOT - TOP, role: 'support', title: 'Client design tools', sub: 'installed on the designer’s PC' });
section(LX + LW / 2, 80, 'FOR DATA INTEGRATION');
const di = d.box({ x: BX, y: 90, w: BW, h: BH, role: 'tool', iconName: 'shuffle', title: 'Data Integration', lines: ['builds pipelines and jobs'] });
section(LX + LW / 2, 212, 'FOR ANALYTICS CONTENT');
const sw = d.box({ x: BX, y: 224, w: BW, h: BH, role: 'tool', iconName: 'box', title: 'Schema Workbench', lines: ['cube schemas'] });
const me = d.box({ x: BX, y: 292, w: BW, h: BH, role: 'tool', iconName: 'layers', title: 'Metadata Editor', lines: ['business models'] });
const rd = d.box({ x: BX, y: 360, w: BW, h: BH, role: 'tool', iconName: 'file-chart-column', title: 'Report Designer', lines: ['reports saved as .prpt'] });

// ── Column 2: the Pentaho Server ──────────────────────────────────────
// Violet (the server), holding two slate panels for its two groups of
// plugins. Each plugin is a white, title-only box, two to a row.
const SX = 380, SW = W - 16 - SX;
d.panel({ x: SX, y: TOP, w: SW, h: FOOT - TOP, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'the web server your users connect to' });
const IX = SX + 12, IW = SW - 24;
const IW2 = (IW - 36) / 2; // one plugin box: two per row, 12px gaps
const item = (col, y, title) => d.box({ x: IX + 12 + col * (IW2 + 12), y, w: IW2, h: 34, role: 'result', title, center: true });

// The Data Integration Server and its four plugins.
d.panel({ x: IX, y: 72, w: IW, h: 142, role: 'support', title: 'Data Integration Server', sub: 'plugins' });
item(0, 72 + 56, 'Pipeline Designer');
item(1, 72 + 56, 'Scheduler');
item(0, 72 + 98, 'Carte');
item(1, 72 + 98, 'Semantic Model Editor');

// The Analytics Server, its four plugins, and a note on where Report
// Designer reports end up.
const as = d.panel({ x: IX, y: 226, w: IW, h: 198, role: 'support', title: 'Analytics Server', sub: 'plugins' });
item(0, 226 + 56, 'Analyzer');
item(1, 226 + 56, 'Interactive Reports');
item(0, 226 + 98, 'Dashboard Designer');
item(1, 226 + 98, 'CTools');
note(as.cx, 226 + 162, 'Report Designer reports (.prpt) are published here', 'support');
note(as.cx, 226 + 179, 'and run from the User Console', 'support');

// ── Design tool to server: each arrow names the file that travels ─────
// Straight arrows across the 120px channel, from each tool's right edge
// into the server panel it publishes to; the file name sits in a pill
// on the line.
const ax2 = SX - 3;
d.arrow({ x1: di.r, y1: di.cy, x2: ax2, y2: di.cy, straight: true, label: '.ktr  .kjb' });
d.arrow({ x1: sw.r, y1: sw.cy, x2: ax2, y2: sw.cy, straight: true, label: '.mondrian.xml' });
d.arrow({ x1: me.r, y1: me.cy, x2: ax2, y2: me.cy, straight: true, label: '.xmi' });
d.arrow({ x1: rd.r, y1: rd.cy, x2: ax2, y2: rd.cy, straight: true, label: '.prpt' });

// ── Underneath: what the server stands on ─────────────────────────────
// Green the repository (a store), blue the data sources (a source). The
// row starts left of the server panel so each box has room for its
// lines; both boxes' centers still sit under the server.
const RY = 500, RH = 84, RW = 232;
const repo = d.box({ x: 300, y: RY, w: RW, h: RH, role: 'store', iconName: 'folder-tree', title: 'Repository', lines: ['reports, schemas,', 'dashboards, schedules,', 'users and roles'] });
const data = d.box({ x: W - 16 - RW, y: RY, w: RW, h: RH, role: 'source', iconName: 'database', title: 'Data sources', lines: ['databases, files,', 'cloud storage'] });

// Server to each: a straight arrow down from the server panel's foot,
// in line with the box's center, labeled in a two-line pill.
d.arrow({ x1: repo.cx, y1: FOOT, x2: repo.cx, y2: RY - 3, straight: true, label: ['saves and', 'loads content'] });
d.arrow({ x1: data.cx, y1: FOOT, x2: data.cx, y2: RY - 3, straight: true, label: ['runs pipelines', 'and queries data'] });

// ── The design tools also reach the data directly ─────────────────────
// A dashed path from the foot of the design-tools panel, under the
// repository, and up into the data sources box: drawn by hand because
// it turns twice, which the kit's arrow does not.
const py = RY + RH + 34;
d.edges.push(`<path d="M${LX + LW / 2} ${FOOT}V${py}H${data.cx}V${data.b + 3}" fill="none" stroke="#64748b" stroke-width="1.7" stroke-dasharray="5 4" marker-end="url(#arrow)"/>`);
d.pill((LX + LW / 2 + data.cx) / 2, py, 'the design tools also connect straight to the data while you build');

// Size the canvas to the dashed path's label.
d.h = py + 30;

d.write(import.meta.url);
