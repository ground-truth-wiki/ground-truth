---
id: microsoft-xpert-incident-queries
book: 21
order: "21.36"
title: "Xpert: recommending the first incident query to Microsoft's on-call engineers"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incidents, code-generation, in-context-learning, evaluation-metrics, public-record]
visuals: []
type: playbook
account: public-record
industry: "Cloud computing (incident management for cloud services)"
use_case: "Recommending the first KQL query, as a template and as a full query, to on-call engineers when a new incident ticket arrives"
outcome: "In a pilot of approximately one month in one service: full-query Xcore 72.96 and Identicality 17.69 for online Xpert, against 65.43 and 2.62 for CodeT5+ fine-tuned weekly; average online response time approximately 5 seconds"
measured_how: "Xcore and Identicality against the first query on-call engineers wrote, in a pilot on incidents in one service (incident count not stated), plus an offline test on 3,000 instances from the top-10 services (Jiang et al., arXiv, December 2023)"
prerequisites: [incidents-on-call, in-context-learning]
replications: []
---
> [!tldr]
> Microsoft researchers built Xpert, which retrieves similar past incidents from the same service and prompts GPT-4 with them to recommend the first KQL query for a new incident. In a pilot of approximately one month in one service, it scored a full-query Xcore of 72.96 against 65.43 for a weekly fine-tuned CodeT5+. The paper does not report whether engineers saved time.

> [!note] From the public record
> Built from Microsoft's own published account, "Xpert: Empowering Incident Management with Query Recommendations via Large Language Models" (December 2023), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

