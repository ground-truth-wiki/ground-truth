---
id: zalando-rag-data-ingestion
book: 21
order: "21.60"
title: "Zalando: mapping supplier spreadsheets with a RAG flywheel"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [commerce, rag, schema-mapping, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Commerce (supply operations handling supplier offers)"
use_case: "Suggesting how the columns of each uploaded supplier spreadsheet map to a fixed internal schema, with every suggestion reviewed by an operations specialist and approved mappings fed back into retrieval"
outcome: "Operations specialists accept 85% of mapping suggestions without changes in production, a rate that has increased as the index of approved mappings has grown"
measured_how: "Share of suggestions accepted without changes in live workflows, tracked since launch; not a formal evaluation against a labeled dataset; no sample size or period stated (Zalando Engineering Blog, October 2026)"
prerequisites: [rag-fundamentals, structured-outputs]
replications: []
---
> [!tldr]
> Zalando built an LLM system that suggests how the columns of supplier spreadsheets map to an internal schema of over 55 columns. Mappings that operations specialists approve are embedded, stored in PostgreSQL with pgvector and retrieved for later uploads, a loop the team calls a RAG flywheel. Specialists accept 85% of suggestions without changes, which the post calls an operational signal, not a formal benchmark.

> [!note] From the public record
> Built from Zalando's own published account, "Automating Data Ingestion with a RAG Flywheel" (October 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Zalando's Supply Operations team manages supplier offers, and each supplier provides data in different formats, structures and schemas. For every uploaded file, "operations specialists must manually map the highly diverse schemas", "ranging from 10-60 columns per sheet per workbook", to a "strictly defined internal target schema of over 55 columns". Headers vary unpredictably: the post's examples include "Art.-Nr.", "Article Number", "SKU" and "Farbe" (color in German, as the post explains). The post calls this an operational bottleneck.

## Why this approach

The post describes the traditional way to automate schema matching: hardcoded rules, regular expressions or Levenshtein distance-based fuzzy matching. In its words, "these methods often fall short when dealing with the high variability and complexity of real-world data", and a column such as Retail Price might appear as UVP, Price or MSRP. Because these "legacy engines lack semantic understanding of the data", they need manual maintenance from engineers for every new or changed supplier format. The post does not say explicitly whether Zalando itself ran such an engine, and it names no other options it considered.

The team wanted a system that "continuously improves over time with human feedback". An LLM reasons about each mapping, and retrieval of past human-approved mappings feeds it context, the pattern of [retrieval-augmented generation](#rag-fundamentals). "Exact string matching is insufficient here", since UVP and rrp_de may mean the same thing, so retrieval compares embeddings.

## The approach

1. **A fixed contract.** A system prompt injects the internal target schema and sets rules: map only to exact target names, return null when nothing fits, give reasoning, and score confidence from 95-100 for an exact historical or identical-name match down to 1-49 for a low-confidence guess. Forced tool use returns sourceColumn, targetColumn, reasoning and confidenceScore, with temperature hardcoded to 0.0. See [Structured outputs](#structured-outputs).
2. **Cold start.** With no history, the model gets the target schema and the source columns with data types and sample values. "In this cold start scenario, the LLM relies solely on logical deductions."
3. **Embeddings.** Each source column becomes a string of its name, inferred data type and representative sample values, which Amazon Titan Text Embeddings V2 turns into a 1024-dimensional vector.
4. **Warm start.** Per incoming column, a cosine similarity search over approved mappings keeps matches with a similarity of at least 0.8, ranks them by approval count and then similarity, and returns at most 3 into the prompt as historical context. "A mapping confirmed multiple times across different uploads naturally outweighs a single anomaly."
5. **API validation.** The team treats "the LLM output as untrusted until verified". The API rejects source columns not in the file and target columns not in the schema, and checks that every source column has a mapping.
6. **Human review and feedback.** An operations specialist reviews every suggestion. Approved or updated mappings are embedded asynchronously and stored in the column_mappings table. Deleting old embeddings resets the history. See [Human in the loop](#human-in-the-loop) and [The data flywheel](#data-flywheel).
7. **Fallback.** If the LLM is temporarily unavailable, retrieval alone can suggest a previously approved mapping when similarity and approval history meet the configured thresholds. Columns without a sufficiently similar match stay unresolved, and a retrieved mapping remains a suggestion until a specialist confirms it.

## The stack

As of October 2026: AWS Bedrock hosts the AI dependencies, called through the Bedrock Mantle endpoint with the standard OpenAI Node SDK. Embeddings come from Amazon Titan Text Embeddings V2. The generative model is named only by example, "like Anthropic Claude Sonnet or Gemini"; the code sample uses "anthropic.claude-3-sonnet" with the comment "or any other generative model". The post does not say which model runs in production. PostgreSQL with the pgvector extension and an HNSW index stores the vectors (see [Vector databases and search engines](#vector-databases)). An API, shown in TypeScript in the code samples, orchestrates the calls and validates output.

## Results, and how they were measured

Since launch, the team has tracked how often operations specialists accept suggestions without changes.

- **Acceptance.** "In production, operations specialists currently accept 85% of mapping suggestions without changes."
- **Trend.** "The current acceptance rate is 85% and has increased as the historical index has grown with approved mappings". The post calls this "an encouraging operational signal, rather than a formal benchmark of mapping accuracy".
- **Method.** "This reflects human judgments in live workflows rather than a formal evaluation against a labeled dataset." The team plans to "gather more data and build out full analytics for these metrics later in the year."

**Not measured:** the post gives no number of uploads, suppliers, columns or reviewers behind the 85%, no launch date or measurement period, no starting value for the trend, no separate acceptance rate for cold-start suggestions, no count of outputs rejected by validation, and no time or effort saved compared with manual mapping.

## What failed

The post reports no specific incidents. It names these limits:

- **Model output.** "LLMs are not deterministic: they can produce different outputs and hallucinate." And "Tool use constrains the response shape, but it does not guarantee that the semantic mapping is correct", so validation and human review stay in place.
- **Fallback quality.** "The quality of this fallback therefore depends on the availability of representative approved mappings", the embedding model and the similarity threshold.
- **Stale history.** Approved mappings can become stale or incorrect, which is why the index is rebuildable.
- **Untrusted input.** Sample values can contain personal, commercial or other sensitive information, and "a value that looks like an instruction must remain data rather than becoming part of the prompt's instructions". Also: "Embeddings are not a substitute for anonymisation: they can still encode information about the source data." See [RAG security](#rag-security).

## What the team would do differently

The post states no regrets. Its lesson: "The broader lesson is that LLMs are most useful in data ingestion when they operate inside a controlled workflow." The system "is designed to reduce repetitive work, not to remove human judgment". The next step it names is full analytics for these metrics later in the year.

The wiki's reading: acceptance reflects both suggestion quality and how closely reviewers check, so an offline check that uses the approved mappings as a labeled set would complement it. Ranking by approval count guards against one wrong approval, but a mapping wrongly approved several times would be retrieved with high confidence, so deleting history is an important control.

## Disclosure

None.

## Sources

- Tushar Gupta (Software Engineer), Zalando, [“Automating Data Ingestion with a RAG Flywheel”](https://engineering.zalando.com/posts/2026/10/structure-automating-data-ingestion-with-a-rag-flywheel.html), Zalando Engineering Blog, 12 October 2026.

## Related

- [About playbooks](#about-playbooks)
- [The data flywheel](#data-flywheel)
- [Structured outputs](#structured-outputs)
- [Human in the loop](#human-in-the-loop)
- [Online evaluation](#online-evaluation)
