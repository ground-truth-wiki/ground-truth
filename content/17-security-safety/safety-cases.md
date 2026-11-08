---
id: safety-cases
book: 17
order: "17.9.2"
title: Safety cases for frontier AI
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [safety-cases, assurance, frontier-safety, governance, risk-reports]
visuals: []
prerequisites: [frontier-safety-frameworks]
---
> [!tldr]
> A safety case is a structured argument, backed by evidence, that a system is safe enough for a specific use in a specific context. Borrowed from aviation, nuclear power and other safety-critical fields, it is becoming how frontier developers justify launches and internal deployments, and a candidate tool for regulators. Remember that a safety case is only as strong as its weakest assumption, and that it is usually written by the party that wants to ship.

## Key ideas

- **Claims, arguments, evidence.** Safety cases are already common in aviation and nuclear power, and Buhl et al. argue they can serve frontier AI both as a tool for developers' self-regulation and for government regulation (Buhl et al., [“Safety cases for frontier AI”](https://arxiv.org/abs/2410.21572) (2024)). A top-level claim is broken into narrower sub-claims, each supported by evidence, and written in a notation such as Goal Structuring Notation, maintained as a community standard by the Assurance Case Working Group of the Safety-Critical Systems Club ([GSN Community Standard, version 3](https://scsc.uk/gsn-standard) (May 2021)), or Claims Arguments Evidence (CAE), which Goemans et al. use to turn risk models, proxy tasks and evaluation results into an explicit cyber argument (Goemans et al., [“Safety case template for frontier AI: A cyber inability argument”](https://arxiv.org/abs/2411.08088) (2024)).
- **Four families of argument.** Clymer et al. define a safety case as “a structured rationale that AI systems are unlikely to cause a catastrophe” and group arguments into inability (the system cannot cause the harm), control (safeguards would stop it), trustworthiness (it could but would not) and deference to credible AI advisors if AI systems become much more powerful (Clymer et al., [“Safety Cases: How to Justify the Safety of Advanced AI Systems”](https://arxiv.org/abs/2403.10462) (2024)). Inability arguments rest on [dangerous-capability evaluations](#dangerous-capability-evals), which the authors rate as weakly scalable, and they expect that as systems advance, developers “will mostly rely on inability, then control, then trustworthiness” ([Clymer et al., 2024](https://arxiv.org/abs/2403.10462)).
- **Control safety cases assume the model may be adversarial.** Korbak et al. sketch an argument that an LLM agent deployed inside an AI company will not exfiltrate sensitive data, based on a control evaluation in which a red team builds models that try to do exactly that ([AI control](#ai-control)). The case rests on three claims: the red team elicits the models' exfiltration ability adequately, the control measures stay at least as effective in deployment, and the results are extrapolated conservatively (Korbak et al., [“A sketch of an AI control safety case”](https://arxiv.org/abs/2501.17315) (2025)).
- **Frameworks now use them, under different names (as of November 2026).** Google DeepMind runs safety case reviews before external launches when relevant Critical Capability Levels are reached, and the third iteration of its Frontier Safety Framework (22 September 2025) extended them to large-scale internal deployments for machine-learning R&D levels ([Google DeepMind, “Strengthening our Frontier Safety Framework”](https://deepmind.google/discover/blog/strengthening-our-frontier-safety-framework/)). Anthropic calls its documents risk reports because it does not claim to reach a predetermined risk level ([Anthropic, pilot sabotage risk report](https://alignment.anthropic.com/2025/sabotage-risk-report/) (October 2025)); under RSP v3 they appear every 3 to 6 months, and a significantly redacted report on a highly capable model goes to an independent third party for review (Williams and Freund, [GovAI analysis of RSP v3.0](https://www.governance.ai/analysis/anthropics-rsp-v3-0-how-it-works-whats-changed-and-some-reflections) (2026)).
- **The known failure modes: paperwork, aging evidence and self-assessment.** The Nimrod Review found that a military aircraft's safety case had become “essentially a paperwork and ‘tickbox’ exercise”, undermined by a widespread assumption that the aircraft was “safe anyway” because it had flown for 30 years (Haddon-Cave, [The Nimrod Review](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/229037/1025.pdf) (2009)). In AI, METR reviewed an unredacted version of Anthropic's sabotage risk report for Claude Opus 4.6 and warned that its alignment results may be weakened by evaluation awareness ([METR, March 2026](https://metr.org/blog/2026-03-12-sabotage-risk-report-opus-4-6-review)), and GovAI notes that Anthropic itself decides what to redact ([GovAI, 2026](https://www.governance.ai/analysis/anthropics-rsp-v3-0-how-it-works-whats-changed-and-some-reflections)).
- **A lightweight safety case fits an agent product too.** Goemans et al. break one main claim into narrower sub-claims, each backed by evidence ([Goemans et al., 2024](https://arxiv.org/abs/2411.08088)). A product team can reuse that pattern: state one scoped top claim (for example, that a support agent cannot move money without human approval in this deployment), split it into an inability or control argument, and attach evidence such as permission configuration, red-team results against the approval gate and production logs. Borrow two habits from the control safety case of Korbak et al.: rerun the evaluation when critical parts of the control setup change, and revise the case when new evidence invalidates it ([Korbak et al., 2025](https://arxiv.org/abs/2501.17315)).

## Planned visuals

- `tree`: an expandable safety case for an agent product: the top claim, sub-claims split by argument family (inability, control), and the evidence under each leaf, with the assumptions and the triggers for review marked.
- `compare`: inability arguments next to control arguments: what you must show, typical evidence, what breaks each one, and how each ages as model capability grows.
- `diagram`: how a safety case feeds a release decision: evaluations and safeguards produce evidence, the case is written, reviewed internally and externally, a decision is made, and changes to the model or deployment send it back for review.

## Talk like an expert

Experts talk about the **top-level claim**, **argument families**, **evidence**, **defeaters** and **assurance**, and they ask what the case assumes, who wrote it, who reviewed it with what access, and what event would invalidate it.

## Go deeper

- Clymer et al., [“Safety Cases: How to Justify the Safety of Advanced AI Systems”](https://arxiv.org/abs/2403.10462) (2024).
- Buhl et al., [“Safety cases for frontier AI”](https://arxiv.org/abs/2410.21572) (2024).
- Korbak et al., [“A sketch of an AI control safety case”](https://arxiv.org/abs/2501.17315) (2025).
- Goemans et al., [“Safety case template for frontier AI: A cyber inability argument”](https://arxiv.org/abs/2411.08088) (2024).

## Related

- [Frontier safety frameworks](#frontier-safety-frameworks)
- [AI control: protocols, monitors and control evaluations](#ai-control)
- [Dangerous-capability evaluations](#dangerous-capability-evals)
- [AI risk management and impact assessments](#ai-risk-management)
- [The AI system design method](#system-design-method)
