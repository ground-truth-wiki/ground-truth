---
id: sota-snapshot
book: 19
order: "19.1"
title: State-of-the-art snapshot
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [frontier, snapshot, sota]
visuals:
  - sota-areas:tree
  - sota-compare:compare
---
> [!tldr]
> As of November 2026, frontier models reason at length, use tools and computers, write and fix code across large repositories, run for hours as agents, and handle long, multimodal contexts. Reliability on long tasks, verification, cost and safety remain the limits. This chapter is a dated snapshot; check the review date and update it often.

## Why it matters
Engineers make bets on what models can do now and soon. A clear snapshot, with dates and caveats, keeps designs ambitious enough to use real capabilities and grounded enough to avoid promising what models cannot yet deliver.

## Intuition
A state-of-the-art snapshot is a weather report, not a climate model: accurate for its date, and quickly out of date.

```viz
{"id":"sota-areas","component":"tree","title":"Where frontier capability stands, area by area, as of November 2026","caption":"Expand an area for its status and limits. Qualitative and dated; verify against current releases.","alt":"Tree of capability areas with their status and remaining limits as of November 2026.","data":"illustrative","depicts":"As of November 2026","open":1,"root":{"label":"Frontier capability snapshot","children":[
{"label":"Reasoning","children":[{"label":"Strong on math, science and code with test-time compute; weaker on open-ended judgment","link":"#reasoning-models"}]},
{"label":"Coding","children":[{"label":"Agents fix issues and build features across repositories; review and specification remain human bottlenecks","link":"#coding-agents"}]},
{"label":"Agents and autonomy","children":[{"label":"Hours-long background tasks work in well-instrumented environments; reliability falls with task length","link":"#long-horizon-autonomy"}]},
{"label":"Computer use","children":[{"label":"Practical for many web and desktop tasks; slower and less reliable than APIs","link":"#computer-use-agents"}]},
{"label":"Multimodal","children":[{"label":"Images, documents, audio and video in and out; fine-grained visual reasoning still uneven","link":"#multimodal-apps"}]},
{"label":"Open weights","children":[{"label":"Close behind closed models on many benchmarks","link":"#open-weight-frontier"}]},
{"label":"Safety and access","children":[{"label":"The most capable models ship with tiered access and extra safeguards","link":"#frontier-safety-frameworks"}]}]}}
```

## How it works
**Models.** As of November 2026, Anthropic’s public lineup is Claude Opus 5.5, Sonnet 5.5 and Haiku 5.5, plus Claude Fable 5.1 in the Mythos tier with additional safeguards for biology, cybersecurity and LLM R&D; Claude Mythos 5.1, the same model with more permissive safeguards, is available only through Anthropic’s trusted-access programs (the Cyber and Life Sciences Verification Programs), and the earlier Mythos Preview is deprecated (verified Nov 2026). Other frontier and open-weight labs release new generations several times a year; check their current lineups. See [frontier families](#frontier-families).

**Access can change.** In June 2026, US export controls led Anthropic to suspend access to Claude Fable 5 and Mythos 5 from 12 June. The controls were lifted on 30 June; Fable 5 returned worldwide on Anthropic’s own platforms on 1 July, and Mythos 5 first returned for a set of US organizations (Anthropic’s statements: anthropic.com/news/fable-mythos-access and anthropic.com/news/redeploying-fable-5). Plan for model availability as a dependency. See [governance](#governance-regulation).

**Protocols and tools.** MCP’s latest specification is 2026-07-28, stateless and with multi round-trip requests; A2A reached 1.0 in March 2026; coding harnesses ship skills, plugins, subagents and sandboxing (verified Nov 2026). See [MCP spec history](#mcp-spec-history).

**What still limits systems.** Long-horizon reliability, verification of open-ended outputs, prompt injection, cost of reasoning and agentic workloads, and evaluation of complex behavior.

```viz
{"id":"sota-compare","component":"compare","title":"What a typical production AI feature looked like in 2024 versus late 2026","caption":"Illustrative and qualitative. Hover the marks.","alt":"Comparison of a typical AI feature in 2024 and in late 2026.","data":"illustrative","mono":false,"a":{"title":"2024","text":"A chat assistant with retrieval over company documents. Single model calls, a few tools, minutes-long tasks at most, human copy-paste into other systems.","mono":false},"b":{"title":"Late 2026","text":"Agents with dozens of tools through MCP, reasoning modes per route, background tasks running for hours with checkpoints, computer use for systems without APIs, and evals and gateways as standard infrastructure.","mono":false},"links":[{"a":"Single model calls, a few tools","b":"Agents with dozens of tools through MCP","note":"Standard protocols made integrations routine."},{"a":"minutes-long tasks at most","b":"background tasks running for hours with checkpoints","note":"Long-running agents need durability engineering."},{"b":"evals and gateways as standard infrastructure","note":"Operations matured alongside capability."}]}
```

## In practice
- Design for current capability plus headroom: models improve every few months.
- Keep the system swappable: gateways, pinned versions and evals make upgrades cheap.
- Re-read this snapshot against the review date; treat anything older than a few months with care.

## Numbers to know
> [!number]
> Facts (verified Nov 2026): MCP 2026-07-28; A2A 1.0 in March 2026; Claude Code 2.1.317 in early November 2026. Rule of thumb: frontier lineups change every few months.

## Pitfalls and anti-patterns
> [!pitfall] Building on last year’s limits
> Workarounds for old model weaknesses can become dead weight; re-test them on upgrades.

- **Building on announcements.** Ship on capabilities you have evaluated, not on previews.

## Talk like an expert
Experts date every capability claim and separate demos from evaluated reliability. The live debate is the pace of progress in long-horizon autonomy and how quickly it reaches broad economic tasks.

> [!hottake] The binding constraint on AI products in 2026 is no longer model capability but evaluation and integration.
> **The counterargument:** for long-horizon autonomous work, reliability is still the limit, and better models continue to unlock tasks that no amount of integration could.

## Check yourself
```quiz
sota-snapshot
```

## Go deeper
- Current model and system cards from frontier labs; Epoch AI’s data on model trends.
- Anthropic’s statement on Fable and Mythos access, anthropic.com/news/fable-mythos-access.
- Anthropic, “Redeploying Fable 5” (30 June 2026), anthropic.com/news/redeploying-fable-5.

## Related
- [Frontier model families](#frontier-families)
- [Long-horizon autonomy](#long-horizon-autonomy)
- [The open-weight frontier](#open-weight-frontier)
- [Watchlist](#watchlist)
- [Open problems and big debates](#open-problems)
- [A short history of AI](#history-of-ai)
- [The benchmark catalog](#benchmark-catalog)
- [Scaling trends and limits: compute, cost, data and power](#scaling-trends-limits)
- [Measuring AI's economic impact](#economic-impact-evidence)
