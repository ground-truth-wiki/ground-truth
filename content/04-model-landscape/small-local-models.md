---
id: small-local-models
book: 4
order: "4.3"
title: Small and local models
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [slm, local, on-device]
visuals:
  - small-vs-big:chart
  - small-fit:tree
---
> [!tldr]
> Small models, from under a billion to around ten billion parameters, run cheaply in the cloud, on laptops, phones and browsers. They handle classification, extraction, routing and short generation well, especially when fine-tuned, and fall short on hard reasoning and broad knowledge.

## Why it matters
Small models cut cost and latency by orders of magnitude, enable privacy and offline use, and are the building blocks of routing, cascades and on-device features. Many production pipelines are mostly small models with a large model behind them for hard cases.

## Intuition
A small model is a skilled specialist with a short memory. Give it a narrow, well-defined job and it is fast and reliable; ask it about everything and it improvises.

```viz
{"id":"small-vs-big","component":"chart","type":"bar","title":"On a narrow task, a fine-tuned small model can match a large general model","caption":"Illustrative accuracy on a single extraction task; not real measurements. The gap closes with task-specific data and reopens on hard or unfamiliar inputs.","alt":"Illustrative bar chart comparing a small base model, a small fine-tuned model and a large model on a narrow task and on hard out-of-distribution inputs.","data":"illustrative","categories":["Small, prompted","Small, fine-tuned","Large, prompted"],"y":{"label":"Accuracy","unit":"pct","min":0,"max":1},"series":[{"name":"Narrow task","points":[[0,0.71],[1,0.93],[2,0.94]]},{"name":"Hard, unfamiliar inputs","points":[[0,0.38],[1,0.52],[2,0.81]]}]}
```

## How it works
**Families.** Microsoft’s Phi, Google’s Gemma, Meta’s small Llama models, Qwen’s small models, Hugging Face’s SmolLM, Mistral’s small models and others; many are distilled from larger models and trained on heavily filtered or synthetic data. See [distillation](#distillation-merging).

**Where they run.** Cloud endpoints at low cost; laptops with llama.cpp, Ollama, LM Studio or MLX; phones and browsers with on-device runtimes. See [edge and on-device AI](#edge-on-device).

**Strengths and limits.** Strong at classification, extraction, routing, short summaries and narrow tasks after fine-tuning; weaker at long multi-step reasoning, broad world knowledge and following very long, complex instructions.

```viz
{"id":"small-fit","component":"tree","title":"Small models fit high-volume, narrow, latency-sensitive work","caption":"Expand by task. Pair small models with a large-model fallback for the hard tail.","alt":"Decision tree of tasks that suit small models and those that need larger ones.","data":"illustrative","open":1,"root":{"label":"Will a small model do?","children":[
{"label":"Classification, routing, intent detection","children":[{"label":"Yes, often fine-tuned","link":"#gateways-routers"}]},
{"label":"Extraction to a schema","children":[{"label":"Yes, with structured outputs and validation","link":"#document-extraction"}]},
{"label":"Autocomplete and short drafting","children":[{"label":"Yes, especially on device","link":"#edge-on-device"}]},
{"label":"Multi-step reasoning, research, complex agents","children":[{"label":"Usually no: use a larger model","link":"#reasoning-models"}]}]}}
```

## In practice
- Benchmark small models on your task; fine-tune if they are close.
- Use cascades: small model first, escalate on low confidence or failed checks. See [cost engineering](#cost-engineering).
- Quantize for local deployment and measure quality after quantization. See [quantization](#quantization).

## Numbers to know
> [!number]
> Rules of thumb. Small models often cost a small fraction of flagship models per token and respond much faster. A 3B model at 4 bits fits in about 2 GB.

## Pitfalls and anti-patterns
> [!pitfall] Expecting broad knowledge from a small model
> Small models hallucinate more on facts outside their training focus; pair them with retrieval or route those questions elsewhere.

- **Skipping evals on hard inputs.** Narrow-task accuracy hides tail failures.

## Talk like an expert
The vocabulary: **small language model**, **distilled model**, **on-device**, **cascade**, **fallback**, **quantized**, **narrow task**. Experts design systems where small models do most of the work and large models handle the tail. The live debate is how far small models will climb as distillation and data improve.

> [!hottake] Most AI workloads should run on small models.
> **The counterargument:** engineering and maintenance costs of fine-tuning, routing and fallbacks can exceed the savings for low-volume workloads, where a single capable model is simpler.

## Check yourself
```quiz
small-local-models
```

## Go deeper
- Model cards for Phi, Gemma, small Llama and Qwen models, and SmolLM.
- This Bible’s [edge and on-device AI](#edge-on-device) chapter.

## Related
- [Specialist models](#specialist-models)
- [Edge and on-device AI](#edge-on-device)
- [Distillation, merging and compression](#distillation-merging)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Choosing a model](#choosing-a-model)
- [Quantization](#quantization)
