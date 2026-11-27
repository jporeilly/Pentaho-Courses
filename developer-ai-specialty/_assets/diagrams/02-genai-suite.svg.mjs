// The Documents to Text overview: the 12 steps of the Pentaho GenAI plugin
// suite inside one Pentaho Data Integration panel, read left to right as
// Ingest, Transform and AI, with what they read and write on the left and
// the outside services the AI steps call on the right. Each step carries
// the labs that use it.
//
// Facts it encodes (lesson 02, parts 2 and 3, its "Used in" column; the
// labs are those whose files/solution/*.ktr have the step's <type>):
//   - Ingest: Read Unstructured Document (04, 10, 20, 25, TikaPlugin; TXT,
//     PDF, DOC(X), PPT(X)), HTML Parser (03, HtmlParse), Discover Metadata
//     from Unstructured Documents (04, TikaMetadataPlugin).
//   - Transform: Base64 Encoder (26, Base64Encode), AI Segmentation (10,
//     20, 25, AiToken), NER Extractor (09, 28, NERExtractor).
//   - AI: AI Chat Message Box (05, the LLM Integration overview, no .ktr;
//     08, AiMessageBox) feeds AI Chat (06 to 11, 21, 22, 25 to 29, AiChat);
//     Text to Vector (20, 21, 25, 27, AiEmbedding) feeds Vector Writer (20,
//     25, VUpsert); Vector Search (21, 25, 27, VSearch); MCP Client (22,
//     29, McpClient).
//   - AI Chat answers from the Top-K passages Vector Search returns and can
//     call the tools of an MCP server.
//   - LLM providers: OpenAI, Azure OpenAI, AWS Bedrock, Anthropic Claude,
//     Google Gemini and Ollama for AI Chat; Text to Vector embeds with all
//     of them but Anthropic.
//   - Vector stores for Vector Writer and Vector Search: PGVector, Qdrant,
//     Milvus, Pinecone, Chroma, OpenSearch, AlloyDB (the labs use pgvector).
//   - MCP servers over stdio or Streamable HTTP.
//   - Core PDI steps, jobs, variables and the metastore work around every
//     GenAI step.
//
// Run from this folder:   node 02-genai-suite.svg.mjs
import { Diagram, ROLE, esc, icon } from '../../../../scripts/diagram-kit.mjs';

// Columns, left to right: Sources/Targets, the PDI panel, the services.
const M = 16, LW = 140, G = 26, RW = 180;
const P = 10, T = 130, SG = 26, AG = 30; // panel padding, tile width, gaps between sub-panels and AI sub-columns
const SW = T + 2 * P, AW = 2 * T + AG + 2 * P;
const MX = M + LW + G, MW = P + SW + SG + SW + SG + AW + P;
const RX = MX + MW + G, W = RX + RW + M;
const TH = 120, PITCH = 140;
const MY = 16, SY = MY + 44 + 10, ROW0 = SY + 34 + 10;
const rowY = (r) => ROW0 + r * PITCH;
const H = rowY(3) + TH + P + P + M;
const d = new Diagram(W, H);

// A step tile: kit box styling, the icon in a white disc on top, the
// title centered in one or two lines, the labs in a small pill.
const tile = (x, y, { role, iconName, title, labs }) => {
  const c = ROLE[role];
  const o = [];
  o.push(`<rect x="${x}" y="${y}" width="${T}" height="${TH}" rx="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5" filter="url(#shadow)"/>`);
  const cx = x + T / 2;
  o.push(`<circle cx="${cx}" cy="${y + 30}" r="19" fill="#ffffff" stroke="${c.stroke}" stroke-width="1.2"/>`);
  o.push(icon(iconName, cx - 12, y + 18, 24, c.stroke));
  const t = Array.isArray(title) ? title : [title];
  const ty = t.length === 1 ? y + 75 : y + 68;
  t.forEach((l, i) => o.push(`<text x="${cx}" y="${ty + i * 16}" text-anchor="middle" font-size="14" font-weight="700" fill="${c.text}">${esc(l)}</text>`));
  const pw = [...labs].reduce((s, ch) => s + (/\d/.test(ch) ? 6.2 : 3.4), 0) + 16;
  o.push(`<rect x="${cx - pw / 2}" y="${y + TH - 26}" width="${pw}" height="17" rx="8.5" fill="#ffffff" stroke="${c.stroke}" stroke-width="0.8" opacity="0.95"/>`);
  o.push(`<text x="${cx}" y="${y + TH - 13.5}" text-anchor="middle" font-size="11" font-weight="600" fill="${c.text}">${esc(labs)}</text>`);
  d.raw(o.join(''));
  return { x, y, w: T, h: TH, cx, cy: y + TH / 2, r: x + T, b: y + TH };
};

