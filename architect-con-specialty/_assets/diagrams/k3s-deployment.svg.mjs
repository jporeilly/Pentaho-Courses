// Overview of K3s Deployment: how the Podman-built image reaches K3s, the
// K3s components the deployment uses, and the objects deploy.sh applies
// in the pentaho namespace, numbered in the order it applies them.
//
// Facts it draws, and where each comes from:
//   - K3s runs containers with containerd, its own image store apart from
//     Podman's. deploy.sh copies the image across with podman save piped
//     into sudo k3s ctr images import; containerd keeps the name
//     localhost/pentaho/pentaho-server:11.0.0.0-237, and the Deployment
//     asks for exactly it with imagePullPolicy: IfNotPresent
//     (07-k3s-overview, "The image"; 08-k3s-deploy, part 2).
//   - local-path is the default storage class: a volume claim becomes a
//     folder on the node. Traefik is the ingress controller, on ports 80
//     and 443 of the node (07-k3s-overview, the component table).
//   - deploy.sh applies the manifests in order: 1 the pentaho namespace,
//     2 the Secret postgres-secrets (you create it), 3 two ConfigMaps
//     (the server's settings, pentaho-config, and the five repository
//     scripts, postgres-init-scripts), 4 the volume claims, 5 PostgreSQL
//     (a Deployment and a Service named postgres), 6 the Pentaho Server
//     (a Deployment with an init container and startup, readiness and
//     liveness probes), 7 the ingress (07-k3s-overview, "The manifests";
//     object names from 08-k3s-deploy and its manifests/ folder).
//   - Both Deployments read the key postgres-password of postgres-secrets
//     (08-k3s-deploy, part 1, step 6).
//   - The claims: postgres-data-pvc Bound at 10Gi; pentaho-data-pvc and
//     pentaho-solutions-pvc Pending, because nothing mounts them
//     (08-k3s-deploy, part 3).
//   - The init container wait-for-postgres loops on nc -z postgres 5432;
//     the probes ask /pentaho/Login (08-k3s-deploy, part 2).
//   - The pentaho-server Service is a ClusterIP on 8080; the ingress
//     pentaho-ingress sends any request for /pentaho to it; a browser or
//     curl reaches it on the node's address (08-k3s-deploy, part 4).
//   - destroy.sh finally deletes the namespace with everything left in
//     it, the repository included (07-k3s-overview; 08-k3s-deploy, part 4).
//
// Run: node k3s-deployment.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas, box size, and three columns shared by every row, so the K3s
// components sit straight above the objects they serve.
const d = new Diagram(1056, 644);
const BW = 280, BH = 84;
const COL = [52, 380, 708];

// Top band, on the host but outside K3s: the script that drives the
// deployment, Podman's copy of the image, and a browser.
const ds = d.box({ x: COL[0], y: 16, w: BW, h: BH, role: 'tool', iconName: 'terminal', title: 'deploy.sh', lines: ['imports the image, then', 'applies 1 to 7 in order'] });
const pm = d.box({ x: COL[1], y: 16, w: BW, h: BH, role: 'tool', iconName: 'package', title: "Podman's image", lines: ['localhost/pentaho/', 'pentaho-server:11.0.0.0-237'] });
const br = d.box({ x: COL[2], y: 16, w: BW, h: BH, role: 'browser', iconName: 'app-window', title: 'Browser or curl', lines: ["the node's address,", 'port 80'] });

// The K3s panel, and its three components the deployment relies on.
d.panel({ x: 16, y: 140, w: 1024, h: 488, role: 'engine', iconName: 'boxes', title: 'K3s, one node' });
const lp = d.box({ x: COL[0], y: 196, w: BW, h: BH, role: 'support', iconName: 'folder-tree', title: 'local-path', lines: ['the default storage class:', 'a claim becomes a folder'] });
const cd = d.box({ x: COL[1], y: 196, w: BW, h: BH, role: 'engine', iconName: 'container', title: 'containerd', lines: ["K3s's own image store,", "apart from Podman's"] });
const tf = d.box({ x: COL[2], y: 196, w: BW, h: BH, role: 'support', iconName: 'network', title: 'Traefik', lines: ['the ingress controller,', 'ports 80 and 443'] });

