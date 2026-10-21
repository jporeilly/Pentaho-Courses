# Overview

<div class="pcm-intro">

This module draws the line between LLM-enriched ETL and an AI agent. The earlier workshops called a Large Language Model (LLM) directly from a Pentaho Data Integration **REST client** step: one prompt in, one JSON answer out, a pure function of one row. Here, Pentaho Data Integration retrieves an asset's maintenance history and calls a deployed Python agent, which reads the current entry and every history entry together, in one LLM call, and judges whether this is a recurrence of a known fault, a new fault, or normal variation.

</div>

**What You'll Learn**

* What separates an agent from a direct LLM call or an extraction service
* Why the history is retrieved by Pentaho Data Integration, and the reasoning left to the agent
* The maintenance scenario the next workshop builds

The test for whether something needs an agent: can Pentaho Data Integration produce the same result by adding more steps to the canvas? No standard step reads several free-text entries as a whole and judges what they mean together; that judgement is what the agent owns.

**The three approaches in this course:**

| | Direct LLM call / multi-stage | LangExtract | Agent as a service |
| --- | --- | --- | --- |
| What it does | Sends one prompt per row, returns structured JSON for that row | Extracts named values with character offsets from one text; returns one row per value | Reads the current entry and its retrieved history, reasons across all of them, returns one assessment |
| Input to the service | One text field from the row | One text field, a prompt and few-shot examples | The current log text and N history entries, retrieved by Pentaho Data Integration before the call |
| Output shape | One row in, one enriched row out | One row in, N extraction rows out, pivoted by **Row denormaliser** | One row in, one assessment row out |
| LLM calls per row | 1 (or a fixed number of stages) | 1 per extraction pass over the chunked text | 1: all the texts in a single context |
| Needs other records? | No: each row on its own | No: each document on its own | Yes: the history Pentaho Data Integration retrieves with **Database join** is essential |
| Decision grounded in | The current text | The current text, traced back by character offsets | The current text and the verified history in the database |
| Can Pentaho Data Integration steps replicate it? | Yes: the multi-stage script and REST client pattern | Partly: rules cover known formats; LangExtract handles variable ones | Not with standard steps: the cross-text reasoning is the agent's |
| Use when | Classifying, enriching or summarizing individual records | Extracting typed fields from free text where rules are too brittle | The assessment depends on what earlier records say, not only the current one |

> **Note:**
>
> #### The Scenario
>
> A maintenance team logs fault observations as free-text entries against industrial assets: one paragraph per entry, written by an engineer in the field, with no fixed schema or controlled vocabulary. Pentaho Data Integration reads these entries from a database table and must produce a priority assessment for each one. A complete assessment answers three questions:
>
> * What fault does this entry describe? (classification)
> * What has happened to this asset before? (history retrieval)
> * Is the current entry a new fault, an acceleration of a known pattern, or normal variation, given that history? (pattern reasoning)

<div align="center">
<figure>
<img src="../_assets/images/maintenance_assessment_agent.png" alt="The maintenance assessment transformation: Read Log Entries (spelt Enteries on this earlier canvas), Get Asset History, Sort rows, Remove Duplicates, Aggregate History, Group by, Build Agent Payload, Call Assessment Agent, Check HTTP status with a failure branch to Dummy (do nothing), Parse Agent Response, and a Switch / case to four outputs, CRITICAL, HIGH, MEDIUM and LOW" width="800">
<figcaption>An earlier build of the transformation the next workshop builds: Pentaho Data Integration retrieves the history, the agent reasons over it. Your step names follow the workshop</figcaption>
</figure>
</div>

***

## Workshops <!-- no-step -->

* **Deploy & Run the Agent** — start the agent service, wire it into a Pentaho Data Integration transformation, run it, and review performance.
