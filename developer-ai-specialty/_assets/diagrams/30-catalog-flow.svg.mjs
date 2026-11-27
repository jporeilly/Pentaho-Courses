// Catalog Duplicates and Enrichment: the three transformations lesson 30
// builds, one lane each: where the rows come from, the step that does the
// work, and what the flow writes.
//
// Facts it encodes (lesson 30 and files/solution/*.ktr):
//   - index_catalog.ktr: csvi-catalog (catalog.csv, 40 products),
//     js-embed-text (embed_text = title | brand | category | description),
//     emb-catalog (Text to Vector, nomic-embed-text, 768, Embedding ID field
//     product_id, metadata product_id and title), vw-catalog (Vector
//     Writer, PGVector, catalog_items, Upsert), txt-load-log
//     (catalog_load_log.csv).
//   - find_duplicates.ktr: csvi-catalog, js-embed-text, emb-catalog,
//     vs-similar (Vector Search, catalog_items, Max results ${TOP_K} 3, Min
//     score ${MIN_SCORE} 0.9, One row per match, match_product_id and
//     match_title), js-pair (drops the self-match, orders the pair, keeps
//     match_score >= ${DUP_THRESHOLD} 0.93), flt-pairs, srt-pairs (Sort
//     rows, unique on product_a, product_b), ai-same (AI Chat: same
//     product?), json-same (same_product, reason; error hop to
//     bad_pair_answers.csv), txt-pairs (duplicate_candidates.csv).
//   - enrich_descriptions.ktr: csvi-catalog, js-quality (quality_issue:
//     empty, too short, all caps), flt-weak (quality_issue IS NOT NULL),
//     js-prompt (title, brand, category, price only), ai-describe (AI
//     Chat), json-describe (new_description, basis; error hop to
//     bad_answers.csv), js-check-facts (unsupported_numbers), txt-enriched
//     (enriched_descriptions.csv).
//
// Run from this folder:   node 30-catalog-flow.svg.mjs
import { ktrLanes } from './ktr-lanes.mjs';

const d = ktrLanes({
  cols: [200, 264, 232],
  groups: [
    { file: 'index_catalog.ktr', sub: 'Run first: one vector per product', lanes: [[
      { role: 'source', iconName: 'file-input', title: 'csvi-catalog', lines: ['catalog.csv, 40 products;', 'js-embed-text adds', 'embed_text'] },
      { role: 'model', iconName: 'binary', title: 'emb-catalog', lines: ['Text to Vector with', 'nomic-embed-text (768);', 'vw-catalog upserts by ID'] },
      { role: 'store', iconName: 'database', title: 'catalog_items', lines: ['in pgvector, localhost:5433;', 'catalog_load_log.csv'] },
    ]] },
    { file: 'find_duplicates.ktr', sub: 'Near-duplicates: search, pair, check', lanes: [[
      { role: 'check', iconName: 'text-search', title: 'vs-similar', lines: ['Vector Search: the', '${TOP_K} (3) closest,', 'one row per match'] },
      { role: 'engine', iconName: 'messages-square', title: 'ai-same', lines: ['one row per pair at or', 'above ${DUP_THRESHOLD} (0.93);', 'AI Chat: same product?'] },
      { role: 'write', iconName: 'file-output', title: 'txt-pairs', lines: ['duplicate_candidates.csv:', 'pair, score, same_product'] },
    ]] },
    { file: 'enrich_descriptions.ktr', sub: 'Weak descriptions: rule, rewrite, check', lanes: [[
      { role: 'check', iconName: 'split', title: 'flt-weak', lines: ['js-quality: empty, too', 'short or all caps;', 'only those pass'] },
      { role: 'engine', iconName: 'messages-square', title: 'ai-describe', lines: ['AI Chat from title, brand,', 'category and price only;', 'js-check-facts after'] },
      { role: 'write', iconName: 'file-output', title: 'txt-enriched', lines: ['enriched_descriptions.csv;', 'unreadable answers to', 'bad_answers.csv'] },
    ]] },
  ],
});
d.write(import.meta.url);
