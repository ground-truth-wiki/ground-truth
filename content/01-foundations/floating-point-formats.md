---
id: floating-point-formats
book: 1
order: "1.9"
title: Floating-point formats and numerical precision
level: foundation
stability: moving
reviewed: "2026-11"
status: full
tags: [floating-point, bf16, fp8, mixed-precision, numerics]
visuals:
  - floating-point-formats-layouts:diagram
  - floating-point-formats-loss-scaling:stepper
  - floating-point-formats-softmax:compare
  - floating-point-formats-memory:calculator
prerequisites: [linear-algebra]
---
> [!tldr]
> A floating-point number spends its bits on a sign, an exponent for range and a mantissa for precision. Formats run from FP32 down to block-scaled 4-bit, each step trading numerical safety for memory and speed. Keep master weights and accumulators wide, subtract the maximum before a softmax, compute losses from logits, and expect results to depend on the order of operations.

## Why it matters

Precision decides how much memory a model needs, how fast it runs and whether training converges. Halving the bits halves weight memory ([memory math](#memory-math)) and shrinks the silicon: a multiplier grows with the square of the mantissa width, so a bfloat16 multiplier is about half the size of an FP16 one ([Google Cloud, 2019](https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus)). The wrong choice fails quietly: lost updates, underflowing gradients, a softmax that returns NaN, outputs that change with batch size.

## Intuition

Floating point is scientific notation with a fixed number of digits. In 6.02 × 10²³, the exponent places the point and the digits set how finely neighbors differ. A binary format stores a sign bit, some exponent bits and some mantissa bits (the fraction after an implied leading 1). Exponent bits buy range, mantissa bits buy precision.

```viz
{"id":"floating-point-formats-layouts","component":"diagram","title":"Exponent bits buy range, mantissa bits buy precision","caption":"Switch formats. Each bar splits the same width between exponent and mantissa in proportion to their bits; the sign is always 1 bit. Values from IEEE 754, the FP8 paper and the OCP MX specification.","alt":"Bit layouts of six floating-point formats. Each shows a 1-bit sign, an exponent field that sets the largest value and a mantissa field that sets the gap between neighbors near 1: FP32 8 and 23 bits, FP16 5 and 10, BF16 8 and 7, FP8 E4M3 4 and 3, FP8 E5M2 5 and 2, FP4 E2M1 2 and 1.","data":"real","source":"IEEE 754-2019; Google Cloud, BFloat16 (2019); Micikevicius et al., FP8 Formats for Deep Learning (2022); OCP MX Specification v1.1 (2026)","asof":"2026-11","depicts":"IEEE binary32 and binary16, bfloat16, OCP FP8 E4M3 and E5M2, OCP MX FP4 E2M1","try":"Compare FP16 with BF16: the same 16 bits, the opposite trade.","w":560,"h":150,"variants":[
{"name":"FP32","note":"32 bits, 4 bytes. IEEE single precision, the reference for master weights, optimizer states and accumulators.","nodes":[{"id":"s","label":"Sign","sub":"1 bit","align":"center","x":0,"y":0,"w":60,"h":56},{"id":"e","label":"Exponent","sub":"8 bits","align":"center","x":68,"y":0,"w":125,"h":56},{"id":"m","label":"Mantissa","sub":"23 bits","align":"center","x":201,"y":0,"w":359,"h":56},{"id":"r","label":"Range","sub":"max ≈ 3.4 × 10³⁸","align":"center","x":68,"y":94,"w":125,"h":56},{"id":"p","label":"Precision","sub":"gap above 1: 2⁻²³","align":"center","x":201,"y":94,"w":359,"h":56}],"edges":[{"from":"e","to":"r"},{"from":"m","to":"p"}]},
{"name":"FP16","note":"16 bits. IEEE half precision. Eight times finer than BF16 near 1, but values above 65,504 overflow and nothing below about 6 × 10⁻⁸ is representable, so tiny gradients underflow. Hence loss scaling.","nodes":[{"id":"s","label":"Sign","sub":"1 bit","align":"center","x":0,"y":0,"w":60,"h":56},{"id":"e","label":"Exponent","sub":"5 bits","align":"center","x":68,"y":0,"w":161,"h":56},{"id":"m","label":"Mantissa","sub":"10 bits","align":"center","x":237,"y":0,"w":323,"h":56},{"id":"r","label":"Range","sub":"max 65,504","align":"center","x":68,"y":94,"w":161,"h":56},{"id":"p","label":"Precision","sub":"gap above 1: 2⁻¹⁰","align":"center","x":237,"y":94,"w":323,"h":56}],"edges":[{"from":"e","to":"r"},{"from":"m","to":"p"}]},
{"name":"BF16","note":"16 bits. FP32’s exponent with a 7-bit mantissa: the range of FP32 with only 2 to 3 significant decimal digits. That range is why it trains without loss scaling.","nodes":[{"id":"s","label":"Sign","sub":"1 bit","align":"center","x":0,"y":0,"w":60,"h":56},{"id":"e","label":"Exponent","sub":"8 bits","align":"center","x":68,"y":0,"w":258,"h":56},{"id":"m","label":"Mantissa","sub":"7 bits","align":"center","x":334,"y":0,"w":226,"h":56},{"id":"r","label":"Range","sub":"max ≈ 3.4 × 10³⁸","align":"center","x":68,"y":94,"w":258,"h":56},{"id":"p","label":"Precision","sub":"gap above 1: 2⁻⁷","align":"center","x":334,"y":94,"w":226,"h":56}],"edges":[{"from":"e","to":"r"},{"from":"m","to":"p"}]},
{"name":"FP8 E4M3","note":"8 bits. No infinities and a single NaN pattern buy one more binade, so the largest value is 448. Recommended for weights and activations.","nodes":[{"id":"s","label":"Sign","sub":"1 bit","align":"center","x":0,"y":0,"w":60,"h":56},{"id":"e","label":"Exponent","sub":"4 bits","align":"center","x":68,"y":0,"w":277,"h":56},{"id":"m","label":"Mantissa","sub":"3 bits","align":"center","x":353,"y":0,"w":207,"h":56},{"id":"r","label":"Range","sub":"max 448","align":"center","x":68,"y":94,"w":277,"h":56},{"id":"p","label":"Precision","sub":"gap above 1: 2⁻³","align":"center","x":353,"y":94,"w":207,"h":56}],"edges":[{"from":"e","to":"r"},{"from":"m","to":"p"}]},
{"name":"FP8 E5M2","note":"8 bits. FP16’s exponent with IEEE-style infinities and NaNs, but only 2 mantissa bits. Recommended for gradients.","nodes":[{"id":"s","label":"Sign","sub":"1 bit","align":"center","x":0,"y":0,"w":60,"h":56},{"id":"e","label":"Exponent","sub":"5 bits","align":"center","x":68,"y":0,"w":346,"h":56},{"id":"m","label":"Mantissa","sub":"2 bits","align":"center","x":422,"y":0,"w":138,"h":56},{"id":"r","label":"Range","sub":"max 57,344","align":"center","x":68,"y":94,"w":346,"h":56},{"id":"p","label":"Precision","sub":"gap above 1: 2⁻²","align":"center","x":422,"y":94,"w":138,"h":56}],"edges":[{"from":"e","to":"r"},{"from":"m","to":"p"}]},
{"name":"FP4 E2M1","note":"4 bits, 16 codes. The positive values are 0, 0.5, 1, 1.5, 2, 3, 4 and 6, so it needs a shared scale per small block, as in MXFP4 and NVFP4.","nodes":[{"id":"s","label":"Sign","sub":"1 bit","align":"center","x":0,"y":0,"w":60,"h":56},{"id":"e","label":"Exponent","sub":"2 bits","align":"center","x":68,"y":0,"w":323,"h":56},{"id":"m","label":"Mantissa","sub":"1 bit","align":"center","x":399,"y":0,"w":161,"h":56},{"id":"r","label":"Range","sub":"max 6","align":"center","x":68,"y":94,"w":323,"h":56},{"id":"p","label":"Precision","sub":"gap above 1: 2⁻¹","align":"center","x":399,"y":94,"w":161,"h":56}],"edges":[{"from":"e","to":"r"},{"from":"m","to":"p"}]}]}
```

Because the exponent scales everything, the gap between neighbors grows with magnitude: relative error stays roughly constant, absolute error does not. In BF16 the gap between 256 and 512 is 2, so 256 + 1 rounds back to 256.

## How it works

**Encoding.** A normal number with sign S, stored exponent E, bias b and an m-bit mantissa M is:

```math
v = (-1)^S \times 2^{E-b} \times \left(1 + \frac{M}{2^m}\right)
```

An all-zero exponent marks zero and the subnormals, which drop the implied 1 to fill the gap near zero; in IEEE formats an all-ones exponent is reserved for infinity and NaN instead of finite values ([IEEE 754-2019](https://standards.ieee.org/ieee/754/6210/)).

**Measuring precision.** A ULP (unit in the last place) is the gap between neighbors at a given magnitude; correct rounding errs by at most half an ULP. Machine epsilon here is the gap above 1, \(2^{-m}\), as [`torch.finfo`](https://docs.pytorch.org/docs/2.15/type_info.html) defines it; [Goldberg (1991)](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html) means half that gap. Past the largest value, results overflow to infinity (or saturate, or become NaN, where there is no infinity); below half the smallest subnormal they round to zero.

**The ladder.**
- **FP32**, IEEE single precision, is the reference for master weights, optimizer states and accumulators.
- **FP16** has only 5 exponent bits, so it tops out at 65,504.
- **BF16**, conceived at Google Brain, keeps FP32’s 8 exponent bits, and so its range, with 7 mantissa bits ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus)).
- **TF32** is an NVIDIA tensor-core mode since Ampere: FP32 range with a 10-bit mantissa inside ([NVIDIA, 2020](https://developer.nvidia.com/blog/nvidia-ampere-architecture-in-depth/)).
- **FP8** comes as E4M3, which drops infinities to reach 448, and E5M2, which keeps IEEE conventions. [Micikevicius et al., “FP8 Formats for Deep Learning” (2022)](https://arxiv.org/abs/2209.05433) recommend E4M3 for weights and activations and E5M2 for gradients.
- **Integers** (INT8, INT4) space values evenly and need scale factors; see [quantization](#quantization).

> [!note] Block-scaled formats, as of November 2026
> Below 8 bits, small blocks share a scale. The [OCP MX specification v1.1](https://www.opencompute.org/wp-content/uploads/2026/10/OCP_MicroXcaling_Spec_v1.1.0.pdf) (October 2026) gives every 32 elements an 8-bit power-of-two scale, defining MXFP8, MXFP6, MXFP4 (E2M1 elements) and MXINT8; MXFP4 averages 4.25 bits per value. NVIDIA’s NVFP4, introduced with Blackwell, scales blocks of 16 with an FP8 E4M3 factor plus one FP32 factor per tensor: 4.5 bits per value ([NVIDIA, 2025](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/)).

**Rounding.** The IEEE default is round to nearest, ties to even ([NVIDIA](https://docs.nvidia.com/cuda/floating-point/index.html)): ties go to the neighbor whose last bit is 0, so they do not drift upward, which is why 256 + 1 gave 256, not 258. Stochastic rounding rounds up with probability equal to the remainder’s share of the gap, so it is exact on average: in BF16, 1.0 + 0.001 becomes 1.0078125 about 13% of the time. [Gupta et al., “Deep Learning with Limited Numerical Precision” (2015)](https://arxiv.org/abs/1502.02551) trained in 16-bit fixed point this way.

**Mixed precision.** [Micikevicius et al., “Mixed Precision Training” (2017)](https://arxiv.org/abs/1710.03740) keep an FP32 master copy of the weights, compute in 16 bits, accumulate in FP32 and scale the loss so FP16 gradients do not underflow. BF16 has FP32’s range and rarely needs the scaling: [Kalamkar et al., “A Study of BFLOAT16 for Deep Learning Training” (2019)](https://arxiv.org/abs/1905.12322) match FP32 without changing hyperparameters. FP8 and FP4 recipes are in [low-precision training](#low-precision-training).

```viz
{"id":"floating-point-formats-loss-scaling","component":"stepper","title":"Loss scaling lifts FP16 gradients above the underflow line, then divides them back before the FP32 update","caption":"Illustrative values for one FP16 training step. The scale defaults are those of PyTorch’s GradScaler.","alt":"Stepper through one mixed-precision training step: FP32 master weights, cast to FP16, forward pass with FP32 accumulation, loss multiplied by 65,536, backward pass, unscale and check for Inf or NaN, and the FP32 weight update.","data":"illustrative","depicts":"PyTorch 2.15 torch.amp.GradScaler defaults (as of November 2026)","try":"Step to Backward and compare the gradient with and without the scale.","diagram":{"w":600,"h":56,"nodes":[{"id":"master","label":"FP32\nweights","role":"data","align":"center","glyph":false,"x":0,"y":0,"w":76,"h":56},{"id":"cast","label":"Cast to\nFP16","align":"center","glyph":false,"x":87,"y":0,"w":76,"h":56},{"id":"fwd","label":"Forward","role":"model","align":"center","glyph":false,"x":174,"y":0,"w":76,"h":56},{"id":"scale","label":"Loss\n× S","align":"center","glyph":false,"x":261,"y":0,"w":76,"h":56},{"id":"bwd","label":"Backward","role":"model","align":"center","glyph":false,"x":348,"y":0,"w":76,"h":56},{"id":"check","label":"Unscale,\ncheck","align":"center","glyph":false,"x":435,"y":0,"w":76,"h":56},{"id":"update","label":"Update","role":"data","align":"center","glyph":false,"x":522,"y":0,"w":78,"h":56}],"edges":[{"from":"master","to":"cast"},{"from":"cast","to":"fwd"},{"from":"fwd","to":"scale"},{"from":"scale","to":"bwd"},{"from":"bwd","to":"check"},{"from":"check","to":"update"}]},"frames":[
{"label":"Master weights","highlight":["master"],"caption":"The optimizer keeps an FP32 copy of every weight. An update of 0.0001 to a weight of 1.0 survives in FP32, but in FP16 the gap above 1 is 2⁻¹⁰ ≈ 0.001, so it would round away."},
{"label":"Cast","highlight":["cast"],"caption":"Inside autocast, eligible ops such as matrix multiplications and convolutions get FP16 copies of their inputs and weights. Ops such as softmax, layer_norm and cross_entropy stay in FP32."},
{"label":"Forward","highlight":["fwd"],"caption":"Tensor cores multiply FP16 values and add the products into FP32 accumulators, so long dot products keep their small terms."},
{"label":"Scale the loss","highlight":["scale"],"caption":"The loss is multiplied by S = 65,536 (2¹⁶), GradScaler’s default starting scale. By the chain rule every gradient grows by the same factor."},
{"label":"Backward","highlight":["bwd"],"caption":"A gradient of 10⁻⁸ would underflow to zero in FP16, whose smallest subnormal is 2⁻²⁴ ≈ 6 × 10⁻⁸. Scaled, it is about 6.6 × 10⁻⁴ and survives."},
{"label":"Unscale and check","highlight":["check"],"caption":"Gradients are divided by S. If any is Inf or NaN, the update is skipped and S is halved (backoff factor 0.5). After 2,000 clean steps in a row, S doubles."},
{"label":"Update","highlight":["update"],"caption":"The optimizer applies the unscaled gradients to the FP32 master weights. With BF16, which has FP32’s range, the scale and check steps are usually dropped."}]}
```

**Stable softmax and losses.** \(e^x\) overflows FP16 above \(x \approx 11.1\) and FP32 above \(x \approx 88.7\), so a naive softmax over [attention](#attention) scores or logits can return NaN. Subtracting the maximum m cancels in the ratio and keeps every exponent at or below zero. The same shift makes log-sum-exp safe:

```math
\log \sum_j e^{z_j} = m + \log \sum_j e^{z_j - m}, \qquad m = \max_j z_j
```

[Milakov and Gimelshein, “Online normalizer calculation for softmax” (2018)](https://arxiv.org/abs/1805.02867) get the maximum and the sum in one pass by rescaling the running sum whenever the maximum grows; [Dao et al., “FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness” (2022)](https://arxiv.org/abs/2205.14135) does the same block by block ([efficient attention](#long-context)). Compute [cross-entropy](#probability-information) straight from logits: PyTorch calls log and softmax done separately “slower and numerically unstable” ([docs](https://docs.pytorch.org/docs/2.15/generated/torch.nn.functional.log_softmax.html)).

```viz
{"id":"floating-point-formats-softmax","component":"compare","title":"Subtracting the maximum changes nothing mathematically and turns NaN into the right answer","caption":"Illustrative logits 12, 11 and 10 in NumPy float16. Hover the marks. The same overflow happens in FP32 once a logit passes about 88.7.","alt":"Two code snippets. The naive softmax computes exp of the float16 logits 12, 11 and 10; exp(12) overflows to infinity and the result is NaN, 0, 0. The stable version subtracts the maximum first and returns about 0.665, 0.245 and 0.090.","data":"illustrative","try":"Hover inf / inf to see where the NaN comes from.","a":{"title":"Naive: overflows","text":"import numpy as np\n\nz = np.array([12, 11, 10], dtype=np.float16)\ne = np.exp(z)          # exp(12) ≈ 162,755 > 65,504\np = e / e.sum()        # inf / inf\n# p: nan, 0, 0"},"b":{"title":"Stable: subtract the maximum","text":"import numpy as np\n\nz = np.array([12, 11, 10], dtype=np.float16)\ne = np.exp(z - z.max())   # exponents ≤ 0, so e ≤ 1\np = e / e.sum()\n# p: ≈ 0.665, 0.245, 0.090"},"links":[{"a":"np.exp(z)","note":"exp overflows float16 above about 11.1, because 65,504 is its largest value, and float32 above about 88.7."},{"a":"inf / inf","note":"One overflow poisons the sum, and infinity divided by infinity is NaN."},{"b":"z - z.max()","note":"The maximum cancels in the ratio, so the result is unchanged, but the largest exponent is now 0."}]}
```

**Cancellation and FMA.** Subtracting nearly equal numbers exposes the rounding error they carry: in FP64, (1 + 10⁻¹⁵) − 1 returns 1.11 × 10⁻¹⁵, an 11% error. Goldberg calls this catastrophic cancellation. A fused multiply-add, the core step of every matrix multiply in [linear algebra](#linear-algebra), rounds a × b + c once instead of twice, which is more accurate ([NVIDIA](https://docs.nvidia.com/cuda/floating-point/index.html)).

**Order matters.** Addition is not associative: (0.1 + 10²⁰) − 10²⁰ is 0, but 0.1 + (10²⁰ − 10²⁰) is 0.1. GPU kernels sum in an order set by how they split the work, which can change with batch size. [He, “Defeating Nondeterminism in LLM Inference” (2025)](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/) argues that this missing batch invariance is the main reason identical LLM requests return different outputs; see [inference nondeterminism](#inference-nondeterminism).

**Hardware.** Support arrived generation by generation (as of November 2026; more in [hardware](#hardware)):

| Hardware | Formats it added |
|---|---|
| NVIDIA Volta (V100) | FP16 multiply with FP32 accumulate ([NVIDIA, 2017](https://developer.nvidia.com/blog/programming-tensor-cores-cuda-9/)) |
| NVIDIA Ampere (A100) | BF16 and TF32 ([NVIDIA, 2020](https://developer.nvidia.com/blog/nvidia-ampere-architecture-in-depth/)) |
| NVIDIA Hopper (H100) | FP8 E4M3 and E5M2 ([NVIDIA, 2022](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/)) |
| NVIDIA Blackwell | FP4 with micro-tensor scaling and microscaling formats ([NVIDIA](https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/)), and NVFP4 ([NVIDIA, 2025](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/)) |
| AMD MI350 series | MXFP8, MXFP6 and MXFP4 ([AMD](https://rocm.docs.amd.com/en/docs-10.0.0/reference/gpu-arch/mi350.html)) |
| Google TPU v2 and v3 | BF16 multiply with FP32 accumulate ([Google Cloud, 2019](https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus)) |

## In practice

```viz
{"id":"floating-point-formats-memory","component":"calculator","title":"A 70B model needs 140 GB of weights in BF16 and about 37 GB in MXFP4","caption":"Pick a format. Block-scaled formats add their shared scales to the bits per value. Weights only: the KV cache, activations and training state come on top.","alt":"Calculator for weight memory from the number of parameters and the bits per value of a format, including the overhead of shared block scales, and the number of GPUs needed to hold the weights.","data":"formula","depicts":"OCP MX specification v1.1 block sizes and NVIDIA NVFP4","try":"Switch the format to NVFP4, then set the parameters to 8.","inputs":{"params_b":70,"bits":16,"gpu_gb":80},"input_meta":{"params_b":{"label":"Parameters","unit":"billions","min":0,"step":1},"bits":{"label":"Format","options":[["FP32, 32 bits",32],["BF16 or FP16, 16 bits",16],["MXFP8, 8 + 8/32 bits",8.25],["FP8, 8 bits",8],["MXFP6, 6 + 8/32 bits",6.25],["NVFP4, 4 + 8/16 bits",4.5],["MXFP4, 4 + 8/32 bits",4.25]]},"gpu_gb":{"label":"GPU memory","unit":"GB","min":1,"step":1}},"outputs":[{"id":"bytes_per_param","label":"Bytes per parameter","expr":"bits / 8","unit":""},{"id":"weights_gb","label":"Weight memory","expr":"params_b * bits / 8","unit":"GB","main":true},{"id":"gpus","label":"GPUs for the weights alone","expr":"ceil(weights_gb / gpu_gb)","unit":"count"}],"assumptions":["Bits per value include shared scales: MX formats add one 8-bit scale per 32 values, NVFP4 one 8-bit scale per 16 values. NVFP4’s single FP32 scale per tensor is ignored.","Every parameter uses the chosen format; checkpoints that keep some tensors in higher precision need more.","Decimal gigabytes (10⁹ bytes). No KV cache, activations, optimizer state or framework overhead."],"tests":[{"inputs":{},"expect":{"bytes_per_param":2,"weights_gb":140,"gpus":2}},{"inputs":{"bits":4.25},"expect":{"weights_gb":37.1875,"gpus":1}},{"inputs":{"bits":4.5,"params_b":8},"expect":{"weights_gb":4.5}}]}
```

- Train in BF16 under [autocast](https://docs.pytorch.org/docs/2.15/amp.html), which runs matrix multiplications in 16 bits and softmax, layer_norm and cross_entropy in FP32. Keep master weights and optimizer states in FP32; use FP16 only with a gradient scaler.
- TF32 for FP32 matrix multiplications is opt-in in PyTorch, as of November 2026 ([docs](https://docs.pytorch.org/docs/2.15/generated/torch.set_float32_matmul_precision.html)).
- Serve in BF16 or FP8, and go to 4 bits only after measuring quality ([quantization](#quantization)).

```python
import torch
import torch.nn.functional as F

for dt in (torch.float32, torch.bfloat16, torch.float16):
    fi = torch.finfo(dt)
    print(dt, fi.max, fi.eps, fi.smallest_normal)

torch.set_float32_matmul_precision("high")      # TF32 for FP32 matmuls; default is "highest"

def bf16_step(model, opt, x, y):                # parameters and optimizer state stay FP32
    with torch.autocast(device_type="cuda", dtype=torch.bfloat16):
        loss = F.cross_entropy(model(x), y)     # loss from logits; autocast runs it in FP32
    loss.backward()
    opt.step()
    opt.zero_grad(set_to_none=True)

scaler = torch.amp.GradScaler("cuda")           # needed for FP16 only

def fp16_step(model, opt, x, y):
    with torch.autocast(device_type="cuda", dtype=torch.float16):
        loss = F.cross_entropy(model(x), y)
    scaler.scale(loss).backward()
    scaler.step(opt)                            # unscales; skips the step on Inf or NaN
    scaler.update()                             # shrinks or grows the scale
    opt.zero_grad(set_to_none=True)
```

## Numbers to know

> [!number]
> Rules of thumb from the bit layouts. Bytes per parameter: FP32 4, BF16 2, FP8 1, MXFP4 about 0.53, NVFP4 about 0.56; a 70B model needs 140 GB in BF16 and about 37 GB in MXFP4. FP32 holds about 7 significant decimal digits, FP16 3, BF16 2. Mixed-precision Adam needs about 16 bytes of state per parameter ([Rajbhandari et al., “ZeRO: Memory Optimizations Toward Training Trillion Parameter Models” (2019)](https://arxiv.org/abs/1910.02054); see [distributed training](#distributed-training)).

| Format | Sign, exponent, mantissa bits | Largest finite value | Smallest normal | Epsilon (gap above 1) |
|---|---|---|---|---|
| FP64 | 1, 11, 52 | ≈ 1.8 × 10³⁰⁸ | 2⁻¹⁰²² ≈ 2.2 × 10⁻³⁰⁸ | 2⁻⁵² ≈ 2.2 × 10⁻¹⁶ |
| FP32 | 1, 8, 23 | ≈ 3.4 × 10³⁸ | 2⁻¹²⁶ ≈ 1.2 × 10⁻³⁸ | 2⁻²³ ≈ 1.2 × 10⁻⁷ |
| TF32 | 1, 8, 10 | ≈ 3.4 × 10³⁸ | 2⁻¹²⁶ | 2⁻¹⁰ ≈ 9.8 × 10⁻⁴ |
| BF16 | 1, 8, 7 | ≈ 3.4 × 10³⁸ | 2⁻¹²⁶ | 2⁻⁷ ≈ 7.8 × 10⁻³ |
| FP16 | 1, 5, 10 | 65,504 | 2⁻¹⁴ ≈ 6.1 × 10⁻⁵ | 2⁻¹⁰ ≈ 9.8 × 10⁻⁴ |
| FP8 E5M2 | 1, 5, 2 | 57,344 | 2⁻¹⁴ | 2⁻² = 0.25 |
| FP8 E4M3 | 1, 4, 3 | 448 | 2⁻⁶ | 2⁻³ = 0.125 |
| FP6 E3M2 | 1, 3, 2 | 28 | 0.25 | 0.25 |
| FP6 E2M3 | 1, 2, 3 | 7.5 | 1 | 0.125 |
| FP4 E2M1 | 1, 2, 1 | 6 | 1 | 0.5 |

The FP8, FP6 and FP4 rows match the OCP MX specification; the rest follow from the layouts.

## Pitfalls and anti-patterns

> [!pitfall] Accumulating in 16 bits
> A BF16 or FP16 sum, or an update applied straight to BF16 weights, drops every term below half an ULP of the total. Keep accumulators, master weights and optimizer states in FP32, or use stochastic rounding.

- **Moving a BF16-pretrained model to FP16.** PyTorch warns that most bf16-pretrained models “cannot operate in the fp16 numerical range of max 65504”, so their gradients overflow instead of underflow ([AMP docs](https://docs.pytorch.org/docs/2.15/amp.html)).
- **Assuming E4M3 has infinity.** An overflow saturates to ±448 or becomes NaN, depending on the conversion mode (Table 3 of the [OCP MX specification v1.1](https://www.opencompute.org/wp-content/uploads/2026/10/OCP_MicroXcaling_Spec_v1.1.0.pdf)).

## Talk like an expert

The vocabulary: **mantissa** (significand), **binade**, **ULP**, **subnormal**, **flush-to-zero**, **saturation**, **round-to-nearest-even**, **stochastic rounding**, **master weights**, **loss scaling**, **microscaling**. Experts name formats by layout (E4M3, not FP8), say where accumulation happens and count scale overhead in bytes per parameter. Live debates: how low training precision can go before its recipes turn fragile, and whether batch-invariant inference is worth its throughput cost.

> [!hottake] Default to BF16 and forget loss scaling.
> **The counterargument:** BF16’s gap above 1 is 8 times coarser than FP16’s (2⁻⁷ against 2⁻¹⁰). Where range is not the problem, FP16 keeps more information, and BF16 used for accumulators or weight updates silently loses it.

## Check yourself

```quiz
floating-point-formats
```

## Go deeper

- [Goldberg, “What Every Computer Scientist Should Know About Floating-Point Arithmetic” (1991)](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)
- [Micikevicius et al., “Mixed Precision Training” (2017)](https://arxiv.org/abs/1710.03740)
- [Micikevicius et al., “FP8 Formats for Deep Learning” (2022)](https://arxiv.org/abs/2209.05433) and the [OCP MX specification v1.1](https://www.opencompute.org/wp-content/uploads/2026/10/OCP_MicroXcaling_Spec_v1.1.0.pdf) (2026)

## Related

- [Quantization](#quantization)
- [Memory math](#memory-math)
- [Mixed and low-precision training](#low-precision-training)
- [Nondeterminism and reproducible inference](#inference-nondeterminism)
- [Hardware](#hardware)
- [Quantization methods in depth](#quantization-methods)
