---
id: eval-datasets
book: 14
order: "14.3"
title: Building eval datasets
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [datasets, golden-set, synthetic]
visuals:
  - dataset-sources:diagram
  - dataset-coverage:heatmap
---
> [!tldr]
> A good eval set is representative, covers the slices that matter, includes hard and adversarial cases, and stays clean of training and prompt contamination. Build it from production samples, expert-written cases, filtered synthetic data and every incident, and version it like code.

## Why it matters
An eval is only as good as its cases. A set made of easy, similar examples will report success while users struggle; a set the model or prompt was tuned on will report success that does not generalize. Dataset work is unglamorous, and it decides whether every number your team quotes means anything.

## Intuition
An eval set is a sample survey of your users’ needs. A survey of only your friends, or only people who already like the product, tells you nothing about everyone else.

```viz
{"id":"dataset-sources","component":"diagram","title":"Six sources feed a good eval set, and each covers what the others miss","caption":"Click a source for the chapter behind it. Production samples keep the set realistic; experts, synthetic data and red teams fill the gaps.","alt":"Diagram of six sources flowing into an eval set: production samples, user feedback, expert-written cases, filtered synthetic data, adversarial cases and incidents.","data":"illustrative","w":600,"h":240,"nodes":[
{"id":"prod","label":"Production samples","sub":"real inputs, stratified","role":"external","x":0,"y":0,"w":170,"h":52,"link":"#online-evaluation"},
{"id":"fb","label":"User feedback","sub":"thumbs-down, edits","role":"human","x":0,"y":94,"w":170,"h":52},
{"id":"exp","label":"Expert-written","sub":"edge cases, policy","role":"human","x":0,"y":188,"w":170,"h":52},
{"id":"set","label":"Eval set","sub":"versioned, sliced","role":"data","x":215,"y":94,"w":170,"h":52},
{"id":"syn","label":"Synthetic","sub":"generated, then filtered","role":"model","x":430,"y":0,"w":170,"h":52},
{"id":"adv","label":"Adversarial","sub":"red-team cases","role":"untrusted","x":430,"y":94,"w":170,"h":52,"link":"#red-teaming"},
{"id":"inc","label":"Incidents","sub":"every production failure","role":"untrusted","x":430,"y":188,"w":170,"h":52,"link":"#incidents-on-call"}],
"edges":[{"from":"prod","to":"set"},{"from":"fb","to":"set"},{"from":"exp","to":"set"},{"from":"syn","to":"set"},{"from":"adv","to":"set"},{"from":"inc","to":"set"}]}
```

## How it works
**Golden sets.** A curated set of inputs with expected outputs or checks, reviewed by people who know the domain. It is the reference you report against.

**Sampling production.** Sample real inputs, stratified so rare but important types are represented, and remove personal data. See [privacy](#privacy).

**Synthetic data.** Have a model generate inputs from your documents, personas or a taxonomy of tasks. It fills coverage gaps fast; it also skews toward fluent, document-like phrasing, so filter it, review a sample by hand, and mix it with real inputs.

**Adversarial and edge cases.** Write cases designed to break the system: ambiguous questions, out-of-scope requests, injection attempts, extreme lengths, wrong languages. See [red teaming](#red-teaming).

**Coverage.** Tag each case with its slice (task type, difficulty, language, customer tier) and check that every important slice has enough cases. Gaps are where regressions hide:

```viz
{"id":"dataset-coverage","component":"heatmap","title":"A coverage grid shows at a glance that hard multi-hop and out-of-scope cases are missing","caption":"Illustrative case counts by question type and difficulty for a 68-case eval set. Empty cells are slices where a regression would go unnoticed.","alt":"Heatmap of eval case counts by question type and difficulty, with zero cases for hard multi-hop, medium and hard out-of-scope, and most adversarial cells.","data":"illustrative","rows":["Lookups","Multi-hop","Policy edge cases","Out of scope","Adversarial"],"cols":["Easy","Medium","Hard"],"values":[[24,12,3],[6,4,0],[8,5,2],[3,0,0],[0,1,0]]}
```

**Contamination.** Cases that leak into training data, few-shot examples or prompt-tuning loops stop measuring generalization. Keep a held-out set you never tune on, and watch for public benchmark items in training corpora. See [benchmark literacy](#benchmark-literacy).

**Versioning.** Store cases in files under version control, with ids, tags, sources and dates. Record which eval version produced each score.

## In practice
A minimal case format:

```json
{"id": "refund-017",
 "input": "Can I get a refund after 45 days on an annual plan?",
 "checks": {"answer_mentions": ["30 days"], "must_cite": "refund-policy", "no_promise_of_refund": true},
 "tags": ["policy", "edge-case", "billing"],
 "difficulty": "medium",
 "source": "production-2026-10, anonymized",
 "added": "2026-10-21"}
```

Build order:
1. Sample 100 production inputs, anonymize them, and label them.
2. Read failures and add cases for each failure mode.
3. Tag slices and fill empty cells with expert-written or filtered synthetic cases.
4. Add adversarial cases for every risk you care about.
5. Add a case for every incident, the day it happens.

## Numbers to know
> [!number]
> Rules of thumb. Aim for at least 20 to 30 cases per slice you want to track; fewer gives intervals too wide to act on. Review at least a sample of synthetic cases by hand before using them. Keep 20% or more of cases as a held-out set for reporting.

## Pitfalls and anti-patterns
> [!pitfall] An eval set made of easy cases
> If nearly everything passes, the set cannot detect regressions. A healthy eval set has cases the current system fails.

- **Only synthetic data.** It flatters systems built on the same documents.
- **Tuning on the reporting set.** The score stops meaning anything.
- **Unversioned sets.** Scores from different versions get compared as if they were the same.
- **Personal data in eval files.** Anonymize before storing.

## Talk like an expert
The vocabulary: **golden set**, **slice**, **stratified sampling**, **synthetic data**, **adversarial cases**, **contamination**, **held-out set**, **dataset versioning**. Experts ask “how many cases in this slice?” and “where did these come from?” before trusting a number. The live debate is how far synthetic generation can replace human-written cases; most teams use it to extend real data, not to replace it.

> [!hottake] The hardest 10% of your eval set is worth more than the other 90%.
> **The counterargument:** an eval made only of hard cases distorts priorities and hides regressions on the common cases that most users hit; the set should mirror real traffic, with hard cases over-sampled, not exclusive.

## Check yourself
```quiz
eval-datasets
```

## Go deeper
- Hamel Husain and Shreya Shankar’s guidance on building eval datasets from traces.
- This Bible’s [benchmark literacy](#benchmark-literacy) chapter on contamination.

## Related
- [Why evals are the core skill](#why-evals)
- [Error analysis first](#error-analysis)
- [Statistics for evals](#eval-statistics)
- [Red teaming](#red-teaming)
- [Privacy](#privacy)