// An outside system: kit box styling, the icon disc and title on one row,
// then what it stands for, one item or a short list per line.
const card = (x, y, w, h, { role, iconName, title, items, center = false }) => {
  const c = ROLE[role];
  const o = [];
  o.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5" filter="url(#shadow)"/>`);
  o.push(`<circle cx="${x + 28}" cy="${y + 28}" r="17" fill="#ffffff" stroke="${c.stroke}" stroke-width="1.2"/>`);
  o.push(icon(iconName, x + 17, y + 17, 22, c.stroke));
  o.push(`<text x="${x + 52}" y="${y + 33}" font-size="14.5" font-weight="700" fill="${c.text}">${esc(title)}</text>`);
  const ix = center ? x + w / 2 : x + 16, anchor = center ? ' text-anchor="middle"' : '';
  items.forEach((l, i) => o.push(`<text x="${ix}" y="${y + 61 + i * 16.5}"${anchor} font-size="13" fill="${c.text}">${esc(l)}</text>`));
  d.raw(o.join(''));
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, r: x + w, b: y + h };
};

// A two-way arrow: the kit's marker at both ends.
const both = (x1, y1, x2, y2, dashed = false) => d.edges.push(`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="1.7"${dashed ? ' stroke-dasharray="5 4"' : ''} marker-start="url(#arrow)" marker-end="url(#arrow)"/>`);

