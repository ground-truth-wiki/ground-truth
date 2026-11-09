---
id: beko-automated-code-review
book: 21
order: "21.106"
title: "Beko: an LLM code review bot on pull requests, measured in three projects"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-review, developer-tools, developer-productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "Home appliances (consumer durables and electronics), in-house software development"
use_case: "An LLM-based bot, built on the open-source Qodo PR-Agent, that posts automated review comments on every pull request"
outcome: "73.8% of automated review comments labeled as resolved; average pull request closure duration increased from five hours 52 minutes to eight hours 20 minutes, with different trends per project; no significant change in human review comments"
measured_how: "Resolution labels on 1408 bot comments on merged pull requests, closure durations of 4,335 pull requests (1,568 with automated review) before and after adoption in three projects, and surveys of developers; data collected until 20 September 2024 (Cihan et al., arXiv December 2024, to be presented at ICSE 2025 SEIP)"
prerequisites: [cloud-and-ci-coding-agents]
replications: []
---
> [!tldr]
> Beko's software division adopted CodeReviewBot, an LLM reviewer built on the open-source Qodo PR-Agent, and researchers from Bilkent University and Beko studied it in three projects. "73.8% of automated code review comments were labeled as resolved", but the average pull request closure duration "increased from five hours 52 minutes to eight hours 20 minutes", with different trends per project. Human review comments did not change significantly.

> [!note] From the public record
> Built from Beko and Bilkent University's own published account, "Automated Code Review In Practice" (December 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper describes Beko as "a multinational home appliances company" whose software development division has 238 practitioners. It frames code review as "often perceived as time-consuming", and notes that for automated code review tools "there is a lack of empirical evidence regarding their potential benefits". Beko started investigating a tool on 25 August 2023, "driven by a need to enhance code quality and efficiency".

## Why this approach

Beko evaluated several open-source projects, including CodeRabbit, Qodo (Formerly CodiumAI), and pipeline extension tools such as Reviewbot, ChatGPT-CodeReview and Codereview.gpt. It selected Qodo PR-Agent "for its high performance and seamless integration". The paper does not say how the candidates were compared.

## The approach

1. **Rollout.** Beko customized the tool and named it "Code Review Bot" internally (CodeReviewBot in the paper). The first pilot project launched on 7 November 2023. By 5 June 2024 the bot ran in 10 projects and 22 repositories.
2. **Review flow.** The bot posts its reviews on each pull request as separate comments, and "developers can still add their reviews".
3. **Resolution labels.** A required comment resolution policy in Azure DevOps made authors indicate how they handled each comment, with statuses such as Resolved, Won't fix and Closed. Practitioners were informed by email on 24 May 2024 that it was in place. It started after the bot and was active only for pull requests targeting the main branch.
4. **Study design.** The analysis covers the three projects that started earliest: a B2B e-commerce portal (21 developers), an enterprise management platform (51) and a customizable AI solutions hub (22). The researchers mined Azure DevOps data, asked authors to rate the bot's comments on each pull request, and ran a general opinion survey. They removed 7% of pull requests as merge-time outliers.

## The stack

As of December 2024: Qodo PR-Agent, open source, customized by Beko. The paper names the model in two ways: "GPT-4 Turbo model" in the introduction and "the GPT-4-32K Model" in Section III-A. It does not say how the model is hosted. The repositories are hosted on Azure DevOps. The bot used "an average of 3,937 tokens per pull request at a cost of 0.48$".

## Results, and how they were measured

The sample is 4,335 pull requests in three projects, of which 1,568 were created after adopting automated review. Data collection ended on 20 September 2024; the text does not state when the period before adoption starts.

- **Comment labels.** After filtering, 1408 of 4408 bot comments on merged pull requests were analyzed. "73.8% of automated code review comments were labeled as resolved", and 21.3% Won't Fix. Per project, 55% (Project #1) and 90% (Project #3) were labeled Resolved.
- **Commits.** There were 88 commits after the bot's comments but before human comments, and 69 after human comments.
- **Closure duration.** The overall average "increased from five hours 52 minutes to eight hours 20 minutes" (independent samples t-test, p-value < 0.001). Project #1 went from two hours and 48 minutes to four hours and 38 minutes, and Project #3 from 20 hours and 22 minutes to 30 hours and 51 minutes. Project #2 fell, "dropping from six hours and six minutes to three hours and seven minutes".
- **Human review.** Human reviewers left an average of 0.31 comments per pull request before the bot and 0.28 after; a Poisson regression found "this overall decrease was not statistically significant". The bot left an average of 3.65. Per project, human comments significantly increased in Project #1 (0.14 to 0.29), significantly decreased in Project #2 (0.37 to 0.08) and "remained statistically unchanged" in Project #3 (0.50 to 0.49).
- **Surveys.** Ratings (zero to five) were collected for 38 pull requests: "The average rating for the automated review comments was 3.46, with a standard deviation of 1.79." Of 22 practitioners in the general opinion survey, 14 suggested a minor improvement in code quality. On pace, eight perceived a minor improvement, four no effect, three a minor deterioration and two a major improvement.

The paper's Conclusion gives other closure figures ("50 minutes before and 48 minutes after"); this page follows the abstract and Results.

**Not measured:** defects or incidents; a comparison group without the bot over the same period; whether the cost is offset by saved developer time.

## What failed

- **Comments not acted on.** "26.2% of the tool comments were not acted upon", labeled Won't Fix or Closed. One respondent cited suggestions for code "not in the scope of the task". Another wrote: "Sometimes the mistakes it thinks it finds are not mistakes at all."
- **Repeated reviews.** "With each fix, a new review is generated", one respondent wrote, adding that later comments "often become redundant and unhelpful".
- **Over-reliance.** One respondent warned that "reviewers may ignore by saying that if any other issue exists, the bot would have written it." See [Human in the loop](#human-in-the-loop).
- **Limits of the study.** Some authors work at Beko, one as a manager, which "introduces the possibility of biases"; to stay neutral, the results and discussions were written by the non-practitioner authors. Data collection centered on summer, and "we acknowledge that our conclusions are subject to seasonality". It covers one tool and one model.

## What the team would do differently

The paper states no changes it would make. Its Discussion says "we did not find conclusive evidence supporting consistent time or effort savings", and advises practitioners to "examine LLM-based automated code review tools extensively before widespread adoption" and to build awareness of their limits. The authors plan to replicate the study at other companies.

The wiki's reading: the resolution labels have no baseline, because the policy started after the bot. Track labels and closure time before rollout, and compare with projects without the bot where you can: here one project got faster and two got slower.

## Disclosure

None.

## Sources

- Umut Cihan, Vahid Haratian, Arda İçöz, Mert Kaan Gül, Ömercan Devran, Emircan Furkan Bayendur, Baykal Mehmet Uçar and Eray Tüzün, Bilkent University and Beko, [“Automated Code Review In Practice”](https://arxiv.org/abs/2412.18531), arXiv:2412.18531, submitted 24 December 2024, revised 28 December 2024 (v2); to be presented at ICSE 2025, Software Engineering in Practice (SEIP) Track.

## Related

- [About playbooks](#about-playbooks)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
- [Human in the loop](#human-in-the-loop)
