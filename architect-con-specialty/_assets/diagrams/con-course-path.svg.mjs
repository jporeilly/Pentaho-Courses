// Containers overview: one image, three ways to run it.
// Run: node con-course-path.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1014, 404);
const BW = 290, BH = 84, COL = [32, 362, 692];

const img = d.panel({ x: 16, y: 16, w: 652, h: 156, role: 'engine', iconName: 'package', title: 'The image' });
const z = d.box({ x: COL[0], y: 72, w: BW, h: BH, role: 'source', iconName: 'file-archive', title: 'Licensed archive', lines: ['pentaho-server-ee-11.0.0.0-237.zip'] });
const b = d.box({ x: COL[1], y: 72, w: BW, h: BH, role: 'engine', iconName: 'hammer', title: 'Build the Pentaho Image', lines: ['podman build: pentaho/pentaho-server'] });
d.arrow({ x1: z.r, y1: z.cy, x2: b.x - 3, y2: b.cy });

const host = d.panel({ x: 16, y: 232, w: 982, h: 156, role: 'join', iconName: 'server', title: 'Run it on one Ubuntu host' });
const run = [
  { iconName: 'container', title: 'Podman Compose', lines: ['PostgreSQL 15 and Vault', 'port 8090'] },
  { iconName: 'boxes', title: 'K3s, plain manifests', lines: ['podman save into containerd', 'deploy.sh, destroy.sh'] },
  { iconName: 'ship-wheel', title: 'K3s, Helm chart', lines: ['install, upgrade,', 'roll back, uninstall'] },
].map((o, i) => d.box({ x: COL[i], y: 288, w: BW, h: BH, role: 'join', ...o }));
d.arrow({ x1: run[0].r, y1: run[0].cy, x2: run[1].x - 3, y2: run[1].cy });
d.arrow({ x1: run[1].r, y1: run[1].cy, x2: run[2].x - 3, y2: run[2].cy });

d.arrow({ x1: b.cx, y1: img.b, x2: b.cx, y2: host.y - 3, vertical: true });

d.write(import.meta.url);
