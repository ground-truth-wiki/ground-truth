---
id: feature-stores
book: 7
order: "7.8"
title: Feature stores and training-serving consistency
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [feature-stores, training-serving-skew, point-in-time-joins, mlops, personalization]
visuals: []
prerequisites: [classical-ml]
---
> [!tldr]
> A feature store keeps the definitions and values of model input features in one place: an offline store for building historical training sets and an online store for fast lookups when a model serves. It exists to stop training-serving skew and leakage from the future. Remember that every training row may only see the feature values that were available at its own event time. Point-in-time joins enforce that, but fully only when they also check when each value was created, not just its event timestamp.

## Key ideas

- **Features are shared definitions, not code copied into each model.** A feature is a value computed from raw data about an entity such as a user, an account or an item, and Uber's 2017 description of its Michelangelo platform shows the idea: a centralized feature store where teams create and manage canonical features and share them with other teams, about 10,000 of them at the time (Del Balso and Hermann, [“Meet Michelangelo: Uber's Machine Learning Platform”](https://www.uber.com/blog/michelangelo-machine-learning-platform/) (2017)).
- **Two stores, one definition.** The offline store extracts historical feature values for training, and the online store serves features at low latency for real-time predictions ([Feast documentation](https://docs.feast.dev/)); at Uber, offline features were computed with Spark and Hive SQL over an HDFS data lake, online features were precomputed into Cassandra, and for batch features the same data and pipeline fed both training and serving ([Del Balso and Hermann, 2017](https://www.uber.com/blog/michelangelo-machine-learning-platform/)).
- **Point-in-time joins keep the future out of training data.** For each training row, an entity plus an event timestamp, Feast scans backward from that timestamp up to the feature's TTL, measured from the row's own timestamp rather than from query time, and joins nothing if no value falls inside that window. By default only the event timestamp is checked, so a value backfilled or corrected later can still leak into training. As of November 2026, setting `filter_by_created_timestamp=True` adds `created_timestamp <= entity_timestamp` to the join. That reproduces what the online store would have served, as long as the created timestamp records when a value became available online, and offline stores that do not support the flag raise an error ([Feast, “Point-in-time joins”](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)).
- **Shared definitions remove one of three causes of training-serving skew.** Zinkevich defines training-serving skew as a difference between performance in training and in serving, caused by different data handling in the two pipelines, by data that changes between training and serving, or by a feedback loop between the model and the algorithm, and he advises monitoring for skew explicitly, reusing code between the pipelines, and logging the features used at serving time for later training (Zinkevich, [“Rules of Machine Learning”](https://developers.google.com/machine-learning/guides/rules-of-ml)). A shared feature definition targets the first cause; the other two still need monitoring, such as [drift checks](#data-validation-drift), and serving logs.
- **Materialization sets freshness.** Feast copies the latest values from batch sources into the online store by materialization, for example with `materialize_incremental`, so online values are only as fresh as the last run, and push sources can write values directly ([Feast, “Data ingestion”](https://docs.feast.dev/getting-started/concepts/data-ingestion)); Michelangelo offered batch precompute for features that could be refreshed every few hours or once a day, and near-real-time compute with streaming jobs for low-latency aggregates ([Del Balso and Hermann, 2017](https://www.uber.com/blog/michelangelo-machine-learning-platform/)).
- **LLM systems become new consumers, and feature stores grow toward retrieval and memory.** Feast names personalized recommendations and online fraud detection among the use cases it has powered ([Feast documentation](https://docs.feast.dev/)), and an LLM application or agent can read the same entity-keyed features, such as customer profiles and account data, as prompt context. As of November 2026, Feast documents storing embeddings as features, vector similarity search, retrieving embeddings and ordinary features in a single API call, and serving as both context provider and persistent memory layer for agents, which puts it beside [RAG indexes](#production-rag) and [agent memory](#agent-memory) as another serving-time data store with the same freshness and point-in-time questions ([Feast, “GenAI”](https://docs.feast.dev/getting-started/genai)).

## Planned visuals

- `stepper`: a point-in-time join on a timeline: label events for one user, feature values with event and created timestamps, and a TTL window; one frame shows the leak from joining the latest value, another shows a backfilled value dropped by the created-timestamp filter.
- `diagram`: a feature store between data sources and models: feature definitions, offline store feeding training sets, materialization into the online store, an inference service and an LLM application reading user features, each part linked to its chapter.
- `compare`: two pipelines with separately written training and serving code next to one shared feature definition plus logged serving features, with linked highlights on where each cause of skew enters.

## Talk like an expert

Experts talk about **entities**, **feature views**, **event** and **created timestamps**, **TTLs**, **point-in-time correctness**, **materialization**, **online** and **offline stores** and **training-serving skew**, and they check a training set by asking what the model could have known at each row's event time.

## Go deeper

- [Feast documentation](https://docs.feast.dev/), the open-source feature store.
- Feast, [“Point-in-time joins”](https://docs.feast.dev/getting-started/concepts/point-in-time-joins).
- Del Balso and Hermann, [“Meet Michelangelo: Uber's Machine Learning Platform”](https://www.uber.com/blog/michelangelo-machine-learning-platform/) (2017).
- Zinkevich, [“Rules of Machine Learning”](https://developers.google.com/machine-learning/guides/rules-of-ml), especially the section on training-serving skew.

## Related

- [Classical ML essentials](#classical-ml)
- [Feature engineering and preprocessing](#feature-engineering)
- [Data validation, drift and skew](#data-validation-drift)
- [Data lakes, warehouses and lakehouses](#data-lakehouses)
- [Memory](#agent-memory)
- [Production RAG](#production-rag)
