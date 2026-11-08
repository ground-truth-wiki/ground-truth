---
id: serving-engines
book: 15
order: "15.8"
title: Serving engines
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [vllm, sglang, llama-cpp, serving]
visuals:
  - serving-matrix:matrix
  - engine-chooser:tree
---
> [!tldr]
> Serving engines turn model weights into a fast, batched, OpenAI-compatible endpoint. vLLM and SGLang dominate open-source GPU serving, TensorRT-LLM squeezes the most from NVIDIA hardware, llama.cpp and MLX run models locally, and orchestration layers such as NVIDIA Dynamo and llm-d coordinate fleets. Choose by hardware, model support, features and operations, then benchmark on your traffic.

## Why it matters
The same model on the same GPU can differ several times in throughput and latency depending on the engine and its settings. Engines also decide which models and quantization formats you can run, whether prefix caching, speculative decoding and structured outputs work, and how much operational effort serving takes.

## Intuition
A serving engine is the kitchen around a recipe. The recipe (the weights) is the same everywhere; how many dishes leave the kitchen per hour depends on its layout, its staff and how cleverly orders are batched.

```viz
{"id":"serving-matrix","component":"matrix","matrix":"serving-engines","title":"Serving engines by target, strengths and typical use","caption":"Sortable and filterable. Qualitative and dated as of November 2026; engines add features monthly.","alt":"Table comparing LLM serving engines by target hardware, strengths and typical use.","data":"illustrative","depicts":"As of November 2026"}
```

## How it works
**What an engine does.** Loads weights in the right format, manages the [KV cache](#kv-cache) in pages, runs continuous batching and scheduling, executes optimized kernels for attention and matrix multiplication, and exposes an API, almost always OpenAI-compatible. See [batching and scheduling](#batching-scheduling).

**The main open-source GPU engines.**
- **vLLM** popularized PagedAttention; broad model and hardware support, prefix caching, speculative decoding, structured outputs, multi-LoRA serving and disaggregated prefill.
- **SGLang** introduced RadixAttention prefix caching and a fast runtime for structured generation and agent workloads; strong on large mixture-of-experts models.
- **TensorRT-LLM** compiles models into optimized engines for NVIDIA GPUs, with FP8 and FP4 support; often fastest on NVIDIA hardware, at the cost of a build step.
- **LMDeploy** is another mature option; check its current maintenance status. Hugging Face’s **Text Generation Inference** is in maintenance mode as of November 2026, and Hugging Face now recommends vLLM, SGLang, llama.cpp or MLX instead.

**Local engines.** llama.cpp runs GGUF-quantized models on CPUs, Apple Silicon and consumer GPUs; Ollama and LM Studio wrap it in friendly tools; Apple’s MLX runs models efficiently on Macs. See [edge and on-device AI](#edge-on-device).

**Orchestration.** NVIDIA Dynamo, llm-d and Kubernetes operators route requests with cache awareness, autoscale, and coordinate disaggregated prefill and decode. See [disaggregated serving](#disaggregated-serving).

**Managed options.** Inference providers serve open models through APIs; cloud platforms host them in your account; both trade control for operations you do not have to run. See [model APIs](#model-apis).

## In practice
```viz
{"id":"engine-chooser","component":"tree","title":"Hardware and scale narrow the choice to one or two engines","caption":"Expand your situation, then benchmark the finalists on your model, prompts and traffic.","alt":"Decision tree for choosing a serving engine by hardware, scale and workload.","data":"illustrative","open":1,"root":{"label":"Where and how will you serve?","children":[
{"label":"NVIDIA GPUs, general workloads","children":[{"label":"vLLM or SGLang; try both with your model and traffic"}]},
{"label":"NVIDIA GPUs, maximum throughput, stable model","children":[{"label":"TensorRT-LLM, accepting the build step"}]},
{"label":"Large MoE models or agent workloads with shared prefixes","children":[{"label":"SGLang or vLLM with prefix caching and expert parallelism","link":"#mixture-of-experts"}]},
{"label":"AMD GPUs","children":[{"label":"vLLM or SGLang builds for ROCm; check model support"}]},
{"label":"Laptops, desktops and edge","children":[{"label":"llama.cpp, Ollama or MLX","link":"#edge-on-device"}]},
{"label":"Multi-node fleet","children":[{"label":"An orchestration layer such as Dynamo or llm-d over vLLM, SGLang or TensorRT-LLM"}]},
{"label":"No GPU operations team","children":[{"label":"A managed inference provider or cloud model platform","link":"#model-apis"}]}]}}
```

A typical vLLM launch:

```bash
vllm serve meta-llama/Llama-3.1-8B-Instruct \
  --max-model-len 16384 \
  --gpu-memory-utilization 0.9 \
  --enable-prefix-caching
# Serves an OpenAI-compatible API on port 8000.
```

Benchmark properly:
1. Use your model, your quantization and a sample of real prompts and output lengths.
2. Measure TTFT, TPOT and throughput at p50 and p95 across a range of concurrency. See [latency and throughput](#latency-throughput).
3. Tune the main knobs: maximum sequences, maximum batched tokens, chunked prefill, prefix caching, speculative decoding.
4. Re-run after engine upgrades; performance changes between releases.

## Numbers to know
> [!number]
> Rules of thumb. Engine choice and tuning can change throughput on the same hardware by a large factor. Default settings are rarely optimal for your traffic; plan a day of benchmarking per model and hardware combination.

## Pitfalls and anti-patterns
> [!pitfall] Benchmarking with synthetic, uniform prompts
> Real traffic has long tails in prompt and output length; uniform benchmarks overstate throughput and hide latency spikes.

- **Unpinned engine versions.** Upgrades change defaults and performance.
- **Ignoring model support.** New architectures arrive in engines at different speeds.
- **Running at 100% memory utilization.** Leave headroom for spikes and fragmentation.

## Talk like an expert
The vocabulary: **vLLM**, **SGLang**, **TensorRT-LLM**, **llama.cpp**, **OpenAI-compatible endpoint**, **max-num-seqs**, **max-num-batched-tokens**, **prefix caching**, **multi-LoRA serving**, **orchestration layer**. Experts compare engines on their own traffic at stated concurrency, and pin versions. The live debate is consolidation: whether open engines converge on similar features, leaving kernels and orchestration as the differentiators.

> [!hottake] For most teams, the engine matters less than the settings.
> **The counterargument:** for specific models, hardware or workloads, such as huge MoE models or structured generation, one engine can be dramatically faster, and picking it is the biggest win available.

## Check yourself
```quiz
serving-engines
```

## Go deeper
- The vLLM, SGLang, TensorRT-LLM and llama.cpp documentation and benchmark guides.
- NVIDIA Dynamo and llm-d documentation for fleet-level serving.

## Related
- [Batching and scheduling](#batching-scheduling)
- [Quantization](#quantization)
- [Disaggregated serving](#disaggregated-serving)
- [Hardware](#hardware)
- [Edge and on-device AI](#edge-on-device)
