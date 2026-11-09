---
id: bytedance-bitsai-code-review
book: 21
order: "21.8"
title: "BitsAI-CR: two-stage LLM code review at ByteDance"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-review, fine-tuning, software-engineering, online-evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software development (internal developer tooling)"
use_case: "Generating review comments on merge requests with fine-tuned LLMs, checked by a second filtering model"
outcome: "A peak precision of 75.0% for review comments; an Outdated Rate of 26.7% for Go by week 18; over 12,000 weekly active users"
measured_how: "Daily manual annotation of sampled online comments (sampling generally not over 10%) and a weekly Outdated Rate for Go over 18 weeks, plus a 1397-case offline set (Sun et al., ByteDance, arXiv, January 2025)"
prerequisites: [cloud-and-ci-coding-agents, fine-tuning-practice]
replications: []
---
> [!tldr]
> ByteDance built BitsAI-CR, which reviews merge requests with two fine-tuned LLMs: one finds issues against a taxonomy of 219 review rules, the other decides whether each comment is kept. The paper reports "75.0% precision in review comment generation", an Outdated Rate of 26.7% for Go, and over 12,000 weekly active users.

> [!note] From the public record
> Built from ByteDance's own published account, "BitsAI-CR: Automated Code Review via LLM in Practice" (January 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

ByteDance's internal data showed that "reviewers spend an average of 15 minutes per review for over 50% of cases", and the rest took longer. "Only 30% of reviews receive immediate attention, while over 67% of engineers express a need for more effective tools." The paper names three challenges in current LLM-based review tools: comments that are not technically accurate, comments that are correct but add little value, and no systematic way to improve either.

## Why this approach

The team chose precision over recall. Developers tend to ignore review comments when there are many of them, and "inaccurate comments in the early stages significantly damage user trust". Recall was also hard to measure, because finding every issue takes a large human effort.

A second model checks the first because training alone did not stop wrong comments: conventional supervised fine-tuning methods "prove insufficient for error mitigation", in the paper's words. See [Hallucination and factuality](#hallucination-factuality).

Precision cannot show whether developers act on a comment, and scoring it is manual work. So the team added the Outdated Rate: the share of comments seen by committers within a one-week window where a flagged line was modified in a later commit.

Development was "primarily driven by enterprise security requirements and data privacy considerations", so the team used ByteDance's own model.

## The approach

1. **A taxonomy of review rules.** Review dimensions (code defect, security vulnerability, maintainability and readability, performance issue), then categories, then rules, drawn from internal static analysis rules and manual review comments, "totalling 219 review rules" across Go, JavaScript, TypeScript, Python and Java.
2. **Context preparation.** Each diff is split into hunks, each block is expanded toward complete functions within set size limits, and each line is marked as deleted, added or unchanged.
3. **RuleChecker.** A fine-tuned LLM returns the issue category, the code lines and a comment with a suggested fix. A rule category blocker switches rules off without retraining.
4. **ReviewFilter.** A second fine-tuned LLM decides yes or no on keeping each comment. Of three output patterns tested, the team "finally chose the Conclusion-First pattern": the decision first, then the reasons.
5. **Comment aggregation.** Similar comments in one merge request are grouped by cosine similarity, and one per group is kept.
6. **A data flywheel.** From 120000 internal review comments the team built "approximately 18,000 samples each for Go and front-end languages" and 5,000 for each other language. After launch it annotated sampled online comments daily and tracked each rule's Outdated Rate weekly. Rules were assessed against "an Outdated Rate of around 25% (±5%) with a precision of around 65% (±5%) for 14 days."

## The stack

As of January 2025: Doubao-Pro-32K-0828, "ByteDance’s developed LLM", fine-tuned with LoRA for both models (8192 sequence length, rank 128, alpha 256); see [Parameter-efficient fine-tuning methods](#peft-methods). tree-sitter finds function boundaries. An internal embedding model the paper names "Doubbao-embedding-large" groups comments.

## Results, and how they were measured

- **Online precision, over 18 weeks.** For the first three weeks, before the taxonomy and the two-stage design, "the overall precision remained stagnant at around 25%". Then "The RuleChecker’s precision increased from an initial 27.9% to 62.6%" and "the ReviewFilter’s precision rose from 35.6% to a peak of 75%". For online precision, the paper describes daily manual annotation of sampled online data, "sampling generally does not exceed 10%", compiled weekly. It does not say who annotated or how many comments.
- **Outdated Rate, Go only, over 18 weeks.** It stayed "relatively stable at around 15%" for 10 weeks as rules were added, reached approximately 20% after the rules grew to 73, and, after underperforming rules were removed from week 14, "a peak of 26.7% by week 18". ByteDance's Human Outdated Rate "fluctuates between 35%–46%". The paper notes the metric "doesn’t definitively prove" that changes were made because of the comments.
- **Offline, 1397 cases** from the production codebase, scored by Doubao-Pro-32K-0828 as an LLM judge (see [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)): "57.03% overall precision compared to the base model’s 16.83%", the base model being the system trained without the taxonomy. The paper states the filter's gain with different figures: "from 54.50% to 67.12%" in its text, 57.03% to 65.59% in Table 2, "from 60% to 75%" in its lessons.
- **Users.** A survey (N=137) found "74.5% (102/137) of users affirming the value and effectiveness" of the reviews. The tool reached "over 12k Weekly Active Users (WAU) and 210k Weekly Page Views (WPV)", with second-week retention of 61.64%.

**Not measured:** the paper reports no effect on review time, defects or merge speed, gives no calendar dates for the 18 weeks, reports no online recall, and shows the weekly Outdated Rate trend for Go only.

## What failed

- **Hallucinations.** The paper reports "persistent hallucinations across various code review scenarios", such as asking to remove an underscore from a variable name that had none.
- **Correct but unwanted comments.** A comment flagging the magic number "100" followed Go coding standards, and the user disliked it. In the survey, feedback named incorrect comments (15/137) and correct but unnecessary comments (17/137).
- **Speed.** Of 12 interviewed expert developers, 7/12 gave feedback on latency and 9/12 wanted faster processing.
- **Narrow context.** The rules "currently focus primarily on function-level understanding with limited contextual information".

## What the team would do differently

The paper states lessons rather than regrets: a taxonomy of review rules is "the cornerstone for building effective automated review systems", "a dedicated filter module is a critical component", and "prioritizing precision over recall metrics is crucial". Next, the team plans to cover all programming languages and to build cross-file review.

The wiki's reading: precision and the Outdated Rate answer two questions, whether a comment is right and whether anyone acts on it, and the team used both to decide which rules to keep. See [Online evaluation](#online-evaluation).

## Disclosure

None.

## Sources

- Tao Sun, Jian Xu, Yuanpeng Li, Zhao Yan, Ge Zhang, Lintao Xie, Lu Geng, Zheng Wang, Yueyan Chen, Qin Lin, Wenbo Duan and Kaixin Sui, ByteDance, [“BitsAI-CR: Automated Code Review via LLM in Practice”](https://arxiv.org/abs/2501.15134), arXiv 2501.15134 (cs.SE), version 1, submitted 25 January 2025.

## Related

- [About playbooks](#about-playbooks)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Online evaluation](#online-evaluation)
- [Hallucination and factuality](#hallucination-factuality)
