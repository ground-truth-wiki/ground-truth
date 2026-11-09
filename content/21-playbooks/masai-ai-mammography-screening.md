---
id: masai-ai-mammography-screening
book: 21
order: "21.88"
title: "MASAI: AI triage and detection support in Swedish mammography screening"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, medical-imaging, randomised-trials, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (population breast cancer screening, Sweden)"
use_case: "AI risk scores triage screening mammograms to single or double reading by radiologists, and the AI marks suspicious findings as detection support"
outcome: "12 per cent fewer interval cancers with AI-supported screening than with standard screening (82 compared to 93), with higher sensitivity and no increase in false positives"
measured_how: "Interval cancers with AI-supported against standard screening in the MASAI randomised trial of 106,000 women, all of whom had completed a two-year follow-up by December 2025 (Lund University news article, January 2026)"
prerequisites: [classification-metrics]
replications: []
---
> [!tldr]
> Lund University's MASAI trial tested AI support in mammography screening: AI risk scores triaged mammograms to single or double reading, and the AI marked suspicious findings for the radiologists. In the final results, reported in January 2026, there were "12 per cent fewer interval cancers" than with standard screening (82 compared to 93), and sensitivity rose without more false positives.

> [!note] From the public record
> Built from Lund University's own published account, "AI support in breast cancer screening: Fewer missed cancer cases" (January 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In Sweden, "women between the ages of 40 and 74 are regularly invited to mammography screening." In traditional screening, "the mammograms are read by two breast radiologists, a medical speciality that is in short supply."

Interval cancers are cancers "diagnosed in the interval after a normal screening examination and the next scheduled screening round." The study lead says they are "typically more aggressive and should be as low as possible", and that their frequency "is a central measure of how effective a screening test is". The article reports the number of interval cancers, and recalls earlier results on the reading workload.

## Why this approach

The article does not describe other options the team considered, or why it chose this design over them. It does describe where the change sits. "For the individual woman participating in screening, there is no noticeable difference;" the examination "proceeds as usual." "It is afterwards, when the images are to be read, that AI support is used." The study lead describes the barrier to adoption as low: "in principle it is merely to integrate an AI software into existing IT systems". That is the study lead's statement; the article reports no measured cost or effort.

The wiki's reading: the AI does not give the final answer. It decides how much human reading an examination gets and points readers to findings, a form of [human in the loop](#human-in-the-loop) triage. A randomised trial measured on interval cancers is the clinical counterpart of an [online controlled experiment](#online-experiments): the outcome is observed in the screened population, not on a fixed test set.

## The approach

As far as the article describes it:

1. **Triage.** "In the MASAI trial, AI was used to triage mammograms to single or double reading based on AI risk scores." The article does not give the score thresholds or the share of examinations sent to each route.
2. **Detection support.** "AI was also used as detection support for the radiologists where it marked suspicious findings in the mammogram."
3. **Comparison.** AI-supported screening was compared with standard screening, in which two breast radiologists read the mammograms. The article's fact box lists an "RCT study" with "Randomised intervention" and a "Single-blind trial". The Lancet paper it links to calls the study "a randomised, controlled, non-inferiority, single-blinded, population-based, screening-accuracy trial".
4. **Follow-up.** "106,000 women participated in the MASAI (Mammography Screening with Artificial Intelligence) trial." "By December 2025 all participants had completed a two year follow up."

The article does not say how women were randomised, how many were in each group, how many radiologists took part, or at which screening units.

## The stack

As of January 2026, the article names no AI product, vendor or model. It refers only to AI risk scores, marked findings and "an AI software". It does not describe the infrastructure, the software version or how the risk scores are computed.

## Results, and how they were measured

The final results, as the article reports them, compare AI-supported screening with standard screening in the trial:

- **Interval cancers.** "Overall, there were 12 per cent fewer interval cancers with AI-supported screening compared to standard screening (82 compared to 93)."
- **Type of interval cancer.** "There were 16 percent fewer invasive cancers, i.e. those that can spread", "19 percent fewer large cancers" and "27 percent fewer aggressive subtypes". The article does not give the counts behind these three figures.
- **Sensitivity and false positives.** "With AI-supported screening the sensitivity, i.e. the ability of the test to detect cancer, increased," "without increasing the number of false positives." The study lead explains that a false positive "occurs when a woman is recalled for further assessment but does not have breast cancer". See [Classification and regression metrics](#classification-metrics) for how sensitivity and false positives relate.

The article also recalls earlier results from the same trial. "In previous reports from the trial, the research team had shown that the AI-supported screening method was safe" "and resulted in 29 percent more detected cancers, mostly small, lymph node negative invasive cancers." In addition, "the screen-reading workload for radiologists was reduced by 44 percent". For these earlier results the article refers only to "previous news articles". It does not cite the publications behind them or say how workload was counted.

**Not stated:** the article states no confidence intervals or statistical significance for the difference in interval cancers (see [Statistics for evals](#eval-statistics) for why that matters), no group sizes, no sensitivity, specificity or false-positive values, no cost figures and no effect on survival.

## What failed

The article reports no failures, setbacks or limits of the trial. It does not say whether the AI had flagged any of the interval cancers, and does not discuss findings the AI marked wrongly. Its forward-looking statements are framed as expectations: more Swedish regions "are expected to join", and the method "will probably have a general international impact" in countries with mammography screening.

The wiki's reading: a university news article is written for a general audience. Anyone planning a similar programme should read the peer-reviewed paper it links to before relying on these figures.

## What the team would do differently

The article states no lessons of this kind. It says instead that the study lead talks about "a milestone that has been achieved". The study lead then says: "In the study, the research team has been able to demonstrate clinical safety, accuracy and effectiveness." The study lead also says that "Many regions in Sweden have already started to implement AI-supported mammography screening".

## Disclosure

None.

## Sources

- Erika Svantesson, Lund University, [“AI support in breast cancer screening: Fewer missed cancer cases”](https://www.lunduniversity.lu.se/article/ai-support-breast-cancer-screening-fewer-missed-cancer-cases), Lund University news, 30 January 2026. Study lead: Kristina Lång. The article reports the final MASAI results published in The Lancet (2026) as “Interval cancer, sensitivity, and specificity comparing AI-supported mammography screening with standard double reading without AI in the MASAI study: a randomised, controlled, non-inferiority, single-blinded, population-based, screening-accuracy trial”.

## Related

- [About playbooks](#about-playbooks)
- [Classification and regression metrics](#classification-metrics)
- [Human in the loop](#human-in-the-loop)
- [Online controlled experiments for AI features](#online-experiments)
- [Autonomy levels and human oversight](#autonomy-and-oversight)
