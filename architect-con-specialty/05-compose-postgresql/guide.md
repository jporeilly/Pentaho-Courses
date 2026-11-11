# Pentaho Server + PostgreSQL

> **Warning:**
>
> #### Workshop - Pentaho Server + PostgreSQL
>
> Run the Pentaho Server with Podman Compose against PostgreSQL 15, with HashiCorp Vault holding the repository passwords. `deploy.sh` builds the image from the project's own `Containerfile`, initializes the three repository databases and starts the server on port 8090.
>
> **What you'll do**
>
> * Stage the archive and create `.env` from `.env.template`
> * Create the PostgreSQL password secret the compose file expects
> * Deploy with `deploy.sh`: image build, PostgreSQL, Vault and the Pentaho Server
> * Check the three repository databases and sign in to the Pentaho User Console (PUC) on port 8090
> * Stop and start the stack, and see the repository survive it
>
> **Prerequisites:**
>
> * [Build the Pentaho Image](../03-image-build/guide.md): the archive staged in `~/pentaho-image/stagedArtifacts`, and its test stack stopped
> * Ports 8090, 8443, 5432 and 8200 free on the host
> * Internet access from the host: the stack pulls `docker.io/library/postgres:15`, `docker.io/hashicorp/vault:1.15` and Debian packages
>
> **Estimated time:** 60 minutes

:::: tabs

### 1. Prepare the Project

> **Note:**
>
> #### Prepare the Project
>
> The project builds its own image from `image/` and mounts `softwareOverride/` into the server at start, so the server's configuration stays on the host instead of in the image.

1. Copy this lab's project to the Linux host. Run the block for where this guide runs.

::: tabs

### Guide on the Linux host

```bash
CONTENT=~/.local/share/com.pentaho.content-manager/content
cp -r "$CONTENT/05-compose-postgresql/files/Pentaho-Server-PostgreSQL" ~/Pentaho-Server-PostgreSQL
```

### Guide on Windows, host in WSL 2

```bash
CONTENT="$(wslpath "$(cmd.exe /c 'echo %APPDATA%' 2>/dev/null | tr -d '\r')")/com.pentaho.content-manager/content"
cp -r "$CONTENT/05-compose-postgresql/files/Pentaho-Server-PostgreSQL" ~/Pentaho-Server-PostgreSQL
```

:::

On a separate Linux VM, copy the folder across with `scp` or a shared folder. The main files are also in **Lab Files** below.

2. Go to the project and make its scripts executable. The `vault-init` container runs `scripts/vault-init.sh` straight from the folder you mount.

   ```bash
   cd ~/Pentaho-Server-PostgreSQL
   chmod +x deploy.sh scripts/*.sh image/entrypoint/docker-entrypoint.sh
   ```

3. Stage the archive you used in the image build. The project expects it in `image/stagedArtifacts/`, a folder it doesn't ship.

   ```bash
   mkdir -p image/stagedArtifacts
   cp ~/pentaho-image/stagedArtifacts/pentaho-server-ee-11.0.0.0-237.zip image/stagedArtifacts/
   ```

4. Create `.env` from the template:

   ```bash
   cp .env.template .env
   ```

5. Open `.env` in a text editor and check these values. Keep them as they are.

