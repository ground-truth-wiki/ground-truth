---
id: rope-scaling
book: 2
order: "2.2.1"
title: RoPE scaling and context extension
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [rope, context-extension, yarn, positional-encoding, long-context]
visuals: []
prerequisites: [positional-encoding]
---
> [!tldr]
> RoPE scaling changes the rotation frequencies of rotary position embeddings so that a model trained on short sequences can read longer ones, usually with a short fine-tune on long documents. The methods differ in which frequencies they stretch: all of them equally (position interpolation), the slow ones more than the fast ones (NTK-aware scaling, YaRN), or each by a searched factor (LongRoPE). Remember that the scaling is part of the model: the serving engine must apply the same method and factor, and a longer window is only worth its measured effective context.

## Key ideas

- **Why plain RoPE breaks past its training length.** Beyond the trained length, RoPE meets rotation angles the model never saw, and extrapolating to them can produce catastrophically high attention scores; simply fine-tuning on longer windows adapted very slowly, moving LLaMA's effective context from 2,048 to only 2,560 tokens after more than 10,000 batches (Chen et al., [“Extending Context Window of Large Language Models via Positional Interpolation”](https://arxiv.org/abs/2306.15595) (2023)). Peng et al. add that dimensions whose wavelength is longer than the training context never complete a full turn, so they can carry absolute position information ([YaRN](https://arxiv.org/abs/2309.00071)).
- **The two simple fixes: squeeze positions or raise the base.** Position interpolation (PI) divides positions by the extension factor so that every angle stays inside the trained range, and it extended LLaMA models to 32,768 tokens within 1,000 fine-tuning steps ([Chen et al.](https://arxiv.org/abs/2306.15595)). Raising the base (`rope_theta`) slows every rotation instead: Xiong et al. raised it from 10,000 to 500,000 for long-context Llama 2 (Xiong et al., [“Effective Long-Context Scaling of Foundation Models”](https://arxiv.org/abs/2309.16039) (2023)), and Llama 3 used 500,000 from pretraining on ([Llama 3 report](https://arxiv.org/html/2407.21783v3)).
- **Non-uniform scaling protects local detail.** Stretching every dimension equally removes RoPE's high frequencies, and PI fine-tunes degraded beyond about 8×; “NTK-aware” scaling instead stretches high frequencies less and low frequencies more, most simply through a base change, and “Dynamic NTK” recomputes it for the current length. YaRN's “NTK-by-parts” step leaves short-wavelength dimensions alone, fully interpolates those whose wavelength reaches the trained context, and blends those in between. YaRN then adds a temperature to the attention logits, and it needed 10 times fewer tokens and 2.5 times fewer training steps than earlier methods (Peng et al., [“YaRN: Efficient Context Window Extension of Large Language Models”](https://arxiv.org/abs/2309.00071) (2023)).
- **Searched and family-specific schemes.** LongRoPE searches rescale factors per RoPE dimension and leaves the first tokens uninterpolated; it reached 2,048K tokens with up to 1K fine-tuning steps at training lengths of at most 256K, then readjusted at 8K to recover short-context quality (Ding et al., [“LongRoPE”](https://arxiv.org/abs/2402.13753) (2024)). As of November 2026, Hugging Face Transformers implements these as the `rope_type` values `linear`, `dynamic` (NTK-aware), `yarn`, `longrope` and `llama3`, the last being Llama 3.1's scaling with separate low- and high-frequency factors ([Hugging Face Transformers: rotary embedding utilities](https://huggingface.co/docs/transformers/internal/rope_utils)).
- **Static scaling costs short inputs; dynamic scaling changes every step.** A fixed factor can hurt quality below the original length and breaks abruptly past the extended one, while dynamic scaling recomputes the factor from the current length each forward pass, so a KV cache must store keys before RoPE is applied ([YaRN](https://arxiv.org/abs/2309.00071)). As of November 2026, the Qwen3-Next model card warns that all notable open-source frameworks implement static YaRN, and advises adding `rope_scaling` only when long contexts are needed ([Qwen3-Next-80B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct)).
- **Not every layer or dimension needs RoPE.** On reasoning and math tasks with models of about 107M parameters, decoders with no position encoding (NoPE) generalized to longer inputs better than RoPE, ALiBi and absolute encodings (Kazemnejad et al., [“The Impact of Positional Encoding on Length Generalization in Transformers”](https://arxiv.org/abs/2305.19466) (2023)). Llama 4 interleaves attention layers without positional embeddings ([Meta, April 2025](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)), SmolLM3 drops RoPE from every 4th layer ([Hugging Face, July 2025](https://huggingface.co/blog/smollm3)), Gemma 3 keeps base 10K on local layers and uses 1M on global ones ([Gemma 3 report](https://arxiv.org/abs/2503.19786)), and a `partial_rotary_factor` applies RoPE to only part of each head ([rotary embedding utilities](https://huggingface.co/docs/transformers/internal/rope_utils)).

## Planned visuals

- **`chart`:** the scale applied to each RoPE dimension pair under PI, NTK-aware scaling, YaRN and Llama 3.1-style scaling at one extension factor, on a log axis, with a band marking dimensions whose wavelength exceeds the trained context (formula data).
- **`compare`:** static versus dynamic scaling, as the scale factor against the current sequence length, showing the short-input penalty of a static factor and why dynamic scaling must cache keys before rotation.
- **`calculator`:** from `original_max_position_embeddings`, the target length, `rope_theta` and head dimension to the scaling factor and the number of dimension pairs that never complete a full turn within the trained context.

## Talk like an expert

Experts say “YaRN with factor 4 from 32K” or “raised the base to 500K”, read the RoPE block of a config before serving (`rope_parameters` in current Transformers configs, `rope_scaling` in the Qwen3-Next model card), pass the same values to the engine, as the Qwen3-Next card shows for vLLM's `--rope-scaling` flag ([model card](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct)), and quote effective context rather than window size: on RULER, only half of the models that claimed 32K tokens or more held satisfactory performance at 32K (Hsieh et al., [“RULER”](https://arxiv.org/abs/2404.06654) (2024)). The training side, from data to schedules, is covered in [long-context extension during training](#long-context-training).

## Go deeper

- Chen et al., [“Extending Context Window of Large Language Models via Positional Interpolation”](https://arxiv.org/abs/2306.15595) (2023).
- Peng et al., [“YaRN: Efficient Context Window Extension of Large Language Models”](https://arxiv.org/abs/2309.00071) (2023).
- [Hugging Face Transformers: rotary embeddings utilities](https://huggingface.co/docs/transformers/internal/rope_utils), for the config keys of each scaling type.
- Hsieh et al., [“RULER: What's the Real Context Size of Your Long-Context Language Models?”](https://arxiv.org/abs/2404.06654) (2024).

## Related

- [Embeddings and position](#positional-encoding)
- [Long-context extension during training](#long-context-training)
- [Efficient attention and long context](#long-context)
- [Serving engines](#serving-engines)
- [Mid-training](#mid-training)
