# Before You Start

> **Note:**
>
> #### Get Ready — Before You Start
>
> This course installs Pentaho 11.0 from its archive packages onto a
> Linux server, so the labs run on the machine you install onto, not on
> a ready-made server. Check that the server has what the install needs
> **before** the first lab: none of the lab time should go on finding
> out that a package repository is unreachable or the disk is too small.
>
> **What you'll do:**
>
> * Learn how the guide works: progress, copy buttons, the assistant.
> * Check the Ubuntu server: version, `sudo`, memory, disk and internet access.
> * Find out what the exam covers.
>
> **Prerequisites:**
>
> * An Ubuntu 24.04 LTS server (or VM) and an account with `sudo`.
> * Outbound internet access: the labs install Java, PostgreSQL and
>   pgAdmin from package repositories, and the Plugin Manager downloads
>   from `download.pentaho.com`.
> * The 11.0 packages from the Pentaho Customer Portal (see
>   [Pentaho Support Portal](../02-installation-getting-started-pentaho-support-portal/guide.md)),
>   and a license for the Enterprise plugins.
>
> **Estimated time:** 5 minutes

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
it, then paste into your terminal. Try it:

```bash
echo "hello from the lab guide"
```

## Set up your environment

### Do you need to set anything up?

::: tabs

### I'm using a lab VM

Nothing to install. The lab VM is a clean Ubuntu 24.04 server with a
`sudo` account: installing the Pentaho platform on it **is** this
course. Run the checks below to confirm it is ready.

If a check fails on a lab VM, tell your instructor rather than changing
the machine.

### I'm installing on my own machine

Prepare an Ubuntu 24.04 LTS server (a VM is fine) and nothing else:

- An account that can run `sudo`.
- At least 4 CPU cores, 16 GB of memory and 100 GB of free disk: the
  Pentaho Server, its PostgreSQL repository and the client tools all run
  on it.
- Outbound internet access to the Ubuntu, PostgreSQL and pgAdmin package
  repositories and to `download.pentaho.com`.
- The 11.0 archive packages from the Customer Portal, copied onto the
  server, and an Enterprise Edition license key for the EE plugin labs.

Don't install Java, PostgreSQL or Pentaho in advance: the workshops do
each of them, in order.

:::

## Check your server

This panel probes this Ubuntu machine live: the release, `sudo`, cores,
memory and disk, and the internet access the labs need. It also
follows the course as you go: Java 21, PostgreSQL and the Pentaho Server
show grey until the workshop that installs them, then green. Each row
reports one of four states:

* **<span class="pcm-c-ok">Green</span>** — the check passed; that piece is present and answering.
* **<span class="pcm-c-warn">Amber</span>** — usable, but worth tidying before the session.
* **<span class="pcm-c-danger">Red</span>** — it will block a lab, and the row tells you the exact fix.
* **<span class="pcm-c-muted">Grey</span>** — not installed yet: a later workshop installs it.

<div data-env-check="install"></div>

> **Success:** Checkpoint: no red rows. Grey rows turn green as you work through the course.

### Check by hand <!-- no-step -->

The same checks in a terminal, if you'd rather see them yourself:

```bash
lsb_release -ds                       # Ubuntu 24.04.x LTS
sudo -v && echo "sudo OK"             # asks for your password, then: sudo OK
nproc                                 # 4 or more
free -g | awk '/^Mem:/ {print $2 " GB memory"}'   # 15 or more (16 GB reports as 15)
df -h --output=avail / | tail -1      # 100G or more free
curl -sI https://download.pentaho.com | head -1   # an HTTP status line
```

If any line is short, fix it before the first workshop.

> **Warning:** No HTTP line from `curl` means the server has no route to the internet, or a proxy it doesn't know about. Fix that before the first workshop: the package installs in [Prepare Environment](../05-installation-archive-prepare-environment/guide.md) need it.

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho —
ask it anything from "which ports does the server use?" to "why won't
Tomcat start?". A model on this machine writes the answers, and it
grounds them in a live search of the official Pentaho documentation.
Without an internet connection that search is unavailable, so only the
local model answers, without the documentation behind it.

## How this course is organized

Each section starts with an **overview page** (<span data-icon="page"></span> — background reading,
no check boxes) followed by **hands-on workshops** (<span data-icon="workshop"></span> — tracked steps).
Select a heading to open that section's page, or the chevron beside it to
expand the workshops underneath.

## The exam

When you have worked through the sections, the **Certified Exam** in
the sidebar draws 40 questions from a larger pool. It is open-book — take
your time, browse any module to refresh your memory, or ask the
assistant. Your answers are saved as you go, so leaving the page to look
something up is fine, and the explanations show afterwards so you can
learn from anything you missed. The pass mark is **80%**.

You are asked for your name, email and organization before you begin
(and your Partner ID, if you are taking it as part of the Pentaho Partner
Program).

Head to the first section whenever you're ready.

---

> **Tip:** You can revisit this page any time from the sidebar.
