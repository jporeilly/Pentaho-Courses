// How a Tray.io workflow runs a Pentaho Data Integration job on the
// Carte master and waits for it: start with runJob, read the job ID,
// poll jobStatus with a delay until the job ends, then notify. A sequence
// diagram with three lanes: Tray.io workflow, On-Premises Agent and
// Carte master. It is the figure in 04-trayio-integration/guide.md, at
// the end of part 2 "Build the Scheduled Workflow".
//
// Facts it encodes, and where each comes from (all 04-trayio-integration):
//   - Prerequisites: the Carte master on 10.0.1.40:9001; Tray.io reaches
//     it through the Tray.io On-Premises Agent (or an address published
//     through the network edge); the example job /ETL/LoadCustomer.kjb.
//   - Part 1, endpoints table and steps 2-4: GET /kettle/runJob/ with
//     job and level=Basic answers a <webresult> with <result>OK and the
//     job's <id>; GET /kettle/jobStatus/ with name=LoadCustomer, the id
//     and xml=Y answers <status_desc> Running, then Finished.
//   - Part 1, "Carte starts the job and answers at once": runJob starts
//     the job on its own thread and returns the ID while the job is still
//     running; nothing waits on the open HTTP connection; the caller
//     polls jobStatus.
//   - Part 2, steps 2-4: the Scheduler trigger (for example daily at
//     02:00 UTC); an HTTP Client step with GET runJob, its Authorization
//     header taken from a Generic Service Authentication with $.auth;
//     behind the agent the private address works as it is.
//   - Part 2, steps 6-8: a Script step reads jobId from the <id> in the
//     response; the poll is a second HTTP Client step on jobStatus, a
//     Delay step of 10 seconds and a Boolean condition step, looping
//     until the status is Finished or Stopped; then a Slack step (or
//     email or Jira) with an error branch for a status that reports
//     errors.
//   - Part 3: a Webhook trigger with a Public URL starts the same call,
//     with CUSTOMER_ID and LOAD_DATE from the payload as job parameters.
//
// Colors: blue Tray.io (the tool you build in), slate the On-Premises
// Agent (a supporting service), amber the Carte master (as in
// ha-topology and carte-master-slaves). The amber frame marks the loop.
//
// Run from this folder:   node trayio-carte-poll.svg.mjs
// It writes trayio-carte-poll.svg here and ../images/trayio-carte-poll.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { lanes, msg, note } from './sequence.mjs';

// Canvas: 800 wide, three lanes of 248 with 12px gaps.
const d = new Diagram(800, 730);
const TOP = 16, H = 698;

const [tr, ag, cm] = lanes(d, {
  top: TOP, height: H, cols: [
    { x: 16, w: 248, role: 'tool', iconName: 'cloud', title: 'Tray.io workflow', sub: 'in the cloud' },
    { x: 276, w: 248, role: 'support', iconName: 'plug', title: 'On-Premises Agent', sub: 'inside your network' },
    { x: 536, w: 248, role: 'check', iconName: 'network', title: 'Carte master', sub: '10.0.1.40:9001' },
  ],
});

// A request that the agent relays: two arrows at the same height, the
// label on the first, so it reads as one call passing through the agent.
// `dashed` marks a reply on its way back.
function relay(y, label, { back = false } = {}) {
  if (back) {
    msg(d, cm, ag, y, label, { dashed: true });
    msg(d, ag, tr, y, [], { dashed: true }); // [] draws no pill
  } else {
    msg(d, tr, ag, y, label);
    msg(d, ag, cm, y, []); // [] draws no pill
  }
}

// The loop frame: an amber outline across all three lanes with its
// label in the top-left corner, on the panel layer so arrows draw over.
function loop(y, h, title) {
  d.under.push(`<rect x="24" y="${y}" width="752" height="${h}" rx="8" fill="none" stroke="#b45309" stroke-width="1.4" stroke-dasharray="6 4"/>`);
  d.under.push(`<rect x="24" y="${y}" width="270" height="24" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="1.4"/>`);
  d.under.push(`<text x="36" y="${y + 17}" font-size="12.5" font-weight="700" fill="#78350f">${title}</text>`);
}

// 0. The trigger starts the workflow: on a schedule, or from a webhook.
note(d, tr, 100, ['0  Scheduler, daily 02:00 UTC,', 'or Webhook (Public URL)']);

// 1-2. Start the job. Carte answers at once with the job's ID.
relay(166, ['1  HTTP Client: GET runJob', 'job=/ETL/LoadCustomer.kjb', 'level=Basic']);
note(d, cm, 222, ['starts the job on', 'its own thread']);
relay(278, ['2  webresult: OK', 'and the job’s <id>'], { back: true });

// 3. The Script step reads the ID out of the response.
note(d, tr, 334, ['3  Script step:', 'jobId from <id>']);

// 4-6. The poll, repeated until the job ends.
loop(374, 236, 'loop until Finished or Stopped');
relay(436, ['4  HTTP Client: GET jobStatus', 'name=LoadCustomer, id=jobId']);
relay(498, ['5  status_desc:', 'Running until Finished'], { back: true });
note(d, tr, 566, ['6  Delay 10 s,', 'Boolean condition']);

// 7. After the loop: the notification, with an error branch.
note(d, tr, 660, ['7  Slack (or email, Jira):', 'Pentaho ETL job completed', 'successfully; errors branch off']);

d.write(import.meta.url);
