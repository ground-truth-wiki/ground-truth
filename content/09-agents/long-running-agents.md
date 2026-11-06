---
id: long-running-agents
book: 9
order: "9.8"
title: Long-running and durable agents
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [durable-execution, checkpointing, background-agents]
visuals:
  - long-run-timeline:trace
  - resume-stepper:stepper
  - progress-file-compare:compare
---
> [!tldr]
> Agents that run for hours need what long-running software always needed: checkpoints, resumability, idempotent steps and a durable record of progress. Add compaction so the context survives the run, and a progress file so a fresh session can pick up the thread after a crash, a timeout or a handoff.

## Why it matters
Interactive agents finish in minutes. Background coding agents, research agents and data pipelines can run for hours, across many context windows, on infrastructure that restarts. Without durability, one crash at hour three throws away the work, and a retry repeats side effects such as emails or payments. Long-running agents are distributed systems, and they fail like them.

## Intuition
A long-running agent is a night-shift worker on a multi-day project. They keep a logbook of what is done and what is next, save their work often, leave a clear handover note, and never send the same invoice twice. If the power goes out, the next shift reads the logbook and continues.

```viz
{"id":"long-run-timeline","component":"trace","title":"A three-hour run survives two compactions and a crash because every step was checkpointed","caption":"Illustrative timeline. Click a span for details. The crash at 1 h 50 min costs two minutes, not two hours, because the run resumes from its last checkpoint.","alt":"Span waterfall of a three-hour agent run with work phases, two compactions, a crash, a resume from checkpoint and a final report.","data":"illustrative","spans":[
{"name":"agent session","start":0,"dur":10800000,"depth":0,"kind":"agent","note":"One task, many context windows."},
{"name":"plan and progress file","start":0,"dur":300000,"depth":1,"kind":"model","note":"Writes goals and a task list to a file."},
{"name":"work: tasks 1 to 4","start":300000,"dur":3000000,"depth":1,"kind":"tool","note":"Each finished task is checkpointed."},
{"name":"compaction 1","start":3300000,"dur":60000,"depth":1,"kind":"context","note":"History summarized; progress file kept."},
{"name":"work: tasks 5 to 8","start":3360000,"dur":3240000,"depth":1,"kind":"tool"},
{"name":"crash: worker restarted","start":6600000,"dur":60000,"depth":1,"kind":"untrusted","note":"Process killed during task 9."},
{"name":"resume from checkpoint","start":6660000,"dur":60000,"depth":1,"kind":"agent","note":"Replays the journal; tasks 1 to 8 are not repeated."},
{"name":"work: tasks 9 to 12","start":6720000,"dur":3300000,"depth":1,"kind":"tool"},
{"name":"compaction 2","start":9000000,"dur":60000,"depth":1,"kind":"context"},
{"name":"final report","start":10200000,"dur":600000,"depth":1,"kind":"model","note":"Summary with links to every change."}]}
```

## How it works
**Durable execution.** Engines such as Temporal, Restate, Inngest and DBOS record the result of each step in a journal. After a crash, the workflow replays from the journal: completed steps return their recorded results instantly, and execution continues where it stopped. Model calls and tool calls become steps.

