// LLM Integration overview: what AI Chat does with one row. The row's
// message and run instruction go to Ollama's chat API as one request, the
// model's reply comes back into a result field, and JSON input turns that
// JSON text into fields. Replaces llm-row-skeleton.
//
// Facts it encodes (lesson 05):
//   - Message tab, Stream: Message Field name and Run instruction for LLM
//     Field name, fields of the incoming row; the workshops add the run
//     instruction with Add constants as run_instruction. With no run
//     instruction field, the step uses "You are a helpful assistant".
//   - Model tab: LLM Provider Ollama, Model name ${MODEL_NAME}; Model
//     Configuration endpoint ${OLLAMA_URL}, temperature 0, numCtx, timeout.
//   - Under the Hood: one request per row to ${OLLAMA_URL}/api/chat; the
//     run instruction becomes the system message, the message the user
//     message; model and options from the Model tab; stream false. The step
//     copies message.content into the Result Field name (llm_json); it does
//     not pass on prompt_eval_count, eval_count or total_duration.
//   - JSON answers: the run instruction asks for one JSON object; JSON
//     input, Source is from a previous step, one row per key such as
//     $.sentiment; Ignore missing path and Default path leaf to null turn a
//     missing key into a null field.
//
// Run from this folder:   node 05-ai-chat-row.svg.mjs
import { ktrFlow } from './ktr-flow.mjs';

const { d, side } = ktrFlow({
  file: 'one row through AI Chat',
  steps: [
    { role: 'source', iconName: 'rows-3', title: 'One row arrives', lines: ['a message field, such as review_text,', 'and a run_instruction field'] },
    { role: 'engine', iconName: 'messages-square', title: 'AI Chat', lines: ['Message: Stream. Model: Ollama,', '${MODEL_NAME}. Result: llm_json'] },
    { role: 'result', iconName: 'table-2', title: 'The row, plus llm_json', lines: ['the model\'s answer: one JSON', 'object, as text'] },
    { role: 'engine', iconName: 'file-json', title: 'JSON input', lines: ['Source is from a previous step:', 'llm_json; one row per key'] },
    { role: 'write', iconName: 'list-plus', title: 'The row, with new fields', lines: ['$.sentiment becomes sentiment;', 'a missing key becomes null'] },
  ],
  side: [
    { at: 0, link: 'sets', role: 'result', iconName: 'scroll-text', title: 'run_instruction: how to answer', lines: ['a command, the answer\'s exact JSON shape,', 'and "nothing else"; the data stays out'] },
    { at: 1, link: 'out', role: 'model', iconName: 'brain', title: 'Ollama: POST ${OLLAMA_URL}/api/chat', lines: ['model; messages: system = run instruction,', 'user = message; stream false; options'] },
    { at: 2, link: 'in', role: 'result', iconName: 'message-square-code', title: 'Ollama\'s reply', lines: ['message.content goes into llm_json; the', 'token counts and timings are dropped'] },
  ],
});
// The reply comes back from Ollama.
d.arrow({ x1: side[1].cx, y1: side[1].b, x2: side[2].cx, y2: side[2].y - 3, straight: true, dashed: true });
d.write(import.meta.url);
