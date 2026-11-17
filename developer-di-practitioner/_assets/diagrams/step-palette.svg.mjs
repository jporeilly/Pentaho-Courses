// Key Concepts, Transformation: the step folders Spoon's Design tab
// offers, each with examples (from the old transformations.jpeg palette
// screenshot, which was cut off, so these are examples, not every step).
// Run: node step-palette.svg.mjs
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';

const FOLDERS = [
  // [column, title, role, icon, example steps]
  [0, 'Input', 'source', 'file-input', ['CSV file input', 'Data grid', 'Generate rows', 'Get data from XML', 'JSON input', 'Microsoft Excel input', 'Table input', 'Text file input']],
  [0, 'Output', 'write', 'database', ['Delete', 'Insert / update', 'Microsoft Excel writer', 'Synchronize after merge', 'Table output', 'Text file output', 'Update']],
  [0, 'Streaming', 'source', 'radio-tower', ['Get records from stream']],
  [0, 'Job', 'support', 'workflow', ['Copy rows to result', 'Get rows from result', 'Get variables', 'Set variables']],
  [0, 'Mapping', 'engine', 'layers', ['Mapping (sub-transformation)', 'Mapping input specification', 'Mapping output specification']],
  [1, 'Transform', 'engine', 'shuffle', ['Add constants', 'Add sequence', 'Calculator', 'Select values', 'Sort rows', 'Split fields', 'String operations', 'Unique rows', 'Value mapper']],
  [1, 'Flow', 'engine', 'git-branch', ['Abort', 'Append streams', 'Block this step until steps finish', 'Dummy (do nothing)', 'Filter rows', 'Job executor']],
  [1, 'Utility', 'support', 'wrench', ['Clone row', 'Delay row', 'Execute a process', 'Mail', 'Null if']],
  [2, 'Lookup', 'check', 'book-open', ['Call DB procedure', 'Database join', 'Database lookup', 'Fuzzy match', 'REST client', 'Stream lookup']],
  [2, 'Joins', 'join', 'combine', ['Join rows (cartesian product)', 'Merge join', 'Merge rows (diff)', 'Multiway merge join', 'Sorted merge', 'XML join']],
  [2, 'Scripting', 'engine', 'code', ['Execute SQL script', 'Formula', 'Modified JavaScript value', 'Regex evaluation', 'User defined Java expression']],
  [2, 'Agile', 'store', 'zap', ['MonetDB Agile Mart', 'Table Agile Mart']],
  [3, 'Data Warehouse', 'model', 'boxes', ['Combination lookup/update']],
  [3, 'Bulk loading', 'store', 'upload', ['MySQL bulk loader', 'Oracle bulk loader', 'PostgreSQL bulk loader']],
  [3, 'Big Data', 'engine', 'cloud', ['Cassandra input', 'CouchDB input', 'MongoDB input', 'MongoDB output']],
  [3, 'Cryptography', 'support', 'lock', ['PGP decrypt stream', 'PGP encrypt stream', 'Symmetric cryptography']],
  [3, 'Pentaho Server', 'server', 'server', ['Call endpoint', 'Get session variables', 'Set session variables']],
];

const CW = 236, GAP = 14, X0 = 16, Y0 = 16, HEAD = 36, LH = 18, PAD = 10, VG = 10;
const colX = (c) => X0 + c * (CW + GAP);
const height = (n) => HEAD + n * LH + PAD;
const colY = [Y0, Y0, Y0, Y0];
const placed = FOLDERS.map(([c, title, role, iconName, entries]) => {
  const y = colY[c];
  colY[c] += height(entries.length) + VG;
  return { x: colX(c), y, title, role, iconName, entries };
});

const W = X0 * 2 + 4 * CW + 3 * GAP;
const foot = Math.max(...colY) + 4;
const d = new Diagram(W, foot + 40);
for (const p of placed) {
  d.panel({ x: p.x, y: p.y, w: CW, h: height(p.entries.length), role: p.role, iconName: p.iconName, title: p.title });
  p.entries.forEach((e, i) => d.raw(`<text x="${p.x + 16}" y="${p.y + HEAD + 13 + i * LH}" font-size="12" fill="#1e293b">${esc(e)}</text>`));
}
d.raw(`<text x="${X0}" y="${foot + 22}" font-size="12.5" fill="#334155">Examples from each folder: the Design tab lists many more steps. To find one, type part of its name in the search box at the top of the Design tab.</text>`);

d.write(import.meta.url);
