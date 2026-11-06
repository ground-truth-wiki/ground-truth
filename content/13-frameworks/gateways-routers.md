---
id: gateways-routers
book: 13
order: "13.5"
title: Gateways and routers
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [gateway, litellm, openrouter, failover]
visuals:
  - gateway-failover:sequence
  - routing-tree:tree
---
> [!tldr]
> A model gateway gives every service one interface to many models and providers, with keys, quotas, retries, fallbacks, caching, logging and cost accounting in one place. Routers decide which model handles each request, by rules, cost, latency or a learned predictor of difficulty.

## Why it matters
Without a gateway, every service embeds provider keys, its own retry logic and its own idea of which model to call. Outages, price changes and new models then require changes everywhere. A gateway makes those decisions central, observable and reversible, and routing can cut cost substantially by sending easy requests to cheaper models.

## Intuition
A gateway is a switchboard operator. Callers ask for “a model”; the operator knows which lines are up, which are busy, which are cheapest, and connects each call accordingly.

```viz
{"id":"gateway-failover","component":"sequence","title":"When the primary provider is overloaded, the gateway retries, then fails over, and the caller never notices","caption":"An illustrative request through a model gateway. Tap each message for details.","alt":"Sequence diagram of a service calling a model gateway, which retries an overloaded primary provider and then fails over to a secondary provider.","data":"illustrative","actors":[{"id":"svc","label":"Your service","role":"agent"},{"id":"gw","label":"Model gateway","role":"tool"},{"id":"p1","label":"Primary provider","role":"model"},{"id":"p2","label":"Fallback provider","role":"model"}],
"messages":[
{"from":"svc","to":"gw","label":"chat(model=\"default-large\")","note":"Services ask for a logical model name, not a provider."},
{"from":"gw","to":"p1","label":"request","note":"Routing rule: default-large maps to the primary provider first."},
{"from":"p1","to":"gw","label":"overloaded","kind":"response"},
{"from":"gw","to":"p1","label":"retry after jittered backoff"},
{"from":"p1","to":"gw","label":"overloaded","kind":"response","note":"Two failures trip the circuit breaker for this provider."},
{"from":"gw","to":"p2","label":"same request, fallback model","note":"The fallback was tested against the eval suite for this route."},
{"from":"p2","to":"gw","label":"response","kind":"response"},
{"from":"gw","to":"svc","label":"response + headers","kind":"response","payload":{"x-model-served":"fallback-large-2026-08","x-fallback":"true","x-cost-usd":0.0041},"note":"The caller learns which model served it; traces and cost records do too."}]}
```

## How it works
**Core features.** One API (often OpenAI-compatible) in front of many providers and self-hosted models; centralized keys; per-team and per-tenant quotas and budgets; retries with backoff; fallbacks; circuit breakers; response and prompt caching; logging, tracing and cost attribution. See [reliability engineering](#reliability-engineering) and [cost and capacity](#cost-capacity).

**Options.** Open-source gateways such as LiteLLM and Envoy AI Gateway; hosted ones such as Portkey, OpenRouter and Cloudflare AI Gateway; API-management products from cloud and API vendors. Many teams start with a library and move to a service as the number of consumers grows.

**Routing strategies.**

```viz
{"id":"routing-tree","component":"tree","title":"Five ways to decide which model answers a request","caption":"Expand a strategy. Most production routers combine rules with a fallback chain; learned routing is worth it at high volume.","alt":"Tree of model routing strategies: static rules, cost-aware, latency-aware, cascades and learned routers.","data":"illustrative","open":1,"root":{"label":"How does the gateway choose a model?","children":[
{"label":"Static rules","children":[{"label":"By feature, tenant or task type: simple, predictable, easy to audit"}]},
{"label":"Cost-aware","children":[{"label":"Cheapest model that meets the route’s quality bar, checked by evals","link":"#cost-engineering"}]},
{"label":"Latency-aware","children":[{"label":"Fastest healthy provider or region, using live latency measurements"}]},
{"label":"Cascades","children":[{"label":"Try a small model; escalate when a check fails or confidence is low"}]},
{"label":"Learned routers","children":[{"label":"A classifier predicts whether a cheap model will suffice, as in RouteLLM (2024)"}]}]}}
```

**Quality guardrails for routing.** Every route and fallback needs eval evidence, because different models behave differently with the same prompt and tools. Record which model served each request so quality changes can be traced. See [observability](#observability-tracing).

## In practice
- Give services logical model names (“default-large”, “fast-extract”) and map them in the gateway.
- Pin dated model versions behind each name; change mappings through the same eval gates as prompts. See [CI/CD for AI](#ci-cd-for-ai).
- Return the served model and cost in response headers.
- Run the gateway redundantly; it is now on every critical path.

## Numbers to know
> [!number]
> Rules of thumb. A well-run gateway adds only milliseconds of overhead. Cascades and learned routing often cut cost substantially on mixed traffic when many requests are easy; measure the quality delta per route.

## Pitfalls and anti-patterns
> [!pitfall] Untested fallbacks
> A fallback model that breaks your output format turns a provider outage into a correctness incident.

- **Gateway as a single point of failure.** Deploy it like critical infrastructure.
- **Routing on cost alone.** Quality per route must stay above its bar.
- **Hiding the served model.** Debugging and audits need it.

## Talk like an expert
The vocabulary: **model gateway**, **logical model name**, **fallback chain**, **circuit breaker**, **cascade**, **learned router**, **cost attribution**, **semantic cache**. Experts treat routing tables like code, with reviews and evals. The live debate is where routing intelligence should live: in gateways, in providers’ own auto-routing, or in the application.

> [!hottake] Every team using more than one model needs a gateway, and most single-model teams will soon use more than one.
> **The counterargument:** a gateway is one more critical service to run and secure; small teams on one provider can get retries and logging from the provider SDK and add a gateway later.

## Check yourself
```quiz
gateways-routers
```

## Go deeper
- Ong et al., “RouteLLM: Learning to Route LLMs with Preference Data” (2024).
- Documentation for LiteLLM, Envoy AI Gateway, Portkey and OpenRouter.

## Related
- [Reference architecture](#reference-architecture)
- [Reliability engineering](#reliability-engineering)
- [Cost engineering](#cost-engineering)
- [MCP at scale](#mcp-at-scale)
- [Model APIs in practice](#model-apis)
