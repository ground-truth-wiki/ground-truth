---
id: mcp-client-features
book: 12
order: "12.4"
title: MCP client features and round trips
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [mcp, elicitation, tasks]
visuals:
  - mcp-roundtrip:sequence
  - client-feature-changes:tree
  - mcp-task-states:state
---
> [!tldr]
> Since the 2026-07-28 specification, a server that needs something from the client during a request no longer sends its own request back. It returns a result with resultType “input_required”, and the client retries the original request with the answers. Elicitation, progress and change subscriptions remain; roots, sampling and logging are deprecated; long-running work uses the tasks extension (verified Nov 2026).

## Why it matters
Interactive tools need to ask questions: “Deploy to production or staging?”, “Which of these three accounts?”. How a server asks decides whether it can run statelessly behind a load balancer, how hosts present the question to users, and how your server code is structured. The change from server-initiated requests to multi round-trip requests is the part of the 2026 spec most likely to affect working code.

## Intuition
Under the old design, the server could pick up the phone and call you back mid-task. Under the new one, it hands you a form: “I need these answers; call me again with them.” You fill it in and resubmit. Nothing has to stay on hold between the two calls, so any clerk at the counter can take the resubmission.

```viz
{"id":"mcp-roundtrip","component":"sequence","title":"The server cannot call you back anymore; it asks you to call again with the answer","caption":"Switch versions and step through. In the stateless version the server keeps no pending request open, so any replica can handle the retried call. Payloads are simplified; apart from resultType, field names are illustrative, so check the specification for exact shapes.","alt":"Sequence diagram comparing a server-initiated elicitation request through 2025-11-25 with a multi round-trip request in 2026-07-28.","data":"illustrative","depicts":"MCP 2025-06-18 elicitation and 2026-07-28 multi round-trip requests, simplified","try":"In the stateless tab, find the message where the client re-sends the original call, and what it adds.","actors":[{"id":"user","label":"User","role":"human"},{"id":"client","label":"Host and client","role":"agent"},{"id":"server","label":"MCP server","role":"tool"}],
"variants":[
{"name":"Through 2025-11-25: server asks","note":"The server sends its own request to the client while the original call is still open.","messages":[
{"from":"client","to":"server","label":"tools/call deploy","payload":{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"deploy","arguments":{"service":"api"}}},"note":"The call starts and stays open."},
{"from":"server","to":"client","label":"elicitation/create","payload":{"jsonrpc":"2.0","id":"s1","method":"elicitation/create","params":{"message":"Deploy api to which environment?","requestedSchema":{"type":"object","properties":{"environment":{"type":"string","enum":["staging","production"]}},"required":["environment"]}}},"note":"A server-initiated request, introduced in 2025-06-18. The connection must stay open for it."},
{"from":"client","to":"user","label":"Ask the user","payload":"tickets-server asks: Deploy api to which environment?  [staging] [production] [Decline]","note":"Hosts must show which server is asking and let the user decline."},
{"from":"user","to":"client","label":"staging","kind":"response"},
{"from":"client","to":"server","label":"elicitation result","kind":"response","payload":{"jsonrpc":"2.0","id":"s1","result":{"action":"accept","content":{"environment":"staging"}}}},
{"from":"server","to":"client","label":"deploy result","kind":"response","payload":{"jsonrpc":"2.0","id":7,"result":{"content":[{"type":"text","text":"Deployed api to staging."}],"isError":false}},"note":"The original call finally completes."}]},
{"name":"Since 2026-07-28: round trip","note":"The server answers immediately with what it needs; the client gathers it and retries. Nothing is held open between calls (verified Nov 2026).","messages":[
{"from":"client","to":"server","label":"tools/call deploy","payload":{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"deploy","arguments":{"service":"api"},"_meta":{"protocolVersion":"2026-07-28"}}}},
{"from":"server","to":"client","label":"input_required","kind":"response","payload":{"jsonrpc":"2.0","id":7,"result":{"resultType":"input_required","…":"a description of the input needed: Deploy api to which environment? (staging or production)"}},"note":"A result, not a request. The server can forget about this call."},
{"from":"client","to":"user","label":"Ask the user","payload":"tickets-server asks: Deploy api to which environment?  [staging] [production] [Decline]"},
{"from":"user","to":"client","label":"staging","kind":"response"},
{"from":"client","to":"server","label":"tools/call deploy + answers","payload":{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"deploy","arguments":{"service":"api"},"…":"the answers to the earlier input request","_meta":{"protocolVersion":"2026-07-28"}}},"note":"The original request is sent again with the answers attached. Any replica can handle it."},
{"from":"server","to":"client","label":"complete","kind":"response","payload":{"jsonrpc":"2.0","id":8,"result":{"resultType":"…complete…","content":[{"type":"text","text":"Deployed api to staging."}],"isError":false}},"note":"Every result carries a resultType. Check the spec for the value used for normal results."}]}]}
```

## How it works
**Multi round-trip requests** (2026-07-28, verified Nov 2026). Any request can come back with `resultType: "input_required"` instead of a final result, describing what the server needs. The client obtains it (from the user, from host policy, or from its own state) and re-sends the original request with the answers. Because the server keeps nothing pending, round trips work behind load balancers and across restarts. Every result now carries a `resultType`.

**Elicitation** lets a server ask the user for structured input or confirmation, described by a JSON Schema. It arrived in 2025-06-18 as a server-initiated request; in 2026-07-28 it travels through the round-trip mechanism. Hosts must show which server is asking, never let servers request secrets such as passwords this way, and always offer decline. The 2025-11-25 version also added a URL mode for sending users to a web page, for example to complete a sign-in.

