// The whole Certified Solution Architect learning path: five mandatory
// courses in a set order, DI Developer, then Installation, then the three
// Speciality courses, Containers, High Availability and Enterprise
// Security: Authentication, ending at the Certified Solution Architect
// certification and its proctored exam. Each step gives the course's
// level, its lessons, modules and time, where it runs and what it covers.
// It replaces the Mermaid path diagram on the Sandbox's "Solution
// Architect" landing page. No lesson in this course describes the path
// (00 Before You Start only says, at line 163, that the accreditation
// "counts towards becoming a Certified Solution Architect"), so it is not
// embedded in a lesson; it lives here because the certified course
// anchors the path.
//
// Facts it encodes, and where each comes from. "Page" is the Sandbox
// landing page "Solution Architect" as read for this diagram (line
// numbers in its markdown); PCM paths are under courses/.
//   - Order, and that all five are mandatory: page, "A mandatory path"
//     hint (37): "every Solution Architect takes the same five courses in
//     the same order"; "The learning path" stepper (74-128); the
//     architect-install-certified/course.json certification path (68-92)
//     lists the same order for the first four.
//   - Core against Speciality: page, warning hint and "At a glance"
//     (198): "DI Developer, Installation, then the Containers, High
//     Availability and Enterprise Security Speciality courses"; the
//     stepper marks only steps 3 to 5 "Speciality" (96, 106, 116).
//   - Where each course runs and the hand-offs: the page's Mermaid nodes
//     and edge labels (47-56): "a hosted lab", "your own Ubuntu host",
//     "the same host", "eight virtual machines"; "pipelines the platform
//     runs", "the server, as an image", "two servers behind a balancer",
//     and, for HA to Enterprise Security, "then secure sign-on" (the course
//     owner's wording, 2026-11-15: the Authentication course runs on its own
//     lab server, so the page's "the deployment, secured" was loose). Eight machines checked against
//     architect-ha-specialty/00-before-you-start/guide.md (58-61): two
//     nodes, two balancers, db-01, a Carte master and two slaves.
//   - 1 DI Developer: developer-di-practitioner/course.json (19) level
//     "Practitioner"; 53 lesson manifests, estimatedMinutes summing to
//     875 (~14h 35m); SUMMARY.md, six modules (3, 7, 24, 58, 91, 121);
//     page stepper (76, 78) says the same. What it covers: page (78).
//   - 2 Installation: architect-install-certified/course.json (18-21)
//     level "Certified"; 12 lesson manifests summing to 335 minutes (~5h
//     35m: 5+15+5+20+20+40+60+45+40+45+25+15); SUMMARY.md, four modules
//     (3, 7, 13, 22). The Installation page and this path page say
//     ~5h 10m: workshop times from the manifests, the three reading pages
//     estimated from their content (the course owner kept that, 2026-11-15),
//     so the diagram shows ~5h 10m too. What it covers:
//     page (88); service pack 11.0.0.3-312: page "Built against" (198)
//     and 09-installation-upgrade-and-patches/guide.md.
//   - 3 Containers: architect-con-specialty/course.json (18) level
//     "Specialty"; 10 manifests, 290 minutes (~4h 50m); SUMMARY.md, six
//     modules; page (96, 98) the same.
//   - 4 High Availability: architect-ha-specialty/course.json (18-21)
//     "Specialty"; 6 manifests, 245 minutes (~4h 5m); SUMMARY.md, two
//     modules; page (106, 108) the same.
//   - 5 Enterprise Security: Authentication, the PCM course
//     admin-auth-specialty, "Integrating Authentication Mechanisms"
//     (course.json 3-4, level "Specialty" 41-44): 17 manifests, 405
//     minutes (~6h 45m); SUMMARY.md, six modules (3, 8, 14, 21, 27, 34):
//     LDAP and Active Directory, OpenID Connect with Keycloak and with
//     Microsoft Entra ID, Kerberos and IWA, a capstone. Where it runs:
//     01-before-you-start/guide.md (5): an Ubuntu server with OpenLDAP, a
//     simulated Active Directory domain and Keycloak. The page's own
//     Enterprise Security counts (116) describe an older outline and are
//     not used.
//   - Certification: page, proctored-exam hint (63) and stepper (126,
//     128): all five mandatory courses plus a proctored exam, booked and
//     sat through Kryterion's Webassessor, online from your own computer
//     or at a Kryterion-authorised test centre.
//   - Build: page "Built against" (198): Pentaho EE 11.0.0.0-237; only
//     Installation goes further, applying service pack 3 (11.0.0.3-312).
//
// Colors by role: slate the two groups (core, Speciality) and the build
// note, blue DI Developer (Spoon, a tool you use), violet the courses
// that install and run the server (Installation, Containers, High
// Availability, Enterprise Security), amber the certification (a check).
// Icons: workflow Spoon, server the Pentaho Server, container containers,
// scale a balancer, log-in an authentication mechanism (as in the
// admin-auth-specialty README), award the certification, tag the build.
//
// Run from this folder:   node sa-learning-path.svg.mjs
// It writes sa-learning-path.svg here and ../images/sa-learning-path.png
// at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// ── Layout ────────────────────────────────────────────────────────────
// One column read top to bottom, like the page's stepper: a panel for the
// two core courses, a panel for the three Speciality courses, then the
// certification and a bar with the build. Every step is the same size
// box, full panel width; a straight arrow at the center joins each step
// to the next, with the page's hand-off label in a pill in the gap.
const W = 800, M = 16;
const PX = M, PW = W - 2 * M;          // panels: 768 wide
const BX = 32, BW = W - 2 * BX;        // boxes: 736 wide, 16 in from the panel
const BH = 84;                         // title and three lines
const STRIP = 44;                      // panel strip with a sub-title
const GAP = 48;                        // between two boxes: an arrow, its pill and its head
const PGAP = 60;                       // between the two panels
const PAD = 16;                        // panel padding under the strip and at the foot

