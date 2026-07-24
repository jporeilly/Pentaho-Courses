# Pentaho-Courses

Central distribution repo for [Pentaho Content Manager](https://github.com/jporeilly/Pentaho-Content-Manager)
courses. Workshop VMs pull their course content from here — selected
per VM at provisioning time, then kept up to date automatically on
every app launch.

## Layout

One course per top-level directory:

```text
<course-id>/
├── course.json        ← id MUST equal the directory name
├── SUMMARY.md         ← sidebar topic tree
├── glossary.json      ← optional
├── exam.json          ← optional practitioner exam
├── _assets/           ← shared images
└── <NN-lab-slug>/     ← one directory per lab
    ├── manifest.json
    └── guide.md
```

## Provisioning a VM

```powershell
# Windows — pick this VM's courses (first one starts active):
scripts\set-git-source.ps1 -Courses analyst-ba-practitioner,developer-di-practitioner
```

```bash
# Linux / macOS:
scripts/set-git-source.sh --courses analyst-ba-practitioner,developer-di-practitioner
```

(The scripts ship with the Content Manager — see its
[docs/GIT-SOURCE.md](https://github.com/jporeilly/Pentaho-Content-Manager/blob/main/docs/GIT-SOURCE.md)
for the full reference.)

After provisioning, the app re-syncs from this repo in the background
on every launch. Offline VMs keep the last-synced content.

## Publishing content

Authoring happens in the Pentaho-Content-Manager repo's `courses/`
directory (CLI scaffolder or the visual editor). To publish, copy the
updated course folder(s) here, commit, and push. VMs tracking `main`
pick the change up on next app launch.

For deterministic workshop images, tag a release (e.g. `v2026.07`) and
provision with `-Ref v2026.07` — those VMs never move until you retag.

## Courses

| Course | Role |
| --- | --- |
| analyst-ba-practitioner | Analyst |
| architect-arch-certified | Architect (certified) |
| bi-developer-ct-practitioner | BI Developer (CTools) |
| bi-developer-me-practitioner | BI Developer (Metadata Editor) |
| bi-developer-sw-practitioner | BI Developer (Schema Workbench) |
| developer-ai-speciality | Developer (AI speciality) |
| developer-di-practitioner | Developer (Data Integration) |
| developer-ml-speciality | Developer (ML speciality) |
| developer-sd-speciality | Developer (Streaming Data speciality) |
