---
id: adevinta-se-ai-tooling-evaluation
book: 21
order: "21.46"
title: "Adevinta: a four-week pilot to choose an AI coding assistant"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, coding-agents, developer-productivity, tool-selection, public-record]
visuals: []
type: playbook
account: public-record
industry: "Online marketplaces"
use_case: "Choosing which AI coding assistant to deploy, by piloting GitHub Copilot, Cursor and Claude Code on real backlog tasks"
outcome: "Productivity proxy of ~43% for Claude Code, ~24% for Cursor and ~1% for GitHub Copilot; AI completion rates of 74%, 59% and 44%; Claude Code chosen for deployment"
measured_how: "Actual vs. engineer-estimated cycle time without AI over 165 backlog tasks by 77 engineers in 14 teams, one tool per team, four weeks in May-June 2025, with 95% confidence ranges; no randomization (Adevinta tech blog, March 2026)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> Adevinta piloted GitHub Copilot, Cursor and Claude Code for four weeks in May and June 2025, with 77 engineers in 14 teams working on 165 real backlog tasks. Against the engineers' own estimates of time without AI, Claude Code showed "the largest productivity boost (~43% vs estimated time)", Cursor ~24% and GitHub Copilot ~1%, and Adevinta chose Claude Code. The authors write that "Results are directional" and list limits: tools were assigned by team, and the baseline is the engineers' own estimate.

> [!note] From the public record
> Built from Adevinta's own published account, "A pragmatic evaluation of software engineering AI tooling" (March 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Adevinta has thousands of software engineers across brands such as Leboncoin, mobile.de, Kleinanzeigen and Marktplaats. For such a company, the authors write, "even single-digit improvements translate into millions of euros of capacity a year." Adevinta had already deployed GitHub Copilot, but "we couldn’t conclusively link these tools to productivity gains", and informal tests of other tools were inconclusive. The pilot's goal was to decide which AI tool to deploy.

## Why this approach

The team ran its own pilot citing, among other reasons, "the absence of reliable metrics" and "the amount of marketing hype". The three tools "were industry leaders at the time and had received positive feedback from many informal tests run by our engineers." Existing metrics, such as the DORA metrics some teams tracked, "were not consistent across teams and marketplaces", so tasks were tracked by hand.

"Tools were assigned to teams to minimize disruption, so results reflect real adoption contexts rather than randomized trials." There was no group without AI: GitHub Copilot was already "adopted by 63% of the population", so the authors write that "one can consider this group as the control group". The pilot is not a randomized test of the kind in [Online controlled experiments for AI features](#online-experiments).

## The approach

1. **Set-up.** 77 engineers in 14 product teams across four marketplaces worked for four weeks on backlog tasks "not specifically chosen for the pilot". Each team used one tool, after onboarding training.
2. **Baseline survey.** Of 70 answers, 47.1% used AI tools daily; 62.9% had used GitHub Copilot, 27.1% Cursor and 8.6% Claude Code.
3. **Task tracker.** Before each task, engineers logged its type, area and estimated cycle time without AI. Afterwards they logged the actual cycle time, a rating from 1 to 5 and the outcome: 100% if fully done by AI, 50% if partially, 0% if AI could not help.
4. **Productivity proxy.** Per tool, one minus the sum of actual times over the sum of estimated times, with a 95% confidence interval. "By using this formula, longer tasks will naturally weigh more." See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
5. **Other inputs.** Two surveys, three focus groups, team-leader meetings, cost data and tool telemetry.

## The stack

As of the pilot in May and June 2025: GitHub Copilot, a plugin for IntelliJ and VSCode but not XCode; Cursor, a fork of VSCode; and Claude Code, which the post describes as "only available via CLI without IDE integration". In June 2025, "Cursor and Github Copilot had a flat rate close to 40$ per user and month", while Claude Code was "pay as you go". By default Claude Code picks a model by task complexity; the other two select less powerful models. No models or versions are named. See [The coding-harness landscape](#coding-harness-landscape).

## Results, and how they were measured

Over 165 tasks:

- **Claude Code:** "the largest productivity boost (~43% vs estimated time), higher completion rate (74%) and higher user rating (4.2)." The results table, an image in the post, gives a 95% range of 42.5 to 44.5 over 44 tasks, 3 teams and 17 engineers.
- **Cursor:** "moderate, but meaningful gains (~24%), solid completion rate (59%)", with a rating of 3.6. Table: 23.0 to 24.3; 67 tasks, 7 teams, 25 engineers.
- **GitHub Copilot:** "small, almost negligible productivity gains (~1%), lowest completion rate (44%) and lowest rating (2.8)". Table: 0.5 to 2.7; 54 tasks, 4 teams, 35 engineers.
- **Breakdowns:** Refactoring and Code Migration were the task types where "all tools seem to perform best" "(~40% and 49% productivity respectively)". Only Claude Code gained in Feature Development, "the most commonly executed task (~26% productivity and ~68% completion)". "Intermediate-level users extract 11x more benefit than first-time", a gap that does not exist with Claude Code.
- **Robustness:** without the 5% longest tasks, all from Cursor, "the results remain, directionally, in the same way".

The decision: "we estimated that Claude Code had the best ROI and integrates best within Adevinta workflows", and the post calls deploying it to "our over 2,000 software engineers" a first step.

**Not reported:** the post publishes no results for code quality or the pull request revisions it tracked, no ROI calculation or total costs, no method for the 95% ranges and no follow-up after deployment. The stratified results it refers to in "Appendix 4" are not included.

## What failed

- **Proxy against experience.** GitHub Copilot users said "the productivity result of ~1% did not reflect their experience".
- **Defaults and pricing.** The authors link Claude Code's lead to its default model choice: "the amount of tokens consumed by Claude Code on these models was 60 times larger than the other two tools". "Our 10 users with the highest consumption spent $202 in Claude Code during the month."
- **IDE fit.** Cursor is a fork of VSCode, so many engineers used to IntelliJ (63% of total) or XCode (16%) "needed to learn about its usage". GitHub Copilot does not work in XCode. The authors say this temporary learning curve with Cursor and GitHub Copilot "may also influence our metrics".
- **Early resistance.** "Many users did not want to use Claude Code in the beginning", doubting a CLI tool, but later liked the results.
- **Limits.** Bug Fixing appears in Claude Code "with only 2 tasks". Estimates "can be subjective", the sample is limited, "The study lasted only 1 month", and "All tools have evolved since then."

## What the team would do differently

The post names nothing it would redo. It plans similar pilots of other tools, plus work on automated metrics, training and workflow integration, and concludes that "developing this internal evaluation muscle is a key long-term advantage."

The wiki's reading: by the authors' own explanation, the pilot compares bundles of tool, default model and pricing. A fixed model tier, a no-AI arm and random assignment would separate these effects. The 95% ranges look narrow for samples this size; see [Statistics for evals](#eval-statistics).

## Disclosure

None.

## Sources

- Manuel Sánchez Hernández and Ramón Salvadó Ferrero, Adevinta, [“A pragmatic evaluation of software engineering AI tooling”](https://adevinta.com/techblog/a-pragmatic-evaluation-of-software-engineering-ai-tooling/), Adevinta tech blog, 9 March 2026.

## Related

- [About playbooks](#about-playbooks)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [The coding-harness landscape](#coding-harness-landscape)
- [Statistics for evals](#eval-statistics)
- [Online controlled experiments for AI features](#online-experiments)
