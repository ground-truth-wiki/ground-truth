---
id: anti-patterns
book: 18
order: "18.7"
title: The anti-patterns hall of shame
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [anti-patterns, mistakes]
visuals:
  - shame-gallery:tree
  - demo-vs-prod:compare
---
> [!tldr]
> The same mistakes recur across AI projects: demo-driven development, vibes instead of evals, agents for everything, mega-prompts, context stuffing, unpinned models, instructions as security, unread code, and launching without an off switch. Each has a recognizable smell and a known cure.

## Why it matters
Naming anti-patterns makes them easier to spot in design reviews and code, and gives teams a shared language for saying “we are doing the thing again”.

## Intuition
A hall of shame is a museum of avoidable accidents. Walk through it once and you start noticing the same hazards in your own projects.

```viz
{"id":"shame-gallery","component":"tree","title":"Twelve anti-patterns, grouped by where they bite","caption":"Expand a group. Each entry links to the chapter with the cure.","alt":"Tree of twelve AI engineering anti-patterns grouped by quality, architecture, operations and security.","data":"illustrative","open":1,"root":{"label":"The hall of shame","children":[
{"label":"Quality","children":[{"label":"Demo-driven development: tuned on five happy examples","link":"#why-evals"},{"label":"Vibes over evals: ships because it looked better","link":"#eval-statistics"},{"label":"One number: averages hide regressed slices","link":"#eval-datasets"}]},
{"label":"Architecture","children":[{"label":"Agents for everything: autonomy where a workflow would do","link":"#what-is-an-agent"},{"label":"Mega-prompts: hundreds of contradictory rules","link":"#prompting-fundamentals"},{"label":"Context stuffing: everything in the window, just in case","link":"#context-engineering"}]},
{"label":"Operations","children":[{"label":"Unpinned models: provider updates become incidents","link":"#prompt-config-management"},{"label":"No off switch: runaway agents wait for a deploy","link":"#incidents-on-call"},{"label":"Cost surprises: no per-tenant budgets","link":"#cost-capacity"}]},
{"label":"Security and trust","children":[{"label":"Instructions as security: rules only in the prompt","link":"#guardrails-control"},{"label":"Unread code: merging agent output nobody reviewed","link":"#working-with-coding-agents"},{"label":"The lethal trifecta: private data, untrusted input and outbound channels in one agent","link":"#prompt-injection"}]}]}}
```

## How it works
**Why they happen.** Demos reward the visible and the impressive; production rewards the reliable and the boring. Most anti-patterns are demo habits carried into production.

```viz
{"id":"demo-vs-prod","component":"compare","title":"A demo mindset versus a production mindset, line by line","caption":"Hover the marks. Each demo habit has a production counterpart.","alt":"Comparison of demo-driven and production-driven approaches to an AI feature.","data":"illustrative","mono":false,"a":{"title":"Demo mindset","text":"Five example questions that work. Latest model alias. One long prompt. An agent with every tool. Ship it Friday.","mono":false},"b":{"title":"Production mindset","text":"Two hundred real questions with checks. Pinned model version. Versioned prompt with evals in CI. A workflow with one agentic step and approvals. Canary with rollback, then ship.","mono":false},"links":[{"a":"Five example questions that work.","b":"Two hundred real questions with checks.","note":"Evals replace demos."},{"a":"Latest model alias.","b":"Pinned model version.","note":"Changes happen on your schedule."},{"a":"An agent with every tool.","b":"A workflow with one agentic step and approvals.","note":"Autonomy only where it earns its keep."},{"a":"Ship it Friday.","b":"Canary with rollback, then ship.","note":"Releases you can reverse."}]}
```

## In practice
- Use the gallery as a design-review checklist.
- When you find one in your system, write down the cure and the eval that proves it worked.

## Numbers to know
> [!number]
> Rule of thumb: most projects have at least three of these at launch; finding them before users do is the goal.

## Pitfalls and anti-patterns
> [!pitfall] Using the list to shame people
> Anti-patterns are system problems; fix processes, not individuals.

## Talk like an expert
Experts name anti-patterns quickly and pair each with a cure. The live debate is which of today’s anti-patterns (agents for everything, long context instead of retrieval) will become good practice as models improve.

> [!hottake] “Agents for everything” is this decade’s “microservices for everything”.
> **The counterargument:** as models grow more reliable, many tasks really are better handled by agents than by brittle hand-written workflows; some of today’s anti-patterns are tomorrow’s defaults.

## Check yourself
```quiz
anti-patterns
```

## Go deeper
- The [lessons from public write-ups](#public-writeups) and [framework anti-patterns](#framework-anti-patterns).

## Related
- [Framework anti-patterns](#framework-anti-patterns)
- [Lessons from public engineering write-ups](#public-writeups)
- [Why evals are the core skill](#why-evals)
- [Decision guides](#decision-guides)
- [Incidents and on-call](#incidents-on-call)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
