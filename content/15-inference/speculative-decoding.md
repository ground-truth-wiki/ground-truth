---
id: speculative-decoding
book: 15
order: "15.5"
title: Speculative decoding
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [speculative-decoding, eagle, medusa]
visuals:
  - spec-acceptance:explorer
  - spec-step:stepper
---
> [!tldr]
> Speculative decoding has a fast drafter propose several tokens and the target model verify them all in one pass, keeping those it agrees with. Output quality is unchanged; speed depends on how often drafts are accepted. Draft models, extra decoding heads (Medusa, EAGLE) and n-gram lookups are the main drafters.

## Why it matters
Decode is memory-bound: each step reads all the weights to produce one token, leaving compute idle. Verifying several drafted tokens in one pass uses that idle compute, so a good drafter can produce two to three tokens per target pass with no change to the output distribution. It is one of the few speedups that is free in quality.

## Intuition
A junior writer drafts the next few words of a sentence; a senior editor reads them all at once and keeps the ones they would have written, fixing the first one they would not. When the junior knows the senior’s style, most words survive and the work goes much faster.

```viz
{"id":"spec-acceptance","component":"explorer","model":"spec","title":"Speedup rises with acceptance rate, and each acceptance rate has a best draft length","caption":"Expected tokens per target pass = (1 − αᵏ⁺¹) ÷ (1 − α), assuming each drafted token is accepted independently with probability α. Speedup divides that by the cost of one target pass plus k draft passes. Idealized; real systems also pay verification and scheduling overheads.","alt":"Explorer showing expected tokens per target pass and speedup for draft lengths 1 to 8, given an acceptance rate and relative draft cost.","data":"formula","try":"At α = 0.8 and draft cost 0.05, find the best k; then lower α to 0.5 and watch the best k shrink."}
```

## How it works
**The algorithm** (Leviathan et al., 2023; Chen et al., 2023). The drafter proposes k tokens. The target model runs once over the context plus all k drafts, producing its own probabilities at every position. Drafted tokens are accepted left to right with a rule that guarantees the final output follows the target model’s distribution exactly; at the first rejection, a corrected token is sampled from the target and the rest are discarded. Even when every draft is rejected, the pass still yields one token.

```viz
{"id":"spec-step","component":"stepper","title":"One target pass verifies four drafted tokens, keeps three and corrects the fourth","caption":"Illustrative step. The target model’s single pass produces four tokens of output instead of one.","alt":"Stepper showing a drafter proposing four tokens, the target verifying them, accepting three, rejecting the fourth and sampling a correction.","data":"illustrative","frames":[
{"label":"Context","caption":"The output so far.","tokens":["The","KV","cache","grows"]},
{"label":"Draft","caption":"The small drafter quickly proposes four tokens.","tokens":["The","KV","cache","grows","linearly","with","the","prompt"]},
{"label":"Verify","caption":"The target model runs once over all four drafts and checks each against its own probabilities.","code":"linearly  accept\nwith      accept\nthe       accept\nprompt    reject (target prefers: context)"},
{"label":"Keep","caption":"Three drafts are kept; the rejected one is replaced by a token sampled from the target. Four tokens from one target pass.","tokens":["The","KV","cache","grows","linearly","with","the","context"]}]}
```

**Drafters.**
- **A small draft model** from the same family, sharing the tokenizer. Simple and effective when a good small sibling exists.
- **Extra heads on the target model**: Medusa (Cai et al., 2024) adds parallel decoding heads; EAGLE (Li et al., 2024) and its successors predict from the target’s hidden features and reach high acceptance rates.
- **N-gram and prompt lookup**: copy likely continuations from the prompt itself. Very cheap, and strong for code editing, retrieval answers and summaries that quote their inputs.
- **Self-speculation**: skip some of the target’s own layers to draft.

**When it helps.** Low-batch, latency-sensitive serving, where decode leaves compute idle. At large batch sizes the GPU is already busier, and the extra verification work cuts into the gain; engines often adapt or disable speculation under load.

## In practice
- **Measure acceptance rate** on your real traffic: predictable outputs (code, structured data, quoting) accept more.
- **Tune k** to the acceptance rate; longer drafts waste work when acceptance is low.
- **Try prompt lookup first** for retrieval and editing workloads; it needs no extra model.
- **Check under load**: verify that speculation still helps at production batch sizes.
- **Use the engine’s support** (vLLM, SGLang and TensorRT-LLM all implement several methods) rather than building your own.

## Numbers to know
> [!number]
> Formulas. Expected tokens per target pass = (1 − αᵏ⁺¹) ÷ (1 − α). At α = 0.8 and k = 4 that is about 3.4 tokens per pass. Real end-to-end speedups of about 2 to 3 times at low batch sizes are commonly reported.

## Pitfalls and anti-patterns
> [!pitfall] Benchmarking at batch size 1 and deploying at batch size 64
> Speculation shines when compute is idle. At high load the benefit can shrink or vanish.

- **Mismatched tokenizers.** Draft and target must share a vocabulary, or tokens must be translated.
- **Long drafts with low acceptance.** Wasted work slows things down.
- **Assuming lossy behavior.** Correct implementations do not change the output distribution; if quality changes, check the implementation.

## Talk like an expert
The vocabulary: **draft model**, **target model**, **acceptance rate**, **draft length**, **verification**, **Medusa**, **EAGLE**, **prompt lookup decoding**, **self-speculation**, **lossless**. Experts quote acceptance rates on their own traffic and speedups at a stated batch size. The live debate is how speculation interacts with reasoning models’ long outputs and with batching at scale.

> [!hottake] Prompt-lookup decoding is the most underused free speedup for RAG and code editing.
> **The counterargument:** it helps only when outputs copy their inputs; for creative or reasoning-heavy outputs acceptance is low and a trained drafter is needed.

## Check yourself
```quiz
speculative-decoding
```

## Go deeper
- Leviathan, Kalman and Matias, “Fast Inference from Transformers via Speculative Decoding” (2023); Chen et al., “Accelerating Large Language Model Decoding with Speculative Sampling” (2023).
- Cai et al., “Medusa” (2024); Li et al., “EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty” (2024).

## Related
- [Inference fundamentals](#inference-fundamentals)
- [Decoding and sampling](#decoding-sampling)
- [Latency and throughput](#latency-throughput)
- [Serving engines](#serving-engines)
- [Batching and scheduling](#batching-scheduling)
