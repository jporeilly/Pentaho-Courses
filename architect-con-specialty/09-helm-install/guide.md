# Install via Helm

> **Warning:**
>
> #### Workshop - Install via Helm
>
> Install the K3s deployment again, this time as one Helm release from the bundled `pentaho` chart. Then change it with `helm upgrade`, take the change back with `helm rollback`, and remove it with `helm uninstall`.
>
> **What you'll do**
>
> * Check Helm and the image, then lint and render the chart without installing it
> * Install the `pentaho` release and watch its pods start
> * Upgrade the release with a new memory limit and see the server pod replaced
> * Roll back to revision 1 and read the release history
> * Uninstall the release
>
> **Prerequisites:**
>
> * [Deploy to K3s](../08-k3s-deploy/guide.md), finished with `destroy.sh`: the chart creates the same namespace and objects, and the image is still in K3s
> * Helm 3, as set up in [Before You Start](../00-before-you-start/guide.md)
>
> **Estimated time:** 45 minutes

:::: tabs

### 1. Check the Chart

> **Note:**
>
> #### Check the Chart
>
> The chart in `helm-chart/pentaho` templates the same objects as the K3s manifests. `values.yaml` holds every setting the templates read, so a change is a value, not an edited manifest.

1. Copy this lab's files to the Linux host. Run the block for where this guide runs.

::: tabs

### Guide on the Linux host

```bash
CONTENT=~/.local/share/com.pentaho.content-manager/content
cp -r "$CONTENT/09-helm-install/files/helm-chart" ~/helm-chart
```

### Guide on Windows, host in WSL 2

```bash
CONTENT="$(wslpath "$(cmd.exe /c 'echo %APPDATA%' 2>/dev/null | tr -d '\r')")/com.pentaho.content-manager/content"
cp -r "$CONTENT/09-helm-install/files/helm-chart" ~/helm-chart
```

:::

On a separate Linux VM, copy the folder across with `scp` or a shared folder. The main files are also in **Lab Files** below.

2. Check Helm with the chart's own script, in check-only mode:

   ```bash
   cd ~/helm-chart
   bash install-helm.sh --check
   ```

> **Success:** Checkpoint: `✓ Helm is already installed`, its version and location, then `✓ Helm version is 3.x or higher (recommended)`.

3. Check that the image is still in K3s and that the K3s workshop's namespace is gone:

   ```bash
   sudo k3s ctr images ls -q | grep pentaho
   kubectl get namespace pentaho
   ```

> **Success:** Checkpoint: the image `localhost/pentaho/pentaho-server:11.0.0.0-237` is listed, the name the chart's `values.yaml` asks for, and `kubectl` reports `namespaces "pentaho" not found`.

4. Lint the chart:

   ```bash
   helm lint pentaho
   ```

> **Success:** Checkpoint: `1 chart(s) linted, 0 chart(s) failed`.

5. Render the chart without installing it, and count what it would create:

   ```bash
   helm template pentaho ./pentaho | grep "^kind:" | sort | uniq -c
   ```

> **Success:** Checkpoint: 10 objects. `values.yaml` turns the Pentaho Server's two storage claims off (`pentaho.persistence.data.enabled` and `solutions.enabled` are `false`), so only PostgreSQL gets one.
>
> | Kind                    | Count |
> | ----------------------- | ----- |
> | `ConfigMap`             | 2     |
> | `Deployment`            | 2     |
> | `Ingress`               | 1     |
> | `Namespace`             | 1     |
> | `PersistentVolumeClaim` | 1     |
> | `Secret`                | 1     |
> | `Service`               | 2     |

### 2. Install

> **Note:**
>
> #### Install
>
> `helm install` renders the templates with `values.yaml`, sends the objects to the cluster in dependency order, and records what it sent as revision 1 of the release.

1. Install the release, named `pentaho`:

   ```bash
   helm install pentaho ./pentaho
   ```

> **Success:** Checkpoint: `NAME: pentaho`, `NAMESPACE: default`, `STATUS: deployed`, `REVISION: 1`, then the chart's notes: `Thank you for installing pentaho version 1.0.0!`, `Your release is named: pentaho` and `Namespace: pentaho`.

2. List the releases:

   ```bash
   helm list
   ```

