---
id: ai-control
book: 17
order: "17.8.3"
title: "AI control: protocols, monitors and control evaluations"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [ai-control, monitoring, trusted-monitoring, agent-safety, alignment]
visuals: []
prerequisites: [alignment-concepts, guardrails-control]
---
> [!tldr]
> AI control designs deployments that stay safe even if the model is deliberately trying to cause harm, instead of relying on the model being aligned. It combines a capable untrusted model, weaker trusted models and a small budget of trusted human audits with protocols that monitor, edit, resample or replace suspicious work, and it tests them in red-team control evaluations. Control is always measured as a trade-off between safety and usefulness against an explicit attacker.

## Key ideas

- **Assume the model may be trying to subvert you.** Control evaluations replace the untrusted model with a red-team attack policy and ask whether the safety protocol still prevents harm, because techniques such as model-on-model review had not been tested against a model that intentionally subverts them (Greenblatt et al., [“AI Control: Improving Safety Despite Intentional Subversion”](https://arxiv.org/abs/2312.06942) (2023)). Alignment work tries to make the model not want to cause harm; control tries to make it fail if it does.
- **Three resources, two metrics.** In the original setting, GPT-4 was the untrusted model, GPT-3.5 the trusted one, and trusted high-quality labor (simulated with GPT-4) had enough budget to audit 2% of 5,000 APPS programming problems; safety was the probability of never submitting a backdoored solution, and usefulness the share of correct solutions, rescaled so that GPT-3.5 scores 0 and GPT-4 scores 1 ([Greenblatt et al., 2023](https://arxiv.org/abs/2312.06942)).
- **Protocols buy safety with usefulness.** Auditing only the first 2% of solutions gave 15% safety; trusted monitoring (GPT-3.5 scores suspicion and the top 2% are audited) gave 62% safety at 97% usefulness; also submitting the trusted model's own solution when suspicion fell between the top 2% and the top 10% (defer to trusted) gave 83% at 93%; having GPT-3.5 edit the code in the band between the top 2% and the top 20% (trusted editing) gave 92% at 94%; and untrusted monitoring by a second GPT-4, with redaction against collusion, gave 79% at 96% ([Greenblatt et al., 2023](https://arxiv.org/abs/2312.06942)).
- **Agents need multi-step protocols such as resampling.** On BashBench, 257 multi-step system administration tasks, resample protocols that draw extra samples of suspicious actions, combined with analysis of earlier steps, cut attack success from 58% to 7% at a 5% cost to a benign agent's performance (Bhatt et al., [“Ctrl-Z: Controlling AI Agents via Resampling”](https://arxiv.org/abs/2504.10374) (2025)). As of November 2026, ControlArena from the UK AI Security Institute and Redwood Research packages settings such as Bash, IAC (the infrastructure code of a mock frontier lab's AWS account), Data Poisoning and SAE Interp Sabotage, with honest and attack policies, monitors and micro-protocols such as defer-to-trusted, as a thin wrapper over Inspect ([ControlArena](https://github.com/UKGovernmentBEIS/control-arena)).
- **Control evaluations scale with capability and feed a safety case.** Korbak et al. propose five AI control levels in which the red team's affordances match the capability profile of the model being evaluated, give example control measures and [safety cases](#safety-cases) for each, and conclude that a convincing control safety case for superintelligent agents will need research breakthroughs (Korbak et al., [“How to evaluate control measures for LLM agents? A trajectory from today to superintelligence”](https://arxiv.org/abs/2504.05259) (2025)).
- **Chain-of-thought monitoring is one control measure among several.** Reading a model's reasoning can catch intent to misbehave, but the technique is imperfect, lets some misbehavior through and may be fragile, so its authors recommend it alongside other safety methods (Korbak et al., [“Chain of Thought Monitorability: A New and Fragile Opportunity for AI Safety”](https://arxiv.org/abs/2507.11473) (2025)). Product teams can borrow the rest of the pattern today: a monitor that scores each agent action for suspicion, sampled human audits, tight privileges and rollback (see [guardrails and control](#guardrails-control)).

## Planned visuals

- **`chart`:** safety against usefulness for each protocol in Greenblatt et al. (2023), plotted as a frontier, with the source on the chart.
- **`stepper`:** one untrusted action passing through a protocol: suspicion score, audit-budget threshold, then submit, defer to trusted, resample or send to a human auditor.
- **`diagram`:** a control evaluation as a game: the red team's attack policy stands in for the untrusted model, the blue team's protocol wraps it, and the measured safety and usefulness feed a safety case.

## Talk like an expert

Control researchers speak of trusted and untrusted models, audit budgets, attack policies and the safety-usefulness trade-off, and they ask of every safeguard “what if the model is actively trying to beat this?” They keep control (the model cannot succeed) separate from alignment (the model does not try) and want both.

## Go deeper

- Greenblatt et al., [“AI Control: Improving Safety Despite Intentional Subversion”](https://arxiv.org/abs/2312.06942) (2023).
- Bhatt et al., [“Ctrl-Z: Controlling AI Agents via Resampling”](https://arxiv.org/abs/2504.10374) (2025).
- Korbak et al., [“How to evaluate control measures for LLM agents? A trajectory from today to superintelligence”](https://arxiv.org/abs/2504.05259) (2025).
- [ControlArena](https://github.com/UKGovernmentBEIS/control-arena), the UK AI Security Institute and Redwood Research library for control experiments.

## Related

- [Alignment concepts](#alignment-concepts)
- [Scheming, sandbagging and evaluation awareness](#scheming-evaluations)
- [Safety cases for frontier AI](#safety-cases)
- [Guardrails and control](#guardrails-control)
- [Secure agent design](#secure-agent-design)
