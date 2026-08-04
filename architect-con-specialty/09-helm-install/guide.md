# Install via Helm

> **Warning:**
>
> #### Workshop - Install Pentaho via Helm
>
> * Package the deployment as a Helm release
> * Install, upgrade and roll back with helm commands
> * Compare the chart's values.yaml against the raw manifests
>
> **Prerequisites:** Helm 3.0+ and the K3s cluster from the previous module.
>
> **Estimated time:** 45 minutes

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

## Install

```bash
helm version
./install-helm.sh
helm list -n pentaho
```

See the bundled `INSTALL.md` for values, upgrades and rollback.
