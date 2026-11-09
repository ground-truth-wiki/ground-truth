---
id: uber-genie-on-call-copilot
book: 21
order: "21.66"
title: "Uber Genie: a RAG copilot for on-call Slack channels"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [rag, agentic-rag, on-call, llm-as-judge, internal-tools, public-record]
visuals: []
type: playbook
account: public-record
industry: "Mobility and delivery (internal engineering support)"
use_case: "Answering engineers' questions in on-call Slack support channels from internal documentation with RAG"
outcome: "A 48.9% helpfulness rate, and an estimated 13,000 engineering hours saved since the September 2023 launch; a later agentic RAG pipeline raised the percentage of acceptable answers by a relative 27% on security and privacy policy questions"
measured_how: "No calculation stated for the helpfulness rate and no method for the hours estimate; the post does not tie the rate to its in-Slack feedback buttons (Uber, October 2024); relative change against the earlier traditional RAG approach; the post describes a 100+ query SME golden set and an LLM judge but does not tie the figures to either (Uber, May 2025)"
prerequisites: [rag-fundamentals]
replications: []
---
> [!tldr]
> Uber built Genie, a Slack bot that answers questions in on-call support channels with RAG over internal documentation. By October 2024 it was in 154 Slack channels with a "48.9% helpfulness rate" and an estimated 13,000 engineering hours saved, though neither calculation is published. A May 2025 follow-up rebuilt the pipeline for security and privacy policy questions as agentic RAG and reports a relative 27% rise in acceptable answers.

> [!note] From the public record
> Built from Uber's own published accounts, "Genie: Uber's Gen AI On-Call Copilot" (October 2024) and "Enhanced Agentic-RAG: What If Chatbots Could Deliver Near-Human Precision?" (May 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Uber teams such as Michelangelo run Slack support channels. "People ask around 45,000 questions on these channels each month", and users have to wait for the on-call engineer to respond. Many questions "could get answered by referring to existing documentation", but the information is "fragmented across Uber’s internal wiki called Engwiki, internal Stack Overflow, and other locations". "High question volumes and long response wait times reduce productivity for users and on-call engineers."

## Why this approach

