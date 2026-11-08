---
id: agent-failure-modes
book: 9
order: "9.11"
title: Agent failure modes
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [failures, debugging, loops]
visuals:
  - failure-gallery:stepper
  - debug-playbook:tree
---
> [!tldr]
> Agents fail in a small number of recognizable ways: invented tools or arguments, loops, declaring victory too early, poisoned context, distraction, goal drift, over-eagerness and cascading errors. Each has a signature in the trace and a standard fix, and the debugging method is always the same: find the first wrong step.

## Why it matters
An agent’s final answer rarely tells you why it failed. The cause is usually many steps earlier: a misread tool result, a vague error message, an instruction lost to compaction. Teams that can name the failure mode from a trace fix agents in hours; teams that only look at outputs rewrite prompts for weeks.

## Intuition
A pilot’s incident report does not stop at “the plane landed hard”. It walks back through the checklist to the first deviation. Debugging an agent is the same: read the trajectory from the start, and the first step that departs from what a competent human would do is where the fix goes.

```viz
{"id":"failure-gallery","component":"stepper","title":"Nine failure modes, each with the trace excerpt that gives it away","caption":"Step through the gallery. Each frame shows a symptom, a short trace excerpt and the standard fix. Illustrative traces.","alt":"Stepper through nine agent failure modes, each with a trace excerpt and a fix.","data":"illustrative","try":"Before reading each fix, guess which harness part you would change: tools, context, prompt or budget.","frames":[
{"label":"Invented tool","caption":"Symptom: the model calls a tool that does not exist. Fix: fewer, distinct tools; return the list of valid tools in the error.","code":"tool_use: search_jira(query='login bug')\nerror: unknown tool 'search_jira'"},
{"label":"Invented arguments","caption":"Symptom: plausible but fake ids or paths. Fix: strict schemas, lookups before use, and errors that say how to find a valid value.","code":"tool_use: get_order(id='ORD-99812')\nerror: no order ORD-99812 (ids look like 2291)"},
{"label":"Loop","caption":"Symptom: the same call, the same result, again. Fix: loop detection, better error messages, a step budget.","code":"run_tests() -> 3 failed\nrun_tests() -> 3 failed\nrun_tests() -> 3 failed"},
{"label":"Premature done","caption":"Symptom: claims success without checking. Fix: require verification, such as running the tests, before the agent may finish.","code":"edit app.py\nmodel: The bug is fixed. (tests never run)"},
{"label":"Context poisoning","caption":"Symptom: an early wrong belief steers every later step. Fix: verify key facts with tools, and compact away disproven claims.","code":"step 2: 'The config lives in /etc/app.yaml' (wrong)\nsteps 3-14: edits a file that is never read"},
{"label":"Distraction","caption":"Symptom: a huge or irrelevant tool result derails the task. Fix: bound and summarize tool output; clear old results.","code":"cat server.log  -> 48,000 tokens\nmodel: starts analyzing unrelated warnings"},
{"label":"Goal drift","caption":"Symptom: the agent ends up solving a different problem. Fix: restate the goal in a progress file and re-read it after compaction.","code":"task: fix the date parser\nstep 20: refactoring the logging module"},
{"label":"Over-eagerness","caption":"Symptom: does more than asked, such as reformatting a whole file or adding features. Fix: explicit scope in the instructions and approvals for side effects.","code":"task: fix the typo in README\ndiff: 412 lines changed across 9 files"},
{"label":"Error cascade","caption":"Symptom: one failed step leads to a chain of compensating mistakes. Fix: stop and re-plan after a failure instead of patching forward.","code":"migration failed -> edits schema by hand\n-> tests fail -> disables tests"}]}
```

## How it works
Failures cluster by which harness part caused them:

