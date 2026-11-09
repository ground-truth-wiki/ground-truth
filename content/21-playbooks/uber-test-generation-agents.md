---
id: uber-test-generation-agents
book: 21
order: "21.69"
title: "Uber AutoCover: generating and repairing software tests with a multi-agent pipeline"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, test-generation, multi-agent, coding-agents, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools (internal engineering at Uber)"
use_case: "Generating, validating and repairing software tests for Go, Java, TypeScript and Python code, in the IDE, on demand from the command line, and headless across monorepos"
outcome: "About 11% of all new tests reviewed and added to Uber's codebase; viable-test success rate about 20% for Java, 40% for Go and 80% for Python; about 44% of viable IDE tests explicitly accepted"
measured_how: "Production data for August and September 2025, a benchmark of 9 Go subjects against Cursor and ClaudeCode with a 60-minute timeout, an expert review by two experts and a survey with 29 responses (Rastenis et al., ICSE-SEIP 2026)"
prerequisites: [coding-agents, multi-agent-patterns]
replications: []
---
> [!tldr]
> Uber built AutoCover, five specialized agents on LangGraph that generate, validate and repair software tests in the IDE, from the command line or headless across its monorepos. The paper reports that AutoCover "now generates about 11% of all new tests that are reviewed and added to Uber’s codebase", with a viable-test success rate of about 20% for Java, 40% for Go and 80% for Python.

> [!note] From the public record
> Built from Uber's own published account, "Automated Software Test Generation at Industry Scale Using a Multi-Agent Architecture and Workflow Integration" (April 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

At Uber, "thousands of engineers contribute to large monorepos with millions of lines of code". The team targets at least 85% coverage for new code, "but legacy code often lags". Other challenges: new code benefits from fast, interactive IDE flows, legacy backfill needs unattended generation, flaky or change-detector tests raise maintenance costs, and repositories involve complex build rules and generated artifacts.

## Why this approach

In the summer of 2024 the team evaluated general coding assistants. GitHub Copilot "handled simple cases but could not invoke build steps or obtain generated artifacts (coverage, mocks)". Cursor improved shell and tool invocation, but struggled to persist through multi-step generation and often diverged from required mocking conventions on complex targets. Its "linear generation led to unacceptably long latency on large files with low existing test coverage".

The paper's diagnosis: such tools do not find build labels or run code generation, so tests fail to compile; they miss generated artifacts deeper in the build graph; and they run preparation, build and validation in series. AutoCover splits the work across specialized agents, couples them to the build system and runs stages in parallel. See [Multi-agent orchestration patterns](#multi-agent-patterns).

For daily use, the team chose IDE integration over a CLI watch mode, workstation agents or chat assistants, partly because "chat-based generation required context switching away from code editing".

## The approach

AutoCover is "a modular, agentic pipeline built on LangGraph":

1. **Preparer** uses the source, the build graph and a coverage probe to propose scenarios per function and scaffold the test file.
2. **Generator** fans out per function and proposes tests for uncovered lines or new scenarios.
3. **Executor** materializes generated mocks, runs candidates in parallel in isolated Bazel sandboxes, and splices accepted tests in with AST-aware edits.
4. **Validator** is the quality gate: a test is "viable only if it successfully executes and either raises code coverage or scenario coverage." It also applies an LLM-powered best-practices registry and mutation testing.
5. **Fixer** repairs failing or low-quality tests with targeted, reversible edits and reverts patches that degrade passing tests.

Headless mode opens merge requests for owning teams; CLI runs on demand; IDE mode precomputes tests in the background, 5 minutes after a file save, and shows them as comments the developer can insert or dismiss.

After team dogfooding in June and July 2024, the team "gradually deployed AutoCover to all engineers at Uber between September 2024 and September 2025".

## The stack

As of the paper (April 2026):

