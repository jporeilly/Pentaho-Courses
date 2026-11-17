// Review Scalability, Slave server: a run configuration decides where a
// transformation runs. Pentaho local runs it in Spoon's own engine; a
// Slave server run configuration sends it over HTTP to a Carte server,
// which Spoon reaches through a Slave server entry on the View tab.
// Run: node run-configuration-targets.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 470);
d.panel({ x: 12, y: 12, w: 976, h: 446, role: 'support', iconName: 'sliders-horizontal', title: 'Run configurations: where a transformation runs', sub: 'the same Pentaho engine, on your own machine or on a Carte server' });

const H = 84;
const spoon = d.box({ x: 32, y: 120, w: 190, h: 160, role: 'tool', iconName: 'monitor', title: 'Spoon', lines: ['you press Run and', 'pick a run', 'configuration'] });

const localCfg = d.box({ x: 290, y: 92, w: 236, h: H, role: 'support', iconName: 'settings-2', title: 'Pentaho local', lines: ['the default run', 'configuration'] });
const local = d.box({ x: 720, y: 92, w: 248, h: H, role: 'tool', iconName: 'laptop', title: 'This machine', lines: ["Spoon's own engine:", 'right for light work'] });

const carteCfg = d.box({ x: 290, y: 224, w: 236, h: H, role: 'check', iconName: 'settings-2', title: 'Slave server', lines: ['a run configuration that', 'names a registered server'] });
const carte = d.box({ x: 720, y: 224, w: 248, h: H, role: 'server', iconName: 'server', title: 'Carte server', lines: ['a small embedded web server', 'that runs what it is sent'] });

d.arrow({ x1: spoon.r, y1: spoon.cy - 30, x2: localCfg.x - 3, y2: localCfg.cy });
d.arrow({ x1: spoon.r, y1: spoon.cy + 30, x2: carteCfg.x - 3, y2: carteCfg.cy });
d.arrow({ x1: localCfg.r, y1: localCfg.cy, x2: local.x - 3, y2: local.cy, label: 'runs here' });
d.arrow({ x1: carteCfg.r, y1: carteCfg.cy - 16, x2: carte.x - 3, y2: carte.cy - 16, straight: true, label: 'sends the .ktr (HTTP)' });
d.arrow({ x1: carte.x, y1: carte.cy + 22, x2: carteCfg.r + 3, y2: carteCfg.cy + 22, straight: true, dashed: true, label: 'status and log' });

// How the two ends are set up.
const by = 344;
const entry = d.box({ x: 290, y: by, w: 236, h: 76, role: 'support', iconName: 'list', title: 'Slave server entry', lines: ['View tab: name, host, port,', 'user name and password'] });
const start = d.box({ x: 720, y: by, w: 248, h: 76, role: 'off', iconName: 'server', title: 'Start Carte', lines: ['.\\carte.bat localhost 8081', 'a host (or IP) and a port'] });
d.arrow({ x1: entry.cx, y1: entry.y, x2: carteCfg.cx, y2: carteCfg.b + 3, straight: true, dashed: true, label: 'how Spoon finds it', head: true });
d.arrow({ x1: start.cx, y1: start.y, x2: carte.cx, y2: carte.b + 3, straight: true, dashed: true, label: 'started with' });

d.write(import.meta.url);
