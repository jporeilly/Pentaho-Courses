# Before You Start

> **Note:**
>
> #### Get Ready — Before You Start
>
> Before the first workshop, check that the Pentaho Server and its sample
> data are up, that Metadata Editor starts and can reach that data, and
> that the workshop folder is in place. The course builds metadata
> domains against the Steel Wheels sample data and tests every one in
> Interactive Reports, and **none of the lab time should go on setup**:
> this page does it in advance.
>
> **What you'll do:**
>
> * Learn how the guide works: progress, copy buttons, the assistant.
> * See how Metadata Editor, the Pentaho Server and the sample data fit together.
> * Confirm the server, the sample data, Metadata Editor and Interactive Reports all answer.
> * Check the workshop folder: *C:\Workshop-ME-Associate*
>
> **Prerequisites:** A basic understanding of relational tables and SQL.
>
> **Estimated time:** 5 minutes on a lab VM; about 15 minutes the first
> time on your own machine.

## Meet your lab guide

This panel stays beside your tools for the whole workshop:

- **Float or dock** — drag the title bar to move the window anywhere
  (any monitor), or use the dock button to pin it to the right edge of
  the screen so maximized apps make room for it.
- **The sidebar** lists every section and lab. A <span data-icon="video"></span> badge means the lab
  includes a video; the `~15 min` tag is a time estimate.
- Use the **font-size** and **reading-mode** controls in the toolbar if
  you're on a small VM screen.

## Track your progress

Each workshop's steps sit in a numbered row at the top of the lab, one
dot per step. Work through them in order: the button at the end of a
step names the next one, and moving on puts a check mark on the step
you leave. Your progress is saved on this machine and survives
restarts, so you can pick up exactly where you left off. (This page has
no steps: tracking starts in the first workshop.)

## Copy code from the guide

Every code block has a **copy button**: hover over the block and select
it, then paste into your tool. Try it:

```sql
SELECT 'hello from the lab guide' AS greeting;
```

## How the pieces fit

Three things run on your machine for this course, and every workshop
uses all three:

<div align="center">
<figure>
<img src="../_assets/images/lab-setup.png" alt="Metadata Editor reads tables and columns from the SampleData HSQLDB database on port 9001 through its hsqldb:sampledata connection and publishes domains to the metadata engine on the Pentaho Server; Interactive Reports in the browser sends each query to the engine, which sends SQL to SampleData through the domain's own connection; the server keeps its repository in PostgreSQL on port 5432, and the MySQL lab kit on port 3306 holds the capstone's trailhead database" width="800">
<figcaption>Metadata Editor, the Pentaho Server and the sample data</figcaption>
</figure>
</div>

* **Metadata Editor** is where you build a domain: the physical tables,
  the business model your users see, and its security. It saves the
  domain as an `.xmi` file. Its own connection to the sample data lets it
  list the tables and columns you build from.
* **The Pentaho Server** hosts the **SampleData** database (HSQLDB, on
  port 9001) and the **metadata engine**. When you publish a domain, the
  engine keeps it, and **Interactive Reports** in the User Console turns
  each column you drag into a query that the engine answers with SQL
  against SampleData.
* **PostgreSQL** is the server's own repository: its users, files and
  published domains. The server cannot finish starting without it, so
  it starts first.

The capstone models a second database, `trailhead`, in the **MySQL lab
kit**'s container. Nothing before the capstone uses it.

In the diagram, the solid arrows are the path of your work: Metadata
Editor reads SampleData and publishes to the engine, and each query from
Interactive Reports reaches SampleData as SQL through the domain's own
connection. The dashed arrow is the server keeping what it holds, the
published domains among it, in its PostgreSQL repository.

> **Under the hood:**
>
> #### The domain carries its connection with it
>
> A Mondrian schema names no database, but a metadata domain does: its
> connection (host, port, database, user and driver, or a JNDI name) is
> saved in the `.xmi` file and published with the domain. On the
> server, the metadata engine opens that same connection to answer
> Interactive Reports.
>
> **Why it matters:** the connection's name and settings must make sense
> on the server too, which is why the workshops use `localhost:9001`, an
> address the server and Metadata Editor both reach on this machine.

## Set up your environment

Launch your main tool straight from the guide:

<button data-launch="metadata-editor">Start Pentaho Metadata Editor</button>

If it is already open from a previous session, the button focuses
the running window instead of starting a second copy.

### Do you need to set anything up?

:::: tabs

### I'm using a lab VM

