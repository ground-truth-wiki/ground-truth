---
id: mcp-authorization
book: 12
order: "12.6"
title: MCP authorization
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [mcp, oauth, pkce, auth]
visuals:
  - mcp-oauth:sequence
  - passthrough-compare:compare
---
> [!tldr]
> Remote MCP servers are OAuth 2.1 resource servers. A client discovers the authorization server from the MCP server’s protected-resource metadata, registers, runs the authorization-code flow with PKCE, and receives a token bound to that MCP server. Servers validate issuer and audience, and must never pass a client’s token through to other services.

## Why it matters
An MCP server with a user’s credentials can read their mail, change their tickets or move their money. Authorization decides who can use it, on whose behalf, and with what scope. Getting it wrong produces the classic confused-deputy breach, where your server uses its own authority on behalf of someone who should not have it. The specification has tightened this area in nearly every version, so old tutorials are especially risky here.

## Intuition
Think of a hotel. The front desk (authorization server) checks your identity and gives you a key card coded for one room (the audience) and a few floors (the scopes). The room’s lock (the MCP server) checks the card was issued by this hotel’s desk and is coded for this door. A guest who photocopies their card and hands it to a contractor for another building is doing token passthrough.

```viz
{"id":"mcp-oauth","component":"sequence","title":"Eight steps take a client from a 401 to a token that works only for this server","caption":"Step through and tap each message. The discovery steps let any client find the right authorization server; PKCE and the resource parameter make the token useless to anyone else. Simplified.","alt":"Sequence diagram of the MCP authorization flow: 401 with resource metadata, metadata discovery, client registration, authorization with PKCE, user consent, token exchange and an authorized call.","data":"illustrative","depicts":"MCP authorization, 2025-06-18 and later, simplified","try":"Find the message where the client says which server the token is for, and the one where the server checks it.","actors":[{"id":"client","label":"MCP client","role":"agent"},{"id":"user","label":"User","role":"human"},{"id":"as","label":"Authorization server","role":"external"},{"id":"rs","label":"MCP server","role":"tool"}],
"messages":[
{"from":"client","to":"rs","label":"request, no token","payload":"POST https://tickets.example.com/mcp\n(no Authorization header)"},
{"from":"rs","to":"client","label":"401 + metadata URL","kind":"response","payload":"401 Unauthorized\nWWW-Authenticate: Bearer resource_metadata=\"https://tickets.example.com/.well-known/oauth-protected-resource\"","note":"The server points to its protected-resource metadata (RFC 9728)."},
{"from":"client","to":"rs","label":"GET resource metadata","payload":"GET /.well-known/oauth-protected-resource","note":"The response names the authorization servers this resource trusts."},
{"from":"client","to":"as","label":"discover and register","payload":"GET /.well-known/oauth-authorization-server\nthen register: pre-registered id, a client ID metadata document (2025-11-25), or dynamic registration","note":"Authorization-server metadata (RFC 8414 or OpenID Connect discovery) gives the endpoints. Check the current spec for the preferred registration method."},
{"from":"client","to":"user","label":"open authorize URL","payload":"https://auth.example.com/authorize?response_type=code&client_id=…&redirect_uri=…&code_challenge=…&code_challenge_method=S256&scope=tickets.read&resource=https://tickets.example.com/mcp","note":"PKCE’s code_challenge protects the code exchange; the resource parameter (RFC 8707) names the MCP server the token is for."},
{"from":"user","to":"as","label":"sign in and consent","note":"The user sees which app wants which scopes, and approves."},
{"from":"as","to":"client","label":"code → token","kind":"response","payload":"POST /token  grant_type=authorization_code, code, code_verifier, resource=https://tickets.example.com/mcp\n→ access_token (audience: tickets.example.com/mcp), refresh_token","note":"The code_verifier proves this client started the flow. The token’s audience is bound to the MCP server."},
{"from":"client","to":"rs","label":"request with token","payload":"POST /mcp\nAuthorization: Bearer eyJ…","note":"The server validates issuer, audience, expiry and scopes on every request. Since 2026-07-28 it also validates the issuer against its configured authorization server, and credentials are bound to the server that issued them (verified Nov 2026)."}]}
```

## How it works
**Roles.** The MCP server is an OAuth 2.1 **resource server**; a separate **authorization server** (your identity provider) issues tokens; the MCP client is the OAuth **client**, acting for the user.

**Discovery.** An unauthenticated request gets a 401 whose `WWW-Authenticate` header points to the server’s **protected-resource metadata** (RFC 9728). That document lists the trusted authorization servers, whose own metadata gives the authorize and token endpoints. Clients need no hard-coded configuration.

**Client registration.** A client needs a client identity at the authorization server. Options have included pre-registration, **dynamic client registration** (RFC 7591), and, since 2025-11-25, **client ID metadata documents**, where the client id is a URL to a document describing the client. Check the current specification for the recommended order.

**The flow.** Authorization code with **PKCE**: the client generates a secret verifier, sends its hash as the code challenge, and proves possession of the verifier when exchanging the code. The **resource indicator** (RFC 8707) names the MCP server, so the issued token is **audience-bound** to it.

