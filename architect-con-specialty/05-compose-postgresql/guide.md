# Pentaho Server + PostgreSQL

> **Warning:**
>
> #### Workshop - Compose deployment with PostgreSQL
>
> * Configure the deployment from .env.template
> * Create the PostgreSQL password secret the compose file expects
> * Deploy with deploy.sh, watch the init SQL run, sign in to the User Console
>
> **Prerequisites:** The image from the previous module (or the build baked into deploy.sh); Podman running.
>
> **Estimated time:** 60 minutes

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

## Configure

```bash
cp .env.template .env
mkdir -p secrets && echo "password" > secrets/postgres_password.txt
```

(The secrets folder is deliberately not bundled - creating it is part
of the exercise.)

## Deploy

```bash
./deploy.sh
```

## Verify

- http://localhost:8080/pentaho - sign in `admin` / `password`
- `podman ps` - server + postgres healthy
