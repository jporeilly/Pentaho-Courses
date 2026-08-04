# Overview of K3s Deployment

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

K3s is a lightweight certified Kubernetes. The bundled manifests carry
the deployment in layers: `namespace`, `configmaps`, `storage`
(PVCs), `postgres`, `pentaho` and `ingress` - plus a secrets
manifest you create yourself (the bundled tree deliberately omits it).

`deploy.sh` applies them in order; `destroy.sh` tears the stack
down. `K3s-INSTALLATION.md` covers standing up K3s itself.
