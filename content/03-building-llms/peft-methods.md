---
id: peft-methods
book: 3
order: "3.10.1"
title: Parameter-efficient fine-tuning methods
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [peft, lora, qlora, adapters, fine-tuning]
visuals: []
prerequisites: [fine-tuning-practice]
---
> [!tldr]
> Parameter-efficient fine-tuning (PEFT) freezes a pretrained model and trains a small add-on: low-rank matrices (LoRA and its variants), small inserted layers (adapters), learned prompt vectors, or scaling vectors. LoRA gets the most attention because it is cheap to train, can be merged into the weights for serving, and with the right settings matches full fine-tuning on many post-training workloads. The one thing to remember: put LoRA on all layers, give it a higher learning rate than full fine-tuning, and expect it to learn less and forget less.

## Key ideas

- **LoRA mechanics.** LoRA freezes the pretrained weights and trains a low-rank update B × A beside selected matrices, which adds "no additional inference latency" once merged; on GPT-3 175B it cut trainable parameters by 10,000 times and GPU memory by about 3 times compared with full fine-tuning with Adam ([Hu et al., “LoRA: Low-Rank Adaptation of Large Language Models” (2021)](https://arxiv.org/abs/2106.09685)). In Hugging Face PEFT, A starts from a Kaiming-uniform initialization and B from zeros, so the adapter begins as an identity transform; the update is scaled by `lora_alpha/r`; `target_modules="all-linear"` adapts every linear layer as QLoRA does; and mixture-of-experts layers that store experts as raw parameters need `target_parameters` ([PEFT LoRA guide](https://huggingface.co/docs/peft/developer_guides/lora)).
- **What LoRA learns and forgets.** On code and math, LoRA "substantially underperforms full finetuning" in both instruction tuning and continued pretraining, but "better maintains the base model's performance on tasks outside the target domain"; full fine-tuning learned weight changes of 10 to 100 times higher rank than typical LoRA settings ([Biderman et al., “LoRA Learns Less and Forgets Less” (2024)](https://arxiv.org/abs/2405.09673v2)). On small and medium post-training datasets, LoRA matched full fine-tuning when applied to all layers, especially the MLPs; its best learning rate was about 10 times the full fine-tuning one and nearly independent of rank thanks to the 1/r scaling; it tolerated large batches less well; and for reinforcement learning even rank 1 matched, because a policy-gradient episode carries only about one bit of information ([Schulman and Thinking Machines, “LoRA Without Regret” (2025)](https://thinkingmachines.ai/blog/lora/)).
- **Scaling, learning rates and initializations.** rsLoRA scales by `lora_alpha/sqrt(r)` to stabilize higher ranks; LoRA+ uses different learning rates for A and B (the documented example ratio is 16); and PiSSA (principal singular vectors), OLoRA (QR decomposition) and EVA (SVD of input activations) replace the default initialization ([PEFT LoRA guide](https://huggingface.co/docs/peft/developer_guides/lora)). DoRA splits each weight into a magnitude and a direction, trains the direction with LoRA, and merges back so serving costs nothing extra ([Liu et al., “DoRA: Weight-Decomposed Low-Rank Adaptation” (2024)](https://arxiv.org/html/2402.09353v4)).
- **QLoRA and LoftQ.** QLoRA trains LoRA adapters on a frozen 4-bit base using the 4-bit NormalFloat (NF4) data type, double quantization of the quantization constants, and paged optimizers that absorb memory spikes, which let a 65B model be fine-tuned on one 48 GB GPU "while preserving full 16-bit finetuning task performance" ([Dettmers et al., “QLoRA: Efficient Finetuning of Quantized LLMs” (2023)](https://arxiv.org/abs/2305.14314)). LoftQ initializes the adapters so that the quantization error of the base is minimized ([PEFT LoRA guide](https://huggingface.co/docs/peft/developer_guides/lora)).
- **The older families, and full fine-tuning on less memory.** Bottleneck adapters insert small trainable modules into a frozen network and came within 0.4% of full fine-tuning on GLUE while adding 3.6% parameters per task ([Houlsby et al., “Parameter-Efficient Transfer Learning for NLP” (2019)](https://arxiv.org/abs/1902.00751)); prompt tuning trains virtual token embeddings at the input, prefix tuning trains prefix vectors in all layers, and P-tuning optimizes input prompts with an LSTM encoder ([PEFT soft prompts guide](https://huggingface.co/docs/peft/main/conceptual_guides/prompting)), while (IA)3 rescales keys, values and feed-forward activations with learned vectors ([PEFT IA3 guide](https://huggingface.co/docs/peft/main/conceptual_guides/ia3)). GaLore instead trains every parameter but projects gradients to low rank, cutting optimizer-state memory by up to 65.5% ([Zhao et al., “GaLore: Memory-Efficient LLM Training by Gradient Low-Rank Projection” (2024)](https://arxiv.org/abs/2403.03507)).
- **Composing and serving adapters.** An adapter can be merged into the base (`merge_and_unload`) or kept separate, so one batch can mix requests for different adapters, an inference-only feature that does not work after merging. Adapters can be combined into a new one with `add_weighted_adapter`, and activated LoRA (aLoRA) switches on only after an invocation sequence, so it reuses the base model's KV cache for earlier tokens but cannot be merged ([PEFT LoRA guide](https://huggingface.co/docs/peft/developer_guides/lora)).

## Planned visuals

- **`diagram`: where each method attaches in a transformer block.** LoRA beside the linear layers, bottleneck adapters after the sublayers, prefix vectors in every attention layer, prompt tuning at the input embeddings, and (IA)3 scaling keys, values and the feed-forward activation; clicking a part opens its section.
- **`calculator`: QLoRA memory.** Inputs for parameter count, bits per base weight, LoRA rank, adapted matrices and optimizer bytes per trainable parameter; outputs for base weight memory, adapter parameters and optimizer state, with the assumptions listed (activations and KV cache excluded).
- **`tree`: choosing a method.** Branches on data size, whether the base must stay unchanged, available GPU memory, whether you serve many adapters on one base, and whether the job is supervised or reinforcement learning.

## Talk like an expert

Experts give rank, alpha, target modules and learning rate together, say whether adapters are served merged, side by side or [hot-swapped](https://huggingface.co/docs/peft/main/en/package_reference/hotswap), and frame LoRA as a capacity trade-off: enough for small and medium post-training datasets and for reinforcement learning, short of full fine-tuning when a lot of new knowledge must go in.

## Go deeper

- Hu et al., [“LoRA: Low-Rank Adaptation of Large Language Models”](https://arxiv.org/abs/2106.09685) (2021).
- Dettmers et al., [“QLoRA: Efficient Finetuning of Quantized LLMs”](https://arxiv.org/abs/2305.14314) (2023).
- Schulman and Thinking Machines, [“LoRA Without Regret”](https://thinkingmachines.ai/blog/lora/) (2025).
- The [Hugging Face PEFT LoRA developer guide](https://huggingface.co/docs/peft/developer_guides/lora).

## Related

- [Fine-tuning in practice](#fine-tuning-practice)
- [Eigenvectors, SVD and PCA](#eigenvectors-svd-pca)
- [Model merging methods](#model-merging-methods)
- [Quantization](#quantization)
- [Managed and reinforcement fine-tuning services](#fine-tuning-services)
- [Serving engines](#serving-engines)
