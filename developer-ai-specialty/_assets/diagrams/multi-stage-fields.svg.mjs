// Multi-staged: the five stages as an assembly line. Each stage reads the
// document and the fields earlier stages added, and adds its own to the
// row, which carries everything to the next stage and on to the output.
// It replaces the text diagram multi_staged_optimized.png in part 1 of
// 11-llm-multi-staged/guide.md, under "The data".
//
// Facts it encodes (lesson 11 unless named):
//   - Part 1, "The five stages of this workshop" table: Stage 1
//     Classification reads the document, adds doc_type,
//     classification_confidence, classification_reasoning; Stage 2
//     Priority reads the document and doc_type, adds urgency (1 to 10),
//     priority (LOW, MEDIUM, HIGH, CRITICAL), priority_reasoning; Stage 3
//     Extraction reads the document and doc_type, adds extracted_details
//     (JSON, different per type); Stage 4 Actions reads the document,
//     doc_type, priority and urgency, adds actions_json, action_count,
//     requires_escalation; Stage 5 Routing reads the document and every
//     field above, adds primary_dept, escalate_to, cc_depts, sla_hours.
//   - Part 1, principles: context passes forward; Stage 3 asks different
//     questions per document type (conditional branching); every parse
//     script starts from a safe default (general_inquiry, urgency 5,
//     Support), so a failed stage passes a usable value on. The parse
//     scripts in parts 3 to 7 set doc_type "general_inquiry", urgency 5
//     and priority "MEDIUM", extracted_details "{}", actions_json "[]",
//     primary_dept "Support" and sla_hours 48 before they parse.
//   - Part 1, the data: multi_stage_documents.csv, 15 documents with
//     document_id, source, raw_text and received_date. Part 3: Read
//     Documents (CSV file input); the last step is Write Processed
//     Documents (Text file output). Part 3, "Under the hood": each step
//     adds its fields to the row it received and passes the whole row on.
//   - Each stage is three steps: build the prompt (Modified JavaScript
//     value), call the LLM (REST client), parse (Modified JavaScript
//     value), as the step names Stage N: Build …, Call LLM …, Parse …
//     show.
//
// Run from this folder:   node multi-stage-fields.svg.mjs
// It writes multi-stage-fields.svg here and
// ../images/multi-stage-fields.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 760);

// Two columns: the stage on the left (violet, a step that transforms),
// what it adds to the row on the right (green, written to the row).
const SX = 16, SW = 330, AX = 386, AW = 398, BH = 84, GAP = 18;
const y0 = 104; // first stage's top, under the input box

// The input: the file the stages read, blue (a source).
const inp = d.box({ x: SX, y: 16, w: W - 32, h: 64, role: 'source', iconName: 'file-input', title: 'Read Documents: multi_stage_documents.csv', lines: ['15 documents: document_id, source, raw_text, received_date'] });

// One entry per stage: what it reads and what it adds. Stage 3's prompt
// is chosen by doc_type, so its box says so. The fallback is the value
// the parse script starts from, where the lesson names one.
const stages = [
  { title: 'Stage 1: Classification', reads: ['reads: the document'], adds: ['doc_type, classification_confidence,', 'classification_reasoning'], fallback: 'safe default: doc_type general_inquiry' },
  { title: 'Stage 2: Priority', reads: ['reads: the document, doc_type'], adds: ['urgency (1 to 10), priority (LOW, MEDIUM,', 'HIGH, CRITICAL), priority_reasoning'], fallback: 'safe default: urgency 5, priority MEDIUM' },
  { title: 'Stage 3: Extraction', reads: ['reads: the document, doc_type;', 'its questions depend on doc_type'], adds: ['extracted_details: JSON, different', 'for each document type'], fallback: 'safe default: {}, an empty object' },
  { title: 'Stage 4: Actions', reads: ['reads: the document, doc_type,', 'priority, urgency'], adds: ['actions_json, action_count,', 'requires_escalation'], fallback: 'safe default: [], an empty list' },
  { title: 'Stage 5: Routing', reads: ['reads: the document and', 'every field above'], adds: ['primary_dept, escalate_to, cc_depts,', 'sla_hours'], fallback: 'safe default: primary_dept Support, sla_hours 48' },
];

let prev = inp; // the box the next stage's arrow starts from
stages.forEach((s, i) => {
  const y = y0 + i * (BH + GAP);
  // The stage: build, call and parse, three steps on the canvas.
  const st = d.box({ x: SX, y, w: SW, h: BH, role: 'engine', iconName: 'shuffle', title: s.title, lines: s.reads });
  // What it adds: the new fields, then the safe default in the parse.
  const ad = d.box({ x: AX, y, w: AW, h: BH, role: 'write', iconName: 'list-plus', title: 'Adds', lines: [...s.adds, s.fallback] });
  // The row flows down the stages; the first arrow comes from the input.
  d.arrow({ x1: prev === inp ? st.cx : prev.cx, y1: prev.b, x2: st.cx, y2: st.y - 3, straight: true });
  // Each stage's own answer goes into its fields.
  d.arrow({ x1: st.r, y1: st.cy, x2: ad.x - 3, y2: ad.cy, straight: true });
  prev = st;
});

// The output: every stage's decision on one row, green (a write).
const outY = y0 + 5 * (BH + GAP);
const out = d.box({ x: SX, y: outY, w: W - 32, h: 64, role: 'write', iconName: 'file-output', title: 'Write Processed Documents', lines: ['one row per document, with every stage\'s fields: an audit of each decision'] });
d.arrow({ x1: prev.cx, y1: prev.b, x2: prev.cx, y2: out.y - 3, straight: true });

// Size the canvas to the output's foot.
d.h = outY + 64 + 16;

d.write(import.meta.url);