| Setting                                 | Value                                         | Used for                                                                 |
| --------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `PENTAHO_VERSION`                       | `11.0.0.0-237`                                | The build argument that names the archive                                |
| `PENTAHO_IMAGE_NAME`                    | `pentaho/pentaho-server`                      | The image the build tags                                                 |
| `PENTAHO_IMAGE_TAG`                     | `11.0.0.0-237`                                | Its tag                                                                  |
| `POSTGRES_PASSWORD`                     | `password`                                    | Stored in Vault by `vault-init`; used by `scripts/validate-deployment.sh` |
| `POSTGRES_PORT`                         | `5432`                                        | Host port for PostgreSQL                                                 |
| `PENTAHO_HTTP_PORT`                     | `8090`                                        | Host port for the server's 8080                                          |
| `PENTAHO_HTTPS_PORT`                    | `8443`                                        | Host port for the server's 8443                                          |
| `PENTAHO_MIN_MEMORY`                    | `4096m`                                       | Passed to the container (see below)                                      |
| `PENTAHO_MAX_MEMORY`                    | `8192m`                                       | Passed to the container (see below)                                      |
| `LICENSE_URL`                           | empty                                         | No license is installed                                                  |
| `INSTALLATION_PATH`                     | `/opt/pentaho`                                | Must match the `Containerfile`                                              |
| `PENTAHO_SERVER_PATH`                   | `/opt/pentaho/pentaho-server`                 | Must match the `Containerfile`                                              |

`PENTAHO_MIN_MEMORY` and `PENTAHO_MAX_MEMORY` reach the container as environment variables, but the server's start doesn't use them: the image's command, the archive's `start-pentaho.sh`, sets `-Xms2048m -Xmx6144m` itself.

6. Create the secret file the compose file reads for the PostgreSQL superuser. Keep the value `password`: it must match `POSTGRES_PASSWORD` in `.env`, and the repository scripts need it (see the panel in part 3).

   ```bash
   mkdir -p secrets
   echo "password" > secrets/postgres_password.txt
   ls image/stagedArtifacts secrets
   ```

> **Success:** Checkpoint: `image/stagedArtifacts` lists `pentaho-server-ee-11.0.0.0-237.zip`, and `secrets` lists `postgres_password.txt`.

### 2. Deploy

> **Note:**
>
> #### Deploy
>
> `deploy.sh` checks the host, builds the image with `--no-cache`, starts PostgreSQL and waits for its health check, then starts the server. Starting the server starts what it depends on first: Vault, and the one-off `vault-init` job.

1. Run the deployment. If the host has less than 10 GB free, or a port is in use, the script asks whether to continue: enter `yes` only if you know why. The build takes several minutes.

   ```bash
   ./deploy.sh
   ```

> **Success:** Checkpoint: the script ends with `Deployment Successful!`, the URL `http://localhost:8090/pentaho` and `Login: admin / password`.

The output includes each `podman` command that `podman compose` runs. When the script starts the server, `podman-compose` also tries to create PostgreSQL again and prints `Error: creating container storage: the container name "pentaho-postgres" is already in use`; it then starts the existing container, which is already running. `deploy.sh` watches the server's log for up to 300 seconds; if the server hasn't started by then, it says so above the summary. Either way, check the log yourself.

2. Follow the server's log until Tomcat reports that it has started, then press `Ctrl+C` to stop following:

   ```bash
   podman logs -f pentaho-server
   ```

> **Success:** Checkpoint: after the `Copying` lines, the `Pentaho Vault Integration` block reports `Vault is ready and unsealed`, `Successfully authenticated with Vault`, `Successfully fetched credentials from Vault` and `Vault integration complete!`. The log ends with a line containing `Server startup in`.

3. Read the log of the one-off Vault job:

   ```bash
   podman logs pentaho-vault-init
   ```

> **Under the hood:**
>
> #### Vault hands the passwords to Tomcat before Tomcat starts
>
> `vault-init` runs each time the server starts: Podman starts every container a service depends on with it, finished one-off jobs included. So the job is written to run again safely. On the first run it initializes Vault with five unseal key shares, three of which unseal it, and saves the keys and the root token to `vault-keys.json` in the `vault_data` volume. It enables the KV version 2 engine at `secret/`, stores the three repository users and their passwords at `secret/data/pentaho/postgresql`, and creates the AppRole `pentaho` with a read-only policy. The AppRole's `role_id` and `secret_id` go to `approle-creds.json`, in the same volume, which the server mounts read-only at `/vault/data`.
>
> In the server, `docker-entrypoint.sh` runs `extra-entrypoint.sh` from `softwareOverride/4_others`. It signs in with the AppRole, reads the secret, and rewrites the `password` of the `hibuser`, `pentaho_user` and `jcr_user` resources in `context.xml`, all before `start-pentaho.sh` runs.
>
> **Why it matters:** the passwords Tomcat uses come from Vault at every start, so `scripts/rotate-secrets.sh` can change them without a rebuild. The keys file next to the data is a lab shortcut: `vault-init.sh` itself warns that in production you distribute the keys and delete the file.