// The PDI panel and its three stages.
const main = d.panel({ x: MX, y: MY, w: MW, h: H - MY - M, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration 11', sub: 'the 12 GenAI steps, from documents to answers; each pill lists the labs that use it' });
const ix = MX + P, tx = ix + SW + SG, ax = tx + SW + SG;
const stageH = rowY(2) + TH + P - SY;
const ing = d.panel({ x: ix, y: SY, w: SW, h: stageH, role: 'tool', title: 'Ingest' });
const trn = d.panel({ x: tx, y: SY, w: SW, h: stageH, role: 'engine', title: 'Transform' });
const ai = d.panel({ x: ax, y: SY, w: AW, h: rowY(3) + TH + P - SY, role: 'model', title: 'AI' });
d.arrow({ x1: ing.r, y1: SY + 17, x2: trn.x - 3, y2: SY + 17, straight: true });
d.arrow({ x1: trn.r, y1: SY + 17, x2: ai.x - 3, y2: SY + 17, straight: true });

tile(ix + P, rowY(0), { role: 'source', iconName: 'file-text', title: ['Read Unstructured', 'Document'], labs: '04, 10, 20, 25' });
tile(ix + P, rowY(1), { role: 'source', iconName: 'code-xml', title: 'HTML Parser', labs: '03' });
tile(ix + P, rowY(2), { role: 'engine', iconName: 'tags', title: ['Discover', 'Metadata'], labs: '04' });

tile(tx + P, rowY(0), { role: 'engine', iconName: 'file-code', title: ['Base64', 'Encoder'], labs: '26' });
tile(tx + P, rowY(1), { role: 'engine', iconName: 'scissors', title: ['AI', 'Segmentation'], labs: '10, 20, 25' });
tile(tx + P, rowY(2), { role: 'engine', iconName: 'scan-text', title: ['NER', 'Extractor'], labs: '09, 28' });

const a1 = ax + P, a2 = a1 + T + AG;
const box = tile(a1, rowY(0), { role: 'engine', iconName: 'scroll-text', title: ['AI Chat', 'Message Box'], labs: '05, 08' });
const chat = tile(a2, rowY(0), { role: 'engine', iconName: 'messages-square', title: 'AI Chat', labs: '06-11, 21, 22, 25-30' });
const t2v = tile(a1, rowY(1), { role: 'model', iconName: 'binary', title: ['Text to', 'Vector'], labs: '20, 21, 25, 27, 30' });
const vw = tile(a2, rowY(1), { role: 'store', iconName: 'database', title: ['Vector', 'Writer'], labs: '20, 25, 30' });
const vs = tile(a2, rowY(2), { role: 'check', iconName: 'text-search', title: ['Vector', 'Search'], labs: '21, 25, 27, 30' });
const mcp = tile(a2, rowY(3), { role: 'engine', iconName: 'plug-zap', title: ['MCP', 'Client'], labs: '22, 29' });
d.arrow({ x1: box.r, y1: box.cy, x2: chat.x - 3, y2: chat.cy, straight: true });
d.arrow({ x1: t2v.r, y1: t2v.cy, x2: vw.x - 3, y2: vw.cy, straight: true });

// How AI Chat uses the other two, beside them.
card(a1, rowY(2), T, PITCH + TH, { role: 'result', iconName: 'info', title: 'AI Chat', center: true, items: ['answers from the', 'Top-K passages', 'that Vector', 'Search returns,', '', 'and can call the', 'tools of an MCP', 'server'] });

// Core PDI around the GenAI steps, under Ingest and Transform.
const core = card(ix, rowY(3), trn.r - ix, TH, { role: 'support', iconName: 'workflow', title: 'Core PDI around every GenAI step', items: ['steps, jobs, variables and the', 'metastore work with each one'] });

// Left: what the pipelines read, and what they write.
const src = card(M, rowY(0), LW, TH, { role: 'source', iconName: 'folder-open', title: 'Sources', items: ['PDF, Office, HTML,', 'logs, files'] });
const tgt = card(M, rowY(3), LW, TH, { role: 'write', iconName: 'file-output', title: 'Targets', items: ['databases, files,', 'reports'] });
d.arrow({ x1: src.r, y1: src.cy, x2: ing.x - 3, y2: src.cy, straight: true });
d.arrow({ x1: core.x, y1: tgt.cy, x2: tgt.r + 3, y2: tgt.cy, straight: true });

// Right: the services the AI steps call.
const llm = card(RX, rowY(0), RW, TH, { role: 'model', iconName: 'brain', title: 'LLM providers', items: ['OpenAI, Azure OpenAI,', 'AWS Bedrock,', 'Anthropic Claude,', 'Google Gemini, Ollama'] });
const vdb = card(RX, rowY(1), RW, PITCH + TH, { role: 'store', iconName: 'database', title: 'Vector databases', items: ['PGVector', 'Qdrant', 'Milvus', 'Pinecone', 'Chroma', 'OpenSearch', 'AlloyDB', '', 'the labs use pgvector'] });
const mcs = card(RX, rowY(3), RW, TH, { role: 'server', iconName: 'plug-zap', title: 'MCP servers', items: ['over stdio or', 'Streamable HTTP'] });

both(chat.r + 3, chat.cy, llm.x - 3, llm.cy);
d.arrow({ x1: vw.r, y1: vw.cy, x2: vdb.x - 3, y2: vw.cy, straight: true });
d.arrow({ x1: vdb.x, y1: vs.cy, x2: vs.r + 3, y2: vs.cy, straight: true });
both(mcp.r + 3, mcp.cy, mcs.x - 3, mcs.cy);
// Text to Vector's embeddings: up into the gap under AI Chat, across to
// the providers, dashed.
const gy = chat.b + (PITCH - TH) / 2;
d.edges.push(`<path d="M${t2v.cx} ${t2v.y - 3}L${t2v.cx} ${gy}L${llm.cx} ${gy}L${llm.cx} ${llm.b + 3}" fill="none" stroke="#64748b" stroke-width="1.7" stroke-dasharray="5 4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`);

d.write(import.meta.url);
