// Sequence-diagram helpers for this course's agent workshop (Deploy & Run
// the Agent). A copy of the Integrating Authentication Mechanisms course's
// sequence.mjs (courses/admin-auth-specialty/_assets/diagrams/sequence.mjs),
// kept in this course's own folder so the course stands on its own. They
// sit on top of the shared kit in scripts/diagram-kit.mjs and use only its
// parts: each actor is a kit panel drawn as a tall column (a "lane") with
// a dashed lifeline down its middle, each message is a kit arrow between
// two lifelines with its numbered label in a kit pill, and a step one
// actor takes on its own is a pill sitting on its lifeline. This file
// draws nothing by itself and is not a diagram, so it does not end in
// d.write().
/**
 * Draw one panel per actor, side by side, and a dashed lifeline down
 * the middle of each. `cols` holds the kit's panel options without y
 * and h: { x, w, role, iconName, title, sub }. Returns each lane's
 * geometry plus `cx`, the x of its lifeline, for msg() and note().
 */
export function lanes(d, { top, height, cols }) {
  return cols.map((c) => {
    const g = d.panel({ ...c, y: top, h: height });
    const cx = c.x + c.w / 2;
    // The lifeline: from just under the title strip to the panel's foot.
    // Pushed to the panel layer, so arrows and pills draw over it.
    d.under.push(`<line x1="${cx}" y1="${top + 56}" x2="${cx}" y2="${top + height - 12}" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4 4"/>`);
    return { ...g, cx };
  });
}

/**
 * A message from one lifeline to another at height y: a straight kit
 * arrow that stops 3px short of the target lifeline so its head shows,
 * with the label in a pill. `lx` moves the pill along the arrow, for an
 * arrow that crosses a third lane and would otherwise put its label on
 * that lane's lifeline. `dashed` marks a reply or a redirect followed.
 */
export function msg(d, from, to, y, label, { dashed = false, lx } = {}) {
  const dir = to.cx > from.cx ? 1 : -1;
  d.arrow({ x1: from.cx, y1: y, x2: to.cx - 3 * dir, y2: y, straight: true, dashed, label, lx });
}

/** A step an actor takes on its own: a pill on its lifeline at height y. */
export function note(d, lane, y, label) {
  d.pill(lane.cx, y, label);
}