4. List the containers and their state:

   ```bash
   podman ps -a --format "{{.Names}}  {{.Status}}"
   ```

> **Success:** Checkpoint: `pentaho-vault`, `pentaho-postgres` and `pentaho-server` are `Up` and, once their health checks pass, `(healthy)`. `pentaho-vault-init` has `Exited (0)`: its log ended with `Vault Initialization Complete!`, with the root token, role ID and secret ID shown masked.

### 3. Check the Repository

> **Note:**
>
> #### Check the Repository
>
> The repository is three databases and two schemas, created by the five scripts in `db_init_postgres/`. Query them inside the PostgreSQL container, where `psql` is installed.

1. List the databases:

   ```bash
   podman exec -e PGPASSWORD=password pentaho-postgres psql -U postgres -c "\l"
   ```

> **Success:** Checkpoint: 6 rows. Besides `postgres`, `template0` and `template1`, the three repository databases and their owners:
>
> | Database     | Owner          | Holds                            |
> | ------------ | -------------- | -------------------------------- |
> | `hibernate`  | `hibuser`      | Platform metadata, logging, mart |
> | `jackrabbit` | `jcr_user`     | The JCR content repository       |
> | `quartz`     | `pentaho_user` | The scheduler's job store        |

2. List the scheduler's tables:

   ```bash
   podman exec -e PGPASSWORD=password pentaho-postgres psql -U pentaho_user -d quartz -c "\dt"
   ```

> **Success:** Checkpoint: 11 rows, all owned by `pentaho_user`, from `qrtz6_blob_triggers` to `qrtz6_triggers`.

3. List the schemas of `hibernate`:

   ```bash
   podman exec -e PGPASSWORD=password pentaho-postgres psql -U hibuser -d hibernate -c "\dn"
   ```

> **Success:** Checkpoint: 3 rows: `pentaho_dilogs` and `pentaho_operations_mart`, owned by `hibuser`, and `public`.

4. Find where PostgreSQL ran the scripts:

   ```bash
   podman logs pentaho-postgres 2>&1 | grep -E "initdb.d/|init process complete"
   ```

> **Under the hood:**
>
> #### The SQL ran once, on an empty volume
>
> The `postgres:15` image runs the files in `/docker-entrypoint-initdb.d`, here the project's `db_init_postgres` folder, in name order, and only when its data directory is empty. The scripts connect as `postgres` to create the three users and databases, then reconnect as `pentaho_user` and `hibuser` to create the Quartz tables and the two schemas in `hibernate`. The image's start script gives those reconnects the superuser's password, from `secrets/postgres_password.txt`, which is why it has to equal the users' password, `password`.
>
> On every later start, the data directory in the `pentaho_postgres_data` volume already holds a database, and the image skips the folder.
>
> **Why it matters:** `podman compose down` keeps the repository; `podman compose down -v` deletes the volume, and the next start builds the repository from scratch. The first and third scripts begin with `drop database if exists`, so running them by hand against a live repository erases it.

5. See who owns the server's configuration folders, on the host and in the container:

   ```bash
   ls -ldn config/.kettle config/.pentaho
   podman exec pentaho-server ls -ld /home/pentaho/.kettle /home/pentaho/.pentaho
   ```

