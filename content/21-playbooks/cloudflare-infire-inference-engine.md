---
id: cloudflare-infire-inference-engine
book: 21
order: "21.31"
title: "Cloudflare's Infire: an in-house inference engine in Rust for edge GPUs"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [inference, serving-engines, kv-cache, gpu-kernels, public-record]
visuals: []
type: playbook
account: public-record
industry: "Cloud and network services (Cloudflare's Workers AI inference platform)"
use_case: "Building Infire, an inference engine written in Rust, for serving models on the edge GPUs of Workers AI, where Cloudflare had run vLLM under gvisor"
outcome: "Synthetic benchmark: Infire 40.91 requests/s at 25% CPU load, vLLM 0.10.0 38.38 at 140%, vLLM under gvisor 37.13 at 250%; the post reports Infire up to 7% faster than vLLM 0.10.0 on unloaded machines"
measured_how: "Synthetic benchmark on one edge node with an H100 NVL GPU, ShareGPT v3 dataset, 4,000 prompts at a concurrency of 200; benchmark model and period not stated (Cloudflare Blog, August 2025)"
prerequisites: [serving-engines, batching-scheduling]
replications: []
---
> [!tldr]
> Cloudflare wrote Infire, an inference engine in Rust, because vLLM, which it ran under gvisor on its edge nodes, did not let it fully use its edge GPUs. As of August 2025, Infire served Llama 3.1 8B on Workers AI, and vLLM still served several models in the catalog. In a synthetic benchmark on one H100 NVL node, Infire slightly surpassed vLLM's performance at 25% CPU load, against 140% for vLLM on bare metal and 250% for vLLM under gvisor.

> [!note] From the public record
> Built from Cloudflare's own published account, "How we built the most efficient inference engine for Cloudflare’s network" (August 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post sees "a mismatch between Cloudflare’s globally-distributed network and a typical centralized AI deployment". As models grew, the team "couldn’t just throw money at the scaling problems by buying more GPUs" and needed to use idle capacity and place each model flexibly.

Most models ran on vLLM, which "didn’t allow us to fully utilize the GPUs at the edge". The post says vLLM "is best optimized for large data centers" and works well as a dedicated server for one model. It calls vLLM "much less optimized for dynamic workloads, distributed networks, and for the unique security constraints" of running inference next to other services.

## Why this approach

The post gives three reasons for writing an engine instead of staying on vLLM:

