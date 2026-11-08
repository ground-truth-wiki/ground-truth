---
id: inference-nondeterminism
book: 2
order: "2.8.1"
title: Nondeterminism and reproducible inference
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [nondeterminism, reproducibility, batch-invariance, inference, evals]
visuals: []
prerequisites: [decoding-sampling]
---
> [!tldr]
> The same prompt at temperature 0 can return different text, mainly because GPU kernels add numbers in an order that depends on how many other requests share the batch, and floating-point addition is not associative. Engines can make every kernel batch-invariant at some cost in speed, and seeds make sampled outputs repeatable on top of that. Remember that reproducibility is a property of the whole serving stack, not of the temperature setting.

## Key ideas

- **Temperature 0 is not a guarantee.** Greedy decoding is deterministic in theory, but one tiny numeric difference that flips a near-tie between two tokens changes every token after it. In one experiment, 1,000 temperature-0 completions of the same prompt on Qwen3-235B-A22B-Instruct-2507 gave 80 different texts, identical for the first 102 tokens before they split (He, [“Defeating Nondeterminism in LLM Inference”](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/) (2025)).
- **The cause is batch variance, not only "concurrency plus floating point".** Floating-point addition is not associative (see [Floating-point formats and numerical precision](#floating-point-formats)), but the forward pass needs no atomic adds and is run-to-run deterministic for a fixed batch. Outputs change because kernels choose different reduction strategies for different batch sizes, and the batch size depends on server load, which no single user controls ([He](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)).
- **Which kernels must be batch-invariant.** RMSNorm, matrix multiplication and attention are the reductions that matter: matmul needs one kernel configuration for every shape (no split-K), and attention must split the KV sequence into chunks of a fixed size rather than a fixed number of chunks, and reduce the same way whether earlier tokens come from the cache, from chunked prefill or from the same pass ([He](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)). Mixture-of-experts models add one more batch effect: where tokens over an expert's capacity are dropped, the drop is decided over the whole batch, so other users' queries can change your output ([Hashimoto, CS336 lecture 4](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%204%20-%20MoEs.pdf) (2025); see [MoE routing and load balancing](#moe-routing)).
- **Deterministic modes exist and cost speed (as of November 2026).** vLLM's `VLLM_BATCH_INVARIANT=1` is in beta, verified on a listed set of models and supported on listed GPU platforms, and "may impact performance" ([vLLM docs: Batch invariance](https://docs.vllm.ai/en/latest/features/batch_invariance/)); vLLM promises reproducibility only on the same hardware and vLLM version ([vLLM docs: Reproducibility](https://docs.vllm.ai/en/latest/usage/reproducibility/)). SGLang's `--enable-deterministic-inference` combines batch-invariant kernels, a fixed split-KV size and per-request seeds that make sampling above temperature 0 repeatable, with an average slowdown of 34.35% in its FlashInfer and FlashAttention-3 tests (SGLang Team, [“Towards Deterministic Inference in SGLang and Reproducible RL Training”](https://lmsys.org/blog/2025-09-22-sglang-deterministic/) (2025)).
- **Consequences for evals, tests, caches and RL.** Changing batch size, GPU count or GPU type moved DeepSeek-R1-Distill-Qwen-7B's accuracy by up to 9% under greedy decoding in bfloat16 (Yuan et al., [“Understanding and Mitigating Numerical Sources of Nondeterminism in LLM Inference”](https://arxiv.org/abs/2506.09501) (2025)), so run evals several times and report the spread (see [Statistics for evals](#eval-statistics)); exact-match regression tests and cached "golden" outputs can fail with no code change for the same reason. In reinforcement learning, mismatched numerics between sampler and trainer make on-policy training silently off-policy, and with bitwise-identical numerics the measured KL divergence between them stayed flat at 0 ([He](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)).
- **Hosted APIs promise less.** Treat a hosted model as nondeterministic unless its provider documents otherwise. OpenAI's cookbook recipe (archived as of November 2026) calls its `seed` parameter a "best effort" to sample deterministically, pairs it with a `system_fingerprint` that identifies the backend configuration, and warns that responses can still differ when both match ([OpenAI Cookbook: How to make your completions outputs reproducible with the new seed parameter](https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter)).

## Planned visuals

- **`stepper`:** one request summed inside two batch sizes: different split-K or split-KV reduction orders, a last-bit difference in one logit, a flipped argmax at a near-tie, and two texts diverging from that token on.
- **`chart`:** real data from He (2025): unique completions out of 1,000 with default and with batch-invariant kernels, and run time for default, deterministic and optimized deterministic vLLM, with source and date.
- **`tree`:** what to turn on for each need: the same output across runs on one server, across load levels, across hardware and versions, or for sampled outputs (seeds), with the engine flag and its speed cost.

## Talk like an expert

Experts say batch invariance, reduction order, split-K and split-KV, run-to-run determinism versus batch-invariant determinism, and "true on-policy RL"; they treat temperature 0 as a sampling choice and reproducibility as a property of kernels, scheduling, hardware and software version.

## Go deeper

- He, [“Defeating Nondeterminism in LLM Inference”](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/), Thinking Machines Lab (2025).
- SGLang Team, [“Towards Deterministic Inference in SGLang and Reproducible RL Training”](https://lmsys.org/blog/2025-09-22-sglang-deterministic/), LMSYS blog (2025).
- [vLLM docs: Batch invariance](https://docs.vllm.ai/en/latest/features/batch_invariance/).
- Yuan et al., [“Understanding and Mitigating Numerical Sources of Nondeterminism in LLM Inference”](https://arxiv.org/abs/2506.09501) (2025).

## Related

- [Decoding and sampling](#decoding-sampling)
- [Floating-point formats and numerical precision](#floating-point-formats)
- [Statistics for evals](#eval-statistics)
- [Serving engines](#serving-engines)
- [Policy-gradient algorithms for LLMs: from REINFORCE to GRPO and beyond](#llm-policy-gradients)
- [MoE routing and load balancing](#moe-routing)
