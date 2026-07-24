# Lab manifest schema

Each lab directory has a `manifest.json` describing the lab's
metadata. Some fields are auto-computed by the scaffold; others
are hand-authored. Re-running `npm run scaffold:developer-di-practitioner`
preserves every field NOT in the auto list — your checks, custom
overrides, and any other data you add will survive.

## Auto-fields (re-written every scaffold run)

| Field              | Type      | What |
| ------------------ | --------- | ---- |
| `title`          | string    | Display title in sidebar + breadcrumb. Derived from the source dir name with prefixes stripped (`Lab - X` → `X`). |
| `description`    | string    | One-line pitch. Currently empty by default — author one if you want it shown under the lab title. |
| `order`          | integer   | Display order across the whole course (1-based, monotonic). |
| `stepCount`      | integer   | Trackable steps in the body — H2/H3 headings + tab widgets. Drives the progress bar. |
| `estimatedMinutes` | integer | Rough wall-clock minutes. Heuristic: 8 + 2·steps + 2·ktr_count + 0.5·other_files, clamped 5-60, rounded to 5. |
| `hasVideo`       | boolean   | True when the body embeds a walkthrough video (Loom, YouTube, inline .mp4 / .webm, or a `🎥 Embed:` callout). Drives the small ▶ badge in the sidebar. |

## User fields (preserved across re-scaffolds)

### `checks` — readiness verification

Array of checks the learner can run from the bottom of the lab. Each
check is one of these shapes:

```json
{ "id": "out-csv",
  "kind": "file-exists",
  "label": "Output file created",
  "path": "C:\\Workshop\\out\\sales.csv" }

{ "id": "out-rows",
  "kind": "row-count",
  "label": "Output has at least 100 rows",
  "path": "C:\\Workshop\\out\\sales.csv",
  "min": 100 }

{ "id": "log-success",
  "kind": "file-contains",
  "label": "Spoon log shows transformation finished",
  "path": "C:\\Workshop\\logs\\last-run.log",
  "text": "Transformation Finished" }

{ "id": "config-dir",
  "kind": "dir-not-empty",
  "label": "Plugin folder has at least one driver",
  "path": "C:\\Workshop\\drivers",
  "min": 1 }
```

| Kind            | Required fields            | Notes |
| --------------- | -------------------------- | ----- |
| `file-exists` | `id`, `label`, `path` | Passes if the path exists. |
| `file-contains` | `id`, `label`, `path`, `text` | Reads file as UTF-8, passes if it contains `text` as a substring. |
| `row-count`   | `id`, `label`, `path` (`min` defaults to 1) | Counts non-empty lines. Passes if count ≥ `min`. |
| `dir-not-empty` | `id`, `label`, `path` (`min` defaults to 1) | Counts entries (files + subdirs). Passes if count ≥ `min`. |

Paths support `~/` for the user's home directory on Linux/macOS;
on Windows, use full `C:\\Path\\To\\File` with double-backslashes.

### Other fields

Any field not in the auto-list above is preserved verbatim. Useful
custom additions you might author:

- `videoUrl`: a Loom URL that the renderer could embed at the top of
  the lab (not wired yet — see Loom convention below as the
  alternative).
- `prerequisites`: a free-form note shown above the lab body.

## Loom video convention (no manifest field needed)

Drop a markdown image with a Loom URL anywhere in the lab body and
the renderer turns it into an inline embed:

```markdown
![Walkthrough](https://www.loom.com/share/abc123def456)
```

Same convention works for YouTube and Vimeo URLs.
