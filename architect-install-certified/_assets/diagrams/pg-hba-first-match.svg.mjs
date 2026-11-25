// How PostgreSQL picks a pg_hba.conf line: it reads the file from the
// top, takes the first line whose connection type, database, user and
// address all match, and that line's method decides how the client must
// authenticate. Underneath, the course's own pg_hba.conf after the
// change, with where `sudo -u postgres psql` and the Pentaho Server
// land. It is the figure after "PostgreSQL uses the first pg_hba.conf
// line that matches" in the "9. Configure pg_hba.conf" section of
// 05-installation-archive-prepare-environment/guide.md.
//
// Facts it encodes (all lesson 05, "9. Configure pg_hba.conf", unless
// noted):
//   - For every new connection PostgreSQL reads pg_hba.conf from the top
//     and takes the first line whose connection type (local for the
//     Unix socket, host for TCP), database, user and address match;
//     that line's method decides how the client must authenticate.
//   - peer trusts the Linux user name (Linux user postgres became
//     database user postgres with no password); scram-sha-256 and md5
//     ask for the database password; scram-sha-256 hashes more strongly,
//     so prefer it, and keep md5 only where a client's JDBC driver does
//     not support SCRAM.
//   - The seven lines after the change (the step 3 checkpoint), the
//     first three with new methods: the two local all lines changed from
//     peer to scram-sha-256 (the sed script matches them ending in
//     peer), and the first IPv4 host line changed to 0.0.0.0/0 md5 (the
//     sed script matches it as host all all 127.0.0.1/32 scram-sha-256).
//   - After the change, sudo -u postgres psql asks for the postgres
//     password (the warning after step 4).
//   - The Pentaho Server connects over TCP to localhost with its own
//     database users, so the host lines are the ones it meets.
//
// Icons: plug a new connection, list-checks the four checks, undo-2
// the loop to the next line, square-terminal psql, server the Pentaho
// Server, file-text pg_hba.conf (the method boxes carry no icon). This folder's
// README has the table.
//
// Run from this folder:   node pg-hba-first-match.svg.mjs
// It writes pg-hba-first-match.svg here and
// ../images/pg-hba-first-match.png at twice the size.
import { Diagram, ROLE, esc, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. Top: the rule, as a flow. Bottom: the file, and who
// lands on which line.
const W = 800;
const d = new Diagram(W, 600);

// ── Top left: a new connection ────────────────────────────────────────
// Blue (a source: what comes in).
const conn = d.box({ x: 16, y: 32, w: 216, h: 64, role: 'source', iconName: 'plug', title: 'A new connection', lines: ['its type, database,', 'user and address'] });

// ── Top right: the four checks, run on each line from the top ─────────
// Amber panel (a check) holding four white, title-only boxes joined by
// short arrows: all four must match. The sub-title says what the two
// connection types are.
const PX = 272, PW = W - 16 - PX;
const chk = d.panel({ x: PX, y: 16, w: PW, h: 124, role: 'check', iconName: 'list-checks', title: 'The next line, from the top', sub: 'all four must match; type local is the Unix socket, host is TCP' });
const CW = (PW - 24 - 3 * 20) / 4;
const checks = ['type', 'database', 'user', 'address'].map((t, i) =>
  d.box({ x: PX + 12 + i * (CW + 20), y: 74, w: CW, h: 48, role: 'result', title: t, center: true }));
checks.slice(1).forEach((b, i) => d.arrow({ x1: checks[i].r, y1: b.cy, x2: b.x - 3, y2: b.cy, straight: true }));
// The connection goes into the first line's checks.
d.arrow({ x1: conn.r, y1: conn.cy, x2: chk.x - 3, y2: checks[0].cy });

// ── Middle left: no match, try the next line ──────────────────────────
// Slate (a supporting step): the arrow leaves the panel's left side low
// down and drops into the box; the box says where the loop goes.
const MY = 196, MH = 64; // the middle row's top and the no box's height
const no = d.box({ x: 16, y: MY, w: 216, h: MH, role: 'support', iconName: 'undo-2', title: 'One does not match', lines: ['back up: the checks run', 'on the next line'] });
d.arrow({ x1: chk.x, y1: 128, x2: no.cx, y2: no.y - 3, elbow: true, label: 'no', lx: 196, ly: 128 });

// ── Middle right: all four match, the first such line wins ────────────
// One arrow from the panel to the methods, labeled; then the three
// methods a line can name: stone peer (no password is asked), green the
// two password methods.
// The boxes carry no icon, so their three-line text fits a third of
// the panel's width; their text is centered.
const MW3 = (PW - 2 * 12) / 3, MH3 = 84;
const peer = d.box({ x: PX, y: MY - 10, w: MW3, h: MH3, role: 'off', title: 'peer', lines: ['trusts the Linux', 'user name: no', 'password asked'], center: true });
const scram = d.box({ x: PX + MW3 + 12, y: MY - 10, w: MW3, h: MH3, role: 'store', title: 'scram-sha-256', lines: ['asks for the', 'password; the', 'stronger hash'], center: true });
const md5 = d.box({ x: PX + 2 * (MW3 + 12), y: MY - 10, w: MW3, h: MH3, role: 'store', title: 'md5', lines: ['asks for the password', 'where a JDBC driver', 'lacks SCRAM'], center: true });
d.arrow({ x1: scram.cx, y1: chk.b, x2: scram.cx, y2: scram.y - 3, straight: true, label: 'yes: the first match wins; its method decides', ly: chk.b + 20 });

// ── Bottom: the course's pg_hba.conf after the change ─────────────────
// A table box: amber rows are the three lines this lab changes, white
// the four it leaves alone.
const TY = 296, TW = 528;
const rows = [
  ['local', 'all', 'postgres', '', 'scram-sha-256', 'check'],
  ['local', 'all', 'all', '', 'scram-sha-256', 'check'],
  ['host', 'all', 'all', '0.0.0.0/0', 'md5', 'check'],
  ['host', 'all', 'all', '::1/128', 'scram-sha-256', 'result'],
  ['local', 'replication', 'all', '', 'peer', 'result'],
  ['host', 'replication', 'all', '127.0.0.1/32', 'scram-sha-256', 'result'],
  ['host', 'replication', 'all', '::1/128', 'scram-sha-256', 'result'],
].map((r) => ({ cells: r.slice(0, 5), tone: r[5] }));
const tb = d.tableBox({ x: 16, y: TY, w: TW, role: 'support', iconName: 'file-text', title: 'pg_hba.conf after the change', sub: 'amber: the three lines this lab changes', cols: ['type', 'database', 'user', 'address', 'method'], rows });
const rowY = (i) => TY + 56 + 24 + i * 24 + 12; // middle of table row i

// Who lands where: psql as postgres on line 1, the Pentaho Server on the
// host lines (lines 3 and 4).
const AX = TW + 16 + 44, AW = W - 16 - AX;
const ps = d.box({ x: AX, y: rowY(0) - 42, w: AW, h: 84, role: 'tool', iconName: 'square-terminal', title: 'psql as postgres', lines: ['sudo -u postgres psql:', 'socket, now asks for', 'the password'] });
const pe = d.box({ x: AX, y: rowY(2) + 8, w: AW, h: 84, role: 'server', iconName: 'server', title: 'Pentaho Server', lines: ['TCP to localhost with', 'its own users: the', 'host lines'] });
d.arrow({ x1: ps.x, y1: rowY(0), x2: tb.r + 3, y2: rowY(0), straight: true });
// Two arrows from the Pentaho Server box, one to each host all line.
d.arrow({ x1: pe.x, y1: pe.cy - 10, x2: tb.r + 3, y2: rowY(2) });
d.arrow({ x1: pe.x, y1: pe.cy + 10, x2: tb.r + 3, y2: rowY(3) });

d.h = TY + tableBoxHeight(rows.length) + 16;
d.write(import.meta.url);
