---
id: privacy
book: 17
order: "17.6"
title: Privacy
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [privacy, pii, differential-privacy]
visuals:
  - pii-pipeline:stepper
  - data-paths:diagram
  - log-compare:compare
---
> [!tldr]
> Personal data flows through more places in an AI system than teams expect: prompts, provider APIs, logs, traces, vector indexes, memory, eval sets and fine-tuning data. Minimize what enters, redact what you keep, control retention and residency, and remember that models themselves can memorize and leak training data.

## Why it matters
A single support conversation can leave copies of a customer’s address in the provider’s logs, your traces, your vector index, the agent’s memory and next month’s eval set. Each copy is a liability under privacy law and a target for attackers. Users also share far more with AI assistants than with forms, so the stakes of mishandling are higher.

## Intuition
Treat personal data like cash in a shop. Take only what you need, keep it in as few drawers as possible, write down where every note went, and empty the drawers on schedule.

```viz
{"id":"pii-pipeline","component":"stepper","title":"Detect, redact, call the model, restore for the user, and store only the redacted version","caption":"Step through one request. The model and the logs see placeholders; only the user sees real values again. Illustrative.","alt":"Stepper of a privacy pipeline: detecting personal data, replacing it with placeholders, calling the model, restoring values for the user, and storing redacted logs with retention.","data":"illustrative","frames":[
{"label":"Input","caption":"A user writes to the support assistant with personal details.","code":"Hi, I'm Ana Costa, card ending 4417, at Rua das Flores 12, Lisboa.\nWhy was I charged twice?"},
{"label":"Detect","caption":"A detector (rules plus a named-entity model) finds names, addresses, card fragments, emails and phone numbers.","code":"PERSON: Ana Costa   CARD_LAST4: 4417   ADDRESS: Rua das Flores 12, Lisboa"},
{"label":"Redact","caption":"Each value is replaced with a placeholder, and the mapping is kept in a short-lived store the model never sees.","code":"Hi, I'm <PERSON_1>, card ending <CARD_1>, at <ADDRESS_1>.\nWhy was I charged twice?"},
{"label":"Call","caption":"The model answers using placeholders; tools that need real values receive them from the mapping, not from the model."},
{"label":"Restore","caption":"Placeholders in the reply are swapped back for the user, who sees their own details."},
{"label":"Store","caption":"Logs, traces and eval samples keep only the redacted text. The mapping expires with the session; retention rules delete the rest on schedule."}]}
```

## How it works
**Where data goes.** Map every place personal data can land, and the control on each:

```viz
{"id":"data-paths","component":"diagram","title":"Seven places personal data lands, each needing its own control","caption":"Click a store for the chapter that covers it. Every arrow is a copy; fewer arrows is better privacy.","alt":"Diagram of personal data flowing from a user request to the provider API, logs and traces, the vector index, agent memory, eval sets and fine-tuning data.","data":"illustrative","w":600,"h":260,"nodes":[
{"id":"user","label":"User request","role":"human","x":215,"y":0,"w":170,"h":50},
{"id":"api","label":"Provider API","sub":"retention, training use","role":"model","x":0,"y":104,"w":170,"h":52,"link":"#model-apis"},
{"id":"logs","label":"Logs and traces","sub":"redact, retain briefly","role":"data","x":215,"y":104,"w":170,"h":52,"link":"#observability-tracing"},
{"id":"idx","label":"Vector index","sub":"ACLs, deletion","role":"data","x":430,"y":104,"w":170,"h":52,"link":"#production-rag"},
{"id":"mem","label":"Agent memory","sub":"consent, view, delete","role":"data","x":0,"y":208,"w":170,"h":52,"link":"#agent-memory"},
{"id":"evals","label":"Eval sets","sub":"anonymize first","role":"data","x":215,"y":208,"w":170,"h":52,"link":"#eval-datasets"},
{"id":"ft","label":"Fine-tuning data","sub":"memorization risk","role":"model","x":430,"y":208,"w":170,"h":52,"link":"#fine-tuning-practice"}],
"edges":[{"from":"user","to":"api"},{"from":"user","to":"logs"},{"from":"user","to":"idx"},{"from":"logs","to":"mem","style":"dashed"},{"from":"logs","to":"evals","style":"dashed"},{"from":"logs","to":"ft","style":"dashed"}]}
```

**Provider terms.** Check whether a provider retains prompts, for how long, whether they are used for training, and where they are processed. Many offer business terms without training use, regional processing and, for eligible customers, zero-data-retention arrangements. Record what you chose.

