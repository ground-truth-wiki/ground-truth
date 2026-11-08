---
id: structured-code-retrieval
book: 6
order: "6.11"
title: Structured and code retrieval
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [text-to-sql, code-search, agentic-search]
visuals:
  - text-to-sql-stepper:stepper
  - code-search-compare:compare
  - structure-tree:tree
---
> [!tldr]
> Not all knowledge is prose. Tables and databases want text-to-SQL grounded in a semantic layer; small tables can go straight into context; code wants grep, symbol indexes and repository maps as much as embeddings. Agents that search iteratively often beat any single retrieval method on structured sources.

## Why it matters
Many of the questions people ask an assistant are about numbers, records and code: “which customers churned last quarter?”, “where do we retry failed payments?”. Chunking a database export or a repository into prose and embedding it answers these badly. The right retrieval method for structured data is usually a query language or a search tool, with the model writing the query.

## Intuition
To find a sentence in a novel, you skim. To find last month’s sales, you ask the accountant to run a report. To find where a function is called, you search for its name. Retrieval should match the shape of the source.

```viz
{"id":"text-to-sql-stepper","component":"stepper","title":"Good text-to-SQL is retrieval of the schema and the business definitions, then a query that is checked before it runs","caption":"Step through one question. The semantic layer, not the model’s guess, decides what “legacy plan” and “last month” mean. Illustrative schema and SQL for Postgres.","alt":"Stepper of a text-to-SQL pipeline: question, schema retrieval, semantic layer lookup, SQL generation, validation and execution.","data":"illustrative","frames":[
{"label":"Question","caption":"A user asks a question that needs three tables and two business definitions.","panel":"“Which customers on the legacy plan opened more than three outage tickets last month?”"},
{"label":"Find tables","caption":"Retrieve the relevant tables and column descriptions instead of sending the whole schema.","code":"customers(id, name, region)\nsubscriptions(customer_id, plan_id, started_at)\ntickets(id, customer_id, category, created_at)"},
{"label":"Semantic layer","caption":"Look up the agreed definitions of business terms, so the model does not invent them.","code":"legacy plan    = plan_id IN ('basic-2019', 'pro-2019')\noutage ticket  = tickets.category = 'outage'\nlast month     = the previous calendar month"},
{"label":"Generate","caption":"The model writes SQL from the question, the tables and the definitions.","code":"SELECT c.name, COUNT(*) AS outage_tickets\nFROM customers c\nJOIN tickets t ON t.customer_id = c.id\nWHERE t.category = 'outage'\n  AND t.created_at >= date_trunc('month', now()) - interval '1 month'\n  AND t.created_at <  date_trunc('month', now())\n  AND EXISTS (SELECT 1 FROM subscriptions s\n              WHERE s.customer_id = c.id\n                AND s.plan_id IN ('basic-2019', 'pro-2019'))\nGROUP BY c.name\nHAVING COUNT(*) > 3\nORDER BY outage_tickets DESC\nLIMIT 100;"},
{"label":"Validate","caption":"Before running: a read-only connection, allowed tables only, a row limit, and an EXPLAIN cost check. Reject anything else and return the error to the model.","panel":"Checks pass: SELECT only, 3 allowed tables, LIMIT present, estimated cost under the threshold."},
{"label":"Answer","caption":"Run it, answer in plain language, and show the SQL so the user can verify the logic.","panel":"7 customers. Northwind Traders had the most, with 9 outage tickets. Show query."}]}
```

## How it works
**Text-to-SQL.** The model translates a question into SQL against a schema. Quality depends far more on context than on the model: table and column descriptions, example queries, sample values, and join paths. For large schemas, retrieve the relevant tables first rather than sending everything. Benchmarks such as Spider (Yu et al., 2018) and BIRD track progress, but your schema’s naming conventions matter most.

**Semantic layers.** A layer of agreed definitions (metrics, dimensions, business terms) between the question and the database. “Active customer” or “net revenue” should mean one thing, defined once, not whatever the model infers. Many BI tools provide one; a curated YAML file of definitions works too.

**Safety.** Run generated SQL on a read-only replica with a restricted role, allow only SELECT, cap rows and runtime, and check the plan’s cost. Never interpolate user text into SQL by hand.

