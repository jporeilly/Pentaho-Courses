# Deploy Pentaho in HA

> **Warning:**
>
> #### Workshop - Deploy Pentaho in HA
>
> * Stand up the PostgreSQL 14 repository (db-01) and run the DDL initialisation
> * Install and configure both Pentaho Server nodes - JNDI data sources, Jackrabbit cluster journal, Quartz clustering, VIP base URL
> * Configure the HAProxy pair with Keepalived VIP failover and sticky sessions, then verify failover
>
> **Prerequisites:** Five Ubuntu 22.04 hosts (or VMs) per the roles table in the overview; the Pentaho Server EE archive; NTP on every node.
>
> **Estimated time:** 120 minutes

> **Note:** Draft scaffold from the HA installation guide - the full
> guide ships in this lab's files; the step-by-step prose is still
> being authored against it.

The complete installation guide ships with this lab -
[Pentaho-HA-Installation-Guide.md](./files/ha-install/Pentaho-HA-Installation-Guide.md) -
and the bundled Makefile drives it per role:

```bash
cd ha-install

make db-setup      # guide section 2: PostgreSQL 14, pg_hba, remote listening, databases + DDL
make node-setup    # guide section 3: run ON EACH app node - Java, user/dirs, archive,
                   # drivers, context.xml JNDI, Jackrabbit journal, Quartz clustering,
                   # VIP base URL, DSW cache off
make lb-setup      # guide section 4: run ON EACH balancer - HAProxy + Keepalived
make verify        # guide section 5: start order, cluster checks, failover test
```

Each target prints the guide section it implements and stops on the
first failure. Run `make help` for the map.

## Key configuration moments

- **Jackrabbit journal** (guide 3.6-3.7): DatabaseJournal against the
  shared PostgreSQL, unique `rep.cluster.id` per node.
- **Quartz clustering** (guide 3.9): dynamic instance id
  (`AUTO`), `isClustered=true`, 20s check-in, the PostgreSQL
  delegate, the JNDI data source and the DDL's table prefix.
- **Base URL = the VIP** (guide 3.10) - node IPs in the base URL break
  every redirect the moment failover happens.

## Verify failover

With everything up (guide section 5): stop HAProxy on lb-01 and watch
Keepalived move the VIP to lb-02; stop app-01's Tomcat and confirm the
balancer drains to app-02 while your session survives (sticky cookie
re-pins).
