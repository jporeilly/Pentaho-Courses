# Deploy to K3s

> **Warning:**
>
> #### Workshop - Deploy to K3s
>
> Run the same Pentaho Server image on K3s. `deploy.sh` imports the image into the cluster, then applies the manifests in order: a namespace, a secret, two ConfigMaps, persistent volume claims, PostgreSQL, the Pentaho Server and an ingress. You reach the server through a port-forward, then remove everything with `destroy.sh`.
>
> **What you'll do**
>
> * Check the cluster and rebuild the image the manifests run
> * Create the `postgres-secrets` manifest that `deploy.sh` applies
> * Deploy with `deploy.sh` and watch the pods start
> * Check the storage claims and the scheduler's tables
> * Sign in through a port-forward and the ingress, then tear the deployment down
>
> **Prerequisites:**
>
> * K3s, `kubectl` and Helm on the Linux host, as set up in [Before You Start](../00-before-you-start/guide.md)
> * [Build the Pentaho Image](../03-image-build/guide.md): the `~/pentaho-image` project with its staged archive
> * `sudo` on the host: `deploy.sh` imports the image with `sudo k3s ctr`
> * The Compose stack from [Pentaho Server + PostgreSQL](../05-compose-postgresql/guide.md) stopped
>
> **Estimated time:** 60 minutes

:::: tabs

### 1. Prepare

> **Note:**
>
> #### Prepare
>
> The manifests run `localhost/pentaho/pentaho-server:11.0.0.0-237` with `imagePullPolicy: IfNotPresent`, and connect it to a PostgreSQL Service named `postgres`. Both must match before you deploy.

1. Check the cluster and its storage class:

   ```bash
   kubectl get nodes
   kubectl get storageclass
   ```

> **Success:** Checkpoint: one node with `STATUS` `Ready`, and the storage class `local-path (default)`, provisioner `rancher.io/local-path`.

2. Rebuild the image from the image-build project:

   ```bash
   cd ~/pentaho-image
   ./build.sh
   ```

> **Under the hood:**
>
> #### Two Containerfiles, one tag
>
> The Compose workshop's `deploy.sh` built `image/Containerfile` and tagged the result `pentaho/pentaho-server:11.0.0.0-237`, the same tag as this image. That `Containerfile` has no `COPY ./softwareOverride /docker-entrypoint-init`, because Compose mounts the folder at start. A pod has nothing mounted there, so the K3s build in `pentaho-image` bakes the folder into the image instead, with the PostgreSQL host `postgres`, the name of the Service in `manifests/postgres/service.yaml`.
>
> **Why it matters:** a tag names whatever was built last. Deploying the Compose build here would start a server with the archive's own configuration, which looks for its repository on `localhost:5432`. Check what is inside an image before you ship it, as the next step does.

3. Check that the configuration is baked in:

   ```bash
   podman run --rm --entrypoint ls pentaho/pentaho-server:11.0.0.0-237 /docker-entrypoint-init
   ```

> **Success:** Checkpoint: the build ended with `All done!`, and `ls` lists `2_repository` and `4_others`.

4. Copy this lab's project to the Linux host. Run the block for where this guide runs.

::: tabs

### Guide on the Linux host

```bash
CONTENT=~/.local/share/com.pentaho.content-manager/content
cp -r "$CONTENT/08-k3s-deploy/files" ~/Pentaho-K3s-PostgreSQL
```

### Guide on Windows, host in WSL 2

```bash
CONTENT="$(wslpath "$(cmd.exe /c 'echo %APPDATA%' 2>/dev/null | tr -d '\r')")/com.pentaho.content-manager/content"
cp -r "$CONTENT/08-k3s-deploy/files" ~/Pentaho-K3s-PostgreSQL
```

:::

On a separate Linux VM, copy the folder across with `scp` or a shared folder. The main files are also in **Lab Files** below.

5. Go to the project and make its scripts executable:

   ```bash
   cd ~/Pentaho-K3s-PostgreSQL
   chmod +x deploy.sh destroy.sh scripts/*.sh
   ```

6. Create the secret manifest. Both Deployments read the PostgreSQL password from the key `postgres-password` of the secret `postgres-secrets`, and `deploy.sh` applies `manifests/secrets/secrets.yaml`, which the project leaves for you to create. The command writes the file without touching the cluster.

   ```bash
   mkdir -p manifests/secrets
   kubectl create secret generic postgres-secrets \
     --namespace pentaho \
     --from-literal=postgres-password=password \
     --dry-run=client -o yaml > manifests/secrets/secrets.yaml
   cat manifests/secrets/secrets.yaml
   ```

> **Success:** Checkpoint: a `Secret` named `postgres-secrets`, `namespace: pentaho`, with one key under `data`, `postgres-password`. Without the file, `deploy.sh` would try to copy `secrets.yaml.template`, which the project doesn't ship, and stop.

### 2. Deploy