**Tabular QA.** Small tables can go directly into the context as Markdown or CSV; models read them well. Large ones need querying or code execution. See [research and analyst agents](#research-analyst-agents).

**Code search.** Three complementary tools:
- **Lexical search** (grep, ripgrep) for exact identifiers, error strings and config keys.
- **Symbol and structure indexes** (an AST-based index or language server) for definitions, references and call graphs; **repository maps** summarize files and their key symbols for the model.
- **Embeddings** for intent (“where do we handle retries?”), useful as one signal among several.

**Agentic search.** Coding agents typically search, read, follow references and search again, the way a developer does. On code this often beats any single-shot retrieval, because each step uses what the last one found. See [coding agents](#coding-agents).

## In practice
```viz
{"id":"code-search-compare","component":"compare","title":"Embedding search finds documents about the topic; agentic grep finds the code that does it","caption":"Illustrative results for “where do we retry failed payments?”. Hover the marks.","alt":"Comparison of embedding search and agentic grep for locating payment retry logic in a codebase.","data":"illustrative","a":{"title":"Embedding search (one shot)","text":"1. docs/payments.md: 'Failed payments are\n   retried automatically...'\n2. CHANGELOG.md: 'Improve retry logic'\n3. src/payments/README.md\n(no code locations)"},"b":{"title":"Agentic search (iterative)","text":"$ rg -n 'retry' src/payments\n  worker.py:88  schedule_retry(charge, ...)\n$ read worker.py 70-110\n  -> calls retry_policy.next_delay()\n$ rg -n 'def next_delay' src\n  policy.py:12  def next_delay(attempt):\n  -> exponential backoff, max 5 attempts"},"links":[{"a":"docs/payments.md: 'Failed payments are\n   retried automatically...'","b":"worker.py:88  schedule_retry(charge, ...)","note":"Embeddings match prose about the topic; grep finds the call site."},{"a":"(no code locations)","b":"policy.py:12  def next_delay(attempt):","note":"Following references leads to the actual policy, which one-shot retrieval cannot do."},{"b":"exponential backoff, max 5 attempts","note":"The answer comes from reading the code, not from a summary of it."}]}
```

```viz
{"id":"structure-tree","component":"tree","title":"The shape of the source picks the retrieval method","caption":"Expand by source type. Mixed systems route each question to the right method, often through tools an agent can choose.","alt":"Decision tree mapping source types to retrieval methods: text-to-SQL, in-context tables, code search and API tools.","data":"illustrative","open":1,"root":{"label":"Where does the answer live?","children":[
{"label":"A relational database","children":[{"label":"Text-to-SQL with retrieved schema, a semantic layer and a read-only role"}]},
{"label":"A small table or spreadsheet","children":[{"label":"Put it in context as Markdown or CSV, or load it in a code sandbox","link":"#research-analyst-agents"}]},
{"label":"A codebase","children":[{"label":"Grep plus symbol search, driven by an agent; embeddings as an extra signal","link":"#coding-agents"}]},
{"label":"An application with an API","children":[{"label":"Expose the API as tools or an MCP server","link":"#mcp-primitives"}]},
{"label":"Prose documents","children":[{"label":"Classic RAG: hybrid search and reranking","link":"#rag-fundamentals"}]}]}}
```

## Numbers to know
> [!number]
> Rules of thumb. Send the model a handful of relevant tables with descriptions, not the whole schema. Cap generated queries with a row limit and a timeout. A repository map of file names and key symbols typically costs a few thousand tokens for a medium codebase.

## Pitfalls and anti-patterns
> [!pitfall] Letting the model guess business definitions
> “Active customer” defined differently in each answer produces numbers that disagree. Put definitions in a semantic layer the model must use.

- **Write access for generated SQL.** Use a read-only role on a replica.
- **Embedding a database export.** Rows as prose lose the structure that makes them queryable.
- **Embeddings-only code search.** Exact identifiers need lexical search.

## Talk like an expert
The vocabulary: **text-to-SQL**, **schema linking**, **semantic layer**, **read-only role**, **tabular QA**, **repository map**, **symbol index**, **agentic search**. Experts ask “what is the source’s native query language?” before reaching for embeddings. The live debate is how far agents with code execution make dedicated text-to-SQL pipelines unnecessary.

> [!hottake] For code, grep plus a good agent beats any embedding index.
> **The counterargument:** in very large or unfamiliar codebases, semantic search over code and docs finds starting points that grep cannot, because the developer does not yet know the right identifiers to search for.

## Check yourself
```quiz
structured-code-retrieval
```

## Go deeper
- Yu et al., “Spider: A Large-Scale Human-Labeled Dataset for Complex and Cross-Domain Semantic Parsing and Text-to-SQL Task” (2018).
- The BIRD text-to-SQL benchmark and its leaderboard, read with dates.

## Related
- [Coding agents](#coding-agents)
- [Research and analyst agents](#research-analyst-agents)
- [Advanced RAG architectures](#advanced-rag)
- [Structured outputs](#structured-outputs)
- [RAG fundamentals](#rag-fundamentals)
- [Knowledge graphs and ontologies](#knowledge-graphs)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Data-analysis and notebook agents](#data-analysis-agents)
