---
id: what-is-a-harness
book: 11
order: "11.1"
title: What “harness” means
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [harness, scaffold, definitions]
visuals:
  - four-harnesses:diagram
  - harness-same-model:compare
---
> [!tldr]
> “Harness” means four different things in AI: the agent harness around a model that makes it act, the eval harness that scores it, the RL environment harness it trains in, and the ordinary test harness of software engineering. Say which one you mean, because model plus agent harness equals product, and model plus eval harness equals a score.

## Why it matters
Engineers talk past each other with this word daily. A researcher’s “we improved the harness” means a better benchmark runner; a product engineer’s means a better agent loop. Benchmarks report a model’s score without naming the harness, and the same model can move a long way when only the harness changes. Precision here prevents wrong conclusions about which model is better.

## Intuition
A harness is whatever you strap around something powerful so it does useful, controlled work. A horse’s harness lets it pull a cart; a climbing harness lets you hang safely; a test harness lets you drive code under test. In AI, the same model gets different harnesses for acting, being measured, being trained and being tested.

```viz
{"id":"four-harnesses","component":"diagram","title":"Four harnesses wrap the same model for four different jobs","caption":"Switch tabs. Each harness has different inputs, outputs and success criteria, and each changes how the model appears to perform.","alt":"Diagram variants of an agent harness, an eval harness, an RL environment harness and a test harness, each wrapping a model.","data":"illustrative","w":560,"h":150,"variants":[
{"name":"Agent harness","note":"Turns a model into a product: loop, tools, context, permissions and interface. Output: work done for a user.","nodes":[{"id":"u","label":"User task","role":"human","x":0,"y":45,"w":120,"h":56},{"id":"h","label":"Agent harness","sub":"loop, tools, context","role":"agent","x":175,"y":45,"w":190,"h":56,"link":"#harness-anatomy"},{"id":"o","label":"Work done","role":"data","x":420,"y":45,"w":140,"h":56}],"edges":[{"from":"u","to":"h"},{"from":"h","to":"o"}]},
{"name":"Eval harness","note":"Runs a model or agent on a fixed dataset and grades it reproducibly. Output: a score you can compare.","nodes":[{"id":"d","label":"Dataset","role":"data","x":0,"y":45,"w":120,"h":56},{"id":"h","label":"Eval harness","sub":"solver, scorer, logs","role":"tool","x":175,"y":45,"w":190,"h":56,"link":"#eval-harnesses"},{"id":"o","label":"Score","x":420,"y":45,"w":140,"h":56}],"edges":[{"from":"d","to":"h"},{"from":"h","to":"o"}]},
{"name":"RL environment harness","note":"Serves tasks, runs the model’s actions, computes rewards and feeds rollouts to a trainer. Output: training signal.","nodes":[{"id":"e","label":"Environments","role":"external","x":0,"y":45,"w":120,"h":56},{"id":"h","label":"RL harness","sub":"rollouts, verifiers","role":"agent","x":175,"y":45,"w":190,"h":56,"link":"#rl-environment-harnesses"},{"id":"o","label":"Rewards","role":"model","x":420,"y":45,"w":140,"h":56}],"edges":[{"from":"e","to":"h"},{"from":"h","to":"o"}]},
{"name":"Test harness","note":"The classic software meaning: code that drives other code under controlled conditions. Output: pass or fail.","nodes":[{"id":"c","label":"Test cases","role":"data","x":0,"y":45,"w":120,"h":56},{"id":"h","label":"Test harness","sub":"fixtures, mocks, runner","x":175,"y":45,"w":190,"h":56},{"id":"o","label":"Pass or fail","x":420,"y":45,"w":140,"h":56}],"edges":[{"from":"c","to":"h"},{"from":"h","to":"o"}]}]}
```

