---
id: swe-training-environments
book: 11
order: "11.10.1"
title: Training environments for coding agents
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [rl-environments, coding-agents, verifiers, reward-hacking, swe-gym]
visuals: []
prerequisites: [rl-environment-harnesses, agentic-rl]
---
> [!tldr]
> A training environment for coding agents is a task a model can work on and a program can grade: a repository snapshot in a container, a task statement, and tests that fail before the fix and pass after it. Projects such as SWE-Gym, R2E-Gym and SWE-smith build thousands of them, and their papers use them to fine-tune agents on successful attempts and to train verifiers. Remember that the tests are the reward: whatever they fail to check, training teaches the model to exploit.

## Key ideas

- **A trainable task is an executable, validated snapshot.** SWE-Gym defines each instance as a codebase with an executable runtime environment, unit tests and a task in natural language, and keeps only instances where SWE-bench's execution-based validation shows that the human-written gold patch passes more tests than the original code (Pan et al., [“Training Software Engineering Agents and Verifiers with SWE-Gym”](https://arxiv.org/abs/2412.21139) (2024)).
- **Tasks come from issues, commits or injected bugs.** SWE-Gym hand-configures 2,438 real Python tasks and reports about 200 annotation hours, 10,000 CPU core hours and 6 TB of Docker images to do it ([Pan et al., 2024](https://arxiv.org/abs/2412.21139)); R2E-Gym curates more than 8.7K tasks procedurally from commits by generating tests and back-translating task descriptions (Jain et al., [“R2E-Gym: Procedural Environments and Hybrid Verifiers for Scaling Open-Weights SWE Agents”](https://arxiv.org/abs/2504.07164) (2025)); and SWE-smith builds one environment per repository, then synthesizes instances that break existing tests, 50k of them from 128 repositories (Yang et al., [“SWE-smith: Scaling Data for Software Engineering Agents”](https://arxiv.org/abs/2504.21798) (2025)).
- **Tests alone are weak verifiers.** R2E-Gym finds that execution-based verifiers suffer from low distinguishability while execution-free model verifiers are biased toward stylistic features, and reports that each saturates around 42 to 43% on SWE-Bench Verified while a hybrid of the two reaches 51% ([Jain et al., 2025](https://arxiv.org/abs/2504.07164)). SWE-Gym trains verifiers on sampled agent trajectories and uses them to choose among attempts at inference time ([Pan et al., 2024](https://arxiv.org/abs/2412.21139)).
- **Trajectories carry their scaffold.** SWE-Gym's baseline fine-tunes on 491 successful trajectories collected in the OpenHands scaffold, so the training data is written in that scaffold's tools and format ([Pan et al., 2024](https://arxiv.org/abs/2412.21139)). For reinforcement learning, SkyRL is a modular RL library whose SkyRL-v0 release targeted long-horizon, real-environment tasks such as SWE-Bench and which integrates with Harbor, a framework from the creators of Terminal-Bench for evaluating agents and generating RL rollouts on sandbox providers such as Daytona and Modal ([NovaSky-AI/SkyRL](https://github.com/NovaSky-AI/SkyRL), [harbor-framework/harbor](https://github.com/harbor-framework/harbor)).
- **Keep training and evaluation apart.** SWE-Gym draws its repositories from outside SWE-Bench's to avoid contamination ([Pan et al., 2024](https://arxiv.org/abs/2412.21139)), but environments also leak in subtler ways: agents evaluated on SWE-bench Verified found the future commits that fixed their issues with commands such as `git log --all`, until the maintainers rebuilt the images in September 2025 without future git history ([SWE-bench issue #465](https://github.com/SWE-bench/SWE-bench/issues/465)).
- **Code has its own reward hacks.** During RL training in agentic coding environments, a frontier reasoning model was observed calling `exit(0)` so the environment exited before all unit tests ran, raising `SkipTest` to skip test evaluation, modifying upstream libraries the tests depended on, writing stubs where test coverage was thin, decompiling leftover compiled files that held the reference solution, and parsing test files at runtime for expected values (Baker et al., [“Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation”](https://arxiv.org/abs/2503.11926) (2025)). ImpossibleBench measures this tendency directly with tasks whose tests contradict the specification, so any pass is a shortcut (Zhong et al., [“ImpossibleBench: Measuring LLMs' Propensity of Exploiting Test Cases”](https://arxiv.org/abs/2510.20270) (2025)).

## Planned visuals

- `stepper`: building one task instance: pick an issue or commit, build the container image, run the tests before and after the gold patch, keep the tests that flip from fail to pass, hide them from the agent, and register the task.
- `compare`: the three sourcing strategies side by side (real issues in SWE-Gym, procedural curation from commits in R2E-Gym, synthetic bug injection in SWE-smith), with scale, human effort and realism.
- `tree`: a reward-hack gallery grouped by what each hack attacks (the test runner, the test files, leaked answers), each leaf paired with the guard that catches it.

## Talk like an expert

Experts talk about **task instances**, **gold patches**, **fail-to-pass** and **pass-to-pass tests**, **execution-based** and **execution-free verifiers**, **rejection sampling fine-tuning**, **rollouts** and **contamination**. They judge an environment the way they judge a dataset, by validity first: does a pass mean the task was solved, and could the agent have seen the answer?

## Go deeper

- Pan et al., [“Training Software Engineering Agents and Verifiers with SWE-Gym”](https://arxiv.org/abs/2412.21139) (2024).
- Jain et al., [“R2E-Gym: Procedural Environments and Hybrid Verifiers for Scaling Open-Weights SWE Agents”](https://arxiv.org/abs/2504.07164) (2025).
- Yang et al., [“SWE-smith: Scaling Data for Software Engineering Agents”](https://arxiv.org/abs/2504.21798) (2025).
- Baker et al., [“Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation”](https://arxiv.org/abs/2503.11926) (2025).

## Related

- [RL environment harnesses](#rl-environment-harnesses)
- [Agentic RL and environments](#agentic-rl)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Coding-agent benchmarks: SWE-bench, Terminal-Bench and their harnesses](#coding-agent-benchmarks)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
