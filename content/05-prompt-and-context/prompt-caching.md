---
id: prompt-caching
book: 5
order: "5.5"
title: Prompt caching and token economics
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [caching, cost, tokens]
visuals:
  - cache-prefix:compare
  - cache-savings:calculator
  - cache-turns:chart
---
> [!tldr]
> Providers can reuse the processed state of a prompt prefix they saw recently. Keep the start of your prompt stable and byte-identical, put variable content last, and repeated requests become much cheaper and faster. Agents, which resend their whole history every turn, benefit most.

## Why it matters
Long system prompts, tool definitions, documents and conversation histories are sent again on every request. Without caching you pay full price for them each time; with caching, most of that input costs a fraction. For agents and chat products, prompt caching is often the single biggest cost lever, and a careless change, such as a timestamp at the top of the prompt, can silently switch it off.

## Intuition
A chef who preps the same base sauce every morning can make it once and keep it warm, as long as every order starts with exactly that sauce. Change one ingredient at the start, and the whole batch has to be made again.

```viz
{"id":"cache-prefix","component":"compare","title":"One timestamp at the top of the prompt breaks the cache for everything after it","caption":"Two requests with the same content in different orders. Hover the marks. Caches match from the first token, so anything that changes must come last.","alt":"Comparison of a prompt with a changing timestamp at the start and the same prompt with stable content first and variable content last.","data":"illustrative","a":{"title":"Cache-hostile","text":"Current time: 2026-11-03 10:42:17\nSystem: You are a support agent ...\nTools: [12 definitions, 9,000 tokens]\nPolicy docs: [20,000 tokens]\nHistory: ...\nUser: Where is my order?"},"b":{"title":"Cache-friendly","text":"System: You are a support agent ...\nTools: [12 definitions, 9,000 tokens]\nPolicy docs: [20,000 tokens]\n--- cache breakpoint ---\nHistory: ...\nCurrent time: 2026-11-03 10:42:17\nUser: Where is my order?"},"links":[{"a":"Current time: 2026-11-03 10:42:17","b":"Current time: 2026-11-03 10:42:17","note":"The same line, moved from the first position to the end, turns a cache miss on every request into a hit on everything above it."},{"a":"Tools: [12 definitions, 9,000 tokens]","b":"--- cache breakpoint ---","note":"Stable content first, then a breakpoint where the API supports marking one."},{"b":"History: ...","note":"Append new turns at the end; editing earlier turns invalidates the cache from that point on."}]}
```

