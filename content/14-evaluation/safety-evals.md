---
id: safety-evals
book: 14
order: "14.8"
title: Safety and red-team evals
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [safety, red-team, jailbreak]
visuals:
  - safety-suite:tree
  - refusal-tradeoff:chart
---
> [!tldr]
> Safety evals measure what a system should not do (produce harmful content, leak data, follow injected instructions, act beyond its authority) and what it should not refuse. Product teams test their application’s risks; frontier labs also test dangerous capabilities. Both need adversarial data and both must track over-refusal alongside harm.

## Why it matters
A system that passes every quality eval can still leak a customer’s data, follow an instruction hidden in an email, or refuse a nurse’s legitimate medication question. Safety failures are rarer and costlier than quality failures, so they need deliberate test sets; and safety fixes often over-correct, so you must measure the cost of refusals too.

## Intuition
Safety testing is a crash test plus a road test. The crash test checks what happens in the worst case; the road test checks that the car still drives normally. A car that is safe because it never leaves the garage has failed the second.

```viz
{"id":"safety-suite","component":"tree","title":"An application safety suite covers seven risk families, each with its own test data and metric","caption":"Expand a family for what to test and how to grade it. Dangerous-capability evaluations are mainly the work of model developers; the rest apply to every product.","alt":"Tree of safety evaluation families: harmful content, over-refusal, jailbreak robustness, prompt injection, data leakage, excessive agency and bias, plus dangerous capabilities.","data":"illustrative","open":1,"root":{"label":"What could go wrong?","children":[
{"label":"Harmful content","children":[{"label":"Policy-violating requests from your domain; grade compliance rate with a calibrated classifier or judge"}]},
{"label":"Over-refusal","children":[{"label":"Legitimate requests that look risky; grade refusal rate. Track it next to harm, always"}]},
{"label":"Jailbreak robustness","children":[{"label":"Known attack families applied to your policies; grade attack success rate","link":"#jailbreaks-misuse"}]},
{"label":"Prompt injection","children":[{"label":"Instructions planted in documents, pages and tool results; grade whether the agent obeyed","link":"#prompt-injection"}]},
{"label":"Data leakage","children":[{"label":"Attempts to extract system prompts, other users’ data or secrets; grade any disclosure","link":"#privacy"}]},
{"label":"Excessive agency","children":[{"label":"Tasks that tempt the agent beyond its scope; grade forbidden actions in trajectories","link":"#guardrails-control"}]},
{"label":"Bias and fairness","children":[{"label":"Matched inputs varying only a demographic attribute; grade outcome differences","link":"#responsible-ai"}]},
{"label":"Dangerous capabilities (model developers)","children":[{"label":"Expert-built evaluations for areas such as biology, cybersecurity and autonomy, tied to safety frameworks","link":"#frontier-safety-frameworks"}]}]}}
```

## How it works
**Harmful-content evals.** Collect requests your policy says to refuse or handle carefully, specific to your domain, and grade responses with a classifier or calibrated judge. Public sets such as HarmBench and AdvBench are useful starting points; your own policies decide the labels.

**Over-refusal evals.** Collect legitimate requests that superficially resemble harmful ones: medical dosing questions from clinicians, security questions from defenders, fiction with dark themes. XSTest is a public example. Report the refusal rate next to the harm rate.

**Robustness to attacks.** Apply known jailbreak families and injection techniques to your policies and tools, and measure attack success rate. Update the set as new techniques appear. See [red teaming](#red-teaming).

**Agent-specific safety.** In sandboxed environments, give agents tasks with tempting shortcuts and injected instructions, then check trajectories for forbidden actions, data sent to unexpected destinations and skipped approvals. AgentDojo is one public benchmark for injection against tool-using agents. See [evaluating agents](#evaluating-agents).

**Dangerous-capability evaluations.** Model developers test for uplift in areas such as biological and chemical weapons, offensive cyber operations and autonomous replication, often with external experts and government institutes, and tie the results to the thresholds in their safety frameworks. See [frontier safety frameworks](#frontier-safety-frameworks).

**System cards.** Developers publish model and system cards that summarize safety evaluations; read them for what was tested, how, and what was found. See [benchmark literacy](#benchmark-literacy).

## In practice
Harm and over-refusal trade against each other, and good defenses improve both:

```viz
{"id":"refusal-tradeoff","component":"chart","type":"scatter","title":"A stricter prompt trades harm for refusals; a dedicated classifier layer improves both","caption":"Illustrative operating points for four configurations of one assistant, not measurements. Lower-left is better on both axes.","alt":"Illustrative scatter of harmful-compliance rate against over-refusal rate for a permissive prompt, a baseline, a strict prompt and a baseline with a classifier.","data":"illustrative","x":{"label":"Over-refusal rate on legitimate requests","unit":"pct","min":0,"max":0.2},"y":{"label":"Harmful-compliance rate","unit":"pct","min":0,"max":0.14},"series":[{"name":"Configuration","points":[[0.02,0.12,"Permissive prompt"],[0.06,0.05,"Baseline"],[0.18,0.02,"Strict prompt"],[0.07,0.01,"Baseline + classifier"]]}]}
```

A minimal application safety suite:
- 100 or more policy-violating requests from your domain, graded for compliance.
- 100 or more legitimate look-alikes, graded for refusal.
- Injection cases in every untrusted input channel your agent reads.
- Leakage probes for system prompts, secrets and other users’ data.
- Re-run on every model, prompt or tool change, with results tracked over time.

## Numbers to know
> [!number]
> Rules of thumb. Report harm rate and over-refusal rate together, always. Attack success rates against adaptive attackers are usually far higher than against fixed test sets; treat fixed-set numbers as a lower bound on risk.

## Pitfalls and anti-patterns
> [!pitfall] Measuring harm without measuring refusals
> A system that refuses anything sensitive scores perfectly on harm and fails its users. Track both.

- **Generic public sets only.** Your policies and domain define what harm means.
- **Static attack sets.** Attackers adapt; refresh the set.
- **Text-only checks for agents.** Agent harm is in actions; check trajectories.

## Talk like an expert
The vocabulary: **harmful-compliance rate**, **over-refusal**, **attack success rate**, **jailbreak robustness**, **injection resistance**, **excessive agency**, **dangerous-capability evaluation**, **system card**. Experts quote harm and refusal rates as a pair, and ask whether attacks were adaptive. The live debate is how to evaluate safety for open-ended agents whose possible harmful actions are hard to enumerate in advance.

> [!hottake] Over-refusal is the safety metric most teams forget, and it costs them the most users.
> **The counterargument:** in regulated or high-risk domains, a missed harmful response can cost far more than many unnecessary refusals; the right balance depends on the stakes of each failure.

## Check yourself
```quiz
safety-evals
```

## Go deeper
- Mazeika et al., “HarmBench” (2024); Röttger et al., “XSTest” (2023); Debenedetti et al., “AgentDojo” (2024).
- Published system cards from frontier model developers.

## Related
- [Red teaming](#red-teaming)
- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Prompt injection](#prompt-injection)
- [Frontier safety frameworks](#frontier-safety-frameworks)
- [Responsible AI in practice](#responsible-ai)
- [Reading model cards and system cards](#model-documentation)
- [Jailbreak attacks and defenses in depth](#jailbreak-techniques)
- [Scheming, sandbagging and evaluation awareness](#scheming-evaluations)
- [Dangerous-capability evaluations](#dangerous-capability-evals)
- [Fairness metrics and bias measurement](#fairness-bias)
