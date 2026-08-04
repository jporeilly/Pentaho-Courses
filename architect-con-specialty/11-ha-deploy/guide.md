# Deploy Pentaho in HA

> **Warning:**
>
> #### Workshop - Deploy Pentaho in HA
>
> * Enable the Jackrabbit cluster journal in the image's softwareOverride
> * Deploy a multi-replica Pentaho Server behind Traefik with sticky sessions
> * Scale the cluster up and down with make targets and watch sessions stay pinned
>
> **Prerequisites:** The K3s module completed - cluster up, image pullable, PostgreSQL deployed.
>
> **Estimated time:** 60 minutes

> **Note:** Draft scaffold - untested pending a cluster run; the
> outline, commands and bundled files are the working skeleton.

## One-time: enable the cluster journal

The bundled `repository-cluster-journal.xml` snippet shows the
database journal block that replaces the commented section at the
bottom of `softwareOverride/2_repository/pentaho-solutions/system/jackrabbit/repository.xml`.
The cluster id is NOT hardcoded - each pod passes its own name:

```yaml
env:
  - name: POD_NAME
    valueFrom: { fieldRef: { fieldPath: metadata.name } }
  - name: CATALINA_OPTS
    value: "-Drep.cluster.id=$(POD_NAME)"
```

Rebuild the image after the override change (the Build module's
`build.sh`).

## Deploy

```bash
cd ha
make ha-install            # applies deployment (2 replicas), service, sticky ingress
make ha-status
```

## Prove the stickiness

```bash
curl -c /tmp/ha.jar -b /tmp/ha.jar -s http://pentaho.local/pentaho/ -o /dev/null
kubectl logs -n pentaho -l app=pentaho-server-ha --prefix --tail=2
```

The Traefik cookie pins your session to one pod; repeated requests hit
the same replica.

## Scale

```bash
make ha-scale REPLICAS=3
make ha-status
```

## Tear down

```bash
make ha-destroy
```
