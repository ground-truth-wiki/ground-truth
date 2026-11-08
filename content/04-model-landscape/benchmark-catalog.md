---
id: benchmark-catalog
book: 4
order: "4.5.1"
title: The benchmark catalog
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [benchmarks, evals, leaderboards, saturation, reference]
visuals: []
prerequisites: [benchmark-literacy]
---
> [!tldr]
> A benchmark catalog records, for each benchmark, what it measures, its format and size, how it is graded, the setup labs use and whether it is saturated, because a score means little without them. As of November 2026, several famous benchmarks are saturated, contaminated or flawed, and newer ones with expert questions, repository-scale coding, long-horizon tasks and interactive puzzles have taken their place. Read every launch-table number with its setup, its subset and the benchmark version, as of a date.

## Key ideas

- **Every entry needs the same fields, because setup moves scores.** For each benchmark, record what it measures, format and size, grader, typical setup (prompt, number of attempts, tools, harness) and saturation status at a review date. Language models are sensitive to evaluation setup, and proper comparisons across methods are difficult (Biderman et al., [“Lessons from the Trenches on Reproducible Evaluation of Language Models”](https://arxiv.org/abs/2405.14782) (2024)).
- **Knowledge tests saturate, age and carry label errors.** MMLU covers 57 tasks from elementary mathematics to US history, computer science and law (Hendrycks et al., [“Measuring Massive Multitask Language Understanding”](https://arxiv.org/abs/2009.03300) (2020)); a re-annotation of 5,700 of its questions found errors in 57% of the analysed Virology questions and estimated that 6.49% of all MMLU questions contain errors (Gema et al., [“Are We Done with MMLU?”](https://arxiv.org/abs/2406.04127) (2024)). MMLU-Pro raises the answer options from four to ten and cuts trivial and noisy questions (Wang et al., [“MMLU-Pro”](https://arxiv.org/abs/2406.01574) (2024)), GPQA has 448 biology, physics and chemistry questions on which experts with or pursuing a PhD in the field scored 65% and skilled non-experts with web access 34% (Rein et al., [“GPQA”](https://arxiv.org/abs/2311.12022) (2023)), and Humanity's Last Exam was built because models exceed 90% on benchmarks such as MMLU: 2,500 multiple-choice and short-answer questions that can be graded automatically (Phan et al., [“Humanity's Last Exam”](https://arxiv.org/abs/2501.14249) (2025)).
- **Coding moved from contest problems to whole repositories** (more in [coding-agent benchmarks](#coding-agent-benchmarks)). LiveCodeBench keeps collecting dated contest problems from LeetCode, AtCoder and Codeforces, so a model can be tested only on problems published after its training cutoff (Jain et al., [“LiveCodeBench”](https://arxiv.org/abs/2403.07974) (2024)). In February 2026, OpenAI said SWE-bench Verified had lost its value as a measure of coding ability because of flawed tests and contamination, and recommended SWE-bench Pro instead ([as reported by The Decoder](https://the-decoder.com/openai-wants-to-retire-the-ai-coding-benchmark-that-everyone-has-been-competing-on/)); SWE-bench Pro has 1,865 human-verified problems from 41 repositories, split into a public set (11 repositories), a held-out set (12) and a commercial set of 18 proprietary repositories (Deng et al., [“SWE-Bench Pro”](https://arxiv.org/abs/2509.16941) (2025)). A score must name its version: Terminal-Bench is at version 4.0 as of November 2026 ([tbench.ai](https://www.tbench.ai/)).
- **Agent and long-horizon benchmarks grade outcomes, not text.** τ-bench puts an agent with domain tools and policies in a conversation with a simulated user and compares the final database state with an annotated goal state; it introduced pass^k, and in its retail domain pass^8 was below 25% (Yao et al., [“τ-bench”](https://arxiv.org/abs/2406.12045) (2024)). METR's time horizon is the length of tasks, in human working time, that a model completes with 50% success; it doubled about every seven months from 2019 (Kwa et al., [“Measuring AI Ability to Complete Long Software Tasks”](https://arxiv.org/abs/2503.14499) (2025)), see [measuring time horizons](#measuring-time-horizons). GDPval measures economically valuable work in 44 occupations across the top 9 sectors of US GDP, with a 220-task gold subset made public (Patwardhan et al., [“GDPval”](https://arxiv.org/abs/2510.04374) (2025)).
- **ARC tests fluid intelligence, and its third version is interactive.** ARC-AGI-2 keeps the input-output task format of ARC-AGI-1 with a new, larger set of tasks checked by extensive human testing (Chollet et al., [“ARC-AGI-2”](https://arxiv.org/abs/2505.11831) (2025)). ARC-AGI-3, released in March 2026, drops agents into hundreds of original turn-based environments with no instructions and scores them on efficiency against human action baselines; humans solve 100% of the environments and frontier AI systems scored below 1% as of March 2026 (ARC Prize Foundation, [“ARC-AGI-3”](https://arxiv.org/abs/2603.24621) (2026); [ARC Prize launch post](https://arcprize.org/blog/arc-agi-3-launch)).
- **Know the test set and the composite, and quote the version with the number.** Public test sets can leak into training data; SWE-bench Pro describes itself as contamination-resistant and keeps its held-out and commercial problems private ([Deng et al.](https://arxiv.org/abs/2509.16941)). Composite indices fold many benchmarks into one number: as of November 2026, the Epoch Capabilities Index fits more than 50 benchmarks onto one scale calibrated so that Claude 3.5 Sonnet scores 130 and GPT-5 scores 150 ([Epoch AI, ECI](https://epoch.ai/benchmarks/eci)), and version 5.0.1 of the Artificial Analysis Intelligence Index weights four categories equally across nine evaluations that Artificial Analysis runs itself, and its component list changes between versions ([Artificial Analysis, methodology](https://artificialanalysis.ai/methodology/intelligence-benchmarking)).

## Planned visuals

- **`matrix`:** the catalog itself, one row per benchmark (family, what it measures, format and size, grader, typical setup, public or private test set, saturation status), every row sourced and dated, filterable by family; beyond the entries above it adds factuality (SimpleQA), instruction following (IFEval), math (GSM8K, MATH, AIME, FrontierMath), tool use and the web (BFCL, GAIA, BrowseComp, WebArena, OSWorld), long context (RULER), multimodal (MMMU) and holistic suites (HELM).
- **`chart`:** best reported score against years since release for a handful of benchmarks, from sourced, dated data only, to show how fast each family saturates.
- **`tree`:** how to read a launch table: which benchmark version and subset, how many attempts, which tools and harness, which grader, and who ran it, linked to [statistics for evals](#eval-statistics) and [eval harnesses](#eval-harnesses).

## Talk like an expert

Experts name the benchmark with its version and subset ("SWE-bench Pro, public set"), then ask about **attempts** (**pass@1** or **pass^k**), **tools**, **harness** and **who ran it**. They talk about **saturation**, **contamination**, **held-out** and **private** sets, **time horizons** and **composite indices**, and they date every status.

## Go deeper

- Biderman et al., [“Lessons from the Trenches on Reproducible Evaluation of Language Models”](https://arxiv.org/abs/2405.14782) (2024).
- Gema et al., [“Are We Done with MMLU?”](https://arxiv.org/abs/2406.04127) (2024).
- Phan et al., [“Humanity's Last Exam”](https://arxiv.org/abs/2501.14249) (2025).
- Kwa et al., [“Measuring AI Ability to Complete Long Software Tasks”](https://arxiv.org/abs/2503.14499) (2025).

## Related

- [Benchmark literacy](#benchmark-literacy)
- [How benchmarks are built and why they break](#benchmark-validity)
- [Arenas and leaderboards](#arenas-leaderboards)
- [Evaluating agents](#evaluating-agents)
- [Coding-agent benchmarks: SWE-bench, Terminal-Bench and their harnesses](#coding-agent-benchmarks)
- [State-of-the-art snapshot](#sota-snapshot)
