# Overview of Compose Deployment

A Compose file describes a whole stack in one place: the containers, the
networks between them, the volumes they keep their data in, the
secrets they read, and the order they start in. `podman compose` hands
it to `podman-compose`, which turns each service into `podman` commands.

## The Pentaho-Server-PostgreSQL stack

The project's `compose.yaml` runs four services:

| Service          | Image                              | Does                                                                         |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| `vault`          | `docker.io/hashicorp/vault:1.15`   | Holds the repository passwords                                               |
| `vault-init`     | `docker.io/hashicorp/vault:1.15`   | A one-off job: initializes and unseals Vault, stores the passwords, creates an AppRole |
| `postgres`       | `docker.io/library/postgres:15`    | The repository: `jackrabbit`, `quartz` and `hibernate`, created on first start |
| `pentaho-server` | built from `image/Containerfile`   | Reads the passwords from Vault, then starts Tomcat on port 8090 of the host  |

PostgreSQL runs the five scripts in `db_init_postgres` once, on an
empty volume. The server mounts its configuration, `softwareOverride/`,
at start rather than baking it into the image, so the site's settings
stay on the host. `deploy.sh` builds the image, starts PostgreSQL,
waits for its health check, and then starts the server.

## What Podman does differently

Three things about this stack are Podman's own, and each workshop
shows one of them at work:

- **`depends_on` becomes `--requires`.** Podman starts every container a
  service requires whenever that service starts, so a finished one-off
  job runs again with each start of the server. `vault-init` is written
  for it: the second time, it finds Vault initialized and only unseals
  it.
- **A one-off job waits by itself.** Podman 4.9 cannot start a container
  whose required job has exited while the job's own requirement is still
  running. So `vault-init` has no `depends_on`: its script waits for
  Vault, and the server depends on both.
- **Rootless ownership.** A host folder mounted into a container belongs
  to `root` inside it. The `:U` option on the server's two `config`
  mounts hands them to `pentaho`, the user the server runs as.

## State that survives

`podman compose down` removes the containers and the network and keeps
the named volumes: the repository, Vault's data and the server's
solutions. The next `up` starts from them. `down -v` deletes the
volumes too, and the next start builds the repository from scratch.

See the project's `ARCHITECTURE.md` for the full picture and
`TROUBLESHOOTING.md` for the failure modes this deployment has met.
