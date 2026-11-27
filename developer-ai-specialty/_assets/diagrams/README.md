# Course diagrams

The Developer - AI Specialty course's diagrams are hand-laid SVG,
drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, full-width bars, and arrows with their labels in white pills. Icons
come from the app's own `lucide-react` package, so they match the icons
in the guide. They name the course's own steps, fields, ports, endpoints
and models, as the lessons and their solution `.ktr` files have them, and
draw only what the lessons state.

* Each diagram is `<NN>-<name>.svg.mjs`, where `NN` is the number of the
  lab folder whose page shows it, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<NN>-<name>.svg` and renders
  `../images/<NN>-<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes 06-sentiment-flow.svg and ../images/06-sentiment-flow.png.
  node 06-sentiment-flow.svg.mjs
  ```

* Each script's header comment lists the facts it draws, and the lessons
  and solution files they come from. Change a fact in a lesson, and change
  the diagram too.

## Helpers

These are layouts several diagrams share. They have no `.svg` of their
own; run the diagram that uses them.

* [`ktr-flow.mjs`](ktr-flow.mjs): one transformation down a blue panel,
  every hop a straight arrow, and beside each step, level with it, the one
  thing it touches: the file it reads or writes, the model it calls, the
  field it adds. Used by the AI Chat row (05), Sentiment Analysis (06),
  Data Quality (07), Data Enrichment (08), Build the Knowledge Base (20),
  Answer Questions (21) and Invoices with a Vision Model (26).
* [`ktr-lanes.mjs`](ktr-lanes.mjs): several small transformations, one
  blue panel per `.ktr` and one lane per flow, read left to right: where
  the rows come from, the GenAI step, the file the flow writes. Used by
  HTML Parser (03) and Apache Tika (04).
* [`langextract-flow.mjs`](langextract-flow.mjs): the three LangExtract
  workshops' layout: the transformation's steps down a blue panel, the
  `request_json` the script builds, the LangExtract service with
  `POST /extract` level with **REST client** and `lx.extract` below it,
  and Ollama. Each workshop's script passes its own steps, request and
  chunk settings, then draws its outputs on the right.
* [`langextract-architecture.svg.mjs`](langextract-architecture.svg.mjs):
  the LangExtract overview's layout and facts. Do not run it on its own:
  [`12-langextract-architecture.svg.mjs`](12-langextract-architecture.svg.mjs)
  runs it under its own name, with the module's model.
* [`12-langextract-model.mjs`](12-langextract-model.mjs): the LangExtract
  module's model, `qwen2.5:7b`, which the LangExtract diagrams name;
  `langextract-flow.mjs` names it itself, and the overview draws it in
  place of the service's old default in `langextract-architecture.svg.mjs`.
* [`sequence.mjs`](sequence.mjs): the agent workshop's sequence diagram,
  with the kit's own parts: one panel per actor as a tall lane with a
  dashed lifeline, one kit arrow per numbered message, and a pill on a
  lifeline for a step an actor takes alone. It is a copy of the
  Integrating Authentication Mechanisms course's helper, kept here so the
  course stands on its own.

## Color and icons

Color by role: blue a tool you use or a source you read (Pentaho Data
Integration and its input steps, a user's query, a folder of documents),
violet a server or a step that transforms (Modified JavaScript value,
REST client, JSON input, AI Chat, the LangExtract service, the agent, the
Pentaho Server), teal the model and what serves it
(Ollama, an embedding, Text to Vector), green a store or a write (the
SQLite databases, a vector store, Text file output, the fields a stage
adds), amber a check (the comparison of vectors, Vector Search, Filter
rows, a script that validates, the license), red a failure or a reject
(a call that does not return 200, a contract for the review queue, Abort
job), slate a supporting frame or note (kettle.properties, a branch of a
transformation, what every runtime needs), stone something not involved
(an approach that needs no other records, a step no lab uses), and white
a result (a reply, a response, the nearest chunks, a prompt, a run
instruction). Keep one icon per thing across the diagrams:

| Icon | Stands for |
| --- | --- |
| `workflow` | Pentaho Data Integration, a transformation |
| `network` | a job (`.kjb`) |
| `monitor` | Spoon |
| `puzzle` | the GenAI plugin suite, its plugin folders |
| `shield-check` | the GENAI-EE license |
| `file-cog` | `kettle.properties` |
| `file-input` | CSV file input, Text file input |
| `rows-3` | one input row, Generate rows |
| `sheet` | Data grid |
| `folder-search` | Get file names |
| `folder-open` | a folder of files on disk |
| `folder-tree` | a Pentaho Repository folder |
| `database-search` | Table input |
| `database` | a database or a vector store, the table a Table output step loads, Vector Writer |
| `code-xml` | HTML Parser |
| `file-text` | a document or one text, Read Unstructured Document |
| `file-lock` | Read Unstructured Document on a password-protected file |
| `tags` | Discover Metadata from Unstructured Documents |
| `file-code` | Base64 Encoder |
| `clock` | Get system info, a time stamp |
| `list-filter` | Select values |
| `circle-dashed` | Dummy (do nothing) |
| `split` | Filter rows |
| `list-checks` | Modified JavaScript value that validates a row |
| `ban` | rows dropped, with no hop to take; Abort job |
| `play` | a job's START entry |
| `braces` | Modified JavaScript value that builds a request, a message or a prompt |
| `square-function` | Formula |
| `key-round` | an ID built for a row (`chunk_id`) |
| `arrow-down-wide-narrow` | Sort rows |
| `combine` | Group by that joins values |
| `merge` | Join rows (cartesian product) |
| `sigma` | Group by that counts |
| `send` | REST client |
| `file-json` | JSON input, a parse of JSON |
| `table-2` | Row denormaliser, an enriched or a pivoted row, the fields parsed from an answer |
| `file-output` | Text file output, the written result |
| `messages-square` | AI Chat |
| `scroll-text` | a run instruction: Add constants that adds one, AI Chat Message Box |
| `scan-text` | NER Extractor |
| `plug-zap` | MCP Client, an MCP server |
| `list-plus` | the fields a stage adds to the row |
| `server` | a service: Ollama, the LangExtract service, the Pentaho Server, a Python service |
| `server-cog` | Carte |
| `square-terminal` | Kitchen and Pan |
| `container` | a container image |
| `calendar-clock` | a schedule in the User Console |
| `brain` | the model, an LLM |
| `bot` | the maintenance assessment agent |
| `route` | an endpoint (`POST /extract`) |
| `scissors` | chunking: `lx.extract`, AI Segmentation, a document split into chunks |
| `text-search` | a comparison of vectors (cosine similarity), Vector Search |
| `arrow-up-right` | a request's shape: what you send |
| `arrow-down-left` | a response's shape, or the response itself |
| `list` | N extraction rows |
| `list-ordered` | the nearest chunks, ranked |
| `clipboard-check` | the agent's assessment row |
| `clipboard-list` | what every runtime needs |
| `message-square-text` | a user's query, a question, a ticket |
| `message-square` | the LLM's response to the user |
| `binary` | an embedding (`nomic-embed-text`), Text to Vector |
| `layers` | JSON inside JSON, a prompt or a message built from parts |
| `message-square-code` | Ollama's reply |
| `history` | a row with its retrieved history |
| `info` | a note |

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

## The diagrams

| Diagram | Page |
| --- | --- |
| `00-the-machine` | Before You Start, How the pieces fit: Spoon with the plugins, the license and `kettle.properties`; Ollama and its three models; pgvector on 5433; the Python services and their ports |
| `02-genai-suite` | Documents to Text overview: the 12 steps inside one PDI panel as Ingest, Transform and AI, the labs that use each, Sources and Targets on the left, and the LLM providers, vector databases and MCP servers the AI steps call on the right |
| `03-html-parser-flows` | HTML Parser: `html_xpath.ktr`, `html_css.ktr` and the two flows of `html_stream.ktr`, with their selectors and output files |
| `04-tika-flows` | Apache Tika: `tika_word.ktr`, `tika_password.ktr`, `tika_folder.ktr` and `tika_metadata.ktr` |
| `05-ai-chat-row` | LLM Integration overview: one row through AI Chat, the request to `/api/chat`, the reply into `llm_json`, and JSON input (replaces `llm-row-skeleton`) |
| `06-sentiment-flow` | Sentiment Analysis: `sentiment_analysis.ktr` |
| `07-data-quality-flow` | Data Quality: `data_quality.ktr` and the TRUE and FALSE branches of `filter-quality` |
| `08-data-enrichment-flow` | Data Enrichment: `data_enrichment.ktr` and the template AI Chat Message Box fills |
| `09-ner-two-ways` | Named Entity Recognition: `named_entity_recognition.ktr`, NER Extractor beside AI Chat, merged and counted |
| `10-map-reduce-flow` | Text Summarization: `long_document_summary.ktr`, map down the left, reduce up the right |
| `11-five-stages` | Multi-staged: the five stages of `multi_stage_pipeline.ktr`, each stage's defaults and the fields it adds (replaces `multi-stage-fields`) |
| `12-langextract-architecture` | LangExtract overview: the Pentaho Data Integration steps, the service on port 8765, Ollama, and the request and response field names |
| `13-support-tickets-flow` | Support Tickets: `ticket_triage.ktr`, through REST client and the service to the `critical` and `others` Dummy steps |
| `14-clinical-notes-flow` | Clinical Notes: `clinical_notes.ktr` from the note files through the service to `staging.patient_extractions` |
| `15-contract-documents-flow` | Contract Documents: `langextract_contracts.ktr`, Branch A (`staging.clause_details`) and Branch B (`contract_master` or `contract_review_queue`) |
| `16-three-approaches` | Agents and Tools overview: direct LLM call, LangExtract and the agent side by side |
| `agent-assess-sequence` | Deploy & Run the Agent, part 3: one log entry across SQLite, the transformation, the agent and Ollama |
| `semantic-search` | Key Concepts workshop, part 5 (Search): indexing, retrieval and the answer |
| `19-two-pipelines` | RAG overview: the ingest and query pipelines, meeting at `nomic-embed-text` and `kb_chunks` |
| `20-knowledge-base-flow` | Build the Knowledge Base: `build_knowledge_base.ktr` |
| `21-answer-questions-flow` | Answer Questions: `answer_questions.ktr` |
| `22-mcp-two-ways` | MCP Tools, and the Agents and Tools overview: the MCP Client step beside AI Chat's Tools tab, over one MCP server |
| `23-capstone-shape` | Capstone, Suggested shape: the three files, the folders and where the results land; the shape only, never settings, because the capstone is assessed |
| `24-where-pipelines-run` | Moving to Production overview: one file, five runtimes, where each keeps its plugins, and what every runtime needs |
| `25-server-deployment` | Run on Pentaho Server: Spoon and the User Console, the job in the server's repository, its plugins and settings, and what they point at |
| `26-vision-flow` | Invoices with a Vision Model: `invoices_vision.ktr` from the images through AI Chat and `gemma3:12b` to the arithmetic check and `invoice_results.csv`, and the Base64 route of `invoices_base64.ktr` |
| `27-evaluation-flow` | Evaluate the Answers: `evaluate_rag.ktr` summarized stage by stage, from retrieving once through the two settings, the answer (`ai-answer`) and the judge (`ai-judge`, `qwen2.5:7b`) to `eval_results.csv` and the scorecard |
| `28-pii-guardrails-flow` | Guard Personal Data: regex masks, NER Extractor with the rule file, placeholders, the residual check to quarantine, AI Chat, validation and re-identification inside the trusted zone |
| `29-pentaho-mcp-shape` | Project: Pentaho MCP Server: an assistant, PDI's MCP Client and AI Chat calling the MCP server, its allowed folder and audit log, and Carte running the samples |
