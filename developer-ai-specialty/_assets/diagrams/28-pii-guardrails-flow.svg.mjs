// Guard Personal Data: the transformation lesson 28 builds, pii_guardrails.ktr,
// down its main line, with what each step reads, adds or writes.
//
// Facts it encodes (lesson 28 and files/solution/pii_guardrails.ktr):
//   - Main line: csvi-messages (CSV file input, support_messages.csv, 18
//     messages), js-mask-regex (Modified JavaScript value: emails, card
//     numbers that pass the Luhn check, account numbers, phones, postcodes;
//     masked_regex and pii_map_regex), ner-pii (NER Extractor with the
//     RegexNER rule file pii_ids.tab: ORDER_ID, ACCOUNT_ID; ner_json),
//     js-placeholders ([PERSON_1] ... ; masked_text, pii_map, prompt and the
//     counts; copies to sv-audit and txt-audit, audit.csv), flt-residual
//     (Filter rows, masked_text REGEXP an email-like or phone-shaped
//     pattern; TRUE to internal/quarantine.csv), const-instruction
//     (run_instruction; copies to masked_messages.csv), ai-summarize (AI
//     Chat, message prompt, result llm_json), json-summary (summary, intent,
//     flagged_injection), js-validate (summary_ok, check_note; summaries.csv),
//     js-reidentify (summary_internal; internal/summaries_internal.csv).
//   - The model reads only prompt and run_instruction; pii_map stays in the
//     row inside Pentaho Data Integration and is never written.
//   - Ollama ${MODEL_NAME} llama3.2:3b on ${OLLAMA_URL}.
//
// Run from this folder:   node 28-pii-guardrails-flow.svg.mjs
import { ktrFlow } from './ktr-flow.mjs';

const { d } = ktrFlow({
  file: 'pii_guardrails.ktr',
  steps: [
    { role: 'source', iconName: 'file-input', title: 'csvi-messages', lines: ['CSV file input: 18 support', 'messages, UTF-8'] },
    { role: 'engine', iconName: 'braces', title: 'js-mask-regex', lines: ['Modified JavaScript value:', 'regular expressions + Luhn'] },
    { role: 'engine', iconName: 'scan-text', title: 'ner-pii', lines: ['NER Extractor: CoreNLP', 'and a RegexNER rule file'] },
    { role: 'engine', iconName: 'braces', title: 'js-placeholders', lines: ['Modified JavaScript value:', 'entities become placeholders'] },
    { role: 'check', iconName: 'split', title: 'flt-residual', lines: ['Filter rows: masked_text still', 'holds an email or a phone?'] },
    { role: 'engine', iconName: 'scroll-text', title: 'const-instruction', lines: ['Add constants: run_instruction,', 'the message is data'] },
    { role: 'engine', iconName: 'messages-square', title: 'ai-summarize', lines: ['AI Chat: message prompt,', 'result llm_json'] },
    { role: 'engine', iconName: 'file-json', title: 'json-summary', lines: ['JSON input: summary, intent,', 'flagged_injection'] },
    { role: 'check', iconName: 'list-checks', title: 'js-validate', lines: ['Modified JavaScript value:', 'summary_ok and check_note'] },
    { role: 'engine', iconName: 'braces', title: 'js-reidentify', lines: ['Modified JavaScript value:', 'real values back, from pii_map'] },
  ],
  side: [
    { at: 0, link: 'in', role: 'source', iconName: 'file-text', title: 'support_messages.csv', lines: ['names, emails, phones, cards, account', 'and order ids, postcodes, or none'] },
    { at: 1, link: 'sets', role: 'result', iconName: 'list-plus', title: 'masked_regex, pii_map_regex', lines: ['[EMAIL_1], [PHONE_1], [CARD_1] ...', 'and placeholder -> value, as JSON'] },
    { at: 2, link: 'in', role: 'source', iconName: 'file-text', title: 'pii_ids.tab', lines: ['RegexNER rules, TAB-separated:', 'ORDER_ID, ACCOUNT_ID'] },
    { at: 3, link: 'out', role: 'write', iconName: 'file-output', title: 'audit.csv', lines: ['sv-audit, txt-audit: counts of what', 'was masked per message, no values'] },
    { at: 4, link: 'out', role: 'reject', iconName: 'file-output', title: 'TRUE: internal/quarantine.csv', lines: ['sv-quarantine, txt-quarantine:', 'for a person, never for the model'] },
    { at: 5, link: 'out', role: 'write', iconName: 'file-output', title: 'masked_messages.csv', lines: ['sv-masked, txt-masked: the text', 'the model is allowed to read'] },
    { at: 6, link: 'call', role: 'model', iconName: 'brain', title: 'Ollama: ${MODEL_NAME}, llama3.2:3b', lines: ['sees prompt and run_instruction only,', 'never pii_map'] },
    { at: 8, link: 'out', role: 'write', iconName: 'file-output', title: 'summaries.csv', lines: ['sv-summaries, txt-summaries: intent,', 'summary, summary_ok, check_note'] },
    { at: 9, link: 'out', role: 'reject', iconName: 'file-output', title: 'internal/summaries_internal.csv', lines: ['sv-internal, txt-internal: the trusted', 'zone only; pii_map is never written'] },
  ],
});

d.write(import.meta.url);
