---
id: governance-regulation
book: 17
order: "17.10"
title: Governance, regulation and law
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [regulation, eu-ai-act, nist]
visuals:
  - regulation-timeline:timeline
  - eu-tiers:tree
---
> [!tldr]
> AI governance combines binding law (the EU AI Act, a growing set of US state laws, China’s rules for generative AI), executive policy, export controls, voluntary standards (NIST AI RMF, ISO/IEC 42001) and international summits. Obligations depend on your role and your use case. This chapter is a dated snapshot as of November 2026; laws and their timelines change, so verify before acting.

## Why it matters
Regulation decides what you must document, test, disclose and monitor, and in some cases what you may not build. It varies by jurisdiction and by role: building a general-purpose model, deploying a high-risk system and adding a chatbot to a website carry very different obligations. Engineers do not need to be lawyers, but they need to know which questions to bring to one.

## Intuition
AI regulation is building codes for software that makes decisions. A garden shed needs almost nothing; a hospital needs inspections, documentation and certified materials. The first question is always which kind of building you are putting up.

```viz
{"id":"regulation-timeline","component":"timeline","title":"Three years of AI governance: laws, executive actions, standards and summits","caption":"Dated events from the Timeline, as of November 2026. Laws are amended and timelines shift; follow each link and verify the current status.","alt":"Timeline of AI governance events from the NIST AI RMF in 2023 to 2026, including the EU AI Act milestones, US executive actions and state laws, summits and export controls.","data":"illustrative","depicts":"As of November 2026","events":["nist-rmf","us-eo-14110","bletchley","iso42001","seoul-summit","eu-ai-act","us-eo-revoked","eu-prohibitions","paris-summit","gpai-code","us-action-plan","eu-gpai","ca-sb53","model-export-controls","eu-high-risk"]}
```

## How it works
**The EU AI Act.** In force since 1 August 2024, applied in stages: prohibited practices from 2 February 2025; obligations for general-purpose AI (GPAI) models from 2 August 2025, supported by a voluntary Code of Practice published in July 2025; most high-risk system obligations scheduled from August 2026, with proposals in late 2025 to delay some of them (verify the current dates). It sorts systems by risk:

```viz
{"id":"eu-tiers","component":"tree","title":"The EU AI Act sorts systems into risk tiers, plus separate rules for general-purpose models","caption":"Expand a tier for examples and the core obligations, simplified. Your role (provider, deployer, importer) changes which obligations apply; get legal advice for real decisions.","alt":"Tree of EU AI Act risk tiers: prohibited practices, high-risk systems, transparency obligations and minimal risk, plus general-purpose AI model obligations.","data":"illustrative","depicts":"EU AI Act, simplified, as of November 2026","open":1,"root":{"label":"EU AI Act categories","children":[
{"label":"Prohibited practices","children":[{"label":"Examples: social scoring by public authorities, manipulative techniques causing harm, some biometric uses. Not allowed."}]},
{"label":"High-risk systems","children":[{"label":"Examples: hiring, credit scoring, education, critical infrastructure, some medical uses. Risk management, data governance, documentation, human oversight, accuracy and robustness, registration."}]},
{"label":"Transparency obligations","children":[{"label":"Examples: chatbots, synthetic media. Tell people they are interacting with AI; label generated content."}]},
{"label":"Minimal risk","children":[{"label":"Most applications, such as spam filters. No new obligations; voluntary codes encouraged."}]},
{"label":"General-purpose AI models","children":[{"label":"All providers: technical documentation, copyright policy, training-data summary."},{"label":"Systemic-risk models (presumed above 10²⁵ training FLOP): evaluations, risk mitigation, incident reporting, cybersecurity.","link":"#scaling-laws"}]}]}}
```

**The United States.** No comprehensive federal AI law. Executive Order 14110 (October 2023) was revoked in January 2025, and the administration published an AI Action Plan in July 2025. States are active: Colorado passed an AI act on high-risk systems (with its effective date pushed back), and California enacted SB 53 on transparency for frontier developers in September 2025; others have passed or proposed laws. Sector regulators (finance, health, employment, consumer protection) apply existing law to AI.

