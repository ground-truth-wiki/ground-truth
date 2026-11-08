---
id: latency-throughput
book: 15
order: "15.2"
title: Latency and throughput
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [ttft, latency, throughput, slo]
visuals:
  - latency-calculator:calculator
  - latency-vs-batch:chart
---
> [!tldr]
> Latency is how long one user waits; throughput is how much work the server does. Batching trades one for the other. Measure time to first token, time per output token and end-to-end latency at percentiles, set targets per product, and tune batch size to the cheapest setting that meets them.

## Why it matters
Users judge an AI product by how fast the first word appears and how smoothly the rest streams; finance judges it by tokens per GPU-hour. The two pull in opposite directions. Teams that do not measure both end up either overpaying for idle GPUs or shipping a sluggish product.

## Intuition
A bus and a taxi. The taxi gets one passenger there fastest; the bus moves forty people per trip at lower cost each, but every passenger waits for the stops. Batch size is how full you let the bus get.

```viz
{"id":"latency-calculator","component":"calculator","title":"Latency is time to first token plus output tokens times time per token, repeated for every step","caption":"Enter your measured numbers. A five-step agent with modest outputs easily takes longer than one long answer, because every step pays its own time to first token.","alt":"Calculator for response latency from time to first token, output tokens, time per output token, number of steps and tool time.","data":"formula","outputs":[{"id":"per_call","label":"One model call","expr":"ttft_ms + out_tokens * tpot_ms","unit":"ms"},{"id":"total","label":"Whole response","expr":"steps * per_call + tool_ms","unit":"ms","main":true}],"inputs":{"ttft_ms":400,"out_tokens":500,"tpot_ms":20,"steps":1,"tool_ms":0},"input_meta":{"ttft_ms":{"label":"Time to first token","unit":"ms"},"out_tokens":{"label":"Output tokens per call"},"tpot_ms":{"label":"Time per output token","unit":"ms"},"steps":{"label":"Model calls (agent steps)"},"tool_ms":{"label":"Total tool time","unit":"ms"}},"assumptions":["Steps run sequentially.","TTFT and TPOT are constant across steps; in reality TTFT grows with context."],"tests":[{"inputs":{},"expect":{"per_call":10400,"total":10400}},{"inputs":{"ttft_ms":600,"out_tokens":200,"tpot_ms":15,"steps":5,"tool_ms":6000},"expect":{"per_call":3600,"total":24000}}]}
```

## How it works
**The metrics.**
- **TTFT** (time to first token): queueing plus prefill. Dominates perceived responsiveness for chat.
- **TPOT** (time per output token), also called inter-token latency: one decode step. Decides streaming smoothness.
- **End-to-end latency** ≈ TTFT + output tokens × TPOT. Decides how long agents and batch jobs take.
- **Throughput:** tokens per second across all users, or requests per second.
- **Goodput:** throughput that meets latency targets; requests that miss their target do not count.

**Percentiles.** Report p50, p95 and p99, not averages. Long prompts, long outputs and queueing create heavy tails that averages hide.

**The batching trade-off.** Larger batches share each read of the weights across more sequences, so total throughput rises; each step also reads more KV cache and does more work, so per-user speed falls, and memory caps the batch:

```viz
{"id":"latency-vs-batch","component":"chart","type":"line","title":"Going from batch 1 to 192 multiplies throughput by about 46 and cuts each user’s speed by three quarters","caption":"Formula view from the roofline explorer’s setup: an 8B model in BF16 on one H100-class GPU, 2K tokens of context per sequence, memory-bound decode including KV cache reads. Log scale.","alt":"Line chart of per-user tokens per second falling and total tokens per second rising as batch size grows from 1 to 192.","data":"formula","x":{"label":"Batch size (log scale)","log":true},"y":{"label":"Tokens per second (log scale)","log":true},"series":[{"name":"Total throughput","points":[[1,206],[8,1477],[32,4362],[64,6467],[128,8524],[192,9535]]},{"name":"Per-user speed","points":[[1,206],[8,185],[32,136],[64,101],[128,67],[192,50]]}]}
```

**Little’s law.** Concurrent requests = arrival rate × average latency. If requests arrive at 10 per second and each takes 4 seconds, about 40 are in flight; your server must hold that many sequences in memory. See [memory math](#memory-math).

**Service-level objectives.** Set targets per product: a chat interface might want TTFT under one second at p95 and at least 20 tokens per second per user; a batch summarizer might care only about cost per document.

## In practice
A tuning routine:
1. **Measure** TTFT, TPOT and end-to-end latency at p50, p95 and p99 under realistic load, with real prompt and output lengths.
2. **Set SLOs** per product surface.
3. **Sweep** maximum batch size and concurrency; plot goodput.
4. **Pick** the largest batch that still meets SLOs at p95.
5. **Re-check** after model, prompt or traffic changes.

Streaming changes perception: users tolerate long total times if the first token arrives quickly and the stream is steady. See [streaming](#streaming).

## Numbers to know
> [!number]
> Formulas and rules of thumb. End-to-end ≈ TTFT + N × TPOT. Little’s law: in-flight = arrival rate × latency. People read at a few words per second, so steady streaming at a few tens of tokens per second feels fast for chat; agents and batch jobs care about totals instead.

## Pitfalls and anti-patterns
> [!pitfall] Averages instead of percentiles
> A p50 of 800 ms with a p99 of 9 seconds is a product with frequent bad experiences. Report the tail.

- **Benchmarks with tiny prompts.** Real prompts are long; TTFT and memory change completely.
- **Maximizing throughput blindly.** Users feel per-user speed and queueing, not GPU utilization.
- **Ignoring queueing.** Under load, waiting for a slot can dominate TTFT.

## Talk like an expert
The vocabulary: **TTFT**, **TPOT**, **inter-token latency**, **end-to-end latency**, **p95** and **p99**, **throughput**, **goodput**, **SLO**, **Little’s law**. Experts quote latency at a percentile and a load, never alone. The live debate is how to schedule mixed workloads, such as interactive chat and long agent runs on the same fleet, without one ruining the other’s latency.

> [!hottake] Goodput, not throughput, is the number to optimize.
> **The counterargument:** for offline and batch workloads with no latency target, raw throughput per dollar is exactly the right metric, and goodput adds nothing.

## Check yourself
```quiz
latency-throughput
```

## Go deeper
- Zhong et al., “DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving” (2024), which popularized goodput.
- Your serving engine’s benchmarking tools and documentation.

## Related
- [Inference fundamentals](#inference-fundamentals)
- [Batching and scheduling](#batching-scheduling)
- [Streaming](#streaming)
- [Back-of-envelope estimation](#back-of-envelope)
- [Cost engineering](#cost-engineering)
