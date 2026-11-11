# Course diagrams

The Mermaid sources of this course's diagrams. Each `<name>.mmd` renders
to `../images/<name>.png`, in the style of the other courses' diagrams
(color by role: blue inputs, violet the build, teal what runs on the one
host).

Render one from this folder with Mermaid CLI 11.16.0:

```bash
npx -y @mermaid-js/mermaid-cli@11.16.0 -i con-course-path.mmd -o ../images/con-course-path.png -s 2 -b white -C diagram.css
```

`diagram.css` sets the font; without it the labels fall back to a serif
face. Mermaid sizes a node before that font applies, so the bold first
line of each node ends in a few `&nbsp;` to keep it from being clipped.
Edges join the groups, not the nodes inside them: an edge into a group's
node makes Mermaid ignore the group's `direction LR`.

Edit the `.mmd`, render, and commit both files together. The figure's
`width` is the PNG's width divided by 2, the `-s 2` scale.
