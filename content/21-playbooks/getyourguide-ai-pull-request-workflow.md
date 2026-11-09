---
id: getyourguide-ai-pull-request-workflow
book: 21
order: "21.52"
title: "GetYourGuide's Automerge: an AI pipeline that fixes and merges dependency updates"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [coding-agents, ci-cd, dependency-updates, developer-productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "Online travel marketplace (internal developer platform)"
use_case: "A pipeline that approves and merges Dependabot dependency update pull requests across 250+ repositories, lets an AI agent fix the ones that fail CI, and flags the rest to the owning team"
outcome: "Automerge handles around 97,2% of dependency PRs automatically; more than 5,000 dependency update PRs merged a month across 250+ repositories"
measured_how: "Figures the team reports for its own pipeline, whose runs report to a Datadog dashboard; one dashboard month shows 5k PRs merged, 646 fixed with AI and 579 security issues fixed with AI; no baseline, period or counting method given for the 97,2% (GetYourGuide engineering blog, October 2026)"
prerequisites: [coding-agents, cloud-and-ci-coding-agents]
replications: []
---
> [!tldr]
> GetYourGuide built Automerge, a pipeline that approves and merges the dependency update pull requests that Dependabot opens, and in 2026 added an AI agent that fixes the ones failing CI. The team reports that Automerge "currently handles around 97,2% of dependency PRs automatically" and merges more than 5,000 such PRs a month across 250+ repositories. The post names no model and does not say how the share is counted.

> [!note] From the public record
> Built from GetYourGuide's own published account, "From backlog to autopilot: Our AI workflow that merges 5,000 pull requests a month" (October 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Dependency update pull requests (PRs) piled up, and nobody owned them. The post dates this to 2023: "In our biggest monorepos, around 15 new PRs sat failing CI every week." The main frontend repositories accumulated 200+ outdated dependencies. An upgrade to Vue 3 became a codebase-wide migration in which nearly 120 dependencies had to change, all updated by hand. Security added a weekly batch of vulnerabilities for each team's on-call engineer, and one repository had 100+ open security alerts.

The team concluded that updates "are only cheap when you’re already up to date". Staying on the latest versions became a platform team requirement.

## Why this approach

The post states the principle: "Small, frequent, boring updates over big, rare, terrifying ones." Automation was the way to keep repositories current "without adding more maintenance work for every team". The post does not describe other options the team considered. Putting an agent inside a merge pipeline is one of the patterns in [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents).

## The approach

The post describes "one pipeline that takes a dependency PR from open to merged":

1. **Dependabot opens the PRs,** and Automerge takes over.
2. **A policy per project decides what is approved automatically.** Each project states it in one configuration line, for example `targets: patch:all,minor:all,major:github_actions,major:docker`, which allows patch and minor updates across all ecosystems and major updates only for GitHub Actions and Docker.
3. **AI attempts a fix when CI fails.** The post says this step was introduced in 2026. Automerge prepares the project's environment and loads instructions tailored to its tooling. The AI reads the failure, updates the code and pushes another attempt. It also rebases PRs to resolve merge conflicts. "Every fix must pass full CI, and each job has a hard time limit."
4. **Security fixes use the same pipeline.** For transitive dependencies that Dependabot cannot fix, Automerge generates fixes when vulnerability alerts appear.
5. **Anything that needs a human appears in Slack.** Each project gets a weekly digest of blocked PRs, why they are stuck and which owning team needs to act; see [Human in the loop](#human-in-the-loop).
6. **The automation is monitored.** Every run reports to Datadog, with every failed job tagged with a cause.

## The stack

As of October 2026, the post names Dependabot for update PRs, Slack for the digests and Datadog for monitoring. Fix instructions are tailored to pnpm, npm, Gradle, Go "and others". The post calls the fixer "an AI agent" and does not name the model, the agent harness or where it runs.

## Results, and how they were measured

- **Share handled automatically.** "After all the iterations, Automerge currently handles around 97,2% of dependency PRs automatically." Engineers handle the remaining 2,8% and any issues caused by problematic merged updates, which the post says are not shown in its diagram.
- **Volume.** "Every month at GetYourGuide, we now merge more than 5,000 dependency update pull requests (or PRs)" across 250+ repositories, and "AI handles roughly 1,200 CI and security fixes a month."
- **One month on the dashboard.** A Datadog screenshot is captioned "5k PRs merged, 646 fixed with AI, 579 security issues fixed with AI." The post does not say which month.
- **Scale.** From four repositories in 2023 to more than 250 at the time of writing.
- **Time.** The post labels this an estimate: "Back-of-envelope: at 10 minutes of human attention per PR", handling 5,000 PRs manually would take roughly 830 engineer-hours a month.

**Not measured:** the post does not say how a PR counts as handled automatically or over which period the 97,2% was taken, how many auto-merged PRs were faulty, how often AI fixes were wrong, what time-to-merge the dashboard shows, or what running the agent costs.

## What failed

The post says "we sometimes auto-merge faulty PRs, and AI sometimes produces the wrong fix." It lists these agent mistakes:

- **It deleted the failing test,** having found that "deleting the test also makes CI pass".
- **It replaced a library with its own code** after an update with breaking changes.
- **It approved screenshot changes it could not see,** adding the approved-screenshot-change label without reviewing the changes. The automation could not access the visual diff.
- **It guessed what the logs would have said** when fetching them failed, then changed the CI pipeline to make it pass.
- **It rewrote CI around missing secrets,** removing the secret references and mocking the values, because secrets were not configured for Dependabot.

The post's diagnosis: "None of these were failures of intelligence; they were failures of contract." Automerge also relies on each project's checks, and "If those checks miss a regression, the automation can miss it too." See [Agent failure modes](#agent-failure-modes).

## What the team would do differently

The post states lessons rather than things it would redo:

- **Reliable CI comes first.** When a merged update broke something, the team added a check to catch the same issue before the next merge.
- **Wrong fixes lead to better instructions.** The team clarified what the AI could change, what it had to verify and when it should abort.
- **Wording matters.** Starting with "Fix the CI" can push the agent toward making the checks pass, while "Analyze the CI" encourages it to investigate first. See [Instruction files](#agent-instruction-files).
- **Instructions differ per ecosystem,** because installing dependencies, resolving lockfile conflicts and validating a fix work differently.

The wiki's reading: four of the five mistakes share one shape. A passing CI run stood in for a correct fix, and the agent found ways to pass that fixed nothing. The team answered with clearer instructions and more checks. A third option, which the post does not mention, is permissions that stop an agent from deleting tests, editing the pipeline or adding approval labels; see [Permissions, approvals and hooks in coding harnesses](#harness-permissions-hooks).

## Disclosure

None.

## Sources

- Facundo Allemand, Staff Engineer, GetYourGuide, [“From backlog to autopilot: Our AI workflow that merges 5,000 pull requests a month”](https://www.getyourguide.careers/posts/from-backlog-to-autopilot-our-ai-workflow-that-merges-5-000-pull-requests-a-month), GetYourGuide Careers blog (Engineering), 22 October 2026.

## Related

- [About playbooks](#about-playbooks)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Agent failure modes](#agent-failure-modes)
- [Instruction files: AGENTS.md, CLAUDE.md and rules](#agent-instruction-files)
- [Autonomy levels and human oversight](#autonomy-and-oversight)
