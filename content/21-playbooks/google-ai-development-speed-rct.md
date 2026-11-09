---
id: google-ai-development-speed-rct
book: 21
order: "21.13"
title: "Google: a randomized trial of AI coding features and developer speed"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, code-completion, randomized-trial, developer-productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools"
use_case: "Three AI coding features in Cider V, one of the IDEs used at Google (AI Code Completion, Smart Paste and Natural Language to Code), tested for their effect on the time engineers need for one enterprise-grade coding task"
outcome: "Mean task time 96 min with the AI features against 114 min without (significant in a t-test on logged time); the best-fit controlled estimate of about 21% faster was not statistically significant (p=0.086)"
measured_how: "Randomized controlled trial with 96 full-time Google software engineers, 48 per condition, recruited in June and July 2024, on one standardized C++ task; time on task in the IDE, analysed with a t-test and linear regressions (Paradis et al., Google, arXiv, October 2024)"
prerequisites: [measuring-ai-impact, eval-statistics]
replications: []
---
> [!tldr]
> Google researchers ran a randomized controlled trial with 96 of the company's software engineers to measure how three internal AI coding features change the time spent on one complex task. Engineers with the features finished faster on average, and the paper's best estimate of the effect "stands at about 21%, although our confidence interval is large." Once other factors were controlled for, that estimate was not statistically significant.

> [!note] From the public record
> Built from Google's own published account, "How much does AI impact development speed? An enterprise-based randomized controlled trial" (October 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Google had built AI features into its internal developer tools. The authors asked what impact AI has on the time spent completing an enterprise-grade development task with these tools. They write that "very few estimates of the impact of AI-enhanced developer tools on time spent on task in an enterprise context have been published." They argue that "it is critical to be able to evaluate their business impact in terms of greater output or time gains for the organization."

## Why this approach

The team chose a randomized controlled trial. The paper says such trials are "often considered an empirical standard for establishing causal links". It measured speed as time on task. Because "RCTs do not eliminate the need to include control variables in analyses", it also tested developer-level and task-level factors with regressions. The study could not run outside Google: the tools are not available to external developers. See [Online controlled experiments for AI features](#online-experiments) and [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## The approach

1. **Recruitment.** In June and July 2024, a team independent of the researchers recruited full-time engineers by email. They needed at least one year at Google, proficiency in C++, code submitted to Piper, Cider V as their main IDE and some experience with the task domain.
2. **Assignment.** After a questionnaire and training on the AI tools, which all participants received, each was randomly assigned to the AI or the no-AI condition.
3. **The task.** Everyone started from an existing change list with ten files and 474 lines of code, implemented a new service that logs messages from a fake product to internal file storage, and updated build, data structure and test files. The task counted as completed when all tests passed.
4. **Measurement.** Time on task ran from the creation of the study workspace to the last observed interaction with the IDE.
5. **Analysis.** A two-tailed Student t-test on logged time on task, then linear regressions with daily coding hours, seniority level, frequency of AI tool use, C++ use and domain expertise as covariates.

## The stack

As of the paper's v3 (11 November 2024), describing the study of June and July 2024: code lives in the monorepo Piper, and participants worked in Cider V, "a variant of the VS Code IDE by Microsoft". The three features were in production and available to all Googlers in Cider V at study time:

- **AI Code Completion,** a "transformer-based hybrid semantic AI code completion" with single- and multi-line suggestions.
- **Smart Paste,** which adjusts pasted code to its new context.
- **Natural Language to Code,** which suggests code changes from a prompt, for the developer to apply or reject.

The paper does not name the models behind the features.

## Results, and how they were measured

- **Sample.** "A total of 96 participants worked on the task. Of these, 48 were assigned to each condition." The paper adds: "93 participants (96.9%) who started the task also completed it."
- **Unadjusted comparison.** "On average, developers who were exposed to AI features completed the task in 96 min" (N=47), against 114 min (N=46) without AI. The t-test on logged time was significant (t(83.6)=2.11, p=.038).
- **Controlled estimate.** With covariates, the paper reports the effect as robust, "making developers between 21% and 26% faster." In the best-fit model the coefficient was -0.24 (95% CI [-0.51, 0.03], p=0.086): "our confidence intervals are large, and as a result the estimate is not statistically significant". See [Statistics for evals](#eval-statistics).
- **Other factors.** Engineers reporting five or more hours of development work per day were 32% faster than those reporting zero to four hours, and each step up in seniority level was associated with a 15% decrease in time on task. No interaction between AI and these factors was statistically significant. For coding hours, the paper calls the interaction "large and negative but not statistically significant".

**Not measured:** the conclusion states that "questions about the impact of AI on code quality were not explored". The paper reports no separate effect for each feature and no outcomes from day-to-day production work.

## What failed

- **Significance after controls.** The abstract says "We found that AI significantly shortened the time developers spent on task." That rests on the unadjusted t-test; with controls, the paper calls its second hypothesis "only partially supported".
- **Interactions.** The study was powered for the main effect, but the authors say interaction effects need larger samples.
- **External validity.** "There may be external validity constraints on our estimates given how participants were all Google employees".
- **Evaluating its own tools.** "We cannot, however, fully eliminate the risk associated with us evaluating our own team’s developer tools."
- **A lab task.** The task could not perfectly match the complexity of real work and was designed to need no more than 3 hours.

## What the team would do differently

The paper does not say what the team would do differently, but names next steps: "A/B tests or field experiments might be best suited to calculate such effects with a much larger sample size", and "logs-based analyses might circumvent the issues we faced with statistical significance". It notes that Natural Language to Code requires familiarity with LLMs and prompting. On the gap to the 56% of an earlier GitHub Copilot study: "More likely, however, the difference is caused by differences in the underlying populations we recruited from." Its closing point: "it is critical for the field to keep researching and publishing these estimates".

The wiki's reading: the headline 21% and the significant result come from different analyses, so report an estimate with its confidence interval, and read a single lab task with passing tests as a measure of speed, not quality. [Measuring AI's economic impact](#economic-impact-evidence) collects other trials.

## Disclosure

None.

## Sources

- Elise Paradis, Kate Grey, Quinn Madison, Daye Nam, Andrew Macvean, Vahid Meimand, Nan Zhang, Ben Ferrari-Church, Satish Chandra, Google, [“How much does AI impact development speed? An enterprise-based randomized controlled trial”](https://arxiv.org/abs/2410.12944), arXiv:2410.12944 [cs.SE], v1 16 October 2024, v3 11 November 2024. This page follows v3.

## Related

- [About playbooks](#about-playbooks)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
- [Statistics for evals](#eval-statistics)
- [Measuring AI's economic impact](#economic-impact-evidence)
