# Before You Start

> **Note:**
>
> #### Get Ready — Before You Start
>
> This course installs Pentaho 11.0 from its archive packages, so the
> labs run on the machine you install onto, not on a ready-made server.
> Check you have what the install needs before the first lab.
>
> **What you'll need:**
>
> * An Ubuntu 24.04 LTS machine (or VM) and an account with `sudo`.
> * Outbound internet access: the labs install Java, PostgreSQL and
>   pgAdmin from package repositories, and the Plugin Manager downloads
>   from `download.pentaho.com`.
> * The 11.0 packages from the Pentaho Customer Portal (see **Pentaho
>   Support Portal**), and a licence for the Enterprise plugins.
>
> **Estimated Time:** 5 minutes here; the install itself takes the
> rest of the course.

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

### Do you need to set anything up?

::: tabs

### I'm using a lab VM

Nothing to do. Everything is installed and running already, and it
starts with the machine.

If something looks wrong later, tell your instructor rather than
reinstalling anything.

### I'm installing on my own machine

Install the Pentaho tools this course uses
and make sure it starts.

This course also needs:

- Nothing to pre-install: this course *is* the installation course.
- You will install the Pentaho Server, its PostgreSQL repository and the client tools as you work through it.
- An Enterprise Edition licence key is needed for the EE plugin labs.

:::

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
