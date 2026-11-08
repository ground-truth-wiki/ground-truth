---
id: inference-fundamentals
book: 15
order: "15.1"
title: Inference fundamentals
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [prefill, decode, roofline]
visuals:
  - prefill-decode:trace
  - roofline:explorer
---
> [!tldr]
> Generating text has two phases. Prefill processes the whole prompt in parallel and is limited by compute; decode produces one token at a time and is limited by how fast weights and KV cache can be read from memory. Almost every serving optimization targets one of the two.

## Why it matters
Time to first token, tokens per second, cost per request and maximum concurrency all follow from these two phases. Engineers who know which phase dominates their workload can choose the right fixes: caching and chunked prefill for long prompts, batching and quantization for long outputs, disaggregation when both matter. Without the model, serving tuning is guesswork.

## Intuition
Prefill is reading a whole letter at once: many words, processed together, keeping the arithmetic units busy. Decode is writing the reply one word at a time, re-reading the whole dictionary for every word. The dictionary is the model’s weights, and memory bandwidth is how fast you can flip through it.

```viz
{"id":"prefill-decode","component":"trace","title":"One request spends a fifth of a second on 2,000 prompt tokens, then two seconds producing 100 output tokens","caption":"An illustrative timeline for one request on a busy server. Click a span for details. Prefill is fast per token because it runs in parallel; decode is slow per token because each step depends on the last.","alt":"Span waterfall of a request with queueing, a short prefill phase and a long decode phase producing tokens one at a time.","data":"illustrative","spans":[
{"name":"request","start":0,"dur":2240,"depth":0,"kind":"model"},
{"name":"queue","start":0,"dur":40,"depth":1,"kind":"context","note":"Waiting for a batch slot."},
{"name":"prefill: 2,000 prompt tokens","start":40,"dur":180,"depth":1,"kind":"model","note":"All prompt tokens in parallel; compute-bound. Ends with the first output token: time to first token is 220 ms."},
{"name":"decode: tokens 1 to 50","start":220,"dur":1000,"depth":1,"kind":"tool","note":"About 20 ms per token; each step reads all weights and the KV cache. Memory-bound."},
{"name":"decode: tokens 51 to 100","start":1220,"dur":1000,"depth":1,"kind":"tool","note":"Slightly slower per token as the KV cache grows."},
{"name":"stream complete","start":2220,"dur":20,"depth":1,"kind":"data"}]}
```

## How it works
**Prefill.** The model runs all prompt tokens through every layer at once, filling the [KV cache](#kv-cache). The work is large matrix multiplications with high arithmetic intensity (many operations per byte read), so GPUs run near their compute peak. Prefill time grows roughly linearly with prompt length, plus a quadratic attention term for long prompts.

**Decode.** Each new token needs a full pass through the model, but only for one token per sequence. The GPU must read every weight (and the sequence’s KV cache) from memory to do a small amount of arithmetic, so speed is limited by memory bandwidth. This is why batching helps: one read of the weights serves every sequence in the batch.

**Arithmetic intensity and the roofline.** A kernel is memory-bound when its operations per byte fall below the hardware’s ridge point (peak FLOPs ÷ memory bandwidth) and compute-bound above it. For decode, intensity grows roughly with batch size; explore it:

```viz
{"id":"roofline","component":"explorer","model":"roofline","title":"Decode stays memory-bound until the batch is very large, and the KV cache runs out of memory first","caption":"An illustrative 8B-parameter model on one H100-class GPU (about 3.35 TB/s and 989 dense BF16 TFLOPS, 80 GB), with a grouped-query KV cache of 128 KiB per token. Approximate published specs; real kernels reach less than peak.","alt":"Explorer computing memory and compute time per decode step, per-user and total tokens per second, and whether the batch fits in memory, for chosen batch size, weight precision and context length.","data":"formula","try":"Raise the batch from 1 to 128 at 2K context: total throughput rises over 40 times while per-user speed falls to about a third. Then set the context to 32K."}
```

**Time to first token and time per output token.** TTFT ≈ queueing + prefill; time per output token (TPOT) ≈ one decode step. End-to-end latency ≈ TTFT + output tokens × TPOT. See [latency and throughput](#latency-throughput).

**What follows.** [Memory math](#memory-math) decides how many sequences fit; [batching](#batching-scheduling) decides how well the GPU is shared; [speculative decoding](#speculative-decoding) and [quantization](#quantization) speed up memory-bound decode; [disaggregation](#disaggregated-serving) separates the two phases onto different hardware.

## In practice
Diagnose a workload by its shape:
- **Long prompts, short answers** (classification, extraction, RAG with big contexts): prefill dominates. Use prompt caching, chunked prefill and shorter contexts.
- **Short prompts, long answers** (chat, code generation, reasoning): decode dominates. Use batching, quantization and speculative decoding.
- **Both** (agents with long histories and long outputs): consider prefix caching plus disaggregated serving.

## Numbers to know
> [!number]
> Formulas and rules of thumb. Minimum decode time per step ≈ bytes read ÷ memory bandwidth. For an 8B model in BF16 (16 GB) at about 3.35 TB/s, that is about 5 ms, so at most about 200 tokens per second for one sequence. Prefill runs at thousands of tokens per second on the same GPU.

## Pitfalls and anti-patterns
> [!pitfall] Judging speed by tokens per second alone
> A server can show high total throughput while each user waits. Report TTFT and per-user speed alongside throughput.

- **Ignoring prompt length.** Long contexts raise TTFT and KV memory even when outputs are short.
- **Assuming more FLOPs means faster decode.** Decode is bandwidth-bound; memory speed matters more.
- **Benchmarking with batch size 1.** Production servers batch; measure at realistic load.

## Talk like an expert
The vocabulary: **prefill**, **decode**, **TTFT**, **TPOT** or **inter-token latency**, **arithmetic intensity**, **roofline**, **memory-bound** and **compute-bound**, **KV cache**. Experts ask “is this workload prefill-heavy or decode-heavy?” before choosing an optimization. The live debate is hardware design: how much future accelerators should trade compute for memory bandwidth and capacity as decode-heavy reasoning workloads grow.

> [!hottake] For most LLM serving, memory bandwidth is the number that matters, not FLOPs.
> **The counterargument:** prefill-heavy workloads, such as long-context RAG and batch processing, are compute-bound, and large batches push decode toward compute limits too; both numbers matter, depending on the mix.

## Check yourself
```quiz
inference-fundamentals
```

## Go deeper
- Pope et al., “Efficiently Scaling Transformer Inference” (2022).
- Williams, Waterman and Patterson, “Roofline: An Insightful Visual Performance Model for Multicore Architectures” (2009).

## Related
- [The KV cache](#kv-cache)
- [Latency and throughput](#latency-throughput)
- [Memory math](#memory-math)
- [Batching and scheduling](#batching-scheduling)
- [Hardware](#hardware)
- [Benchmarking inference servers](#inference-benchmarking)
- [How GPUs and accelerators run neural networks](#accelerator-architecture)
