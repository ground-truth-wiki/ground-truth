---
id: arenas-leaderboards
book: 4
order: "4.5.3"
title: Arenas and leaderboards
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [arenas, leaderboards, bradley-terry, human-preference, rankings]
visuals: []
prerequisites: [benchmark-literacy]
---
> [!tldr]
> An arena ranks models by asking many people which of two answers they prefer, then fitting a statistical model to the votes. It measures what users like on prompts they write themselves, which fixed benchmarks miss, but it also rewards length and style and can be distorted by how providers test and disclose. Read every rank with its confidence interval and methodology version, and use leaderboards to shortlist, never to decide.

## Key ideas

- **Pairwise votes on real prompts.** Chatbot Arena asks users to compare the answers of two anonymous models to a prompt they wrote and vote for the better one; its 2024 paper reported over 240,000 votes and found the crowd's votes in good agreement with expert raters ([Chiang et al., “Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference” (2024)](https://arxiv.org/abs/2403.04132)). The project started within LMSYS, ran as LMArena, and was renamed Arena in January 2026; as of November 2026 it publishes its leaderboards at arena.ai ([Arena, “Arena-Rank: Open Sourcing the Leaderboard Methodology” (2025)](https://arena.ai/blog/arena-rank); [Arena, “LMArena is now Arena” (2026)](https://arena.ai/blog/lmarena-is-now-arena/)).
- **Bradley-Terry scores come with intervals.** The Bradley-Terry model turns head-to-head results into one score per model, so that the gap between two scores predicts how often one beats the other; the arena first showed Elo-style scores, then switched to Bradley-Terry coefficients because they suit statistical estimation better, with confidence intervals from robust ("sandwich") standard errors ([Chiang et al. (2024)](https://arxiv.org/abs/2403.04132)). Its open-source ranking package, Arena-Rank (December 2025), computes the intervals in closed form instead of with the bootstrap; treat models whose intervals overlap as too close to call from the leaderboard alone ([Arena, “Arena-Rank: Open Sourcing the Leaderboard Methodology” (2025)](https://arena.ai/blog/arena-rank); [Statistics for evals](#eval-statistics)).
- **Style control separates substance from presentation.** LMSYS added answer length and counts of markdown headers, bold text and list items as extra terms in the Bradley-Terry regression, and found that length was the dominant style factor, with other markdown effects second order ([Li et al., “Does style matter? Disentangling style and substance in Chatbot Arena” (LMSYS blog, 2024)](https://lmsys.org/blog/2024-08-28-style-control)). As of November 2026, arena.ai also publishes separate leaderboards by category and modality, including text, WebDev, vision, document, search, text-to-image, image editing and video ([Arena leaderboard](https://arena.ai/leaderboard)).
- **Rankings can be distorted.** “The Leaderboard Illusion” reports undisclosed private testing (27 private variants tested by Meta before the Llama 4 release), scores biased by selective disclosure, and unequal data access: Google and OpenAI received an estimated 19.2% and 20.4% of all arena data, while 83 open-weight models together received an estimated 29.7% ([Singh et al., “The Leaderboard Illusion” (2025)](https://arxiv.org/abs/2504.20879)). The arena's operators replied that pre-release testing followed a policy public since March 2024, that any provider may submit multiple variants subject to capacity, and that the writeup's figures undercounted open models by leaving out open-weight families such as Llama and Gemma ([Arena, “Our Response to ‘The Leaderboard Illusion’ Writeup” (2025)](https://arena.ai/blog/our-response)).
- **LLM judges approximate arenas cheaply, with their own biases.** MT-Bench showed that strong judges such as GPT-4 agree with human preferences over 80% of the time, the same level at which humans agree with each other, and documented position, verbosity and self-enhancement biases ([Zheng et al., “Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena” (2023)](https://arxiv.org/abs/2306.05685)). Arena-Hard-Auto curates 500 hard prompts from crowdsourced data and reports 98.6% correlation with human preference rankings, and length-controlled AlpacaEval regresses out answer length, which raised its Spearman correlation with Chatbot Arena from 0.94 to 0.98 ([Li et al., “From Crowdsourced Data to High-Quality Benchmarks: Arena-Hard and BenchBuilder Pipeline” (2024)](https://arxiv.org/abs/2406.11939); [Dubois et al., “Length-Controlled AlpacaEval: A Simple Way to Debias Automatic Evaluators” (2024)](https://arxiv.org/abs/2404.04475)).
- **Composite indices change with their methodology.** Independent evaluators combine many benchmarks into one index, and the recipe moves: as of November 2026, the Artificial Analysis Intelligence Index is at version 5.0.1 and its version history lists 14 entries since January 2024; version 5.0 (October 2026) added three evaluations, removed four and rebalanced its four categories to 25% each, so compare scores only within one version ([Artificial Analysis, Intelligence Index methodology](https://artificialanalysis.ai/methodology/intelligence-benchmarking)). Use any leaderboard to build a shortlist, then decide on your own evals ([Choosing a model](#choosing-a-model)).

## Planned visuals

- **`explorer`:** a Bradley-Terry fit on a small illustrative set of battles, where adding votes narrows each model's confidence interval and shows when two ranks stop overlapping, built on the existing `ci` model or a new one.
- **`compare`:** one illustrative leaderboard before and after style control, with linked highlights on the models whose rank moves most.
- **`diagram`:** the evaluation landscape around arenas: human votes, LLM-judged proxies (MT-Bench, Arena-Hard-Auto, length-controlled AlpacaEval) and composite indices, each labeled with what it measures and its known biases.

## Talk like an expert

Practitioners talk about **pairwise preference**, **Bradley-Terry scores** (often still called Elo), **confidence intervals**, **style control**, **length bias**, **private testing** and **selective disclosure**. They read an arena rank as evidence about what users prefer in open-ended chat, not about accuracy on their task, and they check the interval and the methodology version before quoting a position.

## Go deeper

- [Chiang et al., “Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference” (2024)](https://arxiv.org/abs/2403.04132): the platform and its statistical method.
- [Singh et al., “The Leaderboard Illusion” (2025)](https://arxiv.org/abs/2504.20879), read together with [the arena's response](https://arena.ai/blog/our-response).
- [Zheng et al., “Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena” (2023)](https://arxiv.org/abs/2306.05685): MT-Bench and the biases of LLM judges.
- [Li et al., “Does style matter? Disentangling style and substance in Chatbot Arena” (LMSYS blog, 2024)](https://lmsys.org/blog/2024-08-28-style-control): how style control works.

## Related

- [Benchmark literacy](#benchmark-literacy)
- [LLM-as-judge done right](#llm-as-judge)
- [Statistics for evals](#eval-statistics)
- [The benchmark catalog](#benchmark-catalog)
- [Choosing a model](#choosing-a-model)
- [Reward models and preference data](#reward-modeling)
