// Overview of Compose Deployment: the Pentaho-Server-PostgreSQL stack as
// `podman compose` runs it on one host, and what `down` and `down -v` do
// to it.
//
// Facts it draws, and where each comes from:
//   - Four services, with their images: vault and vault-init on
//     docker.io/hashicorp/vault:1.15, postgres on docker.io/library/
//     postgres:15, pentaho-server built from image/Containerfile
//     (04-compose-overview, the service table; compose.yaml).
//   - vault-init is a one-off job: it initializes and unseals Vault and
//     stores the passwords; it has no depends_on, its script waits for
//     Vault itself; it ends Exited (0), and Podman runs it again with
//     each start of the server (04-compose-overview, "What Podman does
//     differently"; 05-compose-postgresql, part 2).
//   - depends_on becomes --requires: pentaho-server requires postgres and
//     vault healthy and vault-init completed (04-compose-overview;
//     the depends_on conditions in compose.yaml).
//   - pentaho-server's 8080 is port 8090 of the host, so the browser opens
//     http://localhost:8090/pentaho (04-compose-overview, the service
//     table; 05-compose-postgresql, the .env table and part 3).
//   - The project folders mounted from the host: softwareOverride/ into
//     the server at start, read-only at /docker-entrypoint-init; the two
//     config folders, config/.kettle and config/.pentaho, with :U, which
//     hands them to pentaho; db_init_postgres read-only into postgres,
//     where its five scripts run once, on an empty volume
//     (04-compose-overview; 05-compose-postgresql, part 3; compose.yaml).
//     softwareOverride/ is mounted :ro, not :U: the :U is on the two
//     config mounts only.
//   - The four named volumes and what is in them: vault_data (Vault's data,
//     vault-keys.json and approle-creds.json; the server mounts it
//     read-only at /vault/data), pentaho_postgres_data (the repository),
//     pentaho_solutions and pentaho_data (the server's)
//     (05-compose-postgresql, part 2 and part 4; compose.yaml).
//   - `podman compose down` removes the containers and the network and
//     keeps the named volumes; `down -v` deletes the volumes too, and the
//     next start builds the repository from scratch (04-compose-overview,
//     "State that survives"; 05-compose-postgresql, part 4). The network
//     is pentaho-net (compose.yaml).
//
// Run: node compose-stack.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas, box size, and the three column x positions inside the
// containers panel. The fourth column, outside that panel, holds the two
// things on the host that are not containers.
const d = new Diagram(1056, 524);
const BW = 226, BH = 84;
const COL = [32, 290, 548];
const OUT = 814, OW = 226;
const ROW = [80, 224];

// The containers panel: everything in it is a container that
// `podman compose down` removes, together with the network.
d.panel({ x: 16, y: 16, w: 774, h: 308, role: 'support', iconName: 'container', title: 'Containers on the network pentaho-net', sub: 'podman compose down removes them, and the network' });

// Row 1: the two Vault services and PostgreSQL, the three the server requires.
const vi = d.box({ x: COL[0], y: ROW[0], w: BW, h: BH, role: 'support', iconName: 'key-round', title: 'vault-init', lines: ['one-off job, Exited (0);', 'its script waits for Vault,', 'then inits or unseals it'] });
const va = d.box({ x: COL[1], y: ROW[0], w: BW, h: BH, role: 'support', iconName: 'vault', title: 'vault', lines: ['hashicorp/vault:1.15', 'holds the repository', 'passwords'] });
const pg = d.box({ x: COL[2], y: ROW[0], w: BW, h: BH, role: 'store', iconName: 'database', title: 'postgres', lines: ['postgres:15, the repository:', 'jackrabbit, quartz,', 'hibernate'] });

// Row 2: the server, under PostgreSQL, so its host-side neighbors sit
// right beside it in the outer column.
const ps = d.box({ x: COL[2], y: ROW[1], w: BW, h: BH, role: 'server', iconName: 'server', title: 'pentaho-server', lines: ['image/Containerfile;', 'reads Vault passwords,', 'then starts Tomcat'] });

// vault-init has no depends_on: a dashed arrow, because it is its script
// that waits for Vault, not Podman.
d.arrow({ x1: vi.r, y1: vi.cy, x2: va.x - 3, y2: va.cy, dashed: true });

// depends_on becomes --requires: the server's three requirements. Straight
// up to postgres; two elbows out of the server's left side, the upper one
// turning up into vault, the lower one running on under it into vault-init,
// so they never cross.
d.arrow({ x1: ps.cx, y1: ps.y, x2: pg.cx, y2: pg.b + 3, vertical: true, label: ['--requires', 'healthy'] });
d.arrow({ x1: ps.x, y1: ps.cy - 14, x2: va.cx, y2: va.b + 3, elbow: true, label: ['--requires', 'healthy'], lx: 480, ly: ps.cy - 14 });
d.arrow({ x1: ps.x, y1: ps.cy + 22, x2: vi.cx, y2: vi.b + 3, elbow: true, label: ['--requires', 'exited 0'], lx: 268, ly: ps.cy + 22 });

// Outside the panel, on the host: the project's folders that the
// services mount, beside PostgreSQL and the server ...
const hf = d.box({ x: OUT, y: ROW[0], w: OW, h: BH, role: 'source', iconName: 'folder', title: 'Project folders', lines: ['db_init_postgres :ro', 'softwareOverride/ :ro', 'config/.kettle, .pentaho :U'] });
// ... and the browser, on host port 8090.
const br = d.box({ x: OUT, y: ROW[1], w: OW, h: BH, role: 'browser', iconName: 'app-window', title: 'Browser', lines: ['localhost:8090/pentaho:', 'host 8090 is the', "server's 8080"] });

// db_init_postgres goes into postgres; the other two into the server.
d.arrow({ x1: hf.x, y1: hf.cy, x2: pg.r + 3, y2: pg.cy });
d.arrow({ x1: hf.x + 40, y1: hf.b, x2: ps.r + 3, y2: ps.y + 18 });
// Host port 8090 is the server's 8080. The gap is too narrow for a pill,
// so the browser box says it.
d.arrow({ x1: br.x, y1: br.cy + 16, x2: ps.r + 3, y2: ps.cy + 16 });

// The named volumes: kept by `down`, deleted by `down -v`.
const vy = 348;
d.panel({ x: 16, y: vy, w: 1024, h: 160, role: 'store', iconName: 'hard-drive', title: 'Named volumes', sub: 'podman compose down keeps them; down -v deletes them, and the repository starts from scratch' });
const VW = 236, VX = [32, 284, 536, 788];
[
  { title: 'vault_data', lines: ["Vault's data, its keys and", 'the AppRole; read-only', 'in the server'] },
  { title: 'pentaho_postgres_data', lines: ['the repository databases;', 'the scripts run only', 'while it is empty'] },
  { title: 'pentaho_solutions', lines: ["the server's", 'pentaho-solutions folder'] },
  { title: 'pentaho_data', lines: ["the server's", 'data folder'] },
].forEach((o, i) => d.box({ x: VX[i], y: vy + 60, w: VW, h: BH, role: 'store', iconName: 'hard-drive', ...o }));

d.write(import.meta.url);
