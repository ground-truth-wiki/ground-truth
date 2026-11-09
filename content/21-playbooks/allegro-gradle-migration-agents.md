---
id: allegro-gradle-migration-agents
book: 21
order: "21.48"
title: Migrating Android dependency injection from Koin to Hilt at Allegro with an agent skill
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-migration, coding-agents, android, developer-productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "E-commerce (Allegro's Android app)"
use_case: "An AI agent skill that migrates the dependency injection of an Android app from Koin to Hilt, one Gradle module at a time, across nearly 500 modules"
outcome: "In a crossover experiment, developer time was 14h 23m manual and 3h 26m with the agent, 10h 57m (76%) saved; total elapsed time was 14h 23m and 6h 42m, 7h 41m (53%) saved"
measured_how: "Crossover experiment in which developers migrated modules of comparable complexity manually and with an AI coding agent, logging each session with start and end timestamps; number of developers, modules and the period not stated (Allegro Tech Blog, July 2026)"
prerequisites: [coding-agents, skills-plugins]
replications: []
---
> [!tldr]
> Allegro wrote an AI agent skill that moves the Gradle modules of its Android app from the Koin dependency injection framework to Hilt. In a crossover experiment, "The AI agents reduced active developer time by approximately 76%", and total elapsed time fell by roughly 53%. The post does not say how many developers or modules the experiment covered.

> [!note] From the public record
> Built from Allegro's own published account, "How AI Agents Halved the Effort of Migrating 500 Gradle Modules from Koin to Hilt" (July 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In Q3 2024, cold start in the Allegro Android app climbed to 6.0 seconds (p90), and product teams reported a sharp increase in uninstalls. The post says the biggest problem affected older and lower-end devices. After initial optimizations in Q4 2024 (async initialization of core features), in Q1 2025 the uninstallation rate decreased by 25% and cold start time dropped to 4.7 seconds (p90).

After those quick wins, the post names Koin, the Kotlin dependency injection (DI) framework the app was built on, as the main bottleneck. "Its runtime-based approach consumed up to one-third of the cold start time in extreme cases." With nearly 500 Gradle modules, building the dependency graph at runtime "simply did not scale".

## Why this approach

The team evaluated several DI frameworks, which the post does not name, and selected Hilt, which is built on Dagger. Koin registers every module at app startup and then lazily wires the graph together on the device. Hilt generates the graph as plain Kotlin classes at build time, so missing modules or wrong definitions become build errors instead of runtime crashes: "This shifts the cost of finding DI issues from end users to the CI/CD pipeline."

"Manual migration of 500 modules was estimated to require an immense amount of engineering effort and time." To reduce it, the team wrote a dedicated AI skill (see [Skills, plugins and extension ecosystems](#skills-plugins)) that encodes the migration as a repeatable workflow an agent can run. The post does not say whether other automation was considered.

## The approach

Each Gradle module is migrated independently, bottom-up and core first, because Hilt needs dependencies to be available up the dependency tree. A migrated module stays available in Koin as a proxy to Hilt through `@EntryPoint`, so modules not yet converted keep working. Where a new Hilt module still depends on a Koin module, temporary `KoinComponent` glue code bridges the gap. A Koin proxy is removed only when its whole dependency area has moved.

The skill translates every Koin DSL construct (such as `factory`, `single`, `viewModel`, `named()`, `binds` and `scoped`) into its Hilt equivalent, step by step, from factory and singleton conversion through qualifiers, ViewModels, scoped dependencies and test migration. Its design principle is that it "never assumes the agent already knows how to perform a Koin-to-Hilt migration". Each step gives explicit "Before" and "After" code: the agent matches what it finds against the "Before" template and writes the "After" code. The post says this "makes the output highly predictable regardless of which LLM executes the skill". The skill ends by running a build script that compiles the whole project and confirms that all dependencies resolve, the kind of check described in [Inside coding agents](#coding-agent-internals).

## The stack

As of July 2026:

- An Android app with nearly 500 Gradle modules, moving from Koin, a Kotlin DI framework, to Hilt, which is built on Dagger.
- The skill, run "via GitHub Copilot with Claude Opus 4.6 or Claude Code directly". The post does not say which was used in the experiment.
- A build script that compiles the entire project, CI/CD, and Perfetto system traces for startup profiling.

## Results, and how they were measured

"The study involved developers performing several migrations on modules of comparable complexity", one manual (the baseline) and one with an AI coding agent. Developer A migrates module X manually and module Y with AI, and developer B does the reverse, which the post says "eliminates individual skill level as a confounding variable". Each session was logged with timestamps, separating active time (prompting, instructing and correcting the agent), passive time while the agent worked alone, and total elapsed time. Manual sessions allowed IDE code completion but no LLM assistants.

- **Manual:** developer time 14h 23m, total elapsed 14h 23m.
- **Agentic:** developer time 3h 26m, agent time 3h 16m, total elapsed 6h 42m. Saved: 10h 57m (76%) of developer time and 7h 41m (53%) of total time.
- **In the post's words:** "The AI agents reduced active developer time by approximately 76%." and "Total elapsed time (including agent processing) was reduced by roughly 53%."
- **Per module:** the introduction says the automation "reduced the migration time per module from roughly one week to under two days", without saying how this was measured.
- **Progress:** "By the end of Q2 2026, more than 60 core modules had been completely migrated". "Approximately 400+ feature modules remain."
- **Startup:** the core migration "has already contributed to measurable startup improvements", the post says, without numbers. The target is a cold start below 3.5 seconds on lower-end devices.

**Not measured:** the post does not state how many developers or modules took part in the experiment, over what period, or whether the table shows totals or averages. It reports no error or rework rate for the agent's output and no startup figures attributed to the Hilt migration itself.

## What failed

- **Agents needed help.** Developers intervened when the agent stalled or made errors, and focused on "scope decisions, UI injection verification, and edge cases". The post does not say how often.
- **Technical debt.** Migrating a module with incorrect structure or missing dependencies "forces the creation of a large number of fake DI modules in tests".
- **Slower builds.** Hilt's annotation processing adds compile time, which the team accepts: "slower builds but faster, more reliable runtime".

## What the team would do differently

"We found it more efficient to address existing structural issues before starting the migration." The post also recommends providing dependencies in Hilt modules with `@Provides` rather than scattering `@Inject constructor()` through business code. Its conclusion is that a migration of this size needs "a deliberate strategy" of core-first rollout, backward-compatible proxying and testing infrastructure for the hybrid state, and "the goal is to fully sunset Koin by the end of the year".

The wiki's reading: the changes follow fixed patterns that fit "Before" and "After" pairs, and Hilt's compile-time checks turn each build into a test of the agent's work, which may explain why the migration suited an agent. Without a sample size, the 76% figure is hard to compare with other studies; see [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) and [Working effectively with coding agents](#working-with-coding-agents).

## Disclosure

None.

## Sources

- Wojciech Topolski, Allegro, [“How AI Agents Halved the Effort of Migrating 500 Gradle Modules from Koin to Hilt”](https://blog.allegro.tech/2026/07/how-ai-agents-halved-effort-migrating-gradle-modules-koin-to-hilt.html), Allegro Tech Blog, 27 July 2026.

## Related

- [About playbooks](#about-playbooks)
- [Coding agents](#coding-agents)
- [Skills, plugins and extension ecosystems](#skills-plugins)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Working effectively with coding agents](#working-with-coding-agents)
