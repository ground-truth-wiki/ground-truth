---
id: anz-bank-copilot-study
book: 21
order: "21.37"
title: "ANZ Bank: a controlled GitHub Copilot experiment before rollout"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [banking, developer-tools, code-completion, randomized-trial, developer-productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "Banking (Australia and New Zealand Banking Group)"
use_case: "Testing GitHub Copilot in a six-week controlled experiment with the bank's engineers before deciding on a wider rollout"
outcome: "Copilot group completed Python challenges 42.36% faster by self-reported time; unit test success ratio 12.86% higher but not statistically significant; security effect could not be measured"
measured_how: "Self-reported minutes per challenge in an A/B test with randomly split groups that swapped after one week, 172 data points used for the statistical analysis (over 100 participants in the experiment overall), mid-June to end of July 2023, plus unit tests and SonarQube scans (Chatterjee et al., ANZ Bank, arXiv, April 2024)"
prerequisites: [measuring-ai-impact, online-experiments]
replications: []
---
> [!tldr]
> ANZ Bank ran a six-week experiment with GitHub Copilot from mid-June to the end of July 2023, before adopting it at scale. In the A/B phase, the Copilot group finished short Python challenges "42.36% faster" by self-reported time, a gain in unit test success was not statistically significant, and the effect on security could not be measured.

> [!note] From the public record
> Built from ANZ Bank's own published account, "The Impact of AI Tool on Engineering at ANZ Bank An Empirical Study on GitHub Copilot within Corporate Environment" (April 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

ANZ Bank "employs over 5000 engineers covering all aspects of the software development life cycle". The authors name risks of AI tools for intellectual property, data security and privacy, and conclude: "It is, therefore, crucial to measure the quantitative and qualitative benefits of AI Tools prior to large scale adoption." The experiment was to serve as a guide for adopting AI pair programming tools at ANZ Bank, from experiment to large scale, and to collect statistical measures of productivity, code quality and code security.

## Why this approach

The paper names Code Whisperer as another tool on the market. It says GitHub Copilot "stands out as one of the pioneers in this domain" and gives its early market entry and its features as the reasons for the choice. The paper cites a tool comparison by other researchers, but it describes no comparison of tools run by ANZ.

The team ran an A/B test against a null hypothesis of no difference, and several design decisions narrowed the setting. Visual Studio Code was the only IDE, Python the only language in the test weeks, and because participants had limited time, the tasks were algorithmic questions "instead of application development scenarios typical of workplace challenges". Participants were not actively monitored, so the team "relied on self-reported time and feedback about experience". See [Online controlled experiments for AI features](#online-experiments).

Beforehand, the risks were assessed with ANZ's legal and security teams to arrive at guidelines, and participants had to agree to a Playbook before they began. [Enterprise readiness](#enterprise-readiness) covers controls of this kind.

## The approach

The experiment "ran over six weeks from mid-June’23 to the end of July’23": two weeks of preparation, then four weeks of execution.

1. **Preparation:** a baseline survey.
2. **Phase 1, weeks 1 and 2:** participants used Copilot on proposed use cases and answered a survey every second day.
3. **Phase 2, weeks 3 and 4:** baseline respondents were "divided randomly in half" into a Control group, with the Copilot extension disabled but internet search and Stack Overflow allowed, and a Copilot group. The groups were reversed in week 4. Each week brought six algorithmic Python challenges. One per week tested secure coding: password hashing with a random salt, and a FastAPI endpoint that had to check its input against injection. A survey followed each solution.

## The stack

As of the experiment, mid-June to the end of July 2023 (paper version of 17 April 2024): GitHub Copilot's Visual Studio Code extension, which the paper describes as based on Generative Pre-trained Transformer (GPT) technology. Also: ANZ GitHub repositories, unit test scripts, SonarQube static code analysis, Copilot usage metrics, online surveys and the Wilcoxon Signed Rank Test. The paper does not name a Copilot plan or model version.

## Results, and how they were measured

From 200 Phase 2 data points, the team removed 6 duplicates and 22 where participants could not solve the problem: "Remaining 172 data points were used for all the statistical analysis". Over 100 people took part, mainly software, cloud and data engineers. Tests were one-sided with an alpha value of 0.05.

- **Speed.** Mean time per problem was 30.98 minutes for Control and 17.86 for Copilot. The Copilot group was "able to complete their tasks 42.36% faster than the control group participants", and "This result is statistically significant." The paper's own calculation from these means states 42.34%. The test table lists a sample size of 22 and a p-value of 0.001. By proficiency, the improvement was 52.27% for Beginner, 41.6% for Intermediate and 40.48% for Advanced (the paper counts Novice as Beginner and Expert as Advanced here).
- **Quality.** "methods written by Copilot Group participants had 12.86% more success ratio than methods written by Control group users". "However, this result is not statistically significant." For bugs and code smells, each with a sample size of 17, the null hypothesis was rejected.
- **Security.** "The SonarQube code review generated only 1 non-zero data point against Vulnerabilities."
- **Sentiment, Phase 1.** Median answers were positive but moderate, such as "a bit less time" debugging and "somewhat helpful" suggestions: "in none of the surveyed areas did the median participant respond with the maximum degree of positivity".
- **Rollout.** "Early data from 1000 engineers also indicated a significant increase in productivity and job satisfaction."

**Not measured:** time was self-reported, not observed, on short challenges rather than workplace projects. The paper reports no results for the Copilot usage metrics it planned to collect, such as acceptance rates. The claim about 1000 engineers comes with no metric, method or period.

## What failed

- **Engagement.** "participation rates fluctuated significantly across these tasks", which the authors say makes the findings hard to generalize.
- **Tasks too small for static analysis.** "there was little room for bugs and vulnerabilities to exist, as the questions were atomic and short". The summary: "The experiment could not generate meaningful data which would measure code security."
- **Bias.** Participants may have under-reported their time, which the authors assume affected both groups equally. Sentiment may be inflated because "those who volunteered for the Copilot experiment did so because they were interested or enthusiastic about the tool".

## What the team would do differently

For a repeat, "a project-style task, reflecting a more concrete development goal, might be more suitable". Subject to further security analysis, "it is recommended to productionise GitHub Copilot at ANZ Bank". When the paper was written, Copilot had "over 1,000 users" there.

The wiki's reading: the paper is not fully consistent. Its summary calls the impact on code quality "statistically and practically significant", while section 4.9.2 calls the unit test result not significant, and its limitations say the scan could reasonably measure only code smells, although Table 2 reports a significant result for bugs. The paper does not explain how the test sample sizes of 22 and 17 relate to the 172 data points. The design (random split, swapped groups, fixed tasks, a stated hypothesis) is reusable; logged time and real work items would make the result stronger. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) and [Statistics for evals](#eval-statistics).

## Disclosure

None.

## Sources

- Sayan Chatterjee, Ching Louis Liu, Gareth Rowland and Tim Hogarth, ANZ Bank (The Australia and New Zealand Banking Group Limited), [“The Impact of AI Tool on Engineering at ANZ Bank An Empirical Study on GitHub Copilot within Corporate Environment”](https://arxiv.org/abs/2402.05636v2), arXiv:2402.05636, v2 17 April 2024 (v1 8 February 2024). The arXiv record lists it "in proceeding for 10th International Conference on Software Engineering (SEC 2024)". This page follows the PDF of v2.

## Related

- [About playbooks](#about-playbooks)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
- [Statistics for evals](#eval-statistics)
- [Measuring AI's economic impact](#economic-impact-evidence)
