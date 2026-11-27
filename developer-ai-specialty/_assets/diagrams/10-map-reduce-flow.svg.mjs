// Text Summarization, parts 5 to 10: the map-reduce transformation,
// long_document_summary.ktr. The map half runs down the left, the reduce
// half back up the right, and both AI Chat steps call the same model.
//
// Facts it encodes (lesson 10 and files/solution/long_document_summary.ktr):
//   - Steps and hops, in order: gr-document (Generate Rows, Limit 1,
//     doc_name annual_report_2024.docx), doc-read (Read Unstructured
//     Document, File, into doc_text), seg-chunks (AI Segmentation, Using
//     Tokens, Max Segment size 800, Max Overlap size 80: chunk and index,
//     numbered from 0), sv-chunks (doc_name, index, chunk), const-map
//     (run_instruction: three to five sentences per part), ai-map (AI Chat x
//     ${STEP_COPIES}, 2: message chunk, result chunk_summary), sort-chunks
//     (Sort rows on index), grp-concat (Group by doc_name: part_summaries,
//     chunk_summary joined with " | "; chunk_count), const-reduce
//     (reduce_instruction), ai-reduce (AI Chat, one copy: message
//     part_summaries, result report_summary), sv-summary, txt-summary
//     (long_document_summary.csv).
//   - Both AI Chat steps: Ollama, ${MODEL_NAME} llama3.2:3b, numCtx 4096.
//   - The copies of ai-map finish chunks out of order; Sort rows puts them
//     back in index order before Group by joins them.
//
// Run from this folder:   node 10-map-reduce-flow.svg.mjs
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BW = 264, BH = 64, PITCH = 84, TOP = 104;
const AX = 32, CX = W - 32 - BW;
const rowY = (i) => TOP + i * PITCH;
const d = new Diagram(W, rowY(5) + BH + 32);

d.panel({ x: 16, y: 16, w: W - 32, h: rowY(5) + BH + 16 - 16, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: 'long_document_summary.ktr' });
const label = (x, text) => d.raw(`<text x="${x + BW / 2}" y="${TOP - 12}" text-anchor="middle" font-size="13" font-weight="700" fill="#1e3a8a">${esc(text)}</text>`);
label(AX, 'Map: every chunk on its own');
label(CX, 'Reduce: the parts into one');

const map = [
  { role: 'source', iconName: 'rows-3', title: 'gr-document', lines: ['Generate Rows: one row,', 'annual_report_2024.docx'] },
  { role: 'engine', iconName: 'file-text', title: 'doc-read', lines: ['Read Unstructured Document:', 'the report into doc_text'] },
  { role: 'engine', iconName: 'scissors', title: 'seg-chunks', lines: ['AI Segmentation: chunks of', '800 tokens, overlap 80'] },
  { role: 'engine', iconName: 'list-filter', title: 'sv-chunks', lines: ['Select values: doc_name,', 'index, chunk'] },
  { role: 'engine', iconName: 'scroll-text', title: 'const-map', lines: ['Add constants: summarize', 'one part in 3 to 5 sentences'] },
  { role: 'engine', iconName: 'messages-square', title: 'ai-map', lines: ['AI Chat x${STEP_COPIES} (2): each', 'chunk into chunk_summary'] },
].map((s, i) => d.box({ x: AX, y: rowY(i), w: BW, h: BH, ...s }));

// The reduce half reads bottom to top, so it starts level with ai-map.
const reduce = [
  { role: 'engine', iconName: 'arrow-down-wide-narrow', title: 'sort-chunks', lines: ['Sort rows on index: the', 'parts back in order'] },
  { role: 'engine', iconName: 'combine', title: 'grp-concat', lines: ['Group by doc_name:', 'part_summaries, chunk_count'] },
  { role: 'engine', iconName: 'scroll-text', title: 'const-reduce', lines: ['Add constants:', 'reduce_instruction'] },
  { role: 'engine', iconName: 'messages-square', title: 'ai-reduce', lines: ['AI Chat, one copy: message', 'part_summaries'] },
  { role: 'engine', iconName: 'list-filter', title: 'sv-summary', lines: ['Select values: doc_name,', 'chunk_count, report_summary'] },
  { role: 'write', iconName: 'file-output', title: 'txt-summary', lines: ['Text file output:', 'long_document_summary.csv'] },
].map((s, i) => d.box({ x: CX, y: rowY(5 - i), w: BW, h: BH, ...s }));

map.reduce((a, b) => { d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true }); return b; });
reduce.reduce((a, b) => { d.arrow({ x1: a.cx, y1: a.y, x2: b.cx, y2: b.b + 3, straight: true }); return b; });

// The hop from map to reduce, level along the bottom row.
const am = map[5], sc = reduce[0];
d.arrow({ x1: am.r, y1: am.cy + 14, x2: sc.x - 3, y2: sc.cy + 14, straight: true, label: 'out of order' });

// Ollama in the middle: both AI Chat steps call it.
const ow = 120, ox = W / 2 - ow / 2;
const ol = d.box({ x: ox, y: rowY(2), w: ow, h: rowY(3) + BH - rowY(2), role: 'model', title: 'Ollama', lines: ['${MODEL_NAME},', 'llama3.2:3b,', 'numCtx 4096'], center: true });
d.raw(`<path d="M${am.r} ${am.cy - 14}C${ol.cx - 30} ${am.cy - 14} ${ol.cx - 30} ${am.cy - 14} ${ol.cx - 30} ${ol.b + 3}" fill="none" stroke="#64748b" stroke-width="1.7" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`);
const ar = reduce[3];
d.raw(`<path d="M${ar.x - 3} ${ar.cy}L${ol.r + 3} ${ar.cy}" fill="none" stroke="#64748b" stroke-width="1.7" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`);

d.write(import.meta.url);
