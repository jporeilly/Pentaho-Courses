// 05, part 6: tr_dim_product.ktr, a type 1 dimension. Facts: every field
// set to Update, no date in the file, 111 rows (110 products and row 0).
//
// Run from this folder:   node product-overwrite.svg.mjs
import { outcomes } from './outcomes-layout.mjs';

outcomes(import.meta.url, {
  icon: 'package',
  title: 'tr_dim_product.ktr: one row per product, the latest values only',
  source: { iconName: 'file-text', title: 'csvi-products', lines: ['products.csv,', '110 rows, no date'] },
  step: { iconName: 'history', title: 'dlu-dim_product', lines: ['finds product_code;', 'every field Update'] },
  rows: [
    [{ iconName: 'circle-help', title: 'No row found', lines: ['every product, on run 1'] }, { role: 'write', iconName: 'plus', title: 'Insert the product', lines: ['a new key; 111 rows', 'with row 0'] }],
    [{ iconName: 'square-pen', title: 'A field differs', lines: ['a product is renamed'] }, { role: 'write', iconName: 'square-pen', title: 'Overwrite the row', lines: ['same key,', 'no new version'] }],
    [{ iconName: 'equal', title: 'Nothing differs', lines: ['the same file again'] }, { role: 'result', iconName: 'skip-forward', title: 'Write nothing', lines: ['still 111 rows'] }],
  ],
});
