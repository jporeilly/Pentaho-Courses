// Where the course's machine learning code runs, to help troubleshoot the
// setup: Spoon's Python Executor step starts the Python program in the
// h2o-env virtual environment as a process of its own; the scripts start
// H2O's Java engine on Pentaho's own Java; JupyterLab runs the AutoML
// notebook from the same environment; and, optionally, a Colab notebook
// runs in the cloud. It is the figure in 02-prerequisite-tasks/guide.md,
// under the Workshop - Prerequisite Tasks box, before the note and tabs.
//
// Facts it encodes, and where each comes from:
//   - 02 intro and tab 1: a virtual environment named h2o-env in your home
//     folder with h2o, pandas, numpy, matplotlib, py4j and jupyterlab; its
//     Python program is C:\Users\<you>\h2o-env\Scripts\python.exe on
//     Windows and /home/<you>/h2o-env/bin/python on Linux; H2O's engine
//     runs on Pentaho Data Integration's own Java (C:\Pentaho\java on the
//     lab machine).
//   - 02 tab 3 and its "Under the hood": the Python Executor step runs the
//     program named in Use a Python virtual environment as a separate
//     process, sends the rows as a pandas data frame, and reads back the
//     mapped variables; Python never runs inside Spoon's Java process.
//     Why it matters: when a Python step fails, check the program path and
//     the packages in that environment first.
//   - 04-credit-card part 2: the scripts set H2O_JAVA_HOME from
//     _PENTAHO_JAVA_HOME, which Spoon sets, then call h2o.init().
//   - 02 tab 2 (optional): Colab runs Jupyter notebooks in your browser on
//     a hosted runtime, after you sign in with a Google account; your data
//     then leaves the machine.
//   - 02 note: the course does not use R.
//
// The h2o-env box sits outside the Spoon panel because the step starts it
// as a separate process; H2O's engine sits beside it because it is a
// second Java process, not Spoon's.
//
// Colors: slate the machine (support), blue Spoon and JupyterLab (tools
// you use), violet the step and the runtimes that run code (engines), teal
// H2O's engine (the model), amber Colab in the browser, red the
// troubleshooting check (what fails).
// Icons: monitor your machine, workflow Spoon, code the Python Executor
// step, square-terminal a Python runtime, cpu H2O's engine, notebook-pen
// JupyterLab, globe the browser, cloud the hosted runtime, triangle-alert
// the check.
//
// Run from this folder:   node ml-runtimes.svg.mjs
// It writes ml-runtimes.svg here and ../images/ml-runtimes.png at twice
// the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 516);

// Left column: Spoon and the Python it starts; right column: JupyterLab
// and H2O's engine. 92 between the columns leaves room for the h2o.init()
// label.
const LX = 48, LW = 420, RX = 560, RW = 208, BH = 80;

// --- Your machine ---------------------------------------------------
d.panel({ x: 16, y: 16, w: 768, h: 320, role: 'support', iconName: 'monitor', title: 'Your machine: Windows 11 or Linux', sub: 'Pentaho Data Integration 11, and Python 3.11 or later' });

// Spoon's own Java process, holding the Python Executor step.
const SP = 72, SPH = 136;
d.panel({ x: 32, y: SP, w: 452, h: SPH, role: 'tool', iconName: 'workflow', title: "Spoon's Java process", sub: 'spoon.bat or spoon.sh; sets _PENTAHO_JAVA_HOME' });
const pyx = d.box({ x: LX, y: SP + 48, w: LW, h: BH, role: 'engine', iconName: 'code', title: 'Python Executor step', lines: ['Use a Python virtual environment: the program;', 'All rows: the rows as a pandas data frame'] });
const jl = d.box({ x: RX, y: SP + 48, w: RW, h: BH, role: 'tool', iconName: 'notebook-pen', title: 'JupyterLab', lines: ['the AutoML notebook,', 'started from h2o-env'] });

// Below: the virtual environment's Python (a separate process) and H2O's
// engine (a second Java process).
const R3 = SP + SPH + 32;
const venv = d.box({ x: LX, y: R3, w: LW, h: BH, role: 'engine', iconName: 'square-terminal', title: 'Python in ~/h2o-env: its own process', lines: ['h2o, pandas, numpy, matplotlib, py4j, jupyterlab;', 'Scripts\\python.exe (Windows), bin/python (Linux)'] });
const eng = d.box({ x: RX, y: R3, w: RW, h: BH, role: 'model', iconName: 'cpu', title: "H2O's engine", lines: ['a Java process on', "Pentaho's Java"] });
d.arrow({ x1: pyx.cx, y1: pyx.b, x2: venv.cx, y2: venv.y - 3, straight: true, label: 'starts' });
d.arrow({ x1: venv.r, y1: venv.cy, x2: eng.x - 3, y2: eng.cy, label: 'h2o.init()' });
d.arrow({ x1: jl.cx, y1: jl.b, x2: eng.cx, y2: eng.y - 3, straight: true, label: 'h2o.init()' });
// --- The cloud (optional) -------------------------------------------------
const CP = 352;
d.panel({ x: 16, y: CP, w: 500, h: 148, role: 'browser', iconName: 'cloud', title: 'Google Colab, in the cloud (optional)', sub: 'a Google account; your data leaves the machine' });
const nb = d.box({ x: 32, y: CP + 56, w: 220, h: BH, role: 'browser', iconName: 'globe', title: 'Colab notebook', lines: ['in your browser;', 'upload H2O.csv'] });
const hr = d.box({ x: 280, y: CP + 56, w: 220, h: BH, role: 'engine', iconName: 'cloud', title: 'Hosted runtime', lines: ['!pip install h2o;', 'h2o.init(), AutoML'] });
d.arrow({ x1: nb.r, y1: nb.cy, x2: hr.x - 3, y2: hr.cy });

// Bottom right: the check the lesson gives when a Python step fails.
d.box({ x: 532, y: CP + 56, w: 252, h: BH, role: 'reject', iconName: 'triangle-alert', title: 'Python step fails?', lines: ['check the program path first,', 'then pip list in h2o-env'] });

d.write(import.meta.url);
