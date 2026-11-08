---
id: building-mcp-servers
book: 12
order: "12.9"
title: Building MCP servers
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [mcp, sdk, fastmcp, inspector]
visuals:
  - server-dev-loop:diagram
  - fastmcp-walk:code-walk
  - tool-shape-compare:compare
---
> [!tldr]
> Build MCP servers with an official SDK, design task-shaped tools for agents, test them with the MCP Inspector and with real hosts, and ship remote servers as stateless services behind OAuth. Most of the work is the same as building a good API; the rest is writing for a reader that is a model.

## Why it matters
An MCP server is how your system becomes usable by every agent and assistant your users run. A good one turns a product into a capability agents reach for; a bad one adds noise to every context it is loaded into and fails in ways that look like model mistakes. Server authors control the descriptions, schemas and outputs that decide whether agents succeed.

## Intuition
Building an MCP server is writing a small, opinionated API for a colleague who reads every word of your documentation, every time, and cannot ask questions. Short, specific and predictable wins.

```viz
{"id":"server-dev-loop","component":"diagram","title":"Write, inspect, test with a real host, package, register and watch: the loop that ships good servers","caption":"Click a stage for the chapter that covers it. The loop repeats: transcripts from real hosts are the best source of fixes.","alt":"Loop diagram of the MCP server development cycle: write tools, inspect with the MCP Inspector, test with real hosts, package, register and monitor.","data":"illustrative","w":600,"h":220,"nodes":[
{"id":"write","label":"Write tools","sub":"SDK, schemas, docs","role":"tool","x":0,"y":0,"w":170,"h":52,"link":"#agent-tools"},
{"id":"inspect","label":"Inspect","sub":"MCP Inspector","x":215,"y":0,"w":170,"h":52},
{"id":"host","label":"Test with hosts","sub":"read transcripts","role":"agent","x":430,"y":0,"w":170,"h":52,"link":"#error-analysis"},
{"id":"pack","label":"Package","sub":"local or remote","x":430,"y":168,"w":170,"h":52,"link":"#mcp-transports"},
{"id":"reg","label":"Register","sub":"registry, allowlists","role":"data","x":215,"y":168,"w":170,"h":52,"link":"#mcp-server-catalog"},
{"id":"watch","label":"Monitor","sub":"errors, latency, misuse","role":"data","x":0,"y":168,"w":170,"h":52,"link":"#observability-tracing"}],
"edges":[{"from":"write","to":"inspect"},{"from":"inspect","to":"host"},{"from":"host","to":"pack"},{"from":"pack","to":"reg"},{"from":"reg","to":"watch"},{"from":"watch","to":"write","label":"fix"}]}
```

## How it works
**Pick an SDK.** Official SDKs exist for TypeScript and Python, and for several other languages. The Python SDK includes FastMCP, which turns decorated functions into tools, resources and prompts. Check which specification version each SDK release supports before relying on 2026-07-28 features.

