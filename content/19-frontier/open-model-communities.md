---
id: open-model-communities
book: 19
order: "19.6.1"
title: "Open models: history, communities and the release debate"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [open-weights, open-source, communities, licenses, history]
visuals: []
prerequisites: [open-weight-frontier]
---
> [!tldr]
> Open models grew out of three forces: grassroots collectives that rebuilt in public what labs kept closed, corporate releases whose licenses set the terms of the market, and tooling communities that made weights easy to share and run. For engineers they supply base models to fine-tune, datasets, evaluation tools and local inference. The one thing to remember: "open" can mean weights, data, code or license terms, and every release has to be checked on all four.

## Key ideas

- **Grassroots collectives built the open stack.** EleutherAI started in July 2020 as a Discord server for people who wanted to replicate GPT-3 in the open, released the Pile dataset (end of 2020), GPT-Neo and GPT-J (2021), GPT-NeoX-20B (early 2022) and the Pythia suite (2023), and incorporated as a nonprofit research institute in early 2023 ([About EleutherAI](https://www.eleuther.ai/about)); as of November 2026 its README describes the group's evaluation harness as the backend of Hugging Face's Open LLM Leaderboard ([EleutherAI/lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)). The BigScience workshop trained BLOOM, a 176-billion-parameter multilingual model built by hundreds of researchers on the ROOTS corpus (46 natural and 13 programming languages) and released under the Responsible AI License (BigScience Workshop, [“BLOOM: A 176B-Parameter Open-Access Multilingual Language Model”](https://arxiv.org/abs/2211.05100) (2022)).
- **Open data carries open problems.** LAION-5B offered 5.85 billion CLIP-filtered image-text pairs, which its authors used to replicate CLIP, GLIDE and Stable Diffusion (Schuhmann et al., [“LAION-5B: An open large-scale dataset for training next generation image-text models”](https://arxiv.org/abs/2210.08402) (2022)). After a Stanford Internet Observatory report in December 2023 found links to suspected child sexual abuse material in it, LAION took the dataset down and in August 2024 released Re-LAION-5B with 2,236 links removed ([LAION, “Releasing Re-LAION-5B”](https://laion.ai/blog/relaion-5b/)). See [open pretraining datasets](#open-pretraining-datasets).
- **Corporate licenses shaped the market.** Meta's LLaMA (24 February 2023) was available case by case to researchers under a non-commercial license, its weights leaked through a torrent shared on 4chan on 3 March 2023, Llama 2 (18 July 2023) allowed commercial use under an acceptable use policy, Llama 4 (April 2025) came under a community license, and in April 2026 Meta Superintelligence Labs released Muse Spark as a replacement for Llama in the chatbots on Meta's services ([Wikipedia, “Llama (language model)”](https://en.wikipedia.org/wiki/Llama_(language_model)), as of November 2026). Current open-weight releases are tracked in [the open-weight frontier](#open-weight-frontier) and [frontier model families](#frontier-families); license terms and openness definitions are in [model licenses](#model-licenses).
- **"Open" covers four separate things: weights, data, code and license terms.** OLMo is the clearest fully open example: its first release included the weights with more than 500 intermediate checkpoints, full training logs, the complete Dolma pretraining corpus, and the training, adaptation and evaluation code, with all code and weights under Apache 2.0 (Groeneveld et al., [“OLMo: Accelerating the Science of Language Models”](https://arxiv.org/abs/2402.00838) (2024)); as of November 2026, Ai2 lists Olmo 3 models with their data mixes, training framework and evaluation tools ([Ai2, Olmo](https://allenai.org/olmo)). Judge any release on all four, and on whether its reported evals can be rerun with public tools.
- **Distribution and tooling communities made weights usable.** As of November 2026, the Hugging Face Hub hosts over 3 million models, 1 million datasets and 2 million Spaces ([Hugging Face Hub documentation](https://huggingface.co/docs/hub/index)); see [the Hugging Face ecosystem](#hugging-face-ecosystem). llama.cpp runs models in plain C/C++ with integer quantization from 1.5 to 8 bits ([ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)), and its GGUF file format stores tensors plus a standard set of metadata and is read by LM Studio, Ollama and GPT4All ([Hugging Face, GGUF](https://huggingface.co/docs/hub/gguf)); see [running models locally](#local-inference). Kaggle, founded in 2010 and acquired by Google in 2017, adds competitions, datasets, notebooks and, since February 2023, models ([Wikipedia, “Kaggle”](https://en.wikipedia.org/wiki/Kaggle)).
- **The release debate, in its strongest forms.** Kapoor et al. name five distinctive properties of open models (broader access, customizability, local inference, no way to rescind access, no way to monitor use) and propose judging misuse by marginal risk: the risk open models add relative to closed models and pre-existing technologies (Kapoor et al., [“On the Societal Impact of Open Foundation Models”](https://arxiv.org/abs/2403.07918) (2024)); the US NTIA recommended in July 2024 that the government monitor a portfolio of risks and prepare to act rather than restrict open weights now ([NTIA, “Dual-Use Foundation Models with Widely Available Model Weights”](https://www.ntia.gov/issues/artificial-intelligence/open-model-weights-report)). On the other side, LoRA fine-tuning costing under $200 on one GPU cut Llama 2-Chat 70B's refusal rate to about 1% on two refusal benchmarks, and its authors argue fine-tuning risks belong in pre-release assessments (Lermen et al., [“LoRA Fine-tuning Efficiently Undoes Safety Training in Llama 2-Chat 70B”](https://arxiv.org/abs/2310.20624) (2023)).

## Planned visuals

- **`timeline`:** dated milestones of open models with their sources: EleutherAI (July 2020), the Pile, GPT-J, BLOOM, LAION-5B, LLaMA and the leak, Llama 2, OLMo, the NTIA report, Re-LAION-5B and Llama 4.
- **`matrix`:** an openness matrix for a handful of releases (Pythia, BLOOM, Llama 2, OLMo): weights, training data, training code, intermediate checkpoints, evaluation code and license, each cell dated to the release it reads.
- **`diagram`:** the open-model supply chain: datasets, pretraining, weights on a hub, quantization to GGUF and local runtimes, with the evaluation harness alongside; each part links to its chapter, such as [supply chain security](#supply-chain-security).

## Talk like an expert

Experts separate **open weights**, **fully open** and **open source AI**, speak of **community licenses** and **acceptable use policies**, and frame the policy question as **marginal risk** rather than absolute risk. Their first questions about any open release: open what, under which license, with which data disclosed, and can its evals be reproduced?

## Go deeper

- BigScience Workshop, [“BLOOM: A 176B-Parameter Open-Access Multilingual Language Model”](https://arxiv.org/abs/2211.05100) (2022).
- Groeneveld et al., [“OLMo: Accelerating the Science of Language Models”](https://arxiv.org/abs/2402.00838) (2024).
- Kapoor et al., [“On the Societal Impact of Open Foundation Models”](https://arxiv.org/abs/2403.07918) (2024).
- NTIA, [“Dual-Use Foundation Models with Widely Available Model Weights”](https://www.ntia.gov/issues/artificial-intelligence/open-model-weights-report) (30 July 2024).

## Related

- [The open-weight frontier](#open-weight-frontier)
- [Frontier model families](#frontier-families)
- [Small and local models](#small-local-models)
- [Model licenses and openness definitions](#model-licenses)
- [Supply chain and model security](#supply-chain-security)
- [Governance, regulation and law](#governance-regulation)
