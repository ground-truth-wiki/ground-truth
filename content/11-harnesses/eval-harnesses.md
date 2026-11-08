---
id: eval-harnesses
book: 11
order: "11.9"
title: Evaluation harnesses
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [eval-harness, inspect, swe-bench]
visuals:
  - eval-harness-flow:diagram
  - eval-config-compare:compare
  - eval-tool-matrix:matrix
---
> [!tldr]
> Eval harnesses run models or agents on tasks and grade them reproducibly: a dataset, a solver, an environment, a scorer and logs, all pinned by configuration. lm-evaluation-harness, Inspect, HELM and lighteval cover model benchmarks; SWE-bench, Terminal-Bench and τ-bench harnesses cover agents; most teams also need a custom one.

## Why it matters
An eval result is only as trustworthy as the harness that produced it. Different prompt templates, answer extraction, budgets and retries change scores, which is why published numbers often fail to reproduce. A good eval harness makes your own numbers comparable over time, and lets you rerun everything after a model or prompt change.

## Intuition
An eval harness is a laboratory protocol. The same samples, the same instruments, the same procedure, written down so anyone can repeat the experiment and get the same reading.

```viz
{"id":"eval-harness-flow","component":"diagram","title":"Five parts make an eval reproducible, and the configuration pins all of them","caption":"Most eval harnesses share this shape. Click a part for the chapter that covers it.","alt":"Diagram of an eval harness: a dataset feeds a solver that runs in an environment, a scorer grades the result, and logs record everything, all controlled by a configuration.","data":"illustrative","w":600,"h":210,"nodes":[
{"id":"data","label":"Dataset","sub":"inputs, targets","role":"data","x":0,"y":0,"w":130,"h":56,"link":"#eval-datasets"},
{"id":"solver","label":"Solver","sub":"model, prompts, tools","role":"model","x":160,"y":0,"w":130,"h":56},
{"id":"env","label":"Environment","sub":"sandbox, tools","role":"tool","x":320,"y":0,"w":130,"h":56,"link":"#sandboxes"},
{"id":"scorer","label":"Scorer","sub":"code or judge","role":"agent","x":470,"y":0,"w":130,"h":56,"link":"#metrics-graders"},
{"id":"logs","label":"Logs","sub":"every sample, every step","role":"data","x":320,"y":150,"w":280,"h":56,"link":"#observability-tracing"},
{"id":"cfg","label":"Configuration","sub":"versions, seeds, budgets","x":0,"y":150,"w":290,"h":56}],
"edges":[{"from":"data","to":"solver"},{"from":"solver","to":"env","both":true},{"from":"env","to":"scorer"},{"from":"scorer","to":"logs"},{"from":"cfg","to":"solver","style":"dashed"}]}
```

## How it works
**Model benchmark harnesses.** EleutherAI’s lm-evaluation-harness runs hundreds of standard tasks with fixed prompts and answer extraction; Stanford’s HELM evaluates across many scenarios and metrics; Hugging Face’s lighteval is a lightweight runner used for open-model leaderboards.

**Inspect.** The UK AI Security Institute’s open-source framework for model and agent evals. A task combines a dataset, solvers (prompting steps, tool use, agents) and scorers, with sandboxed tool execution and detailed logs:

```python
from inspect_ai import Task, task
from inspect_ai.dataset import Sample
from inspect_ai.scorer import includes
from inspect_ai.solver import generate

@task
def capitals():
    return Task(
        dataset=[Sample(input="What is the capital of Portugal?", target="Lisbon")],
        solver=[generate()],
        scorer=includes(),
    )
# Run with: inspect eval capitals.py --model <provider/model-id>
```

