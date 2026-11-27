// Clinical Notes: the transformation lesson 14 builds, clinical_notes.ktr.
// Replaces clinical-notes-flow (which drew Text file input and llama3.1:8b).
//
// Facts it encodes (lesson 14, reworked 2026-11-27):
//   - Steps: gfn-notes (Get file names, the notes folder, .*\.txt),
//     load-notes (Load file content in memory: each whole file into
//     note_text), js-request (patient_id from short_filename, request_json),
//     rest-extract (REST client, POST /extract), json-extractions (class,
//     text, start, end), flt-classes (Filter rows class IN LIST
//     medication;symptom;diagnosis;allergy).
//   - TRUE rows go to tbl-extractions (Table output, staging.patient_extractions:
//     patient_id, class, text, start, end); other rows have no hop and are dropped.
//   - The request: max_char_buffer 1200, extraction_passes 2, model_id
//     ${LX_MODEL} (qwen2.5:7b).
//
// Run from this folder:   node 14-clinical-notes-flow.svg.mjs
import { MODEL } from './12-langextract-model.mjs';
import { extractFlow, RX, RW, BH, stepY } from './langextract-flow.mjs';

const { d, box } = extractFlow({
  height: 664,
  file: 'clinical_notes.ktr',
  script: 2,
  rest: 3,
  steps: [
    { role: 'source', iconName: 'folder-search', title: 'gfn-notes', lines: ['Get file names: the notes', 'folder, .*\\.txt'] },
    { role: 'source', iconName: 'file-input', title: 'load-notes', lines: ['Load file content in memory:', 'each whole note into note_text'] },
    { role: 'engine', iconName: 'braces', title: 'js-request', lines: ['patient_id from the file name;', 'request_json'] },
    { role: 'engine', iconName: 'send', title: 'rest-extract', lines: ['REST client: POST request_json;', 'the reply into response_json'] },
    { role: 'engine', iconName: 'file-json', title: 'json-extractions', lines: ['JSON input: one row per', 'extraction: class, text, start, end'] },
    { role: 'check', iconName: 'split', title: 'flt-classes', lines: ['class IN LIST medication;', 'symptom;diagnosis;allergy'] },
  ],
  request: [
    'text: note_text, prompt, examples (one note, the',
    `four classes), model_id: ${MODEL},`,
    'max_char_buffer: 1200, extraction_passes: 2',
  ],
  chunks: ['chunks up to 1200 chars,', '2 extraction passes'],
});

const fr = box[5];
const out = d.box({ x: RX, y: stepY(5), w: RW, h: BH, role: 'store', iconName: 'database', title: 'tbl-extractions: staging.patient_extractions', lines: ['TRUE: patient_id, class, text, start, end'] });
const drop = d.box({ x: RX, y: stepY(6) - 8, w: RW, h: 56, role: 'reject', iconName: 'ban', title: 'Any other class', lines: ['no hop to take, so Filter rows drops the row'] });
d.arrow({ x1: fr.r, y1: fr.cy, x2: out.x - 3, y2: out.cy, straight: true });
d.arrow({ x1: fr.r, y1: fr.cy + 20, x2: drop.x - 3, y2: drop.cy, dashed: true });

d.write(import.meta.url);
