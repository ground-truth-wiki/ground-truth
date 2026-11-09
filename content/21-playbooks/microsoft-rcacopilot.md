---
id: microsoft-rcacopilot
book: 21
order: "21.64"
title: "RCACopilot: predicting root cause categories of cloud incidents at Microsoft"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incidents, root-cause-analysis, in-context-learning, cloud-operations, public-record]
visuals: []
type: playbook
account: public-record
industry: "Cloud computing (Transport, Microsoft's global email service)"
use_case: "Alert-specific handlers collect diagnostic data for each cloud incident, then GPT-4 predicts the root cause category and explains it, with similar past incidents as examples in the prompt"
outcome: "Micro F1 0.766 and macro F1 0.533 for the predicted root cause category on the test set, against 0.103 and 0.144 for a fine-tuned GPT-3.5 baseline"
measured_how: "One-year dataset of 653 Transport incidents labeled by on-call engineers, split 75% train and 25% test, each experiment run in three rounds (Chen et al., arXiv, version of November 2023, EuroSys '24)"
prerequisites: [incidents-on-call, in-context-learning]
replications: []
---
> [!tldr]
> Microsoft built RCACopilot for on-call engineers: handlers per alert type gather diagnostic data, then GPT-4 predicts the root cause category from a summary of that data and similar past incidents. On a test split of one year of Transport email incidents it reached "a micro F1-score of 0.766 and a macro F1-score of 0.533"; GPT-4 without past examples scored 0.026 and 0.004.

> [!note] From the public record
> Built from Microsoft's own published account, "Automatic Root Cause Analysis via Large Language Models for Cloud Incidents" (May 2023, revised November 2023), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

