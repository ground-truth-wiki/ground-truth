---
id: mass-general-emory-ambient-documentation
book: 21
order: "21.89"
title: Ambient AI documentation pilots at Mass General Brigham and Emory Healthcare
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, ambient-documentation, clinical-notes, clinician-burnout, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (two US academic medical center systems)"
use_case: "Ambient documentation technology that listens to clinician-patient conversations and drafts clinical notes with generative AI"
outcome: "MGB clinicians reporting burnout fell from 52.6% to 30.7% at 84 days; Emory clinicians reporting a positive documentation impact on well-being rose from 1.6% to 32.3% at 60 days"
measured_how: "Noncontrolled pre and post surveys of pilot clinicians who answered both: 192 of 873 at MGB (Professional Fulfillment Index, 84 days) and 62 of 557 at Emory (one well-being question, 60 days) (You et al., JAMA Network Open, August 2025)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> Mass General Brigham (MGB) and Emory Healthcare piloted ambient documentation technology (ADT), which drafts clinical notes from clinician-patient conversations, with 1430 clinicians and surveyed them before and after. At MGB the share of respondents reporting burnout fell from 52.6% to 30.7% at 84 days, and at Emory the share reporting a positive documentation impact on well-being rose from 1.6% to 32.3%. The study had no control group and low response rates, and the authors warn that the results may reflect "more enthusiastic users".

> [!note] From the public record
> Built from Mass General Brigham and Emory Healthcare's own published account, "Ambient Documentation Technology in Clinician Experience of Documentation Burden and Burnout" (August 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper's starting point: "Documentation burden is associated with clinician burnout." Earlier remedies had limits. Speech recognition, or dictation software, "has not clearly impacted documentation time", and for virtual scribes "cost and scribe turnover limit broader implementation".

ADT "listens to a clinician-patient conversation and drafts a structured note using generative AI". The study asked three questions: how much clinicians use ADT by their own report, how its use is associated with changes in clinician experience, and what pilot users think should improve.

## Why this approach

The paper does not say which alternatives either health system weighed, or how the vendors were chosen, beyond noting that each site selected its vendors independently.

The wiki's reading: an ambient scribe combines [speech recognition](#speech-recognition) with a generative model that writes the note. A clinician comment quoted in the paper ("I still need to go through and edit the note") shows that the clinician stays the [human in the loop](#human-in-the-loop).

## The approach

The two systems ran separate quality improvement pilots and analyzed them separately.

- **MGB,** with 12 hospitals and 7500 physicians, ran a nonrandomized, unmasked pilot with 2 fully AI-based ADT vendors, one with ambulatory EHR integration and one not integrated at first. Onboarding started February 27, 2024. Clinicians took part across ambulatory, emergency department and inpatient care. Vendor assignment depended on care setting, device type, qualified bilingual speaker status and specialty leadership input. Clinicians were surveyed before, at 42 days and at 84 days.
- **Emory Healthcare,** with 11 hospitals and 3400 physicians, started a rolling pilot of 1 fully AI-based, EHR-integrated ADT vendor on July 19, 2023. Once early participants in a specialty found the output appropriate and the tool helpful, all clinicians in that specialty were invited. Clinicians were surveyed before and at 60 days.

MGB counted a clinician as burned out at a Professional Fulfillment Index overall burnout score above 1.33, on a 0 to 4 scale. Emory asked one question about the impact of one's documentation process on well-being and counted 3 or 4 (positive or very positive) as positive. Usage was self-reported, because it was hard to measure in a standard way. Researchers masked to the vendors coded the free-text comments.

## The stack

As of August 2025, describing pilots that onboarded clinicians from February 27 to July 31, 2024 (MGB) and from July 19, 2023, to July 31, 2024 (Emory): both systems use Epic (Epic Systems) as their EHR. MGB used 2 ADT vendors, one integrated with its ambulatory EHR, and Emory used 1 EHR-integrated vendor. The paper names neither the vendors nor the AI models. It says only that the outcomes represent implementation "with specific AI models and product features at a specific point in time". Surveys ran in REDCap at MGB and in Microsoft Forms at Emory.

## Results, and how they were measured

Across both sites, 1430 clinicians were enrolled: 873 at MGB and 557 at Emory. The analyses include only clinicians with complete pre and post survey results.

