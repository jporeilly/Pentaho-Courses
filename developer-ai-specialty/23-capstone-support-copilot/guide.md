# Capstone: Support Desk Copilot

> **Capstone Project — bring it all together.**

You're the data engineer at Halden Bikes, a direct seller of electric
bikes. The support team answers every ticket by hand, and most of the
answers are already written down: in the owner's manual, the battery
guide, the warranty policy, the delivery and returns policy and the
maintenance schedule. They want a copilot: every new ticket triaged,
the right passages of the documents found, and a reply drafted from
them, citing where each answer comes from, so an agent only has to
check it and send it. And they want one guarantee: when the documents
do not answer a ticket, the copilot says so and hands it to a person
instead of making something up.

The tickets and the documents are in your workshop folder. The
pipelines are yours to build.

> **Objectives:**
>
> - Turn five documents in three formats into a searchable knowledge base in pgvector, re-runnable without duplicates.
> - Triage every ticket with a local LLM into a category and an urgency, as structured fields.
> - Retrieve the passages that answer each ticket, with the documents they come from.
> - Draft a reply grounded only in those passages, and flag the tickets the documents cannot answer.
> - Load the results into PostgreSQL and write them to files, from one job.
> - Produce something portfolio-worthy ("I built this for my Specialty course accreditation").
>
> **Estimated time:** 3 hours for a clean, well-named solution. Re-shape and revisit as you'd like.

---

> **Warning:**
>
> #### Required for your course accreditation: nine checks on your own folders
>
> The course accreditation is issued only when all nine of these checks
> pass. They read your workshop folder, so save (or copy) your work into
> exactly these places **before you take the exam**:
>
> | # | What must be there | Where |
> | --- | --- | --- |
> | 1 | Your job, `jb_support_copilot.kjb`, running `load_knowledge_base.ktr` | `C:\Workshop-AI-Specialty\capstone\solution\` |
> | 2 | The same job, running `answer_tickets.ktr` | `C:\Workshop-AI-Specialty\capstone\solution\` |
> | 3 | Your `load_knowledge_base.ktr`, embedding the chunks with a **Text to Vector** step | `C:\Workshop-AI-Specialty\capstone\solution\` |
> | 4 | The same `load_knowledge_base.ktr`, writing them with a **Vector Writer** step | `C:\Workshop-AI-Specialty\capstone\solution\` |
> | 5 | Your `answer_tickets.ktr`, retrieving passages with a **Vector Search** step | `C:\Workshop-AI-Specialty\capstone\solution\` |
> | 6 | The same `answer_tickets.ktr`, asking the model with an **AI Chat** step | `C:\Workshop-AI-Specialty\capstone\solution\` |
> | 7 | Your replies, `ticket_replies.csv`, from your last run, with its `needs_human` column | `C:\Workshop-AI-Specialty\capstone\out\` |
> | 8 | Your triage summary, `triage_summary.csv`, from your last run, with its `category` column | `C:\Workshop-AI-Specialty\capstone\out\` |
> | 9 | Your `README.md`: how to run the job and read its results | `C:\Workshop-AI-Specialty\capstone\solution\` |
>
> Your `solution\` folder starts with a **blank** transformation or job
> for each file named below: build each one and save it. A blank file
> passes no check. Select **Run checks** under **Verification checks**
> to see where you stand.

## Inputs

Download the files from **Lab Files** at the bottom of this page, or
use the copies the installer put in `C:\Workshop-AI-Specialty\capstone\data\`.

| File | What it is |
| ---- | ---------- |
| `tickets.csv` | 30 support tickets from two days, with a header line: `ticket_id`, `received_at`, `customer`, `channel`, `subject`, `body` |
| `manuals\halden_owners_manual.pdf` | Error codes, assist levels and range, tire pressures, torque values |
| `manuals\battery_care_guide.docx` | Charging, storage, battery lifetime, the battery key |
| `manuals\warranty_policy.txt` | What the warranty covers, for how long, what it excludes, how to claim |
| `manuals\delivery_and_returns.docx` | Delivery times, transport damage, returns and refunds |
| `manuals\maintenance_schedule.pdf` | The first service, chain and brake care, cleaning |

Most tickets are answered somewhere in these five documents. A few are
not: the copilot must recognize them.

The database is the course's PostgreSQL with pgvector ([Before You
Start](../00-before-you-start/guide.md)): `localhost`, port `5433`, database `genai`, user `genai`,
password `genai`. Start it with `C:\PGVector\run-podman-pgvector.ps1`
if it is not running.

---

## Required behavior

Build the copilot in four stages. Each maps to a part of the course, so
you can look back at the workshop that taught it.

### 1. The knowledge base *(Documents to Text, Retrieval-Augmented Generation)*

Look back at: [Apache Tika](../04-genai-apache-tika/guide.md), [Build the Knowledge Base](../20-rag-knowledge-base/guide.md).

`load_knowledge_base.ktr` reads every document in `data\manuals\`,
turns each one into text, splits the text into chunks, embeds every
chunk with `nomic-embed-text`, and writes the chunks to a pgvector
collection named `capstone_kb`, with the document's file name kept as
the chunk's source. Running it twice must not double the collection.

### 2. Triage *(LLM Integration)*

Look back at: [Sentiment Analysis](../06-llm-sentiment-analysis/guide.md), [Data Quality](../07-llm-data-quality/guide.md).

`answer_tickets.ktr` reads `data\tickets.csv` and gives every ticket a
`category`, one of `battery`, `motor`, `delivery`, `returns`,
`warranty`, `maintenance` or `other`, and an `urgency`, one of `high`,
`normal` or `low`, as fields of the row. A ticket that blocks riding or
involves safety is `high`.

### 3. Grounded replies *(Retrieval-Augmented Generation)*

Look back at: [Answer Questions](../21-rag-answer-questions/guide.md).

In the same transformation, retrieve the passages of `capstone_kb` that
best match each ticket, and draft a reply to the customer from those
passages only. Keep the source documents of the passages the reply
used, in a `sources` field. When the passages do not answer the
ticket, the row gets `needs_human` = `Y` and no invented answer;
otherwise `N`.

### 4. Outputs and one job *(LangExtract, Moving to Production)*

Look back at: [Clinical Notes](../14-langextract-clinical-notes/guide.md), [Run on Pentaho Server](../25-production-server/guide.md).

Write every ticket to:

- the PostgreSQL table `support.ticket_replies`, one row per ticket,
  keyed on `ticket_id`, so a re-run updates instead of duplicating;
- `capstone\out\ticket_replies.csv`, with a header line and at least
  `ticket_id`, `category`, `urgency`, `needs_human`, `sources` and
  `reply`;
- `capstone\out\triage_summary.csv`, with a header line, one row per
  `category` and the number of tickets in it.

`jb_support_copilot.kjb` runs `load_knowledge_base.ktr` and then, only
if it succeeded, `answer_tickets.ktr`. If either fails, the job ends in
failure. Keep the three files in `capstone\solution\` and write a
`README.md` that says how to run the job with Kitchen and what to open
afterward.

---

## Suggested shape

```text
C:\Workshop-AI-Specialty\capstone\
├── data\                           tickets.csv, manuals\ (five documents)
├── solution\
│   ├── jb_support_copilot.kjb      the job
│   ├── load_knowledge_base.ktr     documents -> text -> chunks -> vectors -> capstone_kb
│   ├── answer_tickets.ktr          tickets -> triage -> retrieval -> reply -> table and files
│   └── README.md
└── out\
    ├── ticket_replies.csv
    └── triage_summary.csv
