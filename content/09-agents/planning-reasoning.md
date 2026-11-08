---
id: planning-reasoning
book: 9
order: "9.5"
title: Planning and reasoning strategies
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [planning, react, reflexion]
visuals:
  - strategy-gallery:diagram
  - react-vs-plan:compare
---
> [!tldr]
> Agents can think one step at a time (ReAct), write a plan and execute it, plan all tool calls up front and run them in parallel, search over alternative paths, or reflect on failures and retry. Each strategy spends extra calls to buy robustness, and reasoning models now do much of this planning internally.

## Why it matters
The loop in [the agent loop](#agent-loop) says nothing about how the model decides. On short tasks the default ReAct style is fine. On long tasks, agents drift, repeat themselves or commit early to a bad path, and explicit planning, re-planning or reflection is how teams fix that. Knowing the strategies lets you pick one deliberately instead of stacking prompt tricks.

## Intuition
Think of ways to cross an unfamiliar city. ReAct is walking and checking the map at every corner. Plan-and-execute is writing the route first, then following it and re-routing when a street is closed. ReWOO is booking every leg of the trip in advance. Tree search is sending scouts down several streets and following the best. Reflexion is walking it, getting lost, writing down why, and walking it again.

```viz
{"id":"strategy-gallery","component":"diagram","title":"Five planning strategies differ in when the model plans and how often it reconsiders","caption":"Switch tabs. Arrows that loop back mean the strategy reconsiders; arrows that fan out mean it runs steps in parallel.","alt":"Gallery of five planning strategies: ReAct, plan and execute, ReWOO, tree search and Reflexion.","data":"illustrative","try":"Compare ReWOO with ReAct: which one can run tools in parallel, and which one can react to a surprising result?","w":560,"h":200,"variants":[
{"name":"ReAct","note":"Think, act, observe, repeat. Adapts to every result; cannot see far ahead. The default for most agents.","nodes":[{"id":"t","label":"Think","role":"model","x":0,"y":70,"w":130,"h":56},{"id":"a","label":"Act","sub":"one tool call","role":"tool","x":215,"y":70,"w":130,"h":56},{"id":"o","label":"Observe","sub":"read the result","role":"context","x":430,"y":70,"w":130,"h":56}],"edges":[{"from":"t","to":"a"},{"from":"a","to":"o"},{"from":"o","to":"t","curve":60,"label":"next step"}]},
{"name":"Plan and execute","note":"Write a multi-step plan, execute it step by step, and re-plan only when a step fails or reveals something new. Keeps long tasks on track.","nodes":[{"id":"p","label":"Planner","sub":"writes steps 1 to n","role":"model","x":0,"y":70,"w":150,"h":56},{"id":"e","label":"Executor","sub":"one step at a time","role":"agent","x":205,"y":70,"w":150,"h":56},{"id":"d","label":"Done?","x":410,"y":70,"w":150,"h":56}],"edges":[{"from":"p","to":"e","label":"plan"},{"from":"e","to":"d"},{"from":"d","to":"p","curve":60,"label":"re-plan on failure"}]},
{"name":"ReWOO","note":"The planner writes every tool call up front, with placeholders for results; workers run them, in parallel where possible; a solver writes the answer. Fewer model calls, no mid-course correction.","nodes":[{"id":"p","label":"Planner","sub":"all calls, with #E1, #E2","role":"model","x":0,"y":70,"w":170,"h":56},{"id":"w1","label":"Worker 1","role":"tool","x":220,"y":0,"w":120,"h":48},{"id":"w2","label":"Worker 2","role":"tool","x":220,"y":76,"w":120,"h":48},{"id":"w3","label":"Worker 3","role":"tool","x":220,"y":152,"w":120,"h":48},{"id":"s","label":"Solver","sub":"answer from evidence","role":"model","x":400,"y":70,"w":160,"h":56}],"edges":[{"from":"p","to":"w1"},{"from":"p","to":"w2"},{"from":"p","to":"w3"},{"from":"w1","to":"s"},{"from":"w2","to":"s"},{"from":"w3","to":"s"}]},
{"name":"Tree search","note":"Expand several candidate steps, score them with a model or a test, and continue from the best (Tree of Thoughts, LATS). Strong on puzzles and planning; expensive.","nodes":[{"id":"r","label":"Root state","role":"context","x":0,"y":72,"w":120,"h":52},{"id":"b1","label":"Option A","sub":"score 0.2","x":175,"y":0,"w":130,"h":52},{"id":"b2","label":"Option B","sub":"score 0.8","role":"model","x":175,"y":74,"w":130,"h":52},{"id":"b3","label":"Option C","sub":"score 0.4","x":175,"y":148,"w":130,"h":52},{"id":"c","label":"Expand B","sub":"keep the best","role":"agent","x":380,"y":74,"w":180,"h":52}],"edges":[{"from":"r","to":"b1"},{"from":"r","to":"b2"},{"from":"r","to":"b3"},{"from":"b2","to":"c"}]},
{"name":"Reflexion","note":"Attempt, get feedback from a test or judge, write a short lesson, and retry with the lesson in context. Works when the feedback is real.","nodes":[{"id":"a","label":"Attempt","role":"agent","x":0,"y":70,"w":120,"h":56},{"id":"e","label":"Evaluate","sub":"tests or judge","role":"tool","x":150,"y":70,"w":125,"h":56},{"id":"r","label":"Reflect","sub":"write a lesson","role":"model","x":305,"y":70,"w":120,"h":56},{"id":"m","label":"Lesson memory","role":"data","x":455,"y":70,"w":105,"h":56}],"edges":[{"from":"a","to":"e"},{"from":"e","to":"r","label":"fail"},{"from":"r","to":"m"},{"from":"m","to":"a","curve":70,"label":"retry with lesson"}]}]}
```

## How it works
**ReAct** (Yao et al., 2022) interleaves a reasoning step with each action. It adapts instantly to surprising results and is cheap per step, but it is myopic: nothing forces it to consider the whole task.

**Plan-and-execute** (related to Plan-and-Solve prompting, Wang et al., 2023) separates planning from execution. A planner writes steps; an executor works through them; a re-planner revises the plan when a step fails. Plans also make progress visible to users. See [agent UX](#agent-ux).

**ReWOO** (Xu et al., 2023, “Reasoning WithOut Observation”) plans the whole chain of tool calls with placeholders for their results, so tools can run without the model in between. **LLMCompiler** (Kim et al., 2023) goes further and schedules independent calls in parallel. Both save model calls and latency; both fail when an early result should have changed the plan.

**Search over thoughts.** Tree of Thoughts (Yao et al., 2023) and Graph of Thoughts (Besta et al., 2023) generate several candidate steps and evaluate them; LATS (Zhou et al., 2023) adds Monte Carlo tree search with environment feedback. They shine on puzzles and planning problems with a scoring signal, and cost many calls per step.

**Reflection.** Reflexion (Shinn et al., 2023) stores a verbal lesson after each failed attempt and retries; Self-Refine (Madaan et al., 2023) iterates generate, critique, revise. Gains depend on the critique being grounded in something real, such as failing tests or a calibrated judge.

**Reasoning models change the picture.** Models trained with [reinforcement learning on verifiable tasks](#rlvr-reasoning) plan, backtrack and check their work inside their thinking tokens. With them, explicit scaffolding often helps less, and the main levers become effort settings, interleaved thinking between tool calls, and good plans written to a file the agent can re-read. See [reasoning models](#reasoning-models).

## In practice
Compare one task under the two most common strategies:

```viz
{"id":"react-vs-plan","component":"compare","title":"ReAct reacts to each result; plan-and-execute keeps the whole task in view","caption":"Illustrative traces for the same task. Hover the marks: ReAct notices the surprise sooner, while the plan keeps the agent from forgetting step 4.","alt":"Side-by-side traces of a ReAct agent and a plan-and-execute agent migrating a configuration file.","data":"illustrative","a":{"title":"ReAct","text":"think: find where the config is loaded\nact: grep 'load_config'\nobserve: 3 call sites\nthink: start with app.py\nact: edit app.py\nobserve: tests fail in worker.py\nthink: worker.py also parses old keys\nact: edit worker.py\nobserve: tests pass\ndone (forgot to update the docs)"},"b":{"title":"Plan and execute","text":"plan:\n  1. find every loader of the config\n  2. update each to the new keys\n  3. run tests\n  4. update docs/config.md\nexecute 1: grep -> app.py, worker.py, cli.py\nexecute 2: edit all three\nexecute 3: tests pass\nexecute 4: docs updated\ndone"},"links":[{"a":"observe: tests fail in worker.py","b":"execute 1: grep -> app.py, worker.py, cli.py","note":"ReAct discovers worker.py through a failure; the plan finds every loader before editing."},{"a":"done (forgot to update the docs)","b":"4. update docs/config.md","note":"A written plan keeps late steps alive. ReAct only does what the latest observation suggests."},{"a":"think: start with app.py","b":"execute 2: edit all three","note":"ReAct moved file by file; the plan batched edits after full discovery."}]}
```

Decision rules:
- **Default to ReAct with a written plan.** Ask the agent to keep a short to-do list in its context or a file, and update it as it works. You get adaptivity and memory of the goal.
- **Use plan-and-execute** when tasks are long, steps are knowable and users want to approve the plan first.
- **Use ReWOO or parallel planning** when tool calls are independent and latency matters.
- **Use search** only with a cheap, trustworthy scorer.
- **Use reflection** only with real feedback; reflection on vibes tends to rephrase the same mistake.

```text
Pseudocode: plan-and-execute with re-planning.
plan = planner(task)                      # list of steps
while plan.next_step and budget_left():
    result = executor(plan.next_step)     # a short ReAct loop per step
    plan = replanner(task, plan, result)  # keep, revise or finish
```

## Numbers to know
> [!number]
> Rules of thumb. ReAct costs one model call per action; plan-and-execute adds a planning call and occasional re-planning calls; tree search multiplies calls by the branching factor at each level. Parallel planning can cut wall-clock time roughly in proportion to how many independent tool calls run at once.

## Pitfalls and anti-patterns
> [!pitfall] Stacking strategies by default
> Planning plus reflection plus tree search on every task multiplies cost and latency for gains you have not measured. Add one strategy at a time and keep it only if the eval moves.

- **Plans that never change.** A plan is a hypothesis; re-plan when results contradict it.
- **Reflection without ground truth.** Self-critique with no external check often makes confident answers more confident.
- **Hidden plans.** Users trust agents more when they can see and edit the plan.

## Talk like an expert
The vocabulary: **ReAct**, **plan-and-execute**, **re-planning**, **ReWOO**, **LLMCompiler**, **Tree and Graph of Thoughts**, **LATS**, **Reflexion**, **self-refine**, **interleaved thinking**. Experts ask “what is the feedback signal?” before adding reflection, and “are these calls independent?” before adding parallel planning. The live debate is how much explicit scaffolding still pays with strong reasoning models; the honest answer is that it depends on the model and must be measured in your [harness](#harness-engineering).

> [!hottake] With reasoning models, explicit planning scaffolds are mostly obsolete.
> **The counterargument:** long tasks still overflow any single context, and a plan written to a file survives compaction, crashes and handoffs in a way that thinking tokens do not. Externalized plans are memory, not just reasoning.

## Check yourself
```quiz
planning-reasoning
```

## Go deeper
- Yao et al., “ReAct” (2022), and Yao et al., “Tree of Thoughts: Deliberate Problem Solving with Large Language Models” (2023).
- Xu et al., “ReWOO: Decoupling Reasoning from Observations for Efficient Augmented Language Models” (2023).
- Kim et al., “An LLM Compiler for Parallel Function Calling” (2023).
- Shinn et al., “Reflexion: Language Agents with Verbal Reinforcement Learning” (2023).

## Related
- [The agent loop](#agent-loop)
- [Reasoning prompts](#reasoning-prompts)
- [Workflow patterns](#workflow-patterns)
- [Reasoning models and test-time compute](#reasoning-models)
- [Long-running and durable agents](#long-running-agents)
- [Model-based RL, planning and Monte Carlo tree search](#planning-mcts)
- [A field guide to prompting techniques](#prompting-techniques)
- [Test-time search, sampling and verification](#test-time-search)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Can LLMs plan? Classical planners, search and verifiers](#llm-planning-debate)
