# From Lab to Production

> **Warning:**
>
> #### From Lab to Production
>
> In ninety minutes you built a validating ingest, a three-source
> join, a Type 2 history dimension, and a template pipeline that
> onboards new feeds from a control file. This page is about the gap
> between that and *running it every night at 2am* — and how teams
> close it.
>
> **What you'll do**
>
> * See how transformations become scheduled, monitored jobs.
> * Understand what the licensed platform adds to what you used today.
> * Tell us where your data landscape hurts — and take the next step.
>
> **Estimated Time:** 15 minutes

## What you built today, honestly assessed

What you have: real transformations, running on the real engine —
Developer Edition is not a demo build. What you don't yet have is
everything *around* a 2am run:

* **Orchestration** — jobs that sequence transformations, retry on
  failure, and alert someone when the source file doesn't arrive.
* **Scheduling & operations** — a server that runs pipelines on
  schedule with logging, history, and monitoring, instead of a
  designer on your laptop.
* **Scale-out** — clustered execution across workers when one
  machine stops being enough; pushdown to the platforms the data
  already lives on.
* **Governance** — who changed which pipeline, lineage from source
  to report, and a catalog that knows what `dim_customer` means.
* **A licence for production** — Developer Edition's BSL 1.1 terms
  cover evaluation and development; production use needs a
  commercial licence, which is also where support, security
  patches, and certified connectors live.

## Watch: the production shape

Your instructor will demo (or you can explore in the docs — the
assistant in the panel below is grounded on them):

1. A **job** wrapping today's transformations: start → ingest →
   validate → load dimension → email on failure.
2. The same job **scheduled on a Pentaho Server**, with run history
   and logs in the console.
3. **Parameters** turning today's hard-coded paths into per-
   environment configuration — the same pipeline in dev, test, prod.

## Where does it hurt?

Two hours is enough to know whether this fits how your team works.
The honest questions:

* [ ] I have feeds today that would fit the metadata-injection pattern.
* [ ] Somebody in my team maintains hand-written SCD / merge SQL.
* [ ] Our current pipelines fail silently or are hard to see into.
* [ ] I have data sources this would need to connect to that I have not tested today.

If you ticked any of these, the conversation is worth fifteen
minutes:

<button data-launch="contact">Talk to us about production</button>

Want to keep evaluating with the full platform — server, scheduler,
catalog — on your own data?

<button data-launch="trial">Get the full Pentaho platform trial</button>

## Before you go

Two minutes, two favours:

1. **The wrap-up check** — the short quiz in the sidebar (under this
   lab) recaps the four big ideas and tells us what stuck. It also
   asks who you are; that's how we follow up with the trial and
   answers to anything you flagged.
2. **The feedback widget** at the bottom of each page — one click,
   and a comment if a lab fought you. We read every one; this
   course changes shape based on them.

---

> **Tip:** Keep Developer Edition installed — everything you built
> today is yours, the licence covers continued evaluation and
> development, and the pipelines you sketched against your own data
> in Lab 6 are the start of your real proof of concept.
