// Apache Tika: the four transformations lesson 04 builds, one lane each:
// where the rows come from, the Tika step and what it reads, and the CSV
// file the flow writes.
//
// Facts it encodes (lesson 04 and files/solution/tika_*.ktr):
//   - tika_word.ktr (part 1): gr-one-row, doc-brief (Read Unstructured
//     Document, File product-brief.docx, Result Field name text), sv-brief,
//     txt-brief (product_brief_text.csv).
//   - tika_password.ktr (part 2): gr-one-row, doc-report (File
//     quarterly-report-protected.pdf, File password tika-2026, text),
//     sv-report, txt-report (quarterly_report_text.csv).
//   - tika_folder.ktr (part 3): gfn-documents (documents folder,
//     .*\.(docx|pdf|pptx|txt), five files), frmla-password (filepass:
//     northwind for contract-protected.pdf), doc-text (Stream, File field
//     name filename, File password field name filepass, text), frmla-length
//     (text_length), sv-documents, txt-documents (documents_text.csv).
//   - tika_metadata.ktr (part 4): gfn-documents and frmla-password pasted
//     from tika_folder.ktr, doc-metadata (Discover Metadata from
//     Unstructured Documents, Stream, filename and filepass; one row per
//     key, such as dc:creator), sv-metadata (short_filename, key, value),
//     txt-metadata (documents_metadata.csv).
//
// Run from this folder:   node 04-tika-flows.svg.mjs
import { ktrLanes } from './ktr-lanes.mjs';

const out = (title, sv, file) => ({ role: 'write', iconName: 'file-output', title, lines: [`after ${sv}:`, file] });
const oneRow = { role: 'source', iconName: 'rows-3', title: 'gr-one-row', lines: ['Generate rows:', 'one row'] };
const folder = { role: 'source', iconName: 'folder-search', title: 'gfn-documents', lines: ['Get file names;', 'frmla-password', 'adds filepass'] };
const d = ktrLanes({
  cols: [176, 288, 232],
  groups: [
    { file: 'tika_word.ktr', sub: 'Part 1: a Word document', lanes: [[
      oneRow,
      { role: 'engine', iconName: 'file-text', title: 'doc-brief', lines: ['Read Unstructured Document: File', 'product-brief.docx, into text'] },
      out('txt-brief', 'sv-brief', 'product_brief_text.csv'),
    ]] },
    { file: 'tika_password.ktr', sub: 'Part 2: a password-protected PDF', lanes: [[
      oneRow,
      { role: 'engine', iconName: 'file-lock', title: 'doc-report', lines: ['Read Unstructured Document: File', 'quarterly-report-protected.pdf,', 'File password tika-2026, into text'] },
      out('txt-report', 'sv-report', 'quarterly_report_text.csv'),
    ]] },
    { file: 'tika_folder.ktr', sub: 'Part 3: a folder of mixed documents', lanes: [[
      folder,
      { role: 'engine', iconName: 'file-text', title: 'doc-text', lines: ['Stream: the file in filename, its', 'password in filepass, into text;', 'frmla-length adds text_length'] },
      out('txt-documents', 'sv-documents', 'documents_text.csv'),
    ]] },
    { file: 'tika_metadata.ktr', sub: 'Part 4: metadata, one row per key', lanes: [[
      folder,
      { role: 'engine', iconName: 'tags', title: 'doc-metadata', lines: ['Discover Metadata: Stream, filename', 'and filepass; one row per key,', 'such as dc:creator'] },
      out('txt-metadata', 'sv-metadata', 'documents_metadata.csv'),
    ]] },
  ],
});
d.write(import.meta.url);
