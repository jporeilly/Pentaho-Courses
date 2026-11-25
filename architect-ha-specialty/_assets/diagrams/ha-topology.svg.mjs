// The course's reference topology: clients reach the virtual IP held by
// one of two HAProxy balancers, HAProxy sends each session to one of two
// Pentaho Server nodes, both nodes use the one PostgreSQL repository on
// db-01, and the Carte cluster stands beside them as a separate group.
// It is the figure in 01-ha-overview/guide.md, under "Server roles".
//
// Facts it encodes, and where each comes from:
//   - 01-ha-overview, "Server roles": lb-01 is HAProxy primary and
//     Keepalived MASTER (holds the VIP), lb-02 HAProxy secondary and
//     Keepalived BACKUP; pentaho-node-01 and pentaho-node-02 are the two
//     Pentaho Server nodes; db-01 is PostgreSQL 14 with the three
//     repository databases; carte-master, carte-slave-01 and
//     carte-slave-02 run Pentaho Data Integration execution.
//   - 01-ha-overview, intro: Tray.io drives event-based ETL through the
//     Carte REST API; "The rules that make it work": sticky sessions,
//     HAProxy pins each session to one node.
//   - 02-ha-deploy, part 1 "Plan the Cluster" (also 00-before-you-start,
//     "Where the workshops run"): the addresses 10.0.1.10, 10.0.1.11
//     (nodes), 10.0.1.20, 10.0.1.21 (balancers), VIP 10.0.1.100, db-01
//     10.0.1.30 with jackrabbit, quartz and hibernate; the ports
//     80/443 clients to VIP, 8080 balancers to nodes, 5432 nodes to
//     db-01, IP protocol 112 (VRRP) between lb-01 and lb-02, 8888 the
//     statistics page from the admin address.
//   - 02-ha-deploy, part 5: both balancers run the same HAProxy
//     configuration; keepalived.conf priorities 110 (lb-01) and 100
//     (lb-02); haproxy.cfg `cookie S1` / `cookie S2` per server.
//   - 03-carte-cluster, prerequisites and part 2: carte-master
//     10.0.1.40 on port 9001, carte-slave-01 10.0.1.41 and
//     carte-slave-02 10.0.1.42 on port 9002; the slaves register with
//     the master. 04-trayio-integration: Tray.io calls the master on
//     10.0.1.40:9001.
//   - 00-before-you-start, "How this course is organized": the Carte
//     cluster is a second, separate cluster, which is why it is its own
//     panel with no arrow to the Pentaho cluster.
//
// Colors: amber the clients (browsers), teal the VIP (the link between
// clients and whichever balancer holds it), slate the balancers
// (supporting service), violet the Pentaho nodes and Carte slaves
// (servers), amber the Carte master (it checks the slaves, as in the
// Installation course's carte-cluster diagram), green db-01 (store),
// blue Tray.io (a tool that calls in).
//
// Run from this folder:   node ha-topology.svg.mjs
// It writes ha-topology.svg here and ../images/ha-topology.png at twice
// the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. The Pentaho cluster takes the left 530px, top to
// bottom; the Carte cluster the right column.
const d = new Diagram(800, 690);
const BW = 210; // every box in the Pentaho cluster is this wide

// --- The Pentaho cluster, left column ---------------------------------

// Clients, at the top (amber: the browser), and the VIP under them.
const cl = d.box({ x: 146, y: 16, w: 240, h: 56, role: 'browser', iconName: 'globe', title: 'Clients', lines: ['http://10.0.1.100/pentaho'] });
const vip = d.box({ x: 161, y: 112, w: BW, h: 60, role: 'join', iconName: 'radio-tower', title: 'VIP 10.0.1.100', lines: ['held by one balancer'] });
// Clients reach only the VIP, on the HAProxy front end's ports.
d.arrow({ x1: cl.cx, y1: cl.b, x2: vip.cx, y2: vip.y - 3, vertical: true, label: '80, 443' });

// The balancer pair: a slate panel with lb-01 and lb-02 side by side.
const lbp = d.panel({ x: 16, y: 222, w: 500, h: 152, role: 'support', iconName: 'scale', title: 'Load balancers', sub: 'one HAProxy configuration on both; statistics page :8888, admin only' });
const lb1 = d.box({ x: 32, y: 278, w: BW, h: 72, role: 'support', iconName: 'scale', title: 'lb-01', lines: ['10.0.1.20', 'Keepalived MASTER, 110'] });
const lb2 = d.box({ x: 290, y: 278, w: BW, h: 72, role: 'support', iconName: 'scale', title: 'lb-02', lines: ['10.0.1.21', 'Keepalived BACKUP, 100'] });
// The VIP sits on lb-01 (solid) and moves to lb-02 only on failover (dashed).
// Both end on the panel's top edge above their balancer, so neither
// crosses the panel's title.
d.arrow({ x1: vip.cx - 40, y1: vip.b, x2: lb1.cx, y2: lbp.y - 3, vertical: true, label: 'on lb-01', ly: 200 });
d.arrow({ x1: vip.cx + 40, y1: vip.b, x2: lb2.cx, y2: lbp.y - 3, vertical: true, dashed: true, label: 'on failover', ly: 200 });
// VRRP between the two balancers: a straight line with a head at both
// ends (the kit's marker is orient="auto-start-reverse", so marker-start
// points backward), drawn on the arrow layer.
d.edges.push(`<path d="M${lb1.r + 3} ${lb1.cy}L${lb2.x - 3} ${lb2.cy}" fill="none" stroke="#64748b" stroke-width="1.7" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`);
d.pill((lb1.r + lb2.x) / 2, lb1.cy, ['VRRP', '112']);

