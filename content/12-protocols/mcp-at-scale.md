---
id: mcp-at-scale
book: 12
order: "12.11"
title: MCP at scale
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [mcp, gateways, tool-search, registries]
visuals:
  - tool-search-threshold:chart
  - mcp-gateway:diagram
  - code-exec-compare:compare
---
> [!tldr]
> At scale, MCP needs gateways, registries and allowlists, plus a fix for too many tools. Tool search with deferred loading, code execution against MCP tools, deterministic tool order, cache hints and trace propagation keep large deployments fast, cheap and observable.

## Why it matters
One developer with three servers has no scaling problems. A company with hundreds of servers, thousands of users and agents running in CI has all of them: tool definitions that consume a tenth of every context, credentials scattered across laptops, no record of which agent called what, and prompt caches that miss because tool lists reorder. These are platform problems, and they have platform answers.

## Intuition
A small office lets everyone plug devices straight into the network. A large one puts a front desk, a badge system and a security camera in the lobby. MCP gateways and registries are that lobby; tool search is the receptionist who calls the right specialist instead of reading out the whole directory.

```viz
{"id":"tool-search-threshold","component":"chart","type":"line","title":"Six or seven typical servers already push tool definitions past a tenth of a 200k window","caption":"Formula view: servers × 8 tools × 400 tokens per definition, as a share of a 200,000-token window. Past the dashed line, Claude Code defers MCP tool definitions and loads them through tool search (verified Nov 2026). Your servers’ sizes will differ.","alt":"Line chart of the share of the context window taken by tool definitions as MCP servers are added, crossing 10% at about six servers.","data":"formula","x":{"label":"MCP servers loaded"},"y":{"label":"Share of context window","unit":"pct","min":0,"max":0.35},"series":[{"name":"Tool definitions","points":[[0,0],[2,0.032],[4,0.064],[6,0.096],[8,0.128],[10,0.16],[12,0.192],[14,0.224],[16,0.256],[18,0.288],[20,0.32]]}],"bands":[{"y":0.1,"label":"10%: tool search threshold"}]}
```

## How it works
**Gateways.** A central proxy between hosts and servers that authenticates users, enforces per-team allowlists, injects scoped credentials so laptops hold none, logs every call, rate-limits, and can inspect or redact traffic.

```viz
{"id":"mcp-gateway","component":"diagram","title":"A gateway gives one place to authenticate, allow, log and inspect every tool call","caption":"Hosts talk only to the gateway; the gateway holds credentials and talks to approved servers. Click a component for its chapter.","alt":"Diagram of hosts connecting to an MCP gateway with an allowlist, credential vault and logs, which fronts several approved servers.","data":"illustrative","w":600,"h":250,"nodes":[
{"id":"h1","label":"Coding agents","role":"agent","x":0,"y":20,"w":150,"h":50},
{"id":"h2","label":"Chat assistants","role":"agent","x":0,"y":100,"w":150,"h":50},
{"id":"h3","label":"CI jobs","role":"agent","x":0,"y":180,"w":150,"h":50},
{"id":"gw","label":"MCP gateway","sub":"auth, allowlist, logs","role":"tool","x":215,"y":92,"w":170,"h":66,"link":"#gateways-routers"},
{"id":"vault","label":"Credential vault","role":"data","x":215,"y":0,"w":170,"h":48,"link":"#mcp-authorization"},
{"id":"logs","label":"Audit logs and traces","role":"data","x":215,"y":200,"w":170,"h":48,"link":"#observability-tracing"},
{"id":"s1","label":"Code host server","role":"tool","x":450,"y":20,"w":150,"h":50},
{"id":"s2","label":"Ticketing server","role":"tool","x":450,"y":100,"w":150,"h":50},
{"id":"s3","label":"Data warehouse server","role":"tool","x":450,"y":180,"w":150,"h":50}],
"edges":[{"from":"h1","to":"gw"},{"from":"h2","to":"gw"},{"from":"h3","to":"gw"},{"from":"vault","to":"gw","style":"dashed"},{"from":"gw","to":"logs","style":"dashed"},{"from":"gw","to":"s1"},{"from":"gw","to":"s2"},{"from":"gw","to":"s3"}]}
```

