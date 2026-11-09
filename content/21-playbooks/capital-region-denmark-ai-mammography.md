---
id: capital-region-denmark-ai-mammography
book: 21
order: "21.82"
title: "AI in Danish breast screening: one reader for likely normal mammograms"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, medical-imaging, human-in-the-loop, workload-reduction, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (population breast cancer screening, Capital Region of Denmark)"
use_case: "An AI system scores screening mammograms; screenings it rates likely normal are single read by a senior radiologist, the rest are double read with AI-assisted decision support"
outcome: "Reading workload reduced by 33.5% (38 977 of 116 492 reads); recall rate decreased by 20.5%; cancer detection rate 0.70% before AI vs 0.82% with AI"
measured_how: "Retrospective comparison of two cohorts of women aged 50-69 (60 751 screened October 1, 2020 to November 17, 2021; 58 246 screened November 18, 2021 to October 17, 2022), at least 180 days of follow-up, χ2 test (Lauritzen et al., Radiology, June 2024)"
prerequisites: [classification-metrics]
replications: []
---
> [!tldr]
> The breast screening programme in the Capital Region of Denmark used an AI examination score to decide how many radiologists read each screening: one senior radiologist for screenings scored as likely normal, two with AI-assisted decision support for the rest. Comparing 60 751 women screened before with 58 246 screened after, the retrospective study reports that "The reading workload was reduced by 33.5%", the recall rate fell by 20.5% and the cancer detection rate rose. Follow-up was at least 180 days, and the title calls the findings "Early Indicators".

> [!note] From the public record
> Built from the paper by researchers from the Capital Region of Denmark's Department of Breast Examinations and their co-authors, "Early Indicators of the Impact of Using AI in Mammography Screening for Breast Cancer" (June 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The study covers women aged 50 to 69 in biennial mammography screening in the Capital Region of Denmark. Before AI, every screening was double read. The study starts from earlier research: "Retrospective studies have suggested that using artificial intelligence (AI) may decrease the workload of radiologists" while preserving screening performance. Its stated purpose is "To compare workload and screening performance for two cohorts of women who underwent screening" before and after the AI system was put into use.

The abstract gives no other reason for wanting a lower workload.

## Why this approach

The abstract names no alternatives that were considered and gives no reason for this design. In the design it describes, every screening is still read by at least one radiologist. The AI score decides whether a screening gets one reader or two.

The wiki's reading: this is a form of [human in the loop](#human-in-the-loop) in which the model routes work rather than making the final call on any screening. See also [Autonomy levels and human oversight](#autonomy-and-oversight).

## The approach

1. **Before AI** (October 1, 2020, to November 17, 2021): "all screenings involved double reading".
2. **With AI** (November 18, 2021, to October 17, 2022): the AI system gave each screening an examination score. Likely normal screenings, those with an "AI examination score ≤5 before May 3, 2022, or ≤7 on or after May 3, 2022", were "single read by one of 19 senior full-time breast radiologists". "The remaining screenings were read by two radiologists with AI-assisted decision support."
3. **Follow-up:** "Biopsy and surgical outcomes were retrieved between October 1, 2020, and April 15, 2023", "ensuring at least 180 days of follow-up".
4. **Analysis:** "Screening metrics were compared using the χ2 test." "Reading workload reduction was measured as saved screening reads."

The abstract does not say how the cut-offs were chosen or why the threshold was raised.

## The stack

As of June 2024, the abstract refers only to an AI system that produces an "AI examination score" per screening and provides "AI-assisted decision support" to radiologists. It does not name the product, the vendor or the scale of the score.

The paper's affiliation list, as indexed by Europe PMC, includes ScreenPoint Medical, Nijmegen, for one co-author. The abstract does not link this to the AI system used. The full paper is the place to check the product name and the conflict-of-interest statements.

## Results, and how they were measured

"In total, 60 751 and 58 246 women were screened before and after AI system implementation, respectively", with a median age of 58 years in both cohorts.

- **Workload.** "The reading workload was reduced by 33.5% (38 977 of 116 492 reads)."
- **Recall rate.** "the recall rate decreased by 20.5% (3.09% before AI [1875 of 60 751] vs 2.46% with AI [1430 of 58 246]; P < .001)"
- **Cancer detection.** "the cancer detection rate increased (0.70% [423 of 60 751] vs 0.82% [480 of 58 246]; P = .01)"
- **False positives.** "the false-positive rate decreased (2.39% [1452 of 60 751] vs 1.63% [950 of 58 246]; P < .001)"
- **Positive predictive value.** "the positive predictive value increased (22.6% [423 of 1875] vs 33.6% [480 of 1430]; P < .001)". See [Classification and regression metrics](#classification-metrics) for how these rates relate.
- **Cancers found.** "the rate of small cancers (≤1 cm) increased (36.6% [127 of 347] vs 44.9% [164 of 365]; P = .02)". "the rate of node-negative cancers was unchanged" (76.7% vs 77.8%, P = .73), and "the rate of invasive cancers decreased" (84.9% vs 79.6%, P = .04).

The authors conclude: "In a population-based mammography screening program," "using AI reduced the overall workload of breast radiologists while improving screening performance."

**Not reported in the abstract:** outcomes after the follow-up window, reading time (workload is counted in reads), costs, results split by the single-read and double-read paths, and results per threshold.

## What failed

The abstract reports no failures of the system and does not discuss limits of the study. It does state these facts about the design:

- **Retrospective design.** The abstract calls it a "retrospective study" of two consecutive cohorts. It is not a randomized trial.
- **Different screening intervals.** The cohorts had "a median screening interval before AI of 845 days (IQR, 820-878 days) and with AI of 993 days (IQR, 968-1013 days; P < .001)". The abstract does not discuss what this means for the results.
- **A moving threshold.** The cut-off for likely normal changed on May 3, 2022, partway through the AI period.
- **Follow-up.** Outcomes were retrieved "ensuring at least 180 days of follow-up", and the title calls the findings "Early Indicators".

## What the team would do differently

The abstract states no lessons beyond its conclusion and no plans for changes.

The wiki's reading: a before-and-after study cannot fully separate the effect of the AI from other changes between the two periods, such as the longer screening interval the abstract reports for the AI period. The threshold change also means the AI cohort was not handled under one fixed rule. A [randomized comparison](#online-experiments) is the usual way to control for such differences (see also [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)). Saved reads are not the same as saved radiologist time, since the abstract does not report how long a read took.

## Disclosure

None.

## Sources

- Andreas D. Lauritzen, Martin Lillholm, Elsebeth Lynge, Mads Nielsen, Nico Karssemeijer and Ilse Vejborg, record in The Capital Region of Denmark's Research Portal (Department of Breast Examinations), [“Early Indicators of the Impact of Using AI in Mammography Screening for Breast Cancer”](https://research.regionh.dk/en/publications/early-indicators-of-the-impact-of-using-ai-in-mammography-screeni/), Radiology 311(3), e232479, June 2024, doi:10.1148/radiol.232479. Published under a CC BY 4.0 license.
- Europe PMC, bibliographic record of the same article (PMID 38832880), [“Early Indicators of the Impact of Using AI in Mammography Screening for Breast Cancer”](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:38832880%20AND%20SRC:MED&format=json&resultType=core), used only for the authors' affiliations.

## Related

- [About playbooks](#about-playbooks)
- [Human in the loop](#human-in-the-loop)
- [Classification and regression metrics](#classification-metrics)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
