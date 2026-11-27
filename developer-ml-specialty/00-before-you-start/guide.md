# Before You Start

> **Note:**
>
> #### Get Ready — Before You Start
>
> Before the first workshop, check that your environment is ready and
> that the workshop folders and files are in place. The course trains
> and runs fraud models in Pentaho Data Integration, with Python and H2O,
> and writes the scores to a MySQL database, and **none of the lab time
> should go on setup**: this page does it in advance.
>
> **What you'll do:**
>
> * Learn how the guide works: progress, copy buttons, the assistant.
> * Confirm Pentaho Data Integration starts and MySQL and Kafka answer.
> * Check the workshop folder: *C:\Workshop-ML-Specialty*
>
> **Prerequisites:** Familiarity with Pentaho Data Integration transformations and jobs: steps, hops and database connections.
>
> **Estimated time:** 5 minutes on a lab VM; about 25 minutes on your own machine

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

## Set up your environment

Launch your main tool straight from the guide:

<button data-launch="spoon">Start Pentaho Data Integration</button>

If it is already open from a previous session, the button focuses
the running window instead of starting a second copy.

### Do you need to set anything up?

:::: tabs

### I'm using a lab VM

Pentaho Data Integration, MySQL and Kafka are installed and start with
the machine: the guide checked them when it opened.

One thing is yours to do, once: the Python environment the course uses
lives in your own home folder, so you create it, and the `fraud`
database the scores go to, in
[Prerequisite Tasks](../02-prerequisite-tasks/guide.md).

If something looks wrong later, tell your instructor rather than
reinstalling anything.

### I'm installing on my own machine

Everything here is a **one-off setup** for your own laptop. Work through
the tabs in order — **Check your environment**, below these tabs,
checks your machine as you go, so you can always see what is left. The
last tab is a reference card of ports and logins, for when you come back
to it later.

::: tabs

### 1. Pentaho Data Integration

1. Install Pentaho Data Integration 11 to `C:\Pentaho`, so Spoon lives at:

   ```text
   C:\Pentaho\design-tools\data-integration\spoon.bat
   ```

2. The course runs Pentaho Data Integration on the **Java 21** it ships
   with, which is where H2O is proven to start.

3. From the Credit Card workshop on, the transformations write to MySQL,
   and Pentaho Data Integration 11 does not ship a MySQL JDBC driver.
   The course installer puts one in
   `C:\Pentaho\design-tools\data-integration\lib`; restart Spoon if it
   was open when you installed the course.

4. Start Spoon once from the button above these tabs.

### 2. Container runtime

MySQL and Kafka run as containers under **Podman Desktop**.

1. Install Podman Desktop:

   ```powershell
   winget install -e --id RedHat.Podman-Desktop
   ```

2. Open it once and let it create its machine. When it offers, accept,
   and select **rootful** if it asks.

3. Check the machine is up:

   ```powershell
   podman machine list
   ```

<details>
<summary>Troubleshooting</summary>

**`podman` is not recognized.** PATH updates only reach new terminals —
close and reopen PowerShell.

**The machine won't start.** Podman machines run inside WSL 2 — run
`wsl --update`, reboot if it asks, then start the machine from Podman
Desktop.

**Everything worked yesterday but not today.** The machine does not
start with Windows by default — open Podman Desktop and start it, or
run `podman machine start`.

</details>

### 3. Python, MySQL and Kafka

[Prerequisite Tasks](../02-prerequisite-tasks/guide.md) sets up the rest,
on a lab VM and on your own machine alike:

- **Python 3.11+** with H2O, pandas, NumPy, Matplotlib, Py4J and
  JupyterLab, in a virtual environment named `h2o-env`.
- **MySQL**, the MySQL kit's `sampledata-mysql` container, with the
  course's `fraud` database.
- **Kafka**, the Streaming kit's `pcm-kafka` container, for Real-time
  Scoring.
- Optionally, a Google account, for **Google Colab**.

### 4. Ports and logins

Everything this course uses, all local to your machine:

