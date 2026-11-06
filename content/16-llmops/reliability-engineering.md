---
id: reliability-engineering
book: 16
order: "16.2"
title: Reliability engineering
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [retries, failover, circuit-breaker]
visuals:
  - backoff-timeline:chart
  - breaker-states:state
  - error-tree:tree
---
> [!tldr]
> Model APIs fail in ordinary and unusual ways: rate limits, overloads, timeouts, malformed outputs and silent quality drops. Classify errors, retry the retryable ones with exponential backoff and jitter, make side effects idempotent, fall back to other models or providers, break circuits on persistent failure, and degrade gracefully.

## Why it matters
Every provider has outages and capacity limits, and agent workflows multiply exposure: a task of 30 model calls fails if any one fails without a retry. Reliability work is unglamorous and decides whether users experience an occasional slow response or a broken product.

## Intuition
Calling a busy restaurant: if the line is engaged, wait a little and try again, wait longer each time, and do not all redial at the same second. If it stays engaged, call the place next door, or tell your guests dinner will be simple tonight.

```viz
{"id":"backoff-timeline","component":"chart","type":"line","title":"Jitter spreads retries so a thousand clients do not hit a recovering service in the same second","caption":"Delay before each retry with exponential backoff (base 0.5 s, cap 8 s), without jitter and for one client with full jitter, where each delay is random between zero and the exponential value. Illustrative sample.","alt":"Line chart of retry delays over six attempts for exponential backoff without jitter and with full jitter.","data":"illustrative","x":{"label":"Retry attempt"},"y":{"label":"Delay before retry","unit":"s","min":0,"max":9},"series":[{"name":"Exponential, no jitter","points":[[1,0.5],[2,1],[3,2],[4,4],[5,8],[6,8]]},{"name":"Full jitter (one client)","points":[[1,0.31],[2,0.74],[3,1.6],[4,2.2],[5,5.9],[6,3.1]]}]}
```

## How it works
**Classify errors.** Rate limits and overloads (HTTP 429, and provider overload codes such as Anthropic’s 529) and transient server errors (500, 502, 503) are retryable. Invalid requests (400), authentication errors (401, 403), context-length errors and content refusals are not: retrying the same request fails the same way.

```viz
{"id":"error-tree","component":"tree","title":"The error type decides the response: wait, retry, fall back, fix or stop","caption":"Expand an error class. Respect a Retry-After header when the provider sends one.","alt":"Decision tree mapping model API error classes to retry, fallback, fix or stop responses.","data":"illustrative","open":1,"root":{"label":"What failed?","children":[
{"label":"Rate limit or overload (429, overloaded)","children":[{"label":"Back off with jitter, honor Retry-After; after N tries, fall back to another model or region"}]},
{"label":"Server error or timeout (5xx)","children":[{"label":"Retry with backoff and an idempotency key; then fall back"}]},
{"label":"Invalid request (400) or context too long","children":[{"label":"Do not retry unchanged: fix the request, trim context or split the task","link":"#context-engineering"}]},
{"label":"Authentication or permission (401, 403)","children":[{"label":"Stop and alert: credentials or configuration are wrong"}]},
{"label":"Malformed output","children":[{"label":"Validate, then retry once with the error fed back; prefer schema-constrained output","link":"#structured-outputs"}]},
{"label":"Refusal or safety block","children":[{"label":"Do not retry blindly; handle in the product and review if unexpected","link":"#safety-evals"}]}]}}
```

**Backoff with jitter.** Wait, then wait longer each time (exponential backoff), with a random component (jitter) so that many clients do not retry in lockstep and overwhelm a recovering service. Cap the delay and the number of attempts.

**Timeouts.** Set connection, time-to-first-token and total timeouts separately. Streaming responses can stall halfway; detect stalls by time since the last chunk.

