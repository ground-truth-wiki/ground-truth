---
id: dataset-documentation
book: 7
order: "7.4.2"
title: "Dataset documentation: datasheets, data cards and Croissant"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [datasheets, data-cards, dataset-cards, croissant, documentation]
visuals: []
prerequisites: [data-governance]
---
> [!tldr]
> Dataset documentation records what a dataset contains, where it came from, how it was labeled, what it may be used for and who maintains it. Human-readable forms (datasheets, data statements, data cards, dataset cards) explain intent and limits, and Croissant carries many of the same facts in a machine-readable form that tools and conference reviewers can check. Write it while you build the dataset, and update it with every version.

## Key ideas

- **Undocumented datasets fail quietly.** An audit of more than 1,800 text datasets found frequent miscategorization of licenses on widely used dataset hosting sites, "with license omission of 70%+ and error rates of 50%+" (Longpre et al., [“The Data Provenance Initiative: A Large Scale Audit of Dataset Licensing & Attribution in AI”](https://arxiv.org/abs/2310.16787) (2023)). Without provenance and license facts, nobody downstream can tell whether a dataset may be used, or what it will teach a model.
- **A datasheet answers questions along the dataset's lifecycle.** Modeled on the datasheets that come with electronic components, it groups its questions into seven sections: motivation, composition, collection process, preprocessing/cleaning/labeling, uses, distribution, and maintenance. Its maintenance questions ask who supports the dataset and how errata and updates will reach users (Gebru et al., [“Datasheets for Datasets”](https://arxiv.org/abs/1803.09010) (2018)). The authors stress that writing a datasheet is not meant to be automated, because its point is to make creators reflect on their choices ([Gebru et al., 2018](https://arxiv.org/abs/1803.09010)).
- **Other forms serve other audiences.** Data statements characterize language datasets to address what goes wrong when data from some populations is used to build technology for others, aiming to reduce exclusion and bias (Bender and Friedman, [“Data Statements for Natural Language Processing: Toward Mitigating System Bias and Enabling Better Science”](https://aclanthology.org/Q18-1041/) (2018)); Data Cards are "structured summaries of essential facts" about sources, collection, annotation, intended use and decisions that affect model performance (Pushkarna et al., [“Data Cards: Purposeful and Transparent Dataset Documentation for Responsible AI”](https://arxiv.org/abs/2204.01075) (2022)), and the Data Cards Playbook organizes the work of creating them into four modules: Ask, Inspect, Answer and Audit ([Data Cards Playbook](https://sites.research.google/datacardsplaybook/)). The Dataset Nutrition Label instead presents qualitative and quantitative modules for checking a dataset before a model is built (Holland et al., [“The Dataset Nutrition Label: A Framework To Drive Higher Data Quality Standards”](https://arxiv.org/abs/1805.03677) (2018)).
- **On the Hugging Face Hub, the dataset card is the README.** The Hub renders a dataset's README.md as its card, and a YAML block at the top declares metadata such as license, language, task categories and tags, which drive search and filtering ([Hugging Face, “Dataset Cards”](https://huggingface.co/docs/hub/datasets-cards)). Gated datasets, where users must request access, take their custom request fields and the message shown to requesters from the same YAML metadata ([Hugging Face, “Gated datasets”](https://huggingface.co/docs/hub/datasets-gated)).
- **Croissant makes the documentation machine-readable.** Croissant is a metadata format for ML-ready datasets that extends schema.org and describes the files, the record structure and the fields, so tools can load the data wherever it is hosted (Akhtar et al., [“Croissant: A Metadata Format for ML-Ready Datasets”](https://arxiv.org/abs/2403.19546) (2024); [MLCommons Croissant](https://mlcommons.org/working-groups/data/croissant/)). Its RAI vocabulary adds properties such as `rai:dataLimitations`, `rai:dataBiases` and `rai:dataUseCases` ([Croissant RAI specification](https://docs.mlcommons.org/croissant/docs/croissant-rai-spec.html)), and version 1.1, published on 29 January 2026, adds provenance based on W3C PROV-O and usage permissions expressed with DUO or ODRL ([Croissant 1.1 specification](https://docs.mlcommons.org/croissant/docs/croissant-spec-1.1.html); [MLCommons, 2026](https://mlcommons.org/2026/02/croissant-1-1-standard/)). Conferences have started to require it: the NeurIPS 2025 Datasets and Benchmarks track required datasets to be properly hosted, either on a repository that natively supports Croissant, such as Hugging Face, Kaggle, OpenML or Dataverse, or on a custom host that includes a Croissant description ([NeurIPS blog, March 2025](https://blog.neurips.cc/2025/03/10/neurips-datasets-benchmarks-raising-the-bar-for-dataset-submissions/)), and the NeurIPS 2026 Evaluations and Datasets track also required RAI metadata in the Croissant file ([NeurIPS blog, May 2026](https://blog.neurips.cc/2026/05/04/responsible-ai-metadata-requirements-for-the-evaluations-and-datasets-track-neurips-2026/)).
- **Regulators and your own team need documentation too.** The European Commission published a template on 24 July 2025 for general-purpose AI model providers to summarize their training content, listing the main data collections and other sources ([European Commission](https://digital-strategy.ec.europa.eu/en/news/commission-presents-template-general-purpose-ai-model-providers-summarise-data-used-train-their)); see [data licensing](#data-licensing-consent) for the legal context. Internal eval and fine-tuning sets need a short version too. Gebru et al. note that some of their questions are less relevant for product teams creating internal datasets ([Gebru et al., 2018](https://arxiv.org/abs/1803.09010)), but any set that changes still has to answer their maintenance question: will it be updated, for example to correct labeling errors, and how will updates reach its users?

## Planned visuals

- `compare`: the same small dataset documented twice: datasheet answers in prose on one side and the matching Croissant JSON-LD with RAI fields on the other, with links between the facts that correspond.
- `tree`: documentation forms by audience and format: human-readable (datasheets, data statements, data cards, nutrition labels, Hub dataset cards), machine-readable (Croissant core, RAI and provenance) and regulatory (the EU training-content summary).
- `timeline`: datasheets, data statements and the nutrition label (2018), Data Cards (2022), Croissant and its RAI vocabulary (2024), the EU template and the NeurIPS hosting rule (2025), and Croissant 1.1 and the NeurIPS RAI requirement (2026).

## Talk like an expert

Experts talk about **datasheets**, **data statements**, **data cards**, **dataset cards**, **YAML metadata**, **Croissant**, **RAI fields**, **provenance**, **intended use** and the **maintenance plan**; they treat documentation as part of each dataset version, and they weigh Gebru et al.'s point that a datasheet is a reflective exercise against the push for machine-readable metadata that tools and agents can check.

## Go deeper

- Gebru et al., [“Datasheets for Datasets”](https://arxiv.org/abs/1803.09010) (2018), published in Communications of the ACM in 2021.
- Pushkarna et al., [“Data Cards: Purposeful and Transparent Dataset Documentation for Responsible AI”](https://arxiv.org/abs/2204.01075) (2022).
- MLCommons, [Croissant format specification, version 1.1](https://docs.mlcommons.org/croissant/docs/croissant-spec-1.1.html) (2026).
- Hugging Face, [“Dataset Cards”](https://huggingface.co/docs/hub/datasets-cards), Hub documentation.

## Related

- [Data quality and governance](#data-governance)
- [Responsible AI in practice](#responsible-ai)
- [Dataset versioning and lineage](#dataset-versioning-lineage)
- [Data licensing, copyright and consent](#data-licensing-consent)
- [Building eval datasets](#eval-datasets)
- [Reading model cards and system cards](#model-documentation)
