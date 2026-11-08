---
id: a2a
book: 12
order: "12.12"
title: Agent2Agent (A2A)
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [a2a, agent-cards, tasks]
visuals:
  - a2a-flow:sequence
  - a2a-lifecycle:state
  - mcp-vs-a2a:compare
---
> [!tldr]
> Agent2Agent (A2A) lets independent agents discover each other through agent cards and delegate work as tasks with a lifecycle, exchanging messages made of parts and returning artifacts. It complements MCP: MCP connects an agent to tools and data; A2A connects agents that are opaque peers. Version 1.0.0 shipped on 12 March 2026 and 1.0.1 on 26 May 2026 (verified Nov 2026).

## Why it matters
As companies deploy many agents, from vendors and from their own teams, those agents need to hand work to each other: a travel agent asks an expense agent to file a receipt; a support agent asks a billing agent to issue a refund. Wrapping every agent as a tool loses what makes it an agent: its own reasoning, state, long-running work and need to ask questions. A2A standardizes that conversation between peers.

## Intuition
MCP is calling a function in a library: you know its signature and it returns a value. A2A is emailing a colleague in another department: you describe what you need, they may ask questions, they work on it for a while, they send updates, and eventually they send back a document. You never see how they did it.

```viz
{"id":"a2a-flow","component":"sequence","title":"A client agent finds a peer through its card, sends a task, follows its progress and receives an artifact","caption":"Step through one delegation. Payloads are simplified and field names are illustrative; A2A 1.0 shipped breaking changes, so check the specification for exact shapes (verified Nov 2026).","alt":"Sequence diagram of an A2A delegation: fetching an agent card, sending a message that creates a task, streaming status updates, answering an input request, and receiving an artifact.","data":"illustrative","depicts":"A2A 1.0, simplified","try":"Find the step where the remote agent needs more information, and how the client answers without starting a new task.","actors":[{"id":"user","label":"User","role":"human"},{"id":"client","label":"Travel agent","role":"agent"},{"id":"remote","label":"Expense agent","role":"agent"}],
"messages":[
{"from":"client","to":"remote","label":"GET agent card","payload":"GET https://expenses.example.com/.well-known/agent-card.json","note":"Discovery: the card is published at a well-known URL or in a registry. Check the 1.0 spec for the exact path."},
{"from":"remote","to":"client","label":"agent card","kind":"response","payload":{"name":"Expense agent","description":"Files and checks business expenses.","skills":[{"id":"file-receipt","name":"File a receipt","description":"Creates an expense from a receipt image or PDF."}],"capabilities":{"streaming":true,"pushNotifications":true},"security":"OAuth 2.0 (see securitySchemes)"},"note":"Skills, capabilities and how to authenticate. The client never sees the agent’s internals."},
{"from":"client","to":"remote","label":"send message","payload":{"message":{"role":"user","parts":[{"kind":"text","text":"File this hotel receipt under trip LIS-2026-11."},{"kind":"file","name":"receipt.pdf","mimeType":"application/pdf"}]}},"note":"Messages carry parts: text, files or structured data. Sending one creates a task."},
{"from":"remote","to":"client","label":"task: working","kind":"response","payload":{"task":{"id":"t-118","status":"working"}},"note":"The remote agent returns a task with a lifecycle state."},
{"from":"remote","to":"client","label":"status: input required","kind":"response","payload":{"task":{"id":"t-118","status":"input-required","message":"Which cost center: 4100 Sales or 4200 Marketing?"}},"note":"A streamed update: the remote agent needs an answer to continue."},
{"from":"client","to":"user","label":"ask","payload":"The expense agent asks: which cost center, Sales or Marketing?"},
{"from":"user","to":"client","label":"Sales","kind":"response"},
{"from":"client","to":"remote","label":"message on task t-118","payload":{"message":{"taskId":"t-118","role":"user","parts":[{"kind":"text","text":"Cost center 4100 Sales."}]}},"note":"The answer continues the same task rather than creating a new one."},
{"from":"remote","to":"client","label":"completed + artifact","kind":"response","payload":{"task":{"id":"t-118","status":"completed","artifacts":[{"name":"expense-EX-5521","parts":[{"kind":"data","data":{"expenseId":"EX-5521","amount":"412.80 EUR","status":"submitted"}}]}]}},"note":"Results come back as artifacts, made of parts like messages."}]}
```

## How it works
**Agent cards.** A JSON document describing an agent: name, description, endpoint, the skills it offers, supported input and output modes, capabilities such as streaming and push notifications, and its security schemes. Cards are how clients discover and choose agents.

**Tasks.** Sending a message creates or continues a task, the unit of work with an id and a lifecycle. A task moves through states such as submitted, working, input required, completed, failed, canceled or rejected; some flows add an authentication-required state. A2A 1.0 revised several shapes and names, so take the exact list from the specification.

```mermaid id=a2a-lifecycle title="Tasks move from submitted to working, may pause for input, and end in one terminal state" caption="Simplified lifecycle. A2A 1.0 shipped breaking changes; check the specification for exact state names and transitions (verified Nov 2026)." alt="State diagram of an A2A task: submitted, working, input required, and terminal states completed, failed, canceled and rejected."
stateDiagram-v2
  [*] --> submitted
  submitted --> working
  submitted --> rejected
  working --> input_required: needs an answer
  input_required --> working: client replies
  working --> completed
  working --> failed
  working --> canceled
  completed --> [*]
  failed --> [*]
  canceled --> [*]
  rejected --> [*]
```

