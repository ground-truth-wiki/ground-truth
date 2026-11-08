---
id: agent-sdk-primitives
book: 13
order: "13.2.1"
title: "Agent SDK primitives: runners, tools, guardrails, sessions and tracing"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [agent-sdks, guardrails, sessions, tracing, handoffs]
visuals:
  - agent-sdk-primitives-map:diagram
  - agent-sdk-primitives-run:stepper
  - agent-sdk-primitives-state:compare
  - agent-sdk-primitives-trace:trace
prerequisites: [provider-agent-sdks, agent-loop]
---
> [!tldr]
> Agent SDKs package the same parts under different names: an agent definition, a runner that loops until a final output or a limit, and attachments for tools, guardrails, hooks, state, run context and tracing. Learn the parts once, then check where each SDK differs: defaults, state and traces.

## Why it matters
The OpenAI Agents SDK, the Claude Agent SDK, Google’s Agent Development Kit (ADK), Strands Agents, Microsoft Agent Framework, Pydantic AI and the AI SDK all package the [agent loop](#agent-loop) ([when to use one](#provider-agent-sdks)). They name the same parts differently, and their defaults cost money or leak data in different ways. As of November 2026, one stops after 10 turns, another has no turn limit unless you set one, and one traces full prompts by default. Knowing the parts lets you compare and debug them.

## Intuition
Think of a restaurant kitchen. The recipe is the agent definition, and the runner is the cook, tasting and acting until the dish is done. Around the cook: inspectors at the door and the pass (guardrails), house rules (hooks), the order ticket (session), a pantry key the cook never serves (run context) and a camera over the stove (tracing).

```viz
{"id":"agent-sdk-primitives-map","component":"diagram","title":"Every agent SDK is a runner with the same parts attached; only the names change","caption":"The runner loops; the parts around it decide what goes in, what may happen and what gets recorded. Dashed lines carry nothing to the model. Click a part for its chapter. Illustrative.","alt":"Diagram of the runner at the center, connected to the agent definition, tools, guardrails, session, hooks and middleware, run context, model provider and tracing.","data":"illustrative","try":"Find the two parts whose contents the model never sees.","w":600,"h":236,"nodes":[
{"id":"def","label":"Agent definition","sub":"prompt, model, tools","role":"agent","x":0,"y":0,"w":190,"h":56,"link":"#provider-agent-sdks"},
{"id":"tools","label":"Tools","sub":"functions, MCP","role":"tool","x":205,"y":0,"w":190,"h":56,"link":"#agent-tools"},
{"id":"guard","label":"Guardrails","sub":"input, output, tool","x":410,"y":0,"w":190,"h":56,"link":"#guardrails-control"},
{"id":"session","label":"Session","sub":"conversation state","role":"data","x":0,"y":90,"w":190,"h":56,"link":"#agent-memory"},
{"id":"runner","label":"Runner","sub":"loop until an exit","role":"agent","x":205,"y":90,"w":190,"h":56,"link":"#agent-loop"},
{"id":"hooks","label":"Hooks, middleware","sub":"around every call","x":410,"y":90,"w":190,"h":56,"link":"#harness-anatomy"},
{"id":"ctx","label":"Run context","sub":"local, never sent","x":0,"y":180,"w":190,"h":56},
{"id":"model","label":"Model provider","sub":"behind an interface","role":"model","x":205,"y":180,"w":190,"h":56,"link":"#gateways-routers"},
{"id":"trace","label":"Tracing","sub":"spans to processors","role":"data","x":410,"y":180,"w":190,"h":56,"link":"#observability-tracing"}],
"edges":[{"from":"def","to":"runner"},{"from":"tools","to":"runner","both":true},{"from":"guard","to":"runner"},{"from":"session","to":"runner","both":true},{"from":"hooks","to":"runner"},{"from":"ctx","to":"runner","style":"dashed"},{"from":"runner","to":"model","both":true},{"from":"runner","to":"trace","style":"dashed"}]}
```

## How it works
**The agent definition** has four common slots: instructions, a model, tools and an output type ([`output_type`](https://openai.github.io/openai-agents-python/agents/) in the OpenAI SDK, [`output_schema`](https://adk.dev/agents/llm-agents/) in ADK, [`output`](https://ai-sdk.dev/docs/agents/building-agents) in the AI SDK).

The same parts in seven SDKs, as of November 2026:

| SDK | Run the loop | Tool from code | Intercept | Keep state |
|---|---|---|---|---|
| OpenAI Agents SDK | `Runner.run`, `max_turns` | `@function_tool` | guardrails, [`RunHooks`](https://openai.github.io/openai-agents-python/agents/) | sessions, server ids |
| Claude Agent SDK | `query`, `max_turns`, `max_budget_usd` | [`@tool`](https://code.claude.com/docs/en/agent-sdk/custom-tools) in an SDK MCP server | hooks, permission modes | resume or fork |
| Google ADK | `Runner`, `max_llm_calls` | plain functions | [callbacks, plugins](https://adk.dev/callbacks/) | `SessionService` |
| Strands Agents | `agent("…")` | `@tool` | [hook events](https://strandsagents.com/docs/user-guide/sdk/agents/hooks/) | [session managers](https://strandsagents.com/docs/user-guide/sdk/agents/session-management/) |
| Microsoft Agent Framework | `agent.run` | `@tool` | [agent, function, chat middleware](https://learn.microsoft.com/en-us/agent-framework/agents/middleware/) | `AgentSession` |
| Pydantic AI | `agent.run`, `UsageLimits` | `@agent.tool` | [output validators](https://pydantic.dev/docs/ai/core-concepts/dependencies/) | `message_history` |
| AI SDK (TypeScript) | `ToolLoopAgent`, `stopWhen` | `tool()` | [`prepareStep`](https://ai-sdk.dev/docs/agents/loop-control) | [UI messages](https://ai-sdk.dev/docs/agents/building-agents) |

**The runner** calls the model and branches. In the OpenAI SDK’s [loop](https://openai.github.io/openai-agents-python/running_agents/), output of the right type with no tool calls ends the run; a handoff swaps the current agent and loops; tool results are appended and it loops. At the turn limit it raises `MaxTurnsExceeded` unless a `max_turns` error handler returns a fallback; the Claude Agent SDK yields an [`error_max_turns`](https://code.claude.com/docs/en/agent-sdk/agent-loop) result with no final text, and a single-shot `query()` then raises.

```viz
{"id":"agent-sdk-primitives-run","component":"stepper","title":"A run ends in a final output, a limit or a pause you can resume days later","caption":"Illustrative support run using the OpenAI Agents SDK’s names. Step through the three loop branches, an approval pause and the turn limit.","alt":"Stepper through a two-agent run: parallel input guardrail, a tool call, a handoff, a tool that needs approval and pauses the run, resumption from saved state, the final output with its output guardrail, and the turn limit.","data":"illustrative","depicts":"OpenAI Agents SDK, as of November 2026","try":"Before step 4, predict what happens to the Python process while the approval waits.","diagram":{"w":600,"h":152,"nodes":[
{"id":"user","label":"User","sub":"input","role":"human","x":0,"y":0,"w":105,"h":52},
{"id":"gin","label":"Input guardrail","sub":"first agent only","x":115,"y":0,"w":150,"h":52},
{"id":"runner","label":"Runner","sub":"max_turns=6","role":"agent","x":275,"y":0,"w":135,"h":52},
{"id":"model","label":"Model","sub":"current agent","role":"model","x":420,"y":0,"w":180,"h":52},
{"id":"approval","label":"Approval","sub":"paused run","role":"human","x":0,"y":100,"w":125,"h":52,"link":"#human-in-the-loop"},
{"id":"tools","label":"Tools","sub":"functions","role":"tool","x":135,"y":100,"w":130,"h":52},
{"id":"billing","label":"Billing","sub":"after handoff","role":"agent","x":275,"y":100,"w":135,"h":52},
{"id":"gout","label":"Output guardrail","sub":"last agent only","x":420,"y":100,"w":180,"h":52}],
"edges":[{"from":"user","to":"gin"},{"from":"gin","to":"runner"},{"from":"runner","to":"model","both":true},{"from":"runner","to":"tools"},{"from":"tools","to":"approval"},{"from":"runner","to":"billing","label":"handoff"},{"from":"billing","to":"gout"}]},
"frames":[
{"label":"Start","highlight":["user","gin","runner","model"],"edges":["user>gin","gin>runner","runner>model"],"caption":"`Runner.run(triage, …, max_turns=6)` starts. The triage agent’s input guardrail runs in parallel with the first model call, which is the default."},
{"label":"Tool call","highlight":["runner","model","tools"],"edges":["runner>tools"],"caption":"The model asks for `lookup_charges`. The runner runs the function tool, appends the result and loops."},
{"label":"Handoff","highlight":["runner","model","billing"],"edges":["runner>billing"],"caption":"The model calls `transfer_to_billing`. The runner makes Billing the current agent and loops. By default Billing sees the whole conversation."},
{"label":"Pause","highlight":["billing","tools","approval"],"edges":["tools>approval"],"caption":"Billing asks for `refund_charge`, a tool with `needs_approval=True`. No decision is stored, so the run stops and `result.interruptions` lists the call. The app saves the state as JSON, and the process may exit.","code":"state = result.to_state()\nsave(run_id, state.to_json())"},
{"label":"Resume","highlight":["approval","runner","tools"],"caption":"A person approves the next morning. The app restores the `RunState` from trusted storage, calls `state.approve(…)` and passes the state back to `Runner.run`. The refund runs."},
{"label":"Final output","highlight":["billing","gout"],"edges":["billing>gout"],"caption":"Billing replies with text and no tool calls: the final output. Billing’s output guardrails check it, because it is now the last agent."},
{"label":"Limit","highlight":["runner"],"caption":"Had six turns passed without a final output, `Runner.run` would have raised `MaxTurnsExceeded`, unless a `max_turns` error handler returned a fallback output."}]}
```

**Tools** come from code: the OpenAI SDK [reads](https://openai.github.io/openai-agents-python/tools/) the signature with `inspect` and the docstring with `griffe`; Strands’ [`@tool`](https://strandsagents.com/docs/user-guide/sdk/tools/custom-tools/) reads type hints and the docstring. Hosted tools run on the provider’s side. MCP toolsets import a server’s tools ([MCP](#mcp-architecture)); filter them ([`create_static_tool_filter`](https://openai.github.io/openai-agents-python/mcp/), ADK’s [`tool_filter`](https://adk.dev/tools-custom/mcp-tools/)), because each exposed tool costs context and widens what the model can do ([tool design](#agent-tools)).

**Handoffs or agents as tools.** A [handoff](https://openai.github.io/openai-agents-python/handoffs/) is a tool such as `transfer_to_refund_agent` that passes control and, by default, the whole history; an [agent called as a tool](https://openai.github.io/openai-agents-python/tools/) gets the input the caller writes for it and does not inherit the conversation. See [multi-agent orchestration patterns](#multi-agent-patterns).

**Guardrails** in the [OpenAI SDK](https://openai.github.io/openai-agents-python/guardrails/) check the first agent’s input, the last agent’s final output or one function tool (not hosted tools or handoffs). A tripped tripwire raises an exception and halts the run. Input guardrails run in parallel with the agent by default, so when one trips, tokens may be spent and tools may have run; `run_in_parallel=False` blocks until the check passes ([guardrails and control](#guardrails-control)).

**Conversation state** has three homes: the client resends history (`result.to_input_list()`, Pydantic AI’s [`message_history`](https://pydantic.dev/docs/ai/core-concepts/message-history/)); an SDK session stores it ([OpenAI sessions](https://openai.github.io/openai-agents-python/sessions/), ADK’s [`SessionService`](https://adk.dev/sessions/session/), Agent Framework’s [`AgentSession`](https://learn.microsoft.com/en-us/agent-framework/agents/conversations/)); or the provider keeps it behind an id (`conversation_id`, `previous_response_id`). Use one per conversation: mixing client history with server state can duplicate context.

```viz
{"id":"agent-sdk-primitives-state","component":"compare","title":"Mixing two state strategies can send the model every earlier turn twice","caption":"Illustrative second turn of a support chat, using the OpenAI Agents SDK’s names. Hover or focus a marked passage.","alt":"Side-by-side comparison of a second chat turn with only server-managed state, where the client sends the new message, and with client history added on top, where earlier turns appear twice.","data":"illustrative","depicts":"OpenAI Agents SDK conversation-state options, as of November 2026","a":{"title":"One strategy: conversation_id","text":"Turn 2, what the app sends:\n  conversation_id = conv_123\n  input = \"And the second order?\"\n\nWhat the model reads:\n  user: Where is order A123?\n  assistant: It shipped on Monday.\n  user: And the second order?"},"b":{"title":"Mixed: to_input_list() plus conversation_id","text":"Turn 2, what the app sends:\n  conversation_id = conv_123\n  input = result.to_input_list() + new turn\n\nWhat the model reads:\n  user: Where is order A123?\n  assistant: It shipped on Monday.\n  user: Where is order A123?  (again)\n  assistant: It shipped on Monday.  (again)\n  user: And the second order?"},"links":[{"a":"input = \"And the second order?\"","b":"input = result.to_input_list() + new turn","note":"With server-managed state the app sends only the new turn. to_input_list() resends history the conversation already holds."},{"a":"user: And the second order?","b":"user: Where is order A123?  (again)","note":"Every earlier turn now appears twice: more input tokens on every call, and a transcript that confuses the model."},{"a":"conversation_id = conv_123","b":"conversation_id = conv_123","note":"Pick one strategy per conversation. The SDK refuses a session combined with conversation_id or previous_response_id in one run, but it cannot stop you resending history yourself."}]}
```

**Run context** is dependency injection: an object you pass to the run, such as a database client, reaches tools, hooks and dynamic instructions ([`RunContextWrapper`](https://openai.github.io/openai-agents-python/context/), Pydantic AI’s [`ctx.deps`](https://pydantic.dev/docs/ai/core-concepts/dependencies/), the AI SDK’s `toolsContext`). The OpenAI docs state the rule: it is not sent to the model.

**Hooks and middleware** wrap each model and tool call. LangChain’s [middleware](https://docs.langchain.com/oss/python/langchain/middleware/custom) offers `before_model`, `after_model`, `wrap_model_call` and `wrap_tool_call`, plus [built-ins](https://docs.langchain.com/oss/python/langchain/middleware/built-in) for summarization, PII detection, model fallback, tool retry, tool selection, call limits and human approval. ADK [callbacks](https://adk.dev/callbacks/) skip a call by returning a value; Claude Agent SDK [hooks](https://code.claude.com/docs/en/agent-sdk/hooks) such as `PreToolUse` deny, rewrite or defer one.

**Approvals** need a run that survives a restart: `result.to_state()` [returns](https://openai.github.io/openai-agents-python/human_in_the_loop/) a `RunState` to save, approve and resume. The snapshot is not authenticated, so restore it only from trusted storage ([durable execution](#durable-agent-execution)).

**Streaming** emits typed [events](https://openai.github.io/openai-agents-python/streaming/): raw model deltas, completed items (messages, tool calls, handoffs) and agent changes. Render deltas; act on completed items ([streaming](#streaming)).

**Tracing** is built in. The OpenAI SDK [records](https://openai.github.io/openai-agents-python/tracing/) agent, generation, function, guardrail and handoff spans, plus a task span per run and a turn span per model turn; `add_trace_processor` adds an exporter, `set_trace_processors` replaces OpenAI’s. Generation and function spans include inputs and outputs by default, and tracing is unavailable to organizations under zero data retention. [OpenInference](https://github.com/Arize-ai/openinference) and [OpenLLMetry](https://github.com/traceloop/openllmetry) bring several of these SDKs to OpenTelemetry ([observability](#observability-tracing), [GenAI conventions](#otel-genai-conventions)).

```viz
{"id":"agent-sdk-primitives-trace","component":"trace","title":"The parallel input guardrail finished after the first tool call had already started","caption":"Illustrative trace of a two-agent support run, drawn with span types the OpenAI Agents SDK records by default as of November 2026. Simplified: the task and turn spans it also records are left out. Durations and token counts are invented. Click a span.","alt":"Span waterfall of a 7.4-second run: a triage agent with a parallel input guardrail, two generations, a function call and a handoff, then a billing agent with one generation and an output guardrail.","data":"illustrative","depicts":"OpenAI Agents SDK span types, as of November 2026","try":"Click the input guardrail and compare where it ends with where the function call starts.","spans":[
{"name":"Agent workflow","start":0,"dur":7400,"depth":0,"kind":"agent","note":"One trace per `Runner.run` call. Every span below nests inside it."},
{"name":"agent: Triage","start":0,"dur":2420,"depth":1,"kind":"agent"},
{"name":"input guardrail","start":0,"dur":1300,"depth":2,"kind":"model","note":"Runs a small classifier model in parallel with the agent, the default. It passed at 1.3 s. Had it tripped, `lookup_charges` would already have started."},
{"name":"generation","start":0,"dur":900,"depth":2,"kind":"model","tin":1400,"tout":40},
{"name":"function: lookup_charges","start":900,"dur":600,"depth":2,"kind":"tool","note":"Function spans hold the arguments and the result while `trace_include_sensitive_data` is on, the default."},
{"name":"generation","start":1500,"dur":900,"depth":2,"kind":"model","tin":1700,"tout":30},
{"name":"handoff → Billing","start":2400,"dur":20,"depth":2,"kind":"agent","note":"Records which agent took over."},
{"name":"agent: Billing","start":2420,"dur":4980,"depth":1,"kind":"agent"},
{"name":"generation","start":2420,"dur":3400,"depth":2,"kind":"model","tin":2300,"tout":380,"note":"The final answer."},
{"name":"output guardrail","start":5820,"dur":1580,"depth":2,"kind":"model","note":"Output guardrails start only once the final output exists, so their whole duration adds to latency."}]}
```

**Model providers** sit behind an interface that leaks: for other providers, the OpenAI SDK’s [docs](https://openai.github.io/openai-agents-python/models/) list tracing errors without an OpenAI key and gaps in structured-output and hosted-tool support.

## In practice
Injected dependencies, a blocking guardrail, one state strategy and a handled turn limit:

```python
# pip install openai-agents; set OPENAI_API_KEY in the environment
import asyncio
from dataclasses import dataclass

from agents import (Agent, GuardrailFunctionOutput, InputGuardrailTripwireTriggered,
                    MaxTurnsExceeded, RunContextWrapper, Runner, SQLiteSession,
                    TResponseInputItem, function_tool, input_guardrail)

@dataclass
class Deps:                        # run context: local only, never sent to the model
    user_id: str
    orders: dict[str, str]         # stands in for a database client

@function_tool
def order_status(ctx: RunContextWrapper[Deps], order_id: str) -> str:
    """Look up the status of one of the current user's orders.

    Args:
        order_id: The order number, for example A123.
    """
    return ctx.context.orders.get(order_id, "unknown order")

@input_guardrail(run_in_parallel=False)          # blocking: no model call until it passes
async def no_card_numbers(ctx: RunContextWrapper[Deps], agent: Agent,
                          user_input: str | list[TResponseInputItem]) -> GuardrailFunctionOutput:
    text = user_input if isinstance(user_input, str) else str(user_input)
    flagged = sum(ch.isdigit() for ch in text) >= 13   # crude stand-in for a PII classifier
    return GuardrailFunctionOutput(output_info=None, tripwire_triggered=flagged)

support = Agent[Deps](
    name="Support",
    instructions="Answer questions about orders. Use order_status for facts.",
    model="<model-id>",
    tools=[order_status],
    input_guardrails=[no_card_numbers],
)

async def main() -> None:
    deps = Deps(user_id="u-42", orders={"A123": "shipped"})
    session = SQLiteSession("u-42", "conversations.db")     # the only state strategy
    try:
        result = await Runner.run(support, "Where is order A123?",
                                  context=deps, session=session, max_turns=6)
        print(result.final_output)
    except InputGuardrailTripwireTriggered:
        print("Blocked before any model call.")
    except MaxTurnsExceeded:
        print("Stopped at the turn limit. Tell the user, do not pretend it finished.")

asyncio.run(main())
```

- **Limits are product decisions.** Decide what users see when one hits.
- **Block in front of side effects:** blocking guardrails, tool guardrails or approvals when tools send, pay or delete.
- **Secrets go in the run context**, never in instructions. Decide what traces may hold before launch.
- **Test without a model.** Pydantic AI’s [`TestModel`](https://pydantic.dev/docs/ai/guides/testing/) calls every tool with schema-valid arguments, `FunctionModel` scripts replies, `Agent.override` swaps them in and `ALLOW_MODEL_REQUESTS = False` blocks real calls. LangChain’s `LLMToolEmulator` fakes tool results.

> [!try]
> Run your agent with a one-turn limit on a task that needs a tool. Note what your code receives: an exception, an error result or a partial answer.

## Numbers to know
> [!number]
> Defaults, as of November 2026. OpenAI Agents SDK: 10 turns ([`DEFAULT_MAX_TURNS`](https://github.com/openai/openai-agents-python/blob/main/src/agents/run_config.py)), parallel input guardrails, sensitive trace data on. AI SDK `ToolLoopAgent`: 20 steps ([loop control](https://ai-sdk.dev/docs/agents/loop-control)). ADK: 500 model calls ([`max_llm_calls`](https://adk.dev/runtime/runconfig/)). Claude Agent SDK: no limit unless set, and the response that crosses `max_budget_usd` still completes. Maturity: the [OpenAI Agents SDK](https://pypi.org/project/openai-agents/) (0.24.0) and the Python [Claude Agent SDK](https://pypi.org/project/claude-agent-sdk/) (0.2, marked Alpha) are pre-1.0; [ADK](https://pypi.org/project/google-adk/), [Strands](https://pypi.org/project/strands-agents/), [Pydantic AI](https://pypi.org/project/pydantic-ai/), [Agent Framework](https://pypi.org/project/agent-framework/) and the [AI SDK](https://www.npmjs.com/package/ai) are past 1.0. Pin versions.

## Pitfalls and anti-patterns
> [!pitfall] A parallel guardrail in front of a side effect
> The default input guardrail can trip after a tool already sent the email. Use blocking mode, a tool guardrail or an approval.

> [!pitfall] Two state strategies at once
> Resending client history to a server-managed conversation can double every earlier turn. Pick one strategy per conversation.

- **Expecting the model to see the run context.** Put what it needs in instructions or tool results.
- **Hooks that fail open.** A Claude Agent SDK `PreToolUse` callback that throws lets the call through to the normal permission checks, unless its matcher sets `on_failure="block"`.

## Talk like an expert
The vocabulary: **runner**, **turn**, **final output**, **tripwire**, **blocking guardrail**, **session**, **run context**, **run state**, **trace processor**. Experts describe an SDK by its loop exits, its state and its traces. Live debates: vendor tracing versus OpenTelemetry from day one, and middleware stacks versus a small loop you own ([embedding harnesses](#embedded-agent-harnesses)).

> [!hottake] The loop is a commodity; an agent SDK earns its place with middleware, state and tracing.
> **The counterargument:** for coding and file work the harness is the value: built-in tools, permissions and compaction built for one model family, as in the Claude Agent SDK, are hard to rebuild from middleware.

## Check yourself
```quiz
agent-sdk-primitives
```

## Go deeper
- OpenAI Agents SDK docs: [Running agents](https://openai.github.io/openai-agents-python/running_agents/), [Guardrails](https://openai.github.io/openai-agents-python/guardrails/), [Tracing](https://openai.github.io/openai-agents-python/tracing/).
- Claude Agent SDK docs: [How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop), [Hooks](https://code.claude.com/docs/en/agent-sdk/hooks).
- LangChain docs: [Middleware](https://docs.langchain.com/oss/python/langchain/middleware).
- Pydantic AI docs: [Dependencies](https://pydantic.dev/docs/ai/core-concepts/dependencies/), [Testing](https://pydantic.dev/docs/ai/guides/testing/).

## Related
- [Provider and agent SDKs](#provider-agent-sdks)
- [Multi-agent orchestration patterns](#multi-agent-patterns)
- [Guardrails and control](#guardrails-control)
- [Observability and tracing](#observability-tracing)
- [Embedding agent harnesses](#embedded-agent-harnesses)
- [Durable execution for agents](#durable-agent-execution)
