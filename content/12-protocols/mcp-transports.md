---
id: mcp-transports
book: 12
order: "12.5"
title: MCP transports
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [mcp, stdio, streamable-http]
visuals:
  - stdio-vs-http:compare
  - http-exchange:sequence
  - transport-matrix:matrix
---
> [!tldr]
> MCP messages travel over stdio for local servers and Streamable HTTP for remote ones. Since 2026-07-28 there are no protocol sessions and no SSE stream resumability, and the original HTTP+SSE transport is formally deprecated (verified Nov 2026). Pick the transport by trust boundary.

## Why it matters
The transport decides where a server runs, whose permissions it has, how it is authorized and how it scales. A local stdio server runs as you, with access to your files; a remote HTTP server is someone else’s service, reached over the network with OAuth. Mixing up the two is how teams end up giving a stranger’s code their SSH keys, or building a remote server that cannot scale past one machine.

## Intuition
stdio is talking to a helper in the same room: no addresses, no badges, but they can touch everything in the room. Streamable HTTP is calling a company’s front desk: you need their number and a badge, but they cannot rummage through your desk, and the company can put as many clerks behind the desk as it likes.

```viz
{"id":"stdio-vs-http","component":"compare","title":"stdio runs a local process with your permissions; HTTP calls a remote service with a token","caption":"The same tools/call over both transports. Hover the marks to compare framing, identity and scaling. Simplified; header names other than MCP-Protocol-Version are standard HTTP.","alt":"Comparison of a tools/call message sent over stdio and over Streamable HTTP.","data":"illustrative","depicts":"MCP transports, 2025-06-18 through 2026-07-28","a":{"title":"stdio (local)","text":"host launches: tickets-server --stdio\n\nstdin  -> {\"jsonrpc\":\"2.0\",\"id\":3,\n           \"method\":\"tools/call\", ...}\\n\nstdout <- {\"jsonrpc\":\"2.0\",\"id\":3,\n           \"result\":{...}}\\n\nstderr <- logs only\n\nruns as: the user, with the user's files"},"b":{"title":"Streamable HTTP (remote)","text":"POST https://tickets.example.com/mcp\nAuthorization: Bearer eyJ...\nMCP-Protocol-Version: 2026-07-28\nAccept: application/json, text/event-stream\n\n{\"jsonrpc\":\"2.0\",\"id\":3,\n \"method\":\"tools/call\", ...}\n\n200 OK  (JSON, or a stream of events)\n\nruns as: the service, behind a load balancer"},"links":[{"a":"host launches: tickets-server --stdio","b":"POST https://tickets.example.com/mcp","note":"stdio servers are child processes of the host; HTTP servers are addressed by URL."},{"a":"\\n","b":"Accept: application/json, text/event-stream","note":"stdio frames messages by newline; HTTP lets the server reply with plain JSON or a stream."},{"a":"stderr <- logs only","note":"On stdio, stdout is reserved for protocol messages; anything else must go to stderr."},{"b":"Authorization: Bearer eyJ...","note":"Remote servers authorize each request with OAuth tokens. See the authorization chapter."},{"a":"runs as: the user, with the user's files","b":"runs as: the service, behind a load balancer","note":"The trust boundary: local code with your permissions versus a remote service with its own."}]}
```

