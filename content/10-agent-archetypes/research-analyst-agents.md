---
id: research-analyst-agents
book: 10
order: "10.3"
title: Research and analyst agents
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [research, data-analysis, notebooks]
visuals:
  - analyst-loop:stepper
  - analysis-compare:compare
---
> [!tldr]
> Research and analyst agents gather information, load data, write and run analysis code in a sandbox, check results, and produce charts and narratives with caveats. Code execution makes numbers checkable; the analyst’s judgment about data quality and interpretation is what still needs a human.

## Why it matters
Analysis is a huge share of knowledge work: questions about sales, churn, experiments, markets. Agents that can query data, run code and explain results compress hours of work into minutes. They also produce confident charts from flawed data, so their value depends on checks and transparency.

## Intuition
A good junior analyst writes down the question, finds the data, checks it for problems, runs the numbers, sanity-checks the result against something known, and says what the analysis cannot tell you. An analyst agent should do the same, visibly.

```viz
{"id":"analyst-loop","component":"stepper","title":"Question, data, code, check, chart, caveats: an analysis you can audit","caption":"Step through an illustrative churn question. The check step is what separates analysis from plausible numbers.","alt":"Stepper of an analyst agent: framing the question, loading data, writing code, sanity checks, charting and a narrative with caveats.","data":"illustrative","diagram":{"w":600,"h":56,"nodes":[{"id":"q","label":"Frame","role":"human","align":"center","glyph":false,"x":0,"y":0,"w":90,"h":56},{"id":"data","label":"Load\ndata","role":"data","align":"center","glyph":false,"x":102,"y":0,"w":90,"h":56},{"id":"code","label":"Code","role":"tool","align":"center","glyph":false,"x":204,"y":0,"w":90,"h":56},{"id":"check","label":"Check","role":"agent","align":"center","glyph":false,"x":306,"y":0,"w":90,"h":56},{"id":"chart","label":"Chart","role":"model","align":"center","glyph":false,"x":408,"y":0,"w":90,"h":56},{"id":"tell","label":"Caveats","role":"human","align":"center","glyph":false,"x":510,"y":0,"w":90,"h":56}],"edges":[{"from":"q","to":"data"},{"from":"data","to":"code"},{"from":"code","to":"check"},{"from":"check","to":"chart"},{"from":"chart","to":"tell"}]},
"frames":[
{"label":"Frame","highlight":["q"],"caption":"“Did churn rise after the price change in September?” becomes: monthly churn rate by plan, before and after 1 September, with the definition of churn stated."},
{"label":"Load","highlight":["data"],"caption":"Query subscriptions from the warehouse through a read-only tool; record row counts and date ranges."},
{"label":"Code","highlight":["code"],"caption":"Write and run pandas code in a sandbox to compute monthly churn by plan.","code":"churn = (subs.groupby(['month', 'plan'])\n            .apply(lambda g: g.cancelled.sum() / g.active_start.sum()))"},
{"label":"Check","highlight":["check"],"caption":"Sanity checks: totals match the finance dashboard within 1%; October has a data gap for one region, so it is flagged."},
{"label":"Chart","highlight":["chart"],"caption":"A line chart of churn by plan with the price change marked."},
{"label":"Caveats","highlight":["tell"],"caption":"Narrative: churn rose on the basic plan from 3.1% to 4.0%; the timing fits the price change but does not prove it; October data is incomplete for one region."}]}
```

## How it works
**Data access.** Read-only connections to warehouses, spreadsheets and APIs, with schema descriptions and a semantic layer for business definitions. See [structured data retrieval](#structured-code-retrieval).

**Code execution.** The agent writes Python or SQL and runs it in a sandbox, iterating on errors. Numbers come from execution, not from the model’s arithmetic. See [sandboxes](#sandboxes).

**Checks.** Reconcile totals with trusted sources, inspect missing values and date ranges, test edge cases, and compare with known benchmarks. Have the agent report what it checked.

**Charts and narrative.** Generate charts from the computed data, and narratives that separate findings from interpretation and state limitations. See [grounding](#grounding-citations).

**Research mode.** For questions that need outside sources, combine with [deep research](#deep-research) patterns: search, evidence notes, citations.

## In practice
```viz
{"id":"analysis-compare","component":"compare","title":"An answer with numbers versus an analysis you can check","caption":"Two responses to the same churn question. Hover the marks.","alt":"Comparison of an unsupported numeric answer and an analysis with code, checks and caveats.","data":"illustrative","mono":false,"a":{"title":"Plausible answer","text":"Churn increased significantly after the September price change, rising about 30% on the basic plan, which suggests customers were sensitive to the new pricing.","mono":false},"b":{"title":"Checkable analysis","text":"Basic-plan monthly churn: 3.1% (Jun–Aug average) → 4.0% (Sep–Oct), from 18,420 subscriptions. Totals reconcile with the finance dashboard within 1%. October lacks data for the EU region. The rise coincides with the price change; this analysis cannot rule out other causes, such as the August app release. Code and query attached.","mono":false},"links":[{"a":"rising about 30%","b":"3.1% (Jun–Aug average) → 4.0% (Sep–Oct), from 18,420 subscriptions","note":"Exact figures with their base make the claim checkable."},{"b":"Totals reconcile with the finance dashboard within 1%.","note":"A sanity check against a trusted source."},{"a":"which suggests customers were sensitive to the new pricing.","b":"this analysis cannot rule out other causes","note":"Correlation stated as correlation."},{"b":"Code and query attached.","note":"Reproducibility lets anyone rerun it."}]}
```

Design rules:
- Read-only data access with row and cost limits.
- All numbers from executed code, with the code and queries attached.
- Mandatory sanity checks, reported in the answer.
- Explicit definitions of metrics, ideally from a semantic layer.
- Narratives that separate what the data shows from what it might mean.

## Numbers to know
> [!number]
> Rules of thumb. Reconciling against one trusted total catches many data errors. Small samples produce noisy rates; report the base count with every percentage.

## Pitfalls and anti-patterns
> [!pitfall] Numbers from the model’s head
> Language models make arithmetic and aggregation errors. Every reported number should come from executed code.

- **No data-quality checks.** Gaps and duplicates produce confident nonsense.
- **Causal language for correlations.** Say what the analysis can and cannot show.
- **Write access to production data.** Analysis needs read-only roles.

## Talk like an expert
The vocabulary: **code interpreter**, **sandboxed execution**, **semantic layer**, **reconciliation**, **sanity check**, **reproducible analysis**, **caveat**. Experts ask “what did you check?” and “can I rerun it?”. The live debate is how much analysts’ work shifts from producing analyses to reviewing and framing them.

> [!hottake] An analyst agent that does not attach its code should not be trusted with a number.
> **The counterargument:** many business users cannot read code; clear statements of method, checks and sources may serve them better, with code available for those who can audit it.

## Check yourself
```quiz
research-analyst-agents
```

## Go deeper
- Your data platform’s documentation on AI analysts and semantic layers.
- This Bible’s [deep research](#deep-research) chapter for source-based research.

## Related
- [Deep research systems](#deep-research)
- [Structured data and code retrieval](#structured-code-retrieval)
- [Sandboxes and execution environments](#sandboxes)
- [Grounding and citations](#grounding-citations)
- [Statistics for evals](#eval-statistics)
