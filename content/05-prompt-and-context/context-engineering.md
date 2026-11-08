---
id: context-engineering
book: 5
order: "5.4"
title: Context engineering
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [context, compaction, memory, budget]
visuals:
  - context-budget-planner:budget
  - compaction-sawtooth:explorer
  - subagent-isolation:diagram
---
> [!tldr]
> Context engineering is deciding what the model sees at each step: instructions, tools, examples, retrieved knowledge, history and memory, all competing for a finite window. More context is not better; the smallest set of high-signal tokens that lets the model do the job is.

## Why it matters
Once a prompt works on its own, the hard problems move to everything around it. An agent that reads twenty files, calls fifteen tools and talks for an hour has a context that grows, fills with stale tool output, and degrades. Most “the model got dumber halfway through” reports are context failures, and fixing them is cheaper than switching models.

## Intuition
The context window is the model’s working memory, and attention is its budget. Every token you add competes for that attention. Think of a desk: a good engineer keeps the current task, the relevant documents and a notebook on it, and files everything else where they can fetch it in seconds.

```viz
{"id":"context-budget-planner","component":"budget","title":"Every part of the context competes for the same window, and output needs room too","caption":"Drag the sliders. Watch what happens when retrieved documents and history grow: the reserve for the answer is the first thing teams forget.","alt":"Context budget planner: a stacked bar of a 200,000-token window split into system prompt, tool definitions, examples, retrieved documents, history, memory and an output reserve.","data":"illustrative","try":"Raise conversation history to 120k and see how little room is left for retrieval.","total":200000,"unit":"tokens","label":"Context window","warn":{"at":0.75,"text":"More than three quarters full: expect weaker recall of details, and plan compaction."},"parts":[{"label":"System prompt","value":3000,"role":"context","short":"System","max":20000,"step":500},{"label":"Tool definitions","value":12000,"role":"tool","short":"Tools","max":60000,"step":1000},{"label":"Examples","value":4000,"role":"context","max":20000,"step":500},{"label":"Retrieved documents","value":40000,"role":"data","short":"Docs","max":120000,"step":2000},{"label":"Conversation history","value":60000,"role":"human","short":"History","max":160000,"step":2000},{"label":"Memory and notes","value":5000,"role":"data","short":"Memory","max":30000,"step":1000},{"label":"Reserved for output","value":16000,"role":"model","short":"Output","max":64000,"step":1000}]}
```

## How it works
**What goes in.** Six kinds of content: instructions (the system prompt), tool definitions, examples, retrieved knowledge, the conversation or action history, and memory carried across sessions. Each has a different shelf life: instructions are stable, tool results go stale within a few turns.

