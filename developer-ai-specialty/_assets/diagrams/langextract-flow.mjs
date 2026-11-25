// The shared layout of the three LangExtract workshop diagrams (Support
// Tickets, Clinical Notes, Contract Documents). It is a helper, not a
// diagram, so it has no .svg of its own: each workshop's
// `<name>.svg.mjs` lists its own facts, calls `extractFlow()` with its
// steps and request, draws its own outputs, and ends with
// `d.write(import.meta.url)`.
//
// What every workshop shares, and so what this helper draws (facts from
// lessons 12 to 15):
//   - The transformation's steps, top to bottom, in one blue panel named
//     after the .ktr file, each step's hop drawn as a straight arrow down.
//   - The request that Modified JavaScript value builds, request_json, in
//     a white box at the top right, with a dashed arrow from the script
//     step (dashed: it says what the step builds, it is not a message).
//   - REST client posting request_json to the LangExtract service's
//     POST /extract on localhost:8765, and the reply coming back into
//     response_json (lessons 13 to 15, part "Call the Service" or "Build
//     and Send the Request": URL http://localhost:8765/extract, Body field
//     request_json, Result field name response_json).
//   - Inside the service, FastAPI checks the body and lx.extract runs with
//     the request's chunk settings (lesson 12, API contract and "Under the
//     hood"; the service is a FastAPI app, 12-langextract/files/
//     langextract-service/app.py, and lesson 13's pip checkpoint lists
//     fastapi and uvicorn), calling the model on Ollama at localhost:11434
//     (the /health check's model_url in lessons 14 and 15). The model is
//     llama3.1:8b, which all three requests name in model_id.
//
// Layout: every step box is the same size, 64 high on an 88 pitch, the
// same in all three diagrams. The service's two boxes sit level with REST
// client and the step under it, so the messages between them run level.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Shared geometry. The step column is 316 wide so a 34-character detail
// line fits beside the icon; the right-hand column takes the rest of the
// 800 figure width.
export const W = 800;
export const PX = 16, PW = 316, BX = PX + 12, BW = PW - 24, BH = 64, PITCH = 88, TOP = 72;
export const RX = 372, RW = W - 16 - RX;
// The y of step i in the column.
export const stepY = (i) => TOP + i * PITCH;

/**
 * Draw the shared part of a LangExtract workshop diagram.
 *   height   the figure height
 *   file     the .ktr name, shown under the panel title
 *   steps    [{ role, iconName, title, lines }] top to bottom
 *   script   index of the Modified JavaScript value that builds request_json
 *   rest     index of REST client (the step under it is JSON input)
 *   request  the request_json box's detail lines
 *   chunks   lx.extract's two detail lines (its chunk settings)
 * Returns the diagram and the step boxes, for the outputs each workshop
 * draws itself.
 */
export function extractFlow({ height, file, steps, script, rest, request, chunks }) {
  const d = new Diagram(W, height);

  // The transformation, blue: one panel down the left holding every step.
  const last = stepY(steps.length - 1) + BH;
  d.panel({ x: PX, y: 16, w: PW, h: last, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: file });
  const box = steps.map((s, i) => d.box({ x: BX, y: stepY(i), w: BW, h: BH, role: s.role, iconName: s.iconName, title: s.title, lines: s.lines }));

  // The hops, straight down the column. The 24-pixel gap has no room for
  // a pill, so a hop that needs a name gets it in its step's own text.
  box.reduce((a, b) => {
    d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true });
    return b;
  });

  // The LangExtract service, violet (a server): POST /extract level with
  // REST client, lx.extract level with the step under it.
  const SX = RX, SW = 248, sy = stepY(rest) - 52;
  d.panel({ x: SX, y: sy, w: SW, h: BH * 2 + (PITCH - BH) + 52 + 12, role: 'server', iconName: 'server', title: 'LangExtract service', sub: 'uvicorn, localhost:8765' });
  const api = d.box({ x: SX + 12, y: stepY(rest), w: SW - 24, h: BH, role: 'server', iconName: 'route', title: 'POST /extract', lines: ['FastAPI checks the body;', 'replies with extractions'] });
  const lx = d.box({ x: SX + 12, y: stepY(rest + 1), w: SW - 24, h: BH, role: 'server', iconName: 'scissors', title: 'lx.extract', lines: chunks });

  // The request, white (a result to read), above the service, with a
  // dashed arrow from the script step that builds it.
  const reqH = 16 + 17 + request.length * 15 + 12;
  const req = d.box({ x: RX, y: sy - 16 - reqH, w: RW, h: reqH, role: 'result', iconName: 'arrow-up-right', title: 'request_json: one per row', lines: request });
  const js = box[script];
  d.arrow({ x1: js.r, y1: js.cy - 12, x2: req.x - 3, y2: req.cy, dashed: true });

  // Ollama, teal (it serves the model), level with lx.extract. No icon on
  // its box: the panel strip carries it, and the box is narrow.
  const OX = SX + SW + 16, OW = W - 16 - OX;
  d.panel({ x: OX, y: stepY(rest + 1) - 52, w: OW, h: BH + 52 + 12, role: 'model', iconName: 'brain', title: 'Ollama', sub: 'localhost:11434' });
  const ol = d.box({ x: OX + 12, y: stepY(rest + 1) - 4, w: OW - 24, h: BH + 8, role: 'model', title: 'llama3.1:8b', lines: ['the model that', 'model_id names'], center: true });

  // Messages. REST client to the service and the reply back (dashed);
  // the service down to lx.extract and back; lx.extract to Ollama and back.
  const rc = box[rest];
  d.arrow({ x1: rc.r, y1: rc.cy - 9, x2: api.x - 3, y2: api.cy - 9, straight: true });
  d.arrow({ x1: api.x, y1: api.cy + 9, x2: rc.r + 3, y2: rc.cy + 9, straight: true, dashed: true });
  d.arrow({ x1: api.cx - 14, y1: api.b, x2: lx.cx - 14, y2: lx.y - 3, straight: true });
  d.arrow({ x1: lx.cx + 14, y1: lx.y, x2: api.cx + 14, y2: api.b + 3, straight: true, dashed: true });
  d.arrow({ x1: lx.r, y1: lx.cy - 9, x2: ol.x - 3, y2: lx.cy - 9, straight: true });
  d.arrow({ x1: ol.x, y1: lx.cy + 9, x2: lx.r + 3, y2: lx.cy + 9, straight: true, dashed: true });

  return { d, box, panelBottom: last + 16 };
}
