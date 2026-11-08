---
id: coding-agent-benchmarks
book: 10
order: "10.1.2"
title: "Coding-agent benchmarks: SWE-bench, Terminal-Bench and their harnesses"
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [swe-bench, terminal-bench, agent-benchmarks, contamination, eval-harnesses]
visuals: []
prerequisites: [coding-agents, benchmark-literacy]
---
> [!tldr]
> SWE-bench turned real GitHub issues into a test: apply the agent's patch, run the tests that the real fix made pass, and check that nothing else broke. Its variants, its successors and Terminal-Bench are now the reference points for many claims about coding agents, but a score depends on the harness, contamination and test quality, not only on the model. Read every number with its harness, budget and attempts, and confirm it on tasks from your own repository.

## Key ideas

- **A task is an issue, a commit and two sets of tests.** SWE-bench started from about 90,000 pull requests in 12 popular Python repositories, kept merged ones that resolve an issue and change tests, and kept only instances where at least one test flips from failing to passing, leaving 2,294 tasks; a task counts as resolved only if every FAIL_TO_PASS and PASS_TO_PASS test passes after the patch applies, and at release the best model, Claude 2, resolved 1.96% (Jimenez et al., [“SWE-bench: Can Language Models Resolve Real-World GitHub Issues?”](https://arxiv.org/abs/2310.06770) (2023)).
- **Running the harness is a Docker job.** Predictions are a JSONL file with `instance_id`, `model_name_or_path` and `model_patch`, and `python -m swebench.harness.run_evaluation` writes a summary plus per-instance logs, test output and the applied patch, locally or in the cloud through Modal or `sb-cli` ([SWE-bench evaluation guide](https://www.swebench.com/SWE-bench/guides/evaluation/)). Images come in three layers (a base image, about 60 environment images and one image per instance), and the cache level trades disk for speed: about 100 GB at the default `env` level, about 2,000 GB if every instance image is kept ([SWE-bench Docker setup guide](https://www.swebench.com/SWE-bench/guides/docker_setup/)).
- **Each variant fixes a different gap.** Verified has 500 problems checked as solvable by experts, and Multilingual has 300 tasks in 9 languages from 42 repositories ([SWE-bench datasets guide](https://www.swebench.com/SWE-bench/guides/datasets/)); Multimodal has 617 tasks from 17 JavaScript libraries, each with at least one image (Yang et al., [“SWE-bench Multimodal: Do AI Systems Generalize to Visual Software Domains?”](https://arxiv.org/abs/2410.03859) (2024)). SWE-Bench Pro has 1,865 long-horizon, human-verified tasks from 41 repositories, split into a public set, a held-out set and a commercial set from proprietary code (Deng et al., [“SWE-Bench Pro: Can AI Agents Solve Long-Horizon Software Engineering Tasks?”](https://arxiv.org/abs/2509.16941) (2025)).
- **Saturation and contamination retire benchmarks.** In February 2026 OpenAI stopped reporting SWE-bench Verified and backed SWE-bench Pro; its researchers said frontier models could reproduce gold patches or problem statements from task ids alone, and that a review of 138 problems its models had failed found tests too narrow to accept correct fixes or too wide, demanding features the issue never mentioned (Latent Space, [“The End of SWE-Bench Verified”](https://www.latent.space/p/swe-bench-dead), an interview with Mia Glaese and Olivia Watkins of OpenAI (February 2026)). Refreshed sets respond to this: SWE-rebench collects new tasks automatically and offers over 21,000 Python tasks (Badertdinov et al., [“SWE-rebench”](https://arxiv.org/abs/2505.20411) (2025)), and SWE-bench-Live started with 1,319 tasks from issues created since 2024 in 93 repositories (Zhang et al., [“SWE-bench Goes Live!”](https://arxiv.org/abs/2505.23419) (2025)).
- **Terminal-Bench grades the final state of a container.** Terminal-Bench 2.0 has 89 tasks, each with an instruction, a Docker image, tests, an example solution and a time limit, and its tests check the container's final state rather than the commands used; it ships in the Harbor task format through the Harbor registry, and Harbor runs agents such as Claude Code, Codex CLI, OpenHands and mini-SWE-agent next to the authors' own neutral agent, Terminus 2, with frontier agents below 65% at publication (Merrill et al., [“Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Command Line Interfaces”](https://arxiv.org/abs/2601.11868) (2026)).
- **The harness is part of the result, and field evidence can disagree.** One harness change can move a score: removing SWE-agent's edit linter dropped the same model from 18.0% to 15.0% on SWE-bench Lite (Yang et al., [“SWE-agent”](https://arxiv.org/abs/2405.15793) (2024)), so scaffold, budget, attempts and timeouts belong next to every number. METR's randomized trial with 16 experienced open-source developers found that AI tools increased task completion time by 19% on mature projects they had worked on for five years on average, although the developers believed they had been faster (Becker et al., [“Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity”](https://arxiv.org/abs/2507.09089) (2025)); SWE-bench's own recipe, merged pull requests whose tests flip from fail to pass, works on your repository too ([Jimenez et al., 2023](https://arxiv.org/abs/2310.06770)).

## Planned visuals

- `stepper`: grading one SWE-bench instance: check out the base commit, apply the model patch, apply the test patch, run FAIL_TO_PASS and PASS_TO_PASS in the instance container, and mark it resolved or not.
- `compare`: one model reported under two harness setups (scaffold, attempts, step budget, timeout), labeled illustrative, showing what must travel with a score before two numbers can be compared.
- `timeline`: the SWE-bench family, its refreshed successors and Terminal-Bench from 2023 to 2026, with the release dates and the month OpenAI stopped reporting Verified.

## Talk like an expert

Experts say **resolved rate**, **FAIL_TO_PASS and PASS_TO_PASS**, **gold patch**, **scaffold**, **bash-only**, **contamination** and **pass^k**, and they ask “which split, which harness, how many attempts, what budget?” before comparing two numbers.

## Go deeper

- Jimenez et al., [“SWE-bench: Can Language Models Resolve Real-World GitHub Issues?”](https://arxiv.org/abs/2310.06770) (2023).
- The [SWE-bench evaluation guide](https://www.swebench.com/SWE-bench/guides/evaluation/), for running the harness yourself.
- Deng et al., [“SWE-Bench Pro: Can AI Agents Solve Long-Horizon Software Engineering Tasks?”](https://arxiv.org/abs/2509.16941) (2025).
- Merrill et al., [“Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Command Line Interfaces”](https://arxiv.org/abs/2601.11868) (2026).

## Related

- [Coding agents](#coding-agents)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Evaluation harnesses](#eval-harnesses)
- [Evaluating agents](#evaluating-agents)
- [Benchmark literacy](#benchmark-literacy)
- [Harness engineering](#harness-engineering)