> **Note:**
>
> #### Deploy
>
> `deploy.sh` streams the image from Podman into K3s's own container runtime, containerd, with `podman save` and `sudo k3s ctr images import`. Then it applies the manifests in seven steps and waits for PostgreSQL to be ready before it creates the server.

1. Run the deployment. Enter your password when `sudo` asks.

   ```bash
   ./deploy.sh
   ```

> **Success:** Checkpoint: `[1/7] Creating namespace 'pentaho'...` to `[7/7] Creating Ingress...`, each followed by a `✓` line, then `Deployment Complete!`, the resources, and `Deployment script completed successfully!` at the end.

2. Check the name under which containerd stored the image:

   ```bash
   sudo k3s ctr images ls -q | grep pentaho
   ```

> **Success:** Checkpoint: one name, `localhost/pentaho/pentaho-server:11.0.0.0-237`. Podman names an image it built `localhost/...`, `podman save` hands that name to containerd, and the server Deployment asks for exactly it. A bare `pentaho/pentaho-server` would not do: Kubernetes adds `docker.io/` to a name with no registry and would look for the image on Docker Hub.

3. Watch the pods start:

   ```bash
   kubectl get pods -n pentaho -w
   ```

> **Under the hood:**
>
> #### Three probes give a slow server time to start
>
> The `pentaho-server` pod first runs the init container `wait-for-postgres`, a `docker.io/library/busybox:1.36` that loops on `nc -z postgres 5432`. Then the server container starts with three HTTP probes on `/pentaho/Login`. The startup probe begins after 60 seconds and allows 30 failures, 10 seconds apart; until it succeeds, Kubernetes runs neither of the others. The readiness probe keeps the pod out of the `pentaho-server` Service until the page answers, and the liveness probe restarts the container if it stops answering five times in a row.
>
> **Why it matters:** the server needs minutes to start. Without the startup probe, a liveness probe sized for a running server would kill it halfway through its first start, again and again.

4. When `pentaho-server` shows `1/1` under `READY`, press `Ctrl+C` to stop watching. The deployment script puts this at 3 to 5 minutes.

> **Success:** Checkpoint: two pods, `postgres-...` and `pentaho-server-...`, both `1/1` and `Running`. On the way, `pentaho-server` showed `Init:0/1`, then `Running` with `0/1` until its readiness probe passed.

### 3. Check the Deployment

> **Note:**
>
> #### Check the Deployment
>
> `manifests/storage/pvc.yaml` asks for three volumes, and `postgres-init-scripts.yaml` carries the five repository scripts the PostgreSQL container runs on its first start.

1. List the volume claims:

   ```bash
   kubectl get pvc -n pentaho
   ```

> **Success:** Checkpoint: `postgres-data-pvc` is `Bound`, 10 Gi. `pentaho-data-pvc` and `pentaho-solutions-pvc` are `Pending`.

2. List the volumes the server Deployment declares:

   ```bash
   kubectl get deployment pentaho-server -n pentaho -o jsonpath='{.spec.template.spec.volumes}{"\n"}'
   ```

> **Under the hood:**
>
> #### Two claims stay pending because nothing mounts them
>
> The query printed an empty line: the server Deployment declares no volumes. `local-path`, K3s's storage class, creates a volume only when a pod that uses the claim is scheduled, so the two Pentaho claims wait forever. The project's `DEPLOYMENT.md` explains why the mounts were taken out: an empty claim mounted over `pentaho-solutions` hides the files the image put there, which a Podman named volume does not do (it is filled from the image the first time).
>
> **Why it matters:** the repository content survives a pod restart because it lives in PostgreSQL, on `postgres-data-pvc`. Anything the server writes to its own file system is lost with the pod.

3. Query the scheduler's lock table, as `DEPLOYMENT.md` does:

   ```bash
   kubectl exec -n pentaho deployment/postgres -- psql -U pentaho_user -d quartz -c "SELECT * FROM qrtz6_locks;"
   ```

> **Success:** Checkpoint: 5 rows, written by `2_create_quartz_postgresql.sql`:
>
> | `sched_name`             | `lock_name`       |
> | ------------------------ | ----------------- |
> | `PentahoQuartzScheduler` | `TRIGGER_ACCESS`  |
> | `PentahoQuartzScheduler` | `JOB_ACCESS`      |
> | `PentahoQuartzScheduler` | `CALENDAR_ACCESS` |
> | `PentahoQuartzScheduler` | `STATE_ACCESS`    |
> | `PentahoQuartzScheduler` | `MISFIRE_ACCESS`  |

4. Run the project's health check:

   ```bash
   ./scripts/health-check.sh
   ```

> **Success:** Checkpoint: a `✓` line for the namespace, both pods, both Services, PostgreSQL, the databases `jackrabbit`, `quartz` and `hibernate`, and the login page, then `All health checks passed!`.

### 4. Access and Tear Down

