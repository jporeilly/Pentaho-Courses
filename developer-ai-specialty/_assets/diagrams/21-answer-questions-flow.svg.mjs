// Answer Questions: the query transformation lesson 21 builds,
// answer_questions.ktr, and what each step reads, searches, builds, calls
// and writes.
//
// Facts it encodes (lesson 21 and files/solution/answer_questions.ktr):
//   - Steps and hops: csvi-questions (CSV file input, questions.csv, seven
//     questions: five answered in the documents, two not), emb-question
//     (Text to Vector, question, nomic-embed-text on Ollama), vs-kb (Vector
//     Search, PGVector, kb_chunks; Max results ${TOP_K} 4, Min score
//     ${MIN_SCORE} 0.75; One row per input (JSON array): matches,
//     match_count), js-prompt (Modified JavaScript value: prompt, "Context:"
//     numbered passages with their sources, then "Question:"),
//     const-instruction (Add constants: run_instruction: answer from the
//     context only, say when it does not hold the answer, cite the sources,
//     answer in JSON), ai-answer (AI Chat, message prompt, ${MODEL_NAME}
//     llama3.2:3b, numCtx 4096, result llm_json), json-answer (answer,
//     cited_sources from $.sources, found), sv-answers, txt-answers
//     (answers.csv).
//
// Run from this folder:   node 21-answer-questions-flow.svg.mjs
import { ktrFlow } from './ktr-flow.mjs';

const { d } = ktrFlow({
  file: 'answer_questions.ktr',
  steps: [
    { role: 'source', iconName: 'file-input', title: 'csvi-questions', lines: ['CSV file input: one row', 'per question'] },
    { role: 'model', iconName: 'binary', title: 'emb-question', lines: ['Text to Vector: the', 'question\'s embedding'] },
    { role: 'check', iconName: 'text-search', title: 'vs-kb', lines: ['Vector Search: matches,', 'match_count'] },
    { role: 'engine', iconName: 'braces', title: 'js-prompt', lines: ['Modified JavaScript value:', 'the passages, then the question'] },
    { role: 'engine', iconName: 'scroll-text', title: 'const-instruction', lines: ['Add constants: the same', 'run_instruction on every row'] },
    { role: 'engine', iconName: 'messages-square', title: 'ai-answer', lines: ['AI Chat: message prompt,', 'result llm_json'] },
    { role: 'engine', iconName: 'file-json', title: 'json-answer', lines: ['JSON input: the answer\'s', 'keys become fields'] },
    { role: 'engine', iconName: 'list-filter', title: 'sv-answers', lines: ['Select values: what was', 'retrieved and answered'] },
    { role: 'write', iconName: 'file-output', title: 'txt-answers', lines: ['Text file output'] },
  ],
  side: [
    { at: 0, link: 'in', role: 'source', iconName: 'message-square-text', title: 'questions.csv', lines: ['seven customer questions: five answered', 'in the documents, two not'] },
    { at: 1, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: nomic-embed-text', lines: ['the same embedding model', 'that loaded the knowledge base'] },
    { at: 2, link: 'call', role: 'store', iconName: 'database', title: 'kb_chunks in pgvector, localhost:5433', lines: ['the ${TOP_K} (4) closest chunks with', 'a score of at least ${MIN_SCORE} (0.75)'] },
    { at: 3, link: 'sets', role: 'result', iconName: 'layers', title: 'prompt', lines: ['Context: numbered passages, each with', 'its source file name; then Question:'] },
    { at: 4, link: 'sets', role: 'result', iconName: 'scroll-text', title: 'run_instruction', lines: ['answer from the context only, say when it', 'cannot, cite the sources, answer in JSON'] },
    { at: 5, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: ${MODEL_NAME}, llama3.2:3b', lines: ['POST ${OLLAMA_URL}/api/chat,', 'numCtx 4096 for four passages'] },
    { at: 6, link: 'sets', role: 'result', iconName: 'table-2', title: 'Fields from llm_json', lines: ['answer, cited_sources, found'] },
    { at: 8, link: 'out', role: 'write', iconName: 'file-output', title: 'answers.csv', lines: ['one row per question: what was', 'retrieved, the answer and its sources'] },
  ],
});
d.write(import.meta.url);
