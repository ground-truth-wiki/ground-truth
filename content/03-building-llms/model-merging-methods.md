---
id: model-merging-methods
book: 3
order: "3.9.2"
title: Model merging methods
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [model-merging, task-vectors, ties, mergekit, open-weights]
visuals: []
prerequisites: [distillation-merging]
---
> [!tldr]
> Model merging combines the weights of several fine-tuned models into one model, with no gradient training and no extra cost at inference. It works because fine-tunes of the same base model stay close together in weight space, and the methods differ mainly in how they stop the fine-tunes' changes from cancelling each other out. The one thing to remember: merge only models that share a base, and test the merge against each parent on the skill that parent was good at.

## Key ideas

- **Averaging, soups and interpolation.** Averaging the weights of models fine-tuned from one pretrained model with different hyperparameters, a "model soup", can improve accuracy and robustness without adding inference or memory cost ([Wortsman et al., “Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time” (2022)](https://arxiv.org/abs/2203.05482)). It works because fine-tuned weights "remain linearly mode connected when sharing the same pre-training" ([Ramé et al., “WARM: On the Benefits of Weight Averaged Reward Models” (2024)](https://arxiv.org/abs/2401.12187)); SLERP interpolates along a sphere between exactly two models, and Model Stock chooses the interpolation weight geometrically from a base and two or more fine-tunes ([mergekit merge method guide](https://github.com/arcee-ai/mergekit/blob/main/docs/merge_methods.md)), which its authors report beats Model Soup while using only two fine-tuned models ([Jang et al., “Model Stock: All we need is just a few fine-tuned models” (2024)](https://arxiv.org/abs/2403.19522)).
- **Task vectors.** A task vector is a fine-tuned model's weights minus its pretrained weights. Adding task vectors can improve several tasks at once, negating one weakens that task with little effect elsewhere, and "A is to B as C is to D" analogies can improve a task without training data for it ([Ilharco et al., “Editing Models with Task Arithmetic” (2022)](https://arxiv.org/abs/2212.04089)).
- **Interference, and the fixes.** TIES targets "redundant parameter values" and sign disagreement between models: it trims parameters that changed only slightly, elects one sign per parameter, and merges only the values that agree with it ([Yadav et al., “TIES-Merging: Resolving Interference When Merging Models” (2023)](https://arxiv.org/abs/2306.01708)). DARE randomly drops delta parameters and rescales the rest; for supervised fine-tunes it can drop 99% of them, and merging WizardLM with WizardMath this way raised WizardLM's zero-shot GSM8K accuracy from 2.2 to 66.3, above WizardMath's own 64.2 ([Yu et al., “Language Models are Super Mario: Absorbing Abilities from Homologous Models as a Free Lunch” (2023)](https://arxiv.org/abs/2311.03099v1)).
- **The toolkit.** The open-source mergekit library implements linear, SLERP, task arithmetic, TIES, DARE, DELLA (adaptive magnitude-based pruning of deltas), Model Breadcrumbs (dropping both the smallest and the largest deltas), Model Stock and passthrough, which assembles "Frankenmerges" from unmodified layer ranges ([mergekit merge method guide](https://github.com/arcee-ai/mergekit/blob/main/docs/merge_methods.md)). Its mergekit-moe script merges several dense models into a mixture of experts, and its `tokenizer` and `chat_template` settings decide the merged vocabulary and chat template ([mergekit README](https://github.com/arcee-ai/mergekit)).
- **Searching for recipes, and merging adapters and reward models.** Evolutionary search can find merge recipes automatically "in both parameter space and data flow space", which produced a Japanese language model with math reasoning and a culturally aware Japanese vision-language model ([Akiba et al., “Evolutionary Optimization of Model Merging Recipes” (2024), Nature Machine Intelligence 2025](https://arxiv.org/abs/2403.13187v2)). Hugging Face PEFT merges a LoRA adapter into its base weights and combines adapters with methods such as `svd`, `cat`, `ties` and `dare_linear`, and warns that plain `linear` is "a very rough approximation" ([PEFT LoRA guide](https://huggingface.co/docs/peft/developer_guides/lora)); WARM averages several reward models trained from one initialization to resist reward hacking and distribution shift ([Ramé et al. (2024)](https://arxiv.org/abs/2401.12187)).
- **Merging inside lab pipelines, and the alternative.** Cohere's Command A report names "model merging techniques" as part of its "decentralised training approach" ([Team Cohere, “Command A: An Enterprise-Ready Large Language Model” (2025)](https://arxiv.org/abs/2504.00698)). Lambert's RLHF book gives branch-train-merge and Command A as examples of training specialized models and merging their weights, and describes multi-teacher on-policy distillation (MOPD), where domain teachers are distilled into one student, as another way to combine skills ([Lambert, *Reinforcement Learning from Human Feedback*, chapter 3, “Training Overview”](https://rlhfbook.com/c/03-training-overview)).

## Planned visuals

- **`stepper`: TIES and DARE, step by step.** Three small task vectors are computed against the base, then trimmed (TIES) or randomly dropped and rescaled (DARE), signs are elected, the agreeing values are merged and added back to the base; each frame shows which entries survive.
- **`tree`: choosing a merge method.** Branches on the questions that decide it: do the models share a base, how many models are there, do you want to interpolate, combine task vectors, stack layers or build a mixture of experts, and are the inputs full models or LoRA adapters.
- **`diagram`: merging versus multi-teacher distillation in a post-training pipeline.** One base branches into specialist fine-tunes, which either merge in weight space or teach one student on-policy; both paths end at an eval against every specialist.

## Talk like an expert

Experts speak of the base model, task vectors (deltas from the base), interference, sign conflicts, drop rate and density, and passthrough "Frankenmerges". The first questions about any merge are what the shared base is and whether the merge beats each parent on that parent's own eval, not only on a leaderboard average.

## Go deeper

- Goddard et al., [“Arcee's MergeKit: A Toolkit for Merging Large Language Models”](https://aclanthology.org/2024.emnlp-industry.36/) (EMNLP 2024 Industry Track), with the [mergekit repository](https://github.com/arcee-ai/mergekit) and its [merge method guide](https://github.com/arcee-ai/mergekit/blob/main/docs/merge_methods.md).
- Ilharco et al., [“Editing Models with Task Arithmetic”](https://arxiv.org/abs/2212.04089) (2022).
- Yadav et al., [“TIES-Merging: Resolving Interference When Merging Models”](https://arxiv.org/abs/2306.01708) (2023).
- Akiba et al., [“Evolutionary Optimization of Model Merging Recipes”](https://arxiv.org/abs/2403.13187v2) (2024).

## Related

- [Distillation, merging and compression](#distillation-merging)
- [Parameter-efficient fine-tuning methods](#peft-methods)
- [Reward models and preference data](#reward-modeling)
- [Distillation for LLMs: soft labels, on-policy and multi-teacher](#llm-distillation)
- [Post-training: from base model to assistant](#post-training-overview)
- [The open-weight frontier](#open-weight-frontier)
