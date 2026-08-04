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

<button data-launch="schema-workbench">Start Pentaho Schema Workbench</button>

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

> **Note:** This course needs no containers and no extra databases —
> your cubes model the Steel Wheels sample data served by the Pentaho
> Server's bundled HSQLDB, and finished schemas publish back to that
> same server for Analyzer to browse.

::: tabs

### 1. Start the Pentaho Server

The server ships with Pentaho, so there is nothing to install — you
just start it. It brings up the User Console, the sample data and the
publish target for your Mondrian schemas.

1. Open PowerShell and run the start script from your Pentaho install:

   ```powershell
   C:\Pentaho\server\pentaho-server\start-pentaho.bat
   ```

2. Wait for it to finish booting. The first start takes a few minutes;
   leave the window open, as closing it stops the server.

3. Confirm it is up by browsing to **http://localhost:8080/pentaho**.
   You should get a sign-in page.

To shut it down later, run `stop-pentaho.bat` from the same folder.

<details>
<summary>Troubleshooting</summary>

**The browser cannot reach localhost:8080.** The server is still
starting, or it stopped. Watch the console window for
`Server startup in ... ms`, then retry.

**"Port 8080 already in use".** Something else has the port — often a
second Pentaho Server, or another Tomcat. Stop it, or change the
port in `tomcat\conf\server.xml`.

**The window closes immediately.** Almost always `JAVA_HOME` is unset
or points at the wrong JDK. Check it with `echo $env:JAVA_HOME`, and
see `set-pentaho-env.bat` in the same folder for what the server
expects.

</details>

### 2. Start Schema Workbench

1. Install the Pentaho design tools to `C:\Pentaho`, so the workbench
   lives at:

   ```
   C:\Pentaho\design-tools\schema-workbench\workbench.bat
   ```

2. Start it from the button at the top of this page and let it finish
   loading.

3. Set the JDBC connection the labs use (Options ▸ Connection):
   `jdbc:hsqldb:hsql://localhost/sampledata` as `pentaho_user` /
   `password` — the **server must be running**, because it hosts the
   HSQLDB the schemas model against.

4. Publishing a schema prompts for the server URL and credentials:
   **http://localhost:8080/pentaho** as `admin` / `password`.

Each workshop's schemas ship in its **Lab Files** — open them via
**File ▸ Open** (copy them out of the guide's content folder first if
you plan to edit).

<details>
<summary>Troubleshooting</summary>

**The Start button does nothing.** The launcher expects the path
above. Either move your install there or edit the course's launcher
path.

**The sampledata connection refuses.** The HSQLDB starts *with the
Pentaho Server* on port 9001 — start the server first (tab 1), then
retest the connection.

**Publish fails with 401.** Use `admin` / `password` — and if your
server has a separate publish password configured, set it in the
server's `publisher_config.xml` or use that value here.

**The MDX lab's cube is missing.** That lab opens the SteelWheels
sample schema that ships with your Pentaho install (see the lab page
for the exact path) — its cube is `SteelWheelsSales`.

</details>

### 3. Ports and logins

Everything this course uses, in one place. All of it is local to your
machine.

| Service               | Address                                | Username       | Password   |
| --------------------- | -------------------------------------- | -------------- | ---------- |
| Pentaho User Console  | http://localhost:8080/pentaho          | `admin`        | `password` |
| HSQLDB `sampledata`   | `jdbc:hsqldb:hsql://localhost/sampledata` | `pentaho_user` | `password` |
| Ollama — the Chat tab | `127.0.0.1:11434`                      | *none*         | *none*     |

> **Caution:** These are the stock Pentaho workshop credentials and are
> widely known. Change them on any server that is reachable beyond
> your own machine.

:::

<div data-env-check="server"></div>

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