The team weighed fine-tuning against [RAG](#rag-fundamentals). Fine-tuning needs curated, diverse examples, and "It also requires compute resources to keep the model updated with new examples." By contrast, "RAG doesn’t require any diverse examples to begin with", which shortened the time to market. For data security, the team chose the sources to ingest carefully and pre-curated ones that are "widely available to most Uber engineers", because "many data sources can’t be exposed in Slack channels".

The 2025 redesign started from security and privacy policy questions, where subject matter experts (SMEs) "determined that response quality didn’t meet the standards required for a broader deployment." The diagnosis: "Simple semantic similarity can lead to retrieving irrelevant context".

## The approach

Genie, as of the 2024 post:

1. **Ingest and index.** A Spark app fetches sources such as Engwiki, internal Stack Overflow and engineering requirement documents, which are chunked, embedded and loaded into Sia, Uber's in-house vector database.
2. **Answer.** To reduce hallucinations, each retrieved result goes to the LLM as a sub-context with its source URL: "We asked the LLM to only give answers from the various sub-contexts provided".
3. **Feedback.** Users rate each reply in Slack as Resolved, Helpful, Not Helpful or Not Relevant, and buttons let them ask follow-ups or contact human support.
4. **Evaluation.** Users can run custom checks, such as hallucination, where an evaluator "runs LLM as a Judge". The same approach scores the source documents. See [LLM-as-judge done right](#llm-as-judge).

The 2025 pipeline, over "40+ engineering security and privacy policy documents":

1. **Document processing.** The team moved from PDFs to Google Docs with a custom loader, had an LLM convert tables to markdown, and added summaries, FAQs and keywords to chunk metadata. See [Document-processing and extraction pipelines](#document-extraction).
2. **Agents before retrieval.** A Query Optimizer "refines the query when it lacks context or is ambiguous" and splits complex queries. A Source Identifier narrows the search to a subset of policy documents.
3. **Hybrid retrieval.** A BM25 retriever over the enriched metadata runs alongside vector search, and the output is the union of both. See [Lexical and hybrid retrieval](#hybrid-retrieval).
4. **Post-processing.** An agent removes duplicate chunks and orders them as in the original documents.
5. **Automated evaluation.** "SMEs curated a golden set of 100+ test queries" and gave reference responses once. An LLM judge then scores answers "on a 0-5 scale, with 5 being the highest quality". See [Building eval datasets](#eval-datasets).

## The stack

As of October 2024: Apache Spark with PySpark UDFs, langchain for chunking, an OpenAI embedding model, Terrablob storage, the Sia vector database, and Michelangelo Gateway, "a pass-through service to the LLM". A UUID passed with each call to the Knowledge Service lets costs be tracked. A Slack plugin streams feedback metrics through a Kafka topic into a Hive table, and a dashboard visualizes them.

As of May 2025: Langfx, "Uber’s internal LangChain-based service", LangGraph for agent orchestration, the Google Python API, a BM25 retriever and the Michelangelo Genie framework. Neither post names the LLM that writes the answers.

## Results, and how they were measured

Genie, as of October 2024:

- **Reach.** Since its launch in September 2023, Genie has expanded to 154 Slack channels "and has answered over 70,000 questions".
- **Helpfulness.** "Genie boasts a 48.9% helpfulness rate". The post does not say how this rate is calculated or whether it comes from the feedback buttons.
- **Time saved.** "We estimate it’s saved us 13,000 engineering hours so far since its launch." The post gives no method.

The agentic pipeline, as of May 2025:

- **Answer quality.** Against traditional RAG: "increasing the percentage of acceptable answers by a relative 27%" and "reducing incorrect advice by a relative 60%".
- **Evaluation speed.** "The automated evaluation reduced experiment evaluation time from weeks to minutes".
- **Support load.** "This has led to a measurable reduction in the support load for on-call engineers and SMEs". No figure is given.

**Not measured:** neither post publishes response times or on-call load before Genie, a production error rate, how the helpfulness rate and hours saved are calculated, or the absolute rates behind the relative 27% and 60%, nor whether SMEs or the LLM judge produced them.

## What failed

- **Documentation sets the ceiling.** "If the quality of the documentation is poor itself, no matter how good the LLM performs," the post says, "there’s no way to have a good performance."
- **Out-of-scope requests.** Not Relevant marks cases where "Genie can’t assist (like for a code review)".
- **Traditional RAG on policies.** "Many answers were either incomplete, inaccurate, or failed to retrieve relevant information".
- **PDF parsing.** With PDF loaders, "many table cells become isolated, stand-alone text", and the team was "unable to find a universal solution that worked across all of our policy documents".
- **Slow iteration.** "Many experiments yielded only slight accuracy improvements before plateauing", and SME assessment was "often taking weeks".

## What the team would do differently

Neither post has a lessons section. The 2025 post lists next steps: enriching images and other multimodal content, "an iterative Chain-of-RAG approach" for multi-hop questions, a self-critique agent to "further reduce hallucinations", and features exposed as tools that agents choose by query type and complexity.

The wiki's reading: the 2025 changes are to documents, queries, retrieval and evaluation, and the post names no model change. The 2024 figures come with no stated method; the 2025 post adds a fixed golden set. Settle early how quality will be measured, and record the denominator.

## Disclosure

None.

## Sources

- Nicholas Marcott, Eduards Sidorovics, Paarth Chothani and others, Uber, [“Genie: Uber's Gen AI On-Call Copilot”](https://www.uber.com/en-HR/blog/genie-ubers-gen-ai-on-call-copilot/), Uber Blog, 10 October 2024.
- Arnab Chakraborty, Christopher Settles, Adi Raghavendra and others, Uber, [“Enhanced Agentic-RAG: What If Chatbots Could Deliver Near-Human Precision?”](https://www.uber.com/blog/enhanced-agentic-rag/), Uber Blog, 29 May 2025.

## Related

- [About playbooks](#about-playbooks)
- [Production RAG](#production-rag)
- [Evaluating RAG](#rag-evaluation)
- [Incidents and on-call](#incidents-on-call)
- [Customer-support and enterprise workflow agents](#support-agents)
