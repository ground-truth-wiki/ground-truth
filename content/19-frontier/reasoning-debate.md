---
id: reasoning-debate
book: 19
order: "19.8.2"
title: "Do language models reason? The evidence on both sides"
level: frontier
stability: moving
reviewed: "2026-11"
status: seed
tags: [reasoning, generalization, memorization, debates, evaluation]
visuals: []
prerequisites: [reasoning-models, benchmark-literacy]
---
> [!tldr]
> "Do language models reason?" becomes useful once it is asked in testable terms: does performance survive new numbers, unfamiliar rules, reversed facts and harder instances of the same problem? The evidence points both ways: accuracy drops on perturbed and counterfactual variants, yet interpretability finds internal world models and multi-step computation. The one thing to remember: test reasoning on perturbed and held-out versions of your own tasks, not on a familiar benchmark.

## Key ideas

- **What the question means in testable terms.** A testable version asks about three properties: generalization to tasks unlike the training data, systematic use of the same rule in new combinations, and faithfulness, meaning the written steps are what actually produced the answer. Chollet defines intelligence as skill-acquisition efficiency and proposed the ARC benchmark to measure fluid intelligence, built on priors designed to be as close as possible to innate human priors, and Chen et al. found that reasoning models used hints planted in a prompt but mentioned them in their chains of thought often less than 20% of the time (see [reasoning models](#reasoning-models)) ([Chollet, “On the Measure of Intelligence” (2019)](https://arxiv.org/abs/1911.01547); [Chen et al., “Reasoning Models Don't Always Say What They Think” (2025)](https://arxiv.org/abs/2505.05410)).
- **Evidence of brittleness.** GSM-Symbolic turns grade-school math problems into templates: accuracy falls for all tested models when only the numbers change, and one added clause that seems relevant but plays no part in the solution cuts accuracy by up to 65%. Wu et al. report substantial, consistent drops on counterfactual variants of 11 tasks, and the reversal curse shows models trained on "A is B" failing to answer "B is A", with GPT-4 correctly answering questions like “Who is Tom Cruise's mother?” 79% of the time but the reverse only 33% ([Mirzadeh et al., “GSM-Symbolic” (2024)](https://arxiv.org/abs/2410.05229); [Wu et al., “Reasoning or Reciting?” (2023)](https://arxiv.org/abs/2307.02477); [Berglund et al., “The Reversal Curse” (2023)](https://arxiv.org/abs/2309.12288)).
- **Accuracy collapse on scaled puzzles, and the rebuttal.** On puzzles of controllable size, Shojaee et al. found three regimes (standard models ahead on easy instances, reasoning models ahead on medium ones, both collapsing on hard ones) and reasoning effort that rises with complexity up to a point, then declines despite remaining token budget. Lawsen replies that long Tower of Hanoi move lists can exceed output-token limits, River Crossing instances with N greater than 5 are mathematically impossible, and that, in preliminary experiments, asking for a function that generates the moves gave high accuracy on Tower of Hanoi instances first scored as failures; planning-specific evidence is covered in [Can LLMs plan?](#llm-planning-debate) ([Shojaee et al., “The Illusion of Thinking” (2025)](https://arxiv.org/abs/2506.06941); [Lawsen, “Comment on The Illusion of Thinking” (2025)](https://arxiv.org/abs/2506.09250)).
- **Stochastic parrots or internal structure.** Bender et al. described a language model as "haphazardly stitching together sequences of linguistic forms" seen in training: "a stochastic parrot". Critics of that framing point to interpretability results: a GPT-style model trained only on Othello moves builds a board representation that interventions can edit to change its predictions, and attribution graphs show Claude 3.5 Haiku answering "the capital of the state containing Dallas" through an intermediate Texas step, plus planning rhyme words before writing a line (see [mechanistic interpretability](#mech-interp)) ([Bender et al., “On the Dangers of Stochastic Parrots” (2021)](https://doi.org/10.1145/3442188.3445922); [Li et al., “Emergent World Representations” (2023)](https://arxiv.org/abs/2210.13382); [Lindsey et al., “On the Biology of a Large Language Model” (2025)](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)).
- **Does RL teach reasoning or elicit it?** Yue et al. found that models trained with [RL on verifiable rewards](#rlvr-reasoning) beat their base models at pass@k for small k, but base models reach higher pass@k at large k, which suggests RL mostly sharpens what the base model could already sample. ProRL counters that prolonged RL with KL control, reference-policy resets and diverse tasks beats its base model across pass@k, including on tasks where the base model fails regardless of the number of attempts ([Yue et al., “Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?” (2025)](https://arxiv.org/abs/2504.13837); [Liu et al., “ProRL” (2025)](https://arxiv.org/abs/2505.24864)).
- **Fluid-intelligence benchmarks and test-time training.** In ARC Prize 2024 the best score on the private ARC-AGI set rose from 33% to 55.5%, driven by deep-learning-guided program synthesis and test-time training, which updates a model's weights on each task's examples; Akyürek et al. reached 53.0% on the public validation set with an 8B model this way. ARC Prize 2025 moved to the harder ARC-AGI-2, where the top competition score was 24%, and its report names per-task refinement loops, including ones in weight space, as the theme of the year ([Chollet et al., “ARC Prize 2024: Technical Report” (2024)](https://arxiv.org/abs/2412.04604); [Akyürek et al., “The Surprising Effectiveness of Test-Time Training for Few-Shot Learning” (2024)](https://arxiv.org/abs/2411.07279); [Chollet et al., “ARC Prize 2025: Technical Report” (2026)](https://arxiv.org/abs/2601.10904)).

## Planned visuals

- **`compare`:** one grade-school math problem next to its GSM-Symbolic-style variants (new names and numbers, then one irrelevant clause added), with links marking what changed and what a model that pattern-matches gets wrong.
- **`chart`** (real data): pass@k against k for a base model and its RLVR-trained version, crossing at large k, from Yue et al. (2025).
- **`tree`:** the evidence on each side (brittleness, collapse, reversal; world models, multi-hop circuits, RL gains), each with its strongest rebuttal and a link to the chapter that covers it.

## Talk like an expert

Experts avoid the yes-or-no question and talk about **distribution shift**, **counterfactual variants**, **systematic generalization**, **pass@k at large k** and **chain-of-thought faithfulness**. Before accepting any claim, they ask which perturbations it survived and whether the grader could tell a reasoning failure from a formatting or token-limit failure.

## Go deeper

- [Mirzadeh et al., “GSM-Symbolic: Understanding the Limitations of Mathematical Reasoning in Large Language Models” (2024)](https://arxiv.org/abs/2410.05229): templated perturbations of math problems.
- [Wu et al., “Reasoning or Reciting? Exploring the Capabilities and Limitations of Language Models Through Counterfactual Tasks” (2023)](https://arxiv.org/abs/2307.02477): the counterfactual-task method, NAACL 2024.
- [Shojaee et al., “The Illusion of Thinking” (2025)](https://arxiv.org/abs/2506.06941) with [Lawsen's comment (2025)](https://arxiv.org/abs/2506.09250): the collapse result and its rebuttal, read together.
- [Yue et al., “Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?” (2025)](https://arxiv.org/abs/2504.13837): the pass@k evidence on RL elicitation.

## Related

- [Open problems and big debates](#open-problems)
- [Reasoning models and test-time compute](#reasoning-models)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [Mechanistic interpretability](#mech-interp)
- [Benchmark literacy](#benchmark-literacy)
- [Test-time search, sampling and verification](#test-time-search)
