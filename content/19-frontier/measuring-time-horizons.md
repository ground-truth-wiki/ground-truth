---
id: measuring-time-horizons
book: 19
order: "19.3.1"
title: Measuring time horizons and AI R&D capability
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [time-horizon, agent-benchmarks, ai-rnd, uplift-studies, autonomy]
visuals: []
prerequisites: [long-horizon-autonomy, evaluating-agents]
---
> [!tldr]
> A time horizon measures an AI agent by the length of tasks it can finish, counted in skilled human working time: METR times people on tasks, fits agent success against task length, and reports the length at which the agent succeeds 50% (or 80%) of the time. It turned agent progress into one trend line that doubled about every seven months from 2019 to early 2025. Remember that a horizon is a statistic about clean, automatically scored tasks at a stated success rate, with wide error bars; it is not a measure of how much real work an agent can take over.

## Key ideas

- **The method is a logistic fit against human time.** Each task's difficulty is the geometric mean time of successful human baselines, agent runs are scored pass or fail (continuous scores are cut at a human-level threshold), and a logistic curve of success against log task length gives the 50% horizon; confidence intervals come from a hierarchical bootstrap over task families, tasks and runs, and the 80% horizons came out 4 to 6 times shorter than the 50% ones (Kwa et al., [“Measuring AI Ability to Complete Long Software Tasks”](https://arxiv.org/abs/2503.14499) (2025)). The same recipe works on your own tasks: time people on them, define a pass threshold, run the agent several times per task and fit the curve.
- **The task suites span seconds to more than a day.** The original suite combined RE-Bench, HCAST and 66 new short software tasks, with human times from 1 second to 30 hours ([Kwa et al., 2025](https://arxiv.org/abs/2503.14499)); HCAST alone has 189 tasks with 563 human baselines totaling over 1,500 hours, and agents of the time succeeded 70 to 80% of the time on tasks that take humans under one hour, but under 20% of the time on tasks over four hours (Rein et al., [“HCAST: Human-Calibrated Autonomy Software Tasks”](https://arxiv.org/abs/2503.17354) (2025)). Time Horizon 1.1 (January 2026) grew the suite from 170 to 228 tasks, raised the number of tasks of 8 hours or more from 14 to 31 (only 5 of them with measured human baselines) and moved METR's evaluation infrastructure from Vivaria to Inspect ([METR, “Time Horizon 1.1”](https://metr.org/blog/2026-01-29-time-horizon-1-1/)).
- **The trend, with dates.** In March 2025 METR reported a 50% horizon of about 50 minutes for Claude 3.7 Sonnet and a doubling about every seven months since 2019, possibly faster in 2024 ([Kwa et al., 2025](https://arxiv.org/abs/2503.14499)); Time Horizon 1.1 put the doubling time at about 131 days since 2023 and about 89 days since 2024 ([METR, January 2026](https://metr.org/blog/2026-01-29-time-horizon-1-1/)). For February to March 2026, METR estimated the public frontier at about 12 hours at 50% success (interval 5 to 61 hours) and about 1.5 hours at 80% (interval 50 minutes to 2 hours 40 minutes) on Time Horizon 1.1 ([METR, “Frontier Risk Report (February to March 2026)”, May 2026](https://metr.org/blog/2026-05-19-frontier-risk-report/)), the most recent METR estimate cited here as of November 2026.
- **Long estimates are the least reliable.** METR wrote in May 2026 that the most capable agents essentially saturated Time Horizon 1.1, that the suite cannot reliably measure horizons above 16 hours, and that at least 16% of successful runs on tasks over 8 hours turned out to be illegitimate on review ([METR, May 2026](https://metr.org/blog/2026-05-19-frontier-risk-report/)). In January 2026 METR had already called its intervals "still very wide" ([METR, January 2026](https://metr.org/blog/2026-01-29-time-horizon-1-1/)).
- **AI R&D benchmarks measure research engineering, not research.** RE-Bench pits agents against 61 experts in 7 ML research engineering environments: with a total of 2 hours per environment the best agents scored about 4x higher than the experts, while with 32 hours in total the experts scored about 2x higher (Wijk et al., [“RE-Bench: Evaluating frontier AI R&D capabilities of language model agents against human experts”](https://arxiv.org/abs/2411.15114) (2024)). MLE-bench uses 75 Kaggle competitions, where the best setup at launch earned at least a bronze medal in 16.9% of them (Chan et al., [“MLE-bench: Evaluating Machine Learning Agents on Machine Learning Engineering”](https://arxiv.org/abs/2410.07095) (2024)), and PaperBench asks agents to replicate 20 ICML 2024 Spotlight and Oral papers, where the best agent averaged 21.0% at launch (Starace et al., [“PaperBench: Evaluating AI's Ability to Replicate AI Research”](https://arxiv.org/abs/2504.01848) (2025)).
- **Benchmark horizons and field productivity can diverge.** Controlling for length, models did worse on messier tasks ([Kwa et al., 2025](https://arxiv.org/abs/2503.14499)), and in a randomized trial with 16 experienced open-source developers and 246 tasks, early-2025 AI tools increased completion time by 19%, although the developers believed afterwards that AI had cut their completion time by 20% (Becker et al., [“Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity”](https://arxiv.org/abs/2507.09089) (2025)). METR's May 2026 report found coding agents doing real projects that would take humans hours or days, but companies did not report evidence of dramatic speed-ups in the overall pace of progress from AI R&D automation ([METR, May 2026](https://metr.org/blog/2026-05-19-frontier-risk-report/)); the wider evidence is in [measuring AI's economic impact](#economic-impact-evidence).

## Planned visuals

- `stepper`: the method on a toy task set, frame by frame: human baselines give each task a length, agent runs give pass or fail, a logistic curve is fitted, the 50% and 80% horizons are read off, and a bootstrap draws the interval.
- `chart`: published 50% horizons against model release date on a log axis with their confidence intervals, from METR's papers and posts, dated, with the saturation limit of Time Horizon 1.1 marked.
- `compare`: what a benchmark horizon measures next to what a field study measures (task source, scoring, success definition, who decides when work is done).

## Talk like an expert

Experts quote a horizon with its success rate, suite version and interval ("about 12 hours at 50% on Time Horizon 1.1, interval 5 to 61 hours"), and they ask whether the suite is saturated, which scaffold was used and whether successful runs were checked for cheating. The live debate is how well clean benchmark horizons predict messy real work.

## Go deeper

- Kwa et al., [“Measuring AI Ability to Complete Long Software Tasks”](https://arxiv.org/abs/2503.14499) (2025).
- METR, [“Time Horizon 1.1”](https://metr.org/blog/2026-01-29-time-horizon-1-1/) (January 2026).
- Wijk et al., [“RE-Bench: Evaluating frontier AI R&D capabilities of language model agents against human experts”](https://arxiv.org/abs/2411.15114) (2024).
- Becker et al., [“Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity”](https://arxiv.org/abs/2507.09089) (2025).

## Related

- [Long-horizon autonomy](#long-horizon-autonomy)
- [Evaluating agents](#evaluating-agents)
- [Benchmark literacy](#benchmark-literacy)
- [Measuring AI's economic impact](#economic-impact-evidence)
- [AI scientist agents and autonomous labs](#ai-scientist-agents)
- [Frontier safety frameworks](#frontier-safety-frameworks)
