---
id: ai-for-mathematics
book: 19
order: "19.7.1"
title: AI for mathematics and formal theorem proving
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [mathematics, theorem-proving, lean, autoformalization, verification]
visuals: []
prerequisites: [ai-for-science, rlvr-reasoning]
---
> [!tldr]
> Mathematics is the cleanest verifiable domain for AI: a proof assistant either accepts a formal proof or rejects it, so it can serve both as a reward for reinforcement learning and as a guard against plausible nonsense. In one year, AI went from silver-medal level at the 2024 International Mathematical Olympiad (IMO), with human-formalized problems and up to three days of compute, to gold-medal level in 2025 with natural-language proofs written within the time limit. The one thing to remember: the checker is the asset, so build it first.

## Key ideas

- **Formal mathematics turns proofs into code a machine can check.** Informal mathematics is written for human readers; formal mathematics is written in a proof assistant such as Lean 4, Isabelle or Coq, whose kernel checks every step. Mathlib is a collaboratively developed library of formalized mathematics in Lean, with dependently typed foundations and an extensive hierarchy of structures (The mathlib Community, [“The Lean mathematical library”](https://arxiv.org/abs/1910.09336) (2019)). A checker that cannot be argued with is exactly what [RL with verifiable rewards](#rlvr-reasoning) needs: AlphaProof works in Lean, where proofs can be verified, and learned by proving or disproving millions of problems ([Google DeepMind, July 2024](https://deepmind.google/discover/blog/ai-solves-imo-problems-at-silver-medal-level/)).
- **Autoformalization is the bottleneck.** Wu et al. define autoformalization as automatically translating natural-language mathematics into formal specifications and proofs; in their study, language models translated 25.3% of competition problems perfectly into Isabelle/HOL, and training a prover on the autoformalized theorems raised its miniF2F proof rate from 29.6% to 35.2% (Wu et al., [“Autoformalization with Large Language Models”](https://arxiv.org/abs/2205.12615) (2022)). Even at the 2024 IMO, human experts translated the problems into Lean by hand before AlphaProof could start ([Google DeepMind, July 2024](https://deepmind.google/discover/blog/ai-solves-imo-problems-at-silver-medal-level/)).
- **Neural provers and their benchmarks.** DeepSeek-Prover-V2, a 671-billion-parameter Lean 4 prover, uses DeepSeek-V3 to split hard problems into subgoals, turns the solved subgoals into chain-of-thought training data, and then refines with reinforcement learning; it reports an 88.9% pass ratio on miniF2F-test and solves 49 of 658 PutnamBench problems (Ren et al., [“DeepSeek-Prover-V2: Advancing Formal Mathematical Reasoning via Reinforcement Learning for Subgoal Decomposition”](https://arxiv.org/abs/2504.21801) (2025)). PutnamBench itself holds 1,692 hand-built formalizations of 640 theorems from the Putnam competition, in Lean 4 and Isabelle, with a substantial subset also in Coq (Tsoukalas et al., [“PutnamBench: Evaluating Neural Theorem-Provers on the Putnam Mathematical Competition”](https://arxiv.org/abs/2407.11214) (2024)).
- **The IMO arc, 2024 to 2025.** At IMO 2024, AlphaProof and AlphaGeometry 2 solved 4 of 6 problems for 28 of 42 points, silver-medal level, solving one problem within minutes and taking up to three days on others; AlphaGeometry 2 is neuro-symbolic, pairing a Gemini-based language model with a symbolic engine, and the AlphaProof method was published in Nature in November 2025 ([Google DeepMind, July 2024](https://deepmind.google/discover/blog/ai-solves-imo-problems-at-silver-medal-level/)); its authors later reported that AlphaGeometry 2 solves 84% of IMO geometry problems from the past 25 years, up from 54% for the first AlphaGeometry (Chervonyi et al., [“Gold-medalist Performance in Solving Olympiad Geometry with AlphaGeometry2”](https://arxiv.org/abs/2502.03544) (2025)). At IMO 2025, an advanced Gemini Deep Think scored 35 of 42, gold-medal level, working end to end in natural language within the 4.5-hour limit, graded by IMO coordinators ([Google DeepMind, July 2025](https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/)). As of November 2026, this page covers results through 2025; check the [state-of-the-art snapshot](#sota-snapshot) for later claims.
- **Research-level benchmarks are built against contamination.** FrontierMath uses hundreds of new, unpublished problems written and vetted by expert mathematicians, with automatically checkable answers to limit data contamination; a typical problem takes a researcher hours, and state-of-the-art models solved under 2% at launch in November 2024 (Glazer et al., [“FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI”](https://arxiv.org/abs/2411.04872) (2024)). See [benchmark literacy](#benchmark-literacy) for why unpublished test sets matter.
- **Construction search for working mathematicians, and the engineering lesson.** Georgiev, Gómez-Serrano, Tao and Wagner applied the evolutionary coding agent AlphaEvolve to 67 problems in analysis, combinatorics, geometry and number theory: it matched the best known constructions in most cases, improved on them in several, and was combined with Deep Think and AlphaProof for proofs (Georgiev et al., [“Mathematical exploration and discovery at scale”](https://arxiv.org/abs/2511.02864) (2025)); see [evolutionary program search](#evolutionary-program-search). Most results on this page rest on a strong evaluator (a proof kernel, an automatically checked answer or a scoring function), and that is the transferable lesson: write the checker first, and treat a formal specification as the test suite.

## Planned visuals

- **`diagram`:** the formal loop: an informal problem, autoformalization into a Lean statement, a human or model check that the statement says the same thing, a prover proposing proof steps, the Lean kernel accepting or rejecting them, and the result flowing back as a reward ([RL with verifiable rewards](#rlvr-reasoning)).
- **`compare`:** IMO 2024 against IMO 2025: formal language against natural language, human translation against none, up to three days against 4.5 hours, 28 against 35 points, each cell sourced.
- **`timeline`:** dated milestones: autoformalization (2022), PutnamBench (July 2024), IMO silver (July 2024), FrontierMath (November 2024), AlphaGeometry 2 (February 2025), DeepSeek-Prover-V2 (April 2025), IMO gold (July 2025), AlphaEvolve on 67 problems and the AlphaProof Nature paper (November 2025).

## Talk like an expert

The vocabulary: **formal and informal proof**, **proof assistant**, **kernel**, **Mathlib**, **autoformalization**, **neural theorem prover**, **miniF2F**, **PutnamBench** and **contamination**. Experts ask of every claim: who formalized the statement and does it match the original problem, how much compute and time did it use, and who or what checked the answer?

## Go deeper

- Wu et al., [“Autoformalization with Large Language Models”](https://arxiv.org/abs/2205.12615) (2022).
- Ren et al., [“DeepSeek-Prover-V2: Advancing Formal Mathematical Reasoning via Reinforcement Learning for Subgoal Decomposition”](https://arxiv.org/abs/2504.21801) (2025).
- Glazer et al., [“FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI”](https://arxiv.org/abs/2411.04872) (2024).
- Georgiev et al., [“Mathematical exploration and discovery at scale”](https://arxiv.org/abs/2511.02864) (2025).

## Related

- [AI for science, math and code](#ai-for-science)
- [Evolutionary program search with LLMs](#evolutionary-program-search)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [Test-time search, sampling and verification](#test-time-search)
- [Benchmark literacy](#benchmark-literacy)
