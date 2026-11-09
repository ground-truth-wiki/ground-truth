---
id: zoominfo-copilot-study
book: 21
order: "21.29"
title: "Zoominfo: a four-phase evaluation and rollout of GitHub Copilot"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, code-completion, developer-productivity, rollout, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools (Go-To-Market intelligence platform)"
use_case: "Evaluating GitHub Copilot in staged trials and rolling it out to the company's developers"
outcome: "Average acceptance rate of 33% for suggestions and 20% for lines of code; 72% total satisfaction for GitHub Copilot in the internal developer survey"
measured_how: "Acceptance rate of shown suggestions in daily data from 14 November to 9 December 2024 (Figure 2), plus a quarterly developer pulse survey (DevSat); no comparison group reported (Bakal et al., Zoominfo, arXiv, January 2025)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> Zoominfo evaluated and deployed GitHub Copilot in four phases starting in July 2023: a first assessment with five engineers, trial recruitment, a two-week trial with 126 engineers, and a rollout from September 2023. Using daily data from November and December 2024, the paper reports "an average acceptance rate of 33% for suggestions and 20% for lines of code". Copilot had "72% total satisfaction" in the company's quarterly developer survey. Effects on delivery metrics are not yet reported.

> [!note] From the public record
> Built from Zoominfo's own published account, "Experience with GitHub Copilot for Developer Productivity at Zoominfo" (January 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Zoominfo runs a Go-To-Market (GTM) intelligence platform. It has close to 4,000 employees, and 400 engineers are active developers. Developer productivity is "a strategic priority at Zoominfo". The authors also see a gap in published work: "there remains limited empirical evidence of its evaluation, deployment, and effectiveness" for GitHub Copilot in medium- to large-scale enterprises.

## Why this approach

An ad hoc assessment in early July 2023 came out positive, and Zoominfo procured Copilot for a formal evaluation. The paper does not say whether other coding assistants were considered.

For the success measure, the authors write: "The impact of GitHub Copilot on developer productivity seems difficult to measure after a short-term usage." They chose the acceptance rate of shown suggestions, which GitHub's own research found to be a "better predictor of perceived productivity". A team's rate is the average over its developers. A partial acceptance gets full credit and the number of lines is not counted, which the authors note may be seen as limitations. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## The approach

1. **Initial assessment,** 10 to 17 July 2023, with five engineers. GitHub Copilot for Business licenses were procured in this phase.
2. **Trial recruitment,** 17 July to 14 August 2023. The team used "stratified voluntary sampling" to recruit 126 engineers (about 32% of the developers). Each had to complete internal security code review training, acknowledge the policies on generative AI, data governance and related areas in writing, and commit to a follow-up survey.
3. **Two-week trial,** 15 to 29 August 2023, with the 126 engineers using Copilot in daily work, followed by a survey.
4. **Rollout,** from 7 September 2023. The survey analysis found "no outstanding issues", and licenses were released at a controlled pace through a ServiceNow Workflow that tracked compliance and utilization.

The training and policy sign-off before access are the kind of controls covered in [Enterprise readiness](#enterprise-readiness).

## The stack

As of January 2025: GitHub Copilot for Business. The top two editors are JetBrains and VS Code. The most common languages are TypeScript, Python, Java and JavaScript, in repositories hosted mainly on a self-hosted GitHub Enterprise Server instance and also on GitLab. The paper does not state which model or version Zoominfo's Copilot used. Its related-work section only says that GitHub Copilot "uses a version of Codex".

## Results, and how they were measured

- **Acceptance.** For the period in Figure 2, "the average acceptance rate over suggestions is 33% and over lines is 20%". The caption of Figure 2 gives "Daily data from Nov. 14th to Dec. 9th in 2024". The text calls it data "for 26 days" but gives Nov. 11th as the start. In this period "the total number of lines accepted is about 75,000".
- **By language.** Rates for the top four languages are "sustained at about 30%", and the text gives a range "between about 14% to 32%", with Go highest but on far fewer suggestions. The language table in Figure 5, collected on 9 January 2025, lists Go at 43.3%. HTML, CSS, JSON and SQL have lower rates than the general-purpose languages.
- **By editor.** Figure 8 lists an acceptance rate of 28.5% for JetBrains and 31.1% for VS Code.
- **Trial survey.** 72 respondents, "about 57% response rate". The mean satisfaction rating was 8.0 out of 10 and the mean productivity improvement rating 7.6 out of 10.
- **Satisfaction.** A quarterly pulse survey scores each tool as positive minus negative answers, ignoring neutral ones. GitHub Copilot had "72% total satisfaction among all surveyed tools", the highest, and Figure 9 lists 264 responses for it. 90% of respondents said it cuts their task time "with a median reduction of 20%", and 77% said the quality of their work improved. The question on tool satisfaction has been asked since Q2 2024. The paper does not say which quarter these figures come from.

**Not measured:** the paper reports no comparison group without Copilot, and the time savings are what respondents stated, not measured time. DORA metrics are being monitored. The authors plan to report the results in a later paper "Once we establish a reliable causality between these metrics and the GitHub Copilot usage". No defect, code quality or security outcomes are reported beyond survey answers.

## What failed

- **Domain logic.** The first observed limitation the paper lists: "Struggles with understanding domain-specific logic, leading to irrelevant or redundant suggestions." Trial participants also reported inconsistent performance on domain-specific or highly innovative tasks.
- **Review cost.** "These limitations negatively impact time savings" because generated code needs extra scrutiny. Developers stressed "the need for rigorous reviews of AI-generated code to mitigate security and quality risks".
- **Integration.** In the trial, implementation challenges "primarily involved technical integration and context management across codebases". In the first assessment, the need to modify suggested code was "reported by 3 out of 5 participants".
- **Unexplained patterns.** On the lower rates for HTML, CSS, JSON and SQL: "We do not know the reason for this difference."
- **Mixed feedback.** One free-text answer, which the paper labels neutral: "Github Copilot is a hit or miss with correct code in VSCode."

The paper also lists risks it has not yet observed, among them sensitive data exposure, intellectual property issues and over-reliance.

## What the team would do differently

The paper states no regrets. Its conclusion says the phased deployment, with security training and policy alignment, "proved effective for managing the transition to AI-assisted development". Future work should look at long-term effects on DORA metrics, code quality and maintenance, and on developer learning. The authors also warn: "It is important to think about how developers should use it and not rely on it too much."

The wiki's reading: acceptance rate and satisfaction show that developers use and like the tool, not that teams ship faster. The four phases, with training and policy sign-off before access, are a reusable rollout pattern; the productivity question needs a comparison group, as in [Online controlled experiments for AI features](#online-experiments) or the trials in [Measuring AI's economic impact](#economic-impact-evidence).

## Disclosure

None.

## Sources

- Gal Bakal, Ali Dasdan, Yaniv Katz, Michael Kaufman and Guy Levin, Zoominfo, [“Experience with GitHub Copilot for Developer Productivity at Zoominfo”](https://arxiv.org/abs/2501.13282), arXiv:2501.13282 [cs.SE], v1 23 January 2025. This page follows the HTML version of v1, including the tables in its figures.

## Related

- [About playbooks](#about-playbooks)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
- [Enterprise readiness](#enterprise-readiness)
- [Measuring AI's economic impact](#economic-impact-evidence)
