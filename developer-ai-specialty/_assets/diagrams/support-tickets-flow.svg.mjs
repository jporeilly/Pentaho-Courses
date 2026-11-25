// Support Tickets: the production design of ticket_triage.ktr, from the
// tickets table through LangExtract to the two tables the critical and
// the other tickets load. It replaces langextract-support-tickets.png in
// 13-langextract-support-tickets/guide.md, a draw.io chart with tiny text
// that put Select values after Row denormaliser, left out the buffer
// step, and tested urgency against "Critical" where the lab tests
// CRITICAL.
//
// Facts it encodes (lesson 13 unless named):
//   - Intro: each ticket becomes one row with ticket_id, issue_type,
//     affected_system, urgency, submitter and error_code, split on
//     urgency; in production the branches load helpdesk.ticket_triage
//     (most tickets) and helpdesk.escalations (the critical ones); the lab
//     ends each branch in a Dummy (do nothing) step instead.
//   - Part 3: Table input on the connection PG:Helpdesk runs SELECT
//     ticket_id, ticket_text FROM helpdesk.tickets WHERE processed = 0
//     ORDER BY created_at ASC.
//   - Part 4: Modified JavaScript value builds request_json with
//     JSON.stringify: text (ticket_text), prompt, examples (one worked
//     ticket with the five classes issue_type, system, urgency, user,
//     error_code), model_id 'llama3.1:8b', max_char_buffer 1200,
//     extraction_passes 2.
//   - Part 5: REST client, POST http://localhost:8765/extract, Body field
//     request_json, Result field name response_json; JSON input reads
//     response_json, with class, text, start and end from
//     $.extractions[*]. "Under the hood": the service calls lx.extract
//     with the model model_id names on your Ollama.
//   - Part 6, in this order: Select values keeps ticket_id, class and
//     text; a Dummy (do nothing) named buffer passes the rows on
//     unchanged; Row denormaliser, key field class, group field ticket_id,
//     target fields issue_type (key issue_type), affected_system (system),
//     urgency (urgency), submitter (user), error_code (error_code); Filter
//     rows tests urgency = CRITICAL, TRUE to critical, FALSE to others
//     (the two Dummy steps that stand in for the production tables).
//   - Part 1 and the Overview (lesson 12, via langextract-flow.mjs): the
//     service is uvicorn on port 8765, FastAPI checks the body, lx.extract
//     chunks the text; Ollama runs on http://localhost:11434.
//
// Run from this folder:   node support-tickets-flow.svg.mjs
// It writes support-tickets-flow.svg here and
// ../images/support-tickets-flow.png at twice the size.
import { extractFlow, RX, RW, BH, stepY } from './langextract-flow.mjs';

// The shared part: the eight steps from Table input to Filter rows in
// the left column, with the request, the service and Ollama on the
// right. The two Table output steps are drawn on the right as the tables
// they load.
const { d, box } = extractFlow({
  height: 820,
  file: 'ticket_triage.ktr',
  script: 1,
  rest: 2,
  steps: [
    { role: 'source', iconName: 'database-search', title: 'Table input', lines: ['helpdesk.tickets, processed = 0:', 'ticket_id, ticket_text'] },
    { role: 'engine', iconName: 'braces', title: 'Modified JavaScript value', lines: ['request_json for each ticket'] },
    { role: 'engine', iconName: 'send', title: 'REST client', lines: ['POST request_json; the reply', 'into response_json'] },
    { role: 'engine', iconName: 'file-json', title: 'JSON input', lines: ['one row per extraction:', 'class, text, start, end'] },
    { role: 'engine', iconName: 'list-filter', title: 'Select values', lines: ['keeps ticket_id, class, text'] },
    { role: 'support', iconName: 'circle-dashed', title: 'buffer', lines: ['Dummy (do nothing):', 'the rows pass unchanged'] },
    { role: 'engine', iconName: 'table-2', title: 'Row denormaliser', lines: ['key class, group ticket_id:', 'one row per ticket'] },
    { role: 'check', iconName: 'split', title: 'Filter rows', lines: ['urgency = CRITICAL'] },
  ],
  request: [
    'text: ticket_text, prompt, examples (one ticket,',
    'the five classes), model_id: llama3.1:8b,',
    'max_char_buffer: 1200, extraction_passes: 2',
  ],
  chunks: ['chunks up to 1200 chars,', '2 extraction passes'],
});
// The steps the right-hand boxes hang from: Row denormaliser and Filter rows.
const [, , , , , , rd, fr] = box;

// The ticket row's fields, white (a result to read), level with Row
// denormaliser, with a dashed arrow: it says what the step makes. Each
// target field is named, with the class it takes its text from where the
// two differ.
const row = d.box({ x: RX, y: stepY(6), w: RW, h: BH, role: 'result', iconName: 'table-2', title: 'The ticket row: a field per class', lines: ['issue_type, affected_system (system), urgency,', 'submitter (user), error_code'] });
d.arrow({ x1: rd.r, y1: rd.cy, x2: row.x - 3, y2: row.cy, straight: true, dashed: true });

// The two production loads out of Filter rows, green (writes), one above
// and one below its middle so the hops fan out without crossing. The gap
// is too narrow for a pill, so each box names its hop and the Dummy step
// the lab puts in its place.
const esc = d.box({ x: RX, y: stepY(7) - 4, w: RW, h: 56, role: 'store', iconName: 'database', title: 'Table output: helpdesk.escalations', lines: ['TRUE; the lab ends in the Dummy step critical'] });
const tri = d.box({ x: RX, y: stepY(7) + 60, w: RW, h: 56, role: 'store', iconName: 'database', title: 'Table output: helpdesk.ticket_triage', lines: ['FALSE; the lab ends in the Dummy step others'] });
d.arrow({ x1: fr.r, y1: fr.cy - 10, x2: esc.x - 3, y2: esc.cy });
d.arrow({ x1: fr.r, y1: fr.cy + 10, x2: tri.x - 3, y2: tri.cy });

d.write(import.meta.url);