During incidents, Microsoft's on-call engineers (OCEs) query logs, traces and metrics in Kusto Query Language (KQL). In the paper's words, "writing these queries can be challenging and time-consuming." See [Incidents and on-call](#incidents-on-call).

The team studied 346,508 incident tickets from the top-30 services, January 2021 to November 2022, holding 712,222 KQL queries. It found that "over half of the incidents have only one KQL query", that services rarely share query templates, and that queries drift, "with an average of over 60% of KQL queries utilizing different templates compared to the previous months". So Xpert recommends the first query for a new incident, both as a template with placeholders and as a full query. The stated aim is "reducing the time to mitigate (TTM)".

## Why this approach

The paper says fine-tuning an LLM with domain-specific data "can be extremely costly". CodeT5+ needs costly fine-tuning that makes it "difficult and expensive to adapt to evolving incident types in an online manner." Xpert uses few-shot [in-context learning](#in-context-learning) instead, and follows drift by adding each new incident and its true query to the retrieval index. The team also built a metric, Xcore, because BLEU and METEOR "primarily focus on lexical similarity and do not take into account code executability". See [Reference-based text metrics](#text-generation-metrics).

## The approach

1. **Collect context.** Metadata, title, summary and the discussion from the first 5 time units after the ticket was created (time units are normalized for anonymity).
2. **Retrieve.** Incident contexts are embedded as 1,536-dimensional vectors and stored in the Faiss vector database. Retrieval uses cosine similarity and searches only the same service.
3. **Prompt.** An instruction, as many retrieved incident and query pairs as fit an 8k-token limit, and the new incident. On average 7.41 examples were retrieved, with a median of 6. The model returns a template and a full query.
4. **Check and repair.** A Post-Validator checks syntax with the KQL compiler's abstract syntax tree. A Post-Rectifier strips stray tokens, then, if needed, asks the LLM to fix the query using the error messages and a KQL usage handbook.
5. **Update.** Once an engineer provides the ground-truth query for an incident, it is added to the vector database.

Xcore weights three scores equally: validity, sub-component F1 against the ground truth, and output-schema matching.

## The stack

As of December 2023: GPT-4, GPT-3.5 (compared in the offline evaluation only) and GPT Ada Embedding through the Python API provided by OpenAI, and Faiss. The team fixed the API version and model version (the versions are not stated) and set temperature and top_p to zero. "The entire implementation of Xpert consists of 1,929 lines of C# code and 2,694 lines of Python code." The baselines were implemented in Pytorch and fine-tuned on 2 NVIDIA A100 GPUs.

## Results, and how they were measured

**Offline.** The test used 3,000 instances from the top-10 services, created strictly after the 197,666 instances used for training and validation (baselines) or retrieval (LLMs), with no index updates.

- "Xpert equipped with GPT-4 demonstrates superior performance across all metrics for both template and query recommendation." For full queries: Xcore 64.2 against 60.75 for CodeT5+, the strongest baseline; Identicality (exact match with the ground truth) 29.18 against 16.13.
- "In the raw predictions of Xpert (GPT-4), a total of 71 templates and 161 queries are found to be invalid." After post-processing, "36 (50.70%) templated and 91 (56.52%) queries are successfully fixed."

**Pilot.** Xpert was "deployed for approximately one month on incidents in a representative service." Online Xpert ran on GPT-4 and added each engineer-written ground-truth query to its index. The baseline was CodeT5+ fine-tuned weekly; "offline" versions of both ran without updates. The pilot section calls the recommended query an "XQL query"; the rest of the paper says KQL.

- Full queries, Xcore and Identicality: online Xpert 72.96 and 17.69; online CodeT5+ 65.43 and 2.62; offline Xpert 66.55 and 11.14; offline CodeT5+ 64.94 and 2.62.
- Templates, same metrics: online Xpert 58.74 and 18.12, online CodeT5+ 58.79 and 10.04.
- "the average online response time for Xpert is approximately 5 seconds".

**Not measured:** the paper does not state how many incidents or engineers the pilot covered, or which service. It reports no adoption rate, user feedback, effect on time to mitigate, cost figures, or statistical tests.

## What failed

- **Invalid output.** Post-processing did not repair every invalid query: on those cases, Validity afterwards was 50.70 for templates and 56.52 for full queries.
- **Missing context.** "Xpert may not always provide optimal recommendations." In its failed case, the true query needed a TIMESTAMP and an activityId absent from the incident context.
- **Nondeterminism.** Even with versions fixed and temperature and top_p at zero, "we observed occasional differences in the LLM response even for the same request." See [Nondeterminism and reproducible inference](#inference-nondeterminism).
- **Data limits.** Ground-truth queries were extracted from discussions with domain rules, which "may introduce inaccuracies or incompleteness". The experiments covered "a select set of core services within Microsoft", and the data is not public for security reasons.

## What the team would do differently

The paper does not say what the team would change. It calls the approach "easily applicable to other query languages, such as SQL", and says Xcore adapts by swapping its syntax tree and checker.

The wiki's reading: the index update looks important in the pilot. Online Xpert scored above offline Xpert, while weekly fine-tuning moved CodeT5+'s full-query Xcore only from 64.94 to 65.43 (see [The data flywheel](#data-flywheel)). But the design section says true queries are "crafted by OCE based on our recommendations". If that held in the pilot, the ground truth partly reflects Xpert's suggestions. That would favor Xpert over CodeT5+, unless engineers also saw CodeT5+ output. The paper does not say.

## Disclosure

None.

## Sources

- Yuxuan Jiang, Chaoyun Zhang, Shilin He, Zhihao Yang, Minghua Ma, Si Qin, Yu Kang, Yingnong Dang, Saravan Rajmohan, Qingwei Lin and Dongmei Zhang, Microsoft with co-authors from the University of Michigan and Peking University, [“Xpert: Empowering Incident Management with Query Recommendations via Large Language Models”](https://arxiv.org/abs/2312.11988), arXiv 2312.11988 (cs.SE), version 1 submitted 19 December 2023; the arXiv listing states it was accepted as a research paper at ICSE 2024.

## Related

- [About playbooks](#about-playbooks)
- [Incidents and on-call](#incidents-on-call)
- [In-context learning and example design](#in-context-learning)
- [Reference-based text metrics: from BLEU to COMET](#text-generation-metrics)
- [Nondeterminism and reproducible inference](#inference-nondeterminism)
