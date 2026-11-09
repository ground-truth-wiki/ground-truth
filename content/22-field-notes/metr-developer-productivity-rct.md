---
id: metr-developer-productivity-rct
book: 22
order: "22.7"
title: Experienced open-source developers took longer with early-2025 AI tools
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-productivity, coding-agents, randomized-trials, measurement, public-record]
visuals: []
type: field-note
account: public-record
industry: "Software development (open-source projects)"
use_case: "AI coding tools, mainly Cursor Pro with Claude 3.5/3.7 Sonnet, used by experienced open-source developers on real issues in their own repositories"
outcome: "Issues took 19% longer when AI was allowed; developers had expected a 24% speedup and afterwards believed AI had sped them up by 20%"
measured_how: "Randomized controlled trial of 246 real issues from 16 developers, each issue randomly assigned to allow or disallow AI, timed by self-reported implementation time with screen recordings; AI tools of the February to June 2025 frontier (METR, July 2025)"
prerequisites: [measuring-ai-impact, online-experiments]
replications: []
---
> [!tldr]
> METR ran a randomized controlled trial in which 16 experienced open-source developers worked on 246 real issues, each randomly assigned to allow or disallow AI tools. With AI allowed, the issues took 19% longer, yet afterwards the developers believed AI had sped them up by 20%. The source's lesson: anecdotes and self-estimates of speed-up can be very inaccurate.

> [!note] From the public record
> Built from METR's own published account, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity" (July 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The post notes that "it can be difficult to directly translate benchmark scores to impact in the wild", and says that measuring AI's impact on developer productivity gives "complementary evidence to benchmarks".

The study "recruited 16 experienced developers from large open-source repositories (averaging 22k+ stars and 1M+ lines of code)", repositories they had contributed to for multiple years. The paper describes them as "16 developers with moderate AI experience" working in mature projects "on which they have an average of 5 years of prior experience."

When AI was allowed, "developers can use any tools they choose", and they used "primarily Cursor Pro with Claude 3.5/3.7 Sonnet". Otherwise, "they work without generative AI assistance." Developers were paid $150/hr. The post does not say when the study ran. The paper's abstract describes them as "AI tools at the February-June 2025 frontier".

## What happened

1. Each developer listed real issues that would be valuable to their repository, "246 total".
2. METR randomly assigned "each issue to either allow or disallow use of AI while working on the issue."
3. Developers worked the issues, "which average two hours each", while recording their screens, and then self-reported the total implementation time each one took.
4. Developers forecast their speed-up before starting and estimated it again after the study.
5. METR published the results on 10 July 2025, with the full paper on arXiv.

## Impact, and how it was measured

- **Completion time.** "Surprisingly, we find that when developers use AI tools, they take 19% longer than without". The metric is the self-reported implementation time per issue, compared between issues randomly assigned to allow or disallow AI.
- **Forecast.** Before the study, "developers expected AI to speed them up by 24%".
- **Self-estimate afterwards.** "even after experiencing the slowdown, they still believed AI had sped them up by 20%."
- **Expert forecasts.** The paper says the slowdown "contradicts predictions from experts in economics (39% shorter) and ML (38% shorter)."
- **Robustness.** "The slowdown persists across different outcome measures, estimator methodologies," among other analyses. On sample size, the post says "the 246 total completed issues give us (just enough) sufficient statistical power".

**Not measured:** neither source gives a cost for the AI tools. The post does not describe what the screen recordings showed; the paper labels activities on "a subset of 74 issues for which we have valid screen recordings". The study covers no less experienced developers or unfamiliar codebases, and it cannot rule out "learning effects beyond 50 hours of Cursor usage".

## Why it happened

"We investigate 20 potential factors that might explain the slowdown, finding evidence that 5 likely contribute". The paper's Table 1 names them: over-optimism about AI usefulness, high developer familiarity with repositories, large and complex repositories, low AI reliability, and implicit repository context. The paper's full text counts 21 factors, while the post and the arXiv abstract say 20.

The post says the authors "rule out many experimental artifacts": "developers used frontier models, complied with their treatment assignment," "didn't differentially drop issues", and "submitted similar quality PRs with and without AI". The paper's abstract adds that "the influence of experimental artifacts cannot be entirely ruled out".

They also offer two possibilities, not findings. First, "AI capabilities may be comparatively lower in settings with very high quality standards", or with many implicit requirements, such as documentation, testing coverage or linting and formatting, that take humans substantial time to learn. Second, learning effects for tools like Cursor may appear only after several hundred hours of usage, while these developers typically used Cursor for a few dozen hours before and during the study.

## What changed afterwards

The post now carries a notice: "These results are out of date." It adds, "We have released results that are current as of early 2026, in a continuation of this study", and "We believe these historical results no longer reflect the current impact of AI models on open-source developer productivity." This page does not cover the continuation.

In its "Going Forward" section, the post says METR is "exploring running experiments like this in other settings". It adds that "this evaluation methodology may be more difficult to game than benchmarks".

## Lessons

The source's own lessons:

- **The evidence partly disagrees.** Benchmarks, anecdotes and this trial give "partially contradictory answers". Models often succeed at benchmark tasks that are very difficult for humans, but here "Models slow down humans on 20min-4hr realistic coding tasks".
- **Self-reports can mislead.** "we now have strong evidence that anecdotal reports/estimates of speed-up can be very inaccurate."
- **Mind the scope.** The post does not provide evidence that "AI systems do not currently speed up many or most software developers". It notes "there are likely biases in which developers ended up participating in the study", and calls it "plausible or likely that AI tools are useful in many other contexts different from our setting".

The wiki's reading:

- **Measure time, not impressions.** The developers' estimate after the study pointed the opposite way from the measured result. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) and [Online controlled experiments for AI features](#online-experiments).
- **Randomize the unit of work.** Assigning AI per issue, within each developer's own repository, compares like with like. With few developers, power matters: see [Statistics for evals](#eval-statistics).
- **Benchmark scores are not deployment results.** See [How benchmarks are built and why they break](#benchmark-validity).
- **Productivity numbers expire.** The authors now call these results out of date. Date any such number and measure again as tools change.

## Disclosure

None.

## Sources

- Joel Becker, Nate Rush, Beth Barnes and David Rein, METR, [“Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity”](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), METR blog, 10 July 2025.
- Joel Becker, Nate Rush, Elizabeth Barnes and David Rein, METR, [“Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity”](https://arxiv.org/abs/2507.09089), full paper linked from the post, arXiv:2507.09089, version 1 12 July 2025, version 2 25 July 2025.

## Related

- [About field notes](#about-field-notes)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Measuring AI's economic impact](#economic-impact-evidence)
- [Working effectively with coding agents](#working-with-coding-agents)
- [How benchmarks are built and why they break](#benchmark-validity)
