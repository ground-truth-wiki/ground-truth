---
id: ai-security-frameworks
book: 17
order: "17.1.1"
title: AI security frameworks and standards
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [owasp, mitre-atlas, nist, security-standards, threat-modeling]
visuals: []
prerequisites: [threat-modeling]
---
> [!tldr]
> AI security frameworks are different kinds of documents. The OWASP lists rank risks, MITRE ATLAS catalogs real attacks, NIST defines a taxonomy, threat-modeling methods such as MAESTRO and LINDDUN structure a review, and ETSI and ISO standards set baselines and guidance. Use each one for the job it was built for, and quote every ID with its edition, because the lists are renumbered as practice changes (as of November 2026).

## Key ideas

- **The OWASP Top 10 for LLM Applications 2026, published in August 2026, reordered the list.** Excessive agency climbed to LLM03, unbounded consumption rose four places to LLM06, improper output handling fell from fifth to LLM10, and system prompt leakage became the broader LLM08 Hidden Context Exposure. For the first time, the ranking also used incident data: a practitioner vote carries three quarters of the weight and a corpus of real incidents one quarter ([OWASP, LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/); [OWASP, “Letter from the Project Leads”, LLM Top 10 2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM00_Preface.md)).
- **Agents and their credentials have their own lists.** The OWASP Top 10 for Agentic Applications (9 December 2025) runs from ASI01 Agent Goal Hijack through tool misuse, identity and privilege abuse, agentic supply chain, unexpected code execution, memory and context poisoning, insecure inter-agent communication, cascading failures and human-agent trust exploitation to ASI10 Rogue Agents, and the LLM list says to pair the two once a model acts on its own ([OWASP agentic list](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/); [OWASP LLM 2026 preface](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM00_Preface.md); [OWASP LLM 2026 framework mappings](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/Appendix_A_Related_Framework_Mappings.md)). The OWASP Non-Human Identities Top 10 (2025) covers the identities software uses to authenticate, such as service accounts and API keys, from NHI1 Improper Offboarding to NHI10 Human Use of NHI ([OWASP NHI Top 10](https://owasp.org/www-project-non-human-identities-top-10/)).
- **MITRE ATLAS is the attack knowledge base, and it grows fastest around agents.** Its October 2026 release (v2026.10) holds 16 tactics, 129 techniques, 92 sub-techniques, 44 mitigations and 77 case studies, and since September 2025 it has added agent techniques such as AI Agent Context Poisoning, Exfiltration via AI Agent Tool Invocation and AI Agent Tool Poisoning, plus mitigations for agent permissions ([ATLAS data changelog](https://github.com/mitre-atlas/atlas-data/blob/main/CHANGELOG.md)).
- **NIST supplies vocabulary and profiles rather than a checklist.** NIST AI 100-2 E2025 (March 2025) sorts adversarial machine learning attacks by lifecycle stage, attacker goals, capabilities and knowledge (see [adversarial machine learning](#adversarial-ml)), and NIST AI 600-1 (July 2024), the generative AI profile of the AI RMF, lists twelve risks such as confabulation, information security and value chain and component integration ([NIST AI 100-2 E2025](https://csrc.nist.gov/pubs/ai/100/2/e2025/final); [NIST AI 600-1](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)). The Cyber AI Profile (NIST IR 8596) covers securing AI components, AI-enabled defense and thwarting AI-enabled attacks; as of November 2026 the only version NIST lists is the initial preliminary draft of 16 December 2025 ([NIST IR 8596](https://csrc.nist.gov/pubs/ir/8596/iprd)).
- **Industry maps and threat-modeling methods fill other gaps.** Google introduced its Secure AI Framework (SAIF) in June 2023 and donated SAIF data to the Coalition for Secure AI in September 2025. The donation included the CoSAI Risk Map: YAML files of components, risks, controls and seven personas ([Google, 2023](https://blog.google/technology/safety-security/introducing-googles-secure-ai-framework/); [CoSAI announcement](https://www.coalitionforsecureai.org/google-donates-secure-ai-framework-saif-data-to-coalition-for-secure-ai/); [CoSAI Risk Map](https://github.com/cosai-oasis/secure-ai-tooling/tree/main/risk-map)). MAESTRO, published by the Cloud Security Alliance in February 2025, threat-models agentic systems in seven layers, from foundation models to the agent ecosystem, and LINDDUN from KU Leuven covers privacy threats such as linking and identifying ([CSA, MAESTRO](https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro); [LINDDUN](https://linddun.org/)).
- **Standards set baselines and hand over to management systems.** ETSI EN 304 223 (14 January 2026) sets 13 principles and requirements across five life-cycle phases, from secure design to secure end of life ([ETSI](https://www.etsi.org/newsroom/press-releases/2627-etsi-releases-world-leading-standard-for-securing-ai/)), and ISO/IEC 27090:2026 gives guidance on threats such as data poisoning, prompt injection and model theft that feeds into ISO/IEC 27001 and ISO/IEC 42001 instead of creating a separate management system ([BSI, October 2026](https://www.bsigroup.com/en-GB/insights-and-media/media-centre/press-releases/2026/october/new-international-guidance-to-help-organizations-protect-ai-from-security-threats/)). Organization-wide risk management belongs to the voluntary NIST AI RMF, which NIST is revising as of November 2026, and to ISO/IEC 42001; see [AI risk management](#ai-risk-management) ([NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)).

## Planned visuals

- `matrix`: every framework in this chapter by kind (risk list, attack knowledge base, taxonomy, threat-modeling method, baseline requirements, guidance standard), publisher, current edition as of November 2026, and the job it suits: design review, red-team planning, procurement questionnaire or audit.
- `compare`: the 2025 and 2026 OWASP Top 10 for LLM Applications side by side, with linked highlights for each entry that moved, was renamed or was re-scoped.
- `heatmap`: the ten 2026 OWASP LLM risks against the nine frameworks OWASP maps them to, with primary and supporting mappings, redrawn from the OWASP 2026 mapping appendix (real data, dated).

## Talk like an expert

Experts name the kind of document before its content, quote IDs with their edition (LLM08:2026, ASI01, AML.T0051), and tag one finding across several frameworks, as the OWASP 2026 list does with its version-pinned mappings to nine frameworks ([OWASP LLM 2026 framework mappings](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/Appendix_A_Related_Framework_Mappings.md)). The kinds suggest a division of labor: risk lists for design reviews, ATLAS for red-team plans and incident write-ups, standards and control sets for questionnaires and audits.

## Go deeper

- [OWASP Top 10 for LLM Applications 2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10), the canonical Markdown source with framework mappings and a threat-modeling appendix.
- Vassilev et al., [“Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations”](https://csrc.nist.gov/pubs/ai/100/2/e2025/final), NIST AI 100-2 E2025 (2025).
- [MITRE ATLAS data](https://github.com/mitre-atlas/atlas-data), the authoritative YAML release of tactics, techniques, mitigations and case studies.
- [CoSAI Risk Map](https://github.com/cosai-oasis/secure-ai-tooling/tree/main/risk-map), part of the SAIF data Google donated to CoSAI in 2025.

## Related

- [Threat modeling LLM apps and agents](#threat-modeling)
- [Adversarial machine learning](#adversarial-ml)
- [AI risk management and impact assessments](#ai-risk-management)
- [Red teaming](#red-teaming)
- [Enterprise readiness](#enterprise-readiness)
- [MCP security](#mcp-security)
