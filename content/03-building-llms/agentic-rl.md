---
id: agentic-rl
book: 3
order: "3.8"
title: Agentic RL and environments
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [agentic-rl, environments, rollouts]
visuals:
  - agentic-rl-loop:diagram
  - env-types:tree
---
> [!tldr]
> Agentic RL trains models on multi-step tasks in environments with tools: coding in sandboxes, browsing, operating software, using APIs. Rewards come from task outcomes, often only at the end. It is how agents learn to plan, use tools and recover from errors, and it is expensive because every rollout runs a real environment.

## Why it matters
The big gains in coding agents and computer use since 2025 come largely from training on agentic tasks, not just chat. Engineers building agents meet its effects (models that prefer certain tool formats or harness styles) and, increasingly, the option to train their own agents on their own environments.

## Intuition
Single-turn RL is grading individual exam answers. Agentic RL is grading a whole internship: many decisions, tools and setbacks, judged mostly by whether the project shipped.

```viz
{"id":"agentic-rl-loop","component":"diagram","title":"An agentic RL step: many tool-using rollouts in sandboxes, scored at the end, used to update the policy","caption":"Simplified. The environment and verifier define what success means; the trainer amplifies whatever earns reward. Click a part for its chapter.","alt":"Diagram of agentic reinforcement learning: a task pool, a policy acting through tools in sandboxed environments over many turns, an outcome verifier and a trainer.","data":"illustrative","w":600,"h":210,"nodes":[
{"id":"tasks","label":"Task pool","sub":"repos, sites, APIs","role":"data","x":0,"y":0,"w":150,"h":56},
{"id":"policy","label":"Policy","sub":"the model","role":"model","x":225,"y":0,"w":150,"h":56},
{"id":"env","label":"Sandboxed environments","sub":"many turns, tools","role":"tool","x":450,"y":0,"w":150,"h":56,"link":"#rl-environment-harnesses"},
{"id":"verifier","label":"Outcome verifier","sub":"tests, final state","role":"agent","x":450,"y":150,"w":150,"h":56,"link":"#evaluating-agents"},
{"id":"trainer","label":"Trainer","sub":"GRPO, PPO","x":225,"y":150,"w":150,"h":56,"link":"#rlvr-reasoning"}],
"edges":[{"from":"tasks","to":"policy"},{"from":"policy","to":"env","both":true,"label":"actions, observations"},{"from":"env","to":"verifier","label":"trajectory"},{"from":"verifier","to":"trainer","label":"reward"},{"from":"trainer","to":"policy","label":"update"}]}
```

## How it works
**Multi-turn rollouts.** The policy calls tools, reads results and acts again for tens or hundreds of steps in a sandboxed environment; the trajectory is scored, usually by the outcome (tests pass, the target state is reached).

**Credit assignment.** With rewards only at the end, it is hard to tell which steps helped. Methods add intermediate rewards, process supervision or compare groups of trajectories on the same task.

**Environments as the asset.** Realistic, varied, checkable environments are scarce and valuable: repositories with tests, simulated websites and apps, API sandboxes, simulated users. See [RL environment harnesses](#rl-environment-harnesses).

```viz
{"id":"env-types","component":"tree","title":"Five kinds of agentic training environment and what each teaches","caption":"Expand a type. Most training mixes several, and the reward check is the hard part in each.","alt":"Tree of agentic RL environment types: coding repositories, terminals, browsers, tool APIs with simulated users, and computer-use desktops.","data":"illustrative","open":1,"root":{"label":"Agentic training environments","children":[
{"label":"Code repositories with tests","children":[{"label":"Fixing bugs and building features; reward from hidden tests","link":"#coding-agents"}]},
{"label":"Terminals","children":[{"label":"System tasks; reward from final machine state"}]},
{"label":"Browsers and websites","children":[{"label":"Navigation and forms; reward from reaching a target state","link":"#computer-use-agents"}]},
{"label":"Tool APIs with simulated users","children":[{"label":"Customer workflows; reward from the final database state","link":"#support-agents"}]},
{"label":"Desktop computer use","children":[{"label":"Operating applications; reward from checks on files and settings"}]}]}}
```

**Costs.** Each training step may need thousands of sandboxed rollouts lasting minutes; sandbox capacity and orchestration, not just GPUs, become bottlenecks.

**Harness coupling.** Models trained in a particular harness learn its tools and formats; behavior can differ in other harnesses. See [harness engineering](#harness-engineering).

## In practice
- If you train agents, invest first in environments and verifiers that resist gaming.
- Evaluate trained agents in the harness you will deploy, not only the training one.
- Managed reinforcement fine-tuning can work for narrow agent tasks with clear outcomes.

## Numbers to know
> [!number]
> Rules of thumb. Agentic rollouts are often tens to hundreds of steps; training needs thousands to millions of them. Sandbox throughput often limits training speed more than GPU throughput.

## Pitfalls and anti-patterns
> [!pitfall] Rewards on the agent’s claim of success
> Agents learn to claim success. Reward verified outcomes only.

- **Narrow environment sets.** Policies overfit to a handful of repositories or sites.

## Talk like an expert
The vocabulary: **agentic RL**, **multi-turn rollout**, **outcome reward**, **process reward**, **credit assignment**, **environment hub**, **sandbox throughput**, **harness coupling**. Experts ask what environments a model was trained in to predict where it will be strong. The live debate is whether agentic RL scales smoothly with more environments or hits limits in long-horizon credit assignment.

> [!hottake] Whoever builds the best environments will train the best agents.
> **The counterargument:** environments matter, but base-model capability and algorithms determine how much a policy can learn from them; good environments on a weak model yield little.

## Check yourself
```quiz
agentic-rl
```

## Go deeper
- The [RL environment harnesses](#rl-environment-harnesses) chapter.
- Technical reports of recent coding and agent models, which increasingly describe agentic RL.

## Related
- [RL with verifiable rewards](#rlvr-reasoning)
- [RL environment harnesses](#rl-environment-harnesses)
- [Evaluating agents](#evaluating-agents)
- [Long-horizon autonomy](#long-horizon-autonomy)
- [Reinforcement learning primer](#rl-primer)
- [MDPs, Bellman equations and value-based RL](#value-based-rl)
- [Policy-gradient algorithms for LLMs: from REINFORCE to GRPO and beyond](#llm-policy-gradients)
- [Training environments for coding agents](#swe-training-environments)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Training models for tool use and function calling](#function-calling-training)
