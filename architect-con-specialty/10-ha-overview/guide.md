# Overview of Pentaho HA

> **Note:** Draft scaffold from the HA installation guide - the full
> guide ships in this lab's files; the step-by-step prose is still
> being authored against it.

The HA architecture in this module comes from the Pentaho HA
Installation Guide (bundled in the deploy lab): two Pentaho
application nodes behind an HAProxy load-balancer pair with a
Keepalived virtual IP, one shared PostgreSQL 14 repository, and Carte
clustering for PDI execution - with Tray.io driving event-based ETL
through the Carte REST API.

## Server roles

| Node   | Role                                             |
| ------ | ------------------------------------------------ |
| lb-01  | HAProxy primary + Keepalived MASTER (holds the VIP) |
| lb-02  | HAProxy secondary + Keepalived BACKUP             |
| app-01 | Pentaho Server node 1 (+ Carte)                   |
| app-02 | Pentaho Server node 2 (+ Carte)                   |
| db-01  | PostgreSQL 14 - the five repository databases     |

## The rules that make it work

- **Sticky sessions are mandatory** - Pentaho sessions are not
  replicated between nodes; HAProxy pins each client to one node.
- **The Jackrabbit cluster journal** must be enabled with a unique id
  per node - without it, concurrent JCR writes corrupt the repository.
- **Quartz clusters through its shared tables** - dynamic per-node
  instance ids, clustering enabled, matched table prefix - so
  schedules fire once across the cluster.
- **The base URL is the VIP**, never a node IP - redirects, report
  links and schedule callbacks must route through the balancer.
- **NTP everywhere** - mismatched clocks corrupt Quartz execution
  timestamps.
- **One Pentaho node per machine** - stacking nodes on one host adds
  no availability.

## Ports (firewall)

Tomcat HTTP between balancers and app nodes; the HAProxy frontend
client-facing; the stats page admin-only; PostgreSQL from app nodes;
Carte's port for Tray.io and the cluster master. The bundled guide's
section 1.3 has the full table.
