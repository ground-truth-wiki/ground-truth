---
id: enterprise-readiness
book: 16
order: "16.9"
title: Enterprise readiness
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [compliance, zdr, sso, audit]
visuals:
  - readiness-checklist:tree
  - security-review:stepper
---
> [!tldr]
> Selling or deploying AI in enterprises requires identity integration, role-based access, audit logs, data controls (retention, residency, no training on customer data), security certifications, admin controls over models and features, usage reporting, and contracts that cover data processing and AI-specific risks.

## Why it matters
Enterprise deals and internal rollouts are won or lost in security reviews, not demos. A product that cannot answer “where is our data stored, who can see it, and is it used for training?” will not pass. Building these capabilities early is far cheaper than retrofitting them under deal pressure.

## Intuition
Enterprise readiness is the difference between a food truck and a hospital cafeteria. The food can be identical; the cafeteria needs inspections, supplier records, allergen controls and someone accountable for every step.

```viz
{"id":"readiness-checklist","component":"tree","title":"Six areas every enterprise security review will ask about","caption":"Expand an area for the capabilities buyers expect. Not every deal needs every item; the first four are near-universal.","alt":"Tree of enterprise readiness areas: identity and access, data controls, auditability, security and compliance, admin controls, and contracts.","data":"illustrative","open":1,"root":{"label":"Enterprise readiness","children":[
{"label":"Identity and access","children":[{"label":"SSO (SAML or OIDC), SCIM provisioning, role-based access, per-workspace permissions"}]},
{"label":"Data controls","children":[{"label":"Retention settings, deletion, regional residency, no training on customer data, encryption in transit and at rest","link":"#privacy"}]},
{"label":"Auditability","children":[{"label":"Audit logs of admin actions, data access and agent actions, exportable to the customer’s SIEM","link":"#observability-tracing"}]},
{"label":"Security and compliance","children":[{"label":"SOC 2 Type II, ISO/IEC 27001, often ISO/IEC 42001 for AI; penetration tests; sector requirements such as HIPAA","link":"#governance-regulation"}]},
{"label":"Admin controls","children":[{"label":"Choose allowed models and providers, enable or disable features and connectors, set usage limits","link":"#cost-capacity"}]},
{"label":"Contracts","children":[{"label":"Data processing agreement, subprocessor list, SLAs, AI-specific terms on outputs, IP and liability"}]}]}}
```

## How it works
**Identity and access.** Single sign-on through the customer’s identity provider, automated user provisioning and removal (SCIM), roles and groups that map to permissions, and permission-aware retrieval so users see only what they are entitled to. See [production RAG](#production-rag).

**Data controls.** Configurable retention, deletion on request, regional processing, and contractual commitments that customer data is not used to train models, including by your model providers. Document every subprocessor, including model APIs.

**Audit logs.** Who did what, when: admin changes, data access, and, for agents, every tool call and approval. Customers will want to export them.

**Security programs.** SOC 2 Type II and ISO/IEC 27001 are the common baselines; ISO/IEC 42001 adds an AI management system; regulated sectors add their own (HIPAA, financial regulations). Penetration tests should include AI-specific attacks such as prompt injection. See [red teaming](#red-teaming).

**Admin and governance controls.** Let administrators choose models and providers, restrict features and connectors, set limits, and see usage. AI governance teams increasingly want model inventories and evaluation evidence. See [governance](#governance-regulation).

**Answering AI-specific questions.** Expect questions about hallucination handling, evaluation, human oversight, prompt-injection defenses, model provider terms and incident response. Prepare written answers backed by evidence.

Follow a typical review:

```viz
{"id":"security-review","component":"stepper","title":"An enterprise security review in five steps, and the evidence each one needs","caption":"Illustrative sequence. Having the evidence ready turns a months-long review into weeks.","alt":"Stepper of an enterprise security review: questionnaire, architecture review, data flow review, AI-specific questions and contract.","data":"illustrative","frames":[
{"label":"Questionnaire","caption":"A standard security questionnaire with hundreds of questions. Evidence: a maintained answer library, certifications and a trust center."},
{"label":"Architecture","caption":"Where the product runs, how tenants are isolated, how secrets are managed. Evidence: architecture diagram, penetration test summary."},
{"label":"Data flows","caption":"What data goes to which model provider, where it is processed and how long it is kept. Evidence: data flow diagram, subprocessor list, retention settings."},
{"label":"AI questions","caption":"How you evaluate quality and safety, defend against prompt injection, keep humans in the loop and handle incidents. Evidence: eval summaries, safety test results, documented controls."},
{"label":"Contract","caption":"Data processing agreement, SLAs and AI terms negotiated with legal and procurement. Evidence: standard templates that already cover common requests."}]}
```

## In practice
Build order for an AI product moving upmarket:
1. SSO and role-based access.
2. Audit logs, including agent actions.
3. Retention, deletion and a no-training commitment, aligned with your providers’ terms.
4. A data flow diagram and subprocessor list.
5. SOC 2 Type II, then ISO/IEC 27001 or 42001 as the market requires.
6. Admin controls for models, features and limits.
7. A written AI controls document: evals, safety tests, oversight and incident response.

## Numbers to know
> [!number]
> Rules of thumb. A first SOC 2 Type II audit covers an observation period of months, so start early. Prepared answer libraries cut questionnaire turnaround from weeks to days.

## Pitfalls and anti-patterns
> [!pitfall] Promising “we don’t train on your data” without checking your providers
> Your commitments must hold for every subprocessor, including model APIs and observability tools.

- **Audit logs that miss agent actions.** The most important events go unrecorded.
- **One shared admin account.** Fails access-control reviews immediately.
- **Waiting for a big deal to start compliance work.** The deal will not wait for the audit.

## Talk like an expert
The vocabulary: **SSO**, **SCIM**, **RBAC**, **audit log**, **data residency**, **retention**, **DPA**, **subprocessor**, **SOC 2 Type II**, **ISO/IEC 27001 and 42001**, **trust center**. Experts keep a living security package ready before sales asks. The live debate is how enterprises should govern agents with broad permissions, and what evidence of safety they should demand from vendors.

> [!hottake] For enterprise AI, the audit log is a product feature.
> **The counterargument:** buyers rarely choose a product for its audit logs; they choose for value and then require logs, so investing beyond the baseline early can distract from the core product.

## Check yourself
```quiz
enterprise-readiness
```

## Go deeper
- The AICPA’s SOC 2 materials and ISO/IEC 27001 and 42001 overviews.
- Your model providers’ trust centers and data processing terms.

## Related
- [Privacy](#privacy)
- [Governance and regulation](#governance-regulation)
- [Observability and tracing](#observability-tracing)
- [Reference architecture](#reference-architecture)
- [Secure agent design](#secure-agent-design)
- [Cloud AI platforms and inference providers](#cloud-ai-platforms)
- [AI security frameworks and standards](#ai-security-frameworks)
- [Privacy-preserving machine learning](#privacy-preserving-ml)
- [The EU AI Act in depth](#eu-ai-act)
- [US AI law and policy](#us-ai-law)
- [AI regulation beyond the EU and US](#global-ai-governance)
- [Copyright and AI: training, outputs and litigation](#ai-copyright)
- [AI risk management and impact assessments](#ai-risk-management)
