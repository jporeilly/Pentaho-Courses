// Multi-staged: the five stages of multi_stage_pipeline.ktr, one row per
// stage: the step that starts it (with the safe defaults for the stage
// before), the AI Chat step that asks the model, and the fields the stage
// adds to the row. Replaces multi-stage-fields.
//
// Facts it encodes (lesson 11 and files/solution/multi_stage_pipeline.ktr):
//   - Steps and hops, in order: csvi-documents (multi_stage_documents.csv,
//     15 documents, DOC-001 to DOC-015), const-instructions (Add constants:
//     the run instructions of stages 1, 2, 4 and 5), ai-classify,
//     json-classify, js-stage2, ai-priority, json-priority, js-stage3,
//     ai-extract (no JSON input: result extracted_details), js-stage4,
//     ai-actions, json-actions, js-stage5, ai-route, json-route, js-finish,
//     sv-results, txt-results (processed_documents.csv).
//   - What each stage adds: 1 doc_type, classification_confidence,
//     classification_reasoning; 2 urgency (1 to 10), priority (LOW, MEDIUM,
//     HIGH, CRITICAL), priority_reasoning; 3 extracted_details (JSON,
//     different per type; stage3_instruction chosen by doc_type); 4 actions,
//     requires_escalation; 5 primary_dept, escalate_to, cc_depts, sla_hours.
//   - Safe defaults: js-stage2 doc_type general_inquiry; js-stage3 urgency
//     5, priority MEDIUM; js-stage4 extracted_details {}; js-stage5 actions
//     ["Review manually"], requires_escalation false; js-finish Support,
//     escalate_to none, cc_depts [], sla_hours 48.
//   - Every AI Chat step: Ollama, ${MODEL_NAME} llama3.2:3b, ${STEP_COPIES}
//     2 copies. Fifteen documents, five calls each: 75 model calls.
//
// Run from this folder:   node 11-five-stages.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BH = 76, PITCH = 96, TOP = 72;
const C1 = { x: 28, w: 216 }, C2 = { x: 268, w: 220 }, C3 = { x: 512, w: 260 };
const rowY = (i) => TOP + i * PITCH;
const panelB = rowY(6) + BH + 16;
const d = new Diagram(W, panelB + 16 + 64 + 16);

d.panel({ x: 16, y: 16, w: W - 32, h: panelB - 16, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: 'multi_stage_pipeline.ktr' });
const at = (c, r, s) => d.box({ x: c.x, y: rowY(r), w: c.w, h: BH, ...s });

const csv = at(C1, 0, { role: 'source', iconName: 'file-input', title: 'csvi-documents', lines: ['CSV file input: 15', 'documents, DOC-001', 'to DOC-015'] });
d.box({ x: C2.x, y: rowY(0), w: C3.x + C3.w - C2.x, h: BH, role: 'result', iconName: 'info', title: 'One stage per row, one AI Chat call each', lines: ['Each stage reads every field the stages before it added.', 'A script fills a stage\'s missing answer with a safe default.', '15 documents x 5 stages = 75 model calls'] });

const stages = [
  { start: ['const-instructions', ['Add constants: the', 'instructions of stages', '1, 2, 4 and 5']],
    ask: ['ai-classify', ['AI Chat: stage1_json;', 'JSON input', 'json-classify']],
    adds: ['1. Classification', ['doc_type,', 'classification_confidence,', 'classification_reasoning']] },
  { start: ['js-stage2', ['default doc_type', 'general_inquiry;', 'stage2_message']],
    ask: ['ai-priority', ['AI Chat: stage2_json;', 'JSON input', 'json-priority']],
    adds: ['2. Priority', ['urgency (1 to 10), priority', '(LOW, MEDIUM, HIGH,', 'CRITICAL), priority_reasoning']] },
  { start: ['js-stage3', ['defaults urgency 5,', 'MEDIUM; an instruction', 'chosen by doc_type']],
    ask: ['ai-extract', ['AI Chat: message', 'raw_text, result', 'extracted_details']],
    adds: ['3. Extraction', ['extracted_details: JSON', 'in the shape the', 'instruction gave']] },
  { start: ['js-stage4', ['default details {};', 'stage4_message']],
    ask: ['ai-actions', ['AI Chat: stage4_json;', 'JSON input', 'json-actions']],
    adds: ['4. Actions', ['actions,', 'requires_escalation']] },
  { start: ['js-stage5', ['default actions', '["Review manually"];', 'stage5_message']],
    ask: ['ai-route', ['AI Chat: stage5_json;', 'JSON input json-route']],
    adds: ['5. Routing', ['primary_dept, escalate_to,', 'cc_depts, sla_hours']] },
];

let prev = csv;
stages.forEach((s, i) => {
  const r = i + 1;
  const a = at(C1, r, { role: 'engine', iconName: i ? 'braces' : 'scroll-text', title: s.start[0], lines: s.start[1] });
  const b = at(C2, r, { role: 'engine', iconName: 'messages-square', title: s.ask[0], lines: s.ask[1] });
  const c = at(C3, r, { role: 'write', iconName: 'list-plus', title: s.adds[0], lines: s.adds[1] });
  if (prev === csv) d.arrow({ x1: prev.cx, y1: prev.b, x2: a.cx, y2: a.y - 3, straight: true });
  else d.arrow({ x1: prev.cx, y1: prev.b, x2: a.cx, y2: a.y - 3, vertical: true });
  d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy, straight: true });
  d.arrow({ x1: b.r, y1: b.cy, x2: c.x - 3, y2: c.cy, straight: true, dashed: true });
  prev = b;
});

const fin = at(C1, 6, { role: 'engine', iconName: 'braces', title: 'js-finish', lines: ['defaults Support,', 'escalate_to none,', 'sla_hours 48'] });
const sv = at(C2, 6, { role: 'engine', iconName: 'list-filter', title: 'sv-results', lines: ['Select values: the', 'document and every', 'stage\'s decision'] });
const tx = at(C3, 6, { role: 'write', iconName: 'file-output', title: 'txt-results', lines: ['Text file output:', 'processed_documents.csv'] });
d.arrow({ x1: prev.cx, y1: prev.b, x2: fin.cx, y2: fin.y - 3, vertical: true });
d.arrow({ x1: fin.r, y1: fin.cy, x2: sv.x - 3, y2: sv.cy, straight: true });
d.arrow({ x1: sv.r, y1: sv.cy, x2: tx.x - 3, y2: tx.cy, straight: true });

d.bar({ x: 16, y: panelB + 16, w: W - 32, h: 64, role: 'model', iconName: 'brain', title: 'Ollama: ${MODEL_NAME}, llama3.2:3b, on ${OLLAMA_URL}', line: 'every AI Chat step calls it, in ${STEP_COPIES} (2) copies; parallel within a stage, never between stages' });

d.write(import.meta.url);
