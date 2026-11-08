---
id: error-analysis
book: 14
order: "14.2"
title: Error analysis first
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [error-analysis, traces, taxonomy]
visuals:
  - error-analysis-steps:stepper
  - failure-pareto:chart
  - failure-taxonomy:tree
---
> [!tldr]
> Error analysis means reading real outputs, writing down what went wrong in your own words, grouping those notes into failure categories, and counting them. It tells you which problem to fix first and which metrics are worth building, and it is the step most teams skip.

## Why it matters
Generic metrics such as “helpfulness” or “coherence” rarely match how your product actually fails. A team that reads a hundred traces usually discovers two or three failure modes causing most complaints, often ones nobody predicted, and fixes them in days. A team that starts with a dashboard of generic scores can spend months moving numbers that users do not care about.

## Intuition
It is a doctor’s rounds, not a lab report. You look at patients one by one, note symptoms in plain language, and only then decide which tests to order. The tests (metrics) come after you know what you are looking for.

```viz
{"id":"error-analysis-steps","component":"stepper","title":"Read, note, group, count: four steps turn a pile of traces into a ranked list of fixes","caption":"The method borrows open and axial coding from qualitative research. One person who understands the product should do the first pass; do not outsource the reading.","alt":"Stepper through sampling traces, open coding, axial coding into categories, counting, and prioritizing fixes.","data":"illustrative","diagram":{"w":600,"h":64,"nodes":[{"id":"sample","label":"Sample","role":"data","x":0,"y":6,"w":100,"h":52},{"id":"open","label":"Open code","role":"human","x":125,"y":6,"w":110,"h":52},{"id":"axial","label":"Group","role":"human","x":260,"y":6,"w":100,"h":52},{"id":"count","label":"Count","x":385,"y":6,"w":95,"h":52},{"id":"fix","label":"Prioritize","role":"agent","x":500,"y":6,"w":100,"h":52}],"edges":[{"from":"sample","to":"open"},{"from":"open","to":"axial"},{"from":"axial","to":"count"},{"from":"count","to":"fix"}]},
"frames":[
{"label":"Sample","highlight":["sample"],"caption":"Pull about 100 recent traces, mixing random samples with flagged ones such as thumbs-down, escalations and long runs.","panel":"Include the full trace: input, retrieved context, tool calls and output. Final answers alone hide most causes."},
{"label":"Open coding","highlight":["open"],"caption":"Read each trace and write one free-form note on the first thing that went wrong. No predefined categories yet.","code":"#17  quoted the 2024 refund policy, not the current one\n#23  ignored ‘no weekend delivery’ from the user\n#31  date math wrong: ‘next Friday’ off by a week\n#38  fine\n#41  retrieved the right doc, then contradicted it"},
{"label":"Axial coding","highlight":["axial"],"caption":"Group the notes into categories. Merge near-duplicates, split vague ones, and name each category by its cause where you can.","code":"Retrieved outdated policy   ← #17, #52, #66 …\nIgnored a user constraint   ← #23, #47 …\nDate arithmetic error       ← #31, #58 …\nContradicted its context    ← #41 …"},
{"label":"Count","highlight":["count"],"caption":"Tally each category. The distribution is almost always lopsided: a few categories cover most failures.","code":"Retrieved outdated policy  31\nIgnored a user constraint  22\nDate arithmetic error      14\nTone too formal             9\nInvented an order id        7\nFormatting                  5\nOther                       4"},
{"label":"Prioritize","highlight":["fix"],"caption":"Rank by frequency times severity times ease of fixing. Write an eval for each top category, then fix it and watch the eval move.","panel":"Outdated policy → fix ingestion and add date metadata; eval: 40 policy questions with current answers. Date math → give the model a date tool; eval: code assertions."}]}
```

## How it works
**1. Sample traces.** Aim for about 100 to start; mix random traffic with flagged cases. Include everything the model saw and did.

**2. Open coding.** For each trace, write a short note about the first failure in your own words. Focus on the first error, because later errors often cascade from it. Mark good traces too.

**3. Axial coding.** Cluster notes into categories that suggest a fix. “Bad answer” is useless; “retrieved an outdated policy” points straight at ingestion. A model can help propose clusters, but you decide.

**4. Count and prioritize.** Tally categories, look at the shape, and weigh frequency against severity and cost to fix.

