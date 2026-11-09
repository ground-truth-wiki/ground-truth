---
id: zalando-search-quality-ai-judge
book: 21
order: "21.61"
title: "Zalando: an LLM judge checks search quality before new markets launch"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [llm-as-judge, search-relevance, e-commerce, multilingual, public-record]
visuals: []
type: playbook
account: public-record
industry: "E-commerce (online fashion)"
use_case: "An LLM judge that scores the relevance of search results for test queries drawn from existing markets and translated where needed, before Zalando launched in Luxembourg, Portugal and Greece"
outcome: "Low segment scores pointed to NER issues and possible product data issues before launch, and NER issues were fixed before the go-live in Greece; one full run costs around 250 USD and takes around 3-5 hours on average"
measured_how: "Average LLM relevance score (0 to 4) per NER-tag segment, for the 1,500 most searched segments in each of 3 markets with 25 results each; cost and run time per full run; no human comparison, post-fix scores or post-launch metrics (Zalando Engineering Blog, March 2026)"
prerequisites: [llm-as-judge, query-understanding]
replications: []
---
> [!tldr]
> Before Zalando launched in Luxembourg, Portugal and Greece in 2025, its search team had GPT-4o judge search results for popular queries from existing markets, translated where needed. Low scores pointed to entity recognition problems and possible product data problems, and the NER issues found for Greece were fixed before go-live. One full run costs "around 250 USD" and takes "around 3-5 hours on average".

> [!note] From the public record
> Built from Zalando's own published account, "Search Quality Assurance with AI as a Judge" (March 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In 2025 Zalando expanded its fashion store into Luxembourg, Portugal and Greece. The challenge was good search "without any prior search data from real users".

Before, experts drew queries from existing markets, translated them where needed, tested search by hand and diagnosed causes. The post says: "Not only is this process not scalable, but it is also reactive by nature". Issues surfaced through user signals such as low CTR, which a new country does not have yet.

## Why this approach

In 2024 Zalando research published a paper on LLM-as-a-judge for search quality assurance at scale. The 2026 post says that study "could achieve a high correlation with human judgement", but it gives no figure. The 2024 announcement reports results "separately for English and German" and says assessments are "up to 1,000 times cheaper than human labor".

The team set four principles: high test coverage, no handcrafted test cases, multi-language support, and reproducibility after fixes. The post names no option it considered besides the manual process. See [LLM-as-judge done right](#llm-as-judge).

## The approach

1. **Group queries by intent.** A named entity recognition (NER) engine extracts attributes such as brand, colour and season. Queries with the same set of tags form one segment, so "Winter boot" and "Boot for winter" count as one scenario. See [Query understanding](#query-understanding).
2. **Pick the segments.** From similar existing markets, the pipeline selects the top N segments by traffic share.
3. **Translate.** An LLM translates the queries where needed. For markets like Luxembourg, existing English and French queries can be used without translation.
4. **Retrieve.** A Kubernetes task sends the queries to the search microservice and caches the results.
5. **Judge.** The LLM judge sees each result's product data and images and scores it from 4 (perfect match) to 0 (completely wrong or irrelevant). Segment averages show weak scenarios, and low-scoring items hint at a cause, such as "wrong product data, misbehaving NER, underperforming ranker".
6. **Compare tags.** The NER tags of each original and translated query are compared, to find missing or incorrect tags in the new language.

Apache Airflow runs one task group per market in parallel. See [Pipeline orchestration and processing engines](#data-pipeline-orchestration).

## The stack

As of March 2026:

- **Judge:** GPT-4o, used "during pre-market launch process", with product data and product images as context. The translation model is not named.
- **Pipelines:** Apache Airflow with PodOperator, running a Docker image on Kubernetes.
- **Cache:** a shared Elasticache for product data and for the result of each (query, product) pair, so repeats are not fetched or judged again.
- **Data:** search requests flow through Nakadi, Zalando's event bus built on Kafka, into a Data Lake.
- **Search:** lexical and semantic vector search, with a NER engine that relies on product data for Lucene-based entity recognition.

## Results, and how they were measured

- **Scope.** "We tested 3 markets with the 1,500 most searched segments in each of them (represented by their NER tags)", using the most frequent queries in each segment.
- **Portugal, before launch.** The tracksuit segment ("fato de treino") scored "1.2 / 4.0": its search "did not show any sport or tracksuit results." A sport segment scored "1.5 / 4.0". Queries with "desporto", "desportivo" and "desportiva" "did not have consistent term filters due to word lemmatization issues." A sneaker segment scored "2.4 / 4.0": the terms "tenis" and "ténis" were not recognized, because of an ambiguity with the sport tennis and because they did not exist in the product data.
- **Greece.** Comparing NER tags showed terms that were not recognized. "This mechanism allowed us to quickly identify NER issues and we could fix them before the go-live in the Greek market."
- **Product data.** Segments for one brand (Foo in the post) scored "1.8 / 4.0", "1.6 / 4.0", "1.9 / 4.0", "1.7 / 4.0" and "1.5 / 4.0". The post says this "may highlight that the product data may have quality issues".
- **Cost.** "The cost per one full run nets around 250 USD, which mainly comes from GPT-4o completion API cost." The post sets this against "the scale of 1,500 search segments with 25 results each".
- **Time.** "One run with our framework takes around 3-5 hours on average." Human evaluation "also would take days", which the post states but does not measure.

**Not measured:** the post reports no agreement between the judge and human raters for these markets, no scores after the fixes, no results for Luxembourg, no total count of issues found, and no search or business metrics after launch. Beyond the NER tag comparison, it does not say how translation quality was checked.

## What failed

The issues the post reports are in search, not in the judge: unrecognized terms, lemmatization issues and possible product data problems, "e.g. missing or wrong attributes". The judge identifies or hints at these issues; engineers still investigate the cause.

On the judge itself, the 2024 announcement reports that LLMs rarely made typical human errors "but were often too strict in their judgement", or misread a query, such as the brand "On Vacation" taken literally. On hard disagreements, "50% were due to human errors, 31% LLM errors and in 19% both made an error". It also notes that high relevance is "a necessary, but not a sufficient condition, for high customer engagement".

## What the team would do differently

The post states no lessons about what it would redo. It calls the infrastructure investment "a one-time cost", says search quality can be re-evaluated "as many times as we want", and says the team can now also validate existing markets to catch regressions.

The wiki's reading: the 2026 post says the judge "generalises well across different languages", but the 2024 announcement reports agreement with human annotators for English and German, not Portuguese or Greek. Check judge agreement in each new language before trusting its scores. See [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation).

## Disclosure

None.

## Sources

- Tao Ruangyam (Senior Software Engineer), Zalando, [Search Quality Assurance with AI as a Judge](https://engineering.zalando.com/posts/2026/03/search-quality-assurance-with-llm-judge.html), Zalando Engineering Blog, 17 March 2026.
- Kasra Hosseini (Senior Applied Scientist), Zalando, [Paper Announcement: Leveraging Multimodal LLMs for Large-Scale Product Retrieval Evaluation](https://engineering.zalando.com/posts/2024/11/llm-as-a-judge-relevance-assessment-paper-announcement.html), Zalando Engineering Blog, 15 November 2024.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Query understanding](#query-understanding)
- [Multilingual and low-resource language models](#multilingual-models)
