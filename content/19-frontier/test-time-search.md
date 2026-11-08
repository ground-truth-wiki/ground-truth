---
id: test-time-search
book: 19
order: "19.2.1"
title: Test-time search, sampling and verification
level: frontier
stability: moving
reviewed: "2026-11"
status: seed
tags: [test-time-compute, best-of-n, verifiers, search, reward-models]
visuals: []
prerequisites: [test-time-scaling, reasoning-models]
---
> [!tldr]
> Test-time search spends extra inference compute on a single question: sample many candidate answers, revise them, or search over reasoning steps, then pick one with a vote, a verifier or a reward model. On math problems where a small model already has some success, search at the same compute can beat a much larger model. The one thing to remember: as samples grow, the chance that some answer is correct keeps rising, but picking it is the hard part, so the verifier sets the ceiling.

## Key ideas

- **Four ways to spend the compute.** A survey of the field sorts test-time scaling into parallel (many outputs, then aggregate), sequential (each step refines the previous one), hybrid (explore broadly, then pursue the best lines deeper) and internal (the model is trained to decide how long to think) (Zhang et al., [“A Survey on Test-Time Scaling in Large Language Models: What, How, Where, and How Well?”](https://arxiv.org/abs/2503.24235) (2025)). Products expose this too: Google DeepMind describes Gemini Deep Think as a reasoning mode whose parallel thinking explores and combines several candidate solutions, and an advanced version scored 35 of 42 points at the 2025 International Mathematical Olympiad within the 4.5-hour limit ([Google DeepMind, July 2025](https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/)).
- **Coverage is not accuracy.** Coverage (pass@k, the share of problems that any of k samples solves) grew with the number of samples over four orders of magnitude, often log-linearly, and on SWE-bench Lite one model went from 15.9% with one sample to 56% with 250; yet without automatic verifiers, majority voting and reward models plateaued beyond several hundred samples (Brown et al., [“Large Language Monkeys: Scaling Inference Compute with Repeated Sampling”](https://arxiv.org/abs/2407.21787) (2024)). The gap between what the sampler finds and what the selector picks is where most of the engineering happens.
- **Selectors range from votes to trained verifiers.** Self-consistency samples several chains of thought and keeps the answer most of them agree on (Wang et al., [“Self-Consistency Improves Chain of Thought Reasoning in Language Models”](https://arxiv.org/abs/2203.11171) (2022)); best-of-n instead scores each candidate with a reward model, and generative verifiers, trained with next-token prediction so they can reason in a chain of thought before they score, outperformed discriminative verifiers and LLM-as-a-judge for best-of-N selection (Zhang et al., [“Generative Verifiers: Reward Modeling as Next-Token Prediction”](https://arxiv.org/abs/2408.15240) (2024)).
- **Verifiers can guide search step by step.** A process reward model (PRM) scores each reasoning step rather than only the final answer; process supervision beat outcome supervision on MATH and came with PRM800K, a dataset of 800,000 step-level human labels (Lightman et al., [“Let's Verify Step by Step”](https://arxiv.org/abs/2305.20050) (2023)). Search can make up for model size: Llemma-7B with the authors' tree search algorithm outperformed Llemma-34B across all tested inference strategies on MATH (Wu et al., [“Inference Scaling Laws: An Empirical Analysis of Compute-Optimal Inference for Problem-Solving with Language Models”](https://arxiv.org/abs/2408.00724) (2024)), and LATS brings Monte Carlo tree search to language agents (Zhou et al., [“Language Agent Tree Search Unifies Reasoning Acting and Planning in Language Models”](https://arxiv.org/abs/2310.04406) (2023)).
- **The best strategy depends on difficulty.** How well searching against PRMs or revising answers sequentially works depends on how hard the prompt is, and allocating compute per prompt by difficulty was more than 4x more efficient than best-of-N; at matched FLOPs, test-time compute beat a 14x larger model on problems where the small model already had some success (Snell et al., [“Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters”](https://arxiv.org/abs/2408.03314) (2024)). Sequential budgets can also be forced: s1 ends thinking early or extends it by appending "Wait" when the model tries to stop (Muennighoff et al., [“s1: Simple test-time scaling”](https://arxiv.org/abs/2501.19393) (2025)); the training side is in [training reasoning models](#reasoning-training-recipes).
- **Learned verifiers get gamed at large n.** Optimizing too hard against a proxy reward model, by reinforcement learning or by best-of-n sampling, can lower the true score as the proxy keeps rising (Gao et al., [“Scaling Laws for Reward Model Overoptimization”](https://arxiv.org/abs/2210.10760) (2022)). So the more candidates a learned verifier sees, the more chances it has to pick one that fools it; in domains with automatic checks, such as code and formal proofs, extra coverage turns directly into accuracy ([Brown et al., 2024](https://arxiv.org/abs/2407.21787)).

## Planned visuals

- `explorer` (the `passk` model): per-sample success rate and number of samples as sliders, showing coverage (pass@k) rising while majority-vote and verifier-selected accuracy level off below it.
- `stepper`: PRM-guided beam search on one math problem, frame by frame: sample next steps, score each with the PRM, keep the top beams, expand, and stop at a final answer.
- `chart`: an illustrative accuracy-versus-compute curve on log axes for a small model with search and a larger model with greedy decoding, with the chosen operating point marked, labeled as illustrative.

## Talk like an expert

Experts separate coverage (pass@k) from selection accuracy, name the selector (majority vote, outcome reward model, PRM, generative verifier or real checker), and quote accuracy at a matched compute budget rather than per sample. Before trusting a best-of-n gain, they ask how the verifier was validated and whether the gain holds as n grows.

## Go deeper

- Snell et al., [“Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters”](https://arxiv.org/abs/2408.03314) (2024).
- Brown et al., [“Large Language Monkeys: Scaling Inference Compute with Repeated Sampling”](https://arxiv.org/abs/2407.21787) (2024).
- Lightman et al., [“Let's Verify Step by Step”](https://arxiv.org/abs/2305.20050) (2023).
- Zhang et al., [“A Survey on Test-Time Scaling in Large Language Models: What, How, Where, and How Well?”](https://arxiv.org/abs/2503.24235) (2025).

## Related

- [Reasoning and test-time scaling](#test-time-scaling)
- [Reasoning models and test-time compute](#reasoning-models)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [LLM-as-judge done right](#llm-as-judge)
- [Planning and reasoning strategies](#planning-reasoning)
- [Cost engineering](#cost-engineering)
