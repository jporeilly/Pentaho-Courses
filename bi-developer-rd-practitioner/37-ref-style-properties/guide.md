# Style Properties Reference

> **Note:**
>
> #### Introduction
>
> Every style property available on the **Style** tab (lower-right
> pane), by group, from the official User Guide. For colour
> properties, values are HTML colour names (`red`, `green`) or hex
> (`#CCFF00`).

***

## Font Styles

| Property | Type | Purpose |
| --- | --- | --- |
| family | Selection | Font or font-family name. |
| font-size | Integer | Size in points (1/72"). |
| bold / italics / underline / strikethrough | Boolean | Type-face flags. |
| smooth | Selection | Text anti-aliasing. |
| embed | Boolean | Embed font information into the target document. |

## Text Styles

| Property | Type | Purpose |
| --- | --- | --- |
| h-align / v-align | Selection | Horizontal / vertical alignment within the element. |
| v-align-in-band | Selection | Fine control of inline-text alignment within a line. |
| text-wrap | Boolean | Wrap text at end of line. |
| text-color / bg-color | Selection | Foreground / background colour — the conditional-formatting targets. |
| line-height | Integer | Height of one text line (≥ font size). |
| overflow-text | String | Quote printed when text doesn't fit the element bounds. |
| trim / trim-whitespace | Boolean / Selection | Whitespace handling. |
| encoding | Boolean | Per-field target text encoding, when the output supports it. |

## Text Spacing Styles

| Property | Type | Purpose |
| --- | --- | --- |
| character / preferred-character / max-character | Integer | Minimum / preferred / maximum space between letters. |
| word | Integer | Additional spacing between words. |

## Padding Styles

`top`, `bottom`, `left`, `right` (Decimal) — padding on each edge.

## Object Styles

| Property | Type | Purpose |
| --- | --- | --- |
| fill / fill-color | Boolean / Selection | Fill the shape; alternative fill colour. |
| draw-outline / stroke | Boolean / Selection | Outline flag; pen type and width. |
| anti-alias | Boolean | Anti-aliased drawing. |
| aspect-ratio / scale | Boolean | Preserve ratio; scale content to element bounds. |

## Size & Position Styles

| Property | Type | Purpose |
| --- | --- | --- |
| x / y / width / height | Decimal | Position and preferred size (height overrides dynamic-height). |
| min-/max-height, min-/max-width | Decimal | Size constraints. |
| visible / invisible-consumes-space | Boolean | Print flag; keep space when hidden. |
| dynamic-height | Boolean | Grow with content — see the Troubleshooting note on overlapping elements. |
| x-overflow / y-overflow | Boolean | Allow content overflow right / bottom. |
| fixed-position | String | (Groups) pin the band to a fixed page position. |
| layout | String | (Bands) layout strategy for the band's children. |
| box-sizing | Selection | Border model. |

## Links Styles

| Property | Type | Purpose |
| --- | --- | --- |
| url / url-tool-tip / url-window-title | String | Destination, tooltip, target window — the hyperlink trio. |
| html-anchor | String | Link-target anchor in HTML output. |
| pdf-bookmark | String | (Bands) bookmark in PDF output. |

## Excel Styles

| Property | Type | Purpose |
| --- | --- | --- |
| sheet-name | String | Sheet title in table exports. |
| format-override / formula-override | String | Excel-specific cell format / formula instead of the content. |
| wrap-text | Boolean | Excel cell text wrapping. |

## Sparkline Styles

`low-color`, `medium-color`, `high-color` (pie), `last-color` (bar's
last value / line colour) — the sparkline palette.

## Page Behavior Styles

| Property | Type | Purpose |
| --- | --- | --- |
| display-on-first-page / display-on-last-page | Boolean | (Bands) show only on first / last page. |
| repeat-header | Boolean | (Headers/footers) repeat on every printed page. |
| page-break-before / page-break-after / avoid-page-break | Boolean | Force or cancel page breaks around the element. |
| sticky | Boolean | Import master-report page/group headers into sub-reports. |
| orphan / widows | Integer | Minimum lines at page end / start before a break may occur. |

## Border Styles

Each edge (`top`, `bottom`, `left`, `right`) has `-size` (px),
`-style` (line style), and `-color`; each corner has `-round-height` /
`-round-width` for rounded corners (e.g. `top-left-round-width`).

## Learn more

- [Pentaho Report Designer documentation](https://docs.pentaho.com/pba-report-designer)
