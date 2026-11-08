---
id: prompt-injection-techniques
book: 17
order: "17.2.1"
title: Prompt injection attacks and defenses in depth
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [prompt-injection, exfiltration, agent-security, benchmarks, defenses]
visuals: []
prerequisites: [prompt-injection, secure-agent-design]
---
> [!tldr]
> Prompt injection in depth is a catalog of delivery channels, hiding tricks, exfiltration paths and persistence mechanisms, set against defenses at three levels: model training, detectors and system design. Adaptive attacks have bypassed most of the recent defenses tested against them, and a large public competition hijacked every frontier model it tested at least once. Remember that the attacker moves second: measure your own system per input channel, and limit what a hijacked agent can reach.

## Key ideas

- **Sort attacks by goal, then by channel.** NIST AI 100-2 E2025 splits indirect injection into availability attacks (looping tasks, disabled tools), integrity attacks (wrong summaries, hijacked agents, poisoned retrieval) and privacy compromise (leaked private data), mounted by a third party whose victim is often the user ([Vassilev et al., NIST AI 100-2 E2025, section 3.4](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf)). Channels include web pages, documents, email, tool results and tool definitions, which MITRE ATLAS tracks as AI Agent Tool Poisoning, and the 2026 OWASP LLM01 entry also covers instructions hidden in images or audio ([ATLAS data changelog](https://github.com/mitre-atlas/atlas-data/blob/main/CHANGELOG.md); [OWASP LLM01:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM01_PromptInjection.md); [OWASP LLM Top 10 2026 preface](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM00_Preface.md)).
- **Hiding and exfiltration are separate skills.** Injections hide in non-visible parts of a resource, in multi-stage chains that send the model to a second resource, or in encodings such as Base64, and data leaves through URLs the model queries or Markdown images it renders ([NIST AI 100-2 E2025](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf)). Unicode tag characters mirror ASCII but are often not rendered, so people miss them while models read them; in one Microsoft 365 Copilot chain, injected instructions made Copilot search other emails and hide the results in invisible characters inside a link, and the author's core advice is to stop invoking tools automatically and stop rendering hidden characters ([Rehberger, “ASCII Smuggler Tool: Crafting Invisible Text and Decoding Hidden Codes” (2024)](https://embracethered.com/blog/posts/2024/hiding-and-finding-text-with-unicode-tags/); [Rehberger, “Microsoft Copilot: From Prompt Injection to Exfiltration of Personal Information” (2024)](https://embracethered.com/blog/posts/2024/m365-copilot-prompt-injection-tool-invocation-and-data-exfil-using-ascii-smuggling/)).
- **Injections persist and spread.** Instructions written into agent memory or a retrieval store can carry across sessions ([OWASP LLM01:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM01_PromptInjection.md)). ATLAS added AI Agent Context Poisoning: Memory in September 2025 and a case study on hacking ChatGPT's memories in November 2025 ([ATLAS data changelog](https://github.com/mitre-atlas/atlas-data/blob/main/CHANGELOG.md)), and Morris II used self-replicating prompts that poison the retrieval stores of GenAI email assistants to spread between them (Cohen et al., [“Here Comes The AI Worm”](https://arxiv.org/abs/2403.02817) (2024)). EchoLeak (CVE-2025-32711) was AI command injection in Microsoft 365 Copilot that let an unauthorized attacker disclose information over a network; Microsoft scored it 9.3 with no user interaction required, and the [casebook](#ai-failure-casebook) collects incidents like it ([NVD, CVE-2025-32711](https://nvd.nist.gov/vuln/detail/CVE-2025-32711); Reddy et al., [“EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System”](https://arxiv.org/abs/2509.10540) (2025)).
- **Benchmarks measure agent hijacking, and none shows it solved.** AgentDojo has 97 tasks and 629 security test cases for tool-using agents, and InjecAgent has 1,054 test cases on which a ReAct-prompted GPT-4 agent was vulnerable 24% of the time (Debenedetti et al., [“AgentDojo”](https://arxiv.org/abs/2406.13352) (2024); Zhan et al., [“InjecAgent”](https://arxiv.org/abs/2403.02691) (2024)). In a competition run by NIST's CAISI with Gray Swan and the UK AI Security Institute, published in March 2026, more than 400 participants made over 250,000 attack attempts, found at least one successful hijack against each of 13 frontier models, and attacks found on more robust models tended to transfer to less robust ones ([CAISI, 2026](https://www.nist.gov/blogs/caisi-research-blog/insights-ai-agent-security-large-scale-red-teaming-competition)).
- **Training and detectors lower attack success; adaptive attacks raise it again.** The instruction hierarchy trains models to ignore lower-privileged instructions, StruQ separates prompt and data channels with structured instruction tuning, SecAlign's preference optimization cut attack success below 10% in its authors' tests, and LlamaFirewall pairs the PromptGuard 2 detector with an experimental check that audits the agent's chain of thought (Wallace et al., [“The Instruction Hierarchy”](https://arxiv.org/abs/2404.13208) (2024); Chen et al., [“StruQ”](https://arxiv.org/abs/2402.06363) (2024); Chen et al., [“SecAlign”](https://arxiv.org/abs/2410.05451) (2024); Chennabasappa et al., [“LlamaFirewall”](https://arxiv.org/abs/2505.03574) (2025)). Gradient descent, reinforcement learning, random search and human-guided exploration bypassed 12 recent jailbreak and injection defenses, most at over 90% attack success, although most had reported near-zero rates (Nasr et al., [“The Attacker Moves Second”](https://arxiv.org/abs/2510.09023) (2025)).
- **System designs bound the damage, at a cost in utility.** Spotlighting transforms untrusted input so the model can tell where it came from, and CaMeL separates control flow from data flow and enforces capability policies on tool calls, solving 77% of AgentDojo tasks with provable security against 84% undefended; FIDES enforces confidentiality and integrity labels deterministically (Hines et al., [“Spotlighting”](https://arxiv.org/abs/2403.14720) (2024); Debenedetti et al., [“Defeating Prompt Injections by Design”](https://arxiv.org/abs/2503.18813) (2025); Costa et al., [“Securing AI Agents with Information-Flow Control”](https://arxiv.org/abs/2505.23643) (2025)). Meta's Agents Rule of Two says a session should combine at most two of untrustworthy input, access to sensitive systems or private data, and the ability to change state or communicate externally, and otherwise run under supervision ([Meta, October 2025](https://ai.meta.com/blog/practical-ai-agent-security/)).

## Planned visuals

- `tree`: the attack taxonomy from goal (availability, integrity, privacy) to delivery channel, hiding technique and exfiltration path, each leaf linked to its source or chapter; mechanisms only, no working payloads.
- `stepper`: a zero-click chain from a poisoned email to automatic tool use, an invisible-character link and data leaving the system, showing the step at which tag filtering, link stripping or the Rule of Two breaks it. Illustrative.
- `chart`: attack success that defenses reported against static attacks next to attack success under adaptive attacks, redrawn from Nasr et al. (2025) with source and date, to show why static evaluations mislead.

## Talk like an expert

Experts speak of channels, payloads, hiding, exfiltration and persistence, report attack success per input channel against an adaptive attacker, and keep one injection regression suite per channel that reruns on every model, prompt or tool change ([safety evals](#safety-evals)). They ask what a hijacked agent can reach before they ask how often it is hijacked.

## Go deeper

- Vassilev et al., [“Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations”](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf), NIST AI 100-2 E2025 (2025), sections 3.3 to 3.5.
- Debenedetti et al., [“AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents”](https://arxiv.org/abs/2406.13352) (2024).
- Debenedetti et al., [“Defeating Prompt Injections by Design”](https://arxiv.org/abs/2503.18813) (2025).
- Nasr et al., [“The Attacker Moves Second: Stronger Adaptive Attacks Bypass Defenses Against LLM Jailbreaks and Prompt Injections”](https://arxiv.org/abs/2510.09023) (2025).

## Related

- [Prompt injection](#prompt-injection)
- [Secure agent design](#secure-agent-design)
- [Jailbreak attacks and defenses in depth](#jailbreak-techniques)
- [Guard models and content moderation](#guard-models-moderation)
- [MCP security](#mcp-security)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
