// Applying a service pack, start to finish: record and back up, run the
// Pentaho Service Pack Installer on the server folder, read what it
// left, put back what it removed, and patch the client tools from
// their own archives; with the one mistake that stops the installer
// (staging files inside the folder it backs up) as a red branch. It is
// the figure above the tabs of
// 09-installation-upgrade-and-patches/guide.md.
//
// Facts it encodes (all lesson 09), and the tab each comes from:
//   - Intro: base release 11.0.0.0-237, service pack 11.0.0.3-312.
//   - "1. Before You Patch": check the build (pentaho-platform-core
//     JAR), list the plugins (pluginmeta.json) and the JDBC drivers in
//     tomcat/lib, back the plugins up to ~/pentaho-backup, check 22 GB
//     free, set JAVA_HOME to PENTAHO_JAVA_HOME, stop the server.
//   - "2. Apply the Service Pack": pentaho-update-11.0.0.3-312.bin
//     -i silent -DEULA=true -DUSER_INSTALL_DIR=/opt/pentaho/server
//     -DHASH_FILE_ZIP=...; USER_INSTALL_DIR is the root it scans for
//     products and the root it backs up whole before it changes
//     anything; exit code 0 on success. Given /opt/pentaho it also
//     finds the 1.1 GB server archive staged in /opt/pentaho/software,
//     stops with "This file is too large to back up" and ends with exit
//     code 255, having changed nothing. It leaves its reports in
//     /opt/pentaho/server/Pentaho__Installation (with Logs) and a ZIP
//     of the old build, 11.0.0.0-237-<date>.zip, in ~/.pentaho/backups.
//   - "3. Put Back What It Removed": the installer knows six products
//     (Server, Analyzer, Dashboards, Interactive Reporting, JDBC
//     Distribution, License Installer) and replaces them; Semantic
//     Model Editor (installed from the Plugin Manager) and a JDBC
//     driver you copied into tomcat/lib are removed: reinstall SME from
//     the Plugin Manager, copy the driver back from
//     /opt/pentaho/software/db-drivers, restart once.
//   - "4. Patch the Client Tools": for 11.0.0.3-312 the installer
//     carries no client tools; the service pack's client archives are
//     unpacked into a new ~/Pentaho/design-tools, the old folder kept
//     as design-tools-11.0.0.0-237 until the new one is proven.
//
// Icons: clipboard-list the record, package the installer, archive the
// backup, refresh-cw the replaced products, folder-open the reports,
// undo-2 putting back, laptop the client tools, octagon-x the failure.
// This folder's README has the table.
//
// Run from this folder:   node service-pack-flow.svg.mjs
// It writes service-pack-flow.svg here and
// ../images/service-pack-flow.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. One column of steps on the left, read top to
// bottom; the failure branch on the right, beside the step it leaves.
const W = 800;
const MX = 16, MW = 470, BH = 68, GAP = 24;
const RX = 528, RW = W - 16 - RX;
const y = (i) => 16 + i * (BH + GAP); // top of step i
const d = new Diagram(W, y(7) + 4);

/** A small tab tag on the right of a step: which tab of the lesson. */
function tab(b, text) {
  d.raw(`<text x="${b.r - 10}" y="${b.y + 16}" text-anchor="end" font-size="10.5" font-weight="700" letter-spacing="0.4" fill="${ROLE.support.head}">${esc(text)}</text>`);
}

// ── The steps, in order ───────────────────────────────────────────────
// Amber the record (a check), violet the installer's own work (an
// engine), green what it leaves behind (a store), blue what you do by
// hand afterwards (a tool you use).
const s = [
  d.box({ x: MX, y: y(0), w: MW, h: BH, role: 'check', iconName: 'clipboard-list', title: 'Record and back up', lines: ['build, plugins and drivers; plugins to ~/pentaho-backup;', '22 GB free, JAVA_HOME set, server stopped'] }),
  d.box({ x: MX, y: y(1), w: MW, h: BH, role: 'engine', iconName: 'package', title: 'Run the installer, -i silent', lines: ['pentaho-update-11.0.0.3-312.bin', '-DUSER_INSTALL_DIR=/opt/pentaho/server'] }),
  d.box({ x: MX, y: y(2), w: MW, h: BH, role: 'engine', iconName: 'archive', title: 'It scans USER_INSTALL_DIR and backs it up', lines: ['the whole folder, before it changes anything'] }),
  d.box({ x: MX, y: y(3), w: MW, h: BH, role: 'engine', iconName: 'refresh-cw', title: 'It replaces the six products: exit code 0', lines: ['Server, Analyzer, Dashboards, Interactive Reporting,', 'JDBC Distribution, License Installer'] }),
  d.box({ x: MX, y: y(4), w: MW, h: BH, role: 'store', iconName: 'folder-open', title: 'Read what it left', lines: ['reports and Logs in Pentaho__Installation;', '~/.pentaho/backups/11.0.0.0-237-<date>.zip'] }),
  d.box({ x: MX, y: y(5), w: MW, h: BH, role: 'tool', iconName: 'undo-2', title: 'Put back what it removed', lines: ['Semantic Model Editor from the Plugin Manager; your', 'JDBC driver from /opt/pentaho/software/db-drivers'] }),
  d.box({ x: MX, y: y(6), w: MW, h: BH, role: 'tool', iconName: 'laptop', title: 'Patch the client tools', lines: ['unpack the service pack\'s client archives', 'into a new ~/Pentaho/design-tools'] }),
];

// Tags: which tab of the lesson each step belongs to.
tab(s[0], 'TAB 1');
tab(s[1], 'TAB 2');
tab(s[4], 'TAB 2');
tab(s[5], 'TAB 3');
tab(s[6], 'TAB 4');

// Straight arrows down the column, one between each pair of steps.
for (let i = 0; i + 1 < s.length; i++) {
  d.arrow({ x1: s[i].cx, y1: s[i].b, x2: s[i + 1].cx, y2: s[i + 1].y - 3, straight: true });
}

// ── The red branch: staging files inside the folder ───────────────────
// Beside the backup step: the folder named is /opt/pentaho, so the
// backup meets the 1.1 GB server archive and the run fails.
const r1 = d.box({ x: RX, y: y(2), w: RW, h: BH, role: 'reject', iconName: 'octagon-x', title: 'Given /opt/pentaho', lines: ['it finds the 1.1 GB server', 'ZIP in /opt/pentaho/software'] });
const r2 = d.box({ x: RX, y: y(3), w: RW, h: BH, role: 'reject', iconName: 'octagon-x', title: 'Exit code 255', lines: ['"This file is too large to', 'back up": nothing changed'] });
d.arrow({ x1: s[2].r, y1: s[2].cy, x2: r1.x - 3, y2: r1.cy, straight: true });
d.arrow({ x1: r1.cx, y1: r1.b, x2: r2.cx, y2: r2.y - 3, straight: true });

d.write(import.meta.url);
