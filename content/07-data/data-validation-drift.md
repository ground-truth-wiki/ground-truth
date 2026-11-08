---
id: data-validation-drift
book: 7
order: "7.4.4"
title: Data validation, drift and skew
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [data-validation, data-contracts, data-drift, training-serving-skew, data-quality]
visuals: []
prerequisites: [data-governance, classical-ml]
---
> [!tldr]
> Data validation checks every batch of data against what you expect before it reaches training, an index or a model. Drift and skew checks compare distributions: today's data against yesterday's, and serving data against training data. Models rarely crash on bad data; they keep answering, only worse, so the checks must run inside the pipeline, at every point where one stage hands data to the next.

## Key ideas

- **Bad data fails quietly and compounds.** Sambasivan et al. name the pattern data cascades: compounding events with negative downstream effects from data issues, triggered by practices that undervalue data quality, which they found pervasive (92% prevalence) in interviews with 53 AI practitioners (Sambasivan et al., [“Everyone wants to do the model work, not the data work”: Data Cascades in High-Stakes AI](https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/) (2021)). To say what “good” means, ISO/IEC 25012 sorts data quality into fifteen characteristics seen from two points of view, inherent and system-dependent, with accuracy, completeness and consistency among the inherent ones, and the ISO/IEC 5259 series, whose Part 1 appeared in July 2024, covers data quality for analytics and machine learning ([ISO/IEC 25012:2008](https://webstore.iec.ch/publication/11246); [ISO 25000 portal, “ISO/IEC 25012”](https://iso25000.com/index.php/en/iso-25000-standards/iso-25012); [ISO/IEC 5259-1:2024](https://www.boutique.afnor.org/en-gb/standard/iso-iec-525912024/artificial-intelligence-data-quality-for-analytics-and-machine-learning-ml-/xs143738/421602)).
- **Schemas and expectations make assumptions executable.** TensorFlow Data Validation infers a first schema of types and allowed values from training statistics, which you review and check into version control, and in a TFX pipeline it runs on every data split and on the data before and after the Transform step; at Google it monitored several petabytes of production data a day for hundreds of product teams ([TFDV guide](https://www.tensorflow.org/tfx/guide/tfdv); Breck et al., [“Data Validation for Machine Learning”](https://research.google/pubs/data-validation-for-machine-learning/) (2019)). Great Expectations calls each check an Expectation, “a verifiable assertion about data” such as `expect_column_values_to_not_be_null`, and groups them into suites ([Great Expectations, “Expectation”](https://docs.greatexpectations.io/docs/reference/learn/terms/expectation/)).
- **Contracts turn checks into gates between teams.** A data contract is an agreement between a data producer and its consumers, and the Open Data Contract Standard defines it as a YAML file with sections for the schema, data quality rules, a service-level agreement, the team and support channels; as of November 2026 it is maintained by Bitol, an incubation-stage project of the Linux Foundation AI & Data ([Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/latest/); [Bitol](https://bitol.io/)). Run those checks where one stage hands data to the next, and a failing batch stops at the boundary instead of flowing into training or an index.
- **What the checks must catch: shift and skew.** Under covariate shift the inputs P(x) change while P(y | x) stays fixed, under label shift P(y) changes while P(x | y) stays fixed, and under concept shift the meaning of the labels itself changes ([Dive into Deep Learning, “Environment and Distribution Shift”](https://d2l.ai/chapter_linear-classification/environment-and-distribution-shift.html); Lipton et al., [“Detecting and Correcting for Label Shift with Black Box Predictors”](https://arxiv.org/abs/1802.03916) (2018)). Training-serving skew is a gap between performance in training and in serving, caused by different data handling in the two pipelines, data that changed in between, or a feedback loop, which is why Google's rules advise logging the features used at serving time and training on them ([Google, “Rules of Machine Learning”](https://developers.google.com/machine-learning/guides/rules-of-ml)).
- **Drift metrics are thresholds you tune.** TFDV compares consecutive spans of data, such as one day with the next, using L-infinity distance for categorical features and approximate Jensen-Shannon divergence for numeric ones, and warns above a threshold that you find by iteration and domain knowledge ([TFDV guide](https://www.tensorflow.org/tfx/guide/tfdv)). As of November 2026, Evidently switches from statistical tests on samples of up to 1,000 objects to normed Wasserstein distance (numeric) or Jensen-Shannon distance (categorical) with a 0.1 threshold on larger ones ([Evidently, “Customize Data Drift”](https://docs.evidentlyai.com/metrics/customize_data_drift)); the statistics behind these choices live in [anomaly detection and distribution shift](#anomaly-drift-detection).
- **LLM systems drift in their text and their corpus.** For raw text, compute descriptors such as text length and test them for drift like any numeric column, or train a classifier to tell current from reference text; as of November 2026, Evidently's default for large text samples flags drift when that classifier's ROC AUC exceeds 0.55 ([Evidently, “Customize Data Drift”](https://docs.evidentlyai.com/metrics/customize_data_drift)). Watch the input mix, languages and lengths, and every change to the retrieval corpus, and send the slices that moved to [online evaluation](#online-evaluation).

## Planned visuals

- **`diagram`: quality gates along a pipeline.** Ingest, transform, train or index, and serve, with the check that guards each boundary: schema, expectations, contract, skew and drift.
- **`calculator`: drift between two category mixes.** Enter yesterday's and today's shares of, say, prompt languages, and get the L-infinity distance and the Jensen-Shannon divergence against a threshold, with the formulas shown. Formula-based, with tests.
- **`tree`: which check catches which failure.** A renamed column, a unit change, a feature computed differently at serving time, a new user segment and a changed labeling guideline, each with its symptom and the check that catches it.

## Talk like an expert

Experts talk about **schemas**, **expectations**, **data contracts**, **quality gates**, **spans**, **training-serving skew**, **covariate shift**, **label shift**, **concept drift** and **data cascades**. They keep “the data broke” apart from “the world changed”: a schema violation is a bug to fix, while drift is a signal to investigate.

## Go deeper

- [TensorFlow Data Validation guide](https://www.tensorflow.org/tfx/guide/tfdv): schema validation, training-serving skew and drift detection in one tool.
- Breck et al., [“Data Validation for Machine Learning”](https://research.google/pubs/data-validation-for-machine-learning/) (SysML 2019): the design of the validation system behind TFDV and what it caught in production.
- Sambasivan et al., [“Everyone wants to do the model work, not the data work”: Data Cascades in High-Stakes AI](https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/) (CHI 2021).
- [Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/latest/): every section of a data contract, with examples.

## Related

- [Data quality and governance](#data-governance)
- [Online evaluation](#online-evaluation)
- [Feature stores and training-serving consistency](#feature-stores)
- [Pipeline orchestration and processing engines](#data-pipeline-orchestration)
- [Observability and tracing](#observability-tracing)
- [Anomaly detection and distribution shift](#anomaly-drift-detection)
