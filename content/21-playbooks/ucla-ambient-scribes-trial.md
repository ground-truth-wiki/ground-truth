---
id: ucla-ambient-scribes-trial
book: 21
order: "21.4"
title: A randomized trial of ambient AI scribes at UCLA Health
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, ambient-scribes, speech, randomized-trial, evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: Healthcare (academic health system)
use_case: Ambient AI scribes that draft clinical notes from the conversation between physician and patient
outcome: With one of two scribe products, note-writing time fell 9.5% more than in the control arm (statistically significant); the other product's reduction was not significant
measured_how: Randomized trial with 238 physicians in 14 specialties and 72,000 patient encounters, November 2024 to January 2025, with two scribe arms and a usual-care control arm (UCLA Health, NEJM AI 2025)
prerequisites: [online-experiments]
replications: []
---
> [!tldr]
> UCLA Health tested two ambient AI scribes against usual documentation in a randomized trial with 238 physicians. With one product, the time spent writing each note fell significantly more than in the control arm; with the other, the drop was not significant. Both arms showed modest gains in burnout scores, and notes occasionally contained clinically significant errors.

> [!note] From the public record
> Built from UCLA Health's own account of its trial, "UCLA study finds AI scribes may reduce documentation time and improve physician well-being" (November 2025), linked under Sources with the trial's publication. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Ambient AI scribes listen to a visit and draft the clinical note. The two outcomes in the release's title are the ones they are meant to change: documentation time and physician well-being. UCLA researchers set out to test that claim under controlled conditions. The lead author, Paul J. Lukac, put it this way: "This is the first randomized trial to rigorously evaluate whether AI scribes deliver on their promise to help address this problem."

## Why this approach

The team ran a randomized trial with a control arm. The results show why the control arm matters: note-writing time also fell in the control arm, by about 18 seconds, so a before-and-after comparison alone would have overstated what the scribes did. The same logic drives [online controlled experiments](#online-experiments) for AI features. Lukac said the approach "can serve as a model for responsibly evaluating other AI tools as they emerge."

## The approach

- **Participants:** 238 physicians across 14 specialties, over 72,000 patient encounters.
- **Arms:** one group used Microsoft DAX, one used Nabla, and a control group kept its usual documentation practice.
- **Period:** two months, from November 2024 to January 2025.
- **Registration:** the trial is registered at ClinicalTrials.gov as NCT06792890.
- **Outcomes:** time spent writing each note, validated measures of burnout, cognitive workload and work exhaustion, usability, and patient acceptance.

## The stack

As of the trial (late 2024): two commercial ambient scribe products, Microsoft DAX and Nabla, each used in its own arm. The release does not describe how the products were integrated into the health record, or the models behind them. For the speech side of such tools, see [Speech recognition](#speech-recognition).

## Results, and how they were measured

- **Note-writing time, Nabla.** "Physicians using Nabla saw their average time spent writing each note decrease by an estimated 41 seconds", from 4 minutes 30 seconds to 3 minutes 49 seconds. In the control arm, time also fell, by about 18 seconds, from 4 minutes 22 seconds to 4 minutes 4 seconds. "The reduction in the Nabla arm was 9.5% larger than the control arm—a statistically significant result."
- **Note-writing time, DAX.** "Those using DAX showed a smaller decrease that did not reach statistical significance compared to the control group."
- **Burnout.** Both tools showed modest improvements in validated measures of burnout, cognitive workload and work exhaustion: "physicians in the Nabla and DAX arms experienced approximately 7% improvement in their burnout scores" compared with the control arm.
- **Use.** Physicians found both tools easy to learn and use, and fewer than 10% of patients declined their use.

**Not measured:** the release says the trial did not measure downstream effects on the quality, costs and experience of care.

## What failed

- **Errors in notes.** AI-generated notes "occasionally" contained clinically significant inaccuracies, "most commonly omissions of information or pronoun errors". See [Hallucination and factuality](#hallucination-factuality).
- **A safety event.** "One mild patient safety event was reported during the study."
- **One product without a significant effect.** DAX's reduction in note-writing time did not reach statistical significance against the control arm.
- **Limits of the design.** The trial ran at a single academic medical center over a relatively short period, and the burnout findings "require confirmation in larger studies".

## What the team would do differently

The researchers call for longer studies across several institutions, which also measure effects on health outcomes, including the quality, costs and experience of care. The senior author, John N. Mafi, drew the practical lesson for physicians: "This technology requires active physician oversight, not passive acceptance." That is the [human in the loop](#human-in-the-loop) pattern, applied to clinical documentation.

## Disclosure

None.

## Sources

- UCLA Health, [“UCLA study finds AI scribes may reduce documentation time and improve physician well-being”](https://www.uclahealth.org/news/release/ucla-study-finds-ai-scribes-may-reduce-documentation-time), news release, 26 November 2025. The numbers on this page come from this release.
- Paul J. Lukac, John N. Mafi and colleagues, [“Ambient AI Scribes in Clinical Practice – A Randomized Trial”](https://ai.nejm.org/doi/full/10.1056/AIoa2501000), NEJM AI, 2025, doi:10.1056/AIoa2501000. The full text is behind a paywall and was not read for this page.

## Related

- [About playbooks](#about-playbooks)
- [Online controlled experiments for AI features](#online-experiments)
- [Statistics for evals](#eval-statistics)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Human in the loop](#human-in-the-loop)
