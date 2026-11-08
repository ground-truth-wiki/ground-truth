---
id: latent-reasoning
book: 19
order: "19.5.1"
title: Latent reasoning and recurrent depth
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [latent-reasoning, recurrent-depth, reasoning, architectures, cot-monitoring]
visuals: []
prerequisites: [beyond-transformers, reasoning-models]
---
> [!tldr]
> Latent reasoning means a model does several steps of inference inside its hidden states instead of writing each step out as tokens. It promises more information per step, fewer generated tokens and room for reasoning that is hard to put into words, and it adds a new way to spend test-time compute: run a block of layers more times. The one thing to remember: a model that thinks in vectors gives up the readable trace that chain-of-thought monitoring depends on.

## Key ideas

- **What it is, and the case for it.** A 2025 survey defines latent reasoning as multi-step inference carried out entirely in the model's continuous hidden state, argues that written chain of thought limits a model's expressive bandwidth, and groups the methods into activation-based recurrence, hidden-state propagation, fine-tuning that compresses or internalizes written reasoning, and masked diffusion models (Zhu et al., [“A Survey on Latent Reasoning”](https://arxiv.org/abs/2507.06203) (2025)).
- **Continuous thought (Coconut).** Coconut feeds the model's last hidden state back as the next input embedding instead of decoding it into a word, and the authors report that one such "continuous thought" can hold several possible next steps at once, so the model can search breadth-first instead of committing to one path. It matched or beat chain of thought on the logic tasks ProntoQA and ProsQA with far fewer generated tokens, but stayed below it on GSM8k (34.1% against 42.9%, at about a third of the tokens) (Hao et al., [“Training Large Language Models to Reason in a Continuous Latent Space”](https://arxiv.org/abs/2412.06769) (2024)).
- **Recurrent depth: more loops instead of more tokens.** Geiping et al. iterate a recurrent block to arbitrary depth at inference, and their 3.5-billion-parameter proof of concept, trained on 800 billion tokens, improved on reasoning benchmarks up to a compute load equivalent to a 50-billion-parameter model (Geiping et al., [“Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach”](https://arxiv.org/abs/2502.05171) (2025)). On synthetic reasoning tasks, a block of k layers looped L times nearly matches a model with kL layers, and looped models can simulate T chain-of-thought steps with T loops (Saunshi et al., [“Reasoning with Latent Thoughts: On the Power of Looped Transformers”](https://arxiv.org/abs/2502.17416) (2025)); this is the same trade as [test-time scaling](#test-time-scaling), spent in depth.
- **Tiny recursive models on puzzles, and what they do not show.** The 7-million-parameter TRM, one two-layer network that repeatedly refines its own answer, reports 45% on ARC-AGI-1 and 8% on ARC-AGI-2, against 40.3% and 5.0% for the 27-million-parameter HRM. Both are trained on small datasets (about 1,000 examples) with heavy augmentation, and the paper is clear that they are supervised models rather than generative ones and can only give a single deterministic answer. They are puzzle solvers, not language models (Jolicoeur-Martineau, [“Less is More: Recursive Reasoning with Tiny Networks”](https://arxiv.org/abs/2510.04871) (2025)). When the ARC Prize team re-tested HRM on its semi-private set it scored 32% on ARC-AGI-1 and 2% on ARC-AGI-2 (the paper claimed 41% on the public set), and the outer refinement loop, not the hierarchical architecture, drove most of the gain ([ARC Prize, “The Hidden Drivers of HRM's Performance on ARC-AGI”](https://arcprize.org/blog/hrm-analysis), August 2025).
- **Other routes: internalized chains of thought and diffusion.** One method trains a model on explicit reasoning steps and then removes them gradually, so it learns to reason without writing them: GPT-2 Small reached up to 99% on 9-by-9 multiplication and Mistral 7B over 50% on GSM8K with no intermediate steps (Deng et al., [“From Explicit CoT to Implicit CoT: Learning to Internalize CoT Step by Step”](https://arxiv.org/abs/2405.14838) (2024)). Diffusion language models such as LLaDA 8B generate by unmasking many positions at once instead of left to right (Nie et al., [“Large Language Diffusion Models”](https://arxiv.org/abs/2502.09992) (2025)); see [beyond the transformer](#beyond-transformers).
- **Costs, and the safety trade-off.** Training is hard: Coconut needs a multi-stage curriculum built from written chains of thought and its sequential forward passes resist parallel training ([Hao et al.](https://arxiv.org/abs/2412.06769)), and the first recurrent-depth runs collapsed or learned to ignore the recurrent state before a final run trained stably ([Geiping et al.](https://arxiv.org/abs/2502.05171)). A position paper signed by 41 authors from across industry labs, safety organizations and universities calls chain-of-thought monitoring "a new and fragile opportunity" in its title and names latent reasoning models, which "might not need to verbalize any of their thoughts", as one threat to it (Korbak et al., [“Chain of Thought Monitorability: A New and Fragile Opportunity for AI Safety”](https://arxiv.org/abs/2507.11473) (2025)). Status as of November 2026: the results on this page come from research-scale models and narrow benchmarks, and whether latent reasoning pays off at frontier scale is open.

## Planned visuals

- **`compare`:** the same multi-step problem solved with written chain of thought and with continuous thoughts, linking each written step to the hidden-state loop that replaces it, with the token counts Coconut reports on ProsQA.
- **`stepper`:** recurrent depth unrolled for one token, after Geiping et al.: input layers, the recurrent block iterated r times, output layers, with a caption per step on what extra iterations buy and where a loop can exit early.
- **`tree`:** the families of latent reasoning, from the survey's grouping (recurrence, hidden-state propagation, internalized chains of thought, diffusion), each leaf linking to its paper and to [new architectures](#new-architectures) or [beyond the transformer](#beyond-transformers).

## Talk like an expert

The vocabulary: **latent reasoning**, **continuous thought**, **recurrent depth**, **looped transformer**, **effective depth**, **CoT internalization** and **monitorability**. Experts treat loop count as a third test-time compute axis next to longer chains and more samples, and ask two questions of every result: does it hold beyond puzzles and small models, and what does it cost oversight to lose the written trace?

## Go deeper

- Hao et al., [“Training Large Language Models to Reason in a Continuous Latent Space”](https://arxiv.org/abs/2412.06769) (2024).
- Geiping et al., [“Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach”](https://arxiv.org/abs/2502.05171) (2025).
- Zhu et al., [“A Survey on Latent Reasoning”](https://arxiv.org/abs/2507.06203) (2025).
- Korbak et al., [“Chain of Thought Monitorability: A New and Fragile Opportunity for AI Safety”](https://arxiv.org/abs/2507.11473) (2025).

## Related

- [New architectures and efficiency](#new-architectures)
- [Beyond the transformer](#beyond-transformers)
- [Reasoning and test-time scaling](#test-time-scaling)
- [Reasoning models and test-time compute](#reasoning-models)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [Alignment concepts](#alignment-concepts)