Nothing to install. Everything is already on the machine, and the
Pentaho Server and its repository database start by themselves with it.

> **Note:** **Give the Pentaho Server time to load.** It starts its
> repository database first and then needs **3 to 5 minutes** to finish,
> so it will not answer the moment you sign in. **Check your
> environment**, directly below these tabs, shows **Starting up** while it
> loads and turns green by itself. **Please don't click anything or
> restart anything while it says so**: that only makes the server start
> again from the beginning.

If something looks wrong later, tell your instructor rather than
reinstalling anything.

### I'm installing on my own machine

Everything here is a **one-off setup** for your own laptop. Work through
the tabs in order — the panel underneath checks your machine as you go,
so you can always see what is left. The last tab is a reference card of
every port and login, for when you come back to it later.

> **Note:** The workshops need no containers. Your domains model the
> Steel Wheels sample data that the Pentaho Server's bundled HSQLDB
> serves, and they publish back to the same server for Interactive
> Reports. Only the capstone uses the MySQL lab kit; its page shows how
> to check it is running.

::: tabs

### 1. Start the Pentaho Server

The server ships with Pentaho, so there is nothing to install: you
start it. It brings up the User Console, Interactive Reports, the sample
data and the target you publish your domains to.

1. Start the server's repository database, PostgreSQL, if it is not
   already running. An installer-based install runs it as the
   **Pentaho Solution Repository** service. In PowerShell, run:

   ```powershell
   Start-Service "Pentaho Solution Repository"
   ```

   On an install with no such service, start it with PostgreSQL's own
   tool instead:

   ```powershell
   & "C:\Pentaho\postgresql\bin\pg_ctl.exe" start -D "C:\Pentaho\postgresql\data" -l "$env:TEMP\postgresql.log"
   ```

2. Start the server. In PowerShell, run:

   ```powershell
   C:\Pentaho\server\pentaho-server\start-pentaho.bat
   ```

3. Wait for it to finish loading: 3 to 5 minutes. Leave the **Tomcat**
   window open, because closing it stops the server.

4. Browse to **http://localhost:8080/pentaho**.

   > **Success:** Checkpoint: the User Console's sign-in page opens.

To shut it down later, run `stop-pentaho.bat` from the same folder.

<details>
<summary>Troubleshooting</summary>

**The server never finishes starting.** Its repository database is
down. The **Pentaho repository database** row in the panel below is
red: start PostgreSQL (step 1), then stop and start the server again.
A server started before its database does not recover by itself.

**The browser cannot reach localhost:8080.** The server is still
starting, or it stopped. Watch the **Tomcat** window for
`Server startup in ... ms`, then retry.

**"Port 8080 already in use".** Something else has the port, often a
second Pentaho Server or another Tomcat. Stop it, or change the port in
`tomcat\conf\server.xml`.

**The window closes immediately.** The server could not find a usable
Java. It checks `PENTAHO_JAVA_HOME` first, then the bundled
`C:\Pentaho\java`, and only then `JAVA_HOME` (a JDK newer than 21 stops
the server). Check them with `echo $env:PENTAHO_JAVA_HOME, $env:JAVA_HOME`,
and see `set-pentaho-env.bat` in the same folder for what the server
expects.

</details>

### 2. Start Metadata Editor

1. Install the Pentaho design tools to `C:\Pentaho`, so Metadata Editor
   is at `C:\Pentaho\design-tools\metadata-editor\metadata-editor.bat`.

2. Start it with the **Start Pentaho Metadata Editor** button at the top
   of this page, and let it finish loading.

3. Check that it has the HSQLDB driver it connects to SampleData with:
   `hsqldb-2.3.2.jar` in
   `C:\Pentaho\design-tools\metadata-editor\libext\JDBC`. Metadata Editor
   ships it there; the **HSQLDB driver (Metadata Editor)** row in the
   panel below checks it for you.

You make the connection itself in
[OrdersME](../04-domains-and-models-ordersme/guide.md), with the values
in **Check the database** below. Publishing a domain asks for a **Web
Publish URL**: keep the pre-filled
**http://localhost:8080/pentaho/plugin/data-access/api/metadata/import**,
and sign in as `admin` / `password`.

<details>
<summary>Troubleshooting</summary>

**The Start button does nothing.** The button runs
`C:\Pentaho\design-tools\metadata-editor\metadata-editor.bat`. Install
Metadata Editor there, or ask your instructor to point the launcher at
your install.

