# Course diagrams

The Solution Architect - High Availability Specialty course's
diagrams are hand-laid SVG, drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, full-width bars, a row table (`tableBox`), and arrows with their
labels in white pills. Icons come from the app's own `lucide-react`
package, so they match the icons in the guide. The diagrams name the
course's own hosts, addresses, ports, priorities, settings and table
prefixes, and draw only what the lessons state.

* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes ha-topology.svg and ../images/ha-topology.png.
  node ha-topology.svg.mjs
  ```

* The sticky session and the Tray.io poll are sequence diagrams.
  [`sequence.mjs`](sequence.mjs) draws them with the kit's own parts: one
  panel per actor as a tall lane with a dashed lifeline, one kit arrow
  per numbered message, and a pill on a lifeline for a step an actor
  takes alone. It is a copy of the Integrating Authentication Mechanisms
  course's helper, kept here so the course stands on its own. It is a
  helper, not a diagram, so it has no `.svg` of its own.
* Each script's header comment lists the facts it draws, and the lessons
  they come from. Change a fact in a lesson, and change the diagram too.
* Every diagram is 800 wide, so its figure's `width` is `800`. Edit the
  `.svg.mjs`, run it, and commit the script, the `.svg` and the `.png`
  together.
* The Carte master is amber and a Carte slave violet, with the `network`
  and `cpu` icons, as in the Installation - Certified course's
  `carte-cluster` diagram.

Color by role: blue a tool you use (Spoon, the Tray.io workflow), violet
a server or an engine (the Pentaho Server nodes, the Carte slaves), teal
a link (the VIP, and the balancer that holds it), green a store (`db-01`
and its databases), amber the browser or a check (the clients, the Carte
master, the `getSlaves` call, the `chk_haproxy` script), red a reject or
a failure (sessions that are not shared, a stopped service, the node-down
band), slate a supporting service (the HAProxy balancers, the On-Premises
Agent), stone something not involved (the dynamic clustering schema this
course does not use), and white a result (the journal's revision, the
Quartz row lock). Keep one icon per thing across the diagrams:

| Icon | Stands for |
| --- | --- |
| `globe` | the clients, the browser |
| `radio-tower` | the virtual IP, `10.0.1.100` |
| `scale` | a balancer: HAProxy and Keepalived on `lb-01` or `lb-02` |
| `server` | a Pentaho Server node |
| `database` | `db-01`, PostgreSQL |
| `folder-tree` | Jackrabbit, its cluster journal |
| `calendar-clock` | Quartz, `qrtz6_scheduler_state` |
| `lock` | the `TRIGGER_ACCESS` row lock in `qrtz6_locks` |
| `history` | the `hibernate` database |
| `cookie` | a session, `JSESSIONID` |
| `network` | the Carte master |
| `cpu` | a Carte slave, the Carte cluster |
| `workflow` | Spoon, and a clustering schema |
| `square-terminal` | a command line: `curl` |
| `cloud` | Tray.io |
| `plug` | the Tray.io On-Premises Agent |
| `heart-pulse` | the `chk_haproxy` health check |
| `octagon-x` | a stopped service |

| Diagram | Page |
| --- | --- |
| `ha-topology` | Overview of Pentaho HA (01), under "Server roles": clients to the VIP held by `lb-01` or `lb-02`, HAProxy to the two Pentaho nodes on `8080`, both nodes to `db-01` on `5432`, and the Carte cluster as a separate group |
| `ha-sticky-session` | Deploy Pentaho in HA (02), part 6, test 2: Tomcat sets `JSESSIONID`, HAProxy prefixes `S1~` on the way out and strips it on the way in; node 1 stops, `option redispatch` sends the request to node 2, and the user signs in again |
| `keepalived-failover` | Deploy Pentaho in HA (02), part 6, after the warning before test 4: priorities `110 + 2` and `100 + 2`; stopping HAProxy leaves `lb-01` at `110`, above `102`, and stopping Keepalived moves the VIP to `lb-02` |
| `ha-shared-state` | Deploy Pentaho in HA (02), part 6, after test 6: what the two nodes share in `db-01` (the `cl_j_` journal with `NODE_1` and `NODE_2`, Quartz's check-ins and `TRIGGER_ACCESS` lock in the `qrtz6_` tables, `hibernate`), and that sessions are not shared |
| `carte-master-slaves` | Carte Cluster for Pentaho Data Integration Execution HA (03), part 2: `CarteMaster` on `9001`, `CarteSlaveOne` and `CarteSlaveTwo` on `9002` registering themselves, the master checking them, `getSlaves`, and Spoon's `HA_Carte_Cluster` |
| `trayio-carte-poll` | Tray.io Integration with Pentaho Carte (04), end of part 2: the trigger, `runJob` answering at once with the job's ID, the Script step, the `jobStatus` loop with a 10 s delay, and the notification |
