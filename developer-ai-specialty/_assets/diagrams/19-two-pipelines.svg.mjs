// The Retrieval-Augmented Generation overview: the two pipelines of a RAG
// system and where they meet. Ingest loads the knowledge base when the
// documents change; query runs for every question. Both embed with the
// same model, and they meet at the vector store.
//
// Facts it encodes (lesson 19, parts 2 to 5):
//   - Ingest: Documents (Get File Names), Text (Read Unstructured
//     Document), Chunks (AI Segmentation; 300 tokens, overlap 30, Split by
//     Recursion in Build the Knowledge Base), Embeddings (Text to Vector,
//     768 numbers), Vector store (Vector Writer: the vector, the chunk text
//     and its source).
//   - Query: Question (CSV file input), Embedding (Text to Vector, the same
//     model), Similarity search (Vector Search; score = (1 + cosine
//     similarity) / 2), Prompt with context (Modified JavaScript value),
//     Answer (AI Chat, from the passages only, citing them).
//   - nomic-embed-text on Ollama serves both; pgvector on localhost:5433,
//     the table kb_chunks.
//
// Run from this folder:   node 19-two-pipelines.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BH = 64, PITCH = 84, TOP = 72, BW = 264, PW = BW + 24;
const LX = 16, RX = W - 16 - PW, MX = LX + PW + 20, MW = RX - 20 - MX;
const rowY = (i) => TOP + i * PITCH;
const H = rowY(6) + BH + 12 + 16;
const d = new Diagram(W, H);

d.panel({ x: LX, y: 16, w: PW, h: rowY(4) + BH + 12 - 16, role: 'tool', iconName: 'workflow', title: 'Ingest: build the knowledge base', sub: 'runs when the documents change' });
d.panel({ x: RX, y: rowY(2) - 56, w: PW, h: rowY(6) + BH + 12 - rowY(2) + 56, role: 'tool', iconName: 'workflow', title: 'Query: answer a question', sub: 'runs for every question' });

const col = (x, first, steps) => {
  const b = steps.map((s, i) => d.box({ x: x + 12, y: rowY(first + i), w: BW, h: BH, ...s }));
  b.reduce((a, c) => { d.arrow({ x1: a.cx, y1: a.b, x2: c.cx, y2: c.y - 3, straight: true }); return c; });
  return b;
};
const ing = col(LX, 0, [
  { role: 'source', iconName: 'folder-search', title: 'Documents', lines: ['Get File Names: the PDF, Word', 'and text files to load'] },
  { role: 'engine', iconName: 'file-text', title: 'Text', lines: ['Read Unstructured Document:', 'the text of each file'] },
  { role: 'engine', iconName: 'scissors', title: 'Chunks', lines: ['AI Segmentation: 300 tokens,', 'overlap 30, by recursion'] },
  { role: 'model', iconName: 'binary', title: 'Embeddings', lines: ['Text to Vector: 768', 'numbers per chunk'] },
  { role: 'store', iconName: 'database', title: 'Vector store', lines: ['Vector Writer: the vector,', 'the chunk and its source'] },
]);
const qry = col(RX, 2, [
  { role: 'source', iconName: 'message-square-text', title: 'Question', lines: ['CSV file input: one row', 'per question'] },
  { role: 'model', iconName: 'binary', title: 'Embedding', lines: ['Text to Vector: the question,', 'with the same model'] },
  { role: 'check', iconName: 'text-search', title: 'Similarity search', lines: ['Vector Search: the closest', 'chunks, scored 0 to 1'] },
  { role: 'engine', iconName: 'braces', title: 'Prompt with context', lines: ['Modified JavaScript value: the', 'passages and their sources'] },
  { role: 'engine', iconName: 'messages-square', title: 'Answer', lines: ['AI Chat: from the passages', 'only, and it cites them'] },
]);

// Where they meet: one embedding model, one table.
const em = d.box({ x: MX, y: rowY(3), w: MW, h: BH, role: 'model', title: 'nomic-embed-text', lines: ['on Ollama'], center: true });
const kb = d.box({ x: MX, y: rowY(4), w: MW, h: BH, role: 'store', title: 'kb_chunks', lines: ['pgvector, :5433'], center: true });
d.arrow({ x1: ing[3].r, y1: ing[3].cy, x2: em.x - 3, y2: em.cy, straight: true });
d.arrow({ x1: qry[1].x, y1: qry[1].cy, x2: em.r + 3, y2: em.cy, straight: true });
d.arrow({ x1: ing[4].r, y1: ing[4].cy, x2: kb.x - 3, y2: kb.cy, straight: true });
d.arrow({ x1: kb.r, y1: kb.cy, x2: qry[2].x - 3, y2: qry[2].cy, straight: true });

d.box({ x: MX, y: rowY(0), w: W - 16 - MX, h: rowY(2) - 56 - 16 - rowY(0), role: 'result', iconName: 'info', title: 'Load once, ask many times', lines: ['Two pipelines that meet at the vector store.', 'The model never searches: the pipeline', 'searches, then the model reads.'] });

d.write(import.meta.url);
