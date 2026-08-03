# Getting Started

> **Note:**
>
> ### Welcome!
 
> This page highlights how to get the best user experience using this lab guide specifically designed for working with Pentaho Report Designer.
> Taking five minutes here will make every subsequent lab smoother.

## Meet your Lab Guide

This panel will stay beside Pentaho Report Designer throughout the workshop:

- **Float or dock** — drag the title bar anywhere on your screen, including across monitors, or use the dock button to pin it to the right edge so that maximized applications automatically adjust their size to accommodate it.
- **The sidebar** lists every section and lab. A ▶ badge indicates a video is available for that lab; `~15 min` tags provide estimated completion times.

## Track Your Progress

Every numbered heading, such as this one, represents a **step** with an associated checkbox — mark it off when you complete the step. Your progress will be saved on your machine and persist through restarts, allowing you to resume exactly where you left off after a break.

## Copy Code with One Click

Each code block includes a **copy button** — hover over the block and click it to copy the content, then paste it into Pentaho Report Designer. Try this out:

```sql
SELECT 'hello from the lab guide' AS greeting;
```

## Set up your environment

Launch your main tool straight from the guide:

<button data-launch="prd">Start Pentaho Report Designer</button>

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
logins, and the panel underneath checks your machine as you go.

> **Note:** This course needs no containers, no MySQL and no extra
> downloads. Report Designer is the tool you work in; the Pentaho
> Server supplies the sample data behind every report, and receives
> the reports you publish in Module 9.

::: tabs

### 1. Start the Pentaho Server

Do this first, even though the course is about Report Designer. The
server hosts the **Steel Wheels sample data** that every report in this
course queries — it is not only for publishing.

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

**"No data" or an empty preview in Report Designer.** The sample data
lives in the server's bundled HSQLDB on port 9001 and starts *with*
the server — if the server is not running, the SampleData connection
has nothing to talk to. Start it and try the query again.

**The window closes immediately.** Almost always `JAVA_HOME` is unset
or points at the wrong JDK. Check it with `echo $env:JAVA_HOME`, and
see `set-pentaho-env.bat` in the same folder for what the server
expects.

**"Port 8080 already in use".** Something else has the port — often a
second Pentaho Server, or another Tomcat. Stop it, or change the port
in `tomcat\conf\server.xml`.

</details>

### 2. Start Report Designer

Report Designer is a desktop application that ships with Pentaho — you
start it, you do not install it separately.

<button data-launch="prd">Start Pentaho Report Designer</button>

Or run it yourself:

```powershell
C:\Pentaho\design-tools\report-designer\report-designer.bat
```

It takes a few moments to open — it is a Java application, and the
first start is the slowest.

<details>
<summary>Troubleshooting</summary>

**The launcher button does nothing.** It runs
`C:\Pentaho\design-tools\report-designer\report-designer.bat`. If your
Pentaho install is somewhere else, either install to `C:\Pentaho` or
edit `launchers.prd` in the course's `course.json`.

**Report Designer opens but the SampleData connection fails.** That is
the server, not Report Designer — see the previous tab.

</details>

### 3. Publishing (Module 9)

Module 9 publishes finished reports to the Pentaho Server. Nothing
extra to install — you just need the server running from tab 1, and
the credentials below.

1. In Report Designer choose **File → Publish**, or the **Publish**
   icon in the main toolbar.

2. Sign in as **`admin`** with the password **`password`**.

3. Published reports land under **Public > Training**, and you can
   open them in the User Console at
   **http://localhost:8080/pentaho**.

### 4. Ports and logins

Everything this course uses, in one place. All of it is local to your
machine.

| Service                    | Address                                   | Username       | Password   |
| -------------------------- | ----------------------------------------- | -------------- | ---------- |
| Pentaho Server / publishing | http://localhost:8080/pentaho             | `admin`        | `password` |
| Steel Wheels sample data   | `jdbc:hsqldb:hsql://localhost/sampledata` | `pentaho_user` | `password` |
| Ollama — the Chat tab      | `127.0.0.1:11434`                         | *none*         | *none*     |

You will not normally type the sample-data details: Report Designer
ships a **SampleData (Hypersonic)** connection you pick from a list,
and it already carries them.

> **Caution:** These are the stock Pentaho workshop credentials and are
> widely known. Change them on any server that is reachable beyond
> your own machine.

:::

<div data-env-check="server"></div>

Nothing else is required.

::::

## Ask the AI Assistant

The **Chat** tab in the bottom panel provides answers to questions about Pentaho, grounded in official documentation — whether it's "what does this step do?" or "why did my report fail?". The assistant runs locally, so it works even when your VM is offline.

## Course Organization Overview

Each section begins with an **overview page** (📄) providing background information and no checkboxes, followed by **hands-on workshops** (🧪) where you'll complete tracked steps. Start the first section whenever you're ready to begin.

---

> **Tip:** You can revisit this lab guide anytime from the sidebar.
Insert
Copy