- **Control.** Cloudflare writes much of its new infrastructure in Rust, and vLLM is written in Python. In the post's view, layers of Python abstraction leave "a lot of CPU performance on the table".
- **Different priorities.** vLLM "does not support co-hosting multiple models on the same GPU without using Multi-Instance GPU (MIG)", and Cloudflare wants to schedule several models on one GPU. An in-house research team also explores features the post calls hard to upstream.
- **Security.** Cloudflare "can’t trust a 3rd party Python process to run on our edge nodes" without strong sandboxing, so it ran vLLM under gvisor (see [Sandboxes and execution environments](#sandboxes)). That layer added overhead and slowed startup and teardown. "Under full load on our edge nodes, vLLM running via gvisor consumes as much as 2.5 CPU cores", competing with other services and lowering GPU utilization.

The post compares only against vLLM and does not say whether other engines were considered. See [Serving engines](#serving-engines) for the wider field.

## The approach

Infire has three parts: an OpenAI compatible HTTP server, a batcher and the engine itself.

1. **Startup.** An auto-scaling service places a model on a node. The weights come from R2 object storage and are cached on the node. Infire copies them to the GPU with page-locked memory and asynchronous CUDA copies, and compiles its kernels just in time while the weights load.
2. **Server.** Built on the hyper crate, with HuggingFace's tokenizers crate for tokenization.
3. **Batcher.** It runs continuous batching with chunked prefill and manages a paged KV cache. The post explains why: with Llama 3's 128K-token context window, allocating the full cache for each prompt in advance would leave memory for only 4 prompts in parallel on H100 GPUs. See [The KV cache](#kv-cache) and [Batching and scheduling](#batching-scheduling).
4. **Kernels.** Written for Nvidia Hopper GPUs, partly with low-level PTX instructions, and compiled for each model's parameters. Infire uses cuBLASlt for large matrix multiplications when it judges that faster, and builds a CUDA graph for each batch size on demand. See [GPU kernels and ML compilers](#gpu-kernels-compilers).

The post says Cloudflare can run Infire "as a trusted bare-metal process".

## The stack

As of August 2025: Infire in Rust, with hyper, HuggingFace's tokenizers crate, CUDA, PTX, cuBLASlt and CUDA graphs, on Nvidia Hopper GPUs (an H100 NVL in the benchmark). Weights are stored in R2. Infire served Llama 3.1 8B on Workers AI as `@cf/meta/llama-3.1-8b-instruct`. vLLM was still in use for "several of the models in our Workers AI catalog".

## Results, and how they were measured

"We ran synthetic benchmarks on one of our edge nodes with an H100 NVL GPU." The test used the ShareGPT v3 dataset, 4,000 prompts and a concurrency of 200. It compared Infire, vLLM on bare metal, and vLLM under gvisor, "which is the way we currently run in production". To simulate competition with other traffic, vLLM under gvisor also ran with only one CPU.

| Setup (as the post names it) | requests/s | tokens/s | CPU load |
| --- | --- | --- | --- |
| Infire | 40.91 | 17224.21 | 25% |
| vLLM 0.10.0 | 38.38 | 16164.41 | 140% |
| vLLM under gvisor | 37.13 | 15637.32 | 250% |
| vLLM under gvisor with CPU constraints | 22.04 | 9279.25 | 100% |

- **Speed.** "Infire completes inference tasks up to 7% faster than vLLM 0.10.0 on unloaded machines equipped with an H100 NVL GPU". Under load the post states only: "On infrastructure under real load, it performs significantly better."
- **CPU.** The team matched vLLM "at a significantly lower CPU usage, in large part because we can run Infire as a trusted bare-metal process".
- **GPU utilization.** "we see GPU utilization upward of 80%, reducing our operational costs".
- **Startup.** "The startup time of Infire when loading the Llama-3-8B-Instruct model from disk is just under 4 seconds."

**Not measured:** the post does not name the model used in the benchmark, gives no latency figures, has no Infire row under the one-CPU constraint, and gives no number for performance under real load. The 80% GPU utilization has no baseline, period or method, the cost reduction has no figure, there is no vLLM startup time to compare, and output quality is not compared between engines.

## What failed

- **The previous setup.** Besides the problems above, vLLM under gvisor fell to 22.04 requests/s in the benchmark when limited to one CPU.
- **Missing optimizations.** "we’re integrating Flash Attention 3, and most of our kernels don’t utilize kernel fusion". The post lists Flash Attention 3 among the features vLLM's V1 engine already has.
- **A first iteration.** Multi-GPU support for larger models, quantization and "true multi-tenancy" are planned for the next version. Co-hosting models on one GPU was a reason to leave vLLM, and the post does not say whether this version does it.

The post reports no incidents or rollout problems.

## What the team would do differently

The post states no lessons about what it would change. Its next steps are the planned items listed above.

The wiki's reading: against vLLM on bare metal, the speed gain the post reports is "up to 7%". The larger differences are in CPU load and against vLLM under gvisor, so much of the case rests on a security rule that put a sandbox around a third-party engine. A synthetic benchmark on one node is a narrow test; see [Benchmarking inference servers](#inference-benchmarking). Owning an engine also means building features an open engine already ships, as the Flash Attention 3 item shows.

## Disclosure

None.

## Sources

- Vlad Krasnov and Mari Galicer, Cloudflare, [“How we built the most efficient inference engine for Cloudflare’s network”](https://blog.cloudflare.com/cloudflares-most-efficient-ai-inference-engine/), Cloudflare Blog, 27 August 2025.

## Related

- [About playbooks](#about-playbooks)
- [Serving engines](#serving-engines)
- [Benchmarking inference servers](#inference-benchmarking)
- [GPU kernels and ML compilers](#gpu-kernels-compilers)
- [Batching and scheduling](#batching-scheduling)
