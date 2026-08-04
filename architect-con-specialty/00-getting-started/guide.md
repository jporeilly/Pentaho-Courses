# Please read ...!

> **Note:**
>
> Welcome! This first lab shows you how to work with this guide.
> Five minutes here makes every later lab smoother.

## Meet your lab guide

This panel stays beside your tools for the whole workshop:

- **Float or dock** — drag the title bar to move the window anywhere
  (any monitor), or use the dock button to pin it to the right edge of
  the screen so maximised apps make room for it.
- **The sidebar** lists every section and lab. A ▶ badge means the lab
  includes a video; the `~15 min` tag is a time estimate.
- Use the **font-size** and **reading-mode** controls in the toolbar if
  you're on a small VM screen.

## Track your progress

In every workshop lab, each numbered heading is a **step** with a
checkbox — tick it when you're done. Progress is saved on this machine
and survives restarts, so you can pick up exactly where you left off.
(This orientation page doesn't track steps — the checkboxes start in
the first workshop.)

## Copy code with one click

Every code block has a **copy button** — hover over the block and click
it, then paste into your tool. Try it:

```sql
SELECT 'hello from the lab guide' AS greeting;
```

## Set up your environment

Launch your main tool straight from the guide:

<button data-launch="puc">Start the Pentaho User Console</button>

If it is already open from a previous session, the button focuses
the running window instead of starting a second copy.

### Do you need to set anything up?

:::: tabs

### I'm using a lab VM

Nothing to do. Everything is installed and running already, and it
starts with the machine.

If something looks wrong later, tell your instructor rather than
reinstalling anything.

### I'm installing on my own machine

Everything here is a **one-off setup**. This course follows the
official containers setup: an **Ubuntu 24.04 LTS** host running the
container engine and, for the Kubernetes modules, K3s. On a Windows
laptop that host is a VM or WSL 2 distro — the tabs say where it
matters.

> **Note:** Every lab's files — the image build, the Compose project,
> the K3s manifests and the Helm chart — **ship inside this course**
> (see each lab's Lab Files). The upstream source is the public
> `jporeilly/Workshop--Installation` repository; you do not need to
> clone it to follow the course.

::: tabs

### 1. The Linux host

1. An Ubuntu 24.04 LTS machine — native, a VM, or WSL 2. Then:

   ```bash
   sudo apt update && sudo apt upgrade
   sudo apt install -y ca-certificates curl gnupg lsb-release
   ```

2. For the K3s modules the host also needs swap disabled, IP
   forwarding enabled, and these ports open: **6443** (API), **8472**
   (Flannel), **10250** (kubelet), **80/443** (ingress).

<details>
<summary>Troubleshooting</summary>

**WSL 2 as the host.** Fine for the image-build and Compose modules.
For K3s, a full VM behaves closer to the docs — WSL's init and
networking differ enough to surprise you (no systemd unless enabled,
NAT'd ports).

**Low disk.** The EE image build wants ~10 GB free between the staged
archive, layers and volumes.

</details>

### 2. Container engine — Podman

**Podman** is this course's engine (free for commercial use; the
commands are Docker-compatible). On the Ubuntu host:

1. Install Podman with its compose provider and the docker-CLI shim
   (the bundled project scripts call `docker`, and the shim lets them
   run unchanged):

   ```bash
   sudo apt update
   sudo apt install -y podman podman-compose podman-docker
   podman --version
   ```

2. Rootless Podman is fine for every lab — nothing here publishes a
   port below 1024.

> **Note:** The upstream Pentaho docs describe the same flow with
> Docker Engine; on a site with licensed Docker Desktop the commands
> are identical without the shim. The K3s modules do not care which
> engine built the image — only that the cluster can pull it.

### 3. K3s, kubectl and Helm

Only needed from the Kubernetes module onward.

1. Install K3s (single node):

   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```

2. Point kubectl at it:

   ```bash
   sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
   sudo chown $(id -u):$(id -g) ~/.kube/config
   kubectl get nodes
   ```

3. Install Helm 3:

   ```bash
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   helm version
   ```

Optional but handy: **k9s** (cluster terminal UI), **make**, and
**DBeaver Community** for poking the PostgreSQL repository.

### 4. Licensed downloads

Two artifacts are staged into the image build and are **never bundled
with the course**:

- the **Pentaho Server EE archive** (`pentaho-server-ee-<version>.zip`)
  from the Support Portal
- a **PostgreSQL JDBC driver** from jdbc.postgresql.org

The Build module says exactly where each one goes.

### 5. Ports at a glance

| Service            | Address / port           | Notes                       |
| ------------------ | ------------------------ | --------------------------- |
| Pentaho Server     | http://localhost:8080/pentaho | `admin` / `password`   |
| PostgreSQL         | 5432 (inside the stack)  | five repository databases   |
| K3s API            | 6443                     | kubectl talks to this       |
| Ingress            | 80 / 443                 | K3s Traefik                 |
| Ollama — the Chat tab | `127.0.0.1:11434`     | on your own machine         |

:::

Nothing else is required.

::::

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho,
grounded in the official docs — ask it anything from "what does this
step do?" to "why did my transformation fail?". It runs on a local
model, so it works even when the VM is offline.

## How this course is organised

Each section starts with an **overview page** (📄 — background reading,
no checkboxes) followed by **hands-on workshops** (🧪 — tracked steps).
Head to the first section whenever you're ready.

---

> **Tip:** You can revisit this lab any time from the sidebar.
