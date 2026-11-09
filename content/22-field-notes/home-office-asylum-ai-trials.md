---
id: home-office-asylum-ai-trials
book: 22
order: "22.30"
title: "AI summaries and policy search in UK asylum decisions: the Home Office pilots"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, summarization, human-in-the-loop, evaluation, public-record]
visuals: []
type: field-note
account: public-record
industry: "Public sector (UK central government, asylum casework)"
use_case: "An LLM tool that summarises asylum interview transcripts (ACS) and a chat-based AI search assistant for country policy information (APS), both as aids to human decision-makers"
outcome: "ACS test group reviewed transcripts 23 minutes quicker than the comparison group (a 32% time saving); APS test group saved on average 37 minutes per case; no apparent effect on decision quality; 9% of ACS summaries inaccurate or missing information, and removed"
measured_how: "Test and comparison groups in 2 Decision Making Units per tool (ACS: 334 and 95 logged cases, May to June and September to October 2024; APS: 270 and 214 logged cases, October to December 2024), plus surveys, interviews and a Calibre dip-sample of decisions; all methods self-reported (Home Office research note, April 2025)"
prerequisites: [human-in-the-loop, measuring-ai-impact]
replications: []
---
> [!tldr]
> In 2024 the UK Home Office piloted two AI aids for asylum decision-makers: an LLM tool that summarises interview transcripts (ACS) and a chat-based search assistant for country policy information (APS). The ACS test group "reviewed transcripts 23 minutes quicker than the comparison group (a 32% time saving)", the APS test group saved on average 37 minutes per case, and decision quality did not appear to change. Technical specialists reviewed all summaries before use, and 9% were removed as inaccurate or having missing information; the report notes that all its methods rely on self-reporting.

> [!note] From the public record
> Built from the Home Office's own published account, "Evaluation of AI trials in the asylum decision making process" (April 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The report says asylum decision-makers spend a substantial amount of time on interview transcripts and country policy research: "Transcripts can extend to 50 pages or more and cognitive load for decision-makers is high." The Home Office trialled two tools:

- **Asylum Case Summarisation (ACS).** It "uses a Large Language Model to extract and summarise information" from interview transcripts into a concise summary document.
- **Asylum Policy Search (APS).** A chat-based interface that finds and summarises Country Policy Information Notes (CPINs) and Country of Origin Information Requests (COIRs) relevant to the case.

Under the "‘human in the loop’ principle", neither tool can be used by itself to make a decision, and APS users need to access the full CPIN or COIR. See [Human in the loop](#human-in-the-loop). As of April 2025, the report names no model, vendor or hosting.

## What happened

1. **May to June 2024: ACS phase 1.** 8 weeks in 2 Decision Making Units (DMUs), chosen for their availability, with 60 decision-makers in the test group and 15 in the comparison group.
2. **September to October 2024: ACS phase 2.** 8 more weeks in the same DMUs, with 45 test and 15 comparison decision-makers.
3. **October to December 2024: APS pilot.** 2 other DMUs, with 50 test and 30 comparison decision-makers.
4. **Data collection.** Participants were asked to log each case: 334 test and 95 comparison cases for ACS, 270 and 214 for APS. Surveys drew 26 responses (43% response rate) after ACS phase 1 and 39 (78%) for APS; the ACS phase 2 survey, with 6 responses (13%), was excluded. There were 11 interviews after ACS phase 2 and 10 after APS. A dip-sample of decisions was reviewed with Calibre, the quality assurance tool used in Asylum Operations.
5. **29 April 2025: publication** of the research note on GOV.UK.

## Impact, and how it was measured

- **ACS speed.** "On average, the test group reviewed transcripts 23 minutes quicker than the comparison group (a 32% time saving)." Some interviewees "highlighted minimal time-saving due to the summary not providing source references."
- **APS speed.** "Those in the test group saved on average 37 minutes per case, researching country policy information", approximately 12 minutes at pre-interview stage and approximately 25 minutes at decision-writing stage.
- **Decision quality.** For ACS, "the proportion of sustained decisions was similar across the comparison and test groups", and the same held for APS.
- **Summary accuracy.** "Technical specialists reviewed all summaries for accuracy prior to use in the pilot." "A small proportion of summaries produced (9%) were deemed to be inaccurate or had missing information" and were removed. Of the rest, "23% of users reported they were not fully confident in the summary information".
- **ACS users.** 65% of survey respondents would keep using it and 77% felt the summary helped them understand the case quickly, "although only 42% felt it gave them the right amount of information".
- **APS users.** For 82% of queries, users reported sufficient information and references. 79% of respondents were confident the answers represented the CPIN accurately, and "Just over half (54%) of survey respondents reported they would continue using the tool."
- **Outcomes by group.** ACS showed "no significant differences" between groups for the most common nationality, but "pilot numbers were too small to fully test for variation in outcome for all characteristics". See [Fairness metrics and bias measurement](#fairness-bias).

**Not measured:** no independent timing is reported, and "all the evaluation methodologies use self-reporting". The report does not assess value for money. It says that to do so, "a larger sample is needed". The report does not state how many summaries were produced or how many decisions the dip-sample covered.

## Why it happened

The report gives these reasons for limits that users reported:

- **No source references.** ACS summaries did not point to where in the transcript the information was. "This was a conscious decision of the tool designers for the pilot to reduce the technical complexity". See [Grounding and citations](#grounding-citations).
- **Limits by design.** APS functionality limits "were designed to ensure autonomy of the decision-maker and to avoid over-reliance."

The report does not explain why 9% of summaries were inaccurate or had missing information.

## What changed afterwards

The report states that Equality Impact Assessments for the tools "have been completed", without giving a date. It recommends that limitations be "addressed before a full rollout", with continuous monitoring early in any rollout and a full evaluation after deployment. It does not say whether either tool was rolled out.

## Lessons

The source's own conclusion: "Overall, the pilots demonstrate there are potential time savings associated with the use of the ACS and APS tools." It adds that more functionality "needs to be balanced with ensuring the autonomy of decision-makers".

The wiki's reading:

- **A comparison group helps, self-reports limit it.** Comparison groups give the minutes a baseline, but the times are self-logged and the units "were not selected to be representative of all DMUs". The report itself says the findings "will only provide an indication of what a full rollout might look like". See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Budget for the check.** The specialist review of every summary kept the 9% out of the pilot. A rollout without it needs another way to catch them. See [Hallucination and factuality](#hallucination-factuality).

## Disclosure

None.

## Sources

- Home Office, [“Evaluation of AI trials in the asylum decision making process”](https://www.gov.uk/government/publications/evaluation-of-ai-trials-in-the-asylum-decision-making-process/evaluation-of-ai-trials-in-the-asylum-decision-making-process), research and analysis, GOV.UK, published 29 April 2025. No individual authors are named.

## Related

- [About field notes](#about-field-notes)
- [Human in the loop](#human-in-the-loop)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Grounding and citations](#grounding-citations)
- [Fairness metrics and bias measurement](#fairness-bias)
