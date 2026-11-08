---
id: gpu-kernels-compilers
book: 15
order: "15.9.2"
title: GPU kernels and ML compilers
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [cuda, triton, torch-compile, xla, kernels, compilers]
visuals: []
prerequisites: [hardware, inference-fundamentals]
---
> [!tldr]
> A kernel is a function that thousands of GPU threads run in parallel. An ML compiler writes kernels for you: it captures a model as a graph, fuses operations and generates code for the hardware. Many of the big wins come from moving fewer bytes between memory and the chip, not from doing less arithmetic, so remember the order: vendor libraries first, then a compiler, and a hand-written kernel only for an operation neither handles well, checked against a reference before you trust its speed.

## Key ideas

- **Libraries, compilers or a custom kernel.** Vendor libraries such as cuBLAS and cuDNN support only a restricted set of tensor operations, and anything outside that set risks poor device utilization unless an expert writes a custom kernel, which is the gap Triton was built to close (Tillet et al., [“Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations”](https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf) (2019)). A kernel called through a raw data pointer does not compose with autograd, `torch.compile` or `vmap` until it is registered as a custom operator ([PyTorch, Custom operators](https://docs.pytorch.org/tutorials/advanced/custom_ops_landing_page.html)), and `torch.library.opcheck` checks that registration but is not a numerical correctness test, so compare outputs with `torch.testing.assert_close` and gradients with `torch.autograd.gradcheck` ([PyTorch, Custom Python operators](https://docs.pytorch.org/tutorials/advanced/python_custom_ops.html)).
- **The CUDA model and its memory rules.** A kernel launch runs a grid of equally sized thread blocks: each block runs on one streaming multiprocessor (SM), its threads share on-chip shared memory and can synchronize, and the blocks must be able to run in any order ([CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html)). A warp's global loads and stores are coalesced into as few transactions as possible, 32 bytes each on compute capability 6.0 and newer, so strided access wastes bandwidth; shared memory has 32 banks on compute capability 5.x and newer, and threads that hit different addresses in the same bank are serialized; and a tiled matrix multiplication stages tiles of A and B in shared memory so that each block reads them from global memory only once ([CUDA C++ Best Practices Guide](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html)).
- **Fusion is about bytes.** Triton's fused-softmax tutorial counts a naive PyTorch softmax over an M × N input as reading 5MN + 2M elements and writing 3MN + 2M, against about MN each for a kernel that reads each row once and computes on chip, a theoretical speedup of about 4 times for this bandwidth-bound operation ([Triton tutorial: Fused Softmax](https://triton-lang.org/main/getting-started/tutorials/02-fused-softmax.html)). FlashAttention applies the same idea to attention: it tiles the computation to cut reads and writes between HBM and on-chip SRAM, and trained GPT-2 about 3 times faster at sequence length 1K (Dao et al., [“FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness”](https://arxiv.org/abs/2205.14135) (2022)); see [efficient attention](#long-context).
- **Tile languages.** Triton programs are written as operations on tiles, statically shaped multi-dimensional sub-arrays (Tillet et al., 2019), and `triton.autotune` times a list of candidate configurations and tunes again when the values of named arguments change ([triton.autotune](https://triton-lang.org/main/python-api/generated/triton.autotune.html)). As of November 2026, other tile-level tools include NVIDIA's cuTile Python, whose kernels run on a logical grid of blocks over immutable power-of-two tiles ([cuTile Python](https://docs.nvidia.com/cuda/cutile-python/)), JAX Pallas for GPU and TPU kernels ([Pallas](https://docs.jax.dev/en/latest/pallas/index.html)), ThunderKittens with 16 × 16 warp-level tiles (Spector et al., [“ThunderKittens: Simple, Fast, and Adorable AI Kernels”](https://arxiv.org/abs/2410.20399) (2024)), TileLang, which separates scheduling from dataflow (Wang et al., [“TileLang: A Composable Tiled Programming Model for AI Systems”](https://arxiv.org/abs/2504.17577) (2025)), and NVIDIA's CUTLASS templates with CuTe layouts and a Python CuTe DSL ([CUTLASS overview](https://docs.nvidia.com/cutlass/latest/overview.html)).
- **Inside torch.compile.** TorchDynamo interprets Python bytecode to extract PyTorch operations into FX graphs, plus guards that check assumptions such as types and constant values on every call; code it cannot trace causes a graph break, where the partial graph is compiled and the rest runs as ordinary Python, and when no cached guards pass, the function is recompiled ([PyTorch, Dynamo core concepts](https://docs.pytorch.org/docs/main/user_guide/torch_compiler/compile/programming_model.dynamo_core_concepts.html)). AOTAutograd traces the backward pass ahead of time, and in the PyTorch 2.0 release TorchInductor used Triton to generate code for NVIDIA and AMD GPUs and generated C++ for Intel CPUs ([PyTorch 2.0 release blog](https://pytorch.org/blog/pytorch-2.0-release/)); as of November 2026, the `reduce-overhead` mode adds CUDA graphs at the cost of more memory, and `max-autotune` also tries Triton or template-based matrix multiplications ([torch.compile API](https://docs.pytorch.org/docs/stable/generated/torch.compile.html)).
- **XLA and ahead-of-time paths.** `jax.jit` traces a function into a jaxpr specialized to its arguments' shapes and dtypes, lowers it to StableHLO and compiles it with XLA ([JAX, Ahead-of-time lowering and compilation](https://docs.jax.dev/en/latest/aot.html)), which runs target-independent passes such as fusion, common subexpression elimination and buffer analysis before an LLVM-based CPU or GPU backend ([OpenXLA, XLA architecture](https://openxla.org/xla/architecture)). To deploy without Python, `torch.export` captures the graph and AOTInductor compiles it into a single `.pt2` package that C++ or Python can load ([PyTorch, AOTInductor](https://docs.pytorch.org/docs/main/user_guide/torch_compiler/torch.compiler_aot_inductor.html)).

## Planned visuals

- **`stepper`:** a tiled matrix multiplication on one thread block, step by step: load a tile of A and of B from HBM into shared memory, synchronize, multiply and accumulate, advance along K, and write the C tile, with a caption on how many bytes each step moves.
- **`compare`:** naive and fused softmax side by side, with the reads and writes the Triton tutorial counts for each (5MN + 2M and 3MN + 2M against about MN and MN) and the theoretical speedup that follows.
- **`diagram`:** the two compiler stacks: Python bytecode to TorchDynamo (FX graph, guards, graph breaks), AOTAutograd, TorchInductor and Triton or C++; and `jax.jit` to jaxpr, StableHLO, XLA passes and a backend, with `torch.export` and AOTInductor branching off for deployment; each box links to its chapter.

## Talk like an expert

Experts first ask whether a kernel is memory-bound or compute-bound, then talk in tiles, fusion, coalescing, bank conflicts, occupancy and autotuning; on the compiler side they talk about graph breaks, guards, recompiles, dynamic shapes and CUDA graphs. They trust a new kernel only after it matches a reference implementation within tolerance and wins a synchronized benchmark at the shapes they actually run.

## Go deeper

- Tillet et al., [“Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations”](https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf) (2019).
- Dao et al., [“FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness”](https://arxiv.org/abs/2205.14135) (2022).
- PyTorch, [Dynamo core concepts](https://docs.pytorch.org/docs/main/user_guide/torch_compiler/compile/programming_model.dynamo_core_concepts.html), the reference for graphs, guards, graph breaks and recompilation.
- OpenXLA, [XLA architecture](https://openxla.org/xla/architecture).

## Related

- [Hardware](#hardware)
- [How GPUs and accelerators run neural networks](#accelerator-architecture)
- [Quantization](#quantization)
- [Serving engines](#serving-engines)
- [Efficient attention and long context](#long-context)
- [Self-improving and automated research systems](#self-improving-systems)
