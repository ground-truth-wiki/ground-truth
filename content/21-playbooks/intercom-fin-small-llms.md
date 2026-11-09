---
id: intercom-fin-small-llms
book: 21
order: "21.22"
title: "Intercom Fin: smaller fine-tuned models in place of one large-LLM prompt"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [customer-support, fine-tuning, small-models, lora, cost, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools (AI agent for customer support)"
use_case: "Detecting and summarizing the user's issue in a support conversation for Fin's RAG pipeline, with a fine-tuned ModernBERT classifier and a LoRA fine-tuned Qwen3 14b instead of one large-LLM prompt"
outcome: "Extractor A/B test: cost -12.5%, answer rate -0.1pp, P50 latency +100 ms, CSAT 0; detector A/B test: cost -5%, answer rate -0.5pp, P50 latency -100 ms, CSAT 0"
measured_how: "Offline replay of a sample of production requests, then two production A/B tests run in two phases (detector first, then the extractor for a week); traffic size not stated (Intercom Fin research blog, September 2025)"
prerequisites: [fine-tuning-practice, peft-methods]
replications: []
---
> [!tldr]
> Intercom's Fin team split one large-LLM prompt, which detected and extracted the user's issue in a support conversation, into a fine-tuned ModernBERT classifier and a LoRA fine-tuned Qwen3 14b. The classifier shipped to production. In production A/B tests the post reports "the relative reduction in cost per transaction of 12.5%" for the extractor, with the answer rate down 0.1pp, and a 5% cost reduction for the detector, with the answer rate down 0.5pp.

> [!note] From the public record
> Built from Intercom's own published account, "David vs Goliath: are small LLMs any good?" (September 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Part of the architecture of Fin, Intercom's AI agent for customer support, builds on RAG. One component of that pipeline turns the messages between the end user and Fin into "a single answerable summary issue" for retrieval (see [Query understanding](#query-understanding)).

Not every conversation holds an addressable issue. The old setup used one prompt for both detection and extraction, which returned None when there was no outstanding issue. To cover edge cases such as greetings, feedback and noise, the prompt grew to "over 80 few-shot examples, >5k tokens of instructions, and 17 defined non-informational categories".

## Why this approach

The post starts from a hypothesis: "for narrow, well-scoped tasks, we might match the performance of much larger models" by training smaller models on enough high-quality data. The team split the task in two: one model classifies whether a conversation has an issue, and a second extracts the issue only when the first finds one. The split makes extraction narrow enough to try fine-tuned LLMs. The post does not describe other options it weighed.

The detector uses ModernBERT, an encoder-only model that the post says works well for classification once fine-tuned (see [Encoders, decoders and encoder-decoders](#encoders-and-decoders)). The extractor uses LoRA, which freezes the original weights and trains two small low-rank matrices per targeted layer (see [Parameter-efficient fine-tuning methods](#peft-methods)).

## The approach

1. **Define success first.** Offline, replay a sample of production requests and measure the answer rate and semantic alignment, an embedding distance between the new and the production issue. Online, A/B tests track resolution rates, CSAT, latency and cost. The cost bar: "A comparable online performance, but at 2x the cost is not a success."
2. **Train the detector.** Training data was curated from the original LLM-based system. ModernBERT encodes the input, and a linear layer with sigmoid predicts informational or non-informational.
3. **Fine-tune the extractor.** Data came from customers who agreed to training use: conversations from the past 2 months, US accounts, English locale, where the older prompt had found an issue. PII such as emails, names and account numbers was redacted. The result was 60 thousand training samples and 10 thousand validation samples.
4. **Compare candidates offline:** Gemma 8b, Qwen3 8b, Qwen3 14b, and a Qwen3 14b variant trained only on hard resolutions.
5. **Test online in two phases.** The detector went first. After it shipped to production, the extractor's A/B test ran for a week.

## The stack

As of September 2025: ModernBERT as the issue detector in production, and Qwen3 14b fine-tuned with LoRA as the issue extractor in the A/B test. The offline baseline is "OpenAI: GPT 4.1 (baseline)". The post calls the production setup "the incumbent 1 LLM call to the large model provider" without naming that model. Hardware and serving are not described.

## Results, and how they were measured

- **Detector, offline.** "we trained the model on 1M examples and ModernBERT achieved a remarkable 0.995 AUC score". Where it disagreed with the ground truth, the post says "it was mostly the teacher’s mistakes, not the student model’s".
- **Extractor, offline.** The fine-tuned Qwen3 14b reached semantic alignment 0.938 and an answer rate of 63.4%, against 63.3% for the GPT 4.1 baseline. The Qwen 3 14B base model, not fine-tuned, scored 0.780 and 18.0%.
- **Detector, A/B test.** Answer rate -0.5 percentage points, P50 latency -100 ms, CSAT 0, cost -5%. Because an LLM no longer does the detection, "this also indirectly results in a 5% reduction in cost". The post calls the data enough for a statistically significant readout (see [Online controlled experiments for AI features](#online-experiments)).
- **Extractor, A/B test, one week.** "The overall answer rate dropped by 0.1pp." P50 end-to-end latency rose by 100 ms and CSAT showed 0. "The biggest win here was the relative reduction in cost per transaction of 12.5%."

**Not measured:** no traffic share or conversation count for either A/B test, no duration for the detector test, no confidence intervals, no absolute costs or latencies, no size for the offline sample, and no resolution-rate results, although the post calls resolution rate the foundational metric. It does not say whether the extractor stayed in production after its test.

## What failed

- **Training on hard resolutions only.** That variant reached semantic alignment 0.930 but an answer rate of 36.4%: "the model only learned to produce an issue summary if the issue was extremely clear from the conversation". The post's lesson: "This odd behaviour shows the importance of data curation in such projects."
- **Smaller candidates.** Gemma 8b (51.0%) and Qwen 3 8b (55.0%) stayed below the baseline answer rate offline. The 14B model was the first the team found competent in offline tests.
- **Anonymisation.** The team redacted every PII entity, an "extra conservative approach". The post sees a chance that this hurt the fine-tuned models in the wild "because we are redacting important contexts at training time".

## What the team would do differently

The post names two hypotheses for further gains on resolutions: "a secure yet performant anonymisation strategy, with contextual replacement of PIIs instead of just redaction", and model size: "we think that it is definitely worth exploring larger models for such tasks." It also plans to explore languages beyond English.

The wiki's reading: the detector learned from the system it replaced, so its 0.995 AUC mostly measures agreement with the old prompt. This is [distillation](#llm-distillation) of one narrow pipeline step. Reusable: split a sprawling prompt into a cheap classifier and a narrow generator, and set a cost bar before testing.

## Disclosure

None.

## Sources

- Sagar Joglekar and Ramil Yarullin, Intercom (Fin), [“David vs Goliath: are small LLMs any good?”](https://fin.ai/research/david-vs-goliath-are-small-llms-any-good), Fin AI research blog, 11 September 2025.

## Related

- [About playbooks](#about-playbooks)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Small and local models](#small-local-models)
- [Cost engineering](#cost-engineering)
- [Customer-support and enterprise workflow agents](#support-agents)
