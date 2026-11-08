---
id: graph-workflow-runtimes
book: 13
order: "13.3.1"
title: "Graph workflow runtimes: state, super-steps and checkpoints"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [graph-workflows, langgraph, state-management, checkpoints, orchestration]
visuals: []
prerequisites: [orchestration-frameworks, workflow-patterns]
---
> [!tldr]
> Graph workflow runtimes such as LangGraph and Microsoft Agent Framework workflows run an application as nodes that read and write a shared, typed state, executed in synchronized rounds called super-steps, with a checkpoint at the end of each round. That model, run in the style of Google's Pregel system, is what makes parallel branches, pauses for a human, resume after a crash and replay from history possible. The one thing to remember: updates are merged by reducers and saved per super-step, so design your state schema and your side effects around those two rules.

## Key ideas

- **State, reducers, nodes and edges.** A LangGraph state is a shared snapshot whose keys each define how updates merge: without a reducer a write replaces the value, with one it is combined, and `add_messages` appends new messages while updating existing ones by id, which plain list concatenation cannot do. Nodes are functions, normal edges always route to the next node, conditional edges choose it at runtime, and `START` and `END` mark where input enters and where a path stops ([LangGraph, “Graph API”](https://docs.langchain.com/oss/python/langgraph/graph-api)).
- **Super-steps come from Pregel.** LangGraph's runtime follows the bulk synchronous parallel model: each step plans which actors run from the channels updated last, executes them in parallel with their writes hidden until the step ends, then applies those writes to the channels, so nodes that run in parallel share one super-step and their writes to a shared key meet in its reducer. The idea comes from Malewicz et al., “Pregel: A System for Large-Scale Graph Processing” (2010), where each vertex reads the messages sent to it in superstep S−1 and sends messages that arrive in superstep S+1 ([LangGraph, “Runtime (Pregel)”](https://docs.langchain.com/oss/python/langgraph/pregel); [Malewicz et al., “Pregel: A System for Large-Scale Graph Processing” (2010)](https://doi.org/10.1145/1807167.1807184)).
- **Dynamic fan-out and combined commands.** `Send` runs the same node once per item, each with its own input, when the number of items is known only at runtime, and a node can return `Command(update=..., goto=...)` to update state and choose the next hop in one step, or use `Command.PARENT` to jump from a subgraph to a node in its parent graph. The recursion limit caps how many super-steps one run may execute and raises `GraphRecursionError` when exceeded, and runtime context passes dependencies such as a database handle to nodes without putting them in the state ([LangGraph, “Graph API”](https://docs.langchain.com/oss/python/langgraph/graph-api)).
- **Checkpoints, threads and time travel.** A checkpointer saves a snapshot at every super-step boundary under a `thread_id`, with in-memory and SQLite implementations for experiments and Postgres, MongoDB and Azure Cosmos DB implementations the docs mark for production (as of November 2026); the durability mode decides when it writes: `exit` only when the run exits, `async` while the next step runs, `sync` before the next step starts. The saved history lets you replay from a prior checkpoint or fork from it to try another path, and stream modes expose a run as full state (`values`), state `updates` after each step, LLM `messages`, `custom` data, `checkpoints`, `tasks` or `debug` events; engine-level durability is covered in [durable execution for agents](#durable-agent-execution) ([LangGraph, “Checkpointers”](https://docs.langchain.com/oss/python/langgraph/checkpointers); [LangGraph, “Streaming”](https://docs.langchain.com/oss/python/langgraph/streaming)).
- **Interrupts rerun the node.** `interrupt()` pauses the graph and returns a value to the caller, and the value passed to `Command(resume=...)` becomes the return value of that call; but the node restarts from its beginning on resume, so side effects before the interrupt should be idempotent; static breakpoints set before or after a node are not recommended for human-in-the-loop flows ([LangGraph, “Interrupts”](https://docs.langchain.com/oss/python/langgraph/interrupts)).
- **The same model elsewhere, and the alternatives.** Microsoft Agent Framework workflows connect executors through edges and conditions and fan out and in, in .NET, Python and Go; the .NET and Python graph APIs checkpoint at superstep boundaries, and Python adds an experimental functional `@workflow` API with per-`@step` result caching (as of November 2026); LangGraph's functional API (`@entrypoint`, `@task`) similarly saves task results so a resume restores them instead of recomputing. Event-driven runtimes route by events instead of declared edges: LlamaIndex Workflows run the step whose type annotation accepts the returned event, and CrewAI Flows, built on an event-driven model, chain methods with `@start`, `@listen` and `@router` ([Microsoft Learn, “Workflow concepts”](https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/); [LangGraph, “Functional API”](https://docs.langchain.com/oss/python/langgraph/functional-api); [LlamaIndex, “Workflows”](https://developers.llamaindex.ai/python/framework/module_guides/workflow/); [CrewAI, “Flows”](https://docs.crewai.com/en/concepts/flows)).

## Planned visuals

- **`stepper`:** one graph run super-step by super-step: plan, execute in parallel, apply writes through reducers, checkpoint; with a `Send` fan-out over three items and the fan-in that follows, showing what each checkpoint holds.
- **`compare`:** the same two parallel branches writing one key, first with no reducer and then with `add_messages`, with linked highlights on the merged state.
- **`sequence`:** an interrupt and resume: the node runs up to `interrupt()`, the checkpoint is saved, the caller resumes with `Command(resume=...)`, the node reruns from its first line, and a side effect that is not idempotent runs twice.

## Talk like an expert

Experts talk about **state schemas**, **reducers** and **channels**, **super-steps**, **fan-out** with `Send` and **fan-in**, **checkpointers** and **threads**, **interrupts** and **time travel**. They ask “what does the checkpoint hold after this super-step?” and “is this node safe to rerun?”, and they adopt a graph only when they need parallel branches, pauses or replay; otherwise a plain loop or a chain from [workflow patterns](#workflow-patterns) is easier to read.

## Go deeper

- [LangGraph, “Graph API”](https://docs.langchain.com/oss/python/langgraph/graph-api): state, reducers, edges, super-steps, `Send`, `Command`, subgraphs and the recursion limit.
- [LangGraph, “Runtime (Pregel)”](https://docs.langchain.com/oss/python/langgraph/pregel): the plan, execution and update phases over actors and channels.
- [Malewicz et al., “Pregel: A System for Large-Scale Graph Processing” (2010)](https://doi.org/10.1145/1807167.1807184): the original superstep model, from SIGMOD 2010.
- [Microsoft Learn, “Workflow concepts”](https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/): executors, edges, superstep checkpoints and the functional API in Agent Framework.

## Related

- [Orchestration frameworks](#orchestration-frameworks)
- [Durable execution for agents in depth](#durable-agent-execution)
- [Workflow patterns](#workflow-patterns)
- [Multi-agent orchestration patterns](#multi-agent-patterns)
- [Long-running and durable agents](#long-running-agents)
- [Selection guide and matrix](#framework-selection)
