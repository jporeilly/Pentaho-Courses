// Evaluate the Answers: evaluate_rag.ktr, summarized. Its 22 steps are
// too many for ktr-flow's one box per step, so each lane is one stage of
// the lesson, its box naming the real steps in it, and beside it, level
// with it, the one thing the stage reads, adds, calls or writes.
//
// Facts it encodes (lesson 27 and files/solution/evaluate_rag.ktr):
//   - Retrieve once: csvi-eval (CSV file input, eval_set.csv: 15
//     questions, 12 answerable, the rest expected_source none),
//     emb-question (Text to Vector, nomic-embed-text), vs-kb (Vector
//     Search, kb_chunks, Max results ${TOP_K} 4).
//   - Two settings: dg-settings (Data grid: top_k_1 with 1, top_k_4 with
//     4) and join-settings (Join rows (cartesian product), main step
//     vs-kb): 15 questions x 2 settings = 30 rows.
//   - Answer: js-prompt (the prompt from the first top_k passages;
//     hit_rank, facts_in_context, facts_total), const-instruction,
//     ai-answer (AI Chat, ${MODEL_NAME} llama3.2:3b, llm_json),
//     json-answer.
//   - Judge: js-judge-prompt (question, expected facts, passages, answer),
//     const-judge (judge_instruction, the rubric), ai-judge (AI Chat,
//     ${JUDGE_MODEL} qwen2.5:7b, temperature 0, judge_json), json-verdict
//     (verdict, faithful, reason, missing_facts, unsupported_claims).
//   - Scores: frmla-scores (a 0 or 1 per measure; copies each row to
//     sv-results and srt-setting), sv-results, txt-results
//     (eval_results.csv, 30 rows).
//   - Scorecard: srt-setting, grp-scorecard (Group by setting, top_k),
//     frmla-scorecard (the rates, run_date), gv-models (answer_model,
//     judge_model), sv-scorecard, txt-scorecard
//     (scorecard_<date>_<time>.csv, 2 rows, a new file every run).
//
// Run from this folder:   node 27-evaluation-flow.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, PX = 16, PW = 424, BX = PX + 12, BW = PW - 24, BH = 76, PITCH = 96, TOP = 72;
const RX = 476, RW = W - 16 - RX;

const stages = [
  { role: 'check', iconName: 'text-search', title: 'Retrieve once: 4 passages per question', lines: ['csvi-eval: CSV file input, 15 questions', 'emb-question: Text to Vector, nomic-embed-text', 'vs-kb: Vector Search, kb_chunks, ${TOP_K} 4'] },
  { role: 'engine', iconName: 'merge', title: 'Two settings: join-settings', lines: ['Join rows (cartesian product), main step', 'vs-kb: 15 questions x 2 settings = 30 rows'] },
  { role: 'engine', iconName: 'messages-square', title: 'Answer: ai-answer', lines: ['js-prompt: the first top_k passages; hit_rank,', 'facts_in_context; const-instruction,', 'ai-answer, json-answer: answer, found'] },
  { role: 'engine', iconName: 'messages-square', title: 'Judge: ai-judge', lines: ['js-judge-prompt: question, expected facts,', 'passages, answer; const-judge: the rubric;', 'ai-judge, json-verdict: verdict, faithful'] },
  { role: 'engine', iconName: 'square-function', title: 'Scores: frmla-scores', lines: ['Formula: a 0 or 1 per measure, each row', 'copied to the scorecard too; sv-results,', 'txt-results'] },
  { role: 'engine', iconName: 'sigma', title: 'Scorecard: grp-scorecard', lines: ['srt-setting, grp-scorecard: Group by setting;', 'frmla-scorecard: the rates; gv-models: the', 'two models; sv-scorecard, txt-scorecard'] },
];
const side = [
  { at: 0, link: 'in', role: 'source', iconName: 'file-input', title: 'eval_set.csv: 15 questions', lines: ['expected_source and expected_facts;', '12 answerable, 3 the documents', 'cannot answer'] },
  { at: 1, link: 'in', role: 'source', iconName: 'sheet', title: 'dg-settings: Data grid', lines: ['top_k_1: the best passage only', 'top_k_4: the best 4 passages'] },
  { at: 2, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: llama3.2:3b', lines: ['${MODEL_NAME}, the model under test,', 'as in Answer Questions'] },
  { at: 3, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: qwen2.5:7b', lines: ['${JUDGE_MODEL}, a stronger model,', 'temperature 0; reply in judge_json'] },
  { at: 4, link: 'out', role: 'write', iconName: 'file-output', title: 'eval_results.csv', lines: ['30 rows, one per question and', 'setting, with the verdict and reason'] },
  { at: 5, link: 'out', role: 'write', iconName: 'file-output', title: 'scorecard_<date>_<time>.csv', lines: ['one row per setting: hit_rate, mrr,', 'context_recall, accuracy, faithfulness;', 'a new file on every run'] },
];

const y = (i) => TOP + i * PITCH;
const last = y(stages.length - 1) + BH;
const d = new Diagram(W, last + 32);
d.panel({ x: PX, y: 16, w: PW, h: last, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: 'evaluate_rag.ktr: its 22 steps, stage by stage' });
const box = stages.map((s, i) => d.box({ x: BX, y: y(i), w: BW, h: BH, ...s }));
box.reduce((a, b) => { d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true }); return b; });
side.forEach((s) => {
  const st = box[s.at];
  const b = d.box({ x: RX, y: st.y, w: RW, h: BH, role: s.role, iconName: s.iconName, title: s.title, lines: s.lines });
  if (s.link === 'in') d.arrow({ x1: b.x, y1: b.cy, x2: st.r + 3, y2: st.cy, straight: true });
  if (s.link === 'out') d.arrow({ x1: st.r, y1: st.cy, x2: b.x - 3, y2: b.cy, straight: true });
  if (s.link === 'call') {
    d.arrow({ x1: st.r, y1: st.cy - 9, x2: b.x - 3, y2: b.cy - 9, straight: true });
    d.arrow({ x1: b.x, y1: b.cy + 9, x2: st.r + 3, y2: st.cy + 9, straight: true, dashed: true });
  }
});

d.write(import.meta.url);
