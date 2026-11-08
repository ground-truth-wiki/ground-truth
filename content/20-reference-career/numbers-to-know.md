---
id: numbers-to-know
book: 20
order: "20.3"
title: Numbers every AI engineer should know
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [numbers, rules-of-thumb, estimation]
visuals:
  - numbers-log:chart
  - training-compute-calculator:calculator
  - vram-calculator:calculator
---
> [!tldr]
> A few dozen numbers let you estimate cost, memory, latency and feasibility in your head: characters per token, bytes per parameter, FLOPs per token, the KV-cache formula and typical latencies. Each one here is flagged as a rule of thumb or a sourced value.

## Why it matters
Back-of-the-envelope math separates engineers who can say “that will need four GPUs and cost about this much per month” in a meeting from those who need a week and a spreadsheet. It also protects you from vendor claims that cannot be true. None of these numbers needs to be exact; they need to be within a factor of two, and you need to know which ones change fast.

## Intuition
Think of these as the conversion factors of the field, like knowing a kilometer is about 0.6 miles. You do not need the decimal places; you need the order of magnitude, instantly.

```viz
{"id":"numbers-log","component":"chart","type":"dot","title":"The numbers span many orders of magnitude, so learn them on a log scale","caption":"Switch tabs by unit. Hollow dots are rules of thumb; filled dots are sourced or computed from a formula. Hover a dot for its note.","alt":"Log-scale dot plots of key numbers for time, memory, compute and text size.","data":"illustrative","try":"Open Memory and compare one 128k-token KV cache with the weights of a 7B model.","groups":[
{"name":"Time","unit":"s","items":[{"label":"Read 1 GB of GPU memory","value":0.00033,"note":"memory bandwidth of a recent data-center GPU, order of magnitude"},{"label":"One decode step, 70B at 16-bit","value":0.042,"note":"140 GB of weights ÷ ~3.35 TB/s; batch shares it"},{"label":"Time to first token, typical API call","value":0.5},{"label":"A web fetch or search tool call","value":1.5},{"label":"Generate 500 tokens at 50 tokens/s","value":10,"kind":"sourced","note":"computed: 500 ÷ 50"},{"label":"An interactive agent task","value":40},{"label":"A background coding-agent task","value":1800}]},
{"name":"Memory","unit":"bytes","items":[{"label":"One float32 embedding, 1,024 dims","value":4096,"kind":"sourced","note":"computed: 1,024 × 4 bytes"},{"label":"KV cache per token, 70B GQA-8, 16-bit","value":327680,"kind":"sourced","note":"computed from the KV formula"},{"label":"1M chunks × 1,024 dims × 4 bytes","value":4096000000,"kind":"sourced","note":"computed; before index overhead"},{"label":"7B weights at 16-bit","value":14000000000,"kind":"sourced","note":"computed: 7B × 2 bytes"},{"label":"70B weights at 4-bit","value":35000000000,"kind":"sourced","note":"computed: 70B × 0.5 bytes"},{"label":"One 128k-token KV cache, same 70B","value":42949672960,"kind":"sourced","note":"computed: 40 GiB"},{"label":"70B weights at 16-bit","value":140000000000,"kind":"sourced","note":"computed: 70B × 2 bytes"}]},
{"name":"Compute","unit":"flop","items":[{"label":"Inference, 7B model, per token","value":14000000000,"kind":"sourced","note":"≈ 2 × parameters"},{"label":"Inference, 70B model, per token","value":140000000000,"kind":"sourced","note":"≈ 2 × parameters"},{"label":"Training 7B on 2T tokens","value":8.4e22,"kind":"sourced","note":"≈ 6 × N × D"},{"label":"Training 70B on 15T tokens","value":6.3e24,"kind":"sourced","note":"≈ 6 × N × D"}]},
{"name":"Text","unit":"count","items":[{"label":"Characters per English token","value":4},{"label":"Tokens in a typical tool definition","value":300},{"label":"Tokens in 1,000 English words","value":1330},{"label":"Tokens in a 300-page book","value":130000},{"label":"Tokens in a 200k context window","value":200000,"kind":"sourced","note":"by definition"}]}]}
```