// Into K3s: the image copy (labeled with the exact pipe deploy.sh runs)
// and the browser's request. Both pills sit in the gap above the panel.
d.arrow({ x1: pm.cx, y1: pm.b, x2: cd.cx, y2: cd.y - 3, vertical: true, label: ['podman save | sudo k3s ctr images import'], ly: 120 });
d.arrow({ x1: br.cx, y1: br.b, x2: tf.cx, y2: tf.y - 3, vertical: true, label: ['http://<node IP>/pentaho'], ly: 120 });

// The namespace, object 1: its sub-title says what destroy.sh does to it,
// kept short so the title strip's text ends before the claim arrow, which
// comes down near the right edge of its column for the same reason.
const ny = 312;
d.panel({ x: 32, y: ny, w: 992, h: 300, role: 'join', iconName: 'layers', title: '1  Namespace pentaho', sub: 'destroy.sh deletes it all' });

// Row 1 of objects, under the component that serves each.
const pv = d.box({ x: COL[0], y: ny + 64, w: BW, h: BH, role: 'store', iconName: 'hard-drive', title: '4  Volume claims', lines: ['postgres-data-pvc: Bound, 10Gi;', 'pentaho-data-pvc, pentaho-', 'solutions-pvc: Pending'] });
const sv = d.box({ x: COL[1], y: ny + 64, w: BW, h: BH, role: 'server', iconName: 'server', title: '6  pentaho-server', lines: ['init container wait-for-postgres;', 'startup, readiness, liveness;', 'Service pentaho-server, 8080'] });
const ig = d.box({ x: COL[2], y: ny + 64, w: BW, h: BH, role: 'check', iconName: 'route', title: '7  Ingress', lines: ['pentaho-ingress: any request', 'for /pentaho goes to the', 'Service pentaho-server'] });

// Row 2: the server's database, between its two inputs.
const cm = d.box({ x: COL[0], y: ny + 200, w: BW, h: BH, role: 'support', iconName: 'file-cog', title: '3  ConfigMaps', lines: ["pentaho-config: server settings;", 'postgres-init-scripts:', 'the five repository scripts'] });
const pg = d.box({ x: COL[1], y: ny + 200, w: BW, h: BH, role: 'store', iconName: 'database', title: '5  PostgreSQL', lines: ['Deployment and Service', 'postgres, port 5432'] });
const se = d.box({ x: COL[2], y: ny + 200, w: BW, h: BH, role: 'support', iconName: 'file-lock', title: '2  Secret postgres-secrets', lines: ['key postgres-password, read', 'by both Deployments; you', 'create it yourself'] });

// Components to the objects they serve: storage, image, traffic.
d.arrow({ x1: lp.r - 40, y1: lp.b, x2: pv.r - 40, y2: pv.y - 3, vertical: true });
d.arrow({ x1: cd.cx, y1: cd.b, x2: sv.cx, y2: sv.y - 3, vertical: true, label: ['IfNotPresent'], ly: 296 });
d.arrow({ x1: tf.cx, y1: tf.b, x2: ig.cx, y2: ig.y - 3, vertical: true });
// The ingress hands requests to the server's Service, leftwards.
d.arrow({ x1: ig.x, y1: ig.cy, x2: sv.r + 3, y2: sv.cy });

// Into PostgreSQL: its claim (a curve through the row gap, clear of the
// ConfigMaps box), the init scripts, the password, and the server, whose
// init container waits for postgres:5432 before the server starts.
d.arrow({ x1: pv.cx + 60, y1: pv.b, x2: pg.x + 40, y2: pg.y - 3, vertical: true });
d.arrow({ x1: cm.r, y1: cm.cy, x2: pg.x - 3, y2: pg.cy });
d.arrow({ x1: se.x, y1: se.cy, x2: pg.r + 3, y2: pg.cy });
d.arrow({ x1: sv.cx + 40, y1: sv.b, x2: pg.cx + 40, y2: pg.y - 3, vertical: true, label: ['postgres:5432'], lx: sv.cx + 40 });

d.write(import.meta.url);
