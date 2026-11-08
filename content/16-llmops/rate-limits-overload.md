---
id: rate-limits-overload
book: 16
order: "16.2.1"
title: Rate limits, quotas and overload control
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [rate-limits, quotas, load-shedding, throttling, reliability]
visuals:
  - rate-limits-overload-bucket:stepper
  - rate-limits-overload-headroom:calculator
  - rate-limits-overload-429s:sequence
  - rate-limits-overload-amplification:calculator
prerequisites: [reliability-engineering, model-apis]
---
> [!tldr]
> Providers meter requests and tokens per minute, on top of daily, batch-queue and spend limits, and a burst can trip a per-minute limit long before the minute is used. Shape traffic below them, give each tenant a quota, shed the least important work first and retry at exactly one layer. Retrying never fixes a 429 for a spend cap or quota.

## Why it matters
Your response to a 429 decides whether a spike costs seconds or becomes an outage. Retry the wrong 429 and you burn your [error budget](#slos-error-budgets) on requests that cannot succeed. Retry at every layer and one click becomes dozens of calls against a provider already saying no.

## Intuition
Picture each limit as a bucket of tickets refilling at a steady rate. A request spends one request ticket, plus its uncached input and its output tokens from their own buckets. The per-minute number is the refill rate, not what one second may spend: 60 requests per minute might be enforced as 1 per second, so short bursts trip it ([Claude rate limits](https://platform.claude.com/docs/en/api/rate-limits), as of November 2026).

```viz
{"id":"rate-limits-overload-bucket","component":"stepper","title":"A per-minute limit is a refill rate: one burst empties the bucket long before the minute is used","caption":"Illustrative. The bucket size and refill rate are invented to show the shape; the providers' docs do not give bucket sizes. The continuous refill follows the token-bucket behavior in Anthropic's rate-limit docs as of November 2026.","alt":"Stepper of an input-token bucket that holds 10,000 tokens and refills at 1,000 per second: a burst of five 2,000-token requests empties it, a sixth request gets a 429 with retry-after 2, the retry succeeds after waiting, and a paced client never empties it.","data":"illustrative","try":"Step to the 429 and compare the bucket with the minute's total so far.","frames":[
{"label":"Full bucket","caption":"An illustrative limit of 60,000 input tokens per minute, enforced as a bucket that refills at 1,000 tokens per second and holds at most 10,000.","stack":{"cap":10000,"unit":"tokens","label":"Input-token bucket","items":[{"label":"Available","tokens":10000,"role":"token"}]}},
{"label":"Burst at 0 s","caption":"A batch job fires five 2,000-token requests at once. All five fit, and the bucket is empty.","stack":{"cap":10000,"unit":"tokens","label":"Input-token bucket","items":[{"label":"Available","tokens":0,"role":"token"}]}},
{"label":"429 at 0.5 s","caption":"A sixth request needs 2,000 tokens, but only 500 have flowed back. It is rejected, although this minute has used 10,000 of its 60,000 tokens.","stack":{"cap":10000,"unit":"tokens","label":"Input-token bucket","items":[{"label":"Available","tokens":500,"role":"token"}]},"code":"HTTP/1.1 429 Too Many Requests\nretry-after: 2"},
{"label":"Retry at 2.5 s","caption":"After waiting as told, 2,500 tokens are back. The retry takes 2,000 and succeeds.","stack":{"cap":10000,"unit":"tokens","label":"Input-token bucket","items":[{"label":"Available","tokens":2500,"role":"token"}]}},
{"label":"Paced","caption":"The same job, paced at one 2,000-token request every 2 seconds, spends tokens exactly as fast as they flow back: 60,000 tokens a minute, no 429s, and a bucket that stays between 8,000 and 10,000.","stack":{"cap":10000,"unit":"tokens","label":"Input-token bucket","items":[{"label":"Available","tokens":8000,"role":"token"}]}}]}
```

Overload control keeps the provider's bucket from being the one that says no: meter yourself, share fairly, decide in advance what to drop. It extends [reliability engineering](#reliability-engineering).

## How it works
**What is metered.** Limits apply per organization (often per project or workspace too), per model class and per dimension; the first to run out stops you. As of November 2026, Anthropic meters requests, input and output tokens per minute (RPM, ITPM, OTPM); OpenAI meters requests and tokens per minute and per day ([OpenAI rate limits](https://developers.openai.com/api/docs/guides/rate-limits)). Batch APIs add queue limits, and a spend cap tops it all. Limits rise with usage tiers: as of November 2026, Anthropic's Start tier caps spend at $500 a month and gives Claude Sonnet 5.5 4,000 RPM, 2,000,000 ITPM and 400,000 OTPM.

**Cache-aware input limits.** [Anthropic's ITPM](https://platform.claude.com/docs/en/api/rate-limits) ignores cache reads: at 2,000,000 ITPM and an 80% cache hit rate you can process 10,000,000 input tokens per minute. Many other limits count every token, so check before you size. `max_tokens` matters too: OpenAI counts a request as the larger of `max_tokens` and an estimate from its character count, while Anthropic's OTPM counts only generated tokens. [Prompt caching](#prompt-caching) buys throughput.

```viz
{"id":"rate-limits-overload-headroom","component":"calculator","title":"The tightest limit sets your request rate, and caching can lift the input limit several times","caption":"Illustrative limits; enter your own from your provider's limits page. Cache reads are left out of the input limit, as in Anthropic's cache-aware ITPM as of November 2026. For a limit that counts every token, set the cached share to 0.","alt":"Calculator: sustainable requests per minute as the smallest of the request limit, the input-token limit divided by uncached input per request, and the output-token limit divided by output per request, times a headroom factor.","data":"formula","try":"Set the cached share to 0 and watch the input limit become the bottleneck.","inputs":{"rpm_limit":1000,"itpm_limit":400000,"otpm_limit":80000,"input_tokens":20000,"cached_share":0.75,"output_tokens":800,"headroom":0.8},"input_meta":{"rpm_limit":{"label":"Request limit","unit":"requests per minute","min":1},"itpm_limit":{"label":"Input-token limit","unit":"tokens per minute","min":1},"otpm_limit":{"label":"Output-token limit","unit":"tokens per minute","min":1},"input_tokens":{"label":"Input tokens per request","min":1},"cached_share":{"label":"Share of input read from cache","unit":"0 to 1","min":0,"max":0.99,"step":0.05},"output_tokens":{"label":"Output tokens per request","min":1},"headroom":{"label":"Target utilization","unit":"0 to 1","min":0.1,"max":1,"step":0.05}},"outputs":[{"id":"uncached","label":"Uncached input per request","expr":"input_tokens * (1 - cached_share)","unit":"tokens"},{"id":"by_rpm","label":"Requests per minute the request limit allows","expr":"rpm_limit","unit":"count"},{"id":"by_itpm","label":"Requests per minute the input limit allows","expr":"itpm_limit / uncached","unit":"count"},{"id":"by_otpm","label":"Requests per minute the output limit allows","expr":"otpm_limit / output_tokens","unit":"count"},{"id":"sustainable","label":"Sustainable requests per minute","expr":"min(by_rpm, by_itpm, by_otpm) * headroom","unit":"count","main":true}],"assumptions":["Steady traffic smoothed by a client-side bucket; unsmoothed bursts hit the bucket first.","Cache writes are rare, so uncached input is mostly fresh input (cache writes also count toward Anthropic's ITPM).","Output is counted as generated, as in Anthropic's OTPM. Where a provider counts max_tokens up front, enter max_tokens instead.","One model class; a limit shared by several models is split between them."],"tests":[{"inputs":{},"expect":{"uncached":5000,"by_itpm":80,"by_otpm":100,"sustainable":64}},{"inputs":{"cached_share":0},"expect":{"uncached":20000,"by_itpm":20,"sustainable":16}},{"inputs":{"output_tokens":2000},"expect":{"by_otpm":40,"sustainable":32}}]}
```

**Which 429s recover.** Responses report each bucket's remaining capacity ([model APIs](#model-apis)); the IETF's draft `RateLimit` fields would standardize this ([draft-ietf-httpapi-ratelimit-headers-11](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), not an RFC as of November 2026), with `Retry-After` taking precedence. Rate-limit 429s recover as the bucket refills. Acceleration limits (Anthropic) and `slow_down` errors (OpenAI, even within your limits) fire when traffic grows too fast; ramp gently. Retrying never fixes spend, billing or quota 429s ([OpenAI error codes](https://developers.openai.com/api/docs/guides/error-codes)): they last until credits are added, the limit is raised or it resets. Branch on the error code, not the status.

```viz
{"id":"rate-limits-overload-429s","component":"sequence","title":"Same status, opposite responses: a rate limit says wait, a spend cap says stop","caption":"Switch variants and step through. Header names, the error type and the error code come from Anthropic's rate-limit docs as of November 2026; the values are illustrative.","alt":"Two sequences between an app and a model API. In the first, a 429 with retry-after 7 is followed by a wait and a successful retry. In the second, a 429 without retry-after and with error code enforced_spend_limit_reached fails again on retry, and the app stops and alerts.","data":"illustrative","depicts":"Claude API rate-limit and spend-cap responses, as of November 2026, simplified","actors":[{"id":"app","label":"Your app","role":"agent"},{"id":"api","label":"Model API","role":"model"}],
"variants":[
{"name":"Rate limit: wait","messages":[
{"from":"app","to":"api","label":"POST /v1/messages","payload":"POST /v1/messages\n\n{\"model\":\"<model-id>\",\"max_tokens\":1024,\"messages\":[…]}","note":"An ordinary request. Its uncached input tokens are charged to the input-token bucket."},
{"from":"api","to":"app","label":"429, retry-after: 7","kind":"response","payload":"HTTP/1.1 429 Too Many Requests\nretry-after: 7\nanthropic-ratelimit-input-tokens-limit: 400000\nanthropic-ratelimit-input-tokens-remaining: 0\n\n{\"type\":\"error\",\"error\":{\"type\":\"rate_limit_error\",\"message\":\"…\"}}","note":"The input-token bucket is empty. The retry-after header says when the request will fit; earlier retries fail."},
{"from":"app","to":"app","label":"wait 7 s","note":"Honor retry-after. Other requests queue behind a client-side bucket instead of piling on."},
{"from":"app","to":"api","label":"same request","note":"One retry, at one layer."},
{"from":"api","to":"app","label":"200 OK","kind":"response","payload":"HTTP/1.1 200 OK\nanthropic-ratelimit-input-tokens-remaining: 381000\n\n{\"type\":\"message\",\"content\":[…],\"usage\":{…}}","note":"The remaining-tokens headers are an early warning: slow down before the next 429."}]},
{"name":"Spend cap: stop","messages":[
{"from":"app","to":"api","label":"POST /v1/messages","note":"The same kind of request."},
{"from":"api","to":"app","label":"429, no retry-after","kind":"response","payload":"HTTP/1.1 429 Too Many Requests\n\n{\"type\":\"error\",\"error\":{\"type\":\"rate_limit_error\",\"message\":\"You have reached your API usage limits: …\",\"details\":{\"error_code\":\"enforced_spend_limit_reached\"}}}","note":"Same status and error type as a rate limit. The error code and the missing retry-after tell them apart."},
{"from":"app","to":"api","label":"SDK retry","note":"Default SDK retries resend it anyway."},
{"from":"api","to":"app","label":"429 again","kind":"response","note":"It keeps failing until access resumes at the start of next month or the tier is raised."},
{"from":"app","to":"app","label":"stop, alert, degrade","note":"Fail fast: page a human, and switch to a fallback provider or a degraded mode."}]}]}
```

**Shape traffic before it leaves.** Put a client-side token bucket per limit below the provider's, so bursts queue locally; cap concurrency; pre-count tokens (Anthropic's [token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting) is free as of November 2026). Throttle adaptively: in Google's SRE book a client starts rejecting some requests locally once its requests over two minutes exceed twice its accepts ([Handling Overload](https://sre.google/sre-book/handling-overload/)).

**Quotas and bulkheads.** In your [gateway](#gateways-routers), give each tenant, feature and agent run a quota, letting unused capacity flow to others as Anthropic's workspace limits do. Split capacity into bulkheads, pools per provider, tool server and large tenant, so an exhausted pool fails alone; Microsoft's [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead) says AI and inference workloads often need strict ones. Otherwise one tenant's backfill drains the shared bucket for everyone: the noisy neighbor. See [cost and capacity](#cost-capacity).

**Capacity classes**, as of November 2026. Batch APIs cost 50% less, have their own limits and work within a 24-hour window ([Anthropic](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [OpenAI](https://developers.openai.com/api/docs/guides/batch); see [batch workloads](#async-batch-workloads)). OpenAI's [flex](https://developers.openai.com/api/docs/guides/flex-processing) tier, in beta, is batch-priced, slower and may return 429 when short of capacity; its priority processing became [Fast mode](https://developers.openai.com/api/docs/guides/fast-mode) on 30 July 2026. Anthropic calls its [service tiers](https://platform.claude.com/docs/en/api/service-tiers) legacy and no longer sells Priority Tier commitments. [Provisioned throughput](https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/provisioned-throughput), such as Azure's PTUs, is dedicated capacity billed hourly (or through reservations), used or not.

**Shed by criticality, under a deadline.** Tag requests with a criticality at the edge and propagate it (Google's [Handling Overload](https://sre.google/sre-book/handling-overload/) uses four levels, CRITICAL_PLUS to SHEDDABLE); shed evals and backfills before interactive turns. Pass one deadline's remaining time down every hop ([Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)), so no layer starts work nobody will wait for. The aim is goodput: throughput served without errors, fast enough to use ([Amazon Builders' Library](https://builder.aws.com/content/3Eun1EEyX6p2e3VYNyRLSJzLuMV/using-load-shedding-to-avoid-overload)).

**Retry at one layer.** Retries multiply: in the SRE book, three layers making 4 attempts each put 64 on the database ([Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)). Here the layers are the SDK (Anthropic's and OpenAI's retry twice by default as of November 2026), the gateway and the [agent loop](#agent-loop). Retry at one, zero the others (OpenAI's guide agrees), and budget it as Google does: three attempts per request, retries under 10% of requests.

```viz
{"id":"rate-limits-overload-amplification","component":"calculator","title":"Retries multiply across layers: two retries at each of three layers put 27 calls on a failing provider","caption":"The formula is the retry-amplification example from Google's SRE book. The SDK default of 2 retries matches Anthropic's and OpenAI's Python SDKs as of November 2026; the other inputs are illustrative.","alt":"Calculator: worst-case calls per user action as the product of one plus the retries at the SDK, gateway and agent-loop layers, and the resulting calls per minute during an outage.","data":"formula","try":"Set the SDK and agent-loop retries to 0 so only the gateway retries.","inputs":{"sdk_retries":2,"gateway_retries":2,"agent_retries":2,"actions_per_min":100},"input_meta":{"sdk_retries":{"label":"SDK retries","min":0,"step":1},"gateway_retries":{"label":"Gateway retries","min":0,"step":1},"agent_retries":{"label":"Agent-loop retries of a failed step","min":0,"step":1},"actions_per_min":{"label":"User actions per minute","min":0}},"outputs":[{"id":"attempts","label":"Worst-case calls per user action","expr":"(1 + sdk_retries) * (1 + gateway_retries) * (1 + agent_retries)","unit":"count","main":true},{"id":"outage_load","label":"Calls per minute while every call fails","expr":"attempts * actions_per_min","unit":"count"},{"id":"one_layer","label":"Calls per action if only the gateway retries","expr":"1 + gateway_retries","unit":"count"}],"assumptions":["Every attempt fails, as in a full outage or a spend cap.","Each layer retries every failure it sees, including failures the layer below already retried.","No retry budget, circuit breaker or retry-after delay."],"tests":[{"inputs":{},"expect":{"attempts":27,"outage_load":2700,"one_layer":3}},{"inputs":{"sdk_retries":0,"agent_retries":0},"expect":{"attempts":3}},{"inputs":{"sdk_retries":3,"gateway_retries":3,"agent_retries":3},"expect":{"attempts":64},"note":"The SRE book's example of 4 attempts at three layers"}]}
```

**Hedge only cheap calls.** Send a second copy once the first outlasts the 95th-percentile latency; [Dean et al., “The Tail at Scale” (2013)](https://doi.org/10.1145/2408776.2408794) report about 5% extra load. LLM hedges spend tokens and rate-limit budget, so hedge only short calls without side effects, and cancel the loser.

## In practice
One retry layer, a local bucket, a concurrency cap and a deadline, with the Anthropic Python SDK:

```python
import asyncio, os, random, time
import anthropic

# This function is the only retry layer: the SDK does not retry.
client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"], max_retries=0)
MODEL = "<model-id>"
ITPM_LIMIT = int(os.environ["ITPM_LIMIT"])  # from your limits page

class TokenBucket:
    def __init__(self, per_minute: float, burst_seconds: float = 10):
        self.rate = per_minute / 60
        self.capacity = self.level = self.rate * burst_seconds
        self.last = time.monotonic()

    async def take(self, n: float) -> None:
        n = min(n, self.capacity)
        while True:
            now = time.monotonic()
            self.level = min(self.capacity, self.level + (now - self.last) * self.rate)
            self.last = now
            if self.level >= n:
                self.level -= n
                return
            await asyncio.sleep((n - self.level) / self.rate)

input_bucket = TokenBucket(per_minute=0.8 * ITPM_LIMIT)
in_flight = asyncio.Semaphore(8)

async def call(messages: list, deadline: float, max_attempts: int = 3):
    """deadline is a time.monotonic() value passed down from the caller."""
    # Counts all input tokens; with prompt caching, ITPM charges only the uncached part.
    count = await client.messages.count_tokens(model=MODEL, messages=messages)
    for attempt in range(max_attempts):
        await input_bucket.take(count.input_tokens)
        try:
            async with in_flight:
                return await client.messages.create(model=MODEL, max_tokens=1024, messages=messages)
        except anthropic.RateLimitError as e:
            if e.error_code == "enforced_spend_limit_reached":
                raise  # never recovers on retry: alert instead
            retry_after = e.response.headers.get("retry-after")
            wait = float(retry_after) if retry_after else random.uniform(0, 2 ** (attempt + 1))
        except anthropic.InternalServerError:  # 5xx, including 529 overloaded
            wait = random.uniform(0, 2 ** (attempt + 1))  # full jitter
        if attempt + 1 == max_attempts:
            break  # no sleep after the last attempt
        if time.monotonic() + wait > deadline:
            raise TimeoutError("no time left for another attempt")
        await asyncio.sleep(wait)
    raise RuntimeError("retry budget spent")
```

The 80%, eight and three are starting points, not provider advice. Test before the provider does: inject 429s with and without `retry-after`, 529s and stalls at the gateway (Envoy's [fault injection filter](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/fault_filter) injects the status codes and delays, though not the `retry-after` header), and load test far past the breaking point, as Amazon advises. Treat spend-cap errors as [incidents](#incidents-on-call); chart remaining tokens per pool in your [traces](#observability-tracing).

> [!try]
> Print the `anthropic-ratelimit` headers from `client.messages.with_raw_response.create(...)`, then send ten requests at once and watch them drop.

## Numbers to know
> [!number]
> Rules of thumb and dated facts, as of November 2026. Anthropic's and OpenAI's Python SDKs retry twice by default ([Anthropic](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python), [OpenAI](https://github.com/openai/openai-python)); three such layers mean up to 27 calls. Google's budgets: 3 attempts per request, retries under 10%. Hedging at the 95th percentile: about 5% extra load (Dean et al., 2013). Batch: 50% off, a 24-hour window. [OpenAI's ramp rule](https://developers.openai.com/api/docs/guides/rate-limits) once traffic reaches 1 million input tokens per minute: at most 50% growth every 15 minutes.

## Pitfalls and anti-patterns
> [!pitfall] Retrying a spend cap
> SDK defaults resend it, and each retry fails until access resumes (for Anthropic's tier caps, next month). Check the error code, stop, alert and degrade.

> [!pitfall] Retries at every layer
> Three layers retrying twice turn an outage into 27 times the traffic. Retry at one.

- **Sizing from the per-minute number.** Bursts trip the bucket first.
- **Hammering after a 429.** OpenAI counts unsuccessful requests toward your per-minute limit.
- **One pool for interactive and batch traffic.** The backfill wins and users wait.

## Talk like an expert
The vocabulary: **token bucket**, **cache-aware limit**, **ramp-rate limit**, **adaptive throttling**, **retry budget**, **retry amplification**, **bulkhead**, **noisy neighbor**, **goodput**, **deadline propagation**, **hedged request**. Experts state headroom per limit and per pool. Live debates: client-side throttling versus letting 429s steer you, and reserved capacity versus pay-as-you-go across providers.

> [!hottake] Most 429s are self-inflicted: a local bucket and one retry layer fix more of them than a tier upgrade.
> **The counterargument:** the docs give neither bucket sizes nor exact ramp thresholds, and processes sharing one organization limit cannot coordinate locally. Without a shared gateway, buying headroom is simpler.

## Check yourself
```quiz
rate-limits-overload
```

## Go deeper
- Provider docs: [Claude rate limits](https://platform.claude.com/docs/en/api/rate-limits) and [errors](https://platform.claude.com/docs/en/api/errors); [OpenAI rate limits](https://developers.openai.com/api/docs/guides/rate-limits) and [error codes](https://developers.openai.com/api/docs/guides/error-codes).
- Google's SRE book: [Handling Overload](https://sre.google/sre-book/handling-overload/) and [Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/).
- Amazon Builders' Library: [Using load shedding to avoid overload](https://builder.aws.com/content/3Eun1EEyX6p2e3VYNyRLSJzLuMV/using-load-shedding-to-avoid-overload).
- Dean et al., [“The Tail at Scale”](https://doi.org/10.1145/2408776.2408794) (2013).

## Related
- [Reliability engineering](#reliability-engineering)
- [Cost and capacity](#cost-capacity)
- [SLOs and error budgets for AI systems](#slos-error-budgets)
- [Gateways and routers](#gateways-routers)
- [Model APIs in practice](#model-apis)
- [Asynchronous and batch AI workloads](#async-batch-workloads)
