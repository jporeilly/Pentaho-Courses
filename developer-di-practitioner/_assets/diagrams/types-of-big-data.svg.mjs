// Module 3 overview (topic-mod3-overview, Big Data section): types of big data.
// Facts it encodes, all explained in the paragraph and list after the figure:
//   - Left column (blue, 'source'): the three kinds of data the lesson's file
//     sections already define - structured, unstructured, semi-structured -
//     now at a volume that needs distributed compute.
//   - Right column (violet, 'engine'): three more kinds, named by what the
//     data describes or where it comes from - geospatial data, machine or
//     operational logging, and open-source (openly published) data.
// Run: node types-of-big-data.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(680, 296);
const BW = 300, BH = 56; // every box the same size: two columns of three

// One slate panel holds the whole grid.
d.panel({ x: 16, y: 16, w: 648, h: 264, role: 'support', iconName: 'layers', title: 'Types of big data' });
// Each entry is [role, Lucide icon, title]. Entries alternate left/right
// column, so index i goes to column i % 2 and row floor(i / 2).
[
  ['source', 'table', 'Structured'],
  ['engine', 'map-pin', 'Geospatial'],
  ['source', 'image', 'Unstructured'],
  ['engine', 'scroll-text', 'Machine or operational logging'],
  ['source', 'braces', 'Semi-structured'],
  ['engine', 'globe', 'Open-source data'],
].forEach(([role, iconName, title], i) => d.box({
  x: 32 + (i % 2) * (BW + 16), y: 72 + Math.floor(i / 2) * (BH + 12), w: BW, h: BH, role, iconName, title,
}));

// Write types-of-big-data.svg and ../images/types-of-big-data.png (2x).
d.write(import.meta.url);