**Budgeting and ordering.** Put stable content first and keep it byte-identical across calls, so [prompt caching](#prompt-caching) works. Put long documents before the question about them. Leave a reserve for the output and for reasoning.

**Context rot.** Model performance tends to fall as input grows, even on simple tasks and well inside the advertised window. Chroma’s 2025 “Context Rot” report measured this across many models; the older “Lost in the Middle” paper (Liu et al., 2023) showed that facts in the middle of a long context are used worst. See [long context](#long-context).

**The toolbox for long tasks:**

- **Compaction.** When the context nears a threshold, summarize the history into decisions, open questions and next steps, and start fresh from that summary.
- **Tool-result clearing.** Old tool outputs are the bulkiest and least useful tokens. Replace them with a one-line stub once acted on.
- **Just-in-time retrieval.** Keep lightweight references, such as file paths, ids and URLs, and load the content only when needed, the way a coding agent greps rather than reading the whole repository.
- **Structured notes.** Let the agent write a progress file or to-do list outside the context and re-read it. Rewriting the plan near the end of the context also keeps the goal in recent attention.
- **Sub-agent isolation.** Send noisy work to a subagent with its own window and take back only a summary. See [multi-agent systems](#multi-agent).
- **Cache-friendly, append-only context.** Do not edit earlier turns; append. Do not remove tool definitions mid-run, which breaks the cache; restrict tool choice instead where your API allows it.

Watch compaction keep a long session alive:

```viz
{"id":"compaction-sawtooth","component":"explorer","model":"sawtooth","title":"Compaction turns a context that overflows into a sawtooth that never does","caption":"Illustrative simulation: a fixed base of instructions and tools, a steady amount of new content each turn, and compaction to a summary at a threshold. Without compaction the window fills and the run must stop or truncate.","alt":"Line chart of tokens in context over 80 turns, with and without compaction, against a 200,000-token limit.","data":"illustrative","try":"Lower the threshold to 50%: more compactions, but each one throws away detail. Raise the summary size and watch the teeth get shorter."}
```

```viz
{"id":"subagent-isolation","component":"diagram","title":"A subagent reads 40,000 tokens so the main agent only has to read 1,000","caption":"Isolation is context engineering by architecture. The main agent’s context stays small and on-topic, at the price of extra total tokens and a lossy summary.","alt":"Diagram: a main agent sends a brief to a subagent, which reads many documents in its own context and returns a short summary.","data":"illustrative","w":580,"h":220,"nodes":[{"id":"main","label":"Main agent","sub":"context: 18k tokens","role":"agent","x":0,"y":80,"w":180,"h":56},{"id":"sub","label":"Subagent","sub":"fresh context","role":"agent","x":240,"y":80,"w":150,"h":56},{"id":"docs","label":"Search results","sub":"~40k tokens","role":"untrusted","x":440,"y":0,"w":140,"h":56},{"id":"files","label":"Files read","sub":"~12k tokens","role":"data","x":440,"y":160,"w":140,"h":56}],"edges":[{"from":"main","to":"sub","label":"brief","curve":-26},{"from":"sub","to":"main","label":"summary, ~1k","curve":-26},{"from":"sub","to":"docs"},{"from":"sub","to":"files"}]}
```

## In practice
A checklist for any agent context:

1. **Write the system prompt at the right altitude.** Specific enough to guide behavior, general enough to handle cases you did not foresee. Avoid long lists of brittle if-then rules.
2. **Keep tools few and distinct**, with compact results. See [tool design](#agent-tools).
3. **Retrieve just in time.** Prefer search tools and references over pasting everything up front.
4. **Bound every tool result** and clear old ones after they are used.
5. **Set a compaction threshold** and test the summary: can a fresh model continue the task from it alone?
6. **Keep a progress file** for anything longer than one session. See [long-running agents](#long-running-agents).
7. **Measure.** Track tokens per step, cache hit rate and task success as context grows.

```python
# Pseudocode: compaction inside an agent loop.
if count_tokens(messages) > 0.8 * WINDOW:
    summary = model.summarize(messages, instructions=(
        "Keep: the goal, decisions and why, files changed, open questions, next steps. "
        "Drop: raw tool output and dead ends."))
    messages = [system_prompt, {"role": "user", "content": f"Summary of work so far:\n{summary}"}]
```

> [!insight] Recitation
> Agents that rewrite their to-do list as they work keep the objective near the end of the context, where attention is strongest. The Manus team described this pattern in their 2025 write-up on context engineering, along with treating cache hit rate as a key production metric.

## Numbers to know
> [!number]
> Rules of thumb. Reserve output room explicitly, often several thousand tokens and more for reasoning models. Compaction thresholds between 70% and 90% of the window are common starting points. A long tool result is often 5 to 50 times the size of the model’s own message for that turn. Advertised context length is a ceiling, not a quality guarantee.

## Pitfalls and anti-patterns
> [!pitfall] Stuffing the window because it fits
> A 200,000-token window invites pasting everything. Quality, latency and cost all get worse, and failures become harder to trace.

- **Editing history mid-run.** Changing earlier messages invalidates the prompt cache and can confuse the model about what happened.
- **Summaries that drop the why.** A compacted history without reasons for decisions leads the agent to undo its own work.
- **Hiding errors.** Removing failed attempts from context makes the model retry them. Keep a short record of what failed.
- **One giant system prompt.** Thousands of rules dilute each other; move procedures into [skills](#skills-plugins) loaded on demand.

## Talk like an expert
The vocabulary: **attention budget**, **context rot**, **compaction**, **tool-result clearing**, **just-in-time retrieval**, **progressive disclosure**, **cache hit rate**, **recitation**. Experts frame context engineering as the successor to prompt engineering: the prompt is one part of a curated, changing context. Anthropic’s September 2025 essay “Effective context engineering for AI agents” is the standard reference. The live debate is how much of this will move into models trained to manage their own context.

> [!hottake] Context engineering is the most important skill in AI engineering today.
> **The counterargument:** it is a set of workarounds for current limits. As models get better at long contexts and at managing their own memory, much of it may be absorbed into the model and harness, leaving evaluation as the durable skill.

## Check yourself
```quiz
context-engineering
```

## Go deeper
- Anthropic engineering, “Effective context engineering for AI agents” (September 2025).
- Liu et al., “Lost in the Middle: How Language Models Use Long Contexts” (2023).
- Chroma research, “Context Rot” (2025), on degradation with input length.
- Manus, “Context Engineering for AI Agents: Lessons from Building Manus” (2025).

## Related
- [Prompting fundamentals](#prompting-fundamentals)
- [Prompt caching and token economics](#prompt-caching)
- [Efficient attention and long context](#long-context)
- [Multi-agent systems](#multi-agent)
- [Memory](#agent-memory)
- [Anatomy of an agent harness](#harness-anatomy)
- [Agent memory architectures and benchmarks](#agent-memory-architectures)
- [Instruction files: AGENTS.md, CLAUDE.md and rules](#agent-instruction-files)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Compaction, context editing and reasoning state](#context-compaction)