> **Under the hood:**
>
> #### Rootless Podman runs the container in your own range of user IDs
>
> Rootless Podman maps `root` in the container to you, and the container's other users to the subordinate IDs `/etc/subuid` gives you, usually from 100000. The server runs as `pentaho`, UID 5000, which is 100000 + 4999 = 104999 on the host. A folder you create belongs to you, so inside the container it would belong to `root`, and the server could not write to it. The `:U` at the end of the two `config` mounts in `compose.yaml` makes Podman hand each folder to the container's user at every start.
>
> **Why it matters:** the server keeps its license and its own settings in `~/.pentaho`. Without `:U`, a license added in the console could not be saved. To read or edit those files on the host, go through the same mapping: `podman unshare cat config/.kettle/kettle.properties`.

6. Open `http://localhost:8090/pentaho` in a browser and sign in as `admin` with the password `password`.

> **Success:** Checkpoint: `grep` found one `running /docker-entrypoint-initdb.d/` line per script, `1_create_jcr_postgresql.sql` to `5_pentaho_mart_postgresql.sql`, and `PostgreSQL init process complete; ready for start up.` On the host, both `config` folders belong to a number such as `104999`; in the container, to `pentaho`. After you sign in, the Pentaho User Console opens on **Licenses**, as in the image workshop, until you add a license with **+**.

### 4. Stop and Start

> **Note:**
>
> #### Stop and Start
>
> `down` removes the containers and the network but keeps the named volumes, so the next `up` starts from the same repository and the same Vault.

1. Stop the stack and list the volumes:

   ```bash
   podman compose down
   podman volume ls --format "{{.Name}}"
   ```

> **Success:** Checkpoint: `podman ps` lists none of the four containers, and the volume list still has four names ending `_vault_data`, `_pentaho_postgres_data`, `_pentaho_solutions` and `_pentaho_data`.

`down` takes about a minute and warns `StopSignal SIGTERM failed to stop container pentaho-server in 60 seconds, resorting to SIGKILL`: Podman waits the `stop_grace_period` that `compose.yaml` sets, but the image's start script doesn't pass the stop signal on to Tomcat. The volume list also shows a few long hexadecimal names: unnamed volumes that the Vault image declares. `podman volume prune` removes them once no container uses them.

2. Start it again. The image already exists, so nothing is built.

   ```bash
   podman compose up -d
   ```

3. Check what PostgreSQL and the Vault job did this time:

   ```bash
   podman logs pentaho-postgres 2>&1 | grep "Skipping initialization"
   podman logs pentaho-vault-init | grep ">>>"
   ```

> **Success:** Checkpoint: PostgreSQL logged `PostgreSQL Database directory appears to contain a database; Skipping initialization`. The Vault job logged `>>> Vault already initialized`, then `>>> Unsealing Vault...`: Vault restarts sealed, and the job unseals it with the saved keys. A second run follows, started with the server, and finds `>>> Vault is already unsealed`.

4. When `podman logs pentaho-server` shows `Server startup in` again, sign in at `http://localhost:8090/pentaho` as `admin`.

> **Success:** Checkpoint: `admin` signs in again: the users are in the repository, which survived `down` and `up`.

5. Stop the stack before the K3s workshop, to free the host's memory. The volumes stay.

   ```bash
   podman compose down
   ```

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>"/usr/bin/env: 'bash\r': No such file or directory"</summary>

The scripts reached the host with Windows line endings, from a copy of the course made before it pinned them to LF. Convert them and run the script again:

```bash
cd ~/Pentaho-Server-PostgreSQL
sed -i 's/\r$//' deploy.sh scripts/*.sh image/entrypoint/*.sh .env.template
```

</details>

<details>
<summary>deploy.sh stops at "PostgreSQL failed to become healthy"</summary>

Read the database's log: `podman compose logs postgres`. An error during the scripts, such as a failed `\connect quartz pentaho_user`, means `secrets/postgres_password.txt` doesn't hold `password`. Correct it, delete the half-built repository with `podman compose down -v`, and run `./deploy.sh` again.

</details>

