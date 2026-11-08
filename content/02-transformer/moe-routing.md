---
id: moe-routing
book: 2
order: "2.5.1"
title: MoE routing and load balancing
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [moe, routing, load-balancing, experts, sparsity]
visuals: []
prerequisites: [mixture-of-experts]
---
> [!tldr]
> The router decides which experts see each token, and most of the engineering in a mixture-of-experts model goes into keeping that decision balanced, stable and cheap. Balancing pressure (an auxiliary loss or per-expert biases), router numerics (float32 and the z-loss) and capacity rules (drop overflow tokens or not) shape both quality and speed. Remember that routing decides speed as much as quality: an overloaded expert becomes a bottleneck when experts sit on different devices, and where tokens are dropped, other requests in the batch can change your output.

## Key ideas

- **Token choice, expert choice and the gate.** Almost every MoE uses token-choice top-k routing: each token scores all experts and keeps its k best, with the scores normalized either over all experts before top-k (a softmax in DeepSeek V1 and V2, Grok and Qwen) or only over the survivors after it (Mixtral, DBRX and DeepSeek-V3), and early work made routing stochastic with Gaussian noise ([Hashimoto, CS336 lecture 4: Mixtures of experts](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%204%20-%20MoEs.pdf) (2025)). DeepSeek-V3 also swaps the softmax for sigmoid scores (DeepSeek-AI, [“DeepSeek-V3 Technical Report”](https://arxiv.org/abs/2412.19437) (2024)). In expert choice, each expert picks its top tokens instead, which fixes every expert's load, but its authors note it might not immediately apply to autoregressive generation, because their implementation looks at past and future tokens to select (Zhou et al., [“Mixture-of-Experts with Expert Choice Routing”](https://arxiv.org/abs/2202.09368) (2022)).
- **Balance matters, but balancing pressure costs quality.** Unbalanced load risks routing collapse, where the model keeps picking the same few experts, and it creates computation bottlenecks when experts sit on different devices (Wang et al., [“Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts”](https://arxiv.org/abs/2408.15664) (2024)). Switch Transformer adds an auxiliary loss α · N · Σ fᵢ · Pᵢ, the product of each expert's share of tokens and its share of router probability, with α = 10⁻² (Fedus et al., [“Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity”](https://arxiv.org/abs/2101.03961) (2021)), and DeepSeek V1 and V2 add it per expert and again aggregated per device ([CS336 lecture 4](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%204%20-%20MoEs.pdf)). A large auxiliary loss adds gradients that interfere with training, so loss-free balancing adds a per-expert bias to the routing scores, used only to pick the top k, and nudges it up for underloaded experts and down for overloaded ones after each step ([Wang et al.](https://arxiv.org/abs/2408.15664)); DeepSeek-V3 pairs it with a small sequence-wise balance loss ([DeepSeek-V3 report](https://arxiv.org/abs/2412.19437)).
- **Keep the router numerically calm.** Switch Transformer computes only the router in float32 and keeps the rest in bfloat16, which it calls selective precision ([Fedus et al.](https://arxiv.org/abs/2101.03961)). At larger scale that was not enough, and ST-MoE added the router z-loss, which penalizes large logits entering the router and stabilized training without quality loss in its experiments (Zoph et al., [“ST-MoE: Designing Stable and Transferable Sparse Expert Models”](https://arxiv.org/abs/2202.08906) (2022)).
- **Capacity, dropped tokens and dropless MoE.** With a fixed expert capacity of (tokens per batch ÷ number of experts) × capacity factor, tokens sent to a full expert skip the layer and pass through the residual connection ([Fedus et al.](https://arxiv.org/abs/2101.03961)). MegaBlocks recasts MoE computation as block-sparse matrix multiplication, so it never drops tokens and no longer pads every expert to a fixed capacity, only each expert's batch to a multiple of the block size (Gale et al., [“MegaBlocks: Efficient Sparse Training with Mixture-of-Experts”](https://arxiv.org/abs/2211.15841) (2022)), and DeepSeek-V3 reports dropping no tokens in training or inference ([DeepSeek-V3 report](https://arxiv.org/abs/2412.19437)). Where dropping remains, it is decided over the whole batch, so other users' requests can drop your token, one source of [inference nondeterminism](#inference-nondeterminism) ([CS336 lecture 4](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%204%20-%20MoEs.pdf)).
- **Fine-grained and shared experts, and how to read a config.** DeepSeekMoE splits experts into many smaller ones, activates more of them, and adds a few always-on shared experts for common knowledge (Dai et al., [“DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models”](https://arxiv.org/abs/2401.06066) (2024)), while OLMoE's ablations found gains from fine-grained experts and none from shared ones ([CS336 lecture 4](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%204%20-%20MoEs.pdf)). DeepSeek-V3's config lists `n_routed_experts: 256`, `n_shared_experts: 1`, `num_experts_per_tok: 8`, `scoring_func: sigmoid` and `first_k_dense_replace: 3` ([config.json](https://huggingface.co/deepseek-ai/DeepSeek-V3/blob/main/config.json)): 8 routed experts plus the shared one per token, in every layer except the first three, which stay dense ([DeepSeek-V3 report](https://arxiv.org/abs/2412.19437)).
- **Upcycling and fine-tuning.** Sparse upcycling starts an MoE from a dense checkpoint; upcycled T5 and Vision Transformer models beat their dense parents using about 50% of the original dense pretraining cost (Komatsuzaki et al., [“Sparse Upcycling: Training Mixture-of-Experts from Dense Checkpoints”](https://arxiv.org/abs/2212.05055) (2022)). Sparse models overfit small fine-tuning sets more easily, and ST-MoE found that updating only the non-MoE parameters works about as well as updating all of them, while updating only the experts degrades quality sharply ([Zoph et al.](https://arxiv.org/abs/2202.08906)).

## Planned visuals

- **`stepper`:** one batch through a top-2 router with a capacity factor: router scores, top-k selection, an overflowing hot expert, a dropped token riding the residual connection, then the same batch under dropless kernels.
- **`compare`:** auxiliary-loss balancing next to per-expert bias balancing, highlighting where the balancing signal enters: the loss and its gradients, or only the top-k selection.
- **`calculator`:** total and active parameters from an MoE config (layers, dense layers, routed, shared and active experts, expert width), with tests against a published config.

## Talk like an expert

Experts talk about token choice and expert choice, top-k, aux loss and loss-free balancing, router z-loss, capacity factor, dropped tokens and dropless kernels, fine-grained and shared experts, and upcycling; they describe an MoE as "routed, shared, active" and watch expert load as a metric in both training and serving.

## Go deeper

- Fedus et al., [“Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity”](https://arxiv.org/abs/2101.03961) (2021).
- Zoph et al., [“ST-MoE: Designing Stable and Transferable Sparse Expert Models”](https://arxiv.org/abs/2202.08906) (2022).
- Wang et al., [“Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts”](https://arxiv.org/abs/2408.15664) (2024).
- Hashimoto, [Stanford CS336 lecture 4: Mixtures of experts](https://raw.githubusercontent.com/stanford-cs336/spring2025-lectures/main/nonexecutable/2025%20Lecture%204%20-%20MoEs.pdf) (2025), slides.

## Related

- [Mixture of Experts](#mixture-of-experts)
- [Parallelism strategies and collective communication](#parallelism-strategies)
- [Training stability: loss spikes and divergence](#training-stability)
- [Nondeterminism and reproducible inference](#inference-nondeterminism)
- [Serving mixture-of-experts models](#moe-serving)
- [Serving engines](#serving-engines)
