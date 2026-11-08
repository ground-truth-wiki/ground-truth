---
id: frontier-safety-frameworks
book: 17
order: "17.9"
title: Frontier safety frameworks
level: expert
stability: volatile
reviewed: "2026-11"
status: full
tags: [rsp, dangerous-capabilities, system-cards]
visuals:
  - capability-thresholds:diagram
  - frameworks-matrix:matrix
---
> [!tldr]
> Frontier safety frameworks are developers’ public commitments to evaluate models for dangerous capabilities and to apply stronger safeguards, or in some frameworks pause, when thresholds are crossed. Anthropic’s Responsible Scaling Policy, OpenAI’s Preparedness Framework and Google DeepMind’s Frontier Safety Framework are the best known; they share a structure and differ in categories, thresholds and governance.

## Why it matters
These frameworks shape which models are released, with what safeguards, and on what terms. They also explain release decisions that can otherwise seem arbitrary: why a model ships with extra classifiers for some topics, why some capabilities are restricted to trusted users, or why a launch is delayed. For engineers building on frontier models, they define parts of the environment you operate in.

## Intuition
Think of biosafety levels for laboratories. The more dangerous the organism, the stricter the containment, and the rules are written down before anyone starts work. Frontier safety frameworks apply the same idea to AI capabilities.

```viz
{"id":"capability-thresholds","component":"diagram","title":"Evaluate, compare with thresholds, and match safeguards to capability, or pause","caption":"The shared structure of frontier safety frameworks, simplified. Not every framework has the pause branch: as of November 2026, OpenAI’s (April 2025 version) still calls for halting development at Critical until safeguards are specified, while Anthropic’s RSP no longer commits to pausing. Names and thresholds differ between developers; see the matrix below.","alt":"Diagram of a frontier safety framework: capability evaluations feed a threshold decision, which leads to standard safeguards, stronger deployment and security safeguards, or a pause.","data":"illustrative","w":600,"h":230,"nodes":[
{"id":"model","label":"New model","role":"model","x":0,"y":86,"w":130,"h":56},
{"id":"evals","label":"Capability evaluations","sub":"bio, cyber, AI R&D…","role":"tool","x":160,"y":86,"w":160,"h":56,"link":"#safety-evals"},
{"id":"thr","label":"Threshold crossed?","role":"agent","x":350,"y":86,"w":110,"h":56},
{"id":"std","label":"Standard safeguards","role":"data","x":490,"y":0,"w":110,"h":56},
{"id":"strong","label":"Stronger safeguards","sub":"deployment, security","role":"untrusted","x":490,"y":86,"w":110,"h":56},
{"id":"pause","label":"Pause until safeguards exist","role":"human","x":490,"y":172,"w":110,"h":56}],
"edges":[{"from":"model","to":"evals"},{"from":"evals","to":"thr"},{"from":"thr","to":"std","label":"no"},{"from":"thr","to":"strong","label":"yes"},{"from":"thr","to":"pause","style":"dashed","label":"cannot meet"}]}
```

## How it works
**The shared structure.** Each framework names risk categories (typically biological and chemical weapons, cybersecurity, and autonomous AI research or self-improvement), defines capability thresholds in each, specifies evaluations run before and during deployment, and lists the safeguards required once a threshold is crossed. Safeguards cover **deployment** (classifiers, access controls, monitoring) and **security** (protecting model weights from theft).

**Anthropic’s Responsible Scaling Policy** (first published September 2023, rewritten as version 3.0 in February 2026, version 3.4 as of November 2026) introduced AI Safety Levels (ASLs), modeled on biosafety levels. Version 3.0 keeps ASL-3 protections but no longer defines future levels as fixed lists of controls or commits to pausing; it separates what Anthropic commits to alone from what it recommends for the industry, and adds Risk Reports every 3 to 6 months and a Frontier Safety Roadmap of non-binding goals. In May 2025 Anthropic activated ASL-3 protections for Claude Opus 4 as a precaution. Deployment safeguards can also differ by product: as of November 2026, Claude Fable 5.1 shares its underlying model with Claude Mythos 5.1 but adds safeguards for biology, cybersecurity and LLM R&D, while the first Mythos-class model is available only to selected organizations.

