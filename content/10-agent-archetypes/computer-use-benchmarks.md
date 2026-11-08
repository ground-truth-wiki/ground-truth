---
id: computer-use-benchmarks
book: 10
order: "10.2.2"
title: Computer-use and web agent benchmarks
level: expert
stability: volatile
reviewed: "2026-11"
status: seed
tags: [computer-use, web-agents, osworld, webarena, agent-benchmarks]
visuals: []
prerequisites: [computer-use-agents, evaluating-agents]
---
> [!tldr]
> Computer-use and web benchmarks put an agent in front of real interfaces and check whether the task got done: by comparing the agent's actions with a recorded reference trajectory, by checking the final state with scripts, or by asking an LLM judge. The field moved from simple web pages to self-hosted sites, real desktops and phones, live websites and multi-hour workflows, and testing on live sites showed that earlier numbers had flattered agents. Read every score with its grading method, its step budget and whether the benchmark team verified it.

## Key ideas

- **Self-hosted sites made web tasks checkable.** WebArena runs fully functional websites from four domains (e-commerce, forums, collaborative software development and content management) and grades the functional correctness of each task; at release the best GPT-4 agent succeeded on 14.41% of tasks against 78.24% for humans (Zhou et al., [“WebArena: A Realistic Web Environment for Building Autonomous Agents”](https://arxiv.org/abs/2307.13854) (2023)). BrowserGym puts six web benchmarks (MiniWoB, WebArena, VisualWebArena, WorkArena, WebLINX and AssistantBench) behind one gym-style interface, with AgentLab for running and analyzing experiments (Le Sellier De Chezelles et al., [“The BrowserGym Ecosystem for Web Agent Research”](https://arxiv.org/abs/2412.05467) (2024)).
- **Real desktops and phones followed.** OSWorld has 369 tasks on real web and desktop applications, each with an initial-state setup and its own execution-based evaluation script; humans completed over 72.36% while the best model reached 12.24%, held back mainly by GUI grounding and operational knowledge (Xie et al., [“OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments”](https://arxiv.org/abs/2404.07972) (2024)). OSWorld-Verified (July 2025) fixed community-reported tasks and cut evaluation to under an hour on AWS ([OSWorld project page](https://osworld-v1.xlang.ai/)), and AndroidWorld generates 116 parameterized tasks across 20 Android apps, each with setup, success-check and teardown logic (Rawles et al., [“AndroidWorld: A Dynamic Benchmarking Environment for Autonomous Agents”](https://arxiv.org/abs/2405.14573) (2024)).
- **Long workflows are the current frontier.** OSWorld 2.0 has 108 long-horizon workflows with a median of about 1.6 human hours per task, scores binary completion at 500 steps alongside a partial score, and reports that one frontier agent needed an average of 318 tool calls per task, against about 30 in OSWorld 1.0; the best result on its page is 20.6% binary completion with a 54.8% partial score, as of November 2026 ([OSWorld 2.0 project page](https://osworld-v2.xlang.ai/)).
- **Live sites need judges, and judges need checking.** Offline benchmarks such as the original Mind2Web cache parts of websites, so an agent can only follow the annotated reference trajectory. “An Illusion of Progress?” introduced Online-Mind2Web, 300 tasks on 136 live websites, found current web agents far weaker than earlier reports implied, and proposed an LLM judge that agrees with human judgments about 85% of the time (Xue et al., [“An Illusion of Progress? Assessing the Current State of Web Agents”](https://arxiv.org/abs/2504.01382) (2025)). A judge-based score is therefore only as trustworthy as that agreement rate; see [judge models and meta-evaluation](#judge-models-meta-evaluation).
- **Scores are hard to compare across setups.** The OSWorld leaderboard separates results its team ran under unified settings from self-reported ones, and defines three kinds of entries: general models, specialized models trained as computer-use agents, and agentic frameworks that organize models into a workflow ([OSWorld project page](https://osworld-v1.xlang.ai/)). Step budgets move numbers: the native GUI agent UI-TARS, which takes only screenshots, reported 24.6 on OSWorld at 50 steps and 22.7 at 15 (Qin et al., [“UI-TARS: Pioneering Automated GUI Interaction with Native Agents”](https://arxiv.org/abs/2501.12326) (2025)), while Agent S is a modular framework with hierarchical planning and its own agent-computer interface (Agashe et al., [“Agent S: An Open Agentic Framework that Uses Computers Like a Human”](https://arxiv.org/abs/2410.08164) (2024)). Grounding is measured on its own: on ScreenSpot-Pro's high-resolution professional apps, the best existing model located only 18.9% of targets at publication (Li et al., [“ScreenSpot-Pro: GUI Grounding for Professional High-Resolution Computer Use”](https://arxiv.org/abs/2504.07981) (2025)).
- **Security benchmarks and your own environment.** WASP tests web agents against prompt injection end to end and found that simple injections partially succeed in up to 86% of cases, although agents often fail to complete the attacker's full goal (Evtimov et al., [“WASP: Benchmarking Web Agent Security Against Prompt Injection Attacks”](https://arxiv.org/abs/2504.18575) (2025)). For an in-house benchmark, AndroidWorld's per-task setup, success check and teardown is the pattern to copy: reset the state, run the agent, check the state ([Rawles et al., 2024](https://arxiv.org/abs/2405.14573)).

## Planned visuals

- `timeline`: the lineage from MiniWoB and WebArena through OSWorld, AndroidWorld and Online-Mind2Web to OSWorld 2.0, with what each benchmark added (self-hosted sites, real desktops, parameterized tasks, live sites, long workflows).
- `compare`: one task graded three ways (offline action matching, an execution-based state check and an LLM judge), showing what each method misses.
- `chart`: human baseline against the best agent at release for WebArena and OSWorld, with real data, sources and dates, to show how large the gap was when each benchmark appeared.

## Talk like an expert

Experts talk about **execution-based evaluation**, **state checks**, **LLM judges and human agreement**, **step budgets**, **GUI grounding**, **native agents versus planner-plus-grounder frameworks** and **verified versus self-reported results**, and they ask how success was checked before they ask how high it was.

## Go deeper

- Xie et al., [“OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments”](https://arxiv.org/abs/2404.07972) (2024).
- Zhou et al., [“WebArena: A Realistic Web Environment for Building Autonomous Agents”](https://arxiv.org/abs/2307.13854) (2023).
- Xue et al., [“An Illusion of Progress? Assessing the Current State of Web Agents”](https://arxiv.org/abs/2504.01382) (2025).
- The [OSWorld 2.0 project page](https://osworld-v2.xlang.ai/), for long-horizon tasks and current results.

## Related

- [Computer-use and browser agents](#computer-use-agents)
- [Browser automation for agents: Playwright, CDP and agent libraries](#browser-automation-stack)
- [Evaluating agents](#evaluating-agents)
- [Benchmark literacy](#benchmark-literacy)
- [Coding-agent benchmarks: SWE-bench, Terminal-Bench and their harnesses](#coding-agent-benchmarks)
- [Visual grounding, detection and segmentation](#visual-grounding)
