# Before You Start

> **Note:**
>
> #### Get Ready — Before You Start
>
> Welcome! This page shows you how to work with this guide and gets your Linux host ready for the workshops: Podman for the image and Compose workshops, K3s and Helm for the Kubernetes ones, and the licensed Pentaho Server archive the image build needs. Doing it now means no workshop stops for setup.
>
> **What you'll do:**
>
> * Learn how the guide works: steps, copy buttons, the assistant
> * Set up the Ubuntu host: Podman with `podman-compose`, then K3s, `kubectl` and Helm
> * Download the Pentaho Server archive, and check the host with one command block
>
> **Prerequisites:** the Linux command line (`bash`, `sudo`, a text editor), and what a container image and a container are
>
> **Estimated Time:** 5 minutes on a lab VM; 30 minutes to set up your own host

## Meet your lab guide

This panel stays beside your tools for the whole workshop:

- **Float or dock** — drag the title bar to move the window anywhere
  (any monitor), or use the dock button to pin it to the right edge of
  the screen so maximized apps make room for it.
- **The sidebar** lists every section and lab. A <span data-icon="video"></span> badge means the lab
  includes a video; the `~15 min` tag is a time estimate.
- Use the **font-size** and **reading-mode** controls in the toolbar if
  you're on a small screen.

## Track your progress

Each workshop's steps sit in a numbered row at the top of the lab, one
dot per step. Work through them in order: the button at the end of a
step names the next one, and moving on puts a check mark on the step
you leave. Your
progress is saved on this machine and survives restarts, so you can
pick up exactly where you left off. (This page has no steps: tracking
starts in the first workshop.)

## Copy code with one click

Every code block has a **copy button** — hover over the block and select
it, then paste into your terminal. Try it:

```bash
podman --version
```

## Where the workshops run

The guide runs on your desktop; the workshops run on an **Ubuntu 24.04
LTS host**, in a terminal. That host is a Linux machine, a VM, or on
Windows a WSL 2 distribution. Each workshop copies its project files
from the guide to the host with one command, with a block for each
case: the guide on the Linux host itself, or the guide on Windows with
the host in WSL 2.

The **High Availability** workshops are different: they build a cluster
on separate virtual machines, and each one lists the hosts it needs.

## Set up your environment

### Do you need to set anything up?

::::: tabs

### I'm using a lab VM

Nothing to install: the host is set up for you. Run the block in
**Check your host** below to see it ready.

If something looks wrong later, tell your instructor rather than
reinstalling anything.

### I'm installing on my own machine

Everything here is a **one-off setup**, on the Ubuntu 24.04 host. Run
the parts in order: each one ends with a check.

:::: tabs

### 1. The Linux host

Choose where the host runs:

::: tabs

### Ubuntu machine or VM

Any Ubuntu 24.04 LTS machine with `sudo`, at least 4 CPU cores, 16 GB of
memory and 40 GB of free disk. Bring it up to date:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl unzip jq
```

### WSL 2 on Windows

1. In PowerShell, install an Ubuntu 24.04 distribution. The name keeps
   it apart from any Ubuntu you already have:

   ```powershell
   wsl --install Ubuntu-24.04 --name Ubuntu-Containers
   ```

2. Give WSL enough memory. By default it takes half of the machine's;
   the Pentaho Server and PostgreSQL need about 8 GB of it. Create or
   edit `%UserProfile%\.wslconfig`:

   ```ini
   [wsl2]
   memory=12GB
   ```

   Then restart WSL with `wsl --shutdown`.

3. Open the distribution (**Ubuntu-Containers** in the Start menu, or
   `wsl -d Ubuntu-Containers`), create your user when it asks, and check
   that systemd runs: K3s and rootless Podman need it.

   ```bash
   cat /etc/wsl.conf
   ps -p 1 -o comm=
   ```

   > **Success:** Checkpoint: `/etc/wsl.conf` has `systemd=true` under
   > `[boot]`, and process 1 is `systemd`.

4. Bring it up to date:

   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl unzip jq
   ```

:::

### 2. Podman

**Podman** is this course's container engine: free for commercial use,
no daemon, and rootless, so containers run as your own user.