**Registries and discovery.** A catalog of approved servers with owners, versions, scopes and data classifications, from which hosts load what a team may use. See [server catalog](#mcp-server-catalog).

**The too-many-tools problem.** Every loaded definition costs tokens on every call and makes wrong-tool picks more likely. **Tool search** replaces most definitions with one search tool and loads matching definitions on demand; **deferred loading** keeps rarely used servers unloaded until needed.

**Code execution against MCP tools.** Instead of calling tools one JSON call at a time, the agent writes code that calls them through a generated client, inside a sandbox. Large intermediate results stay in the sandbox; only the final answer enters the context. See [code as action](#agent-tools).

```viz
{"id":"code-exec-compare","component":"compare","title":"Calling tools from code keeps 10,000 rows out of the context; direct calls send every one through the model","caption":"Illustrative. The same task done with direct tool calls and with code that calls the same MCP tools in a sandbox.","alt":"Comparison of an agent calling MCP tools directly versus writing code that calls them in a sandbox.","data":"illustrative","a":{"title":"Direct tool calls","text":"call: warehouse.query('select * from orders\n      where date > ...')\nresult: 10,000 rows  -> into context\n        (about 400k tokens: overflow)\ncall: crm.lookup(customer) x 300\nresult: 300 results -> into context\nmodel: summarizes"},"b":{"title":"Code calling the same tools","text":"model writes:\n  rows = warehouse.query(...)\n  late = [r for r in rows if r.days > 30]\n  owners = {r.id: crm.lookup(r.customer)\n            for r in late}\n  print(summary(late, owners))\nsandbox runs it\nresult: a 40-line summary -> into context"},"links":[{"a":"result: 10,000 rows  -> into context","b":"rows = warehouse.query(...)","note":"Rows stay in the sandbox’s memory, not the model’s context."},{"a":"call: crm.lookup(customer) x 300","b":"owners = {r.id: crm.lookup(r.customer)","note":"A loop in code replaces hundreds of model-driven calls."},{"a":"model: summarizes","b":"result: a 40-line summary -> into context","note":"Only the result the user needs reaches the model."}]}
```

**Caching and determinism.** List results carry cache hints (`ttlMs`, `cacheScope`) since 2026-07-28, and servers should list tools in a deterministic order, so hosts can reuse lists and keep prompt-cache prefixes byte-identical (verified Nov 2026). See [prompt caching](#prompt-caching).

**Trace propagation.** OpenTelemetry trace context in `_meta` lets server spans join the host’s trace, so one waterfall shows the model call, the gateway hop and the server’s database query. See [observability](#observability-tracing).

**MCP Apps.** An extension that lets servers ship small interactive UIs into hosts, turning results into forms, tables and dashboards. See [agent UX](#agent-ux).

## In practice
A platform checklist:
- **Central gateway** with SSO, per-team allowlists, credential injection and audit logs.
- **Registry** of approved servers with owners, versions and scopes.
- **Tool search or deferred loading** once definitions exceed a small share of context.
- **Sandboxed code execution** for data-heavy work.
- **Stable tool lists** and cache hints for prompt-cache hits.
- **Trace context** end to end, and dashboards for tool latency, errors and usage.
- **Change control**: re-review servers when their definitions change.

## Numbers to know
> [!number]
> Facts and rules of thumb. Claude Code defers MCP tool definitions once they would exceed 10% of the context window (verified Nov 2026). With about 400 tokens per definition and 8 tools per server, each server costs about 3,200 tokens per call; six servers pass 10% of a 200k window.

## Pitfalls and anti-patterns
> [!pitfall] Credentials on every laptop
> Each developer holding long-lived tokens for every server multiplies the blast radius. Put credentials behind a gateway and issue short-lived, scoped access.

- **Loading every approved server for every task.** Approval is not a reason to load.
- **Reordering tools between requests.** Breaks prompt caches and costs real money at scale.
- **Gateways as a single point of failure.** Run them redundantly and monitor them like any critical service.

## Talk like an expert
The vocabulary: **MCP gateway**, **registry**, **allowlist**, **tool search**, **deferred loading**, **code execution with MCP**, **cache hints**, **trace propagation**, **MCP Apps**. Experts ask “which tools does the model see on this turn?” and expect the answer to be “a few, chosen for the task”. The live debate is where tool selection belongs: in the host, in a gateway, or in the model itself through search.

> [!hottake] Code execution will replace most direct tool calling in large deployments.
> **The counterargument:** code execution needs a sandbox, adds latency and new failure modes, and is overkill for the many tasks that need one or two small tool calls; both modes will coexist.

## Check yourself
```quiz
mcp-at-scale
```

## Go deeper
- Anthropic engineering writing on code execution with MCP and on tool search (2025), searchable on anthropic.com.
- The Claude Code changelog for tool search behavior (verified Nov 2026).
- OpenTelemetry’s semantic conventions for generative AI.

## Related
- [Tool use and tool design](#agent-tools)
- [Case study: Claude Code](#claude-code)
- [Gateways and routers](#gateways-routers)
- [MCP security](#mcp-security)
- [Prompt caching and token economics](#prompt-caching)
- [MCP extensions: the framework and the official extensions](#mcp-extensions)
- [Publishing and discovering MCP servers: the registry, server.json and bundles](#mcp-registry-and-packaging)
- [Agent interface protocols: AG-UI, MCP Apps and generative UI specs](#agent-ui-protocols)
- [OpenTelemetry GenAI semantic conventions](#otel-genai-conventions)
