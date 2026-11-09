---
id: gds-m365-copilot-cross-government
book: 22
order: "22.28"
title: A three-month Microsoft 365 Copilot trial across UK government
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, workplace-assistants, productivity, self-reported-metrics, public-record]
visuals: []
type: field-note
account: public-record
industry: "Public sector (UK central government)"
use_case: "Microsoft 365 Copilot licences for 20,000 government employees in 12 organisations, for three months"
outcome: "Self-reported average time saving of 26 minutes a day; adoption rate of around 80% maintained for the rest of the trial; 17% noticed no clear time savings"
measured_how: "Survey towards the end of the trial with 7,115 responses (time saved chosen from ranges, averaged by range midpoints), M365 Copilot dashboard usage data, and anonymised user data for 14,500 users, 30 September to 31 December 2024; no control group described (Government Digital Service, June 2025)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> The UK's Government Digital Service (GDS) gave Microsoft 365 Copilot to 20,000 government employees in 12 organisations from 30 September to 31 December 2024. The report finds that "Trial participants saved an average of 26 minutes a day when using M365 Copilot", but it says these savings are self reported, and it describes no control group. It says training was essential and human oversight was required at all times, and it found a correlation between familiarity with AI and time savings.

> [!note] From the public record
> Built from the Government Digital Service's own published account, "Microsoft 365 Copilot Experiment: Cross-Government Findings Report" (June 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

GDS ran the trial within the government's initiative to drive AI adoption across the public sector. From 30 September 2024 to 31 December 2024, 20,000 government employees received an M365 Copilot licence, and each organisation committed to at least 1000 licences. The 12 organisations included the Department for Work and Pensions, His Majesty’s Revenue & Customs, the Home Office, the Welsh Government and Companies House. Earlier trials and pilots had been limited to 300 licences at most. The report defines value as "improvements in efficiency, task completion rates, and overall user satisfaction".

The stack, as of the report: M365 Copilot works inside Word, Excel, PowerPoint, Outlook and Teams, and through Copilot Chat. It reaches documents through OneDrive with [retrieval augmented generation](#rag-fundamentals) and only retrieves documents the user could normally access, which "may highlight issues when users have access to files they shouldn’t". Access to the internet is off by default, and most organisations in the trial limited the tool so it relied solely on internal data sources.

## What happened

1. **Rollout.** Licences went out within October alongside change management activities, and the adoption rate rose to 83%. Internal priorities delayed some licences until the end of the first month.
2. **Usage.** "Adoption of around 80% was maintained for the remainder of the experiment", counting users with at least one interaction in the previous 30 days. Teams reached a maximum adoption of 71%, while Excel peaked at 23% and PowerPoint at 24%.
3. **Changes mid-trial.** M365 Copilot Agents arrived partway through and were left out of the research, and the app was renamed M365 Copilot Chat.
4. **December.** The festive period disrupted the final month, and for some users the trial "effectively became shorter".
5. **Data collection.** A survey near the end drew 7,115 responses, and five focus groups covered Finance, HR, Operational Delivery, Digital and Data, and Policy. Usage metrics came from the M365 Copilot dashboard, and anonymised user data was collected for 14,500 users.

## Impact, and how it was measured

- **Time saved.** "On average, users observed a time saving of 26 minutes per day." Users picked a range from ‘none or less than 5 minutes’ to ‘more than an hour’, and "This estimate was calculated by using the middle point of each range, with the largest savings being estimated at 60 minutes." If this were replicated across a full working year, the report says, "users could save 13 days".
- **Spread.** Only 17% did not notice "any clear time savings". Drafting documents saved 24 minutes, creating presentations 19 minutes, and communication tasks such as scheduling meetings 9 minutes. 8 of the 15 professions saved at least 26 minutes per day on average.
- **Sentiment.** Average satisfaction was 7.7 out of 10 and recommendation 8.2 out of 10, with "82% expressing they would not want to return to their pre-Copilot working conditions".

The report itself says "The time savings presented throughout are self reported" and should be "considered alongside additional literature on the true value of these metrics".

**Not measured:** the report describes no control group or comparison with staff without licences, no direct measure of output quality or error rates, and no licence cost or return on investment. It states that "it was not possible to identify how time saved was spent", and Copilot Agents were out of scope.

## Why it happened

The report links benefits to familiarity: "Professions and departments with the lowest familiarity and confidence in AI tools saw lower benefits and time savings". Policy teams struggled with nuance and with sources that held contrasting opinions; a policy participant said the tool "struggles with nuanced or context-heavy data requiring human judgement." In the report's words, "Perceived concerns with security and the handling of sensitive data led to reduced benefits in a minority of cases."

Centralised management was not feasible at this scale, so departments handled user support and "user experience was not consistent across the experiment group". Staff capacity, the finite trial period and the late licences may have limited adoption. The report's view is that "these factors have not changed the overall outcome and positive findings about M365 Copilot’s value".

## What changed afterwards

During the trial, bite sized training videos were introduced to address limited user capacity. The report notes that the trial was marketed as a finite period, with "access being removed after the trial". It does not say whether a wider rollout was decided. It records that many departments were eager to explore Copilot Agents further.

## Lessons

The source's own conclusions: "Human oversight was required at all times to ensure maximum benefits and reduce risks in its use." Training was essential to achieve the benefits, and the correlation between a user's confidence and familiarity with AI and time savings highlights the need for "well thought out change management programmes, including communications, engagement and training".

The wiki's reading:

- **Treat self-reported time as perception.** A midpoint average of chosen ranges, without a comparison group, shows how users judge their own speed. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Check permissions before rollout.** An assistant that searches with each user's access can surface files people can open but should not. See [Data quality and governance](#data-governance).
- **Keep people in sensitive decisions.** An HR participant raised concern about output accuracy in grievance handling and performance evaluations. See [Human in the loop](#human-in-the-loop).

## Disclosure

None.

## Sources

- Government Digital Service (no individual authors named), [“Microsoft 365 Copilot Experiment: Cross-Government Findings Report (HTML)”](https://www.gov.uk/government/publications/microsoft-365-copilot-experiment-cross-government-findings-report/microsoft-365-copilot-experiment-cross-government-findings-report-html), corporate report, GOV.UK, published 2 June 2025.
- Government Digital Service, [“Microsoft 365 Copilot Experiment: Cross-Government Findings Report”](https://www.gov.uk/government/publications/microsoft-365-copilot-experiment-cross-government-findings-report), publication page with summary, GOV.UK, 2 June 2025.

## Related

- [About field notes](#about-field-notes)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Measuring AI's economic impact](#economic-impact-evidence)
- [Enterprise readiness](#enterprise-readiness)
- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
