// The Pentaho Repository in PostgreSQL: each server component, the
// configuration file that names its data source, the JNDI resources in
// Tomcat's context.xml, and the database, owner and schemas they reach,
// with what the scripts create and what the first start adds. It sits
// at the top of the "2. Repository Databases" tab of
// 06-installation-archive-pentaho-server/guide.md.
//
// Facts it encodes, and the lesson each comes from (all lesson 06):
//   - "2. Repository Databases": the repository has four parts,
//     Jackrabbit (the solution repository, security and content
//     metadata), Quartz (the scheduler's data), Hibernate (audit
//     logging) and the Operations Mart (usage and performance
//     reporting). create_jcr_postgresql.sql creates the jackrabbit
//     database, owner jcr_user; create_quartz_postgresql.sql creates
//     quartz, owner pentaho_user, and its 11 qrtz6_ tables;
//     create_repository_postgresql.sql creates hibernate, owner
//     hibuser; pentaho_mart_postgresql.sql and
//     pentaho_logging_postgresql.sql create the schemas
//     pentaho_operations_mart and pentaho_dilogs in hibernate, which
//     then shows three schemas with public. jackrabbit has no tables
//     until the first start.
//   - "3. Repository Configuration": Quartz is configured in
//     quartz.properties (table prefix QRTZ6_, JNDI name Quartz),
//     Hibernate in hibernate-settings.xml and postgresql.hibernate.cfg.xml
//     (java:comp/env/jdbc/Hibernate), Jackrabbit in repository.xml
//     (java:comp/env/jdbc/jackrabbit); context.xml defines them as
//     jdbc/Quartz, jdbc/Hibernate and jdbc/jackrabbit.
//   - "4. Tomcat > context.xml": jdbc/Hibernate, jdbc/Audit,
//     jdbc/PDI_Operations_Mart, jdbc/pentaho_operations_mart and
//     jdbc/live_logging_info all reach hibernate as hibuser
//     (live_logging_info in schema pentaho_dilogs); jdbc/Quartz reaches
//     quartz as pentaho_user; jdbc/jackrabbit reaches jackrabbit as
//     jcr_user. (The two HSQLDB sample resources are not drawn: they
//     are not part of the repository.)
//   - "5. Start Server": after the first start, 5 lock rows in quartz's
//     qrtz6_locks, 17 tables in hibernate's public schema, 19 tables in
//     jackrabbit; an empty jackrabbit after a start means the server
//     never reached its repository.
//
// The diagram does not say which JNDI resource the Operations Mart
// uses: the lesson lists the resources by database, not by component,
// so the Operations Mart and Hibernate both point at the one box that
// lists hibernate's five resources.
//
// Icons: folder-tree Jackrabbit (the content repository), calendar-clock
// Quartz (the scheduler), history Hibernate (audit logging), chart-line
// the Operations Mart, database a database, circle-check the check after
// the first start. This folder's README has the table.
//
// Run from this folder:   node repository-databases.svg.mjs
// It writes repository-databases.svg here and
// ../images/repository-databases.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide; three columns with 48px channels between them for
// the arrows. The height follows the bottom bar.
const W = 800;
const d = new Diagram(W, 600);
const CX = 16, CW = 212; // components
const JX = 276, JW = 220; // JNDI resources
const DX = 544, DW = W - 16 - DX; // databases

/** A small-caps column heading, centered over a column. */
function heading(x, w, text) {
  d.raw(`<text x="${x + w / 2}" y="30" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.5" fill="${ROLE.support.head}">${esc(text)}</text>`);
}
heading(CX, CW, 'COMPONENT AND ITS CONFIG FILE');
heading(JX, JW, 'JNDI RESOURCE IN CONTEXT.XML');
heading(DX, DW, 'DATABASE AND OWNER');

// ── Row 1: Jackrabbit ─────────────────────────────────────────────────
// Violet the component (a part of the server), teal its JNDI resource
// (the link between server and database), green the database (a store).
// JNDI boxes carry no icon, so the longest resource name fits.
const R1 = 48, RH = 84;
const jrC = d.box({ x: CX, y: R1, w: CW, h: RH, role: 'server', iconName: 'folder-tree', title: 'Jackrabbit', lines: ['repository.xml', 'content, security'] });
const jrJ = d.box({ x: JX, y: R1 + 18, w: JW, h: 48, role: 'join', title: 'jdbc/jackrabbit', lines: ['as jcr_user'] });
const jrD = d.box({ x: DX, y: R1, w: DW, h: RH, role: 'store', iconName: 'database', title: 'jackrabbit', lines: ['owner jcr_user', 'script: no tables yet', 'first start: 19 tables'] });

