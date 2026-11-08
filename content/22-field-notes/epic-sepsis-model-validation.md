---
id: epic-sepsis-model-validation
book: 22
order: "22.2"
title: A widely used sepsis model meets its first external validation
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, clinical-prediction, external-validation, vendor-models, public-record]
visuals: []
type: field-note
account: public-record
industry: Healthcare (academic medical center)
use_case: A vendor's sepsis prediction model running inside the electronic health record and paging clinicians
outcome: Hospitalization-level AUC of 0.63; the model missed 67% of patients with sepsis while alerting on 18% of all hospitalizations
measured_how: Retrospective cohort of 38,455 hospitalizations of 27,697 adult patients at Michigan Medicine, December 2018 to October 2019, against a composite sepsis definition (Wong et al., JAMA Internal Medicine, 2021)
prerequisites: [classification-metrics]
replications: []
---
> [!tldr]
> Michigan Medicine checked the Epic Sepsis Model, a proprietary model "in use at hundreds of hospitals", against its own patients. It discriminated far worse than the vendor's documentation suggested, missed 67% of patients with sepsis and alerted on 18% of all hospitalizations. The lesson: a model you did not build still needs your own validation before you trust its alerts.

> [!note] From the public record
> Built from the study Michigan Medicine researchers published about the model they ran, "External Validation of a Widely Implemented Proprietary Sepsis Prediction Model in Hospitalized Patients" (Wong et al., 2021), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The Epic Sepsis Model (ESM) is a proprietary model developed by Epic Systems and built into its electronic health record, which the authors describe as a penalized logistic regression model. In their words, it was "currently in use at hundreds of hospitals throughout the country". Public information about it was limited, and the authors knew of no independent validation before theirs.

At Michigan Medicine, the model scored patients every 15 minutes from their arrival in the emergency department. "The ESM was used to generate alerts on 2 hospital units starting on March 11, 2019", and on a third unit from 12 August 2019. A hospital operations committee chose a score of 6 or higher to page clinicians, inside the developer's recommended range of 5 to 8.

## What happened

The researchers ran a retrospective cohort study of 27,697 adult patients with 38,455 hospitalizations between 6 December 2018 and 20 October 2019. Sepsis occurred in 2,552 hospitalizations (7%). Hospitalizations that were eligible for live alerts were left out of the analysis. They compared the model's scores with a composite definition of sepsis: the CDC's surveillance criteria, or an ICD-10 sepsis diagnosis plus 2 SIRS criteria and 1 organ dysfunction criterion within 6 hours of each other. The study was published in JAMA Internal Medicine in June 2021 and corrected in August 2021 to fix the number needed to evaluate.

## Impact, and how it was measured

- **Discrimination.** "The ESM had a hospitalization-level area under the receiver operating characteristic curve of 0.63 (95% CI, 0.62-0.64)." The developer's internal documentation reported 0.76 to 0.83, and a conference paper coauthored with Epic reported 0.73. See [Classification and regression metrics](#classification-metrics) for what these numbers mean.
- **Missed cases.** "The ESM also did not identify 1709 patients with sepsis (67%)". Of those, 1,030 still received timely antibiotics.
- **Alert burden.** The model fired "for an ESM score of 6 or higher for 6971 of all 38 455 hospitalized patients (18%)", and "clinicians would still need to evaluate 8 patients to identify a single patient with eventual sepsis".
- **At the alert threshold.** At a score of 6, sensitivity was 33%, specificity 83% and positive predictive value 12%, and calibration was poor at every time horizon the authors checked.
- **Lead time.** The median time from the first score of 6 or higher to the onset of sepsis was 2.5 hours.

The study measured the model's predictions, not patient outcomes: it does not say whether the alerts changed treatment or survival.

## Why it happened

The authors attribute most of the gap between their results and the vendor's to timing. In a sensitivity analysis that also counted scores from up to 3 hours after sepsis onset, the AUC rose to 0.80 (95% CI, 0.79-0.81). More broadly, they name the conditions that let the model spread: proprietary models are hard to assess because they are opaque, confidential vendor documents that were never peer reviewed may not reflect real-world performance, and easy integration into the health record met loose federal regulation.

## What changed afterwards

The paper does not report changes at Michigan Medicine or by the vendor. Its call is aimed at the field: the authors urge the professional organizations that write national guidelines to address the use of such algorithms formally.

## Lessons

The source's own conclusion: "This external validation cohort study suggests that the ESM has poor discrimination and calibration" in predicting the onset of sepsis, and "The widespread adoption of the ESM despite its poor performance raises fundamental concerns" about sepsis management nationally.

The wiki's reading, for teams that deploy any model they did not build:

- **Validate on your own data before you trust the alerts.** A vendor's reported numbers describe the vendor's data and the vendor's choices. See [How benchmarks are built and why they break](#benchmark-validity).
- **Check when a prediction counts.** Counting scores from up to 3 hours after onset raised the AUC from 0.63 to 0.80: the same model looks much better when it gets credit for recognizing sepsis that has already begun. See [Building eval datasets](#eval-datasets).
- **Count the cost of alerts, not only the hits.** Alerting on 18% of hospitalizations to catch a third of cases is a workload decision as much as a statistical one. See [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).

The authors note two limits of their own study: it covers a single academic medical center, and it uses one composite sepsis definition while definitions of sepsis remain debated.

## Disclosure

None.

## Sources

- Andrew Wong, Erkin Otles, John P. Donnelly, Andrew Krumm, Jeffrey McCullough, Olivia DeTroyer-Cooley, Justin Pestrue, Marie Phillips, Judy Konye, Carleen Penoza, Muhammad Ghous and Karandeep Singh, [“External Validation of a Widely Implemented Proprietary Sepsis Prediction Model in Hospitalized Patients”](https://pmc.ncbi.nlm.nih.gov/articles/PMC8218233/), JAMA Internal Medicine 181(8), published online 21 June 2021, corrected 2 August 2021, doi:10.1001/jamainternmed.2021.2626. University of Michigan.

## Related

- [About field notes](#about-field-notes)
- [Classification and regression metrics](#classification-metrics)
- [How benchmarks are built and why they break](#benchmark-validity)
- [AI risk management and impact assessments](#ai-risk-management)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
