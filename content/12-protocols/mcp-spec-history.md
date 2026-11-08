---
id: mcp-spec-history
book: 12
order: "12.8"
title: MCP spec history
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [mcp, versions, changelog]
visuals:
  - mcp-versions:timeline
  - mcp-feature-matrix:matrix
  - tutorial-compare:compare
---
> [!tldr]
> MCP has shipped five dated specification versions in under two years: 2024-11-05, 2025-03-26, 2025-06-18, 2025-11-25 and 2026-07-28. Each changed transports, authorization or core semantics, so “which version does it speak?” is the first question about any server, host, SDK or tutorial.

## Why it matters
MCP moved fast. A blog post from early 2025 describes a transport that is now deprecated; a server written for the stateful handshake behaves subtly wrong behind a load balancer under the stateless spec; an authorization flow copied from an old example misses checks that are now required. Knowing the history lets you date any piece of MCP code or advice at a glance and know what to fix.

## Intuition
Think of MCP versions like editions of a building code. Each edition keeps most of the rules, tightens a few, and retires some old practices. An inspector who knows which edition a building was designed under knows exactly where to look.

```viz
{"id":"mcp-versions","component":"timeline","title":"Five specification versions in under two years, plus a move to a foundation","caption":"Dated events from the Timeline that concern MCP. Each links to the chapter it most affects.","alt":"Vertical timeline of MCP specification releases from 2024-11-05 to 2026-07-28 and its governance move.","data":"illustrative","depicts":"MCP versions through 2026-07-28 (verified Nov 2026)","events":["mcp-launch","mcp-2025-03","mcp-2025-06","mcp-2025-11","mcp-foundation","mcp-2026"]}
```

## How it works
**2024-11-05: the first release.** JSON-RPC 2.0 messages, an `initialize` handshake with capability negotiation, server features (tools, resources, prompts), client features (roots and sampling), utilities (ping, progress, cancellation, logging) and two transports: stdio and HTTP with Server-Sent Events.

**2025-03-26: remote-ready.** Streamable HTTP replaced HTTP+SSE as the remote transport; an authorization framework based on OAuth 2.1 arrived; tools gained annotations describing behavior; audio content and JSON-RPC batching were added, along with a completions capability.

**2025-06-18: tighter and more structured.** JSON-RPC batching was removed again. Tools gained structured output and output schemas; tool results could include resource links; elicitation let servers ask users for input. Authorization was reframed: MCP servers became OAuth resource servers with protected-resource metadata, and clients had to send resource indicators. HTTP requests had to carry the `MCP-Protocol-Version` header.

**2025-11-25: the anniversary release.** Added experimental tasks for long-running work, URL-mode elicitation, tool calling inside sampling, client ID metadata documents as a registration option, icons for tools and resources, and JSON Schema 2020-12 as the default schema dialect, among other changes. Verify the details against the changelog before relying on them.

**2026-07-28: stateless** (verified Nov 2026). No `initialize` handshake and no protocol sessions; every request carries its protocol version and client capabilities in `_meta`; servers must implement `server/discover`. Multi round-trip requests replace server-initiated requests, with every result carrying a `resultType`. `subscriptions/listen` replaces the HTTP GET stream and resource subscriptions; ping, `logging/setLevel` and SSE resumability were removed. Tasks moved to an official extension polled with `tasks/get`. Roots, sampling and logging were deprecated, and HTTP+SSE was formally deprecated under the new feature-lifecycle policy. List results gained cache hints, servers should keep tool order deterministic, trace context travels in `_meta`, tool schemas may use any JSON Schema 2020-12 keyword, and authorization added issuer validation (RFC 9207) and credentials bound to their authorization server, and deprecated dynamic client registration in favor of client ID metadata documents. Streamable HTTP POST requests must carry an `Mcp-Method` header (plus `Mcp-Name` for tool calls, resource reads and prompt gets), capabilities gained an `extensions` field, the resource-not-found error moved from -32002 to -32602, and the -32020 to -32099 error range was reserved for the specification.

```viz
{"id":"mcp-feature-matrix","component":"matrix","matrix":"mcp-versions","title":"What each version added, changed or retired, area by area","caption":"Filter by area or by a keyword such as “deprecated”. A dash means no headline change in that version. Dated; check the changelog for each version.","alt":"Table of MCP areas such as lifecycle, transports, authorization and tools against the five specification versions.","data":"illustrative","depicts":"MCP 2024-11-05 to 2026-07-28 (verified Nov 2026)"}
```

