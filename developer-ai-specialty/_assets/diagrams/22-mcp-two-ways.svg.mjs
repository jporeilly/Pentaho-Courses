// The two ways Pentaho Data Integration uses an MCP server, side by side:
// the MCP Client step calls the tool you name (no LLM), and AI Chat's
// Tools tab lets the model choose which tools to call. Shown on the Agents
// and Tools overview (16-agent-as-a-service) and the MCP Tools workshop
// (22-mcp-tools).
//
// Facts it encodes (lesson 22 unless named):
//   - MCP Client, Operation Call tool, Native tool lookup_order, Native
//     arguments {"order_id": "{{order_id}}"}: one call per row, the same
//     tool every row, no LLM; adds tool_result and tool_error.
//   - AI Chat, Tools tab, connection retail-tools: the step offers the
//     server's tools to the model (Ollama, qwen2.5:7b) with every row; the
//     model asks for the calls it wants, the step makes them and the model
//     answers; adds answer and the Tool calls field tool_calls.
//   - Both reach the same MCP server through the same connection,
//     retail-tools, stored in the PDI metastore, not in the .ktr; stdio:
//     started with cmd /c python retail_mcp_server.py, one process per step
//     copy. The server offers lookup_order, check_stock, get_return_policy,
//     start_return and the resource retail://policies/shipping.
//
// Run from this folder:   node 22-mcp-two-ways.svg.mjs
// It writes 22-mcp-two-ways.svg here and ../images/22-mcp-two-ways.png.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 500);
const PW = 376, BH = 72, rows = [72, 180, 288];

// Left: the MCP Client step. You name the tool.
d.panel({ x: 16, y: 16, w: PW, h: 356, role: 'support', title: 'MCP Client step', sub: 'you choose the tool: no LLM' });
const l1 = d.box({ x: 56, y: rows[0], w: PW - 56, h: BH, role: 'source', iconName: 'rows-3', title: '1 row', lines: ['order_id A1002'] });
const l2 = d.box({ x: 56, y: rows[1], w: PW - 56, h: BH, role: 'engine', iconName: 'plug-zap', title: 'Call tool lookup_order', lines: ['{"order_id": "{{order_id}}"}', 'the same call for every row'] });
const l3 = d.box({ x: 56, y: rows[2], w: PW - 56, h: BH, role: 'result', iconName: 'table-2', title: 'tool_result, tool_error', lines: ['the tool\'s JSON, or its error'] });
d.arrow({ x1: l1.cx, y1: l1.b, x2: l2.cx, y2: l2.y - 3, straight: true });
d.arrow({ x1: l2.cx, y1: l2.b, x2: l3.cx, y2: l3.y - 3, straight: true });

// Right: AI Chat with the Tools tab. The model chooses.
const RX = 408;
d.panel({ x: RX, y: 16, w: PW, h: 356, role: 'support', title: 'AI Chat step, Tools tab', sub: 'the model chooses the tools' });
const r1 = d.box({ x: RX + 40, y: rows[0], w: PW - 56, h: BH, role: 'source', iconName: 'rows-3', title: '1 row', lines: ['customer_question'] });
const r2 = d.box({ x: RX + 40, y: rows[1], w: 184, h: BH, role: 'engine', iconName: 'messages-square', title: 'AI Chat', lines: ['makes the calls', 'the model asks for'] });
const rm = d.box({ x: RX + 236, y: rows[1], w: 124, h: BH, role: 'model', iconName: 'brain', title: 'Ollama', lines: ['qwen2.5:7b'] });
const r3 = d.box({ x: RX + 40, y: rows[2], w: PW - 56, h: BH, role: 'result', iconName: 'table-2', title: 'answer, tool_calls', lines: ['the reply, and every call it made'] });
d.arrow({ x1: r2.cx, y1: r1.b, x2: r2.cx, y2: r2.y - 3, straight: true });
d.arrow({ x1: r2.r, y1: r2.cy - 14, x2: rm.x - 3, y2: rm.cy - 14, straight: true });
d.arrow({ x1: rm.x, y1: rm.cy + 14, x2: r2.r + 3, y2: r2.cy + 14, straight: true });
d.arrow({ x1: r2.cx, y1: r2.b, x2: r2.cx, y2: r3.y - 3, straight: true });

// Underneath: the one MCP server both reach, through the same connection.
const bar = d.bar({ x: 16, y: 412, w: W - 32, h: 72, role: 'server', iconName: 'server', title: 'MCP server retail_mcp_server.py, through the connection retail-tools (metastore)', line: 'stdio: cmd /c python, one process per step copy. Tools lookup_order, check_stock, get_return_policy, start_return' });
d.arrow({ x1: l2.x, y1: l2.cy, x2: 44, y2: bar.y - 3, elbow: true, label: 'tools/call', lx: 48, ly: 392 });
d.arrow({ x1: r2.x, y1: r2.cy, x2: RX + 28, y2: bar.y - 3, elbow: true, label: 'tools/call', lx: RX + 32, ly: 392 });

d.write(import.meta.url);
