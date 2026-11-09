---
id: allegro-search-relevance-llm-judge
book: 21
order: "21.49"
title: "Allegro: judging search relevance with LLMs in four languages"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [llm-as-judge, search-relevance, e-commerce, local-models, public-record]
visuals: []
type: playbook
account: public-record
industry: "E-commerce"
use_case: "An LLM judge that labels how relevant each product in a search listing is to the query, in Polish, Czech, Slovak and Hungarian, built on human annotation guidelines and checked against human labels"
outcome: "Allegro reports that the best local model, Gemma 4 26B AWQ 4-bit (no-thinking), matched the quality of its Gemini 3.1 Flash Lite cloud baseline while cutting inference costs by roughly 60%; κ-quad 0.69 against 0.67 on Polish, while the cloud baseline kept an edge on Czech, Slovak and Hungarian; around 16 query-product pairs per second"
measured_how: "Quadratic Cohen's kappa (primary), accuracy, F1 and MAE against human labels from two blind annotators and an expert arbitrator, per language; cost figures and cost method, total evaluation sample sizes and period not stated (Allegro Tech Blog, August 2026)"
prerequisites: [llm-as-judge, label-quality]
replications: []
---
> [!tldr]
> Allegro built a Relevance Assessment Tool in which an LLM judge, prompted with the human annotation guidelines, labels how relevant each product in a search listing is to the query, in four languages. It was measured against human labels from "a multilingual 380K+ dataset". A local Gemma 4 26B model "matched the quality of our cloud baseline while cutting inference costs by roughly 60%", but the cloud model kept an edge outside Polish.

> [!note] From the public record
> Built from Allegro's own published account, "Automating Search Relevance Assessment at Scale with LLM-as-a-Judge" (August 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

A/B tests and engagement metrics show whether a change moves business KPIs, but the post says "they don’t directly measure how relevant individual results are to a given query". Human annotations were "costly and time-consuming to scale". Allegro "spans 13 distinct departments", and early labeling showed that "search relevance is rarely a straightforward binary decision".

## Why this approach