**Messages, parts and artifacts.** Messages have a role and a list of parts: text, files (inline or by URI) and structured data. Artifacts are the outputs a task produces, also made of parts.

**Streaming and push notifications.** For long tasks, the client can stream status and artifact updates, or register a webhook to be notified when the task changes, so it does not have to hold a connection open for hours.

**Authentication.** Cards declare security schemes (OAuth 2.0, API keys, mutual TLS and others); the client authenticates as it would to any API. Agents should act with delegated, scoped authority, not borrowed user credentials. See [MCP authorization](#mcp-authorization) for the same principles.

**History.** Google introduced A2A in April 2025; it moved to the Linux Foundation in mid-2025 and became a Growth Stage project of the Linux Foundation's Agentic AI Foundation (AAIF) in August 2026 (verified Nov 2026). Version 1.0.0 shipped on 12 March 2026 with breaking specification changes, and 1.0.1 followed on 26 May 2026 (verified Nov 2026). See [governance](#protocol-governance).

## In practice
When should the other side be an MCP tool and when an A2A agent?

```viz
{"id":"mcp-vs-a2a","component":"compare","title":"Wrap a capability as an MCP tool; talk to an independent agent with A2A","caption":"The same expense task done both ways. Hover the marks: the difference is who reasons, how long it takes, and who owns the state.","alt":"Comparison of filing an expense through an MCP tool and through an A2A task.","data":"illustrative","mono":false,"a":{"title":"MCP tool","text":"Your agent calls create_expense(amount, date, cost_center, receipt_uri). The server validates and writes a row. If the cost center is missing, it returns an error and your agent must work out the answer. The call returns in a second. Your agent owns the reasoning and the conversation.","mono":false},"b":{"title":"A2A task","text":"Your agent sends the receipt to the expense agent as a message. The expense agent reads it, checks policy, asks which cost center applies, waits for your answer, and returns the submitted expense as an artifact, perhaps hours later. The expense agent owns its reasoning, rules and state.","mono":false},"links":[{"a":"create_expense(amount, date, cost_center, receipt_uri)","b":"sends the receipt to the expense agent as a message","note":"A tool takes typed arguments; an agent takes a request in natural language and files."},{"a":"it returns an error and your agent must work out the answer","b":"asks which cost center applies, waits for your answer","note":"An agent can ask questions inside the task; a tool can only fail."},{"a":"The call returns in a second.","b":"perhaps hours later","note":"Tasks have lifecycles, streaming and push notifications for long work."},{"a":"Your agent owns the reasoning and the conversation.","b":"The expense agent owns its reasoning, rules and state.","note":"A2A suits peers you do not control or should not see inside."}]}
```

Rules of thumb:
- **Deterministic capability, fast, typed:** MCP tool.
- **Independent agent with its own policy, memory or long work:** A2A.
- **Both:** many agents expose an A2A interface outward and use MCP tools inward.
- **Treat remote agents as untrusted.** Their messages and artifacts are input from another system, which may carry injected instructions. See [prompt injection](#prompt-injection).

## Numbers to know
> [!number]
> Facts (verified Nov 2026): A2A 1.0.0 on 12 March 2026 with breaking changes; 1.0.1 on 26 May 2026. Rule of thumb: if a delegated job can take longer than one HTTP request should stay open, use streaming or push notifications rather than polling tightly.

## Pitfalls and anti-patterns
> [!pitfall] Wrapping every agent as a tool
> Turning a full agent into a single MCP tool hides its questions, progress and partial results. If the other side reasons and asks, give it a task lifecycle.

- **Trusting remote artifacts.** Validate them like any external data.
- **Building on pre-1.0 shapes.** Version 1.0 broke compatibility; update older code.
- **No timeouts on tasks.** Long tasks still need deadlines and cancellation.

## Talk like an expert
The vocabulary: **agent card**, **skill**, **task**, **task lifecycle**, **message**, **part**, **artifact**, **push notification**, **opaque agent**. Experts say “MCP for tools, A2A for peers” and design agents to be opaque: you send requests, not prompts. The live debate is overlap: MCP added long-running tasks and A2A agents use tools, so the boundary is a design choice more than a technical one.

> [!hottake] Most companies need A2A only at their boundaries, not inside them.
> **The counterargument:** large organizations already have many teams running separate agents with different owners and policies, which is exactly the boundary A2A was designed for, even inside one company.

## Check yourself
```quiz
a2a
```

## Go deeper
- The `a2aproject/A2A` repository, its specification and its changelog (verified Nov 2026).
- Google’s April 2025 announcement of the Agent2Agent protocol, for the original motivation.

## Related
- [Why protocols](#why-protocols)
- [Multi-agent systems](#multi-agent)
- [MCP architecture](#mcp-architecture)
- [Governance and ecosystem](#protocol-governance)
- [Long-running and durable agents](#long-running-agents)
- [Protocol building blocks: JSON-RPC, JSON Schema, HTTP streams and OAuth](#protocol-building-blocks)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [A2A 1.0 in depth: bindings, extensions and signed agent cards](#a2a-in-depth)
