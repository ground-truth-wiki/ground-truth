---
id: working-with-coding-agents
book: 11
order: "11.6"
title: Working effectively with coding agents
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [workflow, spec-driven, review]
visuals:
  - plan-first-flow:stepper
  - task-spec-compare:compare
  - review-depth:tree
---
> [!tldr]
> Coding agents work best when you give them a spec, approve a plan, let tests provide the feedback, keep instructions in a context file, run parallel work in isolated worktrees, and review their output like a colleague’s pull request. Accepting code you have not read is fine for prototypes and risky for anything you will maintain.

## Why it matters
The same agent can produce a clean, tested change or a sprawling mess, depending mostly on how it is asked and checked. Teams that adopt a few habits get large productivity gains; teams that skip them accumulate code nobody understands. This chapter is the workflow layer on top of the [harness](#claude-code).

## Intuition
Working with a coding agent is like working with a very fast, very literal contractor. Vague instructions produce confident guesses. A clear brief, a plan you approve, a way to check the work and a proper inspection at the end produce a good job.

```viz
{"id":"plan-first-flow","component":"stepper","title":"Spec, plan, approve, implement, test, review: each gate is cheaper than the next one","caption":"Step through the workflow. Fixing a misunderstanding at the plan stage costs seconds; fixing it at review costs the whole implementation.","alt":"Stepper through a plan-first coding workflow from spec to merge.","data":"illustrative","diagram":{"w":600,"h":56,"nodes":[{"id":"spec","label":"Spec","role":"human","align":"center","glyph":false,"x":0,"y":0,"w":76,"h":56},{"id":"plan","label":"Plan","role":"agent","align":"center","glyph":false,"x":87,"y":0,"w":76,"h":56},{"id":"ok","label":"Approve","role":"human","align":"center","glyph":false,"x":174,"y":0,"w":76,"h":56},{"id":"impl","label":"Build","role":"agent","align":"center","glyph":false,"x":261,"y":0,"w":76,"h":56},{"id":"test","label":"Test","role":"tool","align":"center","glyph":false,"x":348,"y":0,"w":76,"h":56},{"id":"review","label":"Review","role":"human","align":"center","glyph":false,"x":435,"y":0,"w":76,"h":56},{"id":"merge","label":"Merge","role":"data","align":"center","glyph":false,"x":522,"y":0,"w":78,"h":56}],"edges":[{"from":"spec","to":"plan"},{"from":"plan","to":"ok"},{"from":"ok","to":"impl"},{"from":"impl","to":"test"},{"from":"test","to":"review"},{"from":"review","to":"merge"}]},
"frames":[
{"label":"Spec","highlight":["spec"],"caption":"Write what “done” means: behavior, constraints, files in scope, and how to verify it."},
{"label":"Plan","highlight":["plan"],"caption":"Ask the agent to explore and propose a plan without changing anything, for example in plan mode."},
{"label":"Approve","highlight":["ok"],"caption":"Read the plan. Correct misunderstandings now; it is the cheapest moment in the whole process."},
{"label":"Build","highlight":["impl"],"caption":"The agent implements the plan in small steps, ideally in its own branch or worktree."},
{"label":"Test","highlight":["test"],"caption":"Tests give the agent a real feedback signal. Ask it to write a failing test first when fixing bugs."},
{"label":"Review","highlight":["review"],"caption":"Read the diff like a colleague’s pull request: correctness, security, scope, and whether you understand it."},
{"label":"Merge","highlight":["merge"],"caption":"Merge only what you could maintain yourself. Add the task to your eval set if the agent struggled."}]}
```

## How it works
**Spec-driven development.** Before the agent starts, write the goal, the constraints, what is out of scope and how success is checked. A good spec is short and testable; it doubles as the pull request description.

**Plan first.** Ask for a plan before code. Plans reveal misread requirements, missing files and risky approaches while they are cheap to fix. Several agents have a read-only planning mode for this. See [planning strategies](#planning-reasoning).

**Test-driven loops.** Give the agent a way to check itself: an existing test suite, a new failing test, a type checker, a linter. Agents with feedback iterate toward correct code; agents without it stop at plausible code. See [coding agents](#coding-agents).

**Context files.** Put build commands, conventions, architecture notes and gotchas in `AGENTS.md` or `CLAUDE.md`. Every hour spent there saves many corrections later.

**Parallel agents.** Run independent tasks in separate git worktrees, containers or cloud sandboxes, so agents do not collide. Keep each task small and independent, and review each result separately. See [multi-agent systems](#multi-agent).

**Review AI-written code properly.** Check correctness against the spec, look for security issues and secrets, watch for unrequested changes and duplicated logic, and make sure you understand it. Reviewer agents can help, but a person who will maintain the code should read it.

**Vibe coding versus agentic engineering.** Vibe coding, a term Andrej Karpathy popularized in 2025, means accepting AI-generated code without reading it closely. It is a fine way to prototype. Agentic engineering is the disciplined version: specs, plans, tests and review, for code you will keep.

## In practice
The prompt decides most of the outcome:

```viz
{"id":"task-spec-compare","component":"compare","title":"A vague request gets a confident guess; a spec gets the change you meant","caption":"Hover the marks. The spec is longer, and it saves far more time than it costs.","alt":"Comparison of a vague coding request and a spec with goal, constraints, scope and verification.","data":"illustrative","mono":false,"a":{"title":"Vague","text":"Make the date parsing better and fix the bugs.","mono":false},"b":{"title":"Spec","text":"Goal: parse_date() must accept ISO 8601 with offsets (2026-11-03T10:00+01:00) and reject ambiguous formats like 03/11/26.\nConstraints: no new dependencies; keep the public signature.\nScope: src/dates.py and tests/test_dates.py only.\nVerify: add failing tests first, then make them pass; run the full suite.\nPlan first and wait for my approval.","mono":false},"links":[{"a":"better","b":"must accept ISO 8601 with offsets (2026-11-03T10:00+01:00) and reject ambiguous formats like 03/11/26.","note":"“Better” is unmeasurable; examples define it."},{"b":"no new dependencies; keep the public signature.","note":"Constraints prevent technically correct but unwelcome changes."},{"b":"src/dates.py and tests/test_dates.py only.","note":"Explicit scope stops over-eager refactors."},{"a":"fix the bugs","b":"add failing tests first, then make them pass","note":"A verification step gives the agent feedback and gives you proof."},{"b":"Plan first and wait for my approval.","note":"A plan gate catches misunderstandings before any code is written."}]}
```

```viz
{"id":"review-depth","component":"tree","title":"Review depth should scale with what the code can break","caption":"Expand by stakes. The question is never whether to review agent code, but how deeply.","alt":"Decision tree for how deeply to review AI-written code by risk level.","data":"illustrative","open":1,"root":{"label":"What can this change break?","children":[
{"label":"Nothing that matters: a prototype or a throwaway script","children":[{"label":"Skim it and run it; vibe coding is fine here"}]},
{"label":"An internal tool or a test","children":[{"label":"Read the diff, run the tests, check scope"}]},
{"label":"Production code","children":[{"label":"Full review: correctness, security, scope, readability, tests; a reviewer agent first, then a human","link":"#coding-agents"}]},
{"label":"Security-sensitive code, auth, payments or data deletion","children":[{"label":"Full review by someone who owns the area, plus targeted tests and threat modeling","link":"#threat-modeling"}]}]}}
```

Daily habits:
- Start each task with a spec and a plan gate.
- Keep tasks small: one concern per change.
- Ask for a failing test first when fixing bugs.
- Use subagents or a second agent to review, then read it yourself.
- Update the context file whenever you correct the same thing twice.

## Numbers to know
> [!number]
> Rules of thumb. A five-line spec and a plan gate typically cost a minute and save many minutes of rework. Keep agent changes small enough to review in one sitting, often a few hundred lines at most.

## Pitfalls and anti-patterns
> [!pitfall] Merging code nobody read
> Tests cover what someone thought to test. Unread code accumulates security holes, duplicated logic and design debt that only surfaces later.

- **Huge tasks.** Large changes are hard to review and easy to get subtly wrong.
- **Parallel agents on the same files.** They conflict; give each its own scope and worktree.
- **Skipping the plan for “simple” tasks.** Simple tasks are where scope creep starts.
- **Re-explaining the same conventions.** Put them in the context file once.

## Talk like an expert
The vocabulary: **spec-driven development**, **plan mode**, **test-driven loop**, **context file**, **worktrees**, **reviewer agent**, **vibe coding**, **agentic engineering**. Experts measure coding agents by review effort and defect rates, not lines generated. The live debate is how review scales: as agents write most code, whether human review remains the bottleneck and what replaces it.

> [!hottake] The scarcest skill in AI-assisted engineering is reviewing code you did not write.
> **The counterargument:** strong tests, type systems and automated reviewers can carry much of the load, and expecting humans to read every line of agent output may be as unrealistic as reading every line of a compiler’s output.

## Check yourself
```quiz
working-with-coding-agents
```

## Go deeper
- The Claude Code documentation’s best-practice guides for agentic coding.
- Simon Willison’s writing on vibe coding versus responsible AI-assisted programming (2025), on simonwillison.net.

## Related
- [Coding agents](#coding-agents)
- [Case study: Claude Code](#claude-code)
- [The coding-harness landscape](#coding-harness-landscape)
- [Planning and reasoning strategies](#planning-reasoning)
- [Sandboxes and execution environments](#sandboxes)
