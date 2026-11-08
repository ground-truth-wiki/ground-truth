---
id: long-horizon-autonomy
book: 19
order: "19.3"
title: Long-horizon autonomy
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [autonomy, task-length, continual-learning]
visuals:
  - task-length-chart:chart
  - horizon-limits:tree
---
> [!tldr]
> The length of tasks AI agents can complete has grown quickly: METR measured the human time-length of tasks models finish with 50% success roughly doubling every seven months from 2019 to 2025, and about every four months since 2023 (January 2026 estimate, verified Nov 2026). Long tasks still fail from compounding errors, lost context and weak verification, so durable harnesses and evaluation matter as much as models.

## Why it matters
Task length is a practical measure of how much work can be delegated. Planning products and teams around it requires both the trend and its caveats: success at 50% is not reliability, and benchmark tasks are cleaner than real work.

## Intuition
Each step an agent takes is a coin that must land right. Ten steps at 95% each succeed 60% of the time; a hundred steps succeed less than 1% of the time unless the agent can notice and fix its mistakes.

```viz
{"id":"task-length-chart","component":"chart","type":"line","title":"The length of tasks agents complete has doubled roughly every seven months","caption":"Illustrative curve with the exponential shape METR reported in 2025 for the human duration of tasks models complete with 50% success; not their data points. In February to March 2026 METR put the public frontier at about 12 hours (95% interval 5 to 61 hours), above where this curve points. Log scale.","alt":"Illustrative log-scale line chart of the task length agents can complete at 50% success rising exponentially over time.","data":"illustrative","x":{"label":"Year"},"y":{"label":"Task length at 50% success (minutes, log scale)","log":true},"series":[{"name":"Frontier models","points":[[2020,0.1],[2021,0.3],[2022,1],[2023,5],[2024,20],[2025,60]]}]}
```

## How it works
**Measuring horizons.** METR (2025) timed humans on software and research tasks, then measured which tasks models complete; the 50%-success task length grew exponentially. Other evidence comes from agent benchmarks and production background agents.

**Why long tasks fail.**

```viz
{"id":"horizon-limits","component":"tree","title":"Five things that break long tasks, and the harness feature that helps","caption":"Expand a limit.","alt":"Tree of limits on long-horizon autonomy with mitigating harness features.","data":"illustrative","open":1,"root":{"label":"What limits long tasks","children":[
{"label":"Compounding errors","children":[{"label":"Verification steps and re-planning after failures","link":"#agent-failure-modes"}]},
{"label":"Context limits","children":[{"label":"Compaction, progress files and memory","link":"#context-engineering"}]},
{"label":"Infrastructure failures","children":[{"label":"Checkpoints and durable execution","link":"#long-running-agents"}]},
{"label":"Weak verification","children":[{"label":"Tests, checkers and human review gates","link":"#evaluating-agents"}]},
{"label":"Goal drift","children":[{"label":"Explicit goals re-read after each phase","link":"#planning-reasoning"}]}]}}
```

**Reliability versus capability.** A task completed half the time is impressive and not yet delegable; production needs high pass^k. See [metrics and graders](#metrics-graders).

## In practice
- Break long work into checkpointed phases with verification between them.
- Measure success at your task lengths and reliability across repeated runs.
- Expect the frontier to move; re-test what agents can do every model release.

## Numbers to know
> [!number]
> Facts and rules of thumb. METR reported the 50%-success task length doubling about every seven months from 2019 to 2025 and about every four months since 2023 (January 2026). For the public frontier in February to March 2026 it estimated about 12 hours at 50% success (95% interval 5 to 61 hours) and about 1.5 hours at 80% (verified Nov 2026). Per-step success compounds: 0.95¹⁰ ≈ 0.6, 0.99¹⁰⁰ ≈ 0.37.

## Pitfalls and anti-patterns
> [!pitfall] Reading a 50% horizon as “agents can do hour-long tasks”
> At 50% success, half of those tasks fail; reliability at long horizons is much lower.

## Talk like an expert
The vocabulary: **time horizon**, **50% success length**, **compounding error**, **pass^k**, **checkpointing**, **verification gate**. Experts quote horizons with success rates and task types. The live debate is whether the exponential trend continues and how well benchmark tasks predict messy real work.

> [!hottake] Task length is the single best metric for AI progress.
> **The counterargument:** benchmark tasks are well specified and checkable; real work is ambiguous and social, so horizon trends may overstate practical delegation.

## Check yourself
```quiz
long-horizon-autonomy
```

## Go deeper
- METR, “Measuring AI Ability to Complete Long Tasks” (2025).

## Related
- [Self-improving and automated research systems](#self-improving-systems)
- [Long-running and durable agents](#long-running-agents)
- [Evaluating agents](#evaluating-agents)
- [Agent failure modes](#agent-failure-modes)
- [State-of-the-art snapshot](#sota-snapshot)
- [Agentic RL and environments](#agentic-rl)
