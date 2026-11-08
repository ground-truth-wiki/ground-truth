---
id: why-evals
book: 14
order: "14.1"
title: Why evals are the core skill
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [evals, eval-driven-development]
visuals:
  - eval-flywheel:flowchart
  - vibes-compare:compare
  - eval-pyramid:diagram
---
> [!tldr]
> Evals are how you know whether an AI system works, whether a change made it better, and whether a new model is safe to switch to. Build them from real failures, run them on every change, and treat the eval set as the most valuable asset your team owns.

## Why it matters
AI systems are probabilistic, their inputs are open-ended, and their failures are often plausible-looking. Without evals, every prompt tweak, model upgrade and retrieval change is a guess judged by a few hand-picked examples. Teams with good evals ship faster, because they can change things with confidence; teams without them stall, because every change might break something nobody can see.

## Intuition
Evals are to AI what tests are to software, plus a measuring instrument. Tests tell you whether code still works; evals also tell you how well, how often, and for which kinds of input.

```mermaid id=eval-flywheel title="Evals turn production failures into permanent tests" caption="Each turn of the loop adds cases to the eval set, so the same failure cannot silently return." alt="Loop: ship, collect traces, error analysis, add eval cases, improve the system, ship."
flowchart LR
  A[Ship] --> B[Collect traces]
  B --> C[Error analysis]
  C --> D[Add eval cases]
  D --> E[Improve the system]
  E --> A
```

## How it works
**Eval-driven development.** Write down what good looks like before you build, in the form of cases with checks. Every change is then measured against them. This is test-driven development adapted to probabilistic systems: you track rates, not just pass and fail.

**Start from errors, not metrics.** The best eval sets come from reading real outputs, naming the failure modes you see, and turning them into cases and checks. Generic metrics chosen up front usually measure the wrong thing. See [error analysis](#error-analysis).

**The flywheel.** Production traffic produces traces; reading traces reveals failures; failures become eval cases; changes are measured against the cases; better versions ship and produce new traces. Each turn makes the system and the eval better.

**Layers of evaluation.** Cheap, automatic checks run on every commit; judge-based evals run on every meaningful change; human review samples what automation cannot judge; online experiments measure what users actually experience:

```viz
{"id":"eval-pyramid","component":"diagram","title":"Many cheap checks at the bottom, a few expensive experiments at the top","caption":"Each layer catches what the one below cannot. Click a layer for the chapter that covers it.","alt":"Layered diagram of evaluation methods from online experiments at the top through human review and LLM-as-judge evals to code-based assertions at the bottom.","data":"illustrative","w":560,"layer_h":46,"layers":[
{"id":"online","label":"Online experiments","sub":"A/B tests, canaries: fewest, most realistic","role":"human","link":"#online-evaluation"},
{"id":"human","label":"Human review","sub":"experts sample what automation can’t judge","role":"human","link":"#error-analysis"},
{"id":"judge","label":"LLM-as-judge evals","sub":"calibrated rubrics on every meaningful change","role":"model","link":"#llm-as-judge"},
{"id":"code","label":"Code-based assertions","sub":"schemas, regexes, tests: many, cheap, every commit","role":"tool","link":"#metrics-graders"}]}
```

**What evals are for.** Comparing prompts and models; catching regressions before users do; deciding when something is good enough to ship; and, over time, building a precise shared definition of quality for the team.

## In practice
```viz
{"id":"vibes-compare","component":"compare","title":"A model swap judged by vibes and judged by an eval reach opposite conclusions","caption":"An illustrative story. Hover the marks: the eval finds the regression the demo missed.","alt":"Comparison of deciding a model upgrade by trying a few examples versus running an eval set with slices.","data":"illustrative","mono":false,"a":{"title":"By vibes","text":"We tried the new model on five questions from the demo script. The answers read better and it is cheaper. Ship it. Two weeks later, support tickets about wrong refund amounts double.","mono":false},"b":{"title":"By eval","text":"We ran 240 cases with three attempts each. Overall pass rate rose from 81% to 84%, but the refund-calculation slice fell from 92% to 71%. We fixed the prompt for that slice, re-ran, and shipped at 85% overall with no slice below 88%.","mono":false},"links":[{"a":"five questions from the demo script","b":"240 cases with three attempts each","note":"Demo questions are the ones that already work; evals sample what users really send."},{"a":"The answers read better","b":"Overall pass rate rose from 81% to 84%","note":"Fluency is not correctness."},{"a":"support tickets about wrong refund amounts double","b":"the refund-calculation slice fell from 92% to 71%","note":"Slicing finds regressions that averages hide."}]}
```

How to start this week:
1. Collect 50 to 100 real inputs, including the hard and weird ones.
2. Read the outputs and write down every failure you see. See [error analysis](#error-analysis).
3. Turn the top failure modes into cases with checks: code where possible, a calibrated judge where not.
4. Run the set on every change; put the results in a table everyone can see.
5. Add new cases from every production incident.

## Numbers to know
> [!number]
> Rules of thumb. A first useful eval set is 50 to 200 cases. Small differences need hundreds of cases to detect; see [statistics for evals](#eval-statistics). Teams commonly spend a large share of AI engineering time on evals and data, and the teams that ship best tend to spend more, not less.

## Pitfalls and anti-patterns
> [!pitfall] Choosing metrics before reading outputs
> Generic scores such as “helpfulness” or text-similarity metrics rarely track the failures that matter. Read outputs first, then measure what you found.

- **Demo-set evals.** Cases you already know work prove nothing.
- **One number.** Averages hide the slices that regressed.
- **Evals nobody runs.** If running them is slow or manual, they will be skipped.
- **Frozen eval sets.** Add cases from production; retire ones that no longer matter.

## Talk like an expert
The vocabulary: **eval set**, **golden set**, **eval-driven development**, **regression**, **slice**, **flywheel**, **vibe check**. Experts ask “what’s your eval?” before “what’s your model?”, and say “show me the failures” rather than “show me the score”. The live debate is how much evaluation can be automated with judges; practitioners agree it starts with humans reading outputs.

> [!hottake] Your eval set is a more durable asset than your prompts, your fine-tunes or your choice of model.
> **The counterargument:** eval sets go stale as products, users and models change; without continuous maintenance they become a false comfort, and maintaining them is real, ongoing work.

## Check yourself
```quiz
why-evals
```

## Go deeper
- Hamel Husain’s and Shreya Shankar’s writing and course material on evals (2024 onward).
- Eugene Yan’s writing on evaluating LLM applications.
- Anthropic’s documentation on defining success criteria and building evals.

## Related
- [Error analysis first](#error-analysis)
- [Building eval datasets](#eval-datasets)
- [Metrics and graders](#metrics-graders)
- [LLM-as-judge done right](#llm-as-judge)
- [CI/CD for AI](#ci-cd-for-ai)
- [Eval recipes by system type](#eval-recipes)
