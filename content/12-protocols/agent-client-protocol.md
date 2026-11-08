---
id: agent-client-protocol
book: 12
order: "12.13.2"
title: The Agent Client Protocol
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [agent-client-protocol, code-editors, coding-agents, json-rpc, protocols]
visuals: []
prerequisites: [protocol-soup, mcp-architecture]
---
> [!tldr]
> The Agent Client Protocol (ACP) is an open JSON-RPC protocol between code editors and coding agents, so that one agent can run inside any editor that speaks it, the way the Language Server Protocol did for language tools. The editor starts a local agent as a subprocess and keeps the user's side: the screen, the permission prompts and, in v1, the files and terminals. Remember the split: ACP connects editor and agent, MCP connects agent and tools, and the editor can hand its MCP servers to the agent when a session starts.

## Key ideas

- **One connection among several, and one ACP among several.** ACP covers the connection between code editors and coding agents ([ACP introduction](https://agentclientprotocol.com/overview/introduction)), while in the layering the AG-UI documentation uses, MCP connects agents to tools and data, A2A connects agents to each other and AG-UI connects agents to user-facing applications ([AG-UI introduction](https://docs.ag-ui.com/introduction)). Two other protocols share the acronym: IBM's Agent Communication Protocol, whose repository was archived on 27 August 2025 with the note “ACP is now part of A2A under the Linux Foundation!” ([i-am-bee/acp](https://github.com/i-am-bee/acp)), and the [Agentic Commerce Protocol](#agentic-commerce-protocols), maintained by OpenAI and Stripe ([agentic-commerce-protocol](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol)).
- **Born in Zed, now run by two editor makers.** Zed announced ACP on 27 August 2025 with Google's Gemini CLI as the first agent, under the Apache license, and framed it after the Language Server Protocol, which “unbundled language intelligence from monolithic IDEs” (Sobo, [“Bring Your Own Agent to Zed”](https://zed.dev/blog/bring-your-own-agent-to-zed)). As of November 2026, “ACP is jointly governed by Zed and JetBrains” under an interim model aimed at an independent foundation ([ACP governance](https://agentclientprotocol.com/community/governance)), and substantial changes go through Requests for Dialog (RFDs), “ACP's version of the RFC process” ([About RFDs](https://agentclientprotocol.com/rfds/about)). The ACP Registry went live on 28 January 2026 with built-in support in Zed and JetBrains IDEs: an agent is added once by pull request and is then available in every client that speaks the protocol (Brandt, [“The ACP Registry is Live”](https://zed.dev/blog/acp-registry)).
- **The agent is a subprocess that speaks JSON-RPC.** A local agent runs as a child process of the editor and exchanges JSON-RPC messages over stdin and stdout; remote agents would use HTTP or WebSocket, and full remote support is still in progress as of November 2026. ACP reuses MCP's JSON shapes where it can and adds its own types for coding, such as diffs ([ACP introduction](https://agentclientprotocol.com/overview/introduction)); its content block is “compatible with, and a superset of” the MCP 2025-06-18 content block ([ACP content](https://agentclientprotocol.com/protocol/content.md)).
- **A v1 session is a series of prompt turns.** The client calls `initialize` to agree on a version and capabilities, runs `authenticate` if the agent asks for it, opens a session with `session/new` (or `session/load` if the agent supports it), and sends `session/prompt`; the agent streams `session/update` notifications for message chunks, thoughts, tool calls, plans, available slash commands and mode changes, the client may interrupt with `session/cancel`, and the turn ends when the agent answers the prompt with a stop reason ([ACP overview](https://agentclientprotocol.com/protocol/v1/overview)). The stop reasons are `end_turn`, `max_tokens`, `max_turn_requests`, `refusal` and `cancelled` ([Prompt turn](https://agentclientprotocol.com/protocol/v1/prompt-turn)).
- **The editor holds the user's side, but it is not a sandbox.** The agent asks the client before acting with `session/request_permission`, offering options of kind `allow_once`, `allow_always`, `reject_once` or `reject_always` ([Tool calls](https://agentclientprotocol.com/protocol/v1/tool-calls)); clients that advertise the capability also serve `fs/read_text_file`, `fs/write_text_file` and `terminal/*`, and `session/new` passes the working directory and an `mcpServers` list, where “All Agents MUST support connecting to MCP servers via stdio” ([Session setup](https://agentclientprotocol.com/protocol/v1/session-setup)). Yet “Permission requests are advisory”, and “ACP itself does not sandbox” the agent, which runs with its process's permissions, so isolation stays a separate job ([Security considerations](https://agentclientprotocol.com/protocol/v1/security)); see [sandboxes](#sandboxes) and [permissions and hooks](#harness-permissions-hooks).
- **v2 is a draft with breaking changes, and v1 stays in use.** ACP v2 was published as a draft on 20 July 2026 ([announcement](https://agentclientprotocol.com/announcements/acp-v2-draft.md)) and is still labeled draft as of November 2026: `session/prompt` returns a `messageId` instead of ending the turn, progress moves to `state_update` notifications (`running`, `idle`, `requires_action`), `session/resume` with `replayFrom` replaces `session/load`, `authenticate` becomes `auth/login`, modes become config options, and the client's file and terminal methods are removed in favor of MCP servers passed in `mcpServers`. Implementers are told to gate v2 behind version negotiation and feature flags ([Migrating from v1](https://agentclientprotocol.com/protocol/v2/migration)); the Rust and TypeScript SDKs reached version 1.0.0 on 25 June 2026 ([announcement](https://agentclientprotocol.com/announcements/sdk-1-0-releases.md)).

## Planned visuals

- `sequence`: one v1 prompt turn between an editor and an agent subprocess: `initialize`, `session/new` with `mcpServers`, `session/prompt`, streamed `session/update` chunks and a tool call, `session/request_permission` with its four option kinds, `fs/write_text_file`, and the reply with stop reason `end_turn`, each payload shown.
- `diagram`: where ACP sits around a coding agent: editor to agent (ACP), agent to tool servers (MCP), agent to other agents (A2A), agent to a web front end (AG-UI), and the editor handing its MCP servers to the agent, each node linked to its chapter.
- `compare`: v1 next to the v2 draft, with linked highlights: the end of a turn (prompt response versus `idle` state update), `session/load` versus `session/resume`, client file and terminal methods versus MCP servers, and `authenticate` versus `auth/login`.

## Talk like an expert

Practitioners call ACP “LSP for agents”: the editor is the client, the agent is the server, and the conversation is a session of prompt turns with streamed session updates, stop reasons, permission options and negotiated client capabilities. They ask two questions before trusting an integration: which protocol version and capabilities did both sides negotiate, and where does the agent actually run, because ACP shows the permission prompt but does not enforce it.

## Go deeper

- [Agent Client Protocol: Introduction](https://agentclientprotocol.com/overview/introduction) and the [protocol overview](https://agentclientprotocol.com/protocol/v1/overview).
- [ACP v2: Migrating from v1](https://agentclientprotocol.com/protocol/v2/migration), the list of breaking changes in the draft.
- Sobo, [“Bring Your Own Agent to Zed: Featuring Gemini CLI”](https://zed.dev/blog/bring-your-own-agent-to-zed) (2025), the announcement.
- Brandt, [“The ACP Registry is Live”](https://zed.dev/blog/acp-registry) (2026).

## Related

- [The rest of the alphabet soup](#protocol-soup)
- [The coding-harness landscape](#coding-harness-landscape)
- [Agent interface protocols: AG-UI, MCP Apps and generative UI specs](#agent-ui-protocols)
- [MCP architecture](#mcp-architecture)
- [Protocol building blocks: JSON-RPC, JSON Schema, HTTP streams and OAuth](#protocol-building-blocks)
