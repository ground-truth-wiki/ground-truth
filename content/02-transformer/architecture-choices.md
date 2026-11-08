---
id: architecture-choices
book: 2
order: "2.4.2"
title: Architecture choices in modern LLMs
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [architecture, rmsnorm, swiglu, qk-norm, hyperparameters]
visuals: []
prerequisites: [transformer-block]
---
> [!tldr]
> Most open LLMs start from a “Llama-like” decoder block: pre-norm RMSNorm, no bias terms, a SwiGLU feed-forward layer, RoPE and grouped-query attention, sized by a few shared conventions. What varies around that baseline is where the norms sit, which stability components are added (QK-norm, z-loss, logit soft-capping) and how attention layers are laid out. Remember that these are small, empirically motivated choices: read each one together with its ablation, its scale and its date.

## Key ideas

- **The baseline and where the norms go.** Almost all modern LMs use pre-norm (BERT was post-norm), most use RMSNorm, which skips LayerNorm's mean subtraction and bias, and most drop bias terms for memory and stability reasons (Hashimoto, [CS336 Lecture 3: Architectures, hyperparameters](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf) (2025)); pre-norm keeps gradients well behaved at initialization, so the learning-rate warm-up can be dropped (Xiong et al., [“On Layer Normalization in the Transformer Architecture”](https://arxiv.org/abs/2002.04745) (2020)). Some models add norms on sublayer outputs: Gemma 2 normalizes both the input and the output of each sublayer ([Gemma 2 report](https://arxiv.org/abs/2408.00118)), and OLMo 2 normalizes outputs instead of inputs and adds QK-norm, two changes that failed alone but together cut its gradient spike score from 0.108 to 0.069 (Team OLMo et al., [“2 OLMo 2 Furious”](https://arxiv.org/abs/2501.00656) (2024)).
- **Gated feed-forward layers and the 8/3 rule.** GLU variants such as SwiGLU and GeGLU add a third weight matrix, so the hidden size is cut to 2/3 to keep parameters and compute constant (Shazeer, [“GLU Variants Improve Transformer”](https://arxiv.org/abs/2002.05202) (2020)); against the classic d_ff = 4 × d_model, that gives about 8/3 × d_model. Real models sit near it: the CS336 lecture lists ratios from 2.5 to 4, with outliers such as Gemma 2 at 8 ([lecture 3](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf)), and Llama 3 8B pairs a model dimension of 4,096 with an FFN dimension of 14,336, a ratio of 3.5 ([Llama 3 report](https://arxiv.org/html/2407.21783v3)).
- **Serial or parallel blocks.** PaLM computes attention and the MLP side by side from one normalized input, y = x + MLP(LN(x)) + Attention(LN(x)), for roughly 15% faster training at large scale, with a small quality loss at 8B parameters and none at 62B; it also used SwiGLU, no biases and shared input and output embeddings (Chowdhery et al., [“PaLM”](https://arxiv.org/abs/2204.02311) (2022)).
- **Sizing conventions.** Heads × head dimension usually equals d_model, d_model ÷ layers mostly falls between about 100 and 200, vocabularies run 30K to 50K tokens for monolingual models and 100K to 250K for multilingual and production systems, and newer open models mostly skip dropout in pretraining and keep weight decay ([CS336 lecture 3](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf)). [Qwen3-8B's config](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json) is a typical example: 32 heads × 128 = 4,096 hidden size, 8 key-value heads, 36 layers and an intermediate size of 12,288.
- **Stability components are architecture options.** QK-norm applies RMSNorm to queries and keys to keep attention logits from growing too large, and z-loss keeps the final output logits from growing; OLMo 2 adopted both ([OLMo 2](https://arxiv.org/abs/2501.00656)). Logit soft-capping computes soft_cap × tanh(logits / soft_cap), with 50.0 in attention and 30.0 at the final layer in Gemma 2 ([Gemma 2 report](https://arxiv.org/abs/2408.00118)), and Gemma 3 replaced it with QK-norm ([Gemma 3 report](https://arxiv.org/abs/2503.19786)); the failures these components prevent are covered in [training stability](#training-stability).
- **Attention layout options.** Llama 3 uses grouped-query attention with 8 key-value heads ([Llama 3 report](https://arxiv.org/html/2407.21783v3)); Gemma 3 interleaves 5 local sliding-window layers with a 1,024-token span per global layer ([Gemma 3 report](https://arxiv.org/abs/2503.19786)); SmolLM3 drops RoPE from every 4th layer ([Hugging Face, July 2025](https://huggingface.co/blog/smollm3)); and in a comparison of 30 gated-attention variants, a head-specific sigmoid gate after attention consistently improved quality and training stability (Qiu et al., [“Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free”](https://arxiv.org/abs/2505.06708) (2025)). For a dated, model-by-model view, see Raschka's comparison, which as of November 2026 was last updated in April 2026 (Raschka, [“The Big LLM Architecture Comparison”](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison) (2025)).

## Planned visuals

- **`compare`:** post-norm, pre-norm and OLMo 2's output norm as block formulas side by side, with linked highlights on where the norm touches the residual stream.
- **`matrix`:** a dated table of open models and their choices (norm placement, activation, d_ff ÷ d_model, QK-norm, soft-capping, attention layout, vocabulary size), each row sourced from the model's report or config.
- **`calculator`:** from d_model to the SwiGLU intermediate size under the 8/3 rule and the head dimension for a given head count, compared with the values in a real config (formula data, with tests).

## Talk like an expert

Experts describe a new model as a Llama-like baseline plus deltas, such as “output RMSNorm, QK-norm, 5:1 local-to-global attention”, and ask for the ablation and the scale behind each delta, since effects can change with size, as PaLM's parallel layers did between 8B and 62B ([PaLM](https://arxiv.org/abs/2204.02311)).

## Go deeper

- Hashimoto, [CS336 Lecture 3: Architectures, hyperparameters](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf) (Stanford, 2025).
- Xiong et al., [“On Layer Normalization in the Transformer Architecture”](https://arxiv.org/abs/2002.04745) (2020).
- Team OLMo et al., [“2 OLMo 2 Furious”](https://arxiv.org/abs/2501.00656) (2024).
- Shazeer, [“GLU Variants Improve Transformer”](https://arxiv.org/abs/2002.05202) (2020).

## Related

- [The transformer block](#transformer-block)
- [Training stability: loss spikes and divergence](#training-stability)
- [Attention step by step](#attention)
- [Mixture of Experts](#mixture-of-experts)
- [Making deep networks trainable: initialization, normalization and residuals](#trainable-deep-networks)
- [Sparse and local attention](#sparse-and-local-attention)
