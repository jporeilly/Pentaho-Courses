# Before You Start

> **Note:**
>
> #### Get Ready — Before You Start
>
> Before we start the course, let's check that your environment is
> ready and that you have access to the Workshop folders and files.
> The session moves fast: in two hours you'll build a real data
> pipeline, from first preview to a warehouse table that tracks
> history, and **none of that time is spent on setup** — this page
> does it in advance.
>
> **What you'll do**
>
> * Confirm Pentaho Data Integration (Developer Edition) starts.
> * Check the sample MySQL database is up and running.
> * Check the working folder: > **Prerequisites**
 
The Pentaho Data Integration (PDI) 2-hour workshop guide assumes you have the following:
 
- Familiarity with the basics of data integration
- Knowledge of the Windows operating system and its command prompt
- Access to a computer with a Windows operating system
- A valid installation of the PDI software

> 
 **Getting Started**
 
To begin the workshop, ensure you have the correct PDI installation directory:

```text
C:\Workshop\pdi-2hr
```
>
 **Estimated Time:** 5 minutes — before the session.

> **Note:** **About the software you're using.** Pentaho Data
> Integration **Developer Edition** is free for evaluation,
> development, and learning under the Business Source License 1.1 —
> production use requires a commercial license.
> 
> **Version:** 11.0.0.2-294

> **Note:** **A word on analytics.** This guide reports anonymous
> usage events (pages opened, steps completed, tools launched, using [G4 measurement protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)) so we
> can see where the lab flows well and where it doesn't. No names, no
> email addresses, and nothing you type is ever sent - only kept in-session memory.

## Check your environment

This panel probes the machine live — PDI, the MySQL container, and
the container tooling that runs it. Each row reports one of four states:

* **Green** — the check passed; that piece is present and answering.
* **Amber** — usable, but worth tidying before the session.
* **Red** — it will block a lab, and the row tells you the exact fix.
* **Grey** — skipped, because this course doesn't use it.

The one that matters most is **MySQL** — Lab 4 loads a table into it.

<div data-env-check="tryit"></div>

## Start Pentaho Data Integration

Click the button below to launch Pentaho Data Integration. First launch
can take a minute.

<button data-launch="spoon">Start Pentaho Data Integration</button>

You should see the **Spoon** welcome screen with an empty canvas.
Leave it open — Lab 1 starts here.
<figure>

![Welcome Screen](../_assets/images/1788267733090.png)

<div align="center">
<figcaption><em>Pentaho Developers Edition</em></figcaption>
</div>
</figure>

## Check the working folders

Your working area follows the course outline, grouped into three
sections, plus a shared `out\` for everything the pipelines write:

```text
C:\Workshop\pdi-2hr
├── 02-see-it-work
│   ├── 01-your-first-win          Lab 1
│   └── 02-build-the-pipeline      Lab 2
├── 03-make-it-yours
│   ├── 03-enrich-and-join         Lab 3
│   └── 04-track-history           Lab 4
├── 04-see-it-scale
│   ├── 05-one-pipeline-many-files Lab 5
│   └── 06-your-data               Bring Your Own Data
└── out                            everything the pipelines write
```

**Confirm the files are there**, not just the folder — open
`02-see-it-work\01-your-first-win` and check you can see
`win_preview.ktr` and `sales_20260101.csv`. Lab 1 opens that
transformation in the first minute, so an empty folder is the one
thing worth catching now rather than then.

Each lab names the folder its files live in. The lab text uses the
Windows paths — substitute yours if you're elsewhere.

## Check the database

Workshop - Track History with One Step loads a dimension table into MySQL (seeded from a JSON file). 
The environment panel above shows **MySQL** green when the container is up and running.

These are: **Connection Details for workshop - Track History with One Step**

You don't need to provide the connection details for Lab 4 at this stage, but it's useful to know what they are.

| | |
| --- | --- |
| Host | `localhost` |
| Port | `3306` |
| Database | `warehouse` |
| Username | `pentaho_admin` |
| Password | `password` |

### Troubleshooting

<details>

<summary>Spoon doesn't start / closes immediately</summary>

PDI needs a Java runtime. Developer Edition bundles one; if you
installed manually, ensure `PENTAHO_JAVA_HOME` points at a Java 11+
JDK and start it via **Spoon.bat** (Windows) or **spoon.sh**
(Linux/macOS), not the jar directly.

</details>

<details>

<summary>The environment panel shows MySQL red</summary>

The database runs in a container. Run the following script:
C:\MySQL\setup-services.ps1, wait for it to report healthy, then click **Re-run checks**. 
test it from a terminal:

```powershell
mysql -h localhost -P 3306 -u pentaho_admin -ppassword -e "SELECT 1;"
``` 
Lab 4 creates its own tables, so no seeded sample data is required.

</details>

---

