---
id: salesforce-text-to-sql
book: 21
order: "21.27"
title: "Salesforce Horizon Agent: text-to-SQL in Slack with consensus voting"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [text-to-sql, data-analysis, consensus-voting, regression-testing, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (internal infrastructure cost and capacity analytics)"
use_case: "A Slack assistant that turns internal teams' natural-language questions about cloud infrastructure cost, capacity and usage into SQL"
outcome: "Efficacy score (percentage of responses rated 4 or 5 out of 5) rose from 50% at launch to 80%; an average of one error per day since launch"
measured_how: "Share of responses rated 4 or 5 out of 5, with no rater, sample or dates stated; errors per day since launch, with error not defined (Salesforce Engineering blog, 21 April 2025)"
prerequisites: [data-analysis-agents]
replications: []
---
> [!tldr]
> Salesforce's Cloud Economics and Capacity Management (CECM) team built Horizon Agent, a Slack assistant that turns plain-language questions about internal infrastructure data into SQL. It generates ten candidate queries per prompt and returns the most reliable one, which raised its efficacy score "from 50% at launch to 80%". A benchmark scored by a separate LLM acting as a SQL judge decides which knowledge base updates go live.

> [!note] From the public record
> Built from Salesforce's own published accounts, "Bridging Natural Language and SQL with Generative AI" (April 2025) and "How We Built a Text-To-SQL AI Agent to Get Instant Answers From Our Data" (May 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

CECM serves internal stakeholders, named as "capacity planners, finance teams, service owners, and product managers". Salesforce's cloud infrastructure data is spread across "dozens of interrelated tables", which makes accurate SQL hard for non-technical users to write. Teams filed backlog tickets or escalated requests to engineers instead. The engineering blog says this "consumed hundreds of engineering hours each month"; the companion post says technologists spent "dozens of hours per week" on custom queries. Neither says how this was measured. Dashboards help, but they "rarely cover every question a user might have."

## Why this approach

Apart from the point about dashboards, the posts do not compare text-to-SQL with other designs. They explain two choices.

**The channel.** The team's internal users "live in Slack", so the team calls choosing it "an easy decision". An early local-only Streamlit prototype "didn’t get adopted". When an MVP shipped in Slack, people used it "even though the responses weren’t perfect", and their feedback guided where to invest.

**Consistency.** The engineering blog calls the non-deterministic behavior of LLMs the most complex challenge: "repeated queries often produced varying SQL outputs, which eroded trust and consistency." See [Nondeterminism and reproducible inference](#inference-nondeterminism).

## The approach

Putting the two posts together, a question moves through these steps. The posts do not say in which order voting and the pre-check run.

1. **Receive.** A user asks in Slack, and a Python microservice receives the message. In the post's example, an LLM first identifies it as a cost-related question.
2. **Enrich.** With [retrieval-augmented generation](#rag-fundamentals), the service adds business context from Fack, including instructions for valid SQL in the Trino dialect, and table documentation, sample queries and sample records from the Horizon Data Platform.
3. **Vote.** "Each prompt now generates ten candidate SQL queries". A scoring pipeline compares them with cosine similarity modeling and Levenshtein distance, filters out outliers and returns the most reliable query.
4. **Pre-check.** Every query is checked with "a simple EXPLAIN query", and errors go back to the agent for another attempt.
5. **Explain and run.** The user gets the SQL with an explanation. If they run it, Trino executes it against an Iceberg data lake, and the data comes back to Slack with an analysis.

Deployment uses "a dual-track system". The application code goes through CI/CD with static analysis, vulnerability scanning, unit tests and regression checks. The knowledge base is updated separately, without a full deployment. Each update first faces a pre-production benchmark of natural-language questions, "each paired with an expected SQL output". A separate LLM acting as a SQL judge checks schema coverage, filtering logic and column selection, and "Only knowledge base updates that pass the benchmark threshold are deployed." See [LLM-as-judge done right](#llm-as-judge) and [CI/CD for AI](#ci-cd-for-ai).

## The stack

As of April and May 2025, the posts name:

- **Interface:** Slack, with the app built on Bolt, Slack's Python framework, as a microservice in AWS.
- **Models:** LLMs reached through the Einstein Gateway, Salesforce's internal platform for LLM access, with "OpenAI’s GPT series" given as an example. No model version is named.
- **Context:** Fack, "an open-source tool created by Salesforce", and the Horizon Data Platform.
- **Data:** the Unified Intelligence Platform (UIP), powered by Salesforce's internal Trino implementation, and an Iceberg data lake.
- **Operations:** caching, retry and backoff logic, and monitoring with Grafana dashboards.

## Results, and how they were measured

- **Efficacy.** The voting approach "significantly increased the system’s efficacy score", defined as the percentage of responses rated 4 or 5 out of 5, "from 50% at launch to 80%". The post calls this "pivotal in transitioning from early access to general availability". The companion post puts the launch figure differently: "At launch we only had the correct response ~50% of the time."
- **Timeline.** "Horizon Agent entered Early Access in August of 2024, and achieved a GA release in January of 2025."
- **Load and reliability.** "The system currently supports around 50 monthly active users, with each session generating 10 to 20 LLM calls per query." Response times "remain within seconds", and "Since its launch, Horizon Agent has averaged only one error per day".
- **Speed of fixes.** Knowledge base updates often go live "in as little as 15 minutes".

**Not measured:** neither post says who rated responses, how many were rated, or when 80% was reached. What counts as an error is not defined. The benchmark's size and pass threshold are not given. Engineering hours before launch are not compared with hours after it.

## What failed

- **Inconsistent SQL.** Repeated questions gave different SQL. The companion post illustrates this, without measuring it: ask 10 times and "you might get 8 correct answers and 2 wrong ones".
- **Knowledge base regressions.** "Fixing one answer could inadvertently affect others." This led to the benchmark gate.
- **Refusals without explanation.** At first the agent did not explain itself and often said "I don’t know how to answer that." Later the team loosened its guardrails: the agent asked clarifying questions instead and explained the SQL it generated.
- **Changing language.** "Ambiguity in language is a major challenge", as new terms and acronyms keep appearing.
- **Raw data only.** "the lack of visual representation can make interpretation difficult". Automatic visualizations are the next major feature.

## What the team would do differently

The posts do not say what the team would redo. The companion post states lessons: meet users where they already work; be transparent, since explaining the SQL made answers "more trustworthy and less like a black box"; make knowledge base updates fast and regression-tested; and give the model more than one chance to generate a query.

The wiki's reading: voting targets inconsistency within one question, while the judge-scored benchmark targets regressions across questions after knowledge base changes. One does not replace the other.

## Disclosure

None.

## Sources

- Nick Gibson, Salesforce, [“Bridging Natural Language and SQL with Generative AI”](https://engineering.salesforce.com/bridging-natural-language-and-sql-with-generative-ai/), Salesforce Engineering blog (“Engineering Energizers” Q&A series), 21 April 2025.
- Nick Gibson, Salesforce, [“How We Built a Text-To-SQL AI Agent to Get Instant Answers From Our Data”](https://www.salesforce.com/blog/text-to-sql-agent/), Salesforce blog, 27 May 2025.

## Related

- [About playbooks](#about-playbooks)
- [Data-analysis and notebook agents](#data-analysis-agents)
- [LLM-as-judge done right](#llm-as-judge)
- [CI/CD for AI](#ci-cd-for-ai)
- [Nondeterminism and reproducible inference](#inference-nondeterminism)
