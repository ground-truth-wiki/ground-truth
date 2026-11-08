---
id: distillation-merging
book: 3
order: "3.9"
title: Distillation, merging and compression
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [distillation, merging, pruning]
visuals:
  - distill-diagram:diagram
  - merge-compare:compare
---
> [!tldr]
> Distillation trains a smaller student to imitate a larger teacher’s outputs or probabilities; merging combines the weights of several fine-tuned models into one; pruning and quantization shrink a model directly. Together they turn expensive frontier capability into cheap, fast models.

## Why it matters
Many small models people use daily were distilled from larger ones, and merging is a popular way to combine skills in open models without more training. For product teams, distilling a large model’s behavior on your task into a small model is often the biggest cost and latency win available.

## Intuition
Distillation is an apprentice learning from a master’s work, not only from the textbook. Merging is blending two experts’ notebooks into one, which works surprisingly often when both started from the same textbook.

```viz
{"id":"distill-diagram","component":"diagram","title":"A student learns from the teacher’s answers or full probability distributions","caption":"Two common forms of distillation. Click a box for related chapters.","alt":"Diagram of knowledge distillation: prompts go to a teacher model, whose outputs or logits train a smaller student model, evaluated on the target task.","data":"illustrative","w":600,"h":180,"nodes":[
{"id":"prompts","label":"Task prompts","role":"data","x":0,"y":62,"w":130,"h":56},
{"id":"teacher","label":"Teacher","sub":"large model","role":"model","x":170,"y":0,"w":150,"h":56},
{"id":"outs","label":"Outputs or logits","role":"context","x":360,"y":0,"w":150,"h":56},
{"id":"student","label":"Student","sub":"small model","role":"model","x":360,"y":124,"w":150,"h":56,"link":"#small-local-models"},
{"id":"eval","label":"Eval","role":"tool","x":540,"y":124,"w":60,"h":56,"link":"#why-evals"}],
"edges":[{"from":"prompts","to":"teacher"},{"from":"teacher","to":"outs"},{"from":"outs","to":"student","label":"train"},{"from":"prompts","to":"student","style":"dashed"},{"from":"student","to":"eval"}]}
```

## How it works
**Distillation.** Hinton et al. (2015) trained students on teachers’ softened probability distributions, which carry more information than labels. For language models, the common forms are training on teacher-generated outputs (sequence-level distillation) and matching teacher token probabilities where available. DeepSeek released small models distilled from R1’s reasoning traces in 2025.

**Merging.** Averaging the weights of models fine-tuned from the same base (model soups, Wortsman et al., 2022) often improves robustness; task arithmetic (Ilharco et al., 2022) adds and subtracts “task vectors”; TIES and DARE reduce interference between merged changes. The mergekit library made merging common in open-model communities.

```viz
{"id":"merge-compare","component":"compare","title":"Plain averaging can blur two skills; interference-aware merging keeps more of each","caption":"Simplified. Both merge a code fine-tune and a math fine-tune of the same base model. Hover the marks.","alt":"Comparison of simple weight averaging and TIES-style merging of two fine-tuned models.","data":"illustrative","mono":false,"a":{"title":"Simple average","text":"merged = (code_model + math_model) / 2. Where the two fine-tunes changed the same weights in opposite directions, the changes cancel, and both skills weaken.","mono":false},"b":{"title":"TIES-style merge","text":"Compute each model’s change from the base, keep only the largest changes, resolve sign conflicts by majority, then add the result to the base. More of each skill survives.","mono":false},"links":[{"a":"the changes cancel, and both skills weaken.","b":"resolve sign conflicts by majority","note":"Interference between task vectors is the main failure of naive merging."},{"a":"merged = (code_model + math_model) / 2.","b":"Compute each model’s change from the base","note":"Merging works only between models that share a base."}]}
```

**Compression.** Pruning removes weights or whole structures (SparseGPT, Wanda); quantization lowers precision (see [quantization](#quantization)); both trade a little quality for size and speed.

**Terms of use.** Many providers’ terms restrict using their outputs to train competing models; check before distilling from an API.

## In practice
1. Define the task and an eval set.
2. Generate high-quality teacher outputs on real prompts, filtered by the eval’s checks.
3. Fine-tune a small model on them; compare with the teacher on the eval. See [fine-tuning in practice](#fine-tuning-practice).
4. Route traffic to the student where it meets the bar. See [gateways and routers](#gateways-routers).

## Numbers to know
> [!number]
> Rules of thumb. A few thousand to tens of thousands of teacher examples often let a small model approach the teacher on a narrow task. Merges work best between models that share a base and were fine-tuned lightly.

## Pitfalls and anti-patterns
> [!pitfall] Distilling the teacher’s mistakes
> Unfiltered teacher outputs teach errors too. Filter with checks or judges.

- **Ignoring terms of service.** Check whether distillation from a provider is allowed.
- **Merging models with different bases.** The result is usually broken.

## Talk like an expert
The vocabulary: **teacher**, **student**, **soft labels**, **sequence-level distillation**, **model soup**, **task vector**, **TIES**, **DARE**, **pruning**. Experts ask whether a small model was distilled and from what. The live debate is how much of a frontier model’s capability can be distilled cheaply, and what that means for competition and safety.

> [!hottake] For most production tasks, a distilled small model beats the frontier model on cost per correct answer.
> **The counterargument:** tasks drift, and a small distilled model can fail badly on inputs outside its training distribution, where a frontier model would cope.

## Check yourself
```quiz
distillation-merging
```

## Go deeper
- Hinton, Vinyals and Dean, “Distilling the Knowledge in a Neural Network” (2015).
- Wortsman et al., “Model soups” (2022); Ilharco et al., “Editing Models with Task Arithmetic” (2022); Yadav et al., “TIES-Merging” (2023).

## Related
- [Fine-tuning in practice](#fine-tuning-practice)
- [Small and local models](#small-local-models)
- [Quantization](#quantization)
- [Supervised fine-tuning](#sft)
- [Cost engineering](#cost-engineering)
