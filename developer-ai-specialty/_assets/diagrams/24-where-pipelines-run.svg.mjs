// The Moving to Production overview: where a pipeline runs. One .ktr or
// .kjb file, five runtimes that can run it, what starts each and where its
// GenAI plugins go, what every runtime needs, and the services they share.
//
// Facts it encodes (lesson 24, parts 1 to 4):
//   - A transformation or job is a file, .ktr or .kjb, and any Pentaho Data
//     Integration engine can run it. Spoon is where you design and test.
//   - Pentaho Server: its scheduler, Spoon's Pentaho server run
//     configuration, or its REST API; plugins in pentaho-server\
//     pentaho-solutions\system\kettle\plugins.
//   - Carte: Spoon's Slave server run configuration, a job entry, or its
//     own web services; data-integration\plugins of the Carte installation.
//   - Kitchen and Pan: Windows Task Scheduler or any scheduler that can run
//     a command; data-integration\plugins of that installation.
//   - A container (a Carte image built with docker-maker): the container
//     platform; generatedFiles\fileOverride\plugins, before the image is
//     built. Spoon and Carte use data-integration\plugins.
//   - Every runtime: the same bundle, pdi-genai-plugins-bundle-1.2.0-157;
//     a license with GENAI-EE rights, or every GenAI step fails to
//     initialize; its own kettle.properties (OLLAMA_URL, MODEL_NAME, PG_*).
//   - In production every runtime calls one model server (OLLAMA_URL) and
//     one vector store (PG_HOST, PG_PORT, PG_DATABASE), and loads and
//     queries with the same embedding model, nomic-embed-text.
//
// Run from this folder:   node 24-where-pipelines-run.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BH = 64, PITCH = 76, HEAD = 56;
const FX = 16, FW = 140, RX = 188, RW = 352, NX = 572, NW = W - 16 - NX;
const panelH = HEAD + 5 * PITCH - (PITCH - BH) + 12;
const barY = 16 + panelH + 16;
const d = new Diagram(W, barY + 64 + 16);

const rp = d.panel({ x: RX, y: 16, w: RW, h: panelH, role: 'tool', iconName: 'workflow', title: 'Runtimes', sub: 'what starts the run; where its GenAI plugins go' });
const runtimes = [
  { role: 'tool', iconName: 'monitor', title: 'Spoon', lines: ['you design, test and start the run;', 'data-integration\\plugins'] },
  { role: 'server', iconName: 'server', title: 'Pentaho Server', lines: ['the scheduler, Spoon or its REST API;', 'pentaho-solutions\\system\\kettle\\plugins'] },
  { role: 'server', iconName: 'server-cog', title: 'Carte', lines: ['Spoon, a job entry or its web services;', 'data-integration\\plugins of Carte'] },
  { role: 'server', iconName: 'square-terminal', title: 'Kitchen and Pan', lines: ['Task Scheduler, or any scheduler;', 'data-integration\\plugins of that install'] },
  { role: 'server', iconName: 'container', title: 'A container (docker-maker)', lines: ['the container platform; plugins in', 'generatedFiles\\fileOverride\\plugins'] },
].map((s, i) => d.box({ x: RX + 12, y: 16 + HEAD + i * PITCH, w: RW - 24, h: BH, ...s }));

// The file, on the left: every runtime runs the same one.
const file = d.box({ x: FX, y: runtimes[1].y, w: FW, h: runtimes[3].b - runtimes[1].y, role: 'source', title: '.ktr or .kjb', lines: ['the same file;', 'any engine', 'runs it'], center: true });
runtimes.forEach((r) => d.arrow({ x1: file.r, y1: Math.min(Math.max(r.cy, file.y + 12), file.b - 12), x2: r.x - 3, y2: r.cy }));

// What every runtime needs.
const np = d.panel({ x: NX, y: 16, w: NW, h: panelH, role: 'support', iconName: 'clipboard-list', title: 'Each runtime needs', sub: 'its own copy of each' });
const need = [
  { role: 'tool', iconName: 'puzzle', title: 'GenAI plugins', lines: ['the same bundle,', '1.2.0-157'] },
  { role: 'check', iconName: 'shield-check', title: 'GENAI-EE license', lines: ['or every GenAI step', 'fails to initialize'] },
  { role: 'support', iconName: 'file-cog', title: 'kettle.properties', lines: ['OLLAMA_URL,', 'MODEL_NAME, PG_*'] },
];
const ny = (np.h - HEAD - 3 * BH) / 4;
need.forEach((s, i) => d.box({ x: NX + 12, y: 16 + HEAD + ny + i * (BH + ny) - 6, w: NW - 24, h: BH, ...s }));
d.arrow({ x1: rp.r, y1: rp.cy, x2: np.x - 3, y2: rp.cy, straight: true });

d.bar({ x: 16, y: barY, w: W - 32, h: 64, role: 'model', iconName: 'brain', title: 'Shared by every runtime: one model server (OLLAMA_URL) and one vector store (PG_HOST)', line: 'loaded and queried with the same embedding model, nomic-embed-text' });

d.write(import.meta.url);
