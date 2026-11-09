---
id: hmrc-copilot-evaluation
book: 22
order: "22.29"
title: "Microsoft 365 Copilot at HMRC: a randomised licence trial"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, workplace-assistants, productivity, randomized-trial, public-record]
visuals: []
type: field-note
account: public-record
industry: "Public sector (UK government department)"
use_case: "Full Microsoft 365 Copilot licences randomly allocated to 3,000 staff in roles that mainly use MS Office products"
outcome: "Participants self-reported saving 2-3% of their working week, around 60 minutes per week for a full-time equivalent working pattern; average satisfaction 7.1 out of 10; 83% of staff allocated a licence used it"
measured_how: "Survey of 1,364 users (45% of those randomly allocated a licence), plus Microsoft Viva Insights usage data, focus groups with 35 participants and a task-based exercise with 49 participants; Phase III trial, September to December 2024 (HMRC evaluation summary, July 2026)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> HM Revenue & Customs (HMRC) randomly allocated 3,000 full Microsoft 365 Copilot licences from September to December 2024 and surveyed the users. On average, participants "self-reported saving 2-3% of their working week", and the report says self-reported time-saving estimates were reduced by approximately 20%, because not all licence holders used Copilot and survey respondents were more likely to be active users. The report says the time-saving figures should be treated as a baseline estimate, not a precise measure of impact.

> [!note] From the public record
> Built from HM Revenue & Customs' own published account, "Evaluating the Impact of Microsoft Copilot in HMRC" (July 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The report describes Microsoft 365 Copilot as "Microsoft’s licensed AI-powered assistant", built on large language models and working across apps like Word, Outlook and Teams. It summarises "one phase of an ongoing evaluation of Copilot" in HMRC and the Valuation Office Agency (VOA), which merged with HMRC on 1 April 2026.

The trial ran in three phases. Two initial phases in mid-2024, of one month and three months, involved 300 self-selected staff, who were asked to complete surveys on user satisfaction and time savings. Phase III, the most comprehensive, ran from September to December 2024 and evaluated the value of staff having a full Copilot licence integrated with MS Office tools. Early HMRC results also informed the report from the Government Digital Service (GDS), which led a wider cross-government trial involving 11 participating departments.

## What happened

In Phase III, 3,000 licences were allocated at random to colleagues in roles that mainly used MS Office products, "proportionate to business group distributions". A further 500 went directly to selected volunteers, for use as a reasonable adjustment or because they had volunteered for earlier phases.

The primary data source was a survey completed by 1,364 users, "45% of those colleagues randomly allocated a license". HMRC added usage statistics from the Microsoft Viva Insights dashboard, focus groups with 35 participants, and a task-based exercise with 49 participants.

## Impact, and how it was measured

The report's overall verdict: "The trial results were largely positive, showing strong staff uptake, satisfaction, and time saving benefits".

- **Uptake.** "83% of staff allocated a license made use of it during the trial period". 64% of users reported that their use of Copilot increased over the course of the trial.
- **Satisfaction.** "the average satisfaction score was 7.1 out of 10". 68% of users agreed that Copilot was easy to use and integrated well into their workflow, and 61% reported that they would be disappointed to lose their licence.
- **Time savings.** "on average, HMRC participants self-reported saving 2-3% of their working week", which the report equates to "around 60 minutes per week for a full-time equivalent working pattern". Reported savings were consistent across business groups and professions.
- **Bias adjustment.** "self-reported time-saving estimates were reduced by approximately 20%", because not all licence holders used Copilot and respondents were more likely to be active users. The figures "should be treated as a baseline estimate rather than a precise measure of impact".
- **Use.** The most used functions were "drafting documents in Word (53%) and collaborating on Teams (45%)". Users found it particularly useful for summarising meetings, searching for documentation, and writing code and Excel formulae.
- **Projection.** At the time of writing, analysts estimated that deploying up to 50,000 Copilot licences "until March 28" would generate "around £50m of capacity generating, net productivity benefits per year".

For comparison, the report cites the GDS cross-government trial (published June 2025), which involved over 20,000 civil servants and reported average time savings of around 26 minutes per day.

**Not stated:** the time savings are self-reported, and the summary publishes no comparison with staff without a licence, no measure of the quality of Copilot's output and no results from the task-based exercise. It does not say whether the 2-3% figure is before or after the 20% reduction, or whether the 83% includes the 500 directly allocated licences. It gives no licence cost and no method for the £50m estimate.

## Why it happened

HMRC calls its time-saving gains "more conservative" than the GDS trial's, reflecting "a deliberately cautious methodology", including a randomised cohort design, strict measurement standards and generally more diverse operational roles than in the GDS trial.

Under challenges and concerns, the report lists:

- **Trust.** "46% of non-users selected security and data privacy concerns as the main reason for not using their license". The number of non-users is not stated.
- **Data classification.** At the time of the trial, participants "could only use Copilot on material below Official Sensitive classification".
- **Skills.** Staff needed more practical and tailored training, and time to learn.

## What changed afterwards

The report does not describe changes made after the trial. It says the trial identified "areas for further training and guidance" and calls the work an ongoing evaluation. Beyond the analysts' estimate for up to 50,000 licences, it does not state a deployment decision.

## Lessons

The report has no lessons section.

The wiki's reading: these points are for teams that roll out a workplace assistant. The closest the report comes to a lesson is how to read its time-saving figures, as a baseline estimate from a deliberately cautious method.

- **Random allocation is only half of the design.** Random allocation removed the self-selection of the earlier phases, but the headline saving still comes from a survey answered by 45% of the randomised group. Measuring staff without a licence in the same way would give a comparison group. See [Online controlled experiments for AI features](#online-experiments) and [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **State corrections and where they apply.** The 20% reduction is a good habit, more useful when readers see which figures it changed. See [Statistics for evals](#eval-statistics).
- **Design changes the number.** HMRC and GDS studied the same tool and reported different time savings, and HMRC attributes the difference to method and roles. See [Measuring AI's economic impact](#economic-impact-evidence).
- **Data rules shape adoption.** 46% of non-users chose security and data privacy concerns as their main reason for not using the licence, and use was limited to material below Official Sensitive. See [Enterprise readiness](#enterprise-readiness).

## Disclosure

None.

## Sources

- HM Revenue & Customs (no individual authors named), [“Evaluating the Impact of Microsoft Copilot in HMRC”](https://www.gov.uk/government/publications/evaluation-report-phase-3-trial-of-microsoft-copilot/evaluating-the-impact-of-microsoft-copilot-in-hmrc), research and analysis, GOV.UK, published 9 July 2026.

## Related

- [About field notes](#about-field-notes)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Measuring AI's economic impact](#economic-impact-evidence)
- [Online controlled experiments for AI features](#online-experiments)
- [Enterprise readiness](#enterprise-readiness)
