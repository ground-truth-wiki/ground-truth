---
id: web-search-hosted-retrieval
book: 6
order: "6.17"
title: Web search and hosted retrieval services
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [web-search, managed-rag, file-search, build-versus-buy, citations]
visuals: []
prerequisites: [rag-fundamentals, agent-tools]
---
> [!tldr]
> Instead of building a retrieval pipeline, you can use one: provider web search tools let the model search the web and cite pages, and hosted file search and managed knowledge bases chunk, embed, index and retrieve your own files. They are the fastest route to grounded answers, and you pay for that in per-search fees and in control over parsing, chunking, ranking, permissions and evaluation. Remember that every page they return is untrusted input, and that logging and evaluating what was retrieved is still your job.

## Key ideas

- **Build or use.** The decision is how much of the [RAG pipeline](#rag-fundamentals) you hand over. With a provider's server tool, the API runs the search and you see the call and its results in the response without executing anything; a third-party search API wrapped as your own client tool is run by your code, so you can filter, cache and log the raw results, but you also run the loop ([Anthropic, “Server tools”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools); see [Tool use and tool design](#agent-tools)).
- **Provider web search tools.** In Anthropic's, OpenAI's and Google's APIs, the model decides when to search and writes its own queries, and the answer carries citations: Anthropic returns `web_search_result_location` citations with up to 150 characters of cited text, while OpenAI and Google return `url_citation` annotations with character offsets, URL and title ([Anthropic web search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool), [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search), [Google, “Grounding with Google Search”](https://aistudio.google.com/docs/google-search)). As of November 2026, Anthropic's tool takes `max_uses` per turn, an allow list or a block list of domains (not both), an approximate `user_location`, and in newer versions can filter results with code before they reach the context; OpenAI's takes up to 100 allowed or 100 blocked domains and an approximate user location ([Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool), [OpenAI](https://developers.openai.com/api/docs/guides/tools-web-search)).
- **Cost and freshness, dated.** As of November 2026, Anthropic charges $10 per 1,000 searches plus tokens, and search results count as input tokens in later turns too; OpenAI lists $10 per 1,000 web search calls plus search content tokens at model rates; Google bills Gemini 3 and newer models per search query the model runs, at $14 per 1,000 after 5,000 free requests a month ([Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool), [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Google](https://aistudio.google.com/docs/google-search)). Anthropic notes that single-fact queries typically use 1 to 3 searches and comparative research 10 or more; for freshness, its results carry a `page_age`, and OpenAI's `external_web_access: false` runs search in an offline, cache-only mode ([Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool), [OpenAI](https://developers.openai.com/api/docs/guides/tools-web-search)).
- **Hosted file search and managed RAG.** As of November 2026, OpenAI's file search retrieves from vector stores with semantic and keyword search, metadata filters and `file_citation` annotations, and splits files into 800-token chunks with 400 tokens of overlap by default ([OpenAI file search](https://developers.openai.com/api/docs/guides/tools-file-search), [OpenAI retrieval guide](https://developers.openai.com/api/docs/guides/retrieval)); Gemini File Search chunks, embeds and indexes files into File Search stores and cites them in answers ([Google, “File Search”](https://aistudio.google.com/docs/file-search)). Amazon Bedrock offers managed knowledge bases, with connectors, document-level ACL filtering at retrieval time (except for its web crawler), reranking and agentic retrieval, and customer-managed ones in which you run the vector store and ingestion yourself ([Amazon Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html)).
- **What you give up, and what stays yours.** As of November 2026, you tune only the knobs a service exposes, such as OpenAI's chunk size (100 to 4,096 tokens), score threshold and hybrid-search weights, or Gemini's chunk size, overlap and metadata filters; on Bedrock, document-level permissions, third-party connectors and some other features exist only in managed knowledge bases ([OpenAI retrieval guide](https://developers.openai.com/api/docs/guides/retrieval), [Google](https://aistudio.google.com/docs/file-search), [Amazon](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html)). Evaluation stays with you: OpenAI omits file search results from the response unless you request them, and its web search `sources` field lists every URL consulted, often more than were cited ([OpenAI file search](https://developers.openai.com/api/docs/guides/tools-file-search), [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search)), so log queries, results and citations and turn them into a [test collection](#retrieval-test-collections).
- **Web content is untrusted, and crawling has rules.** Indirect prompt injection works by planting instructions “into data likely to be retrieved”, and was demonstrated against Bing's GPT-4 powered chat ([Greshake et al., “Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection” (2023)](https://arxiv.org/abs/2302.12173); see [Prompt injection](#prompt-injection) and [RAG security](#rag-security)); Anthropic also warns that Unicode homographs can slip past domain filters and advises ASCII-only lists ([Anthropic, “Server tools”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools)). Teams that crawl should honor robots.txt, whose rules “are not a form of access authorization” and whose cached copy should not be used for more than 24 hours ([RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)); what crawling allows for training is covered in [Data licensing, copyright and consent](#data-licensing-consent).

## Planned visuals

- **`matrix`:** a dated comparison (as of November 2026, verify before use) of provider web search tools and hosted retrieval services: who runs the search, citation format, domain controls, localization, chunking control, permission filtering, and price per 1,000 searches or calls.
- **`sequence`:** one web search turn step by step: the user asks, the model emits a search call, the provider runs it, results come back, and the model answers with citations; a variant shows the same turn with a third-party search API as a client tool, where your code runs the search and can log and filter it.
- **`tree`:** a build-or-use decision: public web or private files, permission requirements, custom parsing or ranking needs and evaluation needs, leading to a provider web search tool, a search API as a client tool, hosted file search, a managed knowledge base, or your own pipeline.

## Talk like an expert

Experts separate **server tools**, which the provider runs, from **client tools**, which their own code runs, and talk about **grounding**, **citations**, **domain allow lists**, **vector stores** and **managed knowledge bases**. They price an agent turn in searches as well as tokens, and decide build versus use by what they must control: permissions, parsing, and the ability to evaluate retrieval on their own queries.

## Go deeper

- Anthropic, [“Web search tool”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) documentation.
- OpenAI, [“Web search”](https://developers.openai.com/api/docs/guides/tools-web-search) and [“File search”](https://developers.openai.com/api/docs/guides/tools-file-search) guides.
- Google, [“Grounding with Google Search”](https://aistudio.google.com/docs/google-search) documentation.
- Amazon, [“Retrieve data and generate AI responses with Amazon Bedrock Knowledge Bases”](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html).

## Related

- [RAG fundamentals](#rag-fundamentals)
- [Deep research systems](#deep-research)
- [Grounding and citations](#grounding-citations)
- [Production RAG](#production-rag)
- [Model APIs in practice](#model-apis)
