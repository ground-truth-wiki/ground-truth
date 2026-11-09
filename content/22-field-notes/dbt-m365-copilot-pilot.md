---
id: dbt-m365-copilot-pilot
book: 22
order: "22.25"
title: "Microsoft 365 Copilot in a UK government department: the pilot evaluation"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, workplace-assistants, productivity, evaluation, public-record]
visuals: []
type: field-note
account: public-record
industry: "Public sector (UK central government)"
use_case: "1,000 Microsoft 365 Copilot licences for UK-based staff, used for meetings, email, drafting, summarising, slides and data analysis"
outcome: "72% of diary respondents satisfied or very satisfied; small self-reported time savings on most use cases; no evidence that time savings led to improved productivity"
measured_how: "Diary study of 300 licence holders (32% response rate) in November 2024, Microsoft usage data for the October to December 2024 pilot, interviews with 19 people and 11 observed task sessions (Department for Business and Trade evaluation report, August 2025)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> The UK Department for Business and Trade allocated 1,000 Microsoft 365 Copilot licences to UK-based staff for a 3-month pilot and evaluated it with a diary study, usage data, interviews and observed tasks. Most diary respondents were satisfied and most use cases showed small self-reported time savings, but "The evaluation did not find evidence that time savings have led to improved productivity". In a small set of observed tasks, Copilot users wrote better summaries and emails but produced worse Excel analysis and slides.

> [!note] From the public record
> Built from the Department for Business and Trade's own published account, "The Evaluation of the M365 Copilot Pilot in the Department for Business and Trade" (August 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The report describes M365 Copilot as a browser chatbot plus Copilot embedded in applications such as Outlook, Teams, Word and Excel. At the Department for Business and Trade (DBT), 1,000 licences went to UK-based staff for a 3-month pilot from October to December 2024: around 70% to volunteers and around 30% to a random sample stratified by directorate group and grade.

The Digital Data and Technology Monitoring and Evaluation team ran the evaluation from October 2024 to March 2025, aiming "to understand the risks and benefits of deploying M365 Copilot across the department". The report calls its design a "theory-based and evidence-without-a-counterfactual evaluation".

## What happened

1. **October 2024.** Licences were allocated.
2. **November 2024.** Licence holders kept a one-week diary. For each Copilot task they recorded the time taken and an estimate of the time without Copilot. The analysis counted tasks whose output went unused, or that were done only because of the licence, as negative time saved. 300 diaries were analysed, "representing a 32% response rate".
3. **30 December 2024.** The pilot period ended.
4. **February to March.** The team interviewed 13 pilot participants and ran a focus group with non-users. In 11 observed sessions, staff with and without Copilot did the same fictional tasks, and a second analyst blind-scored each output from 1 to 5.
5. **28 August 2025.** The report was published on GOV.UK.

## Impact, and how it was measured

- **Uptake.** From Microsoft's dashboard, 01 October to 30 December 2024: "The mean percentage of daily active users was 21%, or 30% when weekends and bank holidays are excluded."
- **Satisfaction.** "72% of respondents reporting being satisfied or very satisfied with M365 Copilot throughout the pilot period" (N = 300), with a Net Promoter Score of 31 (N = 244). 19% did not answer the satisfaction question.
- **Time savings.** Drafting written documents saved the most, "with a mean time saving of 1.3 hours per task". Scheduling came out at -0.6 hours and generating images at -0.5 hours per task, so both took longer with Copilot. The adjusted figures cover 1,411 reported tasks.
- **Productivity.** "The evaluation did not find evidence that time savings have led to improved productivity". The report adds that this "was not a key aim of the evaluation and therefore limited data was collected".
- **Observed tasks.** Copilot users wrote summaries and emails faster and to a higher quality and accuracy than non-users. But "M365 Copilot users completed Excel data analysis more slowly and to a worse quality and accuracy than non-users", with mean accuracy 1.5 against 2.7. Slides were made "over 7 minutes faster on average" but scored 1.5 against 5 for accuracy. Each task had 3 Copilot users and 2 or 3 non-users.
- **Hallucinations.** "22% of respondents did identify hallucinations, and 11% of respondents were unsure if they encountered hallucinations". The report also found "inconsistencies in quality assuring M365 Copilot outputs across pilot participants and task types".

**Not measured:** the time savings are self-reported with no counterfactual: there was no data from before the pilot, and the control group took part only in interviews and observed tasks. The report says the observed sessions "show similar trends to those reported by pilot participants" but had "a very small sample size". Long-term impacts, value for money and environmental impact were not assessed in the report.

## Why it happened

The report names these causes:

- **Extra time** on some tasks came mainly from Copilot being unable to produce high-quality outputs, or from extra work done only because users had a licence.
- **Fit with the role.** Interviewees felt Copilot best suited roles with a heavy administrative burden. Roles that need "contextual awareness, nuance, and attention-to-detail, such as Legal and Policy roles" found it less suitable.
- **Training.** Formal sessions were viewed positively but often as introductory or high-level. Respondents with at least 2 hours of self-led training were more likely to be satisfied and to recommend Copilot, "to a 99% confidence level".
- **Barriers.** Use was sometimes limited by ethical concerns, particularly environmental impact, anecdotally by hesitant colleagues and line managers, and by caution among users unsure of the policies.
- **Uneven checking.** Some users said they may not review outputs thoroughly if they were not sharing them.

## What changed afterwards

The findings "will feed into a series of internal recommendations and next steps", which the report does not publish. As of the report, the department was developing environmental impact costing methods and running a value for money assessment. Licences were removed when the pilot ended, and licence holders "generally wanted the department to continue using M365 Copilot". The report does not say what the department decided.

## Lessons

The source's own conclusion: "Time savings are evident, albeit in small quantities, and do not necessarily lead to productivity improvements." Outputs are mostly accurate, but "hallucinations do occur, and quality assurance should be conducted to review each output".

The wiki's reading:

- **Time saved is not value created.** Decide before a pilot how outcomes, not only minutes, will be measured. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) and [Measuring AI's economic impact](#economic-impact-evidence).
- **Design the comparison in.** A randomised or staggered rollout would give self-reported numbers a baseline. See [Online controlled experiments for AI features](#online-experiments).
- **Report by task, not by tool.** The same licence saved time on drafting, cost time on scheduling and lowered quality on observed Excel analysis.
- **Design the checking.** With review left to individual habit, checking must be built into the workflow. See [Hallucination and factuality](#hallucination-factuality) and [Human in the loop](#human-in-the-loop).

## Disclosure

None.

## Sources

- Digital Data and Technology Monitoring and Evaluation team, Department for Business and Trade, [“The Evaluation of the M365 Copilot Pilot in the Department for Business and Trade”](https://assets.publishing.service.gov.uk/media/68adbe409e1cebdd2c96a19d/dbt-microsoft-365-copilot-evaluation.pdf), corporate report, August 2025. Published on GOV.UK on 28 August 2025 under [“Microsoft 365 Copilot pilot: DBT evaluation report”](https://www.gov.uk/government/publications/microsoft-365-copilot-pilot-dbt-evaluation-report).

## Related

- [About field notes](#about-field-notes)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Measuring AI's economic impact](#economic-impact-evidence)
- [Hallucination and factuality](#hallucination-factuality)
- [Online controlled experiments for AI features](#online-experiments)
