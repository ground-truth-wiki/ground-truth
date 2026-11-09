---
id: digital-green-farmer-chat
book: 21
order: "21.108"
title: "Farmer.Chat: answering smallholder farmers' questions in Kenya"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [agriculture, rag, multilingual, chat-assistants, public-record]
visuals: []
type: playbook
account: public-record
industry: "Agriculture (smallholder farming and extension services, Kenya)"
use_case: "A multilingual chatbot on messaging apps that answers farmers' and extension agents' questions from a knowledge base of vetted agricultural content"
outcome: "Close to 75% of user questions answered; high faithfulness for nearly 80% of queries; average response time 9.05 seconds"
measured_how: "Answer rate, GPT-4 classification of unanswered queries and RAGAS scores in a paper focused on the Kenya deployment (8,805 users since October 2023; sample and period of the analysis not stated), plus focus groups and phone surveys (Digital Green, arXiv, September 2024)"
prerequisites: [rag-fundamentals, multilingual-models]
replications: []
---
> [!tldr]
> Digital Green built Farmer.Chat, a chatbot that answers farming questions in local languages from vetted agricultural content, and deployed it in four countries. Its paper, focused on Kenya, reports that "the platform successfully answers close to 75% of user questions" and "maintains high faithfulness for nearly 80% of queries". The team's analysis puts 66% of unanswered queries down to content gaps.

> [!note] From the public record
> Built from Digital Green's own published account, "Farmer.Chat: Scaling AI-Powered Agricultural Services for Smallholder Farmers" (September 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In the paper's words, "traditional services depend on extension agents who face challenges in delivering timely, tailored advice". In Kenya, its introduction says, extension agents face farmer-to-agent ratios ranging from 1:1,000 to 1:5,000. Its related-work section gives a different range: "estimated at 1:1000" and "as high as 1:4,000". The paper focuses on "our Kenya deployment, started in October 2023, which now has the largest user base of 8,805 users across seven counties." It sorts these users into four groups: extension agents, lead farmers, farmers and agripreneurs.

## Why this approach

