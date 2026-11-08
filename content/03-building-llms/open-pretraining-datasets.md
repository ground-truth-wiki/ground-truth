---
id: open-pretraining-datasets
book: 3
order: "3.1.3"
title: Open pretraining datasets
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [datasets, pretraining-data, open-data, licensing, common-crawl]
visuals: []
prerequisites: [pretraining-data]
---
> [!tldr]
> Open pretraining datasets let anyone train, audit or extend a language model on documented data, from The Pile (2020) to multi-trillion-token filtered web corpora such as FineWeb and DCLM-Baseline, and openly licensed collections such as the Common Pile. They differ in size, sources, filtering and license, and each one taught the field something about data. Remember that "open" describes access, not permission: check the license, the terms of the underlying sources, and how the size was counted.

## Key ideas

- **The early lineage.** The Pile combined 22 subsets into 825 GiB of English text, and the Pythia suite later trained 16 models on it and its deduplicated version, all in the same data order (Gao et al., [“The Pile: An 800GB Dataset of Diverse Text for Language Modeling”](https://arxiv.org/abs/2101.00027) (2020); Biderman et al., [“Pythia: A Suite for Analyzing Large Language Models Across Training and Scaling”](https://arxiv.org/abs/2304.01373) (2023)). C4, filtered from a single Common Crawl snapshot, turned out to contain benchmark examples and machine-translated text (Dodge et al., [“Documenting Large Webtext Corpora: A Case Study on the Colossal Clean Crawled Corpus”](https://arxiv.org/abs/2104.08758) (2021)), and RefinedWeb showed that filtered, deduplicated web data alone could beat curated corpora, with 5T tokens extracted and 600B released (Penedo et al., [“The RefinedWeb Dataset for Falcon LLM: Outperforming Curated Corpora with Web Data, and Web Data Only”](https://arxiv.org/abs/2306.01116) (2023)).
- **Raw web with quality signals, and multi-source corpora.** RedPajama-V1 reproduced the LLaMA data recipe in about 1.2T tokens, and RedPajama-V2 released 113B unfiltered documents from 84 Common Crawl snapshots in five languages with 46 quality signals per document, so users pick their own filters (Weber et al., [“RedPajama: an Open Dataset for Training Large Language Models”](https://arxiv.org/abs/2411.12372) (2024)). Dolma assembled about 3T tokens from web pages, papers, code, public-domain books, social media and encyclopedic sources, and trained the OLMo models, which were released with their training data and code (Soldaini et al., [“Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research”](https://arxiv.org/abs/2402.00159) (2024); Groeneveld et al., [“OLMo: Accelerating the Science of Language Models”](https://arxiv.org/abs/2402.00838) (2024)).
- **Filtered web at scale.** FineWeb launched with 15T tokens from 96 snapshots and the 1.3T-token FineWeb-Edu subset, and as of November 2026 its dataset card lists more than 18.5T tokens after newer snapshots were added (Penedo et al., [“The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale”](https://arxiv.org/abs/2406.17557) (2024); [FineWeb dataset card](https://huggingface.co/datasets/HuggingFaceFW/fineweb)). DCLM-Baseline trained a 7B model to 64% 5-shot MMLU on 2.6T tokens, and Nemotron-CC's 6.3T tokens match DCLM on MMLU with about four times more unique real tokens (Li et al., [“DataComp-LM: In search of the next generation of training sets for language models”](https://arxiv.org/abs/2406.11794) (2024); Su et al., [“Nemotron-CC: Transforming Common Crawl into a Refined Long-Horizon Pretraining Dataset”](https://arxiv.org/abs/2412.02595) (2024)).
- **Code and openly licensed text.** The Stack v2, built with Software Heritage, covers 619 programming languages and trained the StarCoder2 models (Lozhkov et al., [“StarCoder 2 and The Stack v2: The Next Generation”](https://arxiv.org/abs/2402.19173) (2024)). The Common Pile v0.1 gathers about 8 TB of public-domain and openly licensed text from 30 sources, and its 7B Comma models perform competitively with Llama 1 and Llama 2 7B trained on unlicensed text at similar compute (Kandpal et al., [“The Common Pile v0.1: An 8TB Dataset of Public Domain and Openly Licensed Text”](https://arxiv.org/abs/2506.05209) (2025)).
- **Compare sizes and licenses with care.** The Pile reports gibibytes, FineWeb counts tokens with the GPT-2 tokenizer, and DCLM's raw pool counts 240T GPT-NeoX tokens from 200B documents, so sizes compare only in the same unit and tokenizer ([FineWeb dataset card](https://huggingface.co/datasets/HuggingFaceFW/fineweb); [Li et al., 2024](https://arxiv.org/abs/2406.11794)). As of November 2026, FineWeb is released under ODC-By and is also subject to Common Crawl's terms of use, while the DCLM-Baseline card lists CC BY 4.0 and says the data is for research use only ([FineWeb dataset card](https://huggingface.co/datasets/HuggingFaceFW/fineweb); [DCLM-Baseline dataset card](https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0)).
- **Consent is shrinking the crawlable web.** robots.txt is standardized as RFC 9309, which says its rules "are not a form of access authorization" (Koster et al., [RFC 9309, “Robots Exclusion Protocol”](https://www.rfc-editor.org/rfc/rfc9309.html) (2022)). An audit of 14,000 web domains found that within 2023 to 2024, restrictions left about 5% or more of all C4 tokens, and 28% or more of its most actively maintained critical sources, fully restricted, while Terms of Service crawling restrictions covered 45% of C4 (Longpre et al., [“Consent in Crisis: The Rapid Decline of the AI Data Commons”](https://arxiv.org/abs/2407.14933) (2024)).

## Planned visuals

- **`matrix`:** a dated catalog of open pretraining datasets with size and unit, tokenizer, sources, filtering, license and the models trained on each, every row with its source.
- **`timeline`:** releases from The Pile (2020) to the Common Pile v0.1 (2025), each with the one thing it showed.
- **`tree`:** choosing a dataset by goal (research baseline, continued pretraining in one language or domain, license-clean training) down to candidate datasets and what to check for each.

## Talk like an expert

Practitioners name a dataset with its version, snapshot range, tokenizer and filter threshold, such as FineWeb-Edu at classifier score 3, and they keep three categories apart: web-crawled, openly licensed and synthetic data. "Open" is a question about access; whether you may train on it is a separate question about licenses and consent.

## Go deeper

- Penedo et al., [“The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale”](https://arxiv.org/abs/2406.17557) (2024).
- Li et al., [“DataComp-LM: In search of the next generation of training sets for language models”](https://arxiv.org/abs/2406.11794) (2024).
- Kandpal et al., [“The Common Pile v0.1: An 8TB Dataset of Public Domain and Openly Licensed Text”](https://arxiv.org/abs/2506.05209) (2025).
- Longpre et al., [“Consent in Crisis: The Rapid Decline of the AI Data Commons”](https://arxiv.org/abs/2407.14933) (2024).

## Related

- [Pretraining data](#pretraining-data)
- [Building a web-scale text pipeline](#web-data-pipeline)
- [Data licensing, copyright and consent](#data-licensing-consent)
- [Data quality and governance](#data-governance)
- [Governance, regulation and law](#governance-regulation)
- [The open-weight frontier](#open-weight-frontier)
