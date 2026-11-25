// Where the course's machine learning code runs, to help troubleshoot the
// setup: Python code through the Python Executor step and the h2o-env
// virtual environment; R code through the R script executor step, JRI and
// R itself, inside Spoon's own Java process; and the Colab notebook in
// the cloud, on a hosted runtime. It is the figure in
// 02-prerequisite-tasks/guide.md, under the Workshop - Prerequisite Tasks
// box, before the tabs.
//
// Facts it encodes, and where each comes from:
//   - 02-prerequisite-tasks intro: the commands are for Ubuntu or Debian
//     Linux; Pentaho Data Integration 11 in
//     ~/Pentaho/design-tools/data-integration.
//   - 02 part 2: the AutoML transformation's Python Executor step needs
//     Python 3 with H2O, pandas, NumPy, Matplotlib and Py4J, installed in
//     a virtual environment, h2o-env, in your home folder; `which python`
//     prints /home/pentaho/h2o-env/bin/python.
//   - 03-automl part 4: the Python Executor step (named "auto machine
//     learning") supports the CPython runtime only; on its Script tab you
//     select Use a Python virtual environment and enter the path, such as
//     /home/pentaho/h2o-env; with All rows the rows arrive as one pandas
//     data frame, `dataset`; the script calls h2o.init(max_mem_size='4G',
//     nthreads=-1) and runs H2O AutoML.
//   - 02 part 3: rJava, and the JRI library that comes with it, let a
//     Java program such as Spoon start R and pass data frames to it; R's
//     packages (gbm, from 03-automl part 6) load with library().
//   - 02 part 4: R_HOME and R_LIBS_USER and /usr/lib/R/bin on PATH go in
//     /etc/environment; libjri.so is copied from rJava's jri folder into
//     Spoon's native-lib/linux/x86_64; sign out and back in so the
//     variables reach Spoon.
//   - 02 part 5 "Under the hood": spoon.sh starts Java with
//     -Djava.library.path set to libswt/linux/x86_64 and
//     native-lib/linux/x86_64; the R script executor step talks to R
//     through JRI, whose Java half ships with the step in
//     plugins/pentaho-r-plugin/lib and whose native half, libjri.so,
//     comes from rJava; JRI runs R inside Spoon's own Java process, and R
//     finds its installation through R_HOME. Why it matters: when an R
//     step can't start R, the cause is the setup, not the script: check
//     the copied libjri.so and the variables in /etc/environment.
//   - 02 part 1 and 03-automl part 5: Colab runs Jupyter notebooks in
//     your browser with common machine learning libraries already
//     installed, after you sign in with your Google account;
//     Connect > Connect to a hosted runtime; !pip install
//     h2o; h2o.init(max_mem_size='4G', nthreads=-1); H2O.csv is uploaded
//     with files.upload().
//
// The h2o-env box sits outside the Spoon panel because the lessons put
// the virtual environment in your home folder, not in Spoon's folder;
// the R box sits inside it because the lesson says R runs inside Spoon's
// own Java process.
//
// Colors: slate the machine and its configuration (support), blue Spoon
// (a tool you use), violet the steps and runtimes that run code
// (engines), teal JRI (the link between Java and R), amber Colab in the
// browser, red the troubleshooting check (what fails).
// Icons: monitor your machine, workflow Spoon, code a script executor
// step, link JRI, sigma R, square-terminal a Python runtime,
// file-cog /etc/environment, globe the browser, cloud the hosted runtime,
// triangle-alert the check.
//
// Run from this folder:   node ml-runtimes.svg.mjs
// It writes ml-runtimes.svg here and ../images/ml-runtimes.png at twice
// the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 636);

// Three columns inside the Spoon panel, 220 wide with 22 between them;
// every box 80 tall, room for a title and two lines.
const COL = [48, 290, 532];
const BW = 220, BH = 80;

// --- Your machine ---------------------------------------------------
d.panel({ x: 16, y: 16, w: 768, h: 432, role: 'support', iconName: 'monitor', title: 'Your machine: Ubuntu or Debian Linux', sub: 'Pentaho Data Integration 11 in ~/Pentaho/design-tools/data-integration' });

