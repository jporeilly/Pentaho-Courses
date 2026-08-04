# Overview of Containers

> **Note:** Draft scaffold - the step-by-step prose for this lab is
> still to be authored; the outline, commands and bundled files below
> are the working skeleton.

Containers are lightweight, standalone packages that include everything
needed to run an application - OS-level virtualization that shares the
host kernel instead of emulating hardware.

## Runtimes

Docker, containerd, CRI-O, Podman, LXC/LXD - the engines that execute
containerized applications. This course uses **Podman** throughout
(free for commercial use; the commands are Docker-compatible).

## Orchestration

Kubernetes (K8s) is the dominant orchestration platform - deployment,
scaling and healing across clusters. This course deploys to **K3s**, a
lightweight certified Kubernetes distribution, first with raw
manifests and then with **Helm**.

## Where Pentaho fits

The Pentaho Server is a Tomcat web application with a database-backed
repository - which makes it a natural fit for a container image (the
app) plus an orchestrated database (PostgreSQL) and persistent volumes
(the repository content).
