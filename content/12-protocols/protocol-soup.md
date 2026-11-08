---
id: protocol-soup
book: 12
order: "12.13"
title: The rest of the alphabet soup
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [protocols, ag-ui, acp, agents-md]
visuals:
  - protocol-matrix:matrix
  - which-acp:tree
  - ag-ui-events:sequence
---
> [!tldr]
> Beyond MCP and A2A sits a crowd of younger standards: AG-UI for agent front ends, MCP Apps for server-supplied UI, the Agent Client Protocol for editors, app platforms inside chat assistants, agentic commerce and payment protocols, AGENTS.md, Agent Skills, llms.txt and NLWeb, and OpenAPI as a tool source. Several share the acronym ACP. All are young; date every claim.

## Why it matters
Each of these solves a real integration pain, and each has a hype cycle. Knowing what they connect, how mature they are and which acronym means what saves you from building custom glue where a standard exists, and from betting on a standard that is still a proposal.

## Intuition
Think of a new city’s utilities. Water and power (MCP and A2A) are in. Now streetlights, mail delivery, parking meters and street signs are each being standardized by different groups at different speeds. Some will become permanent; some will be replaced. You build on the ones with the most traffic.

```viz
{"id":"protocol-matrix","component":"matrix","matrix":"protocols","title":"What each protocol connects and how settled it is","caption":"Sortable and filterable. Status cells are dated and qualitative; check each project before adopting it.","alt":"Table of agent protocols with what they connect and their status as of November 2026.","data":"illustrative","depicts":"As of November 2026"}
```

## How it works
**AG-UI (agent to user interface).** An event protocol for streaming an agent’s run to a front end: message deltas, tool calls and results, state snapshots and changes, and lifecycle events. It lets one front end work with agents built on different frameworks.

```viz
{"id":"ag-ui-events","component":"sequence","title":"A front end follows an agent run as a stream of typed events, not a single reply","caption":"Simplified AG-UI-style event flow; event names here are illustrative, so check the AG-UI documentation for the exact set.","alt":"Sequence of events streamed from an agent back end to a front end: run started, text deltas, tool call, state update and run finished.","data":"illustrative","actors":[{"id":"ui","label":"Front end","role":"human"},{"id":"agent","label":"Agent back end","role":"agent"}],
"messages":[
{"from":"ui","to":"agent","label":"run(input)","payload":{"threadId":"th-9","messages":[{"role":"user","content":"Compare our three cheapest suppliers."}]}},
{"from":"agent","to":"ui","label":"run started","kind":"response"},
{"from":"agent","to":"ui","label":"text delta","kind":"response","payload":"Looking up suppliers…","note":"Text streams as deltas the UI appends."},
{"from":"agent","to":"ui","label":"tool call: search_suppliers","kind":"response","payload":{"tool":"search_suppliers","args":{"sort":"price","limit":3}},"note":"The UI can show which tool is running."},
{"from":"agent","to":"ui","label":"state update","kind":"response","payload":{"table":[{"name":"A","price":12},{"name":"B","price":13},{"name":"C","price":15}]},"note":"Shared state lets the UI render a live table instead of parsing text."},
{"from":"agent","to":"ui","label":"run finished","kind":"response"}]}
```

