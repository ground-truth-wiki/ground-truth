---
id: mcp-architecture
book: 12
order: "12.2"
title: MCP architecture
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [mcp, json-rpc, stateless]
visuals:
  - mcp-arch:diagram
  - mcp-lifecycle:sequence
---
> [!tldr]
> MCP connects a host application to many servers through one client per server, exchanging JSON-RPC 2.0 messages. Through version 2025-11-25 each connection began with an initialize handshake; since version 2026-07-28 MCP is stateless, and every request carries its own protocol version and client capabilities.

## Why it matters
MCP is how tools reach models in most agent products: coding agents, desktop assistants and IDEs all speak it. If you build tools, you will build MCP servers; if you build agents, you will host MCP clients. The 2026 move to a stateless design changed how servers scale and how clients connect, so it pays to know both the old and new shapes, because real deployments will mix them for a while.

## Intuition
Think of a host as a laptop and MCP servers as USB devices. The laptop has one port per device (the client), every device speaks the same protocol, and the operating system decides which device the user may use. In the stateful versions, plugging in a device started a session with a handshake; in the stateless version, every message carries its own ID card, so any copy of the device can answer it.

```viz
{"id":"mcp-arch","component":"diagram","title":"One host, one client per server, and each server fronts its own system","caption":"The host owns the model and decides what reaches it. Clients are connectors inside the host; servers are separate processes or remote services. Click a server type to read about its family.","alt":"Architecture diagram: a host application containing a model and three MCP clients, each connected over JSON-RPC to an MCP server that fronts a data source.","data":"illustrative","depicts":"MCP architecture, all versions","w":610,"h":300,"groups":[{"label":"Host application","x":0,"y":0,"w":252,"h":300}],"nodes":[
{"id":"m","label":"Model and agent loop","role":"model","x":16,"y":28,"w":220,"h":50},
{"id":"c1","label":"MCP client 1","x":16,"y":110,"w":220,"h":44},
{"id":"c2","label":"MCP client 2","x":16,"y":172,"w":220,"h":44},
{"id":"c3","label":"MCP client 3","x":16,"y":234,"w":220,"h":44},
{"id":"s1","label":"Files server","sub":"local, stdio","role":"tool","x":300,"y":106,"w":160,"h":52,"link":"#mcp-transports"},
{"id":"s2","label":"Tickets server","sub":"remote, HTTP","role":"tool","x":300,"y":168,"w":160,"h":52,"link":"#mcp-server-catalog"},
{"id":"s3","label":"Browser server","sub":"local, stdio","role":"tool","x":300,"y":230,"w":160,"h":52,"link":"#computer-use-agents"},
{"id":"d1","label":"Disk","role":"data","x":500,"y":110,"w":110,"h":44},
{"id":"d2","label":"Ticket DB","role":"data","x":500,"y":172,"w":110,"h":44},
{"id":"d3","label":"The web","role":"untrusted","x":500,"y":234,"w":110,"h":44}],
"edges":[{"from":"m","to":"c1"},{"from":"m","to":"c2"},{"from":"m","to":"c3"},{"from":"c1","to":"s1","label":"JSON-RPC","both":true},{"from":"c2","to":"s2","both":true},{"from":"c3","to":"s3","both":true},{"from":"s1","to":"d1"},{"from":"s2","to":"d2"},{"from":"s3","to":"d3"}]}
```

