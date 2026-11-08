---
id: reasoning-models
book: 4
order: "4.2"
title: Reasoning models and test-time compute
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [reasoning, thinking, test-time-compute]
visuals:
  - thinking-budget:chart
  - reasoning-compare:compare
---
> [!tldr]
> Reasoning models think before answering: they generate long internal chains of thought, trained with reinforcement learning to check, backtrack and try alternatives. Accuracy on hard problems rises with thinking budget, at the cost of latency and tokens. Use them for hard, checkable problems; use fast models for everything else.

## Why it matters
Reasoning models transformed performance on math, code, science and planning from 2024 onward, and most frontier families now include reasoning modes with adjustable effort. Using them well means knowing when the extra tokens pay off and how to prompt and budget them.

## Intuition
A fast model answers like someone replying from memory; a reasoning model takes out scratch paper. On hard problems the scratch paper wins; on “what is the capital of France” it just wastes paper.

```viz
{"id":"thinking-budget","component":"chart","type":"line","title":"Accuracy on hard problems climbs with thinking budget, with diminishing returns","caption":"Illustrative curve with the log-linear shape reported for reasoning models; not real measurements. Easy tasks barely benefit.","alt":"Illustrative line chart of accuracy against thinking tokens on a log scale for hard and easy tasks.","data":"illustrative","x":{"label":"Thinking tokens (log scale)","log":true},"y":{"label":"Accuracy","unit":"pct","min":0,"max":1},"series":[{"name":"Hard problems","points":[[500,0.3],[1000,0.42],[2000,0.53],[4000,0.62],[8000,0.69],[16000,0.73],[32000,0.75]]},{"name":"Easy problems","points":[[500,0.9],[1000,0.91],[2000,0.92],[4000,0.92],[8000,0.92],[16000,0.92],[32000,0.92]]}]}
```

## How it works
**Training.** Reinforcement learning on verifiable tasks teaches models to produce useful reasoning before answers. See [RLVR](#rlvr-reasoning). OpenAI’s o1 (2024) introduced the paradigm publicly; DeepSeek-R1 (2025) opened the recipe; Claude, Gemini and other families added extended or adaptive thinking modes.

**Test-time compute.** Spending more tokens on thinking, sampling several solutions and voting, or searching over candidates all trade compute for accuracy. See [test-time scaling](#test-time-scaling).

**Controls.** APIs expose effort levels or thinking-token budgets; some models decide adaptively how long to think; reasoning can interleave with tool calls in agent loops.

```viz
{"id":"reasoning-compare","component":"compare","title":"The same hard question with and without thinking","caption":"Illustrative. Hover the marks. The reasoning model’s visible answer is short; the work happened in its thinking.","alt":"Comparison of a fast model’s answer and a reasoning model’s answer to a scheduling puzzle.","data":"illustrative","mono":false,"a":{"title":"Fast model","text":"Schedule: Ana Monday, Ben Tuesday, Chloe Wednesday. (Violates the constraint that Ben cannot follow Ana.)","mono":false},"b":{"title":"Reasoning model","text":"[thinks for 3,100 tokens: lists constraints, tries two orderings, finds a conflict, backtracks]\nSchedule: Ben Monday, Chloe Tuesday, Ana Wednesday. All four constraints are satisfied.","mono":false},"links":[{"a":"(Violates the constraint that Ben cannot follow Ana.)","b":"finds a conflict, backtracks","note":"Checking and backtracking are what RL training rewarded."},{"b":"[thinks for 3,100 tokens","note":"Those tokens are billed as output and add latency."}]}
```

**Faithfulness.** Visible reasoning is not always a faithful account of how the model reached its answer; research in 2025 found reasoning models often omit factors that influenced them. Treat chains of thought as useful evidence, not proof.

## In practice
- Use reasoning modes for math, code, planning, analysis and agentic tasks with many steps; use fast modes for lookups, formatting and chat.
- Prompt with goals, constraints and success criteria; avoid scripting steps. See [reasoning prompts](#reasoning-prompts).
- Budget latency and cost: reasoning tokens count as output.
- Set effort per route in your gateway, and measure the accuracy gain per dollar.

## Numbers to know
> [!number]
> Rules of thumb. Reasoning can add thousands to tens of thousands of tokens per hard request and seconds to minutes of latency. Gains on easy tasks are small; on hard, checkable tasks they can be large.

## Pitfalls and anti-patterns
> [!pitfall] Reasoning mode on every request
> Costs and latency balloon for no gain on simple tasks.

- **Parsing or showing raw thinking as the answer.** Use the final answer; summarize reasoning for users if needed.
- **Trusting reasoning as an explanation.** It may not reflect the real cause of an answer.

## Talk like an expert
The vocabulary: **reasoning model**, **thinking tokens**, **effort level**, **thinking budget**, **adaptive thinking**, **interleaved thinking**, **test-time compute**, **chain-of-thought faithfulness**, **overthinking**. Experts quote accuracy at a stated budget and cost per correct answer. The live debate is how far test-time compute keeps scaling and how to make reasoning efficient.

> [!hottake] Reasoning should be a per-request decision made by a router, not a model choice.
> **The counterargument:** adaptive models that decide their own thinking length are getting good at this themselves, and external routers add complexity and misjudge difficulty.

## Check yourself
```quiz
reasoning-models
```

## Go deeper
- OpenAI, “Learning to Reason with LLMs” (2024).
- DeepSeek-AI, “DeepSeek-R1” (2025).
- Anthropic, “Reasoning models don’t always say what they think” (2025).

## Related
- [RL with verifiable rewards](#rlvr-reasoning)
- [Reasoning prompts](#reasoning-prompts)
- [Reasoning and test-time scaling](#test-time-scaling)
- [Planning and reasoning strategies](#planning-reasoning)
- [Cost engineering](#cost-engineering)
- [Training reasoning models: cold starts, distillation and length control](#reasoning-training-recipes)
- [Model types: base, instruct, reasoning and omni](#model-types)
- [Chat Completions, Responses and Messages](#api-shapes)
- [Compaction, context editing and reasoning state](#context-compaction)
- [Can LLMs plan? Classical planners, search and verifiers](#llm-planning-debate)
- [Test-time search, sampling and verification](#test-time-search)
- [Latent reasoning and recurrent depth](#latent-reasoning)
- [Do language models reason? The evidence on both sides](#reasoning-debate)
