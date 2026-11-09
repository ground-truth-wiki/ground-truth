---
id: dft-consultation-analysis-tool
book: 21
order: "21.96"
title: "DfT's Consultation Analysis Tool: LLM thematic analysis of consultation responses"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, text-classification, llm-as-judge, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Public sector (UK central government, transport)"
use_case: "Thematic analysis of free-text public consultation responses: an LLM ensemble generates themes, people review them, and an LLM ensemble maps the reviewed themes to every response"
outcome: "Blind evaluation: theme recall 75% and theme mapping F1 0.75; live pilots: theme recall 90% and mapping F1 0.93 against the human-adjusted output"
measured_how: "Blind comparison with human-analysed data on 11 questions (9,100 responses); non-blind live pilots on 32 questions for themes and 7 questions (720 responses) for mapping (DfT and The Alan Turing Institute evaluation report, December 2025)"
prerequisites: [classification-metrics, llm-as-judge]
replications: []
---
> [!tldr]
> The UK Department for Transport (DfT) and The Alan Turing Institute built the Consultation Analysis Tool (CAT): LLM ensembles find themes in free-text consultation responses and tag every response, and people review the themes. Blind against human analysis, it found around 75% of human themes and mapped themes with an F₁ of 0.75; against the human-adjusted version of its own output in live pilots, the figures were 90% and 0.93.

> [!note] From the public record
> Built from the Department for Transport's own published account, "AI Consultation Analysis Tool (CAT) v1.0 Evaluation" (December 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

DfT runs "around 55 public consultations annually", some with hundreds of thousands of responses. Analysing them by hand "typically consumes over half of the entire consultation budget and can take months". The work has two steps: building a set of themes, then mapping them to each response. The report says the CAT has now been "piloted on multiple live consultations, analysing 200,000 responses (exceeding 8 million words) to date."

## Why this approach

Besides human researchers and topic modelling, the report sees LLMs as "a third way". The team also tested methods that clustered or topic-modelled LLM-extracted insights (K-means, hierarchical clustering, HDBSCAN, LDA); K-means reached a recall of 0.81 and an F₁ of 0.77. The team chose a pure LLM pipeline because "It delivered more consistent recall", was more flexible for new features, and could gain from newer models. The report shows no pure-pipeline scores in that comparison.

