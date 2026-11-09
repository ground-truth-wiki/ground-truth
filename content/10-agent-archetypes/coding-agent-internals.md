---
id: coding-agent-internals
book: 10
order: "10.1.1"
title: "Inside coding agents: localization, editing and verification"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [coding-agents, program-repair, edit-formats, repository-maps, swe-agent]
visuals: []
prerequisites: [coding-agents, agent-tools]
---
> [!tldr]
> A coding agent that fixes an issue does what automated program repair has always done: find the faulty code, change it, and check the change. The open research harnesses (SWE-agent, Agentless, AutoCodeRover, OpenHands, mini-SWE-agent) each tested a different answer for those three steps, and tools such as Aider build on the same ideas. Remember that the search, edit and test tools around the model are design choices you can measure, not fixed givens.

## Key ideas

- **Issue resolution is automated program repair with a language model.** Program repair patches bugs to reduce manual debugging, and a systematic review analyzed 189 papers on LLMs for repair published between 2020 and 2025 (Zhang et al., [“A Systematic Literature Review on Large Language Models for Automated Program Repair”](https://arxiv.org/abs/2405.01466) (2024)). Agentless makes the classic phases explicit as a fixed pipeline of localization, repair and patch validation, with no agent choosing its next action (Xia et al., [“Agentless: Demystifying LLM-based Software Engineering Agents”](https://arxiv.org/abs/2407.01489) (2024)).
- **Localization narrows from files to functions to lines.** Agentless shows the model a tree of the repository and merges its picks with embedding retrieval, then shrinks each file to a skeleton of signatures to choose classes and functions, then picks exact edit locations ([Xia et al., 2024](https://arxiv.org/abs/2407.01489)). AutoCodeRover searches the abstract syntax tree (classes and methods) instead of plain files and adds spectrum-based fault localization when tests exist (Zhang et al., [“AutoCodeRover: Autonomous Program Improvement”](https://arxiv.org/abs/2404.05427) (2024)). Aider's repository map uses tree-sitter to find where symbols are defined and referenced, ranks files with a graph algorithm, and fits the result into a token budget that defaults to 1k tokens ([Aider, “Building a better repository map with tree sitter”](https://aider.chat/2023/10/22/repomap.html) (2023); [Aider repository map docs](https://aider.chat/docs/repomap.html)).
- **The interface shapes what the model can do.** SWE-agent's agent-computer interface gives the model search commands capped at 50 results, a file viewer that shows 100 lines at a time, and an edit command that runs a linter and rejects edits with syntax errors; in the paper's ablation, removing the linter dropped SWE-bench Lite performance from 18.0% to 15.0% (Yang et al., [“SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering”](https://arxiv.org/abs/2405.15793) (2024)). CodeAct took the opposite path and lets the model act by writing executable Python, reporting up to 20% higher success than JSON or text actions across 17 LLMs (Wang et al., [“Executable Code Actions Elicit Better LLM Agents”](https://arxiv.org/abs/2402.01030) (2024)), and OpenHands is an open platform with sandboxed code execution and coordination between several agents (Wang et al., [“OpenHands: An Open Platform for AI Software Developers as Generalist Agents”](https://arxiv.org/abs/2407.16741) (2024)).
- **Edit formats are a model-specific choice.** Aider supports whole-file replacement (simple, but slow and costly), search-and-replace blocks that return only the changed parts, a fenced variant used mainly with Gemini models, and a simplified unified diff used mainly with GPT-4 Turbo models to curb their habit of skipping code with placeholder comments ([Aider edit formats](https://aider.chat/docs/more/edit-formats.html)). Agentless also writes its patches as search-and-replace edits to keep them small ([Xia et al., 2024](https://arxiv.org/abs/2407.01489)).
- **Validation picks one patch from many.** Agentless samples 40 candidate patches per issue, generates a reproduction test that must show the bug on the original code, runs the existing regression tests, and chooses among the survivors by majority vote over normalized patches; adding the reproduction tests raised it from 81 to 96 fixes (32.00%) on SWE-bench Lite, at a reported cost of $0.70 ([Xia et al., 2024](https://arxiv.org/abs/2407.01489)). Learned verifiers are the other route: SWE-Gym trains verifiers on agent trajectories from 2,438 executable Python tasks and uses them to choose outputs at inference time (Pan et al., [“Training Software Engineering Agents and Verifiers with SWE-Gym”](https://arxiv.org/abs/2412.21139) (2024)); see [training environments for coding agents](#swe-training-environments).
- **Minimal harnesses are now the reference point.** The SWE-agent README says mini-swe-agent “has superseded SWE-agent” ([SWE-agent README](https://github.com/SWE-agent/SWE-agent)), and mini-swe-agent is about 100 lines of Python for the agent class, has no tool except bash, runs every action as an independent subprocess, and reports a score above 74% on SWE-bench Verified, as of November 2026 ([mini-swe-agent README](https://github.com/SWE-agent/mini-swe-agent)). Terminus 2, which the Terminal-Bench authors built as a neutral testbed for comparing models, likewise has a single tool, a headless terminal, and completes tasks using only Bash commands (Merrill et al., [“Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Command Line Interfaces”](https://arxiv.org/abs/2601.11868) (2026)).

## Planned visuals

- `stepper`: the Agentless pipeline on one issue, frame by frame: repository tree, suspicious files, file skeletons, edit locations, 40 sampled patches, the reproduction-test filter, the regression filter and the majority vote that picks the final patch.
- `compare`: the same small fix written as a whole file, a search-and-replace block and a unified diff, with the typical failure of each (lost code, a search block that matches nothing, a hunk that does not apply).
- `matrix`: the open research harnesses (SWE-agent, Agentless, AutoCodeRover, OpenHands, mini-SWE-agent, Terminus 2) by tools, loop, localization method and what each one showed, dated as of November 2026.

## Talk like an expert

Experts talk about **fault localization**, **repository maps**, **edit formats**, the **agent-computer interface**, **reproduction tests**, **patch selection** and **verifiers**, and they read a paper's harness section before its score: which tools, which edit format, how many samples, and what chose the final patch.

## Go deeper

- Yang et al., [“SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering”](https://arxiv.org/abs/2405.15793) (2024).
- Xia et al., [“Agentless: Demystifying LLM-based Software Engineering Agents”](https://arxiv.org/abs/2407.01489) (2024).
- [Aider repository map docs](https://aider.chat/docs/repomap.html) and [edit format docs](https://aider.chat/docs/more/edit-formats.html).
- [mini-swe-agent](https://github.com/SWE-agent/mini-swe-agent), the minimal bash-only reference harness.

## Related

- [Coding agents](#coding-agents)
- [Coding-agent benchmarks: SWE-bench, Terminal-Bench and their harnesses](#coding-agent-benchmarks)
- [Harness engineering](#harness-engineering)
- [Tool use and tool design](#agent-tools)
- [Structured and code retrieval](#structured-code-retrieval)
- [Training environments for coding agents](#swe-training-environments)
- [Playbook: migrating int32 IDs to int64 at Google with an LLM](#google-code-migrations-llm)
