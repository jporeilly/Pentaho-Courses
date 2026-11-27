// HTML Parser: the three transformations lesson 03 builds, one lane per
// flow: where the rows come from, the HTML Parser steps and their
// selectors, and the CSV file each flow writes.
//
// Facts it encodes (lesson 03 and files/solution/html_*.ktr):
//   - html_xpath.ktr (part 1): gr-one-row (Generate rows, page
//     homepage.html), html-page-text (no selector: the whole text),
//     html-titles (//article/h3, article_titles), html-authors
//     (//span[@class='author'], authors), all Source File
//     ${Internal.Entry.Current.Directory}/homepage.html; sv-xpath, then
//     txt-xpath writes homepage_xpath.csv.
//   - html_css.ktr (part 2): gr-one-row (landingpage.html), html-products
//     (.product h3), html-prices (.product .price), html-about (#about p);
//     sv-css, then txt-css writes landingpage_css.csv.
//   - html_stream.ktr, part 3: gfn-pages (Get file names, .*\.html),
//     html-title (Source Stream, Format File, field filename, CSS title,
//     page_title); sv-titles, then txt-titles writes page_titles.csv.
//     Part 4: dg-emails (Data grid, three HTML e-mail bodies in html),
//     html-email-text (Stream, Format Binary Datum, field html, no
//     selector, clean_text); sv-emails, then txt-emails writes
//     emails_text.csv.
//
// Run from this folder:   node 03-html-parser-flows.svg.mjs
import { ktrLanes } from './ktr-lanes.mjs';

const out = (title, sv, file) => ({ role: 'write', iconName: 'file-output', title, lines: [`after ${sv}:`, file] });
const d = ktrLanes({
  cols: [168, 336, 192],
  groups: [
    { file: 'html_xpath.ktr', sub: 'Part 1: XPath from a file', lanes: [[
      { role: 'source', iconName: 'rows-3', title: 'gr-one-row', lines: ['Generate rows:', 'one row'] },
      { role: 'engine', iconName: 'code-xml', title: 'HTML Parser x3: homepage.html', lines: ['html-page-text: no selector, the whole text', 'html-titles: //article/h3', 'html-authors: //span[@class=\'author\']'] },
      out('txt-xpath', 'sv-xpath', 'homepage_xpath.csv'),
    ]] },
    { file: 'html_css.ktr', sub: 'Part 2: CSS from a file', lanes: [[
      { role: 'source', iconName: 'rows-3', title: 'gr-one-row', lines: ['Generate rows:', 'one row'] },
      { role: 'engine', iconName: 'code-xml', title: 'HTML Parser x3: landingpage.html', lines: ['html-products: .product h3', 'html-prices: .product .price', 'html-about: #about p'] },
      out('txt-css', 'sv-css', 'landingpage_css.csv'),
    ]] },
    { file: 'html_stream.ktr', sub: 'Part 3: paths from the stream. Part 4: HTML from a field', lanes: [[
      { role: 'source', iconName: 'folder-search', title: 'gfn-pages', lines: ['Get file names:', 'every .*\\.html'] },
      { role: 'engine', iconName: 'code-xml', title: 'html-title', lines: ['Stream, Format File: the file named in', 'filename; CSS title into page_title'] },
      out('txt-titles', 'sv-titles', 'page_titles.csv'),
    ], [
      { role: 'source', iconName: 'sheet', title: 'dg-emails', lines: ['Data grid: three', 'e-mail bodies'] },
      { role: 'engine', iconName: 'code-xml', title: 'html-email-text', lines: ['Stream, Format Binary Datum: the HTML', 'in html; the whole text into clean_text'] },
      out('txt-emails', 'sv-emails', 'emails_text.csv'),
    ]] },
  ],
});
d.write(import.meta.url);
