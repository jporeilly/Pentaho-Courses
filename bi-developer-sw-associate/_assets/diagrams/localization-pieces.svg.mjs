// FR Localization: the four pieces and where each lives. Tokens in the
// schema (tab 1), the bundles (tab 2) and localePropFile (tab 3) are files;
// the processor parameters (tab 4) belong to the published catalog, which
// every publish from Schema Workbench replaces. Proven on the server
// 2026-11-12: without the tab 4 parameters Analyzer shows the raw tokens.
// Run: node localization-pieces.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1200, 462);
const BH = 84;

d.panel({ x: 16, y: 16, w: 264, h: 376, role: 'tool', iconName: 'pencil-ruler', title: 'Schema Workbench', sub: 'tab 1' });
const sch = d.box({ x: 28, y: 186, w: 240, h: BH, role: 'model', iconName: 'file-code', title: 'Tokenized schema', lines: ['caption="%{classicmodels.', '...territory.caption}"'] });

d.panel({ x: 316, y: 16, w: 560, h: 376, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'tabs 2 to 4' });
const bun = d.box({ x: 328, y: 82, w: 240, h: BH, role: 'store', iconName: 'file-text', title: 'Message bundles', lines: ['WEB-INF\\classes\\com\\', 'pentaho\\messages (tab 2)'] });
const prp = d.box({ x: 328, y: 186, w: 240, h: BH, role: 'support', iconName: 'settings', title: 'mondrian.properties', lines: ['localePropFile = com.', 'pentaho.messages... (tab 3)'] });
const cat = d.box({ x: 328, y: 290, w: 240, h: BH, role: 'model', iconName: 'box', title: 'Classic Models', lines: ['DynamicSchemaProcessor,', 'UseContentChecksum (tab 4)'] });
const prc = d.box({ x: 644, y: 186, w: 220, h: BH, role: 'engine', iconName: 'languages', title: 'Token replacement', lines: ['each %{key} becomes', 'the bundle\'s text'] });

d.panel({ x: 912, y: 16, w: 272, h: 376, role: 'browser', iconName: 'chart-column', title: 'Analyzer', sub: 'the session\'s language' });
const fr = d.box({ x: 924, y: 128, w: 248, h: BH, role: 'browser', iconName: 'globe', title: 'Home?locale=fr', lines: ['Clients, Territoire,', 'Gamme de Produits, Ventes'] });
const en = d.box({ x: 924, y: 244, w: 248, h: BH, role: 'browser', iconName: 'globe', title: 'Home?locale=en', lines: ['Customers, Territory,', 'Line, Sales'] });

d.arrow({ x1: sch.r, y1: sch.cy, x2: cat.x - 3, y2: cat.cy, label: ['Publish'] });
d.arrow({ x1: bun.r, y1: bun.cy, x2: prc.x - 3, y2: prc.cy - 22 });
d.arrow({ x1: prp.r, y1: prp.cy, x2: prc.x - 3, y2: prc.cy, straight: true });
d.arrow({ x1: cat.r, y1: cat.cy, x2: prc.x - 3, y2: prc.cy + 22 });
d.arrow({ x1: prc.r, y1: prc.cy, x2: fr.x - 3, y2: fr.cy });
d.arrow({ x1: prc.r, y1: prc.cy, x2: en.x - 3, y2: en.cy });

d.pill(600, 428, ['Publishing again from Schema Workbench resets the catalog\'s parameters: add the two again in Manage Data Sources']);

d.write(import.meta.url);
