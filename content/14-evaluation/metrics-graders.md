---
id: metrics-graders
book: 14
order: "14.4"
title: Metrics and graders
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [metrics, graders, pass-at-k]
visuals:
  - passk-explorer:explorer
  - grader-ladder:diagram
  - grader-tree:tree
---
> [!tldr]
> Prefer the cheapest grader that is trustworthy: exact checks and code execution first, similarity metrics rarely, calibrated LLM judges for what needs judgment, and humans to calibrate the judges. For agents, report pass@k for capability and pass^k for reliability.

## Why it matters
The grader decides what your eval rewards. A text-overlap metric can prefer a confident wrong answer to a correct paraphrase; an uncalibrated judge can prefer longer answers; a single-attempt score can hide that an agent fails one time in three. Choosing graders well is choosing what “better” means.

## Intuition
Grading an exam: multiple-choice questions are marked by a machine, math answers by checking the number, essays by a trained marker with a rubric, and a sample of essays by a second marker to keep the first one honest.

```viz
{"id":"grader-ladder","component":"diagram","title":"Climb the ladder only as far as the output requires","caption":"From cheapest and most trustworthy at the bottom to most flexible at the top. Click a rung for the chapter that covers it.","alt":"Layered diagram of graders from human review at the top through LLM judges and similarity metrics to code execution, schema checks and exact match at the bottom.","data":"illustrative","w":560,"layer_h":44,"layers":[
{"id":"human","label":"Human review","sub":"the reference that calibrates everything else","role":"human","link":"#error-analysis"},
{"id":"judge","label":"LLM-as-judge","sub":"rubrics for what needs judgment","role":"model","link":"#llm-as-judge"},
{"id":"sim","label":"Similarity metrics","sub":"BLEU, ROUGE, embeddings: use sparingly","role":"context"},
{"id":"exec","label":"Code execution","sub":"run the tests, query the state","role":"tool"},
{"id":"schema","label":"Schema and rule checks","sub":"structure, required fields, allowed values","role":"tool","link":"#structured-outputs"},
{"id":"exact","label":"Exact match and regex","sub":"labels, numbers, ids","role":"tool"}]}
```

## How it works
**Exact and rule-based checks.** Exact match for labels and numbers (with normalization), regexes for formats, required phrases, forbidden phrases, length limits. Cheap, deterministic, and enough for more cases than people expect.

**Code execution.** For code, run the tests; for agents, query the final state of the database or file system; for SQL, compare result sets. Execution-based grading is the gold standard where it applies.

