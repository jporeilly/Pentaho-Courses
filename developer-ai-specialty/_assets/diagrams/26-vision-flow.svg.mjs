// Invoices with a Vision Model: the two transformations lesson 26 builds,
// invoices_vision.ktr down the panel with what each step reads, adds,
// calls and writes, and below it invoices_base64.ktr, the same steps with
// b64-image between gfn-invoices and const-instruction.
//
// Facts it encodes (lesson 26, files/solution/invoices_vision.ktr and
// files/solution/invoices_base64.ktr):
//   - invoices_vision.ktr, steps and hops: gfn-invoices (Get File Names,
//     ${Internal.Entry.Current.Directory}/invoices, .*\.(png|jpg): seven
//     documents, six invoices or receipts and a meeting agenda; full path
//     in filename), const-instruction (Add constants: run_instruction, the
//     JSON shape and "copy the figures exactly as printed", and message),
//     ai-invoice (AI Chat, Stream, Attach Document(s), Field Format Image,
//     Field name filename; Ollama, ${VISION_MODEL} gemma3:12b,
//     ${OLLAMA_URL}; result llm_json), json-invoice (JSON input: supplier,
//     invoice_number, invoice_date, currency, subtotal, tax, total,
//     line_count, is_invoice), js-validate (Modified JavaScript value:
//     difference = subtotal + tax - total; needs_review when it is more
//     than 0.01 off, an amount is missing, or the document is not an
//     invoice; review_reason), sv-results (13 fields), txt-results
//     (invoice_results.csv).
//   - invoices_base64.ktr: b64-image (Base64 Encoder, Source - Stream,
//     Format File, Field name filename, result image_b64) between
//     gfn-invoices and const-instruction; ai-invoice with Field Format
//     Image (Base64 Encoded), Field name image_b64; txt-results writes
//     invoice_results_base64.csv.
//
// Run from this folder:   node 26-vision-flow.svg.mjs
import { ktrFlow, W } from './ktr-flow.mjs';

const LANE_H = 56 + 64 + 16;
const { d, bottom } = ktrFlow({
  file: 'invoices_vision.ktr',
  extra: 16 + LANE_H + 16,
  steps: [
    { role: 'source', iconName: 'folder-search', title: 'gfn-invoices', lines: ['Get File Names: one row per', 'image, its path in filename'] },
    { role: 'engine', iconName: 'scroll-text', title: 'const-instruction', lines: ['Add constants: run_instruction', 'and message'] },
    { role: 'engine', iconName: 'messages-square', title: 'ai-invoice', lines: ['AI Chat: the image attached,', 'the answer into llm_json'] },
    { role: 'engine', iconName: 'file-json', title: 'json-invoice', lines: ['JSON input: llm_json', 'into nine fields'] },
    { role: 'check', iconName: 'list-checks', title: 'js-validate', lines: ['Modified JavaScript value:', 'the arithmetic check'] },
    { role: 'engine', iconName: 'list-filter', title: 'sv-results', lines: ['Select values: 13 fields,', 'in order'] },
    { role: 'write', iconName: 'file-output', title: 'txt-results', lines: ['Text file output'] },
  ],
  side: [
    { at: 0, link: 'in', role: 'source', iconName: 'folder-open', title: 'invoices: seven scanned documents', lines: ['six invoices and receipts and one agenda,', 'matching .*\\.(png|jpg)'] },
    { at: 1, link: 'sets', role: 'result', iconName: 'scroll-text', title: 'run_instruction: one JSON object', lines: ['nine keys, the figures copied exactly as', 'printed; message: read the attached document'] },
    { at: 2, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: gemma3:12b, a vision model', lines: ['${VISION_MODEL} at ${OLLAMA_URL}; Field', 'Format Image: the file in filename, as Base64'] },
    { at: 3, link: 'sets', role: 'write', iconName: 'table-2', title: 'supplier, invoice_number, invoice_date,', lines: ['currency, subtotal, tax, total,', 'line_count, is_invoice'] },
    { at: 4, link: 'sets', role: 'write', iconName: 'list-plus', title: 'difference = subtotal + tax - total', lines: ['needs_review when it is more than 0.01 off, an', 'amount is missing or it is not an invoice'] },
    { at: 6, link: 'out', role: 'write', iconName: 'file-output', title: 'invoice_results.csv', lines: ['short_filename, the nine fields, difference,', 'needs_review and review_reason: 7 rows'] },
  ],
});

// The Base64 route: invoices_base64.ktr, the same steps with one more.
const y = bottom + 16;
d.panel({ x: 16, y, w: W - 32, h: LANE_H, role: 'tool', iconName: 'workflow', title: 'invoices_base64.ktr: the Base64 route', sub: 'the same steps, with b64-image after gfn-invoices; txt-results writes invoice_results_base64.csv' });
const BW = 232, HOP = 24, X0 = 28, BY = y + 56;
const lane = [
  { role: 'engine', iconName: 'file-code', title: 'b64-image', lines: ['Base64 Encoder: the file', 'in filename, into image_b64'] },
  { role: 'engine', iconName: 'scroll-text', title: 'const-instruction', lines: ['the same run_instruction', 'and message'] },
  { role: 'engine', iconName: 'messages-square', title: 'ai-invoice', lines: ['Field Format Image (Base64', 'Encoded), field image_b64'] },
].map((s, i) => d.box({ x: X0 + i * (BW + HOP), y: BY, w: BW, h: 64, ...s }));
lane.reduce((a, b) => { d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy, straight: true }); return b; });

d.write(import.meta.url);