## How it works
**Agent harness, also called scaffold.** Everything between the model and the world: system prompt, tools, loop controller, context manager, memory files, permissions and sandbox, subagents, hooks, interface and telemetry. Claude Code, Codex, OpenHands and your own fifty-line loop are all agent harnesses. See [harness anatomy](#harness-anatomy).

**Eval harness.** A framework that loads a dataset, runs a model or agent on each item with fixed prompts and settings, scores the outputs, and logs everything for reproducibility. EleutherAI’s lm-evaluation-harness, the UK AI Security Institute’s Inspect and the SWE-bench harness are examples. See [eval harnesses](#eval-harnesses).

**RL environment harness.** The interface between a training loop and the tasks it learns from: reset an environment, let the policy act, compute rewards with verifiers, and collect rollouts for the trainer. See [RL environment harnesses](#rl-environment-harnesses).

**Test harness.** Fixtures, mocks and runners that exercise software under controlled conditions. In AI products, test harnesses run your eval suites in CI. See [CI/CD for AI](#ci-cd-for-ai).

**Model plus harness equals product.** For agentic tasks, the harness is part of the system being measured. Tool formats, prompts, budgets, retries and context management all change results.

## In practice
The same model, two harnesses, one task:

```viz
{"id":"harness-same-model","component":"compare","title":"Same model, same task, different harness: the outcome changes","caption":"Illustrative runs of one coding task. Hover the marks to see which harness choices decided the result.","alt":"Comparison of the same model solving a coding task in a bare harness and in a richer harness.","data":"illustrative","mono":false,"a":{"title":"Harness A: bare loop","text":"One shell tool, no file viewer, 10-step budget, full test logs returned. The model spends three steps paging through a 4,000-line log, edits with sed, runs out of steps before re-running the tests. Result: unresolved.","mono":false},"b":{"title":"Harness B: tuned loop","text":"File viewer with line ranges, search tool, edit tool with search-and-replace, test output trimmed to failures, 30-step budget. The model finds the failing assertion, makes a three-line edit, re-runs the tests. Result: resolved.","mono":false},"links":[{"a":"One shell tool, no file viewer","b":"File viewer with line ranges, search tool, edit tool","note":"Purpose-built tools are the agent-computer interface; they change how efficiently the model works."},{"a":"full test logs returned","b":"test output trimmed to failures","note":"Bounded tool output keeps the context focused."},{"a":"10-step budget","b":"30-step budget","note":"Budgets alone can flip a result; always report them."}]}
```

When you read or report an agentic benchmark result, name the harness, its version, the tools, the budget and the number of attempts. When you compare models for your product, compare them in your harness, not someone else’s.

## Numbers to know
> [!number]
> Rule of thumb: on agentic benchmarks, harness changes such as tools, prompts and budgets can move a score as much as a model generation does. Treat any score without its harness as incomplete.

## Pitfalls and anti-patterns
> [!pitfall] Comparing scores from different harnesses
> Two leaderboard numbers produced in different harnesses with different budgets say little about which model is better.

- **Saying “harness” without a qualifier.** Specify agent, eval, RL or test harness.
- **Tuning the harness to the benchmark.** Gains may not transfer to your tasks.
- **Ignoring the harness when upgrading models.** A new model may need different tools or prompts.

## Talk like an expert
The vocabulary: **agent harness** or **scaffold**, **eval harness**, **RL environment**, **rollout**, **test harness**, **model plus harness**. Experts attach the harness name and budget to every agent score they quote. The live debate is how much harness engineering will matter as models improve; so far, better models have made good harnesses more valuable, not less.

> [!hottake] For agents, there is no such thing as a model score, only a model-plus-harness score.
> **The counterargument:** the same models do keep their rank order across many reasonable harnesses, so model capability is still the main signal; harness effects matter most when comparing close models.

## Check yourself
```quiz
what-is-a-harness
```

## Go deeper
- Yang et al., “SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering” (2024).
- EleutherAI’s lm-evaluation-harness and the UK AI Security Institute’s Inspect documentation.

## Related
- [Anatomy of an agent harness](#harness-anatomy)
- [Evaluation harnesses](#eval-harnesses)
- [Harness engineering](#harness-engineering)
- [RL environment harnesses](#rl-environment-harnesses)
- [The agent loop](#agent-loop)
