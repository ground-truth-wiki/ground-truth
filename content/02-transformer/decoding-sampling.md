---
id: decoding-sampling
book: 2
order: "2.8"
title: Decoding and sampling
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [sampling, temperature, decoding]
visuals:
  - sampling-explorer:explorer
  - temperature-compare:compare
---
> [!tldr]
> At each step a model outputs a probability for every token; decoding chooses one. Greedy decoding picks the most likely; sampling draws from the distribution, shaped by temperature, top-k, top-p and min-p. Choose low randomness for extraction and code, more for creative work, and use constraints when output must follow a format.

## Why it matters
The same model can be precise or creative, repetitive or varied, depending on decoding settings. Wrong settings cause problems that look like model failures: inconsistent extractions, bland writing, loops, or invalid JSON. Decoding is also where structured outputs and speculative decoding plug in.

## Intuition
The model offers a ranked menu of next words with odds. Greedy decoding always orders the favorite. Temperature changes how strongly the odds are believed; top-p and top-k cross unlikely items off the menu before choosing.

```viz
{"id":"sampling-explorer","component":"explorer","model":"sampling","title":"Temperature reshapes the distribution; top-k, top-p and min-p cut its tail","caption":"A toy distribution over ten candidate tokens. Hatched bars are candidates removed by a truncation rule; the remaining probability is renormalized.","alt":"Bar chart of next-token probabilities under adjustable temperature, top-k, top-p and min-p.","data":"illustrative","try":"Raise the temperature to 1.5, then set min-p to 0.1 and watch the nonsense candidates disappear."}
```

## How it works
**Logits to probabilities.** The model produces a score (logit) for every token; softmax turns them into probabilities. Temperature divides logits before softmax: below 1 sharpens the distribution toward the top choice, above 1 flattens it.

**Truncation.** Top-k keeps the k most likely tokens; top-p (nucleus sampling, Holtzman et al., 2019) keeps the smallest set whose probabilities sum to p; min-p keeps tokens with at least a fraction of the top token’s probability. All reduce the chance of sampling nonsense from the long tail.

**Greedy and beam search.** Greedy decoding takes the top token each step; beam search keeps several candidate sequences. Both suit short, constrained outputs; for open-ended text they tend to be repetitive.

**Penalties.** Repetition, frequency and presence penalties discourage repeated tokens; use them sparingly, since they can distort legitimate repetition such as code identifiers.

**Constraints and speedups.** Grammar-constrained decoding masks tokens that would break a schema. See [structured outputs](#structured-outputs). Speculative decoding speeds generation without changing the distribution. See [speculative decoding](#speculative-decoding).

**Reasoning models.** Many reasoning models recommend specific sampling settings or fix them; follow the provider’s guidance.

```viz
{"id":"temperature-compare","component":"compare","title":"Low temperature for consistency, higher temperature for variety","caption":"Illustrative outputs from the same model for two tasks. Hover the marks.","alt":"Comparison of low-temperature and high-temperature outputs for an extraction task and a naming task.","data":"illustrative","mono":false,"a":{"title":"Temperature 0","text":"Extract the invoice total: 1,520.00 EUR (same answer on every run).\nName a coffee shop: The Daily Grind. (same name on every run)","mono":false},"b":{"title":"Temperature 1, top-p 0.95","text":"Extract the invoice total: 1,520.00 EUR, or occasionally 1,500.00 EUR.\nName a coffee shop: Ember & Oak, Slow Pour, Third Wave Corner, Little Bean Lab.","mono":false},"links":[{"a":"(same answer on every run)","b":"or occasionally 1,500.00 EUR.","note":"Randomness in extraction turns into inconsistent data."},{"a":"The Daily Grind. (same name on every run)","b":"Ember & Oak, Slow Pour, Third Wave Corner, Little Bean Lab.","note":"Variety is the point for brainstorming."}]}
```

## In practice
- **Extraction, classification, code:** temperature 0 to 0.3, and structured outputs where possible.
- **Chat and writing:** moderate temperature with top-p around 0.9 to 0.95.
- **Brainstorming:** higher temperature, several samples, then select.
- **Evaluation:** fix settings and seeds where supported, and still run several attempts. See [statistics for evals](#eval-statistics).

## Numbers to know
> [!number]
> Rules of thumb. Temperature 0 is near-deterministic but not guaranteed identical across runs on most APIs. Top-p of 0.9 to 0.95 is a common default for open-ended text.

## Pitfalls and anti-patterns
> [!pitfall] High temperature for structured tasks
> Random variation in extracted numbers or JSON fields becomes data errors downstream.

- **Stacking every penalty.** Distorts output in hard-to-debug ways.
- **Assuming temperature 0 means reproducible.** Batching and hardware differences still cause variation.

## Talk like an expert
The vocabulary: **logits**, **softmax**, **temperature**, **top-k**, **top-p** or **nucleus sampling**, **min-p**, **greedy**, **beam search**, **repetition penalty**. Experts set decoding per task and document it with the prompt version. The live debate is how decoding should work for reasoning models, where exploration during thinking and precision in the answer pull in opposite directions.

> [!hottake] Most production tasks should run at temperature zero.
> **The counterargument:** many user-facing tasks benefit from variety, and some reasoning setups rely on sampling diverse paths; deterministic decoding can also get stuck in repetitive loops.

## Check yourself
```quiz
decoding-sampling
```

## Go deeper
- Holtzman et al., “The Curious Case of Neural Text Degeneration” (2019).
- Your provider’s documentation for recommended sampling settings per model.

## Related
- [Structured outputs](#structured-outputs)
- [Speculative decoding](#speculative-decoding)
- [Probability and information theory](#probability-information)
- [Reasoning prompts](#reasoning-prompts)
- [The transformer block](#transformer-block)
- [Distributions, estimation and sampling](#distributions-and-estimation)
- [The transformer end to end](#transformer-overview)
- [Structured generation engines](#structured-generation-engines)
- [Hallucination and factuality](#hallucination-factuality)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Nondeterminism and reproducible inference](#inference-nondeterminism)