## How it works
**stdio.** The host starts the server as a subprocess and writes JSON-RPC messages to its standard input, one per line; the server writes responses to standard output. Messages must not contain embedded newlines, and the server must not write anything except protocol messages to stdout; logs go to stderr. There is no network exposure and no authorization layer: the server simply has whatever the user’s process has, which is why local servers belong in a [sandbox](#sandboxes).

**Streamable HTTP.** Introduced in 2025-03-26 to replace HTTP+SSE. The client sends each JSON-RPC message as an HTTP POST to one endpoint. The server answers with `application/json` for a single response, or `text/event-stream` to stream progress and then the result. Since 2025-06-18, HTTP clients must send an `MCP-Protocol-Version` header.

**What changed in 2026-07-28** (verified Nov 2026):
- **No protocol sessions.** The `Mcp-Session-Id` mechanism is gone; each request carries its own version and capabilities. See [MCP architecture](#mcp-architecture).
- **No stream resumability.** Interrupted SSE streams are not resumed; retry the request, and keep side effects idempotent.
- **No GET stream.** Change notifications come through `subscriptions/listen`.
- **Required request headers.** The specification lists headers every request must carry; check it for the exact set.

**HTTP+SSE, deprecated.** The 2024-11-05 transport used a long-lived SSE connection for server messages and a separate POST endpoint for client messages. It is formally deprecated under the feature-lifecycle policy; servers still offering it should migrate.

**Local HTTP servers.** If you run an HTTP server on localhost, validate the `Origin` header and bind to the loopback interface, or a malicious web page can reach it through DNS rebinding. The specification calls this out explicitly.

```viz
{"id":"http-exchange","component":"sequence","title":"One POST, then either a single JSON reply or a short stream of events","caption":"Switch response styles and step through. Streaming lets a slow tool report progress before its result; both styles end the exchange when the result arrives.","alt":"Sequence diagram of a Streamable HTTP request answered with a JSON response or with a stream of progress events and a result.","data":"illustrative","depicts":"MCP Streamable HTTP, 2026-07-28, simplified","actors":[{"id":"client","label":"MCP client","role":"agent"},{"id":"lb","label":"Load balancer","role":"external"},{"id":"srv","label":"Server replica","role":"tool"}],
"variants":[
{"name":"JSON response","messages":[
{"from":"client","to":"lb","label":"POST /mcp","payload":"POST /mcp\nAuthorization: Bearer …\nMCP-Protocol-Version: 2026-07-28\nAccept: application/json, text/event-stream\n\n{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"tools/call\",\"params\":{\"name\":\"search_tickets\",\"arguments\":{\"query\":\"refund\"}}}","note":"A self-contained request: version, capabilities and credentials travel with it."},
{"from":"lb","to":"srv","label":"any replica","note":"Without sessions, there is no sticky routing to maintain."},
{"from":"srv","to":"lb","label":"200 application/json","kind":"response","payload":{"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"3 open tickets"}],"isError":false}}},
{"from":"lb","to":"client","label":"result","kind":"response"}]},
{"name":"Streamed response","messages":[
{"from":"client","to":"lb","label":"POST /mcp","payload":"POST /mcp … (same headers)\n\n{\"jsonrpc\":\"2.0\",\"id\":4,\"method\":\"tools/call\",\"params\":{\"name\":\"export_report\"}}"},
{"from":"lb","to":"srv","label":"any replica"},
{"from":"srv","to":"client","label":"event: progress","kind":"response","payload":"event: message\ndata: {progress notification, 40%}","note":"The server chose text/event-stream to report progress on a slow tool."},
{"from":"srv","to":"client","label":"event: result","kind":"response","payload":"event: message\ndata: {\"jsonrpc\":\"2.0\",\"id\":4,\"result\":{…}}","note":"The stream ends with the result. If it drops first, the client retries; there is no resumption in 2026-07-28."}]}]}
```

## In practice
```viz
{"id":"transport-matrix","component":"matrix","matrix":"mcp-transports","title":"Two current transports and one deprecated one, compared","caption":"Sortable and filterable. Dated; check the specification for changes.","alt":"Table comparing stdio, Streamable HTTP and HTTP+SSE by where they run, sessions, authorization and status.","data":"illustrative"}
```

Rules of thumb:
- **stdio** for local tools you trust or sandbox: filesystems, Git, local databases, browsers on your machine.
- **Streamable HTTP** for shared or third-party services: SaaS integrations, company-wide tools, anything multi-user.
- **Make HTTP servers stateless** so they scale like any web service; store what you need keyed by user or task.
- **Log the protocol version** of every request to see which clients still send old ones.
- **Treat a dropped stream as a failed request** and retry idempotently.

## Numbers to know
> [!number]
> Facts (verified Nov 2026): Streamable HTTP arrived in 2025-03-26; the `MCP-Protocol-Version` header became required in 2025-06-18; sessions and resumability were removed and HTTP+SSE formally deprecated in 2026-07-28.

## Pitfalls and anti-patterns
> [!pitfall] Printing to stdout in a stdio server
> One debug `print` corrupts the message stream and the host disconnects. Send logs to stderr.

- **Exposing a local HTTP server without Origin checks.** Web pages can reach localhost.
- **Sticky sessions behind a load balancer.** Not needed in 2026-07-28, and a source of scaling bugs.
- **Running untrusted stdio servers unsandboxed.** They have your files and your network.

## Talk like an expert
The vocabulary: **stdio**, **Streamable HTTP**, **SSE**, **HTTP+SSE (deprecated)**, **session**, **resumability**, `MCP-Protocol-Version`, **DNS rebinding**, **Origin validation**. Experts pick transports by trust boundary, not by convenience. The live debate is whether remote servers will dominate as hosts move to the cloud, which would make authorization the center of the MCP story.

> [!hottake] Local stdio servers are the biggest unmanaged security risk in developer machines today.
> **The counterargument:** stdio servers are no riskier than any other package a developer installs and runs; the fix is the same supply-chain hygiene and sandboxing applied to all local tools, not avoiding stdio.

## Check yourself
```quiz
mcp-transports
```

## Go deeper
- The transports section of the MCP specification at modelcontextprotocol.io, for each version.
- The 2026-07-28 changelog (verified Nov 2026).

## Related
- [MCP architecture](#mcp-architecture)
- [MCP authorization](#mcp-authorization)
- [Building MCP servers](#building-mcp-servers)
- [Streaming](#streaming)
- [Sandboxes and execution environments](#sandboxes)
