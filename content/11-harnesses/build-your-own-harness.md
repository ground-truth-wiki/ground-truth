---
id: build-your-own-harness
book: 11
order: "11.11"
title: Build your own harness
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [harness, reference-implementation]
visuals:
  - harness-build-steps:stepper
  - build-score-chart:chart
---
> [!tldr]
> Build a small agent harness yourself once: a loop, a few tools, context management, permissions, logging and an eval, added one at a time with a measurement after each. It takes a day or two, and it explains every agent product you will ever use.

## Why it matters
Using agents is easy; understanding why they succeed or fail is not. Building a harness from parts forces every design decision in this Book into the open: what the model sees, what it can do, when it stops, what it may not touch, and how you know it worked. It is also the best interview project in the field. See [interview prep](#interview-prep).

## Intuition
Building your own harness is like building a simple radio from a kit. You will never sell it, but afterwards every radio makes sense, and you can fix the one in your car.

```viz
{"id":"harness-build-steps","component":"stepper","title":"Each part you add answers one question, and the eval tells you whether it helped","caption":"Step through the build. Parts appear as you add them; the scores in the captions are illustrative pass rates on a ten-task eval set.","alt":"Stepper building an agent harness part by part: loop, tools, context management, permissions, logging and evals.","data":"illustrative","diagram":{"w":600,"h":200,"nodes":[
{"id":"loop","label":"Loop","sub":"budget, stop rule","role":"agent","x":215,"y":72,"w":170,"h":56,"at":0,"link":"#agent-loop"},
{"id":"tools","label":"Tools","sub":"read, search, edit, test","role":"tool","x":0,"y":0,"w":170,"h":56,"at":1,"link":"#agent-tools"},
{"id":"ctx","label":"Context manager","sub":"truncate, compact","role":"context","x":430,"y":0,"w":170,"h":56,"at":2,"link":"#context-engineering"},
{"id":"perm","label":"Permissions","sub":"ask before side effects","role":"human","x":0,"y":144,"w":170,"h":56,"at":3,"link":"#human-in-the-loop"},
{"id":"log","label":"Trace log","sub":"every call, replayable","role":"data","x":430,"y":144,"w":170,"h":56,"at":4,"link":"#observability-tracing"},
{"id":"eval","label":"Eval set","sub":"ten real tasks","x":215,"y":160,"w":170,"h":40,"at":5,"link":"#evaluating-agents"}],
"edges":[{"from":"loop","to":"tools","at":1},{"from":"loop","to":"ctx","at":2},{"from":"perm","to":"loop","at":3},{"from":"loop","to":"log","at":4},{"from":"eval","to":"loop","at":5,"style":"dashed"}]},
"frames":[
{"label":"Loop","caption":"Start with the fifty-line loop from the agent-loop chapter: model call, stop reason, step budget. With only a shell tool it solves 2 of 10 tasks."},
{"label":"Tools","caption":"Add task-shaped tools: read with line ranges, search, search-and-replace edit, run tests with trimmed output. 4 of 10."},
{"label":"Context","caption":"Truncate tool results, clear old ones and compact near the limit. Long tasks stop derailing: 5 of 10."},
{"label":"Permissions","caption":"Classify tools as read-only or side-effecting and ask before the latter; run commands in a sandbox. Same score, but it can no longer damage the machine."},
{"label":"Logging","caption":"Write every call and result to a trace file you can replay from any step. Debugging goes from guessing to reading."},
{"label":"Evals","caption":"With traces and a fixed eval set, read the failures, fix the top two causes and rerun: 6 of 10. Now every change has a number."}]}
```

## How it works
**Step 1: the loop.** Messages list, model call with tools, stop on a non-tool stop reason, step budget. Start from the code in [the agent loop](#agent-loop).

**Step 2: tools.** Read files with line ranges, search with a grep tool, edit with search-and-replace, run tests and return only failures. Give every tool a clear description, bounded output and errors that teach. See [tool design](#agent-tools).

**Step 3: context management.** Count tokens per call, truncate large results with a note, replace old results with stubs, and compact at a threshold into a summary of goal, decisions and next steps. See [context engineering](#context-engineering).

**Step 4: permissions and sandbox.** Mark tools read-only or side-effecting; ask before side effects; run commands in a sandbox with workspace-only files and no network by default. See [sandboxes](#sandboxes).

**Step 5: logging.** One JSON line per model call and tool call with inputs, outputs, tokens and duration. Add a replay command that reruns from any step with a changed prompt. See [observability](#observability-tracing).

**Step 6: evals.** Ten real tasks with checkable outcomes, three attempts each, a results table, and a habit of reading failing traces. See [evaluating agents](#evaluating-agents).

```viz
{"id":"build-score-chart","component":"chart","type":"bar","title":"Tools and context management move the score; permissions and logging move safety and debuggability","caption":"Illustrative pass rates after each build step on a ten-task eval set. Not every valuable part shows up in the score, which is why you measure more than one thing.","alt":"Bar chart of illustrative pass rates after each harness build step: loop 20%, tools 40%, context 50%, permissions 50%, logging 50%, eval-driven fixes 60%.","data":"illustrative","categories":["Loop","Tools","Context","Permissions","Logging","Eval-driven fixes"],"y":{"label":"Tasks passed","unit":"pct","min":0,"max":0.8},"series":[{"name":"Pass rate","points":[[0,0.2],[1,0.4],[2,0.5],[3,0.5],[4,0.5],[5,0.6]]}]}
```

## In practice
A file layout that keeps the parts separate:

```text
harness/
  loop.py          # model calls, stop rules, budgets
  tools/           # one module per tool, each with description and schema
  context.py       # token counting, truncation, compaction
  policy.py        # risk classes, approvals, sandbox runner
  trace.py         # JSON-lines logging and replay
  evals/
    tasks.jsonl    # ten tasks with checks
    run.py         # three attempts per task, results table
```

Keep it small: the point is to understand each part, not to build a product. When you are done, compare your choices with [Claude Code](#claude-code) and the [coding-harness landscape](#coding-harness-landscape); you will recognize every feature.

## Numbers to know
> [!number]
> Rules of thumb. A useful teaching harness is a few hundred lines. Ten tasks with three attempts each is enough to see large effects; you need more to detect small ones. See [statistics for evals](#eval-statistics).

## Pitfalls and anti-patterns
> [!pitfall] Building a framework instead of a harness
> Abstractions, plugin systems and configuration layers hide the decisions you set out to understand. Write plain code.

- **Skipping the eval.** Without it, every change is a guess.
- **Skipping the sandbox.** Your own harness can delete your own files.
- **Too many tools on day one.** Add one at a time and measure.

## Talk like an expert
The vocabulary is this whole Book: **loop**, **stop reason**, **budget**, **tool interface**, **truncation**, **compaction**, **risk class**, **approval**, **sandbox**, **trace**, **replay**, **eval set**. People who have built a harness talk about agents in terms of these parts, and they can say which part to change for a given failure.

> [!hottake] Everyone who builds agents professionally should write a harness from scratch once.
> **The counterargument:** time is limited, and mature harnesses and SDKs already embody these lessons; reading a good one closely and running ablations on it can teach nearly as much.

## Check yourself
```quiz
build-your-own-harness
```

## Go deeper
- The mini-SWE-agent repository, a deliberately small harness to read end to end.
- The Claude Agent SDK documentation, for how a production harness exposes the same parts.

## Related
- [Provider and agent SDKs](#provider-agent-sdks)
- [The agent loop](#agent-loop)
- [Anatomy of an agent harness](#harness-anatomy)
- [Sandboxes and execution environments](#sandboxes)
- [Learning paths and the project ladder](#project-ladder)
- [Harness engineering](#harness-engineering)
