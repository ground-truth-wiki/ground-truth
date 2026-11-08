---
id: open-weight-frontier
book: 19
order: "19.6"
title: The open-weight frontier
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [open-weights, open-models]
visuals:
  - open-gap-chart:chart
  - license-tree:tree
---
> [!tldr]
> Open-weight models from DeepSeek, Qwen, Meta, Mistral, Google, OpenAI, Moonshot, Zhipu and others trail the closed frontier by months, not years, on many benchmarks. They enable self-hosting, fine-tuning, privacy and research, under licenses that range from fully permissive to restrictive. Check the license and evaluate on your tasks.

## Why it matters
Open weights change build-versus-buy decisions, enable on-premises and on-device deployment, and power most fine-tuning work. They also raise policy questions about misuse and export controls.

## Intuition
Open-weight models are like generic medicines: arriving a little after the branded version, cheaper to use at scale, and good enough for many patients.

```viz
{"id":"open-gap-chart","component":"chart","type":"line","title":"The gap between the best open and the best closed models has narrowed","caption":"Illustrative curves on a representative benchmark; not real data. Epoch AI estimated in 2024 that open models trailed the closed frontier by roughly a year, and the gap narrowed further in 2025.","alt":"Illustrative line chart of best closed and best open model benchmark scores over time, with the gap narrowing.","data":"illustrative","x":{"label":"Year"},"y":{"label":"Benchmark score","unit":"pct","min":0,"max":1},"series":[{"name":"Best closed","points":[[2022,0.45],[2023,0.62],[2024,0.75],[2025,0.84],[2026,0.9]]},{"name":"Best open","points":[[2022,0.3],[2023,0.45],[2024,0.66],[2025,0.8],[2026,0.87]]}]}
```

## How it works
**Who releases.** DeepSeek (V3, R1 in 2025, with open technical reports), Alibaba’s Qwen, Meta’s Llama, Mistral, Google’s Gemma, OpenAI’s gpt-oss (2025), Moonshot’s Kimi, Zhipu’s GLM, NVIDIA’s Nemotron, Microsoft’s Phi and others. Check current releases; the leaderboard changes monthly.

**What “open” means.** Usually open weights, not open training data or code. Fully open efforts (such as AI2’s OLMo) also release data and training code.

```viz
{"id":"license-tree","component":"tree","title":"Three kinds of license, and what each permits","caption":"Expand a kind. Always read the specific license; terms vary within each kind.","alt":"Tree of open model license types: permissive, community and research-only licenses.","data":"illustrative","open":1,"root":{"label":"Open model licenses","children":[
{"label":"Permissive (Apache 2.0, MIT)","children":[{"label":"Commercial use, modification and redistribution with attribution"}]},
{"label":"Community licenses","children":[{"label":"Commercial use with conditions, such as user-count thresholds, naming rules or acceptable-use policies"}]},
{"label":"Research or non-commercial","children":[{"label":"Evaluation and research only; no production use"}]}]}}
```

**Why teams choose them.** Data control and residency, customization and fine-tuning, cost at high volume, offline and on-device use, and independence from a single provider. See [cost engineering](#cost-engineering) and [edge and on-device AI](#edge-on-device).

**Trade-offs.** You run the serving, safety layers and updates yourself; capability may trail the frontier on the hardest tasks; licenses and supply-chain checks need attention. See [supply chain security](#supply-chain-security).

## In practice
- Evaluate the best open models alongside closed ones on your tasks.
- Read the license and acceptable-use policy before shipping.
- Load weights in safe formats and verify sources.
- Budget for serving and operations, not just weights.

## Numbers to know
> [!number]
> Rules of thumb. Leading open models typically match closed models from several months to about a year earlier on public benchmarks. Self-hosting pays off only above steady volume. See [cost engineering](#cost-engineering).

## Pitfalls and anti-patterns
> [!pitfall] Assuming “open” means “free to use for anything”
> Community licenses can restrict commercial use, scale or naming.

## Talk like an expert
The vocabulary: **open weights**, **fully open**, **permissive license**, **community license**, **acceptable-use policy**, **self-hosting**, **fine-tunability**. Experts distinguish open weights from open source. The live debate is about the security and policy implications of releasing increasingly capable weights.

> [!hottake] For most enterprises, the best open model is now good enough.
> **The counterargument:** for agentic, long-horizon and hardest reasoning tasks, frontier closed models still lead meaningfully, and operating open models well is real work.

## Check yourself
```quiz
open-weight-frontier
```

## Go deeper
- Epoch AI’s analyses of open versus closed model trends.
- Model cards and licenses of the open models you consider.

## Related
- [Frontier model families](#frontier-families)
- [Small and local models](#small-local-models)
- [Supply chain and model security](#supply-chain-security)
- [New architectures and efficiency](#new-architectures)
- [Serving engines](#serving-engines)
