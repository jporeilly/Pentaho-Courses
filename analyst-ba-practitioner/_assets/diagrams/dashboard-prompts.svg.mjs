// Dashboard prompts as parameters: how the Vendor Sales workshop's two
// prompts reach the Vendor Sales Report. A Metadata List on the Orders
// data source fetches each prompt's buttons, a click sets a dashboard
// parameter, the panel's Parameters tab maps it onto one of the report's
// own parameters (region, Product Line), and the panel reloads the report
// with the value. It sits in 13-dashboard-designer-vendor-sales/guide.md,
// tab "8. Apply the Prompt", after the "A dashboard prompt is a
// parameter handed to the report" under-the-hood box, with a "Read the
// diagram" paragraph after it.
//
// Every fact comes from lesson 13 (13-dashboard-designer-vendor-sales):
//   - "6. Prompt Toolbar": dashboard prompts apply to the content of the
//     whole dashboard; a prompt reaches an individual report only when
//     that report's filter is set up as a parameter.
//   - "7. Territory Prompt" and its settings table: both prompts use the
//     Buttons control and a Metadata List on the Orders data source; the
//     Territory query is Customer > Territory, is not null (the preview
//     lists APAC, EMEA, Japan and NA); the Product Line query is
//     Products > Product Line, is not null (Classic Cars to Vintage Cars,
//     tab 10 checkpoint); Territory allows multiple selections, Product
//     Line does not (the report's Product Line parameter takes one
//     value, tab 9). Vendor Sales parameter: region for Territory,
//     Product Line for Product Line.
//   - "8. Apply the Prompt", under the hood: the Metadata List ran an MQL
//     query to fetch the button labels; selecting buttons sets a
//     dashboard-level parameter; the association on the Parameters tab
//     (Source) maps it onto the report's own region parameter; the panel
//     reloads the report with region=EMEA, and the report's engine
//     applies it as a WHERE constraint exactly as from its own prompt.
//
// Colors: teal the metadata queries (the model), amber the prompt
// toolbar (in the browser), violet the report and its engine. Icons:
// shapes a metadata model, mouse-pointer-click a prompt, list-filter a
// parameter, server the report's engine.
//
// Run from this folder:   node dashboard-prompts.svg.mjs
// It writes dashboard-prompts.svg here and ../images/dashboard-prompts.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: 800 wide, three panels of 240 with 24px between
// them; each panel holds two same-size boxes (BW x BH), one per prompt,
// Territory on top and Product Line below.
const W = 800, PW = 240, BW = 216, BH = 80;
const PX = [16, 280, 544]; // left edge of each panel
const BY = [76, 184]; // top of each prompt's row of boxes
const PTOP = 16, PH = BY[1] + BH + 14 - PTOP;
const d = new Diagram(W, 400);

// A box in panel `c`, row `r`, inset 12px from the panel's sides.
const cell = (c, r, o) => d.box({ x: PX[c] + 12, y: BY[r], w: BW, h: BH, ...o });

// ── Panel 1: the Metadata List queries (teal, the model) ──────────────
// Each prompt's values come from an MQL query on the Orders data source.
d.panel({ x: PX[0], y: PTOP, w: PW, h: PH, role: 'model', iconName: 'shapes', title: 'Metadata List on Orders', sub: 'an MQL query fetches the buttons' });
const q1 = cell(0, 0, { role: 'model', iconName: 'shapes', title: 'Territory', lines: ['Customer > Territory,', 'is not null'] });
const q2 = cell(0, 1, { role: 'model', iconName: 'shapes', title: 'Product Line', lines: ['Products > Product Line,', 'is not null'] });

// ── Panel 2: the prompt toolbar (amber, the browser) ──────────────────
// Each prompt is a row of buttons; a click sets a dashboard parameter.
d.panel({ x: PX[1], y: PTOP, w: PW, h: PH, role: 'browser', iconName: 'mouse-pointer-click', title: 'Prompt toolbar', sub: 'a click sets a dashboard parameter' });
const p1 = cell(1, 0, { role: 'browser', iconName: 'mouse-pointer-click', title: 'Territory', lines: ['APAC, EMEA, Japan, NA;', 'multiple selections'] });
const p2 = cell(1, 1, { role: 'browser', iconName: 'mouse-pointer-click', title: 'Product Line', lines: ['Classic Cars to', 'Vintage Cars; one only'] });

// ── Panel 3: the Vendor Sales Report's own parameters (violet) ────────
// The Parameters tab's Source maps each dashboard parameter onto one.
d.panel({ x: PX[2], y: PTOP, w: PW, h: PH, role: 'server', iconName: 'file-text', title: 'Vendor Sales Report', sub: 'Parameters tab: each one’s Source' });
const r1 = cell(2, 0, { role: 'server', iconName: 'list-filter', title: 'region', lines: ['a filter set up as', 'a report parameter'] });
const r2 = cell(2, 1, { role: 'server', iconName: 'list-filter', title: 'Product Line', lines: ['a report parameter;', 'takes one value'] });

// Left to right along each row: the query fills the buttons, the
// button's dashboard parameter is the Source of the report's parameter.
// Straight arrows across the 48px between boxes.
for (const [a, b] of [[q1, p1], [p1, r1], [q2, p2], [p2, r2]]) {
  d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy, straight: true });
}

// ── Underneath: what the report does with the value ───────────────────
// Violet bar (the report's engine), fed by a straight arrow from the
// foot of the report's panel, labeled with the request the panel makes.
const by = PTOP + PH + 52;
const bar = d.bar({ x: 16, y: by, w: W - 32, h: 62, role: 'engine', iconName: 'server', title: 'The panel reloads the report: region=EMEA', line: 'the report’s engine applies it as a WHERE constraint, exactly as from its own prompt' });
d.arrow({ x1: PX[2] + PW / 2, y1: PTOP + PH, x2: PX[2] + PW / 2, y2: bar.y - 3, straight: true, label: 'reload' });

// Size the canvas to the bar's foot.
d.h = bar.b + 16;

d.write(import.meta.url);
