// Sentiment Analysis: the transformation lesson 06 builds,
// sentiment_analysis.ktr, and what each step reads, calls and writes.
//
// Facts it encodes (lesson 06 and files/solution/sentiment_analysis.ktr):
//   - Steps and hops, in order: csvi-reviews (CSV file input,
//     customer_reviews.csv, five reviews), const-instruction (Add constants,
//     run_instruction), ai-sentiment (AI Chat, Stream: message review_text,
//     run instruction run_instruction; Ollama, ${MODEL_NAME} llama3.2:3b;
//     result llm_json; ${STEP_COPIES} = 4 copies), json-sentiment (JSON
//     input: sentiment, score, confidence, key_phrases, summary),
//     sv-results (Select values), txt-results (Text file output,
//     sentiment_results.csv).
//   - Ollama on ${OLLAMA_URL}, http://localhost:11434; the step posts to
//     /api/chat (LLM Integration overview, Under the Hood).
//
// Run from this folder:   node 06-sentiment-flow.svg.mjs
import { ktrFlow } from './ktr-flow.mjs';

const { d } = ktrFlow({
  file: 'sentiment_analysis.ktr',
  steps: [
    { role: 'source', iconName: 'file-input', title: 'csvi-reviews', lines: ['CSV file input: one row', 'per review'] },
    { role: 'engine', iconName: 'scroll-text', title: 'const-instruction', lines: ['Add constants: the same', 'run_instruction on every row'] },
    { role: 'engine', iconName: 'messages-square', title: 'ai-sentiment', lines: ['AI Chat x${STEP_COPIES} (4): message', 'review_text, result llm_json'] },
    { role: 'engine', iconName: 'file-json', title: 'json-sentiment', lines: ['JSON input: the answer\'s', 'keys become fields'] },
    { role: 'engine', iconName: 'list-filter', title: 'sv-results', lines: ['Select values: the review,', 'then its sentiment fields'] },
    { role: 'write', iconName: 'file-output', title: 'txt-results', lines: ['Text file output'] },
  ],
  side: [
    { at: 0, link: 'in', role: 'source', iconName: 'file-text', title: 'customer_reviews.csv', lines: ['five reviews: review_id, customer_name,', 'product, review_text, date'] },
    { at: 1, link: 'sets', role: 'result', iconName: 'scroll-text', title: 'run_instruction', lines: ['"You classify the sentiment of one customer', 'review." One JSON object, nothing else'] },
    { at: 2, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: ${MODEL_NAME}, llama3.2:3b', lines: ['POST ${OLLAMA_URL}/api/chat, one request', 'per row, up to four at a time'] },
    { at: 3, link: 'sets', role: 'result', iconName: 'table-2', title: 'Fields from llm_json', lines: ['sentiment, score, confidence,', 'key_phrases, summary'] },
    { at: 5, link: 'out', role: 'write', iconName: 'file-output', title: 'sentiment_results.csv', lines: ['one row per review, with its', 'sentiment fields, beside the .ktr'] },
  ],
});
d.write(import.meta.url);
