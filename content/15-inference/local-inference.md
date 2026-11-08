---
id: local-inference
book: 15
order: "15.11.1"
title: Running models locally
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [llama-cpp, ollama, gguf, local-models, apple-silicon]
visuals: []
prerequisites: [memory-math, small-local-models]
---
> [!tldr]
> Running a model locally means loading quantized weights into your own RAM or VRAM and serving them with a runtime such as llama.cpp, Ollama, LM Studio or MLX, often behind an OpenAI-compatible endpoint that your tools can call. Memory capacity decides which model fits, and memory bandwidth decides how fast it generates. Remember that the weights and the KV cache must both fit, and that one user's decode speed is capped by bandwidth divided by the bytes read per token.

## Key ideas

- **Fit first, then speed.** In bf16 a model takes 2 bytes per parameter, so an 8B model needs about 16 GB for its weights, about 8 GB at 8 bits and about 4 to 5 GB at 4 bits ([Hugging Face, Quantization overview](https://huggingface.co/docs/transformers/main/en/quantization/overview)); GGUF types carry more bits than their names suggest, and llama.cpp lists Q4_K_M at 4.89 bits per weight (4.58 GiB) for Llama-3.1-8B ([llama.cpp quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)). At small batch sizes each decode step reads every parameter and the KV cache, so the minimum step time is (batch size × KV-cache bytes + parameter bytes) ÷ memory bandwidth (Austin et al., [“All About Transformer Inference”](https://jax-ml.github.io/scaling-book/inference/) (2025)), and llama.cpp's table shows Q4_K_M generating text about 2.5 times faster than F16 on Llama-3.1-8B while processing prompts about 11% slower ([llama.cpp quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)); see [memory math](#memory-math) and [quantization methods](#quantization-methods).
- **llama.cpp end to end.** You convert a Hugging Face model with `convert_hf_to_gguf.py`, then quantize the GGUF file with `llama-quantize`, optionally guided by an importance matrix (`--imatrix`) ([llama.cpp quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)). As of November 2026, the runtime is plain C/C++ with backends for Metal, CUDA, HIP, Vulkan and SYCL among others, SIMD paths such as AVX2, AVX512 and ARM NEON on CPUs, and CPU+GPU hybrid inference for models larger than the total VRAM ([llama.cpp README](https://github.com/ggml-org/llama.cpp)).
- **Memory flags in llama-server.** As of November 2026, `-ngl` sets the maximum number of layers stored in VRAM (default `auto`), `--cpu-moe` keeps all mixture-of-experts weights on the CPU and `--n-cpu-moe N` keeps those of the first N layers there, `-c` sets the context size, `-ctk` and `-ctv` choose the KV-cache types (f16 by default, with q8_0 and 4-bit options), and `--load-mode` chooses memory mapping, `mlock` (keep the model in RAM rather than swapping) or both ([llama-server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)). `--fit`, on by default, adjusts unset arguments to fit device memory, and `--split-mode` with `--tensor-split` spreads layers or weights across several GPUs ([llama-server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)); see [serving mixture-of-experts models](#moe-serving).
- **Serving features.** As of November 2026, llama-server offers OpenAI-compatible chat completions, responses and embeddings routes, parallel decoding across server slots (`-np`), continuous batching (on by default), flash attention (`-fa`, default `auto`), output constrained by a BNF-like grammar (`--grammar`) or a JSON schema (`--json-schema`), and speculative decoding with a draft model (`-md`) ([llama-server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)). The same ideas are covered in depth in [structured generation engines](#structured-generation-engines), [speculative decoding](#speculative-decoding) and [batching and scheduling](#batching-scheduling).
- **Wrappers, endpoints and Apple silicon.** Ollama lists llama.cpp as a supported backend and adds a model library, a REST API on `localhost:11434` and Modelfiles, whose `FROM` line can point to a GGUF file or a Safetensors directory and whose `num_ctx` parameter sets the context window ([Ollama](https://github.com/ollama/ollama); [Ollama Modelfile reference](https://docs.ollama.com/modelfile)). As of November 2026, Ollama's default context length depends on VRAM, from 4k tokens below 24 GiB to 256k at 48 GiB or more ([Ollama, Context length](https://docs.ollama.com/context-length)). At the same date, Ollama serves OpenAI-compatible routes under `/v1`, where the client must send an API key that Ollama ignores ([Ollama OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility)), LM Studio serves OpenAI- and Anthropic-compatible endpoints ([LM Studio developer docs](https://lmstudio.ai/docs/developer)), and on Apple silicon, where the CPU and GPU share one memory pool, MLX lets either device run operations on the same arrays without moving them ([MLX, Unified memory](https://ml-explore.github.io/mlx/build/html/usage/unified_memory.html)).
- **Downloaded weights can run code.** Pickle, the default format for PyTorch weights, can execute arbitrary code when a file is loaded, so Hugging Face advises loading models from users and organizations you trust and points to safetensors as a simpler format for weights; its Hub scanner flags suspicious pickle imports but is not foolproof ([Hugging Face, Pickle scanning](https://huggingface.co/docs/hub/security-pickle)). Check the license of every model you run as well; [model licenses](#model-licenses) and [supply chain and model security](#supply-chain-security) cover both sides.

## Planned visuals

- **`calculator`:** will it fit and how fast will it run: parameters, bits per weight, context length, KV-cache type and memory bandwidth in; weights, KV cache, total memory and an upper bound on single-user tokens per second out, using the minimum step time from Austin et al., with a test against llama.cpp's listed Q4_K_M size for Llama-3.1-8B.
- **`diagram`:** one model split between GPU and CPU: layers offloaded with `-ngl`, mixture-of-experts weights kept on the CPU with `--cpu-moe`, the KV cache, and the link between the two memories, with each part linked to its chapter.
- **`tree`:** local or cloud: questions on data sensitivity, connectivity, required quality, request volume and the hardware on hand, ending in llama.cpp, Ollama or LM Studio, MLX, or a cloud API.

## Talk like an expert

Local practitioners name a model by its quant (Q4_K_M, Q8_0, an imatrix quant) and talk about offloading layers, keeping experts on the CPU, KV-cache types, context size, slots, and tokens per second for prompt processing and for generation separately. They size a machine by memory capacity first and bandwidth second, and treat a downloaded checkpoint as untrusted until they know its source and format.

## Go deeper

- [llama.cpp](https://github.com/ggml-org/llama.cpp), the README with its backends and build options.
- [llama-server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md), the reference for every server flag and endpoint.
- Austin et al., [“All About Transformer Inference”](https://jax-ml.github.io/scaling-book/inference/) (2025), part of *How To Scale Your Model*.
- [MLX documentation](https://ml-explore.github.io/mlx/build/html/index.html).

## Related

- [Edge and on-device AI](#edge-on-device)
- [Small and local models](#small-local-models)
- [Quantization methods in depth](#quantization-methods)
- [Memory math](#memory-math)
- [Serving engines](#serving-engines)
- [Supply chain and model security](#supply-chain-security)
