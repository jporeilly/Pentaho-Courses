# Adaptation: HA on K3s

> **Note:** The HA module follows the installation guide's topology -
> VMs, HAProxy and Keepalived. This page is an ADAPTATION sketch of
> the same principles on the K3s stack from earlier modules, kept for
> comparison; it is not part of the guided HA install.

The three invariants carry straight over: one shared repository
database, the Jackrabbit cluster journal with unique per-node ids, and
sticky sessions at the load balancer.

On K3s they map to: a multi-replica Deployment (each pod passes its
name as `-Drep.cluster.id`), one PostgreSQL Service, and Traefik's
sticky session cookie in place of HAProxy + Keepalived (the cluster's
ingress supplies the virtual IP semantics).

Draft manifests and a make wrapper live in this lab's files
(`k3s-ha/`) - untested pending a cluster run.