**Idempotency.** A step that may run twice must be safe to run twice. Give side-effecting tools an idempotency key, so a retried “send email” or “create invoice” is recognized and skipped. See [reliability engineering](#reliability-engineering).

**Checkpoints for agents.** Save the agent’s state at natural boundaries: after each task, before risky actions, before compaction. State includes the message history or its summary, the plan, and pointers to files changed.

**Compaction across sessions.** Long runs exceed any context window. Compact by summarizing decisions, open questions and next steps, and drop raw tool output. Test the summary: could a fresh model continue from it alone? See [context engineering](#context-engineering).

**Progress files.** A plain file in the workspace with the goal, a task list with status, decisions and why, and known problems. The agent updates it as it works and re-reads it after compaction or restart. It is also how humans check on the run.

**Background and ambient agents.** Agents started by schedules or events rather than chat: nightly dependency upgrades, triage of new issues, monitoring. They need clear triggers, budgets, notifications and a way to ask for help. Coding agents now ship scheduled and recurring tasks for exactly this. See [Claude Code](#claude-code).

Watch a crash and resume:

```viz
{"id":"resume-stepper","component":"stepper","title":"Replaying the journal skips finished steps and retries the interrupted one safely","caption":"Step through. Steps that completed return their recorded results; the interrupted step reruns with the same idempotency key, so its side effect happens exactly once.","alt":"Stepper showing a five-step agent workflow that crashes during step 3 and resumes from its journal.","data":"illustrative","diagram":{"w":600,"h":150,"nodes":[{"id":"s1","label":"Step 1","sub":"plan","role":"model","x":0,"y":0,"w":108,"h":52},{"id":"s2","label":"Step 2","sub":"edit files","role":"tool","x":123,"y":0,"w":108,"h":52},{"id":"s3","label":"Step 3","sub":"open PR","role":"external","x":246,"y":0,"w":108,"h":52},{"id":"s4","label":"Step 4","sub":"run CI","role":"tool","x":369,"y":0,"w":108,"h":52},{"id":"s5","label":"Step 5","sub":"report","role":"model","x":492,"y":0,"w":108,"h":52},{"id":"j","label":"Journal","sub":"recorded results","role":"data","x":200,"y":98,"w":200,"h":52}],"edges":[{"from":"s1","to":"s2"},{"from":"s2","to":"s3"},{"from":"s3","to":"s4"},{"from":"s4","to":"s5"},{"from":"s1","to":"j","style":"dashed"},{"from":"s2","to":"j","style":"dashed"}]},
"frames":[
{"label":"Step 1","highlight":["s1","j"],"caption":"The plan is written and its result recorded in the journal."},
{"label":"Step 2","highlight":["s2","j"],"caption":"Files are edited; the list of changed files is recorded."},
{"label":"Crash","highlight":["s3"],"caption":"While opening the pull request, the worker is killed. Did the PR get created? The process does not know."},
{"label":"Replay","highlight":["s1","s2","j"],"caption":"A new worker replays the journal. Steps 1 and 2 return their recorded results instantly; no files are edited twice."},
{"label":"Retry step 3","highlight":["s3"],"caption":"Step 3 reruns with the same idempotency key. The code host recognizes it and returns the existing PR instead of opening a second one."},
{"label":"Continue","highlight":["s4","s5"],"caption":"CI runs and the report is written. The crash cost minutes, not the whole run."}]}
```

## In practice
A progress file is the cheapest durability you can add, and it is only as good as what it records:

```viz
{"id":"progress-file-compare","component":"compare","title":"A good progress file lets a stranger continue the work; a vague one forces a restart","caption":"Hover the marks. The good file records state, reasons and next actions, and it is short.","alt":"Comparison of a vague handoff note and a structured progress file for a long-running agent.","data":"illustrative","a":{"title":"Vague note","text":"Working on the migration. Made good\nprogress, fixed some stuff in the\nparser. Tests mostly pass. Need to\nfinish the rest."},"b":{"title":"Progress file","text":"# Goal\nMigrate config loading to v2 keys.\n\n# Tasks\n[x] 1. Find all loaders (app, worker, cli)\n[x] 2. Update app.py and worker.py\n[ ] 3. Update cli.py  <- next\n[ ] 4. Update docs/config.md\n\n# Decisions\n- Kept v1 keys as fallback until 2026-12\n  (customers pin old configs).\n\n# Known problems\n- test_cli_env fails; unrelated flake,\n  see issue #812."},"links":[{"a":"Working on the migration.","b":"Migrate config loading to v2 keys.","note":"Name the goal precisely; “the migration” means nothing to a fresh context."},{"a":"Made good\nprogress","b":"[x] 2. Update app.py and worker.py","note":"Checkable task states instead of adjectives."},{"a":"Need to\nfinish the rest.","b":"<- next","note":"Point at the exact next action."},{"a":"fixed some stuff in the\nparser.","b":"Kept v1 keys as fallback until 2026-12\n  (customers pin old configs).","note":"Record decisions with their reasons, or the next session will undo them."},{"a":"Tests mostly pass.","b":"test_cli_env fails; unrelated flake,\n  see issue #812.","note":"Known failures, explained, so nobody chases them again."}]}
```

A checklist for any agent expected to run longer than one context window:
1. **A budget** in steps, tokens, dollars and wall-clock time, enforced in code.
2. **Checkpoints** after each unit of work, in a durable store.
3. **Idempotency keys** on every side-effecting tool.
4. **A progress file** the agent maintains and re-reads.
5. **Compaction** at a threshold, with a tested summary format.
6. **Notifications** when the run finishes, fails or needs a decision. See [human in the loop](#human-in-the-loop).
7. **A kill switch** that stops the run from outside. See [guardrails](#guardrails-control).

## Numbers to know
> [!number]
> Rules of thumb. Checkpoint at least every few minutes of work or after every side effect, whichever comes first. A compaction summary of a few thousand tokens is common. Background agents commonly run for tens of minutes to hours; budget them in dollars as well as steps.

## Pitfalls and anti-patterns
> [!pitfall] Retrying side effects blindly
> A retry loop around “send the email” without an idempotency key sends it again. Durable execution protects you only if every side effect can be recognized when repeated.

- **State in memory only.** Anything not written down is lost on restart.
- **Summaries that drop the why.** The next session undoes decisions it does not understand.
- **Silent background failures.** A background agent that fails without telling anyone is worse than no agent.
- **No time limit.** A stuck agent can burn budget for hours; cap wall-clock time.

## Talk like an expert
The vocabulary: **durable execution**, **journal** and **replay**, **idempotency key**, **checkpoint**, **resumability**, **progress file**, **compaction across sessions**, **background** or **ambient agent**. Experts ask “what happens if the process dies at step 37?” and “is this step safe to run twice?”. The live debate is where durability belongs: in a workflow engine around the agent, or inside the agent harness itself.

> [!hottake] Every serious agent platform will become a durable workflow engine.
> **The counterargument:** many valuable agent tasks are short and interactive, where durability machinery adds latency and complexity for little benefit; a progress file and a retry are enough.

## Check yourself
```quiz
long-running-agents
```

## Go deeper
- Documentation for Temporal, Restate, Inngest and DBOS on durable execution and workflows.
- The [reliability engineering](#reliability-engineering) chapter for retries and idempotency.

## Related
- [The agent loop](#agent-loop)
- [Memory](#agent-memory)
- [Context engineering](#context-engineering)
- [Reliability engineering](#reliability-engineering)
- [Case study: Claude Code](#claude-code)
