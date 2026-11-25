// Deploy & Run the Agent: what happens to one maintenance log entry, as
// a sequence across four actors: the two SQLite databases, the Pentaho
// Data Integration transformation, the agent (FastAPI on port 8000) and
// Ollama. It replaces the text diagram that opened part 3, "Test the
// Agent", in 17-agent-deploy/guide.md; the table under it stays.
//
// Facts it encodes (all from lesson 17 unless named):
//   - Part 1: the agent is a FastAPI service, agent.py, run by uvicorn on
//     port 8000, with one endpoint, POST /assess; it asks Ollama for
//     AGENT_MODEL_NAME (llama3.2:3b in the course); Ollama answers on
//     http://localhost:11434.
//   - Part 4: both databases are SQLite files in the agent's data folder,
//     maintenance_log.db and asset_history.db. Read Log Entries (Table
//     input) selects the rows of maintenance_log WHERE processed = 0 (5
//     entries); Get Asset History (Database join) fetches each entry's
//     asset_id rows from asset_history (23 rows, one per history entry,
//     each stored twice, plus FAN-011's outer-join row); Sort rows, Remove
//     Duplicates (Unique rows), Aggregate History (Modified JavaScript
//     value) and Group by leave one row per entry with history_json, the
//     history as a JSON array (5 rows).
//   - Parts 5 and 6: Build Agent Payload (Modified JavaScript value)
//     builds agent_payload; Call Assessment Agent (REST client) posts it to
//     ${AGENT_URL}/assess, AGENT_URL http://localhost:8000, answer in
//     agent_response, status in response_code; Check HTTP Status (Filter
//     rows) sends response_code = 200 on to Parse Agent Response and the
//     rest to Write HTTP Errors (Text file output); Route by Priority
//     (Switch / case) sends each row by priority to Write CRITICAL, Write
//     HIGH, Write MEDIUM or Write LOW (Table output), all inserting into
//     assessed_log in maintenance_log.db.
//   - Part 3, "Under the hood": FastAPI validates the body first (422 when
//     it does not fit); build_prompt writes one prompt, history oldest
//     first and the current entry last; call_llm sends it to Ollama's
//     /api/generate with "format": "json"; the agent forces priority and
//     pattern into their allowed values and keeps confidence 0 to 100;
//     the answer has seven keys: log_id, asset_id, priority, fault_type,
//     pattern, assessment, confidence. One LLM call per log entry.
//   - Lesson 16: Pentaho Data Integration retrieves the history; the
//     agent reasons over it.
//
// Run from this folder:   node agent-assess-sequence.svg.mjs
// It writes agent-assess-sequence.svg here and
// ../images/agent-assess-sequence.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';
import { lanes, msg, note } from './sequence.mjs';

const W = 800;
const d = new Diagram(W, 972);
const TOP = 16, H = 940;

// The four actors. The transformation's lane is the widest, because most
// steps happen on it. SQLite green (a store), Pentaho Data Integration
// blue (the tool you build in), the agent violet (a server), Ollama teal
// (it serves the model).
const [db, pdi, agent, oll] = lanes(d, {
  top: TOP, height: H, cols: [
    { x: 12, w: 164, role: 'store', iconName: 'database', title: 'SQLite', sub: 'two .db files' },
    { x: 188, w: 244, role: 'tool', iconName: 'workflow', title: 'Transformation', sub: 'maintenance_assessment.ktr' },
    { x: 444, w: 192, role: 'server', iconName: 'bot', title: 'Agent', sub: 'FastAPI, localhost:8000' },
    { x: 648, w: 140, role: 'model', iconName: 'brain', title: 'Ollama', sub: 'localhost:11434' },
  ],
});

/**
 * A step on a lifeline drawn as a tinted pill in a role's colors, for
 * the outcomes that matter (the failure branch, the write). Same shape
 * as the kit's pill, so it reads as a note on the lane.
 */
function tinted(lane, y, lines, role) {
  const c = ROLE[role];
  const w = Math.max(...lines.map((l) => l.length)) * 6.3 + 18;
  const h = lines.length * 15 + 10;
  d.raw(`<rect x="${lane.cx - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="9" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1"/>`);
  lines.forEach((l, i) => d.raw(`<text x="${lane.cx}" y="${y - h / 2 + 18 + i * 15}" text-anchor="middle" font-size="12" fill="${c.text}">${esc(l)}</text>`));
}

// 1 and 2: read the unprocessed entries, then each asset's history.
// Replies are dashed.
msg(d, pdi, db, 100, ['1  Table input,', 'Read Log Entries:', 'processed = 0']);
msg(d, db, pdi, 152, '5 log entries', { dashed: true });
msg(d, pdi, db, 204, ['2  Database join,', 'Get Asset History:', 'by asset_id']);
msg(d, db, pdi, 256, '23 history rows', { dashed: true });

// 3 and 4: the transformation's own work, as notes on its lifeline.
note(d, pdi, 314, ['3  Sort rows, Remove Duplicates,', 'Aggregate History, Group by:', 'one row per entry, history_json']);
note(d, pdi, 376, ['4  Build Agent Payload:', 'agent_payload']);

// 5: the one request per entry, to the agent.
msg(d, pdi, agent, 430, ['5  POST /assess', '(Call Assessment Agent)']);

// 6 and 7: the agent checks the body, writes one prompt and calls
// Ollama once; Ollama's answer is JSON.
note(d, agent, 490, ['6  check the body;', 'build_prompt: history,', 'then the current entry']);
msg(d, agent, oll, 552, ['7  one call:', '/api/generate']);
msg(d, oll, agent, 598, 'JSON answer', { dashed: true });

// 8: the agent's last check before it answers.
note(d, agent, 640, ['8  force priority and', 'pattern to allowed values']);

// 9: the answer, HTTP status and seven keys, into agent_response.
msg(d, agent, pdi, 694, ['9  200, and seven keys:', 'priority, pattern, …'], { dashed: true });

// 10 and 11: check the status (the failure branch in red), parse and
// route.
note(d, pdi, 748, ['10  Filter rows, Check HTTP', 'Status: response_code = 200']);
tinted(pdi, 796, ['other codes: Write HTTP Errors'], 'reject');
note(d, pdi, 844, ['11  Parse Agent Response;', 'Switch / case, Route by Priority']);

// 12: the write back to SQLite, one of four Table output steps.
msg(d, pdi, db, 904, ['12  Table output, Write', 'CRITICAL, HIGH, MEDIUM', 'or LOW: into assessed_log']);

d.write(import.meta.url);