```

<div align="center">
<figure>
<img src="../_assets/images/23-capstone-shape.png" alt="The suggested shape: data\ holds manuals\, five documents, and tickets.csv, 30 tickets. In solution\, jb_support_copilot.kjb runs load_knowledge_base.ktr, then answer_tickets.ktr if it succeeded, and fails if either fails; README.md says how to run it. load_knowledge_base.ktr takes the documents to text, chunks and vectors in capstone_kb. answer_tickets.ktr takes the tickets through triage, retrieval and a reply into support.ticket_replies, and ticket_replies.csv and triage_summary.csv in out\" width="800">
<figcaption>The suggested shape: three files, the folders they read, and the results they write</figcaption>
</figure>
</div>

Every `.ktr` and the `.kjb` above are waiting for you in `solution\` as
blank files, with no steps or entries: the names are given, what goes in
them is yours. The `README.md` you create. If
`C:\Workshop-AI-Specialty\` has no `capstone` folder, create
`capstone\data\`, `capstone\solution\` and `capstone\out\` yourself.

---

## Hints for the tricky bits

- **Every document, one step.** **Get File Names** lists a folder; **Read Unstructured Document** in Stream mode reads the file named in a field, and reads PDF, Word and text alike.
- **No duplicates.** **Vector Writer** upserts on its ID field. Without one, every run adds new records: build an ID from what identifies a chunk.
- **The same model twice.** Load and search with the same embedding model, or the vectors are not comparable.
- **Field values in a prompt.** **AI Chat** does not put field values into a Script message. Build the prompt in a field first, then use the step in Stream mode.
- **JSON you can read.** Ask for JSON in the instruction, name every key and the values each allows, set the temperature to `0`, and read the answer with **JSON input**.
- **An answer the parser cannot read.** A small model sometimes returns broken JSON, and **JSON input** then stops the whole transformation. Give it an error hop, as in [Sentiment Analysis](../06-llm-sentiment-analysis/guide.md), to `out\bad_answers.csv`: those tickets need a person.
- **Several passages per ticket.** **Vector Search** can return one row per match or one JSON array per ticket. Either way, the reply's prompt needs the passages' text and their sources together.
- **"I don't know" is an answer.** Tell the model what to return when the passages do not answer the ticket, and test it on a ticket you know is not in the documents. A minimum score on the search also keeps weak matches out.
- **One row per ticket in the table.** **Insert / Update** keyed on `ticket_id` keeps re-runs clean; create the `support` schema and the table first, in `psql`.
- **The folders beside solution\\.** `${Internal.Entry.Current.Directory}` is `solution\`; `data\` and `out\` are its siblings, so a file name can start `${Internal.Entry.Current.Directory}/../out/`.
- **Exact file names.** The checks look for `ticket_replies.csv` and `triage_summary.csv` by those names: keep the date and time out of them.
- **Time.** Each ticket is two model calls on a local model. Run the job on five tickets first, with a **Sample rows** or a filter, then on all thirty.

---

## Lab Files

Click a file to download. Put them in `C:\Workshop-AI-Specialty\capstone\data\`
(the documents in `data\manuals\`) before you start, if the installer has
not already. Beyond these and the blank files in `solution\`, nothing in
the capstone is supplied: the pipelines are yours to build.

[tickets.csv](./files/tickets.csv)

[halden_owners_manual.pdf](./files/manuals/halden_owners_manual.pdf)

[battery_care_guide.docx](./files/manuals/battery_care_guide.docx)

[warranty_policy.txt](./files/manuals/warranty_policy.txt)

[delivery_and_returns.docx](./files/manuals/delivery_and_returns.docx)

[maintenance_schedule.pdf](./files/manuals/maintenance_schedule.pdf)

---

## Verification checks

> **Warning:** These nine checks decide your course accreditation, and
> they look only in `C:\Workshop-AI-Specialty\capstone\`: in `solution\`
> your `jb_support_copilot.kjb` running both transformations, your
> `load_knowledge_base.ktr` with a **Text to Vector** and a **Vector
> Writer** step, your `answer_tickets.ktr` with a **Vector Search** and
> an **AI Chat** step, and your `README.md`; and in `out\` your
> `ticket_replies.csv` with its `needs_human` column and your
> `triage_summary.csv` with its `category` column. Save your work there
> before you take the exam.

After a successful run of the job, select **Run checks** below to
confirm each file landed where expected. The checks confirm that the
files exist and hold the parts named above. Check the results yourself:
the model's wording is its own, so the replies vary, but a correct
solution always passes these tests.

| Test | How to see it | A correct solution shows |
| ---- | ------------- | ------------------------ |
| Every document is in the knowledge base | `SELECT metadata->>'source', count(*) FROM capstone_kb GROUP BY 1;` in `psql`, opened as in [Build the Knowledge Base](../20-rag-knowledge-base/guide.md) (use the source key you chose) | Five sources, each with at least one chunk |
| A re-run adds nothing | The same query after a second run of the job | The same counts |
| Every ticket answered or handed over | `ticket_replies.csv`, `SELECT count(*) FROM support.ticket_replies;` and `bad_answers.csv` | 30 tickets between them: a ticket whose answer could not be parsed is in `bad_answers.csv`, for a person, and not in the other two |
| The categories add up | `triage_summary.csv` | The counts add up to the rows in `ticket_replies.csv`; `battery`, `warranty` and `maintenance` are the biggest groups; a model files a few borderline tickets differently, such as a battery fault under `warranty` |
| The copilot knows its limits | `needs_human` in `ticket_replies.csv` | Four tickets ask what no document answers: they should be the ones marked `Y`, with no invented answer |
| Replies cite their sources | `sources` in `ticket_replies.csv` | Every row marked `N` names at least one of the five documents, and the document holds the answer |

> **Under the hood:**
>
> #### Why the copilot can say "I don't know"
>
> The model answers from what the prompt gives it. With retrieval, the
> prompt holds only the passages that matched the ticket; when none of
> them holds the answer, an instruction that allows "not in the
> documents" as an answer lets the model say so, and a pipeline that
> turns that answer into `needs_human` routes the ticket to a person.
> Without retrieval, the same model would answer every ticket from
> what it learned in training, confidently and sometimes wrongly.
>
> **Why it matters:** a support reply with an invented warranty term is
> worse than no reply. Grounding and an explicit way out are what make
> a draft safe to put in front of an agent.

## Deliverables

In `C:\Workshop-AI-Specialty\capstone\`:

- `solution\jb_support_copilot.kjb`, `solution\load_knowledge_base.ktr` and `solution\answer_tickets.ktr`
- `solution\README.md`: how to run the job with Kitchen, and what to open afterward
- `out\ticket_replies.csv` and `out\triage_summary.csv` from your last run
- The `support.ticket_replies` table and the `capstone_kb` collection in the `genai` database