**The connection test fails.** SampleData is an HSQLDB database that
starts *with the Pentaho Server*, on port 9001. Start the server first
(tab 1), wait for the sign-in page, then test the connection again.

**Publish fails with 401.** Check the Server Userid and Server Password
(`admin` / `password`). Metadata Editor 11 has no separate publish
password.

**Publish fails with 404.** The Web Publish URL is wrong: it must end
`/plugin/data-access/api/metadata/import`, with the hyphen.

</details>

### 3. Check it worked

The **Check your environment** panel below these tabs already ran this
for you, but you can run it yourself at any time. From the
**`provisioning`** folder of your install, in PowerShell, run:

```powershell
.\check-environment.ps1 -Mode server -Course ME
```

It walks the prerequisites in dependency order and prints the exact
command that fixes anything missing. A red line early on usually makes
the later ones meaningless, so fix from the top down.

When everything is green you are ready to start Module 1.

<details>
<summary>What it checks</summary>

| Check | Why the course needs it |
| --- | --- |
| Java (for the Pentaho Server) | The server runs on Java 21: Pentaho's bundled `C:\Pentaho\java`, or `PENTAHO_JAVA_HOME` |
| Metadata Editor | The tool the whole course teaches, at `C:\Pentaho\design-tools\metadata-editor` |
| HSQLDB driver (Metadata Editor) | Without it Metadata Editor cannot reach SampleData |
| Interactive Reports (server plugin) | Every workshop tests its published domain in an Interactive Report |
| MySQL driver (Metadata Editor) | Amber until the capstone, whose first stage installs it |
| Trailhead database (MySQL) | The capstone's data, in the MySQL lab kit; amber when the kit is not running |
| Pentaho repository database | PostgreSQL; the server cannot start without it |
| Pentaho Server and its URL | Hosts the sample data and the metadata engine; green once the sign-in page answers |
| HSQLDB (Steel Wheels sample data) | The data every domain models; green once it answers a query |
| Ollama | Optional: powers the in-app chat assistant |

</details>

### 4. Lab files on disk

The installer has already laid this course's lab files out under
**`C:\Workshop-ME-Associate`**, one folder per module, so you can
import a domain into Metadata Editor directly instead of downloading it
from the guide first. Every lab's **Lab Files** section names the files.

<details>
<summary>The folder isn't there</summary>

It is an optional component, so a **Minimal (app only)** install, or a
cleared **Workshop lab files** box, skips it. Lay it down at any time
from the same `provisioning` folder:

```powershell
.\install-workshop.ps1
```

Safe to run whenever you want the shipped lab files back as they
shipped: it only ever adds and refreshes, and never deletes your work.

</details>

### 5. Ports and logins

Everything this course uses, in one place. All of it is local to your
machine.

> **Warning:** These are the stock Pentaho workshop credentials, and
> they are widely known. Change them on any server that is reachable
> beyond your own machine.

| Service | Address | Username | Password |
| --- | --- | --- | --- |
| Pentaho User Console and Interactive Reports | http://localhost:8080/pentaho | `admin` | `password` |
| Publishing a domain | http://localhost:8080/pentaho/plugin/data-access/api/metadata/import | `admin` | `password` |
| HSQLDB `sampledata` | `localhost:9001`, database `sampledata` | `pentaho_admin` | `password` |
| MySQL `trailhead` (capstone) | `localhost:3306`, database `trailhead` | `pentaho_admin` | `password` |
| PostgreSQL, the server's repository | `localhost:5432` | *the server's own* | *not needed in the labs* |
| Ollama — the Chat tab | `127.0.0.1:11434` | *none* | *none* |

:::

When the last tab is done, **Check your environment** below these tabs
should be all green, apart from the two capstone rows.

::::

## Check your environment

This panel probes the machine live: the Pentaho Server and the
repository database behind it, the Steel Wheels sample data, Metadata
Editor and its driver, and Interactive Reports, whichever tab above you
chose. Each row reports one of four states:

* **<span class="pcm-c-ok">Green</span>** — the check passed; that piece is present and answering.
* **<span class="pcm-c-warn">Amber</span>** — usable, but worth tidying before the session.
* **<span class="pcm-c-danger">Red</span>** — it will block a lab, and the row tells you the exact fix.
* **<span class="pcm-c-muted">Grey</span>** — skipped, because this course doesn't use it.

The rows that matter most are **HSQLDB (Steel Wheels sample data)**,
which every domain models, and **Metadata Editor** with its **HSQLDB
driver**. The two capstone rows, **MySQL driver (Metadata Editor)** and
**Trailhead database (MySQL)**, can stay amber until you reach the
capstone.

