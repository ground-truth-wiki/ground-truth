---
id: gosh-ambient-voice-technology
book: 21
order: "21.83"
title: "Ambient voice technology across NHS care settings: the GOSH Phase 4 evaluation"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, ambient-scribe, speech-recognition, pre-post-evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (NHS hospitals, general practice, mental health, emergency and ambulance services)"
use_case: "Ambient voice technology that listens to consultations and drafts clinical notes and letters for the clinician to review"
outcome: "Median share of observed consultation time spent on direct care rose from 70.0% at baseline to 86.5% with AVT at five core sites"
measured_how: "Observer-recorded time-motion data, per-protocol dataset of 2095 observations across 104 clinicians, non-randomised pre-post design, May 2024 to April 2025 (GOSH DRIVE report, version 1.3)"
prerequisites: [speech-recognition, human-in-the-loop]
replications: []
---
> [!tldr]
> Great Ormond Street Hospital's DRIVE unit tested an ambient voice technology (AVT) tool from Tortus AI, which drafts clinical notes and letters from consultation audio, at NHS sites from May 2024 to April 2025. At five observed core sites, the median share of time spent on direct care rose from 70.0% to 86.5%. Reported problems included templates that did not fit clinical needs, letters described as "too AI-like" and poorer accuracy in complex consultations.

> [!note] From the public record
> Built from the Great Ormond Street Hospital DRIVE Unit's own published account, "The use of Ambient Voice Technology with Generative Artificial Intelligence in Multiple Clinical Settings Across the NHS" (version 1.3, updated 11/02/2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The report says health records moved data entry onto clinicians: "patient-facing clinical staff have taken on data entry roles, which may contribute to cognitive burn-out." It adds that, unlike other health care systems such as that in the US, the NHS typically does not have medical scribes. The evaluation asked whether AVT could bring real benefits to patients, clinicians and the wider system.

## Why this approach

The report does not compare AVT with alternatives such as dictation, but explains its method: phases borrowed from pharmaceutical trials, from a sandbox to simulated consultations, a small GOSH outpatient pilot, then multi-site Phase 4. Phase 3 led to more personalised training and better template configuration. In 2023 GOSH entered an "innovation collaboration" with a health-technology start-up. It chose one UK-based supplier, Tortus AI, to keep the method consistent and because it met the trust's assurance standards.

## The approach

The design was "A non-randomised multi-centre within-subject, pre-post intervention trial." At five core sites (general practice, acute and community hospitals), observers timed each clinician with the TimeCat tool, at baseline and then with AVT. Four non-core sites (perinatal mental health, an emergency department, the London Ambulance Service and an additional longitudinal phase at the core GP practice) had no observers and supplied clinician surveys, interviews and some operational data. The report counts "192 clinicians across 9 sites".