const A_Y = M;
const rowsA = [A_Y + STRIP + PAD, A_Y + STRIP + PAD + BH + GAP];
const A_H = rowsA[1] + BH + PAD - A_Y;
const B_Y = A_Y + A_H + PGAP;
const rowsB = [0, 1, 2].map((i) => B_Y + STRIP + PAD + i * (BH + GAP));
const B_H = rowsB[2] + BH + PAD - B_Y;
const CERT_Y = B_Y + B_H + 40;
const BAR_Y = CERT_Y + BH + 24, BAR_H = 56;
const d = new Diagram(W, BAR_Y + BAR_H + M);

/** A chip at a box's top right: its level or kind, in the box's colors. */
function chip(box, role, label) {
  const c = ROLE[role];
  const w = label.length * 6.6 + 20;
  const x = box.r - 12 - w, y = box.y + 11;
  d.raw(`<rect x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="#ffffff" stroke="${c.stroke}" stroke-width="1"/>`);
  d.raw(`<text x="${x + w / 2}" y="${y + 14}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${c.text}">${esc(label)}</text>`);
}

/** One course: a box with its number and name, three lines, and a chip. */
function step({ y, role, iconName, title, chipText, lines }) {
  const b = d.box({ x: BX, y, w: BW, h: BH, role, iconName, title, lines });
  chip(b, role, chipText);
  return b;
}

// ── Core courses ──────────────────────────────────────────────────────
d.panel({ x: PX, y: A_Y, w: PW, h: A_H, role: 'support', title: 'Core courses', sub: 'mandatory: every Solution Architect takes both, in this order' });
const di = step({ y: rowsA[0], role: 'tool', iconName: 'workflow', title: '1 · DI Developer', chipText: 'Practitioner',
  lines: ['53 lessons · 6 modules · ~14h 35m', 'Runs in a hosted lab', 'Build, run and operate PDI pipelines in Spoon, ending in a capstone project'] });
const inst = step({ y: rowsA[1], role: 'server', iconName: 'server', title: '2 · Installation', chipText: 'Certified',
  lines: ['12 lessons · 4 modules · ~5h 10m', 'Runs on your own Ubuntu host', 'Install Pentaho 11 from the archive, plugins, client tools; service pack 11.0.0.3-312'] });

// ── Speciality courses ────────────────────────────────────────────────
d.panel({ x: PX, y: B_Y, w: PW, h: B_H, role: 'support', title: 'Speciality courses', sub: 'also mandatory: all three, in this order, after the core courses' });
const con = step({ y: rowsB[0], role: 'server', iconName: 'container', title: '3 · Containers', chipText: 'Speciality',
  lines: ['10 lessons · 6 modules · ~4h 50m', 'Runs on the same host', 'The server as an image: build it, run it with Podman Compose, deploy to K3s and Helm'] });
const ha = step({ y: rowsB[1], role: 'server', iconName: 'scale', title: '4 · High Availability', chipText: 'Speciality',
  lines: ['6 lessons · 2 modules · ~4h 5m', 'Runs on eight virtual machines', 'Two nodes behind HAProxy and Keepalived, a shared repository, a Carte cluster'] });
const es = step({ y: rowsB[2], role: 'server', iconName: 'log-in', title: '5 · Enterprise Security: Authentication', chipText: 'Speciality',
  lines: ['17 lessons · 6 modules · ~6h 45m', 'Runs on an Ubuntu lab server with OpenLDAP, a simulated AD domain and Keycloak', 'LDAP and AD, OpenID Connect with Keycloak and Entra ID, Kerberos and IWA, a capstone'] });

// ── Certification and the build ───────────────────────────────────────
const cert = step({ y: CERT_Y, role: 'check', iconName: 'award', title: 'Certified Solution Architect', chipText: 'Certification · proctored exam',
  lines: ['All five mandatory courses plus a proctored exam', 'Booked and sat through Kryterion\'s Webassessor:', 'online from your own computer, or at a Kryterion-authorised test centre'] });
d.bar({ x: PX, y: BAR_Y, w: PW, h: BAR_H, role: 'support', iconName: 'tag', title: 'Built against Pentaho EE 11.0.0.0-237',
  line: 'Only Installation goes further: it applies service pack 3, taking the build to 11.0.0.3-312' });

// ── The flow ──────────────────────────────────────────────────────────
// Down the middle from each step to the next, the pill halfway through
// the gap. From Installation the arrow ends on the Speciality panel's top
// edge (the group as a whole follows the core courses), so it does not
// cross the panel's title strip; its pill sits in the gap between panels.
const X = W / 2;
const link = (a, b, label, ly) => d.arrow({ x1: X, y1: a.b, x2: X, y2: b.y - 3, straight: true, label, ly });
link(di, inst, 'pipelines the platform runs');
d.arrow({ x1: X, y1: inst.b, x2: X, y2: B_Y - 3, straight: true, label: 'the server, as an image', ly: A_Y + A_H + PGAP / 2 - 2 });
link(con, ha, 'two servers behind a balancer');
link(ha, es, 'then secure sign-on');
link(es, cert, []);

d.write(import.meta.url);
