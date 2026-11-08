---
id: how-to-use
book: 0
order: "0.4"
title: How to use Ground Truth
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [guide, learning]
visuals:
  - bible-map:diagram
  - first-hour:stepper
---
> [!tldr]
> Read it as a course, search it as a reference, and play with it as a lab. Twenty-one Books run from foundations to the frontier; levels and stability badges tell you how hard a chapter is and how fast its facts go stale; learning paths, quizzes, the Glossary, the Timeline, the Workshop and the Cheat sheets turn reading into skill.

## Why it matters
A reference this large is only useful if you can find your way. A few conventions (levels, badges, links, visuals and paths) let you jump to what you need and trust what you read.

## Intuition
Ground Truth is a city: Books are districts, chapters are buildings, links are streets, and the Glossary, Timeline and Workshop are the library, the museum and the workshop on the main square.

```viz
{"id":"bible-map","component":"diagram","title":"Twenty-one Books in five districts, from foundations to the frontier","caption":"Click a district to start reading there.","alt":"Diagram of Ground Truth’s structure: foundations, building blocks, agents and protocols, quality and production, and frontier and reference.","data":"illustrative","w":600,"h":220,"nodes":[
{"id":"found","label":"Foundations","sub":"Books 0 to 4: math, models, training","role":"context","x":0,"y":0,"w":185,"h":60,"link":"#ai-engineer-role"},
{"id":"build","label":"Building blocks","sub":"Books 5 to 8: prompts, RAG, data, multimodal","role":"data","x":207,"y":0,"w":185,"h":60,"link":"#prompting-fundamentals"},
{"id":"agents","label":"Agents and protocols","sub":"Books 9 to 13: agents, apps, harnesses, MCP","role":"agent","x":414,"y":0,"w":186,"h":60,"link":"#what-is-an-agent"},
{"id":"prod","label":"Quality and production","sub":"Books 14 to 18: evals, serving, security, design","role":"tool","x":103,"y":140,"w":185,"h":60,"link":"#why-evals"},
{"id":"front","label":"Frontier and reference","sub":"Books 19 and 20: SOTA, Canon, Glossary","role":"model","x":311,"y":140,"w":185,"h":60,"link":"#sota-snapshot"}],
"edges":[{"from":"found","to":"build"},{"from":"build","to":"agents"},{"from":"agents","to":"prod","style":"dashed"},{"from":"prod","to":"front","style":"dashed"}]}
```

## How it works
**Levels.** Foundation chapters assume no background; Practitioner chapters assume you can call an API and write code; Expert chapters assume production experience; Frontier chapters cover live research.

**Stability badges.** Evergreen content holds for years; moving content shifts yearly; volatile chapters are dated snapshots with a review date.

**Every full chapter** has a summary, intuition, mechanics, practice, numbers, pitfalls, expert vocabulary with a hot take and its counterargument, a quiz, sources and related chapters. Visuals carry a badge: illustrative, formula or real data.

**Tools.** The [Glossary](#lexicon-guide) and flashcards, the [Timeline](#genesis), [learning paths](#paths), the [Workshop](#workshop) of calculators and wizards, [Matrices](#matrices), the [Cheat sheets](#commandments) and quizzes. Progress, bookmarks and notes stay in your browser.

```viz
{"id":"first-hour","component":"stepper","title":"Your first hour with Ground Truth","caption":"A suggested route for a new reader.","alt":"Stepper of a suggested first hour: choose a path, read a flagship chapter, play with a visual, take a quiz and bookmark.","data":"illustrative","frames":[
{"label":"Choose a path","caption":"Open Learning paths and pick the one that matches your goal."},
{"label":"Read a flagship","caption":"Start with a flagship chapter such as Context engineering or The agent loop."},
{"label":"Play","caption":"Change the inputs of a calculator or step through a visual until the idea clicks."},
{"label":"Check yourself","caption":"Take the chapter quiz; wrong answers link back to the explanation."},
{"label":"Save","caption":"Bookmark chapters, add notes, and come back to the next chapter on your path."}]}
```

## In practice
- Press Ctrl K (or Cmd K) to search everything.
- Hover dotted terms for definitions; click for the glossary entry.
- Use “Read as text” on any visual for an accessible version and its data.
- Print a chapter or a cheat sheet for offline study.

## Numbers to know
> [!number]
> Facts: 195 chapters in 21 Books, hundreds of visuals, a glossary of several hundred terms, and quizzes for every chapter.

## Pitfalls and anti-patterns
> [!pitfall] Treating volatile chapters as timeless
> Check the review date on anything marked volatile before relying on it.

## Talk like an expert
Experts use Ground Truth as a map: they read the chapter for the decision at hand, follow its links, and check the dated parts against primary sources.

> [!hottake] The fastest way to learn AI engineering is to build, break and measure.
> **The counterargument:** building without a map wastes time on known mistakes; reading the right chapter first makes each experiment count.

## Check yourself
```quiz
how-to-use
```

## Go deeper
- [Learning paths and the project ladder](#project-ladder) and [Changelog and how to extend](#changelog-extend).

## Related
- [What an AI engineer is](#ai-engineer-role)
- [Mental models that matter](#mental-models)
- [Glossary](#lexicon-guide)
- [Learning paths and the project ladder](#project-ladder)
- [Changelog and how to extend](#changelog-extend)
- [A short history of AI](#history-of-ai)
- [Courses and textbooks: a curriculum map](#learning-resources)
