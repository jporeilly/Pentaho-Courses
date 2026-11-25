// 06, section 4: what Insert / Update does with one order line, so that a
// second run adds nothing. Facts: 06, section 4 (the keys, the primary
// key as the safety net) and the last note of 07 (run 1 inserts every
// line, run 2 finds all 2,867 and changes nothing).
//
// Run from this folder:   node safe-to-run-twice.svg.mjs
import { outcomes } from './outcomes-layout.mjs';

outcomes(import.meta.url, {
  icon: 'repeat',
  title: 'Insert / Update: the same order line, however many times it arrives',
  source: { iconName: 'receipt', title: 'One order line', lines: ['order 10100,', 'line 1'] },
  step: { iconName: 'scan-search', title: 'Insert / Update', lines: ['looks it up by order', 'number and line number'] },
  rows: [
    [{ iconName: 'circle-help', title: 'Not in the table', lines: ['run 1: all 2,867 lines'] }, { role: 'write', iconName: 'plus', title: 'Insert it', lines: ['a new row'] }],
    [{ iconName: 'square-pen', title: 'There, and different', lines: ['a corrected quantity'] }, { role: 'write', iconName: 'square-pen', title: 'Update it', lines: ['the same row, corrected'] }],
    [{ iconName: 'equal', title: 'There, and the same', lines: ['run 2: all 2,867 lines'] }, { role: 'result', iconName: 'skip-forward', title: 'Change nothing', lines: ['still 2,867 rows'] }],
  ],
  net: { role: 'reject', iconName: 'shield-check', title: 'Primary key: order_number, order_line_number', line: 'The safety net: a duplicate line fails the load instead of doubling a sale.' },
});
