// Capstone, "Suggested shape": the three files the learner builds, the
// folders they read and write, and where each result lands. The SHAPE
// only: no steps and no settings, because the capstone is assessed.
//
// Facts it encodes (lesson 23, Inputs, Required behavior, Suggested shape):
//   - data\: tickets.csv (30 support tickets) and manuals\ (five documents
//     in three formats: PDF, Word and text).
//   - solution\: jb_support_copilot.kjb runs load_knowledge_base.ktr and
//     then, only if it succeeded, answer_tickets.ktr; the job fails if
//     either fails. README.md says how to run it with Kitchen.
//   - load_knowledge_base.ktr: documents -> text -> chunks -> vectors ->
//     capstone_kb (a pgvector collection in the genai database).
//   - answer_tickets.ktr: tickets -> triage -> retrieval -> reply -> table
//     and files: support.ticket_replies (one row per ticket),
//     out\ticket_replies.csv and out\triage_summary.csv.
//
// Run from this folder:   node 23-capstone-shape.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BH = 64, PITCH = 84, TOP = 72, HEAD = 56;
const DX = 16, DW = 184, SX = DX + DW + 24, SW = 288, OX = SX + SW + 24, OW = W - 16 - OX;
const rowY = (i) => TOP + i * PITCH;
const d = new Diagram(W, rowY(4) + BH + 12 + 16);

const box = (px, pw, r, s) => d.box({ x: px + 12, y: rowY(r), w: pw - 24, h: BH, ...s });

d.panel({ x: DX, y: rowY(1) - HEAD, w: DW, h: HEAD + PITCH + BH + 12, role: 'tool', iconName: 'folder-open', title: 'data\\', sub: 'what you are given' });
const man = box(DX, DW, 1, { role: 'source', iconName: 'file-text', title: 'manuals\\', lines: ['5 documents,', '3 formats'] });
const tik = box(DX, DW, 2, { role: 'source', iconName: 'message-square-text', title: 'tickets.csv', lines: ['30 support', 'tickets'] });

d.panel({ x: SX, y: 16, w: SW, h: rowY(3) + BH + 12 - 16, role: 'tool', iconName: 'workflow', title: 'solution\\', sub: 'the files you build' });
const job = box(SX, SW, 0, { role: 'engine', iconName: 'network', title: 'jb_support_copilot.kjb', lines: ['runs 1, then 2 if 1 succeeded;', 'fails if either one fails'] });
const ld = box(SX, SW, 1, { role: 'engine', iconName: 'workflow', title: '1. load_knowledge_base.ktr', lines: ['documents -> text -> chunks', '-> vectors -> capstone_kb'] });
const an = box(SX, SW, 2, { role: 'engine', iconName: 'workflow', title: '2. answer_tickets.ktr', lines: ['tickets -> triage -> retrieval', '-> reply -> table and files'] });
box(SX, SW, 3, { role: 'result', iconName: 'file-text', title: 'README.md', lines: ['how to run the job with Kitchen,', 'and what to open afterward'] });
d.arrow({ x1: job.cx, y1: job.b, x2: ld.cx, y2: ld.y - 3, straight: true });
d.arrow({ x1: ld.cx, y1: ld.b, x2: an.cx, y2: an.y - 3, straight: true });

d.panel({ x: OX, y: rowY(1) - HEAD, w: OW, h: HEAD + 3 * PITCH + BH + 12, role: 'store', iconName: 'database', title: 'What the job writes', sub: 'database genai, and out\\' });
const kb = box(OX, OW, 1, { role: 'store', iconName: 'database', title: 'capstone_kb', lines: ['a pgvector collection', 'that a re-run never doubles'] });
const tb = box(OX, OW, 2, { role: 'store', iconName: 'database', title: 'support.ticket_replies', lines: ['a PostgreSQL table,', 'one row per ticket'] });
const r1 = box(OX, OW, 3, { role: 'write', iconName: 'file-output', title: 'ticket_replies.csv', lines: ['in out\\'] });
const r2 = box(OX, OW, 4, { role: 'write', iconName: 'file-output', title: 'triage_summary.csv', lines: ['in out\\'] });

d.arrow({ x1: man.r, y1: man.cy, x2: ld.x - 3, y2: ld.cy, straight: true });
d.arrow({ x1: tik.r, y1: tik.cy, x2: an.x - 3, y2: an.cy, straight: true });
d.arrow({ x1: ld.r, y1: ld.cy, x2: kb.x - 3, y2: kb.cy, straight: true });
d.arrow({ x1: kb.x, y1: kb.b - 12, x2: an.r + 3, y2: an.cy - 14, dashed: true });
d.arrow({ x1: an.r, y1: an.cy + 4, x2: tb.x - 3, y2: tb.cy + 4, straight: true });
d.arrow({ x1: an.r, y1: an.cy + 14, x2: r1.x - 3, y2: r1.cy });
d.arrow({ x1: an.r, y1: an.cy + 22, x2: r2.x - 3, y2: r2.cy });

d.write(import.meta.url);