1. Install it with its Compose provider, from Ubuntu's own packages:

   ```bash
   sudo apt install -y podman podman-compose
   ```

2. Check the versions, and that Podman runs rootless:

   ```bash
   podman --version
   podman compose version 2>&1 | tail -1
   podman info --format '{{.Host.Security.Rootless}}'
   ```

> **Success:** Checkpoint: `podman version 4.9.3`, `podman-compose version 1.0.6` and `true`.

Podman on Ubuntu searches no registry for a short image name:
`postgres:15` fails with `short-name ... did not resolve`. Every image in
this course is written in full, such as `docker.io/library/postgres:15`.
You don't need `podman-docker`, the package that answers to the `docker`
command: the projects call `podman` themselves.

### 3. K3s, kubectl and Helm

Needed from the Kubernetes workshops onward.

1. Install K3s, a single-node Kubernetes:

   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```

2. Give your user its own copy of the cluster's configuration, and tell
   `kubectl` to read it. The `kubectl` that K3s installs reads
   `/etc/rancher/k3s/k3s.yaml`, which only `root` can open, unless
   `KUBECONFIG` says otherwise; Helm reads the same variable.

   ```bash
   mkdir -p ~/.kube
   sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
   sudo chown $(id -u):$(id -g) ~/.kube/config
   chmod 600 ~/.kube/config
   echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc
   export KUBECONFIG=~/.kube/config
   kubectl get nodes
   ```

3. Install Helm 3:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   helm version
   ```

> **Success:** Checkpoint: one node, `Ready`, and a Helm version line beginning `version.BuildInfo{Version:"v3.`.

K3s runs here with the host's swap left on, and sets up IP forwarding
itself. On a single host there are no ports to open; the Traefik
ingress answers on ports 80 and 443 of the host's own address.

### 4. The Pentaho Server archive

The image build stages one licensed file, which never ships with the
course: `pentaho-server-ee-11.0.0.0-237.zip`, from the Pentaho Support
Portal. Put it in `~/Downloads` on the host. On WSL 2, copy it across
from your Windows downloads:

```bash
mkdir -p ~/Downloads
cp /mnt/c/Users/<you>/Downloads/pentaho-server-ee-11.0.0.0-237.zip ~/Downloads/
ls -lh ~/Downloads/pentaho-server-ee-11.0.0.0-237.zip
```

> **Success:** Checkpoint: the archive is listed, at `1.1G`.

It already carries the PostgreSQL JDBC driver, so there is nothing else
to download. A license is optional: without one, the server runs and
asks for a license after you sign in. Have your activation code or
licensing URL ready if you want to add one.

::::

Nothing else is required.

:::::

## Check your host

Run this block on the host at any time. Each line reports `OK` or what
is missing:

```bash
ok() { printf '%-28s %s\n' "$1" "$2"; }
command -v podman >/dev/null && ok "Podman" "OK $(podman --version | cut -d' ' -f3)" || ok "Podman" "MISSING: sudo apt install -y podman"
command -v podman-compose >/dev/null && ok "podman-compose" "OK" || ok "podman-compose" "MISSING: sudo apt install -y podman-compose"
[ "$(podman info --format '{{.Host.Security.Rootless}}' 2>/dev/null)" = "true" ] && ok "Rootless Podman" "OK" || ok "Rootless Podman" "NOT RUNNING: run podman info"
command -v k3s >/dev/null && ok "K3s" "OK" || ok "K3s" "missing (needed from the K3s workshop)"
kubectl get nodes 2>/dev/null | grep " Ready" >/dev/null && ok "kubectl to K3s" "OK" || ok "kubectl to K3s" "NO: export KUBECONFIG=~/.kube/config"
command -v helm >/dev/null && ok "Helm" "OK" || ok "Helm" "missing (needed from the Helm workshop)"
[ -f ~/Downloads/pentaho-server-ee-11.0.0.0-237.zip ] && ok "Pentaho Server archive" "OK" || ok "Pentaho Server archive" "MISSING in ~/Downloads"
ok "Free disk in ~" "$(df -h ~ | awk 'NR==2{print $4}') (40G or more)"
ok "Memory" "$(free -g | awk '/Mem/{print $2}') GB (12 or more)"
```

