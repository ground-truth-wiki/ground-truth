---
id: zalando-postmortem-analysis
book: 21
order: "21.59"
title: "Zalando: mining incident postmortems with a multi-stage LLM pipeline"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [sre, incident-analysis, llm-pipelines, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "E-commerce"
use_case: "A multi-stage LLM pipeline that reads archived incident postmortems and reports recurring datastore failure patterns and investment opportunities"
outcome: "Approximately 30 seconds per postmortem with Claude Sonnet 4; analysis time reduced from days to hours; approximately 10% surface attribution errors remain"
measured_how: "The team's own observations while building and running the pipeline on thousands of archived postmortems; no sample size, labelling method or baseline period stated (Zalando Engineering Blog, September 2025)"
prerequisites: [prompt-chaining, hallucination-factuality]
replications: []
---
> [!tldr]
> Zalando engineers built a multi-stage LLM pipeline that reads thousands of archived postmortems and condenses them into a one-page report of recurring failure patterns for the company's datastores. The current release, on Claude Sonnet 4, "processes each postmortem in approximately 30 seconds", but the team still observes "approximately 10% attribution" errors and relies on human curation.

> [!note] From the public record
> Built from Zalando's own published account, "Dead Ends or Data Goldmines? Investment Insights from Two Years of AI-Powered Postmortem Analysis" (September 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Zalando had accumulated "thousands of archived postmortem documents". They vary in depth and clarity, and connecting incidents across teams takes "immense cognitive load and informal networking". "It takes about 15-20 minutes to thoughtfully read a single postmortem". For Postgres, AWS DynamoDB, AWS S3, AWS ElastiCache and Elasticsearch, a group looking after Zalando's datastores asked: "Why does the datastore fail repeatedly at scale?"

## Why this approach

The team first used Google's NotebookLM, and the post says "Notebooks have boosted productivity three times". But "sifting through summaries takes weeks for a dedicated team of experts", and the team saw "severe hallucinations and loss of the incident context".

Instead of one large model with a long context window, the team built a chain of models where "each stage strictly specialises on a single objective". With long inputs they had observed a "lost in the middle" effect, and large contexts "can increase latency, memory usage, and cost" (see [Efficient attention and long context](#long-context)). The initial concept of "a no-code agentic solution" was dropped over performance limits, inaccuracies and hallucinations. The team chose a hybrid where people can check the input and output of each stage.

## The approach

A "map-fold" pattern is "a key building block for the pipeline": each document is processed on its own, then an LLM call or a deterministic function aggregates the results. The post's table lists these stages (see [Prompt patterns and chaining](#prompt-chaining)):

1. **Summarization.** A prompt written with the TELeR technique extracts issue summary, root causes, impact, resolution and preventive actions, under "no guessing, no assumptions, and no speculative content".
2. **Classification.** Given a summary and a list of technologies, the model returns only those "with a confirmed direct connection", or "None". The prompt prohibits inference and includes negative examples.
3. **Analyzer.** For each technology, a 3 to 5 sentence digest of its role in the incident, "requiring only 30 to 60 seconds to understand".
4. **Patterns.** All digests go into one prompt that prohibits inference and anything not grounded in the source data. The output is a one-page report of common failure themes.
5. **Opportunity.** Patterns and the postmortem corpus become an investment opportunity. Its table row gives only input and output.

During development, the team "conducted 100% human curation of output batches": colleagues compared digests with the original postmortems and voted them up or down, which guided prompts and model choice per stage. Later, curation dropped to "10-20% of randomly sampled summaries from each output batch". Experts still proofread the final report. See [Human in the loop](#human-in-the-loop).

## The stack

As of September 2025:

- **First tool tried:** Google's NotebookLM.
- **Earlier releases:** open source models, initially hosted within LM Studio. The post mentions models with 3B, 12B and 27B parameters but does not name them.
- **Current iteration:** Claude Sonnet 4 on AWS Bedrock.

This evolution "was primarily driven by compliance topics rather than technical necessity": postmortems contain "PII data of on-call responders" and business metrics, and legal alignment was a pre-condition for cloud-hosted LLMs. See [Small and local models](#small-local-models).

## Results, and how they were measured

- **Processing time.** The team set a limit of 120 seconds per document; an early 27B model step typically took 90 to 120 seconds. The map-fold release with 3B, 12B and 27B models "enabled the processing of annual data analysis in under 24 hours". Now: "The most recent release, based on Claude Sonnet 4, processes each postmortem in approximately 30 seconds".
- **Analysis time.** "The AI analysis significantly reduced the time for analysis from days to hours".
- **Findings.** Configuration and deployment, and capacity and scaling, are the primary reasons for datastore incidents. AWS S3 incidents were tied to misconfigurations in deployment artifacts. The resulting automated change validation for infrastructure as code "is able to shield us from 25% subsequent datastore incidents". For AWS ElastiCache, the pipeline found "a consistent trend of 80% CPU utilization causing elevated latency at peak traffic".

**Not measured:** the post does not give the exact number of postmortems, how the hallucination and attribution rates were counted, the baseline and period behind the 25% figure, exact times behind "from days to hours", or any cost.

## What failed

- **Hallucination.** With the 3B to 12B prototypes, "We have observed up to 40% probability for hallucination at summary and analysis phases." In one case, small models "fabricated a plausible summary regarding a non-existent DynamoDB incident" because DynamoDB appeared in the title of a linked playbook. After prompting experiments stressing strict requirements, "we conducted human-led curation until the effect of hallucination became less than 15%." With a larger model, "hallucinations became negligible". See [Hallucination and factuality](#hallucination-factuality).
- **Surface attribution error.** "Surface Attribution Error is dominant almost in each stage of the pipeline." The model follows keywords instead of causality, and could explain S3's role when "S3" is merely mentioned. Negative prompting did not fully solve it: "we still observe approximately 10% attribution, even with advanced models such as Claude Sonnet 4."
- **Numbers.** Reliable accuracy in extracting figures "such as GMV or EBIT loss, affected customers, and repair time" from postmortems "was not achieved". Opportunity analysis relies on the internal incident dataset instead.
- **Internal technology.** Analysis of incidents with Zalando's own technologies, such as Skipper, was "unacceptable", and fixing it "requires a model fine-tuning". For the public datastores studied, the overfitting effect was "negligible".

## What the team would do differently

The post gives recommendations: "Start small and iterate", "Prioritize prompt engineering", with golden datasets for testing pipelines, and "Design for human interpretability". It concludes that the multi-stage pipeline "proved more effective and reliable" than single high-end LLMs with large context windows.

The wiki's reading: readable output at each stage, more than any single model, let the team catch errors and tune prompts. A team doing similar [incident review](#incidents-on-call) should budget for curation early and test whether the model judges causality or only matches keywords.

## Disclosure

None.

## Sources

- Dmitry Kolesnikov, Senior Principal Engineer, Zalando, [“Dead Ends or Data Goldmines? Investment Insights from Two Years of AI-Powered Postmortem Analysis”](https://engineering.zalando.com/posts/2025/09/dead-ends-or-data-goldmines-ai-powered-postmortem-analysis.html), Zalando Engineering Blog, 25 September 2025.

## Related

- [About playbooks](#about-playbooks)
- [Incidents and on-call](#incidents-on-call)
- [Hallucination and factuality](#hallucination-factuality)
- [Human in the loop](#human-in-the-loop)
- [Prompt patterns and chaining](#prompt-chaining)
