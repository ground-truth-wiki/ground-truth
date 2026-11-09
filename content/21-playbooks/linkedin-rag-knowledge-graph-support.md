---
id: linkedin-rag-knowledge-graph-support
book: 21
order: "21.24"
title: RAG over a knowledge graph of support tickets at LinkedIn
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [rag, knowledge-graphs, graph-rag, customer-support, public-record]
visuals: []
type: playbook
account: public-record
industry: "Online services (professional network), customer service technical support"
use_case: "Answering technical support questions by retrieving past issue tickets from a knowledge graph and generating an answer with an LLM"
outcome: "Median per-issue resolution time reduced by 28.6% (P50 of 5 hours with the tool, 7 hours without); offline MRR of 0.927 against 0.522 for text-based retrieval"
measured_how: "Random split of LinkedIn's customer service team into a tool group and a manual group, deployment of about six months, group sizes and comparison period not stated; offline retrieval and generation metrics on a curated golden dataset (Xu et al., arXiv and SIGIR '24, 2024)"
prerequisites: [rag-fundamentals, knowledge-graphs]
replications: []
---
> [!tldr]
> A LinkedIn team turned historical issue tickets into a knowledge graph and used it for retrieval in a RAG system for its customer service team. In a random split of that team, the median resolution time per issue was 5 hours with the tool and 7 hours without, reported as a 28.6% reduction. The paper gives no group sizes and no statistical test.

> [!note] From the public record
> Built from LinkedIn's own published account, "Retrieval-Augmented Generation with Knowledge Graphs for Customer Service Question Answering" (April 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In customer service technical support, the paper says, "swiftly and accurately retrieving relevant past issues is critical for efficiently resolving customer inquiries". In the usual RAG setup, historical tickets are treated as plain text, cut into chunks that fit the embedding model, and embedded; the most relevant chunks then go to an LLM as context. The authors name two limits:

- **Lost structure.** Tickets have inner structure and cross-references such as "issue A is related to/copied from/caused by issue B". Compressing tickets into text chunks "leads to the loss of vital information".
- **Split answers.** Fixed-length segments can separate related content, "leading to incomplete answers": a ticket with the problem at the start and the solution at the end may lose part of the solution. See [Chunking](#chunking).

## Why this approach

The team kept the tickets' structure: each ticket becomes a tree, and the trees are linked into one graph. The paper places this among earlier work on question answering over knowledge graphs and on combining LLMs with them; see [Graph RAG methods](#graph-rag) and [Knowledge graphs and ontologies](#knowledge-graphs). It does not say which other designs were tried. Offline, it is compared only with conventional text-based retrieval; in production, only with manual methods.

## The approach

**Building the knowledge graph.**

1. **Ticket trees.** Each ticket becomes a tree whose nodes are its sections, such as Summary, Description and Priority. Rules extract predefined fields first; an LLM parses the rest, guided by a YAML template of the ticket sections customer support routinely uses.
2. **Links between tickets.** Explicit links come from ticket fields, such as those in Jira. Implicit links come from the cosine similarity of ticket title embeddings, above a threshold.
3. **Node embeddings.** Text-rich nodes such as "steps to reproduce" are embedded and stored in a vector database. A node too long for the embedding model can be chunked "without worrying about quality since the text all belong to the same section".

**Answering a question.**

1. **Parse the query.** An LLM extracts named entities, keyed to template sections, and the query's intent.
2. **Find tickets.** Each entity is compared by cosine similarity with nodes of the matching section; scores are summed per ticket and the top tickets kept.
3. **Extract a subgraph.** The LLM rewrites the query around the retrieved ticket ID and translates it into a graph query language, "such as Cypher for Neo4j".
4. **Generate the answer.** The LLM answers from the retrieved information. For robust online serving, "if query execution encounters issues, a fallback mechanism reverts to a baseline text-based retrieval method".

## The stack

As of April 2024, the paper names most components as examples: text-embedding models such as BERT and E5, a vector database, "for instance, QDrant", Cypher for Neo4j as the graph query language, and Jira as an example issue tracker. The parsing template is YAML. The offline evaluation used GPT-4 and E5 for both groups. The paper does not state which LLM, vector database or graph database the deployed system runs.

## Results, and how they were measured

**Offline evaluation.** A curated "golden" dataset held "typical queries, support tickets, and their authoritative solutions". The baseline was conventional text-based embedding retrieval. The paper: "it surpasses the baseline by 77.6% in MRR and by 0.32 in BLEU score". The tables give:

- **Retrieval (baseline, then experiment).** MRR 0.522 and 0.927. Recall@1 0.400 and 0.860, Recall@3 0.640 and 1.000. NDCG@1 0.400 and 0.860, NDCG@3 0.520 and 0.946.
- **Answer quality against the golden solutions.** BLEU 0.057 and 0.377. METEOR 0.279 and 0.613. ROUGE 0.183 and 0.546.

See [Evaluating RAG](#rag-evaluation) for these metrics.

**Production.** The deployment covered "multiple product lines". "The team was split randomly into two groups: one used our system, while the other stuck to traditional manual methods." The abstract says the method was "deployed within LinkedIn’s customer service team for approximately six months" and "reduced the median per-issue resolution time by 28.6%". Table 3 gives resolution time per issue:

- **Tool not used:** mean 40 hours, P50 7 hours, P90 87 hours.
- **Tool used:** mean 15 hours, P50 5 hours, P90 47 hours.

The paper says the tool group "achieved significant gains" but reports no statistical test. See [Online controlled experiments for AI features](#online-experiments).

**Not stated:** the paper does not state the size of either group, the number of issues, whether the random split ran for the full six months, any test of statistical significance, the size of the golden dataset, latency or cost, the accuracy of answers in production, or how often the fallback was used.

## What failed

The paper reports no failures of the deployed system. The method allows for graph query execution to run into issues and falls back to text-based retrieval in that case; no failure rate is given. The paper lists automated template extraction and dynamic graph updates as future work.

## What the team would do differently

The paper states no lessons. Its future work is "developing an automated mechanism for extracting graph templates", "investigating dynamic updates to the knowledge graph based on user queries to improve real-time responsiveness", and exploring uses beyond customer service.

The wiki's reading: the design relies on data that already had structure, namely ticket sections and explicit links. A team with similar data can test it against its own text-based baseline on a golden set, and should report group sizes, issue counts and the period for any production claim.

## Disclosure

None.

## Sources

- Zhentao Xu, Mark Jerome Cruz, Matthew Guevara, Tie Wang, Manasi Deshpande, Xiaofeng Wang and Zheng Li, LinkedIn Corporation, [“Retrieval-Augmented Generation with Knowledge Graphs for Customer Service Question Answering”](https://arxiv.org/abs/2404.17723v1), arXiv 2404.17723, version 1 of 26 April 2024 (version 2 of 6 May 2024 has the same text); published in the Proceedings of SIGIR ’24, 14 to 18 July 2024, Washington, DC, doi:10.1145/3626772.3661370.

## Related

- [About playbooks](#about-playbooks)
- [Graph RAG methods](#graph-rag)
- [Evaluating RAG](#rag-evaluation)
- [Customer-support and enterprise workflow agents](#support-agents)
- [Online controlled experiments for AI features](#online-experiments)