**MCP Apps.** An MCP extension that lets servers supply small interactive interfaces that hosts render, so a tool result can be a form or a chart rather than text. See [MCP at scale](#mcp-at-scale).

**App platforms inside chat assistants.** Several assistants let developers ship apps that run inside the chat, often built on MCP plus a UI layer. Distribution and review rules differ by platform.

**The Agent Client Protocol (editor to agent).** A protocol connecting code editors to coding agents, so one agent can run inside many editors, the way the Language Server Protocol let one language server serve many editors.

**Agentic commerce and payments.** Protocols for agents to browse catalogs, build carts, check out and pay on a user’s behalf, with delegated, limited and revocable authority. Several companies have published competing proposals; this is the least settled area.

**Files as standards.** **AGENTS.md** is a plain file of project instructions read by many coding agents. **Agent Skills** packages know-how as a folder with a `SKILL.md` file, loaded only when relevant (verified Nov 2026). **llms.txt** proposes a Markdown file at a site’s root that tells models what the site contains. **NLWeb** proposes natural-language query endpoints for websites. See [skills and plugins](#skills-plugins).

**OpenAPI as a tool source.** Existing API descriptions can be converted into tools automatically. It works, but endpoint-shaped tools usually need rewriting for agents. See [building MCP servers](#building-mcp-servers).

**Agent identity and auth.** How an agent proves who it is and what authority it holds, separately from the user it works for, is an open problem that several groups are working on.

## In practice
The acronym ACP alone has meant at least three things. When someone says it, ask:

```viz
{"id":"which-acp","component":"tree","title":"Ask what it connects, and the meaning of “ACP” becomes obvious","caption":"Expand each branch. Always expand acronyms in documents and design reviews.","alt":"Decision tree disambiguating the acronym ACP by what it connects.","data":"illustrative","depicts":"As of November 2026","open":1,"root":{"label":"Someone said “ACP”. What does it connect?","children":[
{"label":"A code editor and a coding agent","children":[{"label":"The Agent Client Protocol","link":"#coding-harness-landscape"}]},
{"label":"Agents talking to agents","children":[{"label":"Probably IBM’s Agent Communication Protocol, whose work later merged with A2A (verify)","link":"#a2a"}]},
{"label":"An agent and a merchant’s checkout","children":[{"label":"An agentic commerce protocol; several exist, so ask whose"}]},
{"label":"None of these","children":[{"label":"Ask for the full name and the link to its spec"}]}]}}
```

Adoption rules:
- **Prefer standards with SDKs, reference implementations and several independent adopters.**
- **Isolate young protocols** behind an interface in your code so a replacement touches one module.
- **Read the security model** before connecting money, identity or user data.
- **Date your decisions** and revisit them every few months.

## Numbers to know
> [!number]
> Rule of thumb: count independent implementations. A protocol with one vendor’s SDK is a product feature; one with several independent hosts and servers is becoming a standard.

## Pitfalls and anti-patterns
> [!pitfall] Betting a product on a proposal
> A blog post and a draft spec are not a standard. Build on young protocols only where switching later is cheap.

- **Acronym confusion.** Write the full name the first time, every time.
- **Assuming llms.txt is read.** Support varies by model and product; it costs little, but do not count on it.
- **Payments without limits.** Agent payments need spending caps, merchant allowlists and revocation from day one.

## Talk like an expert
The vocabulary: **AG-UI**, **MCP Apps**, **generative UI**, **Agent Client Protocol**, **agentic commerce**, **delegated authority**, **AGENTS.md**, **Agent Skills**, **llms.txt**, **NLWeb**. Experts ask “what does it connect, who stewards it and how many independent implementations exist?”. The live debate is consolidation: whether these become extensions of MCP and A2A or remain separate.

> [!hottake] Within a few years most of this list will be extensions of MCP or A2A.
> **The counterargument:** user interfaces, editors and payments have requirements (latency, rendering, financial regulation) different enough from tool calling that dedicated protocols may persist, as HTTP and SMTP do alongside each other.

## Check yourself
```quiz
protocol-soup
```

## Go deeper
- Project pages and repositories for AG-UI, MCP Apps, the Agent Client Protocol, AGENTS.md, Agent Skills (`agentskills/agentskills`, verified Nov 2026), llms.txt and NLWeb.
- The [protocol matrix](#matrix-protocols) for a dated comparison.

## Related
- [Why protocols](#why-protocols)
- [Skills, plugins and extension ecosystems](#skills-plugins)
- [Agent UX](#agent-ux)
- [Governance and ecosystem](#protocol-governance)
- [Agent2Agent (A2A)](#a2a)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Agent interface protocols: AG-UI, MCP Apps and generative UI specs](#agent-ui-protocols)
- [The Agent Client Protocol](#agent-client-protocol)
- [Agent identity and delegated authorization](#agent-identity-delegation)
- [The web for agents: llms.txt, NLWeb, signed agents and content preferences](#agent-facing-web)
- [Agentic commerce and payment protocols](#agentic-commerce-protocols)
