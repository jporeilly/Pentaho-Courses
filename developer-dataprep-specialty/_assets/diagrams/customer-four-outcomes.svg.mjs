// 05, run 2: the 15 May extract through tr_dim_customer.ktr, and what
// dlu-dim_customer does with its 123 rows. Facts: the run 2 checkpoint
// (keys 11, 123, 124, 4, 58) and "The other 119 customers did not change".
//
// Run from this folder:   node customer-four-outcomes.svg.mjs
import { outcomes } from './outcomes-layout.mjs';

outcomes(import.meta.url, {
  icon: 'users',
  title: 'tr_dim_customer.ktr, run 2: 123 rows in, four outcomes',
  source: { iconName: 'file-text', title: 'csvi-customers', lines: ['15 May extract,', '123 rows'] },
  step: { iconName: 'history', title: 'dlu-dim_customer', lines: ['finds the version on', 'extract_date, compares'] },
  rows: [
    [{ iconName: 'circle-help', title: 'No version found', lines: ['customer 500, new'] }, { role: 'write', iconName: 'plus', title: 'Insert version 1', lines: ['key 124, from 1900'] }],
    [{ iconName: 'map-pin', title: 'An Insert field differs', lines: ['141: city Barcelona'] }, { role: 'write', iconName: 'history', title: 'Add version 2', lines: ['key 11 ends 15 May,', 'key 123 starts'] }],
    [{ iconName: 'square-pen', title: 'An Update field differs', lines: ['119: credit limit', '282: name'] }, { role: 'write', iconName: 'square-pen', title: 'Overwrite the row', lines: ['keys 4 and 58,', 'no new key'] }],
    [{ iconName: 'equal', title: 'Nothing differs', lines: ['the other 119 customers'] }, { role: 'result', iconName: 'skip-forward', title: 'Write nothing', lines: ['the row stays as it is'] }],
  ],
});
