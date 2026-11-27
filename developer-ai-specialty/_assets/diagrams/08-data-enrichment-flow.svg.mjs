// Data Enrichment: the transformation lesson 08 builds,
// data_enrichment.ktr, and what each step reads, builds, calls and writes.
//
// Facts it encodes (lesson 08 and files/solution/data_enrichment.ktr):
//   - Steps and hops: csvi-customers (CSV file input,
//     data_enrichment_customers.csv, customers 1001 to 1010), ai-template
//     (AI Chat Message Box: task and run_instruction, with ${INDUSTRY_LIST}
//     and ${EMPLOYEE_RANGES} replaced by the parameters' values; variables
//     only, never field values), js-message (Modified JavaScript value:
//     customer_message, the task then the record's values as labeled
//     lines), ai-enrich (AI Chat x ${STEP_COPIES}, message customer_message,
//     result llm_json), json-enrich (JSON input: city, state, country,
//     industry, industry_basis, employee_range), sv-results, txt-results
//     (customers_enriched.csv).
//   - Ollama ${MODEL_NAME} llama3.2:3b on ${OLLAMA_URL}/api/chat.
//
// Run from this folder:   node 08-data-enrichment-flow.svg.mjs
import { ktrFlow } from './ktr-flow.mjs';

const { d } = ktrFlow({
  file: 'data_enrichment.ktr',
  steps: [
    { role: 'source', iconName: 'file-input', title: 'csvi-customers', lines: ['CSV file input: one row', 'per customer'] },
    { role: 'engine', iconName: 'scroll-text', title: 'ai-template', lines: ['AI Chat Message Box: task', 'and run_instruction'] },
    { role: 'engine', iconName: 'braces', title: 'js-message', lines: ['Modified JavaScript value:', 'the task, then the values'] },
    { role: 'engine', iconName: 'messages-square', title: 'ai-enrich', lines: ['AI Chat x${STEP_COPIES}: message', 'customer_message'] },
    { role: 'engine', iconName: 'file-json', title: 'json-enrich', lines: ['JSON input: the six new', 'values become fields'] },
    { role: 'engine', iconName: 'list-filter', title: 'sv-results', lines: ['Select values: identity,', 'address, the new fields'] },
    { role: 'write', iconName: 'file-output', title: 'txt-results', lines: ['Text file output'] },
  ],
  side: [
    { at: 0, link: 'in', role: 'source', iconName: 'file-text', title: 'data_enrichment_customers.csv', lines: ['ten customers, 1001 to 1010, with no city,', 'state, country, industry or company size'] },
    { at: 1, link: 'sets', role: 'result', iconName: 'layers', title: 'The template, filled from parameters', lines: ['${INDUSTRY_LIST} and ${EMPLOYEE_RANGES}', 'replaced once, the same on every row'] },
    { at: 2, link: 'sets', role: 'result', iconName: 'layers', title: 'customer_message', lines: ['the task, then the record\'s values as', 'labeled lines: Company, Email, Phone ...'] },
    { at: 3, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: ${MODEL_NAME}, llama3.2:3b', lines: ['POST ${OLLAMA_URL}/api/chat,', 'one request per customer'] },
    { at: 4, link: 'sets', role: 'result', iconName: 'table-2', title: 'Fields from llm_json', lines: ['city, state, country, industry,', 'industry_basis, employee_range'] },
    { at: 6, link: 'out', role: 'write', iconName: 'file-output', title: 'customers_enriched.csv', lines: ['one row per customer, with', 'the six new fields'] },
  ],
});
d.write(import.meta.url);
