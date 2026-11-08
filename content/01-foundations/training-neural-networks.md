---
id: training-neural-networks
book: 1
order: "1.8"
title: Training neural networks in practice
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [training, training-loop, regularization, debugging, overfitting]
visuals:
  - training-neural-networks-step:stepper
  - training-neural-networks-batch-calculator:calculator
  - training-neural-networks-curves:chart
  - training-neural-networks-loop-walk:code-walk
prerequisites: [neural-networks, calculus-optimization]
---
> [!tldr]
> Training is a short loop repeated thousands of times: load a batch, run the model forward, compute the loss, backpropagate, update the weights, clear the gradients. Everything else (data loaders, validation curves, regularization, checkpoints, tuning and debugging) keeps that loop fast, honest and recoverable.

## Why it matters
Neural net training “fails silently” ([Karpathy, 2019](https://karpathy.github.io/2019/04/25/recipe/)): a broken run rarely crashes, it just trains a worse model. Shuffling bugs, validation in training mode and mis-sized schedules all look like normal runs. Knowing the loop and its instruments catches them in minutes, whether you train a classifier or [fine-tune a language model](#fine-tuning-practice).

## Intuition
Picture a student with flashcards. They shuffle, take a handful, answer, check and adjust. They never study from the mock exam (the validation set) and sit the real exam (the test set) once. A handful is a mini-batch, an adjustment is a step, and a trip through the deck is an epoch.

```viz
{"id":"training-neural-networks-step","component":"stepper","title":"Every step is the same five lines: forward, loss, backward, update, clear","caption":"One optimizer step in PyTorch, operation by operation, with the line of code for each. Illustrative.","alt":"Stepper through one training step: the DataLoader builds a batch from the dataset, the model makes predictions, the loss reduces them to one number, backward fills the gradients, the optimizer updates the weights, and the gradients are cleared.","data":"illustrative","try":"Press play, then pause on Zero and ask what the next step would compute without it.","depicts":"PyTorch 2.15 API (as of November 2026)","diagram":{"w":600,"h":190,"nodes":[{"id":"dataset","label":"Dataset","sub":"examples","role":"data","x":0,"y":0,"w":120,"h":56},{"id":"loader","label":"DataLoader","sub":"shuffle, batch","role":"data","x":150,"y":0,"w":140,"h":56},{"id":"model","label":"Model","sub":"weights","role":"model","x":320,"y":0,"w":130,"h":56},{"id":"loss","label":"Loss","sub":"one number","role":"plain","x":480,"y":0,"w":120,"h":56},{"id":"opt","label":"Optimizer","sub":"AdamW state","role":"tool","x":320,"y":130,"w":130,"h":56},{"id":"grads","label":"Gradients","sub":".grad buffers","role":"plain","x":480,"y":130,"w":120,"h":56}],"edges":[{"from":"dataset","to":"loader"},{"from":"loader","to":"model"},{"from":"model","to":"loss"},{"from":"loss","to":"grads","label":"backward","dx":-44},{"from":"grads","to":"opt"},{"from":"opt","to":"model","label":"update","dx":-40}]},"frames":[{"label":"Batch","highlight":["dataset","loader"],"edges":["dataset>loader"],"caption":"The DataLoader draws shuffled indices, worker processes read and transform those examples, and collate stacks them into one batch tensor. Workers prefetch the next batches while the GPU computes.","code":"for x, y in loader:"},{"label":"Forward","highlight":["loader","model"],"edges":["loader>model"],"caption":"The model computes predictions for the whole batch in one pass. Autograd records every operation so it can run them backward later.","code":"pred = model(x)"},{"label":"Loss","highlight":["model","loss"],"edges":["model>loss"],"caption":"The loss function compares predictions with labels and averages over the batch: one number that says how wrong the model is.","code":"loss = loss_fn(pred, y)"},{"label":"Backward","highlight":["loss","grads"],"edges":["loss>grads"],"caption":"The chain rule runs back through the recorded operations and adds each parameter’s gradient into its `.grad` buffer.","code":"loss.backward()"},{"label":"Step","highlight":["grads","opt","model"],"edges":["grads>opt","opt>model"],"caption":"The optimizer combines each gradient with its own running state (for AdamW, averages of past gradients and of their squares) and moves every weight a small step.","code":"optimizer.step()"},{"label":"Zero","highlight":["grads"],"caption":"Gradients add up by default. Clearing them keeps this step’s gradients out of the next one. Holding back both the update and this line for a few batches, on purpose, is gradient accumulation; forgetting this line is a classic bug.","code":"optimizer.zero_grad()"},{"label":"Repeat","highlight":["dataset","loader","model"],"caption":"That was one step. One pass over every batch is an epoch. Every few hundred steps the loop pauses to measure validation loss in eval mode and to save a checkpoint."}]}
```

## How it works
**The loop.** The math behind the stepper’s five operations is in [neural networks](#neural-networks), [calculus and optimization](#calculus-optimization), [loss functions](#loss-functions) and [automatic differentiation](#automatic-differentiation). Clearing matters because in PyTorch “gradients by default add up” ([PyTorch tutorial](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html)).

**Data loaders.** A [DataLoader](https://docs.pytorch.org/docs/stable/data.html) turns a dataset into batches: it reshuffles each epoch (`shuffle=True`), stacks samples into batch tensors (a custom `collate_fn` can pad them instead), loads in worker processes (`num_workers`) that each prefetch two batches by default, and pins memory for faster GPU copies. An `IterableDataset` streams from a database, server or log, but each worker gets its own copy, which must read a different shard or you train on duplicates.

**Batches, steps and epochs.** Bigger mini-batches give less noisy gradients and keep the hardware busy, with diminishing returns ([Dive into Deep Learning](https://d2l.ai/chapter_optimization/minibatch-sgd.html)). The Deep Learning Tuning Playbook ([Godbole et al., 2023](https://github.com/google-research/tuning_playbook)) treats batch size as a lever for speed, not for validation accuracy, and often recommends the largest that fits. Gradient accumulation sums gradients over several micro-batches before one step ([PyTorch AMP examples](https://docs.pytorch.org/docs/stable/notes/amp_examples.html)).

```viz
{"id":"training-neural-networks-batch-calculator","component":"calculator","title":"Accumulation and extra GPUs grow the batch per step, so an epoch takes fewer optimizer steps","caption":"Formula view. Defaults: 50,000 examples, micro-batches of 32 on one GPU, 4 micro-batches accumulated per step, 3 epochs. The loader yields 1,563 micro-batches per epoch, but the optimizer steps only 391 times, so the schedule must be sized for 1,173 steps, not 4,689.","alt":"Calculator for the effective batch size, micro-batches per epoch, optimizer steps per epoch and optimizer steps in the run, from the number of examples, micro-batch size, devices, accumulation steps and epochs.","data":"formula","try":"Set accumulation steps to 1 and devices to 4: the effective batch is 128 again, and so is the step count.","inputs":{"examples":50000,"micro_batch":32,"devices":1,"accum":4,"epochs":3},"input_meta":{"examples":{"label":"Training examples","min":1,"step":1000},"micro_batch":{"label":"Micro-batch per device","min":1,"step":1},"devices":{"label":"Devices (data parallel)","min":1,"step":1},"accum":{"label":"Accumulation steps","unit":"micro-batches per step","min":1,"step":1},"epochs":{"label":"Epochs","min":1,"step":1}},"outputs":[{"id":"effective_batch","label":"Effective batch (examples per optimizer step)","expr":"micro_batch * accum * devices","unit":"count"},{"id":"loader_batches","label":"Micro-batches per epoch on each device","expr":"ceil(examples / (micro_batch * devices))","unit":"count"},{"id":"steps_per_epoch","label":"Optimizer steps per epoch","expr":"ceil(loader_batches / accum)","unit":"count","main":true},{"id":"total_steps","label":"Optimizer steps in the run (size the schedule to this)","expr":"steps_per_epoch * epochs","unit":"count"}],"assumptions":["Each device reads a different shard of every epoch, as with a distributed sampler.","The last, smaller micro-batch is kept (drop_last=False), and a leftover accumulation group at the end of an epoch still gets an optimizer step, as in the code walk below.","The learning-rate scheduler steps once per optimizer step, not once per micro-batch."],"tests":[{"inputs":{},"expect":{"effective_batch":128,"loader_batches":1563,"steps_per_epoch":391,"total_steps":1173}},{"inputs":{"devices":8,"accum":1},"expect":{"effective_batch":256,"loader_batches":196,"steps_per_epoch":196,"total_steps":588}}]}
```

**Learning rate and schedule.** Karpathy starts baselines with Adam at 3 × 10⁻⁴, and the playbook prefers linear or cosine decay as a default. Count the schedule in optimizer steps. See [learning rate, batch size and schedules](#training-hyperparameters).

**Reading the curves.** If training and validation loss are both high and close together, the model underfits: it may be too simple, so add capacity. If training loss sits well below validation loss, it overfits ([Dive into Deep Learning](https://d2l.ai/chapter_linear-regression/generalization.html)). Deep networks can even fit random labels ([Zhang et al., 2016](https://arxiv.org/abs/1611.03530)), so a low training loss alone says nothing about generalization.

```viz
{"id":"training-neural-networks-curves","component":"chart","type":"line","title":"Training loss keeps falling; validation loss turns up once the model starts to memorize","caption":"Illustrative curves for a 10-class classifier, not a real run. Both start near ln 10 ≈ 2.30, the loss of a uniform guess. After epoch 8 the gap widens: that is overfitting, and the checkpoint to keep is the one with the lowest validation loss, not the last one.","alt":"Illustrative line chart of training and validation cross-entropy loss over 20 epochs. Both start at 2.30. Training loss falls steadily to 0.06. Validation loss falls to a minimum of 0.86 at epoch 8, then rises to 1.26 by epoch 20.","data":"illustrative","x":{"label":"Epoch"},"y":{"label":"Cross-entropy loss","min":0,"max":2.5},"series":[{"name":"Training","points":[[0,2.3],[1,1.6],[2,1.2],[4,0.85],[6,0.62],[8,0.46],[10,0.34],[12,0.25],[14,0.18],[16,0.13],[18,0.09],[20,0.06]]},{"name":"Validation","points":[[0,2.3],[1,1.65],[2,1.3],[4,1.02],[6,0.9],[8,0.86],[10,0.88],[12,0.94],[14,1.02],[16,1.1],[18,1.18],[20,1.26]]}],"marks":[{"x":8,"label":"Best checkpoint"}]}
```

**The regularization toolkit:**
- **Weight decay**, in the decoupled AdamW form when you use Adam ([Loshchilov and Hutter, 2017](https://arxiv.org/abs/1711.05101)).
- **Dropout**, which randomly drops units during training ([Srivastava et al., 2014](https://jmlr.org/papers/v15/srivastava14a.html)).
- **Data augmentation**, label-preserving variants such as crops and flips; Karpathy calls this “half-fake data” the next best thing to real data.
- **Label smoothing**, which spreads a fraction ε of the target over all classes; Szegedy et al. used ε = 0.1 on ImageNet ([Szegedy et al., 2015](https://arxiv.org/abs/1512.00567)).
- **Early stopping** at the validation minimum. The playbook prefers a fixed budget and picking the best saved checkpoint afterwards.

**Modes and checkpoints.** `model.eval()` puts dropout and batch normalization into inference behavior; validate under it and `torch.no_grad()`, then call `model.train()`. To resume, save the optimizer state, which “contains buffers and parameters that are updated as the model trains” ([PyTorch tutorial](https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html)), with the step, the scheduler and any gradient scaler ([AMP recipe](https://docs.pytorch.org/tutorials/recipes/recipes/amp_recipe.html)). At scale this becomes [fault tolerance](#training-reliability).

**Mixed precision.** Autocast runs matrix multiplications in 16-bit floats and reductions in float32 ([PyTorch AMP docs](https://docs.pytorch.org/docs/stable/amp.html); [Micikevicius et al., 2017](https://arxiv.org/abs/1710.03740)). Float16 needs a gradient scaler so small gradients do not underflow; bfloat16 has float32’s dynamic range ([Google Cloud TPU docs](https://docs.cloud.google.com/tpu/docs/bfloat16)), so the code below skips it. See [floating-point formats](#floating-point-formats).

## In practice
```viz
{"id":"training-neural-networks-loop-walk","component":"code-walk","title":"About fifty lines hold a complete loop: accumulation, mixed precision, clipping, validation and checkpoints","caption":"Each step lights the lines and the part of the loop they implement. MyModel, train_ds and val_ds are placeholders for your model and datasets. The values (micro-batch 32, accumulation 4, learning rate 3 × 10⁻⁴) are illustrative starting points. Assumes a GPU with bfloat16 support; for float16, add torch.amp.GradScaler(\"cuda\") as in the PyTorch AMP examples.","alt":"Code walk through a PyTorch training script with a seeded data loader, AdamW, label smoothing, a cosine schedule sized in optimizer steps, gradient accumulation, bfloat16 autocast, gradient clipping with a NaN guard, periodic validation in eval mode, and last and best checkpoints.","data":"illustrative","depicts":"PyTorch 2.15 API (as of November 2026)","language":"python","code":"import math\nimport torch\nfrom torch import nn\nfrom torch.utils.data import DataLoader\n\ntorch.manual_seed(0)                       # same init and data order on every run\ndevice, epochs, accum, max_norm = \"cuda\", 3, 4, 1.0\nmodel = MyModel().to(device)               # placeholder: your nn.Module\ntrain_dl = DataLoader(train_ds, batch_size=32, shuffle=True,   # placeholder datasets\n                      num_workers=4, pin_memory=True)\nval_dl = DataLoader(val_ds, batch_size=64, num_workers=4, pin_memory=True)\ntrain_loss_fn = nn.CrossEntropyLoss(label_smoothing=0.1)\nval_loss_fn = nn.CrossEntropyLoss()        # measure the plain loss\nopt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)\ntotal_steps = epochs * math.ceil(len(train_dl) / accum)   # optimizer steps\nsched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=total_steps)\n\ndef evaluate():\n    model.eval()                           # dropout off, batch norm frozen\n    total, n = 0.0, 0\n    with torch.no_grad():\n        for x, y in val_dl:\n            x, y = x.to(device), y.to(device)\n            with torch.autocast(\"cuda\", dtype=torch.bfloat16):\n                total += val_loss_fn(model(x), y).item() * len(y)\n            n += len(y)\n    model.train()\n    return total / n\n\nstep, best = 0, float(\"inf\")\nmodel.train()\nfor epoch in range(epochs):\n    for i, (x, y) in enumerate(train_dl):\n        x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)\n        with torch.autocast(\"cuda\", dtype=torch.bfloat16):\n            loss = train_loss_fn(model(x), y) / accum   # average over accum batches\n        loss.backward()                    # adds into each parameter's .grad\n        if (i + 1) % accum and i + 1 < len(train_dl):\n            continue                       # keep accumulating\n        gnorm = nn.utils.clip_grad_norm_(model.parameters(), max_norm,\n                                         error_if_nonfinite=True)  # NaN guard\n        opt.step()\n        sched.step()\n        opt.zero_grad()\n        step += 1\n        if step % 500 == 0:\n            val = evaluate()\n            print(step, loss.item() * accum, gnorm.item(), val)   # send to your tracker\n            torch.save({\"model\": model.state_dict(), \"opt\": opt.state_dict(),\n                        \"sched\": sched.state_dict(), \"step\": step}, \"last.pt\")\n            if val < best:\n                best = val\n                torch.save(model.state_dict(), \"best.pt\")","diagram":{"w":360,"h":300,"nodes":[{"id":"data","label":"DataLoader","sub":"shuffle, batch","role":"data","x":100,"y":0,"w":160,"h":48},{"id":"step","label":"Train step","sub":"forward to update","role":"model","x":100,"y":84,"w":160,"h":52},{"id":"eval","label":"Validation","sub":"eval mode","role":"plain","x":0,"y":176,"w":150,"h":50},{"id":"ckpt","label":"Checkpoints","sub":"last and best","role":"data","x":210,"y":176,"w":150,"h":50},{"id":"log","label":"Experiment log","sub":"loss, grad norm","role":"plain","x":100,"y":256,"w":160,"h":44}],"edges":[{"from":"data","to":"step","label":"batches","dx":34},{"from":"step","to":"eval"},{"from":"step","to":"ckpt"},{"from":"eval","to":"ckpt","label":"if best"},{"from":"eval","to":"log"}]},"steps":[{"lines":[1,7],"node":"step","note":"Seed first, so weight initialization and shuffling repeat on every run. `accum` and `max_norm` are the knobs the loop below uses."},{"lines":[8,11],"node":"data","note":"Shuffle the training data every epoch, load it in worker processes and pin memory for faster copies to the GPU. Validation needs no shuffling."},{"lines":[12,16],"node":"step","note":"Label smoothing regularizes training, but validation measures the plain loss. AdamW decouples weight decay. The schedule length counts optimizer steps, not micro-batches."},{"lines":[18,28],"node":"eval","note":"Validation switches to eval mode (dropout off, batch norm uses its running statistics), turns off gradient tracking and switches back to train mode when done."},{"lines":[30,37],"node":["data","step"],"note":"Forward under bfloat16 autocast, divide the loss by `accum` so the summed gradients average over the effective batch, and backpropagate. Gradients add into `.grad`."},{"lines":[38,39],"node":"step","note":"Gradient accumulation: skip the update until `accum` micro-batches are in, but always step on the last batch of an epoch so nothing leaks into the next one."},{"lines":[40,45],"node":"step","note":"Clip the global gradient norm and keep its value for logging; `error_if_nonfinite` stops the run on a NaN before it reaches the weights. Then update, advance the schedule and clear the gradients."},{"lines":[46,48],"node":["eval","log"],"note":"Evaluate at regular step intervals and log training loss, gradient norm and validation loss together, to a file or an experiment tracker."},{"lines":[49,53],"node":"ckpt","note":"Save everything needed to resume (weights, optimizer and scheduler state, step) as `last.pt`, and keep the weights with the lowest validation loss as `best.pt`."}]}
```

**Tuning.** The playbook sorts hyperparameters into scientific (what you study), nuisance (re-tuned for a fair comparison, often the learning rate) and fixed (held constant, which limits conclusions). Prefer random points to a grid, since few hyperparameters usually matter ([Bergstra and Bengio, 2012](https://jmlr.org/papers/v13/bergstra12a.html)), or quasi-random ones, as the playbook does. Choose on validation data; touch the test set once ([validation, tuning and leakage](#validation-tuning)).

**Debugging,** after Karpathy and the playbook:
1. **Inspect the data** just before it enters the model.
2. **Check the loss at initialization:** about ln C for C balanced classes.
3. **Overfit one batch** of a few examples. If the loss will not approach zero, there is a bug.
4. **Log the gradient norm** that `clip_grad_norm_` returns; spikes are a warning ([training stability](#training-stability)).
5. **Hunt NaNs** with `error_if_nonfinite=True` and, briefly, `torch.autograd.detect_anomaly()`, which is slow but names the failing operation ([PyTorch autograd docs](https://docs.pytorch.org/docs/stable/autograd.html)).

**Seeds and tracking.** Seed PyTorch, Python, NumPy and loader workers, but fully reproducible results “are not guaranteed across PyTorch releases, individual commits, or different platforms” ([PyTorch reproducibility notes](https://docs.pytorch.org/docs/stable/notes/randomness.html)), so compare ideas over several seeds. Record each run’s code version, config, data, seed, curves and best checkpoint: “Untracked experiments might as well not exist,” says the playbook.

> [!try]
> Cut your data to a single batch of two examples and train on it until the loss stops falling: it should get close to zero. Before the first step, check it against ln C.

## Numbers to know
> [!number]
> Rules of thumb and formulas.
> - Loss at initialization ≈ ln C: 2.30 for 10 classes, 6.91 for 1,000 ([Karpathy, 2019](https://karpathy.github.io/2019/04/25/recipe/)).
> - Effective batch = micro-batch × accumulation steps × devices ([PyTorch AMP examples](https://docs.pytorch.org/docs/stable/notes/amp_examples.html)).
> - PyTorch’s AdamW defaults to a weight decay of 0.01 ([PyTorch 2.15 docs](https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html), as of November 2026).
> - Label smoothing at ε = 0.1 cut ImageNet top-1 and top-5 error by about 0.2 points ([Szegedy et al., 2015](https://arxiv.org/abs/1512.00567)).
> - Mixed precision: PyTorch’s AMP recipe expects its example to run 2 to 3 times faster on Tensor Core GPUs (Volta, Turing, Ampere) ([AMP recipe](https://docs.pytorch.org/tutorials/recipes/recipes/amp_recipe.html)).

## Pitfalls and anti-patterns
> [!pitfall] Validating in training mode
> Dropout stays on and batch normalization keeps updating, so validation loss is noisy and wrong. Use `model.eval()` and `torch.no_grad()`, then `model.train()`.

> [!pitfall] Sizing the schedule in micro-batches
> With accumulation, `len(loader)` counts micro-batches, and a schedule sized from it never gets far into its decay: with 4 accumulation steps, a cosine schedule ends at about 85% of its peak. Use the calculator above.

- **Tuning on the test set** leaks it into the model.
- **Workers that repeat data:** unsharded `IterableDataset` copies, or other libraries’ random seeds duplicated across workers ([PyTorch data docs](https://docs.pytorch.org/docs/stable/data.html)); the [reproducibility notes](https://docs.pytorch.org/docs/stable/notes/randomness.html) show how to reseed NumPy and Python in each worker.
- **Clipping scaled float16 gradients** without calling `scaler.unscale_(optimizer)` first ([PyTorch AMP examples](https://docs.pytorch.org/docs/stable/notes/amp_examples.html)).
- **Resuming from weights alone** starts a different run.

## Talk like an expert
The vocabulary: **step**, **epoch**, **micro-batch**, **effective batch**, **gradient accumulation**, **loss at init**, **overfitting one batch**, **retrospective checkpoint selection**, **nuisance hyperparameter**, **quasi-random search**. Experts count training in steps: the playbook fixes the step budget (`max_train_steps`) for every trial and evaluates “at regular step intervals, not time intervals”.

A live debate is gradient accumulation. The playbook says it brings no throughput benefit and “should generally be avoided in applied work”. The case for it is the one the playbook itself states: it “simulates a larger batch size than the hardware can support”, so a run can match a recipe’s batch size on smaller hardware.

> [!hottake] Early stopping is obsolete: train for a fixed budget, keep the best checkpoints and choose afterwards.
> **The counterargument:** retrospective selection still pays for every step after the best checkpoint. When compute is scarce, stopping a run that has started to memorize saves that cost, and early stopping is crucial when labels are noisy ([Dive into Deep Learning](https://d2l.ai/chapter_multilayer-perceptrons/generalization-deep.html)).

## Check yourself
```quiz
training-neural-networks
```

## Go deeper
- Karpathy, [“A Recipe for Training Neural Networks”](https://karpathy.github.io/2019/04/25/recipe/) (2019).
- Godbole et al., [“Deep Learning Tuning Playbook”](https://github.com/google-research/tuning_playbook) (2023).
- Zhang et al., [*Dive into Deep Learning*](https://d2l.ai/) (2023), the chapters on generalization and minibatch SGD.
- PyTorch documentation: [torch.utils.data](https://docs.pytorch.org/docs/stable/data.html), [the AMP examples](https://docs.pytorch.org/docs/stable/notes/amp_examples.html) and [the reproducibility notes](https://docs.pytorch.org/docs/stable/notes/randomness.html).

## Related
- [Neural networks](#neural-networks)
- [Calculus and optimization](#calculus-optimization)
- [Learning rate, batch size and schedules](#training-hyperparameters)
- [Making deep networks trainable](#trainable-deep-networks)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Deep learning frameworks](#dl-frameworks)
