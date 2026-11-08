---
id: compute-governance
book: 17
order: "17.10.6"
title: "Compute governance: chips, supply chains and export controls"
level: expert
stability: volatile
reviewed: "2026-11"
status: seed
tags: [compute-governance, export-controls, semiconductors, supply-chain, compute-thresholds]
visuals: []
prerequisites: [governance-regulation, hardware]
---
> [!tldr]
> Compute governance uses the AI chip supply chain as a policy lever. A handful of firms design, fabricate, package and equip the production of leading AI chips, and governments use that concentration for export controls, compute thresholds in law and proposals to verify where chips are. For engineers it decides which hardware and models you can get, where and when; export rules change often, so treat every date here as "as of November 2026" and check the Federal Register before acting.

## Key ideas

- **The supply chain has a few chokepoints.** In 2020, US firms dominated AI chip design and Chinese designers depended on US design software; US, Taiwanese and South Korean firms ran most fabs that can make leading-edge chips; and US, Dutch and Japanese firms controlled the market for the equipment those fabs use (Khan and Mann, [“AI Chips: What They Are and Why They Matter”](https://cset.georgetown.edu/publication/ai-chips-what-they-are-and-why-they-matter/) (2020)), with EUV lithography a technology “unique to ASML” ([ASML](https://www.asml.com/en/products/euv-lithography-systems)). Downstream, in July 2023 virtually all leading data-center GPUs were packaged by TSMC on CoWoS, and CoWoS capacity and high-bandwidth memory (HBM) from SK Hynix, Samsung and Micron were the parts of the supply chain that “just cannot keep up” and were bottlenecking GPU supply ([SemiAnalysis, July 2023](https://newsletter.semianalysis.com/p/ai-capacity-constraints-cowos-and)).
- **Compute gets cheaper faster than memory gets faster.** For ML GPUs, price-performance in FLOP per dollar doubles about every 2.1 years and compute every 2.3 years, while memory bandwidth doubles only about every 4.1 years and capacity about every 4 years, a gap “often described as the memory wall” (Hobbhahn et al., [“Trends in Machine Learning Hardware”](https://epoch.ai/blog/trends-in-machine-learning-hardware) (2023)). Together with the 2023 CoWoS and HBM shortage above, it shows why memory and packaging, not just logic chips, can limit how many accelerators ship; see [hardware](#hardware).
- **Compute is governable in a way data and algorithms are not.** Sastry et al. argue compute is “detectable, excludable, and quantifiable” and made in “an extremely concentrated supply chain”, which gives governments three capacities: visibility into AI development, allocation of resources, and enforcement of restrictions ([“Computing Power and the Governance of Artificial Intelligence”](https://arxiv.org/abs/2402.08797) (2024)). The same paper warns that poorly scoped approaches carry risks for privacy, the economy and the centralization of power, and proposes guardrails ([Sastry et al., 2024](https://arxiv.org/abs/2402.08797)).
- **Laws use training compute as a first filter.** The EU AI Act presumes systemic risk for general-purpose models trained with more than 10²⁵ FLOP and lets the Commission amend the threshold for “algorithmic improvements or increased hardware efficiency” ([AI Act, Article 51](https://artificialintelligenceact.eu/article/51/)); California's frontier AI law (from 1 January 2026) and New York's amended RAISE Act (from 1 January 2027) set 10²⁶ operations, counting fine-tuning and reinforcement learning ([Cooley](https://www.cooley.com/news/insight/2026/2026-03-31-new-yorks-frontier-ai-law-gets-a-california-makeover-with-some-key-differences)). Heim and Koessler call training compute “an imperfect proxy for risk” that should trigger scrutiny, not decide mitigations, and should be updated and paired with other metrics ([“Training Compute Thresholds: Features and Functions in AI Regulation”](https://arxiv.org/abs/2405.10799) (2024)); how to count the FLOP is in [compute accounting](#compute-accounting).
- **US export controls on chips and tools, by Federal Register date.** The first rule (13 October 2022) controlled advanced computing chips, computers containing them and some chipmaking equipment ([87 FR 62186](https://www.federalregister.gov/documents/2022/10/13/2022-21658/implementation-of-additional-export-controls-certain-advanced-computing-and-semiconductor)); later rules revised it (25 October 2023, [88 FR 73458](https://www.federalregister.gov/documents/2023/10/25/2023-23055/implementation-of-additional-export-controls-certain-advanced-computing-items-supercomputer-and)), added controls on certain HBM (5 December 2024, [89 FR 96790](https://www.federalregister.gov/documents/2024/12/05/2024-28270/foreign-produced-direct-product-rule-additions-and-refinements-to-controls-for-advanced-computing)), and created the AI Diffusion framework with controls on some closed model weights (15 January 2025, [90 FR 4544](https://www.federalregister.gov/documents/2025/01/15/2025-00636/framework-for-artificial-intelligence-diffusion)), whose rescission BIS announced in May 2025 ([Wiley](https://www.wiley.law/alert-BIS-Rescinds-AI-Diffusion-Rule)). Rules published in 2026 loosen some limits: case-by-case licensing for chips up to the H200 class to China and Macau (15 January 2026, [91 FR 1684](https://www.federalregister.gov/documents/2026/01/15/2026-00789/revision-to-license-review-policy-for-advanced-computing-commodities)) and license-free access for approved entities in the United Arab Emirates (14 July 2026, [91 FR 43034](https://www.federalregister.gov/documents/2026/07/14/2026-14132/enhanced-favorable-treatment-for-the-united-arab-emirates-under-the-export-administration)).
- **Controls now reach models, proposals target clouds and chip locations, and engineers feel them.** On 12 June 2026 a US export control directive ordered Anthropic to suspend all access to two models, Fable 5 and Mythos 5, by any foreign national; to comply, Anthropic disabled both for all customers ([Anthropic](https://www.anthropic.com/news/fable-mythos-access)). The controls were lifted on 30 June, and Fable 5 returned to users worldwide on 1 July ([Anthropic](https://www.anthropic.com/news/redeploying-fable-5)). As of November 2026, know-your-customer rules for US cloud providers with foreign customers remain a proposed rule from January 2024 ([89 FR 5698](https://www.federalregister.gov/documents/2024/01/29/2024-01580/taking-additional-steps-to-address-the-national-emergency-with-respect-to-significant-malicious)), and a bill requiring location verification for advanced AI chips, the Chip Security Act, passed the House Foreign Affairs Committee on 26 March 2026 ([House Select Committee on the CCP](https://chinaselectcommittee.house.gov/media/press-releases/house-committee-passes-chip-security-act)), so plan capacity by region and keep a fallback model and provider ([cost and capacity](#cost-capacity)).

## Planned visuals

- **`diagram`:** the AI chip supply chain from design software and chip design through lithography, fabrication, HBM and advanced packaging to servers and clouds, each stage marked with its leading suppliers and the export controls that touch it.
- **`timeline`:** US export control rules and directives from October 2022 to 2026, each linked to its Federal Register entry or official statement, next to the EU, California, New York and South Korea compute thresholds.
- **`chart`:** Epoch AI's hardware trends on a log axis, with price-performance, compute, memory bandwidth and memory capacity growing at different rates (`data: real`, with source).

## Talk like an expert

Experts say **chokepoint**, **ECCN** and **Entity List**, **foreign direct product rule**, **deemed export**, **know-your-customer** and **compute threshold**, and separate controls on **chips**, on **chipmaking tools** and on **model weights and access**. They treat a compute threshold as a filter for scrutiny, not a measure of risk, and read every rule with its Federal Register date.

## Go deeper

- Sastry et al., [“Computing Power and the Governance of Artificial Intelligence”](https://arxiv.org/abs/2402.08797) (2024).
- Khan and Mann, [“AI Chips: What They Are and Why They Matter”](https://cset.georgetown.edu/publication/ai-chips-what-they-are-and-why-they-matter/), CSET (2020).
- Heim and Koessler, [“Training Compute Thresholds: Features and Functions in AI Regulation”](https://arxiv.org/abs/2405.10799) (2024).
- Hobbhahn et al., [“Trends in Machine Learning Hardware”](https://epoch.ai/blog/trends-in-machine-learning-hardware), Epoch AI (2023).

## Related

- [Governance, regulation and law](#governance-regulation)
- [Hardware](#hardware)
- [Model theft and weight security](#model-theft)
- [Energy, power and AI data centers](#ai-energy)
- [The EU AI Act in depth](#eu-ai-act)
- [US AI law and policy](#us-ai-law)
