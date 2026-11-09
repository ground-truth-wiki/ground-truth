---
id: shopify-open-model-task-experts
book: 21
order: "21.54"
title: "Shopify Sidekick: post-training an open model to take over a frontier model's subagent"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [commerce, post-training, llm-as-judge, data-flywheel, cost, public-record]
visuals: []
type: playbook
account: public-record
industry: "Commerce (platform for merchants, AI commerce assistant)"
use_case: "Post-training the open mixture-of-experts model NVIDIA Nemotron 3.5 Lightning to replace a frontier model in Sidekick's GraphQL subagent, which writes and runs API queries for merchants"
outcome: "GraphQL judge score 74.5 against 73 for the frontier model (37.7 before post-training); median full response 0.87 seconds against 6.50 seconds; serving cost about 90% lower"
measured_how: "Shopify's own LLM judge, tuned to match held-out human labels, across six flywheel loops with 61,000 healed examples; latency and cost from an AIPerf replay of production GraphQL traffic; sample size and period not stated (Shopify Engineering blog, October 2026)"
prerequisites: [llm-as-judge, post-training-overview]
replications: []
---
> [!tldr]
> Shopify post-trained NVIDIA Nemotron 3.5 Lightning, an open mixture-of-experts model, to take over the GraphQL subagent of Sidekick, its AI commerce assistant, from a frontier model. After six loops of a judge-driven training flywheel, "the post-trained model scored 74.5" on Shopify's GraphQL judge against 73 for the frontier model, with a median full response of 0.87 seconds against 6.50 seconds and serving cost "about 90% lower".

> [!note] From the public record
> Built from Shopify's own published account, "How Shopify turns open models into task experts" (October 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Sidekick, Shopify's AI commerce assistant, runs on a frontier model that talks to the merchant, plans the work, calls tools and hands focused jobs to subagents. The GraphQL subagent answers questions such as "Which products are almost out of stock?": it reads Shopify's API schema, searches the docs, writes and runs a query, and returns the results. That work is "context-heavy": "the subagent reads about 40 tokens for every one it writes, and a frontier model’s API charges for every one of them". The post does not name the frontier model.

## Why this approach

The post also names control over the model as a benefit: "because Shopify controls the post-trained weights, we can serve the model on our own GPUs and decide when it changes."