When a cloud service has an incident, on-call engineers (OCEs) must find the root cause, which the paper calls "a daunting and time-consuming task". They collect logs, metrics, traces and tickets by hand, and the relevant data can be buried or missing. Troubleshooting guides (TSGs) help, but "the volume of TSGs is overwhelming for OCEs", and they "struggle to keep pace with the ever-evolving nature of cloud systems". See [Incidents and on-call](#incidents-on-call).

A study of one year of incidents from a Microsoft email service found that a single data source can leave the root cause unclear. Similar incidents recur quickly: "most recurring incidents (93.80%) tend to reappear within a brief span of 20 days". Incidents with a new root cause category "account for 24.96% (163 among 653) of all incidents".

## Why this approach

Earlier work fine-tuned an LLM on incident titles and summaries. The paper names the limits: titles and summaries might miss signals in logs and traces, "finetuning is costly and may require a huge volume of training samples", and a fine-tuned model is hard to keep current as incidents change.

Instead, engineers encode their expertise in handlers that collect relevant data for each alert type. The LLM then learns the domain from a few labeled past incidents in its prompt, with few-shot chain-of-thought prompting instead of fine-tuning (see [In-context learning and example design](#in-context-learning)). Because incidents recur within short periods, the search for examples also weighs how close in time they are.

## The approach

1. **Match a handler.** Each handler serves one alert type: a workflow of reusable actions, with control flow like a decision tree, that switch scope, query data sources or internal scripts, or suggest mitigations such as "restart service". OCEs build them in a web application.
2. **Collect diagnostic information** such as error logs, exception stack traces and socket metrics.
3. **Summarize.** One incident's diagnostic information "can have more than 2000 tokens", so a first prompt asks for "about 120 words, no more than 140 words" (see [Prompt patterns and chaining](#prompt-chaining)).
4. **Retrieve similar incidents.** A FastText model trained on historical incidents embeds the original incident information. Similarity combines Euclidean distance with a decay for the time between incidents. The top K incidents from different categories become the examples, with K set to 5 and alpha to 0.3 after experiments.
5. **Predict and explain.** The prompt lists the summarized past incidents with their categories, plus "Unseen incident", and asks the LLM to pick the one most likely to share the root cause and explain. Experienced OCEs review the prediction.

## The stack

As of November 2023: GPT-4 (8K tokens) is the default model "because it has the best performance", and GPT-3.5-turbo was also tested. Embeddings come from FastText trained on Microsoft's own incidents. The system has 56,129 lines of C# and 2,157 lines of Python. RCACopilot "is only integrated with OpenAI’s GPT models".

## Results, and how they were measured

The evaluation uses "a one-year dataset of 653 incidents from Microsoft’s Transport service", a global email service. Experienced OCEs labeled each incident's root cause category, and the incidents were split 75% for training and 25% for testing. The metrics are micro and macro F1 (see [Classification and regression metrics](#classification-metrics)).

- **Main result.** "RCACopilot achieves a micro F1-score of 0.766 and a macro F1-score of 0.533 on our testing dataset." With GPT-3.5 it scored 0.761 and 0.505.
- **Baselines and variants** (micro, then macro F1): FastText 0.076 and 0.004, XGBoost 0.022 and 0.009, fine-tuned GPT-3.5 0.103 and 0.144, and GPT embeddings in place of FastText 0.257 and 0.122. The paper attributes the weak scores to a long-tail spread of categories, too little training data and, for the GPT-4 variants, missing domain knowledge.
- **Summarization.** Unsummarized diagnostic information scored 0.689 and 0.510; summarizing added "improvements of 0.077 and 0.023".
- **Speed and stability.** Average inference time with GPT-4 was 4.205 seconds. Over three rounds the paper reports "the Micro-F1 consistently above 0.70 and the Macro-F1 remaining above 0.50".
- **Deployment.** The collection module runs "across over 30 teams within Microsoft, where it has been in active use for over four years". The prediction module "has been actively deployed by an incident management team at Microsoft for a period spanning several months". In feedback from incident notification emails, "most OCEs expressed satisfaction with RCACopilot".

**Not measured:** the prediction module's effect in production, such as on time to mitigate, and its accuracy in live use. The OCE feedback has no counts, the split is not said to follow time order, and the claim that RCACopilot saves OCEs "a significant amount of time" is not quantified.

## What failed

- **Plain prompting.** GPT-4 given only the incident "only achieves 0.026 and 0.004 for Micro-F1 and Macro-F1 respectively".
- **More context.** Adding alert information or handler output to the diagnostic information did not improve scores: "an excess of information can negatively impact the LLM’s prediction performance."
- **Coverage.** Predefined handlers "do not always provide exact mitigation strategies for every incident". The system is constrained when monitors miss an incident or no handler exists, and each new handler takes manual effort.
- **Model and labels.** "RCACopilot’s effectiveness depends on the ability of the LLM", results can vary across rounds, and they depend on the quality of human labels. The prediction module was evaluated only on Transport data.

## What the team would do differently

The paper does not say what the team would redo. Its stated future work is to evaluate RCACopilot "across different services". It also notes that it has "not yet explored" LLMs other than OpenAI's GPT models.

The wiki's reading: the handlers give the model evidence that engineers chose, not raw telemetry. The gap between GPT-4 with and without retrieved examples suggests that much of the domain knowledge came from labeled past incidents. A team that wants to copy the prediction step needs a history of incidents with consistent root cause labels.

## Disclosure

None.

## Sources

- Yinfang Chen, Huaibing Xie, Minghua Ma, Yu Kang, Xin Gao, Liu Shi, Yunjie Cao, Xuedong Gao, Hao Fan, Ming Wen, Jun Zeng, Supriyo Ghosh, Xuchao Zhang, Chaoyun Zhang, Qingwei Lin, Saravan Rajmohan, Dongmei Zhang and Tianyin Xu, Microsoft (with University of Illinois at Urbana-Champaign, Peking University, Huazhong University of Science and Technology and National University of Singapore), [“Automatic Root Cause Analysis via Large Language Models for Cloud Incidents”](https://arxiv.org/abs/2305.15778), arXiv:2305.15778, version 1 of 25 May 2023, version 4 of 13 November 2023; EuroSys ’24, 22 to 25 April 2024, Athens, Greece, doi:10.1145/3627703.3629553.

## Related

- [About playbooks](#about-playbooks)
- [Incidents and on-call](#incidents-on-call)
- [In-context learning and example design](#in-context-learning)
- [Classification and regression metrics](#classification-metrics)
- [Prompt patterns and chaining](#prompt-chaining)
