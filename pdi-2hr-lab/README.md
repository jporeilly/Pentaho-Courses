# PDI in 2 Hours — marketing ops runbook

This course is a **try-and-buy funnel asset**, not a training course.
It is instrumented end-to-end; this file is the checklist for the
person running the campaign. Learners never see this page.

## What data you get, and from where

| Signal | Mechanism | Where it lands |
| --- | --- | --- |
| Funnel: pages opened, per-block drop-off | `page_view` events | GA4 |
| Engagement depth: every step checkbox | `step_completed` / `step_unchecked` | GA4 |
| Product touch: PDI actually launched | `launcher_clicked` (launcher = `spoon`) | GA4 |
| **Conversion: CTA clicked** | `launcher_clicked` (launcher = `contact` / `trial`) | GA4 |
| Pipeline curiosity: graph viewer opened | `graph_opened` | GA4 |
| Assistant usage | `chat_prompt_sent` (never the text) | GA4 |
| Environment failures blocking learners | `env_check_run` (`failures` count) | GA4 |
| Per-page sentiment | `page_feedback` (`helpful` yes/no) | GA4 |
| Free-text feedback comments | feedback webhook (same endpoint) | Leads spreadsheet, Feedback tab |
| **Leads: name, email, company + recap score** | Wrap-Up Check (exam.json) webhook | Leads spreadsheet, Summary tab |
| Session length / time-on-page | `engagement_time_msec` on every event | GA4 |

Identity: analytics is anonymous (random per-install client id).
Personal data flows **only** through the Wrap-Up Check intake, which
the learner fills in knowingly at the end. Keep it that way — it is
both the compliance story and the reason completion stays high
(nothing is gated mid-lab).

## Before the first learner — in this order

1. **GA4 property + stream.** Admin → create/reuse the "Pentaho
   Courses" property → Data Streams → Add stream → Web (URL can be
   `https://pcm.invalid/pdi-2hr-lab`). Note the Measurement ID.
2. **API secret.** On that stream: Measurement Protocol API secrets →
   Create. Note it.
3. **Register custom dimensions NOW — forward-only, no backfill.**
   Admin → Custom definitions → create event-scoped dimensions for:
   `course_id`, `lab_slug`, `step_id`, `launcher`, `lab_kind`,
   `model`, `hw_profile`, `app_version`, `outcome`, `mode`,
   `helpful`. Events recorded before registration stay invisible to
   reports and the Data API forever. Do this before any pilot run,
   including your own dry run.
4. **Fill in `course.json`** → `analytics.measurementId` +
   `analytics.apiSecret` (both must be non-empty or analytics stays
   silently off).
5. **Leads webhook — dedicated, never shared.** The nine practitioner
   courses all post exam results to one shared Apps Script endpoint
   (the `AKfycbzt7…` URL). **Do not reuse it here.** This course is
   an eval funnel with high volume: stand up a **new** Google Sheet +
   Apps Script web app (recipe in `docs/EXAM-RESULTS-SETUP.md`) and
   put its URL in this course's `exam.json` → `webhookUrl`
   (+ its own secret). `webhookUrl` is per-course, so this is the
   entire separation — certification results stay unpolluted, and the
   eval sheet is your **lead list**: name, email, company, score,
   pass/fail, course id, timestamp, upserted by attempt id.

   Volume notes for a busy campaign:
   - One spreadsheet per campaign/quarter (name it, e.g.
     `pdi-2hr-lab leads 2026-Q4`) and rotate by swapping the
     `webhookUrl` — cleaner than one ever-growing sheet, and each
     event's leads hand over to sales as a unit.
   - Apps Script web apps handle tens of thousands of POSTs/day and
     Sheets caps at 10M cells — neither is a realistic ceiling, but
     a sheet past ~50k rows gets slow to open; rotate before then.
   - Attempts are upserted by `attemptId`, so retries never
     duplicate rows.
6. **Feedback webhook — same endpoint.** Put the **same URL** (and
   secret) from step 5 into `course.json` → `feedback.webhookUrl`.
   For this eval funnel, comments belong with the leads: the stock
   Apps Script routes `type=page_feedback` rows onto a separate
   **Feedback tab** in the same spreadsheet, so lead rows stay clean
   while everything lives in one place. (Training courses keep these
   split; here one endpoint is deliberate.)
7. **Verify the wiring** before the event: temporarily add
   `"debug_mode": 1` — or just watch GA4 Realtime while you click
   through a lab. Standard reports lag 24–48 h; Realtime doesn't.
8. **Publish to Pentaho-Courses** and let VMs sync, or bake with
   `set-git-source.ps1`.

## The numbers that matter (in order)

1. **Block drop-off**: `page_view` count per `lab_slug`, 00 → 07.
   The first big cliff is the lab to fix — nothing else about the
   asset matters until the cliff moves.
2. **Activation**: % of sessions with `launcher_clicked`
   launcher=`spoon` (they actually opened the product).
3. **Conversion**: `launcher_clicked` where launcher=`contact` or
   `trial`, and Wrap-Up Check submissions (leads).
4. **Stall detection**: within a lab, the last `step_completed`
   `step_id` before sessions go quiet = the exact instruction that
   loses people.
5. **Sentiment**: `page_feedback` helpful-rate per lab + the
   comments sheet.

Prototype your reports before real traffic with
`docs/analytics-sample-events.csv`, or read GA4 back with PDI's own
Google Analytics v4 input step (register the dimensions first — same
forward-only rule).

## Content status / known gaps

- **Screenshots**: guides are text-first; `_assets/images/` is empty.
  Add screenshots per lab before the first public run.
- **`01-first-win/files/win_preview.ktr`** was authored from shipped
  KTR patterns but has not been opened in Spoon — **open and re-save
  it in the target PDI version before the event** (Lab 1 depends on
  it running first try).
- Lab 4 assumes the workshop MySQL (`localhost:3306`,
  `pentaho_admin`/`password`, db `sampledata`) from
  `setup-services.ps1`. For a self-serve/laptop audience, ship a
  docker-compose or re-point the lab.
- Lab 7's demo (job + server + schedule) is instructor-driven; for
  fully self-serve, record it as a video and embed it.
- CTA URLs in `course.json` (`contact`, `trial` launchers) point at
  pentaho.com placeholders — set the real campaign-tagged URLs
  (UTM-tag them so web analytics ties back to the lab).
- Licence wording (BSL 1.1 / Developer Edition) appears in Lab 0 and
  Lab 7 — have it reviewed before public use, and confirm which
  download the funnel points at (the public DE page currently routes
  commercial visitors to the trial, DE itself to academic access).
