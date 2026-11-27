// Named Entity Recognition: named_entity_recognition.ktr, one input read
// two ways. Left, NER Extractor (Stanford CoreNLP, no LLM); right, AI Chat
// and a local LLM on Ollama. Both branches end in the same five fields,
// merge in Sort rows, and are written and counted.
//
// Facts it encodes (lesson 09 and files/solution/named_entity_recognition.ktr):
//   - csvi-documents (ner_documents.csv: ten documents, document_id,
//     source, text) copies every row to both branches.
//   - NER branch: ner-corenlp (NER Extractor, Stream, field text, annotators
//     tokenize,ssplit,pos,lemma,ner; result ner_json, a JSON array with
//     offsets), json-ner ($[*].text, $[*].ner into entity_text,
//     entity_type), const-method-ner (method NER Extractor), sv-ner.
//   - LLM branch: const-instruction (run_instruction naming ten types, and
//     method AI Chat), ai-extract (AI Chat x ${STEP_COPIES}, message text,
//     ${MODEL_NAME} llama3.2:3b, result llm_json), json-llm
//     ($.entities[*].text, $.entities[*].type), sv-llm.
//   - Both Select values give document_id, source, method, entity_text,
//     entity_type in the same order; sort-entities (Sort rows on
//     document_id, method, entity_type) merges them; txt-entities
//     (entities.csv); grp-counts (Group by document_id, method:
//     entity_count) and txt-counts (entity_counts.csv).
//
// Run from this folder:   node 09-ner-two-ways.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BW = 344, BH = 64, PITCH = 84, TOP = 72;
const LX = 32, RX = W - 32 - BW, MX = W / 2 - BW / 2;
const rowY = (i, extra = 0) => TOP + i * PITCH + extra;
const HEAD = 60; // room for the branch panels' title strips
const LOW = HEAD + 20; // the merge rows, below the branch panels
const H = rowY(7, LOW) + BH + 32;
const d = new Diagram(W, H);
d.panel({ x: 16, y: 16, w: W - 32, h: H - 32, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: 'named_entity_recognition.ktr' });

const src = d.box({ x: MX, y: rowY(0), w: BW, h: BH, role: 'source', iconName: 'file-input', title: 'csvi-documents', lines: ['CSV file input: ner_documents.csv, ten', 'documents; every row goes to both branches'] });

const branch = (x, title, sub) => d.panel({ x: x - 8, y: rowY(1, HEAD) - 56, w: BW + 16, h: 56 + 3 * PITCH + BH + 12, role: 'support', title, sub });
const lp = branch(LX, 'NER Extractor: Stanford CoreNLP', 'offline, no LLM; its own types, with offsets');
const rp = branch(RX, 'AI Chat: a local LLM on Ollama', 'the ten types the instruction names');

const col = (x, steps) => {
  const b = steps.map((s, i) => d.box({ x, y: rowY(i + 1, HEAD), w: BW, h: BH, ...s }));
  b.reduce((a, c) => { d.arrow({ x1: a.cx, y1: a.b, x2: c.cx, y2: c.y - 3, straight: true }); return c; });
  return b;
};
const ner = col(LX, [
  { role: 'engine', iconName: 'scan-text', title: 'ner-corenlp', lines: ['NER Extractor: tokenize,ssplit,pos,lemma,', 'ner over text; a JSON array, ner_json'] },
  { role: 'engine', iconName: 'file-json', title: 'json-ner', lines: ['JSON input: $[*].text and $[*].ner,', 'one row per entity'] },
  { role: 'engine', iconName: 'scroll-text', title: 'const-method-ner', lines: ['Add constants: method', 'NER Extractor'] },
  { role: 'engine', iconName: 'list-filter', title: 'sv-ner', lines: ['Select values: document_id, source,', 'method, entity_text, entity_type'] },
]);
const llm = col(RX, [
  { role: 'engine', iconName: 'scroll-text', title: 'const-instruction', lines: ['Add constants: run_instruction,', 'and method AI Chat'] },
  { role: 'engine', iconName: 'messages-square', title: 'ai-extract', lines: ['AI Chat x${STEP_COPIES}: message text,', '${MODEL_NAME} llama3.2:3b, llm_json'] },
  { role: 'engine', iconName: 'file-json', title: 'json-llm', lines: ['JSON input: $.entities[*].text and', '$.entities[*].type, one row per entity'] },
  { role: 'engine', iconName: 'list-filter', title: 'sv-llm', lines: ['Select values: the same five', 'fields, in the same order'] },
]);
d.arrow({ x1: src.x + 40, y1: src.b, x2: lp.cx, y2: lp.y - 3, vertical: true });
d.arrow({ x1: src.r - 40, y1: src.b, x2: rp.cx, y2: rp.y - 3, vertical: true });

const sort = d.box({ x: MX, y: rowY(5, LOW), w: BW, h: BH, role: 'engine', iconName: 'arrow-down-wide-narrow', title: 'sort-entities', lines: ['Sort rows: both branches merged, by', 'document_id, method, entity_type'] });
d.arrow({ x1: lp.cx, y1: lp.b, x2: sort.x + 40, y2: sort.y - 3, vertical: true });
d.arrow({ x1: rp.cx, y1: rp.b, x2: sort.r - 40, y2: sort.y - 3, vertical: true });

const te = d.box({ x: LX, y: rowY(6, LOW), w: BW, h: BH, role: 'write', iconName: 'file-output', title: 'txt-entities', lines: ['Text file output: entities.csv,', 'every entity from both methods'] });
const gc = d.box({ x: RX, y: rowY(6, LOW), w: BW, h: BH, role: 'engine', iconName: 'sigma', title: 'grp-counts', lines: ['Group by document_id, method:', 'entity_count'] });
const tc = d.box({ x: RX, y: rowY(7, LOW), w: BW, h: BH, role: 'write', iconName: 'file-output', title: 'txt-counts', lines: ['Text file output: entity_counts.csv,', 'two rows per document'] });
d.arrow({ x1: sort.x + 40, y1: sort.b, x2: te.cx, y2: te.y - 3, vertical: true });
d.arrow({ x1: sort.r - 40, y1: sort.b, x2: gc.cx, y2: gc.y - 3, vertical: true });
d.arrow({ x1: gc.cx, y1: gc.b, x2: tc.cx, y2: tc.y - 3, straight: true });

d.write(import.meta.url);
