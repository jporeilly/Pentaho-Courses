// Agent as a Service overview: the course's three approaches side by
// side, what goes in, who does the work, what comes out, and who owns
// retrieval and reasoning. It sits after "The three approaches in this
// course" table in 16-agent-as-a-service/guide.md; the table stays.
//
// Facts it encodes (lesson 16's table unless named):
//   - Direct LLM call / multi-stage: one prompt per row, structured JSON
//     for that row; input one text field; one row in, one enriched row
//     out; 1 LLM call per row (or a fixed number of stages); needs no
//     other records. Lessons 05 to 11: REST client posts to Ollama's
//     /api/generate.
//   - LangExtract: named values with character offsets from one text,
//     one row per value; input one text field, a prompt and few-shot
//     examples; one row in, N extraction rows out, pivoted by Row
//     denormaliser; 1 LLM call per extraction pass over the chunked text;
//     needs no other records. Lesson 12: the service is POST /extract on
//     localhost:8765.
//   - Agent as a service: reads the current entry and its retrieved
//     history and returns one assessment; input the current log text and
//     N history entries, retrieved by Pentaho Data Integration with
//     Database join before the call; one row in, one assessment row out;
//     1 LLM call, all the texts in a single context; needs other records.
//     Lesson 17: the agent is POST /assess on localhost:8000.
//   - Lesson 16 intro and lesson 17's ownership table: Pentaho Data
//     Integration owns all data flow (retrieval, routing, persistence);
//     the agent owns language understanding and reasoning across texts.
//
// Run from this folder:   node three-approaches.svg.mjs
// It writes three-approaches.svg here and ../images/three-approaches.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 560);

// Three equal columns. Every column has the same four rows: what goes
// in, the service, what comes out, and whether other records are needed.
const CW = 248, GAP = 12, X0 = 16;
const BH = 76, rows = [72, 186, 300];

const cols = [
  {
    title: 'Direct LLM call', sub: 'and multi-stage',
    inn: { iconName: 'rows-3', title: '1 row', lines: ['one text field'] },
    svc: { role: 'model', iconName: 'brain', title: 'Ollama', lines: ['/api/generate: 1 call', 'per row, or per stage'] },
    out: { iconName: 'table-2', title: '1 enriched row', lines: ['structured JSON, parsed'] },
    needs: 'needs other records: no',
  },
  {
    title: 'LangExtract', sub: 'POST /extract, localhost:8765',
    inn: { iconName: 'file-text', title: '1 text', lines: ['prompt and few-shot', 'examples'] },
    svc: { role: 'server', iconName: 'scissors', title: 'LangExtract', lines: ['1 call per extraction', 'pass over the chunks'] },
    out: { iconName: 'list', title: 'N extraction rows', lines: ['with offsets; pivoted', 'by Row denormaliser'] },
    needs: 'needs other records: no',
  },
  {
    title: 'Agent as a service', sub: 'POST /assess, localhost:8000',
    inn: { iconName: 'history', title: '1 row + history', lines: ['N entries, retrieved', 'with Database join'] },
    svc: { role: 'server', iconName: 'bot', title: 'Agent', lines: ['1 call: every text', 'in a single context'] },
    out: { iconName: 'clipboard-check', title: '1 assessment row', lines: ['reasoned across the', 'current and past texts'] },
    needs: 'needs other records: yes',
  },
];

cols.forEach((c, i) => {
  const x = X0 + i * (CW + GAP);
  // The column panel, slate: a frame for the approach, not a role.
  d.panel({ x, y: 16, w: CW, h: 444, role: 'support', title: c.title, sub: c.sub });
  const bx = x + 12, bw = CW - 24;
  // In: a source you read (blue). The service: teal for Ollama itself,
  // violet for a service that sits in front of it. Out: white, a result.
  const a = d.box({ x: bx, y: rows[0], w: bw, h: BH, role: 'source', ...c.inn });
  const s = d.box({ x: bx, y: rows[1], w: bw, h: BH, role: c.svc.role, iconName: c.svc.iconName, title: c.svc.title, lines: c.svc.lines });
  const o = d.box({ x: bx, y: rows[2], w: bw, h: BH, role: 'result', ...c.out });
  d.arrow({ x1: a.cx, y1: a.b, x2: s.cx, y2: s.y - 3, straight: true });
  d.arrow({ x1: s.cx, y1: s.b, x2: o.cx, y2: o.y - 3, straight: true });
  // Under the output: whether the approach reads other records. Amber
  // marks the one that does: the reason the agent exists.
  const yes = c.needs.endsWith('yes');
  d.box({ x: bx, y: 396, w: bw, h: 48, role: yes ? 'check' : 'off', title: c.needs, center: true });
});

// Underneath, across all three: who owns what.
d.bar({ x: 16, y: 476, w: W - 32, h: 68, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration owns retrieval, routing and persistence', line: 'The LLM, the extraction service or the agent owns only the language work: reading and reasoning.' });

d.write(import.meta.url);
