# Deploy to K3s

> **Warning:**
>
> #### Workshop - Deploy Pentaho to K3s
>
> * Stand up K3s (or point kubectl at an existing cluster)
> * Create the namespace, secrets, storage and database
> * Deploy the Pentaho Server and reach it via port-forward
>
> **Prerequisites:** kubectl + a K3s cluster (see the bundled K3s-INSTALLATION.md); the image from the Build module pushed where the cluster can pull it.
>
> **Estimated time:** 60 minutes

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

## Deploy

```bash
./deploy.sh
kubectl get pods -n pentaho -w
```

## Access (port-forward)

```bash
kubectl port-forward -n pentaho svc/pentaho-server 8080:8080
```

Then sign in at http://localhost:8080/pentaho.

## Tear down

```bash
./destroy.sh
```
