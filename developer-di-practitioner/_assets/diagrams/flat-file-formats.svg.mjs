// Review Flat Files: the four kinds of flat file, with the formats and
// examples the lesson names for each.
// Run: node flat-file-formats.svg.mjs
//
// Source: courses/developer-di-practitioner/topic-mod3-flat-files-review/guide.md,
// the "Flat files" note and the bullet list under it (lines 13-23). The
// note says flat files "come in four kinds"; the diagram draws one panel
// per kind, in the list's order, and only what the list names:
//
// * Structured (line 15): "a consistent, predictable layout with defined
//   fields and delimiters". Formats (lines 16-18):
//   - CSV, "comma-separated values"
//   - TSV, "tab-separated values"
//   - Fixed-width, "each field takes a set number of characters"
// * Semi-structured (line 19): "self-describing and flexible". Formats
//   (lines 20-21):
//   - JSON, "key-value pairs and nested objects"
//   - XML, "hierarchical tags"
// * Unstructured (line 22): "free-form text with no schema". Examples:
//   "documents, email bodies, raw application logs".
// * Metadata (line 23): "information about the data". Examples:
//   "header rows with column names, schema definitions with types and
//   constraints, notes on where a file came from".
//
// Colors follow the Module 3 overview's kinds-of-file-data.svg.mjs, which
// draws the same four kinds: blue structured, teal semi-structured,
// violet unstructured, amber metadata. File-format icons follow this
// folder's README (file-code XML, file-json JSON, file-text text).
// Formats no lesson in Module 3 names (PSV, YAML, .ENV) are not drawn.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: four 248-wide panels with 16px gutters and margins; each panel
// holds up to three 216x56 boxes under a two-line title strip.
const PW = 248, PH = 264, BW = 216, BH = 56;
const d = new Diagram(16 + 4 * PW + 3 * 16 + 16, 16 + PH + 16);

// One kind of flat file: a panel with the kind's name and the lesson's
// one-line description, then a box per format or example it names.
const kind = (i, role, iconName, title, sub, items) => {
  const x = 16 + i * (PW + 16);
  d.panel({ x, y: 16, w: PW, h: PH, role, iconName, title, sub });
  items.forEach(([ic, t, line], j) => d.box({
    x: x + 16, y: 76 + j * (BH + 12), w: BW, h: BH,
    role, iconName: ic, title: t, lines: line ? [line] : [],
  }));
};

// Structured (lesson lines 15-18): CSV, TSV and fixed-width.
kind(0, 'source', 'table', 'Structured', 'defined fields and delimiters', [
  ['file-spreadsheet', 'CSV', 'comma-separated values'],
  ['columns-3', 'TSV', 'tab-separated values'],
  ['ruler', 'Fixed-width', 'set characters per field'],
]);

// Semi-structured (lesson lines 19-21): JSON and XML.
kind(1, 'join', 'braces', 'Semi-structured', 'self-describing and flexible', [
  ['file-json', 'JSON', 'key-value pairs, nesting'],
  ['file-code', 'XML', 'hierarchical tags'],
]);

// Unstructured (lesson line 22): the three examples it lists.
kind(2, 'engine', 'text', 'Unstructured', 'free-form text, no schema', [
  ['file-text', 'Documents'],
  ['mail', 'Email bodies'],
  ['scroll-text', 'Application logs', 'raw'],
]);

// Metadata (lesson line 23): the three examples it lists.
kind(3, 'check', 'tags', 'Metadata', 'information about the data', [
  ['heading', 'Header rows', 'column names'],
  ['list', 'Schema definitions', 'types and constraints'],
  ['info', 'Source notes', 'where a file came from'],
]);

// Write the .svg next to this script and the 2x PNG to ../images/.
d.write(import.meta.url);