**PII detection and redaction.** Combine rules (card numbers, emails, phone formats) with named-entity models; open-source tools such as Microsoft Presidio help. Redaction is imperfect: measure recall on your own data and assume some leakage.

**Memorization and extraction.** Models can memorize rare strings from training data and reproduce them; Carlini et al. (2021) extracted verbatim training data from GPT-2, and later work scaled such attacks to production models. Never fine-tune on raw personal data without deduplication, redaction and a reason. Differential privacy (DP-SGD, Abadi et al., 2016) gives formal guarantees at a cost in quality.

**Memory and personalization.** Persistent memory needs consent, visibility and deletion: users should see what the system remembers about them and be able to remove it. See [memory](#agent-memory).

**Laws and rights.** Regulations such as the EU’s GDPR and California’s CCPA give people rights to access, correct and delete their data and limit how it may be processed and transferred. Deletion requests must reach every copy, including indexes, memory and eval sets. See [governance](#governance-regulation).

## In practice
```viz
{"id":"log-compare","component":"compare","title":"A raw trace stores everything the user typed; a redacted one keeps what debugging needs","caption":"The same trace record, raw and redacted. Hover the marks.","alt":"Comparison of a raw trace record containing personal data and a redacted version with placeholders and hashed identifiers.","data":"illustrative","a":{"title":"Raw trace","text":"user_email: ana.costa@example.com\ninput: Hi, I'm Ana Costa, card ending\n  4417, at Rua das Flores 12, Lisboa.\ntool: lookup_customer(email=\n  'ana.costa@example.com')\nretention: forever"},"b":{"title":"Redacted trace","text":"user_id_hash: 7f3a…\ninput: Hi, I'm <PERSON_1>, card ending\n  <CARD_1>, at <ADDRESS_1>.\ntool: lookup_customer(email=<EMAIL_1>)\nretention: 30 days\npii_detected: [PERSON, CARD_LAST4, ADDRESS]"},"links":[{"a":"user_email: ana.costa@example.com","b":"user_id_hash: 7f3a…","note":"A stable hash still lets you group a user’s traces for debugging."},{"a":"Hi, I'm Ana Costa, card ending\n  4417, at Rua das Flores 12, Lisboa.","b":"Hi, I'm <PERSON_1>, card ending\n  <CARD_1>, at <ADDRESS_1>.","note":"Placeholders keep the structure that debugging needs."},{"a":"retention: forever","b":"retention: 30 days","note":"Short retention limits the damage of any breach."}]}
```

A privacy checklist for an AI feature:
- A data map: every store that may hold personal data, with an owner.
- Provider terms recorded: retention, training use, region.
- Redaction before logs, traces, eval sets and fine-tuning data.
- Retention limits and deletion that reaches every copy.
- Consent, visibility and deletion for memory.
- Tests: deletion requests verified end to end; leakage probes in [safety evals](#safety-evals).

## Numbers to know
> [!number]
> Rules of thumb. Assume PII detectors miss some fraction of personal data and design retention accordingly. Short retention for raw traces, measured in days or weeks, cuts exposure more than any single redaction step.

## Pitfalls and anti-patterns
> [!pitfall] Production conversations copied straight into eval sets
> Eval files get shared, committed and pasted into prompts. Anonymize before they become test data.

- **Forgetting traces.** Observability tools often store full prompts by default.
- **Deletion that stops at the database.** Indexes, caches, memory and eval sets keep copies.
- **Fine-tuning on raw transcripts.** Rare strings can be memorized and reproduced.

## Talk like an expert
The vocabulary: **data map**, **data minimization**, **PII detection**, **pseudonymization**, **retention**, **data residency**, **zero data retention**, **memorization**, **training data extraction**, **differential privacy**. Experts ask “where does this field end up, and when is it deleted?” for every piece of personal data. The live debate is how far privacy-preserving techniques can go without hurting quality, and how regulators will treat data inside model weights.

> [!hottake] Your observability stack is your biggest privacy risk, not your model provider.
> **The counterargument:** provider terms, regions and subprocessors determine where data goes outside your control; logs are risky but at least they are yours to fix.

## Check yourself
```quiz
privacy
```

## Go deeper
- Carlini et al., “Extracting Training Data from Large Language Models” (2021).
- Abadi et al., “Deep Learning with Differential Privacy” (2016).
- Microsoft Presidio documentation for PII detection and anonymization.

## Related
- [Threat modeling](#threat-modeling)
- [Memory](#agent-memory)
- [Production RAG](#production-rag)
- [Observability and tracing](#observability-tracing)
- [Governance and regulation](#governance-regulation)