**How the spec changes.** Changes are proposed as SEPs (Specification Enhancement Proposals), discussed in the open on GitHub, implemented in SDKs and reference servers, and released as a new dated version. The 2026-07-28 release formalized a **feature lifecycle**: features are marked deprecated before removal, giving implementers a migration window. See [governance](#protocol-governance).

## In practice
Old guidance is everywhere. Hover the marks to see what a 2024-era tutorial gets wrong today:

```viz
{"id":"tutorial-compare","component":"compare","title":"A 2024 tutorial and a 2026 implementation disagree on the transport, the handshake and authorization","caption":"Illustrative snippets. Each marked difference is a migration step.","alt":"Comparison of guidance from a 2024-era MCP tutorial with current 2026-07-28 practice.","data":"illustrative","depicts":"MCP 2024-11-05 versus 2026-07-28","mono":false,"a":{"title":"2024-era tutorial","text":"1. Open an SSE connection to /sse and a POST endpoint for messages.\n2. Send initialize, wait for the result, then send notifications/initialized.\n3. Keep the session id and reuse it on every request.\n4. Authorization: pass an API key in a header.\n5. Let the server call sampling/createMessage when it needs the model.","mono":false},"b":{"title":"2026-07-28 practice","text":"1. POST each JSON-RPC message to one Streamable HTTP endpoint.\n2. No handshake: send the protocol version and capabilities in _meta on every request; call server/discover if you need server info.\n3. No sessions: any replica may answer.\n4. Authorization: OAuth 2.1 with PKCE, resource indicators and issuer validation.\n5. Servers ask for input by returning input_required; sampling is deprecated.","mono":false},"links":[{"a":"Open an SSE connection to /sse","b":"POST each JSON-RPC message to one Streamable HTTP endpoint.","note":"HTTP+SSE was replaced in 2025-03-26 and formally deprecated in 2026-07-28."},{"a":"Send initialize, wait for the result","b":"No handshake","note":"The stateless redesign removed initialize (verified Nov 2026)."},{"a":"Keep the session id","b":"No sessions: any replica may answer.","note":"Sessions were removed, which simplifies scaling."},{"a":"pass an API key in a header","b":"OAuth 2.1 with PKCE, resource indicators and issuer validation.","note":"Authorization tightened in almost every version."},{"a":"sampling/createMessage","b":"sampling is deprecated","note":"Server-initiated requests gave way to multi round-trip requests."}]}
```

A migration checklist from any older version to 2026-07-28:
1. Find every place your code depends on `initialize` or a session id, and remove it.
2. Implement `server/discover` on servers; send version and capabilities in `_meta` from clients.
3. Replace server-initiated requests (sampling, elicitation calls) with `input_required` round trips.
4. Replace resource subscriptions and the GET stream with `subscriptions/listen`.
5. Move long-running work to the tasks extension.
6. Add cache hints to list results and make tool order deterministic.
7. Re-check authorization against the current spec, including issuer validation.
8. Log the protocol version of every request so you can see who has not migrated.

## Numbers to know
> [!number]
> Facts: five versions, dated 2024-11-05, 2025-03-26, 2025-06-18, 2025-11-25 and 2026-07-28 (verified Nov 2026). Version strings are dates, and an SDK’s version number is not the spec version it supports; check both.

## Pitfalls and anti-patterns
> [!pitfall] Trusting undated MCP advice
> If a post does not say which spec version it describes, assume it is out of date. Transports and authorization changed in nearly every release.

- **Assuming backward compatibility.** New versions removed features, not just added them.
- **Confusing SDK and spec versions.** An SDK release may lag the latest spec.
- **Building on deprecated features.** Deprecated means scheduled to go away; plan the migration now.

## Talk like an expert
The vocabulary: **dated versions**, **SEP**, **feature lifecycle**, **deprecation window**, **capability negotiation**, **stateful versus stateless**. Experts cite MCP versions by date and ask “which version does the host speak?” before debugging anything. The live debate is pace: rapid change kept MCP improving and also left a trail of incompatible servers and outdated tutorials.

> [!hottake] Statelessness was the inevitable end point that should have been the starting point.
> **The counterargument:** the first versions optimized for local stdio servers, where state was free and remote scale did not exist yet; shipping something simple that people adopted was worth more than designing for a future nobody had.

## Check yourself
```quiz
mcp-spec-history
```

## Go deeper
- The changelogs under `docs/specification/<version>` in the `modelcontextprotocol/modelcontextprotocol` repository (2026-07-28 verified Nov 2026).
- The SEP index in the same repository, for proposals in flight.

## Related
- [MCP architecture](#mcp-architecture)
- [MCP transports](#mcp-transports)
- [MCP client features and round trips](#mcp-client-features)
- [Governance and ecosystem](#protocol-governance)
- [The Canon](#the-canon)
- [MCP extensions: the framework and the official extensions](#mcp-extensions)
