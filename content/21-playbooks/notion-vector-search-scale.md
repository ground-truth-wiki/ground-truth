---
id: notion-vector-search-scale
book: 21
order: "21.26"
title: "Notion: two years of scaling vector search for AI Q&A"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [vector-search, embeddings, cost-engineering, data-pipelines, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (workspace and productivity tools)"
use_case: "Vector search and embeddings infrastructure behind Notion AI Q&A, which answers questions from a user's workspace and connected tools"
outcome: "The team reports 10x scale and 90 percent lower costs over two years; p50 production query latency improved from 70-100ms to 50-70ms after the move to turbopuffer"
measured_how: "Cost, capacity and latency figures reported by the team, covering the November 2023 launch to the February 2026 post; no exact cost figures, no breakdown of the headline cost reduction and no measurement method are given (Notion blog, February 2026)"
prerequisites: [vector-search, embeddings]
replications: []
---
> [!tldr]
> Notion built the vector search behind Notion AI Q&A, launched in November 2023, then spent two years scaling it and cutting its cost: a serverless vector database, a migration to turbopuffer, re-embedding only what changed, and a move to Ray that is still rolling out. The team writes that it "scaled our vector search infrastructure by 10x" while "reducing costs by 90 percent over the past two years". The post gives no exact cost figures and no quality evaluation.

> [!note] From the public record
> Built from Notion's own published account, "Two years of vector search at Notion: 10x scale, 1/10th cost" (February 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Notion AI answers natural-language questions by searching content from a user's workspace and "connected tools like Slack and Google Drive". Keyword search "matches exact words", so a query for "team meeting notes" can miss content titled "group standup summary". Notion therefore uses [vector search](#vector-search) over [embeddings](#embeddings).

The first problem was scale. After launch, "We quickly accumulated a waitlist of millions of workspaces eager to access Q&A", yet "At launch, we could only onboard a few hundred workspaces per day." And "Just one month after launch, our original indexes were close to capacity." The second problem was the cost of the setup that carried them through.

## Why this approach

- **Generations, not re-sharding.** Re-sharding step by step meant they would "Clone the data into another index, delete half, and repeat every two weeks". Re-sharding once for the final volume was ruled out because "Our chosen vector database provider charged for database uptime, making over-provisioning prohibitively expensive". Instead, when a set of indexes neared capacity, new workspaces went to a new one: "Each set got a “generation” ID that determined where reads and writes would go."
- **Serverless,** because it "decoupled storage from compute and charged based on usage rather than uptime."
- **turbopuffer,** which emerged from "a comprehensive evaluation of alternative search engines" "with substantially lower projected costs". The post does not name the other engines.
- **Ray,** to run "open-source embedding models directly, without being gated by external providers", and to stop paying twice: for "Running Spark on EMR for preprocessing" and per-token fees to an embeddings API provider.

## The approach

1. **Launch (November 2023).** Offline, "Batch jobs running on Apache Spark" chunked documents, embedded them through an API and bulk-loaded the vectors. Online, "Real-time updates via Kafka consumers that process individual page edits as they happen". Indexes were partitioned by workspace ID. See [Chunking](#chunking).
2. **Scaling up.** "With Airflow scheduling, pipelining to maximize throughput, and Spark job tuning", onboarding sped up. "By April 2024, we cleared the Q&A waitlist!"
3. **Serverless (May 2024).** The entire embeddings workload moved off the dedicated-hardware "pod" architecture.
4. **turbopuffer evaluation and migration (May 2024 to January 2025).** The team committed to the migration in late 2024. It rebuilt the corpus in turbopuffer, switched to "a newer, more performant, embeddings model" on the way, and dropped sharding and generation routing. They "migrated generations one at a time, validating correctness before moving to the next".
5. **Page State Project (July 2025).** Each span gets two 64-bit xxHash values, for text and metadata, cached in DynamoDB. Only spans whose text changed are re-embedded. When only metadata such as permissions changes, "we can skip embedding altogether" and send a PATCH to the vector database, "a much cheaper operation."
6. **Ray (July 2025 onwards).** The near real-time embeddings pipeline is moving to Ray on Anyscale, and Ray Serve keeps open-source embedding models loaded on the GPU. "This is still rolling out, but early results are promising."

## The stack

As of February 2026, the post names Apache Spark on AWS EMR, Kafka, Airflow, S3, turbopuffer, DynamoDB, xxHash, Ray, Anyscale and Ray Serve. The post does not name the earlier vector database provider, the embeddings API provider, or any embedding model. See [Vector databases and search engines](#vector-databases).

## Results, and how they were measured

- **Overall.** The 10x scale and 90 percent cost figures quoted in the summary above.
- **Onboarding.** "Daily onboarding capacity: 600x increase", "Active workspaces: 15x growth" and "Vector database capacity: 8x expansion".
- **Serverless.** "A 50 percent cost reduction from peak usage, resulting in several millions of dollars saved annually."
- **turbopuffer.** "60 percent cost reduction on search engine spend", "35 percent reduction in AWS EMR compute costs", and "p50 production query latency improved from 70-100ms to 50-70ms".
- **Page State Project.** "we achieved a 70% reduction in data volume", saving on embeddings API costs and vector database writes.
- **Ray.** An estimate, not a measurement: "we anticipate a 90+ percent reduction in embeddings infrastructure costs."

**Not measured:** the post gives no exact costs, only "several millions of dollars saved annually" and a run rate of "millions per year for vector database costs alone". There is no baseline or breakdown for the headline 90 percent, no measurement method or window for the other figures, and no number for the latency gain from self-hosted query embedding. The post reports no evaluation of search or answer quality, including after the embeddings model change.

## What failed

- **Capacity.** Indexes neared capacity a month after launch, and the waitlist cleared in April 2024.
- **Generations.** The multi-generation setup carried the team through hyper growth, but "it had become operationally complex and expensive."
- **Re-processing everything.** Before the Page State Project, on any edit "we would re-chunk, re-embed, and re-upload all of the spans in that page", even for one changed character.
- **Provider dependency.** "We were dependent on our provider’s API stability to keep our search indexes fresh". To avoid API rate limits, the team split the online indexing Spark job into multiple jobs, which the post calls "Clunky Pipelining".

The post describes no outages, incidents or rollbacks.

## What the team would do differently

The post states no lessons. It looks forward: more connected tools, and "We're continuously evaluating new embedding models as the field advances rapidly".

The wiki's reading: several of the reported and expected savings came from paying for less work: usage-based pricing, re-embedding only changed spans (a pattern other pipelines can reuse, see [Cost engineering](#cost-engineering)), and one compute layer instead of two. Changing provider and embedding model in one migration means the gains cannot be traced to a single change.

## Disclosure

None.

## Sources

- Preeti Gondi, Mickey Liu, Nathan Louie, Calder Lund and Jacob Sager, Notion, [“Two years of vector search at Notion: 10x scale, 1/10th cost”](https://www.notion.com/blog/two-years-of-vector-search-at-notion), Notion blog, 19 February 2026.

## Related

- [About playbooks](#about-playbooks)
- [Vector databases and search engines](#vector-databases)
- [Embeddings](#embeddings)
- [Cost engineering](#cost-engineering)
- [Production RAG](#production-rag)
