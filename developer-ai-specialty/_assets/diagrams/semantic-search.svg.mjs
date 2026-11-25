// Key Concepts workshop, part 5 (Search): semantic search as retrieval
// for an LLM. Documents are split into chunks, each chunk is embedded and
// kept in a vector store; the query is embedded the same way, the chunks
// nearest to it are found, and they go to the LLM with the query, within
// its token limit. It replaces semantic_search_diagram.png in "5. Search"
// of 18-key-concepts-workshop/guide.md.
//
// Facts it encodes (lesson 18 unless named):
//   - Part 5 intro: semantic search uses embeddings to find text with
//     similar or related meanings; the model turns each text into a
//     vector, and texts are compared by their vectors. Retrieval for an
//     LLM builds on it: documents are split into chunks, each chunk is
//     embedded and kept in a vector store, the user's query is embedded
//     the same way, and the chunks closest to it are passed to the LLM
//     with the query, within its token limit. (The old figure named the
//     data as PDF, doc or text.)
//   - Part 4 (Embedding) and search.py: the embedding model is Ollama's
//     nomic-embed-text, which turns each text into 768 numbers; texts are
//     compared by cosine similarity (search.py imports cosine_similarity;
//     the heatmap's scores run to 1.00), and results are ranked highest
//     score first.
//   - The old figure named GPT-4 as the LLM; the lesson names no model
//     for this step, so the box says only "LLM".
//
// Run from this folder:   node semantic-search.svg.mjs
// It writes semantic-search.svg here and ../images/semantic-search.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 480);

// A 4 x 3 grid of equal boxes. Columns and rows are shared, so the two
// embedding boxes sit one above the other: the same model on both paths.
const BW = 180, BH = 84;
const xs = [16, 212, 408, 604]; // 16px between columns
const ys = [56, 212, 380];

// Row captions, small and slate, so a reader sees the two phases.
d.raw(`<text x="16" y="38" font-size="13" font-weight="700" fill="#475569">Before any query: index the documents</text>`);
d.raw(`<text x="16" y="196" font-size="13" font-weight="700" fill="#475569">For each query: retrieve, then answer</text>`);

// Row 1, indexing: documents (blue, a source), chunks (violet, a step
// that transforms), embeddings (teal, the model), the vector store
// (green, a store).
const docs = d.box({ x: xs[0], y: ys[0], w: BW, h: BH, role: 'source', iconName: 'file-text', title: 'Documents', lines: ['your data: PDF,', 'doc or text'] });
const chunks = d.box({ x: xs[1], y: ys[0], w: BW, h: BH, role: 'engine', iconName: 'scissors', title: 'Chunks', lines: ['each document', 'split into parts'] });
const emb = d.box({ x: xs[2], y: ys[0], w: BW, h: BH, role: 'model', iconName: 'binary', title: 'Embed', lines: ['nomic-embed-text:', '768 numbers each'] });
const store = d.box({ x: xs[3], y: ys[0], w: BW, h: BH, role: 'store', iconName: 'database', title: 'Vector store', lines: ['every chunk\'s', 'vector, kept'] });
d.arrow({ x1: docs.r, y1: docs.cy, x2: chunks.x - 3, y2: chunks.cy, straight: true });
d.arrow({ x1: chunks.r, y1: chunks.cy, x2: emb.x - 3, y2: emb.cy, straight: true });
d.arrow({ x1: emb.r, y1: emb.cy, x2: store.x - 3, y2: store.cy, straight: true });

// Row 2, retrieval: the query (blue, a source), its embedding (teal, the
// same model), the comparison (amber, a check), the nearest chunks
// (white, a result) read from the store above.
const query = d.box({ x: xs[0], y: ys[1], w: BW, h: BH, role: 'source', iconName: 'message-square-text', title: 'User query', lines: ['a question,', 'in plain words'] });
const qemb = d.box({ x: xs[1], y: ys[1], w: BW, h: BH, role: 'model', iconName: 'binary', title: 'Embed', lines: ['the same model:', '768 numbers too'] });
const cmp = d.box({ x: xs[2], y: ys[1], w: BW, h: BH, role: 'check', iconName: 'text-search', title: 'Compare', lines: ['cosine similarity,', 'highest first'] });
const near = d.box({ x: xs[3], y: ys[1], w: BW, h: BH, role: 'result', iconName: 'list-ordered', title: 'Nearest chunks', lines: ['the closest few,', 'by meaning'] });
d.arrow({ x1: query.r, y1: query.cy, x2: qemb.x - 3, y2: qemb.cy, straight: true });
d.arrow({ x1: qemb.r, y1: qemb.cy, x2: cmp.x - 3, y2: cmp.cy, straight: true });
d.arrow({ x1: cmp.r, y1: cmp.cy, x2: near.x - 3, y2: near.cy, straight: true });
// The store's vectors feed the comparison: an elbow down from the store
// into the top of Compare, labeled.
d.arrow({ x1: store.x + 24, y1: store.b, x2: cmp.cx + 30, y2: cmp.y - 3, vertical: true, label: 'chunk vectors' });

// Row 3, the answer: the prompt (white, a result: what the LLM is
// given), the LLM (teal, the model), the response (white).
const prompt = d.box({ x: xs[1], y: ys[2], w: BW, h: BH, role: 'result', iconName: 'layers', title: 'Prompt', lines: ['the query and', 'the chunks, within', 'the token limit'] });
const llm = d.box({ x: xs[2], y: ys[2], w: BW, h: BH, role: 'model', iconName: 'brain', title: 'LLM', lines: ['answers from the', 'chunks it is given'] });
const resp = d.box({ x: xs[3], y: ys[2], w: BW, h: BH, role: 'result', iconName: 'message-square', title: 'Response', lines: ['to the user'] });
// The query text and the nearest chunks both go into the prompt: one
// curve down from each, meeting at the prompt's top.
d.arrow({ x1: query.cx, y1: query.b, x2: prompt.x + 40, y2: prompt.y - 3, vertical: true, label: 'the query', lx: 104, ly: 340 });
d.arrow({ x1: near.cx, y1: near.b, x2: prompt.r - 40, y2: prompt.y - 3, vertical: true, label: 'the chunks', lx: 560, ly: 340 });
d.arrow({ x1: prompt.r, y1: prompt.cy, x2: llm.x - 3, y2: llm.cy, straight: true });
d.arrow({ x1: llm.r, y1: llm.cy, x2: resp.x - 3, y2: resp.cy, straight: true });

d.write(import.meta.url);
