// 08: tr_agg_sales.ktr, the same 2,867 order lines summed two ways, and
// what each table can answer. Facts: the step names, the part 4
// checkpoint (175 and 12 rows) and the collapsed/lost table in part 1.
//
// Run from this folder:   node summary-two-flows.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const BH = 86, PITCH = 108, TOP = 64;
const d = new Diagram(1056, TOP + 2 * PITCH - 22 + 32);
const COLS = [
  { x: 16, w: 244, role: 'source', iconName: 'table-2', head: 'Read and sort' },
  { x: 284, w: 244, role: 'engine', iconName: 'sigma', head: 'Sum each group' },
  { x: 552, w: 244, role: 'store', iconName: 'database', head: 'Rebuild the table' },
  { x: 820, w: 220, role: 'browser', iconName: 'chart-column', head: 'Mondrian can answer' },
];
COLS.forEach(({ x, w, role, iconName, head }) => d.panel({ x, y: 16, w, h: d.h - 32, role, iconName, title: head }));
const FLOWS = [
  [['ti-sales_by_month_line', '2,867 order lines,', 'by month and line'], ['gb-month_line', 'year, quarter, month, line;', 'two sums and fact_count'], ['to-agg_ym_line', 'agg_ym_line_mart_fact_sales', '175 rows, truncated first'], ['Month and line', 'but not by market:', 'that column is lost']],
  [['ti-sales_by_year_terr', '2,867 order lines,', 'by year and territory'], ['gb-year_terr', 'year and territory; the', 'same sums and fact_count'], ['to-agg_y_terr', 'agg_y_terr_mart_fact_sales', '12 rows, truncated first'], ['Year and territory', 'but not by product:', 'that column is lost']],
];
FLOWS.forEach((f, i) => {
  const b = COLS.map(({ x, w, role, iconName }, j) => d.box({ x: x + 8, y: TOP + i * PITCH, w: w - 16, h: BH, role, iconName, title: f[j][0], lines: f[j].slice(1) }));
  for (let j = 0; j < 3; j++) d.arrow({ x1: b[j].r, y1: b[j].cy, x2: b[j + 1].x - 3, y2: b[j + 1].cy, straight: true, dashed: j === 2 });
});
d.write(import.meta.url);
