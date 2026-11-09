---
id: ofqual-2020-grading-algorithm
book: 22
order: "22.32"
title: Ofqual's 2020 grading model and the switch to teacher grades
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, education, statistical-models, fairness, public-record]
visuals: []
type: field-note
account: public-record
industry: "Public sector (exam regulation, England)"
use_case: "A statistical standardisation model, the Direct Centre Performance model, that adjusted teachers' centre assessment grades for GCSE, AS and A level in summer 2020"
outcome: "96.4% of final calculated grades were the same as, or within one grade of, the teacher-submitted grade; on 17 August 2020 Ofqual decided to award the teacher grade or the moderated grade, whichever is higher"
measured_how: "Share of A level CAGs unadjusted or adjusted by grade (718,276 entries, summer 2020) and a backtest on 2019 results (Ofqual interim report, 13 August 2020)"
prerequisites: [fairness-bias]
replications: []
---
> [!tldr]
> With exams cancelled in 2020, Ofqual used a statistical model to adjust the grades teachers submitted, so that national results stayed close to previous years. Its interim report says 96.4% of final grades were the same as, or within one grade of, the teacher grade, and finds no evidence of introduced bias. On 17 August 2020 Ofqual switched to teacher grades, saying the approach had "damaged public confidence".

> [!note] From the public record
> Built from Ofqual's own published accounts, "Awarding GCSE, AS & A levels in summer 2020: interim report" (August 2020) and "Statement from Roger Taylor, Chair, Ofqual" (August 2020), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Ofqual's interim report says that on 18 March 2020 the Secretary of State announced that the summer 2020 exam series would be cancelled. On 23 March, the government's stated intention was that exam boards would produce calculated grades, "ensuring the distribution of grades follows a similar pattern to that in other years".

For each student in each subject, Ofqual asked teachers for a centre assessment grade (CAG), the grade the student would most likely have achieved, and a rank order of students. Schools and colleges submitted "over 5 million CAGs and rank order positions in early June 2020". Ofqual's first analysis found the CAGs "in general, optimistic (although not always)".

## What happened

In April and May, Ofqual and technical experts tested standardisation models on data from previous years; the full report compares 11 approaches. Ofqual chose the most accurate one that did "not systematically affect groups of students with particular protected characteristics", and also weighed consistency across all four exam boards and ease of explanation.

As of August 2020, the Direct Centre Performance model (DCP) took a centre's past grade distribution in the subject, adjusted it for the prior attainment of this year's students against past ones, and assigned grades in the centre's rank order. AS and A level used three years of historical data, GCSE one or two. Where a centre had "fewer than 15 students when looking across the current entry and the historical data", the model put more weight on the CAGs. The report names no software.

Ofqual published the interim report on 13 August 2020. On 17 August, Ofqual's chair said students "were awarded exam results last week for exams they never took", and announced the switch to teacher grades.

## Impact, and how it was measured

- **Agreement with teacher grades.** "Across all subjects and all centres, 96.4% of final calculated grades are the same as, or within one grade of the CAG submitted." For 718,276 A level entries, the full report gives 58.7% unadjusted, 35.6% adjusted down by 1 grade, 3.3% down by 2, 0.2% down by 3 or more, 2.2% up by 1, and <0.1% each up by 2 and up by 3 or more (rounded to 1 decimal place).
- **National results.** "Overall, A level results in England have increased by 2.4% at grade A and above compared to 2019." The report sets this against a 1% decrease between 2018 and 2019. Had grades followed the CAGs, A* grades at A level would have gone from 7.7% in 2019 (England only) to 13.9%.
- **Backtest.** On 2019 results, "51 of the 55 A levels tested had accurate predictions for more than 90% of students within plus or minus one grade", once entries from schools and colleges with fewer than 10 entries in the subject were removed. The figure was lower for GCSE (12 out of 22 subjects); the report cites the longer GCSE grade scale and "some limitations of the testing".
- **Equalities.** "The analyses show no evidence that this year’s process of awarding grades has introduced bias." Annex Q finds by socio-economic status (SES) that "The levels of adjustment are similar across groups and vary across the grade range." At grade A*, the CAG share was 9.90% against a final 5.70% for the low SES group, and 14.31% against 8.45% for the high SES group. Ofqual adds: "It is difficult to draw firm conclusions on the basis of this analysis".

