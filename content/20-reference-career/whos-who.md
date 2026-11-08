---
id: whos-who
book: 20
order: "20.6"
title: Who’s who and where to learn
level: foundation
stability: volatile
reviewed: "2026-11"
status: full
tags: [labs, courses, communities]
visuals:
  - learning-map:tree
  - ecosystem-map:diagram
---
> [!tldr]
> The AI ecosystem has distinct kinds of players: frontier labs, open-model developers, cloud and hardware providers, tool and framework builders, evaluation and safety organizations, academia, policy bodies and practitioner educators. Knowing who does what tells you where to look for primary information and how to learn efficiently.

## Why it matters
Primary sources beat summaries, and knowing which organization publishes which kind of information saves hours. A clear learning map also helps you choose courses, books and communities.

## Intuition
The ecosystem is a city’s institutions: the factories (labs), the hardware stores (chips and clouds), the workshops (tools), the inspectors (evaluators), the schools (academia and educators) and city hall (policy).

```viz
{"id":"ecosystem-map","component":"diagram","title":"Eight kinds of player and what each publishes","caption":"Click a player type for the chapter where its work matters most.","alt":"Diagram of AI ecosystem players: frontier labs, open-model developers, clouds and hardware, tool builders, evaluators, academia, policy bodies and educators.","data":"illustrative","w":600,"h":220,"nodes":[
{"id":"labs","label":"Frontier labs","sub":"models, system cards","role":"model","x":0,"y":0,"w":140,"h":56,"link":"#frontier-families"},
{"id":"open","label":"Open-model developers","sub":"weights, reports","role":"model","x":153,"y":0,"w":140,"h":56,"link":"#open-weight-frontier"},
{"id":"hw","label":"Clouds and hardware","sub":"chips, platforms","role":"tool","x":306,"y":0,"w":140,"h":56,"link":"#hardware"},
{"id":"tools","label":"Tool builders","sub":"frameworks, protocols","role":"agent","x":460,"y":0,"w":140,"h":56,"link":"#framework-landscape"},
{"id":"eval","label":"Evaluators","sub":"benchmarks, audits","role":"data","x":0,"y":150,"w":140,"h":56,"link":"#benchmark-literacy"},
{"id":"acad","label":"Academia","sub":"papers, methods","role":"context","x":153,"y":150,"w":140,"h":56,"link":"#the-canon"},
{"id":"policy","label":"Policy bodies","sub":"laws, standards","role":"human","x":306,"y":150,"w":140,"h":56,"link":"#governance-regulation"},
{"id":"edu","label":"Educators","sub":"courses, books, posts","role":"human","x":460,"y":150,"w":140,"h":56,"link":"#public-writeups"}],
"edges":[]}
```

## How it works
```viz
{"id":"learning-map","component":"tree","title":"Where to learn each part of AI engineering","caption":"Expand a topic for the kind of source that teaches it best. Names are examples; check for current editions.","alt":"Tree of learning sources by topic: foundations, building with models, evaluation, systems, and safety and policy.","data":"illustrative","open":1,"root":{"label":"Where to learn","children":[
{"label":"Foundations","children":[{"label":"University courses and textbooks (deep learning, NLP); video lectures that build models from scratch","link":"#neural-networks"}]},
{"label":"Building with models","children":[{"label":"Provider documentation and cookbooks; practitioner books such as Chip Huyen’s AI Engineering (2025)","link":"#model-apis"}]},
{"label":"Evaluation","children":[{"label":"Practitioner courses and writing on evals; eval tool documentation","link":"#why-evals"}]},
{"label":"Systems and serving","children":[{"label":"Serving engine docs, hardware vendors’ guides, infrastructure blogs","link":"#serving-engines"}]},
{"label":"Safety and policy","children":[{"label":"Lab safety reports, AI safety institutes, the International AI Safety Report","link":"#frontier-safety-frameworks"}]}]}}
```

**Primary sources by player.** Labs: release notes, model and system cards, research papers. Open-model developers: model cards, technical reports, licenses. Tool builders: specifications, changelogs, issue trackers. Evaluators: methodology and data. Policy bodies: legal texts and guidance.

## In practice
- For each dependency in your stack, bookmark its primary source.
- Combine one structured course with hands-on projects from the [project ladder](#project-ladder).

## Numbers to know
> [!number]
> Rule of thumb: a few primary sources per area beat dozens of aggregators.

## Pitfalls and anti-patterns
> [!pitfall] Learning only from social media
> Threads compress and distort; follow them back to the source.

## Talk like an expert
Experts know which organization to ask which question and cite primary sources. The debate is how to keep learning resources current as the field moves monthly.

> [!hottake] The best AI courses are the documentation of the tools you use.
> **The counterargument:** documentation teaches the how, not the why; courses and books build the judgment documentation assumes.

## Check yourself
```quiz
whos-who
```

## Go deeper
- The [Watchlist](#watchlist) for what to follow weekly.

## Related
- [Watchlist](#watchlist)
- [The Canon](#the-canon)
- [Lessons from public engineering write-ups](#public-writeups)
- [Learning paths and the project ladder](#project-ladder)
- [Interview prep](#interview-prep)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [The AI industry map: labs, clouds, chips and money](#ai-industry-map)
- [Courses and textbooks: a curriculum map](#learning-resources)
