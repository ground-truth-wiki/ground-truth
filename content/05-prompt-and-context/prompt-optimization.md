---
id: prompt-optimization
book: 5
order: "5.7"
title: Prompt optimization
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [dspy, optimization, ab-tests]
visuals:
  - dspy-loop:diagram
  - overfit-chart:chart
---
> [!tldr]
> Prompt optimization treats prompts as parameters tuned against an eval set. DSPy compiles declarative modules into instructions and examples with optimizers such as MIPROv2 and GEPA; simpler setups version prompts and A/B test them. Either way, the metric and the data matter more than the optimizer.

## Why it matters
Hand-tuning prompts by intuition plateaus quickly and does not survive model upgrades. Optimization makes prompt quality measurable and repeatable: change the model, rerun the optimizer, ship the new prompt. It also exposes the hard part honestly, which is defining a metric that captures what you want.

## Intuition
Hand-tuning a prompt is adjusting a radio by ear. An optimizer is an auto-tuner that tries many settings and keeps the clearest signal, as long as you have told it what “clear” means.

```viz
{"id":"dspy-loop","component":"diagram","title":"An optimizer proposes prompts, a metric scores them on data, and the best one is compiled into the program","caption":"The loop behind DSPy-style optimization. The held-out test set at the bottom is what tells you whether the result generalizes.","alt":"Loop diagram: a program with signatures and modules, an optimizer proposing instructions and examples, runs on a training set scored by a metric, and a compiled program checked on a held-out test set.","data":"illustrative","w":600,"h":230,"nodes":[
{"id":"prog","label":"Program","sub":"signatures, modules","role":"agent","x":0,"y":0,"w":170,"h":56},
{"id":"opt","label":"Optimizer","sub":"proposes instructions, demos","role":"model","x":215,"y":0,"w":170,"h":56},
{"id":"run","label":"Run on train set","role":"tool","x":430,"y":0,"w":170,"h":56},
{"id":"metric","label":"Metric","sub":"your definition of good","role":"data","x":430,"y":110,"w":170,"h":56,"link":"#metrics-graders"},
{"id":"compiled","label":"Compiled program","role":"agent","x":215,"y":110,"w":170,"h":56},
{"id":"test","label":"Held-out test set","role":"data","x":215,"y":190,"w":170,"h":40,"link":"#eval-datasets"}],
"edges":[{"from":"prog","to":"opt"},{"from":"opt","to":"run"},{"from":"run","to":"metric"},{"from":"metric","to":"opt","curve":-40,"label":"scores"},{"from":"metric","to":"compiled","label":"best"},{"from":"compiled","to":"test","style":"dashed"}]}
```

## How it works
**DSPy** (Khattab et al., 2023) lets you write LLM pipelines as programs. A **signature** declares inputs and outputs (`question -> answer`); **modules** such as Predict and ChainOfThought implement them; an **optimizer** searches for instructions and few-shot demonstrations that maximize your metric on training examples, and “compiles” them into the program.

**Optimizers.** Bootstrapping optimizers collect successful traces as demonstrations. MIPROv2 searches jointly over instructions and demonstrations. GEPA (Agrawal et al., 2025) uses a model to reflect on failures and evolve prompts. Check the DSPy documentation for the current set.

**Automatic prompt engineering more broadly.** Any loop that has a model propose prompt variants, scores them on a dataset and keeps the best: from simple scripts to vendor tools.

**Versioning and A/B tests.** Without an optimizer, the same discipline applies: version every prompt, evaluate changes offline, and roll out winners gradually with online metrics. See [prompt management](#prompt-config-management) and [online evaluation](#online-evaluation).

**You need an eval first.** The optimizer maximizes whatever the metric measures. A metric that rewards length gets long answers; a judge with position bias gets exploited. See [LLM-as-judge](#llm-as-judge).

```viz
{"id":"overfit-chart","component":"chart","type":"line","title":"Optimizing against a small dev set keeps raising its score after real quality has stopped improving","caption":"Illustrative curves. The dev-set score keeps climbing with optimization rounds; the held-out score peaks and then declines as the prompt overfits. Stop where the held-out score peaks.","alt":"Illustrative line chart of dev-set and held-out scores over optimization rounds, with the held-out score peaking around round four.","data":"illustrative","x":{"label":"Optimization round"},"y":{"label":"Score","unit":"pct","min":0.5,"max":1},"series":[{"name":"Dev set","points":[[0,0.62],[1,0.7],[2,0.76],[3,0.8],[4,0.84],[5,0.87],[6,0.9],[7,0.92]]},{"name":"Held-out set","points":[[0,0.61],[1,0.68],[2,0.72],[3,0.74],[4,0.75],[5,0.74],[6,0.72],[7,0.71]]}]}
```

## In practice
```python
import dspy

dspy.configure(lm=dspy.LM("provider/model-id"))        # placeholder model id

class Triage(dspy.Signature):
    """Classify a support ticket's priority."""
    ticket: str = dspy.InputField()
    priority: str = dspy.OutputField(desc="one of: low, medium, high")

program = dspy.ChainOfThought(Triage)
metric = lambda example, pred, trace=None: example.priority == pred.priority

optimizer = dspy.MIPROv2(metric=metric, auto="light")
compiled = optimizer.compile(program, trainset=train)  # train: list of dspy.Example
```

Illustrative usage; check the current DSPy documentation for exact optimizer arguments.

Rules:
- **Split data three ways:** a training set for the optimizer, a dev set for choosing among runs, a held-out test set you report.
- **Start with a strong baseline prompt** written by a human; optimizers refine better than they invent.
- **Inspect the winning prompt.** If it contains strange instructions, your metric may be rewarding the wrong thing.
- **Re-optimize on model upgrades**, and compare against simply re-testing the old prompt.

## Numbers to know
> [!number]
> Rules of thumb. Optimizers typically need dozens to a few hundred labeled examples. Optimization runs make many model calls; estimate cost before running at full scale. Gains measured on the training set overstate real gains; trust the held-out set.

## Pitfalls and anti-patterns
> [!pitfall] Optimizing a bad metric
> An optimizer will find the shortest path to a high score, including paths you would never accept. Validate the metric on human judgments first.

- **No held-out set.** You will ship an overfit prompt.
- **Optimizing with the judge you report.** Use a different evaluation for reporting.
- **Treating the compiled prompt as a black box.** Read it; it encodes what your metric rewarded.

## Talk like an expert
The vocabulary: **DSPy**, **signature**, **module**, **optimizer**, **compile**, **MIPROv2**, **GEPA**, **bootstrapped demonstrations**, **held-out set**. Experts ask “what’s the metric, and how was it validated?” before looking at any optimization result. The live debate is how much automatic optimization beats careful human prompting on strong models; results vary by task, and both need an eval.

> [!hottake] If you have a good eval, an optimizer will beat your hand-written prompt; if you don’t, nothing will help.
> **The counterargument:** on many tasks a clear human-written prompt for a strong model is already near the ceiling, and optimization adds cost and opaque prompts for small gains.

## Check yourself
```quiz
prompt-optimization
```

## Go deeper
- Khattab et al., “DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines” (2023).
- Opsahl-Ong et al., “Optimizing Instructions and Demonstrations for Multi-Stage Language Model Programs” (2024), the MIPRO paper.
- Agrawal et al., “GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning” (2025).

## Related
- [Why evals are the core skill](#why-evals)
- [Prompting fundamentals](#prompting-fundamentals)
- [Prompt and config management](#prompt-config-management)
- [Orchestration frameworks](#orchestration-frameworks)
- [LLM-as-judge done right](#llm-as-judge)
