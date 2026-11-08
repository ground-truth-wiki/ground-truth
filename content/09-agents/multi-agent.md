---
id: multi-agent
book: 9
order: "9.7"
title: Multi-agent systems
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [multi-agent, orchestration, subagents]
visuals:
  - multiagent-explorer:explorer
  - multiagent-handoff:sequence
  - multiagent-tokens:chart
---
> [!tldr]
> A multi-agent system splits work across several model contexts that coordinate. It shines when a task has many independent parts and each part benefits from a clean, focused context; it fails when the parts are tightly coupled or the coordination costs more than the work.

## Why it matters
Multi-agent designs are the most hyped and most misapplied pattern in AI engineering. Some teams report large gains on broad research tasks; others report that the same idea made their coding agent worse. Knowing why both are true is what lets you choose correctly, and defend the choice in a design review.

## Intuition
A good lead researcher does not read every source personally. They split the question, send assistants off to read, and ask each for a one-page summary. The lead’s desk stays clean, the assistants work in parallel, and the total hours spent go up. Now imagine the task is writing one tightly argued paragraph: splitting it among five people just produces five voices.

```viz
{"id":"multiagent-explorer","component":"explorer","model":"multiagent","title":"Splitting work keeps each context small but multiplies the total tokens","caption":"Illustrative token model. Bars show how much context each agent holds against a 200k window; the multiplier compares total tokens with a single agent doing the same reading.","alt":"Explorer comparing single agent, orchestrator and workers, pipeline and shared-transcript topologies by context size and total tokens.","data":"illustrative","try":"Set material to 400k: the single agent overflows its window, while orchestrator and workers stays under it at about 1.7 times the tokens."}
```

## How it works
**Topologies.** The common shapes are orchestrator and subagents (a lead delegates and synthesizes), pipelines or handoffs (each agent passes control to the next, as in a triage agent handing to a billing agent), hierarchies (orchestrators of orchestrators), shared blackboards, and group chats or debates where agents read a shared transcript.

