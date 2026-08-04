# Database Variants

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

The same deployment pattern runs against MySQL, MSSQL and Oracle - the
workshop source carries a project per database
(`Pentaho-Server-mySQL`, `Pentaho-Server-MSSQL`,
`Pentaho-Server-Oracle`). What changes between them:

- the `db_init` SQL dialect (five databases, different DDL)
- the JDBC driver staged into `1_drivers`
- the JDBC URLs in `2_repository` (hibernate, quartz, JCR)

The variant projects are not bundled into this course yet - they
follow once the PostgreSQL path is fully authored.
