---
id: mental-models
book: 0
order: "0.3"
title: Mental models that matter
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [mental-models, principles]
visuals:
  - triangle-diagram:diagram
  - bitter-lesson-chart:chart
---
> [!tldr]
> A few mental models carry most AI engineering decisions: models are probabilistic components that need evals; context is the program; quality, cost, latency and risk trade off; simple beats clever until measured otherwise; the bitter lesson favors general methods that scale; and everything about models is a dated snapshot.

## Why it matters
Mental models let you reason about new situations quickly and avoid repeating classic mistakes. They also make design discussions shorter: “that breaks the triangle” or “where is the eval?” replace long arguments.

## Intuition
Mental models are a toolbox of lenses. No single lens shows everything, but switching between them reveals what each hides.

```viz
{"id":"triangle-diagram","component":"diagram","title":"Quality, cost and latency trade off, and risk sits in the middle","caption":"Improving one corner usually costs another. Click a corner for the chapter that covers its levers.","alt":"Diagram of the quality, cost and latency triangle with risk at the center.","data":"illustrative","w":600,"h":230,"nodes":[
{"id":"quality","label":"Quality","sub":"evals decide","role":"model","x":215,"y":0,"w":170,"h":56,"link":"#why-evals"},
{"id":"cost","label":"Cost","sub":"tokens × price","role":"data","x":0,"y":172,"w":170,"h":56,"link":"#cost-engineering"},
{"id":"latency","label":"Latency","sub":"TTFT and total","role":"tool","x":430,"y":172,"w":170,"h":56,"link":"#latency-throughput"},
{"id":"risk","label":"Risk","sub":"what a mistake costs","role":"untrusted","x":215,"y":92,"w":170,"h":56,"link":"#threat-modeling"}],
"edges":[{"from":"quality","to":"cost","both":true},{"from":"cost","to":"latency","both":true},{"from":"latency","to":"quality","both":true}]}
```

## How it works
**Probabilistic components.** Models are not functions with guaranteed outputs; treat them like unreliable but capable services, with evals, retries, validation and fallbacks. See [why evals](#why-evals).

**Context is the program.** What the model sees decides what it does; most quality work is context work. See [context engineering](#context-engineering).

**The triangle plus risk.** Better quality often costs money or time; cheaper and faster often costs quality; the cost of errors decides how much quality you need.

**Simple first.** Single call, then chain, workflow, agent; add complexity only with evidence. See [decision guides](#decision-guides).

**The bitter lesson.** Richard Sutton (2019) argued that general methods that leverage computation beat hand-engineered knowledge over time:

```viz
{"id":"bitter-lesson-chart","component":"chart","type":"line","title":"General methods that scale with compute eventually overtake clever hand-built ones","caption":"Illustrative curves after Sutton’s 2019 essay “The Bitter Lesson”; not data.","alt":"Illustrative line chart where a hand-engineered method leads early and a general scalable method overtakes it as compute grows.","data":"illustrative","x":{"label":"Compute available (log scale)","log":true},"y":{"label":"Performance","unit":"pct","min":0,"max":1},"series":[{"name":"Hand-engineered","points":[[1,0.4],[10,0.5],[100,0.56],[1000,0.6],[10000,0.62]]},{"name":"General and scalable","points":[[1,0.25],[10,0.4],[100,0.58],[1000,0.75],[10000,0.88]]}]}
```

**Snapshots age.** Model limits, prices and leaderboards change every few months; principles change slowly. Build so that swapping models is cheap. See [gateways](#gateways-routers).

## In practice
- Ask in every design review: where is the eval, what does it cost, how fast is it, what happens when it is wrong?
- Prefer designs that get better automatically as models improve.

## Numbers to know
> [!number]
> Rule of thumb: assume any model-specific workaround has a shelf life of months.

## Pitfalls and anti-patterns
> [!pitfall] Over-engineering around today’s model weaknesses
> The next model may remove the weakness and leave you with the complexity.

## Talk like an expert
The vocabulary: **probabilistic component**, **context is the program**, **quality–cost–latency triangle**, **simple first**, **the bitter lesson**, **dated snapshot**. Experts reach for these lenses naturally. The live debate is how far the bitter lesson applies to agent harnesses: will scaffolding become unnecessary?

> [!hottake] Build for the model you will have in six months, not the one you have today.
> **The counterargument:** shipping value now requires working around current limits; designing only for future models can mean shipping nothing.

## Check yourself
```quiz
mental-models
```

## Go deeper
- Sutton, “The Bitter Lesson” (2019).
- This Bible’s [Commandments](#commandments-guide) for one-screen summaries.

## Related
- [What an AI engineer is](#ai-engineer-role)
- [The AI engineering stack](#ai-engineering-stack)
- [Decision guides](#decision-guides)
- [Why evals are the core skill](#why-evals)
- [Context engineering](#context-engineering)
