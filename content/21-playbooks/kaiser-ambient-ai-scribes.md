---
id: kaiser-ambient-ai-scribes
book: 21
order: "21.86"
title: "Kaiser Permanente: the first year of an AI scribe for clinical notes"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, ambient-scribes, speech-recognition, adoption, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (The Permanente Medical Group, Northern California)"
use_case: "A generative AI scribe that turns the conversation in a medical visit into a transcript and a suggested visit summary, which the physician reviews and edits"
outcome: "Used by 7,260 physicians in 2,576,627 patient encounters; an analysis found it saved nearly 16,000 hours in documentation time; 88% of surveyed physicians reported a positive impact on visit interactions"
measured_how: "Usage counts from October 2023 to December 2024; an analysis of whether scribe use was associated with changes in documentation time, with no calculation or period stated for the 16,000-hour figure; surveys with 102 physician and 118 patient responses (Kaiser Permanente Division of Research, April 2025)"
prerequisites: [speech-recognition, measuring-ai-impact]
replications: []
---
> [!tldr]
> The Permanente Medical Group in Northern California offered physicians a generative AI scribe that drafts visit notes from the conversation with the patient. Between October 2023 and December 2024 it was used by 7,260 physicians in 2,576,627 patient encounters, and an analysis found it "saved nearly 16,000 hours in documentation time". Surveys were mostly positive, but the page does not say how the time figure was calculated and gives no count of errors.

> [!note] From the public record
> Built from the Kaiser Permanente Division of Research's own published account, "AI-assisted notetaking gains steady support from Kaiser Permanente physicians" (April 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The AI scribe was offered to physicians of The Permanente Medical Group (TPMG) in Northern California. It was offered "to reduce the burden of notetaking during medical visits", and to free doctors from focusing on the keyboard while with patients. The lead author, Aaron Tierney, links adoption to burnout: "We found the highest adoption rates in departments that typically suffer from the highest levels of documentation and burnout".

## Why this approach

The page does not say which other options were considered, or why a generative scribe was chosen. It says only that the organization "changed technology vendors" between a 10-week pilot in 2023 and the rollout in 2024, without naming either vendor or giving a reason.

## The approach

1. **Pilot.** A 10-week pilot ran in 2023. The same authors reported on it in NEJM Catalyst in February 2024.
2. **Rollout.** The rollout followed in 2024. The usage figures cover October 2023 to December 2024.
3. **In the visit.** "Patients are informed that the AI scribe is in use". The tool is applied to the conversation and produces a transcript and a suggested visit summary.
4. **Review by the physician.** Doctors "have the opportunity to review and edit the tool's suggested visit summary to ensure accuracy." The page states that "the app does not make decisions or recommendations to the doctor about patient care." For this pattern, see [Human in the loop](#human-in-the-loop).
5. **Evaluation.** The authors counted use, tracked whether scribe use was associated with changes in documentation time, and surveyed physicians and patients. A second NEJM Catalyst article reported the first year.

## The stack

As of April 2025, the page names very little. Vincent Liu, TPMG chief data officer, describes the technology as "generative AI applied to conversations to produce transcripts and summaries" in a medical setting. Turning speech into text is the job of [speech recognition](#speech-recognition), but the page does not describe the pipeline. It names no model or vendor, and it does not say which electronic health record (EHR) system the scribe works with.

## Results, and how they were measured

- **Use.** Between October 2023 and December 2024, "the tool was used by 7,260 TPMG physicians to assist in 2,576,627 patient encounters". Some were heavy users: 3,447 physicians used it in at least 100 patient encounters each. Users were more likely to be in mental health, emergency medicine or primary care.
- **Time.** An analysis found that AI scribe use "saved nearly 16,000 hours in documentation time." Users "had reductions in time spent in the EHR outside of the 7 a.m. to 7 p.m. workday" and in time spent on notes per appointment.
- **Physician survey.** Adult and family medicine physicians were surveyed, with 102 responses. Two-thirds said they use the scribe 5 or more days per week. 63% said they used it in every in-person visit, and another 29% in most visits. "Survey respondents overwhelmingly (88%) said AI scribes had a positive impact on their visit interactions."
- **Patient survey.** Patients surveyed after a scribe visit gave 118 responses. More than a third said their doctor spent more time than usual speaking directly to them, and 56% reported no effect. 47% thought their doctor spent less time looking at the screen. Two-thirds were comfortable with the technology, 26% were neutral, and "8% said they had some level of discomfort with it."
- **Note quality, from the pilot.** In the 2023 pilot, the authors analyzed 35 AI-generated transcripts, "scoring them on average 48 out of 50 on measures including lack of bias, consistency, succinctness, and accuracy."

**Not measured:** the page does not state how the 16,000 hours were calculated, over which period, or against which baseline. It reports no randomized comparison, no survey response rates, no count of errors at rollout scale, no patient outcomes and no cost. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## What failed

- **Hallucinations occurred.** The pilot review "found few incidents of hallucinations, or false information introduced by the AI." The page gives no number or examples. See [Hallucination and factuality](#hallucination-factuality).
- **Uneven adoption.** 8% of surveyed physicians had never used the scribe. Physicians least likely to use it were in infectious disease, obstetrics/gynecology and urology. Surveyed physicians were less likely to use it in telemedicine visits.
- **Benefits were concentrated.** "The users who benefitted the most were also the highest volume users of the technology," Tierney said. Over time their savings "substantially surpassed" those of "peers who used the technology infrequently or not at all".
- **A vendor change.** The authors reported differences in adoption after the vendor change, but the page does not describe them. It says adoption "continued to increase during the rollout" with no decrease with the new vendor's product.

## What the team would do differently

The page states no such lessons. It looks ahead instead: "The technology is expected to have enhancements and customization over time that could increase the number of users". Liu's summary: "We have now shown that this technology alleviates workloads for doctors".

The wiki's reading: the usage counts show adoption, but the quality evidence here is narrow. It is a score on 35 pilot transcripts from before the vendor change, so it may not describe the product that was rolled out. The time savings are reported as associations with use, and heavy users may differ from other physicians in ways that also affect documentation time. A similar rollout should measure errors in the final notes at scale, not only use and satisfaction. See [Error analysis first](#error-analysis).

## Disclosure

None.

## Sources

- Jan Greene, Kaiser Permanente Division of Research, [“AI-assisted notetaking gains steady support from Kaiser Permanente physicians”](https://divisionofresearch.kaiserpermanente.org/ai-assisted-notetaking-gains-steady-support-from-kaiser-permanente-physicians/), Kaiser Permanente Division of Research news, 1 April 2025. Reports a NEJM Catalyst article by Aaron Tierney, Kristine Lee, Vincent Liu, Gregg Gayre, Brian Hoberman, Britt Mattern, Manuel Ballesca and Patricia Kipnis, which this page did not draw on directly.

## Related

- [About playbooks](#about-playbooks)
- [Speech recognition models](#speech-recognition)
- [Hallucination and factuality](#hallucination-factuality)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Human in the loop](#human-in-the-loop)
