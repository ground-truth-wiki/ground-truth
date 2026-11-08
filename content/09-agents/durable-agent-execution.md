---
id: durable-agent-execution
book: 9
order: "9.8.1"
title: Durable execution for agents in depth
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [durable-execution, workflow-engines, sagas, idempotency, human-approval]
visuals: []
prerequisites: [long-running-agents, agent-loop]
---
> [!tldr]
> Durable execution splits an agent into deterministic orchestration code and side-effecting steps, such as model calls, tool calls and I/O, whose results are journaled, so a crashed or paused run replays to where it stopped instead of starting over. The same machinery lets an agent wait days for a human approval. Remember that replay runs your orchestration code more than once, so every side effect must be a recorded step, safe to repeat, or undoable.

## Key ideas

- **Orchestration versus activities, history and replay.** In Temporal, workflow code orchestrates and activities do anything that touches the outside world, including LLM invocations: each activity's result is recorded in the workflow's event history, and after a crash the workflow code reruns from the beginning while recorded results are reused instead of recomputed. That is why workflow code must not read the clock, generate random numbers or call the network directly; it uses the SDK's replay-safe time, random and timer APIs, and if replay emits different commands than the history records, the execution fails with a non-determinism error ([Temporal, “Workflows”](https://docs.temporal.io/workflows); [Temporal, “Workflow Definition”](https://docs.temporal.io/workflow-definition)).
- **Waiting for a human is a durable pause.** Temporal timers are persisted, can last from one second to several years, and still fire after a worker outage once the worker is back, and Temporal says workflows can “keep running” for years; as of November 2026, LangGraph's `interrupt()` pauses a graph, needs a checkpointer to save its state, and resumes with `Command(resume=...)` on the same `thread_id`, which its docs call “effectively your persistent cursor”. The OpenAI Agents SDK pauses tools marked `needs_approval`, returns the pending calls as `interruptions`, and lets you store the run with `state.to_json()` or `state.to_string()` until someone calls `approve` or `reject` and resumes with `Runner.run(agent, state)` (as of November 2026) ([Temporal, “Timers and Start Delays”](https://docs.temporal.io/workflow-execution/timers-delays); [Temporal, “Workflows”](https://docs.temporal.io/workflows); [LangGraph, “Interrupts”](https://docs.langchain.com/oss/python/langgraph/interrupts); [OpenAI Agents SDK, “Human-in-the-loop”](https://openai.github.io/openai-agents-python/human_in_the_loop/)).
- **Make side effects before a pause idempotent.** On resume, LangGraph restarts the interrupted node from its beginning, so code before `interrupt()` runs again; its docs advise idempotent operations, or moving side effects after the interrupt or into separate nodes. The OpenAI Agents SDK warns that approval does not guarantee exactly-once execution, recommends stable idempotency keys for tools with external effects, and says to deserialize saved run state only from trusted storage ([LangGraph, “Interrupts”](https://docs.langchain.com/oss/python/langgraph/interrupts); [OpenAI Agents SDK, “Human-in-the-loop”](https://openai.github.io/openai-agents-python/human_in_the_loop/)).
- **Sagas for effects you cannot take back.** A saga is a sequence of local transactions where a failure triggers compensating transactions for the completed steps; compensable steps come first, the pivot is the point of no return, and the retryable steps after it must be idempotent so the saga can always finish. The same page warns that compensating transactions might not always succeed. For an agent, that makes the first action it cannot undo, such as sending a message, the pivot to guard most carefully, for example with an [approval gate](#human-in-the-loop) ([Microsoft Azure Architecture Center, “Saga design pattern”](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)).
- **Checkpoint granularity, and how frameworks plug in.** As of November 2026, LangGraph checkpoints at every super-step and offers three durability modes: `exit` saves only when the run ends and cannot recover from a mid-run crash, `async` writes while the next step runs with a small risk of a lost checkpoint, and `sync` writes before each step at some performance cost. Pydantic AI, also as of November 2026, records each model request and wrapped tool call on an engine such as Temporal, DBOS, Prefect or Restate, replays completed calls after a restart and retries the one in progress; the graph side is covered in [graph workflow runtimes](#graph-workflow-runtimes) ([LangGraph, “Checkpointers”](https://docs.langchain.com/oss/python/langgraph/checkpointers); [Pydantic AI, “Durable Execution”](https://pydantic.dev/docs/ai/integrations/durable_execution/overview/)).
- **Harness-level durability, and testing resume.** Anthropic's long-running coding harness has an initializer agent create a `claude-progress.txt` log, a JSON feature list that coding agents may edit only by changing each entry's `passes` field, an `init.sh` script and an initial git commit; each later session works on one feature, verifies it end to end and commits, which counters declaring victory early, leaving a broken environment and marking features done without testing. On the engine side, Temporal's test suite replays recorded histories against new workflow code (its docs suggest doing this in CI) and a time-skipping environment fast-forwards timers, so a workflow that sleeps for a day finishes in seconds ([Anthropic, “Effective harnesses for long-running agents” (November 2025)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents); [Temporal, “Testing suite” (Python)](https://docs.temporal.io/develop/python/testing-suite)).

## Planned visuals

- **`sequence`:** an agent workflow whose model call and tool call are activities, then a durable wait for approval, a worker crash, replay from the event history, and the interrupted tool call retried with the same idempotency key.
- **`stepper`:** an illustrative saga for an agent that books travel: compensable holds, the payment as pivot, retryable confirmations after it, and the compensations that run when a step before the pivot fails.
- **`compare`:** the same approval pause in LangGraph (`interrupt()`, checkpointer, `thread_id`) and in the OpenAI Agents SDK (`needs_approval`, `interruptions`, serialized `RunState`), with links between the equivalent parts and the re-execution trap marked.

## Talk like an expert

Engineers talk about **workflows** and **activities**, **event history** and **replay**, **determinism**, **durable timers**, **idempotency keys**, **compensations** and the **pivot**. They ask “what happens if the process dies on this line?” and “which step is the point of no return?”, and they test resume by replaying real histories rather than trusting that it works.

## Go deeper

- [Temporal, “Workflows”](https://docs.temporal.io/workflows): event history, replay, replay-safe code and activities.
- [LangGraph, “Interrupts”](https://docs.langchain.com/oss/python/langgraph/interrupts): pausing for human input, checkpointers, thread ids and the side-effect rules.
- [Microsoft Azure Architecture Center, “Saga design pattern”](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga): compensable, pivot and retryable transactions, choreography and orchestration.
- [Anthropic, “Effective harnesses for long-running agents” (November 2025)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents): durability through progress files, feature lists and git.

## Related

- [Long-running and durable agents](#long-running-agents)
- [Graph workflow runtimes: state, super-steps and checkpoints](#graph-workflow-runtimes)
- [Human in the loop](#human-in-the-loop)
- [Reliability engineering](#reliability-engineering)
- [Agent SDK primitives: runners, tools, guardrails, sessions and tracing](#agent-sdk-primitives)
