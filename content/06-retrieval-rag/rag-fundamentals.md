---
id: rag-fundamentals
book: 6
order: "6.1"
title: RAG fundamentals
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [rag, retrieval, grounding]
visuals:
  - rag-stepper:stepper
  - rag-compare:compare
  - rag-wizard:wizard
---
> [!tldr]
> Retrieval-augmented generation finds relevant passages at query time and puts them in the model’s context, so answers come from your documents instead of the model’s memory. It is how you get grounded, fresh, private and citable answers without retraining anything.

## Why it matters
Models know a lot, but not your handbook, your tickets from this morning, or which customer is allowed to see which file. RAG is the default way to connect a model to that knowledge, and its failure modes (wrong passages, missing passages, ignored passages) are behind a large share of production quality complaints. Understanding the pipeline end to end is what lets you tell which stage broke.

## Intuition
An open-book exam. The model is a capable student; retrieval is the librarian who brings the right three pages before the student answers. A brilliant student with the wrong pages still fails, and a mediocre librarian is the most common reason.

```viz
{"id":"rag-stepper","component":"stepper","title":"One question travels through two pipelines: indexing happened long before the user asked","caption":"Steps 1 to 5 run offline when documents arrive; steps 6 to 10 run on every question. Most failures trace to the offline half.","alt":"Stepper following a handbook PDF through parsing, chunking, embedding and indexing, then a question through rewriting, retrieval, reranking and generation.","data":"illustrative","try":"Pause on step 8 and imagine the right chunk ranked 31st. Which step would rescue it?","diagram":{"w":600,"h":222,"groups":[{"label":"Offline: indexing","x":0,"y":0,"w":600,"h":92},{"label":"Online: answering","x":0,"y":126,"w":600,"h":96}],"nodes":[
{"id":"docs","label":"Documents","role":"data","x":8,"y":28,"w":104,"h":52},{"id":"parse","label":"Parse","x":128,"y":28,"w":104,"h":52},{"id":"chunk","label":"Chunk","x":248,"y":28,"w":104,"h":52},{"id":"embed","label":"Embed","role":"model","x":368,"y":28,"w":104,"h":52},{"id":"index","label":"Index","role":"data","x":488,"y":28,"w":104,"h":52},
{"id":"query","label":"Question","role":"human","x":8,"y":158,"w":104,"h":52},{"id":"rewrite","label":"Rewrite","role":"model","x":128,"y":158,"w":104,"h":52},{"id":"retrieve","label":"Retrieve","x":248,"y":158,"w":104,"h":52},{"id":"rerank","label":"Rerank","role":"model","x":368,"y":158,"w":104,"h":52},{"id":"gen","label":"Generate","role":"model","x":488,"y":158,"w":104,"h":52}],
"edges":[{"from":"docs","to":"parse"},{"from":"parse","to":"chunk"},{"from":"chunk","to":"embed"},{"from":"embed","to":"index"},{"from":"query","to":"rewrite"},{"from":"rewrite","to":"retrieve"},{"from":"index","to":"retrieve","style":"dashed"},{"from":"retrieve","to":"rerank"},{"from":"rerank","to":"gen"}]},
"frames":[
{"label":"Ingest","highlight":["docs"],"caption":"A 40-page employee handbook arrives as a PDF.","panel":"Source: `handbook-2026.pdf`, 40 pages, last updated 2026-09."},
{"label":"Parse","highlight":["parse"],"caption":"Extract text, headings and tables, and keep page numbers as metadata for citations. Tables and scans are where parsers fail. See [ingestion and parsing](#ingestion-parsing).","code":"page 12 | 4.2 Parental leave | Employees receive 16 weeks of paid parental leave…"},
{"label":"Chunk","highlight":["chunk"],"caption":"Split along headings into pieces of a few hundred tokens, and prepend the section title so each chunk makes sense alone. See [chunking](#chunking).","code":"[4.2 Parental leave] Employees receive 16 weeks of paid parental leave, to be taken within 12 months of the birth or adoption…"},
{"label":"Embed","highlight":["embed"],"caption":"An embedding model turns each chunk into a vector, often around a thousand numbers, so similar meanings land near each other. See [embeddings](#embeddings).","code":"chunk_118 → [0.021, −0.334, 0.117, …] (1,024 dimensions)"},
{"label":"Index","highlight":["index"],"caption":"Vectors, text and metadata go into a vector index; the same text goes into a keyword index for hybrid search.","code":"{id: chunk_118, page: 12, section: '4.2', acl: ['all-employees'], vector: …}"},
{"label":"Question","highlight":["query"],"caption":"Months later, a user asks a question in their own words.","panel":"“How long is parental leave if we adopt?”"},
{"label":"Rewrite","highlight":["rewrite"],"caption":"Optionally rewrite or expand the query, keeping the original too. See [query understanding](#query-understanding).","code":"['How long is parental leave if we adopt?', 'parental leave duration adoption policy weeks']"},
{"label":"Retrieve","highlight":["retrieve","index"],"caption":"Hybrid search over both indexes returns the top 30 candidates, filtered by what this user may see. See [hybrid retrieval](#hybrid-retrieval).","code":"top-30: chunk_118 (rank 4), chunk_119 (rank 9), chunk_301 (rank 1: benefits overview) …"},
{"label":"Rerank","highlight":["rerank"],"caption":"A cross-encoder reads each candidate with the question and reorders them; keep the top five. See [reranking](#reranking).","code":"top-5: chunk_118, chunk_119, chunk_301, chunk_122, chunk_045"},
{"label":"Generate","highlight":["gen"],"caption":"The model answers from the five chunks only and cites the page. If the chunks do not contain the answer, it should say so.","panel":"“16 weeks of paid leave, taken within 12 months of the adoption [Handbook p. 12].”"}]}
```