// ── Row 2: Quartz ─────────────────────────────────────────────────────
const R2 = R1 + RH + 20;
const qzC = d.box({ x: CX, y: R2, w: CW, h: RH, role: 'server', iconName: 'calendar-clock', title: 'Quartz', lines: ['quartz.properties', 'table prefix QRTZ6_'] });
const qzJ = d.box({ x: JX, y: R2 + 18, w: JW, h: 48, role: 'join', title: 'jdbc/Quartz', lines: ['as pentaho_user'] });
const qzD = d.box({ x: DX, y: R2, w: DW, h: RH, role: 'store', iconName: 'database', title: 'quartz', lines: ['owner pentaho_user', 'script: 11 qrtz6_ tables', 'first start: 5 lock rows'] });

// ── Row 3: hibernate, one database for three uses ─────────────────────
// A green panel for the database, one white box per schema (no icons,
// so the script names fit). On the left, Hibernate and the Operations
// Mart; in the middle, one box listing hibernate's five resources,
// titled by the user they all log in as.
const R3 = R2 + RH + 20;
const hp = d.panel({ x: DX, y: R3, w: DW, h: 236, role: 'store', iconName: 'database', title: 'hibernate', sub: 'owner hibuser; three schemas' });
const SBW = DW - 24;
d.box({ x: DX + 12, y: R3 + 56, w: SBW, h: 50, role: 'result', title: 'public', lines: ['first start: 17 tables'] });
d.box({ x: DX + 12, y: R3 + 114, w: SBW, h: 50, role: 'result', title: 'pentaho_operations_mart', lines: ['pentaho_mart_postgresql.sql'] });
d.box({ x: DX + 12, y: R3 + 172, w: SBW, h: 50, role: 'result', title: 'pentaho_dilogs', lines: ['pentaho_logging_postgresql.sql'] });

const hbC = d.box({ x: CX, y: R3 + 20, w: CW, h: RH, role: 'server', iconName: 'history', title: 'Hibernate', lines: ['hibernate-settings.xml', 'audit logging'] });
const omC = d.box({ x: CX, y: R3 + 132, w: CW, h: RH, role: 'server', iconName: 'chart-line', title: 'Operations Mart', lines: ['usage and', 'performance'] });
const hbJ = d.box({ x: JX, y: R3 + 38, w: JW, h: 160, role: 'join', title: 'Five, all as hibuser', lines: ['jdbc/Hibernate', 'jdbc/Audit', 'jdbc/PDI_Operations_Mart', 'jdbc/pentaho_operations_mart', 'jdbc/live_logging_info'] });

// ── Arrows: component to its resource, resource to its database ───────
// Straight across where the boxes share a row; a curve where two
// components share hibernate's resource box.
d.arrow({ x1: jrC.r, y1: jrJ.cy, x2: jrJ.x - 3, y2: jrJ.cy, straight: true });
d.arrow({ x1: jrJ.r, y1: jrJ.cy, x2: jrD.x - 3, y2: jrJ.cy, straight: true });
d.arrow({ x1: qzC.r, y1: qzJ.cy, x2: qzJ.x - 3, y2: qzJ.cy, straight: true });
d.arrow({ x1: qzJ.r, y1: qzJ.cy, x2: qzD.x - 3, y2: qzJ.cy, straight: true });
d.arrow({ x1: hbC.r, y1: hbC.cy, x2: hbJ.x - 3, y2: hbC.cy, straight: true });
d.arrow({ x1: omC.r, y1: omC.cy, x2: hbJ.x - 3, y2: omC.cy, straight: true });
d.arrow({ x1: hbJ.r, y1: hbJ.cy, x2: hp.x - 3, y2: hbJ.cy, straight: true });

// ── Underneath: the check after the first start ───────────────────────
// Amber (a check), full width.
const BY = R3 + 236 + 20;
d.bar({ x: 16, y: BY, w: W - 32, h: 56, role: 'check', iconName: 'circle-check', title: 'After the first start, jackrabbit is no longer empty', line: 'empty after a start: the server never reached its repository; check context.xml and pg_hba.conf' });
d.h = BY + 56 + 16;

d.write(import.meta.url);
