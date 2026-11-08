---
id: streaming
book: 16
order: "16.3"
title: Streaming
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [sse, websockets, streaming]
visuals:
  - stream-events:sequence
  - proxy-compare:compare
---
> [!tldr]
> Streaming sends tokens as they are generated, usually as Server-Sent Events, so users see the first words in under a second. Handle typed events (text, tool-call arguments, stop reasons, usage), render partial Markdown safely, make sure proxies do not buffer, and design for interruption and resumption.

## Why it matters
A 20-second answer that starts after 800 milliseconds feels fast; the same answer delivered all at once feels broken. Streaming is also how agents show progress and how users interrupt them. Getting it wrong, through buffering proxies, broken partial rendering or lost connections, quietly ruins the experience.

## Intuition
Streaming is a live broadcast instead of a recorded show. Viewers start watching immediately, but the production crew must handle every glitch in real time.

```viz
{"id":"stream-events","component":"sequence","title":"A streamed response is a sequence of typed events, not a single blob of text","caption":"Tap each event to see its payload. Event names follow Anthropic’s Messages API; other providers use different names for the same ideas. Simplified.","alt":"Sequence diagram of a streamed model response: request, message start, text deltas, a tool-call block with partial JSON, a message delta with stop reason and usage, and message stop.","data":"illustrative","depicts":"Anthropic Messages API streaming, simplified","actors":[{"id":"client","label":"Your server","role":"agent"},{"id":"api","label":"Model API","role":"model"}],
"messages":[
{"from":"client","to":"api","label":"POST /v1/messages, stream: true"},
{"from":"api","to":"client","label":"message_start","kind":"response","payload":"event: message_start\ndata: {\"type\":\"message_start\",\"message\":{\"id\":\"msg_…\",\"usage\":{\"input_tokens\":812}}}"},
{"from":"api","to":"client","label":"content_block_delta (text)","kind":"response","payload":"event: content_block_delta\ndata: {\"type\":\"content_block_delta\",\"index\":0,\"delta\":{\"type\":\"text_delta\",\"text\":\"Let me check \"}}","note":"Append text deltas to the visible answer."},
{"from":"api","to":"client","label":"content_block_start (tool_use)","kind":"response","payload":"event: content_block_start\ndata: {\"type\":\"content_block_start\",\"index\":1,\"content_block\":{\"type\":\"tool_use\",\"name\":\"get_weather\",\"input\":{}}}"},
{"from":"api","to":"client","label":"content_block_delta (partial JSON)","kind":"response","payload":"event: content_block_delta\ndata: {\"type\":\"content_block_delta\",\"index\":1,\"delta\":{\"type\":\"input_json_delta\",\"partial_json\":\"{\\\"city\\\": \\\"Lis\"}}","note":"Tool arguments arrive in pieces; parse only when the block stops."},
{"from":"api","to":"client","label":"message_delta","kind":"response","payload":"event: message_delta\ndata: {\"type\":\"message_delta\",\"delta\":{\"stop_reason\":\"tool_use\"},\"usage\":{\"output_tokens\":41}}","note":"The stop reason tells your loop what to do next."},
{"from":"api","to":"client","label":"message_stop","kind":"response"}]}
```

## How it works
**Transports.** Server-Sent Events (SSE) over HTTP are the standard for model APIs: one-way, text-based, simple through proxies. WebSockets suit bidirectional, interactive apps such as voice; some providers offer realtime WebSocket APIs. Your own server usually re-streams model events to the browser over SSE or a WebSocket.

**Typed events.** Streams carry more than text: message start and end, content blocks (text, thinking, tool calls), partial tool arguments, stop reasons and token usage. Handle each type; do not just concatenate everything.

**Partial rendering.** Markdown arrives mid-structure: half a table, an unclosed code fence. Render incrementally with a parser that tolerates incomplete input, and sanitize HTML as it arrives. See [agent UX](#agent-ux).

**Tool calls while streaming.** Tool arguments stream as partial JSON; parse them only when the block completes. Agents can show “calling get_weather…” as soon as the block starts.

**Backpressure and cancellation.** If the user closes the tab or presses stop, cancel the upstream request so you stop paying for tokens nobody will read.

**Resumption.** Connections drop. Either store generated text server-side and let the client reconnect to a stream id, or re-request with what was already received. Make the choice explicitly.

**Proxies and buffering.** Load balancers and reverse proxies may buffer responses, which turns a stream into one late blob. Disable buffering for streaming routes:

```viz
{"id":"proxy-compare","component":"compare","title":"One proxy setting decides whether users see a stream or a long pause","caption":"Illustrative nginx configuration for a streaming route. Hover the marks. Other proxies and CDNs have equivalent settings.","alt":"Comparison of a buffering proxy configuration and a streaming-friendly one for Server-Sent Events.","data":"illustrative","a":{"title":"Buffers the stream","text":"location /api/chat {\n  proxy_pass http://app;\n}\n# user sees nothing for 20 s,\n# then the whole answer at once"},"b":{"title":"Streams","text":"location /api/chat {\n  proxy_pass http://app;\n  proxy_http_version 1.1;\n  proxy_buffering off;\n  proxy_read_timeout 300s;\n}\n# app also sends:\n#   Content-Type: text/event-stream\n#   Cache-Control: no-cache\n#   X-Accel-Buffering: no"},"links":[{"b":"proxy_buffering off;","note":"Without this, nginx collects the response before forwarding it."},{"b":"proxy_read_timeout 300s;","note":"Long generations exceed default read timeouts and get cut off."},{"b":"X-Accel-Buffering: no","note":"Lets the application disable nginx buffering per response."}]}
```

## In practice
- Measure TTFT at the client, not just at the server; buffering hides here.
- Show the first progress signal immediately, even before the first token.
- Cancel upstream on client disconnect.
- Log the stop reason and usage from the final events for every request. See [observability](#observability-tracing).
- Test with slow networks and long outputs.

## Numbers to know
> [!number]
> Rules of thumb. Aim for first visible output in under a second for chat. Streaming adds negligible cost but needs proxy timeouts longer than your longest generation.

## Pitfalls and anti-patterns
> [!pitfall] A buffering proxy in the path
> Everything works in development, then production shows a 20-second pause because a load balancer collects the whole response.

- **Concatenating all events as text.** Tool calls and thinking blocks leak into the UI.
- **Parsing partial tool JSON.** Wait for the block to complete.
- **No cancellation.** Abandoned streams keep generating and billing.

## Talk like an expert
The vocabulary: **Server-Sent Events**, **WebSocket**, **delta**, **content block**, **stop reason**, **partial JSON**, **backpressure**, **cancellation**, **stream resumption**, **proxy buffering**. Experts measure client-side TTFT and check every hop for buffering. The live debate is how agent interfaces should stream long, multi-step work: raw tokens, summarized progress events, or protocols such as AG-UI.

> [!hottake] For agents, stream progress events, not tokens.
> **The counterargument:** token streaming of the final answer is still what makes chat feel fast, and progress summaries add their own latency and cost; good interfaces do both.

## Check yourself
```quiz
streaming
```

## Go deeper
- Your provider’s streaming documentation, for exact event types.
- The WHATWG HTML specification section on Server-Sent Events.

## Related
- [Latency and throughput](#latency-throughput)
- [Agent UX](#agent-ux)
- [Reliability engineering](#reliability-engineering)
- [Model APIs in practice](#model-apis)
- [The rest of the alphabet soup](#protocol-soup)
- [Asynchronous and batch AI workloads](#async-batch-workloads)
