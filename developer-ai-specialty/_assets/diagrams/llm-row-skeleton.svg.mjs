// LLM Integration overview: the skeleton every LLM workshop shares. One
// row is read, a script builds the prompt and the request body, REST
// client posts it to Ollama, and the answer is parsed twice, because the
// model's JSON arrives as a string inside Ollama's own JSON. It sits under
// "What You'll Learn" in 05-llm-integration/guide.md, before the tabs.
//
// Facts it encodes:
//   - Lesson 05 intro: Pentaho Data Integration is the orchestration
//     layer and a local LLM served by Ollama does the processing; the six
//     use cases share one skeleton: build a prompt, call Ollama, parse the
//     answer.
//   - Lesson 05, Request: every workshop sends a POST to Ollama's
//     /api/generate at http://localhost:11434; the payload's model is
//     llama3.2:3b, "stream": false returns the whole answer as one JSON
//     object, "format": "json" forces the output to be valid JSON.
//   - Lesson 05, Prompt and Gotcha 1 and 5: the Modified JavaScript value
//     step builds the prompt for each row; getVariable("MODEL_NAME",
//     "llama3.2:3b") reads the parameter (not ${MODEL_NAME}); the body is
//     built with JSON.stringify(), which escapes quotes and newlines.
//   - Lesson 05, Response: "response" is a string containing JSON, not a
//     nested object, so the answer is unwrapped twice: $.response first,
//     then the model's own output. Example envelope: model llama3.2:3b,
//     response "{\"sentiment\":\"positive\",\"score\":0.9}", done true.
//   - Lesson 06 (Sentiment Analysis), the field names drawn: CSV file
//     input reads the reviews; Build Optimized Prompt (Modified JavaScript
//     value) outputs json_payload; REST client posts it to
//     ${OLLAMA_URL}/api/generate and writes the answer to llm_response;
//     Parse JSON Response (JSON input) reads $.response into
//     sentiment_json; Extract Sentiment Fields (JSON input) reads
//     $.sentiment, $.score and the rest; Text file output writes the
//     results. Lesson 06's "Under the hood": JSON inside JSON.
//   - Lessons 07, 09, 10 and 11: the other workshops make the same two
//     passes inside one Modified JavaScript value step:
//     JSON.parse(api_response), then JSON.parse of the text between the
//     first { and the last } of its response field. The figure's footnote
//     names both forms.
//
// Run from this folder:   node llm-row-skeleton.svg.mjs
// It writes llm-row-skeleton.svg here and ../images/llm-row-skeleton.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 666);

// Column geometry: the Pentaho Data Integration steps on the left, Ollama
// and the "JSON inside JSON" callout on the right.
const LX = 16, LW = 400; // left panel
const BX = 32, BW = 368, BH = 64; // step boxes inside it
const RX = 448, RW = 336; // right column
const ys = [72, 158, 244, 330, 416, 502]; // one y per step, 22px apart

// The Pentaho Data Integration panel, blue: the tool you build in.
d.panel({ x: LX, y: 16, w: LW, h: 566, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: 'one row at a time; field names from Sentiment Analysis' });

// The six steps, colored by role: a source you read (blue), steps that
// transform (violet), and the write (green).
const read = d.box({ x: BX, y: ys[0], w: BW, h: BH, role: 'source', iconName: 'file-input', title: 'CSV file input', lines: ['one row per review, record or document'] });
const build = d.box({ x: BX, y: ys[1], w: BW, h: BH, role: 'engine', iconName: 'braces', title: 'Modified JavaScript value', lines: ['getVariable("MODEL_NAME", "llama3.2:3b")', 'JSON.stringify({ model, prompt, … }) → json_payload'] });
const call = d.box({ x: BX, y: ys[2], w: BW, h: BH, role: 'engine', iconName: 'send', title: 'REST client', lines: ['POST ${OLLAMA_URL}/api/generate', 'body json_payload, answer into llm_response'] });
const p1 = d.box({ x: BX, y: ys[3], w: BW, h: BH, role: 'engine', iconName: 'file-json', title: 'Parse 1: Ollama\'s envelope', lines: ['JSON input: $.response → sentiment_json'] });
const p2 = d.box({ x: BX, y: ys[4], w: BW, h: BH, role: 'engine', iconName: 'file-json', title: 'Parse 2: the model\'s own JSON', lines: ['JSON input: $.sentiment, $.score, …'] });
const out = d.box({ x: BX, y: ys[5], w: BW, h: BH, role: 'write', iconName: 'file-output', title: 'Text file output', lines: ['one result row per input row'] });

// The row moves down the steps: one short vertical arrow between each
// pair of neighbors.
[read, build, call, p1, p2, out].reduce((a, b) => {
  d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true });
  return b;
});

// Ollama, teal (it serves the model), with the request settings that
// matter to a pipeline.
d.panel({ x: RX, y: 16, w: RW, h: 316, role: 'model', iconName: 'server', title: 'Ollama', sub: 'http://localhost:11434, on this machine' });
const gen = d.box({ x: RX + 16, y: 72, w: RW - 32, h: 96, role: 'model', iconName: 'brain', title: 'POST /api/generate', lines: ['"model": "llama3.2:3b"', '"stream": false: one whole answer', '"format": "json": valid JSON only'] });
const reply = d.box({ x: RX + 16, y: 220, w: RW - 32, h: 96, role: 'model', iconName: 'message-square-code', title: 'The reply', lines: ['one JSON object per request;', 'the answer is its "response"', 'field, held as a string'] });
// Inside Ollama: the request produces the reply.
d.arrow({ x1: gen.cx, y1: gen.b, x2: reply.cx, y2: reply.y - 3, straight: true });

// The request leaves REST client; the reply comes back into llm_response.
// The request curves up from the top of REST client's right edge; the
// reply comes back level, lower on the same edge, so the two never cross.
d.arrow({ x1: call.r, y1: call.cy - 14, x2: gen.x - 3, y2: gen.cy, label: 'POST', lx: 424, ly: 190 });
d.arrow({ x1: reply.x, y1: call.cy + 10, x2: call.r + 3, y2: call.cy + 10, dashed: true, straight: true, label: 'reply' });

// The callout: what llm_response holds, white (a result), beside the two
// parse steps, with its two layers named.
const box = d.box({ x: RX, y: 348, w: RW, h: 164, role: 'result', iconName: 'layers', title: 'JSON inside JSON', lines: [
  '{ "model": "llama3.2:3b",',
  '"response": "{\\"sentiment\\":',
  '\\"positive\\",\\"score\\":0.9}",',
  '"done": true, … }',
  '',
  'layer 1, Ollama\'s object: Parse 1',
  'layer 2, the string in "response": Parse 2',
] });
// Each parse step reads one layer: short dashed arrows from the callout.
d.arrow({ x1: box.x, y1: p1.cy, x2: p1.r + 3, y2: p1.cy, dashed: true, straight: true });
d.arrow({ x1: box.x, y1: p2.cy, x2: p2.r + 3, y2: p2.cy, dashed: true, straight: true });

// Footnote: the two forms the two parses take across the workshops.
d.bar({ x: 16, y: 598, w: W - 32, h: 52, role: 'support', iconName: 'info', title: 'Sentiment Analysis parses with two JSON input steps', line: 'The other workshops make both passes in one Modified JavaScript value: JSON.parse twice.' });

d.write(import.meta.url);
