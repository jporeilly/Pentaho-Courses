# Before You Arrive

> **Warning:**
>
> #### Get Ready — Before You Arrive
>
> This lab session moves fast: in two hours you'll build a real data
> pipeline, from first preview to a warehouse table that tracks
> history. To make that possible, **none of the two hours is spent on
> setup** — this page gets your machine ready in advance.
>
> **What you'll do**
>
> * Confirm Pentaho Data Integration (Developer Edition) starts.
> * Start the sample MySQL database.
> * Create the working folder the labs write into.
>
> **Prerequisites:** This machine (or lab VM) with PDI installed.
>
> **Estimated Time:** 10 minutes — before the session, not during it.

> **Note:** **About the software you're using.** Pentaho Data
> Integration **Developer Edition** is free for evaluation,
> development, and learning under the Business Source License 1.1 —
> production use requires a commercial licence. Everything you build
> today is real PDI: the same designer, the same engine, the same
> transformations you'd run in production. The last lab covers what
> "production" adds.

> **Note:** **A word on analytics.** This guide reports anonymous
> usage events (pages opened, steps completed, tools launched) so we
> can see where the lab flows well and where it doesn't. No names, no
> email addresses, and nothing you type is ever sent.

## Check your environment

If you're on a provided lab VM, this panel should be all green
already. If anything is red, it tells you the exact fix.

<div data-env-check></div>

## Start Pentaho Data Integration

Click the button below. First launch can take a minute — PDI is a
full desktop designer, not a toy.

<button data-launch="spoon">Start Pentaho Data Integration</button>

You should see the **Spoon** welcome screen with an empty canvas.
Leave it open — Lab 1 starts here.

## Create the working folder

The labs write output files into one predictable place. Open a
terminal and create it:

```powershell
mkdir C:\Workshop\pdi-2hr\out
```

On Linux or macOS:

```bash
mkdir -p ~/Workshop/pdi-2hr/out
```

The lab text uses the Windows path — substitute yours if you're
elsewhere.

## Check the sample database

Lab 4 loads a table into the workshop MySQL database. Confirm it's
running — the environment panel above shows **MySQL** green, or test
from a terminal:

```powershell
mysql -h localhost -P 3306 -u pentaho_admin -ppassword -e "SELECT 1;"
```

If MySQL isn't running and you're on a lab VM, run the provided
`setup-services` script and re-check.

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

The sample database runs as a container. On a lab VM, run
`setup-services.ps1` from the scripts folder and wait for it to
report healthy, then click **Re-run checks**. On your own machine,
any MySQL 8 instance on `localhost:3306` with a user
`pentaho_admin`/`password` works — Lab 4 creates its own tables.

</details>

---

> **Tip:** That's it. When the session starts, you'll go from zero to
> a running pipeline in under ten minutes — because you did this page
> first.
