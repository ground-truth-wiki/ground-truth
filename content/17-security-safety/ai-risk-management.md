---
id: ai-risk-management
book: 17
order: "17.10.5"
title: AI risk management and impact assessments
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [nist-ai-rmf, iso-42001, impact-assessment, harm-taxonomy, ai-governance]
visuals: []
prerequisites: [governance-regulation, responsible-ai]
---
> [!tldr]
> AI risk management turns "is this system safe and fair enough?" into a repeatable process: a shared list of harms, a framework such as the NIST AI RMF or ISO/IEC 42001, an impact assessment before launch, and evidence that the controls work. Standards matter because they make the work checkable: an outside auditor can certify a management system against ISO/IEC 42001, and under the EU AI Act, following harmonised standards creates a presumption of conformity. Remember that the process exists to change decisions: a risk register nobody acts on is paper compliance.

## Key ideas

- **Standards are how compliance gets shown.** Under Article 40 of the EU AI Act, high-risk systems and general-purpose models that follow harmonised standards cited in the Official Journal are presumed to conform, to the extent those standards cover the requirements ([AI Act, Article 40](https://artificialintelligenceact.eu/article/40/)), and as of November 2026 CEN-CENELEC JTC 21 is still writing them, including standards for a trustworthiness framework, risk management, quality management and conformity assessment ([CEN-CENELEC](https://www.cencenelec.eu/areas-of-work/cen-cenelec-topics/artificial-intelligence/)). Their European forerunner is the High-Level Expert Group's seven requirements for trustworthy AI (April 2019), turned into the ALTAI self-assessment list in July 2020 ([European Commission](https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai)).
- **Harm taxonomies give a team a shared list of what can go wrong.** Weidinger et al. sort language-model harms into six areas, from discrimination and information hazards to malicious uses and environmental harms ([“Ethical and social risks of harm from Language Models”](https://arxiv.org/abs/2112.04359) (2021)), and Shelby et al. name five kinds of sociotechnical harm: representational, allocative, quality-of-service, interpersonal and societal ([“Sociotechnical Harms of Algorithmic Systems”](https://arxiv.org/abs/2210.05791) (2022)). Evaluation then needs three layers, because capability tests alone miss what happens in human interaction and in systemic impact (Weidinger et al., [“Sociotechnical Safety Evaluation of Generative AI Systems”](https://arxiv.org/abs/2310.11986) (2023)).
- **The NIST AI RMF organizes the work into four functions.** AI RMF 1.0 (26 January 2023) names seven characteristics of trustworthy AI (valid and reliable; safe; secure and resilient; accountable and transparent; explainable and interpretable; privacy-enhanced; fair with harmful bias managed) and four functions, govern, map, measure and manage, with govern cutting across the others and each function broken into categories and subcategories ([NIST AI 100-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)). Its Generative AI Profile, NIST AI 600-1 (26 July 2024), lists 12 risks such as confabulation, information integrity and intellectual property ([NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)); as of November 2026 the RMF is being revised under the White House AI Action Plan, and a critical-infrastructure profile was started with a concept note on 7 April 2026 ([NIST](https://www.nist.gov/itl/ai-risk-management-framework)).
- **ISO/IEC 42001 is a management system you can be certified against.** ISO/IEC 42001:2023 (18 December 2023) sets requirements for establishing, maintaining and continually improving an AI management system ([IEC Webstore](https://webstore.iec.ch/en/publication/90574)), and ISO/IEC 42006:2025 sets the rules for the bodies that audit it, calling certification “a third-party conformity assessment activity” ([IEC Webstore](https://webstore.iec.ch/en/publication/108460)). So a 42001 certificate comes from an outside auditor, while ALTAI is a checklist an organization fills in about itself ([European Commission](https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai)). ISO/IEC 42005:2025 (28 May 2025) adds guidance on AI system impact assessments and how they fit into an organization's AI risk management ([IEC Webstore](https://webstore.iec.ch/en/publication/107659)).
- **Impact assessments ask who could be hurt, before launch.** The AI Act's fundamental rights impact assessment applies when public bodies or private providers of public services deploy high-risk systems (other than for critical infrastructure), and to any deployer of high-risk systems for credit scoring or for life and health insurance pricing; it covers use, affected groups, risks, human oversight and response measures, must be reported to the market surveillance authority, and may cross-reference an existing GDPR data protection impact assessment ([AI Act, Article 27](https://artificialintelligenceact.eu/article/27/); [Annex III](https://artificialintelligenceact.eu/annex/3/)). Canada's Algorithmic Impact Assessment, mandatory under the federal Directive on Automated Decision-Making, scores 65 risk and 41 mitigation questions into impact levels I to IV and publishes the results ([Government of Canada](https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/algorithmic-impact-assessment.html)), and affected people hold rights to human intervention and to contest some automated decisions ([GDPR, Article 22](https://gdpr-info.eu/art-22-gdpr/)) and to an explanation of the AI system's role in high-risk decisions ([AI Act, Article 86](https://artificialintelligenceact.eu/article/86/)).
- **Start small, and keep it from becoming paper.** The OECD separates AI incidents (harm that happened) from AI hazards (harm that could happen) ([OECD](https://oecd.ai/en/ai-publications/defining-ai-incidents-and-related-terms)), and the AI Incident Database indexes real-world “harms or near harms” to learn from ([AI Incident Database](https://incidentdatabase.ai/)); both are distinct from operational outages handled in [incidents and on-call](#incidents-on-call). A small team can begin with an inventory of its AI systems, which the RMF asks for in GOVERN 1.6, then add a risk register, impact assessments, controls with evidence, a launch gate and a review cadence, remembering NIST's warning that its actions “do not constitute a checklist” ([NIST AI 100-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)).

## Planned visuals

- **`diagram`:** the NIST AI RMF core, with govern wrapping map, measure and manage, each function clickable to its categories and to the chapters that implement them.
- **`matrix`:** a crosswalk from the NIST AI RMF functions to ISO/IEC 42001 clauses and to EU AI Act obligations, marking where one piece of evidence serves all three.
- **`stepper`:** a lightweight management system for a small team, one step per frame: inventory, risk register, impact assessment, controls, evidence, launch gate and review.

## Talk like an expert

Experts speak of **harms** and **risk owners**, **AI management systems**, **impact assessments**, **presumption of conformity**, **certification versus attestation versus self-assessment**, and **incidents versus hazards**. They judge a risk program by whether it has ever stopped or changed a launch.

## Go deeper

- NIST, [“Artificial Intelligence Risk Management Framework (AI RMF 1.0)”](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf), NIST AI 100-1 (2023), and the [Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf), NIST AI 600-1 (2024).
- Weidinger et al., [“Ethical and social risks of harm from Language Models”](https://arxiv.org/abs/2112.04359) (2021).
- Shelby et al., [“Sociotechnical Harms of Algorithmic Systems: Scoping a Taxonomy for Harm Reduction”](https://arxiv.org/abs/2210.05791) (2022).
- [AI Act, Article 27](https://artificialintelligenceact.eu/article/27/): the fundamental rights impact assessment.

## Related

- [Governance, regulation and law](#governance-regulation)
- [Responsible AI in practice](#responsible-ai)
- [Enterprise readiness](#enterprise-readiness)
- [The EU AI Act in depth](#eu-ai-act)
- [AI security frameworks and standards](#ai-security-frameworks)
- [Fairness metrics and bias measurement](#fairness-bias)
