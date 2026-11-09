---
id: atrium-health-ambient-documentation
book: 22
order: "22.21"
title: "Ambient AI documentation at Atrium Health: no efficiency gain for clinicians as a group"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, ambient-documentation, clinical-documentation, measurement, public-record]
visuals: []
type: field-note
account: public-record
industry: "Healthcare (multisite academic learning health system, primary care)"
use_case: "Nuance's Dragon Ambient eXperience (DAX) Copilot, ambient AI software that drafts a clinic note from the provider-patient conversation, used by primary care clinicians"
outcome: "No statistical significance in the primary analyses of EHR and financial metrics; exploratory analyses suggested small decreases in documentation hours for high DAX users (means ratio 0.93)"
measured_how: "EHR and financial metrics over 180 days with linear mixed models, 112 DAX clinicians against a non-randomized control group of 103 clinicians from similar practices, recruited June to August 2023 (Liu et al., NEJM AI, November 2024; ClinicalTrials.gov NCT06329427)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> Atrium Health, the first health system to use Nuance's DAX Copilot according to its researchers, compared 112 primary care clinicians using the ambient documentation software with 103 from similar practices who did not. Over 180 days, the primary analyses of EHR and financial metrics found no statistical significance, and the authors write that their findings suggest "the tool did not make clinicians as a group more efficient". Exploratory analyses suggested small decreases in documentation hours for some subgroups.

> [!note] From the public record
> Built from Atrium Health's own published account, "Does AI-Powered Clinical Documentation Enhance Clinician Efficiency? A Longitudinal Study" (November 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Nuance's Dragon Ambient eXperience (DAX) Copilot is, in the study's words, "an artificial intelligence (AI)-driven ambient clinical documentation software platform". According to the trial registry, the tool "listens to the conversation between a clinician and patient/caregiver during their visit" and provides transcriptions by speaker, which the clinician reviews and edits into the final note in the electronic health record (EHR).

The study calls Atrium Health "a large multisite academic learning health system" that "was the first to use DAX Copilot". The trial covered physicians and advanced practice providers in family medicine, internal medicine and general pediatrics at outpatient clinics in North Carolina and Georgia. Before their accounts were activated, DAX clinicians had a one-hour training session on DAX Copilot. Wake Forest University Health Sciences funded the study. As of the 2023 study period, the sources name little of the stack: the product, which the registry attributes to "Nuance/Microsoft", and the EHR, where note length was measured "in EPIC". For the secondary outcomes, the registry also names REDCap for the clinician survey and Medallia for patient surveys.

## What happened

1. **Recruitment, June to August 2023.** "In this longitudinal study, 112 primary care clinicians using DAX were recruited between June and August 2023", with a control group of 103 clinicians from similar practices. The registry calls the design a "non-randomized stepped-wedge trial". DAX clinicians, who had shown interest, joined in 5 waves by clinic location. Controls had opted out of DAX Copilot in the vendor's baseline survey and worked in the same clinics or regions.
2. **Measurement over 180 days.** The primary outcomes, EHR use and financial impact, "were assessed over 180 days using linear mixed models". The registry lists time in the EHR, work outside of work and time on documentation (each per 8 hours of scheduled patient time), completed appointment rate, same day closure rate, note length, gross revenue per visit and work relative value units (wRVU) per visit.
3. **Subgroups.** Active users "transferred ≥25% of DAX notes" and high users "transferred ≥60% of DAX notes". Exploratory analyses compared the control group with these subgroups, and further subgroup analyses were stratified by patient volume and clinician specialty.
4. **Registration and publication.** The registry record gives a completion date of 15 December 2023; it was first posted on 26 March 2024. It lists an actual enrollment of 238, and the sources do not explain how this relates to the 112 and 103 clinicians analysed. The paper appeared online in NEJM AI on 22 November 2024.

## Impact, and how it was measured

- **Primary analyses.** After controlling for length of intervention, age, gender, provider type, years of practice and baseline outcome, "we did not find statistical significance in the primary analyses of EHR and financial metrics."
- **High users.** Exploratory analyses suggested "small decreases in documentation hours could result from high DAX usage": "(means ratio [MR] 0.93, 95% confidence interval [CI] 0.88 to 0.98)".
- **Low-volume and family medicine clinicians.** They suggested the same for implementing DAX with low-volume clinicians "(MR 0.91, 95% CI 0.83 to 0.99)" and with family medicine clinicians "(MR 0.91, 95% CI 0.85 to 0.98)".
- **Overall.** "our findings suggest that the tool did not make clinicians as a group more efficient."

**Not measured:** the abstract gives no absolute hours, baseline values or effect estimates for the primary metrics, and no revenue or wRVU figures. It does not report the registry's secondary outcomes (provider satisfaction, provider interviews and patient satisfaction), and the registry has no posted results. Neither source reports overall usage rates, note quality, errors in drafted notes, patient outcomes or cost.

## Why it happened

The abstract names no cause for the null primary result. It reports small decreases in documentation hours only from exploratory analyses.

The wiki's reading: the usage signal came from clinicians who transferred at least 60% of their DAX notes, so how much clinicians used the tool may matter as much as having it. The abstract gives no adoption figures to check this.

## What changed afterwards

The sources report no decision by Atrium Health to expand, change or stop DAX Copilot. The authors point the next step at research: future studies can investigate "the utility of DAX for clinician subgroups and alternative implementations with improved clinical adoption."

## Lessons

The source's own conclusion: ambient documentation software "has been promoted as a promising strategy to alleviate the documentation burden faced by outpatient clinicians", yet "our findings suggest that the tool did not make clinicians as a group more efficient".

The wiki's reading, for teams rolling out AI tools to staff:

- **Measure against a comparison group.** Without controls, a change in EHR time could not be told apart from everything else that changed over the same months. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Watch how groups are formed.** DAX clinicians had shown interest and controls had opted out, so the groups may differ in ways that adjusting for baseline outcome, age, gender and similar factors does not capture. Random assignment is the usual answer. See [Online controlled experiments for AI features](#online-experiments).
- **Treat subgroup results after a null primary result as leads.** With several exploratory comparisons, some intervals can exclude 1 by chance alone. See [Statistics for evals](#eval-statistics).
- **Decide what success means before rollout.** EHR time, revenue and clinician satisfaction are different goals, and a tool can move one without the others. See [Scoping AI features](#ai-use-case-scoping).

## Disclosure

None.

## Sources

- Tsai-Ling Liu, Timothy C. Hetherington, Ajay Dharod, Tracey Carroll, Richa Bundy, Hieu Nguyen, Henry E. Bundy, McKenzie Isreal, Andrew McWilliams and Jeffrey A. Cleveland, Atrium Health and Wake Forest University School of Medicine, [“Does AI-Powered Clinical Documentation Enhance Clinician Efficiency? A Longitudinal Study”](https://doi.org/10.1056/AIoa2400659), NEJM AI 1(12), December 2024, published online 22 November 2024. The full text was not open to the wiki; this page uses the authors' abstract as indexed in [PubMed](https://pubmed.ncbi.nlm.nih.gov/42932770/) (PMID 42932770).
- Wake Forest University Health Sciences, [“Dragon Ambient eXperience (DAX) Copilot Evaluation”](https://clinicaltrials.gov/study/NCT06329427), ClinicalTrials.gov registry record NCT06329427, first posted 26 March 2024, last updated 29 March 2024.

## Related

- [About field notes](#about-field-notes)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
- [Statistics for evals](#eval-statistics)
- [Measuring AI's economic impact](#economic-impact-evidence)