> **Success:** Checkpoint: every line says `OK`, and the disk and memory meet the figures in brackets. The K3s and Helm lines can wait until the Kubernetes workshops.

## Where the files go

Each workshop copies its project to your home folder on the host and
works there:

```text
~
├── Downloads
│   └── pentaho-server-ee-11.0.0.0-237.zip     the archive, from the Support Portal
├── pentaho-image                  Build the Pentaho Image: build.sh, Containerfile, test-compose.yml
│   ├── stagedArtifacts            the archive, staged for the build
│   └── db_init_postgres           the repository scripts the smoke test runs
├── Pentaho-Server-PostgreSQL      Pentaho Server + PostgreSQL: compose.yaml, deploy.sh, Vault
├── Pentaho-K3s-PostgreSQL         Deploy to K3s: deploy.sh, destroy.sh, manifests/
└── helm-chart                     Install via Helm: the pentaho chart
```

Each project is also the workshop's solution: run as the workshop says,
it produces what the workshop describes.

## Ports at a glance

| Service                        | Address                         | Notes                                              |
| ------------------------------ | ------------------------------- | -------------------------------------------------- |
| Pentaho Server, smoke test     | `http://localhost:8080/pentaho` | `admin` / `password`                               |
| Pentaho Server, Compose        | `http://localhost:8090/pentaho` | `admin` / `password`                               |
| PostgreSQL                     | `localhost:5432`                | The image smoke test and the Compose stack, one at a time |
| HashiCorp Vault                | `http://localhost:8200`         | The Compose stack                                  |
| K3s API                        | `6443`                          | `kubectl` and Helm talk to this                    |
| Traefik ingress                | ports 80 and 443 of the host    | The K3s and Helm workshops                         |
| Ollama — the Chat tab          | `127.0.0.1:11434`               | On your own machine                                |

On a WSL 2 host, a browser on Windows reaches the host's ports at
`localhost`.

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho,
grounded in the official docs — ask it anything from "what does this
probe do?" to "why won't my pod start?". It runs on a local model, so it
works even when the machine is offline.

## How this course is organized

Each section starts with an **overview page** (<span data-icon="page"></span> — background reading,
no checkboxes) followed by **hands-on workshops** (<span data-icon="workshop"></span> — tracked steps).
The image you build in the first workshop runs in every later one: with
Podman Compose, then on K3s, then from a Helm chart. Head to the first
section whenever you're ready.

## The exam

When you have worked through the sections, the **Exam** in the sidebar
checks what you have picked up: 30 questions drawn from a pool of 40,
on the image, Compose, K3s, Helm and high availability. It is
open-book — take your time, browse any section to refresh your memory,
or ask the assistant. Your answers are saved as you go, so leaving the
page to look something up is fine, and the explanations show afterwards
so you can learn from anything you missed. The pass mark is **80%**.

## Troubleshooting <!-- no-step -->

<details>

<summary>"/usr/bin/env: 'bash\r': No such file or directory"</summary>

A script reached the host with Windows line endings, from a copy of the
course made before it pinned them to LF. Each workshop's troubleshooting
gives the `sed -i 's/\r$//'` line for its own scripts.

</details>

<details>

<summary>kubectl says "open /etc/rancher/k3s/k3s.yaml: permission denied"</summary>

`KUBECONFIG` isn't set in this terminal. Set it, and check that
`~/.bashrc` sets it for new terminals:

```bash
export KUBECONFIG=~/.kube/config
grep KUBECONFIG ~/.bashrc
```

</details>

<details>

<summary>WSL 2 runs out of memory, or the Pentaho Server is killed</summary>

Check what the host has with `free -g`. Raise `memory=` in
`%UserProfile%\.wslconfig`, run `wsl --shutdown` in PowerShell, and open
the distribution again. Stop one stack before starting the next: each
workshop says when.

</details>

<details>

<summary>podman: "cannot find UID/GID for user"</summary>

Rootless Podman needs a range of subordinate user IDs for your user.
Ubuntu adds one when it creates a user; for an older account, add it:

```bash
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER
podman system migrate
```

</details>

---

> **Tip:** You can revisit this lab any time from the sidebar.