// Spoon's own Java process, started by spoon.sh, with the library path
// that lets Java load libjri.so.
const SP = 72;
const SPH = 256; // tall enough for both rows of steps
d.panel({ x: 32, y: SP, w: 736, h: SPH, role: 'tool', iconName: 'workflow', title: "Spoon's Java process, started by spoon.sh", sub: 'java.library.path: libswt/linux/x86_64 and native-lib/linux/x86_64' });

// Row 1: the R chain, left to right. The step talks to JRI, and JRI
// runs R inside this same process.
const R1 = SP + 56;
const rse = d.box({ x: COL[0], y: R1, w: BW, h: BH, role: 'engine', iconName: 'code', title: 'R script executor', lines: ['in test_r.ktr and the', "Credit Card lab's R steps"] });
const jri = d.box({ x: COL[1], y: R1, w: BW, h: BH, role: 'join', iconName: 'link', title: 'JRI', lines: ['Java half: the R plugin;', 'libjri.so: native-lib'] });
const r = d.box({ x: COL[2], y: R1, w: BW, h: BH, role: 'engine', iconName: 'sigma', title: 'R', lines: ["inside Spoon's process;", 'library(gbm)'] });
d.arrow({ x1: rse.r, y1: rse.cy, x2: jri.x - 3, y2: jri.cy });
d.arrow({ x1: jri.r, y1: jri.cy, x2: r.x - 3, y2: r.cy });

// Row 2: the Python Executor step, spanning two columns; it runs its
// script in the virtual environment below.
const R2 = R1 + BH + 24;
const pyx = d.box({ x: COL[0], y: R2, w: BW * 2 + 22, h: BH, role: 'engine', iconName: 'code', title: 'Python Executor: auto machine learning', lines: ['CPython only; Use a Python virtual environment:', '/home/pentaho/h2o-env; All rows as dataset'] });

// Below the Spoon panel, still on the machine: the virtual environment
// (left) and /etc/environment (right), which reaches R through R_HOME.
const R3 = SP + SPH + 24;
const venv = d.box({ x: COL[0], y: R3, w: BW * 2 + 22, h: BH, role: 'engine', iconName: 'square-terminal', title: 'CPython in ~/h2o-env', lines: ['Python 3 with h2o, pandas, numpy, matplotlib, py4j;', "the script runs h2o.init(max_mem_size='4G')"] });
const env = d.box({ x: COL[2], y: R3, w: BW, h: BH, role: 'support', iconName: 'file-cog', title: '/etc/environment', lines: ['R_HOME, R_LIBS_USER,', 'PATH + /usr/lib/R/bin'] });
d.arrow({ x1: pyx.cx, y1: pyx.b, x2: venv.cx, y2: venv.y - 3, straight: true });
// /etc/environment up to R: the variables reach Spoon at sign-in, and
// R finds its installation through R_HOME.
d.arrow({ x1: env.cx, y1: env.y, x2: r.cx, y2: r.b + 3, straight: true, label: 'R_HOME' });

// --- The cloud -----------------------------------------------------------
// Colab: a notebook in the browser on a hosted runtime; H2O.csv is
// uploaded from the machine.
const CP = 472;
d.panel({ x: 16, y: CP, w: 500, h: 148, role: 'browser', iconName: 'cloud', title: 'Google Colab, in the cloud', sub: 'a Google account; common ML libraries already installed' });
const nb = d.box({ x: 32, y: CP + 56, w: 220, h: BH, role: 'browser', iconName: 'globe', title: 'Colab notebook', lines: ['in your browser;', 'upload H2O.csv'] });
const hr = d.box({ x: 280, y: CP + 56, w: 220, h: BH, role: 'engine', iconName: 'cloud', title: 'Hosted runtime', lines: ['!pip install h2o;', 'h2o.init(), AutoML'] });
d.arrow({ x1: nb.r, y1: nb.cy, x2: hr.x - 3, y2: hr.cy });

// Bottom right: the check the lesson gives when an R step can't start R.
d.box({ x: 532, y: CP + 56, w: 252, h: BH, role: 'reject', iconName: 'triangle-alert', title: "R step can't start R?", lines: ['the setup, not the script: check', 'libjri.so, /etc/environment'] });

d.write(import.meta.url);
