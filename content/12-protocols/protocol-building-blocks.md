---
id: protocol-building-blocks
book: 12
order: "12.1.1"
title: "Protocol building blocks: JSON-RPC, JSON Schema, HTTP streams and OAuth"
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [json-rpc, json-schema, oauth, server-sent-events, web-standards]
visuals:
  - protocol-building-blocks-stack:diagram
  - protocol-building-blocks-jsonrpc:sequence
  - protocol-building-blocks-dialects:compare
  - protocol-building-blocks-http:tree
prerequisites: [why-protocols]
---
> [!tldr]
> Agent protocols are built from a few web standards: JSON-RPC 2.0 for messages, JSON Schema for contracts, HTTP and Server-Sent Events for transport, OAuth and JOSE for identity, and well-known URIs for discovery. MCP, A2A and their peers differ mostly in which pieces they pick. Learn the pieces once, and most interoperability bugs become easy to name.

## Why it matters

When an MCP client and server fail to talk, the cause is rarely MCP itself. It is a `null` id, a dialect the validator does not speak, a 401 without its challenge, or a token for another audience. Agent specifications cite these standards rather than restate them, and they set each [protocol's limits](#why-protocols): JSON-RPC knows nothing about authorization, OAuth nothing about tools.

## Intuition

Think of a container port. JSON-RPC is the container: a box with a label (`method`), a tracking number (`id`) and contents (`params`). JSON Schema is the packing list. HTTP, SSE and stdio are the trucks. OAuth is the customs stamp that says who may open the box, and well-known URIs are the port directory. Agent protocols are shipping lines reusing the same boxes and trucks.

```viz
{"id":"protocol-building-blocks-stack","component":"diagram","title":"Every agent protocol picks one option per layer from the same web standards","caption":"Illustrative. Read from the bottom: bytes move over a transport, inside a message envelope, shaped by a data contract, authorized by identity standards and found through discovery. Click a layer or a protocol for the chapter that covers it.","alt":"Layered diagram with five layers from bottom to top: transport (stdio, HTTP, Server-Sent Events, WebSockets, gRPC), message envelope (JSON-RPC 2.0, Protocol Buffers), data contracts (JSON Schema, OpenAPI), identity and trust (OAuth, OpenID Connect, JWT, JWS, JWK), and discovery (well-known URIs and metadata documents). A side column lists MCP, A2A, the Agent Client Protocol and AG-UI as protocols that combine these layers.","data":"illustrative","depicts":"Agent protocol building blocks as of November 2026","try":"Click the envelope layer, then come back and click MCP to see the same idea from the protocol side.","w":620,"h":322,"nodes":[
{"id":"disc","label":"Discovery","sub":"/.well-known/ URIs, metadata, agent cards","role":"plain","x":0,"y":0,"w":450,"h":58,"link":"#mcp-authorization"},
{"id":"ident","label":"Identity and trust","sub":"OAuth 2.x, OpenID Connect, JWT, JWS, JWK","role":"plain","x":0,"y":66,"w":450,"h":58,"link":"#agent-identity-delegation"},
{"id":"contract","label":"Data contracts","sub":"JSON Schema, OpenAPI","role":"plain","x":0,"y":132,"w":450,"h":58,"link":"#structured-outputs"},
{"id":"env","label":"Message envelope","sub":"JSON-RPC 2.0, Protocol Buffers","role":"plain","x":0,"y":198,"w":450,"h":58,"link":"#mcp-architecture"},
{"id":"trans","label":"Transport","sub":"stdio, HTTP, SSE, WebSockets, gRPC","role":"plain","x":0,"y":264,"w":450,"h":58,"link":"#mcp-transports"},
{"id":"mcp","label":"MCP","sub":"tools and data","align":"center","glyph":false,"x":462,"y":0,"w":158,"h":74,"link":"#mcp-architecture"},
{"id":"a2a","label":"A2A","sub":"peer agents","align":"center","glyph":false,"x":462,"y":82,"w":158,"h":74,"link":"#a2a"},
{"id":"acp","label":"Agent Client\nProtocol","sub":"editors","align":"center","glyph":false,"x":462,"y":164,"w":158,"h":74,"link":"#agent-client-protocol"},
{"id":"agui","label":"AG-UI","sub":"front ends","align":"center","glyph":false,"x":462,"y":246,"w":158,"h":76,"link":"#agent-ui-protocols"}]}
```

## How it works

**JSON-RPC 2.0, the envelope.** In the [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification), a request has a `method`, optional `params` and an `id`. The response echoes the `id` with `result` or `error`, never both. A message without an `id` is a notification and gets no reply. JSON-RPC discourages but allows null ids; [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/index.md) forbids them and any reuse of an id still in flight. An error holds an integer `code`, a `message` and optional `data`. Codes -32768 to -32000 are reserved: -32700 and -32600 to -32603 for standard failures, -32000 to -32099 for server-defined ones. MCP splits that last range into legacy codes (-32000 to -32019) and codes only its spec may define (-32020 to -32099). [A2A's JSON-RPC binding](https://a2a-protocol.org/latest/specification/) claims -32001 to -32099, so one number means different things per protocol. Batches arrived in MCP [2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26/changelog) and left in [2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/changelog); the author of the [pull request](https://github.com/modelcontextprotocol/specification/pull/416) had seen no compelling use case for them.

```viz
{"id":"protocol-building-blocks-jsonrpc","component":"sequence","title":"One envelope, three shapes: requests get exactly one reply, notifications get none","caption":"Illustrative payloads in MCP 2026-07-28 style. Switch tabs and step through: a normal call, three kinds of failure, and the batch form MCP dropped. After the first request, the required _meta fields are left out for brevity, as the MCP specification's own examples do.","alt":"Sequence diagram of JSON-RPC 2.0 messages between a client and a server: a request with progress notifications and a result; a parse error, an unknown-tool protocol error and a tool execution error; and a plain JSON-RPC batch with responses in a different order.","data":"illustrative","depicts":"JSON-RPC 2.0 as used by MCP 2026-07-28, simplified","try":"In the failures tab, compare the unknown tool with the bad month: one is an error, the other is a result.","actors":[{"id":"client","label":"Client","role":"agent"},{"id":"server","label":"Server","role":"tool"}],
"variants":[
{"name":"Request, notification, result","note":"The id ties the result to its request; the notification has no id, so nothing answers it.","messages":[
{"from":"client","to":"server","label":"tools/call (id 7)","payload":{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"export_report","arguments":{"month":"2026-10"},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{},"progressToken":"p-7"}}},"note":"A request: method, params and an id no other in-flight request uses. MCP puts the protocol version and client capabilities in _meta on every request."},
{"from":"server","to":"client","label":"notifications/progress","payload":{"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"p-7","progress":40,"total":100}},"note":"A notification: no id, so no reply. Over Streamable HTTP it travels on this request's event stream."},
{"from":"server","to":"client","label":"result (id 7)","kind":"response","payload":{"jsonrpc":"2.0","id":7,"result":{"resultType":"complete","content":[{"type":"text","text":"Report ready."}],"isError":false}},"note":"Same id as the request, and result instead of error. Since 2026-07-28 every MCP result carries a resultType."}]},
{"name":"Three kinds of failure","note":"Broken JSON, a broken request and a failed tool are answered in three different ways.","messages":[
{"from":"client","to":"server","label":"broken JSON","payload":"{\"jsonrpc\":\"2.0\",\"id\":8,\"method\":\"tools/call\",","note":"The body is cut off, so the server cannot even read the id."},
{"from":"server","to":"client","label":"-32700 Parse error","kind":"response","payload":{"jsonrpc":"2.0","error":{"code":-32700,"message":"Parse error"}},"note":"MCP lets an error response leave out the id when the id could not be read. Plain JSON-RPC sends id null instead."},
{"from":"client","to":"server","label":"tools/call (id 9)","payload":{"jsonrpc":"2.0","id":9,"method":"tools/call","params":{"name":"export_reprot","arguments":{}}},"note":"A typo in the tool name."},
{"from":"server","to":"client","label":"-32602 (id 9)","kind":"response","payload":{"jsonrpc":"2.0","id":9,"error":{"code":-32602,"message":"Unknown tool: export_reprot"}},"note":"A protocol error: the request itself is wrong. MCP uses -32602 for unknown tools."},
{"from":"client","to":"server","label":"tools/call (id 10)","payload":{"jsonrpc":"2.0","id":10,"method":"tools/call","params":{"name":"export_report","arguments":{"month":"2026-13"}}},"note":"A well-formed call with an argument the tool cannot use."},
{"from":"server","to":"client","label":"isError: true (id 10)","kind":"response","payload":{"jsonrpc":"2.0","id":10,"result":{"resultType":"complete","content":[{"type":"text","text":"month must be between 01 and 12"}],"isError":true}},"note":"A tool execution error is a normal result. The model reads it and can correct its own call."}]},
{"name":"Batch (dropped by MCP)","note":"Plain JSON-RPC 2.0, not MCP: MCP allowed batches only in version 2025-03-26.","messages":[
{"from":"client","to":"server","label":"array of three","payload":[{"jsonrpc":"2.0","id":"a","method":"sum","params":[1,2]},{"jsonrpc":"2.0","method":"log","params":["hello"]},{"jsonrpc":"2.0","id":"b","method":"get_user","params":{"id":42}}],"note":"Two requests and one notification in one array."},
{"from":"server","to":"client","label":"array of two","kind":"response","payload":[{"jsonrpc":"2.0","id":"b","result":{"name":"Ada"}},{"jsonrpc":"2.0","id":"a","result":3}],"note":"One response per request, in any order, matched by id. The notification gets none, and a batch of only notifications gets no reply at all."}]}]}
```

**JSON Schema, the contract.** Tool `inputSchema` and `outputSchema` are [JSON Schema](https://json-schema.org/specification). `$schema` names the dialect; MCP defaults to 2020-12, the current version, and must return an error for dialects it does not support. Dialects disagree on names and on keywords beside `$ref` ([draft-07](https://json-schema.org/draft-07/draft-handrews-json-schema-01), [2019-09](https://json-schema.org/draft/2019-09/release-notes) and [2020-12](https://json-schema.org/draft/2020-12/release-notes) notes). `allOf`, `anyOf`, `oneOf` and `not` compose schemas. MCP bans fetching network `$ref`s by default and asks validators to bound composition, since hostile schemas can attack validators.

```viz
{"id":"protocol-building-blocks-dialects","component":"compare","title":"The same contract in two dialects: three keywords move, and one cap can silently vanish","caption":"Illustrative schema. Hover or focus each marked passage. Without a $schema line, an MCP host reads a schema as 2020-12, so the left-hand version only works because it declares itself.","alt":"Side-by-side comparison of one JSON Schema written in draft-07 and in 2020-12: the $schema URI, definitions versus $defs, a $ref with a sibling maximum, a tuple written with items versus prefixItems, and dependencies versus dependentRequired.","data":"illustrative","depicts":"JSON Schema draft-07 and 2020-12","try":"Focus the maximum next to $ref on the left and read what draft-07 says about it.","a":{"title":"draft-07","text":"{\n \"$schema\":\n   \"http://json-schema.org/draft-07/schema#\",\n \"definitions\": {\n   \"money\": {\"type\": \"number\", \"minimum\": 0}\n },\n \"type\": \"object\",\n \"properties\": {\n   \"amount\": {\"$ref\": \"#/definitions/money\",\n              \"maximum\": 5000},\n   \"point\": {\"type\": \"array\",\n             \"items\": [{\"type\": \"number\"},\n                       {\"type\": \"number\"}]}\n },\n \"dependencies\": {\"refund\": [\"reason\"]}\n}"},"b":{"title":"2020-12 (MCP's default)","text":"{\n \"$schema\":\n   \"https://json-schema.org/draft/2020-12/schema\",\n \"$defs\": {\n   \"money\": {\"type\": \"number\", \"minimum\": 0}\n },\n \"type\": \"object\",\n \"properties\": {\n   \"amount\": {\"$ref\": \"#/$defs/money\",\n              \"maximum\": 5000},\n   \"point\": {\"type\": \"array\",\n             \"prefixItems\": [{\"type\": \"number\"},\n                             {\"type\": \"number\"}]}\n },\n \"dependentRequired\": {\"refund\": [\"reason\"]}\n}"},"links":[
{"a":"\"http://json-schema.org/draft-07/schema#\"","b":"\"https://json-schema.org/draft/2020-12/schema\"","note":"$schema picks the dialect. MCP defaults to 2020-12 and must return an error for dialects it does not support."},
{"a":"\"definitions\"","b":"\"$defs\"","note":"Renamed in 2019-09. The old name is not an error, but $defs is the preferred one."},
{"a":"\"maximum\": 5000","b":"\"maximum\": 5000","note":"Draft-07: keywords next to $ref MUST be ignored, so a strict validator drops the cap. 2019-09 and later apply it. Validators differ: Ajv 8 (tested with 8.20) applies it even in draft-07 mode."},
{"a":"\"items\": [","b":"\"prefixItems\": [","note":"2020-12 moved tuples to prefixItems. An array under items is an invalid schema in 2020-12, where items takes one schema for the remaining elements."},
{"a":"\"dependencies\"","b":"\"dependentRequired\"","note":"2019-09 split dependencies into dependentRequired (lists of property names) and dependentSchemas (schemas)."}]}
```

Model APIs accept narrower, differing subsets, as of November 2026. [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) allows recursion but rejects `allOf` and `if`/`then`/`else`; [Anthropic strict tool use](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) allows `allOf` but rejects recursion and `minimum`. Both require `additionalProperties: false`, so a valid MCP schema can still fail at the model ([structured outputs](#structured-outputs)).

**HTTP and streams.** Status codes follow [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) and [RFC 6585](https://www.rfc-editor.org/rfc/rfc6585) (see the tree below). Servers check the `Origin` header ([RFC 6454](https://www.rfc-editor.org/rfc/rfc6454)) against DNS rebinding, and MCP clients accept both `application/json` and `text/event-stream` replies ([Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http.md), [transports](#mcp-transports)). [Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html) are UTF-8 lines (`event`, `data`, `id`, `retry`) pushed one way over plain HTTP ([streaming](#streaming)). [WebSockets](https://www.rfc-editor.org/rfc/rfc6455) upgrade HTTP into a two-way channel. [gRPC](https://grpc.io/docs/what-is-grpc/introduction/) carries Protocol Buffers [over HTTP/2](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md). [A2A 1.0](https://a2a-protocol.org/latest/specification/) binds to JSON-RPC, gRPC or HTTP+JSON.

**Discovery and addressing.** [RFC 8615](https://www.rfc-editor.org/rfc/rfc8615) reserves `/.well-known/`, home of OAuth's `oauth-protected-resource` ([RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)) and `oauth-authorization-server` ([RFC 8414](https://www.rfc-editor.org/rfc/rfc8414)) documents and of A2A's `agent-card.json`. [URI templates](https://www.rfc-editor.org/rfc/rfc6570) such as `file:///{path}` back MCP [resource templates](https://modelcontextprotocol.io/specification/2026-07-28/server/resources.md). [JSON Patch](https://www.rfc-editor.org/rfc/rfc6902) lists `add`, `remove`, `replace`, `move`, `copy` and `test` operations, which AG-UI's [`STATE_DELTA`](https://docs.ag-ui.com/concepts/state) events carry.

**JOSE.** [JWS](https://www.rfc-editor.org/rfc/rfc7515) signs content. A [JWT](https://www.rfc-editor.org/rfc/rfc7519) is a set of claims (`iss`, `sub`, `aud`, `exp`) inside a JWS or JWE. A [JWK](https://www.rfc-editor.org/rfc/rfc7517) is a key as JSON; a JWK Set (`{"keys": [...]}`) often sits at a metadata `jwks_uri`. Signatures need one byte form of JSON: [JCS](https://www.rfc-editor.org/rfc/rfc8785) sorts property names and drops whitespace. [A2A signs agent cards](https://a2a-protocol.org/latest/specification/) as JWS over JCS.

**OAuth in one page.** [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) has four roles: resource owner (the user), client (the agent), authorization server (issues tokens) and resource server (the API or MCP server). The authorization code grant with [PKCE](https://www.rfc-editor.org/rfc/rfc7636) delegates a user's access: the client sends `BASE64URL(SHA256(verifier))` first and the verifier later. Client credentials serve a client acting for itself. Scopes narrow tokens. Access tokens go to resource servers, refresh tokens only to the authorization server. Bearer tokens work for whoever holds them; sender-constrained tokens need proof of a key ([DPoP](https://www.rfc-editor.org/rfc/rfc9449) or mutual TLS). [OAuth 2.1](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/) makes PKCE the default and drops the implicit and password grants. As of November 2026 it is draft revision -17, and MCP's [authorization spec](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization.md) cites -13. [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html) adds an ID token, a JWT, when the client requests the `openid` scope ([MCP authorization](#mcp-authorization)).

**OpenAPI** [describes HTTP APIs](https://spec.openapis.org/oas/latest.html); by default, version 3.2's Schema Object is a superset of JSON Schema 2020-12. The [Agentic Commerce Protocol](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol) ships OpenAPI files.

## In practice

Who uses what, as of November 2026 (a dash: none listed here):

| Protocol | Envelope | Contracts | Transport | Also |
|---|---|---|---|---|
| [MCP](#mcp-architecture) | JSON-RPC | JSON Schema | stdio, Streamable HTTP | OAuth 2.1, RFC 9728, URI templates |
| [A2A](#a2a) | JSON-RPC, gRPC or HTTP+JSON | Protocol Buffers | HTTP, SSE for streams | Signed agent card, OpenAPI security schemes |
| [AG-UI](#agent-ui-protocols) | Typed events | - | [SSE, binary HTTP](https://docs.ag-ui.com/concepts/architecture) | JSON Patch |
| [Agent Client Protocol](#agent-client-protocol) | [JSON-RPC](https://agentclientprotocol.com/protocol/overview) | - | [stdio](https://agentclientprotocol.com/protocol/transports) | - |
| [Commerce](#agentic-commerce-protocols) | Agentic Commerce Protocol: HTTP API | OpenAPI, JSON Schema | HTTP | [AP2](https://ap2-protocol.org/) signed mandates; [x402](https://github.com/coinbase/x402) status 402 |

Validate with the declared dialect and keep the two error channels apart ([Ajv](https://ajv.js.org/guide/managing-schemas.html) never fetches a `$ref` itself):

```ts
import Ajv, { type ValidateFunction } from "ajv"; // draft-07, Ajv's default
import Ajv2020 from "ajv/dist/2020";             // 2020-12, MCP's default

const DRAFT_07 = "http://json-schema.org/draft-07/schema";

// strict: false tolerates extension keywords such as x-mcp-header.
// compile() throws on an unknown dialect, an invalid schema or an unresolved $ref.
export function compileToolSchema(schema: { $schema?: string; [keyword: string]: unknown }): ValidateFunction {
  const draft07 = schema.$schema?.replace(/#$/, "") === DRAFT_07; // with or without the trailing #
  const ajv = draft07 ? new Ajv({ strict: false }) : new Ajv2020({ strict: false });
  return ajv.compile(schema);
}

type Tool = { validate: ValidateFunction; run: (args: unknown) => unknown[] };

export function callTool(id: string | number, params: { name: string; arguments?: unknown }, tools: Map<string, Tool>) {
  const tool = tools.get(params.name);
  if (!tool) {
    // Protocol error: the request itself is wrong.
    return { jsonrpc: "2.0", id, error: { code: -32602, message: `Unknown tool: ${params.name}` } };
  }
  const args = params.arguments ?? {};
  if (!tool.validate(args)) {
    // Tool execution error: a normal result the model can read and fix.
    const text = (tool.validate.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message}`).join("; ");
    return { jsonrpc: "2.0", id, result: { resultType: "complete", isError: true, content: [{ type: "text", text }] } };
  }
  return { jsonrpc: "2.0", id, result: { resultType: "complete", isError: false, content: tool.run(args) } };
}
```

Let HTTP statuses drive the next step:

```viz
{"id":"protocol-building-blocks-http","component":"tree","title":"The status code and its headers tell an agent what to do next","caption":"Illustrative decision guide built from RFC 9110, RFC 6585, x402 and the MCP 2026-07-28 transport and authorization specifications. Expand a status to see the usual cause and the right reaction.","alt":"Decision tree from HTTP status codes to actions: 401 starts OAuth discovery from the WWW-Authenticate challenge or the well-known URIs; 403 means step-up authorization, a rejected Origin header or no retry with the same credentials; 402 is reserved, and x402 uses it for payment; 429 means wait and back off; 400 from an MCP server carries a JSON-RPC error code; 202 acknowledges a notification; a 200 event stream carries notifications and then the result.","data":"illustrative","depicts":"HTTP semantics and MCP Streamable HTTP, 2026-07-28","try":"Open 403 and compare its three causes.","open":1,"root":{"label":"An agent's HTTP call came back. What is the status?","children":[
{"label":"401 Unauthorized","children":[{"label":"No valid credentials. Read the WWW-Authenticate challenge: it may name resource_metadata and a scope. Without resource_metadata, try the well-known URIs. Either way, discovery starts here","link":"#mcp-authorization"}]},
{"label":"403 Forbidden","children":[{"label":"error=\"insufficient_scope\": re-authorize with the old scopes plus the new ones, then retry a few times at most","link":"#mcp-authorization"},{"label":"The MCP server rejected an invalid Origin header: a web page on another origin tried to reach it","link":"#mcp-transports"},{"label":"Otherwise: do not retry with the same credentials"}]},
{"label":"402 Payment Required","children":[{"label":"Reserved for future use in RFC 9110. x402 uses it to quote a price, and the client retries with a PAYMENT-SIGNATURE header","link":"#agentic-commerce-protocols"}]},
{"label":"429 Too Many Requests","children":[{"label":"Rate limited. Honor Retry-After if present, then back off","link":"#rate-limits-overload"}]},
{"label":"400 Bad Request from an MCP server","children":[{"label":"Read the JSON-RPC error in the body: -32020 header mismatch, -32021 missing client capability, -32022 unsupported version, -32602 missing _meta fields","link":"#mcp-architecture"},{"label":"Empty body or no JSON-RPC error: probably a server older than 2026-07-28, so fall back to initialize","link":"#mcp-spec-history"}]},
{"label":"202 Accepted","children":[{"label":"The server took a notification. There is no body to read"}]},
{"label":"200 with text/event-stream","children":[{"label":"Read events until the final JSON-RPC response. Closing the stream cancels the request","link":"#streaming"}]}]}}
```

> [!try]
> Send an unauthenticated `curl -i -X POST <server-url>` to a remote MCP server that requires sign-in, and read its `WWW-Authenticate` header.

## Numbers to know

> [!number]
> Facts as of November 2026. JSON-RPC reserves -32768 to -32000; MCP's own codes sit in -32020 to -32099. A PKCE verifier has 43 to 128 characters ([RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)). [OpenAI strict schemas](https://developers.openai.com/api/docs/guides/structured-outputs) allow up to 5,000 object properties and 10 nesting levels. Rule of thumb from the [HTML standard](https://html.spec.whatwg.org/multipage/server-sent-events.html): send an SSE comment every 15 seconds or so for legacy proxies.

## Pitfalls and anti-patterns

> [!pitfall] Trusting a dialect you did not declare
> Without `$schema`, a draft-07 schema is read as 2020-12, and an `items` tuple becomes invalid. Declare `$schema` and test with the validator your hosts use.

- **Null or reused ids.** Legal in JSON-RPC, invalid in MCP.
- **Retrying a 403 with the same token.** Read the challenge and step up scopes.
- **Fetching remote `$ref`s.** A schema can make your host request internal URLs ([MCP security](#mcp-security)).
- **Signing uncanonicalized JSON.** Re-serializing breaks the signature; sign the JCS form.

## Talk like an expert

The vocabulary: **envelope**, **dialect**, **challenge**, **well-known URI**, **PKCE**, **sender-constrained token**, **canonicalization**. Experts debug layer by layer: envelope, contract, transport or authorization? Open design questions: JSON-RPC only, or extra bindings as in A2A; building on a draft OAuth 2.1; SSE or WebSockets.

> [!hottake] The next agent protocol should invent nothing below its method names.
> **The counterargument:** web standards were built for browsers and people. Agents need long tasks, delegation chains and per-action consent, which fit awkwardly: MCP already deprecates dynamic client registration in favor of client ID metadata documents.

## Check yourself

```quiz
protocol-building-blocks
```

## Go deeper

- [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification)
- [MCP 2026-07-28 base protocol](https://modelcontextprotocol.io/specification/2026-07-28/basic/index.md) and [authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization.md)
- [JSON Schema 2020-12 release notes](https://json-schema.org/draft/2020-12/release-notes)
- [The OAuth 2.1 Authorization Framework](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)

## Related

- [Why protocols](#why-protocols)
- [MCP architecture](#mcp-architecture)
- [MCP transports](#mcp-transports)
- [MCP authorization](#mcp-authorization)
- [Agent2Agent (A2A)](#a2a)
- [Agent identity and delegated authorization](#agent-identity-delegation)
