// Report Bursting (39): one published report, three schedules, three
// emails. Each schedule runs Regional Sales with its own TERRITORY
// values in the background, writes the PDF and hands it to the server's
// mail sender, which delivers it over SMTP to Mailpit. It sits after the
// "The schedule replays the prompt, then mails the file" panel in
// 39-mod9-report-bursting/guide.md, with a "Read the diagram" paragraph
// after it.
//
// Every fact comes from lesson 39 (39-mod9-report-bursting):
//   - "1. A Territory Prompt": Regional Sales.prpt; the TERRITORY
//     parameter is a Multi Value List filled by territory_list (APAC,
//     EMEA, Japan, NA), and Query 1 filters on
//     "PUBLIC"."CUSTOMER_W_TER"."TERRITORY" IN (${TERRITORY}).
//   - "2. Publish and Connect the Mail": published to /public/Training
//     with the title Regional Sales; the server's Administration > Mail
//     Server page points at Mailpit (SMTP, localhost, port 1025, No
//     Auth, from reports@steelwheels.example, Steel Wheels Reports),
//     saved in email_config.xml, which every part of the server sends
//     through; Mailpit's inbox is at http://localhost:8025.
//   - "3. Schedule per Territory": three schedules, each Run Once with
//     Output Type PDF: Regional Sales EMEA (EMEA, to
//     athompson@classicmodelcars.com), Regional Sales APAC (APAC and
//     Japan, to wpatterson@classicmodelcars.com), Regional Sales NA (NA,
//     to bhoward@classicmodelcars.com); subjects Regional Sales - EMEA,
//     - APAC, - NA.
//   - "4. Run and Check": Execute Now runs them; Mailpit's inbox shows
//     three emails, each with a PDF attached; each schedule also saved
//     its PDF in /home/admin under its schedule name. "The schedule
//     replays the prompt, then mails the file": the schedule stores the
//     prompt values (TERRITORY = EMEA) and _SCH_EMAIL_TO; when it fires
//     the server runs the report in the background, writes the PDF to
//     the output location and hands that file to the mail sender.
//
// The plan for this figure said "one inbox per manager"; the lesson has
// one Mailpit inbox holding three emails, one to each manager, so the
// figure draws one inbox panel with three emails.
//
// Colors: violet the Pentaho Server and its schedules; blue the report
// you designed; green the PDF each run writes; slate the mail sender, a
// supporting service; amber Mailpit's inbox, a page in the browser.
// Icons: `server` the Pentaho Server and `file-chart-column` a report
// (this folder's README), `calendar-clock` a schedule, `file-text` a
// PDF, `send` the mail sender, `inbox` and `mail` Mailpit and an email.
//
// Run from this folder:   node report-burst.svg.mjs
// It writes report-burst.svg here and ../images/report-burst.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 682);

// Three columns, one per schedule, inside the panels: 232 wide with
// 20px between them, starting 16px inside a panel.
const CW = 232, CX = [32, 284, 536];

// ── The Pentaho Server: the report, the schedules, the runs, the mail ─
d.panel({ x: 16, y: 16, w: 768, h: 468, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'http://localhost:8080/pentaho' });
const rpt = d.bar({ x: 32, y: 72, w: 736, h: 60, role: 'tool', iconName: 'file-chart-column', title: 'Regional Sales.prpt, published to /public/Training', line: 'TERRITORY: a Multi Value List prompt; Query 1 filters on IN (${TERRITORY})' });

// One schedule per manager: its name, its TERRITORY values and its
// _SCH_EMAIL_TO, cut to the name before the @ for room (the full
// address is on the email below). Output Type PDF is on the run box.
const SCHED = [
  ['Regional Sales EMEA', 'TERRITORY = EMEA', 'athompson@…'],
  ['Regional Sales APAC', 'TERRITORY = APAC, Japan', 'wpatterson@…'],
  ['Regional Sales NA', 'TERRITORY = NA', 'bhoward@…'],
];
const sch = SCHED.map(([title, t, to], i) =>
  d.box({ x: CX[i], y: 172, w: CW, h: 86, role: 'server', iconName: 'calendar-clock', title, lines: [t, '_SCH_EMAIL_TO =', to] }));

// Each run writes its PDF to the output location, /home/admin.
const RUN = ['EMEA', 'APAC', 'NA'];
const run = RUN.map((t, i) =>
  d.box({ x: CX[i], y: 298, w: CW, h: 70, role: 'write', iconName: 'file-text', title: 'Background run', lines: ['writes Regional Sales', `${t}.pdf to /home/admin`] }));

// The one mail sender every part of the server uses.
const mail = d.bar({ x: 32, y: 408, w: 736, h: 60, role: 'support', iconName: 'send', title: 'Mail sender: Administration > Mail Server', line: 'email_config.xml: SMTP to localhost, port 1025, from Steel Wheels Reports' });

// ── Mailpit: one inbox, one email per manager ─────────────────────────
d.panel({ x: 16, y: 516, w: 768, h: 150, role: 'browser', iconName: 'inbox', title: 'Mailpit inbox', sub: 'http://localhost:8025, each email with its PDF attached' });
const INBOX = [
  ['Regional Sales - EMEA', 'athompson@'],
  ['Regional Sales - APAC', 'wpatterson@'],
  ['Regional Sales - NA', 'bhoward@'],
];
const em = INBOX.map(([title, who], i) =>
  d.box({ x: CX[i], y: 572, w: CW, h: 78, role: 'browser', iconName: 'mail', title, lines: [`to ${who}`, 'classicmodelcars.com'] }));

// ── Arrows, straight down each column; one label per stage, on the
// middle column, so the three columns read the same way ───────────────
CX.forEach((x, i) => {
  const cx = x + CW / 2;
  const mid = i === 1;
  d.arrow({ x1: cx, y1: rpt.b, x2: cx, y2: sch[i].y - 3, straight: true, label: mid ? ['Schedule..., once per manager'] : [] });
  d.arrow({ x1: cx, y1: sch[i].b, x2: cx, y2: run[i].y - 3, straight: true, label: mid ? ['Execute Now'] : [] });
  d.arrow({ x1: cx, y1: run[i].b, x2: cx, y2: mail.y - 3, straight: true, label: mid ? ['hands over the PDF'] : [] });
  d.arrow({ x1: cx, y1: mail.b, x2: cx, y2: em[i].y - 3, straight: true, label: mid ? ['SMTP, port 1025'] : [], ly: 500 });
});

d.write(import.meta.url);