- **Tool interface failures:** invented tools, invented arguments, misread results. The fix lives in [tool design](#agent-tools): distinct names, strict schemas, compact results, errors that teach.
- **Control failures:** loops, runaway steps, premature completion. The fix lives in the [loop controller](#agent-loop) and [guardrails](#guardrails-control): budgets, loop detection, verification before finishing.
- **Context failures:** poisoning, distraction, lost instructions after compaction. The fix lives in [context engineering](#context-engineering): bounded results, tested summaries, progress files.
- **Intent failures:** goal drift and over-eagerness. The fix lives in the instructions and in approvals: clear scope, stated success criteria, gates on side effects.
- **Coordination failures** in multi-agent systems: duplicated work, conflicting edits, lossy handoffs. Cemri et al. (2025) proposed a taxonomy of multi-agent failures that is a useful checklist. See [multi-agent systems](#multi-agent).

**The debugging playbook.** Read the full trajectory, not just the answer. Find the first step a competent human would not have taken. Classify it with the list above. Fix the cause in the right harness part. Add the trace to your eval set so it never regresses. See [error analysis](#error-analysis).

## In practice
Work through a failing run with this tree:

```viz
{"id":"debug-playbook","component":"tree","title":"Start at the first wrong step, then ask which part of the harness made it likely","caption":"Expand the branch that matches what you see in the trace. Each leaf points to where the fix belongs.","alt":"Decision tree for debugging a failed agent run from the first wrong step to the harness part to fix.","data":"illustrative","open":1,"root":{"label":"What does the first wrong step look like?","children":[
{"label":"A tool call that should not exist or has fake arguments","children":[{"label":"Tool interface: rename, merge or constrain tools; improve errors","link":"#agent-tools"}]},
{"label":"A repeated action with no new information","children":[{"label":"Loop controller: loop detection, budget, clearer error text","link":"#guardrails-control"}]},
{"label":"A confident claim that was never checked","children":[{"label":"Control: require verification before finishing","link":"#agent-loop"}]},
{"label":"A decision based on a wrong earlier belief","children":[{"label":"Context: verify facts with tools; compact away disproven claims","link":"#context-engineering"}]},
{"label":"Work outside the requested scope","children":[{"label":"Instructions and approvals: state scope and success criteria","link":"#human-in-the-loop"}]},
{"label":"A handoff that lost a constraint","children":[{"label":"Coordination: better briefs, structured summaries","link":"#multi-agent"}]}]}}
```

Instrument for diagnosis before you need it:
- **Log full trajectories** with tool inputs, outputs, token counts and timing. See [observability](#observability-tracing).
- **Tag runs with outcome** (success, failure, user abandoned) so you can sample failures.
- **Replay.** Store enough to rerun a trajectory from any step with a changed prompt or tool.
- **Count failure modes** over a sample, and fix the most frequent first.

## Numbers to know
> [!number]
> Rules of thumb. Most failed runs have one root cause early in the trajectory; later errors are usually consequences. Reading 20 to 50 failed trajectories is usually enough to find the top failure modes for an agent.

## Pitfalls and anti-patterns
> [!pitfall] Debugging from the final answer
> The last message shows the symptom. Fixes aimed at it, such as adding “double-check your work” to the prompt, rarely touch the cause.

- **Fixing one trace.** A change that fixes one run can break others; confirm on an eval set.
- **Blaming the model first.** Tools, context and budgets cause most failures.
- **No replay.** Without replay, every hypothesis needs a fresh, expensive, nondeterministic run.

## Talk like an expert
The vocabulary: **trajectory**, **first point of failure**, **context poisoning**, **goal drift**, **premature termination**, **error cascade**, **replay**. Experts say “show me the trace” and point at a step number. The live debate is how much self-correction to expect from models: better models recover from more mistakes, which hides harness bugs until a weaker moment exposes them.

> [!hottake] Most agent failures are tool and context bugs, not model limitations.
> **The counterargument:** some tasks genuinely exceed current models’ long-horizon reliability, and no amount of tool polish fixes that; recognizing a capability ceiling saves months of harness tweaking.

## Check yourself
```quiz
agent-failure-modes
```

## Go deeper
- Cemri et al., “Why Do Multi-Agent LLM Systems Fail?” (2025), a taxonomy of multi-agent failures.
- The [error analysis](#error-analysis) chapter for the reading-and-counting method.

## Related
- [Error analysis first](#error-analysis)
- [Guardrails and control](#guardrails-control)
- [Evaluating agents](#evaluating-agents)
- [The agent loop](#agent-loop)
- [Context engineering](#context-engineering)
