---
id: rag-security
book: 6
order: "6.15.1"
title: "RAG security: poisoning, inversion and leakage"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [rag-security, data-poisoning, embedding-inversion, membership-inference, access-control]
visuals: []
prerequisites: [production-rag, prompt-injection]
---
> [!tldr]
> In a RAG system, the corpus, the index and the vectors are attack surface: whoever can write a document can steer answers, whoever can query the index can probe what it holds, and whoever steals the vectors can recover much of the text. OWASP files these risks as Vector and Embedding Weaknesses (LLM09 in its 2026 list, LLM08 in 2025). Remember two rules: enforce permissions inside the retrieval query, and protect embeddings like the documents they came from.

## Key ideas

- **The OWASP category.** As of November 2026, the OWASP Top 10 for LLM Applications lists Vector and Embedding Weaknesses as LLM09:2026 (it was LLM08:2025); the 2026 entry covers RAG, vector-backed agent memory, semantic caches and deduplication, and sums the risks up as “poisoning makes the system wrong, inversion makes it leak, jamming makes it silent, and access-control failure makes it indiscriminate” ([OWASP, LLM09:2026 Vector and Embedding Weaknesses](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM09_VectorAndEmbeddingWeaknesses.md), [LLM08:2025](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/)). Indirect injection through retrieved text is filed under [prompt injection](#prompt-injection) (LLM01:2026) but arrives through the same pipeline ([OWASP LLM09:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM09_VectorAndEmbeddingWeaknesses.md)): the 2025 entry's example is a job application with hidden white-on-white instructions that a RAG screening system follows ([OWASP LLM08:2025](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/)).
- **Permission and tenant leaks.** Filter by the caller's identity inside the index query, not after retrieval: the 2026 entry calls a client-supplied scope “a suggestion, not a control”, asks for access control per chunk, and warns that timing, result counts and gaps in score distributions reveal that another tenant's documents exist, and roughly what they are about, when a shared search runs before the filter ([OWASP LLM09:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM09_VectorAndEmbeddingWeaknesses.md)). Azure AI Search's security filter pattern makes the division of labor explicit: the principal is only a string in a filter, with “no authentication or authorization through the security principal”, so the application must establish who is asking and apply the filter to every query ([Azure AI Search, “Security filter pattern”](https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search)).
- **Corpus poisoning.** PoisonedRAG reached a 90% attack success rate by injecting five malicious texts per target question into a knowledge database of millions of texts, and the defenses it evaluated were insufficient ([Zou et al., “PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation of Large Language Models” (2024)](https://arxiv.org/abs/2402.07867)); against dense retrievers alone, 50 adversarial passages optimized on Natural Questions misled retrieval for over 94% of questions about financial documents or online forums ([Zhong et al., “Poisoning Retrieval Corpora by Injecting Adversarial Passages” (2023)](https://arxiv.org/abs/2310.19156)). Every public source you crawl is a corpus an attacker can write to, and a single “blocker” document can also make the system refuse to answer, which OWASP calls retrieval jamming ([OWASP LLM09:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM09_VectorAndEmbeddingWeaknesses.md)).
- **Embeddings are sensitive data.** Vec2Text recovered 92% of 32-token inputs exactly from their embeddings, and recovered full names from a dataset of clinical notes ([Morris et al., “Text Embeddings Reveal (Almost) As Much As Text” (2023)](https://arxiv.org/abs/2310.06816)). OWASP's 2026 entry adds that newer inversion methods work zero-shot, without training for a specific encoder, and says a leaked vector store or backup should be treated as a leak of the source documents ([OWASP LLM09:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM09_VectorAndEmbeddingWeaknesses.md)).
- **Membership inference and extraction.** A crafted prompt can reveal whether a given passage is in a RAG system's retrieval database, and an instruction added to the RAG template was highly effective only for some datasets and models ([Anderson et al., “Is My Data in Your Retrieval Database? Membership Inference Attacks Against Retrieval Augmented Generation” (2024)](https://arxiv.org/abs/2405.20446)); other attacks make a RAG system leak data from its private retrieval database ([Zeng et al., “The Good and The Bad: Exploring Privacy Issues in Retrieval-Augmented Generation (RAG)” (2024)](https://arxiv.org/abs/2402.16893)). An API that returns raw similarity scores is a membership oracle even without an LLM in the loop ([OWASP LLM09:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM09_VectorAndEmbeddingWeaknesses.md)).
- **Defenses along the retrieval path.** OWASP's 2026 mitigations include provenance for every embedding (source, ingestion time, trust tier, pipeline version), stripping zero-width characters, white-on-white text and homoglyphs before embedding, no shared index for content of different trust tiers without hard isolation, flagging new vectors that sit close to many common queries, not returning raw scores, encrypting embeddings at rest, deleting embeddings when their source is deleted, and immutable logs of tenant scope, query, returned ids and scores ([OWASP LLM09:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM09_VectorAndEmbeddingWeaknesses.md)). Add [grounding checks](#grounding-citations) on the answers, and turn each attack class into a test case that targets the retrieval path, not only the prompt.

## Planned visuals

- **`diagram`:** a RAG data flow with trust boundaries (sources, ingestion, embedding, vector store, permission-filtered query service, model), with each attack attached where it enters: poisoning and hidden instructions at ingestion, cross-tenant probing and membership inference at the query service, inversion at the vector store and its backups.
- **`stepper`:** a poisoning attack end to end: the attacker publishes passages, ingestion embeds them, a target question retrieves them into the top k, and the model repeats the planted answer; later frames switch on provenance, trust-tier indexes and anomaly flags and show where each one stops the attack.
- **`compare`:** filtering after a shared search versus filtering inside the query, on the same index, highlighting what an attacker can observe in each case: result counts, scores and timing.

## Talk like an expert

Experts talk about **corpus poisoning**, **retrieval jamming**, **embedding inversion**, **membership inference**, **security trimming**, **tenant isolation** and **trust tiers**, and they ask who can write to the corpus and who can query the index before they ask about the model. They classify a vector store like the documents it was built from ([Privacy](#privacy)) and draw it as a trust boundary in the [threat model](#threat-modeling).

## Go deeper

- OWASP GenAI Security Project, [“LLM09:2026 Vector and Embedding Weaknesses”](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM09_VectorAndEmbeddingWeaknesses.md) (August 2026).
- Zou et al., [“PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation of Large Language Models”](https://arxiv.org/abs/2402.07867) (2024).
- Morris et al., [“Text Embeddings Reveal (Almost) As Much As Text”](https://arxiv.org/abs/2310.06816) (2023).
- Microsoft Learn, [“Security filter pattern” for Azure AI Search](https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search).

## Related

- [Production RAG](#production-rag)
- [Prompt injection](#prompt-injection)
- [Threat modeling LLM apps and agents](#threat-modeling)
- [Privacy](#privacy)
- [Supply chain and model security](#supply-chain-security)
- [Grounding and citations](#grounding-citations)