The tool is designed to "require approval of the output" by the clinician. Clinicians added notes and letters to the EHR once they had reviewed and edited them, a [human-in-the-loop](#human-in-the-loop) design. Each site was locked to one product version. Governance checks at each site took "a significant amount of time" before clinicians could start.

## The stack

As of version 1.3 (updated 11/02/2026):

- Tortus AI's AVT app, used as a desktop or web application alongside the EHR, and not integrated with all EPRs.
- AI models that turn audio into a transcript and the transcript into a note, with a large language model at the core. The report does not name the [speech](#speech-recognition) or language models.
- Clinician-built templates that set each note's format and style.
- Microphones, plus extra hardware to feed phone audio in at the ambulance Clinical Hub.

## Results, and how they were measured

- **Direct care (core sites, 104 clinicians).** "23.5% increase in direct care: Median increase from 70.0% (baseline) to 86.5% (AVT) in core sites". The body says "showing a 16.5 percentage point absolute increase (equating to a 23.6% relative increase)".
- **Consultation length.** "The median total time decreased from 18.4 minutes at baseline to 16.9 minutes at AVT".
- **Clinicians (122 with paired surveys).** "There was a significant reduction in total NASA cognitive load score". There were "no significant differences between baseline and AVT in terms of satisfaction with the accuracy, completeness or relevance" of notes.
- **Patients.** "no significant difference in overall satisfaction with the consultation between the two conditions".
- **Emergency department (one non-core site).** Patients seen rose, an "average increase per clinician shift from 9.10 to 10.36, a 13.43% improvement". An economic analysis that GOSH commissioned from York Health Economics Consortium (YHEC) says "time spent on documentation tasks reduced by 51.7%, equating to a saving of six minutes per patient". In that analysis 24 ED clinicians used the tool, and the total ED staff is 90.
- **Ambulance Clinical Hub (April 2025).** "AVT users assessed 2.3 patients per hour versus 2.0 among non-users, a 15% increase".
- **National projections** of £658 million in clinical capacity gains and £176 million in documentation savings, "if scaled across all A&E doctors", are modelled: "The analysis assumes that 80% of the time saved can be directly reused by clinicians".

**Not measured:** the core-site design was non-randomised and within-subject, so each clinician was compared with their own baseline rather than with a concurrent control group; ED and ambulance sites had no observers; core sites did not score note and letter quality; and the report does not measure error rates, patient outcomes or the cost of the tool.

## What failed

- **Templates** that did not fit clinical needs were "a significant source of frustration across all settings".
- **Letters** were often called "too AI-like". One clinician wrote them from scratch "as this has been quicker than trying to edit [AVT] generated letters."
- **Accuracy.** Medication names, key symptoms and safeguarding issues were sometimes omitted or misrepresented. [Hallucinations](#hallucination-factuality) were "a persistent cause of anxiety, albeit a rare occurrence".
- **Settings.** AVT worked best in structured clinics and was "less reliable in unstructured, dynamic settings (e.g. ambulance scenes, EDs, mental health crisis consultations)".
- **Hardware and software.** Clinicians reported microphones cutting out. At one site the tool sometimes logged itself out mid-recording, deleting what had been recorded.
- **An early site.** "one of the earliest sites had a high (86%) proportion of detractors", which the report links partly to training, templates and hardware.
- **Economics.** "The results are based on data from just one hospital and a small number of clinicians".

## What the team would do differently

The report says "effective adoption depends on aligning people, processes, and platforms": governance support, at-the-elbow training, custom templates, workflow integration and feedback loops. Its playbook chapter describes two mid-programme changes: administrative instead of medical staff as observers, which made a larger team affordable, and GOSH staff taking over clinician training. It recommends deploying AVT as a "platform play" rather than isolated pilots.

The wiki's reading: direct observation of 104 clinicians is stronger evidence than self-report. But without a control group, other changes over 12 months cannot be ruled out (the report notes that training, templates and hardware workarounds "were constantly evolving"), and some figures differ between chapters, such as 9.10 against eight ED patients per shift at baseline. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) and [Online controlled experiments for AI features](#online-experiments).

## Disclosure

None.

## Sources

- GOSH DRIVE AVT Evaluation Project Team: Paul Gough, Alastair Hill, Nick James, Stephen Mathew, Geralyn Oldham, Dr. Robert Robinson, Dr. Shankar Sridharan, Eleanor Sullivan, Prof. Andrew Taylor, Maya Tomlinson and Prof. Jo Wray, Great Ormond Street Hospital Data Research, Innovation and Virtual Environments Unit, [“The use of Ambient Voice Technology with Generative Artificial Intelligence in Multiple Clinical Settings Across the NHS”](https://media.gosh.nhs.uk/documents/AAI_Phase_4_NHSE_Final_Report_1.3.pdf), report (PDF), Version 1.3, updated 11/02/2026.

## Related

- [About playbooks](#about-playbooks)
- [Speech recognition models](#speech-recognition)
- [Human in the loop](#human-in-the-loop)
- [Hallucination and factuality](#hallucination-factuality)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
