# Before You Start

<!--
  AUTHOR NOTES (delete before publishing).

  This orientation lab teaches the learner how to use the lab guide
  itself, so most courses can keep it almost as-is. Customise the
  "Set up your environment" step and anything marked REPLACE.

  The "Check ..." sections follow pdi-2hr-lab's Before You Start: the
  live environment panel, the working-folder diagram and the database
  card. Delete the ones a course has no use for (no workshop folder,
  no database), rather than leaving a card that describes nothing.
-->

> **Note:**
>
> #### Get Ready — Before You Start
>
> Welcome! This first lab shows you how to work with this guide and
> checks that your machine is ready: the tools start, the services
> answer and the lab files are where the workshops expect them. Five
> minutes here means no lab time is spent on setup.
>
> **What you'll do:**
>
> * Learn how the guide works: progress, copy buttons, the assistant.
> * Check your environment with the live panel.
> * Confirm the workshop folder and its files are in place.
>
> **Prerequisites:** REPLACE - what the learner should already know.
>
> **Estimated Time:** 5 minutes

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

Each workshop's steps sit in a numbered row at the top of the lab, one
dot per step. Work through them in order: the button at the end of a
step names the next one, and moving on puts a check mark on the step
you leave. Your progress is saved on this machine and survives
restarts, so you can pick up exactly where you left off. (This page has
no steps: tracking starts in the first workshop.)

## Copy code with one click

Every code block has a **copy button** — hover over the block and click
it, then paste into your tool. Try it:

```sql
SELECT 'hello from the lab guide' AS greeting;
```

## Set up your environment

<!-- REPLACE the launcher + the service list below with this course's
     actual setup. Keep the two-tab split: most learners are on a
     provisioned lab VM and need nothing, while self-installers need
     the full sequence. Launcher names must exist in course.json's
     "launchers" map. -->

Launch your main tool straight from the guide:

<button data-launch="spoon">Start Pentaho Data Integration</button>

If a <dfn>transformation</dfn> is already open from a previous session,
the button focuses the running window instead of starting a second copy.

### Do you need to set anything up?

::: tabs

### I'm using a lab VM

Nothing to do — everything is installed and running already, and the
services start with the machine.

If something looks wrong later, tell your instructor rather than
reinstalling anything.

### I'm installing on my own machine

Start the workshop services from the repository root:

```powershell
scripts\setup-services.ps1
```

Then check them at any time:

```powershell
scripts\check-environment.ps1
```

It prints what is running and the exact command to fix anything that
is not. See `workshop-services/README.md` for detail.

:::

## Check your environment

<!-- The live panel runs check-environment.ps1, so keep it only in a
     course whose installer ships the workshop tooling. Add
     data-env-check="streaming" to include the MQTT/AMQP brokers. -->

This panel probes the machine live: the tools, the service containers
and the container tooling that runs them. Each row reports one of four
states:

* **<span class="pcm-c-ok">Green</span>** — the check passed; that piece is present and answering.
* **<span class="pcm-c-warn">Amber</span>** — usable, but worth tidying before you start.
* **<span class="pcm-c-danger">Red</span>** — it will block a lab, and the row tells you the exact fix.
* **<span class="pcm-c-muted">Grey</span>** — skipped, because this course doesn't use it.

<div data-env-check></div>

## Check the working folders

<!-- REPLACE the root with this course's workshop folder
     (workshopRoot() in scripts/build-workshop-dir.mjs) and the tree with
     a slice of the real one: `node scripts/build-workshop-dir.mjs
     --course <id> --dry-run` lists it. Delete this section if the
     course has no workshop folder. -->

The installer lays the lab files out under **`C:\Workshop-REPLACE`**,
one folder per section, in the order the sidebar reads. Each workshop
quotes the folder its files live in.

