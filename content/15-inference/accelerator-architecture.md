---
id: accelerator-architecture
book: 15
order: "15.9.1"
title: How GPUs and accelerators run neural networks
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [gpu, tpu, tensor-cores, memory-hierarchy, accelerators, roofline]
visuals:
  - accelerator-architecture-hierarchy:diagram
  - accelerator-architecture-kernel:stepper
  - accelerator-architecture-intensity:calculator
  - accelerator-architecture-fusion:compare
prerequisites: [inference-fundamentals, hardware]
---
> [!tldr]
> A GPU is thousands of simple lanes grouped into streaming multiprocessors, fed by memory that grows larger and slower from registers to HBM. Many operations wait on moving bytes or on launch overhead, not on arithmetic, so fusion, batching, good shapes and low precision are the big levers.

## Why it matters

Real code rarely reaches spec-sheet peaks. Knowing where the time goes (math, memory traffic or overhead) tells you whether to fuse kernels, batch more, fix a shape or buy a different chip, and how to read the spec sheet itself.

## Intuition

Picture a kitchen where cooks work in teams of 32, each team doing one step in unison. Stations have cutting boards (registers and shared memory), the kitchen shares a pantry (L2 cache), and most ingredients sit in a warehouse down the street (HBM). A good kernel fetches a tray once and uses it fully, instead of walking back for every onion.

```viz
{"id":"accelerator-architecture-hierarchy","component":"diagram","title":"Each level down holds more data and moves it more slowly","caption":"H100 SXM figures from NVIDIA’s product page and Austin et al. (2025). Registers and shared memory are per SM, and there are 132 SMs. NVLink and PCIe figures are as listed by NVIDIA. A fast kernel loads a tile from HBM once and reuses it many times in the levels above. Click a linked level for a related chapter.","alt":"Layered diagram of the H100 memory hierarchy from fastest to slowest: registers, 256 KB per SM; shared memory and L1, 256 KB per SM; L2 cache, 50 MB shared by 132 SMs; HBM, 80 GB at 3.35 TB/s; host memory over PCIe Gen5 at a listed 128 GB/s, with NVLink to other GPUs at 900 GB/s.","data":"real","source":"NVIDIA H100 product page; Austin et al., How to Scale Your Model (2025)","asof":"November 2026","depicts":"NVIDIA H100 SXM","try":"Compare the HBM line with the host line: copies from the CPU are the slowest path.","w":560,"layer_h":46,"layers":[
{"id":"regs","label":"Registers","sub":"256 KB per SM, holding each thread’s local values","role":"model","link":"#floating-point-formats"},
{"id":"smem","label":"Shared memory and L1","sub":"256 KB per SM; each thread block gets its own slice: the tile workspace","role":"data","link":"#long-context"},
{"id":"l2","label":"L2 cache","sub":"50 MB, shared by all 132 SMs","role":"data"},
{"id":"hbm","label":"HBM (global memory)","sub":"80 GB at 3.35 TB/s: weights, activations, KV cache","role":"data","link":"#memory-math"},
{"id":"host","label":"Host memory over PCIe Gen5","sub":"listed at 128 GB/s; NVLink to other GPUs at 900 GB/s","role":"external","link":"#hardware"}]}
```

## How it works