**Export controls.** The US restricts exports of advanced AI chips and some related technology. In June 2026, US Department of Commerce export controls led Anthropic to suspend access to Claude Fable 5 and Claude Mythos 5 from 12 June; the controls were lifted on 30 June and access was restored on 1 July 2026 (see Anthropic’s statement at anthropic.com/news/fable-mythos-access). Export rules can affect which models and hardware you can use, and where.

**China.** Interim measures for generative AI services (2023) require security assessments and content controls for public-facing services, and rules on labeling AI-generated content took effect in 2025.

**The United Kingdom and international.** The UK relies on existing regulators and its AI Security Institute (renamed from the AI Safety Institute in 2025). Summits at Bletchley Park (2023), Seoul (2024) and Paris (2025) produced declarations and commitments; government institutes collaborate on evaluations.

**Standards.** The NIST AI Risk Management Framework (2023) and its generative-AI profile (2024) organize risk work into govern, map, measure and manage. ISO/IEC 42001 (2023) specifies a certifiable AI management system. Standards often become the practical way to show compliance.

## In practice
Questions to answer for each AI feature, with your legal team:
1. **Where** will it be offered, and where are users located?
2. **What role** do you play: model provider, system provider, deployer, distributor?
3. **What use case**: does it touch employment, credit, education, health, critical infrastructure, biometrics or minors?
4. **What disclosures** are required: AI interaction notices, content labels, model documentation?
5. **What records** must you keep: risk assessments, evaluations, logs, incident reports?
6. **What standard** will you align with to show it?

Much of what regulation asks for (documentation, evaluations, human oversight, logging, incident response) is what good engineering already produces. Build it in, and compliance becomes a matter of collecting evidence.

## Numbers to know
> [!number]
> Facts with dates (as of November 2026; verify current status): EU AI Act in force 1 August 2024; prohibitions from 2 February 2025; GPAI obligations from 2 August 2025; systemic-risk presumption at 10²⁵ training FLOP. Executive Order 14110 issued October 2023 and revoked January 2025. California SB 53 signed September 2025.

## Pitfalls and anti-patterns
> [!pitfall] Assuming you are only a “user” of AI
> Fine-tuning a model, changing its intended purpose or putting your name on a system can make you a provider with heavier obligations.

- **Treating this chapter as legal advice.** It is a map of questions, not answers.
- **Waiting for final rules.** The engineering evidence regulators ask for takes months to build.
- **Ignoring state and sector rules.** In the US they carry most of the binding obligations today.

## Talk like an expert
The vocabulary: **provider** and **deployer**, **high-risk system**, **general-purpose AI model**, **systemic risk**, **Code of Practice**, **conformity assessment**, **AI management system**, **export controls**, **NIST AI RMF**. Experts start with role and use case, then jurisdiction. The live debate is the balance between innovation and precaution, the role of states versus federal law in the US, and how much frontier-model regulation should rely on developers’ own frameworks.

> [!hottake] Good engineering practice is most of AI compliance.
> **The counterargument:** legal obligations include things engineering does not naturally produce, such as conformity assessments, registrations, specific disclosures and contractual allocations of liability, and getting those wrong carries real penalties.

## Check yourself
```quiz
governance-regulation
```

## Go deeper
- The EU AI Act text and the European Commission’s AI Office guidance.
- NIST AI RMF 1.0 and its generative-AI profile; ISO/IEC 42001.
- Trackers of US state AI legislation from law firms and policy groups, read with dates.

## Related
- [Frontier safety frameworks](#frontier-safety-frameworks)
- [Responsible AI in practice](#responsible-ai)
- [Privacy](#privacy)
- [Enterprise readiness](#enterprise-readiness)
- [Threat modeling](#threat-modeling)
