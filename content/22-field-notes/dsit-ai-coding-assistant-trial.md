---
id: dsit-ai-coding-assistant-trial
book: 22
order: "22.26"
title: "A UK cross-government trial of AI coding assistants"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, coding-assistants, developer-productivity, surveys, public-record]
visuals: []
type: field-note
account: public-record
industry: "Public sector (UK central government)"
use_case: "GitHub Copilot and Gemini Code Assist trial licences for government software engineers and developers"
outcome: "Average self-reported saving of 56 minutes per working day; average acceptance rate of 15.8% for suggested code lines (GitHub Copilot telemetry); 39% of users reported committing suggested code"
measured_how: "Surveys (424 responses from 31 departments) and telemetry from the tools' dashboard (primarily GitHub Copilot), November 2024 to February 2025, no comparison group described (GDS and DSIT findings report, September 2025)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> From November 2024 to February 2025, the UK Government Digital Service gave government developers trial licences for GitHub Copilot and Gemini Code Assist. Survey respondents reported saving "an average of 56 minutes a working day", while GitHub Copilot telemetry showed an average acceptance rate of 15.8% for suggested code lines and only 39% of users said they committed suggested code. The saving is self-reported, and the report lists its own limits.

> [!note] From the public record
> Built from the Government Digital Service's own published account, "AI coding assistant trial: UK public sector findings report" (September 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The report says the Government Digital Service (GDS) is conducting trials into the capabilities of commercial AI tools, as part of the government's initiative to increase AI adoption across the public sector. Its report notes that "little research has been done on the use of these tools within the public sector specifically", so the trial set out to assess what AI coding assistants could do for people across the Civil Service.

In July 2024, an internal commercial analysis assessed off-the-shelf assistants. GDS found GitHub Copilot and Gemini Code Assist "the most mature tools at the time of the trial", and adds that the market is very dynamic and that other tools now meet the same needs. The report does not name the underlying models or versions.

"In total, 2,500 trial licences were distributed across more than 50 UK public sector organisations." Of these, 1,900 were assigned, including 1,600 GitHub Copilot business licences, of which 1,100 were redeemed, and 323 Gemini Code Assist licences, with 173 redeemed.

## What happened

The trial ran for 3 months, from November 2024 to February 2025. The report was published on 12 September 2025. GDS assessed the trial with surveys and telemetry, and also ran interviews:

1. **Surveys** at the start, middle and end. "For the main analysis, 424 survey responses were collected from users in 31 departments, with 33 distinct job titles." 73% of respondents reported 5 or more years of coding experience. Participants estimated the time they saved each day, choosing from 0 to 120 minutes in 10 minute steps.
2. **Telemetry** from the tools' dashboard: daily active users, chat interactions and the acceptance rate of code suggestions, primarily for GitHub Copilot because of availability.
3. **Interviews**: 8 in the final phase, plus success stories from departments.

The analysis assumes a representative survey sample, similar workloads across staff in scope, and the standard 37 working hours a week, with 5 weeks of annual leave.

## Impact, and how it was measured

- **Time saved (survey).** "On average, users reported time savings of 56 minutes per working day", which the report equates to "approximately 28 working days saved per user annually". Of the daily figure, 24 minutes were associated with creating code or analysis, 21 minutes with reviewing it and 10 minutes with learning. 28% of users reported saving between 31 and 60 minutes per day, 38% reported saving more than one hour daily, and "8% noted no significant time saving".
- **Usage (GitHub Copilot telemetry).** An average of 418 active users each day generated approximately 2,298 daily chat interactions. "On average, 15.8% of code lines were accepted", which the report calls "slightly lower than industry reports".
- **Committed code (self-reported).** "Only 39% of users reported that they committed code suggested by the AICA."
- **Satisfaction (survey).** "The average overall satisfaction rating was 6.6 out of 10." 58% of respondents would prefer not to do their job without the assistant.

**Not measured:** the report describes no comparison group working without the tools, no measured output such as pull requests or delivery times, and nothing on code quality, defects or security. It gives no licence costs and no telemetry results for Gemini Code Assist. Every time-saving figure is the participants' own estimate.

## Why it happened

The report names the limits on its own numbers:

- **Self-reported time.** Estimates for different tasks may overlap, and "It is also possible that survey respondents overestimated time saved due to optimism bias."
- **Telemetry gap.** Data was missing for the second month of the pilot, which may affect the analysis of usage trends.
- **Survey design.** Skipped satisfaction questions were scored as 0, which might slightly underestimate satisfaction, and individuals were not tracked across the three surveys, so changes over time were hard to compare.
- **Uneven rollout.** The trial was marketed as access for the trial period only, so some users may have held back. Engagement depended on sponsorship in each organisation, and internal priorities delayed the full distribution of some licences until the end of the first month. As a result, "user experience was not consistent across the trial group and adoption might have been impacted".
- **Timing.** The festive period disrupted the central month and reduced the availability of users and departmental resources.

The report gives no reason for the acceptance rate or the commit figure.

## What changed afterwards

The report does not announce a rollout. It states: "This trial will not influence ongoing or future procurement activities." It suggests further work to explore impact across experience levels and to "refine methods for measuring time savings", and notes that it does not cover long-term use.

## Lessons

The source's own conclusion: "While acknowledging the limitations in the data, the findings strongly suggest that AICAs are valuable tools", which the report says can increase productivity and efficiency for government developers and engineers.

The wiki's reading:

- **Self-reports and telemetry can tell different stories.** Reported time savings and an acceptance rate measure different things, and neither measures delivered output. Only a comparison group or a randomized design attributes a change to the tool. See [Online controlled experiments for AI features](#online-experiments) and [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Annual figures carry their assumptions.** Turning daily minutes into working days per year depends on a representative sample and a standard calendar. See [Measuring AI's economic impact](#economic-impact-evidence).
- **Plan the measurement before the licences go out.** Tracking the same people across surveys, keeping telemetry for every tool and month, and starting everyone together would address several limits the report names. See [Statistics for evals](#eval-statistics).

## Disclosure

None.

## Sources

- No named authors. Department for Science, Innovation & Technology and Government Digital Service, independent report, [“AI coding assistant trial: UK public sector findings report”](https://www.gov.uk/government/publications/ai-coding-assistant-trial/ai-coding-assistant-trial-uk-public-sector-findings-report), GOV.UK, published 12 September 2025.

## Related

- [About field notes](#about-field-notes)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Measuring AI's economic impact](#economic-impact-evidence)
- [Online controlled experiments for AI features](#online-experiments)
- [Coding agents](#coding-agents)
