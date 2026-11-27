// The LangExtract module's model, for the diagrams that reuse the shared
// LangExtract layouts (langextract-flow.mjs, langextract-architecture.svg.mjs).
// It is a helper, not a diagram, so it has no .svg of its own.
//
// Facts (lessons 12 to 15, reworked 2026-11-27): the service's default
// model, LX_DEFAULT_MODEL, and the workshops' LX_MODEL parameter are both
// qwen2.5:7b, because llama3.2:3b returned no extractions in LangExtract's
// format (lesson 12, "Which Model"). langextract-flow.mjs names qwen2.5:7b
// itself; langextract-architecture.svg.mjs still names the service's old
// default (llama3.2:3b). Importing this module first makes the kit draw
// qwen2.5:7b in that box, without a second copy of the layout. An older
// llama3.1:8b box, should a layout still name it, is swapped the same way.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

export const MODEL = 'qwen2.5:7b';

const box = Diagram.prototype.box;
Diagram.prototype.box = function (o) {
  if (o.title === 'llama3.1:8b') {
    o = { ...o, title: MODEL, lines: ['the model that', 'model_id names'] };
  }
  if (o.lines) {
    o = { ...o, lines: o.lines.map((l) => l.replace('(llama3.2:3b)', `(${MODEL})`).replace('llama3.1:8b', MODEL)) };
  }
  return box.call(this, o);
};

/**
 * Write the next Diagram the importing script draws to `url` (its own
 * import.meta.url) instead of the URL that diagram passes: lets a lesson's
 * script run a shared diagram under its own name.
 */
export function writeAs(url) {
  const write = Diagram.prototype.write;
  Diagram.prototype.write = function () {
    Diagram.prototype.write = write;
    return write.call(this, url);
  };
}
