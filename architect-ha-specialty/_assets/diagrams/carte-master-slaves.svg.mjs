// The Carte cluster of 03-carte-cluster: the master, the two slaves that
// register themselves with it, the check that lists them, and the
// clustering schema Spoon keeps. It is the figure in
// 03-carte-cluster/guide.md, part 2 "Configure and Start Carte", after
// "Each slave announces itself to the master".
//
// Facts it encodes, and where each comes from (all 03-carte-cluster):
//   - Prerequisites: carte-master 10.0.1.40, carte-slave-01 10.0.1.41,
//     carte-slave-02 10.0.1.42; ports 9001 and 9002 open between them.
//   - Part 2, steps 2-4: the master's file carte-master-config.xml names
//     CarteMaster on 10.0.1.40:9001 with <master>Y</master>; each
//     slave's carte-slave-config.xml lists CarteMaster under <masters>,
//     sets <report_to_masters>Y</report_to_masters>, and describes
//     itself: CarteSlaveOne 10.0.1.41:9002 and CarteSlaveTwo
//     10.0.1.42:9002, <master>N</master>, get_properties_from_master
//     CarteMaster. All three use the user `cluster`.
//   - Part 2, "Each slave announces itself to the master": a slave
//     contacts every master in its <masters> list when it starts and
//     registers its own <slaveserver> details; the master keeps that
//     list and checks the slaves it holds, every 30 seconds per the
//     guide's section 6; get_properties_from_master copies the master's
//     Kettle variables to the slave. A dynamic clustering schema needs
//     to know only the master: it "gets the list of slave servers from
//     the first master slave server it can contact".
//   - Part 2, step 7: curl ... http://10.0.1.40:9001/kettle/getSlaves/
//     lists CarteSlaveOne and CarteSlaveTwo.
//   - Part 3, steps 6-8: the schema HA_Carte_Cluster lists CarteMaster,
//     CarteSlaveOne and CarteSlaveTwo, with Dynamic cluster left
//     cleared, because this cluster's servers are fixed.
//   Note: the plan for this diagram had Spoon's schema "dynamic", knowing
//   only the master. The lesson's workshop leaves Dynamic cluster cleared
//   and lists all three servers, so the diagram draws that, and shows the
//   dynamic schema as the alternative (stone: not used here).
//
// Colors: amber the master (it checks the slaves) and the getSlaves
// check, violet the slaves (engines), blue Spoon (the tool you use),
// stone the dynamic schema (not used in this workshop). Icons as in the
// Installation course: network the master, cpu a slave, workflow Spoon.
//
// Run from this folder:   node carte-master-slaves.svg.mjs
// It writes carte-master-slaves.svg here and
// ../images/carte-master-slaves.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. Top row: Spoon, the master, the check. The stone
// box sits under Spoon; the two slaves sit side by side at the bottom.
const d = new Diagram(800, 460);

// The master, center top (amber, as in ha-topology).
const ma = d.box({ x: 285, y: 40, w: 230, h: 96, role: 'check', iconName: 'network', title: 'CarteMaster', lines: ['carte-master', '10.0.1.40:9001, master Y', 'keeps the slave list'] });

// Spoon, left (blue: the tool you use), with the workshop's fixed schema.
const sp = d.box({ x: 16, y: 40, w: 220, h: 96, role: 'tool', iconName: 'workflow', title: 'Spoon', lines: ['HA_Carte_Cluster:', 'all three servers,', 'Dynamic cluster cleared'] });

// The getSlaves check, right (amber: a check).
const ck = d.box({ x: 564, y: 40, w: 220, h: 96, role: 'check', iconName: 'square-terminal', title: 'getSlaves', lines: ['curl -u cluster:cluster', ':9001/kettle/getSlaves/', 'lists both slaves'] });

// The alternative not used here (stone): a dynamic schema. 196 wide,
// narrower than Spoon, so CarteSlaveOne's arrow passes below its corner.
const dy = d.box({ x: 16, y: 176, w: 196, h: 80, role: 'off', iconName: 'workflow', title: 'Dynamic cluster', lines: ['not used here: lists', 'only the master'] });

// Spoon's schema names the master (among all three); the check asks the
// master for its list. The dynamic schema would ask the master for its
// slaves (dashed: not used in this workshop); its arrow enters the
// master's left edge low, under Spoon's.
d.arrow({ x1: sp.r, y1: sp.cy, x2: ma.x - 3, y2: ma.cy - 16 });
d.arrow({ x1: ck.x, y1: ck.cy, x2: ma.r + 3, y2: ma.cy });
d.arrow({ x1: dy.r, y1: dy.cy, x2: ma.x - 3, y2: ma.b - 18, dashed: true });

// The two slaves, side by side (violet: engines).
const s1 = d.box({ x: 120, y: 330, w: 250, h: 110, role: 'engine', iconName: 'cpu', title: 'CarteSlaveOne', lines: ['carte-slave-01', '10.0.1.41:9002, master N', 'report_to_masters Y', 'variables from the master'] });
const s2 = d.box({ x: 430, y: 330, w: 250, h: 110, role: 'engine', iconName: 'cpu', title: 'CarteSlaveTwo', lines: ['carte-slave-02', '10.0.1.42:9002, master N', 'report_to_masters Y', 'variables from the master'] });

// Each slave registers itself at start (solid, up) and the master checks
// it (dashed, down). Straight lines, the solid one on the outer side of
// each pair, so no two arrows cross. The labels sit low on the solid
// lines, clear of the stone box, and one label serves both checks.
d.arrow({ x1: 170, y1: s1.y, x2: 300, y2: ma.b + 3, straight: true, label: ['1  registers', 'at start'], lx: 197, ly: 290 });
d.arrow({ x1: 370, y1: ma.b, x2: 300, y2: s1.y - 3, straight: true, dashed: true });
d.arrow({ x1: 630, y1: s2.y, x2: 500, y2: ma.b + 3, straight: true, label: ['1  registers', 'at start'], lx: 603, ly: 290 });
d.arrow({ x1: 430, y1: ma.b, x2: 500, y2: s2.y - 3, straight: true, dashed: true });
d.pill(400, 236, ['2  checks', 'each slave,', 'every 30 s']);

d.write(import.meta.url);
