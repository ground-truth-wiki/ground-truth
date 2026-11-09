---
id: linkedin-sql-bot
book: 21
order: "21.72"
title: "LinkedIn's SQL Bot: text-to-SQL over an enterprise data lake"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [text-to-sql, knowledge-graphs, data-analytics, multi-agent, public-record]
visuals: []
type: playbook
account: public-record
industry: "Online services (professional network), internal data analytics"
use_case: "An internal chatbot that finds tables, writes Trino SQL queries and fixes failing queries for employees who ask in natural language"
outcome: "53% of responses rated correct or close to correct (4 or 5 on a 1 to 5 scale) by experts on an internal benchmark; over 300 weekly active users since July 2024"
measured_how: "Expert ratings for 124 of 133 benchmark questions across 10 product areas on the production version, ablations scored by LLM-as-a-judge in a single run per configuration, usage data and a user survey without stated sample size (LinkedIn, arXiv paper, July 2025)"
prerequisites: [data-analysis-agents]
replications: []
---
> [!tldr]
> LinkedIn built SQL Bot, a multi-agent chatbot in its DARWIN data science platform that finds tables, writes Trino SQL and fixes failing queries. The team's paper reports that "53% of its responses are correct or close to correct on an internal benchmark set" and over 300 weekly active users. Its ablations credit the knowledge graph, more than the modeling steps, with answer quality.

> [!note] From the public record
> Built from LinkedIn's own published accounts, "Text-to-SQL for Enterprise Data Analytics" (July 2025) and "Practical text-to-SQL for data analytics" (December 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The blog opens: "In most tech companies, data experts spend a significant amount of their time helping colleagues find data they need". The paper aims to make data insights accessible to any employee, with a focus on "SQL novices who have familiarity with business intelligence charts but little-to-no familiarity with the raw data".

In the paper, the data lake "contains millions of tables, with some popular tables having over 100 columns." Tables are regularly deprecated and many overlap, and click-through rate means different things in notifications and in search.

## Why this approach