A row with a turning circle and **Starting up** is not broken: the
Pentaho Server is still loading (3 to 5 minutes), and the list checks
again by itself every few seconds. Wait for it. Only when a row is
**red** is something wrong, and then **Get my lab ready** runs the same
steps the sign-in runs and checks again.

<div data-env-check="server"></div>

> **Success:** Checkpoint: every row is green, or amber for the two capstone rows, or grey for a check this course skips.

## Check the working folders

The installer lays every lab's files out under
**`C:\Workshop-ME-Associate`**, one folder per module, in the order
the sidebar reads. Getting Started has no lab files, so the numbering
starts at `02`. A file at a lab's top level is the domain the workshop
starts from; its `solution` folder holds the finished domain.

```text
C:\Workshop-ME-Associate
├── 02-domains-models
│   ├── 03-domains-and-models-steelwheels
│   │   └── steel-wheels.xmi                     the SteelWheels domain you explore
│   ├── 04-domains-and-models-ordersme
│   │   └── solution\OrdersME.xmi
│   └── 05-domains-and-models-query-builder
│       └── OrderStarCustomer.xmi                the domain you query
├── 03-properties
│   └── 07-properties-orderstarcustomer
│       └── solution\OrderStarCustomer.xmi
├── 04-concepts
│   └── 09-concepts-concept-editor
│       ├── OrderStarCustomer.xmi
│       └── solution\OrderStarCustomer-concepts.xmi
├── 05-security-data-access
│   └── 11-security-and-data-access-row-level-security
│       ├── OrderStarCustomer-concepts.xmi
│       ├── security-order-constraints.txt       the two row-level constraints
│       └── solution\OrderStarCustomer-security.xmi
└── capstone
    ├── solution                                 your exported domain, checked for your accreditation
    └── out                                      the published domain, exported, checked too
```

The capstone is the one folder with a shape of its own: it ships
nothing, because the capstone's domain is yours to build. Its
`solution\` and `out\` folders are where the accreditation checks look,
and upgrading the course never touches them.

**Confirm the files are there**, not only the folder: open
`02-domains-models\03-domains-and-models-steelwheels` and check you can
see `steel-wheels.xmi`. An empty folder is the one thing worth catching
now rather than in the middle of a lab.

## Check the database

Every domain in the workshops models the Steel Wheels sample data in the
SampleData database. The environment panel shows **HSQLDB (Steel Wheels
sample data)** green when it answers.
[OrdersME](../04-domains-and-models-ordersme/guide.md) builds this
connection in Metadata Editor, and later workshops reuse it:

| Field | Value |
| --- | --- |
| Connection name | `hsqldb:sampledata` |
| Connection type | Hypersonic |
| Access | Native (JDBC) |
| Host Name | `localhost` |
| Database Name | `sampledata` |
| Port Number | `9001` |
| Username | `pentaho_admin` |
| Password | `password` |

The connection is saved in the domain and published with it, so the
server needs no connection of its own for these domains.

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho —
ask it anything from "what is a business view?" to "why does my
relationship not join?". A model on this machine writes the answers, and
it grounds them in a live search of the official Pentaho documentation.
Without an internet connection that search is unavailable, so only the
local model answers, without the documentation behind it.

## How this course is organized

Each section starts with an **overview page** (<span data-icon="page"></span> — background reading,
no check boxes) followed by **hands-on workshops** (<span data-icon="workshop"></span> — tracked steps).
Select a heading to open that section's page, or the chevron beside it to
expand the workshops underneath.

## The exam and your course accreditation

When you have worked through the sections, the **Associate Exam** in
the sidebar draws 40 questions from a pool of 46. It is open-book: take
your time, browse any module to refresh your memory, or ask the
assistant. Your answers are saved as you go, so leaving the page to look
something up is fine, and the explanations show afterwards so you can
learn from anything you missed. The pass mark is **80%**.

You are asked for your name, email and organization before you begin
(and your Partner ID, if you are taking it as part of the Pentaho Partner
Program); those are what your accreditation is made out to. Complete the
capstone project and pass the exam, and your **Pentaho Metadata Editor -
Associate Level** course accreditation appears on the results screen
to download. It is valid for two years, and you can come back for it
later from the same screen.

Head to the first section whenever you're ready.

---

> **Tip:** You can revisit this page any time from the sidebar.
