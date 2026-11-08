---
id: agent-identity-delegation
book: 12
order: "12.13.3"
title: Agent identity and delegated authorization
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [agent-identity, oauth, delegation, workload-identity, authorization]
visuals: []
prerequisites: [mcp-authorization]
---
> [!tldr]
> Agent identity asks two questions: who is this software, and whose authority is it using right now? User-centric OAuth assumes a person with a browser at consent time, while agents run headless, act for users who are not present and hand work to sub-agents, so the field is assembling existing OAuth and workload-identity standards into agent profiles. Remember: an agent should carry its own identity plus a narrow, delegated, short-lived grant, never a pasted user credential.

## Key ideas

- **The consent screen assumes a human who is there.** The MCP roadmap states the problem plainly: “MCP authorization assumes a person with a browser at consent time”, while the caller is increasingly a cloud workload acting for an absent user or spawning sub-agents that need narrower authority, and existing servers “lean on pasted API keys and long-lived refresh tokens” ([MCP roadmap](https://modelcontextprotocol.io/development/roadmap.md), updated 22 August 2026). An OpenID Foundation whitepaper reaches the same diagnosis: OAuth 2.1 works well within one trust domain with synchronous agents, but may fall short when agents are cross-domain, highly autonomous or asynchronous, or act for several people at once (OpenID Foundation, [“Identity Management for Agentic AI”](https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf) (2025)).
- **Delegation keeps two identities in one token; impersonation erases one.** Token exchange separates the two: under impersonation the actor is treated as the subject, while under delegation “principal A still has its own identity separate from B”; the `act` claim names the current actor, nested `act` claims record prior actors as a chain, and `may_act` says who may act for whom ([RFC 8693](https://www.rfc-editor.org/rfc/rfc8693.html), January 2020). The OpenID Foundation paper argues that agents should stop impersonating users and use explicit on-behalf-of flows, where the token carries the user (for example in `sub`) and the agent (in `act` or `azp`), and that sub-agents need scope attenuation: an online down-scoped token exchange in centrally managed systems, or offline-attenuable tokens such as Biscuits and Macaroons, while revocation across such chains remains, in its words, “largely unsolved” ([OpenID Foundation, 2025](https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf)).
- **The agent's own identity comes from client and workload credentials.** For work with no user, MCP's OAuth Client Credentials extension lets a client authenticate with a client secret or, recommended, a signed JWT assertion ([RFC 7523](https://www.rfc-editor.org/rfc/rfc7523.html)), and warns that client secrets are long-lived credentials ([MCP OAuth Client Credentials](https://modelcontextprotocol.io/extensions/auth/oauth-client-credentials.md)). Inside infrastructure, SPIFFE issues “short lived cryptographic identity documents” (SVIDs) through a Workload API ([SPIFFE overview](https://spiffe.io/docs/latest/spiffe-about/overview/)), encoded as an X.509 certificate or a JWT ([SPIFFE concepts](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/)), and the IETF WIMSE working group is chartered for workload identity tokens, their local issuance and their exchange at security boundaries, building on OAuth, JWT and SPIFFE ([WIMSE charter](https://datatracker.ietf.org/wg/wimse/about/)). On the open web, where no OAuth relationship exists, agents can sign their HTTP requests instead; see [the web for agents](#agent-facing-web).
- **In companies, the identity provider can broker delegation.** The Identity Assertion JWT Authorization Grant (ID-JAG) lets an application use an identity assertion from a single sign-on provider to get an access token for a third-party API, built on token exchange and JWT grants and “informally referred to as Cross-App Access” ([draft-ietf-oauth-identity-assertion-authz-grant-06](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/), an OAuth working-group draft as of November 2026). MCP's Enterprise-Managed Authorization extension uses it: the client trades the user's ID token for an ID-JAG at the enterprise identity provider, which applies policy first, then trades the ID-JAG for an MCP access token, so access is granted and revoked in one place ([Enterprise-Managed Authorization](https://modelcontextprotocol.io/extensions/auth/enterprise-managed-authorization.md)).
- **Make grants narrow, bound to a key and approvable later.** DPoP binds tokens to a client key, proven with a signed JWT on each request, so a stolen token alone is not enough ([RFC 9449](https://www.rfc-editor.org/rfc/rfc9449.html)); mutual TLS does the same with a client certificate ([RFC 8705](https://www.rfc-editor.org/rfc/rfc8705.html)). Rich Authorization Requests carry fine-grained grants in `authorization_details`, for requests that scopes cannot express, such as a transfer of a set amount to one named payee ([RFC 9396](https://www.rfc-editor.org/rfc/rfc9396.html)), and OpenID CIBA lets a client start an approval that the user confirms on a separate device, with a short `binding_message` shown on both ([CIBA Core 1.0](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html)), which suits agents that run while the user is away.
- **The standards work is converging but unfinished, as of November 2026.** NIST's NCCoE concept paper (draft, February 2026) scopes identification, authentication, authorization, auditing and non-repudiation of agents, and names MCP, OAuth 2.0 and 2.1, OpenID Connect, SPIFFE/SPIRE, SCIM and NGAC as candidate standards (Booth et al., [“Accelerating the Adoption of Software and AI Agent Identity and Authorization”](https://www.nccoe.nist.gov/sites/default/files/2026-02/accelerating-the-adoption-of-software-and-ai-agent-identity-and-authorization-concept-paper.pdf) (2026)). At the IETF, the individual draft “AI Agent Authentication and Authorization” was replaced by the WIMSE working-group draft “AI Identity Management System”, [draft-ietf-wimse-aims-01](https://datatracker.ietf.org/doc/draft-ietf-wimse-aims/) (2 November 2026), which proposes best practices built on existing standards rather than new protocols; the MCP roadmap lists DPoP, workload identity federation, ID-JAG and RFC 8693 token exchange under an Agent Identity working group that is still forming ([MCP roadmap](https://modelcontextprotocol.io/development/roadmap.md)).

## Planned visuals

- `sequence`: an on-behalf-of chain: the user signs in, the agent exchanges the user's token plus its own actor token for a down-scoped token bound to one tool server, a sub-agent exchanges again for a narrower one, and the resource server reads `sub` and the nested `act` claims; each token payload shown.
- `tree`: choosing a grant: is a user involved, present, and managed by an enterprise identity provider? Leaves for client credentials with a JWT assertion, authorization code with PKCE, ID-JAG, CIBA and token exchange, each linked to its section.
- `compare`: an impersonation token next to a delegation token, with linked highlights on what an auditor can and cannot reconstruct from each.

## Talk like an expert

Experts separate **workload identity** (what the software is) from **delegated authority** (what a user let it do), and prefer **delegation** to **impersonation**. They speak of **on-behalf-of flows**, the **actor claim**, **down-scoping** and **attenuation**, **sender-constrained tokens**, **ID-JAG** or **cross-app access**, and **decoupled approval**, and at every hop they ask four things: who is the subject, who is the actor, who is the audience, and how small is this grant?

## Go deeper

- Jones et al., [RFC 8693: OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693.html) (2020), the base of most delegation designs.
- South (lead editor), [“Identity Management for Agentic AI”](https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf), OpenID Foundation whitepaper (2025), a survey of the gaps.
- Booth et al., [“Accelerating the Adoption of Software and AI Agent Identity and Authorization”](https://www.nccoe.nist.gov/sites/default/files/2026-02/accelerating-the-adoption-of-software-and-ai-agent-identity-and-authorization-concept-paper.pdf), NIST NCCoE concept paper (2026).
- Parecki et al., [Identity Assertion JWT Authorization Grant](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/), IETF OAuth working-group draft.

## Related

- [The rest of the alphabet soup](#protocol-soup)
- [MCP authorization](#mcp-authorization)
- [Protocol building blocks: JSON-RPC, JSON Schema, HTTP streams and OAuth](#protocol-building-blocks)
- [Secure agent design](#secure-agent-design)
- [The web for agents: llms.txt, NLWeb, signed agents and content preferences](#agent-facing-web)
- [Agentic commerce and payment protocols](#agentic-commerce-protocols)