The move to an LLM judge "was driven by the need to scale our evaluation while maintaining the precision of human annotation". The post does not describe other automated options it considered. It builds on human work first: guidelines, hand labels, then a judge measured against them, the method [LLM-as-judge done right](#llm-as-judge) covers. The later move to local models had a cost reason: "running large-scale evaluations on cloud-based LLM APIs is expensive".

## The approach

1. **Human labels.** A label scale inspired by ESCI (Exact, Substitute, Complement, Irrelevant) with "slightly higher granularity", two blind annotators and an expert arbitrator per query-product pair, and agreement tracked with Cohen's kappa. About 30 experts covered Polish, Czech, Slovak and Hungarian. See [Label quality](#label-quality).
2. **A prompt written from the guidelines.** The prompt follows annotation instructions written by product and data annotation managers, and "the product name is the only input we feed to the model". Ablations showed that "removing few-shot examples actually improved model performance", while removing "critical rules" and "step-by-step" instructions caused "a large performance decline". See [In-context learning and example design](#in-context-learning).
3. **Model selection.** Of GPT 4.1 mini, Gemini 2.5 Flash, Gemini 3.1 Flash Lite and Gemini 2.5 Pro, Gemini Pro scored highest. Gemini 3.1 Flash Lite proved "an excellent candidate for production workloads" on cost against performance, and serves as the cloud baseline.
4. **The pipeline.** One codebase serves on-demand annotation of a single listing and a nightly cron job over thousands of queries. The labels are combined with each product's position into metrics such as relevance label-based NDCG, and batch results go to an analytical data warehouse. See [Asynchronous and batch AI workloads](#async-batch-workloads).
5. **Local models.** One product per request, "no-thinking" variants, and schema enforcement and post-processing against formatting errors.

## The stack

As of August 2026, as the post names it:

- **Cloud judge:** Gemini 3.1 Flash Lite, called with an OpenAI-compatible message structure, with the whole first page of products in one request. For Czech, Slovak and Hungarian it "is still suggested as the primary reliable choice".
- **Local judge:** cyankiwi-gemma (Gemma 4 26B AWQ 4-bit, no-thinking), the best local model in all four languages. Also tested: Qwen 3.6 27B, Gemma 4 qat 12B, Gemma 4 4B, GPT-OSS 20B, Bielik minitron 7B, PLLuM 8B and Mellum 2 12B AWQ. See [Small and local models](#small-local-models).

The post names no hardware, serving engine or data warehouse, and does not say whether the pipeline uses the prompt optimization libraries it mentions, sammo and gepa.

## Results, and how they were measured

- **Cloud judge per class.** On "a selected dataset split", Gemini 3.1 Flash Lite reached F1 0.94 for Exact product, 0.83 for Complementary, 0.51 for Highly substitutable, 0.33 for Substitutable, 0.52 for Irrelevant and 0.25 for Hard to say (weighted average 0.88). The post notes that the split is imbalanced.
- **Local against cloud.** Quadratic Cohen's kappa against human labels is the primary metric. The best local model scored 0.69 (Polish), 0.52 (Czech), 0.59 (Slovak) and 0.67 (Hungarian); the cloud baseline scored 0.67, 0.58, 0.65 and 0.73. For Polish, the local model "exceeded the quality of our Gemini 3.1 Flash Lite baseline".
- **Throughput and parsing.** Gemma 4 26B (no-thinking) was the fastest local model, "sustaining around 16 query-product pairs per second", with parse errors below 0.2% in all languages.
- **Cost.** "we matched the quality of our cloud baseline while cutting inference costs by roughly 60%".

A second table, on the Polish benchmark, lists Gemini 3.1 Flash Lite (single) at κ-quad 0.69, not 0.67; the post does not explain the difference.

**Not measured:** the post gives no cost figures or cost method behind the 60%, no hardware, no total size of the evaluation splits, no period, and no measured effect of the tool on search quality or business metrics.

## What failed

- **"Middle-class" relevance.** "the model struggles more to differentiate between “Highly substitutable” and “Substitutable” classes."
- **Czech.** "Czech proved the hardest for every model".
- **Few-shot and thinking.** Few-shot examples "did not meaningfully improve accuracy for local LLMs", and "no-thinking" variants consistently beat "thinking" ones (Gemma 4 26B: 0.69 against 0.65 on Polish).
- **Several products per prompt.** For local models, with a whole page or 10 products per prompt, "most of the model requests failed to parse the response (corrupted JSON, incorrect number of products)". Gemma 4 4B dropped from κ-quad 0.56 with single products to 0.34–0.37 with batches of 10. See [Structured outputs](#structured-outputs).
- **Unreliable models.** Models with parse errors or class-imbalance exploitation "were ruled out regardless of high accuracy". PLLuM 8B reached 0.84 accuracy at κ-quad 0.17, and Mellum 2 12B AWQ had 20% parse errors. Accuracy "can be misleading on its own when classes are imbalanced".

The wiki's reading: "matched the quality" holds on Polish, where the tables show it. On the other three languages the post's own figures put the cloud model ahead.

## What the team would do differently

Prompt optimization libraries help "when building on a solid expert-written prompt rather than generating a strong prompt on their own". "The most critical discovery was the value of structured logical constraints." One request per page saves cost, but single-product requests "usually offer higher output precision and quality by preventing context dilution". Next come product images as input, for departments such as fashion and home design, and a more granular understanding of queries and product specifications.

## Disclosure

None.

## Sources

- Joanna Marhula and Mateusz Sidor, Allegro, [“Automating Search Relevance Assessment at Scale with LLM-as-a-Judge”](https://blog.allegro.tech/2026/08/automating-search-relevance-llm-as-a-judge.html), Allegro Tech Blog, 20 August 2026.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Label quality: agreement, aggregation and label errors](#label-quality)
- [Small and local models](#small-local-models)
