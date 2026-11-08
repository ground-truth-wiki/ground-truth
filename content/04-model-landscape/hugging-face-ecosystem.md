---
id: hugging-face-ecosystem
book: 4
order: "4.9"
title: Model hubs and the Hugging Face ecosystem
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [hugging-face, model-hub, transformers, datasets, open-weights]
visuals: []
prerequisites: [small-local-models]
---
> [!tldr]
> A model hub is where open weights, datasets and demos are published, versioned and found; this chapter centers on the Hugging Face Hub and the libraries built around it, Transformers, Datasets and the training libraries. Every model there is a Git repository, typically holding a model card with metadata, weight files and configs, plus a tokenizer and a chat template for chat models. Remember that a model name is a moving pointer, so pin the exact commit you tested and load only safe formats.

## Key ideas

- **A hub repository is a Git repository built for huge files.** Models, datasets and Spaces (hosted ML demos, built with Gradio, Docker or static HTML as of November 2026) are Git repositories on the Hub, stored on Xet, a storage system with chunk-level deduplication for files up to terabyte scale ([Hub docs: Repositories](https://huggingface.co/docs/hub/repositories), [Spaces overview](https://huggingface.co/docs/hub/spaces-overview)). The Transformers v5 announcement counted more than 750,000 Transformers-compatible model checkpoints on the Hub in December 2025 ([Hugging Face, “Transformers v5”](https://huggingface.co/blog/transformers-v5)); other hubs exist, such as ModelScope, built around "Model-as-a-Service" with its own model and dataset hubs ([ModelScope](https://github.com/modelscope/modelscope)), and cloud catalogs re-host Hub models (see [cloud AI platforms](#cloud-ai-platforms)).
- **Read the repository, not just the name.** The `README.md` is the model card, with YAML metadata for `license`, `datasets`, `pipeline_tag` (the task), `library_name`, evaluation results and `base_model`, whose relation (`finetune`, `adapter`, `quantized` or `merge`) lets you filter models by base model and find everything derived from it ([Hub docs: Model Cards](https://huggingface.co/docs/hub/model-cards)); model pages show this as a "Model tree" ([example: zephyr-7b-beta](https://huggingface.co/HuggingFaceH4/zephyr-7b-beta)). Two common weight formats are safetensors (tensors only) and GGUF (tensors plus a standardized set of metadata, for GGML-based runtimes such as llama.cpp) ([Hub docs: GGUF](https://huggingface.co/docs/hub/gguf)), and the chat template matters: the Transformers docs warn that with the wrong control tokens, chat models would have "drastically worse performance" ([Transformers: Chat templates](https://huggingface.co/docs/transformers/chat_templating)).
- **Access, versions and the cache are explicit.** Gated models require an access request that shares your username and email with the authors unless the authors turned that off, with automatic or manual approval, and authors can block your access at any time ([Hub docs: Gated models](https://huggingface.co/docs/hub/models-gated)). The `revision` argument accepts a branch, tag, pull request or full commit hash, downloads land in a version-aware local cache, and `snapshot_download` fetches a whole repository at one revision, optionally only matching files such as `*.safetensors`, a natural starting point for an internal mirror ([huggingface_hub: Download files](https://huggingface.co/docs/huggingface_hub/guides/download)).
- **Transformers is the reference implementation, not the production server.** Transformers v5, announced in December 2025, makes PyTorch its only backend and aims to be the "source of truth" for model definitions that other projects reuse: vLLM has a Transformers backend, Transformers models convert to GGUF for llama.cpp, and their safetensors files are directly compatible with MLX ([Hugging Face, “Transformers v5”](https://huggingface.co/blog/transformers-v5)); around it sit PEFT for parameter-efficient fine-tuning ([PEFT docs](https://huggingface.co/docs/peft/index)) and TRL for SFT, DPO, GRPO and reward modeling ([TRL docs](https://huggingface.co/docs/trl/index)). For high-throughput serving, load the same weights into a [serving engine](#serving-engines); see [fine-tuning in practice](#fine-tuning-practice) for the training side.
- **Datasets streams and memory-maps instead of loading.** The Datasets library keeps data in an Apache Arrow cache that is memory-mapped from disk, so loading English Wikipedia used about 50 MB of RAM in its documented example ([Datasets and Arrow](https://huggingface.co/docs/datasets/about_arrow)), and `streaming=True` iterates over a dataset without downloading it, such as the 45 TB English split of FineWeb, with column selection and filters for Parquet ([Datasets: Stream](https://huggingface.co/docs/datasets/stream)). See [data formats](#data-formats).
- **Loading a model can run someone else's code.** `trust_remote_code=True` executes modeling code from the repository, so the Transformers security policy says to verify those files, pin a revision and prefer safetensors, with `use_safetensors` to refuse pickle files ([Transformers SECURITY.md](https://github.com/huggingface/transformers/blob/main/SECURITY.md)); the Hub scans pickles for suspicious imports but calls this "not 100% foolproof" ([Hub docs: Pickle scanning](https://huggingface.co/docs/hub/security-pickle)). See [supply chain and model security](#supply-chain-security).

## Planned visuals

- `diagram`: anatomy of a model repository: model card and metadata, config, weight files, tokenizer and chat template, each labeled with what it controls and which chapter explains it.
- `graph`: a model tree around one base model, with fine-tunes, adapters, quantizations and merges as nodes linked by their `base_model` relation.
- `stepper`: what happens on `from_pretrained`: resolve the revision to a commit, check the cache, download missing files, refuse unsafe formats, apply the config and load the weights.

## Talk like an expert

Experts talk about **repos**, **revisions** and **pinned commits**, the **model card**, the **model tree**, **gated** models, **safetensors** versus pickle, **GGUF quants** and **chat templates**, and they ask "which commit, which file format, which license?" before they ask how good a model is.

## Go deeper

- Hugging Face, [Hub documentation: Repositories](https://huggingface.co/docs/hub/repositories).
- Hugging Face, [Hub documentation: Model Cards](https://huggingface.co/docs/hub/model-cards).
- Hugging Face, [huggingface_hub guide: Download files from the Hub](https://huggingface.co/docs/huggingface_hub/guides/download).
- Hugging Face, [Transformers security policy](https://github.com/huggingface/transformers/blob/main/SECURITY.md).

## Related

- [Small and local models](#small-local-models)
- [The open-weight frontier](#open-weight-frontier)
- [Cloud AI platforms and inference providers](#cloud-ai-platforms)
- [Serving engines](#serving-engines)
- [Supply chain and model security](#supply-chain-security)
