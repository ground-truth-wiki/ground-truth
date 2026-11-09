---
id: london-ambulance-ambient-voice
book: 21
order: "21.87"
title: Ambient voice technology for clinical notes at the London Ambulance Service
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, ambient-scribes, speech, productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (NHS ambulance service)"
use_case: "Ambient voice technology that transcribes consultations and drafts clinical notes, in telephone triage (Hear and Treat) and on-scene paramedic care (Face-to-Face)"
outcome: "Hear and Treat assessments took 15 vs 17 minutes and throughput was 2.3 vs 2.0 patients/hour; Face-to-Face mean on-scene time fell from 44 to 41 minutes"
measured_how: "Within-subject pre-post evaluation: 656 Hear and Treat assessments by 11 pilot users in April 2025 against non-users, and 344 Face-to-Face cases from seven clinicians over six weeks against 816 baseline contacts (LAS and GOSH DRIVE unit preprint, December 2025)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> The London Ambulance Service and the DRIVE unit at Great Ormond Street Hospital piloted Tortus AI's ambient voice technology, which drafts clinical notes from consultations, in telephone triage and on-scene care. The paper reports shorter triage assessments (15 vs 17 minutes) "without compromising documentation quality", and a mean on-scene time that fell from 44 to 41 minutes. Full integration with clinical systems was not achieved, and the cohort was small and self-selected.