> **Under the hood:**
>
> #### The release lives in one namespace, its objects in another
>
> Helm stores each revision of a release as a Secret, `sh.helm.release.v1.pentaho.v1` for this one, in the namespace you install into: here `default`, the namespace of your `kubectl` context. The chart doesn't put its objects there. Every template sets `namespace: pentaho`, from `global.namespace` in `values.yaml`, and the chart creates that `Namespace` itself.
>
> So the `helm` commands in this workshop need no `-n`, while the `kubectl` commands need `-n pentaho`. It is also why the workshop doesn't use the `--namespace pentaho --create-namespace` form from the chart's README: Helm would create the namespace first, then refuse to take over the `Namespace` object its own template renders.
>
> **Why it matters:** `helm list -n pentaho` shows nothing for this release. When a release seems to be missing, look for it with `helm list -A` before you install it a second time.

3. Watch the pods start, and press `Ctrl+C` when `pentaho-server` shows `1/1` under `READY`:

   ```bash
   kubectl get pods -n pentaho -w
   ```

> **Success:** Checkpoint: `helm list` showed one release, `pentaho`, namespace `default`, revision `1`, status `deployed`, chart `pentaho-1.0.0`, app version `11.0.0.0-237`. The two pods, `postgres-...` and `pentaho-server-...`, are both `1/1` and `Running`.

4. Ask for the sign-in page through a port-forward in the background, as the chart's `INSTALL.md` does, then stop the port-forward:

   ```bash
   kubectl port-forward -n pentaho svc/pentaho-server 8080:8080 &
   sleep 3
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/pentaho/Login
   kill %1
   ```

> **Success:** Checkpoint: `200`.

### 3. Upgrade and Roll Back

> **Note:**
>
> #### Upgrade and Roll Back
>
> An upgrade renders the chart again with your new values and applies the difference. Here you raise the server container's memory limit from `values.yaml`'s `6Gi` to `8Gi`.

1. Read the server container's memory limit:

   ```bash
   kubectl get deployment pentaho-server -n pentaho -o jsonpath='{.spec.template.spec.containers[0].resources.limits.memory}{"\n"}'
   ```

> **Success:** Checkpoint: `6Gi`, from `pentaho.resources.limits.memory` in `values.yaml`.

2. Upgrade the release with a new limit:

   ```bash
   helm upgrade pentaho ./pentaho --set pentaho.resources.limits.memory=8Gi
   ```

> **Success:** Checkpoint: `Release "pentaho" has been upgraded.`, `STATUS: deployed`, `REVISION: 2`.

3. Watch the pods:

   ```bash
   kubectl get pods -n pentaho -w
   ```

> **Under the hood:**
>
> #### An upgrade restarts only what renders differently
>
> Helm compares the new rendering with revision 1 and the live objects, and patches what changed: here one field of the `pentaho-server` Deployment's pod template. A changed pod template makes the Deployment replace its pod, and the chart's `strategy: Recreate` stops the old pod before the new one starts, so the server is down while it starts again. The `postgres` Deployment rendered the same, so its pod keeps running.
>
> A value that only reaches a ConfigMap, such as `pentaho.jvm.maxMemory`, changes no pod template. The chart has no checksum annotation to force one, so the running pod keeps the environment it started with.
>
> **Why it matters:** read what a value renders into before you upgrade a production release: some values restart the server, and some change nothing until the next restart.

4. When the new `pentaho-server` pod shows `1/1`, press `Ctrl+C`, and read the limit again:

   ```bash
   kubectl get deployment pentaho-server -n pentaho -o jsonpath='{.spec.template.spec.containers[0].resources.limits.memory}{"\n"}'
   ```

> **Success:** Checkpoint: the `pentaho-server` pod was terminated and replaced by one with a new name, while the `postgres` pod kept its name and age. The limit is now `8Gi`.

5. Read the release history:

   ```bash
   helm history pentaho
   ```

> **Success:** Checkpoint: two revisions.
>
> | `REVISION` | `STATUS`     | `DESCRIPTION`      |
> | ---------- | ------------ | ------------------ |
> | 1          | `superseded` | `Install complete` |
> | 2          | `deployed`   | `Upgrade complete` |

6. Roll back to revision 1:

   ```bash
   helm rollback pentaho 1
   ```

> **Success:** Checkpoint: `Rollback was a success! Happy Helming!` The `pentaho-server` pod is replaced again.

