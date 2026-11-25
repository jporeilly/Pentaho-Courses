# Course diagrams

The Solution Architect - Installation - Certified course's diagrams are
hand-laid SVG, drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, full-width bars, a row table (`tableBox`), and arrows with their
labels in white pills. Icons come from the app's own `lucide-react`
package, so they match the icons in the guide. The diagrams name the
course's own paths, versions, ports, databases and owners, and draw only
what the lessons state.

* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes service-pack-flow.svg and ../images/service-pack-flow.png.
  node service-pack-flow.svg.mjs
  ```

* Each script's header comment lists the facts it draws, and the lessons
  they come from. Change a fact in a lesson, and change the diagram too.
* Every diagram is 800 wide, so its figure's `width` is `800`. Edit the
  `.svg.mjs`, run it, and commit the script, the `.svg` and the `.png`
  together.
* `pdi-client-server` and `carte-cluster` redraw two earlier Mermaid
  figures (`1794309012312.png` and `carte_cluster.png`) with the same
  content; `carte-cluster` follows the Developer DI Practitioner course's
  diagram of the same name, narrowed to 800. `archive-install-layout`
  replaced `pentaho_pro_suite.png`, a Carte figure that did not belong on
  the installation pages; the Client Plugins page dropped it. The three
  old PNGs are gone. `pentaho_architecture.png` (Components) is not drawn
  here and stays as it is.

Color by role: blue a tool you use or a source you read (Spoon, the
staging folder, psql, a new connection, what you do by hand after a
service pack), violet the server or an engine (the Pentaho Server and
its parts, the repository components, Carte, the service pack
installer's own work), teal a link between two things (a JNDI resource
in `context.xml`), green a store (PostgreSQL, a repository database, a
password method that keeps it safe, the installer's reports and backup),
amber the browser or a check (the User Console, the record before a
service pack, the `pg_hba.conf` checks, the check after the first start,
the Carte master), red a failure (exit code `255`), slate a supporting
service or group (the host, Java, what a run uses), stone something not
involved (the desktop's Spoon, `peer`), and white a result (a part, a
schema, a check). Keep one icon per thing across the diagrams:

| Icon | Stands for |
| --- | --- |
| `server` | the Pentaho Server, and Tomcat |
| `monitor` | the Ubuntu host |
| `globe` | the browser and the User Console address |
| `layout-dashboard` | the User Console |
| `folder-archive` | the staging folder, `/opt/pentaho/software` |
| `package` | a ZIP or installer: the server archive, the service pack installer |
| `plug` | a JDBC driver folder, the Carte API plugin, a new connection |
| `puzzle` | a plugin (EE server plugins, PDI plugins) |
| `folder-cog` | `pentaho-solutions`, and the repository configuration in its `system` folder |
| `square-terminal` | a script or command line: `start-pentaho.sh`, Pan, Kitchen and Carte, `psql`, `apt` |
| `coffee` | Java 21 |
| `memory-stick` | the server's memory |
| `database` | PostgreSQL, a database, a JDBC driver set, the system database |
| `folder-tree` | Jackrabbit, the content repository |
| `calendar-clock` | Quartz, the scheduler |
| `history` | Hibernate, audit logging |
| `chart-line` | the Operations Mart |
| `workflow` | Spoon, and Pipeline Designer |
| `shuffle` | Pentaho Data Integration |
| `cpu` | Carte (a slave, the server's own Carte) |
| `network` | the Carte master |
| `file-stack` | source data |
| `file-text` | `pg_hba.conf` |
| `list-checks` | the `pg_hba.conf` checks |
| `undo-2` | going back: the next `pg_hba.conf` line, putting back what a service pack removed |
| `clipboard-list` | the record before a service pack |
| `archive` | the installer's backup |
| `refresh-cw` | the products a service pack replaces |
| `folder-open` | the installer's reports |
| `laptop` | the client tools, the desktop |
| `octagon-x` | a failure |
| `circle-check` | a check that passes, and the finished installation |
| `user` | the `pentaho` installation user |
| `user-cog` | a database role |
| `clipboard-check` | the environment's validation checks |
| `key-round` | a license |
| `list-todo` | the labs still to do |
| `book-open` | a reading: the module's Overview |
| `shield-check` | hardening, the post-installation tasks |
| `layers` | the other design tools: Report Designer, Metadata Editor, Schema Workbench, Aggregation Designer |
| `container` | the Containers course |
| `scale` | the High Availability course, its balancers |
| `log-in` | the Enterprise Security: Authentication course |
| `award` | the Certified Solution Architect certification |
| `tag` | the build the path is made against |

| Diagram | Page |
| --- | --- |
| `installation-what-you-build` | Overview (04), "2. What You'll Achieve": the end state of the whole course, the Ubuntu server with the licensed, patched and hardened Pentaho Server, its plugins and User Console, its repository in PostgreSQL 17, and the designer's desktop with the client tools |
| `archive-installation-module` | Overview (04), "5. The Plan": the module at a glance, the Overview reading, then the five workshops (05 to 09) in order, each with its time, what it does and its checkpoint, the result and the next module |
| `pdi-client-server` | Components (03), "Data Integration" tab: Spoon sends `.ktr` and `.kjb` files to the Pentaho Server's Data Integration topology and its system database; Pan, Kitchen and Carte run standalone |
| `carte-cluster` | Components (03), "3. Carte Server": a master splits the transformation and four slaves load the target in parallel |
| `archive-install-flow` | Prepare Environment (05), above the tabs: the sixteen stages of lessons 05 and 06 in order, each with its checkpoint, the finished result, and the labs that follow (07 to 10) |
| `pg-hba-first-match` | Prepare Environment (05), "9. Configure pg_hba.conf": the first line whose type, database, user and address match decides the method; the seven lines after the change, and where `psql` and the Pentaho Server land |
| `archive-install-layout` | Install Pentaho Server (06), header figure: where the pieces end up, staging, the unpacked server, Java 21, PostgreSQL 17 on `5432` and the User Console on `8080` on one host; `archive-install-flow` shows the order you build them in |
| `repository-databases` | Install Pentaho Server (06), "2. Repository Databases": component, JNDI resource, database and owner, and what the first start creates |
| `pipeline-designer-runs-on-server` | Server Plugins (07), "4. Carte": Pipeline Designer runs on the server's own Carte at `/pentaho/kettle`, with the server's Java, memory, drivers and plugins |
| `service-pack-flow` | Upgrade and Patches (09), above the tabs: the service pack, step by step, and the staging mistake that ends in exit code `255` |
| `sa-learning-path` | Not in a lesson: no lesson here describes the path. It is the path figure on the Sandbox's Solution Architect landing page: the two core courses (DI Developer, Installation) and the three Speciality courses (Containers, High Availability, Enterprise Security: Authentication), all mandatory and in order, each with its level, lessons, modules, time, where it runs and what it covers, then the certification and its proctored exam, and the build `11.0.0.0-237` with Installation's service pack `11.0.0.3-312` |
