---
id: mcp-primitives
book: 12
order: "12.3"
title: MCP server primitives
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [mcp, tools, resources, prompts]
visuals:
  - mcp-control:diagram
  - mcp-structured:compare
  - mcp-primitive-tree:tree
---
> [!tldr]
> An MCP server offers three primitives, each controlled by a different party: tools are invoked by the model, resources are attached by the application, and prompts are chosen by the user. Schemas, annotations, structured content and resource links make each one precise.

## Why it matters
Picking the right primitive decides who is in control. Expose a database as a tool and the model decides when to query it; expose it as a resource and the application or the user decides what to attach. Teams that make everything a tool get agents that over-fetch; teams that make everything a resource get agents that cannot act.

## Intuition
A tool is a button the model can press. A resource is a document the app can place on the model’s desk. A prompt is a recipe card the user picks from a menu.

```viz
{"id":"mcp-control","component":"diagram","title":"Who decides is the real difference between tools, resources and prompts","caption":"Each primitive has a different controller. That choice, not the data, should drive your design.","alt":"Diagram with three columns: tools controlled by the model, resources controlled by the application, prompts controlled by the user.","data":"illustrative","depicts":"MCP server primitives","w":600,"h":250,"nodes":[
{"id":"model","label":"Model","sub":"decides during the loop","role":"model","x":0,"y":0,"w":185,"h":52},
{"id":"app","label":"Application","sub":"decides what to attach","role":"agent","x":207,"y":0,"w":185,"h":52},
{"id":"user","label":"User","sub":"picks from a menu","role":"human","x":414,"y":0,"w":186,"h":52},
{"id":"tools","label":"Tools","sub":"tools/list, tools/call","role":"tool","x":0,"y":110,"w":185,"h":52,"link":"#agent-tools"},
{"id":"res","label":"Resources","sub":"resources/read","role":"data","x":207,"y":110,"w":185,"h":52,"link":"#rag-fundamentals"},
{"id":"prompts","label":"Prompts","sub":"prompts/get","role":"context","x":414,"y":110,"w":186,"h":52,"link":"#prompting-fundamentals"},
{"id":"t2","label":"search_tickets","align":"center","glyph":false,"x":20,"y":200,"w":145,"h":40},
{"id":"r2","label":"ticket://4821","align":"center","glyph":false,"x":227,"y":200,"w":145,"h":40},
{"id":"p2","label":"/triage","align":"center","glyph":false,"x":434,"y":200,"w":145,"h":40}],
"edges":[{"from":"model","to":"tools","label":"invokes"},{"from":"app","to":"res","label":"attaches"},{"from":"user","to":"prompts","label":"chooses"},{"from":"tools","to":"t2","style":"dashed"},{"from":"res","to":"r2","style":"dashed"},{"from":"prompts","to":"p2","style":"dashed"}]}
```

## How it works
**Tools** are functions with a `name`, a `description` and an `inputSchema` in [[JSON Schema]]. The host lists them with `tools/list` and calls one with `tools/call`. Optional **annotations** describe behavior to the host: `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint`, plus a human-readable `title`. Annotations are hints from the server, not guarantees, so hosts should not trust them from servers they do not trust. Since 2025-06-18, a tool can declare an `outputSchema` and return **structured content** alongside its text, and results can include **resource links** that point to resources the client can fetch later.

**Resources** are data identified by URIs, such as `file:///…` or a custom scheme like `ticket://4821`. Clients list them, read them with `resources/read`, and use **resource templates** (URI templates such as `ticket://{id}`) for parameterized families. Since 2026-07-28, change notifications arrive through `subscriptions/listen` (verified Nov 2026).

**Prompts** are reusable message templates with arguments, surfaced by hosts as slash commands or menu items and fetched with `prompts/get`.

**Supporting features.** **Completions** (`completion/complete`) suggest values for prompt arguments and resource template variables. **Pagination** uses an opaque `cursor` and `nextCursor` on list methods. Since 2026-07-28, list results can carry cache hints, `ttlMs` and `cacheScope`, and tool schemas may use any JSON Schema 2020-12 keyword (verified Nov 2026).

```viz
{"id":"mcp-structured","component":"compare","title":"Structured content gives programs a typed result and still gives the model readable text","caption":"Hover the marked parts. The text block keeps older clients and the model happy; the structured block and the output schema let hosts validate and render the result.","alt":"Comparison of a tool result with only text content and one with structured content, an output schema and a resource link.","data":"illustrative","depicts":"MCP tool results, 2025-06-18 and later","a":{"title":"Text only","text":"result:\n  content:\n    - type: text\n      text: '3 open tickets: #4821 (double\n        charge), #4835 (late refund),\n        #4902 (wrong amount)'\n  isError: false"},"b":{"title":"Structured content and a resource link","text":"result:\n  content:\n    - type: text\n      text: '3 open tickets: #4821, #4835, #4902'\n    - type: resource_link\n      uri: ticket://4821\n      name: Ticket 4821\n  structuredContent:\n    tickets:\n      - id: 4821\n        status: open\n        title: Double charge\n  isError: false\n# outputSchema declared on the tool\n# describes structuredContent"},"links":[{"a":"type: text","b":"type: text","note":"Keep a text block either way: the model reads text, and older clients may ignore structured fields."},{"b":"type: resource_link","note":"A resource link lets the client fetch the full ticket only if it is needed, instead of inlining it."},{"b":"structuredContent:","note":"Typed data the host can validate against the tool’s outputSchema and render as a table."},{"a":"isError: false","b":"isError: false","note":"Tool failures are reported inside the result with isError true, so the model can see and react to them."}]}
```

