---
id: mcp-extensions
book: 12
order: "12.2.1"
title: "MCP extensions: the framework and the official extensions"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [mcp, mcp-extensions, mcp-apps, protocol-evolution, capability-negotiation]
visuals: []
prerequisites: [mcp-architecture]
---
> [!tldr]
> An MCP extension is an optional, separately specified addition to the Model Context Protocol, named by an identifier such as `io.modelcontextprotocol/ui` and active only when both client and server declare it. Extensions let MCP grow into user interfaces, long-running tasks, skills and enterprise authorization without making the core bigger for every implementer. The one thing to remember: an extension works only where both sides support it, and host support is uneven (as of November 2026), so always ship a core fallback.

## Key ideas

- **The core stays small on purpose.** The core specification is the minimum bar for interoperability; extensions carry features that are modular (such as an authentication flow), specialized (industry-specific logic) or experimental (incubating for the core), and they are strictly additive, so a peer that does not recognize one simply skips it ([MCP Extensions Overview](https://modelcontextprotocol.io/extensions/overview.md); [“Understanding MCP Extensions” (2026)](https://blog.modelcontextprotocol.io/posts/2026-03-11-understanding-mcp-extensions/)).
- **Named by prefix, negotiated per request, always opt-in.** An identifier has the form `{vendor-prefix}/{extension-name}`: official extensions use `io.modelcontextprotocol`, and third parties use a reversed domain they own, such as `com.example/my-extension`. Since version 2026-07-28, a client lists the extensions it supports in the `extensions` field of the client capabilities it sends in every request's `_meta`, a server lists its own in the `server/discover` response, and extensions stay disabled until a developer turns them on ([MCP Extensions Overview](https://modelcontextprotocol.io/extensions/overview.md); [MCP 2026-07-28 Key Changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog)).
- **A lifecycle with evidence gates.** Every extension starts as Experimental (in an `experimental-ext-` repository or an `ext-` repository's experimental folder), reaches Beta through an Extensions Track SEP (Specification Enhancement Proposal) that cannot be reviewed until a reference implementation exists in an official SDK, and becomes Stable through a second SEP that needs two independent, interoperating implementations (one client, one server) and a conformance scenario, unless a Standards Track SEP promotes it into the core instead. Beta extensions signal breaking changes with a `revision` string, Stable ones change only with a new core protocol revision, and the identifier stays the same through every stage ([MCP Extensions Overview](https://modelcontextprotocol.io/extensions/overview.md)).
- **Six official extensions, as of November 2026.** MCP Apps (`io.modelcontextprotocol/ui`, Stable), the first official extension, launched on 26 January 2026, lets tools return interactive HTML; OAuth Client Credentials and Enterprise-Managed Authorization are Stable; Tasks, which version 2026-07-28 moved out of the core and which clients now poll with `tasks/get`, is Beta with the core as its intended destination; Skills over MCP (Beta) serves Agent Skills as resources, but reading a `SKILL.md` does not activate it, because loading stays the host's decision; and Server Cards (Beta) describe a server before anyone connects ([MCP Extensions Overview](https://modelcontextprotocol.io/extensions/overview.md); [MCP Apps announcement (2026)](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/); [MCP 2026-07-28 Key Changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog); [Skills over MCP](https://modelcontextprotocol.io/extensions/skills/overview.md)).
- **Support is uneven, so design for "no".** SDKs may implement extensions but are not required to for conformance, and in the community-maintained support matrix MCP Apps is marked supported in 13 of the 17 listed clients, while each of the other extensions it tracks is fully supported in four or fewer (as of November 2026). The overview's rule for that case: fall back to core behavior, for example by having a UI tool also return meaningful text, or reject the request if the extension is mandatory ([MCP Extension Support Matrix](https://modelcontextprotocol.io/extensions/client-matrix.md); [MCP Extensions Overview](https://modelcontextprotocol.io/extensions/overview.md)).
- **`_meta` versus your own extension.** Any implementation may already attach metadata in `_meta` under its own prefix (reverse DNS recommended), and prefixes whose second label is `modelcontextprotocol` or `mcp` are reserved. An extension adds what a bare `_meta` key lacks: negotiation through capabilities and a settings object whose schema the extension defines. An official extension also needs a specification in RFC 2119 language, a working group or interest group, and at least one named Extension Maintainer ([MCP specification 2026-07-28, `_meta`](https://modelcontextprotocol.io/specification/2026-07-28/basic/index.md); [MCP Extensions Overview](https://modelcontextprotocol.io/extensions/overview.md)).

## Planned visuals

- **`sequence`:** negotiation under version 2026-07-28: the client sends `extensions` inside `_meta` client capabilities, the server answers `server/discover` with its own, and a second variant shows the fallback when the server lacks the extension.
- **`state`** (Mermaid state diagram): the extension lifecycle from Experimental to Beta to Stable or promotion into the core, with the SEP, the reference implementation and the two-implementation gate on each transition.
- **`matrix`:** the official extensions with their identifier, stage and client support, dated as of November 2026 and sourced from the overview and the support matrix.

## Talk like an expert

Experts talk about the **extension identifier**, the **vendor prefix**, the **settings object**, **Extensions Track SEPs**, the **Experimental, Beta and Stable** stages, **promotion to core** and **graceful degradation**. They treat an extension as a negotiated contract and ask first what happens when the other side does not support it.

## Go deeper

- [MCP Extensions Overview](https://modelcontextprotocol.io/extensions/overview.md): identifiers, negotiation, the lifecycle, evolution rules and the list of official extensions.
- [MCP 2026-07-28 Key Changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog): the `extensions` capability field and the move of tasks into an extension.
- [MCP Extension Support Matrix](https://modelcontextprotocol.io/extensions/client-matrix.md): which clients implement which extension, maintained by the community.
- [“Understanding MCP Extensions” (2026)](https://blog.modelcontextprotocol.io/posts/2026-03-11-understanding-mcp-extensions/): the maintainers' guide to why extensions exist and how they are governed.

## Related

- [MCP architecture](#mcp-architecture)
- [MCP client features and round trips](#mcp-client-features)
- [MCP spec history](#mcp-spec-history)
- [Agent interface protocols: AG-UI, MCP Apps and generative UI specs](#agent-ui-protocols)
- [Publishing and discovering MCP servers: the registry, server.json and bundles](#mcp-registry-and-packaging)
- [Governance and ecosystem](#protocol-governance)
