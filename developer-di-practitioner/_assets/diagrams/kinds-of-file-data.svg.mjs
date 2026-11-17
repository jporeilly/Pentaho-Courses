// Module 3 overview: four kinds of file data.
// Run: node kinds-of-file-data.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(992, 102);
const BW = 228, BH = 70;

[
  { role: 'source', iconName: 'table', title: 'Structured data', lines: ['spreadsheets, tables'] },
  { role: 'engine', iconName: 'image', title: 'Unstructured data', lines: ['text, images, video, audio'] },
  { role: 'join', iconName: 'braces', title: 'Semi-structured data', lines: ['XML, JSON, sensor data'] },
  { role: 'check', iconName: 'tags', title: 'Metadata', lines: ['data about the data'] },
].forEach((b, i) => d.box({ x: 16 + i * (BW + 16), y: 16, w: BW, h: BH, ...b }));

d.write(import.meta.url);
