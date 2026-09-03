# Before You Arrive

> **Warning:**
>
> #### Get Ready — Before You Arrive
>
> This lab session moves fast: in two hours you'll build a real data
> pipeline, from first preview to a warehouse table that tracks
> history. To make that possible, **none of the two hours is spent on
> setup** — this page checks your machine is ready in advance.
>
> **What you'll do**
>
> * Confirm Pentaho Data Integration (Developer Edition) starts.
> * Check the sample MySQL database is up and running.
> * Check the working folder: C:\Workshop\pdi-2hr
>
> **Estimated Time:** 10 minutes — before the session.

> **Note:** **About the software you're using.** Pentaho Data
> Integration **Developer Edition** is free for evaluation,
> development, and learning under the Business Source License 1.1 —
> production use requires a commercial licence. Everything you build
> today is real PDI: the same designer, the same engine, the same
> transformations you'd run in production. The last lab covers what
> "production" adds.
> 
> **Version:** 11.0.0.2-294

> **Note:** **A word on analytics.** This guide reports anonymous
> usage events (pages opened, steps completed, tools launched, using [G4 measurement protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)) so we
> can see where the lab flows well and where it doesn't. No names, no
> email addresses, and nothing you type is ever sent - only kept in-session memory.

## Check your environment

This panel probes the machine live — PDI, the MySQL container, and
the container tooling that runs it. It should be all green; anything red
tells you the exact fix. The one that matters most is **MySQL** — Lab 4 loads a table into it.

<div data-env-check="tryit"></div>

## Start Pentaho Data Integration

Click the button below. First launch can take a minute ..

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

Your working area mirrors the course outline — one folder per
workshop, plus a shared `out\` for everything the pipelines write.
Checkout the following folder: C:\Workshop\pdi-2hr

Each lab tells you which folder its downloads belong in — matching
what you see in the course sidebar. The lab text uses the Windows
paths — substitute yours if you're elsewhere.

## Check the database

Lab 4 loads a dimension table into MySQL (no sample data needs loading). 
The environment panel above shows **MySQL** green when the container is up.

## Troubleshooting

<details>

<summary>Spoon doesn't start / closes immediately</summary>

PDI needs a Java runtime. Developer Edition bundles one; if you
installed manually, ensure `PENTAHO_JAVA_HOME` points at a Java 11+
JDK and start it via **Spoon.bat** (Windows) or **spoon.sh**
(Linux/macOS), not the jar directly.

</details>

<details>

<summary>The environment panel shows MySQL red</summary>

The database runs as a container. Run the following script:
C:\MySQL\setup-services.ps1, wait for it to report healthy, then click **Re-run checks**. 
test it from a terminal:

```powershell
mysql -h localhost -P 3306 -u pentaho_admin -ppassword -e "SELECT 1;"
``` 
Lab 4 creates its own tables, so no seeded sample data is required.

</details>

---
