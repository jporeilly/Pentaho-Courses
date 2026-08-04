# Overview of the Image Build

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

The workshop image is built in layers from a staged EE archive:

- **stagedArtifacts/** - you place `pentaho-server-ee-<version>.zip`
  here (licensed download from the Support Portal; never bundled).
- **softwareOverride/** - files copied over the exploded server in
  numbered passes: `1_drivers` (JDBC jars you download),
  `2_repository` (JCR/Quartz/hibernate config for PostgreSQL),
  `4_others` (security, web.xml, startup).
- **entrypoint/** - `docker-entrypoint.sh` wires environment
  variables into configuration at container start.

The result is a parameterised Pentaho Server image the Compose and
Kubernetes modules both deploy.
