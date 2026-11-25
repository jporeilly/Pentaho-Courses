// Install via Helm: the three changes the workshop makes to the release
// pentaho, the revision each one records in the namespace default, and
// what each does to the pods in the namespace pentaho.
//
// Facts it draws, and where each comes from (all 09-helm-install):
//   - helm install pentaho ./pentaho records revision 1; NAMESPACE:
//     default, the namespace of the kubectl context (part 2).
//   - Helm stores each revision as a Secret in the namespace it installs
//     into, default: sh.helm.release.v1.pentaho.v1, .v2 and .v3; helm list
//     shows the release there, and helm list -n pentaho shows nothing
//     (part 2, "The release lives in one namespace, its objects in
//     another"; part 3, step 8).
//   - Every template sets namespace: pentaho, from global.namespace, and
//     the chart creates that Namespace itself; so kubectl needs
//     -n pentaho (part 2).
//   - The server container's memory limit is 6Gi from values.yaml;
//     helm upgrade pentaho ./pentaho --set
//     pentaho.resources.limits.memory=8Gi records revision 2, Upgrade
//     complete (part 3, steps 1 to 5).
//   - The upgrade changes the pentaho-server Deployment's pod template, so
//     its pod is replaced, and strategy: Recreate stops the old pod before
//     the new one starts; the postgres Deployment renders the same, so its
//     pod keeps its name and age (part 3, "An upgrade restarts only what
//     renders differently", and step 4).
//   - helm rollback pentaho 1 takes the manifests stored with revision 1,
//     applies them and records revision 3, Rollback to 1, deployed;
//     revision 2 is not deleted; the pentaho-server pod is replaced again
//     and the limit is back to 6Gi (part 3, steps 6 to 8, "A rollback is
//     a new revision").
//   - The history statuses drawn are the ones the workshop shows: revision
//     1 Install complete, 2 Upgrade complete, 3 Rollback to 1 (deployed).
//
// Run: node helm-revisions.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas, box size, and one column per change, so each command, its
// revision and its effect on the pods read straight down.
const d = new Diagram(1000, 584);
const BW = 290, BH = 84;
const COL = [32, 355, 678];

// Row 1: the three helm commands, in the order the workshop runs them.
const cmds = [
  { title: 'helm install', lines: ['helm install pentaho ./pentaho', 'NAMESPACE: default; limit 6Gi'] },
  { title: 'helm upgrade', lines: ['--set pentaho.resources.', 'limits.memory=8Gi'] },
  { title: 'helm rollback pentaho 1', lines: ["applies revision 1's", 'stored manifests again'] },
].map((o, i) => d.box({ x: COL[i], y: 16, w: BW, h: BH, role: 'tool', iconName: 'ship-wheel', ...o }));
// The timeline: each command follows the one before.
cmds.slice(1).forEach((c, i) => d.arrow({ x1: cmds[i].r, y1: cmds[i].cy, x2: c.x - 3, y2: c.cy }));

// Row 2: the namespace default, where Helm keeps one Secret per revision.
d.panel({ x: 16, y: 132, w: 968, h: 160, role: 'store', iconName: 'history', title: 'Namespace default', sub: 'one Secret per revision' });
const revs = [
  { title: 'Revision 1', lines: ['sh.helm.release.v1.pentaho.v1', 'Install complete'] },
  { title: 'Revision 2', lines: ['sh.helm.release.v1.pentaho.v2', 'Upgrade complete'] },
  { title: 'Revision 3', lines: ['sh.helm.release.v1.pentaho.v3', 'Rollback to 1: deployed'] },
].map((o, i) => d.box({ x: COL[i], y: 192, w: BW, h: BH, role: 'store', iconName: 'file-lock', ...o }));
// Each command records its revision. The vertical arrows run near each
// box's right edge, so they pass the panels' title strips beyond the
// (short) titles rather than through them.
const AX = (b) => b.r - 30;
cmds.forEach((c, i) => d.arrow({ x1: AX(c), y1: c.b, x2: AX(revs[i]), y2: revs[i].y - 3, straight: true }));

// Row 3: the namespace pentaho, where the chart puts its objects. The
// server pod in each column is the one that revision leaves running.
d.panel({ x: 16, y: 324, w: 968, h: 244, role: 'server', iconName: 'layers', title: 'Namespace pentaho', sub: 'kubectl needs -n pentaho' });
const pods = [
  { title: 'pentaho-server pod', lines: ['memory limit 6Gi'] },
  { title: 'Replaced: a new pod', lines: ['limit 8Gi; Recreate stops', 'the old pod first'] },
  { title: 'Replaced again', lines: ['limit back to 6Gi'] },
].map((o, i) => d.box({ x: COL[i], y: 384, w: BW, h: BH, role: 'server', iconName: 'server', ...o }));
// Each revision's manifests are what the pods run.
revs.forEach((r, i) => d.arrow({ x1: AX(r), y1: r.b, x2: AX(pods[i]), y2: pods[i].y - 3, straight: true }));
// And each new pod replaces the one before.
pods.slice(1).forEach((p, i) => d.arrow({ x1: pods[i].r, y1: pods[i].cy, x2: p.x - 3, y2: p.cy }));

// Under the server pods, PostgreSQL's pod, which the upgrade leaves alone.
d.bar({ x: 32, y: 484, w: 936, h: 64, role: 'store', iconName: 'database', title: 'postgres pod', line: 'its Deployment renders the same after the upgrade, so the pod keeps its name and age' });

d.write(import.meta.url);
