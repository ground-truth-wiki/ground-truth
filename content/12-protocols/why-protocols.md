---
id: why-protocols
book: 12
order: "12.1"
title: Why protocols
level: foundation
stability: moving
reviewed: "2026-11"
status: full
tags: [protocols, mcp, a2a, interop]
visuals:
  - protocol-map:diagram
  - nxm-calculator:calculator
---
> [!tldr]
> Without shared protocols, every AI application needs a custom integration with every tool and every other agent: N applications times M integrations. Protocols turn that into N plus M. The agent world now has one for each kind of connection: tools, peer agents, interfaces, editors, commerce, instructions, skills and the web.

## Why it matters
Protocol choices decide how much integration code you write, which ecosystems your product plugs into, and which security model you inherit. They also generate the most confusing acronyms in the field. Knowing which protocol covers which connection lets you build once and reach many hosts, and lets you spot when a vendor is selling a protocol for a problem it does not solve.

## Intuition
Before USB, every printer, mouse and camera had its own port and driver. After USB, any device worked with any computer. MCP is often described as “USB-C for AI applications”: one plug for tools and data. The other protocols are the other ports on the laptop: one for talking to other agents, one for the screen, one for the keyboard.

```viz
{"id":"protocol-map","component":"diagram","title":"Each protocol standardizes one kind of connection around the agent","caption":"The agent or host sits in the middle; each edge is labeled with the protocol that standardizes it. Click a node for the chapter that covers that connection. Several of these protocols are young; check their status.","alt":"Map of agent protocols: AG-UI and MCP Apps to front ends, the Agent Client Protocol to editors, MCP to tool servers, A2A to other agents, commerce protocols to merchants, AGENTS.md and Agent Skills from repositories, llms.txt from websites.","data":"illustrative","depicts":"Protocol landscape as of November 2026","w":600,"h":300,"nodes":[
{"id":"ui","label":"Front end","role":"human","x":0,"y":20,"w":150,"h":50,"link":"#agent-ux"},
{"id":"ed","label":"Code editor","role":"human","x":0,"y":125,"w":150,"h":50,"link":"#coding-harness-landscape"},
{"id":"web","label":"Websites","role":"external","x":0,"y":230,"w":150,"h":50,"link":"#protocol-soup"},
{"id":"ag","label":"Agent or host","role":"agent","x":222,"y":122,"w":156,"h":56,"link":"#agent-loop"},
{"id":"srv","label":"Tool servers","role":"tool","x":450,"y":20,"w":150,"h":50,"link":"#mcp-architecture"},
{"id":"peer","label":"Other agents","role":"agent","x":450,"y":125,"w":150,"h":50,"link":"#a2a"},
{"id":"shop","label":"Merchants","role":"external","x":450,"y":230,"w":150,"h":50,"link":"#protocol-soup"},
{"id":"repo","label":"Repository files","role":"data","x":222,"y":240,"w":156,"h":50,"link":"#skills-plugins"}],
"edges":[{"from":"ui","to":"ag","label":"AG-UI, MCP Apps","both":true},{"from":"ed","to":"ag","label":"ACP","both":true},{"from":"web","to":"ag","label":"llms.txt","style":"dashed"},{"from":"ag","to":"srv","label":"MCP","both":true},{"from":"ag","to":"peer","label":"A2A","both":true},{"from":"ag","to":"shop","label":"commerce","style":"dashed"},{"from":"repo","to":"ag","label":"AGENTS.md, Skills","style":"dashed"}]}
```

## How it works
**The N×M problem.** Without a standard, each of N hosts needs its own connector for each of M services. With one, each host implements the client side once and each service implements the server side once. The saving grows with both numbers:

```viz
{"id":"nxm-calculator","component":"calculator","title":"A shared protocol turns N × M integrations into N + M","caption":"Formula view. With ten assistants and fifty services, a protocol saves 440 integrations. The saving matters most when both sides are many.","alt":"Calculator comparing custom integrations N times M with protocol implementations N plus M.","data":"formula","outputs":[{"id":"custom","label":"Custom integrations (N × M)","expr":"hosts * services","unit":"count","main":true},{"id":"protocol","label":"With a protocol (N + M)","expr":"hosts + services","unit":"count"},{"id":"saved","label":"Integrations saved","expr":"custom - protocol","unit":"count"}],"inputs":{"hosts":10,"services":50},"input_meta":{"hosts":{"label":"Hosts or applications (N)"},"services":{"label":"Tools or services (M)"}},"assumptions":["Each pair would otherwise need its own connector.","Ignores the cost of keeping implementations current as the protocol changes."],"tests":[{"inputs":{},"expect":{"custom":500,"protocol":60,"saved":440}},{"inputs":{"hosts":3,"services":4},"expect":{"custom":12,"protocol":7,"saved":5}}]}
```

