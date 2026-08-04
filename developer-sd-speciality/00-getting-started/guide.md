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

<button data-launch="spoon">Start Pentaho Data Integration</button>

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

Everything here is a **one-off setup** for your own laptop. Work through
the tabs in order — the last one is a reference card of ports and
logins, for when you come back to it later.

> **Note:** Every broker this course uses — HiveMQ, EMQX, RabbitMQ
> and Kafka — runs as a container, and one command starts them all.
> The two MQTT brokers coexist on their own ports (HiveMQ 1883,
> EMQX 1884), so no lab ever has to stop another's broker. The panel
> below this section checks each one and prints the exact fix for
> anything missing.

::: tabs

### 1. Container runtime

The brokers run under **Podman Desktop** — free for commercial use,
and the commands the labs use (`podman run`, `podman exec`) come with
it.

1. Install Podman Desktop:

   ```powershell
   winget install -e --id RedHat.Podman-Desktop
   ```

2. Open it once and let it create its machine (it will offer — accept,
   and pick **rootful** if asked).

3. Check the machine is up:

   ```powershell
   podman machine list
   ```

<details>
<summary>Troubleshooting</summary>

**`podman` is not recognised.** PATH updates only reach new terminals —
close and reopen PowerShell.

**The machine won't start.** Podman machines run inside WSL 2 — run
`wsl --update`, reboot if it asks, then start the machine from Podman
Desktop.

**Everything worked yesterday but not today.** The machine does not
start with Windows by default — open Podman Desktop and start it, or
run `podman machine start`.

</details>

### 2. Start the brokers

One command brings up HiveMQ (MQTT), RabbitMQ (AMQP) **and** Kafka,
from the app's install folder:

```powershell
provisioning\setup-services.ps1 -Streaming
```

The first run downloads the images — give it a few minutes. Check
them any time:

```powershell
provisioning\check-environment.ps1 -Streaming
```

<details>
<summary>Troubleshooting</summary>

**A port is already in use.** Something else owns 1883, 5672 or 9092 —
usually an older broker container. `podman ps -a` shows what;
`podman rm -f <name>` clears it.

**Images fail to pull.** Corporate proxies often block container
registries — try again on an open network, or configure the proxy in
Podman Desktop's settings.

**A consumer connects but no messages arrive.** Almost always the
publisher isn't running — each lab's script must stay running in its
own terminal while the transformation executes. For Kafka, also check
the topic name matches exactly (`pdi-users`).

**Kafka works, then refuses after a reboot.** The machine (and its
containers) don't autostart — open Podman Desktop, start the machine,
then re-run the setup command; `restart: unless-stopped` brings the
brokers back with it.

**Everything is slow or containers get OOM-killed.** The Podman
machine defaults to a modest memory slice — in Podman Desktop,
Settings → Resources, give it 4 GB+ when running all three brokers.

**Which MQTT broker am I talking to?** HiveMQ listens on **1883**,
EMQX on **1884** — both run at once. If a consumer sees nothing,
check the port in your connection string matches the lab you're on.

</details>

### 3. Python for the publishers

Each streaming lab feeds its broker with a small bundled Python
script (`sensor.py`, `sensor_tv_room.py`, `produce_users.py`).

1. Install Python 3.12:

   ```powershell
   winget install -e --id Python.Python.3.12
   ```

2. Open a **new** terminal and confirm:

   ```powershell
   python --version
   ```

Each lab's **Lab Files** section copies its script out and installs
its one dependency with `pip install -r requirements.txt`.

<details>
<summary>Troubleshooting</summary>

**A Microsoft Store window opens instead.** Windows' app-alias stub is
shadowing the real install. Settings → Apps → Advanced app settings →
App execution aliases → turn off the two `python` entries.

</details>

### 4. Pentaho Data Integration

1. Install PDI to `C:\Pentaho`, so Spoon lives at:

   ```
   C:\Pentaho\design-tools\data-integration\spoon.bat
   ```

2. The Kafka labs use the **Kafka Consumer/Producer** steps from the
   Enterprise Edition plugin — install it into PDI if your build does
   not already show them in the Design palette.

3. Start Spoon once from the button at the top of this page.

### 5. Ports and logins

Everything this course uses, all local to your machine:

| Service            | Address                   | Login             |
| ------------------ | ------------------------- | ----------------- |
| HiveMQ (MQTT)      | `tcp://localhost:1883`    | *none*            |
| HiveMQ Control Center | http://localhost:9090  | `admin` / `hivemq` |
| EMQX (MQTT)        | `tcp://localhost:1884`    | *none*            |
| EMQX Dashboard     | http://localhost:18083    | `admin` / `public` (change forced on first sign-in) |
| RabbitMQ (AMQP)    | `amqp://localhost:5672`   | `guest` / `guest` |
| RabbitMQ management | http://localhost:15672   | `guest` / `guest` |
| Kafka              | `127.0.0.1:9092`   (use the IP, not `localhost` - Windows resolves that to IPv6 first)          | *none*            |
| Workshop MySQL     | `localhost:3306`          | `kafka_user` / `password` (Kafka lab) |
| Ollama — the Chat tab | `127.0.0.1:11434`      | *none*            |

> **Caution:** These are the stock workshop credentials and are widely
> known. Change them on any machine reachable beyond your own.

:::

<div data-env-check="streaming"></div>

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
