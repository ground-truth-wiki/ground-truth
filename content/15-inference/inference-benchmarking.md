---
id: inference-benchmarking
book: 15
order: "15.2.1"
title: Benchmarking inference servers
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [benchmarking, load-testing, mlperf, goodput, inference]
visuals: []
prerequisites: [latency-throughput, inference-fundamentals]
---
> [!tldr]
> An inference benchmark sends a controlled load to a model server and records how long each request waits and how many tokens the server produces. The load pattern, the prompt and output lengths, the cache state and the tool's metric definitions all change the result, so two honest benchmarks of the same server can disagree. Remember that a number means nothing without its load, its workload and its definitions: report a curve across load levels, not a single figure.

## Key ideas

- **Closed loop or open loop.** A fixed concurrency is a closed loop, where each simulated user sends its next request only after the last one finishes; a request rate is an open loop, where requests arrive on a schedule (in `vllm bench serve`, a Poisson process by default, or gamma-distributed arrivals whose burstiness you set) and the number of outstanding requests can grow without bound once the rate exceeds what the server can handle ([NVIDIA, “LLM Inference Benchmarking: Fundamental Concepts”](https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts) (2025); [vLLM benchmark CLI](https://docs.vllm.ai/en/latest/benchmarking/cli.html)). Open and closed systems behave very differently (Schroeder et al., [“Open Versus Closed: A Cautionary Tale”](https://www.usenix.org/conference/nsdi-06/open-versus-closed-cautionary-tale) (2006)), and Little's law (requests in flight = arrival rate × latency) links the two views, which Kong et al. use to infer the effective batch size from a request rate ([“An Interpretable Latency Model for Speculative Decoding in LLM Serving”](https://arxiv.org/abs/2605.15051) (2026)).
- **The same run, different numbers.** In `vllm bench serve`, TTFT runs from sending a request to its first streamed output, ITL is the gap between consecutive streamed outputs, and TPOT is computed once per request as (end-to-end latency − TTFT) ÷ (output tokens − 1), then aggregated across requests ([vLLM benchmark CLI](https://docs.vllm.ai/en/latest/benchmarking/cli.html)). Other tools differ on whether the first token counts toward ITL and which time span divides total tokens for throughput ([NVIDIA](https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts)), and a single-process Python client can queue requests itself and inflate TTFT and TPOT at high rates (Chandrasekar and Kramberger, [“Identifying and Mitigating Systemic Measurement Bias in Production LLM Inference Benchmarks”](https://arxiv.org/abs/2605.24217) (2026)).
- **Workloads you can trust.** Use realistic input and output lengths (synthetic, sampled from datasets such as ShareGPT, or replayed traces), fix output length with `ignore_eos`, pin seeds, and drop warmup and cooldown requests ([NVIDIA](https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts); [vLLM benchmark CLI](https://docs.vllm.ai/en/latest/benchmarking/cli.html)). As of November 2026, GuideLLM (which the vLLM docs recommend for production servers) sets prompt and output lengths and excludes warmup and cooldown periods ([GuideLLM](https://github.com/vllm-project/guidellm)), and NVIDIA AIPerf, the designated successor to GenAI-Perf, pins seeds, forces fixed output lengths with `ignore_eos` and replays traces ([NVIDIA, “Benchmarking LLM Inference at Scale with AIPerf”](https://developer.nvidia.com/blog/benchmarking-llm-inference-at-scale-with-aiperf/) (2026)). Repeating a run against the same server can reuse prompts left in the prefix cache and inflate throughput, so vary the seed, restart the server, or use `vllm bench sweep serve`, which resets caches between runs ([vLLM benchmark CLI](https://docs.vllm.ai/en/latest/benchmarking/cli.html)).
- **Sweep, then read the curve.** A sweep across concurrency levels shows how throughput per chip trades against tokens per second per user, and the same runs give cost per million tokens and energy per token (see [energy and power](#ai-energy)). As of November 2026, InferenceX (formerly InferenceMAX, by SemiAnalysis) publishes these curves for many chips and engines at 1k/1k, 1k/8k and 8k/1k input and output lengths, defines interactivity as roughly 1 ÷ ITL, reports joules per token, and reruns when a configuration changes, such as a new software release, a driver update or an added model ([InferenceX, About](https://inferencex.semianalysis.com/about)).
- **MLPerf scenarios.** MLPerf Inference defines scenarios by how its load generator sends queries: Single stream and Multistream send the next query when the previous one completes, Offline sends all samples at once, and Server (with its stricter Interactive variant for LLMs) sends Poisson arrivals and reports the highest rate that meets a tail-latency bound ([MLPerf Inference rules](https://github.com/mlcommons/inference_policies/blob/master/inference_rules.adoc)). For LLMs that bound is a TTFT and TPOT limit per model; as of November 2026, DeepSeek-r1 must meet 2,000 ms and 80 ms in Server and 1,500 ms and 15 ms in Interactive ([MLPerf Inference rules](https://github.com/mlcommons/inference_policies/blob/master/inference_rules.adoc)).
- **Hosted APIs and vendor claims.** Hosted-API benchmarks define their metrics differently again: as of November 2026, Artificial Analysis counts reasoning tokens in output speed, stops TTFT at the first reasoning token and reports a separate time to first answer token, runs every 6 hours, and averages run medians over the past 5 days ([Artificial Analysis methodology](https://artificialanalysis.ai/methodology/performance-benchmarking)). Read any vendor claim for what a benchmark must state (load pattern, lengths, metric definitions, engine version and hardware), which InferenceX makes checkable by linking each data point to the public GitHub Actions run that produced it ([InferenceX, About](https://inferencex.semianalysis.com/about)).

## Planned visuals

- **`chart`:** throughput per GPU against tokens per second per user from one concurrency sweep, with a latency SLO line that separates goodput from wasted throughput; real data only, from a cited run with its date.
- **`compare`:** the same server under closed-loop concurrency and open-loop Poisson load as offered load passes capacity: latency rises but stays bounded in the closed loop, while the queue grows without limit in the open loop.
- **`calculator`:** Little's law plus cost per million output tokens, from arrival rate, latency, GPU price per hour and measured throughput per GPU, with tests.

## Talk like an expert

Experts talk about closed-loop and open-loop load, Poisson and bursty arrivals, concurrency sweeps, TTFT, ITL and TPOT at p50 and p99, goodput under an SLO, and the throughput-versus-interactivity curve. They never quote a number without its load, its input and output lengths, its engine version and its metric definitions.

## Go deeper

- [vLLM benchmark CLI](https://docs.vllm.ai/en/latest/benchmarking/cli.html), the reference for `vllm bench serve`, its arrival models and its metric definitions.
- MLCommons, [MLPerf Inference rules](https://github.com/mlcommons/inference_policies/blob/master/inference_rules.adoc), with the scenarios and the per-model latency limits.
- Schroeder et al., [“Open Versus Closed: A Cautionary Tale”](https://www.usenix.org/conference/nsdi-06/open-versus-closed-cautionary-tale) (2006).
- NVIDIA, [“LLM Inference Benchmarking: Fundamental Concepts”](https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts) (2025).

## Related

- [Latency and throughput](#latency-throughput)
- [Serving engines](#serving-engines)
- [Hardware](#hardware)
- [Cost engineering](#cost-engineering)
- [Energy, power and AI data centers](#ai-energy)
- [Back-of-the-envelope estimation](#back-of-envelope)
