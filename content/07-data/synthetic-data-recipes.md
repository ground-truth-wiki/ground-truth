---
id: synthetic-data-recipes
book: 7
order: "7.3.1"
title: Synthetic data recipes
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [synthetic-data, self-instruct, evol-instruct, persona-synthesis, model-collapse]
visuals: []
prerequisites: [synthetic-data, sft]
---
> [!tldr]
> A synthetic data recipe is a repeatable way to get training data out of a model: bootstrap from seed tasks, evolve them harder, condition on personas, ground them in human-written documents, or write whole textbooks. Each recipe here pairs generation with a source of diversity, and most also filter what comes out. Experiments on model collapse favor adding synthetic data to real data rather than replacing it.

## Key ideas

- **Bootstrap from seeds, then filter.** Self-Instruct starts from 175 seed tasks, has the model generate new instructions, inputs and outputs, keeps an instruction only if its ROUGE-L similarity to every existing one is below 0.7, and fine-tunes on the result; applied to vanilla GPT-3 it gave a 33% absolute improvement on Super-NaturalInstructions (Wang et al., [“Self-Instruct: Aligning Language Models with Self-Generated Instructions”](https://arxiv.org/abs/2212.10560) (2022)). Alpaca simplified the pipeline and produced 52K instruction-output pairs from text-davinci-003 for under $500 in API costs ([Stanford CRFM, “Alpaca”](https://crfm.stanford.edu/2023/03/13/alpaca.html) (2023)).
- **Add difficulty and diversity on purpose.** Evol-Instruct has an LLM rewrite instructions step by step into more complex ones, giving data at graded difficulty (Xu et al., [“WizardLM: Empowering Large Pre-Trained Language Models to Follow Complex Instructions”](https://arxiv.org/abs/2304.12244) (2023)). Persona-driven synthesis puts a persona into the generation prompt, drawn from Persona Hub's roughly one billion personas curated from web data (Ge et al., [“Scaling Synthetic Data Creation with 1,000,000,000 Personas”](https://arxiv.org/abs/2406.20094) (2024)); the Tülu 3 post-training recipe conditioned on about 250K of them to generate precise instruction-following, math and coding prompts (Lambert et al., [“Tülu 3: Pushing Frontiers in Open Language Model Post-Training”](https://arxiv.org/abs/2411.15124) (2024)).
- **Ground generation in human-written text.** Instruction backtranslation has a seed model write the instruction that a web document would answer, then select the best pairs itself (Li et al., [“Self-Alignment with Instruction Backtranslation”](https://arxiv.org/abs/2308.06259) (2023)). Synthetic textbooks go further: phi-1, a 1.3B-parameter code model, trained on about 6B tokens of textbook-quality web data and about 1B tokens of textbooks and exercises generated with GPT-3.5 (Gunasekar et al., [“Textbooks Are All You Need”](https://arxiv.org/abs/2306.11644) (2023)), and Cosmopedia generated 25B tokens with Mixtral-8x7B-Instruct, seeded by clustered web samples and curated educational sources across several audiences and styles, adding explicit instructions on how outputs should differ because audience and style alone did not prevent duplicates (Ben Allal et al., [“Cosmopedia: how to create large-scale synthetic data for pre-training Large Language Models”](https://huggingface.co/blog/cosmopedia) (2024)). Rephrasing web documents for pretraining belongs to [the web-scale text pipeline](#web-data-pipeline).
- **The same idea fits other data shapes.** UltraChat generated 1.5 million multi-turn dialogues without human queries (Ding et al., [“Enhancing Chat Language Models by Scaling High-quality Instructional Conversations”](https://arxiv.org/abs/2305.14233) (2023)); Orca's explanation tuning trains on GPT-4's step-by-step explanation traces (Mukherjee et al., [“Orca: Progressive Learning from Complex Explanation Traces of GPT-4”](https://arxiv.org/abs/2306.02707) (2023)); LLM-generated data for hundreds of thousands of embedding tasks across 93 languages trained strong text embeddings in under 1,000 steps (Wang et al., [“Improving Text Embeddings with Large Language Models”](https://arxiv.org/abs/2401.00368) (2023)); and fine-tuning the generator with differential privacy yields synthetic text with utility competitive with its non-private counterpart (Yue et al., [“Synthetic Text Generation with Differential Privacy: A Simple and Practical Recipe”](https://arxiv.org/abs/2210.14348) (2022)).
- **At frontier scale, most alignment data can be synthetic.** Nvidia reports that over 98% of the data in Nemotron-4 340B's alignment process was synthetically generated, and open-sourced the generation pipeline (Adler et al., [“Nemotron-4 340B Technical Report”](https://arxiv.org/abs/2406.11704) (2024)). Open tooling packages these recipes: distilabel is a framework for synthetic data and AI feedback pipelines that chains generation and judging steps, as of November 2026 ([Hugging Face Hub docs, “Distilabel”](https://huggingface.co/docs/hub/datasets-distilabel)); what to keep afterwards is a selection problem, covered in [data selection and attribution](#data-selection-attribution).
- **Accumulate rather than replace, and read the generator's terms.** When each model generation is trained on synthetic data that replaces the real data, models tend to collapse; when synthetic data accumulates alongside the real data, collapse is avoided in their experiments with language models, diffusion models and VAEs, and in a linear model the test error has a finite upper bound (Gerstgrasser et al., [“Is Model Collapse Inevitable? Breaking the Curse of Recursion by Accumulating Real and Synthetic Data”](https://arxiv.org/abs/2404.01413) (2024)). Licenses matter too: in 2023 the Alpaca authors limited their model to academic research, partly because the terms of use of text-davinci-003, the model that generated the data, prohibited developing models that compete with OpenAI ([Stanford CRFM, 2023](https://crfm.stanford.edu/2023/03/13/alpaca.html)), while Nemotron-4's license permits use of the model's outputs ([Adler et al., 2024](https://arxiv.org/abs/2406.11704)); terms change, so check the current ones (see [data licensing](#data-licensing-consent)).

## Planned visuals

- `tree`: a taxonomy of recipes by what supplies the diversity (seed tasks, evolution operators, personas, human documents, topic clusters, privacy-preserving fine-tuning), each leaf with one worked example and its paper.
- `stepper`: one turn of the Self-Instruct loop: sample seed tasks, generate a new instruction, generate an input and output, reject it if it is too similar to the pool, and add the survivor to the pool.
- `chart`: test error across model generations under replacing versus accumulating real data, drawn qualitatively after Gerstgrasser et al. (2024) and labeled illustrative.

## Talk like an expert

Experts talk about the **seed pool**, **evolution operators**, **persona conditioning**, **backtranslation**, **self-curation**, **decontamination**, and **replacing versus accumulating** data, and for any synthetic dataset they ask four things: what supplies the diversity, what filters the output, what share was kept, and whether the generator's license allows training on its outputs.

## Go deeper

- Wang et al., [“Self-Instruct: Aligning Language Models with Self-Generated Instructions”](https://arxiv.org/abs/2212.10560) (2022).
- Ge et al., [“Scaling Synthetic Data Creation with 1,000,000,000 Personas”](https://arxiv.org/abs/2406.20094) (2024).
- Ben Allal et al., [“Cosmopedia: how to create large-scale synthetic data for pre-training Large Language Models”](https://huggingface.co/blog/cosmopedia) (2024), Hugging Face blog.
- Gerstgrasser et al., [“Is Model Collapse Inevitable? Breaking the Curse of Recursion by Accumulating Real and Synthetic Data”](https://arxiv.org/abs/2404.01413) (2024).

## Related

- [Synthetic data](#synthetic-data)
- [Supervised fine-tuning](#sft)
- [Distillation, merging and compression](#distillation-merging)
- [Data selection and attribution](#data-selection-attribution)
- [Training and fine-tuning retrievers](#training-retrievers)
- [Data licensing, copyright and consent](#data-licensing-consent)
