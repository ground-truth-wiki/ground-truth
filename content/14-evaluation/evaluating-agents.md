---
id: evaluating-agents
book: 14
order: "14.6"
title: Evaluating agents
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [agent-evals, trajectories, simulated-users]
visuals:
  - trajectory-viewer:trace
  - outcome-compare:compare
  - simulated-user:sequence
---
> [!tldr]
> Evaluate agents on outcomes (did the task get done, checked against final state), on trajectories (were the steps safe, efficient and sensible) and on reliability (does it succeed every time). Use sandboxed environments, simulated users and multiple attempts, and read the trajectories behind every score.

## Why it matters
Agents take many steps, change state and behave differently on every run. A final-answer check misses an agent that got the right result by deleting the wrong file along the way, and a single run misses an agent that succeeds only two times in three. Agent evaluation needs its own methods, and without them teams ship agents whose reliability nobody has measured.

## Intuition
Evaluating an agent is like evaluating a new driver. You check that they reach the destination, but also how they drove there, and you send them out more than once before handing over the keys.

```viz
{"id":"trajectory-viewer","component":"trace","title":"The trajectory shows the first wrong step that the final answer hides","caption":"An illustrative refund task. Click a span for details. The final message says the refund succeeded; the trace shows it refunded the wrong order at step 5.","alt":"Span waterfall of an agent run with model calls and tool calls, where one refund call targets the wrong order.","data":"illustrative","spans":[
{"name":"agent run: refund double charge","start":0,"dur":12000,"depth":0,"kind":"agent"},
{"name":"model: plan","start":0,"dur":2400,"depth":1,"kind":"model"},
{"name":"tool: search_orders(email)","start":2400,"dur":700,"depth":1,"kind":"tool","note":"Returns orders 2290 and 2291."},
{"name":"model: reason","start":3100,"dur":2200,"depth":1,"kind":"model","note":"Decides 2291 is the duplicate."},
{"name":"tool: get_order(2291)","start":5300,"dur":500,"depth":1,"kind":"tool"},
{"name":"tool: issue_refund(2290)","start":5800,"dur":600,"depth":1,"kind":"untrusted","note":"First wrong step: refunds 2290, the original order, instead of the duplicate 2291."},
{"name":"model: final message","start":6400,"dur":5600,"depth":1,"kind":"model","note":"Reports success. An outcome check on the database state catches it; a text check would not."}]}
```

## How it works
**Outcome evaluation.** Check the end state, not the agent’s claim about it: run the tests, query the database, diff the files, inspect the sent email. SWE-bench grades by hidden tests; τ-bench compares the final database state with the expected one.

**Trajectory evaluation.** Grade the path: forbidden actions taken, unnecessary steps, tool errors, approvals requested, cost and time. Some properties need rules (never call `delete_*` without approval), others a judge reading the trajectory against a rubric.

**Simulated users.** Many agents talk to people. A model playing a user with a hidden goal and persona lets you test multi-turn behavior repeatably:

```viz
{"id":"simulated-user","component":"sequence","title":"A simulated user with a hidden goal makes multi-turn agent tests repeatable","caption":"Step through one τ-bench-style episode. The checker compares the final database state with the expected state; the episode is repeated k times to measure reliability.","alt":"Sequence diagram of a user simulator, an agent, tools and a state checker during a simulated customer-service episode.","data":"illustrative","actors":[{"id":"sim","label":"User simulator","role":"human"},{"id":"agent","label":"Agent","role":"agent"},{"id":"db","label":"Tools and database","role":"tool"},{"id":"check","label":"State checker","role":"data"}],
"messages":[
{"from":"sim","to":"agent","label":"I was charged twice","payload":{"hidden_goal":"refund the duplicate charge on order 2291 only","persona":"impatient, gives order details only when asked"},"note":"The simulator knows the goal; the agent does not."},
{"from":"agent","to":"sim","label":"Which order?","kind":"response"},
{"from":"sim","to":"agent","label":"The one from Tuesday, 2291"},
{"from":"agent","to":"db","label":"issue_refund(2291)"},
{"from":"db","to":"agent","label":"refunded","kind":"response"},
{"from":"agent","to":"sim","label":"Done: refund issued","kind":"response"},
{"from":"check","to":"db","label":"compare final state","payload":{"expected":{"order_2291":"refunded","order_2290":"charged"},"actual":{"order_2291":"refunded","order_2290":"charged"},"result":"pass"},"note":"Grade the state, not the transcript. Repeat k times and report pass^k."}]}
```

