---
id: johns-hopkins-trews-sepsis-alerts
book: 21
order: "21.84"
title: "TREWS: sepsis alerts, provider confirmation and patient outcomes at five hospitals"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, clinical-prediction, early-warning, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (five hospitals; authors mostly at Johns Hopkins, one also at Bayesian Health)"
use_case: "A deployed machine learning sepsis alert system (TREWS) whose alerts providers confirm, studied for its association with patient outcomes"
outcome: "Patients whose alert a provider confirmed within 3 h had a reduced in-hospital mortality rate (3.3% adjusted absolute reduction, 18.7% adjusted relative reduction) compared with patients whose alert was not confirmed within 3 h; the study examined an association"
measured_how: "Prospective multi-site cohort study of 6,877 sepsis patients identified by the alert before antibiotics, out of 590,736 monitored at five hospitals, adjusted for presentation and severity; study period not stated in the open text (Adams et al., Nature Medicine, July 2022)"
prerequisites: [human-in-the-loop, measuring-ai-impact]
replications: []
---
> [!tldr]
> Researchers mostly at Johns Hopkins, one of them also at Bayesian Health, studied TREWS, a machine learning sepsis alert system that monitored 590,736 patients at five hospitals. Among 6,877 patients with sepsis flagged before antibiotics, those whose alert a provider confirmed within 3 hours had an adjusted in-hospital mortality reduction of 3.3% (absolute) and 18.7% (relative), compared with patients whose alert was not confirmed in that time. The paper's main text is paywalled, so this page uses only its open parts.

> [!note] From the public record
> Built from Johns Hopkins University's own published account, "Prospective, multi-site study of patient outcomes after implementation of the TREWS machine learning-based early warning system for sepsis" (July 2022), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper starts from a clinical premise: "Early recognition and treatment of sepsis are linked to improved patient outcomes." In the authors' words, machine learning-based early warning systems "may reduce the time to recognition, but few systems have undergone clinical evaluation."

The gap the study addresses is evidence from a system already in use.

## Why this approach

The open parts of the paper do not say which design options were considered for TREWS. They describe the evaluation instead. In "this prospective, multi-site cohort study", the authors "examined the association between patient outcomes and provider interaction with a deployed sepsis alert system". The system is the "Targeted Real-time Early Warning System (TREWS)".

