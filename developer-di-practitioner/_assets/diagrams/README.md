# Course diagrams

The Mermaid sources of the generated "What you build" diagrams in this
course. Each `<name>.mmd` renders to `../images/<name>.png`, in the same
style as the capstone diagrams (color by role: blue reads, violet
transforms, teal joins, green writes, amber checks, red rejects).

Render one from this folder with Mermaid CLI 11.16.0:

```bash
npx -y @mermaid-js/mermaid-cli@11.16.0 -i xml-join-orders.mmd -o ../images/xml-join-orders.png -s 2 -b white -C diagram.css
```

`diagram.css` sets the font; without it the labels fall back to a serif
face. Edit the `.mmd`, render, and commit both files together.

`merge-append.mmd` and `merge-sorted.mmd` (Review Merge) draw small row
tables inside their nodes. Mermaid sizes a node before `diagram.css`
applies and drops an inline `background`, so each cell's padding and
borders are inline in the `.mmd`, and the row colours come from
`diagram.css` (`table.rows tr.a` blue for the first input, `tr.b` amber
for the second).