## How it works
**Why RAG.** Four reasons, often all at once: **grounding** (answers come from sources, not memory), **freshness** (update the index, not the model), **private data** (the model never trained on it), and **citations** (users can check). See [grounding and citations](#grounding-citations).

**The canonical pipeline.** Offline: ingest, parse, chunk, embed, index. Online: understand the query, retrieve candidates, rerank, assemble the context, generate, cite. Each stage has its own chapter in this Book.

**RAG versus its alternatives.**

| Approach | Good at | Weak at |
|---|---|---|
| Prompting alone | General knowledge, reasoning | Private or recent facts |
| RAG | Large, changing, private corpora; citations | Questions that need the whole corpus at once |
| Long context | A few documents read in full | Cost and latency per query; very large corpora |
| Cache-augmented generation | A small, stable corpus preloaded into a cached prefix | Corpora that change or exceed the window |
| Fine-tuning | Style, format, narrow skills | Facts that change; citations |

They combine. A common production shape is retrieval to find the right documents, then long context to read them whole.

```viz
{"id":"rag-compare","component":"compare","title":"Without retrieval the model answers from memory; with it, from your page 12","caption":"Illustrative answers to the same question. Hover the marked parts: the memory answer sounds right and is wrong for this company.","alt":"Comparison of an answer from model memory and an answer grounded in retrieved handbook text.","data":"illustrative","mono":false,"a":{"title":"Model memory only","text":"Parental leave policies vary, but many companies offer around 12 weeks for adoptive parents. Check with HR for your exact entitlement.","mono":false},"b":{"title":"With retrieved chunks","text":"You get 16 weeks of paid parental leave for an adoption, to be taken within 12 months of the placement [Handbook p. 12]. Part-time employees receive the same number of weeks, paid pro rata [p. 13].","mono":false},"links":[{"a":"around 12 weeks","b":"16 weeks of paid parental leave","note":"A plausible generic number versus the company’s actual policy."},{"a":"Check with HR for your exact entitlement.","b":"[Handbook p. 12]","note":"A citation lets the user verify instead of being sent elsewhere."},{"b":"Part-time employees receive the same number of weeks, paid pro rata [p. 13].","note":"Retrieval surfaces details the user did not know to ask about."}]}
```

## In practice
Start simple and measure before adding stages:

1. Parse well, chunk by structure, embed with a good general model, and index with both vectors and keywords.
2. Retrieve 20 to 50 candidates, rerank to 5 to 10, and put them in the prompt with their sources.
3. Instruct the model to answer only from the provided passages, to cite them, and to say when they do not contain the answer.
4. Build a small labeled set of questions with the passages that answer them, and measure retrieval recall separately from answer quality. See [evaluating RAG](#rag-evaluation).

```python
# Minimal RAG answer step (pseudocode around a real pattern).
hits = hybrid_search(question, k=40, filters={"acl": user.groups})
top = rerank(question, hits)[:6]
context = "\n\n".join(f"<doc id='{h.id}' source='{h.source}' page='{h.page}'>\n{h.text}\n</doc>" for h in top)
prompt = (f"{context}\n\nAnswer the question using only the documents above. "
          f"Cite sources as [source p. page]. If the answer is not in them, say so.\n\nQuestion: {question}")
```

Not sure which approach your problem needs? Walk the decision:

```viz
{"id":"rag-wizard","component":"wizard","wizard":"prompt-rag-finetune","title":"Four questions decide between prompting, RAG, long context and fine-tuning","caption":"A starting recommendation, not a verdict. Every branch ends with the chapters to read next.","alt":"Decision wizard for choosing between prompting, retrieval, long context and fine-tuning.","data":"illustrative"}
```

## Numbers to know
> [!number]
> Rules of thumb. Chunks of a few hundred tokens with some overlap are a common starting point. Retrieve dozens of candidates and keep the best five to ten after reranking. Measure recall@k first: if the right passage is not in the top 20, no generator can save the answer.

## Pitfalls and anti-patterns
> [!pitfall] Evaluating only the final answer
> If you measure only answer quality, you cannot tell whether retrieval or generation failed. Measure them separately.

- **Ignoring permissions.** Retrieval that ignores access control leaks documents through answers. Filter at query time. See [production RAG](#production-rag).
- **Bad parsing.** Garbled tables and lost headings poison every later stage.
- **No “I don’t know”.** Without explicit permission to abstain, the model fills gaps from memory.
- **Stale indexes.** Deleted or updated documents linger unless deletion is part of ingestion.

## Talk like an expert
The vocabulary: **retriever** and **generator**, **recall@k**, **grounding**, **faithfulness**, **hybrid search**, **reranking**, **chunking strategy**, **agentic RAG**. Experts split every RAG bug into “retrieval miss” or “generation miss” before doing anything else. The live debate is whether long context and agentic search make classic RAG obsolete; the pragmatic answer is that retrieval moved inside agents rather than disappearing. See [advanced RAG](#advanced-rag).

> [!hottake] Most RAG problems are parsing and chunking problems.
> **The counterargument:** with good structure-aware parsing now widely available, the bottleneck often moves to query understanding and ranking: users ask questions that do not resemble the text that answers them.

## Check yourself
```quiz
rag-fundamentals
```

## Go deeper
- Lewis et al., “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks” (2020), the paper that named RAG.
- Karpukhin et al., “Dense Passage Retrieval for Open-Domain Question Answering” (2020).
- Anthropic, “Introducing Contextual Retrieval” (September 2024).

## Related
- [Chunking](#chunking)
- [Embeddings](#embeddings)
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Reranking](#reranking)
- [Evaluating RAG](#rag-evaluation)
- [Context engineering](#context-engineering)
- [Information retrieval foundations](#ir-foundations)
- [Web search and hosted retrieval services](#web-search-hosted-retrieval)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Retrieval-augmented language models: the research lineage](#retrieval-augmented-lms)
