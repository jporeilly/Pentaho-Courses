// Data Quality: the transformation lesson 07 builds, data_quality.ktr,
// what its steps read and call, and the two files its Filter rows splits
// the records into.
//
// Facts it encodes (lesson 07 and files/solution/data_quality.ktr):
//   - Steps and hops: csvi-customers (CSV file input,
//     data_quality_customers.csv, customers 1001 to 1010), js-record
//     (Modified JavaScript value: customer_record, five labeled lines from
//     Name: to Company:), const-instruction (Add constants: run_instruction,
//     the house formats and the JSON shape), ai-clean (AI Chat x
//     ${STEP_COPIES}, message customer_record, result llm_json), json-clean
//     (JSON input: clean_name, clean_email, clean_phone, clean_address,
//     clean_company, issues, quality), filter-quality (Filter rows: quality
//     IN LIST CLEAN;FIXED). TRUE to sv-clean and txt-clean
//     (customers_clean.csv, the cleaned values); FALSE to sv-review and
//     txt-review (customers_review.csv, the original values).
//   - A null quality, from an answer the parser could not read, takes the
//     FALSE path.
//   - Ollama ${MODEL_NAME} llama3.2:3b on ${OLLAMA_URL}/api/chat.
//
// Run from this folder:   node 07-data-quality-flow.svg.mjs
import { ktrFlow, stepY, RX, RW, BH } from './ktr-flow.mjs';

const { d, box } = ktrFlow({
  file: 'data_quality.ktr',
  steps: [
    { role: 'source', iconName: 'file-input', title: 'csvi-customers', lines: ['CSV file input: every field', 'read as a string'] },
    { role: 'engine', iconName: 'braces', title: 'js-record', lines: ['Modified JavaScript value:', 'one message per customer'] },
    { role: 'engine', iconName: 'scroll-text', title: 'const-instruction', lines: ['Add constants: the same', 'run_instruction on every row'] },
    { role: 'engine', iconName: 'messages-square', title: 'ai-clean', lines: ['AI Chat x${STEP_COPIES}: message', 'customer_record, result llm_json'] },
    { role: 'engine', iconName: 'file-json', title: 'json-clean', lines: ['JSON input: the cleaned values', 'and the verdict become fields'] },
    { role: 'check', iconName: 'split', title: 'filter-quality', lines: ['Filter rows: quality', 'IN LIST CLEAN;FIXED'] },
    { role: 'engine', iconName: 'list-filter', title: 'sv-clean', lines: ['TRUE: Select values keeps', 'the cleaned values'] },
    { role: 'write', iconName: 'file-output', title: 'txt-clean', lines: ['Text file output:', 'customers_clean.csv'] },
  ],
  side: [
    { at: 0, link: 'in', role: 'source', iconName: 'file-text', title: 'data_quality_customers.csv', lines: ['ten messy customers, 1001 to 1010,', 'one row each, six columns'] },
    { at: 1, link: 'sets', role: 'result', iconName: 'layers', title: 'customer_record', lines: ['five labeled lines, from', 'Name: john smith to Company: acme corp'] },
    { at: 2, link: 'sets', role: 'result', iconName: 'scroll-text', title: 'run_instruction', lines: ['the house format of each value, and one', 'JSON object with a quality verdict'] },
    { at: 3, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: ${MODEL_NAME}, llama3.2:3b', lines: ['POST ${OLLAMA_URL}/api/chat,', 'one request per record'] },
    { at: 4, link: 'sets', role: 'result', iconName: 'table-2', title: 'Fields from llm_json', lines: ['clean_name, clean_email, clean_phone,', 'clean_address, clean_company, issues, quality'] },
  ],
});

// The FALSE branch: its own steps, in a panel of the same transformation.
const fy = stepY(6) - 56;
d.panel({ x: RX - 12, y: fy, w: RW + 12, h: stepY(7) + BH + 16 - fy, role: 'tool', title: 'FALSE: REVIEW, or no verdict', sub: 'a value that cannot be fixed, or an unreadable answer' });
const rv = d.box({ x: RX, y: stepY(6), w: RW - 12, h: BH, role: 'engine', iconName: 'list-filter', title: 'sv-review', lines: ['Select values keeps the original values', 'and the verdict, for a person to correct'] });
const rt = d.box({ x: RX, y: stepY(7), w: RW - 12, h: BH, role: 'write', iconName: 'file-output', title: 'txt-review', lines: ['Text file output: customers_review.csv'] });
d.arrow({ x1: rv.cx, y1: rv.b, x2: rt.cx, y2: rt.y - 3, straight: true });
const fl = box[5];
d.arrow({ x1: fl.r, y1: fl.cy, x2: rv.x - 3, y2: rv.cy });

d.write(import.meta.url);
