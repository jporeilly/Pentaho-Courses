# Before You Start

> **Note:**
>
> #### Get Ready — Before You Start
>
> Before the first workshop, check that the Pentaho Server is running
> and that the workshop folder is in place. The course builds reports,
> analyses and dashboards in the Pentaho User Console against the Steel
> Wheels sample data, and **none of the lab time should go on setup**:
> this page does it in advance.
>
> **What you'll do:**
>
> * Learn how the guide works: progress, copy buttons, the assistant.
> * Confirm the Pentaho Server starts and the User Console signs you in.
> * Check the workshop folder: *C:\Workshop-BA-Practitioner*
>
> **Estimated Time:** 5 minutes on a lab VM; about 15 minutes the first
> time on your own machine.

## Meet your lab guide

This panel stays beside your tools for the whole workshop:

- **Float or dock** — drag the title bar to move the window anywhere
  (any monitor), or use the dock button to pin it to the right edge of
  the screen so maximised apps make room for it.
- **The sidebar** lists every section and lab. A <span data-icon="video"></span> badge means the lab
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

Everything here is a **one-off setup** for your own laptop. Work through
the tabs in order — the last one is a reference card of ports and
logins, for when you come back to it later.

> **Note:** This course needs no containers, no MySQL and no extra
> downloads. Everything runs inside the Pentaho Server you already
> have — every lab reads from the bundled Steel Wheels sample data,
> and nothing writes to it.

::: tabs

### 1. Start the Pentaho Server

The server ships with Pentaho, so there is nothing to install — you
just start it. It brings up the User Console, the sample data and the
reporting plugins together.

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

**The window closes immediately.** The server could not find a usable
Java. It checks `PENTAHO_JAVA_HOME` first, then the bundled
`C:\Pentaho\java`, and only then `JAVA_HOME`: check `echo $env:PENTAHO_JAVA_HOME`
and `echo $env:JAVA_HOME` (a JDK newer than 21 stops the server), and
see `set-pentaho-env.bat` in the same folder for what the server
expects.

**Sample data is missing.** The bundled HSQLDB `sampledata` starts
with the server on port 9001. If the server started but reports
cannot find their data, stop the server, make sure nothing else owns
9001, and start it again.

</details>

### 2. Sign in to the User Console

1. Open the User Console — use the button at the top of this page, or
   browse to **http://localhost:8080/pentaho**.

2. Sign in as **`admin`** with the password **`password`**.

3. You should land on the Home perspective, with **Browse Files** and
   **Create New** available.

Use `admin` for every lab in this course. The server also ships with
sample users for other roles — they matter when you are designing
security, but they only get in the way while you are learning the
tools, so stick with `admin`.

<details>
<summary>The other sample users</summary>

All five ship with the server, and all use the password `password`:

| Role                | User    | Username   |
| ------------------- | ------- | ---------- |
| Administrator       | Admin   | `admin`    |
| Power User          | Suzy    | `suzy`     |
| Business Analyst    | Pat     | `pat`      |
| Report Author       | Tiffany | `tiffany`  |
| Schedule Power User | Bob     | `bob`      |

They differ in what they may do — Business Analyst can only publish
content, whereas Power User can also schedule, read, create and
execute. That is why the labs use `admin`: it has every permission, so
nothing you try is blocked for a reason unrelated to the lesson.

</details>

### 3. Lab files on disk

The installer lays each workshop's finished answer out under
**`C:\Workshop-BA-Practitioner`**, one folder per module, so you can
compare your work with a solution without downloading it from the
guide first. Every lab's **Solution** section quotes its path.

These are repository files (`.prpti`, `.xanalyzer`, `.xdash`), not
programs: you open one by uploading it to the User Console, and each
Solution section gives the steps.

<details>
<summary>The folder isn't there</summary>

It is an optional component, so a **Minimal (app only)** install, or
an unticked **Workshop lab files** box, skips it. Lay it down at any
time from your install's `provisioning` folder:

```powershell
.\install-workshop.ps1
```

Safe to run whenever you want the shipped files back as they shipped:
it only ever adds and refreshes, and never deletes your work.

</details>

### 4. Ports and logins

Everything this course uses, in one place. All of it is local to your
machine.

| Service               | Address                                | Username       | Password   |
| --------------------- | -------------------------------------- | -------------- | ---------- |
| Pentaho User Console  | http://localhost:8080/pentaho          | `admin`        | `password` |
| HSQLDB `sampledata`   | `jdbc:hsqldb:hsql://localhost/sampledata` | `pentaho_user` | `password` |
| Ollama — the Chat tab | `127.0.0.1:11434`                      | *none*         | *none*     |

The Steel Wheels sample data lives in the bundled HSQLDB and starts
with the server — you will not normally connect to it directly, since
the reports and dashboards reach it through the server's own data
sources.

> **Caution:** These are the stock Pentaho workshop credentials and are
> widely known. Change them on any server that is reachable beyond
> your own machine.

:::

The panel below probes this machine live, checking what this course's
labs need. Each row reports one of four states:

* **<span class="pcm-c-ok">Green</span>** — the check passed; that piece is present and answering.
* **<span class="pcm-c-warn">Amber</span>** — usable, but worth tidying before the session.
* **<span class="pcm-c-danger">Red</span>** — it will block a lab, and the row tells you the exact fix.
* **<span class="pcm-c-muted">Grey</span>** — skipped, because this course doesn't use it.

<div data-env-check="server"></div>

Nothing else is required.

::::

## Check the working folders

The installer lays every workshop's solution out under
**`C:\Workshop-BA-Practitioner`**, one folder per module, in the
order the sidebar reads. The User Console module is reading and
exploring only, so the numbering starts at `03`.

```text
C:\Workshop-BA-Practitioner
├── 03-interactive-reports
│   ├── 06-interactive-reports-sales-territory
│   │   └── solution
│   │       └── Sales Territory Report - Demo.prpti     the finished report
│   ├── 07-interactive-reports-orders-na-and-emea\solution
│   └── 08-interactive-reports-ships-and-trains\solution
├── 04-analyzer-reports
│   ├── 10-analyzer-reports-sales-analysis\solution    an .xanalyzer each
│   └── 11-analyzer-reports-emea-quantity\solution
└── 05-dashboard-designer
    ├── 13-dashboard-designer-vendor-sales\solution    an .xdash each
    ├── 14-dashboard-designer-inventory\solution
    └── 15-dashboard-designer-product-performance\solution
```

Every `solution` folder holds the **finished, working** answer to its
workshop. Your own work never lives here: you build it in the User
Console and save it to **Public > Training** on the server.

**Confirm the files are there**, not just the folder: open
`03-interactive-reports\06-interactive-reports-sales-territory\solution`
and check you can see `Sales Territory Report - Demo.prpti`. An empty
folder is the one thing worth catching now rather than in the middle
of a lab.

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho,
grounded in the official docs — ask it anything from "what does this
step do?" to "why did my transformation fail?". It runs on a local
model, so it works even when the VM is offline.

## How this course is organised

Each section starts with an **overview page** (<span data-icon="page"></span> — background reading,
no checkboxes) followed by **hands-on workshops** (<span data-icon="workshop"></span> — tracked steps).
Head to the first section whenever you're ready.

---

> **Tip:** You can revisit this lab any time from the sidebar.
