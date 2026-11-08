---
id: long-context-training
book: 3
order: "3.4.1"
title: Long-context extension during training
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [long-context, context-extension, mid-training, rope, data]
visuals: []
prerequisites: [mid-training, positional-encoding]
---
> [!tldr]
> Language models are pretrained mostly on short sequences and learn long context late, in a stage of continued pretraining on long documents with adjusted position encoding. This is cheaper than training long from the start, and it decides whether a model can use its advertised window or only accept it. Remember that context extension is a data and evaluation problem as much as a position-encoding problem.

## Key ideas

- **Train short, extend late.** Llama 3 did not train on long sequences earlier because self-attention compute grows quadratically with sequence length ([Llama Team, “The Llama 3 Herd of Models” (2024)](https://arxiv.org/html/2407.21783v3)), and Xiong et al. found continual pretraining from a short-context model "more efficient and similarly effective" than pretraining with long sequences from scratch, saving about 40% of the FLOPs in their setup ([Xiong et al., “Effective Long-Context Scaling of Foundation Models” (2023)](https://arxiv.org/html/2309.16039v3)).
- **Extension runs in stages.** Llama 3 (2024) grew from 8K to 128K in six stages over about 800B tokens, and moved to the next stage only after short-context performance had fully recovered and needle-in-a-haystack retrieval was perfect at the current length ([Llama Team, 2024](https://arxiv.org/html/2407.21783v3)). DeepSeek-V3 (2024) used YaRN in two phases of 1,000 steps each, from 4K to 32K and then to 128K ([DeepSeek-AI, “DeepSeek-V3 Technical Report” (2024)](https://arxiv.org/html/2412.19437v2)), and Olmo 3 (2025) has its own long-context stage, Dolma 3 Longmino, with about 50B training tokens drawn from a 639B-token pool of long documents ([Ai2, “Olmo 3: Charting a path through the model flow to lead open-source AI” (2025)](https://allenai.org/blog/olmo3)).
- **Raise the RoPE base or interpolate positions.** Xiong et al. raised RoPE's base frequency from 10,000 to 500,000, which they call adjusted base frequency (ABF), to weaken the decay of attention to distant tokens ([Xiong et al., 2023](https://arxiv.org/html/2309.16039v3)), and Llama 3 also uses a base of 500,000 ([Llama Team, 2024](https://arxiv.org/html/2407.21783v3)). Interpolation methods rescale the rotation frequencies instead: YaRN scales high frequencies less and low frequencies more, and adds a temperature to the attention logits ([Peng et al., “YaRN: Efficient Context Window Extension of Large Language Models” (2023)](https://arxiv.org/abs/2309.00071)). The position math is in [RoPE scaling and context extension](#rope-scaling).
- **The data mix matters, and the amount can be modest.** Fu et al. found that 500M to 5B tokens of continual pretraining were enough for retrieval anywhere in a 128K context, that domain balance matters as much as length upsampling, and that naively upsampling long documents from domains such as books gives suboptimal results ([Fu et al., “Data Engineering for Scaling Language Models to 128K Context” (2024)](https://arxiv.org/abs/2402.10171)). Gao et al. found code repositories and books to be strong long-data sources when mixed with high-quality short data, and that training at lengths beyond the evaluation length helps; their ProLong-8B used 40B tokens ([Gao et al., “How to Train Long-Context Language Models (Effectively)” (2024)](https://arxiv.org/abs/2410.02660)).
- **Long sequences need masking and parallelism.** Llama 3 masks attention between different documents packed into one sequence, which had limited impact in standard pretraining but was important in continued pretraining on very long sequences, and it uses context parallelism, splitting each sequence into chunks across GPUs and all-gathering keys and values before computing attention ([Llama Team, 2024](https://arxiv.org/html/2407.21783v3)). The parallelism layouts are covered in [Parallelism strategies and collective communication](#parallelism-strategies).
- **Evaluate real use and protect short-context quality.** HELMET, a benchmark of seven application-centric categories at lengths up to 128K, finds that synthetic tests such as needle-in-a-haystack do not reliably predict downstream performance ([Yen et al., “HELMET: How to Evaluate Long-Context Language Models Effectively and Thoroughly” (2024)](https://arxiv.org/abs/2410.02694)), and Gao et al. evaluate on downstream long-context tasks after supervised fine-tuning instead of perplexity or needles ([Gao et al., 2024](https://arxiv.org/abs/2410.02660)). Gating each stage on short-context recovery, as Llama 3 did, and mixing in short data, as ProLong did, are two documented ways to keep short-context skills intact.

## Planned visuals

- **`stepper`:** a staged extension schedule, one frame per stage: the new sequence length, the RoPE base or scaling change, the data mix, and the gate (short-context recovery and long-context checks) before the next stage.
- **`budget`:** a long-context data mix as a stacked bar of code repositories, books and high-quality short data, using a published mix with its source (real, dated).
- **`compare`:** a needle-in-a-haystack test next to an application-centric long-context task, showing why a model can pass the first and fail the second.

## Talk like an expert

Experts talk about ABF, position interpolation, YaRN, length upsampling, domain balance, document masking and context parallelism, and they quote the token budget of the long-context stage. They ask how short-context quality held up and which tasks beyond needles were used to judge the extension.

## Go deeper

- Xiong et al., [“Effective Long-Context Scaling of Foundation Models”](https://arxiv.org/abs/2309.16039) (2023).
- Fu et al., [“Data Engineering for Scaling Language Models to 128K Context”](https://arxiv.org/abs/2402.10171) (2024).
- Gao et al., [“How to Train Long-Context Language Models (Effectively)”](https://arxiv.org/abs/2410.02660) (2024).
- Llama Team, [“The Llama 3 Herd of Models”](https://arxiv.org/abs/2407.21783) (2024), section 3.4.2 on long-context pretraining.

## Related

- [Mid-training](#mid-training)
- [RoPE scaling and context extension](#rope-scaling)
- [Efficient attention and long context](#long-context)
- [Parallelism strategies and collective communication](#parallelism-strategies)
- [Data mixtures, repetition and curricula](#data-mixing)
