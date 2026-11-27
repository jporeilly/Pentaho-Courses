// The Documents to Text overview: the 12 steps of the Pentaho GenAI plugin
// suite, grouped by the folder of Spoon's Design palette each appears in,
// with the lab that uses it, over the plugin folders and the license every
// step needs.
//
// Facts it encodes (lesson 02, parts 2 and 3, its "Used in" column; the
// labs are those whose files/solution/*.ktr have the step's <type>):
//   - Input: HTML Parser (lab 03, HtmlParse), Read Unstructured Document
//     (04, 10, 20, 25, TikaPlugin).
//   - Metadata Discovery: Discover Metadata from Unstructured Documents
//     (04, TikaMetadataPlugin).
//   - Transform: Base64 Encoder (26, Base64Encode).
//   - AI: AI Chat (06 to 11, 21, 22, 25 to 29, AiChat), AI Chat Message
//     Box (05, the LLM Integration overview, no .ktr; 08, AiMessageBox),
//     AI Segmentation (10, 20, 25, AiToken), Text to Vector (20, 21, 25,
//     27, AiEmbedding), Vector Writer (20, 25, VUpsert), Vector Search
//     (21, 25, 27, VSearch), MCP Client (22, 29, McpClient), NER Extractor
//     (09, 28, NERExtractor).
//   - Version 1.2.0-157; each step is its own pdi-step-... folder under
//     data-integration\plugins; every step checks for a license with GenAI
//     (GENAI-EE) rights when its transformation starts.
//
// Run from this folder:   node 02-genai-suite.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BH = 64, GAP = 12, HEAD = 56, PW = 376, BW = PW - 24;
const LX = 16, RX = W - 16 - PW;
const boxAt = (px, py, i, s, col = 0, bw = BW) => d.box({ x: px + 12 + col * (bw + 24), y: py + HEAD + i * (BH + GAP), w: bw, h: BH, ...s });

const topH = HEAD + 3 * (BH + GAP) - GAP + 12 + 4; // the Input panel, as tall as the two on the right
const aiY = 16 + topH + 16, aiH = HEAD + 4 * (BH + GAP) - GAP + 12;
const barY = aiY + aiH + 16;
const d = new Diagram(W, barY + 64 + 16);

d.panel({ x: LX, y: 16, w: PW, h: topH, role: 'tool', title: 'Input', sub: 'text out of documents' });
boxAt(LX, 16, 0, { role: 'source', iconName: 'code-xml', title: 'HTML Parser', lines: ['the text of HTML or XML, by XPath', 'or CSS selector. Lab 03'] });
boxAt(LX, 16, 1, { role: 'source', iconName: 'file-text', title: 'Read Unstructured Document', lines: ['TXT, PDF, DOC(X), PPT(X), with', 'a password. Labs 04, 10, 20, 25'] });
boxAt(LX, 16, 2, { role: 'result', iconName: 'info', title: 'Apache Tika and jsoup', lines: ['Tika reads the documents and', 'their metadata; jsoup reads HTML'] });

const mdH = HEAD + BH + 12;
d.panel({ x: RX, y: 16, w: PW, h: mdH, role: 'tool', title: 'Metadata Discovery', sub: 'what a document says about itself' });
boxAt(RX, 16, 0, { role: 'engine', iconName: 'tags', title: 'Discover Metadata from', lines: ['Unstructured Documents: one row', 'per key, such as dc:creator. Lab 04'] });
const trY = 16 + mdH + 16;
d.panel({ x: RX, y: trY, w: PW, h: topH - mdH - 16, role: 'tool', title: 'Transform', sub: 'images for AI Chat' });
d.box({ x: RX + 12, y: trY + HEAD, w: BW, h: BH, role: 'engine', iconName: 'file-code', title: 'Base64 Encoder', lines: ['a file or a value as Base64 text, to', 'send images to AI Chat. Lab 26'] });

d.panel({ x: LX, y: aiY, w: W - 32, h: aiH, role: 'tool', title: 'AI', sub: 'eight steps: models, embeddings, vector stores, tools and entities' });
const aw = (W - 32 - 24 - 24) / 2;
const ai = [
  { role: 'engine', iconName: 'messages-square', title: 'AI Chat', lines: ['a prompt to an LLM, its answer back;', 'MCP tools. Labs 06 to 11, 21, 22, 25 to 29'] },
  { role: 'engine', iconName: 'scroll-text', title: 'AI Chat Message Box', lines: ['a prompt and a run instruction', 'as two fields. Labs 05, 08'] },
  { role: 'engine', iconName: 'scissors', title: 'AI Segmentation', lines: ['a long text into chunks,', 'one row each. Labs 10, 20, 25'] },
  { role: 'model', iconName: 'binary', title: 'Text to Vector', lines: ['text into an embedding with an', 'embedding model. Labs 20, 21, 25, 27'] },
  { role: 'store', iconName: 'database', title: 'Vector Writer', lines: ['embeddings, text and metadata', 'into a vector store. Labs 20, 25'] },
  { role: 'check', iconName: 'text-search', title: 'Vector Search', lines: ['the stored texts closest to', 'a query\'s embedding. Labs 21, 25, 27'] },
  { role: 'engine', iconName: 'plug-zap', title: 'MCP Client', lines: ['lists and calls the tools of', 'an MCP server. Labs 22, 29'] },
  { role: 'engine', iconName: 'scan-text', title: 'NER Extractor', lines: ['named entities with Stanford', 'CoreNLP, no LLM. Labs 09, 28'] },
];
ai.forEach((s, i) => boxAt(LX, aiY, Math.floor(i / 2), s, i % 2, aw));

d.bar({ x: 16, y: barY, w: W - 32, h: 64, role: 'support', iconName: 'shield-check', title: 'Every step: its own pdi-step-... folder in data-integration\\plugins, version 1.2.0-157', line: 'and a Pentaho EE license with GenAI (GENAI-EE) rights, checked when the transformation starts' });

d.write(import.meta.url);
