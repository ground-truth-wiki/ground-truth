---
id: vercel-agent-tools-removed
book: 22
order: "22.13"
title: "Vercel's d0: a text-to-SQL agent cut down to bash and files"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [agents, tool-design, text-to-sql, harness-engineering, public-record]
visuals: []
type: field-note
account: public-record
industry: "Software and cloud platform (internal analytics)"
use_case: "d0, an internal agent that answers natural-language questions in Slack by writing SQL against Vercel's analytics infrastructure"
outcome: "On 5 representative queries, success rate went from 4/5 (80%) to 5/5 (100%) and average execution time from 274.8s to 77.4s"
measured_how: "Vercel's own benchmark of the old and new architecture on 5 representative queries (success rate, time, tokens, steps); no date, grader or repeat runs stated (Vercel blog, 22 Dec 2025)"
prerequisites: [agent-tools]
replications: []
---
> [!tldr]
> Vercel rebuilt d0, its internal agent that turns questions asked in Slack into SQL, replacing a set of specialized tools with one tool that runs bash commands over the files of its Cube semantic layer. On 5 representative queries, the post reports "100% success rate instead of 80%" and average execution time down from 274.8s to 77.4s. Its own caveat: the change "only worked because our semantic layer was already good documentation."

> [!note] From the public record
> Built from Vercel's own published account, "We removed 80% of our agent’s tools" (December 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The post introduces d0 this way: "If v0 is our AI for building UI, d0 is our AI for understanding data." Staff ask d0 questions in Slack, and it "translates natural language questions into SQL queries against our analytics infrastructure", so they get answers without writing code or waiting on the data team. Reliability matters because "When it breaks, people lose trust and go back to pinging analysts in Slack." The post gives no usage figures.

## What happened

1. **A heavily scaffolded first version.** "We spent months building" d0, the post says. Expecting the model to get lost in complex schemas, make bad joins or hallucinate table names, the team built specialized tools (schema lookup, query validation, error recovery and more), heavy prompt engineering, careful context management and hand-coded retrieval of schema information. A code snippet labelled ai-sdk@6.0.0-beta.160 lists the tools by name, among them GetEntityJoins, SearchSchema, JoinPathFinder, SyntaxValidator and ExecuteSQL. The verdict: "it was fragile, slow, and required constant maintenance."
2. **A hypothesis.** "What if bash is all you need?" The idea was to give Claude the raw Cube DSL files, since models are getting smarter and context windows larger.
3. **The rebuild.** The team "stripped the agent down to a single tool: execute arbitrary bash commands", a "file system agent" that reads the semantic layer with grep, cat, find and ls, then writes SQL. The new snippet, labelled ai-sdk@6.0.0, shows an ExecuteCommand tool running in a Vercel Sandbox loaded with the catalog files, next to the ExecuteSQL tool.
4. **The stack, as of December 2025:** Claude Opus 4.5 via the AI SDK; Vercel Sandbox for context exploration; Vercel Gateway for request handling and observability; a Next.js API route using Vercel Slack Bolt; and the Cube semantic layer "as a directory of YAML, Markdown, and JSON files".
5. **A benchmark** on 5 representative queries, then publication on 22 December 2025. The post dates neither the rebuild nor the benchmark.

## Impact, and how it was measured

"We benchmarked the old architecture against the new file system approach across 5 representative queries." The post's table, old against new:

- **Success rate:** 4/5 (80%) against 5/5 (100%), listed as +20%.
- **Average execution time:** 274.8s against 77.4s, listed as "3.5x faster".
- **Average token usage:** ~102k tokens against ~61k tokens, listed as "37% fewer tokens".
- **Average steps:** ~12 steps against ~7 steps, listed as "42% fewer steps".
- **Worst case:** "The old architecture’s worst case took 724 seconds, 100 steps, and 145,463 tokens before failing." The new agent "completed the same query in 141 seconds with 19 steps and 67,483 tokens, and it actually succeeded."

The post also says, without a measurement, that the agent "catches edge cases we never anticipated".

**Not measured:** the post does not list the 5 queries, say how or by whom success was judged, date the benchmark, or say whether runs were repeated. It does not say which model ran the old architecture in the benchmark, although the snippets for both versions name "anthropic/claude-opus-4.5". The prose gives no tool counts. There are no production results, such as accuracy on real questions, cost or user trust.

## Why it happened

Looking back, the post says, "we were solving problems the model could handle on its own." "We were doing the model’s thinking for it", and "Every edge case meant another patch, and every model update meant re-calibrating our constraints." It adds: "We were spending more time maintaining the scaffolding than improving the agent."

On the model: the team constrained reasoning because it did not trust the model to reason, and "With Opus 4.5, that constraint became a liability." On the data: the semantic layer files "contain dimension definitions, measure calculations, and join relationships", so "We were building tools to summarize what was already legible."

## What changed afterwards

The rebuild is the change the post reports, presented as "v2" of d0. It reports no later changes, rollout figures or follow-up measurement.

## Lessons

The source's own lessons:

- **Use what exists.** "Don’t fight gravity." Grep, the post notes, is 50 years old, and the team "were building custom tools for what Unix already solves."
- **Fewer tools.** "Every tool is a choice you’re making for the model."
- **Documentation first.** The YAML files are well structured and consistently named. On a data layer of legacy naming and undocumented joins, raw file access would not help: "You’ll just get faster bad queries."
- **Start simple, build ahead.** "Start with the simplest possible architecture", add complexity only when proven necessary, and "Build for the model that you’ll have in six months".

The wiki's reading:

- **Treat the numbers as a direction.** Five queries with no stated grading rule or repeat runs cannot separate a real gain from run-to-run variation. See [Statistics for evals](#eval-statistics) and [Evaluating agents](#evaluating-agents).
- **Tool design encodes assumptions.** Narrow tools carry the builder's guesses about what the model cannot do; revisit them when the model changes. The post's caveat marks the limit: the gain rested on data that was already well documented. See [Tool use and tool design](#agent-tools) and [Harness engineering](#harness-engineering).
- **A bash tool needs isolation.** d0 runs its commands in Vercel Sandbox. The post does not discuss permissions or security, so teams copying the pattern must work those out. See [Sandboxes and execution environments](#sandboxes).

## Disclosure

None.

## Sources

- Andrew Qu (Chief of Software, Vercel), Vercel, [“We removed 80% of our agent’s tools”](https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools), Vercel blog, 22 December 2025.

## Related

- [About field notes](#about-field-notes)
- [Tool use and tool design](#agent-tools)
- [Data-analysis and notebook agents](#data-analysis-agents)
- [Harness engineering](#harness-engineering)
- [Evaluating agents](#evaluating-agents)
