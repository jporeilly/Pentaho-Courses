// How HAProxy keeps a session on one Pentaho node, and what happens when
// that node goes down. A sequence diagram with four lanes: Browser,
// HAProxy, pentaho-node-01 and pentaho-node-02. It is the figure in
// 02-ha-deploy/guide.md, part 6 "Verify the Cluster", after test 2's
// "HAProxy pins each session by prefixing Pentaho's own cookie".
//
// Facts it encodes, and where each comes from (all 02-ha-deploy):
//   - Part 5, haproxy.cfg: `balance roundrobin`, `cookie JSESSIONID
//     prefix nocache`, `option redispatch` (in `defaults`), and the
//     servers `pentaho-node-01 10.0.1.10:8080 ... cookie S1` and
//     `pentaho-node-02 10.0.1.11:8080 ... cookie S2`, each with `check`
//     against `GET /pentaho/Login`.
//   - Part 6, test 2's "Under the hood": HAProxy adds no cookie of its
//     own; when Tomcat sets JSESSIONID, HAProxy puts the server's cookie
//     value (S1 or S2) and a `~` in front of it on the way out; on the
//     way in it reads the prefix, sends the request to that server and
//     strips the prefix, so Tomcat sees the session ID it issued.
//     Pentaho doesn't copy sessions between nodes, so when the node
//     fails, `option redispatch` sends the request to the other one,
//     where the user signs in again.
//   - Part 6, test 2 and test 3 checkpoints: the cookie's value begins
//     with S1~ or S2~; with node 1 stopped (`sudo systemctl stop
//     pentaho`), the VIP still answers, from node 2.
//   `<id>` and `<new id>` stand for whatever session IDs Tomcat issues;
//   the lessons give no value.
//
// Colors: amber the browser, slate HAProxy (a supporting service, as in
// ha-topology), violet the two Pentaho nodes. The red band marks the
// failure.
//
// Run from this folder:   node ha-sticky-session.svg.mjs
// It writes ha-sticky-session.svg here and ../images/ha-sticky-session.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { lanes, msg, note } from './sequence.mjs';

// Canvas: 800 wide, four lanes of 182 with 12px gaps.
const d = new Diagram(800, 900);
const TOP = 16, H = 868;

const [br, hp, n1, n2] = lanes(d, {
  top: TOP, height: H, cols: [
    { x: 16, w: 182, role: 'browser', iconName: 'globe', title: 'Browser', sub: 'one user' },
    { x: 210, w: 182, role: 'support', iconName: 'scale', title: 'HAProxy', sub: 'on the VIP 10.0.1.100' },
    { x: 404, w: 182, role: 'server', iconName: 'server', title: 'pentaho-node-01', sub: 'cookie S1, :8080' },
    { x: 598, w: 182, role: 'server', iconName: 'server', title: 'pentaho-node-02', sub: 'cookie S2, :8080' },
  ],
});

// A heading band across all four lanes for each phase, on the panel
// layer so arrows and pills draw over it.
function band(y, title, color) {
  d.under.push(`<rect x="24" y="${y}" width="752" height="28" rx="8" fill="#ffffff" stroke="${color}" stroke-width="1.4"/>`);
  d.under.push(`<text x="400" y="${y + 19}" text-anchor="middle" font-size="13" font-weight="700" fill="${color}">${title}</text>`);
}

// Phase 1: the first request. No cookie yet, so roundrobin picks a node;
// here it is node 1. Tomcat issues the session, HAProxy prefixes it.
band(76, 'First request: HAProxy pins the session to node 1', '#475569');
msg(d, br, hp, 136, ['1  GET /pentaho/Login', 'no cookie yet']);
msg(d, hp, n1, 190, '2  roundrobin: node 1');
msg(d, n1, hp, 236, '3  JSESSIONID=<id>', { dashed: true });
note(d, hp, 282, ['4  add S1~', 'on the way out']);
msg(d, hp, br, 328, 'JSESSIONID=S1~<id>', { dashed: true });

// Phase 2: every later request carries the prefixed cookie; HAProxy
// reads S1, strips it, and Tomcat sees its own ID.
msg(d, br, hp, 382, ['5  next request', 'cookie S1~<id>']);
note(d, hp, 434, ['6  S1 = node 1:', 'strip S1~']);
msg(d, hp, n1, 480, '7  JSESSIONID=<id>');

// Phase 3: node 1 stops. The cookie still says S1, but redispatch sends
// the request to node 2, which never saw this session, so the user signs
// in again and node 2 issues a new one, which HAProxy prefixes with S2~.
band(520, 'Node 1 stops: option redispatch sends the request to node 2', '#b91c1c');
note(d, n1, 574, ['systemctl stop', 'pentaho']);
msg(d, br, hp, 628, ['8  next request', 'cookie S1~<id>']);
note(d, hp, 680, ['9  node 1 down:', 'option redispatch']);
// The arrows between HAProxy and node 2 cross node 1's lane: their pills
// sit between the node 1 and node 2 lifelines (lx), clear of node 1's.
msg(d, hp, n2, 726, '10  the request', { lx: 592 });
msg(d, n2, hp, 766, '11  no such session here', { dashed: true, lx: 592 });
msg(d, hp, br, 806, '12  sign in again', { dashed: true });
note(d, br, 852, ['then the cookie', 'is S2~<new id>']);

d.write(import.meta.url);
