---
id: eval-statistics
book: 14
order: "14.10"
title: Statistics for evals
level: expert
stability: evergreen
reviewed: "2026-11"
status: full
tags: [statistics, confidence-intervals, significance]
visuals:
  - ci-explorer:explorer
  - ci-width-chart:chart
  - eval-n-calculator:calculator
---
> [!tldr]
> An eval score is an estimate with uncertainty. Report confidence intervals, compare systems on the same cases with paired tests, run several attempts to measure nondeterminism, correct for multiple comparisons, and size the eval set for the difference you need to detect.

## Why it matters
Teams routinely ship a change because a score went from 81% to 83% on 100 cases, a difference that is well within noise. They also discard real improvements for the same reason. A little statistics turns eval numbers into decisions you can defend.

## Intuition
Flip a fair coin ten times and you may well get seven heads. Nobody concludes the coin is biased. An eval of 100 cases is a few hundred coin flips’ worth of evidence, and should be read with the same humility.

```viz
{"id":"ci-explorer","component":"explorer","model":"ci","title":"With 100 examples, an 80% pass rate could really be anywhere from about 71% to 87%","caption":"Formula view using the Wilson score interval at 95% confidence. Watch the width shrink slowly as n grows.","alt":"Interval chart of a pass rate with its 95% confidence interval for adjustable sample size and pass rate.","data":"formula","try":"Find the n at which the interval is narrower than 5 points."}
```

## How it works
**Confidence intervals.** For a pass rate p on n independent cases, an approximate 95% interval is p ± 1.96 √(p(1 − p) ÷ n). Wilson intervals behave better near 0% and 100%, and bootstrap intervals work for any metric: resample cases with replacement many times and take the middle 95% of the resulting scores.

```viz
{"id":"ci-width-chart","component":"chart","type":"line","title":"Halving the margin of error needs four times as many cases","caption":"Formula view: half-width of an approximate 95% interval for a 70% pass rate, as the number of cases grows.","alt":"Line chart of confidence interval half-width against number of eval cases, falling from about 18 points at 25 cases to about 2 points at 1,600 cases.","data":"formula","x":{"label":"Eval cases (log scale)","log":true},"y":{"label":"95% interval half-width","unit":"pct","min":0,"max":0.2},"series":[{"name":"Half-width at p = 0.7","points":[[25,0.1796],[50,0.127],[100,0.0898],[200,0.0635],[400,0.0449],[800,0.0318],[1600,0.0225]]}]}
```

**Paired comparisons.** When two systems run on the same cases, analyze the per-case differences rather than comparing two separate averages. Pairing removes the variation between easy and hard cases, so it detects much smaller differences with the same data; a paired bootstrap or McNemar’s test for pass and fail outcomes is standard.

**Nondeterminism.** Model outputs vary between runs even at low temperature. Run each case several times, average per case, and treat the run-to-run spread as part of the uncertainty. Evan Miller’s “Adding Error Bars to Evals” (2024) covers this and clustered cases.

**Clustered cases.** Cases that share a source document or template are not independent; treat clusters as the unit of resampling, or intervals will be too narrow.

**Multiple comparisons.** Compare twenty prompt variants and one will look significantly better by chance. Use a held-out set to confirm the winner, or correct with methods such as Bonferroni or Holm.

**Sample sizes.** Decide the smallest difference worth detecting, then size the set:

```viz
{"id":"eval-n-calculator","component":"calculator","title":"To pin a 70% pass rate to within ±5 points you need about 320 cases","caption":"Cases needed for a 95% interval of a given half-width: n = 1.96² p(1 − p) ÷ m². Comparisons between two systems need more, unless they are paired.","alt":"Calculator for the number of eval cases needed for a target margin of error at an expected pass rate.","data":"formula","outputs":[{"id":"n","label":"Cases needed","expr":"ceil(3.8416 * p * (1 - p) / (m * m) - 0.000000001)","unit":"count","main":true}],"inputs":{"p":0.7,"m":0.05},"input_meta":{"p":{"label":"Expected pass rate","unit":"0 to 1"},"m":{"label":"Margin of error","unit":"half-width, 0 to 1"}},"assumptions":["Independent cases and a binary outcome.","Normal approximation; use Wilson intervals near 0% or 100%."],"tests":[{"inputs":{},"expect":{"n":323}},{"inputs":{"p":0.5,"m":0.1},"expect":{"n":97}}]}
```

## In practice
```python
# Paired bootstrap: is system B better than system A on the same cases?
import random
diffs = [b - a for a, b in zip(scores_a, scores_b)]   # per-case, each averaged over runs
boots = []
for _ in range(10_000):
    sample = [random.choice(diffs) for _ in diffs]
    boots.append(sum(sample) / len(sample))
boots.sort()
lo, hi = boots[249], boots[9_749]                     # 95% interval of the mean difference
print(f"B - A = {sum(diffs)/len(diffs):+.3f}  [{lo:+.3f}, {hi:+.3f}]")
```

Reporting rules:
- Always show n and an interval next to every score.
- Compare systems with paired tests on identical cases.
- Average several runs per case for nondeterministic systems.
- Confirm a winner chosen among many variants on held-out data.
- Report slices with their own n; small slices have wide intervals.

## Numbers to know
> [!number]
> Formulas. Approximate 95% half-width = 1.96 √(p(1 − p) ÷ n). At p = 0.7: about ±9 points at 100 cases, ±4.5 at 400, ±2.2 at 1,600. Cases needed for margin m: 1.96² p(1 − p) ÷ m².

## Pitfalls and anti-patterns
> [!pitfall] Declaring a winner inside the noise
> A two-point gain on 100 cases is usually indistinguishable from chance. Show the interval, or run a paired test.

- **Unpaired comparisons of paired data.** They throw away most of your statistical power.
- **One run per case.** Nondeterminism masquerades as improvement.
- **Testing many variants on one set.** The best one is partly luck.
- **Ignoring clusters.** Cases from one template are not independent evidence.

## Talk like an expert
The vocabulary: **confidence interval**, **Wilson interval**, **bootstrap**, **paired test**, **McNemar’s test**, **nondeterminism**, **clustered standard errors**, **multiple comparisons**, **minimum detectable effect**. Experts read “83% ± 7” as “somewhere between 76% and 90%”, and ask whether a comparison was paired. The live debate is how far to go: simple intervals catch most mistakes; full statistical modeling of evals is rare outside research.

> [!hottake] Most eval improvements reported in internal reviews are noise.
> **The counterargument:** many real changes produce large, obvious gains, and teams that demand significance for every small tweak move too slowly; statistics matters most when differences are small and the stakes are high.

## Check yourself
```quiz
eval-statistics
```

## Go deeper
- Miller, “Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations” (2024).
- Efron and Tibshirani, *An Introduction to the Bootstrap* (1993).

## Related
- [Probability and information theory](#probability-information)
- [Metrics and graders](#metrics-graders)
- [Online evaluation](#online-evaluation)
- [Building eval datasets](#eval-datasets)
- [Benchmark literacy](#benchmark-literacy)
