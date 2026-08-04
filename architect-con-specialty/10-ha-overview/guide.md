# Overview of Pentaho HA

> **Note:** Draft scaffold - untested pending a cluster run; the
> outline, commands and bundled files are the working skeleton.

A highly available Pentaho Server is a cluster of identical server
nodes behind a load balancer, all sharing one repository database.
Three things make it work - and skipping any one of them produces a
cluster that corrupts itself quietly:

## 1. One shared repository database

Every node points at the same PostgreSQL - the five repository
databases (JCR, Quartz, repository, logging, mart) hold all state, so
nodes stay stateless and disposable.

## 2. The Jackrabbit cluster journal

The JCR content repository must know it is clustered. At the bottom of
`pentaho-solutions/system/jackrabbit/repository.xml` the commented
"Run with a cluster journal" section is enabled with a
database-backed journal, and **every node needs a unique cluster id**.
In Kubernetes the pod name is the natural id - passed as a system
property (`-Drep.cluster.id=$POD_NAME`) so one image serves every
replica.

Without the journal, two nodes writing to the same JCR corrupt the
repository. Without unique ids, journal revisions collide.

## 3. Sticky sessions at the load balancer

Pentaho sessions live in the node's memory - the load balancer MUST
pin each user to one node (a sticky cookie). K3s ships Traefik, which
does this per-service with a session-affinity cookie.

## Scheduler note

Quartz coordinates through its shared database tables, so scheduled
jobs fire once across the cluster rather than once per node.