| Service            | Address                   | Login             |
| ------------------ | ------------------------- | ----------------- |
| MySQL kit (`sampledata-mysql`) | `localhost:3306` | `root` / `password`; the course's `fraud_user` / `password` |
| Kafka (`pcm-kafka`) | `127.0.0.1:9092` (use the IP, not `localhost` - Windows resolves that to IPv6 first) | *none* |
| H2O scoring service | `http://127.0.0.1:54400` (Scoring as a Service starts it) | *none* |
| JupyterLab         | the address it prints when it starts (usually http://localhost:8888) | the token in that address |
| Ollama — the Chat tab | `127.0.0.1:11434`      | *none*            |

> **Caution:** These are the stock workshop credentials and are widely
> known. Change them on any machine reachable beyond your own.

:::

When the last tab is done, **Check your environment** below these tabs
should be all green.

::::

## Check your environment

This panel probes the machine live — Pentaho Data Integration and its
Java, MySQL, Kafka, the `h2o-env` Python environment and the container
tooling that runs them — whichever tab above you chose. Each row reports
one of four states:

* **<span class="pcm-c-ok">Green</span>** — the check passed; that piece is present and answering.
* **<span class="pcm-c-warn">Amber</span>** — usable, but worth tidying before the session.
* **<span class="pcm-c-danger">Red</span>** — it will block a lab, and the row tells you the exact fix.
* **<span class="pcm-c-muted">Gray</span>** — skipped, because this course doesn't use it.

The **Python environment (h2o-env)** row stays red until you have run
[Prerequisite Tasks](../02-prerequisite-tasks/guide.md): every workshop
runs its Python.

<div data-env-check="ml"></div>

> **Success:** Checkpoint: every row is green, or gray for a check this course skips. An amber row is usable, but worth tidying.

## Check the working folders

The installer lays every lab's files out under
**`C:\Workshop-ML-Specialty`**, one folder per section, in the order
the sidebar reads. The overview page has no lab files; every workshop
has its own folder. Each workshop's **Solution** section quotes it.

```text
C:\Workshop-ML-Specialty
├── 02-machine-learning
│   ├── 02-prerequisite-tasks
│   │   ├── fraud_schema.sql              the fraud database, its user and tables
│   │   ├── run-podman-streaming.ps1      starts Kafka
│   │   └── start-h2o-service.ps1         the H2O scoring service
│   ├── 03-automl
│   │   ├── credit_card_fraud.ipynb       the notebook, for JupyterLab or Colab
│   │   └── solution                      the finished answers, ready to run
│   └── 04-credit-card
│       └── solution
├── 03-ml-in-production
│   ├── 05-monitoring-and-tuning
│   │   └── solution
│   ├── 06-scoring-as-a-service
│   │   └── solution
│   └── 07-real-time-scoring
│       └── solution
└── capstone
    ├── data                              what the capstone reads, shipped
    ├── solution                          your transformations
    └── out                               your output, checked for your accreditation
```

Every lab's `solution` folder holds the finished transformations and
jobs. Open one in Pentaho Data Integration to compare it with your own;
your work at the lab root is never touched.

**Confirm the files are there**, not only the folder: open
`02-machine-learning\04-credit-card` and check you can see
`transaction_details.csv` and a `solution` folder. An empty folder is
the one thing worth catching now rather than in the middle of a lab.

> **Note:** Upgrading the app refreshes the shipped lab files and never
> touches `capstone\solution\` or `capstone\out\`. Your own work is
> safe, so you can install a new version mid-course.

## Check the database

From the Credit Card workshop on, the scores go to MySQL: the MySQL
kit's `sampledata-mysql` container, which `C:\MySQL\run-podman-mysql.ps1`
starts. To see that it runs, in PowerShell, run:

```powershell
podman ps --filter name=sampledata-mysql
```

> **Success:** Checkpoint: one row, `sampledata-mysql`, with a **STATUS** that starts with `Up` and port `3306` in **PORTS**.

|              |                     |
| ------------ | ------------------- |
| Container    | `sampledata-mysql`  |
| Host         | `localhost`         |
| Port         | `3306`              |
| Admin login  | `root` / `password` |

[Prerequisite Tasks](../02-prerequisite-tasks/guide.md) adds the `fraud`
database and its user, `fraud_user` / `password`, with
`fraud_schema.sql`. If a connection times out with `localhost`, set
**Host Name** to `127.0.0.1`: it reaches the same server.

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho —
ask it anything from "what does this step do?" to "why did my
transformation fail?". A model on this machine writes the answers, and
it grounds them in a live search of the official Pentaho documentation.
Without an internet connection that search is unavailable, so only the
local model answers, without the documentation behind it.

## How this course is organized

Each section starts with an **overview page** (<span data-icon="page"></span> — background reading,
no check boxes) followed by **hands-on workshops** (<span data-icon="workshop"></span> — tracked steps).
**Machine Learning** sets up Python and trains the first models;
**ML in Production** monitors, serves and streams them. The last page
is the capstone.

## The exam and your course accreditation

When you have worked through the sections, the **PDI Machine Learning
Specialty Exam** in the sidebar draws 30 questions from a pool of 52. It
is open-book — take your time, browse any page to refresh your memory,
or ask the assistant. Your answers are saved as you go, so leaving the
page to look something up is fine, and the explanations show afterwards
so you can learn from anything you missed. The pass mark is **80%**.

You are asked for your name, email and organization before you begin
(and your Partner ID, if you are taking it as part of the Pentaho Partner
Program); those are what your accreditation is made out to. Pass the
exam, and have the capstone's checks pass, and your **Pentaho Developer
- Machine Learning - Specialty Level** course accreditation appears on
the results screen to download. It is valid for two years, and you can
come back for it later from the same screen.

The capstone, [Capstone: Nightly Fraud Screening](../08-capstone-nightly-fraud-screening/guide.md),
is a project of your own: retrain a fraud model every night on the
latest history, stop the run when the model is too weak to trust, and
write the investigators a review queue of tonight's riskiest orders.

Head to the first section whenever you're ready.

---

> **Tip:** You can revisit this page any time from the sidebar.
