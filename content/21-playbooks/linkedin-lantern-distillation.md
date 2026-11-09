---
id: linkedin-lantern-distillation
book: 21
order: "21.23"
title: "LinkedIn LANTERN: distilling LLMs into small models for job-fit ratings and explanations"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [recruiting, knowledge-distillation, small-models, text-classification, model-serving, public-record]
visuals: []
type: playbook
account: public-record
industry: "Online recruiting (LinkedIn job-seeking platform)"
use_case: "Rating how well a member fits a job (low, medium or high) and generating a line-by-line explanation of the rating on request"
outcome: "A +0.24% increase in apply rate and a +0.28% increase in qualified applications online; downscaling the classifier from gte-Qwen2.5-1.5B-instruct to a 0.4B ModernBERT variant gave a 4× improvement in serving throughput per GPU"
measured_how: "Online evaluation in production (design, duration and sample not stated), plus offline ROUGE against teacher outputs and accuracy and weighted F1 against a Phi3-mini baseline (LinkedIn paper on arXiv, October 2025)"
prerequisites: [llm-distillation]
replications: []
---
> [!tldr]
> LinkedIn distilled a large black-box LLM into small in-house models that rate how well a member fits a job and explain the rating on request. The paper reports "a +0.24% increase in apply rate and a +0.28% increase in qualified applications" online, and a 4× improvement in serving throughput per GPU from a smaller classifier. It does not describe how the online evaluation was run.

> [!note] From the public record
> Built from LinkedIn's own published account, "LANTERN: Scalable Distillation of Large Language Models for Job-Person Fit and Explanation" (October 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

When a member views a job on LinkedIn, the product shows a fit level, and a "Show Reason" button asks for an explanation. From a profile and a job description, the system produces "a fit level (e.g., Low, Medium, High) and a line-by-line explanation".

User interaction signals are "often noisy, biased, and inconsistent", the paper says, and manual labels are expensive and slow to scale. The size of most state-of-the-art LLMs makes them "impractical for online serving" because of latency and resource cost. The rating is shown by default and queried 30× more often than the explanation.

## Why this approach

