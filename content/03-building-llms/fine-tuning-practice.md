---
id: fine-tuning-practice
book: 3
order: "3.10"
title: Fine-tuning in practice
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [fine-tuning, lora, qlora, peft]
visuals:
  - lora-calculator:calculator
  - finetune-decision:tree
---
> [!tldr]
> Fine-tune when prompting and retrieval are not enough for format, style, cost or latency, and you have good examples and an eval. Parameter-efficient methods such as LoRA and QLoRA train a tiny fraction of weights on modest hardware; managed services and libraries make the process routine. Always compare against a well-prompted baseline.

## Why it matters
Fine-tuning is the most over- and under-used tool in AI engineering: over-used for adding facts (retrieval works better), under-used for making small models match large ones on a narrow task. Knowing when it pays, and how to do it cheaply and safely, is a core skill.

## Intuition
Prompting is giving instructions to a skilled contractor; fine-tuning is training an employee. Training costs more up front and pays off when the same job is done thousands of times.

```viz
{"id":"finetune-decision","component":"tree","title":"Fine-tune when behavior, cost or latency is the gap, not knowledge","caption":"Expand the problem you have. Fine-tuning is the answer to some, and the wrong tool for others.","alt":"Decision tree for when to fine-tune versus prompt, retrieve or route.","data":"illustrative","open":1,"root":{"label":"What is the gap?","children":[
{"label":"The model lacks facts or current information","children":[{"label":"Retrieval, not fine-tuning","link":"#rag-fundamentals"}]},
{"label":"Output format or style is inconsistent","children":[{"label":"Better prompts and structured outputs first; fine-tune if it persists","link":"#structured-outputs"}]},
{"label":"A large model works but is too slow or costly","children":[{"label":"Fine-tune or distill a small model on its outputs","link":"#distillation-merging"}]},
{"label":"A narrow task with many labeled examples","children":[{"label":"Fine-tune; compare against few-shot prompting"}]},
{"label":"Outputs can be checked automatically","children":[{"label":"Reinforcement fine-tuning on the checks","link":"#rlvr-reasoning"}]}]}}
```

## How it works
**Full fine-tuning** updates every weight: most flexible, most memory, and it can erase general skills.

**LoRA.** Hu et al. (2021) freeze the base weights and learn a low-rank update B × A for selected matrices, so only r × (d_in + d_out) parameters per matrix are trained:

```viz
{"id":"lora-calculator","component":"calculator","title":"Rank-16 LoRA on four attention matrices of a 7B-class model trains about 17 million parameters, under 1% of them","caption":"Formula view for square d × d projection matrices. Defaults: d = 4,096, 32 layers, LoRA on q, k, v and o. Trainable parameters per matrix = r × 2d.","alt":"Calculator for LoRA trainable parameters and their share of the adapted weights from width, layers, matrices per layer and rank.","data":"formula","outputs":[{"id":"lora_params","label":"LoRA trainable parameters","expr":"layers * matrices * rank * 2 * d_model","unit":"count","main":true},{"id":"adapted","label":"Parameters in adapted matrices","expr":"layers * matrices * d_model * d_model","unit":"count"},{"id":"share","label":"Trainable share of adapted matrices","expr":"lora_params / adapted","unit":"pct"}],"inputs":{"d_model":4096,"layers":32,"matrices":4,"rank":16},"input_meta":{"d_model":{"label":"Model width d"},"layers":{"label":"Layers"},"matrices":{"label":"Adapted matrices per layer","unit":"e.g. 4 for q, k, v, o"},"rank":{"label":"LoRA rank r"}},"assumptions":["Square projections; grouped-query k and v matrices are smaller in practice.","Feed-forward matrices can be adapted too, at higher cost."],"tests":[{"inputs":{},"expect":{"lora_params":16777216,"adapted":2147483648,"share":0.0078125}},{"inputs":{"rank":8},"expect":{"lora_params":8388608}}]}
```

**QLoRA.** Dettmers et al. (2023) train LoRA adapters on a 4-bit quantized base, making fine-tunes of large models possible on a single GPU. Variants such as DoRA refine the update.

**Tooling.** Hugging Face TRL and PEFT, Unsloth, Axolotl and torchtune for open models; managed fine-tuning and reinforcement fine-tuning APIs from providers for hosted models.

**Serving adapters.** Engines can serve many LoRA adapters on one base model, switching per request. See [serving engines](#serving-engines).

## In practice
1. Establish a baseline: the best prompt, few-shot examples and retrieval on a strong model.
2. Collect or generate a few hundred to a few thousand examples; hold out an eval set. See [SFT](#sft).
3. Start with LoRA at a modest rank on a small model; tune learning rate and epochs.
4. Evaluate on the task and on general skills; compare cost and latency with the baseline.
5. Version the dataset, adapter and eval results together.

## Numbers to know
> [!number]
> Formulas and rules of thumb. LoRA parameters per matrix = r × (d_in + d_out). Ranks of 8 to 64 are common. QLoRA lets models with tens of billions of parameters be fine-tuned on one high-memory GPU.

## Pitfalls and anti-patterns
> [!pitfall] Fine-tuning to add knowledge
> Facts learned in fine-tuning are unreliable and go stale. Use retrieval for knowledge, fine-tuning for behavior.

- **No baseline.** Many fine-tunes do not beat a good prompt.
- **Overfitting.** Too many epochs on small data memorize examples.
- **Forgetting general skills.** Check them after every fine-tune.

## Talk like an expert
The vocabulary: **full fine-tuning**, **parameter-efficient fine-tuning (PEFT)**, **LoRA rank**, **QLoRA**, **adapter**, **multi-LoRA serving**, **reinforcement fine-tuning**, **catastrophic forgetting**. Experts quote the baseline they beat and by how much. The live debate is how often fine-tuning is worth it as base models improve and context windows grow.

> [!hottake] The best fine-tuning project is the one you replace with a prompt.
> **The counterargument:** at scale, a fine-tuned small model is often an order of magnitude cheaper and faster than prompting a large one, which no prompt can match.

## Check yourself
```quiz
fine-tuning-practice
```

## Go deeper
- Hu et al., “LoRA: Low-Rank Adaptation of Large Language Models” (2021).
- Dettmers et al., “QLoRA: Efficient Finetuning of Quantized LLMs” (2023).
- Hugging Face TRL and PEFT documentation.

## Related
- [Supervised fine-tuning](#sft)
- [Distillation, merging and compression](#distillation-merging)
- [RL with verifiable rewards](#rlvr-reasoning)
- [Small and local models](#small-local-models)
- [Linear algebra for AI](#linear-algebra)