**Validation on every request.** Check signature, issuer, audience, expiry and scopes. The 2026-07-28 spec adds issuer validation and binds credentials to the authorization server that issued them, closing mix-up attacks where a client is tricked into using a token from the wrong issuer (verified Nov 2026).

**No token passthrough.** If your MCP server calls a downstream API, it must not forward the token it received. That token was issued for your server; forwarding it breaks audience checks, hides who is acting, and lets anyone holding it reach the downstream API. Obtain a separate token for each downstream service.

**Confused deputies.** Proxy servers that use one static client id for many users can be tricked into authorizing an attacker’s request with a user’s earlier consent. Require per-client consent and validate redirect URIs exactly.

## In practice
```viz
{"id":"passthrough-compare","component":"compare","title":"Forwarding the token you received breaks every check downstream; get a token of your own","caption":"Hover the marks. Token passthrough is explicitly forbidden in the MCP authorization specification.","alt":"Comparison of an MCP server forwarding a client’s token to a downstream API and one that obtains its own downstream token.","data":"illustrative","a":{"title":"Token passthrough (forbidden)","text":"client  -> MCP server   Bearer T1\n           (aud: tickets-mcp)\nMCP server -> CRM API   Bearer T1\n           (same token, forwarded)\nCRM API: audience is not me,\n  but it accepts it anyway\nlogs: CRM sees the user, not the server"},"b":{"title":"A token per audience","text":"client  -> MCP server   Bearer T1\n           (aud: tickets-mcp)\nMCP server validates T1, then\n  obtains T2 for the CRM\n  (its own client credentials or a\n   token exchange, scoped narrowly)\nMCP server -> CRM API   Bearer T2\n           (aud: crm-api)\nlogs: CRM sees the server, acting for the user"},"links":[{"a":"(same token, forwarded)","b":"obtains T2 for the CRM","note":"Each hop gets a token minted for it."},{"a":"audience is not me,\n  but it accepts it anyway","b":"(aud: crm-api)","note":"Audience checks only protect you if tokens are never reused across services."},{"a":"logs: CRM sees the user, not the server","b":"logs: CRM sees the server, acting for the user","note":"Correct attribution makes audits and incident response possible."}]}
```

Server checklist:
- Publish protected-resource metadata and return 401 with its URL.
- Validate signature, issuer, audience, expiry and scopes on every request.
- Request narrow scopes; ask for more only when needed.
- Never forward incoming tokens; mint or exchange per downstream service.
- Store tokens encrypted, rotate refresh tokens, and revoke on logout.

Client checklist:
- Use PKCE with S256 and the resource parameter on every flow.
- Validate the issuer you received tokens from against the server’s metadata.
- Keep tokens out of model context and logs; the model never needs to see them. See [secure agent design](#secure-agent-design).

## Numbers to know
> [!number]
> Facts: OAuth-based authorization arrived in MCP 2025-03-26; servers were classified as OAuth resource servers with protected-resource metadata and resource indicators in 2025-06-18; client ID metadata documents arrived in 2025-11-25; issuer validation and bound credentials in 2026-07-28 (verified Nov 2026). Rule of thumb: access tokens should be short-lived, with minutes to hours of lifetime.

## Pitfalls and anti-patterns
> [!pitfall] Putting tokens where the model can see them
> Tokens in tool arguments, prompts or logs can leak through prompt injection or transcripts. Keep credentials in the harness, never in context.

- **Skipping audience checks.** Any valid token from your identity provider would work, including ones minted for other services.
- **Wide scopes by default.** One injected instruction then reaches everything.
- **Static client ids in proxies.** The classic confused-deputy setup.
- **Following old tutorials.** Authorization changed in almost every spec version.

## Talk like an expert
The vocabulary: **resource server**, **authorization server**, **protected-resource metadata** (RFC 9728), **dynamic client registration** (RFC 7591), **client ID metadata document**, **PKCE**, **resource indicator** (RFC 8707), **audience**, **token passthrough**, **confused deputy**. Experts ask “who was this token issued for, and by whom?” at every hop. The live debate is how agents get their own identities and delegated authority, rather than borrowing a user’s, as agent-to-agent and background work grows.

> [!hottake] Most MCP security incidents will be authorization mistakes, not clever prompt attacks.
> **The counterargument:** authorization limits what an attacker can reach, but prompt injection is what makes the agent reach for it; the two failures compound, and teams need both defenses.

## Check yourself
```quiz
mcp-authorization
```

## Go deeper
- The authorization section and security best practices of the MCP specification at modelcontextprotocol.io.
- OAuth 2.1 draft, RFC 7636 (PKCE), RFC 8707 (resource indicators), RFC 9728 (protected-resource metadata), RFC 8414 (authorization-server metadata) and RFC 7591 (dynamic client registration).

## Related
- [MCP transports](#mcp-transports)
- [MCP security](#mcp-security)
- [Secure agent design](#secure-agent-design)
- [Enterprise readiness](#enterprise-readiness)
- [Prompt injection](#prompt-injection)
