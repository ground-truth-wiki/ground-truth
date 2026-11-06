---
id: commandments-guide
book: 20
order: "20.4"
title: Cheat sheets
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [cheat-sheets]
visuals:
  - commandments-index:tree
  - commandment-compare:compare
---
> [!tldr]
> The cheat sheets are one-screen summaries for prompting, context, RAG, chunking, agents, tools, MCP, A2A, evals, judges, inference math, fine-tuning, security and production readiness. Each rule links to the chapter that justifies it. Print them, pin them, argue with them.

## Why it matters
In the middle of a design review or an incident, nobody reads a chapter. A short list of tested rules, each one click from its reasoning, brings the right principle to mind at the right moment.

## Intuition
Cheat sheets are a pilot’s checklist distilled from accident reports: short, imperative, and each line paid for by someone’s mistake.

```widget
commandments
```

## How it works
```viz
{"id":"commandments-index","component":"tree","title":"Fourteen sheets grouped by where you will use them","caption":"Expand a group; each leaf links to the chapter behind the sheet.","alt":"Tree of the fourteen cheat sheets grouped by use.","data":"illustrative","open":1,"root":{"label":"Cheat sheets","children":[
{"label":"Writing for models","children":[{"label":"Prompting, context","link":"#context-engineering"}]},
{"label":"Retrieval","children":[{"label":"RAG, chunking","link":"#chunking"}]},
{"label":"Agents and protocols","children":[{"label":"Agents, tools, MCP, A2A","link":"#agent-tools"}]},
{"label":"Quality","children":[{"label":"Evals, judges","link":"#llm-as-judge"}]},
{"label":"Systems","children":[{"label":"Inference math, fine-tuning","link":"#memory-math"}]},
{"label":"Shipping","children":[{"label":"Security, production readiness","link":"#secure-agent-design"}]}]}}
```

```viz
{"id":"commandment-compare","component":"compare","title":"A principle is a rule plus the reason you can check","caption":"Hover the marks. Each rule on a sheet links to its evidence.","alt":"Comparison of a bare rule and a principle with its reason and link.","data":"illustrative","mono":false,"a":{"title":"A bare rule","text":"Use hybrid search.","mono":false},"b":{"title":"A principle","text":"Run keyword and vector search together and fuse the rankings, because embeddings blur exact identifiers and keywords miss paraphrases. (Hybrid retrieval)","mono":false},"links":[{"a":"Use hybrid search.","b":"because embeddings blur exact identifiers and keywords miss paraphrases.","note":"The reason tells you when the rule does not apply."},{"b":"(Hybrid retrieval)","note":"One click to the full argument and evidence."}]}
```

**Rules come from chapters.** Each sheet distills the most important, most often violated rules from its Book; the [evals sheet](#cmd-evals) is a good first read.

## In practice
- Print the sheets relevant to your project and pin them near your desk.
- Use them as design-review checklists.
- When you disagree with a rule, read its chapter and test the disagreement.

## Numbers to know
> [!number]
> Fact: fourteen sheets, each fitting one printed page.

## Pitfalls and anti-patterns
> [!pitfall] Following rules without their reasons
> Every rule has exceptions; the linked chapter explains when it holds.

## Talk like an expert
Experts know the rules and their exceptions. The debate is healthy: principles should be argued with and revised as evidence changes.

> [!hottake] A team that agrees on the cheat sheets ships faster than one with better models.
> **The counterargument:** rules encode yesterday’s lessons; teams that follow them blindly can miss when newer models change the trade-offs.

## Check yourself
```quiz
commandments-guide
```

## Go deeper
- The [Cheat sheets](#commandments) page.

## Related
- [The evals cheat sheet](#cmd-evals)
- [Numbers every AI engineer should know](#numbers-to-know)
- [The anti-patterns hall of shame](#anti-patterns)
- [Decision guides](#decision-guides)
- [How to use Ground Truth](#how-to-use)
