# Course diagrams

The Developer - AI Specialty course's diagrams are hand-laid SVG,
drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, full-width bars, and arrows with their labels in white pills. Icons
come from the app's own `lucide-react` package, so they match the icons
in the guide. They name the course's own steps, fields, ports, endpoints
and models, and draw only what the lessons state.

* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes llm-row-skeleton.svg and ../images/llm-row-skeleton.png.
  node llm-row-skeleton.svg.mjs
  ```

* The agent workshop's flow is a sequence diagram.
  [`sequence.mjs`](sequence.mjs) draws it with the kit's own parts: one
  panel per actor as a tall lane with a dashed lifeline, one kit arrow per
  numbered message, and a pill on a lifeline for a step an actor takes
  alone. It is a copy of the Integrating Authentication Mechanisms
  course's helper, kept here so the course stands on its own. It is a
  helper, not a diagram, so it has no `.svg` of its own.
* The three LangExtract workshops share one layout.
  [`langextract-flow.mjs`](langextract-flow.mjs) draws it: the
  transformation's steps down a blue panel, the `request_json` the script
  builds, the LangExtract service with `POST /extract` level with
  **REST client** and `lx.extract` below it, and Ollama. Each workshop's
  script passes its own steps, request and chunk settings, then draws its
  outputs on the right. It is a helper too, with no `.svg`.
* Each script's header comment lists the facts it draws, and the lessons
  they come from. Change a fact in a lesson, and change the diagram too.

Color by role: blue a tool you use or a source you read (Pentaho Data
Integration and its input steps, a user's query), violet a server or a
step that transforms (Modified JavaScript value, REST client, JSON input,
the LangExtract service, the agent, a multi-stage stage), teal the model
and what serves it (Ollama, an embedding), green a store or a write (the
SQLite databases, a vector store, Text file output, the fields a stage
adds), amber a check (the comparison of vectors, the one approach that
needs other records, Filter rows, a script that validates), red a failure
or a reject (a call that does not return 200, a contract for the review
queue, a row Filter rows drops),
slate a supporting frame or note, stone something not involved (an
approach that needs no other records), and white a result (a reply, a
response, the nearest chunks, a prompt). Keep one icon per thing across
the diagrams:

| Icon | Stands for |
| --- | --- |
| `workflow` | Pentaho Data Integration, a transformation |
| `file-input` | CSV file input, Text file input |
| `folder-search` | Get file names |
| `database-search` | Table input |
| `database` | a database or a vector store, the table a Table output step loads |
| `clock` | Get system info, a time stamp |
| `list-filter` | Select values |
| `circle-dashed` | Dummy (do nothing) |
| `split` | Filter rows |
| `list-checks` | Modified JavaScript value that validates a row |
| `ban` | rows dropped, with no hop to take |
| `braces` | Modified JavaScript value that builds a request |
| `send` | REST client |
| `file-json` | JSON input, a parse of JSON |
| `table-2` | Row denormaliser, an enriched or a pivoted row |
| `file-output` | Text file output, the written result |
| `shuffle` | a stage of the multi-stage pipeline |
| `list-plus` | the fields a stage adds to the row |
| `server` | a service: Ollama, the LangExtract service |
| `brain` | the model, an LLM |
| `bot` | the maintenance assessment agent |
| `route` | an endpoint (`POST /extract`) |
| `scissors` | chunking: `lx.extract`, a document split into chunks |
| `text-search` | a comparison of vectors (cosine similarity) |
| `arrow-up-right` | a request's shape: what you send |
| `arrow-down-left` | a response's shape, or the response itself |
| `rows-3` | one input row |
| `file-text` | a document or one text |
| `list` | N extraction rows |
| `list-ordered` | the nearest chunks, ranked |
| `clipboard-check` | the agent's assessment row |
| `message-square-text` | a user's query |
| `message-square` | the LLM's response to the user |
| `binary` | an embedding (`nomic-embed-text`) |
| `layers` | JSON inside JSON, a prompt built from parts |
| `message-square-code` | Ollama's reply |
| `history` | a row with its retrieved history |
| `info` | a note |

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

| Diagram | Page |
| --- | --- |
| `llm-row-skeleton` | LLM Integration overview: one row's path through build, call and two parses, and JSON inside JSON |
| `multi-stage-fields` | Multi-staged, part 1: the five stages, what each reads and adds, and each safe default (replaces `multi_staged_optimized.png`) |
| `langextract-architecture` | LangExtract overview: the Pentaho Data Integration steps, the service on port 8765, Ollama, and the request and response field names (replaces `langextract-pipeline-architecture.png`) |
| `support-tickets-flow` | Support Tickets, introduction: the production design of `ticket_triage.ktr`, through REST client and the service to `helpdesk.escalations` and `helpdesk.ticket_triage` (replaces `langextract-support-tickets.png`) |
| `clinical-notes-flow` | Clinical Notes, introduction: `clinical_notes.ktr` from the note files through REST client and the service to `staging.patient_extractions` (replaces `rt0m9.png`) |
| `contract-documents-flow` | Contract Documents, introduction: `langextract_contracts.ktr`, its copy into Branch A (`staging.clause_details`) and Branch B (the wide row, validated into `contract_master` or `contract_review_queue`) (replaces `langextract-contract-documents.png`) |
| `three-approaches` | Agent as a Service overview: direct LLM call, LangExtract and the agent side by side |
| `agent-assess-sequence` | Deploy & Run the Agent, part 3: one log entry across SQLite, the transformation, the agent and Ollama (replaces the text diagram) |
| `semantic-search` | Key Concepts workshop, part 5 (Search): indexing, retrieval and the answer (replaces `semantic_search_diagram.png`) |
