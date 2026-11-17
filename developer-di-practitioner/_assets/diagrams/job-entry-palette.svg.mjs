// Key Concepts, Jobs: the job entries Spoon offers, folder by folder, as
// its Design tab lists them (the old job-entries.jpeg palette screenshot).
// Run: node job-entry-palette.svg.mjs
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';

const FOLDERS = [
  // [column, title, role, icon, entries]; a leading * makes an entry bold
  [0, 'General', 'engine', 'play', ['*Start', 'Dummy', '*Job', 'Set variables', '*Success', '*Transformation']],
  [0, 'Mail', 'support', 'mail', ['Get mails (POP3/IMAP)', 'Mail', 'Mail validator']],
  [0, 'File management', 'store', 'folder', ['Add filenames to result', 'Compare folders', 'Convert file between Windows and Unix', 'Copy files', 'Create a folder', 'Create file', 'Delete file', 'Delete filenames from result', 'Delete files', 'Delete folders', 'File compare', 'HTTP', 'Move files', 'Process result filenames', 'Unzip file', 'Wait for file', 'Write to file', 'Zip file']],
  [1, 'Conditions', 'check', 'circle-help', ['Check DB connections', 'Check files locked', 'Check if a folder is empty', 'Check webservice availability', 'Checks if files exist', 'Columns exist in a table', 'Evaluate files metrics', 'Evaluate rows number in a table', 'File exists', 'Simple evaluation', 'Table exists', 'Wait for']],
  [1, 'Scripting', 'engine', 'code', ['JavaScript', 'Shell', 'SQL']],
  [1, 'Bulk loading', 'store', 'database', ['Bulk load from MySQL into file', 'Bulk load into MSSQL', 'Bulk load into MySQL']],
  [1, 'Big Data', 'engine', 'cloud', ['Amazon EMR job executor', 'Amazon Hive job executor']],
  [1, 'XML', 'source', 'file-code', ['Check if XML file is well formed', 'DTD validator', 'XSD validator', 'XSL transformation']],
  [2, 'Utility', 'support', 'wrench', ['Abort job', 'Display msgbox info', 'HL7 MLLP acknowledge', 'HL7 MLLP input', 'Ping a host', 'Send information using syslog', 'Send Nagios passive check', 'Send SNMP trap', 'Telnet a host', 'Truncate tables', 'Wait for SQL', 'Write to log']],
  [2, 'Repository', 'model', 'archive', ['Check if connected to repository', 'Export repository to XML file']],
  [2, 'File transfer', 'source', 'arrow-left-right', ['FTP delete', 'Get a file with FTP', 'Get a file with FTPS', 'Get a file with SFTP', 'Put a file with FTP', 'Put a file with SFTP', 'Upload files to FTPS']],
  [2, 'File encryption', 'support', 'lock', ['Decrypt files with PGP', 'Encrypt files with PGP', 'Verify file signature with PGP']],
];

const CW = 268, GAP = 16, X0 = 16, Y0 = 16, HEAD = 36, LH = 18, PAD = 10;
const colX = (c) => X0 + c * (CW + GAP);
const height = (n) => HEAD + n * LH + PAD;
const colY = [Y0, Y0, Y0];
const placed = FOLDERS.map(([c, title, role, iconName, entries]) => {
  const y = colY[c];
  colY[c] += height(entries.length) + 12;
  return { x: colX(c), y, title, role, iconName, entries };
});

const d = new Diagram(X0 * 2 + 3 * CW + 2 * GAP, Math.max(...colY) + 4);
for (const p of placed) {
  d.panel({ x: p.x, y: p.y, w: CW, h: height(p.entries.length), role: p.role, iconName: p.iconName, title: p.title });
  p.entries.forEach((e, i) => {
    const bold = e.startsWith('*');
    d.raw(`<text x="${p.x + 16}" y="${p.y + HEAD + 13 + i * LH}" font-size="12"${bold ? ' font-weight="700"' : ''} fill="#1e293b">${esc(bold ? e.slice(1) : e)}</text>`);
  });
}

d.write(import.meta.url);