**Schema and business-rule checks.** Validate structured outputs against a schema and then against rules (dates in order, ids that exist). See [structured outputs](#structured-outputs).

**Similarity metrics.** BLEU and ROUGE count n-gram overlap with a reference; embedding similarity compares meaning. They were built for translation and summarization benchmarks, correlate weakly with quality for open-ended generation, and reward copying the reference’s wording. Use them only as a cheap signal, never alone.

**LLM-as-judge.** A model grades outputs against a rubric, pairwise or pointwise. Flexible and scalable, and biased in known ways; calibrate it against human labels before trusting it. See [LLM-as-judge](#llm-as-judge).

**Reference-free versus reference-based.** Some checks need a reference answer (correctness), others do not (faithfulness to retrieved context, format, safety). Reference-free checks can run on live traffic.

**pass@k and pass^k.** For tasks with nondeterministic success, pass@k is the chance that at least one of k attempts succeeds, a measure of capability; pass^k is the chance that all k succeed, a measure of reliability. With a per-attempt success rate p and independent attempts, pass@k = 1 − (1 − p)ᵏ and pass^k = pᵏ.

```viz
{"id":"passk-explorer","component":"explorer","model":"passk","title":"Retries make pass@k look great while pass^k shows how often users get a consistent agent","caption":"Formula view, assuming independent attempts. A 70% agent passes at least once in five tries 99.8% of the time, but succeeds on all five only 17% of the time.","alt":"Line chart of pass@k and pass^k against k for a chosen per-attempt success rate.","data":"formula","try":"Set the success rate to 90% and k to 8: is the agent reliable?"}
```

**Composite scores.** Combine several graders per case (format check, then correctness, then judge rating), and report each separately as well as any weighted total.

## In practice
```viz
{"id":"grader-tree","component":"tree","title":"The output type picks the grader","caption":"Expand the output you need to grade. Use the first grader that can do the job; add a judge only where nothing cheaper works.","alt":"Decision tree mapping output types to graders: exact match, code execution, schema checks, judges and human review.","data":"illustrative","open":1,"root":{"label":"What does the system output?","children":[
{"label":"A label, number or id","children":[{"label":"Exact match after normalization"}]},
{"label":"Code or a change to state","children":[{"label":"Execute: run tests, check the final state","link":"#evaluating-agents"}]},
{"label":"Structured data","children":[{"label":"Schema validation, then field-level checks"}]},
{"label":"Free text with a reference answer","children":[{"label":"Required facts by rule, then a judge for correctness"}]},
{"label":"Free text, no reference","children":[{"label":"A calibrated judge with a specific rubric; faithfulness to sources if grounded","link":"#llm-as-judge"}]},
{"label":"Taste, tone or brand fit","children":[{"label":"Human review on a sample, used to calibrate a judge"}]}]}}
```

```python
# Pseudocode: layered grading for one case.
def grade(case, output):
    results = {"schema": schema_ok(output)}
    if not results["schema"]:
        return results                          # stop early: nothing else is meaningful
    results["facts"] = all(f in output.answer for f in case.checks["answer_mentions"])
    results["cites"] = case.checks["must_cite"] in output.sources
    results["judge"] = judge(case.input, output.answer, rubric=RUBRIC) >= 4
    return results
```

## Numbers to know
> [!number]
> Formulas. pass@k = 1 − (1 − p)ᵏ; pass^k = pᵏ, assuming independent attempts. At p = 0.8, pass@3 ≈ 0.99 while pass^3 ≈ 0.51: the same agent looks excellent or unreliable depending on which you report.

## Pitfalls and anti-patterns
> [!pitfall] Using ROUGE or BLEU as a quality score for open-ended generation
> Overlap metrics reward wording, not truth, and penalize correct paraphrases.

- **Judges without calibration.** Agreement with humans must be measured, not assumed.
- **Reporting pass@k as reliability.** Users experience pass^k.
- **One composite number.** Report the components so you can see which one moved.

## Talk like an expert
The vocabulary: **exact match**, **execution-based grading**, **reference-based versus reference-free**, **BLEU and ROUGE**, **LLM-as-judge**, **pass@k**, **pass^k**, **composite score**. Experts ask “what’s the grader, and how well does it agree with people?” for every number. The live debate is how much judges can replace human graders; the consensus is that they extend humans, after calibration.

> [!hottake] Most teams use LLM judges where a regex would do.
> **The counterargument:** rules are brittle against the variety of real outputs, and maintaining hundreds of them can cost more than a single well-calibrated judge; the right mix depends on how varied the outputs are.

## Check yourself
```quiz
metrics-graders
```

## Go deeper
- Chen et al., “Evaluating Large Language Models Trained on Code” (2021), which introduced the unbiased pass@k estimator.
- Yao et al., “τ-bench” (2024), which introduced pass^k for agent reliability.

## Related
- [LLM-as-judge done right](#llm-as-judge)
- [Evaluating agents](#evaluating-agents)
- [Statistics for evals](#eval-statistics)
- [Structured outputs](#structured-outputs)
- [Why evals are the core skill](#why-evals)
- [Classification and regression metrics](#classification-metrics)
- [Classic NLP tasks: classification, tagging, extractive QA, summarization and translation](#nlp-tasks)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Agent eval metrics and benchmark design](#agent-eval-metrics)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Reference-based text metrics: from BLEU to COMET](#text-generation-metrics)