## In practice
A minimal server in Python with FastMCP, which ships in the official `mcp` package. Check your SDK version’s support for the 2026-07-28 spec before relying on stateless features.

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("tickets")

@mcp.tool()
def search_tickets(query: str, status: str = "open", limit: int = 10) -> list[dict]:
    """Search support tickets by keyword. Use before answering questions
    about a customer's issue. Returns id, title and status, newest first."""
    return db.search(query=query, status=status, limit=min(limit, 25))  # db: your data layer

@mcp.resource("ticket://{ticket_id}")
def ticket(ticket_id: str) -> str:
    """The full thread of one ticket, as plain text."""
    return db.thread_text(ticket_id)

@mcp.prompt()
def triage(ticket_id: str) -> str:
    """Draft a triage note for a ticket."""
    return f"Read ticket://{ticket_id} and draft a triage note: severity, owner, next step."

if __name__ == "__main__":
    mcp.run()  # stdio by default
```

```viz
{"id":"mcp-primitive-tree","component":"tree","title":"Every server feature hangs off one of three primitives, plus a few utilities","caption":"Expand a primitive to see its methods and the options that matter most when designing a server.","alt":"Tree of MCP server primitives and their main methods and options.","data":"illustrative","depicts":"MCP 2026-07-28 (verified Nov 2026)","open":1,"root":{"label":"MCP server","children":[
{"label":"Tools (model-controlled)","children":[{"label":"tools/list","note":"paginated; cache hints since 2026-07-28"},{"label":"tools/call","note":"arguments validated by inputSchema"},{"label":"annotations","note":"readOnlyHint, destructiveHint, idempotentHint, openWorldHint, title"},{"label":"outputSchema and structuredContent","note":"since 2025-06-18"},{"label":"resource links in results","note":"since 2025-06-18"}]},
{"label":"Resources (application-controlled)","children":[{"label":"resources/list and resources/read"},{"label":"resource templates","note":"URI templates such as ticket://{id}"},{"label":"change notifications","note":"subscriptions/listen since 2026-07-28"}]},
{"label":"Prompts (user-controlled)","children":[{"label":"prompts/list and prompts/get"},{"label":"arguments","note":"with completions for suggested values"}]},
{"label":"Utilities","children":[{"label":"completion/complete"},{"label":"pagination","note":"cursor and nextCursor"},{"label":"server/discover","note":"required since 2026-07-28"}]}]}}
```

Design rules:
- **Default to tools for actions, resources for context.** If the user or app should decide what the model sees, it is a resource.
- **Set annotations honestly** and mark anything destructive, so hosts can ask for confirmation.
- **Return structured content plus a short text summary**, and use resource links instead of inlining large objects.
- **Keep tool order and descriptions stable** so hosts’ prompt caches stay warm.

## Numbers to know
> [!number]
> Rules of thumb. Keep a server to a focused set of tools, often under twenty; split by domain beyond that. Keep text results to a few thousand tokens and link to the rest. Every tool definition costs tokens on every model call in hosts that load it. See [tool design](#agent-tools).

## Pitfalls and anti-patterns
> [!pitfall] One tool per API endpoint
> Mirroring a REST API produces dozens of fine-grained tools that agents chain badly. Design tools around tasks.

- **Trusting annotations from unknown servers.** A malicious server can label a destructive tool read-only.
- **Inlining huge resources into tool results.** Return a link and a summary.
- **Prompts that hide behavior.** Prompts are user-visible templates, not a place to smuggle instructions.

## Talk like an expert
Experts say “model-controlled, application-controlled, user-controlled” instead of tools, resources and prompts, and ask which party should hold the decision. They talk about **structured content**, **resource links**, **annotations as hints**, and **list stability** for caching. The live debate is whether resources are underused: many hosts surface tools well but resources poorly, which pushes server authors to make everything a tool.

> [!hottake] Most MCP servers should expose fewer tools and more resources.
> **The counterargument:** in practice many hosts let the model act only through tools, so a resource the host never surfaces is invisible. Design for the hosts your users actually run.

## Check yourself
```quiz
mcp-primitives
```

## Go deeper
- The server features section of the MCP specification (tools, resources, prompts, utilities) at modelcontextprotocol.io.
- The `modelcontextprotocol/python-sdk` and `modelcontextprotocol/typescript-sdk` repositories for current APIs.

## Related
- [MCP architecture](#mcp-architecture)
- [Tool use and tool design](#agent-tools)
- [Building MCP servers](#building-mcp-servers)
- [MCP client features and round trips](#mcp-client-features)
- [MCP at scale](#mcp-at-scale)