**Design tools for agents, not endpoints.** Name tools by task, write descriptions that say when to use them and what comes next, bound outputs, and return errors that teach. See [tool design](#agent-tools) and [server primitives](#mcp-primitives).

**Step through a small server:**

```viz
{"id":"fastmcp-walk","component":"code-walk","title":"Thirty lines expose two tools, a resource and a prompt, with schemas generated from type hints","caption":"Each step lights the lines and the primitive they define. Illustrative code using FastMCP from the official Python SDK; db stands for your data layer.","alt":"Code walk through a FastMCP server with a search tool, a destructive close tool, a resource template and a prompt.","data":"illustrative","language":"python","code":"from mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP(\"tickets\")\n\n@mcp.tool()\ndef search_tickets(query: str, status: str = \"open\", limit: int = 10) -> list[dict]:\n    \"\"\"Search support tickets by keyword. Use before answering questions\n    about a customer's issue. Returns id, title and status, newest first.\"\"\"\n    limit = max(1, min(limit, 25))  # bound the output\n    return db.search(query=query, status=status, limit=limit)\n\n@mcp.tool()\ndef close_ticket(ticket_id: int, resolution: str) -> str:\n    \"\"\"Close a ticket with a one-line resolution. Irreversible: confirm with the user first.\"\"\"\n    if not db.exists(ticket_id):\n        raise ValueError(f\"No ticket {ticket_id}. Call search_tickets to find ids.\")\n    db.close(ticket_id, resolution)\n    return f\"Closed ticket {ticket_id}.\"\n\n@mcp.resource(\"ticket://{ticket_id}\")\ndef ticket(ticket_id: str) -> str:\n    \"\"\"The full thread of one ticket, as plain text.\"\"\"\n    return db.thread_text(ticket_id)\n\n@mcp.prompt()\ndef triage(ticket_id: str) -> str:\n    \"\"\"Draft a triage note for a ticket.\"\"\"\n    return f\"Read ticket://{ticket_id} and draft a triage note: severity, owner, next step.\"\n\nif __name__ == \"__main__\":\n    mcp.run()  # stdio by default; see the SDK docs for HTTP","diagram":{"w":340,"h":250,"nodes":[{"id":"srv","label":"FastMCP server","role":"agent","x":90,"y":0,"w":160,"h":48},{"id":"tools","label":"Tools","role":"tool","x":0,"y":96,"w":150,"h":48},{"id":"res","label":"Resources","role":"data","x":190,"y":96,"w":150,"h":48},{"id":"prompts","label":"Prompts","role":"context","x":0,"y":196,"w":150,"h":48},{"id":"io","label":"Transport","x":190,"y":196,"w":150,"h":48}],"edges":[{"from":"srv","to":"tools"},{"from":"srv","to":"res"},{"from":"srv","to":"prompts"},{"from":"srv","to":"io"}]},
"steps":[{"lines":[1,3],"node":"srv","note":"Create a named server. The name is what hosts show users, so make it recognizable."},{"lines":[5,10],"node":"tools","note":"Type hints become the input schema; the docstring becomes the description the model reads. Bound the output inside the tool."},{"lines":[12,18],"node":"tools","note":"A tool with a side effect: say it is irreversible in the description, and raise errors that tell the model how to recover. Mark it destructive with tool annotations so hosts can ask first."},{"lines":[20,23],"node":"res","note":"A resource template: the host or user decides when to attach a ticket’s thread, instead of the model fetching it."},{"lines":[25,28],"node":"prompts","note":"A prompt template users can pick from a menu or slash command."},{"lines":[30,31],"node":"io","note":"Run over stdio for local use. For remote use, serve over Streamable HTTP and add OAuth."}]}
```

**Test at three levels.**
1. **Unit tests** for the functions behind each tool.
2. **Protocol tests** with the MCP Inspector, which lists tools, calls them and shows raw messages (`npx @modelcontextprotocol/inspector`, or `mcp dev` with the Python SDK’s CLI).
3. **Agent tests** with real hosts: give an agent realistic tasks and read the transcripts. Watch for wrong-tool picks, malformed arguments and oversized results. See [error analysis](#error-analysis).

**Package and deploy.** Local servers ship as packages the host launches (an npm or PyPI package, or a container). Remote servers deploy like web services: stateless replicas behind a load balancer, OAuth via your identity provider, protected-resource metadata, rate limits and logs. See [authorization](#mcp-authorization).

**Migrate to the stateless spec.** Remove dependence on `initialize` and sessions, implement `server/discover`, use `input_required` round trips instead of server-initiated requests, add cache hints to list results, and keep tool order stable (verified Nov 2026).

## In practice
The biggest design decision is the shape of your tools:

```viz
{"id":"tool-shape-compare","component":"compare","title":"Endpoint-shaped servers force agents to chain calls; task-shaped servers let them finish in one","caption":"Hover the marks. The same ticketing API exposed two ways.","alt":"Comparison of an MCP server mirroring REST endpoints and one with task-shaped tools.","data":"illustrative","a":{"title":"Mirrors the REST API","text":"GET  /tickets            -> list_tickets\nGET  /tickets/{id}       -> get_ticket\nGET  /tickets/{id}/notes -> get_notes\nGET  /users/{id}         -> get_user\nPATCH /tickets/{id}      -> update_ticket\nPOST /tickets/{id}/close -> close_ticket\n(6 tools; 4 calls to answer\n 'what is blocking Dana?')"},"b":{"title":"Shaped around tasks","text":"search_tickets(query, status, assignee)\n  -> ids, titles, status, last note excerpt\nticket_summary(id)\n  -> thread summary, owner, blockers\nclose_ticket(id, resolution)  [destructive]\n(3 tools; 1 call to answer\n 'what is blocking Dana?')"},"links":[{"a":"GET  /tickets            -> list_tickets","b":"search_tickets(query, status, assignee)","note":"One search tool with filters replaces several list endpoints."},{"a":"GET  /tickets/{id}/notes -> get_notes","b":"ticket_summary(id)","note":"Return what the agent needs for the task, not the raw object graph."},{"a":"(6 tools; 4 calls to answer","b":"(3 tools; 1 call to answer","note":"Fewer calls means fewer chances to fail and fewer tokens."},{"b":"[destructive]","note":"Mark side effects so hosts can gate them."}]}
```

Release checklist:
- Descriptions that say when to use each tool and what to call next.
- Bounded outputs with visible truncation and pagination.
- Honest annotations for read-only and destructive tools.
- Errors that explain how to recover.
- Stable tool order and descriptions between releases; changelog every change, since hosts may alert users when definitions change. See [MCP security](#mcp-security).
- For remote servers: OAuth, audience checks, no token passthrough, rate limits and structured logs.

## Numbers to know
> [!number]
> Rules of thumb. A focused server usually needs under twenty tools. Keep each tool result to a few thousand tokens by default. Every definition is paid for on every model call in hosts that load the server, so a 400-token description across 10 tools costs about 4,000 tokens per call.

## Pitfalls and anti-patterns
> [!pitfall] Shipping without watching an agent use it
> A server can pass every unit test and still confuse every model that uses it. Read real transcripts before you call it done.

- **Endpoint mirroring.** Agents chain fine-grained tools badly.
- **Changing tool definitions casually.** It breaks prompt caches and may trigger re-approval prompts in hosts.
- **Printing to stdout in stdio servers.** It corrupts the protocol stream. See [transports](#mcp-transports).
- **Secrets in tool results.** Anything returned reaches the model and possibly logs.

## Talk like an expert
The vocabulary: **FastMCP**, **MCP Inspector**, **task-shaped tools**, **tool annotations**, **structured content**, **stateless server**, **registry**. Experts judge a server by the transcripts of agents using it, and they treat descriptions as the product. The live debate is whether servers should also ship skills or prompts that teach agents how to use them well, blurring the line between a tool and its manual.

> [!hottake] The best MCP servers have the fewest tools.
> **The counterargument:** very coarse tools hide useful control from the agent and force it to accept whatever the tool decides; the right granularity is the one that matches how users phrase tasks, which sometimes means more tools, not fewer.

## Check yourself
```quiz
building-mcp-servers
```

## Go deeper
- The `modelcontextprotocol/python-sdk` and `modelcontextprotocol/typescript-sdk` repositories, for current APIs and supported spec versions.
- The MCP Inspector repository (`modelcontextprotocol/inspector`).
- Anthropic engineering, “Writing effective tools for agents” (2025).

## Related
- [MCP server primitives](#mcp-primitives)
- [Tool use and tool design](#agent-tools)
- [MCP transports](#mcp-transports)
- [MCP authorization](#mcp-authorization)
- [Learning paths and the project ladder](#project-ladder)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Publishing and discovering MCP servers: the registry, server.json and bundles](#mcp-registry-and-packaging)
