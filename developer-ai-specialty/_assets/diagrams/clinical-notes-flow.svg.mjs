// Clinical Notes: the transformation the page builds, clinical_notes.ktr,
// from the note files to the staging table, with the LangExtract service
// and Ollama it calls. It replaces rt0m9.png at the top of
// 14-langextract-clinical-notes/guide.md, a draw.io chart that showed an
// "HTTP Client" step, a second Modified JavaScript value and a Switch /
// Case into four tables, none of which the page builds.
//
// Facts it encodes (lesson 14 unless named):
//   - The step table: 1 Get file names lists every note file in the notes
//     folder; 2 Text file input reads each file into note_text; 3 Modified
//     JavaScript value builds patient_id and request_json; 4 REST client
//     calls LangExtract; 5 JSON input parses one row per extraction;
//     6 Filter rows drops unknown classes; 7 Table output writes to
//     staging.patient_extractions. The transformation is clinical_notes.ktr.
//   - The paragraph under the table: the original design's second
//     Modified JavaScript value is left out; Filter rows checks the class
//     itself. (So the diagram draws no second script and no Switch / Case.)
//   - Part 2: Get file names takes the notes folder with Regular
//     Expression .*\.txt; Text file input reads the files into one String
//     field, note_text, and passes short_filename on.
//   - Part 3: the script sets patient_id from short_filename less ".txt"
//     and builds request_json with JSON.stringify: text (note_text),
//     prompt, examples (one worked note with the four classes medication,
//     symptom, diagnosis, allergy), model_id 'llama3.1:8b',
//     max_char_buffer 1200, extraction_passes 2. REST client: POST,
//     URL http://localhost:8765/extract, Body field request_json, Result
//     field name response_json. JSON input reads response_json, with
//     class, text, start and end from $.extractions[*].
//   - Part 4: Filter rows, class IN LIST medication;symptom;diagnosis;
//     allergy; the hop to Table output is Result is TRUE, and rows of any
//     other class have no step to go to, so Filter rows discards them.
//     Table output: schema staging, table patient_extractions, fields
//     patient_id, class, text, start, end (id and extracted_at are the
//     table's defaults, part 1).
//   - Part 1: the service's /health answers status ok with model_url
//     http://localhost:11434; prerequisites: Ollama with llama3.1:8b.
//   - Lesson 12 (via langextract-flow.mjs): the service is uvicorn on port
//     8765, FastAPI checks the body, lx.extract chunks the text.
//
// Run from this folder:   node clinical-notes-flow.svg.mjs
// It writes clinical-notes-flow.svg here and
// ../images/clinical-notes-flow.png at twice the size.
import { extractFlow, RX, RW, BH, stepY } from './langextract-flow.mjs';

// The shared part: the six steps up to Filter rows in the left column,
// the request, the service and Ollama. Table output is drawn on the right
// as the table it loads, beside the row it gets from Filter rows.
const { d, box } = extractFlow({
  height: 664,
  file: 'clinical_notes.ktr',
  script: 2,
  rest: 3,
  steps: [
    { role: 'source', iconName: 'folder-search', title: 'Get file names', lines: ['the notes folder, with', 'Regular Expression .*\\.txt'] },
    { role: 'source', iconName: 'file-input', title: 'Text file input', lines: ['each note into note_text;', 'short_filename passed on'] },
    { role: 'engine', iconName: 'braces', title: 'Modified JavaScript value', lines: ['patient_id from the file name;', 'request_json'] },
    { role: 'engine', iconName: 'send', title: 'REST client', lines: ['POST request_json; the reply', 'into response_json'] },
    { role: 'engine', iconName: 'file-json', title: 'JSON input', lines: ['one row per extraction:', 'class, text, start, end'] },
    { role: 'check', iconName: 'split', title: 'Filter rows', lines: ['class IN LIST medication;', 'symptom;diagnosis;allergy'] },
  ],
  request: [
    'text: note_text, prompt, examples (one note, the',
    'four classes), model_id: llama3.1:8b,',
    'max_char_buffer: 1200, extraction_passes: 2',
  ],
  chunks: ['chunks up to 1200 chars,', '2 extraction passes'],
});

// The outputs, level with Filter rows and below it: the staging table
// (green, a write) on the TRUE hop, and the rows that have no hop (red,
// a reject), which Filter rows drops. The gap is too narrow for a pill,
// so the store's box names its hop, TRUE.
const fr = box[5];
const out = d.box({ x: RX, y: stepY(5), w: RW, h: BH, role: 'store', iconName: 'database', title: 'Table output: staging.patient_extractions', lines: ['TRUE: patient_id, class, text, start, end'] });
const drop = d.box({ x: RX, y: stepY(6) - 8, w: RW, h: 56, role: 'reject', iconName: 'ban', title: 'Any other class', lines: ['no hop to take, so Filter rows drops the row'] });
d.arrow({ x1: fr.r, y1: fr.cy, x2: out.x - 3, y2: out.cy, straight: true });
// Dashed: no hop exists; the arrow says where those rows end up.
d.arrow({ x1: fr.r, y1: fr.cy + 20, x2: drop.x - 3, y2: drop.cy, dashed: true });

d.write(import.meta.url);
