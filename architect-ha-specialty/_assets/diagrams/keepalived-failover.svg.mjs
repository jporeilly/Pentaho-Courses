// Which balancer holds the VIP, by Keepalived's priorities, in three
// states: both balancers healthy, HAProxy stopped on lb-01, and
// Keepalived stopped on lb-01. It is the figure in
// 02-ha-deploy/guide.md, part 6 "Verify the Cluster", after the warning
// before test 4.
//
// Facts it encodes, and where each comes from (all 02-ha-deploy):
//   - Part 5, step 4, keepalived.conf: lb-01 `state MASTER`, `priority
//     110`; lb-02 `state BACKUP`, `priority 100`; `vrrp_script
//     chk_haproxy` runs `/usr/bin/killall -0 haproxy` every 2 seconds
//     (`interval 2`) with `weight 2`; `virtual_ipaddress` 10.0.1.100/24.
//   - Part 5, intro: Keepalived gives the VIP to lb-01, and moves it to
//     lb-02 when lb-01 stops sending its VRRP heartbeat.
//   - Part 6, warning before test 4: the check adds its weight of 2
//     while HAProxy runs: lb-01 has 112 and lb-02 102. When HAProxy
//     stops on lb-01, it drops to 110, still above 102, so it keeps the
//     VIP (the bundled guide's test 4 expects that it moves).
//   - Part 6, test 4 (step 5): stop Keepalived on lb-01; within a few
//     seconds lb-02 holds inet 10.0.1.100/24. Step 6: start it again,
//     and with the higher priority lb-01 takes the VIP back.
//
// Colors: teal the balancer holding the VIP (the link clients reach),
// slate a balancer standing by, red what was stopped. Icons: scale a
// balancer, octagon-x a stopped service, heart-pulse the chk_haproxy
// check.
//
// Run from this folder:   node keepalived-failover.svg.mjs
// It writes keepalived-failover.svg here and
// ../images/keepalived-failover.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide, three columns of 248 with 12px gaps, and the
// chk_haproxy bar across the foot.
const d = new Diagram(800, 420);
const CW = 248, BX = 16; // column width, box inset in a column
const cols = [16, 276, 536];

// One column: a panel with a title, then lb-01 and lb-02, and a pill
// between them comparing their priorities. `a` and `b` are the two
// boxes' options (role, icon, lines); `cmp` the comparison.
function column(x, { title, sub, role }, a, b, cmp) {
  d.panel({ x, y: 16, w: CW, h: 304, role, title, sub });
  const w = CW - 2 * BX;
  const top = d.box({ x: x + BX, y: 74, w, h: 84, title: 'lb-01', ...a });
  const bot = d.box({ x: x + BX, y: 216, w, h: 84, title: 'lb-02', ...b });
  // The comparison sits in the gap between the two boxes.
  d.pill(x + CW / 2, (top.b + bot.y) / 2, cmp);
}

// 1. Both healthy: chk_haproxy succeeds on both, so each adds 2.
column(cols[0], { title: 'Both running', sub: 'as after part 5', role: 'support' },
  { role: 'join', iconName: 'scale', lines: ['MASTER, 110 + 2 = 112', 'holds VIP 10.0.1.100'] },
  { role: 'support', iconName: 'scale', lines: ['BACKUP, 100 + 2 = 102', 'stands by'] },
  '112 > 102: lb-01 keeps it');

// 2. HAProxy stopped on lb-01: its check fails, it loses the 2, and
// 110 is still above 102, so the VIP stays (the warning's point).
column(cols[1], { title: 'HAProxy stopped', sub: 'on lb-01: the VIP stays', role: 'reject' },
  { role: 'join', iconName: 'octagon-x', lines: ['HAProxy down: 110', 'still holds the VIP'] },
  { role: 'support', iconName: 'scale', lines: ['BACKUP, 102', 'stands by'] },
  '110 > 102: lb-01 keeps it');

// 3. Keepalived stopped on lb-01 (test 4): no VRRP heartbeat from
// lb-01, so lb-02 takes the VIP.
column(cols[2], { title: 'Keepalived stopped', sub: 'on lb-01: test 4', role: 'reject' },
  { role: 'reject', iconName: 'octagon-x', lines: ['Keepalived down:', 'no VRRP heartbeat'] },
  { role: 'join', iconName: 'scale', lines: ['102: takes the VIP', 'holds VIP 10.0.1.100'] },
  'only lb-02 sends VRRP');

// The check behind the "+ 2", from keepalived.conf.
d.bar({ x: 16, y: 336, w: 768, h: 64, role: 'check', iconName: 'heart-pulse', title: 'vrrp_script chk_haproxy', line: 'killall -0 haproxy every 2 s; while it succeeds, the balancer’s priority is raised by its weight, 2' });

d.write(import.meta.url);
