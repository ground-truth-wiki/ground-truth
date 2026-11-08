---
id: model-documentation
book: 4
order: "4.1.2"
title: Reading model cards and system cards
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [model-cards, system-cards, documentation, transparency, model-selection]
visuals: []
prerequisites: [frontier-families]
---
> [!tldr]
> Model documentation comes in three layers: a model card says what a model is for, how it was evaluated and where it fails; a system card adds capability, dangerous-capability and safety evaluations and the safeguards around a deployed model; a technical report discloses architecture, data and training. Read them to extract the facts you build against and to see how each benchmark number was produced. Documentation shows what the developer chose to disclose; your own evals still decide.

## Key ideas

- **The model card has nine sections.** Mitchell et al. proposed short documents with model details, intended use, factors, metrics, evaluation data, training data, quantitative analyses, ethical considerations, and caveats and recommendations, with results reported separately for groups such as demographic or phenotypic categories, not only as one average; the paper notes that the training data section may not be possible to provide in practice (Mitchell et al., [“Model Cards for Model Reporting”](https://arxiv.org/abs/1810.03993) (2019)).
- **On hubs, the card is also metadata.** On the Hugging Face Hub, the model card is the repository's `README.md` with a YAML header: `license` (or `other` with `license_name` and `license_link`), `datasets`, `base_model` (for fine-tunes, adapters, quantized versions and merges), `pipeline_tag`, `library_name` and structured evaluation results in `model-index`, which the Hub uses for filtering and display ([Hugging Face, Model cards](https://huggingface.co/docs/hub/model-cards)). The [chat template](#chat-templates) comes with the model and is applied through its tokenizer, and with the wrong control tokens a chat model performs "drastically worse" ([Hugging Face, Chat templates](https://huggingface.co/docs/transformers/chat_templating)).
- **System cards report what was tested for safety,** often under the developer's [frontier safety framework](#frontier-safety-frameworks). The GPT-4o system card, for example, describes capabilities, limitations and safety evaluations across several risk categories, evaluations under OpenAI's Preparedness Framework, third-party assessments of dangerous capabilities and the potential societal impacts of the model's text and vision abilities (OpenAI (Hurst et al.), [“GPT-4o System Card”](https://arxiv.org/abs/2410.21276) (2024)).
- **Technical reports disclose the recipe, to a depth the developer chooses.** The Llama 3 report gives a 405B-parameter dense Transformer pretrained on 15.6T tokens with 3.8 × 10²⁵ FLOPs, a final data mix of roughly 50% general knowledge, 25% math and reasoning, 17% code and 8% multilingual tokens, and training on up to 16K H100 GPUs; the release it announces covers pre-trained and post-trained versions of the 405B model and the Llama Guard 3 safety model (Grattafiori et al., [“The Llama 3 Herd of Models”](https://arxiv.org/abs/2407.21783) (2024)).
- **Extract the facts you build against, and read benchmark tables for their setup.** As of November 2026, Anthropic's model overview lists for each model its context window, maximum output, reliable knowledge cutoff, training data cutoff and a retirement date given as "not sooner than", and its Models API returns `max_input_tokens`, `max_tokens` and a `capabilities` object for each model ([Anthropic, Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)). For a vendor's benchmark table, look for the prompts, attempts, tools and harness ([benchmark literacy](#benchmark-literacy)), because scores are sensitive to evaluation setup (Biderman et al., [“Lessons from the Trenches on Reproducible Evaluation of Language Models”](https://arxiv.org/abs/2405.14782) (2024)).
- **Transparency is uneven and, by one index, falling,** so what a card leaves out only [your own evals](#why-evals) can fill in. The Foundation Model Transparency Index scored 10 developers on 100 indicators covering upstream resources (data, labor, compute), the model and downstream use, and found that no developer disclosed much about the downstream impact of its flagship model (Bommasani et al., [“The Foundation Model Transparency Index”](https://arxiv.org/abs/2310.12941) (2023)). In its 2025 edition the average score fell from 58 in 2024 to 40 out of 100, with IBM highest at 95 and xAI and Midjourney lowest at 14 (Wan et al., [“The 2025 Foundation Model Transparency Index”](https://arxiv.org/abs/2512.10169) (2025)).

## Planned visuals

- **`diagram`:** the three layers of documentation (model card, system card, technical report) and the facts each one holds, with each layer linked to the chapter that uses it ([model licenses](#model-licenses), [safety evals](#safety-evals), [benchmark literacy](#benchmark-literacy)).
- **`tree`:** an extraction checklist before you build: context window, maximum output, knowledge cutoff, modalities, chat template, recommended settings, tool support, license and retirement date, each with where to find it in the documentation or the API.
- **`compare`:** one vendor benchmark row beside its footnotes, showing how attempts, tools and harness change what the same headline number means (illustrative).

## Talk like an expert

Experts talk about **model cards**, **system cards** and **technical reports**, **intended** and **out-of-scope use**, **disaggregated evaluation**, **knowledge cutoff** and **retirement dates**. They read what a card leaves out as carefully as what it says, and treat every number in it as a claim with a setup attached.

## Go deeper

- Mitchell et al., [“Model Cards for Model Reporting”](https://arxiv.org/abs/1810.03993) (2019).
- [Hugging Face, Model cards](https://huggingface.co/docs/hub/model-cards), the metadata specification used on the Hub.
- Bommasani et al., [“The Foundation Model Transparency Index”](https://arxiv.org/abs/2310.12941) (2023).
- Wan et al., [“The 2025 Foundation Model Transparency Index”](https://arxiv.org/abs/2512.10169) (2025).

## Related

- [Frontier model families](#frontier-families)
- [Model licenses and openness definitions](#model-licenses)
- [Benchmark literacy](#benchmark-literacy)
- [Safety and red-team evals](#safety-evals)
- [Frontier safety frameworks](#frontier-safety-frameworks)
- [Model versions, previews and deprecations](#model-lifecycle)
