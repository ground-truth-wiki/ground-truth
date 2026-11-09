---
id: uw-ambient-documentation-studies
book: 21
order: "21.95"
title: Testing an ambient AI scribe in a randomized trial before rollout at UW Health
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, ambient-scribes, randomized-trial, drift-monitoring, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (academic health system)"
use_case: "An ambient AI scribe (Abridge) that drafts clinical notes from the conversation in ambulatory visits, tested in a trial before a system-wide rollout"
outcome: "Work exhaustion/interpersonal disengagement fell 0.44 points on a five-point scale (significant), professional fulfillment rose 0.14 points (not significant), time on notes fell 0.36 hours per day"
measured_how: "Stepped-wedge, individually randomized pragmatic trial of 66 practitioners over 24 weeks, August 21, 2024 to March 27, 2025, with the Stanford Professional Fulfillment Index and EHR audit logs (Afshar et al., NEJM AI, November 2025)"
prerequisites: [online-experiments]
replications: []
---
> [!tldr]
> UW Health and the UW School of Medicine and Public Health ran a pragmatic randomized trial of Abridge, an ambient AI scribe, with 66 practitioners before rolling it out across UW Health's clinics and hospitals. Work exhaustion/interpersonal disengagement fell significantly, time on notes fell, and professional fulfillment did not rise significantly. In the implementation phase before the trial, a note template change cut diagnostic coding accuracy from 79% to 35% until a template redesign and user training restored it.

> [!note] From the public record
> Built from the University of Wisconsin School of Medicine and Public Health's own published account, "Studies find AI technology for clinical documentation aids efficiency and reduces burnout" (December 2025), linked under Sources with the team's two papers in NEJM AI. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The news page says: "The time spent documenting patient interactions in electronic health records, or EHR, is a major contributor to burnout." An ambient AI tool "passively listens to a doctor-patient visit" and drafts a summary. The team's first paper says adoption remained limited by "challenges in electronic health record (EHR) integration, coding compliance, and real-world evaluation", and that earlier studies were "limited by observational designs, a lack of random assignment" and short follow-up.

## Why this approach

