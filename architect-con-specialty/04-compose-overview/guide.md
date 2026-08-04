# Overview of Compose Deployment

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

The On-Prem project deploys the image with Podman Compose: the Pentaho
Server container, a PostgreSQL 15 container carrying the five
repository databases (JCR, Quartz, repository, logging, mart), health
checks, persistent volumes and an init pass that runs the
`db_init_postgres` SQL on first start.

See the bundled `ARCHITECTURE.md` for the full picture and
`TROUBLESHOOTING.md` for the failure modes this deployment has
already met.
