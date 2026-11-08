---
id: data-lakehouses
book: 7
order: "7.7"
title: Data lakes, warehouses and lakehouses
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [lakehouse, data-warehouse, table-formats, iceberg, medallion]
visuals: []
prerequisites: [data-governance]
---
> [!tldr]
> A data warehouse stores modeled tables with a schema fixed when data is written; a data lake stores raw files of any kind cheaply and applies structure when data is read. A lakehouse keeps the lake's open files in object storage and adds warehouse features such as transactions, versioning and schema checks through an open table format like Apache Iceberg or Delta Lake. Remember that table formats solve the problems of many writers, changing schemas and reproducible snapshots over large collections of files; a team without those problems can keep versioned files in a bucket.

## Key ideas

- **Warehouses fix the schema on write, lakes apply it on read, and the two-tier pattern pays for both.** Warehouses load modeled tables for BI, while lakes keep raw data in open file formats such as Parquet on low-cost storage; in the two-tier pattern data is ETLed into a lake and then again into a warehouse, which the authors say adds failure points, stale data, double storage and poor support for ML systems such as PyTorch and XGBoost (Armbrust et al., [“Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics”](https://vldb.org/cidrdb/2021/lakehouse-a-new-generation-of-open-platforms-that-unify-data-warehousing-and-advanced-analytics.html) (2021)). The lakehouse proposal comes from authors at Databricks, which builds Delta Lake, while AWS describes lakes and warehouses as serving different needs and says a typical organization will require both ([AWS, “What is a data lake?”](https://aws.amazon.com/what-is/data-lake/)).
- **A table format is a metadata layer that turns many files into one table with commits.** Iceberg tracks individual data files in manifests, records each table state as a snapshot, and commits by replacing the current metadata file with a new one in an atomic swap; writers work optimistically and retry if another commit landed first, so readers always see a committed snapshot and never a partial write ([Apache Iceberg table spec](https://iceberg.apache.org/spec/)). Delta Lake gets the same effect from a `_delta_log` directory of numbered JSON commits that gives each table a single serial history of atomic versions ([Delta transaction log protocol](https://github.com/delta-io/delta/blob/master/PROTOCOL.md)). Both specs describe their target as large collections of files, which suggests that a few JSONL files with a single writer gain little from them.
- **Snapshots buy schema evolution, hidden partitioning and time travel, and they delay deletion.** Iceberg changes schemas without rewriting the table and lets you query or roll back to an earlier snapshot ([Apache Iceberg](https://iceberg.apache.org/)), and it derives partition values from column transforms such as `day` or `bucket[N]` so that queries filter on ordinary columns ([Iceberg spec](https://iceberg.apache.org/spec/)). Delta Lake adds schema enforcement against bad records and time travel for rollbacks, audits and reproducible ML experiments ([Delta Lake documentation](https://docs.delta.io/)). The catch for [data governance](#data-governance) is that a deleted row survives in older snapshots until they expire and their files are physically removed, which Delta's vacuum does after a retention period that, as of November 2026, defaults to 7 days ([Delta transaction log protocol](https://github.com/delta-io/delta/blob/master/PROTOCOL.md)).
- **The medallion layers map onto AI data.** In an LLM product, bronze can hold raw request logs and [traces](#observability-tracing), silver the redacted and deduplicated traces, and gold the sets ready for [evals](#eval-datasets) and fine-tuning. These layer definitions (raw and unvalidated, then validated, cleaned and deduplicated, then refined for analytics, ML and applications) come from Databricks, which calls the pattern a recommended practice rather than a requirement ([Databricks, “What is the medallion lakehouse architecture?”](https://docs.databricks.com/aws/en/lakehouse/medallion)).
- **The catalog is both the commit point and the governance layer.** The Iceberg spec leaves the atomic commit to whatever tracks the table, for example a pointer in a metastore updated with check-and-put ([Iceberg spec](https://iceberg.apache.org/spec/)), and a catalog such as the AWS Glue Data Catalog also holds each table's location and schema versions, records lineage, and connects to fine-grained access control through Lake Formation ([AWS Glue Data Catalog](https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html)).
- **Documents, embeddings and vector indexes can sit next to the tables.** The lakehouse paper counts unstructured data such as images, documents and sensor data among the things SQL warehouses handle poorly ([Armbrust et al., 2021](https://vldb.org/cidrdb/2021/lakehouse-a-new-generation-of-open-platforms-that-unify-data-warehousing-and-advanced-analytics.html)). As of November 2026, Databricks AI Search (formerly Vector Search) can keep a [vector index](#vector-databases) synced with a source Delta table ([Databricks AI Search](https://docs.databricks.com/aws/en/ai-search/ai-search)), and Lance describes itself as an open lakehouse format for multimodal AI that stores images, video, audio, text and embeddings in one format, with vector search, SQL analytics and versioning on the same dataset ([Lance](https://github.com/lance-format/lance)).

## Planned visuals

- `compare`: the two-tier lake plus warehouse architecture next to a lakehouse, with linked highlights on each ETL hop, each copy of the data, and the place where ML training reads.
- `stepper`: one commit to an open table: the writer adds Parquet files, writes a manifest and a new metadata file, and swaps the catalog pointer; a reader stays on the old snapshot, a second writer retries, a time-travel query reads the old version, and snapshot expiry finally deletes the removed files.
- `diagram`: medallion layers for an LLM product: raw logs and traces in bronze, redacted traces in silver, eval sets, fine-tuning sets and a synced vector index in gold, with the catalog beside all three and each part linked to its chapter.

## Talk like an expert

Experts talk about **schema-on-write** and **schema-on-read**, **open table formats**, **snapshots**, **manifests**, **optimistic commits**, **time travel**, **compaction**, **bronze, silver and gold**, and the **catalog**, and before choosing a stack they ask how many jobs write the data, whether rows must be updated or deleted, and whether anyone needs to reproduce last month's training set exactly.

## Go deeper

- Armbrust et al., [“Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics”](https://vldb.org/cidrdb/2021/lakehouse-a-new-generation-of-open-platforms-that-unify-data-warehousing-and-advanced-analytics.html) (2021), CIDR.
- The [Apache Iceberg table spec](https://iceberg.apache.org/spec/), especially its goals, overview and optimistic concurrency sections.
- The [Delta transaction log protocol](https://github.com/delta-io/delta/blob/master/PROTOCOL.md).
- Databricks, [“What is the medallion lakehouse architecture?”](https://docs.databricks.com/aws/en/lakehouse/medallion).

## Related

- [Data quality and governance](#data-governance)
- [Data formats for AI datasets](#data-formats)
- [Dataset versioning and lineage](#dataset-versioning-lineage)
- [Pipeline orchestration and processing engines](#data-pipeline-orchestration)
- [Unstructured data pipelines](#unstructured-pipelines)
- [Enterprise readiness](#enterprise-readiness)
