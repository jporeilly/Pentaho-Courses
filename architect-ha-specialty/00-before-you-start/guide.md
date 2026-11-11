# Before You Start

> **Note:**
>
> #### Get Ready — Before You Start
>
> Welcome! This page shows you how to work with this guide, and lists the machines and the files the cluster needs. Unlike a single-server course, these workshops build on several hosts at once, so get the hosts ready before the first workshop.
>
> **What you'll do:**
>
> * Learn how the guide works: steps, copy buttons, the assistant
> * See which hosts each workshop needs, and what must be on them
> * Check a host with one command block
>
> **Prerequisites:** the Linux command line (`bash`, `sudo`, `ssh`, a text editor), and a Pentaho Server installed from the archive at least once, as in the Pentaho Solution Architect - Installation - Certified course
>
> **Estimated Time:** 5 minutes to read; the time to prepare the hosts depends on your platform

## Meet your lab guide

This panel stays beside your tools for the whole workshop:

- **Float or dock** — drag the title bar to move the window anywhere
  (any monitor), or use the dock button to pin it to the right edge of
  the screen so maximized apps make room for it.
- **The sidebar** lists every section and lab. A <span data-icon="video"></span> badge means the lab
  includes a video; the `~15 min` tag is a time estimate.
- Use the **font-size** and **reading-mode** controls in the toolbar if
  you're on a small screen.

## Track your progress

Each workshop's steps sit in a numbered row at the top of the lab, one
dot per step. Work through them in order: the button at the end of a
step names the next one, and moving on puts a check mark on the step
you leave. Your
progress is saved on this machine and survives restarts, so you can
pick up exactly where you left off. (This page has no steps: tracking
starts in the first workshop.)

## Copy code with one click

Every code block has a **copy button** — hover over the block and select
it, then paste into your terminal. Try it:

```bash
hostnamectl --static
```

## Where the workshops run

The guide runs on your desktop; the workshops run on **Ubuntu 22.04 LTS
hosts**, one role per machine, all on one subnet. You work on each host
in a terminal, over `ssh`.

| Workshop | Hosts | Reference addresses |
| --- | --- | --- |
| Deploy Pentaho in HA | `pentaho-node-01`, `pentaho-node-02` | `10.0.1.10`, `10.0.1.11` |
| | `lb-01`, `lb-02`, and the virtual IP | `10.0.1.20`, `10.0.1.21`, VIP `10.0.1.100` |
| | `db-01` | `10.0.1.30` |
| Carte Cluster | `carte-master`, `carte-slave-01`, `carte-slave-02` | `10.0.1.40`, `10.0.1.41`, `10.0.1.42` |
| Tray.io Integration | The Carte master, and a Tray.io account | `10.0.1.40:9001` |

The addresses are the installation guide's reference values. Use your
own if your network differs, the same on every host.

## What each host needs

- **`sudo`** for your user, and `ssh` access from your desktop.
- **The clock kept in step**: NTP or chrony on every host. Mismatched
  clocks corrupt the scheduler's execution times.
- **The archives**, in your home folder, from the Support Portal:
  `pentaho-server-ee-11.0.0.0-237.zip` on `db-01` and on both Pentaho
  nodes, and `pdi-ee-client-11.0.0.0-237.zip` on the three Carte hosts.
- **Spoon** on a workstation that can reach the Carte hosts, for the
  Carte Cluster workshop.

## Check a host

Run this block on each host. Each line reports what it found:

```bash
ok() { printf '%-22s %s\n' "$1" "$2"; }
ok "Host name" "$(hostnamectl --static)"
ok "Ubuntu" "$(. /etc/os-release && echo "$VERSION")"
ok "Clock in step" "$(timedatectl show -p NTPSynchronized --value)"
sudo -n true 2>/dev/null && ok "sudo" "OK" || ok "sudo" "asks for your password (fine)"
ls ~/pentaho-server-ee-11.0.0.0-237.zip ~/pdi-ee-client-11.0.0.0-237.zip 2>/dev/null | sed 's/^/archive: /'
ok "Free disk in ~" "$(df -h ~ | awk 'NR==2{print $4}')"
ok "Memory" "$(free -g | awk '/Mem/{print $2}') GB"
```

> **Success:** Checkpoint: the host name is the role's name once the first workshop has set it, **Clock in step** says `yes`, and the archive that role needs is listed.

## Ask the AI assistant

The **Chat** tab in the bottom panel answers questions about Pentaho,
grounded in the official docs — ask it anything from "why sticky
sessions?" to "why won't my slave register?". It runs on a local model, so it
works even when the machine is offline.

## How this course is organized

The course opens with an **overview page** (<span data-icon="page"></span> — background reading,
no checkboxes) followed by **hands-on workshops** (<span data-icon="workshop"></span> — tracked steps).
The Pentaho cluster you build in the first workshop stands on its own;
the Carte cluster is a second, separate one, and the Tray.io workshop
drives it. The last page is reading: the same rules on Kubernetes.