The paper notes fast progress on public benchmarks such as Spider and BIRD, but "such rapid progress does not immediately translate to enterprise settings." Its approach combines a [knowledge graph](#knowledge-graphs), a query-writing agent and an interactive chatbot.

The paper names one constraint: "we do not have data access to run queries and need to return responses to users quickly." So candidate queries could not be compared by running them. For evaluation, the blog calls human evaluation plus an LLM judge "more practical for us than running SQL queries and comparing outputs".

## The approach

1. **Knowledge graph.** Tables are the central nodes, enriched from DataHub metadata, query logs, wikis, code and domain knowledge from users. Domain experts described "hundreds of important tables".
2. **Personal defaults.** Independent Component Analysis over three months of user-table access counts clusters tables, giving each user and product area a default set.
3. **Query Writer Agent.** It retrieves context, ranks it, writes the query and fixes it. The blog describes taking the top 20 tables from embedding-based retrieval and an LLM re-ranker "to select the top 7 tables for query writing". Validators run Trino EXPLAIN and check that tables and columns exist; a Researcher LLM Agent can search for a table similar to a hallucinated one.
4. **Several agents.** After launch, users wanted a general data assistant, so an intent classifier routes each question to a Query Writer, Data Finder, Query Fixer or Question Answering agent. See [Multi-agent orchestration patterns](#multi-agent-patterns).
5. **In the workflow.** SQL Bot sits beside DARWIN's SQL editor, with a "Fix with AI" button that appears when a query fails, and shows validation checks, an explanation and assumptions to verify.

## The stack

As of July 2025, for the paper's benchmark runs: gpt-4o-mini-2024-07-18 for the Researcher LLM and gpt-4o-2024-05-13 for the other LLMs, through the Azure OpenAI Service; E5-large-v2 and text-embedding-ada-002 for embeddings; LangChain for the agent (the blog adds LangGraph); DataHub for metadata; Trino as the SQL engine.

## Results, and how they were measured

The benchmark: "In total, we collected 133 questions across 10 product areas and 167 ground truth tables." Answers are scored from 1 (completely wrong) to 5 (correct).

- **Expert review.** Experts rated the production version on 124 of 133 questions. "53% were rated 4 or 5 (minor issues or correct)." and "77% were rated 3+ (helpful for identifying tables and columns)."
- **Ablations,** scored by an LLM judge: "Knowledge graph components improve the % of answers scoring 4+ (correct or close to correct) from 9%" with schemas only to 48% with all components. Modeling components "reduced schema hallucination from 23% to 1%, compilation errors from 34% to 4%", but "there are minimal improvements in score."
- **Speed.** The full configuration "runs in under 60 seconds per question on average."
- **Usage.** "Our chatbot has been available in the querying platform since July 2024 with steady usage of over 300 weekly active users." "33% of chat sessions lead to code pasted from the chatbot into the SQL editor."
- **Survey.** In the paper, 39% of users rated its queries "Very good" or "Excellent", and 95% at least "Passes".
- **From the blog.** Moving into DARWIN "increased adoption by 5-10x compared to our prototype chatbot application launched as a standalone app." "Fix with AI" was "accounting for 80% of our sessions". The LLM judge "returns a score within 1 point of the human score 75% of the time".

**Not measured:** each ablation was a single run, so there is no variance estimate. Neither source gives the survey's sample size or date, the period behind the adoption comparison, costs, or time saved.

## What failed

- **SQL for everything.** The first prototype answered every question with a query, but users "actually wanted to find tables, ask questions about the datasets, see reference queries, or ask general questions about query syntax".
- **One answer per question.** Many benchmark questions have several valid answers. "Without these additional answers, we underreported recall by 10-15%."
- **Query planning.** The blog found plan-based writing "can result in overly complicated queries for simple questions", so the planner was told to minimize steps. The paper's negative results add: "On our benchmark, the query planner lowered recall and quality metrics."
- **Domain knowledge.** "Surprisingly, adding domain knowledge decreases the percentage of answers scoring 4+".
- **Wrong filters.** In the expert review, "The most common issue was ‘Filter is incorrect’ (24%)." Hallucination checks cover tables and columns; invalid column values are left to future work.

## What the team would do differently

The blog's takeaway is that "Fix with AI" "was easy to develop but has very high usage", and "Identifying high-ROI pain points like this is a good place to start the text-to-SQL journey." The paper calls the knowledge graph "a better lever to improve semantic understanding" than modeling components, which must still use it adequately. Next steps in the blog include faster responses, showing the context used, and learning from user interactions.

The wiki's reading: validators fixed what a database can check, while whether a query means the right thing moved with the knowledge graph. Tracking only compilation success would hide errors such as wrong filters. See [Error analysis first](#error-analysis) and [LLM-as-judge done right](#llm-as-judge).

## Disclosure

None.

## Sources

- Albert Chen, Manas Bundele, Gaurav Ahlawat, Patrick Stetz, Zhitao Wang, Qiang Fei, Donghoon Jung, Audrey Chu, Bharadwaj Jayaraman, Ayushi Panth, Yatin Arora, Sourav Jain, Renjith Varma, Alexey Ilin, Iuliia Melnychuk, Chelsea Chueh, Joyan Sil and Xiaofeng Wang, LinkedIn, [“Text-to-SQL for Enterprise Data Analytics”](https://arxiv.org/html/2507.14372v1), arXiv:2507.14372v1, 18 July 2025; Workshop on Agentic AI for Enterprise at KDD ’25, 4 August 2025, Toronto.
- Albert Chen, Manas Bundele, Gaurav Ahlawat, Patrick Stetz, Zhitao W., Qiang Fei, Don Jung, Audrey Chu, Bharadwaj Jayaraman, Ayushi Panth, Yatin Arora, Sourav Jain, Renjith Varma, Alex Ilin, Iuliia Melnychuk, Chelsea C., Joyan Sil and Xiaofeng Wang, LinkedIn, [“Practical text-to-SQL for data analytics”](https://www.linkedin.com/blog/engineering/ai/practical-text-to-sql-for-data-analytics), LinkedIn Engineering Blog, 9 December 2024.

## Related

- [About playbooks](#about-playbooks)
- [Data-analysis and notebook agents](#data-analysis-agents)
- [Knowledge graphs and ontologies](#knowledge-graphs)
- [LLM-as-judge done right](#llm-as-judge)
- [Building eval datasets](#eval-datasets)
