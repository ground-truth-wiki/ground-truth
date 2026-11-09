---
id: atlassian-rovodev-code-reviewer
book: 21
order: "21.7"
title: "RovoDev Code Reviewer: LLM review comments on Atlassian's pull requests"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-review, coding-agents, llm-as-judge, online-evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (developer and collaboration tools)"
use_case: "LLM-generated code review comments on Bitbucket pull requests, filtered for factual correctness and actionability before they are posted"
outcome: "38.70% of its comments led to code resolution (44.45% for human-written comments); median PR cycle time 14.35 hours with its comments and 20.73 hours without"
measured_how: "Code resolution rate from July 10 2025 to July 15 2025; 43,633 PRs with and 42,981 without its comments, January to July 2025, plus interrupted time series (Tantithamthavorn et al., ICSE SEIP 2026)"
prerequisites: [cloud-and-ci-coding-agents, llm-as-judge]
replications: []
---
> [!tldr]
> Atlassian built RovoDev Code Reviewer, which drafts review comments on Bitbucket pull requests with an LLM and filters them before posting. From July 10 2025 to July 15 2025, "RovoDev Code Reviewer achieves a code resolution rate of 38.70%", against 44.45% for human-written comments. From January 2025 through July 2025, pull requests with its comments had a median cycle time of 14.35 hours, against 20.73 hours without.

> [!note] From the public record
> Built from Atlassian's own published account, "RovoDev Code Reviewer: A Large-Scale Online Evaluation of LLM-based Code Review Automation at Atlassian" (January 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

At Atlassian, every code change is peer reviewed before it is merged, primarily through pull requests in Bitbucket. The paper says that at Atlassian's scale, code review "can become a bottleneck", and that the core review process remains largely manual. The tool is an assistant that generates review comments, while final decisions "remain with human reviewers".

## Why this approach

The paper names four practical challenges, and each shaped a choice:

- **Privacy.** Fine-tuning on customer code is treated as a privacy and security risk, so the generator runs zero-shot: "we do not collect any user-generated content for model training or fine-tuning purposes."
- **Guidelines.** Recent automated approaches ignored review checklists, so Atlassian's review guidelines go into the prompt.
- **New projects.** Retrieving similar past changes suits mature projects, not new ones, so the prompt uses readily available context: the pull request and its Jira issue.
- **Noise.** LLM comments can be vague or hallucinated, so two quality checks filter them.

