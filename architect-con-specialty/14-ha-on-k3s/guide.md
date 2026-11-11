# Adaptation: HA on K3s

> **Note:** The HA section follows the installation guide's topology:
> virtual machines, HAProxy and Keepalived. This page sketches the same
> principles on the K3s stack from the earlier sections, for comparison.
> It is not a workshop, and its draft files are not ready to run.

The three rules from [Overview of Pentaho HA](../10-ha-overview/guide.md)
carry straight over: one shared repository database, the Jackrabbit
cluster journal with a unique ID per node, and sticky sessions at the
load balancer.

On K3s they map to:

- **One shared repository:** the `postgres` Service from the K3s
  workshop, which every replica connects to.
- **The servers:** a Deployment with more than one replica, each pod a
  Pentaho Server node.
- **Sticky sessions:** Traefik's sticky cookie on the ingress, in place
  of HAProxy's cookie; the ingress itself takes the place of the
  Keepalived virtual IP.

## What the draft doesn't solve yet

The unique journal ID is the hard part. The image's `repository.xml`
fixes it at `<Cluster id="node1">`, and every replica runs the same
image, so every pod would claim the same ID: the failure the HA
workshop warns about, where each node skips the other's changes. A
working version needs the `id` attribute removed and each pod to set its
own ID at start, for example from its pod name, without the archive's
start script overriding the Java options that carry it.

The draft manifests and a `make` wrapper are in this lab's files
(`k3s-ha/`). They have not been run, and they don't solve the ID yet: don't
point them at a repository you want to keep.
