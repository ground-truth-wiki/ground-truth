---
id: online-experiments
book: 14
order: "14.9.1"
title: Online controlled experiments for AI features
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [ab-testing, experimentation, cuped, sequential-testing, guardrail-metrics]
visuals: []
prerequisites: [online-evaluation, eval-statistics]
---
> [!tldr]
> An online controlled experiment, or A/B test, randomly splits real users between the current system and a change and compares them on metrics chosen in advance. For AI features it tests whether an offline improvement actually helps users, and it is only trustworthy with one primary metric, guardrails, enough power, clean randomization, and either a duration fixed in advance or a sequential test that allows peeking. Remember: an A/B test tells you whether the average experience improved, not whether something rare and severe is happening; offline safety evals answer that.

## Key ideas

- **Decide on one overall evaluation criterion and fence it with guardrails.** The overall evaluation criterion (OEC) is the metric that decides success: measurable within a short experiment yet indicative of long-term value and user satisfaction, ideally a single metric; guardrail metrics, such as page load time, must not be significantly harmed, and data-quality metrics, such as the ratio of users in treatment to control, show whether the experiment can be trusted at all ([Dmitriev et al., “A Dirty Dozen: Twelve Common Metric Interpretation Pitfalls in Online Controlled Experiments” (2017)](https://www.microsoft.com/en-us/research/uploads/prod/2020/08/2017-08-KDDMetricInterpretationPitfalls.pdf)). A book-length guide to the whole practice is [Kohavi, Tang and Xu, *Trustworthy Online Controlled Experiments: A Practical Guide to A/B Testing* (2020)](https://experimentguide.com/).
- **Size the test for its minimum detectable effect, then cut variance with pre-experiment data.** Power analysis comes first (see [statistics for evals](#eval-statistics) and the calculator in [online evaluation](#online-evaluation)); CUPED then adjusts each user's metric Y with the same user's pre-experiment value X as Y − θ(X − E[X]), with θ = cov(Y, X) ÷ var(X), which shrinks the variance by a factor of 1 − ρ², where ρ is the correlation of X and Y. At Bing this cut variance by about 50%, the same power with half the users or half the time, and the same metric measured before the experiment was usually the best covariate ([Deng et al., “Improving the Sensitivity of Online Controlled Experiments by Utilizing Pre-Experiment Data” (2013)](https://exp-platform.com/Documents/2013-02-CUPED-ImprovingSensitivityOfControlledExperiments.pdf)).
- **Check the sample ratio before reading any result.** A sample ratio mismatch (SRM), where the observed split differs from the configured one, is a symptom of data-quality bugs that in most cases invalidates the result; a chi-squared test detects it, a 50.2/49.8 split of 821,588 versus 815,482 users has less than a 1 in 500,000 chance of happening by luck, and about 6% of experiments at Microsoft showed an SRM ([Fabijan et al., “Diagnosing Sample Ratio Mismatch in Online Controlled Experiments: A Taxonomy and Rules of Thumb for Practitioners” (2019)](https://exp-platform.com/Documents/2019_KDDFabijanGupchupFuptaOmhoverVermeerDmitriev.pdf)). Platforms automate the check: as of November 2026, GrowthBook checks every experiment automatically and warns when the SRM p-value is below 0.001 ([GrowthBook docs, “Experimenting”](https://docs.growthbook.io/using/experimenting)).
- **Peeking breaks fixed-horizon p-values; sequential tests are built for it.** Stopping as soon as a fixed-horizon p-value dips below the threshold can easily raise the false positive rate fivefold, even with 10,000 samples, while always-valid p-values and confidence intervals, derived from the mixture sequential probability ratio test, stay valid whenever you decide to stop ([Johari et al., “Always Valid Inference: Bringing Sequential Analysis to A/B Testing” (2015)](https://arxiv.org/abs/1512.04922)). The alternative is to fix the duration in advance; GrowthBook recommends at least one to two weeks to capture variation in traffic ([GrowthBook docs](https://docs.growthbook.io/using/experimenting)).
- **Effects change over time, so ramp in phases and keep a holdout.** A novelty effect is a treatment advantage that fades over the days of an experiment, and a primacy effect starts small and grows, for example as a machine learning system adapts ([Dmitriev et al., 2017](https://www.microsoft.com/en-us/research/uploads/prod/2020/08/2017-08-KDDMetricInterpretationPitfalls.pdf)); studying Google search ads, Hohnhold et al. found that the short-term effect of a change is not always predictive of its long-term effect ([Hohnhold et al., “Focus on the Long-Term: It's better for Users and Business” (2015)](https://research.google/pubs/focus-on-the-long-term-its-better-for-users-and-business/)). LinkedIn's SQR framework starts with small ramps to limit risk, measures at the maximum power ramp (50% when one treatment and one control share all traffic), and sometimes keeps a long-term holdout, such as 5% of users for over a month, to see whether the effect lasts ([Xu et al., “SQR: Balancing Speed, Quality and Risk in Online Experiments” (2018)](https://arxiv.org/abs/1801.08532)).
- **AI feedback signals are biased metrics, and A/B tests miss rare harms.** Thumbs, edits, retries, regenerations and escalations become metrics only once you know what they track: for code completion, the acceptance rate of shown suggestions predicted developers' perceived productivity better than whether completions persisted in the code ([Ziegler et al., “Productivity Assessment of Neural Code Completion” (2022)](https://arxiv.org/abs/2205.06537)), while OpenAI's account of its sycophantic April 2025 GPT-4o update says user feedback (thumbs-up and thumbs-down data) “can sometimes favor more agreeable responses” and that A/B tests seemed to indicate the small number of users who tried the model liked it (OpenAI's post-mortem, quoted in [Willison, “Expanding on what we missed with sycophancy” (2025)](https://simonwillison.net/2025/May/2/what-we-missed-with-sycophancy/)). Rare, severe failures hide in averages: if none occurs among n users, the upper limit of the 95% confidence interval for its rate is still about 3/n, a rule of thumb from Hanley and Lippman-Hand ([Newman, “If Almost Nothing Goes Wrong, Is Almost Everything All Right? Interpreting Small Numerators” (1995)](https://jamanetwork.com/journals/jama/article-abstract/389714)), so [safety evals](#safety-evals) cover them offline, and [measuring business impact](#measuring-ai-impact) takes over where the experiment ends.

## Planned visuals

- **`calculator`:** CUPED variance reduction: enter the correlation between the pre-experiment and in-experiment metric, the baseline variance and the minimum detectable effect, and see the variance factor 1 − ρ² and the users needed with and without CUPED.
- **`chart`:** an illustrative p-value path over the days of an A/A test, dipping below 0.05 several times, next to an always-valid p-value that stays honest, showing why peeking creates false winners.
- **`stepper`:** the ramp from canary to decision: a 1% risk-mitigation ramp with guardrails and an SRM check, the 50% maximum power ramp, an optional operational ramp, and a long-term holdout, with what each phase decides.

## Talk like an expert

Experts say **OEC**, **guardrail metrics**, **minimum detectable effect**, **SRM**, **CUPED**, **always-valid inference**, **novelty and primacy effects** and **holdout**, and the first thing they check in any result is the sample ratio. They treat an A/B win as evidence about the average user, and ask separately which offline evals cover the rare, severe failures an experiment cannot see.

## Go deeper

- [Kohavi, Tang and Xu, *Trustworthy Online Controlled Experiments: A Practical Guide to A/B Testing* (2020)](https://experimentguide.com/): a book-length guide to running A/B tests that can be trusted.
- [Deng et al., “Improving the Sensitivity of Online Controlled Experiments by Utilizing Pre-Experiment Data” (2013)](https://exp-platform.com/Documents/2013-02-CUPED-ImprovingSensitivityOfControlledExperiments.pdf): the CUPED paper.
- [Johari et al., “Always Valid Inference” (2015)](https://arxiv.org/abs/1512.04922): sequential p-values and intervals that survive continuous monitoring.
- [Fabijan et al., “Diagnosing Sample Ratio Mismatch in Online Controlled Experiments: A Taxonomy and Rules of Thumb for Practitioners” (2019)](https://exp-platform.com/Documents/2019_KDDFabijanGupchupFuptaOmhoverVermeerDmitriev.pdf): a taxonomy of SRM causes and how to find them.

## Related

- [Online evaluation](#online-evaluation)
- [Statistics for evals](#eval-statistics)
- [CI/CD for AI](#ci-cd-for-ai)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Multi-armed and contextual bandits](#bandits)
- [The data flywheel](#data-flywheel)