<details>
<summary>pentaho-server restarts, and its log stops at a Vault line</summary>

If the log ends at `Vault integration skipped` or `Continuing with default credentials`, `extra-entrypoint.sh` ended the start script before Tomcat ran. Check the Vault job: `podman logs pentaho-vault-init` must end with `Vault Initialization Complete!`. Then restart the server: `podman restart pentaho-server`.

</details>

<details>
<summary>A port is already in use</summary>

Find what holds it, for example `ss -tuln | grep 5432`. Stop it, or change `POSTGRES_PORT` or `PENTAHO_HTTP_PORT` in `.env` and deploy again.

</details>

<details>
<summary>The repository databases are missing</summary>

`\l` doesn't list `hibernate`, `jackrabbit` and `quartz` when the volume held a database before the scripts could run. Delete it and deploy again: `podman compose down -v`, then `./deploy.sh`. This deletes everything in the repository.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

The deployment, its configuration template and its script:

[compose.yaml](./files/Pentaho-Server-PostgreSQL/compose.yaml)

[.env.template](./files/Pentaho-Server-PostgreSQL/.env.template)

[deploy.sh](./files/Pentaho-Server-PostgreSQL/deploy.sh)

[Makefile](./files/Pentaho-Server-PostgreSQL/Makefile)

The image the project builds:

[Containerfile](./files/Pentaho-Server-PostgreSQL/image/Containerfile)

[docker-entrypoint.sh](./files/Pentaho-Server-PostgreSQL/image/entrypoint/docker-entrypoint.sh)

Vault: the one-off job, the script the server runs before Tomcat, and the server configuration:

[vault-init.sh](./files/Pentaho-Server-PostgreSQL/scripts/vault-init.sh)

[extra-entrypoint.sh](./files/Pentaho-Server-PostgreSQL/softwareOverride/4_others/extra-entrypoint.sh)

[vault.hcl](./files/Pentaho-Server-PostgreSQL/vault/config/vault.hcl)

The repository scripts, in the order PostgreSQL runs them:

[1_create_jcr_postgresql.sql](./files/Pentaho-Server-PostgreSQL/db_init_postgres/1_create_jcr_postgresql.sql)

[2_create_quartz_postgresql.sql](./files/Pentaho-Server-PostgreSQL/db_init_postgres/2_create_quartz_postgresql.sql)

[3_create_repository_postgresql.sql](./files/Pentaho-Server-PostgreSQL/db_init_postgres/3_create_repository_postgresql.sql)

[4_pentaho_logging_postgresql.sql](./files/Pentaho-Server-PostgreSQL/db_init_postgres/4_pentaho_logging_postgresql.sql)

[5_pentaho_mart_postgresql.sql](./files/Pentaho-Server-PostgreSQL/db_init_postgres/5_pentaho_mart_postgresql.sql)

The PostgreSQL server settings and access rules:

[custom.conf](./files/Pentaho-Server-PostgreSQL/postgres-config/custom.conf)

[pg_hba.conf](./files/Pentaho-Server-PostgreSQL/postgres-config/pg_hba.conf)

The repository connections the server uses, pointing at the host `repository`:

[context.xml](./files/Pentaho-Server-PostgreSQL/softwareOverride/2_repository/tomcat/webapps/pentaho/META-INF/context.xml)

The project's own documentation:

[README.md](./files/Pentaho-Server-PostgreSQL/README.md)

[ARCHITECTURE.md](./files/Pentaho-Server-PostgreSQL/ARCHITECTURE.md)

[CONFIGURATION.md](./files/Pentaho-Server-PostgreSQL/CONFIGURATION.md)

[TROUBLESHOOTING.md](./files/Pentaho-Server-PostgreSQL/TROUBLESHOOTING.md)

### Solution <!-- no-step -->

The `Pentaho-Server-PostgreSQL` project is the finished deployment: with the archive staged and the secret file created, `deploy.sh` produces the stack this workshop describes.