```text
C:\Workshop-REPLACE
├── 01-first-section
│   └── 01-first-workshop
│       ├── orders.txt            the lab's data: open and read these
│       └── solution              the finished answer, ready to run
│           ├── orders.txt        its own copy of the data
│           └── tr_orders.ktr
├── 02-second-section
│   ├── 01-sub-section
│   │   └── 02-second-workshop
│   │       └── ...
│   └── 02-sub-section
│       └── ...
└── capstone
    ├── data                      what the capstone reads, shipped
    ├── solution                  your transformations and jobs
    └── out                       your output, checked for your accreditation
```

Every `solution` folder holds a **complete, working** solution: the
transformations and jobs plus their own copy of the data they read,
so you can run one to see the expected result without touching your
own work at the lab root.

**Confirm the files are there**, not just the folder: open the first
workshop's folder and check you can see its data and its `solution`
folder. An empty folder is the one thing worth catching now rather
than in the middle of a lab.

## Check the database

<!-- REPLACE with the course's database, or delete this section. -->

The database labs use the Steel Wheels sample in the MySQL container.
The environment panel shows **MySQL** green when it is up. You don't
need these details yet, but this is what every workshop connects with:

|          |                 |
| -------- | --------------- |
| Host     | `localhost`     |
| Port     | `3306`          |
| Database | `sampledata`    |
| Username | `pentaho_admin` |
| Password | `password`      |

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho,
grounded in the official docs — ask it anything from "what does this
step do?" to "why did my transformation fail?". It runs on a local
model, so it works even when the VM is offline.

## How this course is organized

Each section starts with an **overview page** (<span data-icon="page"></span> — background reading,
no checkboxes) followed by **hands-on workshops** (<span data-icon="workshop"></span> — tracked steps).
A bigger section groups its workshops into **sub-sections**: click the
heading to open that section's page, or the chevron beside it to expand
the workshops underneath. Head to the first section whenever you're
ready.

## The exam and your course accreditation

<!-- REPLACE the pass mark below to match exam.json's `passMark`, or
     DELETE this whole section if the course has no exam.

     If the course does not award an accreditation (no
     `completionCertificate` in course.json, or an anonymous check with
     `intake.collectCandidate: false` — the try-it lab), delete the
     second paragraph as well. Do not leave it in: promising an
     accreditation the course never issues is the one thing here a
     learner will notice.

     Levels 1 and 2 award a COURSE ACCREDITATION, for completing the
     capstone project and passing the exam. Certification is level 3
     only: in a level 3 course, say "certification" instead, here and
     in the heading. -->

When you have worked through the sections, the **Exam** in the sidebar
checks what you have picked up. It is open-book — take your time, browse
any section to refresh your memory, or ask the assistant. Your answers
are saved as you go, so leaving the page to look something up is fine,
and the explanations show afterwards so you can learn from anything you
missed. The pass mark is **80%**.

You are asked for your name, email and organization before you begin
(and your Partner ID, if you are taking it as part of the Pentaho Partner
Program); those are what your accreditation is made out to. Complete the
capstone project and pass the exam, and your **course accreditation**
appears on the results screen to download. It is valid for two years,
and you can come back for it later from the same screen.

## Troubleshooting <!-- no-step -->

<details>

<summary>The tool doesn't start, or closes immediately</summary>

The Pentaho tools need a Java runtime. Each install bundles one; if
`PENTAHO_JAVA_HOME` is set, it must point at a Java 21 runtime (the
bundled one is in `C:\Pentaho\java`), because it is read before
anything else.

</details>

<details>

<summary>The environment panel shows a service red</summary>

The services run as containers, and most problems clear by recreating
them. Run the setup script again and wait for it to report every
container healthy:

```powershell
scripts\setup-services.ps1
```

Then select **Re-run checks** on the panel.

</details>

<details>

<summary>The workshop folder isn't there</summary>

It is an optional component of the installer. Lay it down at any time
from the install's `provisioning` folder:

```powershell
.\install-workshop.ps1
```

It only ever adds and refreshes the shipped files, and never deletes
your work.

</details>

---

> **Tip:** You can revisit this lab any time from the sidebar.