**Not measured:** the sources give no figures on outcomes for students, such as university places. The interim report analyses CAGs and calculated grades for AS and A level only. The statement gives no figures on how many grades the switch changed.

## Why it happened

Citing research, the report says teachers "tend to be optimistic (although not in all cases)" when estimating grades, and overall results were to stay similar to previous years. A small percentage were adjusted by 2 grades or more, in some cases "because it appeared that the centre’s CAGs were very much higher than the historical results in the centre". For small cohorts, "there is no statistical model that can reliably predict grades for particularly small groups of students", and as small groups are more common at AS and A level, "the outcomes in some AS and A level subjects are much higher this year".

On the reversal, the statement says the approach "caused real anguish and damaged public confidence", and that "Expecting schools to submit appeals where grades were incorrect placed a burden on teachers".

## What changed afterwards

The statement says: "After reflection, we have decided that the best way to do this is to award grades on the basis of what teachers submitted." Students would get their centre assessment grade "or the moderated grade, whichever is higher", for AS, A level and the GCSE results due later that week. The sources do not say whether the promised final report followed.

## Lessons

The interim report concludes that the results "will have met the aim of enabling large numbers of students to move on". The statement apologised: "For all of that, we are extremely sorry."

The wiki's reading:

- **An aggregate accuracy figure is not the impact on people.** 96.4% "within one grade" sat beside 35.6% of A level CAGs moved down by 1 grade. Report the whole distribution of changes. See [Classification and regression metrics](#classification-metrics).
- **A backtest checks prediction, not acceptance.** The statement names lost public confidence as the problem, which no backtest measures. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Group-level fairness checks can pass while individuals feel wronged.** The report found no evidence of introduced bias, yet outside small cohorts the model predicted grades from the centre's past results. See [Fairness metrics and bias measurement](#fairness-bias).
- **The appeals route is part of the system.** The statement names the burden of appeals on teachers. See [Human in the loop](#human-in-the-loop).

## Disclosure

None.

## Sources

- Ofqual (no individual authors), [Awarding GCSE, AS & A levels in summer 2020: interim report](https://www.gov.uk/government/publications/awarding-gcse-as-a-levels-in-summer-2020-interim-report), GOV.UK publication page, 13 August 2020.
- Ofqual (no individual authors), [Executive summary: Awarding GCSE, AS, A level, advanced extension awards and extended project qualifications in summer 2020: interim report](https://assets.publishing.service.gov.uk/media/5f34412ad3bf7f1b10d58ffb/6656-2_-_Executive_summary.pdf), Ofqual/20/6656/2, GOV.UK, 13 August 2020.
- Ofqual (no individual authors), [Awarding GCSE, AS, A level, advanced extension awards and extended project qualifications in summer 2020: interim report](https://assets.publishing.service.gov.uk/media/5f3571778fa8f5173f593d61/6656-1_Awarding_GCSE__AS__A_level__advanced_extension_awards_and_extended_project_qualifications_in_summer_2020_-_interim_report.pdf), Ofqual/20/6656/1, GOV.UK, 13 August 2020.
- Ofqual (no individual authors), [Annex Q: Differences between CAGs and final grades by socio-economic group](https://assets.publishing.service.gov.uk/media/5f36711a8fa8f5174816b25f/6656-3_Annex_Q_-_Awarding_GCSE__AS__A_level__advanced_extension_awards_and_extended_project_qualifications_in_summer_2020_-_interim_report.pdf), Ofqual/20/6656/3, GOV.UK, 13 August 2020.
- Ofqual, [Statement from Roger Taylor, Chair, Ofqual](https://www.gov.uk/government/news/statement-from-roger-taylor-chair-ofqual), GOV.UK news story, 17 August 2020.

## Related

- [About field notes](#about-field-notes)
- [Fairness metrics and bias measurement](#fairness-bias)
- [AI risk management and impact assessments](#ai-risk-management)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
- [Validation, tuning and leakage](#validation-tuning)
