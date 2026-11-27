// Support Tickets: the transformation lesson 13 builds, ticket_triage.ktr,
// with the LangExtract service and Ollama it calls. Replaces
// support-tickets-flow (which drew the older design: llama3.1:8b, a buffer
// Dummy step and production tables).
//
// Facts it encodes (lesson 13, reworked 2026-11-27):
//   - Steps, in order: tbl-tickets (Table input, helpdesk.tickets WHERE
//     processed = 0: ticket_id, ticket_text), js-request (request_json),
//     rest-extract (REST client, POST http://localhost:8765/extract, body
//     request_json, result response_json), json-extractions (class, text,
//     start, end from $.extractions[*]), sv-pivot (Select values: ticket_id,
//     class, text), dnorm-tickets (Row denormaliser, key class, group
//     ticket_id), flt-critical (Filter rows urgency = Critical).
//   - The request: text (ticket_text), prompt, one worked example with five
//     classes, model_id ${LX_MODEL} (qwen2.5:7b), max_char_buffer 1200,
//     extraction_passes 2.
//   - The ticket row: issue_type, affected_system (system), urgency,
//     submitter (user), error_code.
//   - TRUE rows go to the Dummy step critical, FALSE rows to others.
//
// Run from this folder:   node 13-support-tickets-flow.svg.mjs
import { MODEL } from './12-langextract-model.mjs';
import { extractFlow, RX, RW, BH, stepY } from './langextract-flow.mjs';

const { d, box } = extractFlow({
  height: 732,
  file: 'ticket_triage.ktr',
  script: 1,
  rest: 2,
  steps: [
    { role: 'source', iconName: 'database-search', title: 'tbl-tickets', lines: ['Table input: helpdesk.tickets,', 'processed = 0'] },
    { role: 'engine', iconName: 'braces', title: 'js-request', lines: ['Modified JavaScript value:', 'request_json for each ticket'] },
    { role: 'engine', iconName: 'send', title: 'rest-extract', lines: ['REST client: POST request_json;', 'the reply into response_json'] },
    { role: 'engine', iconName: 'file-json', title: 'json-extractions', lines: ['JSON input: one row per', 'extraction: class, text, start, end'] },
    { role: 'engine', iconName: 'list-filter', title: 'sv-pivot', lines: ['Select values: keeps', 'ticket_id, class, text'] },
    { role: 'engine', iconName: 'table-2', title: 'dnorm-tickets', lines: ['Row denormaliser: key class,', 'one row per ticket_id'] },
    { role: 'check', iconName: 'split', title: 'flt-critical', lines: ['Filter rows: urgency = Critical'] },
  ],
  request: [
    'text: ticket_text, prompt, examples (one ticket,',
    `the five classes), model_id: ${MODEL},`,
    'max_char_buffer: 1200, extraction_passes: 2',
  ],
  chunks: ['chunks up to 1200 chars,', '2 extraction passes'],
});
const [, , , , , rd, fr] = box;

const row = d.box({ x: RX, y: stepY(5), w: RW, h: BH, role: 'result', iconName: 'table-2', title: 'The ticket row: a field per class', lines: ['issue_type, affected_system (system), urgency,', 'submitter (user), error_code'] });
d.arrow({ x1: rd.r, y1: rd.cy, x2: row.x - 3, y2: row.cy, straight: true, dashed: true });

const crit = d.box({ x: RX, y: stepY(6) - 4, w: RW, h: 56, role: 'support', iconName: 'circle-dashed', title: 'critical: Dummy (do nothing)', lines: ['TRUE: the tickets to escalate'] });
const oth = d.box({ x: RX, y: stepY(6) + 60, w: RW, h: 56, role: 'support', iconName: 'circle-dashed', title: 'others: Dummy (do nothing)', lines: ['FALSE: every other urgency, or none'] });
d.arrow({ x1: fr.r, y1: fr.cy - 10, x2: crit.x - 3, y2: crit.cy });
d.arrow({ x1: fr.r, y1: fr.cy + 10, x2: oth.x - 3, y2: oth.cy });

d.write(import.meta.url);