**SMs, warps and streams.** An H100 has 132 streaming multiprocessors (SMs), each split into four parts with a warp scheduler, a tensor core and 32 FP32 lanes, the CUDA cores ([Austin et al., 2025](https://jax-ml.github.io/scaling-book/gpus/)). Threads run in warps of 32 that execute the same instruction (SIMT: single instruction, multiple threads); warps form thread blocks, each on one SM, and blocks form a kernel’s grid ([CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html)). An H100 SM hides memory waits by switching among up to 64 resident warps ([CUDA compute capabilities](https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/compute-capabilities.html)). Occupancy, the share of those slots in use, is capped by the registers and shared memory each block needs, and more is not always faster ([CUDA Best Practices Guide](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html)). Launches are asynchronous: the CPU queues kernels on a stream and moves on ([PyTorch CUDA semantics](https://docs.pytorch.org/docs/stable/notes/cuda.html)).

**Tensor cores.** CUDA cores do scalar arithmetic. Tensor cores, added with Volta, do matrix multiply-accumulates, often with low-precision inputs and higher-precision sums ([NVIDIA](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html)). On an H100 they reach about 990 dense BF16 TFLOP/s against about 66 for the CUDA cores, and FP8 doubles that (Austin et al.). Everything else takes the slow path; formats are in [floating-point formats](#floating-point-formats).

```viz
{"id":"accelerator-architecture-kernel","component":"stepper","title":"A kernel runs as waves of thread blocks, and a half-empty last wave wastes half the GPU","caption":"Illustrative: the example of 12 thread blocks on a GPU with 8 SMs from NVIDIA’s GPU Performance Background guide, one block per SM at a time. An H100 has 132 SMs and can hold several blocks per SM.","alt":"Stepper of one kernel: the CPU queues it on a CUDA stream; the kernel is a grid of 12 thread blocks; the first wave puts one block on each of 8 SMs; blocks move tiles between HBM, shared memory and the tensor cores; the second wave uses only 4 SMs; results go back to HBM.","data":"illustrative","try":"Step to Wave 2 and count the idle SMs.","diagram":{"w":600,"h":154,"nodes":[{"id":"host","label":"CPU\n(host)","role":"external","align":"center","glyph":false,"x":0,"y":0,"w":130,"h":50},{"id":"stream","label":"CUDA\nstream","align":"center","glyph":false,"x":160,"y":0,"w":130,"h":50},{"id":"grid","label":"Grid:\n12 blocks","align":"center","glyph":false,"x":320,"y":0,"w":120,"h":50},{"id":"hbm","label":"HBM","role":"data","align":"center","glyph":false,"x":470,"y":0,"w":130,"h":50},{"id":"sm1","label":"SM 1","role":"model","align":"center","glyph":false,"x":0,"y":100,"w":66,"h":50},{"id":"sm2","label":"SM 2","role":"model","align":"center","glyph":false,"x":75,"y":100,"w":66,"h":50},{"id":"sm3","label":"SM 3","role":"model","align":"center","glyph":false,"x":150,"y":100,"w":66,"h":50},{"id":"sm4","label":"SM 4","role":"model","align":"center","glyph":false,"x":225,"y":100,"w":66,"h":50},{"id":"sm5","label":"SM 5","role":"model","align":"center","glyph":false,"x":300,"y":100,"w":66,"h":50},{"id":"sm6","label":"SM 6","role":"model","align":"center","glyph":false,"x":375,"y":100,"w":66,"h":50},{"id":"sm7","label":"SM 7","role":"model","align":"center","glyph":false,"x":450,"y":100,"w":66,"h":50},{"id":"sm8","label":"SM 8","role":"model","align":"center","glyph":false,"x":525,"y":100,"w":66,"h":50}],"edges":[{"from":"host","to":"stream","label":"launch"},{"from":"stream","to":"grid"},{"from":"grid","to":"sm5","label":"blocks"},{"from":"hbm","to":"sm8","label":"tiles","both":true}]},"frames":[
{"label":"Launch","highlight":["host","stream"],"edges":["host>stream"],"caption":"The CPU puts the kernel on a CUDA stream and returns at once. Work on one stream runs in order, and the CPU can queue the next kernels while this one runs."},
{"label":"Grid","highlight":["grid"],"edges":["stream>grid"],"caption":"The kernel is a grid of 12 thread blocks. Each block is a set of warps, groups of 32 threads that run the same instruction together. A block always runs on a single SM."},
{"label":"Wave 1","highlight":["grid","sm1","sm2","sm3","sm4","sm5","sm6","sm7","sm8"],"edges":["grid>sm5"],"caption":"The scheduler places one block on each of the 8 SMs. This first wave keeps every SM busy."},
{"label":"Inside an SM","highlight":["sm8","hbm"],"edges":["hbm>sm8"],"caption":"Each block copies tiles of its inputs from HBM into shared memory. Warps feed the tiles to the tensor cores, and partial sums stay on chip. When a warp waits for memory, the SM runs another one."},
{"label":"Wave 2","highlight":["sm1","sm2","sm3","sm4"],"caption":"Four blocks are left, so four SMs work and four sit idle: this second wave uses 50% of the GPU. This tail effect is why NVIDIA suggests launching several times more blocks than there are SMs."},
{"label":"Write back","highlight":["hbm","sm8"],"edges":["hbm>sm8"],"caption":"Results go back to HBM. If the next kernel only applies an elementwise op, it must read them all back again: the round trip that fusion removes."}]}
```

**Three costs.** He splits runtime into compute, memory bandwidth and overhead: Python, launches and everything else ([He, 2022](https://horace.io/brrr_intro.html)). Arithmetic intensity, FLOPs per byte moved, picks between the first two: above the ridge point (peak FLOP/s ÷ bandwidth) an operation is compute-bound, below it memory-bound, as on the roofline in [inference fundamentals](#inference-fundamentals). Multiplying M × K by K × N does 2MNK FLOPs on MK + KN + MN elements, so intensity tracks the smallest dimension, and a matrix-vector product is always memory-bound ([NVIDIA](https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html)).

```viz
{"id":"accelerator-architecture-intensity","component":"calculator","title":"Eight tokens per weight read leave an H100 at 3% of peak; a few hundred make it compute-bound","caption":"Defaults: one 8,192 × 8,192 BF16 weight matrix applied to 8 tokens, like a decode step, on H100 SXM’s published dense BF16 peak (989 TFLOP/s, half the 1,979 listed with sparsity) and 3.35 TB/s. Times are lower bounds; real kernels reach less than peak.","alt":"Calculator for a matrix multiply of an M × K matrix by a K × N matrix: FLOPs, bytes moved, arithmetic intensity, the chip’s ridge point, compute time, memory time, the larger of the two and the best-case share of peak compute.","data":"formula","depicts":"NVIDIA H100 SXM published specs","try":"Set M to 4096, like a prefill of 4,096 tokens, and watch the bound flip from memory to compute.","inputs":{"m":8,"k":8192,"n":8192,"bytes_per_value":2,"peak_tflops":989,"bandwidth_tbs":3.35},"input_meta":{"m":{"label":"M: rows of A, such as tokens in the batch","min":1,"step":1},"k":{"label":"K: shared dimension","min":1,"step":1},"n":{"label":"N: columns of B, such as output features","min":1,"step":1},"bytes_per_value":{"label":"Precision","options":[["FP32, 4 bytes",4],["BF16 or FP16, 2 bytes",2],["FP8, 1 byte",1]]},"peak_tflops":{"label":"Peak dense throughput","unit":"TFLOP/s","min":1,"step":1},"bandwidth_tbs":{"label":"Memory bandwidth","unit":"TB/s","min":0.1,"step":0.05}},"outputs":[{"id":"flops","label":"Work","expr":"2 * m * n * k","unit":"flop"},{"id":"bytes","label":"Bytes moved","expr":"bytes_per_value * (m * k + k * n + m * n)","unit":"bytes"},{"id":"intensity","label":"Arithmetic intensity","expr":"flops / bytes","unit":"FLOP/byte"},{"id":"ridge","label":"Ridge point of the chip","expr":"peak_tflops / bandwidth_tbs","unit":"FLOP/byte"},{"id":"t_compute","label":"Time at peak compute","expr":"flops / (peak_tflops * 1e12) * 1e6","unit":"µs"},{"id":"t_memory","label":"Time at full bandwidth","expr":"bytes / (bandwidth_tbs * 1e12) * 1e6","unit":"µs"},{"id":"t_min","label":"Lower bound on kernel time","expr":"max(t_compute, t_memory)","unit":"µs","main":true},{"id":"peak_share","label":"Best-case share of peak compute","expr":"min(1, intensity / ridge)","unit":"pct"}],"assumptions":["Each matrix crosses HBM exactly once: perfect reuse on chip.","Compute and memory traffic overlap fully, so the slower one sets the time.","No launch overhead, tail waves or tile padding.","Decimal units: 1 TB/s is 10¹² bytes per second."],"tests":[{"inputs":{},"expect":{"intensity":7.984405458089668,"t_memory":40.14324537313433,"t_min":40.14324537313433,"peak_share":0.027045256101719303}},{"inputs":{"m":4096},"expect":{"intensity":2048,"t_min":555.8703881577351,"peak_share":1}},{"inputs":{"m":1},"expect":{"intensity":0.9997559189650964},"note":"A matrix-vector product does about 1 FLOP per byte in BF16."}]}
```

**Fusion.** Fusing elementwise ops into one kernel removes round trips through HBM, and He calls fusion the most important optimization in deep learning compilers. FlashAttention keeps attention tiles in on-chip SRAM, an order of magnitude faster than HBM on an A100, and never writes the N × N score matrix to HBM ([Dao et al., 2022](https://arxiv.org/abs/2205.14135)); see [efficient attention](#long-context).

```viz
{"id":"accelerator-architecture-fusion","component":"compare","title":"Fusing two elementwise ops halves the bytes moved through HBM","caption":"Illustrative, after the x.cos().cos() example in He (2022). Hover the marks.","alt":"Two code snippets. Unfused: y = x.cos() reads x from HBM and writes y; z = y.cos() reads y and writes z, four tensor-sized trips and two launches. Fused: torch.compile turns x.cos().cos() into one kernel that reads x, keeps the intermediate in registers and writes z, two trips and one launch.","data":"illustrative","try":"Hover “write y to HBM”, the step that disappears.","a":{"title":"Unfused: two kernels","text":"y = x.cos()    # kernel 1\n               # read x from HBM\n               # write y to HBM\nz = y.cos()    # kernel 2\n               # read y from HBM\n               # write z to HBM\n\n# 4 tensor-sized trips, 2 launches"},"b":{"title":"Fused: one kernel","text":"f = torch.compile(lambda x: x.cos().cos())\nz = f(x)       # one generated kernel\n               # read x from HBM\n               # cos(cos(x)) in registers\n               # write z to HBM\n\n# 2 tensor-sized trips, 1 launch"},"links":[{"a":"write y to HBM","b":"cos(cos(x)) in registers","note":"The intermediate never leaves the SM. A memory-bound op takes about bytes moved ÷ bandwidth, so halving the trips roughly halves the time (He, 2022)."},{"a":"2 launches","b":"1 launch","note":"Fewer launches also cut overhead, which dominates when tensors are small."},{"b":"torch.compile","note":"Compilers fuse chains of elementwise ops automatically. FlashAttention does the same by hand for attention, so the score matrix never reaches HBM (Dao et al., 2022)."}]}
```

**Shapes, waves and overhead.** Tensor cores prefer dimensions in multiples of 8 FP16 elements (64 on an A100). Work runs in waves of tiles across the SMs: on an A100, growing N from 1,536 to 1,544 adds a nine-tile tail wave and roughly halves throughput ([NVIDIA](https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html)). A CUDA graph records many small launches once and replays them with little CPU cost ([CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cuda-graphs.html)). Host copies cross PCIe, listed at 128 GB/s on an H100 against 3.35 TB/s for HBM ([NVIDIA](https://www.nvidia.com/en-us/data-center/h100/)), and run much faster from pinned memory ([PyTorch CUDA semantics](https://docs.pytorch.org/docs/stable/notes/cuda.html)).

**TPUs.** A TPU TensorCore holds matrix units (MXUs) plus vector and scalar units. Each MXU is a systolic array, a grid of multiply-accumulate cells wired to their neighbors: 128 × 128 before v6e, 256 × 256 on v6e and TPU7x ([Google Cloud](https://docs.cloud.google.com/tpu/docs/system-architecture-tpu-vm)). Weights are loaded into the grid first, then activations flow through it ([Austin et al.](https://jax-ml.github.io/scaling-book/tpus/)). Chips connect over the inter-chip interconnect (ICI), whose topology shapes [distributed training](#distributed-training); a TPU7x pod links up to 9,216 chips, each with 192 GiB of HBM, in a 3D torus (as of November 2026, [Google Cloud](https://docs.cloud.google.com/tpu/docs/tpu7x)). Code reaches TPUs through the [XLA](https://openxla.org/xla) compiler, which compiles the graph for the shapes of the first batch, so models with dynamic shapes suit TPUs poorly ([Google Cloud](https://docs.cloud.google.com/tpu/docs/intro-to-tpu)).

**Trainium.** Each NeuronCore-v3 in Trainium2 pairs a systolic-array Tensor Engine with three other engines and 28 MB of software-managed SRAM ([AWS](https://awsdocs-neuron.readthedocs-hosted.com/en/latest/about-neuron/arch/neuron-hardware/neuron-core-v3.html)). The Neuron SDK (2.33.0 as of November 2026) offers native PyTorch through TorchNeuron and a JAX integration, both in beta, plus a kernel interface (NKI) and a vLLM plugin ([Neuron docs](https://awsdocs-neuron.readthedocs-hosted.com/en/latest/)).

**SRAM-centric and wafer-scale chips.** Groq swaps the cache hierarchy for one large SRAM scratchpad, scheduled by the compiler. Its Tensor Streaming Processor had 220 MiB (Abts, [ISC 2020 slides](https://mlhardware.github.io/2020/groq.pdf)), and the announced, not yet released NVIDIA Groq 3 LPX rack spreads 128 GB of on-chip SRAM over 256 LPUs (as of November 2026, [Groq](https://groq.com/lpu-architecture)). Cerebras’s WSE-3 is one wafer with 44 GB of SRAM ([Cerebras, 2024](https://www.cerebras.ai/press-release/cerebras-announces-third-generation-wafer-scale-engine)), and larger models are split across systems at layer boundaries ([Cerebras, 2024](https://www.cerebras.ai/blog/introducing-cerebras-inference-ai-at-instant-speed)). The trade: speed per user, but many chips per model.

**AMD GPUs.** They run HIP, a C++ kernel language and runtime close to CUDA, within ROCm. HIPIFY converts CUDA calls, but HIP is no drop-in replacement ([AMD](https://rocm.docs.amd.com/projects/HIP/en/latest/what_is_hip.html)), and CDNA GPUs use 64-thread warps ([AMD](https://rocm.docs.amd.com/projects/HIP/en/latest/understand/programming_model.html)).

**Comparing accelerators.** Check memory capacity and bandwidth, dense throughput in your formats, interconnect, kernel support, and whether you can rent the chip or only call an API; current generations are in [hardware](#hardware).

## In practice

Measure first; synchronize when timing:

```python
import torch
from torch.profiler import profile, ProfilerActivity

def bench(fn, iters=50):
    for _ in range(5):
        fn()                                      # warm up
    start = torch.cuda.Event(enable_timing=True)
    end = torch.cuda.Event(enable_timing=True)
    start.record()
    for _ in range(iters):
        fn()
    end.record()
    torch.cuda.synchronize()                      # launches are asynchronous
    return start.elapsed_time(end) / iters / 1e3  # seconds per call

n = 8192
a = torch.randn(n, n, device="cuda", dtype=torch.bfloat16)
b = torch.randn(n, n, device="cuda", dtype=torch.bfloat16)

t = bench(lambda: a @ b)
print(f"matmul: {2 * n**3 / t / 1e12:.0f} TFLOP/s")          # versus dense BF16 peak
t = bench(lambda: a * 2)
print(f"elementwise: {2 * a.nbytes / t / 1e9:.0f} GB/s")     # read + write, versus HBM

with profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA]) as prof:
    a @ b
    torch.cuda.synchronize()
print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=5))
```

1. **Profile.** The [PyTorch Profiler](https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html) ranks kernels, [Nsight Systems](https://developer.nvidia.com/nsight-systems) shows CPU and GPU on one timeline, and [Nsight Compute](https://docs.nvidia.com/nsight-compute/NsightCompute/index.html) dissects one kernel.
2. **Classify.** If doubling the batch barely changes step time, you are likely overhead-bound (He, 2022).
3. **Fix the dominant cost.** Overhead: bigger batches, or CUDA graphs via [`torch.compile(mode="reduce-overhead")`](https://docs.pytorch.org/docs/stable/generated/torch.compile.html). Memory: fusion, or fewer bytes per value ([quantization](#quantization)). Compute: BF16, FP8, or TF32 via `torch.set_float32_matmul_precision("high")`.
4. **Feed the GPU.** `DataLoader(pin_memory=True)` plus `non_blocking=True` copies overlap transfers with compute (PyTorch CUDA semantics).

> [!try]
> Profile one step, label the top five kernels as matrix multiply, elementwise or reduction, and find the idle gaps between kernels in the trace: that is overhead.

## Numbers to know

> [!number]
> Rules of thumb for an H100 SXM ([NVIDIA](https://www.nvidia.com/en-us/data-center/h100/); Austin et al., 2025), as of November 2026. Dense BF16 is about 989 TFLOP/s (the listed 1,979 assumes sparsity); over 3.35 TB/s, the ridge point is near 300 FLOP per byte. A ReLU in FP16 does 0.25 FLOP per byte ([NVIDIA](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html)), far below the ridge point, so it is memory-bound. In the time Python does one operation, an A100 does about 9.75 million FLOPs (He, 2022).

## Pitfalls and anti-patterns

> [!pitfall] Timing without synchronizing
> A Python timer around GPU calls measures how fast the CPU queues work. Call `torch.cuda.synchronize()` before reading the clock, or use CUDA events.

- **Sparse peaks read as dense.** The TF32, BF16, FP16, FP8 and INT8 tensor-core figures on NVIDIA’s H100 page are marked “with sparsity”; dense is half (Austin et al., 2025).
- **Hidden syncs.** `.item()` makes the CPU wait for the GPU and breaks CUDA graph capture (PyTorch CUDA semantics).

## Talk like an expert

The vocabulary: **SM**, **warp**, **SIMT**, **occupancy**, **arithmetic intensity**, **ridge point**, **overhead-bound**, **kernel fusion**, **wave quantization**, **CUDA graphs**, **systolic array**, **ICI**. Experts ask “which of the three costs is this?” before touching code, and quote achieved throughput as a share of peak. Live debates: whether XLA, Triton and ROCm erode CUDA’s kernel lead, and whether SRAM-centric speed per user beats HBM capacity.

> [!hottake] The kernel library, not the silicon, is the product.
> Without fast kernels for your model and precision, a chip never reaches its spec sheet. **The counterargument:** capacity, bandwidth and interconnect set ceilings no kernel can cross, and portable compilers keep shrinking the software gap.

## Check yourself

```quiz
accelerator-architecture
```

## Go deeper

- He, [“Making Deep Learning Go Brrrr From First Principles”](https://horace.io/brrr_intro.html) (2022).
- Austin et al., [“How to Scale Your Model: How to Think About GPUs”](https://jax-ml.github.io/scaling-book/gpus/) (2025), and its [TPU chapter](https://jax-ml.github.io/scaling-book/tpus/).
- NVIDIA’s [GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html) and [Matrix Multiplication Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html) guides.
- [Stanford CS336, Spring 2025](https://cs336.stanford.edu/spring2025/): the GPU and kernel lectures and the systems assignment.

## Related

- [Hardware](#hardware)
- [Inference fundamentals](#inference-fundamentals)
- [GPU kernels and ML compilers](#gpu-kernels-compilers)
- [Memory math](#memory-math)
- [Distributed training](#distributed-training)
- [Quantization](#quantization)
