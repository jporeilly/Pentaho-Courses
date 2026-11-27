// Build the Knowledge Base: the ingest transformation lesson 20 builds,
// build_knowledge_base.ktr, and what each step reads, adds, calls and
// writes.
//
// Facts it encodes (lesson 20 and files/solution/build_knowledge_base.ktr):
//   - Steps and hops: gfn-docs (Get File Names, ${Internal.Entry.Current.
//     Directory}/docs, .*\.(pdf|docx|txt)$, six Larkspur documents),
//     doc-read (Read Unstructured Document, Stream from filename, into
//     doc_text), seg-chunks (AI Segmentation, Split by Recursion, 300
//     tokens, overlap 30, into chunk and index), frmla-chunk-id (Formula:
//     chunk_id = [short_filename] & "#" & [index], such as
//     larkspur-warranty-policy.pdf#0), emb-chunks (Text to Vector,
//     nomic-embed-text on Ollama, batch size 16, 768 numbers; metadata
//     source and chunk_index), vw-kb (Vector Writer, PGVector, table
//     kb_chunks, upsert on embedding_id), sv-load-log, txt-load-log
//     (kb_load_log.csv).
//   - pgvector: container pcm-pgvector, localhost:5433, database genai.
//
// Run from this folder:   node 20-knowledge-base-flow.svg.mjs
import { ktrFlow } from './ktr-flow.mjs';

const { d } = ktrFlow({
  file: 'build_knowledge_base.ktr',
  steps: [
    { role: 'source', iconName: 'folder-search', title: 'gfn-docs', lines: ['Get File Names: one row', 'per file, filename'] },
    { role: 'engine', iconName: 'file-text', title: 'doc-read', lines: ['Read Unstructured Document:', 'the text into doc_text'] },
    { role: 'engine', iconName: 'scissors', title: 'seg-chunks', lines: ['AI Segmentation: one row per', 'chunk, with its index'] },
    { role: 'engine', iconName: 'square-function', title: 'frmla-chunk-id', lines: ['Formula: chunk_id, the same', 'for the same chunk every run'] },
    { role: 'model', iconName: 'binary', title: 'emb-chunks', lines: ['Text to Vector: embedding,', 'embedding_id, metadata'] },
    { role: 'store', iconName: 'database', title: 'vw-kb', lines: ['Vector Writer: PGVector,', 'kb_chunks; adds stored_id'] },
    { role: 'engine', iconName: 'list-filter', title: 'sv-load-log', lines: ['Select values: chunk_id, index,', 'stored_id, embedding_dimensions'] },
    { role: 'write', iconName: 'file-output', title: 'txt-load-log', lines: ['Text file output'] },
  ],
  side: [
    { at: 0, link: 'in', role: 'source', iconName: 'folder-open', title: 'docs: six Larkspur documents', lines: ['PDF, Word and text files that match', '.*\\.(pdf|docx|txt)$'] },
    { at: 2, link: 'sets', role: 'result', iconName: 'scissors', title: 'chunk: up to 300 tokens, overlap 30', lines: ['Split by Recursion: paragraph, then', 'line, then sentence, then word'] },
    { at: 3, link: 'sets', role: 'result', iconName: 'key-round', title: 'chunk_id: [short_filename] & "#" & [index]', lines: ['such as larkspur-warranty-policy.pdf#0'] },
    { at: 4, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: nomic-embed-text', lines: ['${OLLAMA_URL}, 16 chunks per request,', '768 numbers per chunk'] },
    { at: 5, link: 'out', role: 'store', iconName: 'database', title: 'kb_chunks in pgvector, localhost:5433', lines: ['database genai, container pcm-pgvector;', 'a re-run updates each chunk in place'] },
    { at: 7, link: 'out', role: 'write', iconName: 'file-output', title: 'kb_load_log.csv', lines: ['one row per chunk stored,', 'with its stored_id'] },
  ],
});
d.write(import.meta.url);
