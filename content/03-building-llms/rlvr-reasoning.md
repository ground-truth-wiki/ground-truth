---
id: rlvr-reasoning
book: 3
order: "3.7"
title: RL with verifiable rewards and reasoning models
level: frontier
stability: moving
reviewed: "2026-11"
status: full
tags: [rlvr, grpo, reasoning]
visuals:
  - grpo-group:stepper
  - length-growth:chart
---
> [!tldr]
> Reinforcement learning with verifiable rewards trains models on problems whose answers can be checked automatically, such as math and code. Methods like GRPO sample a group of attempts per problem and push up the ones that score above the group average. This is how reasoning models learned to think at length, check their work and backtrack.

## Why it matters
RLVR produced the jump from chat models to reasoning models in 2024 and 2025. Understanding it explains why reasoning models excel at math and code, why they write long chains of thought, and why domains without automatic checks are harder to improve the same way.

## Intuition
A student solves each practice problem several ways. The answer key marks which attempts are right. The student does more of whatever the right attempts did, and less of what the wrong ones did, with no teacher writing model solutions.

```viz
{"id":"grpo-group","component":"stepper","title":"GRPO compares a group of attempts with each other instead of training a value model","caption":"An illustrative step on one math problem with four sampled solutions. Advantage = (reward − group mean) ÷ group standard deviation.","alt":"Stepper of a GRPO training step: sampling four solutions, verifying them, computing group-relative advantages and updating the policy.","data":"illustrative","frames":[
{"label":"Sample","caption":"The policy writes four solutions to the same problem."},
{"label":"Verify","caption":"A checker compares each final answer with the reference: two correct, two wrong.","code":"rewards = [1, 0, 1, 0]"},
{"label":"Advantages","caption":"Rewards are normalized within the group: correct attempts get positive advantage, wrong ones negative.","code":"mean = 0.5, std = 0.5\nadvantages = [+1, -1, +1, -1]"},
{"label":"Update","caption":"Tokens in correct solutions become more likely, tokens in wrong ones less likely, with a limit on how far the policy moves per step."},
{"label":"Repeat","caption":"Over many problems, strategies that tend to reach correct answers (checking, backtracking, trying another approach) get reinforced."}]}
```

## How it works
**Verifiable rewards.** Rewards come from programs, not people or learned reward models: exact-match answer checks for math, unit tests for code, format checks, game outcomes. The term RLVR was used in Tülu 3 (Lambert et al., 2024).

**GRPO.** Group Relative Policy Optimization (Shao et al., 2024, DeepSeekMath) drops PPO’s value model and estimates advantages by comparing samples within a group. Variants such as DAPO and Dr. GRPO adjust clipping, normalization and length handling.

**Reasoning emerges.** OpenAI’s o1 (2024) showed large gains from RL-trained reasoning; DeepSeek-R1 (2025) described the recipe openly, and R1-Zero showed that RL alone on a base model produced longer reasoning with self-checking. Response length tends to grow over training as the policy learns to think longer:

```viz
{"id":"length-growth","component":"chart","type":"line","title":"Response length grows as RL training rewards solutions that think longer","caption":"Illustrative curve with the shape reported for RL-trained reasoning models such as DeepSeek-R1-Zero; not their data.","alt":"Illustrative line chart of average response length rising over reinforcement learning training steps.","data":"illustrative","x":{"label":"RL training steps"},"y":{"label":"Average response length","unit":"tokens","min":0},"series":[{"name":"Average response length","points":[[0,900],[2000,1800],[4000,3200],[6000,5000],[8000,7400],[10000,9500]]}]}
```

**Limits.** Rewards must be checkable; fuzzy domains (writing, advice) need judges or rubrics, which bring back reward hacking. Verifiers can be gamed (weak tests, format tricks). And RL mostly sharpens capabilities already latent in the base model; how much genuinely new ability it creates is debated. See [RL environment harnesses](#rl-environment-harnesses).

## In practice
- For teams: reinforcement fine-tuning services and open libraries (TRL, veRL, OpenRLHF) let you apply RLVR to tasks with checkable outputs, such as extraction against labeled data or code against tests. See [fine-tuning in practice](#fine-tuning-practice).
- Build the verifier first and attack it yourself before training.
- Use reasoning models for tasks with clear correctness criteria; check outputs for others. See [reasoning models](#reasoning-models).

## Numbers to know
> [!number]
> Rules of thumb. Group sizes of 4 to 16 samples per problem are common. Reasoning models can produce thousands to tens of thousands of thinking tokens on hard problems.

## Pitfalls and anti-patterns
> [!pitfall] A verifier that checks format, not correctness
> The policy will learn the format. Test your verifier against deliberately wrong answers.

- **Problems that are too easy or too hard.** All-correct or all-wrong groups give no learning signal.

## Talk like an expert
The vocabulary: **RLVR**, **verifier**, **GRPO**, **group-relative advantage**, **policy**, **rollout**, **R1-Zero**, **reasoning trace**, **reward hacking**. Experts ask what the verifier checks and how difficult the training problems were. The live debate is whether RL teaches new reasoning or mostly elicits what pretraining already contained.

> [!hottake] Verifiable rewards are the most important training idea since RLHF.
> **The counterargument:** they work best in narrow, checkable domains, and much valuable work lacks automatic checks; the frontier of training is how to extend RL beyond verifiable tasks.

## Check yourself
```quiz
rlvr-reasoning
```

## Go deeper
- Shao et al., “DeepSeekMath” (2024), introducing GRPO.
- DeepSeek-AI, “DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning” (2025).
- Lambert et al., “Tülu 3: Pushing Frontiers in Open Language Model Post-Training” (2024).

## Related
- [Reasoning models and test-time compute](#reasoning-models)
- [Agentic RL and environments](#agentic-rl)
- [RL environment harnesses](#rl-environment-harnesses)
- [Preference optimization](#preference-optimization)
- [Reinforcement learning primer](#rl-primer)