> [!note] From the public record
> Built from the London Ambulance Service NHS Trust's and the Great Ormond Street Hospital DRIVE unit's own published account, "“What witchcraft is this?”: Paramedics report gains in productivity, well-being, and patient flow from piloting ambient voice technology in an NHS Ambulance Service" (December 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper opens: "UK ambulance services face record demand, resourcing challenges and rising clinical documentation burden." It notes that "999 calls have doubled in a decade while response-time targets are routinely breached."

The authors cite NHS hospital evaluations of ambient voice technology (AVT), but "Less is known about the application of AI in ambulance workflows", where notes are often written under time pressure, in noise and after hand-over. The aim was "to test AVT in a complex and undifferentiated pre-hospital context."

## Why this approach

The paper does not compare AVT with other options. Great Ormond Street Hospital (GOSH), which led the wider trial across sites, partnered with Tortus AI in 2023. "Tortus AI was selected for its single-supplier consistency, rapid frontline responsiveness", governance know-how and independent certifications.

The paper states its ties: NHS England (London) Frontline Digitisation and the GOSH DRIVE unit supported the evaluation, and "the AVT platform (Tortus AI) was supplied free of charge." Two co-authors are affiliated with Tortus, and "GOSH has entered a collaborative partnership with Tortus AI." Data collection, analysis and interpretation "were carried out by the LAS and GOSH teams independently of the technology partner."

## The approach

The design was a "Within-subject pre-post evaluation" across two pathways:

1. **Hear and Treat.** Paramedics and nurses in the Clinical Hub (CHUB) assess patients by telephone. Two workstations had AVT "out of approximately 50 available workstations". Each draft was "validated for accuracy by the clinicians". Patients were told calls were transcribed and "they could ask for transcription to be deactivated".
2. **Face-to-Face.** Paramedics and non-regulated ambulance clinicians used AVT on "existing tablets already used for clinical documentation". Use was mainly ambient, but clinicians could also dictate after the episode of care.

The team also measured cognitive load with the NASA Task Load Index, ran surveys, and interviewed seven clinicians.

## The stack

As of December 2025:

- **AVT:** Tortus AI, "a UK health-tech start-up company", used "to transcribe consultations and auto-generate clinician-specified notes". The paper does not name the underlying speech or language models. See [Speech recognition models](#speech-recognition).
- **Telephone audio:** "additional hardware was required to route telephone audio into the AI system".
- **Records:** templated notes "which were copied into the electronic record system following clinician validation". The paper does not name that system.

## Results, and how they were measured

**Hear and Treat,** April 2025, from "pre-existing CHUB performance monitoring tools and data reports". "There were 11 pilot users." "AVT users completed 656 assessments (2.7% of total CHUB activity), while non-users completed 23,044 assessments."

- **Time and throughput.** "Compared with baseline, AVT shortened assessments by two minutes (15 vs 17 minutes)" "and increased throughput by 15% (2.3 vs 2.0 patients/hour)". The Results compare with assessments "without the tool" and "among non-users".
- **Documentation quality.** In routine audits, "AVT users showing a slight improvement in average audit scores: 98.5% vs 98.2% for non-users".

**Face-to-Face.** A six-week period, dated "5/3/35-14/4/25" in the paper, against a three-month baseline dated "2/12/24-2/3/25": 344 AVT-documented cases from seven clinicians against 816 patient contacts.

- **On-scene time.** "In Face-to-Face care (n=344 AVT contacts) mean on-scene time decreased from 44 to 41 minutes (-6.8%)". The median fell from 46 minutes "to 39 minutes (IQR 35–45) (15.2% improvement)". One minute of the clinicians' improvement "was attributed to wider improvement within the trust and not the technology"; the paper does not say which figures include this.
- **Whole job.** Mean handover-to-clear time "Increased from 14 to 15 minutes", but "Combined on-scene + handover-to-clear time reduced by 2.8 minutes (-4.8%)." The Results give the combined mean as "Reduced from 58.4 to 55.6 minutes (4.9% time saving)".
- **Patients per shift.** The mean was "Largely unchanged (0.7% decrease)".

**Clinicians.** "There was a significant reduction in total NASA score with AVT", from a baseline median of 5.83 to 4.42 (p<.001). Twenty-nine clinicians completed surveys at baseline and with AVT, with "significant positive changes in the level of agreement" on items including that "their overall experience was positive".

**Not measured:** the paper reports no patient outcomes, no costs and no error rate for the drafted notes. The authors note that "Sample sizes were not adjusted and may not fully reflect typical case mix or acuity". The conclusion that scale-up "could release capacity equivalent to thousands of additional patient contacts each day" is not a result measured in the pilot.

## What failed

- **No integration.** "full technical integration with existing clinical systems was not achieved during the evaluation period", "which likely attenuated the potential productivity benefits of the technology."
- **Workarounds.** "Interim technical workarounds, such as manual audio bridging in CHUB, may have influenced user experience and results."
- **Who took part.** "Participating clinicians were a small self-selecting cohort, introducing potential bias", "although the direction of any impact is uncertain". Seasonal demand and varying patient acuity may have played a part, and "This evaluation was delivered within a compressed timeframe".
- **Handover-to-clear time rose.** This may reflect changes in documentation workflows, "such as clinicians choosing to complete notes after patient handover", or the lack of integration.
- **Refinements needed.** Clinicians endorsed routine use, "albeit with some further refinements required to templates and hardware".

## What the team would do differently

The paper "underlines the value of closer integration with electronic health record systems", and "Future evaluations should account for priority cases" and a broader case mix. The data "will inform the design of a more extensive, fully integrated pilot", and "A larger-scale evaluation will be essential to explore longer-term impact".

The wiki's reading: the triage gains compare 11 self-selected users with non-users in the same hub, and the supplier was a partner that gave the tool free, so treat the numbers as an early signal. A control arm would separate the tool from the people who chose it; see [Online controlled experiments for AI features](#online-experiments) and [Measuring the impact and ROI of an AI feature](#measuring-ai-impact). Clinician review of each draft is the safeguard; see [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).

## Disclosure

None.

## Sources

- David Davis, Jo Wray, Geralyn Oldham, Daniel Elkeles, Timothy Borham, Paul Gough, Maya Tomlinson, Nick James, Alastair Hill, Eleanor Sullivan, Stephen Mathew, Robert Robinson, Jasmine Balloch, Dom Pimenta, Sarah Kirk, Anna Booth, Andrew M. Taylor and Shankar Sridharan, London Ambulance Service NHS Trust, The DRIVE Unit at Great Ormond Street Hospital for Children NHS Foundation Trust, UCL, NHS Providers and Tortus, [“What witchcraft is this?”: Paramedics report gains in productivity, well-being, and patient flow from piloting ambient voice technology in an NHS Ambulance Service](https://www.medrxiv.org/content/10.64898/2025.11.27.25340564v1), medRxiv preprint, posted 2 December 2025, doi:10.64898/2025.11.27.25340564.

## Related

- [About playbooks](#about-playbooks)
- [Speech recognition models](#speech-recognition)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Online controlled experiments for AI features](#online-experiments)
- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