## How it works
**Text.** About four characters or three quarters of a word per English token; code, numbers and many other languages take more tokens. 1,000 words ≈ 1,300 tokens.

**Bytes per parameter.** FP32: 4. BF16 or FP16: 2. FP8 or INT8: 1. INT4: 0.5. So weights in bytes ≈ parameters × bytes per parameter: a 70B model is 140 GB in 16-bit and 35 GB in 4-bit.

**FLOPs per token.** A forward pass costs about 2 × N FLOPs per token for N parameters (one multiply and one add per weight). Training costs about 6 × N per token (forward plus a backward pass at about twice the forward cost), so total training compute ≈ 6 × N × D for D training tokens (from Kaplan et al., 2020). For mixture-of-experts models, use active parameters.

**Memory traffic per decode step.** Each generated token reads all weights once, so decode speed for one sequence ≈ memory bandwidth ÷ model bytes. A 140 GB model on about 3.35 TB/s of bandwidth gives at most about 24 steps per second, shared by the whole batch. See [inference fundamentals](#inference-fundamentals).

**KV cache.** 2 × layers × KV heads × head dim × bytes × tokens × batch. See [the KV cache](#kv-cache).

**Latency.** Total ≈ time to first token + output tokens × time per output token, plus every tool call in an agent loop. See [latency and throughput](#latency-throughput).

**Cost.** Input tokens × input price + output tokens × output price, with cached input far cheaper and reasoning tokens billed as output. Prices change often; never memorize them, compute them. See [cost engineering](#cost-engineering).

```viz
{"id":"training-compute-calculator","component":"calculator","title":"Training compute is about six FLOPs per parameter per token, and MFU turns it into GPU-days","caption":"Enter a model size and token count. GPU throughput and model FLOP utilization (MFU) are assumptions: use your hardware’s dense peak for the precision you train in.","alt":"Calculator for training FLOPs from parameters and tokens, and GPU-hours and days from GPU throughput, MFU and GPU count.","data":"formula","outputs":[{"id":"flops","label":"Training compute","expr":"6 * params_b * 1e9 * tokens_b * 1e9","unit":"flop","main":true},{"id":"gpu_hours","label":"GPU-hours","expr":"flops / (gpu_tflops * 1e12 * mfu) / 3600","unit":"count"},{"id":"days","label":"Wall-clock days on your cluster","expr":"gpu_hours / gpus / 24","unit":""}],"inputs":{"params_b":7,"tokens_b":2000,"gpu_tflops":989,"mfu":0.4,"gpus":1024},"input_meta":{"params_b":{"label":"Parameters","unit":"billions"},"tokens_b":{"label":"Training tokens","unit":"billions"},"gpu_tflops":{"label":"Peak GPU throughput","unit":"TFLOP/s, dense"},"mfu":{"label":"Model FLOP utilization","unit":"0 to 1"},"gpus":{"label":"GPUs"}},"assumptions":["6 × N × D ignores attention FLOPs, which matter more at long sequence lengths.","Dense models; for mixture of experts, use active parameters.","MFU of 0.3 to 0.5 is a common range for large training runs."],"tests":[{"inputs":{"params_b":7,"tokens_b":2000},"expect":{"flops":8.4e22,"gpu_hours":58982},"tol":0.001},{"inputs":{"params_b":70,"tokens_b":15000},"expect":{"flops":6.3e24}}]}
```

## In practice
Estimate before you build. To size a deployment: weights plus KV cache at your context and concurrency, plus overhead, divided by GPU memory:

```viz
{"id":"vram-calculator","component":"calculator","title":"Weights fit on one card; weights plus caches for real traffic often need three","caption":"Defaults: a 70B-class model at 16-bit serving eight concurrent 32k-token sequences. Change precision and concurrency and watch the card count. Memory only: throughput needs its own estimate.","alt":"Calculator for serving memory: weights, KV cache, overhead and the number of GPUs needed.","data":"formula","outputs":[{"id":"weights","label":"Weights","expr":"params_b * 1e9 * bytes_per_param","unit":"bytes"},{"id":"kv","label":"KV cache for all sequences","expr":"2 * layers * kv_heads * head_dim * kv_bytes * context * batch","unit":"bytes"},{"id":"total","label":"Total with overhead","expr":"(weights + kv) * (1 + overhead)","unit":"bytes","main":true},{"id":"cards","label":"GPUs needed (memory only)","expr":"ceil(total / (card_gib * GiB))","unit":"count"}],"inputs":{"params_b":70,"bytes_per_param":2,"layers":80,"kv_heads":8,"head_dim":128,"kv_bytes":2,"context":32768,"batch":8,"overhead":0.1,"card_gib":80},"input_meta":{"params_b":{"label":"Parameters","unit":"billions"},"bytes_per_param":{"label":"Weight precision","options":[["16-bit",2],["8-bit",1],["4-bit",0.5]]},"layers":{"label":"Layers"},"kv_heads":{"label":"KV heads"},"head_dim":{"label":"Head dimension"},"kv_bytes":{"label":"KV precision","options":[["16-bit",2],["8-bit",1]]},"context":{"label":"Tokens per sequence"},"batch":{"label":"Concurrent sequences"},"overhead":{"label":"Overhead fraction","unit":"activations, runtime"},"card_gib":{"label":"Memory per GPU","unit":"GiB"}},"assumptions":["Overhead covers activations, CUDA graphs and fragmentation; 10% to 20% is a common allowance.","Tensor parallelism splits weights and cache evenly across cards.","Ignores memory for speculative-decoding draft models."],"tests":[{"inputs":{},"expect":{"weights":140000000000,"kv":85899345920,"cards":3}},{"inputs":{"params_b":8,"layers":32,"context":8192,"batch":1},"expect":{"weights":16000000000,"kv":1073741824,"cards":1}}]}
```

Then check throughput and latency separately, and price it against an API. See [back-of-the-envelope estimation](#back-of-envelope).

## Numbers to know
> [!number]
> The short list to memorize: 4 characters per token; 2 bytes per parameter at 16-bit; 2N FLOPs per token to run, 6N to train; about 20 tokens per parameter for compute-optimal training (Chinchilla, 2022); decode reads all weights once per step; KV cache per token = 2 × layers × KV heads × head dim × bytes.

## Pitfalls and anti-patterns
> [!pitfall] Memorizing prices and benchmark scores
> They change every few months. Memorize formulas and orders of magnitude; look up prices and scores with their dates.

- **Forgetting concurrency.** Per-request numbers times traffic is where estimates go wrong.
- **Using total parameters for MoE compute.** Use active parameters for FLOPs and total parameters for memory.
- **Treating peak FLOPs as achievable.** Real utilization is a fraction of peak.

## Talk like an expert
The vocabulary: **6ND**, **MFU** (model FLOP utilization), **arithmetic intensity**, **memory-bound** and **compute-bound**, **tokens per parameter**, **bytes per parameter**, **TTFT** and **TPOT**. Experts do estimates out loud and state their assumptions. The live debate is not about the formulas but the inputs: how much test-time compute, how long contexts get, and how fast prices fall.

> [!hottake] If you cannot estimate a system’s cost in five minutes, you do not understand it yet.
> **The counterargument:** agent workloads are long-tailed and bursty, and real costs are dominated by retries, long sessions and tool latency that no clean formula captures. Estimates start the conversation; measurement finishes it.

## Check yourself
```quiz
numbers-to-know
```

## Go deeper
- Kaplan et al., “Scaling Laws for Neural Language Models” (2020), for 6ND.
- Hoffmann et al., “Training Compute-Optimal Large Language Models” (2022), the Chinchilla paper.
- Your GPU vendor’s data sheets for memory bandwidth and dense FLOPs at each precision.

## Related
- [Back-of-the-envelope estimation](#back-of-envelope)
- [Memory math](#memory-math)
- [The KV cache](#kv-cache)
- [Scaling laws and compute](#scaling-laws)
- [Cost engineering](#cost-engineering)
- [Inference fundamentals](#inference-fundamentals)
- [Acronym decoder](#acronym-decoder)
- [Cheat sheets](#commandments-guide)
- [Compute accounting: FLOP, GPU-hours and utilization](#compute-accounting)