## How it works
**Roles.** The **host** is the application the user runs: a desktop assistant, an IDE, a coding agent. It contains the model and creates one **client** per **server** connection. A **server** exposes capabilities: tools, resources and prompts (see [server primitives](#mcp-primitives)). Servers never see each other, and they see only what the host chooses to send.

**Messages.** All traffic is [[JSON-RPC]] 2.0: **requests** carry an `id`, a `method` and `params`; **responses** carry the same `id` with a `result` or an `error`; **notifications** have no `id` and expect no reply. Transports carry these messages: stdio for local servers and Streamable HTTP for remote ones (see [transports](#mcp-transports)).

**The stateful lifecycle, through 2025-11-25.** A connection began with an `initialize` request carrying the client’s `protocolVersion`, `capabilities` and `clientInfo`. The server answered with its own version, capabilities and `serverInfo`, and the client confirmed with a `notifications/initialized` notification. Over HTTP, the server could assign an `Mcp-Session-Id` that later requests had to repeat. Capabilities negotiated at the start governed the whole session.

**The stateless design, since 2026-07-28** (verified Nov 2026):

- The `initialize` handshake and protocol-level sessions are gone. Each request carries its protocol version and the client’s capabilities in its `_meta` field.
- Servers must implement `server/discover`, so a client can learn a server’s capabilities before or without calling anything else.
- Server-initiated requests are replaced by **multi round-trip requests**: a server that needs more input returns a result with `resultType` set to `"input_required"`, and the client retries the original request with the answers. Every result now carries a `resultType`. See [client features](#mcp-client-features).
- `subscriptions/listen` replaces the HTTP GET stream and the resource subscribe calls. Ping, `logging/setLevel` and SSE stream resumability were removed.
- Tasks for long-running work moved out of the core into an official extension, polled with `tasks/get`.
- List results carry cache hints (`ttlMs` and `cacheScope`), and servers should list tools in a deterministic order so hosts get prompt-cache hits.
- OpenTelemetry trace context travels in `_meta`.

Step through both lifecycles and compare:

```viz
{"id":"mcp-lifecycle","component":"sequence","title":"The handshake is gone: since 2026-07-28 every request stands on its own","caption":"Switch versions and step through. In the stateless version any server replica can answer any request, because nothing depends on an earlier message. Payloads are simplified; key names inside _meta are illustrative, so check the specification for exact names.","alt":"Sequence diagram comparing the stateful MCP lifecycle through 2025-11-25 with the stateless 2026-07-28 design.","data":"illustrative","depicts":"MCP 2025-11-25 and 2026-07-28, simplified","try":"In the stateless tab, tap the tools/call request and find where the protocol version now lives.","actors":[{"id":"host","label":"Host","role":"agent"},{"id":"client","label":"MCP client"},{"id":"server","label":"MCP server","role":"tool"}],
"variants":[
{"name":"Through 2025-11-25: stateful","note":"Capabilities are negotiated once per connection and remembered for the session.","messages":[
{"from":"host","to":"client","label":"Connect to server","note":"The host creates one client per server."},
{"from":"client","to":"server","label":"initialize","payload":{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{"elicitation":{}},"clientInfo":{"name":"example-host","version":"1.0.0"}}},"note":"The client proposes a version and declares what it supports."},
{"from":"server","to":"client","label":"initialize result","kind":"response","payload":{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-11-25","capabilities":{"tools":{"listChanged":true},"resources":{"subscribe":true}},"serverInfo":{"name":"tickets","version":"2.3.0"}}},"note":"The server answers with the version it will speak and its capabilities. Over HTTP it may also return an Mcp-Session-Id header."},
{"from":"client","to":"server","label":"notifications/initialized","payload":{"jsonrpc":"2.0","method":"notifications/initialized"},"note":"A notification: no id, no reply. Normal operation can begin."},
{"from":"client","to":"server","label":"tools/list","payload":{"jsonrpc":"2.0","id":2,"method":"tools/list"},"note":"Relies on the session established above."},
{"from":"server","to":"client","label":"tools","kind":"response","payload":{"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"search_tickets","description":"Search support tickets by keyword.","inputSchema":{"type":"object","properties":{"query":{"type":"string"}},"required":["query"]}}]}}},
{"from":"client","to":"server","label":"tools/call","payload":{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_tickets","arguments":{"query":"refund"}}}},
{"from":"server","to":"client","label":"result","kind":"response","payload":{"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"3 open tickets: #4821, #4835, #4902"}],"isError":false}}}]},
{"name":"Since 2026-07-28: stateless","note":"No handshake and no session. Each request is self-describing, so remote servers scale like ordinary stateless HTTP services.","messages":[
{"from":"host","to":"client","label":"Connect to server","note":"Nothing is negotiated up front."},
{"from":"client","to":"server","label":"server/discover","payload":{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"protocolVersion":"2026-07-28","clientCapabilities":{"elicitation":{}}}}},"note":"Optional for the client, required for the server: learn the server’s info and capabilities."},
{"from":"server","to":"client","label":"server info","kind":"response","payload":{"jsonrpc":"2.0","id":1,"result":{"serverInfo":{"name":"tickets","version":"3.0.0"},"capabilities":{"tools":{}}}},"note":"Every result also carries a resultType; see the multi round-trip example in the client features chapter."},
{"from":"client","to":"server","label":"tools/list","payload":{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{"_meta":{"protocolVersion":"2026-07-28","clientCapabilities":{"elicitation":{}}}}},"note":"The version and capabilities ride along on every request."},
{"from":"server","to":"client","label":"tools + cache hints","kind":"response","payload":{"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"search_tickets","description":"Search support tickets by keyword.","inputSchema":{"type":"object","properties":{"query":{"type":"string"}},"required":["query"]}}],"ttlMs":600000,"cacheScope":"…"}},"note":"Cache hints let the host reuse the list. A stable tool order keeps the host’s prompt-cache prefix identical."},
{"from":"client","to":"server","label":"tools/call","payload":{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_tickets","arguments":{"query":"refund"},"_meta":{"protocolVersion":"2026-07-28","clientCapabilities":{"elicitation":{}},"traceparent":"00-…-01"}}},"note":"Trace context can travel in _meta too, so the call joins the host’s trace."},
{"from":"server","to":"client","label":"result","kind":"response","payload":{"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"3 open tickets: #4821, #4835, #4902"}],"isError":false}},"note":"Any replica could have answered, because the request carried everything it needed."}]}]}
```

## In practice
**If you build hosts:** create one client per server, show users which servers are connected and what each may do, gate tool calls by policy, and treat everything a server returns as untrusted input (see [MCP security](#mcp-security)). Support both lifecycles while servers migrate: try the stateless form and fall back to `initialize` for servers that only speak older versions.

**If you build servers:** start with an official SDK and the [Inspector](#building-mcp-servers). For the stateless spec, remove any reliance on per-connection state, implement `server/discover`, return cache hints on list results, and keep tool order deterministic. Put any state you truly need in your own storage, keyed by user or task, not by connection.

**Version negotiation still matters.** A client and server must agree on a protocol version. Log the version on every request so you can tell which clients still send old ones.

## Numbers to know
> [!number]
> Facts, not rules of thumb. MCP has had five specification versions: 2024-11-05, 2025-03-26, 2025-06-18, 2025-11-25 and 2026-07-28 (verified Nov 2026). Version strings are dates, and newer is not always backward compatible. See [the spec history](#mcp-spec-history).

## Pitfalls and anti-patterns
> [!pitfall] Keeping state in the connection
> Servers that cached per-session state worked under the stateful spec and break, subtly, behind a load balancer in the stateless one. Store state explicitly.

- **Trusting servers.** A server is third-party code with a direct line into your model’s context. Allowlist, pin versions and review what each one can reach.
- **Loading every server’s tools at once.** Definitions crowd the context; use tool search and deferred loading. See [MCP at scale](#mcp-at-scale).
- **Mixing up host and client.** Hosts own policy and the model; clients are just connectors.

## Talk like an expert
The vocabulary: **host, client, server**, **capability negotiation**, **JSON-RPC request, response and notification**, **multi round-trip request**, `resultType`, `server/discover`, **SEP** (Specification Enhancement Proposal, the process for changing the spec). Experts say “MCP standardizes the plug, not the policy”: authorization, consent and tool selection stay the host’s job. The live debate is how far MCP should go beyond tools, into UI (MCP Apps), long-running tasks and agent-to-agent work that overlaps with [A2A](#a2a).

> [!hottake] Statelessness is the most important change in MCP’s history.
> **The counterargument:** for local stdio servers, which are still the majority, nothing about scaling changes, and some interactive features became more complex to express as round trips. The win is concentrated in remote servers.

## Check yourself
```quiz
mcp-architecture
```

## Go deeper
- The MCP specification and changelog in the `modelcontextprotocol/modelcontextprotocol` repository on GitHub, under `docs/specification/2026-07-28` (verified Nov 2026).
- The official site, modelcontextprotocol.io, for concepts, SDK links and the Inspector.
- The JSON-RPC 2.0 specification at jsonrpc.org.

## Related
- [Why protocols](#why-protocols)
- [MCP server primitives](#mcp-primitives)
- [MCP client features and round trips](#mcp-client-features)
- [MCP transports](#mcp-transports)
- [MCP spec history](#mcp-spec-history)
- [Building MCP servers](#building-mcp-servers)
- [Protocol building blocks: JSON-RPC, JSON Schema, HTTP streams and OAuth](#protocol-building-blocks)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [MCP extensions: the framework and the official extensions](#mcp-extensions)
