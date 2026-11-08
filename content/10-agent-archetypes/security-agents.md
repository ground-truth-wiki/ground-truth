---
id: security-agents
book: 10
order: "10.9"
title: Security and vulnerability-research agents
level: expert
stability: volatile
reviewed: "2026-11"
status: seed
tags: [security-agents, vulnerability-research, fuzzing, cyber-benchmarks, responsible-disclosure]
visuals: []
prerequisites: [coding-agents, sandboxes]
---
> [!tldr]
> Security agents use language models to find, reproduce and fix software vulnerabilities: auditing code, hunting variants of known bugs, generating fuzzer inputs and proofs of concept, and proposing patches. The strongest systems pair the model with fuzzers, static analysis and symbolic execution, and trust a finding only when a crashing input or failing test reproduces it. Remember that the same capability helps attackers, so frontier developers gate it, and maintainers pay for every false report.

## Key ideas

- **A reproducing input is the verifier.** Google Project Zero's Naptime design gives the model room to reason, an interactive environment, a code browser, a sandboxed Python tool, a debugger on programs built with AddressSanitizer and a reporter, and treats automatic verification, typically a crash, as key to reliable results ([Project Zero, “Project Naptime”](https://projectzero.google/2024/06/project-naptime.html) (2024)). Its successor Big Sleep, built with Google DeepMind, was given recent SQLite commits for variant analysis and found an exploitable stack buffer underflow that 150 CPU-hours of AFL fuzzing had missed; it was fixed the same day, before any release shipped it ([Project Zero, “From Naptime to Big Sleep”](https://projectzero.google/2024/10/from-naptime-to-big-sleep.html) (2024)).
- **Cyber reasoning systems combine LLMs with classic program analysis.** In the final of DARPA's AI Cyber Challenge (results 8 August 2025), the autonomous systems found 54 unique synthetic vulnerabilities across the final's 63 challenges, patched 43 of them, and found 18 real ones that were being disclosed to maintainers; Team Atlanta, Trail of Bits and Theori placed first to third, and DARPA said all seven finalist systems would be released as open source ([DARPA, “AI Cyber Challenge marks pivotal inflection point for cyber defense”](https://www.darpa.mil/news/2025/aixcc-results)). The winner, ATLANTIS, pairs LLMs with symbolic execution, directed fuzzing and static analysis across C and Java (Kim et al., [“ATLANTIS: AI-driven Threat Localization, Analysis, and Triage Intelligence System”](https://arxiv.org/abs/2509.14589) (2025)), and Trail of Bits' Buttercup chains a seed generator, an AI-assisted fuzzing campaign built on OSS-Fuzz, a program model and a patcher ([Buttercup repository](https://github.com/trailofbits/buttercup)).
- **Benchmarks moved from capture-the-flag puzzles to real vulnerabilities.** Cybench has 40 professional capture-the-flag (CTF) tasks from 4 competitions, split into subtasks, and without subtask guidance the agents solved complete tasks that took human teams up to 11 minutes (Zhang et al., [“Cybench: A Framework for Evaluating Cybersecurity Capabilities and Risks of Language Models”](https://arxiv.org/abs/2408.08926) (2024)); NYU CTF Bench collects challenges from popular competitions (Shao et al., [“NYU CTF Bench: A Scalable Open-Source Benchmark Dataset for Evaluating LLMs in Offensive Security”](https://arxiv.org/abs/2406.05590) (2024)), and CVE-Bench asks agents to exploit critical-severity CVEs in sandboxed web applications, where the best framework managed up to 13% (Zhu et al., [“CVE-Bench: A Benchmark for AI Agents' Ability to Exploit Real-World Web Application Vulnerabilities”](https://arxiv.org/abs/2503.17332) (2025)). CyberGym asks agents to write a proof-of-concept test for 1,507 real vulnerabilities across 188 projects from a description and the codebase; the best agent and model combinations in the paper reproduced about 20%, and the runs turned up 34 zero-days (Wang et al., [“CyberGym: Evaluating AI Agents' Real-World Cybersecurity Capabilities at Scale”](https://arxiv.org/abs/2506.02548) (2025)).
- **Frontier developers track cyber capability and gate access to it.** Google DeepMind's Frontier Safety Framework named cybersecurity among the four domains of its first Critical Capability Levels ([Google DeepMind, “Introducing the Frontier Safety Framework”](https://deepmind.google/blog/introducing-the-frontier-safety-framework/) (2024)); see [frontier safety frameworks](#frontier-safety-frameworks). Under Project Glasswing (announced 7 April 2026), partners use Claude Mythos Preview, which Anthropic does not plan to make generally available, to find and fix vulnerabilities; Anthropic reports 83.1% on CyberGym against 66.6% for Claude Opus 4.6 and thousands of high-severity findings, and in October 2026 expanded a Cyber Verification Program that gives qualifying security professionals reduced blocking classifiers, all vendor-reported and as of November 2026 ([Anthropic, “Project Glasswing”](https://www.anthropic.com/glasswing)).
- **Disclosure and triage are part of the system.** Glasswing reports findings to maintainers and publishes only cryptographic hashes of the details until fixes are in place ([Anthropic](https://www.anthropic.com/glasswing)), while curl's maintainer described in 2024 how polished but false AI-generated reports pull developers off real work, with 64 confirmed security problems among the 415 reports the bounty had received by then ([Stenberg, “The I in LLM stands for intelligence”](https://daniel.haxx.se/blog/2024/01/02/the-i-in-llm-stands-for-intelligence/) (2024)). As of November 2026, curl's policy offers no bug bounty and asks reporters to write in their own voice rather than paste AI-generated explanations ([curl vulnerability disclosure policy](https://curl.se/dev/vuln-disclosure.html)).
- **Run them like untrusted code with a budget.** AIxCC teams submitted patches in an average of 45 minutes and spent about $152 per competition task ([DARPA](https://www.darpa.mil/news/2025/aixcc-results)), and Buttercup needs at least 8 CPU cores, 16 GB of RAM and paid LLM API keys that it starts spending once tasked ([Buttercup repository](https://github.com/trailofbits/buttercup)). Keep targets scoped to code you own or are authorized to test, run the agent and its proofs of concept in a [sandbox](#sandboxes), and review every patch as you would a stranger's pull request; OpenAI's Codex Security likewise reports evidence you can use to investigate its findings and has a separate step to fix and verify them, and its cloud version is a research preview as of November 2026 ([Codex Security docs](https://learn.chatgpt.com/docs/security)).

## Planned visuals

- `stepper`: one finding from start to patch: the agent reads a recent commit, hypothesizes a variant, writes a harness or input, the sanitizer reports a crash, the agent drafts a patch, the crash no longer reproduces and the regression tests pass, and a human reviews the diff.
- `diagram`: the anatomy of a cyber reasoning system, with LLM components alongside fuzzers, static analysis and symbolic execution, a crash triage stage and a patch validator, after the ATLANTIS and Buttercup designs.
- `matrix`: the benchmarks (Cybench, NYU CTF Bench, CVE-Bench, CyberGym) by task type, target (puzzle or real code), what counts as success and what each one misses, dated as of November 2026.

## Talk like an expert

Experts talk about **variant analysis**, **fuzz harnesses**, **sanitizers**, **crash triage**, **proofs of concept**, **cyber reasoning systems**, **CTF** versus **real-CVE** benchmarks, **coordinated disclosure** and **dual use**, and they ask of any AI-found bug whether a reproducing input exists, who verified it, and who pays to triage the reports that turn out false.

## Go deeper

- [DARPA, “AI Cyber Challenge marks pivotal inflection point for cyber defense”](https://www.darpa.mil/news/2025/aixcc-results) (2025).
- Kim et al., [“ATLANTIS: AI-driven Threat Localization, Analysis, and Triage Intelligence System”](https://arxiv.org/abs/2509.14589) (2025).
- [Project Zero, “From Naptime to Big Sleep”](https://projectzero.google/2024/10/from-naptime-to-big-sleep.html) (2024).
- Wang et al., [“CyberGym: Evaluating AI Agents' Real-World Cybersecurity Capabilities at Scale”](https://arxiv.org/abs/2506.02548) (2025).

## Related

- [Coding agents](#coding-agents)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Red teaming](#red-teaming)
- [Frontier safety frameworks](#frontier-safety-frameworks)
- [Sandboxes and execution environments](#sandboxes)
- [Safety and red-team evals](#safety-evals)
