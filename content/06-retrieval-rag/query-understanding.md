---
id: query-understanding
book: 6
order: "6.8"
title: Query understanding
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [query-rewriting, hyde, routing]
visuals:
  - query-rewrite-flow:stepper
  - hyde-compare:compare
---
> [!tldr]
> Users ask questions that look nothing like the text that answers them, and follow-ups that make no sense without the conversation. Condensing, rewriting, expanding, decomposing, routing and extracting filters close that gap before retrieval runs.

## Why it matters
Retrieval sees only the query string you give it. “What about Germany?” retrieves nothing useful on its own; “Why is it slow?” matches every performance document ever written. A small, fast step that turns the user’s words into good search requests often improves recall more than any change to the index.

## Intuition
A good reference librarian does not search for your exact words. They ask what you mean, restate it in the library’s vocabulary, pick the right section, and sometimes split your question into two searches.

```viz
{"id":"query-rewrite-flow","component":"stepper","title":"A vague follow-up becomes a filtered, routed, expanded search in five quick steps","caption":"Step through one follow-up question. Each step is usually a small, fast model call or a rule; keep the original query alongside every rewrite.","alt":"Stepper turning a conversational follow-up into a standalone query with filters, expansions, a route and a hypothetical answer.","data":"illustrative","frames":[
{"label":"Conversation","caption":"Earlier the user asked about parental leave. Now they write a follow-up that is meaningless on its own.","code":"user: What's our parental leave policy?\nassistant: You get 16 weeks of paid leave…\nuser: what about adoption in Germany?"},
{"label":"Condense","caption":"Rewrite the follow-up as a standalone question using the chat history.","code":"How does parental leave work for adoption for employees in Germany?"},
{"label":"Extract filters","caption":"Pull structured constraints out of the text so the retriever can filter, not just rank.","code":"filters: {country: 'DE', topic: 'parental-leave'}\nquery: parental leave adoption"},
{"label":"Expand","caption":"Add the vocabulary documents actually use, including the local term, and keep the original.","code":"queries:\n  - How does parental leave work for adoption in Germany?\n  - adoption leave Elternzeit policy Germany\n  - parental leave adoptive parents entitlement weeks"},
{"label":"Route","caption":"Send the search to the HR policy index, not the engineering wiki or the ticket archive.","code":"route: hr-policies (confidence 0.94)"},
{"label":"Retrieve and fuse","caption":"Run every query variant with the filters, fuse the results, and rerank against the condensed question.","code":"3 queries x hybrid search -> RRF -> rerank -> top 6"}]}
```

## How it works
**Conversational condensation.** Rewrite follow-ups into standalone questions using the history. Almost every chat-based RAG system needs this step.

**Rewriting and expansion.** Add synonyms, domain terms and likely keywords; correct typos; translate. Keep the original query too, and fuse results from all variants. See [hybrid retrieval](#hybrid-retrieval).

**Multi-query.** Generate several paraphrases and search with each, merging results. Cheap insurance against an unlucky phrasing.

**Step-back prompting.** Search for a more general version of the question (“what is the leave policy?”) alongside the specific one, so background passages come back too.

**HyDE.** Hypothetical document embeddings (Gao et al., 2022): ask a model to write a plausible answer, embed that, and search with it. Answers look more like documents than questions do.

**Decomposition.** Split multi-part questions (“compare the leave policies in Germany and France”) into sub-questions, retrieve for each, then combine. See [advanced RAG](#advanced-rag).

**Routing and filter extraction.** Choose the index or tool (policies, tickets, code, SQL) and extract dates, products, regions or customers into structured filters. Filters are far more reliable than hoping the ranker notices “in 2024”.

```viz
{"id":"hyde-compare","component":"compare","title":"A hypothetical answer looks more like the document you want than the question does","caption":"HyDE in one picture. Hover the marks: the hypothetical answer shares vocabulary and structure with the real policy text, so its embedding lands closer.","alt":"Comparison of a raw user question and a model-written hypothetical answer used for retrieval.","data":"illustrative","mono":false,"a":{"title":"The user’s question","text":"can i take time off when we adopt?","mono":false},"b":{"title":"A hypothetical answer (used only for search)","text":"Employees who adopt a child are entitled to paid parental leave on the same terms as birth parents. Leave must be taken within 12 months of the placement and can be split into blocks. Notify HR at least four weeks before the start date.","mono":false},"links":[{"a":"time off","b":"paid parental leave","note":"The answer uses the policy’s own vocabulary."},{"a":"when we adopt","b":"Employees who adopt a child are entitled","note":"Phrased like a policy statement, which is what the index contains."},{"b":"Notify HR at least four weeks before the start date.","note":"The hypothetical details may be wrong; that is fine, because they are only used to find the real document, never shown to the user."}]}
```

## In practice
A practical order of operations, each step optional and measured:
1. Condense follow-ups (almost always worth it in chat).
2. Extract filters and route.
3. Expand into a few variants, keeping the original.
4. Retrieve with hybrid search per variant and fuse.
5. Rerank against the condensed question, not the variants.

```python
# Pseudocode: one small model call that does condensation, filters and expansion.
plan = small_model.json(
    prompt=QUERY_PLANNER_PROMPT,                 # few-shot examples of good plans
    input={"history": last_turns(6), "question": user_msg},
    schema={"standalone": "str", "filters": "dict", "queries": "list[str]", "route": "str"})
hits = fuse([hybrid(q, filters=plan.filters, index=plan.route) for q in [plan.standalone, *plan.queries]])
```

Log the original query, the rewrite, the filters and the route next to every retrieval. Most retrieval bugs are visible there.

## Numbers to know
> [!number]
> Rules of thumb. A query-planning call with a small, fast model typically adds well under a second. Three to five query variants capture most of the benefit of multi-query. Filters extracted from text should be validated against allowed values before use.

## Pitfalls and anti-patterns
> [!pitfall] Rewriting away the user’s words
> A rewrite can drop the one exact term that mattered. Always search with the original query as well.

- **Hallucinated filters.** A model inventing `country: 'DE'` from nothing silently hides the right documents; validate filters.
- **HyDE on factual lookups.** For identifiers and short factual queries it adds cost without benefit.
- **Unlogged rewrites.** You cannot debug retrieval you cannot see.

## Talk like an expert
The vocabulary: **query condensation**, **query rewriting** and **expansion**, **multi-query**, **step-back**, **HyDE**, **decomposition**, **routing**, **self-querying** (extracting structured filters). Experts log rewrites beside originals and evaluate the query planner as its own component. The live debate is whether agentic retrieval, where the model issues its own searches, makes a separate rewriting stage unnecessary.

> [!hottake] Conversational condensation is the single most important query-side fix in chat RAG.
> **The counterargument:** agents that call search tools themselves already write standalone queries, and for them a separate rewriting step mostly adds latency.

## Check yourself
```quiz
query-understanding
```

## Go deeper
- Gao et al., “Precise Zero-Shot Dense Retrieval without Relevance Labels” (2022), the HyDE paper.
- Zheng et al., “Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models” (2023), on step-back prompting.

## Related
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Advanced RAG architectures](#advanced-rag)
- [RAG fundamentals](#rag-fundamentals)
- [Prompt patterns and chaining](#prompt-chaining)
- [Reranking](#reranking)
- [Information retrieval foundations](#ir-foundations)
