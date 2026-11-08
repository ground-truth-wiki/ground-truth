---
id: pretraining-run
book: 3
order: "3.0"
title: The pretraining run, end to end
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [pretraining, training-run, sequence-packing, loss-curves, checkpoints]
visuals:
  - pretraining-run-map:diagram
  - pretraining-run-packing:stepper
  - pretraining-run-schedules:chart
  - pretraining-run-budget:calculator
prerequisites:
  - transformer-block
  - calculus-optimization
---
> [!tldr]
> A pretraining run turns a tokenized corpus into a base model by repeating one step hundreds of thousands of times or more: predict every next token, score them with cross-entropy, update the weights. The step is simple; the craft is everything around it, from packing and schedules to curves, checkpoints and the handoff to post-training.

## Why it matters
Every base model, and every number in its release (tokens, FLOP, GPU-hours, MFU), comes out of this loop, which continued pretraining and [mid-training](#mid-training) reuse. Knowing it lets you check a technical report in a minute, size a job before renting GPUs, and tell noise from a spike that needs a restart.

## Intuition
A pretraining run is a long-haul flight on autopilot. The autopilot is one simple loop; the real work is the flight plan (data, batch size, schedule), the instruments (loss and gradient-norm curves) and the procedures for trouble (checkpoints, restarts). Test flights come first, and the flight ends with a handover to [post-training](#post-training-overview).

```viz
{"id":"pretraining-run-map","component":"diagram","title":"A pretraining run is one optimizer step repeated hundreds of thousands of times or more, inside a sequence of stages","caption":"Illustrative. Two tabs: the loop of one optimizer step, and the stages around it. Most boxes open the chapter that covers them in depth.","alt":"Diagram with two tabs. One step: corpus, tokenize and pack, global batch, model forward pass, cross-entropy loss, optimizer step that sends new weights back to the model, with checkpoints, loss and gradient-norm curves, and evals on the side. Stages: small proxy runs, main pretraining, long-context extension, annealing or mid-training, base model, post-training.","data":"illustrative","try":"Switch to the Stages tab to see where post-training takes over.","w":600,"variants":[
{"name":"One step","h":290,"note":"Repeated 600,000 times in nanoGPT’s GPT-2 run; Llama 3 405B’s cosine schedule spans 1.2 million steps. Dashed lines are periodic side jobs, not part of every step.","nodes":[
{"id":"corpus","label":"Corpus","sub":"filtered text","role":"data","x":0,"y":0,"w":170,"h":60,"link":"#pretraining-data"},
{"id":"pack","label":"Tokenize, pack","sub":"fixed-length rows","role":"token","x":215,"y":0,"w":170,"h":60,"link":"#tokenizers-in-practice"},
{"id":"batch","label":"Global batch","sub":"millions of tokens","x":430,"y":0,"w":170,"h":60,"link":"#distributed-training"},
{"id":"model","label":"Model","sub":"forward pass","role":"model","x":430,"y":120,"w":170,"h":60,"link":"#transformer-block"},
{"id":"loss","label":"Cross-entropy","sub":"one number per step","x":215,"y":120,"w":170,"h":60,"link":"#loss-functions"},
{"id":"opt","label":"Optimizer step","sub":"clip, AdamW, schedule","x":0,"y":120,"w":170,"h":60,"link":"#training-hyperparameters"},
{"id":"ckpt","label":"Checkpoints","sub":"for restarts","role":"data","x":0,"y":230,"w":170,"h":60,"link":"#training-reliability"},
{"id":"curves","label":"Loss, grad norm","sub":"logged every step","x":215,"y":230,"w":170,"h":60,"link":"#training-stability"},
{"id":"evals","label":"Evals","sub":"on checkpoints","x":430,"y":230,"w":170,"h":60,"link":"#base-model-evaluation"}],
"edges":[{"from":"corpus","to":"pack"},{"from":"pack","to":"batch"},{"from":"batch","to":"model"},{"from":"model","to":"loss"},{"from":"loss","to":"opt"},{"from":"opt","to":"model","curve":-80,"label":"new weights"},{"from":"opt","to":"ckpt","style":"dashed"},{"from":"loss","to":"curves","style":"dashed"},{"from":"model","to":"evals","style":"dashed"}]},
{"name":"Stages","h":184,"note":"The order follows Llama 3: initial pretraining, long-context pretraining, then annealing. OLMo 2 instead names a mid-training stage of 5 to 10% of training FLOPs after main pretraining.","nodes":[
{"id":"proxy","label":"Small proxy runs","sub":"ablations, scaling laws","x":0,"y":0,"w":170,"h":64,"link":"#scaling-laws"},
{"id":"main","label":"Main pretraining","sub":"most of the tokens","role":"model","x":215,"y":0,"w":170,"h":64},
{"id":"long","label":"Long-context\nextension","sub":"longer rows","x":430,"y":0,"w":170,"h":64,"link":"#long-context-training"},
{"id":"anneal","label":"Annealing or\nmid-training","sub":"decay, best data","x":430,"y":120,"w":170,"h":64,"link":"#mid-training"},
{"id":"base","label":"Base model","sub":"averaged weights","role":"model","x":215,"y":120,"w":170,"h":64},
{"id":"post","label":"Post-training","sub":"SFT, preferences, RL","x":0,"y":120,"w":170,"h":64,"link":"#post-training-overview"}],
"edges":[{"from":"proxy","to":"main"},{"from":"main","to":"long"},{"from":"long","to":"anneal"},{"from":"anneal","to":"base"},{"from":"base","to":"post"}]}]}
```

Most boxes open their deep dive, so the diagram doubles as a map of the chapters around this one.

## How it works
**The objective.** The loss is the average negative log-probability of each true next token, given the tokens before it:

```math
\mathcal{L} = -\frac{1}{T}\sum_{t=1}^{T} \log p_\theta(x_t \mid x_{<t})
```

This is the cross-entropy between data and model, in nats per token; exp(𝓛) is the perplexity. See [what a language model is](#language-modeling) and [loss functions](#loss-functions).

**From corpus to batches.** Tokenize each document, append an end-of-document token, concatenate, and cut fixed-length rows. PaLM used rows of exactly 2,048 tokens with no padding, letting documents split ([Chowdhery et al., “PaLM: Scaling Language Modeling with Pathways” (2022)](https://arxiv.org/abs/2204.02311)). Llama 3 also blocked attention across documents: limited impact in standard pretraining, but important for continued pretraining on very long sequences ([Grattafiori et al., “The Llama 3 Herd of Models” (2024)](https://arxiv.org/abs/2407.21783)).

```viz
{"id":"pretraining-run-packing","component":"stepper","title":"Packing fills every row with real tokens; an intra-document mask keeps each document from seeing its neighbors","caption":"Illustrative tokens and a toy row length of 8; real runs use thousands of tokens per row. In the masks, a row attends to a column only where the cell is filled; hatched cells are blocked.","alt":"Stepper: three documents are tokenized, end-of-document tokens are appended, the stream is cut into rows of 8 tokens, targets are the inputs shifted by one, then a causal mask and an intra-document mask are shown as 8 by 8 grids.","data":"illustrative","try":"Step to the last two frames and compare what “Rain” can see.","frames":[
{"label":"Tokenize","caption":"Each document is tokenized on its own. A, “The cat sat.”, becomes 4 tokens; B, “Rain fell all day.”, 5; C, “Hi!”, 2. None matches the model’s fixed row length.","tokens":["The","␣cat","␣sat","."]},
{"label":"Mark the ends","caption":"An end-of-document token follows each document, and everything is concatenated into one stream of 14 tokens. PaLM calls it `[eod]`; GPT-2’s tokenizer calls it `<|endoftext|>`.","tokens":["The","␣cat","␣sat",".","<eod>","Rain","␣fell","␣all","␣day",".","<eod>","Hi","!","<eod>"]},
{"label":"Cut into rows","caption":"The stream is cut into rows of exactly 8 tokens. No padding, so no compute is wasted, but B is split: “␣day . <eod>” opens row 2.","tokens":["The","␣cat","␣sat",".","<eod>","Rain","␣fell","␣all"]},
{"label":"Inputs and targets","caption":"The targets are the inputs shifted left by one token. One row of 8 gives 8 predictions, each scored by cross-entropy.","tokens":["The","␣cat","␣sat",".","<eod>","Rain","␣fell","␣all"],"code":"input : The   ␣cat  ␣sat  .     <eod> Rain  ␣fell ␣all\ntarget: ␣cat  ␣sat  .     <eod> Rain  ␣fell ␣all  ␣day"},
{"label":"Causal mask","caption":"A plain causal mask lets each token see every earlier token in the row, so “Rain” and the rest of B attend to the unrelated cat sentence.","matrix":{"title":"Row attends to column","rows":["The","␣cat","␣sat",".","<eod>","Rain","␣fell","␣all"],"cols":["The","␣cat","␣sat",".","<eod>","Rain","␣fell","␣all"],"values":[[1,"mask","mask","mask","mask","mask","mask","mask"],[1,1,"mask","mask","mask","mask","mask","mask"],[1,1,1,"mask","mask","mask","mask","mask"],[1,1,1,1,"mask","mask","mask","mask"],[1,1,1,1,1,"mask","mask","mask"],[1,1,1,1,1,1,"mask","mask"],[1,1,1,1,1,1,1,"mask"],[1,1,1,1,1,1,1,1]],"min":0,"max":1,"numbers":false}},
{"label":"Intra-document mask","caption":"With an intra-document mask, B’s tokens see only B. The grid becomes block-diagonal, one causal triangle per document.","matrix":{"title":"Row attends to column","rows":["The","␣cat","␣sat",".","<eod>","Rain","␣fell","␣all"],"cols":["The","␣cat","␣sat",".","<eod>","Rain","␣fell","␣all"],"values":[[1,"mask","mask","mask","mask","mask","mask","mask"],[1,1,"mask","mask","mask","mask","mask","mask"],[1,1,1,"mask","mask","mask","mask","mask"],[1,1,1,1,"mask","mask","mask","mask"],[1,1,1,1,1,"mask","mask","mask"],["mask","mask","mask","mask","mask",1,"mask","mask"],["mask","mask","mask","mask","mask",1,1,"mask"],["mask","mask","mask","mask","mask",1,1,1]],"min":0,"max":1,"numbers":false}}]}
```

**Batch size.** The global batch, in tokens, is micro-batch × row length × accumulation steps × data-parallel replicas. Gradient accumulation sums several micro-batches' gradients before one update, so fewer GPUs reach the same batch by taking longer. Big runs ramp it up: PaLM 540B from about 1M to 4M tokens, Llama 3 405B from 4M to 16M. PaLM's reason is that small batches learn more per token early, while large ones give better gradient estimates later; Llama 3 cites stability early and efficiency later. See [distributed training](#distributed-training).

**The learning-rate schedule.** Llama 3 405B warmed up over 8,000 steps to 8 × 10⁻⁵, followed a cosine to about 8 × 10⁻⁷ over 1.2 million steps, and annealed linearly to zero over the last 40M tokens. Warmup-stable-decay (WSD) holds the peak and decays only at the end ([Hu et al., “MiniCPM: Unveiling the Potential of Small Language Models with Scalable Training Strategies” (2024)](https://arxiv.org/abs/2404.06395)). A cooldown can start from any checkpoint, so one run serves several lengths ([Hägele et al., “Scaling Laws and Compute-Optimal Training Beyond Fixed Training Durations” (2024)](https://arxiv.org/abs/2405.18392)). Depth in [learning rate, batch size and schedules](#training-hyperparameters).

```viz
{"id":"pretraining-run-schedules","component":"chart","type":"line","title":"Cosine decays all the way; WSD holds the peak and can branch a short cooldown from any checkpoint","caption":"Formula view, as a fraction of the peak rate. Cosine: 2% linear warmup, then decay to 10% of the peak. WSD: the same warmup, a constant rate, and a cooldown over the last 20% of the run in the 1−√ shape Hägele et al. found better than linear. The early stop branches a cooldown of the same relative length from the stable phase at 40%.","alt":"Line chart of learning rate against share of training. Cosine warms up to 1 at 2% and falls smoothly to 0.1 at 100%. WSD warms up, stays at 1 until 80%, then falls to 0 at 100%. A second WSD branch falls from 1 at 40% to 0 at 50%.","data":"formula","try":"Compare the two runs at 40%: cosine has already given up about 30% of its peak rate, WSD none.","x":{"label":"Share of training steps (%)","min":0,"max":100},"y":{"label":"Learning rate (fraction of peak)","min":0,"max":1},"series":[
{"name":"Cosine","points":[[0,0],[2,1],[10,0.985],[20,0.927],[30,0.831],[40,0.705],[50,0.564],[60,0.422],[70,0.293],[80,0.189],[90,0.123],[100,0.1]]},
{"name":"WSD","points":[[0,0],[2,1],[80,1],[85,0.5],[90,0.293],[95,0.134],[100,0]]},
{"name":"WSD, early stop","points":[[40,1],[42.5,0.5],[45,0.293],[47.5,0.134],[50,0]]}],"marks":[{"x":80,"label":"cooldown"}]}
```

**Stability defaults.** Small random initialization (standard deviation 0.02 in [Team OLMo, “2 OLMo 2 Furious” (2024)](https://arxiv.org/abs/2501.00656)), gradient clipping at norm 1.0 (PaLM, OLMo 2), weight decay 0.1 (nanoGPT), PaLM's z-loss of 10⁻⁴ · log² Z to keep log Z near zero, and QK-norm on queries and keys (OLMo 2). Z-loss and QK-norm also tame the instabilities small models reproduce at high learning rates ([Wortsman et al., “Small-scale proxies for large-scale Transformer training instabilities” (2023)](https://arxiv.org/abs/2309.14322)). Depth in [training stability](#training-stability).

**Reading the curves.** Log loss and gradient norm every step. Loss should fall fast, then slowly; a spike is a sudden jump. The OLMo 2 team found that large gradient-norm spikes often came before loss spikes. PaLM 540B spiked about 20 times; restarting about 100 steps earlier and skipping 200 to 500 batches fixed each, although the same batches were harmless from an earlier checkpoint.

**Proxies and checkpoints.** Llama 3 fit [scaling laws](#scaling-laws) on models of 40M to 16B parameters to choose the flagship's size, and chose its data mix with small models too. A checkpoint holds weights, optimizer state and data position; with 466 job interruptions in 54 days, restarts are routine ([fault tolerance](#training-reliability)). OLMo 2 released thousands of intermediate checkpoints. Averaging helps at the end: Llama 3 averaged checkpoints during annealing, OLMo 2 several anneals.

**Stages and the handoff.** Llama 3 ran initial pretraining, then long-context pretraining (about 800B tokens, from 8K to 128K in six stages), then annealing on upsampled high-quality data. OLMo 2's mid-training takes 5 to 10% of training FLOPs. The output is a base model for [post-training](#post-training-overview). See [long-context training](#long-context-training).

## In practice
**Read a technical report** by checking its numbers against each other. Llama 3 405B: 15.6T tokens, about 38 per parameter; 6 × 405B × 15.6T ≈ 3.8 × 10²⁵ FLOP, the figure it reports; up to 16K H100s at 38 to 43% MFU; a mix of roughly 50% general knowledge, 25% math and reasoning, 17% code and 8% multilingual. Its [model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md) lists 30.84M GPU-hours as total training time. The calculator below, set to its Table 4 layout at 41% MFU, gives about 26M: it counts only useful model math, not restarts or other overhead. MFU, defined in PaLM, is achieved throughput over the theoretical maximum at peak FLOP/s. See [compute accounting](#compute-accounting).

```viz
{"id":"pretraining-run-budget","component":"calculator","title":"The config fixes the tokens per step; tokens set the FLOP; peak speed and MFU turn FLOP into days","caption":"Formula view. Defaults are nanoGPT’s GPT-2 (124M) config, 12 × 1,024 × 5 × 8 tokens per step for 600,000 steps. The 25% MFU is an assumption, not a measurement: with it, the formula lands near the README’s “about 4 days” on 8 A100s.","alt":"Calculator from micro-batch, row length, accumulation steps, data-parallel replicas, GPUs per replica, optimizer steps, parameters, peak TFLOP/s and MFU to tokens per step, training tokens, tokens per parameter, training FLOP, GPU-hours and wall-clock days.","data":"formula","try":"Set data-parallel replicas to 1 and accumulation steps to 40: the tokens per step stay the same and the days grow eightfold.","inputs":{"micro_batch":12,"seq_len":1024,"accum":5,"dp":8,"gpus_per_replica":1,"steps":600000,"params_m":124,"peak_tflops":312,"mfu":0.25},"input_meta":{"micro_batch":{"label":"Micro-batch","unit":"rows per replica","min":1,"step":1},"seq_len":{"label":"Row length","unit":"tokens","min":1,"step":1},"accum":{"label":"Gradient accumulation steps","min":1,"step":1},"dp":{"label":"Data-parallel replicas","min":1,"step":1},"gpus_per_replica":{"label":"GPUs per replica","unit":"tensor × pipeline × context parallel","min":1,"step":1},"steps":{"label":"Optimizer steps","min":1,"step":1000},"params_m":{"label":"Parameters","unit":"millions","min":1},"peak_tflops":{"label":"Peak per GPU","unit":"dense BF16 TFLOP/s","min":1},"mfu":{"label":"MFU","unit":"0 to 1","min":0.01,"max":1,"step":0.01}},"outputs":[{"id":"batch_tokens","label":"Tokens per optimizer step","expr":"micro_batch * seq_len * accum * dp","unit":"tokens"},{"id":"tokens_b","label":"Training tokens (billions)","expr":"batch_tokens * steps / 1e9","unit":"count"},{"id":"tokens_per_param","label":"Tokens per parameter","expr":"tokens_b * 1000 / params_m","unit":"count"},{"id":"flop","label":"Training compute, 6 × N × D","expr":"6 * params_m * 1e6 * tokens_b * 1e9","unit":"flop"},{"id":"gpu_hours","label":"GPU-hours","expr":"flop / (peak_tflops * 1e12 * mfu * 3600)","unit":"count"},{"id":"days","label":"Wall-clock time","expr":"gpu_hours / (dp * gpus_per_replica) / 24","unit":"days","main":true}],"assumptions":["Dense model: about 6 FLOP per parameter per training token (Kaplan et al., 2020). Attention FLOPs, which grow with row length, are left out.","Peak is the dense BF16 rate. nanoGPT’s own MFU estimate uses 312 TFLOP/s for an A100; NVIDIA lists 1,979 TFLOP/s for an H100 SXM with sparsity, twice its dense rate of about 989.","MFU counts only useful model math; restarts, evaluation and checkpointing come on top.","One constant batch size; a run with a batch-size ramp is a sum over its phases."],"tests":[{"inputs":{},"expect":{"batch_tokens":491520,"tokens_b":294.912,"flop":2.19414528e20,"days":4.06974},"tol":0.0001,"note":"nanoGPT’s GPT-2 config: about 295B tokens and 2.2 × 10²⁰ FLOP"},{"inputs":{"accum":40,"dp":1},"expect":{"batch_tokens":491520,"days":32.55795},"tol":0.0001,"note":"The same tokens per step on one GPU take eight times as long"},{"inputs":{"micro_batch":16,"seq_len":8192,"accum":1,"dp":128,"gpus_per_replica":128,"steps":930000,"params_m":405000,"peak_tflops":989,"mfu":0.41},"expect":{"batch_tokens":16777216,"flop":3.79148e25,"gpu_hours":25973260},"tol":0.0001,"note":"Llama 3 405B’s 16M-token layout on 16,384 H100s (its Table 4); 930,000 steps at that batch would be about 15.6T tokens and 3.8 × 10²⁵ FLOP"}]}
```

**A worked tiny run**, with nanoGPT's hyperparameters scaled down ([karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)):

```python
import math, torch
import torch.nn.functional as F
from transformers import AutoTokenizer, GPT2Config, GPT2LMHeadModel

device = "cuda" if torch.cuda.is_available() else "cpu"
SEQ, MICRO, ACCUM = 256, 8, 4                # 256 * 8 * 4 = 8,192 tokens per step
PEAK_LR, MIN_LR, WARMUP, STEPS = 6e-4, 6e-5, 100, 2_000

tok = AutoTokenizer.from_pretrained("gpt2")
docs = open("corpus.txt").read().split("\n\n")   # your documents
ids = [t for d in docs for t in tok(d)["input_ids"] + [tok.eos_token_id]]
data = torch.tensor(ids)                     # one packed stream

def get_batch():
    i = torch.randint(len(data) - SEQ - 1, (MICRO,))
    x = torch.stack([data[j : j + SEQ] for j in i])
    y = torch.stack([data[j + 1 : j + 1 + SEQ] for j in i])  # shifted by one
    return x.to(device), y.to(device)

def lr_at(step):
    if step < WARMUP:
        return PEAK_LR * (step + 1) / WARMUP
    progress = (step - WARMUP) / (STEPS - WARMUP)
    return MIN_LR + 0.5 * (PEAK_LR - MIN_LR) * (1 + math.cos(math.pi * progress))

model = GPT2LMHeadModel(GPT2Config(n_layer=6, n_head=6, n_embd=384, n_positions=SEQ)).to(device)
opt = torch.optim.AdamW(model.parameters(), lr=PEAK_LR, betas=(0.9, 0.95), weight_decay=0.1)

for step in range(STEPS):
    for group in opt.param_groups:
        group["lr"] = lr_at(step)
    for _ in range(ACCUM):
        x, y = get_batch()
        with torch.autocast(device_type=device, dtype=torch.bfloat16):
            logits = model(x).logits
        loss = F.cross_entropy(logits.float().view(-1, logits.size(-1)), y.view(-1))
        (loss / ACCUM).backward()            # gradients add up; / ACCUM makes them a mean
    grad_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    opt.step()
    opt.zero_grad(set_to_none=True)
    if step % 50 == 0:
        print(f"step {step} loss {loss.item():.3f} grad_norm {grad_norm.item():.2f}")
    if step % 500 == 0:
        torch.save({"model": model.state_dict(), "opt": opt.state_dict(), "step": step}, f"ckpt_{step}.pt")
```

nanochat runs the modern pipeline, from tokenizer training to SFT, RL and evaluation, as separate scripts; as of November 2026 its README describes a speedrun of about 1.5 hours on one 8×H100 node ([karpathy/nanochat](https://github.com/karpathy/nanochat)). In the Spring 2026 offering of Stanford's [CS336](https://cs336.stanford.edu/), Assignment 1 has you implement a tokenizer, the model and the optimizer, then train a minimal language model.

## Numbers to know
> [!number]
> Rules of thumb. Training compute ≈ 6 × parameters × tokens ([Kaplan et al., “Scaling Laws for Neural Language Models” (2020)](https://arxiv.org/abs/2001.08361)). Global batches run from about 0.5M tokens (nanoGPT's 124M model) to 16M (Llama 3 405B). Clip gradients at 1.0 (PaLM, OLMo 2, nanoGPT). Large published runs report 38 to 46% MFU (Llama 3, PaLM).

## Pitfalls and anti-patterns
> [!pitfall] A data pipeline you cannot replay
> If you cannot say which batch step k saw, you cannot skip batches around a spike or resume exactly. PaLM made each batch a function of the step number; save the data position with every checkpoint.

- **Weights-only checkpoints.** A resume without optimizer state is a different run.
- **Hand-carried learning rates.** A rate copied from another model size can fail: learning-rate sensitivity grows with model size (Wortsman et al.). Re-tune it for the new size.
- **Judging WSD mid-run.** The cooldown brings a sharp drop in loss (Hägele et al.).
- **Loss across tokenizers.** Per-token loss depends on the tokenizer; compare bits per byte instead, which nanochat's evaluation uses because it does not depend on the vocabulary size.

## Talk like an expert
The vocabulary: **global batch**, **gradient accumulation**, **batch ramp**, **WSD**, **cooldown**, **z-loss**, **QK-norm**, **loss spike**, **MFU**, **proxy model**, **checkpoint averaging**. Experts frame a run as a budget of tokens, FLOP and MFU. Live debates: cosine or WSD, whether intra-document masking matters at normal lengths, and how far small proxies can be trusted.

> [!hottake] A good pretraining run is boring: data, ablations and the schedule decide its quality before step one.
> **The counterargument:** some failures exist only at scale. PaLM's spikes hit the 540B model, not the smaller ones, and learning-rate sensitivity grows with size, so in-run calls (restart, skip, when to cool down) still matter.

## Check yourself
```quiz
pretraining-run
```

## Go deeper
- [Grattafiori et al., “The Llama 3 Herd of Models” (2024)](https://arxiv.org/abs/2407.21783), section 3.
- [Team OLMo, “2 OLMo 2 Furious” (2024)](https://arxiv.org/abs/2501.00656): an open recipe with logs.
- [Chowdhery et al., “PaLM: Scaling Language Modeling with Pathways” (2022)](https://arxiv.org/abs/2204.02311), section 5.

## Related
- [Pretraining data](#pretraining-data)
- [Scaling laws and compute](#scaling-laws)
- [Distributed training](#distributed-training)
- [Mid-training](#mid-training)
- [Learning rate, batch size and schedules](#training-hyperparameters)
- [Post-training: from base model to assistant](#post-training-overview)