Offline similarity metrics do not adequately reflect practical usefulness, the team argues, so it evaluated the tool online. See [Online evaluation](#online-evaluation).

## The approach

When a pull request is created, the reviewer clones the repository and collects the diff, the pull request title and description, and the Jira issue. An LLM generates candidate comments, which can include code changes users can apply directly. An [LLM judge](#llm-as-judge) returns True or False on whether each comment is aligned with the change. An actionability check then removes vague, nitpicking and off-topic comments. The rest are posted, where human reviewers can review, accept or discuss them.

The rollout began with one month of internal dogfooding, with "several iterations of trials" to stabilize comment quality, then 12 months with all Atlassian teams.

## The stack

As of January 2026, the paper describes:

- **Generator:** Anthropic's Claude 3.5 Sonnet, zero-shot, with a structured prompt of persona, task definition, chain of thought, review guidelines, pull request and Jira information, and the code change.
- **Factual correctness judge:** a prompted gpt-4o-mini model.
- **Actionability check:** ModernBERT fine-tuned on "five months of over 50,000 high-quality RovoDev-generated code review comments", labeled by whether each led to a code resolution.
- **Integration:** Bitbucket, an event-driven architecture, and Jira Service Management Cloud for user feedback.

## Results, and how they were measured

**Scale.** "Over a 12-month deployment period between June 2024 and June 2025," the tool ran "across over 2,000 source code repositories, generating over 54,000 code review comments", 2.1 per pull request on average. The introduction and conclusion say "more than 1,900" and "over 1,900" repositories.

**Code resolution rate:** the share of generated comments whose commented lines are changed, and the issue resolved, in the next commit. For July 10 2025 to July 15 2025, "RovoDev Code Reviewer achieves a code resolution rate of 38.70%", against 44.45% for human-written comments. A chart tracks the rate over "Aug 2024 to July 2025".

**PR cycle time:** from creation to merge or a build endpoint. In standard-size enabled repositories from January 2025 through July 2025, 43,633 pull requests with RovoDev comments had a median of 14.35 hours, and 42,981 without had 20.73 hours. Table 1 gives -31%, with a Mann-Whitney U test at p<.001 in the text; the abstract says "decreasing the PR cycle time by 30.8%". An interrupted time series over 77 weekly observations found "a statistically significant reduction in the median pull request cycle time".

**Human comments per pull request.** On the same pull requests, Table 2 reports a mean of 2.87 with RovoDev comments and 4.45 without, a relative difference of -35.6% (p<.001), though the text calls it the median. The time series found a reduction (p=0.013). The paper calls this an indicator that the tool's introduction "correlated with a significant boost in engineers’ productivity".

**Offline checks.** On 2,068 internal code changes, "RovoDev Code Reviewer can generate 4% of the comments that are aligned with human-written comments", while 40% were not aligned. Removing the review guidelines cost 5 percentage points of localization. The actionability check improved location-and-meaning alignment by 15 percentage points and location-only alignment by 20 percentage points.

**Not measured:** the paper describes no randomized online test, and it does not say why some pull requests received no RovoDev comments. It reports no defect data. The abstract's "improving overall software quality" is explained as "finding errors with actionable suggestions", a theme from user feedback. It gives no cost or latency figures.

## What failed

- **Missing context.** "AI seems to think this is PHP code, it’s Javascript", one engineer wrote. The tool "may generate incorrect or non-actionable feedback when contextual information is lacking".
- **More context helped little.** "augmenting prompts with additional context yields only minimal improvements."
- **The LLM judge**, "which tends to be expensive", had minimal impact offline, which the authors call surprising.
- **Ratings.** Engineers "rarely clicked the thumbs up/thumbs down buttons", so the team also asked for written feedback.
- **Scope.** Results "are limited to Antropic Claude Sonnet 3.5" (sic) and Atlassian's internal code review.

## What the team would do differently

The paper states recommendations, not regrets. Do not use a similarity metric "as the sole measure of the practical usefulness" of comments. Make review guidelines, the task definition and the code change mandatory prompt inputs. Prioritize "actionability checks based on pre-trained language models". Research better context enrichment.

The wiki's reading: the cycle-time and comment figures compare pull requests that did and did not get comments, so they show an association. The paper's interrupted time series checks for sample bias, but it can also pick up other changes from the same period. A randomized rollout would test the effect; see [Online controlled experiments for AI features](#online-experiments). The actionability filter is also trained on code resolution, the signal the main online metric counts.

## Disclosure

None.

## Sources

- Kla Tantithamthavorn, Yaotian Zou, Andy Wong, Michael Gupta, Zhe Wang, Mike Buller, Ryan Jiang, Matthew Watson, Minwoo Jeong, Kun Chen and Ming Wu, Atlassian (Kla Tantithamthavorn also Monash University), [“RovoDev Code Reviewer: A Large-Scale Online Evaluation of LLM-based Code Review Automation at Atlassian”](https://arxiv.org/html/2601.01129v2), arXiv:2601.01129v2, 20 January 2026 (v1: 3 January 2026). Accepted at the 48th International Conference on Software Engineering (ICSE 2026), SEIP track, doi:10.1145/3786583.3786851. The paper states that its conclusions are the authors' own and do not represent Atlassian's official policies.

## Related

- [About playbooks](#about-playbooks)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [LLM-as-judge done right](#llm-as-judge)
- [Online evaluation](#online-evaluation)
- [Online controlled experiments for AI features](#online-experiments)
