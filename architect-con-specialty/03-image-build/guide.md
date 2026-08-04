# Build the Pentaho Image

> **Warning:**
>
> #### Workshop - Build the Pentaho Image
>
> * Stage the Pentaho Server EE archive and a PostgreSQL JDBC driver
> * Configure the build with .env (copied from .env.example)
> * Build the image with build.sh and smoke-test it with test-compose.yml
>
> **Prerequisites:** Podman (Podman Desktop) installed and running; the Pentaho Server EE zip downloaded from the Support Portal.
>
> **Estimated time:** 45 minutes

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

## One-time setup

```bash
cd docker-build
cp .env.example .env
```

Stage the artifacts the build expects (neither ships with this course):

- `stagedArtifacts/pentaho-server-ee-11.0.0.0-237.zip` - from the Support Portal
- `softwareOverride/1_drivers/tomcat/lib/postgresql-42.7.x.jar` - from jdbc.postgresql.org

## Build

```bash
./build.sh
```

## Smoke test

```bash
podman compose -f test-compose.yml up -d
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/pentaho
```