7. Read the history and the limit again:

   ```bash
   helm history pentaho
   kubectl get deployment pentaho-server -n pentaho -o jsonpath='{.spec.template.spec.containers[0].resources.limits.memory}{"\n"}'
   ```

> **Under the hood:**
>
> #### A rollback is a new revision
>
> `helm rollback pentaho 1` doesn't delete revision 2. It takes the manifests stored with revision 1, applies them, and records the result as revision 3. Each revision is its own Secret in `default`, so the history only grows, up to Helm's limit on kept revisions, and you can roll back the rollback.
>
> **Why it matters:** the history is an audit trail of every change to the release, and any recorded revision can be restored with one command.

8. List the Secrets that hold the release's revisions:

   ```bash
   kubectl get secrets -n default -l owner=helm,name=pentaho
   ```

> **Success:** Checkpoint: the limit is back to `6Gi`, and the history has three revisions; the third is `deployed`, with the description `Rollback to 1`. The Secrets are `sh.helm.release.v1.pentaho.v1`, `.v2` and `.v3`.

### 4. Uninstall

> **Note:**
>
> #### Uninstall
>
> `helm uninstall` deletes every object the release created, in the reverse order of the install.

1. List the kinds of object the release owns:

   ```bash
   helm get manifest pentaho | grep "^kind:"
   ```

> **Danger:** the list includes the `Namespace`. Uninstalling deletes it, and with it the claim `postgres-data-pvc` and the repository database on it.

2. Uninstall the release:

   ```bash
   helm uninstall pentaho
   ```

> **Success:** Checkpoint: `release "pentaho" uninstalled`.

3. Check that the namespace is gone. It shows `Terminating` while Kubernetes deletes what is in it.

   ```bash
   kubectl get namespace pentaho
   helm list
   ```

> **Success:** Checkpoint: once it has finished terminating, `kubectl` reports `namespaces "pentaho" not found`, and `helm list` shows no release.

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>helm install fails with "rendered manifests contain a resource that already exists"</summary>

Objects from the K3s workshop, or from an earlier install, are still in the cluster. Remove them: run `./destroy.sh` in `~/Pentaho-K3s-PostgreSQL`, or `helm uninstall pentaho` for an earlier release, and install again.

</details>

<details>
<summary>The pentaho-server pod shows ErrImagePull or ImagePullBackOff</summary>

The pod asks for `localhost/pentaho/pentaho-server:11.0.0.0-237`, from `pentaho.image.repository` in `values.yaml`, and containerd doesn't have it. Check with `sudo k3s ctr images ls -q | grep pentaho`, and import it as in the troubleshooting of [Deploy to K3s](../08-k3s-deploy/guide.md).

</details>

<details>
<summary>helm uninstall says the release is not found</summary>

The release is in another namespace than the one you named. `helm list -A` shows where it is; uninstall it with that namespace, for example `helm uninstall pentaho -n default`.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

The chart's metadata, its values and the templates this workshop discusses:

[Chart.yaml](./files/helm-chart/pentaho/Chart.yaml)

[values.yaml](./files/helm-chart/pentaho/values.yaml)

[namespace.yaml](./files/helm-chart/pentaho/templates/namespace.yaml)

[secret.yaml](./files/helm-chart/pentaho/templates/secret.yaml)

[pentaho-deployment.yaml](./files/helm-chart/pentaho/templates/pentaho-deployment.yaml)

[postgres-deployment.yaml](./files/helm-chart/pentaho/templates/postgres-deployment.yaml)

[pvc.yaml](./files/helm-chart/pentaho/templates/pvc.yaml)

[_helpers.tpl](./files/helm-chart/pentaho/templates/_helpers.tpl)

[NOTES.txt](./files/helm-chart/pentaho/templates/NOTES.txt)

The Helm check script used in step 2:

[install-helm.sh](./files/helm-chart/install-helm.sh)

The chart's own documentation:

[INSTALL.md](./files/helm-chart/INSTALL.md)

[QUICK-REFERENCE.md](./files/helm-chart/QUICK-REFERENCE.md)

[README.md](./files/helm-chart/README.md)

[TEMPLATES-GUIDE.md](./files/helm-chart/pentaho/TEMPLATES-GUIDE.md)

### Solution <!-- no-step -->

The `pentaho` chart is the finished release: `helm install pentaho ./pentaho` produces the deployment this workshop describes.