The team chose knowledge distillation: a strong teacher produces labels and explanations, and smaller students learn from them (see [Distillation for LLMs](#llm-distillation)). Because of the traffic gap, they split the task into an encoder that classifies and a decoder that explains, so each model can be optimized "according to its usage frequency and system requirements". The paper notes a challenge of the split: keeping the predicted fit level and the explanation consistent. It reports no production comparison with a single large model.

## The approach

1. **Prompt the black-box teacher.** A proprietary teacher (GPT-4o is the paper's example) is prompted with member information and job descriptions to extract the job's qualifications, evaluate the profile, reason, and give a categorical score. The prompt is split into smaller chained subtasks (see [Prompt patterns and chaining](#prompt-chaining)).
2. **Filter with people.** Expert annotators keep only high-quality teacher outputs as a seed dataset. Labels are generated at a decoding temperature of 0.
3. **Train an in-house teacher** by fine-tuning a Qwen2.5 model on the seed dataset.
4. **Distill the explanation model.** A smaller decoder learns from reference explanations and from the teacher's token distributions. The team compared four distillation objectives: Jensen-Shannon divergence, forward KL, total variation distance (TVD) and symmetric KL.
5. **Distill the classifier.** The in-house teacher labels job and profile pairs, a set "several orders of magnitude larger" than the teacher's own training data, and an LLM encoder with a small MLP head learns from them. This is a use of [synthetic data](#synthetic-data).
6. **Compress the input.** When a job is created, a small fine-tuned model extracts its requirements. Both models reuse the stored result.

## The stack

As of October 2025, as the paper names it:

- **Teachers:** a proprietary black-box model (GPT-4o as the example), then Qwen2.5-7B-instruct fine-tuned in-house, chosen over Qwen3-8B and Qwen2.5-7B on ROUGE.
- **Students:** a 1.5B Qwen2.5 decoder for explanations; a gte-Qwen2.5-1.5B-instruct classifier, downscaled for serving to a ModernBERT variant with 0.4B parameters, with the 1.5B model kept as a multilingual fallback; a 1.5B decoder for summarization.
- **Hardware:** training on 8 NVIDIA H100 80GB GPUs in one node; serving on NVIDIA A100 GPUs.

## Results, and how they were measured

- **Online.** The paper reports "a +0.24% increase in apply rate and a +0.28% increase in qualified applications", with no other detail.
- **Classification.** The best configuration, sequence classification with last-token pooling on gte-Qwen2.5-1.5B-instruct, reached "an accuracy improvement of +1.39% and an F1-score of +0.42%" over a Phi3-mini baseline with the same structure and pooling. F1 is weighted. Absolute numbers are withheld "Due to confidential reasons". The table caption describes the values as "absolute changes in accuracy and F1-score" against that baseline.
- **Explanations.** ROUGE against the teacher's outputs (see [Reference-based text metrics](#text-generation-metrics)). With a 1.5B student, TVD scored highest: ROUGE-1 0.7889, ROUGE-2 0.6461, ROUGE-L 0.6791. The paper says all variants "yield substantial improvements in ROUGE scores" but gives no numbers for its supervised fine-tuning baseline. Human evaluators rated the distilled model on par with, or sometimes slightly better than, the proprietary teacher; no numbers are given.
- **Two-stage distillation.** From 7B directly to 0.5B, ROUGE-1 was 0.7136; through a 3B intermediate, 0.7721. Through 1.5B, the text gives 0.7726 and the table 0.7673.
- **Serving.** "reducing input length by about 80% preserves key requirement information without affecting downstream performance". The 0.4B classifier "achieves comparable offline performance with negligible degradation". P95 latency was 0.3s for classification, 3.5s for summarization and 7.2s for explanation.

**Not measured:** the paper does not say how the online evaluation was run (no control group, duration, dates, traffic share, sample size or significance). It does not state the latency targets, serving cost in money or how often fit levels and explanations disagree, and it reports no fairness evaluation across groups of job seekers.

## What failed

- **Using an LLM directly.** "Directly applying open-source or finetuned LLMs to this task often fails to yield high-quality, actionable feedback".
- **Long prompts.** A single "long and complex instruction block often leads to inconsistent or incomplete outputs", even with reasoning models. Splitting it into subtasks, the paper says, improved quality and consistency.
- **Two-tower classifiers.** They "generally underperform compared to the SeqCls counterparts". On gte-Qwen2.5-1.5B-instruct, the two-tower variants show F1 changes of -3.25% and -3.61% against the Phi3-mini baseline, with accuracy changes of +1.03% and +0.55%.
- **Very small students.** Distilling straight to a small student "may suffer from representational mismatch and optimization challenges". An intermediate teacher helps but "incurs additional training cost".

## What the team would do differently

The paper states nothing it would change. The practices it describes: split long prompts into smaller subtasks, filter teacher outputs with human review, compress the job side of the input, use an intermediate teacher for very small students, and provision serving capacity by traffic volume. It attributes the student's results in human evaluation to "a narrow domain with well-defined and repetitive patterns" and to curated training data.

The wiki's reading: the architecture follows the traffic, so the rating gets the smallest model. Online gains reported without a test design are hard to compare (see [Online controlled experiments for AI features](#online-experiments)).

## Disclosure

None.

## Sources

- Zhoutong Fu, Yihan Cao, Yi-Lin Chen, Aman Lunia, Liming Dong, Neha Saraf, Ruijie Jiang, Yun Dai, Qingquan Song, Tan Wang, Guoyao Li, Derek Koh, Haichao Wei, Zhipeng Wang, Aman Gupta, Chengming Jiang, Jianqiang Shen, Liangjie Hong and Wenjing Zhang, LinkedIn, [“LANTERN: Scalable Distillation of Large Language Models for Job-Person Fit and Explanation”](https://arxiv.org/html/2510.05490), arXiv:2510.05490v1 [cs.CL], 7 October 2025.

## Related

- [About playbooks](#about-playbooks)
- [Distillation for LLMs: soft labels, on-policy and multi-teacher](#llm-distillation)
- [Distillation, merging and compression](#distillation-merging)
- [Latency and throughput](#latency-throughput)
- [Fairness metrics and bias measurement](#fairness-bias)
