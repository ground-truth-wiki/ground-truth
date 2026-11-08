---
id: agentic-commerce-protocols
book: 12
order: "12.13.5"
title: Agentic commerce and payment protocols
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [agentic-commerce, payments, ap2, x402, delegated-authority]
visuals: []
prerequisites: [protocol-soup, a2a]
---
> [!tldr]
> An agent's purchase has layers: finding products, building a cart and checking out, handing over a payment credential, proving the user approved, proving which agent is asking, settling the money and handling the order afterwards. As of November 2026, young and overlapping protocols each cover some of these layers: ACP and UCP for checkout, AP2 for proof of user authorization, x402 for payments over HTTP, and card-network programs for agent tokens and agent identity. Remember: bind what the user approved to what the agent bought, with limits that still hold if the agent is fooled.

## Key ideas

- **ACP standardizes checkout between agents and merchants.** The Agentic Commerce Protocol is “an interaction model and open standard for connecting buyers, their AI agents, and businesses”, jointly governed by OpenAI and Stripe as founding maintainers, so that agents can let users buy from businesses “without being the merchant of record”. As of November 2026 it is in beta, versioned by date with 2026-04-17 as the latest release ([agentic-commerce-protocol](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol)); its [OpenAPI files](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/tree/main/spec/2026-04-17/openapi) cover agentic checkout and its webhooks, cart, delegated payment, delegated authentication and a product feed. Do not confuse it with the [Agent Client Protocol](#agent-client-protocol).
- **UCP covers the whole shopping journey across transports.** The Universal Commerce Protocol is co-developed by Google with partners including Shopify, Etsy, Wayfair, Target and Walmart, and defines capabilities for catalog, cart, checkout, identity linking through OAuth 2.0, and orders with tracking and returns; it runs over REST and JSON-RPC with MCP and A2A support, lets a platform either build its own checkout UI or embed the business's checkout, uses an “open, modular payment handler design”, and builds on AP2 for payment mandates. As of November 2026 shopping is specified, lodging is a draft and food is announced ([ucp.dev](https://ucp.dev/)).
- **AP2 proves what the user authorized.** The Agent Payments Protocol uses two signed mandates, a Checkout Mandate for the items and a Payment Mandate for the payment, each either open (the user's constraints, such as a budget) or closed (bound to one checkout or amount), as verifiable digital credentials chained into an audit trail; it is available as an extension for A2A and UCP ([AP2](https://ap2-protocol.org/)). With the human present, the user signs the closed mandates on a trusted surface; with the human not present, the user signs open mandates in advance that name the agent's public key, and the agent later signs closed mandates within those limits with its own key ([AP2 flows](https://ap2-protocol.org/ap2/flows/index.md)). Google donated AP2 to the FIDO Alliance on 28 April 2026, released v0.2 with “Human Not Present” payments, and Mastercard's Verifiable Intent, co-developed with Google, is moving to FIDO as well (Parikh, [“We're donating Agent Payments Protocol to the FIDO Alliance to support the future of secure, agentic payments”](https://blog.google/products-and-platforms/platforms/google-pay/agent-payments-protocol-fido-alliance/)).
- **x402 puts payment inside HTTP.** A resource server answers `402 Payment Required` with a `PAYMENT-REQUIRED` header, the client retries with a `PAYMENT-SIGNATURE` header, the server verifies and settles itself or through a facilitator's `/verify` and `/settle` endpoints, and it returns the resource with a `PAYMENT-RESPONSE` header; schemes include `exact` and `upto`, which authorizes a maximum and settles actual usage up to it ([x402](https://github.com/x402-foundation/x402)), and networks are named in CAIP-2 form such as `eip155:8453` ([x402 specification v2](https://raw.githubusercontent.com/x402-foundation/x402/main/specs/x402-specification-v2.md)). The Linux Foundation announced the x402 Foundation on 2 April 2026, with Coinbase contributing the protocol ([Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-is-launching-the-x402-foundation-and-welcoming-the-contribution-of-the-x402-protocol)).
- **Card networks add agent identity and agent tokens.** Visa's Trusted Agent Protocol (14 October 2025, with Cloudflare) sends agent intent, consumer recognition and optional payment data in requests signed with HTTP Message Signatures, aligned with [Web Bot Auth](#agent-facing-web) ([Visa](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21716.html)); Visa Intelligent Commerce gives agents tokenized credentials and uses payment passkeys for consumer consent to a purchase instruction ([Visa Developer](https://developer.visa.com/capabilities/visa-intelligent-commerce)); and Mastercard Agent Pay (29 April 2025) introduced Agentic Tokens and will “require trusted AI agents to be registered and verified” ([Mastercard](https://investor.mastercard.com/investor-news/investor-news-details/2025/Mastercard-Unveils-Agent-Pay-Pioneering-Agentic-Payments-Technology-to-Power-Commerce-in-the-Age-of-AI/default.aspx)).
- **Delegated payment tokens put limits in the credential itself.** With Stripe's shared payment tokens, the agent issues a token for one seller's profile with `usage_limits` for currency, `max_amount` and `expires_at`, can revoke it at any time, and must handle a `requires_action` state when the customer has to act, for example for 3-D Secure; Stripe can also use network tokens from Mastercard Agent Pay and Visa Intelligent Commerce, and the API is a preview as of November 2026 ([Stripe](https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens)). AP2 starts from the assumption that “preventing prompt injection attacks is infeasible”, so it bounds damage with signatures, hash binding and constraint checks, and links mandates by `checkout_hash` so they can be joined in a dispute ([AP2 security](https://ap2-protocol.org/ap2/security_and_privacy_considerations/index.md)); keep any of these young protocols behind one interface in your code, as [the alphabet soup](#protocol-soup) advises.

## Planned visuals

- `diagram`: the layers of an agent purchase (discovery, cart and checkout, payment credential, proof of user authorization, agent authentication, settlement, post-purchase) with ACP, UCP, AP2, x402, Trusted Agent Protocol and shared payment tokens placed on the layers they cover, each node linked to its section.
- `sequence`: an AP2 human-not-present purchase: the user signs open Checkout and Payment Mandates, the agent later finds a matching checkout, signs closed mandates with its key, the merchant checks the constraints and the payment processor verifies the user's signature; each mandate shown.
- `stepper`: an x402 exchange: request, `402` with `PAYMENT-REQUIRED`, retry with `PAYMENT-SIGNATURE`, facilitator `/verify` and `/settle`, and `200` with `PAYMENT-RESPONSE`, with a caption per step.

## Talk like an expert

Experts talk about the **merchant of record**, **delegated payment**, **shared payment tokens**, **open and closed mandates**, **human-present** and **human-not-present** flows, **verifiable intent**, **agentic tokens** and **facilitators**. For any proposal they ask which layer it covers, who carries the liability, and what cryptographically links the user's approval to the final charge.

## Go deeper

- [agentic-commerce-protocol](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol), the ACP specifications and RFCs.
- [Universal Commerce Protocol](https://ucp.dev/), its capabilities and transports.
- [AP2: Agent Payments Protocol](https://ap2-protocol.org/), with the [flows](https://ap2-protocol.org/ap2/flows/index.md) for both human-present and human-not-present purchases.
- [x402 specification v2](https://raw.githubusercontent.com/x402-foundation/x402/main/specs/x402-specification-v2.md).

## Related

- [The rest of the alphabet soup](#protocol-soup)
- [Agent identity and delegated authorization](#agent-identity-delegation)
- [The web for agents: llms.txt, NLWeb, signed agents and content preferences](#agent-facing-web)
- [A2A 1.0 in depth: bindings, extensions and signed agent cards](#a2a-in-depth)
- [Personal and ambient assistants](#personal-assistants)
