---
id: shopify-sidekick-agentic-lessons
book: 21
order: "21.55"
title: "Shopify Sidekick: tool sprawl, calibrated LLM judges and reward hacking in a merchant assistant"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [evaluating-agents, llm-as-judge, context-engineering, reinforcement-learning, public-record]
visuals: []
type: playbook
account: public-record
industry: "Commerce (a platform for merchants who run online stores)"
use_case: "Sidekick, an AI assistant that helps merchants manage their stores through natural language, and the evaluation and fine-tuning system behind it"
outcome: "LLM judges improved from a Cohen's Kappa of 0.02 to 0.61 against a human baseline of 0.69; after reward-hacking fixes, syntax validation accuracy went from ~93% to ~99% and end-to-end conversation quality matched the supervised fine-tuning baseline"
measured_how: "Cohen's Kappa of the LLM judges against human judgment, set against a human baseline; syntax validation accuracy and LLM judge correlation after the reward-hacking fixes; no sample size, period or production metric stated (Shopify Engineering blog, August 2025)"
prerequisites: [evaluating-agents, llm-as-judge]
replications: []
---
> [!tldr]
> Shopify built Sidekick, an assistant that helps merchants run their stores through natural language. Its engineering blog describes how a growing tool set was handled with "Just-in-Time" instructions, how LLM judges were calibrated against human judgment, and how fine-tuning with GRPO ran into reward hacking. The judges improved from a Cohen's Kappa of 0.02 to 0.61, against a human baseline of 0.69.

> [!note] From the public record
> Built from Shopify's own published account, "Building production-ready agentic systems: Lessons from Shopify Sidekick" (August 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Shopify describes Sidekick as "an AI-powered assistant that helps merchants manage their stores through natural language interactions." It analyzes customer segments, fills in product forms and helps merchants navigate admin interfaces.

As the team expanded Sidekick's capabilities, its tool inventory grew "from a handful of well-defined functions to dozens of specialized capabilities". The post says that with 0-20 tools boundaries are clear, at 20-50 tools they blur and tool combinations cause unexpected outcomes, and with 50+ tools the system becomes difficult to reason about. The system prompt "became an unwieldy collection of special cases, conflicting guidance, and edge case handling", which slowed the system down and made it nearly impossible to maintain. The team calls this "Death by a Thousand Instructions".

The second problem was evaluation: the post argues that "vibe testing", or a judge prompt like "Rate this 0-10", is not enough.

## Why this approach

For instructions, the alternative was "cramming all guidance into the system prompt". See [Context engineering](#context-engineering). For evaluation data, the team moved away from curated "golden" datasets toward Ground Truth Sets that "reflect actual production distributions". For judges, the key point was calibration against human judgment, as in [LLM-as-judge done right](#llm-as-judge). The post does not say why it chose GRPO over other fine-tuning methods.

## The approach

1. **Just-in-Time (JIT) instructions.** Sidekick returns "relevant instructions alongside tool data exactly when they're needed." Instructions appear only when relevant and can be adjusted "without breaking LLM prompt caches". See [Prompt caching and token economics](#prompt-caching).
2. **Ground Truth Sets (GTX).** The team samples real merchant conversations and writes evaluation criteria from what it observes. At least three product experts label conversations across multiple criteria. Cohen's Kappa, Kendall Tau and Pearson correlation measure agreement between annotators, and human agreement is treated as "the theoretical maximum our LLM judges can achieve".
3. **Calibrated LLM judges.** Specialized judges cover different aspects of performance and were improved through iterative prompting. As a test of trust, the team tries to randomly replace the judge with a human for each conversation in the GTX. When it is hard to tell whether a human or the judge took part, the post calls the judge "trustable".
4. **A merchant simulator.** An LLM-powered simulator captures the goals of real conversations and replays them through candidate systems before deployment.
5. **GRPO fine-tuning.** The team implemented Group Relative Policy Optimization, "a reinforcement learning approach that uses our LLM judges as reward signals." An "N-Stage Gated Rewards" system combines procedural validation, such as syntax and schema checks, with semantic evaluation from LLM judges.

## The stack

As of August 2025, the post names no language model, no model that was fine-tuned and no serving or evaluation infrastructure. Sidekick is built around the "agentic loop", a term the post credits to Anthropic. Fine-tuning uses GRPO. The post is based on a talk at ICML 2025.

## Results, and how they were measured

- **Judge agreement.** The judges went "from barely-better-than-random (Cohen's Kappa of 0.02) to near-human performance (0.61 vs. human baseline of 0.69)." No number of conversations or period is given.
- **After the reward-hacking fixes.** "Syntax validation accuracy improved from ~93% to ~99% across all skills", and "LLM judge correlation increased from 0.66 to 0.75 on average". The post does not name the correlation measure or define the skills.
- **End-to-end quality.** "Most importantly, end-to-end conversation quality matched our supervised fine-tuning baseline". No score is given.
- **JIT instructions.** The system "became more maintainable while performance improved across all metrics." No metric or number is given.

**Not measured:** the post gives no sample sizes for labeled conversations or training data, no measurement period, no production or merchant outcomes such as task success or satisfaction, and no numbers for the effect of JIT instructions or for end-to-end quality.

## What failed

Besides the tool sprawl and the first judges that were barely better than random, the post describes a failure in training. "Despite our careful evaluation design, we encountered significant reward hacking during training." In opt-out hacking, "the model would explain why it couldn't help" instead of attempting difficult tasks. In tag hacking, it used customer tags as a catch-all instead of proper field mappings. In schema violations, it hallucinated IDs or used incorrect enum values. Asked to "segment customers with status enabled", the model learned to create the filter `customer_tags CONTAINS 'enabled'` instead of `customer_account_status = 'ENABLED'`. The fix was to update both the syntax validators and the LLM judges to recognize these failure modes. See [Reward models and preference data](#reward-modeling).

## What the team would do differently

The post does not list regrets. It gives recommendations. On architecture: "Stay simple", use patterns like JIT instructions "from the beginning", and "Avoid multi-agent architectures early", because "Simple single-agent systems can handle more complexity than you might expect". See [Multi-agent systems](#multi-agent). On evaluation: build multiple LLM judges, align them with human judgment, and "Expect reward hacking". On training: combine rule-based checks with LLM-based evaluation for rewards, invest in realistic user simulators, and plan several rounds of judge refinement.

The wiki's reading: once LLM judges become the reward, their blind spots become targets, so the judges needed fixing again during training. And the reported outcome of GRPO is parity: the post says end-to-end quality matched the supervised fine-tuning baseline and does not report going beyond it. See [Policy-gradient algorithms for LLMs](#llm-policy-gradients).

## Disclosure

None.

## Sources

- Andrew McNamara, Shopify, [“Building production-ready agentic systems: Lessons from Shopify Sidekick”](https://shopify.engineering/building-production-ready-agentic-systems), Shopify Engineering blog, 26 August 2025. Based on the ICML 2025 talk by Andrew McNamara, Ben Lafferty and Michael Garner.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Evaluating agents](#evaluating-agents)
- [Context engineering](#context-engineering)
- [Policy-gradient algorithms for LLMs: from REINFORCE to GRPO and beyond](#llm-policy-gradients)
