---
id: agent-ui-protocols
book: 12
order: "12.13.1"
title: "Agent interface protocols: AG-UI, MCP Apps and generative UI specs"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [ag-ui, mcp-apps, generative-ui, agent-ux, streaming]
visuals: []
prerequisites: [protocol-soup, agent-ux]
---
> [!tldr]
> Three kinds of standard now sit between agents and the people using them. AG-UI streams a whole agent run to a front end as typed events, MCP Apps let an MCP server ship a small HTML interface that the host renders in a sandbox, and declarative formats such as A2UI let an agent describe a UI that the app draws with its own trusted components. The one thing to remember: AG-UI is the connection, while MCP Apps and A2UI are kinds of UI that can travel over it, with opposite security models: code in a sandbox versus data drawn from a catalog.

## Key ideas

- **AG-UI: one run, one ordered stream.** The run is the unit of interaction: the application sends one `RunAgentInput` (thread, run, messages, tools, state) and the agent answers with an ordered stream of typed events between `RUN_STARTED` and `RUN_FINISHED`, while a conversation is a thread of such runs. An implementation that speaks HTTP must support the HTTP plus Server-Sent Events binding; version 1.0 also specifies an optional HTTP plus Protobuf binding with length-prefixed frames, and the meaning of every event is the same on both ([AG-UI Architecture](https://docs.ag-ui.com/spec/1.0/architecture.md); [AG-UI Transports](https://docs.ag-ui.com/spec/1.0/basic/transports/index.md)).
- **Eight event families.** Runs and steps, text messages, tool calls, reasoning, state (`STATE_SNAPSHOT`, `STATE_DELTA` as RFC 6902 JSON Patch, and `MESSAGES_SNAPSHOT`), activity, subagents, and passthrough (`RAW` and `CUSTOM`); only the run lifecycle is mandatory for a producer, while a consumer must accept every family. Text and tool calls also come in a chunked form whose first chunk must carry the identifiers ([AG-UI Event Streams](https://docs.ag-ui.com/spec/1.0/events/index.md); [AG-UI Events](https://docs.ag-ui.com/concepts/events); [AG-UI 1.0 Key Changes](https://docs.ag-ui.com/spec/1.0/changelog.md)).
- **Three ways a run can stop and wait.** A tool listed in the run input belongs to the front end: the agent proposes the call but never answers it, the run finishes as a success that may name the pending calls, and the next run's messages carry the results. A run that needs an approval or a choice ends with an interrupt outcome, and the next run must answer or abandon every interrupt in its `resume` list; a run stopped on purpose before it completed ends with the cancelled outcome and asks for nothing ([AG-UI Tool Calls](https://docs.ag-ui.com/spec/1.0/events/tool-calls.md); [AG-UI Interrupts and Resume](https://docs.ag-ui.com/spec/1.0/basic/patterns/interrupt-resume.md)).
- **What 1.0 changed.** In 0.x the behavior lived in the TypeScript client; 1.0 makes it normative, retires the `THINKING_*` events in favor of the reasoning family (including `REASONING_ENCRYPTED_VALUE` for provider data a client stores and returns unread), adds run outcomes, subagents and activity events, and sets the processing rule "tolerant reader, strict writer": unknown events and fields are stripped with a warning after middleware has seen them, while a malformed known value is fatal ([AG-UI 1.0 Key Changes](https://docs.ag-ui.com/spec/1.0/changelog.md); [AG-UI Architecture](https://docs.ag-ui.com/spec/1.0/architecture.md)). CopilotKit's upgrade guide notes that its 1.0 client translates old thinking events and that a cancelled run should not be shown as a failure ([CopilotKit, “Upgrade to AG-UI 1.0”](https://docs.copilotkit.ai/migrate/ag-ui-1.0)).
- **MCP Apps: server-supplied HTML in a sandbox.** A tool points to a `ui://` resource through `_meta.ui.resourceUri`; the host fetches the HTML, renders it in a sandboxed iframe, applies the resource's declared content security policy and permission requests (such as microphone or camera), and talks to it through a JSON-RPC dialect of MCP over `postMessage`, through which the app can call the server's tools and update the model's context ([MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview.md)). MCP Apps became the first official MCP extension on 26 January 2026, standardizing patterns from MCP-UI and OpenAI's Apps SDK, and hosts can review templates before rendering and require consent for tool calls the UI starts ([MCP Apps announcement (2026)](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)).
- **Declarative UI, and how the pieces combine.** The AG-UI docs separate interaction protocols from generative UI specifications such as A2UI (which they list as Google's), OpenAI's Open-JSON-UI and MCP-UI ([AG-UI and generative UI specs](https://docs.ag-ui.com/concepts/generative-ui-specs.md)). A2UI sends declarative JSON that the app renders with native components from a catalog it trusts, so the agent sends no executable code, which suits remote or third-party agents and native or multi-platform apps; it travels over A2A or AG-UI ([A2UI repository](https://github.com/a2ui-project/a2ui)). The pieces combine: the AG-UI docs say one agent often uses MCP, A2A and AG-UI at the same time ([MCP, A2A, and AG-UI](https://docs.ag-ui.com/agentic-protocols.md)), MCP Apps can run beside an AG-UI agent through CopilotKit's `@ag-ui/mcp-apps-middleware` ([Microsoft Learn, “MCP Apps Compatibility with AG-UI”](https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/ui/ag-ui/mcp-apps)), and a remote agent that an orchestrator delegates to can return an A2UI payload for the main chat window to render ([A2UI repository](https://github.com/a2ui-project/a2ui)).

## Planned visuals

- **`sequence`:** one AG-UI exchange step by step: the run input, `RUN_STARTED`, streamed text, a tool call and a state delta, `RUN_FINISHED` with an interrupt outcome, then the next run carrying the resume entry.
- **`diagram`:** one product with all three: the front end connected to its agent over AG-UI, the agent's MCP servers supplying `ui://` apps, and a remote agent reached over A2A returning an A2UI payload, each link opening its chapter.
- **`compare`:** MCP Apps beside A2UI: who writes the UI code, where it runs, what the host has to trust, and how each fails safely.

## Talk like an expert

Experts distinguish an **interaction protocol** (AG-UI) from **generative UI specs** (A2UI, MCP-UI, Open-JSON-UI), and talk about **runs and threads**, **snapshots and deltas**, **frontend tools**, **interrupt and resume**, **`ui://` resources** and **component catalogs**. Their first question about agent-generated UI is the trust boundary: is this code we sandbox, or data we render ourselves?

## Go deeper

- [AG-UI specification 1.0: Key Changes](https://docs.ag-ui.com/spec/1.0/changelog.md): what 1.0 made normative, with links into the relevant parts of the specification.
- [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview.md): `ui://` resources, sandboxed rendering, the security model and client support.
- [A2UI repository](https://github.com/a2ui-project/a2ui): the declarative format, its renderers and when to use it.
- [AG-UI and generative UI specs](https://docs.ag-ui.com/concepts/generative-ui-specs.md): how AG-UI relates to A2UI, MCP-UI and Open-JSON-UI.

## Related

- [The rest of the alphabet soup](#protocol-soup)
- [Agent UX](#agent-ux)
- [MCP extensions: the framework and the official extensions](#mcp-extensions)
- [The Agent Client Protocol](#agent-client-protocol)
- [Streaming](#streaming)
- [AI frameworks beyond Python: TypeScript, Java, .NET and Go](#frameworks-beyond-python)