**What was deprecated or removed** (verified Nov 2026):
- **Roots** (the client telling servers which folders they may work in), **sampling** (servers asking the client’s model to generate) and **logging** are deprecated. Check the 2026-07-28 changelog for the recommended replacements before building on them.
- **Ping** and `logging/setLevel` were removed, along with SSE stream resumability.
- **Resource subscriptions and the HTTP GET stream** were replaced by `subscriptions/listen`.

**Progress and cancellation.** Long operations can report progress and be cancelled; check the current specification for how these map onto stateless requests.

**The tasks extension.** Work that takes minutes or hours runs as a task: the client starts it, receives a task handle, and polls with `tasks/get` until it finishes. Tasks were experimental in the 2025-11-25 core and moved to an official extension in 2026-07-28 (verified Nov 2026).

```viz
{"id":"client-feature-changes","component":"tree","title":"Most client features survived the 2026 redesign; three were deprecated and two moved","caption":"Expand each feature to see its status in 2026-07-28 (verified Nov 2026) and what to do about it.","alt":"Tree of MCP client-side features and their status in the 2026-07-28 specification.","data":"illustrative","depicts":"MCP 2026-07-28","open":1,"root":{"label":"Client-side features in 2026-07-28","children":[
{"label":"Server-initiated requests","children":[{"label":"Replaced by multi round-trip requests with resultType input_required"}]},
{"label":"Elicitation","children":[{"label":"Kept; delivered through round trips; hosts must show the asking server and allow decline"}]},
{"label":"Roots","children":[{"label":"Deprecated; check the changelog for the replacement"}]},
{"label":"Sampling","children":[{"label":"Deprecated; check the changelog for the replacement"}]},
{"label":"Logging","children":[{"label":"Deprecated; logging/setLevel removed"}]},
{"label":"Resource subscriptions","children":[{"label":"Replaced by subscriptions/listen"}]},
{"label":"Tasks","children":[{"label":"Moved from the core to an official extension, polled with tasks/get","link":"#long-running-agents"}]}]}}
```

## In practice
A server handler in the round-trip style, as pseudocode:

```text
Pseudocode: a tool that needs confirmation, written for round trips.
handle tools/call deploy(service, answers?):
    if answers is missing or answers.environment is missing:
        return result(resultType = "input_required",
                      need = "environment: staging | production")
    if answers.environment == "production" and not caller_may_deploy_prod():
        return error("This caller may not deploy to production.")
    run_deploy(service, answers.environment, idempotency_key = request_key())
    return result(content = "Deployed " + service + " to " + answers.environment)
```

Notice what the handler does not do: it keeps no session, no pending callback and no in-memory state between the first call and the retry. Make the deploy idempotent, because a client may retry more than once. See [reliability engineering](#reliability-engineering).

For long-running work, the tasks extension follows a simple lifecycle:

```mermaid id=mcp-task-states title="A task moves from working to a terminal state, and may pause for input" caption="A simplified lifecycle. Check the tasks extension specification for the exact state names and transitions." alt="State diagram: a task starts working, may move to input required and back, and ends completed, failed or cancelled."
stateDiagram-v2
  [*] --> working
  working --> input_required: server needs an answer
  input_required --> working: client supplies it
  working --> completed
  working --> failed
  working --> cancelled
  completed --> [*]
  failed --> [*]
  cancelled --> [*]
```

Host checklist:
- Show every input request with the asking server’s name and a decline option.
- Never forward secrets through elicitation; use the authorization flow instead. See [MCP authorization](#mcp-authorization).
- Bound round trips: cap how many times one call may come back for input.
- Poll tasks with backoff, and surface their state in the UI. See [agent UX](#agent-ux).

## Numbers to know
> [!number]
> Facts (verified Nov 2026): multi round-trip requests, `subscriptions/listen` and tasks as an extension arrived in 2026-07-28; elicitation arrived in 2025-06-18; tasks first appeared as experimental in 2025-11-25. Rule of thumb: cap input round trips per call at a small number, such as three.

## Pitfalls and anti-patterns
> [!pitfall] Keeping a pending request in server memory
> A server that stores “call 7 is waiting for an answer” in a process variable breaks when the retry lands on another replica. Encode what you need in the round trip or in your own storage.

- **Building on deprecated features.** Roots, sampling and logging still appear in older tutorials; check before adopting them.
- **Asking users for secrets.** Elicitation is for choices and confirmations, never passwords or tokens.
- **Endless round trips.** A buggy server can ask forever; hosts should cap it.

## Talk like an expert
The vocabulary: **multi round-trip request**, `resultType`, `input_required`, **elicitation**, **server-initiated request**, `subscriptions/listen`, **tasks extension**, `tasks/get`. Experts summarize the change as “servers can no longer call you; they can ask you to call again”. The live debate is whether round trips make some interactive patterns, such as streaming conversations between server and user, awkward enough to need another extension.

> [!hottake] Round trips are the best thing that happened to MCP server code.
> **The counterargument:** for local stdio servers with one user, statelessness buys little, and handlers that must reconstruct context on every retry can be more complex than a simple callback.

## Check yourself
```quiz
mcp-client-features
```

## Go deeper
- The 2026-07-28 changelog in the `modelcontextprotocol/modelcontextprotocol` repository, under `docs/specification/2026-07-28` (verified Nov 2026).
- The client features and utilities sections of the specification at modelcontextprotocol.io.

## Related
- [MCP architecture](#mcp-architecture)
- [MCP server primitives](#mcp-primitives)
- [Human in the loop](#human-in-the-loop)
- [MCP spec history](#mcp-spec-history)
- [Long-running and durable agents](#long-running-agents)
