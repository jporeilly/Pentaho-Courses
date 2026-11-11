# Overview of the Image Build

The `pentaho-image` project builds a Pentaho Server 11 Enterprise
Edition image from the licensed archive. Everything the Kubernetes
workshops deploy starts here.

## What goes in

- **`stagedArtifacts/`** holds `pentaho-server-ee-<version>.zip`, the
  licensed archive from the Support Portal. It never ships with the
  course, and the build stops if the file it expects isn't there. An
  Analyzer, Interactive Reporting or Dashboard Designer plugin archive
  placed beside it is unpacked too.
- **`softwareOverride/`** holds files copied over the unpacked server in
  numbered passes, in name order: `2_repository` points Jackrabbit,
  Quartz and Hibernate at PostgreSQL, and `4_others` brings security and
  web settings and a `startup.sh` that runs Tomcat in the foreground. A
  `1_drivers` pass would add JDBC drivers; this project needs none,
  because the archive already carries `tomcat/lib/postgresql-42.5.6.jar`.
  A folder that holds a `.ignore` file is skipped.
- **`entrypoint/`** holds `docker-entrypoint.sh`, the script every
  container starts with.

## Two stages

The `Containerfile` builds in two stages. `install_unpack` starts from
`docker.io/library/debian:trixie-slim`, installs `unzip` and unpacks
the archive into `/opt/pentaho`. `pack` starts again from a clean
Debian, creates the user `pentaho` (UID 5000), installs
`openjdk-21-jre-headless` and `curl`, and copies only `/opt/pentaho`
across. The 1.1 GB archive and the tools that unpacked it never reach
the image you ship, and the server runs as `pentaho`, not `root`.

## What a container does at start

`docker-entrypoint.sh` copies each `softwareOverride` pass from
`/docker-entrypoint-init` over the server, runs an optional
`extra-entrypoint.sh`, installs a license when `LICENSE_URL` is set,
and then hands over to the command, `./start-pentaho.sh`. Tomcat runs
in the foreground as the container's main process: if it ran in the
background, the start script would end and the container with it.

Without a license, the server starts, and signing in opens the
**Licenses** page: add an activation code or a licensing URL there.

## Configured from `.env`

`build.sh` reads every setting from `.env`, created from
`.env.example`: the version and edition that name the archive, the tag,
`IMAGE_TAG`, and the two base images. It prints the `podman build`
command it will run (`--dry-run` stops there), builds, and then runs
two tests on the new image: Java answers, and the server's files are
in place.

## Two builds of one server

The K3s workshops deploy this image, with the `softwareOverride` passes
baked in, because a pod has nothing mounted at `/docker-entrypoint-init`.
The Compose workshop builds the same server from its own
`Containerfile` without them, and mounts its own `softwareOverride` at
start instead. Both tag their result `pentaho/pentaho-server:11.0.0.0-237`,
so a tag names whichever was built last: the K3s workshop rebuilds this
one before it deploys.
