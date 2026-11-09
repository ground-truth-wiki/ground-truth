---
id: uber-fixrleak
book: 21
order: "21.65"
title: "Uber FixrLeak: repairing Java resource leaks with AST checks and an LLM"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-repair, static-analysis, java, developer-tools, public-record]
visuals: []
type: playbook
account: public-record
industry: "Mobility and delivery (internal developer tooling at Uber)"
use_case: "Repairing the Java resource leaks that SonarQube flags, by having an LLM rewrite each safe-to-fix function and opening a pull request for developer review"
outcome: "Automated fixes for 93 of the 102 eligible leaks, out of 124 resource leaks identified by SonarQube"
measured_how: "One application to 124 SonarQube-flagged leaks in Uber's Java codebase (12 in deprecated code excluded, 112 analyzed, 102 eligible); no period, baseline, merge count or definition of a successful fix stated (Uber blog, May 2025)"
prerequisites: [coding-agent-internals]
replications: []
---
> [!tldr]
> Uber built FixrLeak to repair the Java resource leaks that SonarQube reports. An abstract syntax tree (AST) check decides which leaking functions are safe to fix, an LLM rewrites those functions, and FixrLeak checks the build and runs the existing tests before it submits a pull request. Of 124 flagged leaks, 102 were eligible, and "FixrLeak successfully automated fixes for 93 leaks."

> [!note] From the public record
> Built from Uber's own published account, "Fixrleak: Fixing Java Resource Leaks with GenAI" (May 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Resource leaks occur, in the post's words, "when a program fails to properly release resources such as files, database connections, or streams after use." They "can lead to serious issues, including performance degradation, application failures" and resource exhaustion. Tools like SonarQube find such leaks, but "the fixing process remains manual, time-consuming, and prone to errors."

The post says developers historically relied on try/catch/finally blocks, "but missing or incorrect finally blocks often led to leaks." It adds that "Modern Java best practices recommend the try-with-resources statement", which "ensures resources are released safely, even if exceptions occur during execution."

## Why this approach

The post describes two earlier tools. RLFixer, "a non-GenAI tool, relied on pre-designed templates and analysis frameworks like WALA." Such tools "struggled to scale in massive codebases like Uber’s" and needed extensive manual setup for each new programming idiom. InferFix used large language models, but the post reports "only 70% fix accuracy", trouble with complex leaks, and proprietary models "that couldn’t easily adapt to evolving technologies." The post does not say how or on which leaks the InferFix figure was measured.

FixrLeak narrows its scope on purpose: "It focuses on easily fixable leaks to achieve higher accuracy".

## The approach

As the post describes it:

1. **Input.** FixrLeak starts from the leaks SonarQube reports. It tracks each leak with "a deterministic hash based on the file and function name", so leaks stay tracked as the code changes.
2. **Extract the function.** The Tree-sitter library parses the code and extracts the function that holds the leak.
3. **Decide whether a fix is safe.** An AST analysis, also with Tree-sitter, skips any function where the resource is passed in as a parameter, returned, or stored in a field, "as these resources often outlive the function’s scope." The post's example is a BufferedReader returned from a method: closing it too early "could break the code at its caller site."
4. **Generate the fix.** For a leak that passes these checks, FixrLeak "crafts a tailored prompt" for a generative AI model and replaces the original function with the version the model returns. The aim is "idiomatic fixes while following Java best practices like try-with-resources." The post does not publish the prompt.
5. **Verify.** Before it submits a pull request, FixrLeak verifies that the target binary builds, "runs all existing tests to confirm nothing is broken," and "can also recheck the code with SonarQube to confirm the resource leak has been resolved."
6. **Review.** Developers review the pull request. "Usually, all they need to do is one-click accept."

"Fixrleak continues to run periodically on the Java codebase" and generates fixes for leaks introduced in the future. For verification gates and bot pull requests in general, see [Inside coding agents](#coding-agent-internals) and [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents).

## The stack

As of May 2025, the post names:

- **SonarQube** (written "SonarSource SonarQube™") to detect leaks and, optionally, to recheck a fix.
- **Tree-sitter** to parse Java code and run the AST analysis.
- **"a generative AI model like OpenAI® ChatGPT-4O"** to generate the fix, named as an example. Other models and settings are not stated.

The build system, test runner and code review tool are not named.

## Results, and how they were measured

The post reports one application of the tool:

- **Sample.** "To test FixrLeak, we applied it to 124 resource leaks identified by SonarQube in Uber’s Java codebase."
- **Filtering.** "After excluding 12 cases in deprecated code, FixrLeak’s AST-level analysis processed the remaining 112 leaks," so that fixes were applied only where resources were confined to the scope of the function. The post then reports 102 eligible cases, without explaining how 112 became 102.
- **Fixes.** "Out of the 102 eligible cases, FixrLeak successfully automated fixes for 93 leaks."

The post gives no baseline on the same leaks, no period, and no definition of a successful fix (passing the build and tests, the SonarQube recheck, or developer review).

**Not measured:** the post does not report how many fix pull requests developers merged, review time, developer time saved, why the eligible leaks without a fix were not fixed, or whether any fix caused problems later.

## What failed

The post reports limits, not incidents:

- **Blind fixes can cause new bugs.** "blindly applying fixes can lead to new issues, like use-after-close errors." This is the reason for the AST filter.
- **The scope stops at the function.** "We currently focus on fixing leaks where the lifetime of the resource doesn’t exceed the function that allocated the resource." More complex cases are left "for advanced analysis at the caller level."
- **Detection depends on SonarQube.** A next step is to find leaks with generative AI, partly to cover Golang, "which doesn’t currently have a resource leak detection tool."

## What the team would do differently

The post does not say what the team would change. It lists three key takeaways:

- "Prioritize structured code analysis: AST-based techniques help ensure fixes are safe and context-aware."
- "Automate targeted fixes: Focus on well-scoped, high-confidence fixes first to maximize success rates."
- "Integrate AI responsibly: Validate AI-generated code with rigorous testing and code review processes."

Its next steps include "Enhancing the tool to handle resource leaks that span multiple functions or methods."

The wiki's reading: FixrLeak is a narrow pipeline, not an open-ended coding agent. A deterministic AST check, not the model, chooses which code to touch, and the build, the tests and an optional SonarQube recheck run before a change reaches a reviewer. The published numbers count automated fixes, not merged fixes that stayed correct, so a team copying the pattern should also track merges and reverts, with a person approving each change (see [Human in the loop](#human-in-the-loop)).

## Disclosure

None.

## Sources

- Manu Sridharan, Chris Zhang and Akshay Utture, Uber, [“Fixrleak: Fixing Java Resource Leaks with GenAI”](https://www.uber.com/blog/fixrleak-fixing-java-resource-leaks-with-genai), Uber Blog, 1 May 2025.

## Related

- [About playbooks](#about-playbooks)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Coding agents](#coding-agents)
- [Human in the loop](#human-in-the-loop)
