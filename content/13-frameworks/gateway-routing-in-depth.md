---
id: gateway-routing-in-depth
book: 13
order: "13.5.1"
title: Gateway keys, routing and failover in depth
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [model-gateways, routing, fallbacks, rate-limits, spend-control]
visuals: []
prerequisites: [gateways-routers]
---
> [!tldr]
> Behind a model gateway's single endpoint sit three mechanisms: keys that carry each caller's model access, budgets and rate limits; routing that picks a provider or deployment for each request; and failover that retries, cools down and falls back when something fails. Each has sharp edges, such as budgets that overshoot, usage tracking that adds latency and fallbacks that change model behavior. Remember to read which provider and model actually served each request, and to test every fallback with evals before it is needed.

## Key ideas

- **Keys are policy objects, and budgets are soft caps.** Clients of LiteLLM's proxy authenticate with virtual keys generated from an admin master key, and each key can carry a model list (or defer to its team's), TPM, RPM and parallel-request limits, a budget with a reset period and model aliases, while spend is tracked per key and reported per user and team ([LiteLLM, “Virtual keys”](https://docs.litellm.ai/docs/proxy/virtual_keys)). Vercel AI Gateway stacks budgets at team, project, API key and member scope, checks them at the start of each request, so the request that crosses a limit still completes and spend can end slightly over, and then rejects requests with HTTP 402 until the budget resets (as of November 2026) ([Vercel, “AI Gateway budgets and spend limits”](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets)).
- **Bring your own key changes billing and fallback.** With BYOK on OpenRouter, your prioritized keys for a provider are tried before OpenRouter's shared endpoints, a key that hits a rate limit or error falls through to the next, and when every key fails the request falls back to shared capacity unless you set a key to never use it; usage is charged at 5% of the normal OpenRouter price, with a monthly free allowance that depends on the plan (as of November 2026). On Vercel AI Gateway, BYOK spend is metered separately and counts toward no budget, and a failed BYOK request can fall back to system credentials ([OpenRouter, “BYOK”](https://openrouter.ai/docs/guides/overview/auth/byok); [Vercel, “AI Gateway”](https://vercel.com/docs/ai-gateway)).
- **Provider routing is not model routing.** For one model served by several providers, OpenRouter by default splits traffic by weighing price, throughput, latency, rate limits, reliability and quality, including whether a provider's tool calls come back well formed, and sends no traffic to a provider whose errors or 429s are far worse than the others' until it recovers (as of November 2026); the request's `provider` object overrides this with `order`, `allow_fallbacks`, `only`, `ignore`, `sort` by price, throughput or latency, `max_price`, and filters for `data_collection`, `zdr` and `quantizations` ([OpenRouter, “Provider selection”](https://openrouter.ai/docs/guides/routing/provider-selection)). Choosing a different model per request is a separate decision, covered in [gateways and routers](#gateways-routers).
- **Load balancing, cooldowns and retries.** LiteLLM's router recommends its default `simple-shuffle` strategy for production and also offers least-busy, latency-based, usage-based and cost-based routing, but warns that usage-based routing adds significant latency because of Redis operations; a deployment that fails more than `allowed_fails` times in a minute is cooled down, per deployment rather than per model group, and rate-limit errors are retried with exponential backoff while generic errors are retried immediately (as of November 2026) ([LiteLLM, “Router”](https://docs.litellm.ai/docs/routing)).
- **Fallbacks need eval evidence, and the served provider must be visible.** LiteLLM moves through deployments in priority order and then to generic fallbacks, and keeps separate fallback paths for context-window and content-policy errors; each hop sends the request to a different deployment or model that may format output or call tools differently, so each needs its own eval run (see [reliability engineering](#reliability-engineering)) ([LiteLLM, “Router”](https://docs.litellm.ai/docs/routing)). Vercel AI Gateway accepts OpenAI Chat Completions, OpenAI Responses and Anthropic Messages requests, and records the provider, latency, tokens, cost and every routing attempt, with the serving provider readable from response metadata (as of November 2026) ([Vercel, “AI Gateway”](https://vercel.com/docs/ai-gateway)).
- **Gateways for tools and for self-hosted models.** The same control point now governs MCP traffic: LiteLLM's MCP gateway gives clients one fixed endpoint for MCP tools and controls access by key, team and organization (as of November 2026) ([LiteLLM, “MCP overview”](https://docs.litellm.ai/docs/mcp)). For models you host, the Gateway API Inference Extension, an official Kubernetes project, turns gateways such as Envoy Gateway, kgateway and GKE Gateway into inference gateways that route to an `InferencePool` through an endpoint picker using signals such as prefix-cache status and LoRA adapter availability; replica-level routing and autoscaling are covered in [routing and autoscaling model servers](#inference-fleet-scaling) ([Gateway API Inference Extension](https://gateway-api-inference-extension.sigs.k8s.io/)).

## Planned visuals

- **`sequence`:** one request through a gateway: key check and budget check, provider choice, a 429 that triggers backoff, a second failure that cools the deployment down, an ordered fallback, and the response with the served provider and routing attempts in its metadata.
- **`explorer`:** budget overshoot as a function of request cost and concurrency, showing how many in-flight requests a soft cap lets through after the limit is crossed.
- **`tree`:** choosing a failover rule by error type: rate limit, provider outage, context window exceeded or content policy refusal, each leading to retry, cooldown or a specific fallback.

## Talk like an expert

Gateway owners talk about **virtual keys**, **model allowlists** and **aliases**, **TPM and RPM limits**, **soft-cap budgets**, **BYOK**, **provider routing**, **cooldowns** and **fallback chains**, and they keep provider routing (which host serves this model) separate from model routing (which model answers). Their standing questions are “which provider served this request?” and “when did we last run the evals for this fallback?”.

## Go deeper

- [LiteLLM, “Router”](https://docs.litellm.ai/docs/routing): routing strategies, cooldowns, retry policies and fallback types.
- [LiteLLM, “Virtual keys”](https://docs.litellm.ai/docs/proxy/virtual_keys): key ownership, limits, budgets, model access, aliases and spend tracking.
- [OpenRouter, “Provider selection”](https://openrouter.ai/docs/guides/routing/provider-selection): default provider routing and every override in the `provider` object.
- [Gateway API Inference Extension](https://gateway-api-inference-extension.sigs.k8s.io/): inference gateways, `InferencePool` and the endpoint picker for self-hosted models.

## Related

- [Gateways and routers](#gateways-routers)
- [Cost engineering](#cost-engineering)
- [Reliability engineering](#reliability-engineering)
- [Rate limits, quotas and overload control](#rate-limits-overload)
- [Model APIs in practice](#model-apis)
- [Routing and autoscaling model servers](#inference-fleet-scaling)
