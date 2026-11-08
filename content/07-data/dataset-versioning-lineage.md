---
id: dataset-versioning-lineage
book: 7
order: "7.4.3"
title: Dataset versioning and lineage
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [data-versioning, lineage, dvc, lakefs, openlineage, reproducibility]
visuals: []
prerequisites: [data-governance]
---
> [!tldr]
> Dataset versioning gives every state of a dataset a fixed name you can return to, and lineage records which job read which version and what it produced. Together they let you reproduce a training run, compare two eval scores honestly, answer an audit, and find every model, index and eval a deleted record reached. The one thing to remember: a score or a model without a pinned data version cannot be reproduced.

## Key ideas

- **Files: Git holds the pointers, storage holds the bytes.** DVC works alongside Git rather than replacing it: small metafiles go into Git, the data goes to remote storage such as S3 or an SSH server, and files are tracked by their MD5 hash rather than by timestamps, so data versions live as metadata in Git ([DVC user guide](https://doc.dvc.org/user-guide)). Dataset repositories on the Hugging Face Hub are versioned too, and any branch, tag or commit can be downloaded with the `revision` parameter ([Hugging Face Hub, “Download files from the Hub”](https://huggingface.co/docs/huggingface_hub/guides/download)).
- **Lakes and tables: branches and snapshots.** lakeFS adds Git-like branches, commits and merges on top of object storage: a commit is an immutable checkpoint of the whole repository, and creating a branch is a zero-copy pointer to a commit ([lakeFS, “Internals”](https://docs.lakefs.io/concepts/internals/)). Table formats version from the inside: Delta Lake reads an older snapshot with `VERSION AS OF` or `TIMESTAMP AS OF` ([Delta Lake, “Table batch reads and writes”](https://docs.delta.io/latest/delta-batch.html)), and Apache Iceberg also accepts a snapshot id, a branch or a tag ([Apache Iceberg, “Spark queries”](https://iceberg.apache.org/docs/latest/spark-queries/)).
- **Pin the version where the result is written down.** By default the Hub serves the latest revision of `main`, so a training config that names only a repository changes whenever the repository does; a real pin is the full commit hash, because the `huggingface_hub` library needs the full-length hash, not a 7-character short one ([Hugging Face Hub](https://huggingface.co/docs/huggingface_hub/guides/download)). A snapshot is only a pin while it exists: by default Delta Lake time travel reaches 30 days back, and after a `VACUUM` only as far as the 7-day retention for removed files ([Delta Lake](https://docs.delta.io/latest/delta-batch.html)).
- **Lineage: jobs, runs and datasets.** In OpenLineage, a Job consumes or produces Datasets, a Run is one occurrence of a Job, and facets extend each entity with metadata such as data-quality metrics; as of November 2026 it is a graduated LF AI & Data project with integrations for Airflow, Spark, Flink, dbt and Trino, and Marquez is its reference implementation ([OpenLineage docs](https://openlineage.io/docs/); [OpenLineage object model](https://openlineage.io/docs/spec/object-model)). The older W3C PROV model says the same in general terms: entities, activities and agents, linked by relations such as `used`, `wasGeneratedBy` and `wasDerivedFrom` (W3C, [“PROV-DM: The PROV Data Model”](https://www.w3.org/TR/prov-dm/) (2013)).
- **Catalogs and bills of materials keep the links.** A data catalog stores lineage next to schemas: the AWS Glue Data Catalog, for example, versions schemas and keeps a record of the transformations applied to data for auditing and compliance ([AWS Glue, “Data discovery and cataloging”](https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html)). To make the link from datasets to models machine-readable, a CycloneDX ML-BOM records models, datasets, their dependencies and the provenance of datasets ([CycloneDX, “Machine Learning Bill of Materials”](https://cyclonedx.org/capabilities/mlbom/)), and SPDX 3.0.1 has a Dataset profile for dataset metadata ([SPDX 3.0.1, Dataset profile](https://spdx.github.io/spdx-spec/v3.0.1/model/Dataset/Dataset/)).
- **A deletion walks the graph and the history.** Lineage lists every dataset, index, eval set and model derived from a record that must go, but versioning adds a second direction to search: older snapshots still hold the record. In Delta Lake, a delete removes rows from the latest version of a table but not from physical storage until the old versions are vacuumed ([Delta Lake, “Table deletes, updates, and merges”](https://docs.delta.io/latest/delta-update.html)), and data files are deleted only when `VACUUM` runs ([Delta Lake](https://docs.delta.io/latest/delta-batch.html)).

## Planned visuals

- **`compare`: four ways to version data.** DVC with Git, lakeFS, table time travel and hub revisions side by side: what is versioned, how a version is named, what a branch costs and how long history lasts.
- **`stepper`: one deletion request through the lineage graph.** Find the derived datasets, indexes, evals and models, write new versions without the record, expire the old snapshots that still hold it, and record the run.
- **`diagram`: the OpenLineage model.** Job, Run, Dataset and facets as connected parts, shown beside PROV's entity, activity and agent, with each part linking to the chapter that uses it.

## Talk like an expert

Experts talk about **pins**, **snapshots**, **content hashes**, **zero-copy branches**, **time travel**, **lineage graphs**, **runs, jobs and datasets**, **provenance** and **ML-BOMs**. They ask “which commit of the data produced this number?” before they compare two scores, and they treat “latest” in a config that produces a result as a bug.

## Go deeper

- [DVC user guide](https://doc.dvc.org/user-guide): data versioning with Git-tracked metafiles, remote storage and pipelines.
- [lakeFS, “Internals”](https://docs.lakefs.io/concepts/internals/): repositories, immutable commits, zero-copy branches and merges over object storage.
- [OpenLineage object model](https://openlineage.io/docs/spec/object-model): the Job, Run, Dataset and facet specification.
- W3C, [“PROV-DM: The PROV Data Model”](https://www.w3.org/TR/prov-dm/) (2013): the W3C Recommendation for describing provenance.

## Related

- [Data quality and governance](#data-governance)
- [Data lakes, warehouses and lakehouses](#data-lakehouses)
- [Dataset documentation: datasheets, data cards and Croissant](#dataset-documentation)
- [Building eval datasets](#eval-datasets)
- [Prompt and config management](#prompt-config-management)
- [Supply chain and model security](#supply-chain-security)
