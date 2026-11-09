---
id: uber-ureview-code-review
book: 21
order: "21.70"
title: "uReview: Uber's in-house AI code reviewer with graded and filtered comments"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-review, coding-agents, llm-as-judge, prompt-chaining, public-record]
visuals: []
type: playbook
account: public-record
industry: "Mobility and delivery (internal developer tooling at Uber)"
use_case: "An AI reviewer that posts comments on code changes during CI, with separate stages that generate, grade, filter and deduplicate comments"
outcome: "Analyzes over 90% of the weekly ~65,000 diffs; engineers who interact with it mark 75% of its comments as useful; on average 65% of comments addressed in the same changeset"
measured_how: "Useful or Not Useful ratings from engineers who interact with the tool, and an automated address check that reruns uReview five times on the final commit; no period or sample size stated (Uber blog, August 2025)"
prerequisites: [prompt-chaining, llm-as-judge]
replications: []
---
> [!tldr]
> Uber built uReview, an AI reviewer in its CI process that chains stages to generate, grade, filter and deduplicate comments. As of August 2025 it "analyzes over 90% of the weekly ~65,000 diffs" at Uber. Engineers who interact with it mark 75% of its comments as useful, and on average 65% are addressed in the same changeset. One lesson: "Precision Is More Valuable than Volume".

> [!note] From the public record
> Built from Uber's own published account, "uReview: Scalable, Trustworthy GenAI for Code Review at Uber" (August 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post describes code review under strain: "Reviewers are overloaded with the increasing volume of code from AI-assisted code development". Uber built uReview, "an AI code review platform designed to augment the code review process".

"The main challenge of AI code review is false positives from two sources". These are "LLM hallucinations that generate incorrect comments" and "issues that are generally valid but not important in that specific scenario". Engineers who see many of them start to tune out and ignore them.

## Why this approach

The post gives three reasons for building in-house. First, "most third-party AI code-review tools require code to be hosted on GitHub", while Uber uses Phabricator. Second, Uber's evaluation of third-party tools found "many false positives, low-value true positives, and being unable to interact with internal systems at Uber." Third, a minor point: at Uber's scale, the AI-related costs of uReview "are an order of magnitude less than what typical third-party tools charge". No cost figures are given.

## The approach

At the core is a system called Commenter, which breaks review into four sub-tasks: "comment generation, filtering, validation, and deduplication". The chain exists because "single-shot prompting wasn’t enough" (see [Prompt patterns and chaining](#prompt-chaining)).

1. **Ingestion.** "It filters out low-signal targets such as configuration files, generated code, and experimental directories." Prompts for the rest include surrounding code context.
2. **Generation.** Pluggable assistants each cover one class of issues: bugs and logic flaws (Standard Assistant), Uber-specific conventions from a shared registry of style rules (Best Practices Assistant) and application-level security vulnerabilities (AppSec Assistant).
3. **Grading and filtering.** A second prompt evaluates each comment's quality and assigns a confidence score (see [LLM-as-judge](#llm-as-judge)). Confidence thresholds for pruning are set "per assistant, per language, and comment category". A semantic similarity filter merges overlapping suggestions, and a category classifier suppresses categories with historically low developer value.
4. **Delivery and feedback.** Comments are posted inline on the code review platform, and developers can rate each one as useful or not useful.
5. **Evaluation.** Automatically, Uber re-runs uReview five times on the final commit: "A comment is considered addressed if none of the re-runs reproduce a semantically similar comment". Manually, a curated benchmark of commits with known issues measures precision, recall and F1 against human-labeled annotations (see [Classification and regression metrics](#classification-metrics)).

## The stack

As of August 2025: Uber's primary code review platform is Phabricator. uReview is deployed across all six of Uber's monorepos (Go, Java, Android, iOS, Typescript, and Python) and reviews every commit as part of the CI process. Feedback and metadata are streamed to Apache Hive via Apache Kafka. The best benchmark setup paired Anthropic Claude-4-Sonnet as comment generator with OpenAI o4-mini-high as review grader. The team uses "the model combination with the highest F1 score", but the post does not name the production models outright.

## Results, and how they were measured

- **Coverage.** "uReview today analyzes over 90% of the weekly ~65,000 diffs (equivalent of pull requests) landed at Uber." It reviews each commit "within a median of 4 minutes".
- **Usefulness.** "Engineers who interact with the tool mark 75% of its comments as useful". The post does not say how many ratings this rests on.
- **Address rate.** "we see on average 65% of comments being addressed in the same changeset." The post compares this with human reviewers: "Internal audits show that only 51% of human-written comments are considered as bugs by the author" and addressed in the same changeset. No sample or period is given for the audit.
- **Time saved.** This is an estimate. The post counts over 10,000 commits a week, excluding configuration files, and assumes a second human reviewer "would require 10 minutes per commit". It concludes: "This translates to approximately 1,500 hours saved weekly, equivalent to nearly 39 developer years annually."
- **Model choice.** Claude-4-Sonnet with o4-mini-high as grader "achieved the highest F1 score across all tested setups", ahead of GPT-4.1, O3, O1, Llama-4 and DeepSeek R1.

The wiki's reading: the 65% and the 51% are not defined the same way. The tool's rate counts a comment as addressed when automated reruns no longer reproduce it; the audit counts human comments the author considered bugs and addressed.

**Not measured:** the post gives no benchmark size, no absolute precision, recall or F1 values, no time window for the 75% and 65% figures, and no effect on bugs reaching production. It also states the diff volume two ways: "the weekly ~65,000 diffs" and, in the section on third-party tools, "(65,000 per month)".

## What failed

- **Single-shot prompting.** "Unfiltered outputs led to hallucinated issues, duplicate suggestions, and inconsistent quality."
- **Low-value comments.** "Readability nits, minor logging tweaks, low-impact performance optimizations, and stylistic issues": these comments "consistently received poor ratings". Correctness bugs, missing error handling and coding best-practice violations scored well.
- **Limited context.** uReview only has access to the code, not to past PRs, feature flag configurations or database schemas, so it cannot correctly assess overall correctness or review the system design.
- **Simple rules.** "For simple or syntactic patterns, linters are accurate, reliable, and cheap". But "best practices that aren't checkable by linters are often a great fit for LLMs".

## What the team would do differently

"Prompt design helped, but system architecture, and post-processing were even more critical." Feedback must be built in, linked to language, comment category and assistant variant. Trust grows with a gradual rollout: "We introduced uReview in phases, one team or assistant at a time". Some IDEs offer code reviews, but the team still wants AI reviews on the code review platform at CI time, because "we have less control over what the developer does locally." See [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents).

Next, the team plans to "expand support for richer context", "cover more review categories like performance and test coverage", and build reviewer-focused tools. It foresees that MCP servers may later reach the missing context.

## Disclosure

None.

## Sources

- Sonal Mahajan, Shauvik Roy Choudhary and Will Bond, Uber, [“uReview: Scalable, Trustworthy GenAI for Code Review at Uber”](https://www.uber.com/at/en/blog/ureview/), Uber blog, 12 August 2025.

## Related

- [About playbooks](#about-playbooks)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [LLM-as-judge done right](#llm-as-judge)
- [Online evaluation](#online-evaluation)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