UW Health bought the licenses "for clinical use regardless of the trial", and the team embedded a randomized trial in that deployment. It chose a stepped-wedge design, where groups switch to the tool at different times, "due to the impracticality of rolling out the intervention to all providers simultaneously." See [Online controlled experiments for AI features](#online-experiments).

The sources do not say whether other products were considered or why Abridge was chosen.

## The approach

The first paper calls the method the Pragmatic Trial Operations (PTOps) Playbook, with "five core components: governance, user experience, technical integration, documentation sustainment (i.e., coding compliance), and analytics."

1. **Implementation phase.** It "started on June 24, 2024", with twenty providers and 8527 clinic encounters evaluated.
2. **Governance.** Multidisciplinary workgroups linked operations and research, using the Systems Engineering Initiative for Patient Safety (SEIPS) framework.
3. **Integration and training.** After verbal consent, providers started recordings in the Epic Haiku mobile app, and notes returned to the EHR through Epic's private APIs and FHIR R4 APIs. Training was a 1-hour group webinar plus an online user guide.
4. **Monitoring.** A real-time dashboard tracked utilization and documentation accuracy. A difference-in-differences analysis watched time in notes, work outside work and utilization for drift (see [Data validation, drift and skew](#data-validation-drift)). An internally developed LLM audited ICD-10 coding compliance.
5. **The trial.** Sixty-six practitioners were randomly assigned to three 6-week sequences, moving from usual practice to ambient AI. Coprimary outcomes came from the Stanford Professional Fulfillment Index, collected at baseline and at 6, 12, 18 and 24 weeks.
6. **Rollout.** After the trial, UW Health rolled out the system "throughout clinics and hospitals in Wisconsin and Illinois", where "about 800 physicians and advanced practice providers use the technology."

## The stack

As of the papers (August and November 2025):

- **Scribe:** Abridge (Abridge AI, Inc.), under a software-as-a-service agreement. It "was documentation-only and provided no diagnostic or therapeutic decision support." Two authors of the first paper list Abridge AI, Inc. as their affiliation, and the trial paper thanks the Abridge team for technical support and manuscript review. Both papers state: "No funding was provided by the AI software company".
- **EHR:** Epic, with the Haiku app and FHIR R4 APIs.
- **Dashboard:** credited to QlikTech International AB, combining EHR and Abridge data.
- **Coding audit:** OpenAI's GPT-4o in a "secure, Health Insurance Portability and Accountability Act–compliant Azure environment".
- **Note quality:** the PDSQI-9 instrument, scored by an LLM-as-a-judge validated against physician ratings; the model is not named. See [LLM-as-judge done right](#llm-as-judge).

## Results, and how they were measured

The trial ran "between August 21, 2024, and March 27, 2025", analyzed by intention to treat.

- **Burnout.** "a significant reduction in work exhaustion/interpersonal disengagement" of -0.44 points (95% CI, -0.62 to -0.25; P<0.001) on a five-point Likert scale.
- **Fulfillment.** "a nonsignificant increase in professional fulfillment (+0.14 points; 95% CI, 0.004 to 0.28; P=0.04)", against a two-sided type-I error rate of 0.025 per coprimary outcome.
- **Time on notes.** "time spent on notes decreased (−0.36 hours per day; 95% CI, −0.55 to −0.17)." The trial paper's discussion gives this as "0.36 hours (−21.9 minutes) per day". The news page says the tool "reduced documentation time by 30 minutes per day per provider".
- **Work outside work.** The reduction (-0.50 hours per day; in the discussion, "0.50 hours (−30 minutes) per day") "was no longer significant after removing the top 3% of daily observations."
- **Use.** "A total of 71,487 notes were authored, of which 27,092 (38%) were generated using ambient AI."
- **Coding.** On a stratified random sample of 6110 notes, scored 0 to 10, AI-generated notes had a mean ICD-10 compliance score of 6.87 (95% CI, 6.76 to 6.98), against 5.94 (95% CI, 5.81 to 6.07) for human-authored notes.
- **Note quality.** On 7966 sampled notes, scored before practitioner review, PDSQI-9 means ranged "from 3.97 to 4.99 across domains on a five-point scale."
- **Drift.** "No drift in software performance was detected."
- **LLM coder.** The first paper reports "a strong correlation with professional coders (Pearson’s r=0.97)."

**Not measured:** the trial "did not collect patient-reported outcomes related to comfort or disclosure", and none of the sources report costs, clinical outcomes for patients or results after the system-wide rollout.

## What failed

- **A template change cut coding accuracy.** During the implementation phase, a change made "in an attempt to simplify the note template" reduced ICD-10 documentation accuracy "from 79% (95% confidence interval [CI], 72 to 86%) to 35% (95% CI, 28 to 42%)". "A manual review of 797 visit encounters across 17 providers" found it. A revised template with a refreshable block of text (SmartLink in Epic), targeted training and updated onboarding brought accuracy back to "preintervention levels of an average 80%".
- **Uneven use.** "Seven practitioners exhibited low fidelity with ambient AI"; three never started.
- **Limits.** The cohort was "predominantly younger, white, and female, with nearly half from family medicine." Volunteers may be early adopters, and the open-label design leaves room for Hawthorne effects.

## What the team would do differently

The papers state lessons rather than regrets: "Operationalizing ambient AI use required more than a simple ‘plug-and-play’ implementation", and "A key to success was the governance structure, which supported iterative improvement cycles." The first paper adds that generative AI platforms "continue to have updates that may lead to significant drifts in performance." The trial paper says future trials "should assess patient experience and relationship quality."

The wiki's reading: the worst failure came from a note template, not from the model. Tracking documentation accuracy alongside the model is what made it visible. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure

None.

## Sources

- University of Wisconsin School of Medicine and Public Health (no individual byline), [“Studies find AI technology for clinical documentation aids efficiency and reduces burnout”](https://www.med.wisc.edu/news/ambient-ai-improves-practitioner-well-being/), SMPH news, 12 December 2025.
- Majid Afshar, Felice Resnik, Mary Ryan Baumann, Josie Hintzke, Kayla Lemmon, Anne Gravel Sullivan, Tina Shah, Anthony Stordalen, Michael Oberst, Jason Dambach, Leigh Ann Mrotek, Mariah Quinn, Kirsten Abramson, Peter Kleinschmidt, Tom Brazelton, Heidi Twedt, David Kunstman, Graham Wills, John Long, Brian W Patterson, Frank J Liao, Stacy Rasmussen, Elizabeth Burnside, Cherodeep Goswami and Joel E Gordon, University of Wisconsin and UW Health, with co-authors from Rutgers New Jersey Medical School and Abridge AI, Inc., [“A Novel Playbook for Pragmatic Trial Operations to Monitor and Evaluate Ambient Artificial Intelligence in Clinical Practice”](https://pmc.ncbi.nlm.nih.gov/articles/PMC12435388/), NEJM AI 2(9), published 28 August 2025, doi:10.1056/aidbp2401267.
- Majid Afshar, Mary Ryan Baumann, Felice Resnik, Josie Hintzke, Anne Gravel Sullivan, Graham Wills, Kayla Lemmon, Jason Dambach, Leigh Ann Mrotek, Mariah Quinn, Kirsten Abramson, Peter Kleinschmidt, Thomas B Brazelton, Margaret A Leaf, Heidi Twedt, David Kunstman, Brian Patterson, Frank Liao, Stacy Rasmussen, Elizabeth S Burnside, Cherodeep Goswami and Joel Gordon, University of Wisconsin and UW Health, [“A Pragmatic Randomized Controlled Trial of Ambient Artificial Intelligence to Improve Health Practitioner Well-Being”](https://pmc.ncbi.nlm.nih.gov/articles/PMC12858090/), NEJM AI 2(12), published 26 November 2025, doi:10.1056/AIoa2500945. Read as the NIH author manuscript in PMC.

## Related

- [About playbooks](#about-playbooks)
- [Online controlled experiments for AI features](#online-experiments)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Data validation, drift and skew](#data-validation-drift)
- [LLM-as-judge done right](#llm-as-judge)