**Environments.** Agents need sandboxed copies of the systems they act on: test databases, mock APIs, containerized repositories. See [sandboxes](#sandboxes) and [eval harnesses](#eval-harnesses).

**Benchmarks.** SWE-bench Pro for software engineering (OpenAI stopped reporting SWE-bench Verified in February 2026, citing contamination and flawed tests), Terminal-Bench for terminal tasks, τ-bench and τ²-bench for tool-using customer agents, OSWorld for computer use, WebArena for web tasks, GAIA and BrowseComp for research and browsing. Public benchmarks test general capability; your own tasks decide fitness for your product. See [benchmark literacy](#benchmark-literacy).

**Reliability and cost.** Run each task several times; report pass@1, pass^k, tokens, time and dollars per task. A slower, more reliable agent may be the better product.

## In practice
```viz
{"id":"outcome-compare","component":"compare","title":"Two runs with the same final answer: one is safe to ship, one is not","caption":"Illustrative trajectories for “clean up old log files”. Hover the marks: only trajectory evaluation tells them apart.","alt":"Comparison of two agent trajectories that reach the same outcome, one with a dangerous step that was blocked.","data":"illustrative","a":{"title":"Run A","text":"1. list ./logs\n2. find files older than 30 days: 40\n3. delete 40 files in ./logs\n4. report: deleted 40 files\nsteps: 4   cost: $0.03"},"b":{"title":"Run B","text":"1. rm -rf /var/log/*   (blocked by policy)\n2. rm -rf /var/log/*   (blocked)\n3. list ./logs\n4. delete 40 files in ./logs\n5. report: deleted 40 files\nsteps: 5   cost: $0.05"},"links":[{"a":"4. report: deleted 40 files","b":"5. report: deleted 40 files","note":"Identical outcomes: an outcome-only eval scores both as passes."},{"b":"1. rm -rf /var/log/*   (blocked by policy)","note":"Run B attempted a destructive command twice. In an environment without that policy, it would have succeeded."},{"a":"steps: 4   cost: $0.03","b":"steps: 5   cost: $0.05","note":"Efficiency is part of the trajectory score too."}]}
```

An agent eval checklist:
- Tasks with checkable end states, in sandboxed environments.
- Rules for forbidden actions and required approvals, applied to every trajectory.
- A trajectory rubric for efficiency and judgment, scored by a calibrated judge.
- Three or more attempts per task; pass@1 and pass^k reported.
- Cost, steps and time per task.
- Every failure’s trajectory read by a person before fixes. See [agent failure modes](#agent-failure-modes).

## Numbers to know
> [!number]
> Formulas and rules of thumb. With per-attempt success p, pass^k = pᵏ: an agent at 90% succeeds on eight consecutive runs only about 43% of the time. Three to five attempts per task give a usable estimate of reliability.

## Pitfalls and anti-patterns
> [!pitfall] Grading the agent’s own report of success
> Agents claim success they did not achieve. Check the state.

- **Outcome-only evaluation.** Dangerous or wasteful paths pass unnoticed.
- **One run per task.** Reliability is invisible.
- **Evaluating in production systems.** Use sandboxes and copies.
- **Benchmark scores as product readiness.** Your tasks and tools differ.

## Talk like an expert
The vocabulary: **trajectory**, **outcome versus process evaluation**, **final-state check**, **simulated user**, **environment**, **pass@1 and pass^k**, **cost per task**. Experts ask “how many attempts, and what was checked?” for every agent score, and read failing trajectories before believing any summary. The live debate is how to evaluate long-horizon agents that run for hours, where tasks are expensive to build and outcomes slow to verify.

> [!hottake] Reliability, not capability, is the bottleneck for agents in production.
> **The counterargument:** for many valuable tasks a human reviews the result anyway, so an agent that succeeds often enough to save time is useful even if it is far from perfectly reliable.

## Check yourself
```quiz
evaluating-agents
```

## Go deeper
- Jimenez et al., “SWE-bench” (2023); Yao et al., “τ-bench” (2024); Xie et al., “OSWorld” (2024).
- Anthropic engineering writing on evaluating agents (2025 onward).

## Related
- [Agent failure modes](#agent-failure-modes)
- [Evaluation harnesses](#eval-harnesses)
- [Metrics and graders](#metrics-graders)
- [Benchmark literacy](#benchmark-literacy)
- [Sandboxes and execution environments](#sandboxes)
