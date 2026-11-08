---
id: information-theory-for-llms
book: 1
order: "1.2.2"
title: Information theory for language models
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [information-theory, entropy, kl-divergence, perplexity, compression]
visuals: []
prerequisites: [probability-information]
---
> [!tldr]
> Information theory measures surprise. A language model's training loss is a cross-entropy, the average surprise of the true next token, which equals the entropy of the data plus the KL divergence from the data to the model; perplexity and bits per byte report the same loss in other units, per token or per byte. The one thing to remember: predicting well and compressing well are the same thing, and a per-token score only compares models that share a tokenizer.

## Key ideas

- **Surprisal and entropy.** The self-information −log p(x) measures how surprising an outcome is, entropy is its expected value and is largest for a uniform distribution, and conditional entropy H(Y | X) = H(X, Y) − H(X) is what remains unknown about Y once X is known ([*Dive into Deep Learning*, section 22.11](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/information-theory.html)). During decoding, the entropy of the next-token distribution says how uncertain the model is at that step, and locally typical sampling keeps tokens whose surprisal is close to that entropy ([Meister et al., “Locally Typical Sampling” (2022)](https://arxiv.org/abs/2202.00666)).
- **Cross-entropy and KL divergence.** Cross-entropy splits as CE(P, Q) = H(P) + KL(P ‖ Q); since H(P) is fixed by the data, minimizing cross-entropy, minimizing KL divergence and maximizing likelihood are the same goal. KL divergence is never negative, is zero only when P = Q, is not symmetric, and is infinite wherever q(x) = 0 but p(x) > 0 ([*Dive into Deep Learning*, section 22.11](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/information-theory.html)).
- **Forward versus reverse KL.** Forward KL from the data to the model is maximum likelihood and pushes a student to cover all of the teacher's distribution (mean-seeking), which can put mass on unlikely tokens; reverse KL is mode-seeking and favors the teacher's high-probability tokens at the cost of diversity, and the generalized Jensen-Shannon divergence interpolates between the two while staying bounded ([Agarwal et al., “On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes” (2023)](https://arxiv.org/abs/2306.13649)). The same paper notes that RLHF typically uses reverse KL to keep the policy close to its starting point; see [preference optimization](#preference-optimization) and [distillation for LLMs](#llm-distillation) ([Agarwal et al. (2023)](https://arxiv.org/abs/2306.13649)).
- **Mutual information and InfoNCE.** Mutual information is the average of pointwise mutual information, log p(x, y) ÷ (p(x) p(y)), and is symmetric, non-negative and zero exactly when the variables are independent ([*Dive into Deep Learning*, section 22.11](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/information-theory.html)). The contrastive InfoNCE loss with N candidates gives the lower bound I ≥ log N − L_N, which tightens as N grows, so minimizing it maximizes a bound on mutual information ([van den Oord et al., “Representation Learning with Contrastive Predictive Coding” (2018)](https://arxiv.org/abs/1807.03748)).
- **Units, perplexity and bits per byte.** Perplexity is the exponential of the average negative log-likelihood per token, so it depends on the tokenizer, and long documents should be scored with a sliding window: for GPT-2 large on WikiText-2, a stride of 512 instead of disjoint 1,024-token chunks lowers perplexity from 19.44 to 16.44 ([Hugging Face, “Perplexity of fixed-length models”](https://huggingface.co/docs/transformers/perplexity)). Bits per byte divides the total negative log-likelihood in nats by ln 2 and by the number of bytes, giving a tokenizer-agnostic score; lm-eval reports it along with word- and byte-level perplexity ([Biderman et al., “Lessons from the Trenches on Reproducible Evaluation of Language Models” (2024)](https://arxiv.org/abs/2405.14782)).
- **Prediction is compression.** By Shannon's source coding theorem, the expected length of an optimal code equals the negative log₂-likelihood under the model, and arithmetic coding is optimal in code length, so minimizing log-loss is minimizing the compression rate of the model used as a lossless compressor. Delétang et al. report that Chinchilla 70B, trained mainly on text, compresses ImageNet patches to 43.4% and LibriSpeech audio to 16.4% of their raw size, better than PNG and FLAC ([Delétang et al., “Language Modeling Is Compression” (2023)](https://arxiv.org/abs/2309.10668)).

## Planned visuals

- **`calculator`: loss units.** Input a loss in nats per token and the average number of bytes per token; outputs bits per token, perplexity and bits per byte, with tests such as a loss of ln 2 nats giving 1 bit and a perplexity of 2.
- **`compare`: forward versus reverse KL.** The same single-peaked model fitted to a two-peaked target both ways: forward KL spreads out to cover both peaks, reverse KL locks onto one.
- **`stepper`: arithmetic coding.** Each step encodes one token by narrowing an interval in proportion to the model's probability for it, and the running code length equals the sum of −log₂ p over the tokens so far.

## Talk like an expert

Experts quote losses in nats per token or bits per byte, say "forward" or "reverse" KL and expect you to know which one is mode-seeking, and refuse to compare per-token perplexities across tokenizers. "Language modeling is compression" is the standard framing for why a lower loss means a better model.

## Go deeper

- [*Dive into Deep Learning*, section 22.11, Information theory](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/information-theory.html).
- Delétang et al., [“Language Modeling Is Compression”](https://arxiv.org/abs/2309.10668) (2023).
- Agarwal et al., [“On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes”](https://arxiv.org/abs/2306.13649) (2023).
- Biderman et al., [“Lessons from the Trenches on Reproducible Evaluation of Language Models”](https://arxiv.org/abs/2405.14782) (2024).

## Related

- [Probability, statistics and information theory](#probability-information)
- [Loss functions](#loss-functions)
- [Distillation for LLMs: soft labels, on-policy and multi-teacher](#llm-distillation)
- [What a language model is: from n-grams to neural networks](#language-modeling)
- [Representation learning and embeddings](#representation-learning)
- [Evaluating models during pretraining](#base-model-evaluation)
