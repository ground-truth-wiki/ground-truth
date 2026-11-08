---
id: evolutionary-program-search
book: 19
order: "19.4.1"
title: Evolutionary program search with LLMs
level: frontier
stability: moving
reviewed: "2026-11"
status: seed
tags: [evolutionary-search, algorithm-discovery, quality-diversity, evaluators, automated-research]
visuals: []
prerequisites: [self-improving-systems]
---
> [!tldr]
> Evolutionary program search uses a language model as the mutation step of an evolutionary algorithm: the model proposes changes to programs, an automatic evaluator scores them, and the best and most varied programs are kept and shown to the model in the next round. FunSearch and AlphaEvolve used this loop to find new mathematical constructions and heuristics, and in May 2025 Google reported running one AlphaEvolve heuristic in production in its data centers. Remember that the loop optimizes exactly what the evaluator measures, so the evaluator is the real product.

## Key ideas

- **Search for programs, not answers.** FunSearch pairs a pretrained LLM with a systematic evaluator in an evolutionary loop and "searches for programs that describe how to solve a problem, rather than what the solution is"; it found cap sets larger than the best known constructions and online bin-packing heuristics that beat widely used baselines (Romera-Paredes et al., [“Mathematical discoveries from program search with large language models”](https://pmc.ncbi.nlm.nih.gov/articles/PMC10794145) (2023)). Because the output is a program, researchers can read how a solution is built, not only what it is ([Google DeepMind, December 2023](https://deepmind.google/discover/blog/funsearch-making-new-discoveries-in-mathematical-sciences-using-large-language-models/)).
- **AlphaEvolve scales the loop to whole codebases.** Where FunSearch evolved a single function, AlphaEvolve evolves entire code files, uses a fast model (Gemini 2.0 Flash) for volume and a stronger one (Gemini 2.0 Pro) for occasional higher-quality proposals, and runs candidates through a cascade of tests of rising difficulty; it found a way to multiply 4x4 complex-valued matrices with 48 scalar multiplications, the first improvement over Strassen's 49 in that setting after 56 years (Novikov et al., [“AlphaEvolve: A coding agent for scientific and algorithmic discovery”](https://arxiv.org/abs/2506.13131) (2025)).
- **Results so far, with dates.** As announced in May 2025, an AlphaEvolve scheduling heuristic, then in production for over a year, recovers on average 0.7% of Google's worldwide compute resources, a better way to split a large matrix multiplication into subproblems sped up a Gemini kernel by 23% for a 1% cut in Gemini's training time, and on over 50 open math problems it matched the best known constructions in about 75% of cases and improved them in about 20% ([Google DeepMind, May 2025](https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)). These are the developer's own reports; treat them as a dated snapshot as of November 2026.
- **Diversity keeps the search from collapsing.** MAP-Elites keeps the best solution found in each cell of a grid of user-chosen features, which yields many different strong solutions instead of one (Mouret and Clune, [“Illuminating search spaces by mapping elites”](https://arxiv.org/abs/1504.04909) (2015)); FunSearch splits its programs database into islands, separate populations that evolve apart ([Romera-Paredes et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10794145)), and AlphaEvolve combines both ideas ([Novikov et al., 2025](https://arxiv.org/abs/2506.13131)). As of November 2026, OpenEvolve is an open-source implementation under the Apache-2.0 license with MAP-Elites, islands with migration and code regions marked for evolution ([OpenEvolve repository](https://github.com/algorithmicsuperintelligence/openevolve)).
- **Agents can evolve themselves.** The Darwin Gödel Machine keeps an archive of coding agents, samples one, has a foundation model write a modified version of its own code and validates each variant on coding benchmarks, raising SWE-bench from 20.0% to 50.0% at a cost of about USD 22,000 and two weeks for one SWE-bench run (Zhang et al., [“Darwin Godel Machine: Open-Ended Evolution of Self-Improving Agents”](https://arxiv.org/abs/2505.22954) (2025)). It swaps the original Gödel machine's requirement to prove that a self-rewrite is useful (Schmidhuber, [“Goedel Machines: Self-Referential Universal Problem Solvers Making Provably Optimal Self-Improvements”](https://arxiv.org/abs/cs/0309048) (2003)) for empirical tests, and its growing archive aims at open-endedness, a research goal defined through novelty and learnability to an observer (Hughes et al., [“Open-Endedness is Essential for Artificial Superhuman Intelligence”](https://arxiv.org/abs/2406.04268) (2024)).
- **The evaluator sets the scope and the risk.** AlphaEvolve's authors name its main limitation as handling only problems for which an automated evaluator can be devised ([Novikov et al., 2025](https://arxiv.org/abs/2506.13131)), and optimizing too hard against a proxy score can lower the true one (Gao et al., [“Scaling Laws for Reward Model Overoptimization”](https://arxiv.org/abs/2210.10760) (2022)). Good evaluators are cheap, fast and hard to game, and keep held-out checks the loop never sees; the same loop tunes prompts in [prompt optimization](#prompt-optimization).

## Planned visuals

- `diagram`: the loop: programs database (islands and a MAP-Elites grid), prompt builder, LLM ensemble proposing diffs, evaluation cascade, and the scores flowing back into the database, with each box linking to its chapter.
- `heatmap`: an illustrative MAP-Elites archive over two feature dimensions, each cell showing the best score found there, labeled as illustrative.
- `chart`: an illustrative run with the evaluator score rising every generation while a held-out score levels off and then drops, showing what overfitting to the evaluator looks like.

## Talk like an expert

Experts talk about the programs database, islands and migration, quality-diversity archives, evaluation cascades and sample efficiency (how many model calls and evaluations each improvement costs). Their first questions about any discovery are what the evaluator checked, whether the result holds on held-out inputs and who verified it.

## Go deeper

- Novikov et al., [“AlphaEvolve: A coding agent for scientific and algorithmic discovery”](https://arxiv.org/abs/2506.13131) (2025).
- Romera-Paredes et al., [“Mathematical discoveries from program search with large language models”](https://pmc.ncbi.nlm.nih.gov/articles/PMC10794145) (2023).
- Zhang et al., [“Darwin Godel Machine: Open-Ended Evolution of Self-Improving Agents”](https://arxiv.org/abs/2505.22954) (2025).
- Mouret and Clune, [“Illuminating search spaces by mapping elites”](https://arxiv.org/abs/1504.04909) (2015).

## Related

- [Self-improving and automated research systems](#self-improving-systems)
- [AI scientist agents and autonomous labs](#ai-scientist-agents)
- [AI for mathematics and formal theorem proving](#ai-for-mathematics)
- [Prompt optimization](#prompt-optimization)
- [Test-time search, sampling and verification](#test-time-search)
