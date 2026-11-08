---
id: jailbreak-techniques
book: 17
order: "17.4.1"
title: Jailbreak attacks and defenses in depth
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [jailbreaks, adversarial-attacks, red-teaming, benchmarks, classifiers]
visuals: []
prerequisites: [jailbreaks-misuse]
---
> [!tldr]
> Jailbreaks exploit the gap between what a model can do and what its safety training taught it to refuse. Attacks range from hand-written personas and encodings to optimized suffixes, attacker models, multi-turn escalation and simply sampling many variants, and adaptive attacks have bypassed most of the recent defenses tested against them. Remember that an attack success rate means little without its judge, its number of attempts, its threat model and whether the output was actually useful.

## Key ideas

- **Two failure modes explain most manual jailbreaks.** Safety training fails through competing objectives, when helpfulness and instruction following pull against refusal, and through mismatched generalization, when the model understands inputs its safety training never covered (Wei et al., [“Jailbroken: How Does LLM Safety Training Fail?”](https://arxiv.org/abs/2307.02483) (2023)). NIST files prefix injection, refusal suppression, style injection and role-play personas such as DAN under the first, and encodings such as Base64, ciphers, payload splitting and translation into less common languages under the second ([NIST AI 100-2 E2025, section 3.3](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf)).
- **Optimization and attacker models automate the search.** GCG finds adversarial suffixes with greedy and gradient-based search on open Vicuna models, and those suffixes transferred to ChatGPT, Bard and Claude, which turns open-weight models into a practice range for attacks on closed ones (Zou et al., [“Universal and Transferable Adversarial Attacks on Aligned Language Models”](https://arxiv.org/abs/2307.15043) (2023)). PAIR has an attacker LLM refine prompts against a black-box target, often in fewer than twenty queries, and TAP adds tree search with pruning, jailbreaking GPT-4-Turbo and GPT-4o on more than 80% of prompts (Chao et al., [“Jailbreaking Black Box Large Language Models in Twenty Queries”](https://arxiv.org/abs/2310.08419) (2023); Mehrotra et al., [“Tree of Attacks”](https://arxiv.org/abs/2312.02119) (2023)).
- **Conversation length and attempt count are attack surfaces.** Crescendo opens with benign questions and escalates by referring to the model's own replies, and its automated form outperformed other techniques against GPT-4 and Gemini-Pro on an AdvBench subset; many-shot jailbreaking fills a long context with faked compliant dialogues, and success rises as a power law in the number of shots (Russinovich et al., [“Great, Now Write an Article About That”](https://arxiv.org/abs/2404.01833) (2024); [Anthropic, “Many-shot jailbreaking” (2024)](https://www.anthropic.com/research/many-shot-jailbreaking)). Best-of-N sampling of randomly augmented prompts reached 89% on GPT-4o and 78% on Claude 3.5 Sonnet with 10,000 samples, with power-law-like scaling over many orders of magnitude (Hughes et al., [“Best-of-N Jailbreaking”](https://arxiv.org/abs/2412.03556) (2024)).
- **API features and fine-tuning open separate routes.** Andriushchenko et al. jailbroke every Claude model they tested with a transfer or prefilling attack, which writes the start of the model's response, and used logprob access for random-search attacks on other models (Andriushchenko et al., [“Jailbreaking Leading Safety-Aligned LLMs with Simple Adaptive Attacks”](https://arxiv.org/abs/2404.02151) (2024)); fine-tuning GPT-3.5 Turbo on 10 adversarial examples, for under $0.20, jailbroke its safety guardrails, and benign fine-tuning degraded safety alignment too, to a lesser extent (Qi et al., [“Fine-tuning Aligned Language Models Compromises Safety”](https://arxiv.org/abs/2310.03693) (2023); see [safety and character training](#safety-character-training)). Universal jailbreaks, which bypass safeguards consistently across many topics, get special attention: Anthropic's August 2024 bounty offered up to $15,000 for novel ones in areas such as CBRN and cybersecurity ([Anthropic, 2024](https://www.anthropic.com/news/model-safety-bug-bounty)).
- **Benchmarks are only as good as their judges.** AdvBench, HarmBench, JailbreakBench, StrongREJECT and AgentHarm are common jailbreak benchmarks; HarmBench compared 18 red-teaming methods against 33 target models and defenses, and AgentHarm found leading models surprisingly compliant with malicious agent tasks even without a jailbreak ([NIST AI 100-2 E2025, section 3.6](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf); Mazeika et al., [“HarmBench”](https://arxiv.org/abs/2402.04249) (2024); Andriushchenko et al., [“AgentHarm”](https://arxiv.org/abs/2410.09024) (2024)). StrongREJECT showed that existing graders overstate jailbreak success, partly because jailbreaks that get past safety training tend to degrade the model's capability, leaving “empty” answers with little useful content (Souly et al., [“A StrongREJECT for Empty Jailbreaks”](https://arxiv.org/abs/2402.10260) (2024)).
- **Defenses hold until the attacker adapts.** Perplexity filters and input preprocessing, SmoothLLM's aggregation over randomly perturbed copies of a prompt, and constitutional classifiers are published defenses. In over 3,000 estimated hours of red teaming against an early classifier-guarded model, no red teamer found a universal jailbreak matching an unguarded model's level of detail on most target queries, and the enhanced classifiers cost a 0.38% absolute rise in production-traffic refusals and 23.7% inference overhead (Jain et al., [“Baseline Defenses”](https://arxiv.org/abs/2309.00614) (2023); Robey et al., [“SmoothLLM”](https://arxiv.org/abs/2310.03684) (2023); Sharma et al., [“Constitutional Classifiers”](https://arxiv.org/abs/2501.18837) (2025)). Adaptive attacks bypassed 12 recent defenses, most at over 90% success, although most had reported near-zero rates, which is why [guard models](#guard-models-moderation) work as one layer among several (Nasr et al., [“The Attacker Moves Second”](https://arxiv.org/abs/2510.09023) (2025)).

## Planned visuals

- `tree`: jailbreak families by failure mode (competing objectives, mismatched generalization), then optimization-based, attacker-model, multi-turn, sampling, API-feature and fine-tuning routes, each with its mechanism and first defense; no working attack text.
- `chart`: attack success against the number of attempts or shots on log axes, redrawn from the published best-of-N and many-shot results with sources and dates, showing power-law-like scaling.
- `compare`: one response graded by a keyword-based judge and by a rubric judge that scores useful content, showing how empty jailbreaks inflate attack success. Illustrative.

## Talk like an expert

Experts quote attack success rate (ASR) with four qualifiers: the judge, the attempt budget (one try or best of N), the threat model (black-box queries, logprobs, prefill or fine-tuning access) and whether the output was useful to an attacker. They treat a defense as unproven until it survives an adaptive attack built against it, and they ask whether a jailbreak is universal or works only for one request.

## Go deeper

- Wei et al., [“Jailbroken: How Does LLM Safety Training Fail?”](https://arxiv.org/abs/2307.02483) (2023).
- Zou et al., [“Universal and Transferable Adversarial Attacks on Aligned Language Models”](https://arxiv.org/abs/2307.15043) (2023).
- Souly et al., [“A StrongREJECT for Empty Jailbreaks”](https://arxiv.org/abs/2402.10260) (2024).
- Nasr et al., [“The Attacker Moves Second: Stronger Adaptive Attacks Bypass Defenses Against LLM Jailbreaks and Prompt Injections”](https://arxiv.org/abs/2510.09023) (2025).

## Related

- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Red teaming](#red-teaming)
- [Safety and red-team evals](#safety-evals)
- [Guard models and content moderation](#guard-models-moderation)
- [Adversarial machine learning](#adversarial-ml)
- [Prompt injection attacks and defenses in depth](#prompt-injection-techniques)
