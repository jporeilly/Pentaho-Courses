# Course diagrams

This course's diagrams are hand-laid SVG, in the same style as every
other course's (owner, 2026-11-12: "boxes the same size"; "prettier
with icons"). The Mermaid source was redrawn on 2026-11-12 and removed.
They are drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, full-width bars, and arrows with their labels in white pills. Icons
come from the app's own `lucide-react` package, so they match the icons
in the guide. They draw only what the lessons and the course's own
project files (`compose.yaml`, the `Containerfile`, the K3s manifests,
the Helm chart) state.

* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes compose-stack.svg and ../images/compose-stack.png.
  node compose-stack.svg.mjs
  ```

* Each script's header comment lists the facts it draws, and the lessons
  they come from. Change a fact in a lesson or a project file, and change
  the diagram too.
* The kit's box text does not wrap: at 12px a detail line holds about 30
  characters in a 226px box with an icon. Check the PNG after each edit.

Color by role: blue a tool you use or a source the build reads (the
licensed archive, the `pentaho-image` project's folders, the Compose
project's host folders, `deploy.sh`, Podman's copy of the image, the
`helm` commands), violet an engine or a server (the build and its two
stages, the Pentaho Server, K3s and containerd), teal a join or what runs
on the host (the three ways to run the image, what `docker-entrypoint.sh`
does at each start, the `pentaho` namespace of the K3s deployment),
green a store or a write (PostgreSQL, the named volumes and volume
claims, the Helm revision Secrets), amber the browser or a check (the
browser on port 8090 or the node's address, the ingress, the tests
`build.sh` runs), red a reject or a failure (none drawn yet), slate a
supporting service (Vault and `vault-init`, `local-path`, Traefik, the
ConfigMaps and the PostgreSQL Secret, the containers panel), stone
something not involved (what the first build stage leaves behind), and
white a result (the image).

Keep one icon per thing across the diagrams:

| Icon | Stands for |
| --- | --- |
| `file-archive` | the licensed archive, `stagedArtifacts/` |
| `hammer` | the build, the `Containerfile` |
| `package-open` | the `install_unpack` stage |
| `layers` | the `pack` stage; a Kubernetes namespace |
| `package` | an image (`pentaho/pentaho-server:11.0.0.0-237`) |
| `container` | containers, containerd, a container start |
| `boxes` | K3s |
| `ship-wheel` | Helm, and a `helm` command |
| `folder` | a project folder on the host |
| `folder-cog` | `softwareOverride/` |
| `file-code` | `entrypoint/`, `docker-entrypoint.sh` |
| `folder-input` | the entrypoint copying the `softwareOverride` passes |
| `terminal` | a script you run or the entrypoint runs (`deploy.sh`, `extra-entrypoint.sh`) |
| `badge-check` | the license |
| `play` | `./start-pentaho.sh`, Tomcat in the foreground |
| `circle-check` | the tests `build.sh` runs on the image |
| `trash-2` | what the first stage leaves behind |
| `server` | the Pentaho Server (`pentaho-server`), its container or pod |
| `database` | PostgreSQL (`postgres`), the repository |
| `vault` | HashiCorp Vault (`vault`) |
| `key-round` | the one-off job `vault-init` |
| `hard-drive` | a named volume or a volume claim |
| `folder-tree` | the `local-path` storage class |
| `network` | Traefik |
| `route` | the ingress `pentaho-ingress` |
| `file-cog` | a ConfigMap |
| `file-lock` | a Kubernetes Secret (`postgres-secrets`, a Helm revision) |
| `history` | the Helm release history |
| `app-window` | a browser |

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

| Diagram | Page |
| --- | --- |
| `con-course-path` | Overview of Containers, "The path through this course": one image, three ways to run it |
| `image-two-stage-build` | Overview of the Image Build, after "What a container does at start": the three project folders, the two stages, the image and its tests, and the four steps of `docker-entrypoint.sh` at each start |
| `compose-stack` | Overview of Compose Deployment, "State that survives": the four services with their `--requires`, the host folders (`:ro`, `:U`), host port 8090, and the four named volumes `down` keeps and `down -v` deletes |
| `k3s-deployment` | Overview of K3s Deployment, after "The manifests": the image import into containerd, `local-path`, Traefik, and the objects 1 to 7 in the `pentaho` namespace |
| `helm-revisions` | Install via Helm, part 3: install, upgrade and rollback, the revision Secrets in `default`, and the server pod each revision leaves running in `pentaho` |
