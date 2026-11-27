// Before You Start, "How the pieces fit": the four things that run on the
// learner's machine for this course, the two optional Pentaho servers two
// labs add, and the ports they answer on.
//
// Facts it encodes (lesson 00):
//   - Pentaho Data Integration (Spoon) with the Pentaho GenAI plugin suite,
//     12 steps, bundle 1.2.0-157, one folder per plugin under
//     C:\Pentaho\design-tools\data-integration\plugins; every step needs a
//     Pentaho EE license with GenAI (GENAI-EE) rights.
//   - Every AI step names its server and model as ${OLLAMA_URL} and
//     ${MODEL_NAME}, which the setup writes into kettle.properties.
//   - Ollama on http://localhost:11434 with llama3.2:3b (answers the
//     prompts), qwen2.5:7b (answers when the model must call tools),
//     gemma3:12b (reads images: the vision model of lab 26) and
//     nomic-embed-text (embeddings).
//   - PostgreSQL with pgvector in the Podman container pcm-pgvector, on
//     localhost:5433, database genai, user genai: the RAG vector store and
//     the database the LangExtract workshops load (and the capstone).
//   - Python 3.12 or later: the Key Concepts scripts, the LangExtract
//     service (http://localhost:8765), the MCP server retail_mcp_server.py
//     (Spoon starts it over standard input and output) and the assessment
//     agent (http://localhost:8000).
//   - The lab files under C:\Workshop-AI-Specialty, one folder per module.
//   - Optional (PDI tab, step 4, and Ports and Logins): Pentaho Server 11
//     EE on http://localhost:8080/pentaho, user admin, only for Run on
//     Pentaho Server (lab 25), its repository PostgreSQL on 5432; Carte on
//     http://127.0.0.1:8081, user cluster, for Project: Pentaho MCP Server
//     (lab 29).
//
// Run from this folder:   node 00-the-machine.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BH = 56, GAP = 10, HEAD = 56;
const LX = 16, LW = 272, RX = 360, RW = W - 16 - RX;
const panelH = (n) => HEAD + n * (BH + GAP) - GAP + 12;

const oy = 16, py = oy + panelH(4) + 16, sy = py + panelH(1) + 16, xy = sy + panelH(3) + 16;
const H = xy + panelH(2) + 16;
const d = new Diagram(W, H);

// Spoon and what it carries.
const lp = d.panel({ x: LX, y: 16, w: LW, h: H - 32, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: 'Spoon, with the GenAI plugins' });
// Four boxes spread evenly down the panel, beside the three on the right.
const space = (H - 32 - HEAD - 4 * 64) / 5;
const lb = (i, s) => d.box({ x: LX + 12, y: 16 + HEAD + space + i * (64 + space) - 8, w: LW - 24, h: 64, ...s });
lb(0, { role: 'tool', iconName: 'puzzle', title: 'GenAI plugin suite', lines: ['12 steps, version 1.2.0-157,', 'in data-integration\\plugins'] });
lb(1, { role: 'support', iconName: 'shield-check', title: 'License: GENAI-EE', lines: ['Pentaho EE, with GenAI rights;', 'every GenAI step checks it'] });
lb(2, { role: 'support', iconName: 'file-cog', title: 'kettle.properties', lines: ['OLLAMA_URL and MODEL_NAME,', 'read by every AI step'] });
lb(3, { role: 'source', iconName: 'folder-open', title: 'Lab files', lines: ['C:\\Workshop-AI-Specialty,', 'one folder per module'] });

// The services it calls, each in its own panel.
const rb = (y, i, s) => d.box({ x: RX + 12, y: y + HEAD + i * (BH + GAP), w: RW - 24, h: BH, ...s });
const op = d.panel({ x: RX, y: oy, w: RW, h: panelH(4), role: 'model', iconName: 'brain', title: 'Ollama', sub: 'http://localhost:11434: the local LLM server' });
rb(oy, 0, { role: 'model', iconName: 'brain', title: 'llama3.2:3b', lines: ['answers the prompts'] });
rb(oy, 1, { role: 'model', iconName: 'brain', title: 'qwen2.5:7b', lines: ['answers when the model must call tools'] });
rb(oy, 2, { role: 'model', iconName: 'brain', title: 'gemma3:12b', lines: ['reads images: the vision model of lab 26'] });
rb(oy, 3, { role: 'model', iconName: 'binary', title: 'nomic-embed-text', lines: ['turns text into embeddings'] });

const pp = d.panel({ x: RX, y: py, w: RW, h: panelH(1), role: 'store', iconName: 'database', title: 'PostgreSQL with pgvector', sub: 'Podman container pcm-pgvector, localhost:5433' });
rb(py, 0, { role: 'store', iconName: 'database', title: 'Database genai, user genai', lines: ['the vector store, the LangExtract tables, the capstone'] });

const sp = d.panel({ x: RX, y: sy, w: RW, h: panelH(3), role: 'server', iconName: 'server', title: 'Python 3.12', sub: 'the Key Concepts scripts and three lab services' });
rb(sy, 0, { role: 'server', iconName: 'server', title: 'LangExtract service', lines: ['http://localhost:8765'] });
rb(sy, 1, { role: 'server', iconName: 'plug-zap', title: 'MCP server, retail_mcp_server.py', lines: ['Spoon starts it, over standard input and output'] });
rb(sy, 2, { role: 'server', iconName: 'bot', title: 'Assessment agent', lines: ['http://localhost:8000'] });

const xp = d.panel({ x: RX, y: xy, w: RW, h: panelH(2), role: 'server', iconName: 'server', title: 'Optional: two Pentaho servers', sub: 'only for the labs that run transformations on them' });
rb(xy, 0, { role: 'server', iconName: 'server', title: 'Pentaho Server 11 EE (lab 25)', lines: ['http://localhost:8080/pentaho, user admin'] });
rb(xy, 1, { role: 'server', iconName: 'server-cog', title: 'Carte (lab 29)', lines: ['http://127.0.0.1:8081, user cluster'] });

// Spoon's calls, one arrow into each panel's title strip; dashed to the
// optional servers.
[op, pp, sp].forEach((p) => d.arrow({ x1: lp.r, y1: p.y + 28, x2: p.x - 3, y2: p.y + 28, straight: true }));
d.arrow({ x1: lp.r, y1: xp.y + 28, x2: xp.x - 3, y2: xp.y + 28, straight: true, dashed: true });

d.write(import.meta.url);