**Context isolation is the main benefit.** Each subagent starts with a fresh context holding only its brief and its tools. It can read 40,000 tokens of sources and return a 1,000-token summary, so the lead never sees the noise. This is [context engineering](#context-engineering) by architecture.

**Parallelism is the second.** Independent subtasks run at once, so wall-clock time drops even as total tokens rise.

**Coordination is the cost.** Every handoff is a lossy compression. Subagents duplicate work, misunderstand vague briefs, or make conflicting decisions that the lead must reconcile.

```viz
{"id":"multiagent-handoff","component":"sequence","title":"The lead never sees the raw sources: subagents read them and send back summaries","caption":"Step through an orchestrator run. Tap a brief to see what a good delegation contains: objective, output format, tools, budget and boundaries.","alt":"Sequence diagram of a lead agent delegating two research tasks to subagents that search and return summaries.","data":"illustrative","actors":[{"id":"lead","label":"Lead agent","role":"agent"},{"id":"a","label":"Subagent A","role":"agent"},{"id":"b","label":"Subagent B","role":"agent"},{"id":"tools","label":"Search tools","role":"tool"}],
"messages":[
{"from":"lead","to":"lead","label":"Plan: two questions","note":"The lead splits the question and writes a brief for each part."},
{"from":"lead","to":"a","label":"Brief A","payload":{"objective":"Find 2025–2026 changes to EU rules on general-purpose AI models","output":"Bullet list with source URL and date per claim, under 300 words","tools":["web_search","fetch"],"budget":"8 searches","boundaries":"Ignore US and UK rules; another agent covers them"},"note":"A vague brief is the top cause of duplicated work. State scope and boundaries."},
{"from":"lead","to":"b","label":"Brief B","payload":{"objective":"Find 2025–2026 changes to US federal and UK rules on frontier AI","output":"Bullet list with source URL and date per claim, under 300 words","tools":["web_search","fetch"],"budget":"8 searches","boundaries":"Ignore the EU"},"note":"Both run in parallel."},
{"from":"a","to":"tools","label":"6 searches, 9 pages"},
{"from":"b","to":"tools","label":"5 searches, 7 pages"},
{"from":"tools","to":"a","label":"~40k tokens","kind":"response","note":"Raw pages land in A’s context only."},
{"from":"tools","to":"b","label":"~35k tokens","kind":"response"},
{"from":"a","to":"lead","label":"Summary, 1.2k","kind":"response","note":"About 75k tokens of reading came back as about 2.2k tokens of summaries."},
{"from":"b","to":"lead","label":"Summary, 1.0k","kind":"response"},
{"from":"lead","to":"lead","label":"Synthesize and cite","note":"The lead resolves conflicts, checks citations and writes the answer."}]}
```

Anthropic’s write-up of its research feature reports the token cost of this design plainly:

```viz
{"id":"multiagent-tokens","component":"chart","type":"bar","title":"Agents spend several times the tokens of chat, and multi-agent systems many times more","caption":"Relative token use reported by Anthropic for its research system. Worth it when the task’s value is high and the work parallelizes; wasteful otherwise.","alt":"Bar chart: chat 1×, single agent about 4×, multi-agent system about 15× the tokens of a chat interaction.","data":"real","source":"Anthropic engineering, “How we built our multi-agent research system”","asof":"2025-06","categories":["Chat","Single agent","Multi-agent system"],"y":{"label":"Tokens relative to a chat","unit":"×"},"series":[{"name":"Relative tokens","points":[[0,1],[1,4],[2,15]]}]}
```

## In practice
Start single-agent. Move to multi-agent when evals show one of three signals: the context overflows or degrades on large inputs, independent subtasks would finish faster in parallel, or an independent reviewer measurably catches errors.

- **Write briefs like tickets.** Objective, output format, tools, budget and what is out of scope.
- **Return summaries, not transcripts.** Ask for structured results with sources.
- **Give subagents fewer tools.** Narrow tools mean narrow behavior.
- **Keep writes single-threaded.** Parallel readers are safe; parallel writers to the same files or records conflict. Many coding agents use subagents for search and review while one agent edits.
- **Budget per agent and in total.** Token multipliers compound.

> [!insight] Both sides of the debate are right
> In June 2025 Anthropic published how its multi-agent research system beat a single agent on broad research tasks. A day earlier, Cognition published “Don’t Build Multi-Agents”, arguing that subagents lose context and make conflicting decisions in coding. The tasks differ: research is wide and parallel; coding is deep and coupled.

## Numbers to know
> [!number]
> From the Anthropic write-up above: agents used about 4 times the tokens of chat, and the multi-agent system about 15 times. Treat those as an order of magnitude for your own budget, not a constant. Its prompts also scale effort to the query: one agent with 3 to 10 tool calls for simple fact-finding, 2 to 4 subagents for direct comparisons, and more than 10 subagents for complex research.

## Pitfalls and anti-patterns
> [!pitfall] Premature multi-agent
> Splitting a task before a single agent has been measured on it hides whether the split helped. It also multiplies cost and makes failures harder to trace.

- **Role-play without purpose.** Agents named “CEO” and “Engineer” that chat at length rarely beat one well-prompted agent.
- **Conflicting writes.** Two agents editing the same artifact without a merge step produce contradictions.
- **Lossy handoffs.** A handoff that drops the user’s constraints is a bug in your system, not the model’s.

## Talk like an expert
The vocabulary: **orchestrator** and **subagents**, **handoffs** (from OpenAI’s Swarm and Agents SDK), **context isolation**, **fan-out and fan-in**, **blackboard**, and **token multiplier**. Experts ask “is the work wide or deep?” before choosing. Wide, parallel reading favors multi-agent; deep, coupled reasoning favors one agent with good [context management](#context-engineering).

> [!hottake] Most multi-agent wins are context management in disguise.
> **The counterargument:** independent agents also change behavior, not just context size. A reviewer that never saw the author’s reasoning catches errors the author rationalizes, and parallel exploration finds options a single trajectory never tries.

## Check yourself
```quiz
multi-agent
```

## Go deeper
- Anthropic engineering, “How we built our multi-agent research system” (June 2025).
- Cognition, “Don’t Build Multi-Agents” (June 2025).
- Du et al., “Improving Factuality and Reasoning in Language Models through Multiagent Debate” (2023).

## Related
- [Workflow patterns](#workflow-patterns)
- [Context engineering](#context-engineering)
- [Deep research systems](#deep-research)
- [Evaluating agents](#evaluating-agents)
- [Case study: Claude Code](#claude-code)
- [A2A 1.0 in depth: bindings, extensions and signed agent cards](#a2a-in-depth)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Multi-agent orchestration patterns](#multi-agent-patterns)
