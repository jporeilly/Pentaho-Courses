// Contract Documents: the transformation lesson 15 builds,
// langextract_contracts.ktr. Replaces contract-documents-flow (which drew
// Text file input, llama3.1:8b and no grounding filter).
//
// Facts it encodes (lesson 15, reworked 2026-11-27):
//   - Steps: gfn-contracts, load-contracts (each whole file into
//     contract_text), js-request (contract_id, request_json), rest-extract,
//     json-clauses, flt-grounded (Filter rows start IS NOT NULL),
//     sys-extracted-at (Get system info: extracted_at; copies to both
//     branches), sv-pivot (Select values), dnorm-contracts (Row denormaliser,
//     key class, group contract_id), js-validate (validation_status Y when
//     party_a, party_b, effective_date and governing_law are set),
//     flt-valid (validation_status = Y).
//   - Branch A: tbl-clause-details, staging.clause_details. Branch B: TRUE to
//     tbl-contract-master (staging.contract_master), FALSE to tbl-review-queue
//     (staging.contract_review_queue).
//   - The request: max_char_buffer 1500, overlap 200, extraction_passes 2,
//     model_id ${LX_MODEL} (qwen2.5:7b).
//
// Run from this folder:   node 15-contract-documents-flow.svg.mjs
import { MODEL } from './12-langextract-model.mjs';
import { extractFlow, RX, RW, BH, stepY } from './langextract-flow.mjs';

const { d, box } = extractFlow({
  height: 1048,
  file: 'langextract_contracts.ktr',
  script: 2,
  rest: 3,
  steps: [
    { role: 'source', iconName: 'folder-search', title: 'gfn-contracts', lines: ['Get file names: the contracts', 'folder, .*\\.txt'] },
    { role: 'source', iconName: 'file-input', title: 'load-contracts', lines: ['Load file content in memory:', 'each contract into contract_text'] },
    { role: 'engine', iconName: 'braces', title: 'js-request', lines: ['contract_id from the file name;', 'request_json'] },
    { role: 'engine', iconName: 'send', title: 'rest-extract', lines: ['REST client: POST request_json;', 'the reply into response_json'] },
    { role: 'engine', iconName: 'file-json', title: 'json-clauses', lines: ['JSON input: one row per', 'clause: class, text, start, end'] },
    { role: 'check', iconName: 'split', title: 'flt-grounded', lines: ['Filter rows: start IS NOT NULL;', 'made-up values are dropped'] },
    { role: 'engine', iconName: 'clock', title: 'sys-extracted-at', lines: ['Get system info: extracted_at,', 'copied to both branches'] },
    { role: 'engine', iconName: 'list-filter', title: 'sv-pivot', lines: ['Branch B: contract_id, class,', 'text, extracted_at'] },
    { role: 'engine', iconName: 'table-2', title: 'dnorm-contracts', lines: ['Row denormaliser: one wide', 'row per contract_id, key class'] },
    { role: 'check', iconName: 'list-checks', title: 'js-validate', lines: ['validation_status Y when the', 'four required terms are set'] },
    { role: 'check', iconName: 'split', title: 'flt-valid', lines: ['Filter rows: validation_status = Y'] },
  ],
  request: [
    'text: contract_text, prompt, examples (one agreement,',
    `the seven classes), model_id: ${MODEL},`,
    'max_char_buffer: 1500, overlap: 200,',
    'extraction_passes: 2',
  ],
  chunks: ['chunks up to 1500 chars,', 'overlap 200, 2 passes'],
});
const [, , , , , , gsi, , rd, , fr] = box;

const clauses = d.box({ x: RX, y: stepY(6), w: RW, h: BH, role: 'store', iconName: 'database', title: 'tbl-clause-details: staging.clause_details', lines: ['Branch A (copy): a row per grounded clause:', 'contract_id, class, text, start, end, extracted_at'] });
d.arrow({ x1: gsi.r, y1: gsi.cy, x2: clauses.x - 3, y2: clauses.cy, straight: true });

const wide = d.box({ x: RX, y: stepY(8), w: RW, h: BH, role: 'result', iconName: 'table-2', title: 'The wide row: a field per class', lines: ['party_a, party_b, effective_date, termination,', 'payment_terms, liability_cap, governing_law'] });
d.arrow({ x1: rd.r, y1: rd.cy, x2: wide.x - 3, y2: wide.cy, straight: true, dashed: true });

const master = d.box({ x: RX, y: stepY(9) + 20, w: RW, h: 56, role: 'store', iconName: 'database', title: 'tbl-contract-master: staging.contract_master', lines: ['TRUE: one wide row per valid contract'] });
const queue = d.box({ x: RX, y: stepY(10) + 24, w: RW, h: 56, role: 'reject', iconName: 'database', title: 'tbl-review-queue: staging.contract_review_queue', lines: ['FALSE: the same columns, validation_status N'] });
d.arrow({ x1: fr.r, y1: fr.cy - 10, x2: master.x - 3, y2: master.cy });
d.arrow({ x1: fr.r, y1: fr.cy + 10, x2: queue.x - 3, y2: queue.cy });

d.write(import.meta.url);