Because responses are self-selected, DfT reads prevalence as broad proportions, so human effort goes into reviewing themes rather than mappings, a choice that "accepts some degree of error in the process of mapping themes to responses". See [Human in the loop](#human-in-the-loop).

## The approach

1. **Theme generation.** With the consultation context and question, several LLM calls, each a separate "analyst", find themes in shuffled, batched responses. Another LLM pipeline merges similar themes. Rare themes with high policy relevance are kept as "golden insights".
2. **Human theme review.** Reviewers read a random sample of responses and remove, reword, merge, split or add themes. A logistic regression fitted on simulated consultations suggests how many to read to be "approximately 95% confident that no main themes were missed". If they find themes the CAT missed, they read on until they judge theme saturation is reached.
3. **Theme mapping.** A majority-vote LLM ensemble tags each response: "a theme is classified to a response only if a majority of LLMs agree".
4. **Reporting.** Prevalence comes with 95% bootstrap confidence intervals from 1,000 resamples.

The evaluation had two designs. **Blind:** the CAT against human-analysed data for 11 questions, 9,100 responses and 165 themes. An [LLM-as-a-Judge](#llm-as-judge) that "achieved a macro F₁ of 0.8" on labelled data decided which themes matched. **Non-blind:** the CAT's first output against the version people reviewed in live pilots, on 32 questions (198,000 responses) for themes and 720 sampled responses from 7 questions for mapping.

## The stack

As of December 2025, CAT v1.0 uses "the Google Gemini family of LLMs", with no versions named. Other models were tested, and prompts had to be re-engineered and evaluated when models changed. The report does not name the judge model or the hosting infrastructure.

## Results, and how they were measured

- **Themes, blind.** "The CAT detected around 75% of human-generated themes (recall) without any human oversight." That is 124 of 165; by question, recall ran from 0.57 to 0.85. These results are averaged over five runs. Precision was 0.5; the report does not separate themes humans missed from LLM hallucinations.
- **Themes, live pilots.** "Overall recall was 90% in this setting." F₁ was 0.90 for main themes and 0.89 for golden insights.
- **Mapping, blind** (human-written themes). "The CAT achieved an overall accuracy (F₁) score of 0.75 (out of 1)."
- **Mapping, live pilots.** "The CAT achieved an overall F₁ score of 0.93 when comparing the initial CAT mapping to the human-adjusted mapping."
- **Agreement.** Proportion agreement with human mapping was between 93% (blind) and 98% (non-blind), Cohen's kappa between 0.71 and 0.91. Where human-vs-human figures existed, CAT-vs-human agreement was "generally similar or higher", except on one question (INTS_Q48).
- **Bias.** On 3 questions with demographic data (n=3,612), "we found no evidence of systematic bias on the three questions we analysed". See [Fairness metrics and bias measurement](#fairness-bias).
- **Users.** All survey respondents (n=15) were "likely" or "very likely" to recommend the CAT.
- **Savings, estimated.** Against all responses being analysed by people, the report gives "an estimated £0.5 million" saved on four consultations and says "the CAT has roughly saved 15,000 hours of work to date". Scaled up, it estimates "savings in the range of £1.5-4 million per year" from rough cost estimates.

The report notes that the live reference data "faces the risk of anchoring bias" but benefits from changes made by people familiar with the dataset and policy area.

The wiki's reading: the blind figures describe the tool alone; the live figures describe how much reviewers changed its draft. Read them together.

**Not measured:** the savings are estimates, not measured spending; the bias check covers mapping on crowd-worker responses only, not theme generation or consultation respondents; no effect on policy decisions is measured.

## What failed

- **Variation across datasets.** Accuracy varied, which "highlights the importance of the human review stage for theme generation".
- **Misreading.** Sometimes reviewers found the CAT could "read too much between the lines" or get "the wrong end of the stick", such as misreading sentiment.
- **Confidence scores.** Token log probabilities did not flag errors: "the model appeared approximately certain on all Boolean mapping classifications that we tested".
- **Prompt sensitivity.** "the LLM results were sensitive to minor changes in the prompts". See [Prompt sensitivity and robust prompt testing](#prompt-robustness).
- **Contestable ground truth.** "Ground truth is slippery in qualitative analysis": human reference data varies in quality. See [Label quality](#label-quality).

## What the team would do differently

The report's lessons: a pure LLM method "worked best", and LLM ensembles improved both steps. An automated evaluation pipeline with an evaluated judge made testing changes rapid and helped regression testing; judges need human-AI iteration, and "Binary classification performed best." Fixed random seeds and sampling settings made the effect of changes easier to isolate. Possible enhancements include hierarchical themes and confidence-based quality gates; red teaming against "malicious survey responses" is ongoing.

## Disclosure

None.

## Sources

- Anton Poletaev, Ana Wheelock Zalaquett, Chris Steinberg, Harry Shepherd, Ines Heimann, John Francis and Saba Esnaashari (DfT AI and Data Science team, DfT Advanced Analytics; The Alan Turing Institute), Department for Transport, [“AI Consultation Analysis Tool (CAT) v1.0 Evaluation”](https://assets.publishing.service.gov.uk/media/696f6641011505255b2d4203/ai-consultation-analysis-tool-CAT-evaluation.pdf), evaluation report (PDF, 49 pages), GOV.UK, 23 December 2025.
- Department for Transport, [“AI Consultation Analysis Tool evaluation”](https://www.gov.uk/government/publications/ai-consultation-analysis-tool-evaluation), GOV.UK publication page, 23 December 2025.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Human in the loop](#human-in-the-loop)
- [Label quality: agreement, aggregation and label errors](#label-quality)
- [Fairness metrics and bias measurement](#fairness-bias)
