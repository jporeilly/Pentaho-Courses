// A tool's workflow as a row of same-size numbered cards, and a copy of it
// per part with that part lit and a "This tab" pill above it, so a lesson
// can open each of its tabs with "where you are" (owner, 2026-11-18:
// "indicate where in the workflow the step is"). Shared by ir-workflow
// (lesson 06), az-workflow (lesson 10) and dd-workflow (lesson 13).
//
// writeWorkflow(name, steps, url) writes <name>.svg (every part lit) and
// <name>-1.svg ... <name>-N.svg beside the calling script, with their PNGs
// in ../images at twice the size. Each step is { icon, title: [lines] }.
import { Diagram, ROLE, icon, esc } from '../../../../scripts/diagram-kit.mjs';

const CW = 132, CH = 132, GAP = 28, LEFT = 16, TOP = 40;

export const workflowWidth = (n) => LEFT * 2 + n * CW + (n - 1) * GAP;

function build(steps, current) {
  const W = workflowWidth(steps.length);
  const d = new Diagram(W, TOP + CH + 20);
  steps.forEach((s, i) => {
    const x = LEFT + i * (CW + GAP);
    const lit = current === null || current === i;
    const c = lit ? ROLE.tool : ROLE.off;
    const strong = current === i;
    d.raw(`<rect x="${x}" y="${TOP}" width="${CW}" height="${CH}" rx="12" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${strong ? 3 : 1.5}" filter="url(#shadow)"/>`);
    // the step number, in a small disc at the top-left corner
    d.raw(`<circle cx="${x + 20}" cy="${TOP + 20}" r="11" fill="${c.stroke}"/>`);
    d.raw(`<text x="${x + 20}" y="${TOP + 24.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">${i + 1}</text>`);
    // the icon in a white disc, centered
    d.raw(`<circle cx="${x + CW / 2}" cy="${TOP + 46}" r="22" fill="#ffffff" stroke="${c.stroke}" stroke-width="1.2"/>`);
    d.raw(icon(s.icon, x + CW / 2 - 13, TOP + 33, 26, c.stroke));
    s.title.forEach((t, k) => {
      const y = TOP + (s.title.length === 1 ? 98 : 92) + k * 17;
      d.raw(`<text x="${x + CW / 2}" y="${y}" text-anchor="middle" font-size="14" font-weight="700" fill="${c.text}">${esc(t)}</text>`);
    });
    if (i < steps.length - 1) {
      d.arrow({ x1: x + CW, y1: TOP + CH / 2, x2: x + CW + GAP - 2, y2: TOP + CH / 2, straight: true });
    }
    if (strong) d.pill(x + CW / 2, TOP / 2, 'This tab');
  });
  return d;
}

export function writeWorkflow(name, steps, url) {
  build(steps, null).write(new URL(`./${name}.svg.mjs`, url));
  steps.forEach((_, i) => build(steps, i).write(new URL(`./${name}-${i + 1}.svg.mjs`, url)));
}
