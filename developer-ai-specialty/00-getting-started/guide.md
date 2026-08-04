# Please read ...!

> **Note:**
>
> Welcome! This first lab shows you how to work with this guide.
> Five minutes here makes every later lab smoother.

## Meet your lab guide

This panel stays beside your tools for the whole workshop:

- **Float or dock** — drag the title bar to move the window anywhere
  (any monitor), or use the dock button to pin it to the right edge of
  the screen so maximised apps make room for it.
- **The sidebar** lists every section and lab. A ▶ badge means the lab
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

Launch your main tool straight from the guide:

<button data-launch="spoon">Start Pentaho Data Integration</button>

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
the tabs in order — the last one is a reference card of ports, for when
you come back to it later.

> **Note:** This course needs no containers, no MySQL and no cloud
> accounts. Every lab generates with a **local Ollama model**, so your
> data never leaves the machine — the trade-off is that a CPU-only
> laptop takes 15–30 seconds per LLM call, which is normal.

::: tabs

### 1. Pentaho Data Integration

The labs drive Spoon, and the guide's buttons expect it at the standard
path.

1. Install Pentaho Data Integration to `C:\Pentaho`, so Spoon lives at:

   ```
   C:\Pentaho\design-tools\data-integration\spoon.bat
   ```

2. Start it once from the button at the top of this page and let it
   finish loading.

<details>
<summary>Troubleshooting</summary>

**The Start button does nothing.** The launcher expects the path above.
Either move your install there or edit the course's launcher path.

**Spoon opens then closes.** Almost always Java — PDI needs a bundled
or system JRE it can find. Start `spoon.bat` from a terminal once and
read the first error line.

</details>

### 2. Ollama and the course model

Every module calls a local LLM through Ollama — the transformations,
the two lab services and this guide's Chat tab all use it.

1. If you used this course's installer, Ollama is already set up and
   you can skip to the check below. Otherwise run, from the app's
   install folder:

   ```powershell
   provisioning\install-ollama.ps1
   ```

2. Pull the course model and wire PDI to it (writes `MODEL_NAME` and
   `OLLAMA_URL` into `kettle.properties` so Spoon and the labs agree):

   ```powershell
   provisioning\setup-ollama.ps1
   ```

3. Check it answers:

   ```powershell
   curl http://localhost:11434/api/version
   ollama list
   ```

   You should see `llama3.2:3b` (CPU profile) in the list.

<details>
<summary>Troubleshooting</summary>

**`curl` says connection refused.** Ollama is not running — start the
Ollama app, or run `ollama serve` in a terminal.

**The Chat tab says the assistant is unavailable but `curl` works.**
Ollama refuses the app's origin. `setup-ollama.ps1` sets
`OLLAMA_ORIGINS` for you and restarts Ollama — run it again, then
restart this app.

**Generation is very slow.** Expected on CPU: 15–30 s per call for
`llama3.2:3b`. On a machine with a supported GPU, switch the Chat tab
to the GPU profile and pull `qwen2.5:7b`.

</details>

### 3. Python 3.11+

Two later modules run small FastAPI services that ship inside their
labs; Python is all they need installed up front.

1. Install Python 3.12:

   ```powershell
   winget install -e --id Python.Python.3.12
   ```

2. Open a **new** terminal and confirm:

   ```powershell
   python --version
   ```

<details>
<summary>Troubleshooting</summary>

**`python` is not recognised.** PATH updates only reach new terminals —
close and reopen. If it persists, try `py --version`; the `py` launcher
works everywhere the installer ran.

**A Microsoft Store window opens instead.** Windows' app-alias stub is
shadowing the real install. Settings → Apps → Advanced app settings →
App execution aliases → turn off the two `python` entries.

</details>

### 4. The lab services (later, not now)

Two modules run a small local service, and each ships **inside its own
lab** with copy-paste setup on that module's first page — there is
nothing to install today:

- **LangExtract service** on `localhost:8765` — set up when you reach
  the *LangExtract* module.
- **Assessment agent** on `localhost:8000` — set up in the final
  module, *Deploy & Run the Agent*.

Both are a two-minute `python -m venv` + `pip install` when you get
there.

### 5. Ports at a glance

Everything this course uses, all local to your machine:

| Service            | Address                  | Used by                          |
| ------------------ | ------------------------ | -------------------------------- |
| Ollama             | `http://localhost:11434` | every lab, both services, Chat   |
| LangExtract service| `http://localhost:8765`  | the LangExtract module           |
| Assessment agent   | `http://localhost:8000`  | the final module                 |

:::

<div data-env-check="ai"></div>

Nothing else is required.

::::

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho,
grounded in the official docs — ask it anything from "what does this
step do?" to "why did my transformation fail?". It runs on a local
model, so it works even when the VM is offline.

## How this course is organised

Each section starts with an **overview page** (📄 — background reading,
no checkboxes) followed by **hands-on workshops** (🧪 — tracked steps).
Head to the first section whenever you're ready.

---

> **Tip:** You can revisit this lab any time from the sidebar.
