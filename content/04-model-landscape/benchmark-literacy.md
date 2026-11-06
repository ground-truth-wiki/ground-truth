---
id: benchmark-literacy
book: 4
order: "4.5"
title: Benchmark literacy
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [benchmarks, evals, contamination]
visuals:
  - saturation-chart:chart
  - benchmark-questions:tree
---
> [!tldr]
> Benchmark scores are measurements with conditions attached: the harness, prompts, attempts, contamination and saturation all change what a number means. Read every score with its setup, prefer benchmarks that are hard, fresh and close to your use case, and trust your own evals for decisions.

## Why it matters
Model launches lead with benchmark tables, and teams choose models from them. Many popular benchmarks are saturated, contaminated or measured differently by each lab, so the headline comparison can mislead. Literacy here saves bad model choices and wasted migrations.

## Intuition
A benchmark is a standardized exam. Once every top student scores 98%, it stops telling them apart; once the questions leak, it stops measuring learning at all.

```viz
{"id":"saturation-chart","component":"chart","type":"line","title":"Benchmarks go from hard to saturated in a few years, so the frontier keeps moving to new ones","caption":"Illustrative curves with the shape seen across popular benchmarks: top scores approach the ceiling within a few years of release; not real data.","alt":"Illustrative line chart of top scores on three benchmarks rising toward a ceiling over the years after release.","data":"illustrative","x":{"label":"Years since benchmark release"},"y":{"label":"Best reported score","unit":"pct","min":0,"max":1},"series":[{"name":"Knowledge benchmark","points":[[0,0.44],[1,0.7],[2,0.86],[3,0.9],[4,0.92]]},{"name":"Math word problems","points":[[0,0.35],[1,0.58],[2,0.92],[3,0.96],[4,0.97]]},{"name":"Agentic coding","points":[[0,0.04],[1,0.33],[2,0.65],[3,0.8]]}],"bands":[{"y":0.9,"label":"Near saturation"}]}
```

## How it works
**Families of benchmarks.** Knowledge and reasoning (MMLU, MMLU-Pro, GPQA, Humanity’s Last Exam), math (GSM8K, MATH, AIME, FrontierMath), coding (HumanEval, SWE-bench Verified and Pro, LiveCodeBench, Terminal-Bench), agents and computer use (τ-bench, OSWorld, WebArena, BrowseComp, GAIA), long context (RULER), multimodal (MMMU), and preference arenas (LMArena).

**Saturation.** When top models cluster near the ceiling, differences are noise and the benchmark no longer separates them.

**Contamination.** Test items in training data inflate scores; dynamic benchmarks (LiveCodeBench, new competition problems) and held-out sets resist it. See [pretraining data](#pretraining-data).

**Setup matters.** Prompt templates, number of attempts (pass@1 versus best of many), tools, harness, budget and grader all move scores. See [eval harnesses](#eval-harnesses).

**Arenas.** Crowd preference rankings capture style and helpfulness as perceived by users, and can be influenced by verbosity and formatting; they complement, not replace, task benchmarks.

```viz
{"id":"benchmark-questions","component":"tree","title":"Six questions to ask before trusting a benchmark number","caption":"Expand each. If the answer is unknown, discount the number.","alt":"Tree of questions to ask about a benchmark score: what it measures, saturation, contamination, setup, statistics and relevance.","data":"illustrative","open":1,"root":{"label":"Before trusting a score, ask:","children":[
{"label":"What exactly does it measure?","children":[{"label":"Task type, format and difficulty; read sample items"}]},
{"label":"Is it saturated?","children":[{"label":"If top models are within a few points of each other near the ceiling, the gap is noise"}]},
{"label":"Could it be contaminated?","children":[{"label":"Public static test sets leak; prefer fresh or held-out ones"}]},
{"label":"What was the setup?","children":[{"label":"Harness, prompts, attempts, tools, budget, grader","link":"#eval-harnesses"}]},
{"label":"How uncertain is it?","children":[{"label":"Number of items and confidence intervals","link":"#eval-statistics"}]},
{"label":"Does it match my use?","children":[{"label":"If not, run your own evals","link":"#why-evals"}]}]}}
```

## In practice
- Compare models on the same benchmark, harness and settings, ideally from one independent source.
- Weight recent, hard, contamination-resistant benchmarks close to your tasks.
- Use public benchmarks to shortlist; decide with your own eval set.

## Numbers to know
> [!number]
> Rules of thumb. Benchmarks with a few hundred items have confidence intervals of several points; differences smaller than that are noise. Popular benchmarks often saturate within two to four years.

## Pitfalls and anti-patterns
> [!pitfall] Comparing numbers from different setups
> A score with best-of-many attempts and tools is not comparable with a single-attempt score without them.

- **Choosing by arena rank alone.** Style preferences are not task accuracy.
- **Ignoring saturation.** A one-point lead near 95% means little.

## Talk like an expert
The vocabulary: **saturation**, **contamination**, **held-out set**, **pass@1**, **harness**, **arena Elo**, **dynamic benchmark**, **confidence interval**. Experts ask “under what setup?” before reading any table. The live debate is how to build benchmarks that stay hard and uncontaminated as models train on more of the internet.

> [!hottake] Public benchmarks are marketing; your eval set is engineering.
> **The counterargument:** shared benchmarks give the field common ground, catch regressions and drive progress; dismissing them throws away cheap, useful signal.

## Check yourself
```quiz
benchmark-literacy
```

## Go deeper
- Jimenez et al., “SWE-bench” (2023); Rein et al., “GPQA” (2023); Phan et al., “Humanity’s Last Exam” (2025).
- Chiang et al., “Chatbot Arena” (2024).

## Related
- [Evaluation harnesses](#eval-harnesses)
- [Choosing a model](#choosing-a-model)
- [Statistics for evals](#eval-statistics)
- [Pretraining data](#pretraining-data)
- [State-of-the-art snapshot](#sota-snapshot)
