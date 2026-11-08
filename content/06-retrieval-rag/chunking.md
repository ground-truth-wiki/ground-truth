---
id: chunking
book: 6
order: "6.3"
title: Chunking
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [chunking, rag, contextual-retrieval]
visuals:
  - chunking-explorer:explorer
  - contextual-chunk:compare
  - chunk-size-tradeoff:chart
---
> [!tldr]
> Chunking splits documents into the pieces that retrieval returns. Good chunks are self-contained, follow the document’s structure and are small enough to rank precisely; most chunking bugs are chunks that make no sense on their own.

## Why it matters
The retriever can only return chunks you created. Cut a table in half, separate a heading from its paragraph, or split a sentence mid-thought, and the right answer becomes unretrievable no matter how good your embeddings are. Chunking is cheap to change and has an outsized effect, which makes it one of the first things to tune.

## Intuition
Chunking is cutting a book into index cards. Cards that are too big hold several topics, so they match many questions weakly. Cards that are too small lose the context that makes them meaningful (“It must be submitted within 30 days” — what must?). The best cards hold one idea and carry their heading with them.

```viz
{"id":"chunking-explorer","component":"explorer","model":"chunking","title":"Structure-aware chunking keeps sentences whole; fixed-size chunking cuts through them","caption":"Each tint is a chunk; hatched text sits in two chunks because of overlap. Watch the count of words cut in half as you switch strategies. Paste your own text to try it on real documents.","alt":"Interactive chunker showing a sample document split into chunks with adjustable size, overlap and strategy.","data":"illustrative","try":"Switch to fixed size at 120 characters and count the broken words, then switch back."}
```

## How it works
**Fixed-size chunking** cuts every N characters or tokens, with an overlap so that text near a boundary appears in both chunks. Simple and predictable, but blind to meaning.

**Recursive or structure-aware chunking** splits on the largest natural boundary first (sections, then paragraphs, then sentences, then words) until pieces fit the size limit, and then packs small pieces together. This is the sensible default for prose.

**Document-structure chunking** uses the parser’s output: one chunk per section or subsection, tables kept whole, code split by function. It works best when parsing is good.

**Semantic chunking** embeds sentences and starts a new chunk where similarity between neighbors drops, marking a topic shift. It costs more and helps most on long, unstructured text.

**Small-to-big (parent and child).** Index small chunks for precise matching, but return their larger parent section to the model for context.

**Propositions.** Rewrite text into atomic factual statements and index those (the “Dense X Retrieval” paper, Chen et al., 2023). Precise, expensive to build.

**Late chunking.** Embed the whole document with a long-context embedding model, then pool token embeddings per chunk, so each chunk’s vector reflects its surroundings.

**Contextual retrieval.** Before embedding, use a model to write a short note situating each chunk in its document, and prepend it. Anthropic reported in September 2024 that contextual embeddings plus contextual BM25 cut failed retrievals by 49%, and by 67% when combined with reranking, on their test sets.

```viz
{"id":"contextual-chunk","component":"compare","title":"A chunk that says “it” is unfindable until it carries its context","caption":"The same chunk before and after a generated context note is prepended. Hover the marks: every vague reference in the original gets resolved.","alt":"Comparison of a raw chunk and the same chunk with a contextual header explaining the company, document and section.","data":"illustrative","mono":false,"a":{"title":"Raw chunk","text":"Revenue grew 3% over the previous quarter, driven mainly by the new subscription tier. It must be reported within 30 days of quarter end.","mono":false},"b":{"title":"With a context note","text":"Context: from Acme Corp’s Q2 2026 financial report, section “Subscription revenue”, describing the second quarter of fiscal 2026.\n\nRevenue grew 3% over the previous quarter, driven mainly by the new subscription tier. It must be reported within 30 days of quarter end.","mono":false},"links":[{"a":"Revenue grew 3%","b":"Acme Corp’s Q2 2026 financial report","note":"Whose revenue? The note names the company and the period, so a query mentioning either can match."},{"a":"the previous quarter","b":"the second quarter of fiscal 2026","note":"Relative time becomes absolute."},{"a":"It must be reported","b":"section “Subscription revenue”","note":"The section heading tells the retriever what “it” refers to."}]}
```