Shopify does not pretrain. It tests open models inside the real subagent, with the same tools and judge, and weighs starting quality, serving speed and support in NVIDIA Megatron Bridge, which it trains with. Serving is measured from the start, because "a model that’s too slow for production isn’t worth post-training." For GraphQL the team chose Nemotron 3.5 Lightning, "a mixture-of-experts model with three billion of its 30 billion parameters active per token" (see [Mixture of Experts](#mixture-of-experts)). The other candidates are not named.

## The approach

The post calls the process the Model Optimization Flywheel. After three setup steps, the loop repeats with each new batch of production data.

1. **Define quality.** Product experts turn requirements into a rubric that for GraphQL "covers completeness, execution, and response quality". How closely two experts agree sets the bar, and the team tunes an LLM judge with the GEPA and ACE optimizers until it agrees with held-out human labels just as well. It then scores every agent change, candidate model and training run. See [LLM-as-judge done right](#llm-as-judge).
2. **Improve the frontier agent first.** An autoresearch loop proposes one small change at a time to the prompts, tool descriptions or control flow, and keeps it only if the judge's score improves. "The improved agent is the bar the open model has to beat."
3. **Choose an open model,** as described above.
4. **Optimize inference.** Every workload is benchmarked with NVIDIA AIPerf, which "replays production traces with synthetic text instead of customer data". See [Benchmarking inference servers](#inference-benchmarking).
5. **Turn failures into training data.** Every night the judge scores a sample of production GraphQL conversations, and anything short of perfect goes to self-healing. A frontier model acting as critic "writes a hint, never the answer", and a simulated merchant reruns the request with it against the same store. If the judge passes the rerun, the hint is removed and the anonymized conversation joins the training set. Otherwise the critic tries again, up to three times. See [The data flywheel](#data-flywheel).
6. **Post-train** with Megatron Bridge, which scales across nodes on Nebius. The judge scores each new checkpoint, and the loop starts again.

The training objective and hyperparameters are not stated.

## The stack

As of October 2026, as the post names it:

- **Models:** NVIDIA Nemotron 3.5 Lightning for the GraphQL subagent. A frontier model, not named, runs Sidekick's main agent and the baseline GraphQL agent, and a frontier model acts as the self-healing critic.
- **Evaluation:** an LLM judge tuned with the GEPA and ACE optimizers; the judge model is not named.
- **Training:** NVIDIA Megatron Bridge on NVIDIA's Megatron Core training library, scaling across nodes on Nebius. The section is headed "Post-train on Blackwell", but its GPU comparison is for an Analytics model; the GraphQL model's training GPUs are not stated.
- **Serving and benchmarking:** Shopify's own GPUs, and NVIDIA AIPerf, an open-source load tester in NVIDIA Dynamo. The engine that serves the GraphQL model is not named.

## Results, and how they were measured

- **Quality on the judge.** "Out of the box, Nemotron 3.5 Lightning scored 37.7 on our GraphQL judge; the frontier model scored 73." "The first loop took it to 61.5, and after six loops and 61,000 healed examples, the post-trained model scored 74.5." The post calls this "slightly higher than the frontier model".
- **Latency.** In an AIPerf replay of production GraphQL traffic, post-trained Nemotron "returned a full response in 0.87 seconds at the median, against 6.50 seconds for the frontier model’s API", and "its slowest 1% of requests finished 8× sooner".
- **Cost.** "Serving cost on that traffic is about 90% lower than the frontier model’s." Across Shopify's post-trained models, "self-hosting cuts serving cost by 90-98% compared with frontier model pricing."
- **Self-healing.** "Over 86 nightly runs recently, self-healing repaired 59,535 GraphQL conversations", which the post puts at "69% of the failures it tried".

**Not measured:** the post does not state how many conversations the judge scores rest on, the volume or period of the replayed traffic, absolute costs or how cost was compared, or a number for the judge's agreement with human labels. It reports no merchant-facing outcome.

## What failed

- **A weak start.** Before post-training, the open model scored 37.7 against 73.
- **Self-healing has limits.** It repaired 69% of the failures it tried. "Human annotators corrected the rest", and their corrections join the ground truth that calibrates the judge.
- **A losing candidate.** Another post-trained open model of comparable size was "close at the median but more than twice as slow at p99". It is not named.

The post reports no production incidents or rollbacks. It also does not say when, or whether, the post-trained model fully took over the subagent from the frontier model.

## What the team would do differently

The post states no lessons of this kind. Its closing section describes the split it keeps: "The frontier model keeps the work it’s best at: talking to the merchant and deciding what to call." Token-heavy specialist work moves to open models Shopify owns.

The wiki's reading: every quality number here is a score from Shopify's own judge, so the open model's lead is only as solid as that judge, whose agreement with experts the post describes but does not quantify. Tuning the frontier agent first should make the comparison fairer, because the open model has to beat an improved incumbent, though the post does not say whether the frontier score of 73 was measured after that tuning.

## Disclosure

None.

## Sources

- Andrew McNamara and Logan Vegna, Shopify, [“How Shopify turns open models into task experts”](https://shopify.engineering/open-model-task-experts), Shopify Engineering blog, 21 October 2026. The post says it is adapted from a talk at NVIDIA GTC Berlin 2026, and it thanks NVIDIA's Megatron Bridge, AIPerf, TensorRT-LLM and Nemotron teams, the CentML team (now part of NVIDIA) and Nebius.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [The data flywheel](#data-flywheel)
- [Serving mixture-of-experts models](#moe-serving)
- [Cost engineering](#cost-engineering)