Rule-based chatbots, the paper says, "struggle with complex, dynamic queries that require context-awareness". With retrieval-augmented generation, it adds, LLMs can process unstructured data such as documents, crop tables and videos (see [RAG fundamentals](#rag-fundamentals)).

On language, the team's evaluations showed that "generating responses directly in the source language results in poorer performance" compared to translating the query into English and the response back. The paper mentions tests of "different configurations of chunking, embeddings, and LLMs" but does not describe them or other architectures considered.

## The approach

1. **Knowledge base.** A builder ingests content "from numerous expert vetted sources", such as research papers, crop guidelines, training manuals and YouTube videos. Content is summarized, categorized, tagged, split by semantic chunking and converted into vector embeddings. The paper does not detail the vetting, but says Farmer.Chat "now prioritizes content verification and endorsements from credible authorities".
2. **Query pipeline.** The system first identifies the user's intent and routes the query. Farming questions are rephrased based on chat history and split into smaller queries. Retrieved snippets are classified and ranked, and an LLM writes the answer. A planning agent picks the data sources or tools for each query.
3. **Language and voice.** Queries are translated for processing. Farmers can send voice notes and receive audio replies.
4. **Changes from user research.** Because many users struggled to write follow-up questions, in February 2024 the team added clickable follow-up questions after an initial answer. It also added starter prompts tailored to users' locations and short video tutorials.

## The stack

As of the paper (September 2024, revised October 2024): "The system relies on a mix of GPT-4 for filtering and re-ranking and GPT-3.5 for other tasks." Embeddings come from a custom model; no vector store is named. Translation uses Google Translate APIs. For translation, speech recognition and text-to-speech, the pipeline is "configurable with Google Translate, Whisper, or equivalent systems". Farmer.Chat was first launched on Telegram in Kenya in October 2023; the paper also names WhatsApp and a standalone mobile app. Weather forecasts come from TomorrowIO and disease diagnostics from Plantix.

## Results, and how they were measured

Across Kenya, India, Ethiopia and Nigeria, "Farmer.Chat engages over 15,000 farmers and has addressed more than 300,000 queries." For Kenya: "With a total of 225,500+ queries processed, users averaged 28.92 queries each".

- **Answer rate.** "the platform successfully answers close to 75% of user questions." The introduction puts it as "over 75% of queries successfully answered".
- **Why questions went unanswered.** The team classified unanswered questions with GPT4. "Our analysis shows that 66% of unanswered queries are due to content gaps (Out of Content)", while "23% are Out of Context, and 11% are Out of Collection". Out of Collection means unsupported crops or value chains.
- **Answer quality.** RAGAS scores were grouped as high (above 0.7), medium (0.3 to 0.7) and low (below 0.3). "Farmer.Chat maintains high faithfulness for nearly 80% of queries", with medium and low at about 10% each. "Similarly, 67% of responses are highly relevant, with medium and low relevance at 15% and 18%, respectively." The team says it validated RAGAS against human evaluation with "an internal analysis of 1,000 queries from Farmer.Chat". See [Evaluating RAG](#rag-evaluation).
- **Speed.** "The average response time in Farmer.Chat is 9.05 seconds". Most of the time goes to reranking (3.15 seconds) and generation (2.71 seconds). See [Latency and throughput](#latency-throughput).
- **Engagement.** The follow-up questions were "contributing to over 45% of total interactions during peak periods".
- **Safety.** The team checked toxicity, polarity and hurtful sentences (the HONEST metric). It reports that "there were no instances of toxic or hurtful content detected in the outputs", and attributes this to limiting responses to approved documents and agriculture-specific queries. No separate polarity result is given. Gender experts scored answers to 60 red-teaming questions: 20/20, 20/20 and 19/20 across three categories. See [Safety and red-team evals](#safety-evals).
- **User studies.** Focus groups in January 2024 involved 199 users. In the first of two phone survey rounds of 20 participants each: "8 extremely satisfied, 8 satisfied, 1 neutral, and 3 dissatisfied."

**Not measured:** the paper gives no definition of an answered question and no sample or period for the answer rate, the RAGAS scores or the toxicity check. It reports no baseline against extension agents or earlier chatbots, no cost per query, and no measured change in yields, incomes or farming practices beyond what users said in interviews, focus groups and phone surveys.

## What failed

- **Content gaps.** Missing content caused most unanswered questions. In the second phone survey round, users asked for more content and "guaranteed responses".
- **Dialects.** "Current translation models struggle with local dialects, limiting accuracy in low-resource languages." See [Multilingual and low-resource language models](#multilingual-models).
- **Gender-based violence.** In red teaming, "it showed gaps in responding to GBV-related inquiries, where its performance was inadequate."
- **Users who struggled.** "users with lower digital literacy struggled to phrase their questions in a way the bot could understand", and "some users remained skeptical, especially when the advice differed from their previous knowledge."

## What the team would do differently

The paper states future work rather than a retrospective. "Future efforts must focus on AI systems that are culturally and linguistically sensitive", and red teaming should expand across geographies. The last sentence of its conclusion begins: "Ongoing iterations based on user feedback will refine the platform".

The wiki's reading: with 66% of unanswered queries traced to content gaps, the knowledge base, not the model, looks like the main limit on the answer rate.

## Disclosure

None.

## Sources

- Namita Singh, Jacqueline Wang'ombe, Nereah Okanga, Tetyana Zelenska, Jona Repishti, Jayasankar G K, Sanjeev Mishra, Rajsekar Manokaran, Vineet Singh, Mohammed Irfan Rafiq, Rikin Gandhi (Digital Green, India) and Akshay Nambi (Microsoft Research, India), [“Farmer.Chat: Scaling AI-Powered Agricultural Services for Smallholder Farmers”](https://arxiv.org/abs/2409.08916), arXiv:2409.08916, version 1 submitted 13 September 2024, version 2 8 October 2024.

## Related

- [About playbooks](#about-playbooks)
- [Evaluating RAG](#rag-evaluation)
- [Multilingual and low-resource language models](#multilingual-models)
- [Production RAG](#production-rag)
- [Safety and red-team evals](#safety-evals)
