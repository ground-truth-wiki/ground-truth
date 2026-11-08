---
id: model-theft
book: 17
order: "17.5.1"
title: Model theft and weight security
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [model-extraction, weight-security, distillation, api-abuse, security]
visuals: []
prerequisites: [supply-chain-security, threat-modeling]
---
> [!tldr]
> Model theft comes in three forms: stealing the weights, extracting parts of a model through its API, and distilling its capabilities into another model through many queries. Each needs different defenses, from locked-down infrastructure and insider-threat programs to rate limits, account verification and limits on what an API returns. Remember that query access is partial access: every answer carries some information about the model behind it.

## Key ideas

- **Know what can be stolen.** Weights are the crown jewels, because whoever holds them can use the model with almost no restraint ([Nevo et al., RAND, “Securing AI Model Weights” (2024)](https://www.rand.org/pubs/research_reports/RRA2849-1.html)). Short of the weights, attackers go after architecture details such as the hidden dimension, hidden context such as system prompts and tool schemas (OWASP's LLM08:2026 Hidden Context Exposure), and capabilities copied from outputs (Carlini et al., [“Stealing Part of a Production Language Model”](https://arxiv.org/abs/2403.06634) (2024); [OWASP LLM08:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM08_HiddenContextExposure.md)).
- **RAND's security levels tie weight defenses to attacker capability.** RAND counts about 38 attack vectors in nine categories, from unpatched software and social engineering to AI-specific vectors such as model extraction and distillation, and defines five levels from SL1, which can likely thwart amateur attempts, to SL5, which could plausibly thwart most top-priority operations by the most capable nation-states ([RAND, 2024](https://www.rand.org/pubs/research_reports/RRA2849-1.html)). It calls SL5 currently not achievable, and its urgent recommendations include centralizing all copies of the weights, reducing the people with access, hardening model interfaces against exfiltration, insider-threat programs, advanced third-party red-teaming and confidential computing for weights in use ([RAND, 2024](https://www.rand.org/pubs/research_reports/RRA2849-1.html)).
- **Extraction through prediction APIs is an old attack with new targets.** Tramèr et al. extracted logistic regression, neural network and decision tree models from BigML and Amazon Machine Learning with near-perfect fidelity, and showed that omitting confidence values does not fully stop extraction (Tramèr et al., [“Stealing Machine Learning Models via Prediction APIs”](https://arxiv.org/abs/1609.02943) (2016)). Carlini et al. recovered the full embedding projection layer of OpenAI's Ada and Babbage for under $20 and the exact hidden dimension of gpt-3.5-turbo, after which OpenAI and Google added defenses to their APIs ([Carlini et al., 2024](https://arxiv.org/abs/2403.06634)).
- **Distillation attacks copy capabilities, not weights.** On 23 February 2026 Anthropic reported that three AI labs, which it named, had run over 16 million exchanges with Claude through about 24,000 fraudulent accounts and proxy networks it calls hydra clusters, aimed mainly at agentic reasoning, tool use and coding ([Anthropic, 2026](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks)). OWASP names the same risk functional model replication: using a target model's outputs as synthetic data to fine-tune another model, which sidesteps query-based extraction ([OWASP LLM10:2025](https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/)). The 2026 list keeps it as a scenario under LLM06 Unbounded Consumption ([OWASP LLM06:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM06_UnboundedConsumption.md)).
- **API defenses limit what each answer leaks and who can ask.** OWASP lists rate limits and quotas, restricting `logit_bias` and `logprobs`, and watermarking outputs; Carlini et al. add allowing logit bias or logprobs but not both in one query, and adding noise ([OWASP LLM10:2025](https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/); [Carlini et al., 2024](https://arxiv.org/abs/2403.06634)). Anthropic describes classifiers and behavioral fingerprinting for distillation patterns, including chain-of-thought elicitation, stronger verification for the account types most abused, and model-level safeguards, while antidistillation sampling perturbs a model's token probabilities so its reasoning traces train worse students: in its authors' MMLU example, a distilled student fell to as low as 40% where plain distillation reached 52%, for the same 4% drop in teacher accuracy ([Anthropic, 2026](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks); Savani et al., [“Antidistillation Sampling”](https://arxiv.org/abs/2504.13146) (2025)).
- **Privacy tools do not stop theft, and the line on distillation is contested.** Differential privacy protects the training records, not the model, so it gives no guarantee against extraction, and NIST warns that query limits and suspicious-query detection can be circumvented by motivated, well-resourced attackers ([NIST AI 100-2 E2025, section 2.4](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf); see [privacy-preserving ML](#privacy-preserving-ml)). Distillation itself is a legitimate technique that labs use on their own models: Anthropic draws the line at the pattern of use, such as massive volume in narrow areas, repetitive prompts and coordinated accounts, while the antidistillation authors call returning reasoning traces a forfeiture of intellectual property by the model's owner ([Anthropic, 2026](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks); [Savani et al., 2025](https://arxiv.org/abs/2504.13146)).

## Planned visuals

- `diagram`: the model at the center and the three routes to theft around it (weight exfiltration, API extraction, distillation), each with the attacker access it needs and its first defenses, linked to the chapters that cover them.
- `heatmap`: RAND's nine attack vector categories against its five attacker capability levels, colored by estimated feasibility, redrawn from RAND (2024) with source and date.
- `stepper`: how an API can reveal a model's hidden dimension, after Carlini et al. (2024): collect many full logit vectors, stack them into a matrix, and count the singular values that stand above the noise. Illustrative.

## Talk like an expert

Experts separate weight theft (a security-engineering problem, discussed in RAND's SL1 to SL5 and attacker capability levels), model extraction (a math problem about what each API response leaks, from logprobs to logit bias) and distillation attacks (an abuse problem, caught by patterns across many accounts). The live debate is where legitimate distillation ends, and how much an API can hide before it stops being useful.

## Go deeper

- Nevo et al., [“Securing AI Model Weights: Preventing Theft and Misuse of Frontier Models”](https://www.rand.org/pubs/research_reports/RRA2849-1.html), RAND (2024).
- Carlini et al., [“Stealing Part of a Production Language Model”](https://arxiv.org/abs/2403.06634) (2024).
- Tramèr et al., [“Stealing Machine Learning Models via Prediction APIs”](https://arxiv.org/abs/1609.02943) (2016).
- Anthropic, [“Detecting and preventing distillation attacks”](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks) (2026).

## Related

- [Supply chain and model security](#supply-chain-security)
- [Adversarial machine learning](#adversarial-ml)
- [Frontier safety frameworks](#frontier-safety-frameworks)
- [Distillation, merging and compression](#distillation-merging)
- [Compute governance: chips, supply chains and export controls](#compute-governance)
- [Privacy-preserving machine learning](#privacy-preserving-ml)