**OpenAI’s Preparedness Framework** (December 2023, updated April 2025) tracks categories such as biological and chemical capability, cybersecurity and AI self-improvement, with High and Critical thresholds and a safety advisory group that reviews results.

**Google DeepMind’s Frontier Safety Framework** (May 2024; version 3.0 in September 2025, 3.1 in April 2026) defines Critical Capability Levels across domains including CBRN, cyber, machine-learning research and harmful manipulation, with corresponding mitigations.

**Others and commitments.** At the May 2024 Seoul summit, frontier developers signed commitments to publish safety frameworks; several, including Meta, Microsoft, Amazon and xAI, have since published their own. Compare them for categories, thresholds, who decides and what external review exists.

```viz
{"id":"frameworks-matrix","component":"matrix","matrix":"safety-frameworks","title":"Three frontier safety frameworks compared","caption":"Qualitative and dated as of November 2026. These documents are revised regularly; check each developer’s current version.","alt":"Table comparing Anthropic’s Responsible Scaling Policy, OpenAI’s Preparedness Framework and Google DeepMind’s Frontier Safety Framework.","data":"illustrative","depicts":"As of November 2026"}
```

**Critiques.** Frameworks are self-imposed and can be revised by their authors; thresholds are hard to define precisely; evaluations may under-elicit capabilities; and comparing them across developers is difficult. Supporters see them as the main working mechanism for frontier risk today and a template for regulation. See [governance](#governance-regulation).

## In practice
What these frameworks mean for application builders:
- **Expect safeguards on some topics**, such as classifiers that block certain biology or cyber requests, and design user experiences that handle refusals gracefully.
- **Expect tiered access** to the most capable models for some uses.
- **Read system cards** for each model you deploy: they summarize dangerous-capability evaluations and safeguards.
- **Apply the same pattern to your own product**: define your risk thresholds and the safeguards they trigger.

## Numbers to know
> [!number]
> Facts with dates: Anthropic’s RSP first published September 2023, with ASL-3 activated in May 2025, version 3.0 in February 2026 and 3.4 in July 2026; OpenAI’s Preparedness Framework December 2023 and April 2025, with its first Critical rating (cybersecurity) in September 2026; Google DeepMind’s Frontier Safety Framework May 2024, version 3.0 September 2025 and 3.1 April 2026; Seoul Frontier AI Safety Commitments May 2024.

## Pitfalls and anti-patterns
> [!pitfall] Treating framework names as interchangeable
> “ASL-3”, “High” and “CCL” are defined differently by different developers. Compare definitions, not labels.

- **Assuming frameworks are static.** They are revised; check the current version.
- **Ignoring them in product design.** Safeguards affect what your users can do.
- **Reading thresholds as precise.** They involve expert judgment on uncertain evaluations.

## Talk like an expert
The vocabulary: **Responsible Scaling Policy**, **AI Safety Level (ASL)**, **Preparedness Framework**, **Critical Capability Level**, **capability threshold**, **deployment safeguards**, **security safeguards**, **uplift**, **elicitation**. Experts ask what evaluations triggered a decision, who reviewed it, and what safeguards followed. The live debate is whether voluntary frameworks are enough or should be codified in law, as some recent legislation begins to do.

> [!hottake] Safety frameworks matter most for what they force developers to measure before release.
> **The counterargument:** frameworks written and enforced by the companies they constrain can be revised when inconvenient; without external verification, their commitments are only as strong as each company’s incentives.

## Check yourself
```quiz
frontier-safety-frameworks
```

## Go deeper
- Anthropic’s Responsible Scaling Policy, OpenAI’s Preparedness Framework and Google DeepMind’s Frontier Safety Framework, current versions, on each developer’s website.
- The Frontier AI Safety Commitments from the May 2024 Seoul summit.

## Related
- [Safety evals](#safety-evals)
- [Governance and regulation](#governance-regulation)
- [Alignment concepts](#alignment-concepts)
- [Frontier model families](#frontier-families)
- [Jailbreaks and misuse](#jailbreaks-misuse)