**Idempotency.** Any step with side effects must be safe to retry: use idempotency keys for tool calls and job submissions. See [long-running agents](#long-running-agents).

**Fallbacks.** Route to another model, provider or region on persistent failure, ideally through the [model gateway](#gateways-routers). Test fallback quality with evals; a fallback that silently degrades answers is a hidden outage.

**Circuit breakers.** After repeated failures, stop calling a dependency for a while and fail fast or fall back, then probe cautiously before resuming:

```mermaid id=breaker-states title="A circuit breaker stops hammering a failing dependency and probes before trusting it again" caption="Closed passes calls through; open fails fast or uses a fallback; half-open lets a few test calls through." alt="State diagram of a circuit breaker: closed, open and half-open states with transitions on failures, timeouts and test results."
stateDiagram-v2
  [*] --> Closed
  Closed --> Open: failure rate over threshold
  Open --> HalfOpen: cool-down elapsed
  HalfOpen --> Closed: test calls succeed
  HalfOpen --> Open: test call fails
```

**Graceful degradation.** Decide in advance what the product does when the model is unavailable: a smaller model, cached answers, a simpler non-AI path, or a clear message.

**Quality incidents.** Reliability also covers silent failures: a provider model update, a prompt change or a retrieval bug that degrades answers without errors. Online evals and canaries catch them. See [online evaluation](#online-evaluation).

## In practice
```python
# Pseudocode: retry policy for model calls.
RETRYABLE = {429, 500, 502, 503, 529}
def call_with_retries(request, max_attempts=5, base=0.5, cap=8.0):
    for attempt in range(1, max_attempts + 1):
        try:
            return gateway.call(request, idempotency_key=request.id, timeout=60)
        except ApiError as e:
            if e.status not in RETRYABLE or attempt == max_attempts:
                raise
            delay = e.retry_after or random.uniform(0, min(cap, base * 2 ** (attempt - 1)))
            sleep(delay)                                  # full jitter
```

Reliability checklist:
- Error classification with retry only for retryable errors.
- Exponential backoff with jitter, capped, honoring Retry-After.
- Separate timeouts, including stall detection for streams.
- Idempotency keys on side-effecting steps.
- Fallback models tested with evals; circuit breakers on each provider.
- A degraded mode the product team has designed and tested.

## Numbers to know
> [!number]
> Rules of thumb. Per-call success compounds: at 99.5% per call, a 30-call agent task succeeds without retries only about 86% of the time. A few retries with backoff turn most transient failures into short delays.

## Pitfalls and anti-patterns
> [!pitfall] Retrying everything immediately
> Instant retries on overload deepen the outage for everyone, including you.

- **Retrying 400s.** The same bad request fails the same way.
- **Retries without idempotency.** Duplicate emails, charges and tickets.
- **Untested fallbacks.** The backup model may break your prompts or output format.

## Talk like an expert
The vocabulary: **retryable error**, **exponential backoff**, **jitter**, **Retry-After**, **idempotency key**, **fallback**, **circuit breaker**, **graceful degradation**, **thundering herd**. Experts compute end-to-end success for multi-call workflows and design retries and fallbacks per step. The live debate is how much reliability logic belongs in the gateway versus the application.

> [!hottake] Multi-provider fallback is cheaper insurance than most teams think.
> **The counterargument:** different models behave differently with the same prompts and tools, so a fallback can silently change quality and behavior; keeping it tested costs real ongoing effort.

## Check yourself
```quiz
reliability-engineering
```

## Go deeper
- The AWS Architecture Blog post “Exponential Backoff and Jitter” (Marc Brooker, 2015).
- Nygard, *Release It!* (2nd edition, 2018), on circuit breakers and stability patterns.
- Your providers’ documentation on error codes and rate limits.

## Related
- [Gateways and routers](#gateways-routers)
- [Long-running and durable agents](#long-running-agents)
- [Online evaluation](#online-evaluation)
- [Incidents and on-call](#incidents-on-call)
- [Streaming](#streaming)
