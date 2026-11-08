---
id: training-reliability
book: 3
order: "3.3.4"
title: Fault tolerance and checkpointing at scale
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [fault-tolerance, checkpointing, goodput, reliability, clusters]
visuals: []
prerequisites: [distributed-training]
---
> [!tldr]
> On thousands of GPUs, some part of a training job fails every few hours, so a large run needs machinery that detects failures, saves state cheaply and resumes quickly and exactly. That machinery decides how much of a paid cluster turns into training progress. Remember that the mean time to failure shrinks roughly in inverse proportion to the number of GPUs, so checkpoint and restart costs must shrink with it.

## Key ideas

- **Failures grow with the job.** Llama 3 405B, trained on up to 16K H100 GPUs, had 466 job interruptions in a 54-day snapshot, 419 of them unexpected and about 78% of those confirmed or suspected hardware issues, and still kept over 90% effective training time ([Llama Team, “The Llama 3 Herd of Models” (2024)](https://arxiv.org/abs/2407.21783)). In Meta's research clusters, measured mean time to failure fell from 47.7 days for 8-GPU jobs to 7.9 hours for 1,024-GPU jobs, and the authors, modeling it as inversely proportional to job size, project 1.8 hours for 16,384-GPU jobs ([Kokolis et al., “Revisiting Reliability in Large-Scale Machine Learning Research Clusters” (2024)](https://arxiv.org/abs/2410.21680)).
- **Know the failure classes.** Llama 3's largest causes were faulty GPUs and GPU HBM3 memory, followed by software bugs, network switches and cables and host maintenance, with NCCL watchdog timeouts and silent data corruption also on the list; a slow but working GPU, a straggler, "can slow down thousands of other GPUs" ([Llama Team, 2024](https://arxiv.org/html/2407.21783v3)). Silent data corruption is hardware computing wrong results that the CPU's error reporting does not catch, so it surfaces only as application-level problems; tests across hundreds of thousands of machines in the authors' fleet found hundreds of faulty CPUs ([Dixit et al., “Silent Data Corruptions at Scale” (2021)](https://arxiv.org/abs/2102.11245)).
- **Measure goodput, not uptime.** Google splits ML Productivity Goodput into scheduling goodput (the resources are available), runtime goodput (forward progress while they are) and program goodput (MFU), and runtime goodput depends on the time since the last checkpoint when a failure hits and the time to resume ([Google Cloud, “Introducing ML Productivity Goodput: a metric to measure AI system efficiency” (2024)](https://cloud.google.com/blog/products/ai-machine-learning/goodput-metric-as-measure-of-ml-productivity)). Kokolis et al. define the Effective Training Time Ratio as productive runtime over available wall-clock time (which includes time waiting in the queue), where retraining since the last checkpoint, restart overhead and checkpoint overhead do not count as productive ([Kokolis et al., 2024](https://arxiv.org/html/2410.21680)).
- **Checkpoint frequency is a cost trade-off.** Frequent saves lose less work per failure but spend more time writing; Kokolis et al. use the Daly-Young optimal interval and estimate that a job of about 12,000 GPUs on their cluster needs a checkpoint write overhead on the order of 10 seconds, or a much lower failure rate, to reach an Effective Training Time Ratio of 0.9 ([Kokolis et al., 2024](https://arxiv.org/html/2410.21680)). As of November 2026, PyTorch Distributed Checkpoint saves and loads from all ranks in parallel, reshards at load time so a checkpoint saved on one topology loads on another, and offers an experimental `async_save` that stages state in CPU memory and writes in a background thread ([PyTorch 2.15 docs](https://docs.pytorch.org/docs/2.15/distributed.checkpoint.html)).
- **Restart fast and resume exactly.** `torchrun` stops and restarts all workers after a failure, up to a set number of restarts, and in elastic mode lets nodes leave and join, which changes the world size ([PyTorch 2.15 docs](https://docs.pytorch.org/docs/2.15/elastic/run.html)); detecting "lemon" nodes that cause repeated failures cut failures of jobs with 512 or more GPUs from 14% to 4% in Meta's clusters ([Kokolis et al., 2024](https://arxiv.org/html/2410.21680)). PaLM was bitwise reproducible from any checkpoint because its framework was deterministic and each batch's contents depended only on the step number ([Chowdhery et al., “PaLM: Scaling Language Modeling with Pathways” (2022)](https://arxiv.org/abs/2204.02311)).
- **Diagnose hangs and keep a logbook.** PyTorch's Flight Recorder keeps recent collective operations in a ring buffer on each rank and can dump them when a job times out, for analysis with its `fr_trace` script ([PyTorch tutorial](https://docs.pytorch.org/tutorials/unstable/flight_recorder_tutorial.html)); the Llama 3 team used it to diagnose hangs quickly ([Llama Team, 2024](https://arxiv.org/html/2407.21783v3)). The OPT-175B team released its logbook of infrastructure problems, a rare public record of what goes wrong in a real run ([Zhang et al., “OPT: Open Pre-trained Transformer Language Models” (2022)](https://arxiv.org/abs/2205.01068)).

## Planned visuals

- **`calculator`:** the Daly-Young checkpoint interval and the resulting Effective Training Time Ratio from the number of nodes, the failure rate per node-day, the checkpoint write time and the restart time (formula).
- **`chart`:** mean time to failure against job size on log-log axes, with the measured and projected points from Kokolis et al. (real, dated).
- **`stepper`:** one failure from start to finish: a hung collective, the watchdog timeout, the Flight Recorder dump, the bad node drained, the restart from the last checkpoint and the deterministic replay of the data loader.

## Talk like an expert

Experts talk about goodput, effective training time, mean time to failure, stragglers, lemon nodes and silent data corruption, and they size checkpoint intervals from failure rates. They judge a cluster by how quickly it detects, replaces and recovers from a bad node, not by its peak FLOPs.

## Go deeper

- Llama Team, [“The Llama 3 Herd of Models”](https://arxiv.org/abs/2407.21783) (2024), section 3.3.4 on reliability and operational challenges.
- Kokolis et al., [“Revisiting Reliability in Large-Scale Machine Learning Research Clusters”](https://arxiv.org/abs/2410.21680) (2024).
- The [PyTorch Distributed Checkpoint documentation](https://docs.pytorch.org/docs/2.15/distributed.checkpoint.html) (version 2.15).
- Google Cloud, [“Introducing ML Productivity Goodput”](https://cloud.google.com/blog/products/ai-machine-learning/goodput-metric-as-measure-of-ml-productivity) (2024).

## Related

- [Distributed training](#distributed-training)
- [Parallelism strategies and collective communication](#parallelism-strategies)
- [Reliability engineering](#reliability-engineering)
- [Compute accounting: FLOP, GPU-hours and utilization](#compute-accounting)
- [Hardware](#hardware)