// The two Pentaho Server nodes: a violet panel.
const np = d.panel({ x: 16, y: 430, w: 500, h: 132, role: 'server', iconName: 'server', title: 'Pentaho Server nodes', sub: 'no shared sessions: HAProxy pins each one' });
const n1 = d.box({ x: 32, y: 486, w: BW, h: 60, role: 'server', iconName: 'server', title: 'pentaho-node-01', lines: ['10.0.1.10'] });
const n2 = d.box({ x: 290, y: 486, w: BW, h: 60, role: 'server', iconName: 'server', title: 'pentaho-node-02', lines: ['10.0.1.11'] });
// HAProxy, on whichever balancer holds the VIP, sends each node its
// sessions on Tomcat's 8080; the pill names the haproxy.cfg cookie value.
// Both arrows start at the bottom of the balancer panel, since either
// balancer may be the one doing it.
d.arrow({ x1: lbp.cx - 20, y1: lbp.b, x2: n1.cx, y2: np.y - 3, vertical: true, label: ':8080, cookie S1', lx: 130, ly: 402 });
d.arrow({ x1: lbp.cx + 20, y1: lbp.b, x2: n2.cx, y2: np.y - 3, vertical: true, label: ':8080, cookie S2', lx: 402, ly: 402 });

// db-01, the one shared repository (green: a store).
const db = d.box({ x: 141, y: 608, w: 250, h: 72, role: 'store', iconName: 'database', title: 'db-01  10.0.1.30', lines: ['PostgreSQL 14:', 'jackrabbit, quartz, hibernate'] });
// Both nodes reach it on 5432.
d.arrow({ x1: n1.cx, y1: np.b, x2: db.cx - 50, y2: db.y - 3, vertical: true, label: '5432', ly: 586 });
d.arrow({ x1: n2.cx, y1: np.b, x2: db.cx + 50, y2: db.y - 3, vertical: true, label: '5432', ly: 586 });

// The statistics page (8888, admin only) is named in the balancer
// panel's subtitle rather than drawn as an arrow, since no other box
// takes part.

// --- The Carte cluster, right column ----------------------------------

// Tray.io (blue: a tool that calls in), above the Carte panel.
const tr = d.box({ x: 556, y: 16, w: 228, h: 56, role: 'tool', iconName: 'cloud', title: 'Tray.io', lines: ['the Carte REST API'] });

// A separate group: its own panel, with no arrow to the Pentaho cluster.
const cp = d.panel({ x: 556, y: 222, w: 228, h: 340, role: 'engine', iconName: 'cpu', title: 'Carte cluster', sub: 'separate, for PDI execution' });
const cm = d.box({ x: 572, y: 278, w: 180, h: 72, role: 'check', iconName: 'network', title: 'carte-master', lines: ['10.0.1.40:9001'] });
const s1 = d.box({ x: 572, y: 404, w: 180, h: 60, role: 'engine', iconName: 'cpu', title: 'carte-slave-01', lines: ['10.0.1.41:9002'] });
const s2 = d.box({ x: 572, y: 486, w: 180, h: 60, role: 'engine', iconName: 'cpu', title: 'carte-slave-02', lines: ['10.0.1.42:9002'] });
// Tray.io calls the master on 9001.
// It ends on the panel's top edge, right of the panel's title.
d.arrow({ x1: tr.cx + 40, y1: tr.b, x2: cm.r - 30, y2: cp.y - 3, vertical: true, label: '9001' });
// Each slave registers with the master on 9001. carte-slave-01's arrow
// goes straight up into the master's foot; carte-slave-02's runs up the
// 32px corridor between the boxes' right edge and the panel's, so it
// never crosses carte-slave-01, and enters the master from the right.
d.arrow({ x1: cm.cx - 20, y1: s1.y, x2: cm.cx - 20, y2: cm.b + 3, straight: true });
const cx = cm.r + 18; // the corridor's x
d.edges.push(`<path d="M${s2.r} ${s2.cy}H${cx - 6}Q${cx} ${s2.cy} ${cx} ${s2.cy - 6}V${cm.cy + 6}Q${cx} ${cm.cy} ${cx - 6} ${cm.cy}H${cm.r + 3}" fill="none" stroke="#64748b" stroke-width="1.7" marker-end="url(#arrow)"/>`);
// One label for both registrations, between the master and carte-slave-01.
d.pill(cm.cx + 24, (cm.b + s1.y) / 2, 'register, 9001');

d.write(import.meta.url);
