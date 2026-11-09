---
id: ashurst-generative-ai-trials
book: 21
order: "21.99"
title: "Ashurst's generative AI trials: measuring first drafts in a law firm"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [legal, pilots, blind-evaluation, hallucinations, public-record]
visuals: []
type: playbook
account: public-record
industry: "Legal (global law firm)"
use_case: "Generative AI for first drafts of legal and business work, such as UK corporate filings, sector research reports, legal briefings, case summaries and meeting summaries, tested in three global trials"
outcome: "Approximate time savings of 80% (UK corporate filings), 59% (sector research reports) and 45% (first draft legal briefings); GenAI case summaries scored 3 out of 5 for accuracy on average versus 3.5 out of 5 for lawyers"
measured_how: "Three trials with 411 partners, lawyers and staff, November 2023 to March 2024: controlled small-group experiments, a blind study of UK case summaries scored out of 5 by an expert panel, and surveys; sample per experiment not stated (Ashurst, June 2024)"
prerequisites: [measuring-ai-impact]
replications: []
---
> [!tldr]
> Ashurst ran three global generative AI trials with 411 partners, lawyers and staff from November 2023 to March 2024, using only publicly available data, not client data. Controlled experiments showed approximate time savings of 80%, 59% and 45% on three kinds of first drafts. A blind study found GenAI case summaries less accurate on average than lawyers' drafts, with a wider spread of accuracy scores. The firm sees the initial value in faster first drafts, and says potential time savings are always subject to the content being legally correct.

> [!note] From the public record
> Built from Ashurst's own published account, "Vox PopulAI: Lessons from a global law firm's exploration of generative AI" (June 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Ashurst wanted to go beyond use case identification and value prediction to "truly understanding and also measuring" how generative AI (GenAI) might change its work. The account names the risk: large language models do not produce output that can be relied on as legally correct, and using GenAI on tasks outside what it does well can make people perform worse than without it, a danger "particularly acute for the legal industry".

## Why this approach

Earlier trials at Ashurst had mostly tested whether one tool met one set of user needs, with a deliberately limited group of users. The GenAI trials instead needed to explore and measure the impact of a potential new capability. Ashurst had not run multiple, concurrent trials on a global scale before. It set six working hypotheses, mapped to six areas of measurement: accuracy, audience readiness, search speed, trust, value and experience. A broad participant group was meant to show where GenAI helps and where it does not. The account does not say how the tools were chosen.

## The approach

The trials covered all practice areas and business services functions across 23 offices in 14 countries, using only publicly available data. The Office of the Chief Digital Officer (the CDO team) worked with an internal governance group, including the firm's general counsel, risk and information security teams, to develop strict guidelines for each trial. Data came from three parts:

1. **A blind study.** A panel of four expertise lawyers suggested four UK cases. Anonymized case summaries by Ashurst lawyers and by the GenAI tools were scored out of 5 on accuracy, appropriateness, completeness, usability and confidence, and the five scores averaged. The experts also guessed whether each output was human or GenAI. See [Metrics and graders](#metrics-graders).
2. **Small group experiments,** co-designed with participants. Approximately 25% of participants took part in at least one, alongside free use of the tools.
3. **Forums, feedback sessions and surveys** before, during and after the trials.

## The stack

As of June 2024, the account does not name the GenAI tools, models or vendors that were trialed. It says only that the trials used both generic "assistant" type tools and tools designed for specific legal use cases, "in each case enabling contextualizing with legal data".

## Results, and how they were measured

- **Time savings.** In controlled experiments, "we measured approximate time savings of 80% to draft UK corporate filings" from company articles of association, "59% to draft industry/sector-specific research reports" from Form 10-K filings, and "45% on creating first draft legal briefings".
- **Accuracy.** In the blind study, GenAI accuracy scores "spanned 1 to 4 out of 5 versus 3 to 4 out of 5" for lawyers' first drafts, and "the average output accuracy score for GenAI-generated content was 3 out of 5 versus 3.5 out of 5" for human content. "In 67% of cases, the accuracy score for the GenAI-generated output matched or exceeded" the lawyers' score. The experts identified every lawyer's output as human, while "50% of the output generated by GenAI were either misidentified as human-produced output" or the experts could not tell.
- **Meetings.** In an open experiment, 21 participants used GenAI to summarize and recap meetings and create action points. On average, "participants reported circa 10 minutes saved per 30 minute call", and the output received an average score of 3.8/5.

The baseline in the blind study was lawyers working without GenAI tools. **Not measured:** the account gives no sample size per experiment, timing method or baseline for the time savings, and does not say which tool produced which result. The meeting savings were reported by participants. Time savings are "always subject to the content being legally correct", and the account does not say whether review and correction time was counted.

## What failed

- **Hallucinations.** "Participants reported frequent hallucinations across all GenAI tools trialed". In the blind study, one GenAI summary cited an incorrect verdict, and the expert scored every criterion 1 out of 5. See [Hallucination and factuality](#hallucination-factuality).
- **Unusable output.** In one experiment, a participant used GenAI to produce training material and extract key contractual elements from public body guidelines. The output was deemed unusable, scored 2 out of 5 for usability and "saved no legal time". The participant would still recommend using GenAI to a colleague.
- **Quality is not one number.** Scores reflected objective and subjective factors, so "quality could not be reduced to a simple mathematical average of scores".
- **Ease of use is not value.** Asked what they liked most about a specific GenAI tool, participants most often cited "ease of use", but "ease of use is not directly correlated to the value to be derived from GenAI". Legal work known to be within the frontier of what GenAI does well still did not guarantee "high-quality, legally correct outputs".
- **Sample size.** Given the sample size, "much of the data cannot be simply extrapolated to get to definitive answers" on the firm's time and cost savings.

## What the team would do differently

The account offers recommendations rather than regrets: put GenAI directly in many hands, pick a diverse group, "not just people who are already enthusiastic users", and teach people how to apply GenAI, which they needed more than technical support. "Shorter, more time-bound trials seemed to create more of a buzz and focus" than open-ended ones. The account stresses keeping "the human in the loop" (see [Human in the loop](#human-in-the-loop)).

The wiki's reading: the blind study is the reusable part. One rubric for human and model outputs, applied without labels, showed both the average and the spread. A time saving on a draft says little until checking and fixing the draft is counted, as [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) explains.

## Disclosure

None.

## Sources

- Office of the Chief Digital Officer, Ashurst (no byline; the report acknowledges Sarah Chambers, Sophia Slade, Richard Keaney and Chris Boulter; key contact Hilary Goodier), [“Vox PopulAI: Lessons from a global law firm's exploration of generative AI”](https://www.ashurstperkinscoie.com/en/insights/vox-populai-lessons-from-a-global-law-firms-exploration-of-generative-ai), Ashurst insights (thought leadership), 10 June 2024. Now hosted by Ashurst Perkins Coie and marked as originally published before that combination.

## Related

- [About playbooks](#about-playbooks)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Hallucination and factuality](#hallucination-factuality)
- [Human in the loop](#human-in-the-loop)
- [Statistics for evals](#eval-statistics)
