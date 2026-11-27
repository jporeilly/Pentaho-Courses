// LangExtract Overview: the architecture figure of 12-langextract/guide.md.
// The layout and its facts are langextract-architecture.svg.mjs's; this
// script draws it with the module's model, qwen2.5:7b (see
// 12-langextract-model.mjs), as 12-langextract-architecture.svg and
// ../images/12-langextract-architecture.png.
//
// Run from this folder:   node 12-langextract-architecture.svg.mjs
import { writeAs } from './12-langextract-model.mjs';

writeAs(import.meta.url);
await import('./langextract-architecture.svg.mjs');
