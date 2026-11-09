---
id: dropbox-file-preview-ai-answers
book: 21
order: "21.34"
title: "Dropbox: AI summaries and answers in web file previews"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [summarization, embeddings, rag, clustering, cost-engineering, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (file storage and collaboration)"
use_case: "Summaries of files and answers to questions about them inside file previews on the web, first for one file and then for several files"
outcome: "Cost per summary dropped by 93% and cost per query by 64%; p75 latency fell from 115 to 4 seconds for summaries and from 25 to 5 seconds for queries"
measured_how: "Cost per summary, cost per query and p75 latency compared with the start of the project; no sample, period or method given (Dropbox, dropbox.tech, July 2024)"
prerequisites: [embeddings, rag-fundamentals]
replications: []
---
> [!tldr]
> Dropbox added LLM summaries and question answering to file previews on the web, on top of Riviera, its existing file conversion system. Summaries use k-means to pick dissimilar chunks of a file; answers use the chunks closest to the question. Since the start of the project, "Cost-per-summary dropped by 93%, and cost-per-query dropped by 64%", and p75 latency fell from 115 to 4 seconds for summaries and from 25 to 5 seconds for queries.

> [!note] From the public record
> Built from Dropbox's own published account, "Bringing AI-powered answers and summaries to file previews on the web" (July 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Dropbox wanted its file previews on the web to summarize a file and answer questions about it, for "knowledge workers suffering from information overload". Users store long documents, videos and other rich media, so the team wanted summarization for all of its users' files, "no matter the format or length." The first iteration "was limited to one file at a time"; a later one handled several files. The features were "still in early access, and not yet available to all users", and optional.

## Why this approach

- **Reuse the conversion system.** "we already have a framework for transforming basically any file type to text."
- **Clusters, not summaries of summaries.** A good summary, in the team's definition, finds "all the different ideas or concepts in a document" and gives "the gist of each". The team found [k-means clustering](#clustering-dimensionality-reduction) better than a summary-of-summaries (map-reduce) approach: topics are more diverse, and the final summary needs a single LLM call, which lowers the chance of hallucination and makes errors easier to pinpoint when comparing models.
- **Real time, not precomputed.** Precomputing would give lower latency, but computing in real time "allows the user to choose which files to share with the LLM", which the post ties to privacy and security.
- **Relevant parts, not the whole file.** Sending only the most relevant parts gave lower latency, lower cost and better quality results.

## The approach

1. **Text and embeddings.** Riviera chains plugins that convert a file from one type to another, for video `Video (.mp4) -> Audio (.aac) -> Transcript (.txt) -> AIEmbedding`. "Each state of the pipeline is cached, so intermediate states can be reused." The text is split "into paragraph-sized chunks", with one [embedding](#embeddings) per chunk (see [Chunking](#chunking)). Summaries and Q&A share the same chunks and embedding cache.
2. **Summaries.** The summarization plugin groups the chunks with k-means, takes a representative chunk from each major cluster, concatenates them into one context, and asks an LLM to summarize it.
3. **Answers.** The Q&A plugin embeds the question, selects the closest chunks and sends them with the question to the language model (see [RAG fundamentals](#rag-fundamentals)). The chunk locations are returned as sources.
4. **Follow-up questions.** Both plugins request follow-up questions from the LLM at the same time as the summary or answer, using function calling and [structured outputs](#structured-outputs).
5. **Chunk priority.** "The first two chunks chronologically are given top priority", then k-means picks dissimilar chunks for a summary or similar chunks for a question.
6. **Several files.** Whether a question is direct or broad cannot be told from the question alone. So the team's solution takes the highest and lowest relevance scores of the top 50 chunks and "cuts off the bottom 20% of that spread". Direct questions have a steeper curve and keep fewer chunks; broad ones keep more.

## The stack

As of July 2024, the post names Riviera, Dropbox's internal conversion system, in which each plugin "runs in a jail", a container for running third-party code safely. Riviera supports "conversions between about 300 file types". On top of it run plugins for embeddings, summarization and Q&A. The post does not name the LLM, its provider, the embedding model or any vector store.

## Results, and how they were measured

- **Cost and latency.** Against "the start of the project": "Cost-per-summary dropped by 93%, and cost-per-query dropped by 64%." Also, "The p75 latency of summaries decreased from 115 seconds to 4 seconds", and "the p75 latency for queries decreased from 25 seconds to 5 seconds." The post does not split the gains by change. See [Cost engineering](#cost-engineering).
- **Topic coverage.** With k-means, summaries "covered a broader range of topics", "approximately 50% more than with map-reduce". The post does not say how topics were counted or on which files.
- **Hallucination.** Stated, not measured: "When the LLM receives the entire file in one go, its likelihood of hallucinating decreases significantly." No rate is given.

**Not measured:** the post gives no sample, traffic volume, period or method for the cost and latency figures, no absolute costs and no date for the baseline. It reports no quality metric for summaries or answers, no hallucination rate, no usage or satisfaction figures, and no evaluation of the multi-file cutoff.

## What failed

- **Summaries of summaries.** Individual summaries "often repeat similar information", and combining them "results in a significant loss of overall file content." Each LLM call "presents a chance for hallucination", making the problem "exponentially worse when summarizing summaries."
- **No embedding cache at first.** "In our initial version, embeddings were not cached, resulting in multiple calls to the LLM for the same document." The next version cached them.
- **Too much context.** "we quickly learned through testing that sending garbage into the LLM means garbage out from the LLM."
- **Accepted costs.** Real-time processing gives up the lower latency of precomputing, and embeddings cost latency and compute for each file.

## What the team would do differently

The post does not say. Its "What we learned" section lists a series of decisions: real-time processing, segmentation and clustering, chunk priority, embeddings ("This was a crucial decision."), and cached embeddings.

The wiki's reading: cache each step so later requests reuse it, and send the model a selected part of the file, not all of it. The topic-coverage figure measures breadth, not correctness.

## Disclosure

None.

## Sources

- Binoy Dash, Bradley Crossen, Eric Cunningham, Royce Ausburn and Tejas Patel, Dropbox, [“Bringing AI-powered answers and summaries to file previews on the web”](https://dropbox.tech/machine-learning/bringing-ai-powered-answers-and-summaries-to-file-previews-on-the-web), dropbox.tech (Machine Learning), 11 July 2024.

## Related

- [About playbooks](#about-playbooks)
- [RAG fundamentals](#rag-fundamentals)
- [Clustering and dimensionality reduction](#clustering-dimensionality-reduction)
- [Chunking](#chunking)
- [Cost engineering](#cost-engineering)