**The map, connection by connection:**
- **Model to tools and data: MCP.** Hosts discover and call tools, read resources and fetch prompts from servers. See [MCP architecture](#mcp-architecture).
- **Agent to agent: A2A.** Opaque agents publish agent cards, accept tasks and return artifacts. See [A2A](#a2a).
- **Agent to interface: AG-UI and MCP Apps.** Stream agent events to front ends, or let servers ship small interactive UIs into hosts.
- **Editor to agent: the Agent Client Protocol.** One coding agent works inside many editors.
- **Agent to commerce.** Emerging protocols let agents browse catalogs, check out and pay with delegated, limited authority.
- **Instructions and skills: AGENTS.md and Agent Skills.** Files, not wire protocols: a shared place for project instructions, and a folder format for reusable know-how. See [skills and plugins](#skills-plugins).
- **The web for agents: llms.txt and NLWeb.** Proposals for sites to describe themselves to models.

**What a protocol gives you beyond saved code.** Discovery (what can this server do?), negotiation (which version and features?), a security model (how is the caller authorized?), and an ecosystem of tools such as inspectors, registries and gateways. It also costs you: version churn, a spec to track, and a dependency on governance you do not control. See [governance](#protocol-governance).

## In practice
Choose by what is on the other end of the wire:

| On the other end | Use | Not |
|---|---|---|
| A function in your own app | A plain tool definition | A protocol server |
| A tool or data source many hosts should reach | MCP | A2A |
| An independent agent with its own reasoning and state | A2A | MCP tool wrapping |
| A front end that renders agent progress | AG-UI or MCP Apps | Custom WebSocket events, unless you must |
| Team conventions for coding agents | AGENTS.md and skills | Long system prompts |

Before adopting any protocol, check three things: who stewards it, which version your hosts and SDKs support, and what its security model assumes. Then wrap it so a spec change touches one module, not your whole codebase.

## Numbers to know
> [!number]
> Facts as of November 2026 (verified Nov 2026): MCP’s latest specification is 2026-07-28, and A2A reached 1.0.0 on 12 March 2026, with 1.0.1 on 26 May 2026. Rule of thumb: a protocol pays off when both sides number more than a handful.

## Pitfalls and anti-patterns
> [!pitfall] A protocol for a single integration
> Wrapping your own app’s functions in an MCP server adds a process boundary, a transport and a version to track, for no reuse. Use a plain tool until a second host needs it.

- **Acronym collisions.** “ACP” has meant several different protocols; always expand it. See [the alphabet soup](#protocol-soup).
- **Assuming protocol equals security.** A standard plug does not decide what may flow through it; that stays the host’s job.
- **Ignoring versions.** Hosts and servers speaking different versions fail in confusing ways.

## Talk like an expert
The vocabulary: **N×M problem**, **host and server**, **discovery**, **capability negotiation**, **agent card**, **interoperability**. Experts say “MCP for tools, A2A for peers” and “a protocol standardizes the plug, not the policy”. The live debate is consolidation: whether MCP grows to cover agent-to-agent and UI use cases, whether A2A and MCP converge, and how many of the younger protocols survive.

> [!hottake] In five years most of these protocols will have merged into two or three.
> **The counterargument:** different connections have genuinely different needs (latency for UIs, long-lived tasks for agents, authorization for tools), and protocols tuned for each may coexist the way HTTP, SMTP and WebSockets do.

## Check yourself
```quiz
why-protocols
```

## Go deeper
- modelcontextprotocol.io for MCP concepts and the specification.
- The `a2aproject/A2A` repository and its changelog (verified Nov 2026).
- Project pages for AG-UI, the Agent Client Protocol, AGENTS.md and Agent Skills (`agentskills/agentskills`, verified Nov 2026).

## Related
- [MCP architecture](#mcp-architecture)
- [Agent2Agent (A2A)](#a2a)
- [The rest of the alphabet soup](#protocol-soup)
- [Governance and ecosystem](#protocol-governance)
- [Tool use and tool design](#agent-tools)
