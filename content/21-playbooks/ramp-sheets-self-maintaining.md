---
id: ramp-sheets-self-maintaining
book: 21
order: "21.43"
title: "Ramp Sheets: agents that write monitors, triage alerts and propose fixes"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incidents-on-call, observability, coding-agents, alert-triage, public-record]
visuals: []
type: playbook
account: public-record
industry: "Finance and insurance (Ramp, maintaining its own Ramp Sheets product)"
use_case: "Agents that generate production monitors for newly merged code, triage the alerts those monitors fire and propose fixes for Ramp Sheets, with an engineer reviewing every merge"
outcome: "Monitors went from ten hand-written to over a thousand in a few weeks; 40 real bugs caught in the system's first week, each within minutes of a user triggering the issue"
measured_how: "Ramp's own counts of monitors and of bugs caught in the first week of the monitor-driven system, with no definition of a real bug, no baseline bug count and no false-positive rate stated (Ramp Labs, March 2026)"
prerequisites: [incidents-on-call, coding-agents]
replications: []
---
> [!tldr]
> Ramp built agents that maintain its Ramp Sheets product: one writes Datadog monitors for each merged pull request, and when a monitor fires, another triages the alert, reproduces the issue in a sandbox and proposes a fix for an engineer to review. Ramp reports going "from ten hand-written monitors to over a thousand" in a few weeks and catching 40 real bugs in the first week. The major weakness was noise, which a triage step was added to filter.

> [!note] From the public record
> Built from Ramp's own published account, "How we made Ramp Sheets self-maintaining" (March 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post does not describe Ramp Sheets in detail. Its examples show a backend that runs an agent, writes to spreadsheet workbooks and streams events to connected clients. The product was "extensively instrumented on Datadog", but its ten hand-written monitors were "broad-strokes": they alerted when the frontend crashed or an API call timed out.

The post's reasons: agents are "cheap to run, infinitely patient, and easy to parallelize", which makes exhaustive monitoring feasible. "Teams hate owning observability, ourselves included." And strong observability and QA mean fewer bugs, less downtime and a better experience for Ramp customers.

## Why this approach

The first iteration was a nightly agentic QA pass. It "surfaced several real production bugs every day" (no count is given), but it could not catch narrow, situational bugs, and it struggled to extract nuanced insights from the telemetry. The post's explanation is that current frontier models "cannot synthesize a large codebase with a large observability surface and determine what needs attention." So the team used monitors to point the agent at specific production issues, and later added triage.

The system is built on Ramp Inspect. Each Inspect session is a sandbox where the agent can reproduce bugs end-to-end against live code. The post calls this critical, as "subtle failure modes are rarely apparent from static code review." It does not discuss alternatives to Ramp Inspect or Datadog. For background, see [Observability and tracing](#observability-tracing) and [Coding agents](#coding-agents).

## The approach

1. **Nightly audit (first iteration).** An agent sanity-tested core features, stress-tested recently merged PRs and probed existing functionality for latent bugs. If it found a real issue, it put up a PR to address the root cause.
2. **Monitors on merge.** "On PR merge, an agent reads the diff and generates monitors instrumenting the new code." Monitors watch metrics and log patterns and alert on error rate spikes, latency regressions or other deviations. One example combines signals from the backend and the SSE queue.
3. **Response to an alert.** A Datadog webhook starts a new agent with the alert context. It reproduces the issue in its sandbox, pushes a fix only once its reproduction test passes, and notifies the team on Slack.
4. **Triage.** On every alert, the agent first assesses the scope. A real issue gets a fix and a Slack post; noise leads the agent to tune or delete the monitor.
5. **Deduplication.** An agent that pushes a fix appends the PR link to the monitor's description, and later agents that see it stand down.

The system proposes fixes, "although no code is merged without engineer review". See [Human in the loop](#human-in-the-loop).

## The stack

As of March 2026:

- **Agent runtime:** Ramp Inspect, "our internal background coding agent", where each session spins up a full sandboxed dev environment.
- **Monitoring and triggers:** Datadog monitors and a Datadog webhook.
- **Notifications:** Slack.
- **Models:** the post compares "the GPT-5 model series" and Opus 4.6 for triage, and a sample nightly QA session is labeled "GPT-5.4". It does not state which model runs each step in production.

## Results, and how they were measured

- **Monitor coverage.** "In a few weeks, we scaled Ramp Sheets from ten hand-written monitors to over a thousand, one for every 75 lines of code."
- **Bugs caught.** "In its first week, the system caught 40 real bugs, each within minutes of a user triggering the issue." This sits in the monitor-driven stage; the post does not say whether triage was already running. In one example, an upload with "a unique type of embedded image" caused an exception, and moments later the agent alerted the team with a fix ready.
- **Triage model.** The GPT-5 model series is called "very thorough debuggers", but "we found Opus 4.6 was a more accurate triage evaluator, and specifically better at filtering out noisy alerts." A chart titled "Correct Triage Classification" shows 82 for "GPT-5.4 (high)" and 88 for "Opus 4.6" on an axis labeled "Correct %", with no sample or method given. See [LLM-as-judge done right](#llm-as-judge).

**Not measured:** the post gives no false-positive rate, no definition of a "real bug", no count of fixes proposed, merged or rejected, no time to fix, no cost, no count of alerts that reached people and no measured comparison with the hand-written monitors. It only calls those "broad-strokes" and the generated ones "far more granular".

## What failed

- **The unfocused nightly agent.** "With no specific mission, the agent always progressed down the same paths in its QA workflow", reading the same files and running the same tests. The post says this pattern was effective at finding "high-radius issues".
- **Noise.** "The major weakness in this approach was noise. Auto-generated monitors have bad thresholds." Routine user activity set off "a cascade of alerts, most of them false positives", and repeat alerts for the same issue flooded Slack. Triage and the PR links on monitors were the response.
- **Trust in generated monitors.** They are "powerful but opaque, and not yet reliable enough to be your only line of defense."

## What the team would do differently

The post states lessons rather than things to redo:

- "Detect everything, notify selectively." Teams ignore noisy monitors "and they'll ignore noisy agents too."
- Delegate scoping, impact judgment, changes and noise filtering to the agent.
- Use sandboxed reproduction, so the issue is real and the fix works.
- Tight observability builds customer empathy: "We caught bugs we never would have prioritized on our own."
- Keep instrumentation you wrote and trust for when things go seriously wrong. The post expects this to change as models improve.

The wiki's reading: the design puts a check at each handoff: triage before a person is notified, a passing reproduction test before a fix, and engineer review before a merge. Without a false-positive rate or a merge rate, readers cannot tell how much noise remains. See [Incidents and on-call](#incidents-on-call).

## Disclosure

None.

## Sources

- Alex Levinson, Ramp Labs (Ramp), [“How we made Ramp Sheets self-maintaining”](https://labs.ramp.com/research/ramp-sheets-self-maintaining/), Ramp Labs Research, 23 March 2026.

## Related

- [About playbooks](#about-playbooks)
- [Incidents and on-call](#incidents-on-call)
- [Observability and tracing](#observability-tracing)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Human in the loop](#human-in-the-loop)
