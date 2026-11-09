---
id: github-copilot-completions-model
book: 21
order: "21.11"
title: "GitHub Copilot: training and evaluating a custom code-completion model"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, code-completion, mid-training, online-experiments, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools"
use_case: "A custom model for code completion in GitHub Copilot, trained with mid-training, supervised fine-tuning and reinforcement learning and checked with offline, pre-production and A/B evaluation"
outcome: "20% more accepted and retained characters, 12% higher acceptance rate, 3x higher token-per-second throughput and a 35% reduction in latency"
measured_how: "Headline figures stated without a named baseline, sample or period; the post's production A/B tests track accepted-and-retained characters, acceptance rates and latency among other metrics (The GitHub Blog, October 2025)"
prerequisites: [mid-training, online-experiments]
replications: []
---
> [!tldr]
> GitHub trained a custom model for code completion in GitHub Copilot through mid-training, supervised fine-tuning and reinforcement learning, and checked it with offline benchmarks, an LLM judge, dogfooding and A/B tests. The post reports "20% more accepted and retained characters, 12% higher acceptance rate", plus higher throughput and lower latency, but names no baseline, sample or test period. One of its lessons: a heavy focus on acceptance rates could favor many simple, short suggestions.

> [!note] From the public record
> Built from GitHub's own published account, "The road to better completions: Building a faster, smarter GitHub Copilot with a new custom model" (October 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post calls code completion "the most widely used GitHub Copilot feature". The problem it names is the target the original product was optimized for. "The original Copilot was optimized for the highest acceptance rate possible." But "a heavy focus on acceptance rates could lead to incorrectly favoring a high volume of simple and short suggestions." Developers said this did not reflect their needs, so the team "pivoted to also optimize for accepted and retained characters, code flow, and other metrics." The post explains that more accepted-and-retained characters means more of each suggestion staying in the final code, "not just ending up temporarily accepted and deleted later."

## Why this approach

The post explains two choices. First, it says newer general-purpose chat models "perform well in natural language to generate code" but "underperform on fill-in-the-middle (FIM) code completion". In practice they insert at the wrong place, duplicate the code before the cursor and overwrite the code after it. The team trained models specialized in completions through synthetic fine-tuning.

Second, the post says execution-based evaluation has downsides: it "only tells if the code will compile, but the results are not always aligned with developer preferences." So the team also runs an independent LLM to score completions.

The post does not name the base model or describe other options it weighed.

## The approach

Training ran in three stages:

1. **Mid-training.** The team built a code-specific foundational model on a curated, de-duplicated corpus of public and internal code "with nearly 10M repositories and 600-plus programming languages." The aim was a model that uses new language syntax and recent API versions. The post says the team then uses supervised fine-tuning and reinforcement learning while mixing in objectives beyond next-token prediction: span infillings and docstring/function pairs. See [Mid-training](#mid-training).
2. **Supervised fine-tuning.** Synthetic fine-tuning trained models specialized in completions "to behave like a great FIM engine". The post says this improves prefix/suffix awareness and formatting fidelity (local indentation, imports and docstrings). See [Supervised fine-tuning](#sft).
3. **Reinforcement learning.** A custom algorithm rewarded and penalized suggestions on three axes: quality (syntax-valid, compilable code in the project's style), relevance (on-task and aware of context) and helpfulness (less manual effort, modern APIs).

Evaluation ran in three layers:

1. **Offline.** An execution-based benchmark on internal and public repositories with strong unit test and scenario coverage simulates real tasks, accepts suggestions and measures build-and-test pass rates. Then "an independent LLM" scores completions for quality, relevance and helpfulness. See [LLM-as-judge done right](#llm-as-judge).
2. **Pre-production.** Internal developers and partners tested models side by side in real workflows, and the preview model was exposed to developers through Copilot's model picker. The team collected structured feedback on readability, trust and "taste", and worked with language experts.
3. **Production.** A/B tests on accepted-and-retained characters, acceptance rates, completion-shown rate, time-to-first token, latency and other metrics. "We ship only when statistically significant improvements hold up under real developer workloads." See [Online controlled experiments for AI features](#online-experiments).

## The stack

As of October 2025, the post names a custom completions model ("Copilot Completions" in its benchmark chart), the mid-training corpus above, synthetic fine-tuning data, a custom reinforcement learning algorithm, an unnamed LLM judge and OpenAI's HumanEval Infilling benchmarks. It says the updates "now power GitHub Copilot across editors and environments." It does not name the base model, model size, training hardware or serving infrastructure.

## Results, and how they were measured

- **Retained characters and acceptance.** "We’re now delivering suggestions with 20% more accepted and retained characters, 12% higher acceptance rate,"
- **Speed.** The same sentence goes on: "3x higher token-per-second throughput, and a 35% reduction in latency."
- **Fill-in-the-middle benchmark.** The post shows "a benchmark comparing our latest completions model to GPT-4.1-mini on OpenAI’s HumanEval Infilling Benchmarks". Its chart gives Copilot Completions 0.98 (single-line), 0.78 (multi-line), 0.84 (random-span) and 0.84 (random-span-light), against 0.3, 0.27, 0.1 and 0.49 for GPT-4.1-mini. The chart does not label the metric, and the image's alt text names GPT-4o-mini instead.

The A/B tests track accepted-and-retained characters, acceptance rates and latency, but the post does not say which evaluation produced the headline figures.

**Not measured:** the post does not state what the headline figures are compared with, and gives no A/B sample size, test period or significance results. It publishes no build-and-test pass rates, LLM-judge scores or dogfooding findings, and no cost figures.

## What failed

- **Reward hacking.** "Early reinforcement learning version over-optimized for longer completions, adding too many comments". The team added comment guardrails that keep completions concise and penalize unnecessary commentary. For how rewards get gamed, see [RL with verifiable rewards and reasoning models](#rlvr-reasoning).
- **Acceptance rate as the target.** The post says a heavy focus on acceptance rates could favor many simple, short suggestions.
- **Partial-token errors.** In its offline evaluation section, the post shows "an example of a partial token completion error: the model produced dataet instead of dataset." It does not say which model made it.

## What the team would do differently

The post states its lessons. The first: "one of our most important lessons was adding related files like C++ header files to our training data." Then three more:

- **Reward carefully,** as the comment problem showed.
- **Metrics matter.** "Being hyper-focused on a metric like acceptance rate can lead to experiences that look good on paper", but not to happy developers. The post calls it critical to monitor multiple metrics with real-world impact.
- **Train for real-world usage.** Align synthetic fine-tuning data with real usage, find problematic patterns and remove them through training.

Next, the team plans domain-specific slices (game engines, financial, ERP) and refined reward functions.

The wiki's reading:

- **Fix the metric before the model.** Accepted-and-retained characters measure what survives in the code, not what was clicked. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Layer the evaluation.** Cheap automated checks come first, human taste second, and a significant A/B result is the gate to ship.
- **Publish the baseline.** Without the comparison model, sample and period, readers cannot check the headline figures from outside.

## Disclosure

None.

## Sources

- Shengyu Fu and John Mogensen, GitHub, [“The road to better completions: Building a faster, smarter GitHub Copilot with a new custom model”](https://github.blog/ai-and-ml/github-copilot/the-road-to-better-completions-building-a-faster-smarter-github-copilot-with-a-new-custom-model/), The GitHub Blog, 23 October 2025.

## Related

- [About playbooks](#about-playbooks)
- [Mid-training](#mid-training)
- [Online controlled experiments for AI features](#online-experiments)
- [LLM-as-judge done right](#llm-as-judge)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
