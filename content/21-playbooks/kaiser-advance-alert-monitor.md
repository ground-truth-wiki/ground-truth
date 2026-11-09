---
id: kaiser-advance-alert-monitor
book: 21
order: "21.85"
title: "Kaiser Permanente's Advance Alert Monitor: early warnings with nurse review"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, clinical-prediction, early-warning, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (health care provider and not-for-profit health plan, 21 hospitals in Northern California)"
use_case: "A machine learning model that scans hospital patients' electronic health records every hour and flags those at risk of deterioration, with each alert reviewed by a remote nurse team before a rapid response team acts"
outcome: "A 16% lower mortality rate in the intervention cohort; mortality within 30 days of an alert of 15.8% versus 20.4%"
measured_how: "15,487 patients who reached the alert threshold against 28,462 comparison patients, staggered deployment August 2016 to February 2019, study in the New England Journal of Medicine (Kaiser Permanente press release, November 2020)"
prerequisites: [classification-metrics, human-in-the-loop]
replications: []
---
> [!tldr]
> Kaiser Permanente runs the Advance Alert Monitor (AAM), a machine learning model that scans hospital patients' records every hour and flags those at risk of decline. A remote team of nurses reviews each alert before a rapid response team acts. A study of its rollout to 21 Northern California hospitals found "a 16% lower mortality rate" in the intervention cohort. A report on AAM's implementation, cited in the release, concluded that the improved outcomes came "not just from electronic tools" but also from system integration, workflow development and collaboration among caregivers.

> [!note] From the public record
> Built from Kaiser Permanente's own published account, "Real-time alerts associated with lower mortality" (November 2020), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The release frames the problem as deterioration in hospitalized patients. AAM predicts the probability that a hospitalized patient will decline, need transfer to the intensive care unit or emergency resuscitation, and benefit from interventions. The release gives the reason in one sentence: "Early warnings could be helpful for patients at risk of deterioration where early intervention may improve outcomes."

A second problem is the alerts themselves. According to the study's lead author, alerts in hospitals have "proliferated to the point of causing “alert fatigue” for nurses".

## Why this approach

The release does not describe other options the team considered. It explains instead how AAM differs from other alert systems. The lead author says it differs "in several ways" and names three:

- **The model.** "It has a powerful analytical engine taking into account many patient status factors."
- **Automation.** "It is automated, so it does not require manual risk calculation by hospital staff."
- **Curated alerts.** "the alerts are curated by trained nurses off-site, so bedside caregivers do not get unnecessary interruptions."

The lead author introduces the third point with the word "importantly". It puts a [human in the loop](#human-in-the-loop) between the model and the bedside: the reviewing nurses evaluate each alert to determine if on-site intervention is needed, and then contact the rapid response team.

## The approach

1. **A predictive model.** "The predictive model uses algorithms created from machine learning and data from more than 1.5 million patients." Its inputs are severity-of-illness and longitudinal comorbidity scores, vital signs and vital signs trends, neurological status checks, and laboratory tests.
2. **Hourly scoring.** The alert system scans the hospitals' electronic health records every hour. If a patient's score is above threshold, "indicating significant risk of decline over the next 12 hours, an alert is issued."
3. **Remote nurse review.** A regional team of specially trained registered nurses reviews each alert first. They use information from the patient's medical record to decide whether on-site intervention is needed.
4. **Bedside response.** The nurses contact a rapid response team on that hospital unit. The team performs a structured assessment and then works with the patient's physician to decide further action.

The system was tested in 2013 and rolled out to all 21 Kaiser Permanente Northern California hospitals between 2016 and 2019. The release does not say where the threshold sits, how it was chosen, or how many alerts the nurse team handles.

## The stack

As of November 2020, the release names no vendors or products, and no model type beyond "algorithms created from machine learning". Beyond the parts listed above (a machine learning model, inputs from the electronic health record, an hourly scan, the regional nurse team and the rapid response teams), it does not name the health record system, the algorithm or the infrastructure.

## Results, and how they were measured

The evaluation was published in the New England Journal of Medicine. It covers "a staggered deployment to Kaiser Permanente hospitals in Northern California between August 2016 and February 2019". The authors compared "15,487 patients who reached the alert threshold" with "28,462 comparison patients who would have triggered an alert if the system had been active". The release gives these results:

- **Mortality.** "The analysis found a 16% lower mortality rate among patients in the intervention cohort."
- **Mortality after an alert.** The intervention cohort had "lower mortality within 30 days of an alert (15.8% versus 20.4%)."
- **ICU admissions.** "lower ICU admission rates (17.7% versus 20.9%)".
- **Length of stay.** "shorter hospital length of stay (6.7 days versus 7.5 days)".
- **Palliative care.** "Patients who had an AAM alert were also less likely to die without a palliative care referral." The release gives no figure for this.

In summary, the study "found the system was associated with better outcomes within 30 days of an alert." The authors are researchers at Kaiser Permanente's Division of Research. The study's funders were the Sidney Garfield Memorial Fund, the Gordon and Betty Moore Foundation, the Agency for Healthcare Research and Quality, The Permanente Medical Group, and Kaiser Foundation Hospitals.

The wiki's reading: the release's own wording is "associated with", and the comparison cohort is defined by the threshold the model would have applied. The release does not say whether the comparison was randomized or how the two cohorts were made comparable, so anyone repeating the 16% should keep that wording and read the study for the method. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) and [Online controlled experiments for AI features](#online-experiments) for why the design of a comparison matters.

**Not measured:** the release gives no figures on how often the model alerted, how many alerts the nurses passed on or set aside, the model's accuracy or false alarm rate (see [Classification and regression metrics](#classification-metrics)), costs or staffing. It does not say how the 16% figure was calculated, and gives no number for the palliative care finding.

## What failed

The release reports no failures or limits of AAM itself. The only problem it names is a general one: alerts in hospitals causing alert fatigue for nurses. The lead author names the off-site nurse review as one way AAM differs from other alert systems, so that bedside caregivers do not get "unnecessary interruptions". The release does not report how well that review worked, how many alerts turned out to be unnecessary, or what was learned in the 2013 test.

## What the team would do differently

The release states no lessons about what the team would change. It reports two conclusions. The lead author says AAM "has demonstrated that it is possible to integrate predictive models into day-to-day operations in our medical centers". And a recent report on AAM's implementation concluded that the improved outcomes "resulted not just from electronic tools" but also "from system integration, workflow development, and close collaboration among physicians, nurses, and other caregivers."

The wiki's reading: the measured effect belongs to the whole system, the model plus the nurse review plus the rapid response team, not to the model alone. A team that wants to copy the idea has to design the workflow and the review step with the same care as the model. See [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).

## Disclosure

None.

## Sources

- Kaiser Permanente (press release, no author named), [“Real-time alerts associated with lower mortality”](https://about.kaiserpermanente.org/news/press-release-archive/real-time-alerts-associated-with-lower-mortality), Kaiser Permanente news site, 11 November 2020. It reports a study in the New England Journal of Medicine by Gabriel Escobar (lead author), Vincent Liu, Patricia Kipnis, Alejandro Schuler, Brian Lawson and John D. Greene of the Kaiser Permanente Division of Research.

## Related

- [About playbooks](#about-playbooks)
- [Human in the loop](#human-in-the-loop)
- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
