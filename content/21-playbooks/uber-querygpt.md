---
id: uber-querygpt
book: 21
order: "21.68"
title: "Uber QueryGPT: generating SQL from natural-language questions"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [text-to-sql, rag, agents, evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Mobility and delivery (internal data platform)"
use_case: "Generating SQL queries from natural-language questions for engineers, operations managers and data scientists who query Uber's data platform"
outcome: "In a limited release to some Operations and Support teams, averaging about 300 daily active users; about 78% said the generated queries reduced the time they would have spent writing them from scratch"
measured_how: "Daily active users and the share of users reporting time saved, limited release; no period, sample size or collection method stated (Uber Engineering blog, September 2024)"
prerequisites: [rag-fundamentals, in-context-learning]
replications: []
---
> [!tldr]
> Uber built QueryGPT to turn plain-language questions into SQL. When a simple retrieval and few-shot design lost accuracy as tables were added, the team narrowed the work with business-domain workspaces and separate LLM agents for intent, tables and columns. In a limited release it was "averaging about 300 daily active users", and hallucinated tables were not yet fully solved.

> [!note] From the public record
> Built from Uber's own published account, "QueryGPT – Natural Language to SQL Using Generative AI" (September 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Engineers, operations managers and data scientists at Uber use SQL daily. Writing queries needs "deep knowledge of how our internal data models represent business concepts." "At Uber, our data platform handles approximately 1.2 million interactive queries each month." The Operations organization accounts for "about 36% of these queries."

The post frames the value as time: "Given that each query can take around 10 minutes to author," QueryGPT, which can "generate reliable queries in just about 3 minutes," "represents a major productivity gain." The post does not say how either time was measured.

## Why this approach

QueryGPT "originated as a proposal during Uber’s Generative AI Hackdays in May 2023." The post does not describe other options the team considered. The redesign followed the first version's limits: simple similarity search between a question and schemas or SQL samples "doesn’t return relevant results", and the post calls finding the right schemas from a question "incredibly challenging". The fix was to narrow the problem first: "Picking a business domain allowed us to drastically narrow the search radius for RAG." See [RAG fundamentals](#rag-fundamentals).

## The approach

1. **The hackathon version** was "a fairly simple RAG". The question was vectorized and matched with k-nearest neighbor search against SQL samples and schemas "to fetch 3 relevant tables and 7 relevant SQL samples." These served as few-shot examples ([In-context learning and example design](#in-context-learning)), with Uber-specific instructions such as how to handle dates. "The first version used 7 tier 1 tables and 20 SQL queries as our sample data set."
2. **The current design** came after "about 20+ iterations of the algorithm". It works in steps:
   - **Workspaces:** "curated collections of SQL samples and tables tailored to specific business domains", such as Mobility and Ads. Besides Mobility, the team "also shipped 11 other system workspaces", and users can create custom ones.
   - **Intent agent:** maps each question "to one or more business domains/workspaces."
   - **Table agent:** an LLM agent picks the tables, added after some users found the picked tables were not correct. The user accepts the list ("Looks Good") or edits it.
   - **Column prune agent:** an LLM call removes irrelevant columns from the schemas.
   - **Generation:** schemas, samples, the question and Uber-specific instructions go to the LLM with a system prompt, which returns a query and an explanation.
3. **Evaluation** uses golden question-to-SQL pairs, which "required manual upfront investment." A decoupled flow supplies the golden intent and datasets so each component can be scored on its own. Signals include intent accuracy, table overlap, whether the query runs and returns more than 0 records, and similarity to the golden SQL: "We use an LLM to assign a similarity score between 0 and 1." See [LLM-as-judge done right](#llm-as-judge).

## The stack

As of September 2024: "We were using the OpenAI GPT-4 Turbo model with 128K token limit (1106)". Earlier, "the largest available model (at the time) only supported 32K tokens". The post names no vector database product and does not say which model each agent uses.

## Results, and how they were measured

- **Adoption.** In a limited release "to some teams in Operations and Support", "we are averaging about 300 daily active users". No period is given.
- **Time saved.** The post reports "about 78% saying that the generated queries have reduced the amount of time" they would have spent writing them from scratch. It does not say who was asked, how, or how many answered.
- **Column pruning** "massively improved not just the token size and by extension the cost of each LLM call" and reduced latency. No numbers are given.
- **Evaluation.** Results appear only in charts. Because LLMs are non-deterministic, "we do not over-index decisions based on ~5% run-to-run changes in most metrics."

**Not measured:** the post states no production accuracy rate, no measurement behind the 10-minute and 3-minute figures, no costs, and no size for the golden set.

## What failed

- **Accuracy fell as the first version grew.** It "worked well for a small set of schemas and SQL samples," then "we started seeing declining accuracy in the generated queries."
- **Large schemas broke the token limit.** Some Tier 1 tables span "over 200 columns" and "could use up as much as 40-60K tokens in the request object." Under the 32K limit, "Having 3 or more of these tables would break the LLM call". Even GPT-4 Turbo left the team "still seeing token limit issues".
- **Hallucinations.** "we do see instances where the LLM would generate a query with tables that don’t exist". The team experimented with prompts, added a chat style mode and is looking to add a validation agent, "but this remains an area that we haven’t completely solved yet." See [Hallucination and factuality](#hallucination-factuality).
- **Thin questions.** Some were "a 5 word question (with typos)" needing joins across several tables. Relying only on them "caused issues with accuracy and reliability."
- **No single right answer.** The same question can be answered from different tables or in different styles.

## What the team would do differently

The post lists learnings rather than things it would redo:

- **Give each LLM call one narrow job.** The intent, table and column prune agents "each did an excellent job" "because they were asked to work on a single unit of work rather than a broad generalized task."
- **Enrich the question.** A prompt enhancer was needed to turn the user's question "into a more context-rich question" before it is sent to the LLM.
- **Choose the first users with care.** "The bar is high!" The team found it best "to target and test with the right persona(s)".

The post names handling large schemas and reducing hallucinations as challenges that persist.

The wiki's reading: the main move was to replace one broad retrieval step with narrow ones (domain, tables, columns), with a person checking the tables. Each step shrinks what the final call reads, which addresses both relevance and the token limit, though the post does not measure each step's effect. See [Context engineering](#context-engineering).

## Disclosure

None.

## Sources

- Jeffrey Johnson, Callie Busch and Abhi Khune (the author bios also list Pradeep Chakka), Uber, [“QueryGPT – Natural Language to SQL Using Generative AI”](https://www.uber.com/blog/query-gpt/), Uber Engineering blog, 19 September 2024.

## Related

- [About playbooks](#about-playbooks)
- [Data-analysis and notebook agents](#data-analysis-agents)
- [Structured and code retrieval](#structured-code-retrieval)
- [Evaluating agents](#evaluating-agents)
- [Hallucination and factuality](#hallucination-factuality)
