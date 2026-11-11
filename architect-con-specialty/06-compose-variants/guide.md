# Database Variants

This course ships the PostgreSQL project. The same deployment pattern
runs against MySQL, Microsoft SQL Server and Oracle, and the workshop
source carries a project for each: `Pentaho-Server-mySQL`,
`Pentaho-Server-MSSQL` and `Pentaho-Server-Oracle`.

## What changes between them

Only three things, all of them in the server's configuration and the
repository scripts:

- **The repository scripts.** The same five, in the database's own SQL:
  the `jackrabbit`, `quartz` and `hibernate` databases (or schemas), the
  Quartz tables, and the logging and operations mart.
- **The JDBC driver.** The archive carries only the PostgreSQL driver.
  The others go into `softwareOverride/1_drivers/tomcat/lib/`, the pass
  the entrypoint copies first, so the driver is in place before the
  configuration that uses it.
- **The connections.** `2_repository` holds the JDBC URLs and dialects
  of the three repository components: `context.xml` for the data
  sources, Jackrabbit's `repository.xml`, and the Quartz and Hibernate
  settings.

## What stays the same

The image build, the entrypoint, Vault, the health checks and the
Compose and Kubernetes workflow don't change. Swapping the repository
database is a change of configuration and scripts, not of the way the
server is packaged or run.

The variant projects are not bundled with this course.
