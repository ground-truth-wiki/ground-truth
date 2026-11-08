---
id: data-pipeline-orchestration
book: 7
order: "7.5.1"
title: Pipeline orchestration and processing engines
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [orchestration, etl, airflow, dagster, spark, ray-data]
visuals: []
prerequisites: [unstructured-pipelines]
---
> [!tldr]
> An orchestrator decides when each step of a data pipeline runs, in what order, and what happens when one fails. A processing engine does the work, on one laptop or a GPU cluster. AI pipelines are ordinary data engineering with expensive model calls inside, so the one thing to remember is that every step must be safe to run twice, because retries and backfills will run it twice.

## Key ideas

- **ETL or ELT: where the transformation runs.** ETL transforms data on a separate processing server before loading it, while ELT loads raw data into the target system first and transforms it there, and also handles unstructured data such as images and documents ([AWS, “ETL vs ELT”](https://aws.amazon.com/compare/the-difference-between-etl-and-elt/)). Medallion layers name the stages: bronze lands raw source data as an archive for lineage, auditing and reprocessing, silver matches, merges and cleanses it, and gold holds consumption-ready tables ([Databricks, “Medallion architecture”](https://www.databricks.com/glossary/medallion-architecture)).
- **Tasks or assets: two ways to draw the graph.** In Airflow, a Dag holds everything needed to run a workflow (its schedule, tasks and dependencies) but not what the tasks compute, and each execution is a Dag run ([Airflow, “Dags”](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html)). Dagster starts from the data instead: an asset is an object in persistent storage, such as a table, a file or a model, and its asset definition says in code how to produce it and already knows its dependencies, so the graph is one of data products rather than of steps ([Dagster, “Assets”](https://dagster.io/docs/guides/build/assets)).
- **Time windows, backfills and safe retries.** Each Airflow Dag run owns a data interval, the time range it processes; a backfill runs the Dag for a past period, and catchup, which creates runs for schedule times missed since the last run, is off by default as of November 2026 ([Airflow, “Dag Runs”](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html)). Because a failed task can be retried, Airflow asks for tasks that produce the same outcome on every re-run: upsert instead of insert, read a fixed partition such as `data_interval_start` instead of “the latest data”, and keep the current time out of critical logic ([Airflow, “Best practices”](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)). Spark Structured Streaming reaches end-to-end exactly-once semantics the same way, by combining replayable sources, checkpoints and write-ahead logs with idempotent sinks ([Spark, “Structured Streaming”](https://spark.apache.org/docs/latest/streaming/getting-started.html)).
- **Pick the engine by data size and hardware.** DuckDB runs inside your process, with no server, on a columnar-vectorized engine built for analytical queries ([DuckDB, “Why DuckDB”](https://duckdb.org/why_duckdb)), and Polars is a Rust DataFrame library with a query optimizer and a streaming API for data larger than memory ([Polars](https://docs.pola.rs/)). Spark runs data engineering, data science and ML in batch and streaming on one machine or a cluster ([Apache Spark](https://spark.apache.org/)). Ray Data streams data between CPU preprocessing and GPU inference, and its `ray.data.llm` module runs vLLM or SGLang engines for batch text generation and can also compute embeddings ([Ray Data](https://docs.ray.io/en/latest/data/data.html); [Ray Data, “Working with LLMs”](https://docs.ray.io/en/latest/data/working-with-llms.html)). For LLM-scale text curation, DataTrove packages filtering and deduplication as pipeline blocks ([DataTrove](https://github.com/huggingface/datatrove)), and NeMo Curator runs exact, fuzzy and semantic deduplication on GPUs ([NeMo Curator](https://docs.nvidia.com/nemo/curator/latest/curate-text/process-data/deduplication/index.html)).
- **Stage boundaries are team boundaries.** Each handoff between stages is where a [data contract](#data-validation-drift) and its checks belong, and who owns each side is an organizational choice. A central data team cleans and certifies data for everyone, while Dehghani's data mesh moves ownership to the business domains, treats data as a product, and relies on a self-serve platform and federated computational governance (Dehghani, [“Data Mesh Principles and Logical Architecture”](https://martinfowler.com/articles/data-mesh-principles.html) (2020)).
- **Meter the AI steps.** Give every model call inside a pipeline its own cost, throughput and failure metrics, and batch it when nobody waits for the answer: as of November 2026, Anthropic's Message Batches API cuts costs by 50% and finishes most batches in under an hour ([Anthropic, “Batch processing”](https://platform.claude.com/docs/en/build-with-claude/batch-processing)). For lineage across all of it, OpenLineage collects run, job and dataset events from Airflow, Spark, dbt and other tools ([OpenLineage](https://openlineage.io/docs/)).

## Planned visuals

- **`compare`: the same pipeline as tasks and as assets.** An Airflow task graph beside a Dagster asset graph, with linked highlights showing which nodes are steps and which are data products.
- **`stepper`: a backfill with a failed task.** Three daily data intervals run, one task fails and retries, and an upsert keeps the table correct where an insert would have doubled the rows.
- **`tree`: choosing a processing engine.** Branches by data size, latency need and hardware, from DuckDB or Polars on one machine to Spark on a cluster and Ray Data on GPUs, each leaf linking to its chapter.

## Talk like an expert

Experts talk about **DAGs**, **assets**, **data intervals**, **backfills**, **catchup**, **idempotent tasks**, **upserts**, **exactly-once**, **medallion layers** and **data products**. They ask “what happens if this step runs twice?” and “which interval does this run own?” before they ask which orchestrator to use.

## Go deeper

- [Airflow, “Dags”](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html) and [“Best practices”](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html): the task-graph model and the rules for idempotent tasks.
- [Dagster, “Assets”](https://dagster.io/docs/guides/build/assets): the asset-graph model.
- [Ray Data, “Working with LLMs”](https://docs.ray.io/en/latest/data/working-with-llms.html): batch inference and embeddings inside a data pipeline.
- Dehghani, [“Data Mesh Principles and Logical Architecture”](https://martinfowler.com/articles/data-mesh-principles.html) (2020).

## Related

- [Unstructured data pipelines](#unstructured-pipelines)
- [Data formats for AI datasets](#data-formats)
- [Data lakes, warehouses and lakehouses](#data-lakehouses)
- [Production RAG](#production-rag)
- [Data validation, drift and skew](#data-validation-drift)
- [Cost engineering](#cost-engineering)