- **Response.** At MGB, 265 of 873 (30.4%) answered at 42 days and 192 of 873 (22.0%) at 84 days. At Emory, "the postsurvey response rate was 11.1% (62 of 557 respondents)", counting only responses that could be matched to a presurvey.
- **Usage.** "A total of 128 of 264 MGB survey respondents (48.5%)" reported using ADT for at least 50% of their visits, and 27 of 62 Emory respondents (43.5%) for most or all of their notes.
- **Burnout at MGB.** The share reporting burnout fell from 50.6% to 29.4% at 42 days and "decreased from 52.6% to 30.7% (χ2 = 32.7; P < .001) at 84 days." Changes in professional fulfillment and in intention to leave were not statistically significant.
- **Well-being at Emory.** The share reporting a positive impact of their documentation practice on well-being "improved from 1.6% to 32.3% (χ2 = 19.0; P < .001)", from 1 to 20 respondents after 60 days.
- **Recommendation.** The median likelihood-to-recommend score was 8.0 at both sites, on a scale of 1 to 10.
- **Comments.** Free-text comments came from 139 MGB and 20 Emory clinicians. The theme with the most respondents was AI note style, 83 of 159. Views on time were mixed: one clinician gets "about an hour back every day", another found "it added 1 to 2 hours a day to my note writing".

**Not measured:** the study had no control group. It reports no objective measure of documentation time or of actual ADT use, no accuracy or error rate for the drafted notes, no cost, and no effect on patients. The authors list patient experience and financial sustainability as questions for further work.

## What failed

The authors list the limits themselves:

- **Who answered.** Given the response rates, the findings "may represent the experience of more enthusiastic users and a best-case scenario". Respondents also differed from the full cohorts by specialty.
- **Design.** It "was a noncontrolled study of 2 academic medical center systems with a limited number of vendors", and the voluntary pilots may have shaped who took part.
- **Usage data.** Self-reported usage is "subject to recall bias".
- **Fit to visit types.** Comments named pediatric physical examinations and psychiatry as weaker fits, and one MGB clinician wrote: "Errors tend to be minor but are frequent."
- **Time horizon.** "The association of ADT with long-term clinician experience is currently unclear."

## What the team would do differently

The paper does not say what the teams would redo. It recommends that "implementation teams should identify visit types optimal for ADT, and vendors could target other visit types for improvement", and calls for standard measures of ADT use, "potentially developed in partnership with EHR and ADT vendors".

The wiki's reading:

- **A before-and-after survey shows an association, not an effect.** A staggered or randomized rollout, as in [Online controlled experiments for AI features](#online-experiments), would separate the tool from everything else that changed.
- **Log usage instead of asking about it.** Agree on usage data with the vendor before the pilot starts. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Measure the drafts, not only the experience.** A comment about frequent minor errors argues for checking note accuracy too. See [Hallucination and factuality](#hallucination-factuality).

## Disclosure

None.

## Sources

- Jacqueline G. You, Reema H. Dbouk, Adam Landman, David Y. Ting, Sayon Dutta, Julie C. Wang, Amanda J. Centi, Molly Macfarlane, Eran Bechor, Jonathan Letourneau, Gabrielle Choo-Kang, Esther H. Kim, Cordula Magee, Brian J. Lang, Laura Angelo, Jackson Olin, Michelle Frits, Christine Iannaccone, Angela Rui, Ivana Salmikova, Christopher Holland, Bryan Blanchette, Rachel Silverman, David W. Bates, Lisa Rotenstein and Rebecca G. Mishuris, [“Ambient Documentation Technology in Clinician Experience of Documentation Burden and Burnout”](https://pmc.ncbi.nlm.nih.gov/articles/PMC12371510/), JAMA Network Open 8(8): e2528056, published 21 August 2025, doi:10.1001/jamanetworkopen.2025.28056. Mass General Brigham and Emory Healthcare, with Brigham and Women’s Hospital, Massachusetts General Hospital, Emory University School of Medicine, Harvard Medical School, Northeastern University and the University of California, San Francisco.

## Related

- [About playbooks](#about-playbooks)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Speech recognition models](#speech-recognition)
- [Human in the loop](#human-in-the-loop)
- [Online controlled experiments for AI features](#online-experiments)