## In practice
**Choosing a chunk size.** There is no universal best size; it depends on your questions. Factoid questions favor smaller chunks; questions that need explanation favor larger ones. Build a small labeled set and measure recall@k for two or three sizes rather than arguing.

```viz
{"id":"chunk-size-tradeoff","component":"chart","type":"line","title":"Small chunks rank precisely; large chunks carry context; the sweet spot depends on your questions","caption":"Illustrative curves, not measurements. Precision of the top results tends to fall as chunks grow, while the chance that a returned chunk contains the full answer rises. Measure both on your own data.","alt":"Illustrative line chart: ranking precision falls and answer completeness rises as chunk size grows from 100 to 2,000 tokens.","data":"illustrative","x":{"label":"Chunk size (tokens, log scale)","log":true},"y":{"label":"Relative score","unit":"pct","min":0,"max":1},"series":[{"name":"Ranking precision","points":[[100,0.82],[200,0.8],[400,0.74],[800,0.62],[1600,0.48],[2000,0.44]]},{"name":"Answer in one chunk","points":[[100,0.35],[200,0.5],[400,0.66],[800,0.78],[1600,0.86],[2000,0.88]]}]}
```

A sensible default pipeline:

```python
# Structure-aware chunking with a heading prefix (pseudocode).
for section in parse(doc).sections:              # keep headings from the parser
    for piece in split_recursive(section.text, max_tokens=400, overlap_tokens=50,
                                 separators=["\n\n", "\n", ". ", " "]):
        header = f"{doc.title} > {section.path}"   # breadcrumb of headings
        yield Chunk(text=f"[{header}]\n{piece}", source=doc.id,
                    page=section.page, acl=doc.acl)
```

- Keep **tables and code blocks whole**, or split them with their headers repeated.
- Store **metadata** on every chunk: source, page, section, date, permissions.
- **Re-chunk** when you change strategy; old and new chunks should not mix in one index.

## Numbers to know
> [!number]
> Rules of thumb. Common starting points are 200 to 800 tokens per chunk with 10% to 20% overlap. One token is about four characters of English. A context note for contextual retrieval is typically tens of tokens per chunk, generated once at indexing time; prompt caching makes generating it for every chunk of a long document affordable.

## Pitfalls and anti-patterns
> [!pitfall] Tuning chunk size by vibes
> Without a labeled set, every chunking debate is opinion. Twenty to fifty questions with known answer passages are enough to compare strategies.

- **Orphaned references.** Chunks full of “it”, “this” and “the above” cannot be matched; add headers or context notes.
- **Split tables.** A table row without its header row is noise.
- **Overlap as a cure-all.** Overlap reduces boundary losses but inflates the index and duplicates results; it does not fix bad boundaries.
- **Mixing strategies in one index.** Scores become incomparable.

## Talk like an expert
The vocabulary: **chunk size and overlap**, **recursive splitting**, **semantic chunking**, **parent-child** or **small-to-big retrieval**, **propositions**, **late chunking**, **contextual retrieval**. Experts say “chunk for the question, not the document”: the right unit is whatever answers your users’ questions in one piece. The live debate is how much chunking still matters with long-context generators; it matters less for reading, and just as much for ranking.

> [!hottake] Chunking is the highest-leverage hour you can spend on a RAG system.
> **The counterargument:** once chunks are reasonable, gains from further chunking tweaks are usually small, and query understanding, hybrid search and reranking deliver more.

## Check yourself
```quiz
chunking
```

## Go deeper
- Anthropic, “Introducing Contextual Retrieval” (September 2024).
- Chen et al., “Dense X Retrieval: What Retrieval Granularity Should We Use?” (2023).
- Günther et al., “Late Chunking: Contextual Chunk Embeddings Using Long-Context Embedding Models” (2024).

## Related
- [RAG fundamentals](#rag-fundamentals)
- [Ingestion and parsing](#ingestion-parsing)
- [Embeddings](#embeddings)
- [Evaluating RAG](#rag-evaluation)
- [Tokenization](#tokenization)
