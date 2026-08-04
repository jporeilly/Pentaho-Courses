# Carte Cluster for PDI Execution HA

> **Warning:**
>
> #### Workshop - Carte Cluster
>
> * Run Carte on both app nodes and register them as a cluster schema
> * Execute a transformation across the cluster and watch the work distribute
>
> **Prerequisites:** The HA deployment running (previous lab).
>
> **Estimated time:** 45 minutes

> **Note:** Draft scaffold from the HA installation guide - the full
> guide ships in this lab's files; the step-by-step prose is still
> being authored against it.

Carte gives PDI execution its own HA story: each app node runs a Carte
server, PDI defines a cluster schema over them, and jobs submitted to
the master distribute across slaves - guide section 6 covers the
configuration files, credentials and the REST endpoints that the next
lab's Tray.io workflows call.

```bash
make carte-setup     # on each app node, from the deploy lab's Makefile
```
