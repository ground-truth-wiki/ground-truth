---
id: claude-code-quality-reports-2026
book: 22
order: "22.10"
title: Three Claude Code changes behind reports of worse responses
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [coding-agents, reasoning-effort, context-management, system-prompts, postmortems, public-record]
visuals: []
type: field-note
account: public-record
industry: "AI model provider (coding product)"
use_case: "Claude Code's default reasoning effort, its clearing of older thinking in idle sessions, and its system prompt"
outcome: "Three changes shipped on March 4, March 26 and April 16 made responses worse for some users; all were resolved as of April 20 (v2.1.116)"
measured_how: "No share of affected users or user-facing quality metric; dates and affected models per change, two release versions, plus one ablation eval showing a 3% drop (Anthropic engineering post, 23 April 2026)"
prerequisites: [claude-code, context-compaction]
replications: []
---
> [!tldr]
> Between March 4 and April 20, 2026, three changes made Claude Code's responses worse for some users: a lower default reasoning effort, a bug that dropped earlier reasoning every turn, and a system prompt line limiting response length. Internal usage and evals did not reproduce them at first; user reports led to the fixes.

> [!note] From the public record
> Built from Anthropic's own published account, "An update on recent Claude Code quality reports" (April 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

On 23 April 2026, Anthropic's engineering team wrote: "Over the past month, we’ve been looking into reports that Claude’s responses have worsened for some users." It traced them to three changes affecting [Claude Code](#claude-code), the Claude Agent SDK and Claude Cowork. "The API was not impacted." Sonnet 4.6 and Opus 4.6 were affected, and Opus 4.7 by the third.

As of that date, Claude Code sends its default reasoning effort to the Messages API as the effort parameter; users can choose other levels with /effort. Claude's reasoning normally stays in the conversation history, and Claude Code uses prompt caching.

## What happened

1. **March 4: a lower default effort.** Users reported that at high effort, the default since February, Opus 4.6 occasionally thought so long that the UI appeared frozen. In internal evals, "medium effort achieved slightly lower intelligence with significantly less latency for the majority of tasks", so medium became the default. Despite startup notices and an inline effort selector, "most users retained the medium effort default".
2. **March 26: a caching optimization.** It was meant to clear older thinking once from sessions idle for over an hour, using the clear_thinking_20251015 API header with keep:1, to cut latency and cost on resume.
3. **April 7: effort reverted.** The post adds, as of its date: "All users now default to xhigh effort for Opus 4.7, and high effort for all other models."
4. **April 10: the caching bug fixed** in v2.1.101.
5. **April 16: a verbosity line ships with Opus 4.7,** which "tends to be quite verbose". It read: "Length limits: keep text between tool calls to ≤25 words." and "Keep final responses to ≤100 words unless the task requires more detail."
6. **April 20: the line reverted.** "All three issues have now been resolved as of April 20 (v2.1.116)."
7. **April 23: the post,** with a reset of usage limits for all subscribers.

## Impact, and how it was measured

- **Lower effort.** Users reported that Claude Code felt less intelligent.
- **Dropped reasoning.** "This surfaced as the forgetfulness, repetition, and odd tool choices people reported." The dropped blocks also caused cache misses: "We believe this is what drove the separate reports of usage limits draining faster than expected."
- **The verbosity line.** "In combination with other prompt changes, it hurt coding quality". It had passed "multiple weeks of internal testing and no regressions in the set of evaluations we ran". Later ablations of the system prompt on a broader set of evaluations found the effect: "One of these evaluations showed a 3% drop for both Opus 4.6 and 4.7."
- **All three together.** Each change hit a different slice of traffic on a different schedule, so "the aggregate effect looked like broad, inconsistent degradation".

**Not measured:** the post gives no share of users, sessions or requests affected by any change, no measure of how much worse responses were beyond the single 3% result from an unnamed evaluation, no figure for how much faster usage limits drained, and no numbers for the internal comparison of medium and high effort.

## Why it happened

- **A trade-off.** On the effort change: "This was the wrong tradeoff." Users said they would rather default to higher intelligence and opt into lower effort for simple tasks.
- **A cleanup that ran every turn.** "Instead of clearing thinking history once, it cleared it on every turn for the rest of the session." A follow-up sent during a tool use even dropped the current turn's reasoning. See [context editing and reasoning state](#context-compaction).
- **Checks that missed it.** The change "made it past multiple human and automated code reviews, as well as unit tests", end-to-end tests, automated verification and dogfooding. It hit only stale sessions. Two unrelated experiments made it hard to reproduce at first: an internal-only server-side experiment on message queuing, and a change in how thinking is displayed, which suppressed the bug in most CLI sessions. Finding the root cause took "over a week".
- **Hard to detect.** Investigation began in early March, but the reports "were challenging to distinguish from normal variation in user feedback at first", and "neither our internal usage nor evals initially reproduced the issues identified". Reports via /feedback and reproducible examples posted online "ultimately allowed us to identify and fix these problems".

## What changed afterwards

- **The public build inside.** A larger share of internal staff will use the exact public build of Claude Code.
- **Code review with more context.** In a back-test of Code Review on the offending pull requests, given complete repository context, "Opus 4.7 found the bug, while Opus 4.6 didn't." Code reviews will get additional repositories as context, and an improved Code Review tool will ship to customers.
- **Tighter controls on prompt changes.** "We will run a broad suite of per-model evals for every system prompt change to Claude Code", with per-line ablations and new tooling to review and audit them. New guidance in the team's CLAUDE.md is meant to keep model-specific changes gated to their target model. See [Prompt and config management](#prompt-config-management).
- **Soak periods for changes that could cost intelligence.** "For any change that could trade off against intelligence, we'll add soak periods", plus a broader eval suite and gradual rollouts.

The post does not report whether these changes worked.

## Lessons

The post's own lessons are the process changes above.

The wiki's reading: four points for teams that ship an agent product on top of a model.

- **A default is a product decision.** Most users kept the medium default, so changing it changed the product for them. See [Reasoning models](#reasoning-models).
- **Test the state after a one-time action.** Check what the context holds several turns after the trigger, not only at the trigger.
- **Treat the system prompt like code.** One line passed weeks of testing; ablations on a broader eval set later showed its effect.
- **Watch the sum of changes.** Three changes on different schedules looked like noise. Gradual rollouts with live quality signals help tie a drop to one change. See [Online evaluation](#online-evaluation) and [CI/CD for AI](#ci-cd-for-ai).

## Disclosure

None.

## Sources

- No individual author shown (team: Engineering), Anthropic, [“An update on recent Claude Code quality reports”](https://www.anthropic.com/engineering/april-23-postmortem), Anthropic Engineering, 23 April 2026.

## Related

- [About field notes](#about-field-notes)
- [Prompt caching and token economics](#prompt-caching)
- [Harness engineering](#harness-engineering)
- [Prompt sensitivity and robust prompt testing](#prompt-robustness)
- [Incidents and on-call](#incidents-on-call)