**5. Build targeted evals.** One eval per important category, with the cheapest grader that works: code assertions for format and date math, a calibrated [LLM judge](#llm-as-judge) for judgments, human review for the rest.

**6. Repeat.** After fixes, sample again. New categories appear as old ones disappear. Stop when you reach saturation: new traces stop revealing new categories.

```viz
{"id":"failure-pareto","component":"chart","type":"bar","title":"Two failure categories cause more than half of all failures","caption":"Illustrative counts from a review of 100 traces, 92 of which had a failure. The top two categories account for 53 of 92 failures (58%); fixing them first beats polishing tone.","alt":"Bar chart of failure categories sorted by count: outdated policy 31, ignored constraint 22, date math 14, tone 9, invented id 7, formatting 5, other 4.","data":"illustrative","categories":["Outdated policy","Ignored constraint","Date math","Tone","Invented id","Formatting","Other"],"y":{"label":"Traces with this failure"},"series":[{"name":"Failures","points":[[0,31],[1,22],[2,14],[3,9],[4,7],[5,5],[6,4]]}]}
```

## In practice
Make reading traces easy, or nobody will do it. A simple annotation view with the trace on the left and a notes field on the right beats any dashboard. Export notes and categories to a spreadsheet; the counting is a pivot table.

```python
# Minimal annotation loop over exported traces (illustrative).
import json, random
traces = [json.loads(l) for l in open("traces.jsonl")]
sample = random.sample(traces, 80) + [t for t in traces if t.get("thumbs") == "down"][:20]
notes = []
for t in sample:
    print(t["input"], "\n---\n", t["output"][:2000])
    notes.append({"id": t["id"], "note": input("First failure (or 'ok'): ")})
json.dump(notes, open("open_codes.json", "w"), indent=1)
```

```viz
{"id":"failure-taxonomy","component":"tree","title":"Name categories by cause, and each one points to its own fix","caption":"A taxonomy from the example review. Expand a category to see the fix and the eval that guards it.","alt":"Tree of failure categories with their causes, fixes and eval types.","data":"illustrative","open":1,"root":{"label":"Failures in 100 traces","children":[
{"label":"Retrieval (31)","children":[{"label":"Retrieved an outdated policy","note":"fix: ingestion dates and deletion; eval: 40 current-policy questions","link":"#production-rag"}]},
{"label":"Instruction following (22)","children":[{"label":"Ignored a user constraint","note":"fix: restate constraints in the prompt; eval: judge on a constraint checklist","link":"#prompting-fundamentals"}]},
{"label":"Reasoning (14)","children":[{"label":"Date arithmetic error","note":"fix: add a date tool; eval: code assertions","link":"#agent-tools"}]},
{"label":"Style (14)","children":[{"label":"Tone too formal (9)","note":"fix: examples in the prompt; eval: pairwise judge"},{"label":"Formatting (5)","note":"fix: structured outputs; eval: schema check","link":"#structured-outputs"}]},
{"label":"Hallucination (7)","children":[{"label":"Invented an order id","note":"fix: require lookup before citing ids; eval: code check against the database"}]}]}}
```

## Numbers to know
> [!number]
> Rules of thumb. Read about 100 traces for a first pass, and keep going until new traces stop producing new categories. Expect a handful of categories to cover most failures. One person-day of reading usually beats a week of building generic metrics.

## Pitfalls and anti-patterns
> [!pitfall] Starting with off-the-shelf metrics
> Generic scores for helpfulness or coherence rarely correlate with the failures your users hit. Read first, measure second.

- **Outsourcing the reading.** The person who understands the product must do the first pass; labelers can scale it later with guidelines.
- **Coding the last error instead of the first.** Downstream errors are usually symptoms.
- **Vague categories.** “Quality issue” cannot be fixed; “contradicted its retrieved context” can.
- **One and done.** Failure distributions shift after every fix and every model upgrade.

## Talk like an expert
The vocabulary: **open coding** and **axial coding** (from grounded theory in qualitative research), **failure taxonomy**, **theoretical saturation**, **trace review**, **first point of failure**. Hamel Husain and Shreya Shankar popularized this method for LLM products, and experts repeat their line that error analysis is the most important activity in evals. The live debate is how much a model can do the clustering for you: it can propose groups, but the judgment of what matters stays human.

> [!hottake] If you have not read a hundred of your own traces, you do not know what your product does.
> **The counterargument:** at very high volume, reading samples can miss rare but severe failures, so you also need automated detectors, user feedback signals and targeted searches for known risks.

## Check yourself
```quiz
error-analysis
```

## Go deeper
- Hamel Husain and Shreya Shankar’s writing and course materials on LLM evals and error analysis (search their names with “error analysis”).
- Shankar et al., “Who Validates the Validators? Aligning LLM-Assisted Evaluation of LLM Outputs with Human Preferences” (2024).

## Related
- [Why evals are the core skill](#why-evals)
- [Building eval datasets](#eval-datasets)
- [LLM-as-judge done right](#llm-as-judge)
- [Agent failure modes](#agent-failure-modes)
- [Observability and tracing](#observability-tracing)
- [Clustering and dimensionality reduction](#clustering-dimensionality-reduction)
