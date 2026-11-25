// Contract Documents: the transformation the page builds,
// langextract_contracts.ktr, from the contract files through LangExtract
// to its two branches: a row per clause, and a wide row per contract that
// is validated and routed. It replaces langextract-contract-documents.png
// at the top of 15-langextract-contract-documents/guide.md, a draw.io
// chart that showed an "HTTP Client" step with a 180-second timeout and
// an Add Constants step, neither of which the page builds.
//
// Facts it encodes (lesson 15 unless named):
//   - The step table: 1 Get file names lists every *.txt contract;
//     2 Text file input loads each file into contract_text; 3 Modified
//     JavaScript value builds contract_id and request_json; 4 REST client
//     calls LangExtract; 5 JSON input parses one row per clause; 6 Get
//     system info stamps extracted_at; 7 Table output writes normalized
//     clause rows to staging.clause_details; 8 Row denormaliser pivots the
//     target classes into one wide row per contract; 9 Modified JavaScript
//     value validates the required fields; 10 Filter rows routes valid
//     rows to staging.contract_master and the rest to
//     staging.contract_review_queue. The transformation is
//     langextract_contracts.ktr.
//   - "The two branches": Branch A, one row per extraction in
//     staging.clause_details (contract_id, class, text, start, end,
//     extracted_at); Branch B, one wide row per contract in
//     staging.contract_master (contract_id, party_a, party_b,
//     effective_date, termination, payment_terms, liability_cap,
//     governing_law, validation_status, extracted_at).
//   - Part 2: Get file names takes the contracts folder with Regular
//     Expression .*\.txt; Text file input reads into contract_text and
//     passes short_filename on.
//   - Part 3: the script sets contract_id from short_filename less ".txt"
//     and builds request_json: text (contract_text), prompt, examples (one
//     worked agreement with the seven classes), model_id 'llama3.1:8b',
//     max_char_buffer 1500, overlap 200, extraction_passes 2. REST client:
//     POST http://localhost:8765/extract, Body field request_json, Result
//     field name response_json. JSON input: class, text, start, end from
//     $.extractions[*].
//   - Part 4: Get system info adds extracted_at, type system date
//     (variable); the hop from it to Table output clause_details.
//   - Part 5: the hop from Get system info to Row denormaliser is Copy, so
//     both branches get every row; Row denormaliser has key field class,
//     group field contract_id, and a target field per class; the second
//     script sets validation_status to Y only when party_a, party_b,
//     effective_date and governing_law all have a value, else N; Filter
//     rows tests validation_status = Y, TRUE to contract_master, FALSE to
//     contract_review_queue.
//   - Part 1: the review queue has the master table's columns; the
//     service's /health gives model_url http://localhost:11434;
//     prerequisites: Ollama with llama3.1:8b.
//   - Lesson 12 (via langextract-flow.mjs): the service is uvicorn on port
//     8765, FastAPI checks the body, lx.extract chunks the text.
//
// Run from this folder:   node contract-documents-flow.svg.mjs
// It writes contract-documents-flow.svg here and
// ../images/contract-documents-flow.png at twice the size.
import { extractFlow, RX, RW, BH, stepY } from './langextract-flow.mjs';

// The shared part: nine steps down the left column, from Get file names
// to Filter rows, with the request, the service and Ollama on the right.
// The three Table output steps are drawn on the right as the tables they
// load. The hop into Row denormaliser is the copy hop: the gap between two
// steps is too narrow for a pill, so Row denormaliser's own text says
// Branch B (copy), as the clause table's says Branch A.
const { d, box } = extractFlow({
  height: 872,
  file: 'langextract_contracts.ktr',
  script: 2,
  rest: 3,
  steps: [
    { role: 'source', iconName: 'folder-search', title: 'Get file names', lines: ['the contracts folder, with', 'Regular Expression .*\\.txt'] },
    { role: 'source', iconName: 'file-input', title: 'Text file input', lines: ['each contract into contract_text;', 'short_filename passed on'] },
    { role: 'engine', iconName: 'braces', title: 'Modified JavaScript value', lines: ['contract_id from the file name;', 'request_json'] },
    { role: 'engine', iconName: 'send', title: 'REST client', lines: ['POST request_json; the reply', 'into response_json'] },
    { role: 'engine', iconName: 'file-json', title: 'JSON input', lines: ['one row per clause:', 'class, text, start, end'] },
    { role: 'engine', iconName: 'clock', title: 'Get system info', lines: ['extracted_at, the system date:', 'the time of the run'] },
    { role: 'engine', iconName: 'table-2', title: 'Row denormaliser', lines: ['Branch B (copy): one wide row', 'per contract_id, key class'] },
    { role: 'check', iconName: 'list-checks', title: 'Modified JavaScript value', lines: ['validation_status Y when the', 'four required terms are set'] },
    { role: 'check', iconName: 'split', title: 'Filter rows', lines: ['validation_status = Y'] },
  ],
  request: [
    'text: contract_text, prompt, examples (one agreement,',
    'the seven classes), model_id: llama3.1:8b,',
    'max_char_buffer: 1500, overlap: 200,',
    'extraction_passes: 2',
  ],
  chunks: ['chunks up to 1500 chars,', 'overlap 200, 2 passes'],
});
// The steps the outputs hang from: Get system info, Row denormaliser and
// Filter rows.
const [, , , , , gsi, rd, , fr] = box;

// Branch A, green (a write): level with Get system info, which feeds it
// the same rows it copies to Branch B.
const clauses = d.box({ x: RX, y: stepY(5), w: RW, h: BH, role: 'store', iconName: 'database', title: 'Table output: staging.clause_details', lines: ['Branch A (copy): a row per clause:', 'contract_id, class, text, start, end, extracted_at'] });
d.arrow({ x1: gsi.r, y1: gsi.cy, x2: clauses.x - 3, y2: clauses.cy, straight: true });

// The wide row's fields, white (a result to read), level with Row
// denormaliser, with a dashed arrow: it says what the step makes. The
// required four come next, beside the script that checks them.
const wide = d.box({ x: RX, y: stepY(6), w: RW, h: BH, role: 'result', iconName: 'table-2', title: 'The wide row: a field per class', lines: ['party_a, party_b, effective_date, termination,', 'payment_terms, liability_cap, governing_law'] });
d.arrow({ x1: rd.r, y1: rd.cy, x2: wide.x - 3, y2: wide.cy, straight: true, dashed: true });

// The two loads out of Filter rows, one above and one below its middle,
// so the TRUE and FALSE hops fan out without crossing: valid rows to the
// master table (green), the rest to the review queue (red, a reject).
// The gap is too narrow for a pill, so each box names its hop.
const master = d.box({ x: RX, y: stepY(7) + 20, w: RW, h: 56, role: 'store', iconName: 'database', title: 'Table output: staging.contract_master', lines: ['TRUE: one wide row per valid contract'] });
const queue = d.box({ x: RX, y: stepY(8) + 24, w: RW, h: 56, role: 'reject', iconName: 'database', title: 'Table output: staging.contract_review_queue', lines: ['FALSE: the same columns, validation_status N'] });
d.arrow({ x1: fr.r, y1: fr.cy - 10, x2: master.x - 3, y2: master.cy });
d.arrow({ x1: fr.r, y1: fr.cy + 10, x2: queue.x - 3, y2: queue.cy });

d.write(import.meta.url);