> **Note:**
>
> #### Access and Tear Down
>
> The `pentaho-server` Service is a `ClusterIP`, reachable only inside the cluster. A port-forward or the Traefik ingress brings it out.

1. Forward local port 8080 to the Service. Leave this terminal running.

   ```bash
   kubectl port-forward -n pentaho svc/pentaho-server 8080:8080
   ```

2. Open the Pentaho User Console with the button below, or at `http://localhost:8080/pentaho` in a browser on the host, and sign in as `admin` with the password `password`.

<button data-launch="puc">Start the Pentaho User Console</button>

> **Success:** Checkpoint: after you sign in, the console opens on **Licenses**, as in the earlier workshops, and the port-forward terminal logs `Handling connection for 8080` for each request.

3. In the port-forward terminal, press `Ctrl+C`. Then, in any terminal, ask for the sign-in page through the ingress, on the node's address:

   ```bash
   NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
   curl -s -o /dev/null -w "%{http_code}\n" "http://$NODE_IP/pentaho/Login"
   ```

> **Success:** Checkpoint: `200`. The ingress's second rule sends any request for `/pentaho` to the `pentaho-server` Service, whatever the host name.

4. Read what the teardown script deletes:

   ```bash
   grep "kubectl delete" destroy.sh
   ```

> **Danger:** the last line, `kubectl delete namespace pentaho`, deletes everything left in the namespace, including the repository database on `postgres-data-pvc`. `--keep-data` doesn't change that: it skips deleting the claims one by one, but the namespace still goes.

5. Remove the deployment. When the script asks `Are you sure you want to continue? (y/N)`, press `y`.

   ```bash
   ./destroy.sh
   kubectl get namespace pentaho
   ```

> **Success:** Checkpoint: `Cleanup Complete!`, then `Error from server (NotFound): namespaces "pentaho" not found`. The image stays in containerd for the Helm workshop.

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>The pentaho-server pod shows ErrImagePull or ImagePullBackOff</summary>

The pod asks for `localhost/pentaho/pentaho-server:11.0.0.0-237` and containerd has no image by that name: the import didn't happen. Check with `sudo k3s ctr images ls -q | grep pentaho`, then import the image and let the pod retry:

```bash
podman save pentaho/pentaho-server:11.0.0.0-237 | sudo k3s ctr images import -
```

A manifest of your own that names the image `pentaho/pentaho-server`, without `localhost/`, fails the same way: Kubernetes looks for it on Docker Hub.

</details>

<details>
<summary>"/usr/bin/env: 'bash\r': No such file or directory"</summary>

The scripts reached the host with Windows line endings, from a copy of the course made before it pinned them to LF. Convert them and run the script again:

```bash
cd ~/Pentaho-K3s-PostgreSQL
sed -i 's/\r$//' deploy.sh destroy.sh scripts/*.sh
```

</details>

<details>
<summary>deploy.sh stops at "Podman image 'pentaho/pentaho-server:11.0.0.0-237' not found"</summary>

The image isn't on this host. Build it in `~/pentaho-image` with `./build.sh`.

</details>

<details>
<summary>The pentaho-server pod restarts before it is ready</summary>

Read why: `kubectl describe pod -n pentaho -l app=pentaho-server` lists the probe failures and the last state, and `kubectl logs -n pentaho deployment/pentaho-server --previous` shows the log of the container that stopped. A container killed for memory shows `OOMKilled`: the server's limit is `6Gi`.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

The scripts that deploy and remove the stack:

[deploy.sh](./files/deploy.sh)

[destroy.sh](./files/destroy.sh)

[Makefile](./files/Makefile)

The manifests, in the order `deploy.sh` applies them (the secret is the one you create):

[namespace.yaml](./files/manifests/namespace.yaml)

[pentaho-config.yaml](./files/manifests/configmaps/pentaho-config.yaml)

[postgres-init-scripts.yaml](./files/manifests/configmaps/postgres-init-scripts.yaml)

[pvc.yaml](./files/manifests/storage/pvc.yaml)

[deployment.yaml (PostgreSQL)](./files/manifests/postgres/deployment.yaml)

[service.yaml (PostgreSQL)](./files/manifests/postgres/service.yaml)

[deployment.yaml (Pentaho Server)](./files/manifests/pentaho/deployment.yaml)

[service.yaml (Pentaho Server)](./files/manifests/pentaho/service.yaml)

[ingress.yaml](./files/manifests/ingress/ingress.yaml)

The checks used in this workshop:

[health-check.sh](./files/scripts/health-check.sh)

[common.sh](./files/scripts/common.sh)

The project's own documentation:

[DEPLOYMENT.md](./files/DEPLOYMENT.md)

[K3s-INSTALLATION.md](./files/K3s-INSTALLATION.md)

[scripts/README.md](./files/scripts/README.md)

### Solution <!-- no-step -->

The project is the finished deployment: with the image built and `manifests/secrets/secrets.yaml` created, `deploy.sh` produces the stack this workshop describes.
