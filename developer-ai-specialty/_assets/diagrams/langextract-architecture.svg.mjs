// LangExtract overview: how Pentaho Data Integration, the LangExtract
// service and Ollama fit together, and the two sets of field names a
// reader must not mix up. It replaces langextract-pipeline-architecture
// .png at the top of 12-langextract/guide.md.
//
// Facts it encodes:
//   - Lesson 12: the service runs with uvicorn on port 8765
//     (http://localhost:8765), endpoint POST /extract, and uses the local
//     Ollama as its backend, so data stays on the machine; the recommended
//     pattern is REST service: input, REST client, JSON input, transform,
//     output. LX_MODEL_URL is the Ollama address (http://localhost:11434
//     by default) and LX_DEFAULT_MODEL the model when a request names
//     none (llama3.2:3b by default).
//   - Lesson 12, API contract: the request carries text, prompt and
//     examples, each example with extractions of extraction_class and
//     extraction_text, plus optional model_id, max_char_buffer, overlap
//     and extraction_passes; the response is extractions, each with
//     class, text, start and end. The warning: read the response as
//     class, text, start and end, not as extraction_class and
//     extraction_text.
//   - Lesson 13 (Support Tickets), the steps drawn: Table input reads
//     ticket_id and ticket_text; Modified JavaScript value builds
//     request_json with JSON.stringify (text, prompt, examples, model_id,
//     max_char_buffer, extraction_passes); REST client posts request_json
//     to http://localhost:8765/extract and writes the reply to
//     response_json; JSON input reads $.extractions[*].class, .text,
//     .start and .end, one row per extraction; Row denormaliser builds one
//     row per ticket, putting each text in the field its class names.
//     "Under the hood": the service calls lx.extract with the prompt, the
//     examples and the model; it passes max_char_buffer, overlap and
//     extraction_passes on when the installed version accepts them; each
//     extraction comes back with its character offsets, start and end.
//   - Lesson 16 table: LangExtract makes 1 LLM call per extraction pass
//     over the chunked text; lesson 15: long texts need chunk overlap.
//
// Run from this folder:   node langextract-architecture.svg.mjs
// It writes langextract-architecture.svg here and
// ../images/langextract-architecture.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 560);

// Rows shared by every column, so a step and the service part it talks
// to sit level with each other.
const BH = 72, ys = [72, 164, 256, 348, 440];

// Pentaho Data Integration, blue: the steps of Support Tickets.
const PX = 16, PW = 288;
d.panel({ x: PX, y: 16, w: PW, h: 512, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: 'the Support Tickets steps' });
const bw = PW - 24, bx = PX + 12;
const ti = d.box({ x: bx, y: ys[0], w: bw, h: BH, role: 'source', iconName: 'database-search', title: 'Table input', lines: ['ticket_id, ticket_text'] });
const js = d.box({ x: bx, y: ys[1], w: bw, h: BH, role: 'engine', iconName: 'braces', title: 'Modified JavaScript value', lines: ['JSON.stringify(…) → request_json'] });
const rc = d.box({ x: bx, y: ys[2], w: bw, h: BH, role: 'engine', iconName: 'send', title: 'REST client', lines: ['POST request_json; the reply', 'into response_json'] });
const ji = d.box({ x: bx, y: ys[3], w: bw, h: BH, role: 'engine', iconName: 'file-json', title: 'JSON input', lines: ['$.extractions[*].class, .text,', '.start, .end: a row each'] });
const rd = d.box({ x: bx, y: ys[4], w: bw, h: BH, role: 'engine', iconName: 'table-2', title: 'Row denormaliser', lines: ['one row per ticket: each text', 'into the field its class names'] });
// The row moves down the steps.
[ti, js, rc, ji, rd].reduce((a, b) => {
  d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true });
  return b;
});

// Top right: the two field-name sets, white (results to read), level
// with the first two steps. The request side is what the script builds.
const RX = 344, RW = 440;
const req = d.box({ x: RX, y: ys[0] - 56, w: RW, h: 80, role: 'result', iconName: 'arrow-up-right', title: 'Request: what you send', lines: ['text, prompt, examples: [{ text, extractions:', '[{ extraction_class, extraction_text }] }]'] });
const res = d.box({ x: RX, y: ys[0] + 36, w: RW, h: 64, role: 'result', iconName: 'arrow-down-left', title: 'Response: what comes back', lines: ['extractions: [{ class, text, start, end }]'] });
// The script builds the request; JSON input reads the response. Dashed:
// these say which shape each step handles, not a message.
d.arrow({ x1: js.r, y1: js.cy - 14, x2: req.x - 3, y2: req.cy, dashed: true });

// The LangExtract service, violet (a server), level with REST client
// and below.
const SX = 344, SW = 252;
d.panel({ x: SX, y: 204, w: SW, h: 324, role: 'server', iconName: 'server', title: 'LangExtract service', sub: 'uvicorn, localhost:8765' });
const sb = SW - 24, sx = SX + 12;
const api = d.box({ x: sx, y: ys[2], w: sb, h: BH, role: 'server', iconName: 'route', title: 'POST /extract', lines: ['FastAPI checks the body'] });
const lx = d.box({ x: sx, y: ys[3], w: sb, h: BH, role: 'server', iconName: 'scissors', title: 'lx.extract', lines: ['max_char_buffer chunks,', 'overlap, extraction passes'] });
const off = d.box({ x: sx, y: ys[4], w: sb, h: BH, role: 'server', iconName: 'arrow-down-left', title: 'The response', lines: ['each extraction with its', 'offsets, start and end'] });
d.arrow({ x1: api.cx, y1: api.b, x2: lx.cx, y2: lx.y - 3, straight: true });
d.arrow({ x1: lx.cx, y1: lx.b, x2: off.cx, y2: off.y - 3, straight: true });

// Ollama, teal (it serves the model), level with lx.extract. Its panel
// starts lower than the service's: it holds one box.
const OX = 612, OW = 172;
d.panel({ x: OX, y: 280, w: OW, h: 248, role: 'model', iconName: 'brain', title: 'Ollama', sub: 'localhost:11434' });
// No icon here: the panel strip carries it, and the box is narrow.
const ol = d.box({ x: OX + 12, y: ys[3] - 8, w: OW - 24, h: BH + 16, role: 'model', title: 'The model', lines: ['model_id, or', 'LX_DEFAULT_MODEL', '(llama3.2:3b)'], center: true });

// Messages: REST client to the service, level; lx.extract to Ollama and
// back; the response from the service back to JSON input.
d.arrow({ x1: rc.r, y1: rc.cy, x2: api.x - 3, y2: api.cy, straight: true });
d.arrow({ x1: lx.r, y1: lx.cy - 10, x2: ol.x - 3, y2: ol.cy - 10, straight: true });
d.arrow({ x1: ol.x, y1: lx.cy + 10, x2: lx.r + 3, y2: lx.cy + 10, straight: true, dashed: true });
d.arrow({ x1: off.x, y1: off.cy, x2: ji.r + 3, y2: ji.cy + 12, dashed: true });

d.write(import.meta.url);
