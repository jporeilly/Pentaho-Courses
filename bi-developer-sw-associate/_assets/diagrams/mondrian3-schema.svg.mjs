// Overview of Schemas: the Mondrian 3 schema's elements, nested the way the
// XML nests them, each with its SteelWheels example. Replaces the mind map
// schema_mondrian_3_schema.png, which hung CalculatedMember under Measure (it
// is a child of Cube) and left Annotations floating.
//
// Facts, from 04-schemas-steelwheels/files/steelwheels.xml:
//   - <Schema name="SteelWheels">, <Cube name="Sales_2003_2005">,
//     <Table name="ORDERFACT">.
//   - <Dimension name="MARKETS" foreignKey="CUSTOMERNUMBER">, <Hierarchy
//     name="Markets" hasAll="true" allMemberName="All Markets">, <Table
//     name="CUSTOMER_W_TER">, Levels Territory, Country, State Province, City.
//   - Property "Customer Number" on the CUSTOMERS dimension's Customer level;
//     Annotation Geo.Role on Country; AnalyzerDateFormat on Years.
//   - <Measure name="Sales" column="TOTALPRICE" aggregator="sum">.
// And from the lessons' own XML (grep of courses/bi-developer-sw-associate):
//   CalculatedMember in 08, 09 and 17; NamedSet in 12; DimensionUsage (a
//   shared dimension) in 08 and 09; Role in 14. No lesson uses VirtualCube,
//   Parameter or UserDefinedFunction. Under Schema, Mondrian 3 allows
//   Parameter, Dimension, Cube, VirtualCube, NamedSet, Role and
//   UserDefinedFunction; CalculatedMember only inside a Cube or VirtualCube.
//
// Colors: teal the logical model, green a physical table, slate an
// annotation and the schema itself, stone an element this course does not use.
//
// Run from this folder:   node mondrian3-schema.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1100, 684);

d.panel({ x: 16, y: 16, w: 1068, h: 624, role: 'support', iconName: 'file-code', title: 'Schema  "SteelWheels"', sub: 'one XML file: you publish it to the server as one catalog' });

// ── The cube ───────────────────────────────────────────────────────────
d.panel({ x: 32, y: 76, w: 704, h: 548, role: 'model', iconName: 'box', title: 'Cube  "Sales_2003_2005"', sub: 'one fact table, the dimensions around it, the measures' });
d.box({ x: 48, y: 136, w: 300, h: 56, role: 'store', iconName: 'table-2', title: 'Table  ORDERFACT', lines: ['the fact table, one row per order line'] });

d.panel({ x: 48, y: 208, w: 672, h: 324, role: 'model', iconName: 'globe', title: 'Dimension  "MARKETS"', sub: 'joined to the fact table on foreignKey CUSTOMERNUMBER' });
d.panel({ x: 64, y: 266, w: 640, h: 250, role: 'model', iconName: 'network', title: 'Hierarchy  "Markets"', sub: 'hasAll: an "All Markets" member above the top level' });
d.box({ x: 80, y: 324, w: 248, h: 56, role: 'store', iconName: 'table-2', title: 'Table  CUSTOMER_W_TER', lines: ["the dimension's own table"] });
// A Level holds its Properties and Annotations.
d.panel({ x: 344, y: 324, w: 344, h: 176, role: 'model', iconName: 'layers', title: 'Level  "Territory"', sub: 'then Country, State Province and City' });
d.box({ x: 360, y: 382, w: 312, h: 52, role: 'model', iconName: 'info', title: 'Property', lines: ['Customer Number, on the Customer level'] });
d.box({ x: 360, y: 440, w: 312, h: 52, role: 'support', iconName: 'sticky-note', title: 'Annotation', lines: ['Geo.Role, on the Country level'] });

const MW = 213, MG = 16;
d.box({ x: 48, y: 548, w: MW, h: 60, role: 'model', iconName: 'sigma', title: 'Measure  Sales', lines: ['SUM of TOTALPRICE'] });
d.box({ x: 48 + MW + MG, y: 548, w: MW, h: 60, role: 'model', iconName: 'calculator', title: 'CalculatedMember', lines: ['a formula: lessons 8, 9'] });
d.box({ x: 48 + 2 * (MW + MG), y: 548, w: MW, h: 60, role: 'model', iconName: 'list-checks', title: 'NamedSet', lines: ['a saved set: lesson 12'] });

// ── Also directly under Schema ─────────────────────────────────────────
d.raw(`<text x="752" y="98" font-size="13" font-weight="700" fill="#334155">Also directly under Schema</text>`);
const RX = 752, RW = 316;
d.box({ x: RX, y: 112, w: RW, h: 68, role: 'model', iconName: 'share-2', title: 'Dimension (shared)', lines: ['declared once, used in each cube', 'through DimensionUsage: lesson 8'] });
d.box({ x: RX, y: 196, w: RW, h: 68, role: 'model', iconName: 'key-round', title: 'Role', lines: ['who sees which cubes and members:', 'lesson 14'] });
d.box({ x: RX, y: 280, w: RW, h: 68, role: 'model', iconName: 'list-checks', title: 'NamedSet (schema-wide)', lines: ['a saved set every cube can use'] });
d.box({ x: RX, y: 364, w: RW, h: 68, role: 'off', iconName: 'boxes', title: 'VirtualCube', lines: ["combines cubes' measures;", 'not used in this course'] });
d.box({ x: RX, y: 448, w: RW, h: 68, role: 'off', iconName: 'file-code', title: 'Parameter, UserDefinedFunction', lines: ['not used in this course'] });

d.raw(`<text x="550" y="670" text-anchor="middle" font-size="12" fill="#475569">A box inside another is an XML element inside another. Teal: the logical model; green: a physical table; stone: not used in this course.</text>`);

d.write(import.meta.url);
