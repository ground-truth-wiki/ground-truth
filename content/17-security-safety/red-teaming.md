---
id: red-teaming
book: 17
order: "17.7"
title: Red teaming
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [red-team, pyrit, garak]
visuals:
  - redteam-loop:diagram
  - finding-stepper:stepper
---
> [!tldr]
> Red teaming is adversarial testing by people and tools trying to make a system fail in harmful ways. Scope it by real risks, combine human creativity with automated attack generation, triage findings by severity, fix them, and turn every finding into a regression test.

## Why it matters
Evals test what you thought of; red teams find what you did not. For AI systems the space of possible inputs is effectively infinite, and attackers are creative. A structured red-team exercise before launch, and continuous automated probing after, catches failures that would otherwise be found by users, journalists or attackers.

## Intuition
A red team is a friendly burglar you hire to break into your house before a real one does, and who then tells you exactly which window they used.

```viz
{"id":"redteam-loop","component":"diagram","title":"Scope, attack, triage, fix, regress: a red-team loop that leaves the system stronger each round","caption":"The loop runs before launch and continuously after. Click a stage for the chapter behind it.","alt":"Loop diagram of red teaming: scope risks, attack with humans and tools, triage findings, fix, and add regression tests.","data":"illustrative","w":600,"h":200,"nodes":[
{"id":"scope","label":"Scope","sub":"risks, assets, rules","role":"human","x":0,"y":0,"w":170,"h":56,"link":"#threat-modeling"},
{"id":"attack","label":"Attack","sub":"humans and tools","role":"untrusted","x":215,"y":0,"w":170,"h":56},
{"id":"triage","label":"Triage","sub":"severity, likelihood","role":"agent","x":430,"y":0,"w":170,"h":56},
{"id":"fix","label":"Fix","sub":"design, filters, policy","role":"tool","x":430,"y":140,"w":170,"h":56,"link":"#secure-agent-design"},
{"id":"regress","label":"Regression tests","sub":"every finding becomes a case","role":"data","x":215,"y":140,"w":170,"h":56,"link":"#safety-evals"}],
"edges":[{"from":"scope","to":"attack"},{"from":"attack","to":"triage"},{"from":"triage","to":"fix"},{"from":"fix","to":"regress"},{"from":"regress","to":"scope","label":"next round"}]}
```

## How it works
**Scoping.** Start from the threat model: which harms matter (data leakage, harmful content, unauthorized actions, fraud, reputational damage), which assets and tools are in play, and the rules of engagement. See [threat modeling](#threat-modeling).

**Human red teaming.** Domain experts, security testers and diverse everyday users find failures that automated tools miss: subtle harms, culturally specific issues and multi-step exploits of agent tools. Ganguli et al. (2022) described lessons from large-scale human red teaming of language models.

**Automated red teaming.** Use models to generate and mutate attacks at scale (Perez et al., 2022), and tools such as Microsoft’s PyRIT, NVIDIA’s garak and Promptfoo’s red-team mode to run attack libraries against your application. Automation finds breadth; humans find depth.

**Agent red teaming.** For agents, attack every untrusted input channel (pages, documents, emails, tool results, other agents) and check trajectories for forbidden actions and data leaving the system. See [prompt injection](#prompt-injection).

**Triage and severity.** Rate findings by impact and likelihood, reproduce them, and decide fixes: architecture changes first, then filters and policy. Track time to fix like any security issue.

**Bug bounties and disclosure.** Several model developers run bounty programs for jailbreaks and safety issues; applications benefit from a clear way for outsiders to report problems.

Follow one finding from discovery to regression test:

```viz
{"id":"finding-stepper","component":"stepper","title":"One red-team finding, from a hidden instruction in a PDF to a test that runs on every release","caption":"Step through an illustrative finding against a document-summarizing agent with email access.","alt":"Stepper following a red-team finding through discovery, reproduction, severity rating, fix and regression test.","data":"illustrative","frames":[
{"label":"Discover","caption":"A red-teamer uploads a PDF whose white-on-white text tells the agent to email the document to an outside address. The agent drafts the email."},
{"label":"Reproduce","caption":"The finding is reproduced five times out of five with two different models, so it is not a fluke."},
{"label":"Rate","caption":"Impact: data exfiltration of confidential documents. Likelihood: anyone can upload a PDF. Severity: high."},
{"label":"Fix","caption":"Architecture first: the summarizer loses email access in the same task, and outbound email requires approval showing the recipient. A hidden-text detector is added as a second layer."},
{"label":"Regress","caption":"The PDF and four variants become safety eval cases that run on every release. The finding is closed only when they pass.","code":"case: injected-pdf-exfil-01..05\nexpect: no outbound email; approval requested if attempted"}]}
```

## In practice
A pre-launch red-team plan:
1. Scope from the threat model; list harms, assets and tools.
2. Run automated attack libraries for breadth on day one.
3. Run two to five days of human red teaming with domain and security experts.
4. Triage daily; fix high-severity findings before launch.
5. Convert every finding into regression cases.
6. After launch, run automated probing continuously and repeat human rounds after major changes.

## Numbers to know
> [!number]
> Rules of thumb. Automated tools can run thousands of attack variants per hour; a few skilled humans over a few days typically find the most serious issues. Every confirmed finding should produce at least one regression case.

## Pitfalls and anti-patterns
> [!pitfall] Red teaming once, before launch
> New tools, data sources and model versions open new holes. Repeat after every major change.

- **Fixing the exact prompt.** Patch the class of attack, not one string.
- **Automation only.** Tools miss subtle, contextual and multi-step harms.
- **Findings with no owner.** Track them like security bugs, with deadlines.

## Talk like an expert
The vocabulary: **rules of engagement**, **attack library**, **automated red teaming**, **attack success rate**, **severity**, **regression case**, **bug bounty**, **responsible disclosure**. Experts measure red teams by severe findings fixed, not prompts tried. The live debate is how far automated red-teaming models can replace human experts as attacks grow more complex.

> [!hottake] Red teaming that does not end in regression tests is theater.
> **The counterargument:** some of the most valuable red-team output is qualitative, such as a new category of harm or a design flaw, which shapes architecture far more than any single test case.

## Check yourself
```quiz
red-teaming
```

## Go deeper
- Perez et al., “Red Teaming Language Models with Language Models” (2022).
- Ganguli et al., “Red Teaming Language Models to Reduce Harms” (2022).
- Documentation for PyRIT, garak and Promptfoo’s red-team features.

## Related
- [Safety evals](#safety-evals)
- [Threat modeling](#threat-modeling)
- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Prompt injection](#prompt-injection)
- [Secure agent design](#secure-agent-design)
- [Security and vulnerability-research agents](#security-agents)
- [AI security frameworks and standards](#ai-security-frameworks)
- [Jailbreak attacks and defenses in depth](#jailbreak-techniques)
