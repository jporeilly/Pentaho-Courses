// What the two Pentaho nodes share through db-01, and how: the
// Jackrabbit cluster journal and the clustered Quartz tables. Sessions
// are the one thing they do not share. It is the figure in
// 02-ha-deploy/guide.md, part 6 "Verify the Cluster", after test 6's
// "Quartz shares out triggers through row locks in the database".
//
// Facts it encodes, and where each comes from (all 02-ha-deploy unless
// named):
//   - Part 1: pentaho-node-01 10.0.1.10, pentaho-node-02 10.0.1.11,
//     db-01 10.0.1.30 with jackrabbit, quartz and hibernate; 5432/tcp
//     from the Pentaho nodes to db-01.
//   - Part 2, step 6 checkpoint: jackrabbit owned by jcr_user, quartz by
//     pentaho_user, hibernate by hibuser; both nodes share these
//     databases.
//   - Part 3, step 5 and part 4, step 2: <Cluster id="NODE_1"> on node 1,
//     <Cluster id="NODE_2"> on node 2; a DatabaseJournal through
//     jdbc/jackrabbit with schemaObjectPrefix cl_j_.
//   - Part 3, "Every write goes through the cluster journal": each change
//     is a journal record in the cl_j_ tables of jackrabbit, carrying the
//     ID of the node that wrote it; a node regularly reads the records it
//     hasn't seen yet and applies the ones another node wrote;
//     cl_j_global_revision holds the number of the newest record.
//   - Part 3, step 7: instanceId AUTO, isClustered true,
//     clusterCheckinInterval 20000, tablePrefix QRTZ6_.
//   - Part 6, test 6 and its "Under the hood": each clustered node writes
//     a check-in row to qrtz6_scheduler_state every 20 seconds; to fire
//     a trigger, a node first takes the row TRIGGER_ACCESS in
//     qrtz6_locks with SELECT ... FOR UPDATE, so each trigger fires on
//     one node. The checkpoint: 2 rows, instance_name starting with the
//     host name followed by digits, checkin_interval 20000.
//   - Part 6, test 2's "Under the hood" and 01-ha-overview: Pentaho
//     doesn't copy sessions between nodes; HAProxy pins each session to
//     one node.
//   "pentaho-node-01..." in the table stands for the host name followed by
//   digits; the lessons give no full value.
//
// Colors: violet the two nodes (servers), green db-01 and its tables
// (store), red the sessions (what is not shared). Icons: server a node,
// database db-01, folder-tree Jackrabbit, calendar-clock Quartz, lock the
// TRIGGER_ACCESS row lock, history the hibernate database, cookie a
// session.
//
// Run from this folder:   node ha-shared-state.svg.mjs
// It writes ha-shared-state.svg here and ../images/ha-shared-state.png at
// twice the size.
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. The nodes and the sessions box on top, db-01's panel
// under them with two table boxes, two detail boxes and a bar.
const TH = tableBoxHeight(2); // both table boxes have two rows
const d = new Diagram(800, 528);

// The two nodes, left and right (violet), each with its journal ID and
// Quartz instance ID.
const n1 = d.box({ x: 16, y: 16, w: 230, h: 76, role: 'server', iconName: 'server', title: 'pentaho-node-01', lines: ['Cluster id NODE_1', 'Quartz instanceId AUTO'] });
const n2 = d.box({ x: 554, y: 16, w: 230, h: 76, role: 'server', iconName: 'server', title: 'pentaho-node-02', lines: ['Cluster id NODE_2', 'Quartz instanceId AUTO'] });

// Between them, red: the sessions, which stay on their own node.
const ss = d.box({ x: 280, y: 16, w: 240, h: 76, role: 'reject', iconName: 'cookie', title: 'Sessions: not shared', lines: ['each stays on its node;', 'HAProxy pins it there'] });

// db-01: a green panel holding what both nodes share.
const db = d.panel({ x: 16, y: 140, w: 768, h: 372, role: 'store', iconName: 'database', title: 'db-01  10.0.1.30', sub: 'PostgreSQL, shared by both nodes' });

// Both nodes reach db-01 on 5432; the arrows end on the panel's top
// edge, clear of its title, since each node uses every database in it.
d.arrow({ x1: n1.cx, y1: n1.b, x2: n1.cx + 100, y2: db.y - 3, vertical: true, label: '5432' });
d.arrow({ x1: n2.cx, y1: n2.b, x2: n2.cx - 100, y2: db.y - 3, vertical: true, label: '5432' });

// Left: the Jackrabbit journal in jackrabbit, one record per change,
// each carrying the ID of the node that wrote it.
const jr = d.tableBox({ x: 32, y: 196, w: 360, role: 'store', iconName: 'folder-tree', title: 'jackrabbit: cluster journal', sub: 'cl_j_ tables, jcr_user', cols: ['a journal record', 'written by'], rows: [
  { tone: 'server', cells: ['a change on node 1', 'NODE_1'] },
  { tone: 'server', cells: ['a change on node 2', 'NODE_2'] },
] });
// Right: Quartz's check-in rows in quartz, one per node.
const qz = d.tableBox({ x: 408, y: 196, w: 360, role: 'store', iconName: 'calendar-clock', title: 'quartz: qrtz6_scheduler_state', sub: 'a check-in every 20 s, pentaho_user', cols: ['instance_name', 'checkin_interval'], rows: [
  { tone: 'server', cells: ['pentaho-node-01...', '20000'] },
  { tone: 'server', cells: ['pentaho-node-02...', '20000'] },
] });

// Under each table, how the nodes use it.
const BY = 196 + TH + 14;
d.box({ x: 32, y: BY, w: 360, h: 72, role: 'result', iconName: 'folder-tree', title: 'cl_j_global_revision', lines: ['the newest record; each node applies', 'the records the other one wrote'] });
d.box({ x: 408, y: BY, w: 360, h: 72, role: 'result', iconName: 'lock', title: 'qrtz6_locks: TRIGGER_ACCESS', lines: ['SELECT ... FOR UPDATE: one node at', 'a time, each trigger fires once'] });

// The third database, which both nodes share as it is.
d.bar({ x: 32, y: BY + 88, w: 736, h: 56, role: 'store', iconName: 'history', title: 'hibernate', line: 'hibuser: jdbc/Hibernate, jdbc/Audit and the mart and logging resources, one copy for both nodes' });

d.write(import.meta.url);
