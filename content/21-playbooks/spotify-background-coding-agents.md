---
id: spotify-background-coding-agents
book: 21
order: "21.79"
title: Verification loops and an LLM judge for Spotify's background coding agent
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [coding-agents, code-migration, llm-as-judge, developer-productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "Audio streaming (Spotify's internal software maintenance and data platform)"
use_case: "A background coding agent (Honk) that makes code changes across thousands of software components and opens pull requests, guarded by verifiers and an LLM judge, and applied to migrating data pipelines off deprecated datasets"
outcome: "Out of thousands of agent sessions, the LLM judge vetoes about a quarter, and after a veto the agent course corrects half the time; a dataset migration rolled out 240 automated migration PRs, against an estimated 10 engineering weeks of manual effort"
measured_how: "Internal metrics over thousands of agent sessions, with no exact count or period and no evals of the judge (Spotify Engineering, December 2025); a count of PRs rolled out and an estimate of the manual effort, with no merge or test results (Spotify Engineering, April 2026)"
prerequisites: [coding-agents, llm-as-judge]
replications: []
---
> [!tldr]
> Spotify runs a background coding agent, internal codename "Honk", that makes code changes across thousands of software components and opens pull requests. Deterministic verifiers and an LLM judge guard it, and "out of thousands of agent sessions, the judge vetoes about a quarter of them". A later dataset migration rolled out 240 automated migration PRs, which the owning teams had to test by hand.

> [!note] From the public record
> Built from Spotify's own published accounts, "Background Coding Agents: Predictable Results Through Strong Feedback Loops (Honk, Part 3)" (December 2025) and "Background Coding Agents: Supercharging Downstream Consumer Dataset Migrations (Honk, Part 4)" (April 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Spotify's Fleet Management system uses Honk to rewrite software automatically. The December 2025 post names three failure modes: no PR, a PR that fails CI, and a PR that passes CI but is functionally incorrect. Of the third: "This is the most serious error, as it erodes trust in our automation." Causes it names for the second and third include little or no test coverage, an agent that changes things outside the scope of the prompt, and an agent that cannot figure out how to run the builds and tests.

The April 2026 post applies Honk to data. Two of the most heavily used user datasets were deprecated, and their ~1,800 direct downstream data pipelines had to move in six months, across BigQuery Runner, dbt and Scio. The team estimated the manual work at around 10 engineering weeks.

## Why this approach

The December post's answer is to "design for predictability from the ground up" with verification loops. The judge was added because some agents were "trying to solve problems that weren’t strictly in their prompt, like refactoring code or disabling flaky tests." The agent is narrow on purpose: the team believes "the reduced flexibility of the agent makes it more predictable". Neither post describes other options that were considered. See [LLM-as-judge done right](#llm-as-judge).

## The approach

1. **Verifiers.** Verifiers activate from a component's contents, such as a Maven verifier when a pom.xml file sits in the root. An MCP tool exposes them, and the agent is unaware of the underlying verifier. Many use regular expressions to return only the most relevant error messages on failure, or a very short success message, which keeps noise out of the context window. They invoke formatting, building and testing.
2. **A gate before the PR.** A Claude Code stop hook runs all relevant verifiers before a PR is opened (see [Permissions, approvals and hooks in coding harnesses](#harness-permissions-hooks)). If one fails, no PR is opened and the user sees an error message.
3. **The judge.** After the other verifiers, it sends the diff and the original prompt to an LLM for evaluation.
4. **A narrow agent.** It sees the codebase, edits files and runs verifiers, in a container with limited permissions (see [OS-level sandboxing for agents](#os-level-sandboxing)). Pushing code, Slack and prompt writing sit in surrounding infrastructure.

For the migration, Backstage lineage pages and Codesearch found the target repositories, and the Fleetshift plugin orchestrated the changes. By design, Honk then had no access to Claude skills or custom configuration when it ran, so the prompt had to be comprehensive. A first context file, re-purposed by Claude from a guide for human engineers, fell short, so the team put all field mappings in tables. Where a judgement call was needed, Honk was asked to leave the field unchanged and add a comment linking to human migration guides. See [Context engineering](#context-engineering).

## The stack

As of December 2025 and April 2026: Claude Code as the agent (no model named); verifiers such as Maven behind an MCP tool, on Linux x86; an unnamed LLM as judge; a container sandbox; Fleet Management, Backstage with its Codesearch and Fleetshift plugins, GitHub Enterprise and Slack; BigQuery Runner, dbt and Scio pipelines.

## Results, and how they were measured

- **The judge.** From internal metrics, "out of thousands of agent sessions, the judge vetoes about a quarter of them." After a veto, "the agent is able to course correct half the time." The most common trigger "is the agent going outside the instructions outlined in the prompt." No exact count, period or definition of a correction is given, and "We have yet to invest in evals for our judge."
- **The migration.** With the mapping tables, the team saw "solid performance across the majority of target repositories", without counts. "That said, we successfully rolled out 240 automated migration PRs using Fleetshift." The post credits the project with "saving an estimated 10 engineering weeks". The basis it gives is an estimate of manual work: "We estimated that it would have taken around 10 engineering weeks of effort to complete these migrations manually."

**Not measured:** neither post reports merge, revert or CI pass rates, or the judge's accuracy. The April post does not say how many of the ~1,800 pipelines were migrated, how the 240 PRs relate to them, how many were merged, or how much time the automated route took.

## What failed

- **Unguarded agents.** Without the feedback loops, "the agents often produce code that simply doesn't work".
- **Platform reach.** "Our current verifiers only run on Linux x86". iOS applications need macOS hosts, and some backend systems rely on ARM64.
- **Thin context.** The first context file was "not comprehensive enough", and Honk's assumptions about field mappings were "often incorrect".
- **Scio.** A comprehensive Scio prompt "got very unwieldy without having access to outside Claude skills", so Scio was dropped at that time.
- **No tests.** The BigQuery Runner and dbt repositories "rarely used any build-time unit testing", so Honk could not verify its work and owning teams tested the PRs by hand.

## What the team would do differently

The December post plans verifiers for more hardware and operating systems, acting on CI checks in GitHub pull requests as an "outer loop", and structured evals (see [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)). The April post says success depends on "the strategic push to consolidate and standardise our data landscape", and "we must enforce requirements for testing and validation across repositories". The Honk team is working on a feature that lets the agent gather its own context first, for example from JIRA tickets or documentation.

The wiki's reading: the verification loop is only as strong as the builds and tests it calls, and without unit tests the check fell back to human review. Without evals, a veto rate of about a quarter shows how often the judge objects, not how often it is right. See [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation).

## Disclosure

None.

## Sources

- Max Charas (Senior Staff Engineer) and Marc Bruggmann (Principal Engineer), Spotify, [“Background Coding Agents: Predictable Results Through Strong Feedback Loops (Honk, Part 3)”](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3), Spotify Engineering blog, 9 December 2025.
- Devon Edwards Joseph (Senior Engineer), Spotify, [“Background Coding Agents: Supercharging Downstream Consumer Dataset Migrations (Honk, Part 4)”](https://engineering.atspotify.com/2026/4/background-coding-agents-dataset-migrations-honk-part-4), Spotify Engineering blog, 22 April 2026.

## Related

- [About playbooks](#about-playbooks)
- [Coding agents](#coding-agents)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [LLM-as-judge done right](#llm-as-judge)
- [Anatomy of an agent harness](#harness-anatomy)