**Agent benchmark harnesses.** The SWE-bench harness applies an agent’s patch to a real repository in a container and runs hidden tests; Terminal-Bench runs tasks in terminal environments; τ-bench pairs an agent with a simulated user and tools and checks the final database state, and introduced pass^k for reliability. See [evaluating agents](#evaluating-agents).

**Custom harnesses.** Your tasks, tools and graders rarely match a public benchmark. A custom harness can be small: a dataset file, a runner that calls your system, scorers, and a results table with intervals. See [eval tooling](#eval-tooling).

**Reproducibility.** Pin model versions, prompt templates, sampling settings, tool versions, budgets, number of attempts and the harness version. Seeds help, but model APIs are not fully deterministic, so run several attempts and report the spread. See [statistics for evals](#eval-statistics).

## In practice
Two runs of the “same” benchmark can measure different things:

```viz
{"id":"eval-config-compare","component":"compare","title":"Same benchmark, same model, two configurations: the scores are not comparable","caption":"Illustrative configuration files. Hover the marks: each difference can move the score by itself.","alt":"Comparison of two eval configurations for the same benchmark that differ in prompt template, attempts, budget and harness version.","data":"illustrative","a":{"title":"Run A","text":"benchmark: coding-tasks-v2\nmodel: provider/model-x\nharness: runner 1.4\nprompt: template-zero-shot\ntemperature: 0\nattempts per task: 1\nstep budget: 20\nscore: 48%"},"b":{"title":"Run B","text":"benchmark: coding-tasks-v2\nmodel: provider/model-x\nharness: runner 2.0\nprompt: template-with-examples\ntemperature: 0.7\nattempts per task: 5 (best of)\nstep budget: 60\nscore: 67%"},"links":[{"a":"harness: runner 1.4","b":"harness: runner 2.0","note":"Harness upgrades change tools, parsing and defaults."},{"a":"prompt: template-zero-shot","b":"prompt: template-with-examples","note":"Prompt templates alone can move benchmark scores substantially."},{"a":"attempts per task: 1","b":"attempts per task: 5 (best of)","note":"Best of five is pass@5, not pass@1."},{"a":"step budget: 20","b":"step budget: 60","note":"More steps let agents finish tasks they would otherwise abandon."}]}
```

```viz
{"id":"eval-tool-matrix","component":"matrix","matrix":"eval-tools","title":"Eval and observability tools by focus and openness","caption":"Sortable and filterable. Dated and qualitative; pick by how fast it lets you read traces and rerun evals.","alt":"Table of eval and observability tools with focus, openness and best fit.","data":"illustrative","depicts":"As of November 2026"}
```

Rules for your own harness:
- **Store every sample’s full trace**, not only the score.
- **Version datasets and configs** together; a score without them is a rumor.
- **Run several attempts per task** and report pass@1, pass^k and intervals.
- **Make reruns one command**, so nobody hesitates to rerun after a change.

## Numbers to know
> [!number]
> Rules of thumb. Prompt templates, answer extraction and attempt counts can each move benchmark scores by several points. Three to five attempts per task usually give a usable estimate of agent reliability.

## Pitfalls and anti-patterns
> [!pitfall] Comparing your number with a leaderboard number
> Unless the harness, configuration and attempts match, the comparison is meaningless.

- **Scoring only final answers for agents.** Trajectories matter too.
- **No logs.** You cannot debug a score you cannot inspect.
- **Silent harness upgrades.** Pin the version and note changes.

## Talk like an expert
The vocabulary: **solver**, **scorer**, **task**, **sample**, **answer extraction**, **pass@k** and **pass^k**, **sandboxed environment**, **reproducibility**. Experts ask “which harness, which config, how many attempts?” before reading any score. The live debate is whether public agent benchmarks can stay meaningful as models are increasingly trained on similar environments.

> [!hottake] Your custom eval harness is more valuable than any public benchmark.
> **The counterargument:** public harnesses let the field compare models on common ground and catch regressions you would not think to test; you need both.

## Check yourself
```quiz
eval-harnesses
```

## Go deeper
- EleutherAI’s lm-evaluation-harness, Stanford’s HELM and Hugging Face’s lighteval repositories.
- The Inspect documentation from the UK AI Security Institute.
- Jimenez et al., “SWE-bench” (2023); Yao et al., “τ-bench” (2024).

## Related
- [Evaluating agents](#evaluating-agents)
- [What “harness” means](#what-is-a-harness)
- [Benchmark literacy](#benchmark-literacy)
- [Eval and observability tooling map](#eval-tooling)
- [Statistics for evals](#eval-statistics)
- [Coding-agent benchmarks: SWE-bench, Terminal-Bench and their harnesses](#coding-agent-benchmarks)
- [Agent eval metrics and benchmark design](#agent-eval-metrics)