## How it works
**What is cached.** The serving engine stores the [KV cache](#kv-cache) computed for a prompt prefix. A later request whose prompt starts with exactly the same tokens skips recomputing that prefix: it is cheaper, and time to first token drops. See [batching and scheduling](#batching-scheduling).

**Matching is by prefix.** The cache matches from the first token up to the first difference. A change at position 10 invalidates everything after position 10, even if the rest is identical.

**Automatic and explicit caching.** Some providers cache eligible prefixes automatically; others let you mark cache breakpoints explicitly. There is usually a minimum prefix length, and caches expire after a time to live, often minutes, with longer options at a different price. Check your provider’s current documentation for the rules and prices.

**The cost math.** Cached reads are billed at a fraction of normal input; some providers charge extra to write a prefix into the cache. Whether caching pays off therefore depends on the hit rate: how often the same prefix is reused before it expires.

**Designing for hits:**
- Stable content first: system prompt, tool definitions, long reference documents, examples.
- Variable content last: retrieved passages that change per query, the latest messages, timestamps, user ids.
- Keep the stable part byte-identical: same order, same whitespace, same tool order. MCP’s deterministic tool order exists partly for this. See [MCP at scale](#mcp-at-scale).
- Append rather than edit history. See [context engineering](#context-engineering).

## In practice
Enter your own traffic and prices:

```viz
{"id":"cache-savings","component":"calculator","title":"At a 90% hit rate, caching a 20,000-token prefix cuts input cost by about three quarters; at 0% it costs more","caption":"Multipliers are illustrative: some providers bill cached reads at about a tenth of the input price and cache writes at a premium. Enter your provider’s current prices and your measured hit rate.","alt":"Calculator for daily input cost with and without prompt caching, from requests, prefix and suffix tokens, hit rate, input price and cache multipliers.","data":"formula","outputs":[{"id":"uncached","label":"Daily input cost without caching","expr":"requests * (prefix + suffix) * price / 1000000","unit":"usd"},{"id":"cached","label":"Daily input cost with caching","expr":"requests * (hit * prefix * price * read_mult + (1 - hit) * prefix * price * write_mult + suffix * price) / 1000000","unit":"usd","main":true},{"id":"savings","label":"Saving","expr":"1 - cached / uncached","unit":"pct"}],"inputs":{"requests":10000,"prefix":20000,"suffix":1000,"hit":0.9,"price":3,"read_mult":0.1,"write_mult":1.25},"input_meta":{"requests":{"label":"Requests per day"},"prefix":{"label":"Stable prefix tokens"},"suffix":{"label":"Variable tokens per request"},"hit":{"label":"Cache hit rate","unit":"0 to 1"},"price":{"label":"Input price","unit":"$ per million, illustrative"},"read_mult":{"label":"Cached read multiplier","unit":"× input price"},"write_mult":{"label":"Cache write multiplier","unit":"× input price"}},"assumptions":["Every miss writes the prefix to the cache.","Output tokens are unaffected by caching and excluded here.","Real hit rates depend on traffic patterns and the cache lifetime."],"tests":[{"inputs":{},"expect":{"uncached":630,"cached":159,"savings":0.7476},"tol":0.001},{"inputs":{"hit":0},"expect":{"cached":780,"savings":-0.2381},"tol":0.001}]}
```

Agents gain the most, because each turn resends everything before it:

```viz
{"id":"cache-turns","component":"chart","type":"line","title":"Over ten agent turns, caching cuts billed input by about 70%","caption":"Formula view: a 10,000-token start plus 5,000 new tokens per turn. With caching, earlier context is billed at 0.1× and new tokens are written at 1.25×; multipliers are illustrative and vary by provider.","alt":"Line chart of cumulative billed input tokens over ten agent turns, without caching rising to 325,000 and with caching rising to about 96,000 token-equivalents.","data":"formula","x":{"label":"Agent turn"},"y":{"label":"Cumulative billed input (token-equivalents)","unit":"k","min":0},"series":[{"name":"Without caching","points":[[1,10000],[2,25000],[3,45000],[4,70000],[5,100000],[6,135000],[7,175000],[8,220000],[9,270000],[10,325000]]},{"name":"With caching","points":[[1,12500],[2,19750],[3,27500],[4,35750],[5,44500],[6,53750],[7,63500],[8,73750],[9,84500],[10,95750]]}]}
```

Monitor the cache hit rate as a first-class production metric. A drop after a deploy almost always means something early in the prompt started varying.

## Numbers to know
> [!number]
> Formulas and rules of thumb. Billed input with caching ≈ hits × prefix × read price + misses × prefix × write price + variable tokens × input price. Cached reads commonly cost a small fraction of normal input. Caches expire, often within minutes by default, so bursty traffic gets fewer hits.

## Pitfalls and anti-patterns
> [!pitfall] Variable content at the top
> Timestamps, user ids, A/B flags or shuffled tool lists at the start of the prompt turn every request into a cache miss.

- **Editing history.** Rewriting earlier turns invalidates the cache from the edit onward.
- **Assuming hits.** Measure the hit rate; low-traffic prompts may expire before reuse.
- **Ignoring write premiums.** At low hit rates, caching can cost more than it saves.

## Talk like an expert
The vocabulary: **prefix caching**, **cache breakpoint**, **time to live**, **cache hit rate**, **cache write** and **cache read**, **append-only context**. Experts treat hit rate as a key agent metric and design prompts stable-first. The live debate is how far providers will automate caching so that application developers need not think about it; prompt structure still decides what can be cached.

> [!hottake] For agent products, cache hit rate matters more than model price.
> **The counterargument:** caching discounts only input; for output-heavy or reasoning-heavy workloads, output and thinking tokens dominate the bill and model choice matters more.

## Check yourself
```quiz
prompt-caching
```

## Go deeper
- Your provider’s prompt caching documentation, for current rules, lifetimes and prices.
- Kwon et al., “PagedAttention” (2023), and SGLang’s RadixAttention, for how serving engines share prefixes.

## Related
- [Context engineering](#context-engineering)
- [Cost engineering](#cost-engineering)
- [The KV cache](#kv-cache)
- [Batching and scheduling](#batching-scheduling)
- [Model APIs in practice](#model-apis)
