---
id: ucsd-ai-drafted-patient-replies
book: 21
order: "21.94"
title: AI-drafted replies to patient messages at UC San Diego Health
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, drafting-assistants, human-in-the-loop, randomized-evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (academic health system, primary care)"
use_case: "Generative AI drafts of replies to patients' medical advice messages inside the electronic health record, for physicians to edit and send"
outcome: "Read time rose 21.8% (95% CI, 5.2% to 41.0%); the −5.9% change in reply time was not statistically significant; reply length rose 17.9% (95% CI, 10.1% to 26.2%)"
measured_how: "EHR user access log for 10,679 replies from 52 volunteer primary care physicians, randomized to immediate or delayed activation, and 70 contemporary controls, June to August 2023, with a linear mixed-effects model (Tai-Seale et al., JAMA Network Open, April 2024)"
prerequisites: [online-experiments, human-in-the-loop]
replications: []
---
> [!tldr]
> UC San Diego Health worked with Epic Systems to add generative AI drafts for patient messages to its health record and tested them in a randomized waiting-list study. Access to drafts was not associated with less time: read time rose 21.8%, reply time did not change significantly and replies got longer. The authors report that physicians "valued AI-generated drafts as a compassionate starting point for their replies" and also noted areas for improvement.

> [!note] From the public record
> Built from UC San Diego Health's own published account, "AI-Generated Draft Replies Integrated Into Health Records and Physicians’ Electronic Communication" (April 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper's starting point: "Electronic messaging in electronic health records (EHRs) is a major source of physician burnout." Existing strategies include triage by care teams, charging fees and templated replies. Published work suggested that generative AI (GenAI) could potentially extend this toolset by drafting replies. The authors studied whether drafts are associated with physician time on messages and with reply length.

## Why this approach

The paper does not describe other options. UC San Diego Health collaborated with an EHR vendor, Epic Systems, "to implement GenAI natively in the EHR".

For the evaluation, the team chose "A modified waiting list randomized QI study". The paper's reasons: comparing the two groups controls for expectations and natural fluctuations, all volunteers eventually receive the intervention, and the contemporary controls help rule out changes due simply to the passage of time. See [Online controlled experiments for AI features](#online-experiments).

## The approach

1. **Scope.** Drafts covered four types of patient medical advice requests: refills, results, paperwork and general questions. A draft typically appeared in the physician's inbasket in less than 1 minute. If no draft came within 4 minutes, the message was shown without one.
2. **Choice.** Physicians picked "Start with Draft" or "Start Blank Reply". A statement was added by default: "Part of the message was generated automatically and was reviewed and edited by [name of doctor]."
3. **Participants.** "Fifty-two physicians (43% participation rate) volunteered" from Family Medicine and General Internal Medicine. 25 were randomized to immediate activation and 27 to activation 21 days later. 70 physicians in these departments who did not participate served as contemporary controls.
4. **Measures.** Read and reply time came from the EHR user access log; reply length was counted in characters. Periods: 3 weeks before entry, 3 weeks after, and weeks 4 to 6. A survey asked how likely physicians were to recommend the drafts to colleagues, from 0 to 10.
5. **Hypothesis.** Drafts would be associated with less time spent reading and replying. The power calculation targeted a 20% reduction in time spent on answering messages and called for 46 participants.

## The stack

As of the study period, June to August 2023 (published April 2024):

- GenAI drafting implemented natively in the EHR, in collaboration with the vendor Epic Systems. The paper does not name the language model, its provider or the prompts.
- The EHR user access log for timing, and surveys.
- Linear mixed-effects models on log-transformed outcomes, under intention-to-treat, in R version 4.3.2.
- Researchers and "publicly available ChatGPT 3.5" analyzed the free-text survey answers.

## Results, and how they were measured

The study examined 10,679 replies. Effects are proportional differences with 95% CIs (see [Statistics for evals](#eval-statistics)).

- **Read time.** "The estimated association of GenAI was a 21.8% increase in read time (95% CI, 5.2% to 41.0%; P = .008)". Median read time in the immediate group was 26 seconds at baseline, then 31 and 31 seconds; in the control group 21, 22 and 23 seconds.
- **Reply time.** "The change in reply time was −5.9% (95% CI, −16.6% to 6.2%; P = .33), which was not statistically significant."
- **Reply length.** "The change in reply length showed a statistically significant increase of 17.9% (95% CI, 10.1% to 26.2%; P < .001)."
- **Physician views.** At 3 weeks, 15 of 25 immediate-group and 21 of 27 delayed-group participants answered the survey. Comments ranged from "Helpful in drafting responses, provides more empathy into a response without me taking time to type it all out." to "Messages were too nice and wordy, but sometimes offered good advice."

**Not measured:** the paper does not report how often physicians started from the draft or how much they changed it, the accuracy of the drafts, the patients' experience, any clinical outcome or cost. Survey themes are grouped by score band, with no count per score.

## What failed

- **The main hypothesis.** Read time rose instead of falling, and reply time did not change significantly. The authors suggest this "may be attributable to the need to read both the patient’s original message and the draft reply" and "might suggest effort in scrutinizing drafts for hallucinations". See [Hallucination and factuality](#hallucination-factuality).
- **Advice out of scope.** One draft suggested considering an X-ray or physical therapy, advice the authors call "outside of its scope". "Only the first sentence from the draft was retained by the physician."
- **Fit for the clinic.** One physician wrote that the tool "ended up creating more work for me and ultimately always recommended scheduling an appointment". They describe their clinic as largely serving people who "need urgent assistance rather than a future appointment".
- **Limits the authors name.** "Only 1 academic health system’s early experience in using GenAI in primary care is reported here." Findings may not generalize to other organizations' GenAI-EHR customizations, other specialties or a longer time horizon.

## What the team would do differently

The paper names next steps, not changes to its own study. The authors see room for "greater personalization to align with physicians’ tone and better decisions on whether to recommend a visit". They call for comparing multiple GenAIs, including medically trained ones, and for studying whether patients notice and appreciate the increased empathy and length. They also write: "GenAI’s current performance suggests that human input is still essential."

The wiki's reading: a drafting tool adds a reviewing step, and reviewing is not free. Timing reading as well as replying made that cost visible. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) and [Human in the loop](#human-in-the-loop).

## Disclosure

None.

## Sources

- Ming Tai-Seale, Sally L. Baxter, Florin Vaida, Amanda Walker, Amy M. Sitapati, Chad Osborne, Joseph Diaz, Nimit Desai, Sophie Webb, Gregory Polston, Teresa Helsten, Erin Gross, Jessica Thackaberry, Ammar Mandvi, Dustin Lillie, Steve Li, Geneen Gin, Suraj Achar, Heather Hofflich, Christopher Sharp, Marlene Millen and Christopher A. Longhurst, University of California San Diego School of Medicine and Stanford School of Medicine, [“AI-Generated Draft Replies Integrated Into Health Records and Physicians’ Electronic Communication”](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2817615), JAMA Network Open 7(4):e246565, published online 15 April 2024, doi:10.1001/jamanetworkopen.2024.6565. Open-access full text also on [PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC11019394/).

## Related

- [About playbooks](#about-playbooks)
- [Online controlled experiments for AI features](#online-experiments)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Human in the loop](#human-in-the-loop)
- [AI product and UX](#ai-product-ux)