The wiki's reading: the exposure studied is a provider's action, so the result describes the model and the [human in the loop](#human-in-the-loop) together.

## The approach

As far as the open text describes it:

1. **Deployment.** "During the study, 590,736 patients were monitored by TREWS across five hospitals." The abstract does not name the hospitals.
2. **Provider confirmation.** Providers confirm alerts, and the time of confirmation is recorded. Figure 2 shows the "Distribution of the time from which the TREWS alert was given to the time confirmation was entered" for the target population.
3. **Analysis cohort.** The analysis focused on "6,877 patients with sepsis who were identified by the alert before initiation of antibiotic therapy." Figure 1 is a "Waterfall diagram for the primary analysis cohort."
4. **Comparison.** Patients whose alert was confirmed within 3 hours were compared with patients whose alert was not, "Adjusting for patient presentation and severity".
5. **High-risk subgroup.** A further analysis looked at patients "who were additionally flagged as high risk."

The authors' published analysis notebook trains, on retrospective data, "a model that predicts a patients increase in mortality risk" with and without prompt antibiotic therapy, and has a step headed "Rerun using IPTW". The notebook does not spell out the abbreviation.

## The stack

As of July 2022: TREWS "is available from Bayesian Health, New York", and "The underlying source code is proprietary intellectual property and is not available." The study data are electronic health records (EHRs) "approved for limited use by Johns Hopkins University investigators", and they are not public. The open text does not name the model type, its inputs, the EHR system, or how alerts reach providers. The published analysis code is a Python notebook that imports numpy, pandas, statsmodels and scikit-learn, among others.

## Results, and how they were measured

The metrics are in-hospital mortality, organ failure and length of stay; sample and baseline are as described above. The open text does not state the study period; the paper was received on 16 September 2021.

- **Mortality.** Patients "whose alert was confirmed by a provider within 3 h of the alert had a reduced in-hospital mortality rate": "3.3%, confidence interval (CI) 1.7, 5.1%, adjusted absolute reduction, and 18.7%, CI 9.4, 27.0%, adjusted relative reduction". The comparison group is "patients whose alert was not confirmed by a provider within 3 h."
- **Organ failure and length of stay.** Both were also reduced; the abstract gives no numbers.
- **High-risk patients.** "Improvements in mortality rate (4.5%, CI 0.8, 8.3%, adjusted absolute reduction) and organ failure were larger" among patients flagged as high risk.

The authors conclude: "Our findings indicate that early warning systems have the potential to identify sepsis patients early and improve patient outcomes".

The wiki's reading: both groups had an alert, and the paper's own word is "association". A cohort comparison cannot fully rule out that patients whose alerts were confirmed quickly differed in ways the adjustment missed. Anyone repeating the 18.7% should keep its label: an adjusted relative reduction for alerts confirmed within 3 h against those that were not. See [Online controlled experiments for AI features](#online-experiments) and [Statistics for evals](#eval-statistics).

**Not measured:** the open text of the paper does not state the study period, the number of alerts, how many were confirmed, how many were false alarms, the model's accuracy, the figures for organ failure and length of stay, or any cost or workload data. The two figures are images; only their titles are used here.

## What failed

The open parts report no failures and contain no limitations section. They do state limits on checking the work. The paper states that making the data publicly available "without additional consent, ethical or legal approval might compromise patients' privacy and the original ethical approval." The TREWS source code is proprietary; only the analysis code is public.

The competing-interests statement says that under a license agreement between Bayesian Health and Johns Hopkins University, two authors and the university "are entitled to revenue distributions", and "In addition, the university owns equity in Bayesian Health." One author is a founder of Bayesian Health and holds equity in it. The paper states that these arrangements were reviewed and approved by Johns Hopkins University under its conflict-of-interest policies.

## What the team would do differently

The open parts state no such lessons. Their conclusion adds that sepsis patients "who would benefit the most from early treatment can be identified and prioritized at the time of the alert". Under "Associated content", the article page lists a paper on provider adoption of TREWS and one on clinicians' experiences with it. This page does not draw on them.

The wiki's reading:

- **Log the response, not only the model.** This analysis needed the time each alert was confirmed. Teams that deploy alerts should record who acts on them and when. See [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).
- **Read the design before the number.** An adjusted association from a cohort is a different claim from a randomized result. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure

None.

## Sources

- Roy Adams, Katharine E. Henry, Anirudh Sridharan, Hossein Soleimani, Andong Zhan, Nishi Rawat, Lauren Johnson, David N. Hager, Sara E. Cosgrove, Andrew Markowski, Eili Y. Klein, Edward S. Chen, Mustapha O. Saheed, Maureen Henley, Sheila Miranda, Katrina Houston, Robert C. Linton, Anushree R. Ahluwalia, Albert W. Wu and Suchi Saria, mostly Johns Hopkins University, one author also at Bayesian Health, [“Prospective, multi-site study of patient outcomes after implementation of the TREWS machine learning-based early warning system for sepsis”](https://www.nature.com/articles/s41591-022-01894-0), Nature Medicine 28, 1455-1460, received 16 September 2021, accepted 8 June 2022, published 21 July 2022, doi:10.1038/s41591-022-01894-0. Only the abstract, figure and table titles, and the data, code, competing-interests and acknowledgement statements are open.
- royadams, [“adams_et_al_2022_code”](https://github.com/royadams/adams_et_al_2022_code), GitHub repository with the paper's analysis code, linked from its code availability statement, no date stated.

## Related

- [About playbooks](#about-playbooks)
- [Human in the loop](#human-in-the-loop)
- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
