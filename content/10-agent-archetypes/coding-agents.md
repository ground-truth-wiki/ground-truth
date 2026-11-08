---
id: coding-agents
book: 10
order: "10.1"
title: Coding agents
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [coding-agents, edit-formats, swe-bench]
visuals:
  - bugfix-trajectory:stepper
  - coding-task-fit:tree
---
> [!tldr]
> Coding agents read a repository, plan, edit files, run tests and iterate until the change works, then hand it over for review or open a pull request. They work best on well-specified tasks with good tests, in repositories with clear instructions, and their output needs the same review as any colleague’s.

## Why it matters
Software engineering is the domain where agents first became economically significant, because code is text, tests give honest feedback, and developers can review the results. Coding agents now handle bug fixes, small features, migrations and code review; knowing what they do well and where they fail is part of every engineer’s job.

## Intuition
A coding agent is a fast new team member with perfect recall of the docs and no memory of your codebase. Give them a clear ticket, a way to check their work and someone to review it, and they are very productive. Give them a vague idea and no tests, and they will confidently build the wrong thing.

```viz
{"id":"bugfix-trajectory","component":"stepper","title":"A bug fix in six steps: find, reproduce, fix, verify, review, hand over","caption":"An illustrative trajectory with the tool calls a coding agent typically makes. The failing test written in step 2 is what makes step 4 trustworthy.","alt":"Stepper through a coding agent fixing a bug: searching the code, writing a failing test, editing, running tests, reviewing the diff and opening a pull request.","data":"illustrative","frames":[
{"label":"Explore","caption":"Search for where dates are parsed and read the relevant files.","code":"$ rg -n 'parse_date' src tests\nsrc/dates.py:41  def parse_date(s):\ntests/test_dates.py:12  def test_parse_basic():"},
{"label":"Reproduce","caption":"Write a failing test that captures the reported bug before changing anything.","code":"def test_iso_with_offset():\n    assert parse_date('2026-11-03T10:00+01:00').hour == 10\n\n$ pytest tests/test_dates.py -q\n1 failed, 12 passed"},
{"label":"Fix","caption":"Make the smallest change that fixes the cause.","code":"-    return datetime.strptime(s, '%d/%m/%y')\n+    return datetime.fromisoformat(s)"},
{"label":"Verify","caption":"Run the new test and the whole suite, plus the linter.","code":"$ pytest -q\n142 passed\n$ ruff check src\nAll checks passed!"},
{"label":"Self-review","caption":"Read the diff for scope, edge cases and unintended changes; check the date formats other callers rely on."},
{"label":"Hand over","caption":"Open a pull request with the spec, the test, the change and what was not checked, for a human to review."}]}
```

## How it works
**The loop.** Explore the codebase (search, read, map symbols), plan, edit, run tests and tools, read the results, and repeat. See [the agent loop](#agent-loop) and [harness anatomy](#harness-anatomy).

**Context.** Repository instruction files (`AGENTS.md`, `CLAUDE.md`), code search, repository maps and the test suite are the agent’s knowledge of your project. See [code retrieval](#structured-code-retrieval).

**Verification.** Tests, type checkers, linters and builds are the feedback signal. Agents with good tests converge on correct code; without them they stop at plausible code.

**Surfaces.** Terminal, editor and cloud agents; review agents that comment on pull requests; CI agents that fix failing builds. See [the coding-harness landscape](#coding-harness-landscape).

**Evidence on productivity.** Benchmarks such as SWE-bench Verified, SWE-bench Pro and Terminal-Bench show rapid capability gains on well-defined tasks. Field evidence is more mixed: METR’s 2025 randomized study found experienced open-source developers took longer on their own repositories when using AI tools, despite believing they were faster. Measure on your own work.

**Review.** AI-written code needs review for correctness, security, scope and maintainability. See [working with coding agents](#working-with-coding-agents).

## In practice
```viz
{"id":"coding-task-fit","component":"tree","title":"Coding agents shine on tasks with clear specs and real tests","caption":"Expand by task type. The more of the left-hand conditions a task meets, the more you can delegate.","alt":"Decision tree of coding tasks by fit for coding agents.","data":"illustrative","open":1,"root":{"label":"How well does this task suit an agent?","children":[
{"label":"Strong fit","children":[{"label":"Bug fixes with a reproducible test; small features with a clear spec; test writing; mechanical migrations; dependency upgrades; code review comments"}]},
{"label":"Good with supervision","children":[{"label":"Refactors across many files; new modules in familiar patterns; performance work with benchmarks","link":"#working-with-coding-agents"}]},
{"label":"Weak fit","children":[{"label":"Architecture decisions; ambiguous product requirements; code with no tests; security-critical changes without expert review","link":"#secure-agent-design"}]}]}}
```

Team practices:
- Maintain one instruction file with build, test and style conventions.
- Invest in fast, reliable tests: they are the agent’s eyes.
- Run agents in sandboxes or worktrees with scoped credentials. See [sandboxes](#sandboxes).
- Keep changes small and reviewable; require the same review as human code.
- Track outcomes: review time, defect rates and rework, not lines generated.

## Numbers to know
> [!number]
> Rules of thumb. Agent success rises sharply with test coverage and spec clarity. Measure productivity on your own tasks; benchmark gains and field studies have diverged.

## Pitfalls and anti-patterns
> [!pitfall] Delegating tasks with no way to verify
> Without tests or a clear check, an agent’s “done” means “plausible”.

- **Unreviewed merges.** Security issues and design debt accumulate.
- **Agents with production credentials.** Use sandboxes and scoped tokens.
- **Measuring lines of code.** Volume is not value.

## Talk like an expert
The vocabulary: **trajectory**, **repository map**, **instruction file**, **failing test first**, **worktree**, **pull-request agent**, **SWE-bench Verified**, **review burden**. Experts judge coding agents by merged, maintained changes and review effort. The live debate is how software teams reorganize as agents write more code: whether review, specification and testing become the core of the job.

> [!hottake] The bottleneck in AI-assisted development is now review, not writing.
> **The counterargument:** much generated code is low-risk (tests, scripts, boilerplate) and needs light review; with good tests and reviewer agents, careful human review can be focused where risk is high.

## Check yourself
```quiz
coding-agents
```

## Go deeper
- Jimenez et al., “SWE-bench” (2023), and the SWE-bench Verified and Pro variants.
- METR, “Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity” (2025).

## Related
- [Case study: Claude Code](#claude-code)
- [Working effectively with coding agents](#working-with-coding-agents)
- [The coding-harness landscape](#coding-harness-landscape)
- [Structured data and code retrieval](#structured-code-retrieval)
- [Evaluating agents](#evaluating-agents)
- [Security and vulnerability-research agents](#security-agents)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Training environments for coding agents](#swe-training-environments)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Coding-agent benchmarks: SWE-bench, Terminal-Bench and their harnesses](#coding-agent-benchmarks)
