// Overview of the Image Build: what goes into the pentaho-image build, the
// Containerfile's two stages, the image that comes out, and what
// docker-entrypoint.sh does each time a container starts from it.
//
// Facts it draws, and where each comes from:
//   - The three project folders: stagedArtifacts/ holds
//     pentaho-server-ee-<version>.zip and any plugin archive beside it;
//     softwareOverride/ holds the numbered passes (2_repository,
//     4_others); entrypoint/ holds docker-entrypoint.sh
//     (02-image-overview, "What goes in").
//   - stagedArtifacts/ goes into the first stage only: install_unpack
//     starts from docker.io/library/debian:trixie-slim, installs unzip and
//     unpacks the archive into /opt/pentaho (02-image-overview,
//     "Two stages"; 03-image-build, "Two stages" panel).
//   - pack starts again from a clean Debian, creates the user pentaho
//     (UID 5000), installs openjdk-21-jre-headless and curl, and copies
//     only /opt/pentaho across from install_unpack (02-image-overview).
//     It also copies entrypoint/ to / and softwareOverride/ to
//     /docker-entrypoint-init, and switches to USER pentaho
//     (03-image-build, "Two stages" panel; 02-image-overview, "Two builds
//     of one server": the K3s image has the passes baked in).
//   - The 1.1 GB archive and unzip never reach the image you ship
//     (02-image-overview; 03-image-build).
//   - The tag is pentaho/pentaho-server:11.0.0.0-237, and the server runs
//     as pentaho, not root (02-image-overview, "Two builds of one server"
//     and "Two stages").
//   - build.sh then runs two tests on the new image: Java answers, and the
//     server's files are in place (02-image-overview, "Configured from
//     .env"; 03-image-build, Test 1 and Test 2).
//   - At each container start, docker-entrypoint.sh copies each
//     softwareOverride pass from /docker-entrypoint-init over the server
//     in name order (a folder holding .ignore is skipped), runs an optional
//     extra-entrypoint.sh, installs a license when LICENSE_URL is set, and
//     hands over to ./start-pentaho.sh, with Tomcat in the foreground as
//     the container's main process. Without a license, signing in opens
//     the Licenses page (02-image-overview, "What a container does at
//     start"; 03-image-build, part 3).
//
// Run: node image-two-stage-build.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas, the box height, and the three rows the build part uses.
const d = new Diagram(1056, 636);
const BH = 84;
const ROW = [80, 204, 328];

// Column 1: the project's three folders, the build's inputs.
d.panel({ x: 16, y: 16, w: 268, h: 412, role: 'source', iconName: 'folder', title: 'pentaho-image project' });
const sa = d.box({ x: 32, y: ROW[0], w: 236, h: BH, role: 'source', iconName: 'file-archive', title: 'stagedArtifacts/', lines: ['pentaho-server-ee-<version>', '.zip, and plugin archives'] });
const so = d.box({ x: 32, y: ROW[1], w: 236, h: BH, role: 'source', iconName: 'folder-cog', title: 'softwareOverride/', lines: ['2_repository, 4_others;', 'into /docker-entrypoint-init'] });
const ep = d.box({ x: 32, y: ROW[2], w: 236, h: BH, role: 'source', iconName: 'file-code', title: 'entrypoint/', lines: ['docker-entrypoint.sh;', 'into /'] });

// Column 2: the Containerfile's two stages, one above the other.
d.panel({ x: 324, y: 16, w: 332, h: 412, role: 'engine', iconName: 'hammer', title: 'Containerfile: two stages' });
const iu = d.box({ x: 340, y: ROW[0], w: 300, h: BH, role: 'engine', iconName: 'package-open', title: 'install_unpack', lines: ['debian:trixie-slim, with unzip;', 'unpacks into /opt/pentaho'] });
const pk = d.box({ x: 340, y: ROW[1], w: 300, h: BH, role: 'engine', iconName: 'layers', title: 'pack', lines: ['a clean debian:trixie-slim;', 'user pentaho, UID 5000;', 'openjdk-21-jre-headless, curl'] });
// Under pack, the two tests build.sh runs on the new image.
const ts = d.box({ x: 340, y: ROW[2], w: 300, h: BH, role: 'check', iconName: 'circle-check', title: 'build.sh tests the image', lines: ['Java answers;', "the server's files are in place"] });

// Inputs into the stages: the archive into the first stage only, the
// other two folders into pack. The entrypoint arrow climbs in the gap
// between the columns, clear of the test box.
d.arrow({ x1: sa.r, y1: sa.cy, x2: iu.x - 3, y2: iu.cy });
d.arrow({ x1: so.r, y1: so.cy, x2: pk.x - 3, y2: pk.cy - 10 });
d.arrow({ x1: ep.r, y1: ep.cy, x2: pk.x - 3, y2: pk.cy + 18 });
// Only /opt/pentaho crosses from the first stage to the second.
d.arrow({ x1: iu.cx, y1: iu.b, x2: pk.cx, y2: pk.y - 3, vertical: true, label: ['COPY --from: only /opt/pentaho'] });

// Column 3: what stays behind in the first stage, and the image itself.
const lb = d.box({ x: 704, y: ROW[0], w: 320, h: BH, role: 'off', iconName: 'trash-2', title: 'Left behind', lines: ['the 1.1 GB archive and unzip', 'never reach the image you ship'] });
const im = d.box({ x: 704, y: ROW[1], w: 320, h: BH, role: 'result', iconName: 'package', title: 'The image', lines: ['pentaho/pentaho-server:11.0.0.0-237', 'runs as pentaho, not root'] });
d.arrow({ x1: iu.r, y1: iu.cy, x2: lb.x - 3, y2: lb.cy, dashed: true });
d.arrow({ x1: pk.r, y1: pk.cy, x2: im.x - 3, y2: im.cy });
// The tests run on the image that came out of pack.
d.arrow({ x1: im.x + 40, y1: im.b, x2: ts.r + 3, y2: ts.cy, vertical: false });

// Each container started from the image runs docker-entrypoint.sh, which
// does four things, left to right.
const sy = 460;
d.panel({ x: 16, y: sy, w: 1024, h: 160, role: 'join', iconName: 'container', title: 'Each time a container starts: /docker-entrypoint.sh', sub: 'then Tomcat is the main process: if it ran in the background, the container would stop' });
d.arrow({ x1: im.cx + 60, y1: im.b, x2: im.cx + 60, y2: sy - 3, vertical: true, label: ['a container starts'] });
const SW = 224, SX = [32, 288, 544, 800];
const steps = [
  { iconName: 'folder-input', title: 'Copy the passes', lines: ['over the server, in name', 'order; a folder holding', '.ignore is skipped'] },
  { iconName: 'terminal', title: 'extra-entrypoint.sh', lines: ['runs it, if there is one'] },
  { iconName: 'badge-check', title: 'License', lines: ['installed if LICENSE_URL', 'is set; if not, sign-in', 'opens the Licenses page'] },
  { iconName: 'play', title: './start-pentaho.sh', lines: ['the command: Tomcat', 'in the foreground'] },
].map((o, i) => d.box({ x: SX[i], y: sy + 60, w: SW, h: BH, role: 'join', ...o }));
// One arrow between each step and the next.
steps.slice(1).forEach((s, i) => d.arrow({ x1: steps[i].r, y1: steps[i].cy, x2: s.x - 3, y2: s.cy }));

d.write(import.meta.url);