- **Orchestration:** LangGraph, with patterns such as ReAct. See [Orchestration frameworks](#orchestration-frameworks).
- **Models:** OpenAI GPT 5 Thinking (Preparer), OpenAI GPT 4.1 (Validator, Fixer context crawler) and Claude 4 Sonnet (Generator, other Fixer work).
- **Build and languages:** Bazel with remote and local caching; Go, Java, TypeScript and Python through adapters.
- **Routing:** Uber's internal LLM routing layer for cost attribution, anonymization and provider and model selection, with fallbacks across model generations and vendors. See [Gateways and routers](#gateways-routers).
- **Caching:** response caching and prompt caching, with prompts split into stable, semi-stable and volatile blocks. See [Prompt caching and token economics](#prompt-caching).
- **IDE:** an extension for VSCode and forks such as Cursor, with remote feature flags and kill switches.

## Results, and how they were measured

- **Share of new tests.** AutoCover "now generates about 11% of all new tests that are reviewed and added to Uber’s codebase". The paper gives no period, baseline or counting method.
- **Production, August and September 2025.** The success rate of generating passing tests that increase code or scenario coverage was "about 20% for Java, 40% for Go, and 80% for Python". "AutoCover’s viable IDE tests are explicitly accepted by users at a rate of about 44%."
- **Benchmark.** 9 subjects from Uber's Go code base, 60-minute timeout, baselines run with the same information provided to AutoCover. AutoCover's median coverage was 93.2% at 10 minutes and 100.0% at 45 minutes. Cursor-0.46.8, the pre-deployment baseline, had a median of 40.8% at 30, 45 and 60 minutes. In the post-deployment runs, the medians at 60 minutes were 98.7% for Cursor-1.7.54, 96.7% for Cursor-2.3 and 100.0% for ClaudeCode-2.0.75.
- **Expert review.** Two experts, neither an author, rated tests from AutoCover and Cursor-0.46.8: "the expert reviewers favored AutoCover, which generated no broken tests and more tests that are acceptable as-is."
- **Survey.** 29 responses, 23 from active and 6 from inactive users. Comparing active with inactive users: "83% (vs. 40%) agree that AI-assisted test generation improves productivity". The answers cover AI-assisted test generation broadly, not AutoCover alone.

**Not measured:** the paper reports no developer time saved, no cost in money and no defects caught by the generated tests. Monthly volumes appear only as orders of magnitude, and coverage signals from 2024 and 2025 are not comparable.

## What failed

- **General assistants.** Copilot could not iterate autonomously, and Cursor's outputs on complex targets were unacceptable without significant manual intervention.
- **Java.** The viable-test success rate was about 20%; the paper does not explain the difference between languages.
- **Anonymization.** Generic PII scrubbers "misclassify code identifiers (e.g., User) as personal information, corrupting syntax and imports." The team tuned the gateway's anonymizer to tell code identifiers from actual PII.
- **IDE rollout.** A line-change count trigger "proved unreliable", the shared workspace needed refactoring, and getting a merged change onto developer machines could take time "in the order of days to a week".
- **Requested improvements.** Free-text survey themes were style (6), bloat (4), speed (4), guidelines (4), coverage integration (3) and interactivity (1). Inactive users rated usability, test quality and speed substantially lower, "with none rating test quality as good or excellent."
- **Study limits.** Multiple improvements landed during the study window. Deployment results may be affected by target selection bias, since developers may have targeted hard-to-test legacy code with CLI or Headless runs.

## What the team would do differently

The paper does not say what it would do differently. Its lessons: releasing the CLI first drew users with an operational need and early feedback; IDE integration is "a delicate balancing act": adoption needs low friction, but "unconstrained background execution results in unpredictable and unsustainable costs"; and coverage is "a necessary but insufficient signal".

The wiki's reading: all three reasons the paper gives for general assistants faltering concern the build loop, not the model. When choosing a test generator, test build integration and acceptance gates too. See [Inside coding agents](#coding-agent-internals).

## Disclosure

None.

## Sources

- Matas Rastenis, Ben Chou and Shauvik Roy Choudhary (Uber Technologies Inc) and René Just (University of Washington, work done at Uber), Uber, [“Automated Software Test Generation at Industry Scale Using a Multi-Agent Architecture and Workflow Integration”](https://homes.cs.washington.edu/~rjust/publ/auto_cover_icse_2026.pdf), 2026 IEEE/ACM 48th International Conference on Software Engineering (ICSE-SEIP ’26), Rio de Janeiro, 12 to 18 April 2026, doi:10.1145/3786583.3786918.

## Related

- [About playbooks](#about-playbooks)
- [Coding agents](#coding-agents)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Multi-agent orchestration patterns](#multi-agent-patterns)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
