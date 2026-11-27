# Before You Start

> **Note:**
>
> Welcome. This first lab shows you how to work with this guide.
> Five minutes here makes every later lab smoother.

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

## Copy code with one click

Every code block has a **copy button** — hover over the block and click
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

::: tabs

### I'm using a lab VM

Pentaho Data Integration is installed and starts with the machine.
One thing is yours to do: the Python environment the course uses
lives in your own home folder, so you create it with one script in
[Prerequisite Tasks](../02-prerequisite-tasks/guide.md).

The installer also laid down three kits the later workshops start
when they need them: `C:\MySQL` (the MySQL database the scores go to,
from Credit Card on), `C:\Streaming` (Kafka, for Real-time Scoring) and
`C:\ML` (the Python setup and the H2O scoring service).

If something looks wrong later, tell your instructor rather than
reinstalling anything.

### I'm installing on my own machine

Install Pentaho Data Integration 11
and make sure it starts.

This course also needs:

- **Python 3.11+**, with H2O, pandas, NumPy, Matplotlib, Py4J and JupyterLab in a virtual environment named `h2o-env`: [Prerequisite Tasks](../02-prerequisite-tasks/guide.md) sets it up.
- **Podman**, with the course's MySQL kit (`sampledata-mysql` on port 3306) from Credit Card on, and the Streaming kit's Kafka (`pcm-kafka` on port 9092) for Real-time Scoring; and the MySQL JDBC driver in Pentaho Data Integration's `lib` folder.
- Optionally, a Google account, for **Google Colab**.

:::

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho,
grounded in the official docs — ask it anything from "what does this
step do?" to "why did my transformation fail?". It runs on a local
model, so it works even when the VM is offline.

## How this course is organized

Each section starts with an **overview page** (<span data-icon="page"></span> — background reading,
no checkboxes) followed by **hands-on workshops** (<span data-icon="workshop"></span> — tracked steps).
Head to the first section whenever you're ready.

---

> **Tip:** You can revisit this lab any time from the sidebar.
