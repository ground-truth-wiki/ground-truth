---
id: grab-data-discovery-llm
book: 21
order: "21.38"
title: "Grab Hubble: LLM-written table docs and a chatbot for data discovery"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [data-discovery, documentation-generation, enterprise-search, elasticsearch, public-record]
visuals: []
type: playbook
account: public-record
industry: "Technology platform (Southeast Asian superapp for mobility, delivery and financial services; internal data platform)"
use_case: "Helping internal data consumers find the right dataset among more than 200,000 data lake tables, with Elasticsearch tuning, LLM-generated table documentation and an LLM chatbot (HubbleIQ)"
outcome: "Documentation coverage of P80 tables increased by 70 percentage points to ~90%; search click-through rate rose to 94%, a 12 percentage point increase; 73% of survey respondents found it easy to discover datasets, a 17 percentage point increase"
measured_how: "Documentation coverage of the most frequently queried (P80) tables; search click-through rate over the course of the half, with the baseline stated as a monthly average; a follow-up user survey and user feedback, with no sample sizes stated (Grab Tech blog, 26 September 2024)"
prerequisites: [hybrid-retrieval]
replications: []
---
> [!tldr]
> Grab's Hubble team set out to make it faster to find data among more than 200,000 data lake tables. It tuned Elasticsearch, used GPT-4 to draft table documentation, and built HubbleIQ, an LLM chatbot on Glean. Documentation coverage of the most-queried tables "increased by 70 percentage points to ~90%", and search click-through rose to 94%.

> [!note] From the public record
> Built from Grab's own published account, "Enabling conversational data discovery with LLMs at Grab" (September 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Grab has "over 200,000 tables in our data lake", plus Kafka streams, production databases and ML features. Its data discovery tool, Hubble, is built on the open-source platform Datahub. It was mainly used as a reference tool: good at metadata for known datasets, weak at discovery. With the Elasticsearch parameters Datahub provides out of the box, the "monthly average click-through rate was only 82%".

Only 20% of the most frequently queried tables, which Grab calls P80 tables, had documentation. People asked colleagues on Slack instead. "A survey conducted last year revealed that 51% of data consumers at Grab took multiple days to find the dataset they required". The vision was to cut discovery time "from multiple days to mere seconds".

## Why this approach

From clickstream analysis and user interviews, the team sorted queries into four kinds. Exact and partial searches, which name or nearly name a dataset, "accounted for 75% of searches on Hubble", and vanilla Elasticsearch handled them well. Inexact searches, colloquial keywords such as "taxi type", made up the remaining 25%, and keyword matching handled them poorly. Semantic searches, free-text queries with a lot of context, never reached Hubble. People sent them to data producers on Slack.

The goals for the first half of 2024 were to build HubbleIQ, improve documentation coverage and enhance Elasticsearch. After the search tuning, the post says the team "had to build HubbleIQ to truly automate" semantic search. The post argues that a bot acting as "a Lead Data Analyst for data discovery" needs extensive, high-quality documentation. For the bot, the team used Glean, an enterprise search tool used by Grab, "To speed up go-to-market". The post compares no alternatives. See [Lexical and hybrid retrieval](#hybrid-retrieval).

## The approach

1. **Tune Elasticsearch.** The team boosted P80 tables, relevant schemas and certified tables, deboosted deprecated tables, hid irrelevant datasets such as PowerBI dataset tables, added tags and simplified the search UI.
2. **Generate documentation.** An engine used GPT-4 to write documentation from table schemas and sample data, with the prompt refined through feedback from data producers. Producers could press a "generate" button in the Hubble UI. The team also pre-populated docs for the most critical tables and asked producers to review them. These pre-populated docs carried an "AI-generated" tag "as a precaution". The tag was removed when a producer accepted or edited the doc (see [human review](#human-in-the-loop)).
3. **Build HubbleIQ.** All data lake tables with documentation were made available on Glean. HubbleIQ, built with Glean Apps, is "essentially an LLM with a custom system prompt" that can access them. For a search "likely to be a semantic search", Hubble shows HubbleIQ results above the regular ones. The post does not say how such searches are detected.
4. **Add Slack.** HubbleIQ was then integrated with Slack, and the team was working to add it to analytics teams' "ask" channels as "the first line of defence".

## The stack

As of September 2024: Hubble on Datahub; Elasticsearch, tuned by the team; GPT-4 for documentation generation; Glean and Glean Apps for HubbleIQ, shown in the Hubble UI and in Slack. The post does not name the model behind HubbleIQ and gives no costs or latencies.

## Results, and how they were measured

- **Search.** "the click-through rate rose steadily over the course of the half to 94%, a 12 percentage point increase." The post presents this as a result of the Elasticsearch and search UI enhancements listed above.
- **Documentation coverage.** "documentation coverage for P80 tables increased by 70 percentage points to ~90%." Earlier, the post gives the starting point as 20% of P80 tables.
- **Generated docs.** "User feedback showed that ~95% of users found the generated docs useful." The method and sample are not stated.
- **Ease of discovery.** "A follow-up survey revealed that 73% of respondents found it easy to discover datasets", "a substantial 17 percentage point increase from the previous survey." No sample sizes are given, and the follow-up survey is not dated.
- **Usage.** "Hubble reached an all-time high in monthly active users", with no figures.

**Not reported:** HubbleIQ's answer quality, usage or success rate; discovery time after the changes, although the conclusion speaks of "drastically reducing the time taken for data discovery"; the accuracy of the generated documentation; and how much of the survey gain comes from search tuning, documentation or HubbleIQ.

## What failed

- **Keyword search.** Vanilla Elasticsearch "relied on pure keyword matching". The team "noticed drop-offs in inexact searches" as users learned that Hubble could not meet their discovery needs.
- **Slack detours.** Semantic questions "usually resulted in data hunting journeys that spanned multiple days".
- **Unfinished vision.** The post says "there are still steps to be taken" before reliance on data producers for discovery is fully replaced.

## What the team would do differently

The post does not say what the team would redo. It lists next steps: give the documentation generator more context, let analysts update docs from Slack threads, and build "an evaluator model that leverages LLMs" to assess human and AI-written docs (see [LLM-as-judge done right](#llm-as-judge)). Reflexion, an agentic workflow, would then regenerate docs until they meet a quality benchmark or reach a maximum try-limit. For HubbleIQ, the post says support for metric datasets was added, other dataset types are in progress, and follow-up questions in the Hubble UI are planned.

The wiki's reading: only documented tables were made available on Glean, so documentation coverage limited what HubbleIQ could find. The clearest measured gain, click-through, is credited by the post to Elasticsearch and search UI tuning, not to an LLM. The post reports the survey gain after all three changes, so it cannot be credited to any one of them; see [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure

None.

## Sources

- Shreyas Parbat, Amanda Ng, Yucheng Zeng, Vinnson Lee, Feng Cheng and Varun Torka, Grab, [“Enabling conversational data discovery with LLMs at Grab”](https://engineering.grab.com/hubble-data-discovery), Grab Tech blog, 26 September 2024.

## Related

- [About playbooks](#about-playbooks)
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Data quality and governance](#data-governance)
- [Dataset documentation: datasheets, data cards and Croissant](#dataset-documentation)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
