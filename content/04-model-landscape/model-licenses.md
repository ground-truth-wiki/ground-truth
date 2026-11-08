---
id: model-licenses
book: 4
order: "4.1.1"
title: Model licenses and openness definitions
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [licenses, open-weights, open-source, acceptable-use, compliance]
visuals: []
prerequisites: [frontier-families]
---
> [!tldr]
> "Open" can mean three different things for a model: weights you may download, open source in the sense of the OSI definition (parameters, code and enough information about the data to build a substantially equivalent system), or a fully open release with data and checkpoints. Open-weight families such as Llama and Gemma ship under custom licenses that add user thresholds, naming rules, acceptable use policies and broad definitions of derivatives, and a permissive license alone does not meet the open source bar, which also asks for code and data information. Read the license and its acceptable use policy for the exact version you ship; this page is information, not legal advice.

## Key ideas

- **Open source AI has a definition, and many open-weight models fail it.** Version 1.0 of the Open Source AI Definition, released in October 2024 ([OSI, 2024 end-of-year review](https://opensource.org/blog/2024-end-of-year-review-open-source-ai-definition-v1-0)), asks for four freedoms (use for any purpose, study, modify and share) and the preferred form for modification: data information detailed enough that a skilled person could build a substantially equivalent system, the complete source code used to train and run the system (including how the data was processed and filtered), and the parameters, all under OSI-approved terms. It does not require publishing the training data itself, only describing it and saying where to get it ([OSI, The Open Source AI Definition 1.0](https://opensource.org/ai/open-source-ai-definition)). In OSI's validation, OLMo, Pythia, CrystalCoder and T5 met the requirements, while Llama 2, Phi-2, Mixtral and Grok fell short ([OSI, 2024 end-of-year review](https://opensource.org/blog/2024-end-of-year-review-open-source-ai-definition-v1-0)).
- **Openness is a ladder, not a label.** The Model Openness Framework rates models in three classes over 17 components: Class III (Open Model) covers the architecture, final parameters, technical report, evaluation results, model card and data card; Class II (Open Tooling) adds training, inference and evaluation code and evaluation data; Class I (Open Science) adds the datasets, preprocessing code and intermediate checkpoints, each released under an appropriate open license (White et al., [“The Model Openness Framework”](https://arxiv.org/abs/2403.13784) (2024)). A survey of over 45 generative systems on 14 dimensions found many "open source" models to be open weight at best and called the practice open-washing (Liesenfeld and Dingemanse, [“Rethinking open source generative AI: open-washing and the EU AI Act”](https://doi.org/10.1145/3630106.3659005) (2024)), and the authors' index keeps scoring systems on those dimensions ([European Open Source AI Index](https://osai-index.eu/about)).
- **Permissive and community licenses differ in conditions, not just in name.** Apache 2.0 includes a patent grant that ends for anyone who files a lawsuit claiming the work infringes a patent ([Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0), January 2004). The Llama 3.1 Community License (release date July 23, 2024) requires a separate license from Meta if you or your affiliates had more than 700 million monthly active users in the calendar month before that date, a prominent "Built with Llama" notice, "Llama" at the start of the name of any distributed model trained or improved with Llama materials or outputs, and compliance with Meta's acceptable use policy ([Llama 3.1 Community License Agreement](https://dev.meta.ai/llama/llama3_1/license)).
- **Use restrictions flow down, and derivatives are defined broadly.** As of November 2026, the Gemma Terms of Use (last modified April 1, 2026) bar uses that violate the Gemma Prohibited Use Policy, require distributors to put those restrictions into an enforceable agreement with every recipient, let Google restrict usage "remotely or otherwise" when it reasonably believes the terms are violated, and count models trained to perform like Gemma, including by distillation or on its synthetic outputs, as Model Derivatives, while claiming no rights in the outputs themselves ([Gemma Terms of Use](https://ai.google.dev/gemma/terms)). OpenRAIL licenses such as BLOOM RAIL and CreativeML OpenRAIL-M (Stable Diffusion) also attach behavioral-use restrictions that must be passed on whenever the model is redistributed or modified ([Muñoz Ferrandis, “OpenRAIL”, Hugging Face blog](https://huggingface.co/blog/open_rail), August 2022).
- **Access can be gated or regional even when weights are "open".** As of November 2026, on the Hugging Face Hub, a gated model asks users to accept its conditions and, by default, share their username and email address, authors approve requests automatically or by hand and can revoke access at any time, and `extra_gated_eu_disallowed: true` blocks users located in the EU by IP address ([Hugging Face, Gated models](https://huggingface.co/docs/hub/models-gated)). Meta's Llama 3.2 acceptable use policy, as published in November 2026, does not grant the license rights for its multimodal models to individuals domiciled in, or companies with their principal place of business in, the European Union, though end users of products built on them are not affected ([Llama 3.2 Acceptable Use Policy](https://dev.meta.ai/llama/llama3_2/use-policy)).
- **Whether to release weights at all is a live policy debate,** traced in [open models: history, communities and the release debate](#open-model-communities). One framework judges open models by their marginal risk, the risk they add over technologies that already exist, and found current research insufficient to characterize that risk for misuse such as cyberattacks and bioweapons, while listing benefits for innovation, competition, the distribution of decision-making power and transparency (Kapoor et al., [“On the Societal Impact of Open Foundation Models”](https://arxiv.org/abs/2403.07918) (2024)).

## Planned visuals

- **`diagram`:** the openness ladder, from weights only, through the OSI definition (data information, code, parameters), to Model Openness Framework Class I, with the components each level adds and links to [dataset documentation](#dataset-documentation) and [model cards](#model-documentation).
- **`matrix`:** license families side by side (permissive, community, custom terms, OpenRAIL, research and non-commercial) on commercial use, user thresholds, naming and attribution, acceptable use flow-down, derivative and distillation clauses, output clauses and remote restriction, every cell dated to the license version it reads.
- **`tree`:** a license review checklist before shipping (information, not legal advice): which version applies, who may use it, scale thresholds, attribution and naming, acceptable use flow-down to your users, derivatives and outputs, regional and gated access, termination.

## Talk like an expert

Experts separate **open weights**, **open source AI** and **fully open**, and read a license for its **acceptable use policy**, **flow-down** obligations, **MAU threshold**, **naming and attribution** rules and its definition of a **derivative**. Their first question about any "open" model is: open what, under which terms, in which version?

## Go deeper

- Open Source Initiative, [The Open Source AI Definition 1.0](https://opensource.org/ai/open-source-ai-definition).
- White et al., [“The Model Openness Framework: Promoting Completeness and Openness for Reproducibility, Transparency, and Usability in Artificial Intelligence”](https://arxiv.org/abs/2403.13784) (2024).
- Liesenfeld and Dingemanse, [“Rethinking open source generative AI: open-washing and the EU AI Act”](https://doi.org/10.1145/3630106.3659005) (2024).
- Kapoor et al., [“On the Societal Impact of Open Foundation Models”](https://arxiv.org/abs/2403.07918) (2024).

## Related

- [Frontier model families](#frontier-families)
- [The open-weight frontier](#open-weight-frontier)
- [Open models: history, communities and the release debate](#open-model-communities)
- [Reading model cards and system cards](#model-documentation)
- [Data licensing, copyright and consent](#data-licensing-consent)
- [Governance, regulation and law](#governance-regulation)
