// Run on Pentaho Server: what lesson 25 deploys. Spoon and the User Console
// start the job; the server runs jb_rag_pipeline from its repository with
// its own plugins and settings, and reaches Ollama, pgvector and the disk
// folders that kettle.properties names.
//
// Facts it encodes (lesson 25 and files/solution/jb_rag_pipeline.kjb):
//   - The server: http://localhost:8080/pentaho, its own Java process, its
//     own plugins (12 pdi-step-... folders in pentaho-server\
//     pentaho-solutions\system\kettle\plugins), license and kettle.properties
//     (9 settings: OLLAMA_URL, MODEL_NAME, PG_HOST, PG_PORT, PG_DATABASE,
//     PG_USER, PG_PASSWORD, RAG_DATA_DIR, RAG_OUT_DIR).
//   - The job: START, tr_load_knowledge_base (build_knowledge_base.ktr),
//     tr_answer_questions (answer_questions.ktr), Success; Abort job when
//     either transformation fails (Follow When Result is False). Both
//     entries run configuration Pentaho local. Stored in
//     /public/ai-pipelines with both transformations.
//   - Spoon connects to the Pentaho Repository and runs the job with the
//     Pentaho server run configuration; the User Console schedules it
//     (Schedule..., every day at 03:00; Execute Now in Manage Schedules).
//   - The data: ${RAG_DATA_DIR}/docs and questions.csv; the output in
//     ${RAG_OUT_DIR}: kb_load_log.csv and answers.csv. Ollama on
//     localhost:11434; pgvector on localhost:5433, kb_chunks.
//
// Run from this folder:   node 25-server-deployment.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 548);

const spoon = d.box({ x: 16, y: 16, w: 376, h: 64, role: 'tool', iconName: 'monitor', title: 'Spoon, connected to the repository', lines: ['run configuration Pentaho server: the', 'server runs the job, Spoon reads the log'] });
const puc = d.box({ x: 408, y: 16, w: 376, h: 64, role: 'tool', iconName: 'calendar-clock', title: 'User Console: Schedule...', lines: ['jb_rag_pipeline, every day at 03:00;', 'Execute Now in Manage Schedules'] });

const sp = d.panel({ x: 16, y: 112, w: W - 32, h: 316, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'http://localhost:8080/pentaho: its own process, plugins, license and settings' });
d.arrow({ x1: spoon.cx, y1: spoon.b, x2: spoon.cx, y2: sp.y - 3, straight: true });
d.arrow({ x1: puc.cx, y1: puc.b, x2: puc.cx, y2: sp.y - 3, straight: true });

// The job, left to right.
const jy = 180;
const start = d.box({ x: 28, y: jy, w: 112, h: 64, role: 'support', iconName: 'play', title: 'START', lines: [] });
const t1 = d.box({ x: 164, y: jy, w: 224, h: 64, role: 'engine', title: 'tr_load_knowledge_base', lines: ['build_knowledge_base.ktr'], center: true });
const t2 = d.box({ x: 412, y: jy, w: 224, h: 64, role: 'engine', title: 'tr_answer_questions', lines: ['answer_questions.ktr'], center: true });
const ok = d.box({ x: 660, y: jy, w: 112, h: 64, role: 'write', title: 'Success', lines: [], center: true });
const ab = d.box({ x: 290, y: 272, w: 220, h: 52, role: 'reject', iconName: 'ban', title: 'Abort job', lines: ['when either one fails'] });
d.arrow({ x1: start.r, y1: start.cy, x2: t1.x - 3, y2: t1.cy, straight: true });
d.arrow({ x1: t1.r, y1: t1.cy, x2: t2.x - 3, y2: t2.cy, straight: true });
d.arrow({ x1: t2.r, y1: t2.cy, x2: ok.x - 3, y2: ok.cy, straight: true });
d.arrow({ x1: t1.cx, y1: t1.b, x2: ab.x - 3, y2: ab.cy, elbow: false, dashed: true });
d.arrow({ x1: t2.cx, y1: t2.b, x2: ab.r + 3, y2: ab.cy, dashed: true });

// What the server holds.
const hy = 348;
const repo = d.box({ x: 28, y: hy, w: 236, h: 64, role: 'store', iconName: 'folder-tree', title: '/public/ai-pipelines', lines: ['the job and its two', 'transformations'] });
d.box({ x: 282, y: hy, w: 236, h: 64, role: 'tool', iconName: 'puzzle', title: 'GenAI plugins', lines: ['12 pdi-step-... folders in', 'system\\kettle\\plugins'] });
d.box({ x: 536, y: hy, w: 236, h: 64, role: 'support', iconName: 'file-cog', title: 'kettle.properties', lines: ['9 settings, from', 'OLLAMA_URL to RAG_OUT_DIR'] });
d.arrow({ x1: repo.r - 40, y1: repo.y, x2: t1.x + 30, y2: t1.b + 3, dashed: true, vertical: true });

// What the settings point at, outside the server.
const by = 456;
const ol = d.box({ x: 16, y: by, w: 200, h: 76, role: 'model', iconName: 'brain', title: 'Ollama', lines: ['${OLLAMA_URL},', 'localhost:11434'] });
const pg = d.box({ x: 240, y: by, w: 236, h: 76, role: 'store', iconName: 'database', title: 'pgvector: kb_chunks', lines: ['${PG_HOST}:${PG_PORT},', 'localhost:5433, genai'] });
const fo = d.box({ x: 500, y: by, w: 284, h: 76, role: 'source', iconName: 'folder-open', title: 'Disk folders', lines: ['RAG_DATA_DIR: docs, questions.csv;', 'RAG_OUT_DIR: kb_load_log.csv', 'and answers.csv'] });
[ol, pg, fo].forEach((b) => d.arrow({ x1: b.cx, y1: sp.b, x2: b.cx, y2: b.y - 3, straight: true }));

d.write(import.meta.url);
