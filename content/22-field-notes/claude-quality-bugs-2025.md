---
id: claude-quality-bugs-2025
book: 22
order: "22.3"
title: Three infrastructure bugs that degraded Claude's answers
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [inference, serving, incidents, postmortems, evals, public-record]
visuals: []
type: field-note
account: public-record
industry: AI model provider
use_case: Serving Claude models through Anthropic's API, Claude Code and third-party cloud platforms
outcome: Three overlapping bugs degraded answers for weeks; in the worst hour 16% of Sonnet 4 requests were misrouted, and about 30% of Claude Code users had at least one misrouted message
measured_how: Anthropic's own count of affected requests and users per bug and platform, August to September 2025 (Anthropic postmortem, 17 September 2025)
prerequisites: [serving-engines]
replications: []
---
> [!tldr]
> Between August and early September 2025, three unrelated infrastructure bugs made Claude's answers worse for some users: a routing error, a misconfiguration that corrupted output, and a compiler bug in token selection. Users noticed before Anthropic's evaluations did. The postmortem's central lesson is that noisy evals and limited visibility into real traffic let quality problems hide.

> [!note] From the public record
> Built from Anthropic's own account, "A postmortem of three recent issues" (September 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Anthropic serves its Claude models through its own API and Claude Code, and through Amazon Bedrock and Google Cloud Vertex AI, on several kinds of hardware. In the postmortem's words: "Between August and early September, three infrastructure bugs intermittently degraded Claude's response quality." The post also states a policy that frames the whole incident: "We never reduce model quality due to demand, time of day, or server load."

## What happened

1. **5 August: the routing error starts.** "On August 5, some Sonnet 4 requests were misrouted to servers configured for the upcoming 1M token context window." At first this affected "approximately 0.8% of requests made to Sonnet 4".
2. **25 and 26 August: two more bugs ship.** A misconfiguration on Claude API TPU servers corrupted output, producing unexpected tokens such as Thai or Chinese characters in English answers. It hit Opus 4.1 and Opus 4 from 25 to 28 August and Sonnet 4 from 25 August to 2 September. Separately, a deployment meant to improve token selection triggered a latent bug in the XLA:TPU compiler's approximate top-k operation, confirmed on Claude Haiku 3.5 and possibly affecting Sonnet 4 and Opus 3.
3. **29 August: the routing error gets worse.** "On August 29, a routine load balancing change unintentionally increased the number of short-context requests routed to the 1M context servers." Routing was sticky, so "subsequent follow-ups were likely to be served by the same incorrect server."
4. **Late August: reports pile up.** Early user reports "were difficult to distinguish from normal variation in user feedback". Growing reports led to an investigation that found all three bugs.
5. **2 to 18 September: fixes roll out.** The output corruption was rolled back on 2 September. The routing fix was deployed on 4 September and fully rolled out on Anthropic's platform and Vertex AI by 16 September and on Bedrock by 18 September. The top-k change was rolled back for Haiku 3.5 on 4 September and for Opus 3 on 12 September, and for Sonnet 4 as a precaution.

## Impact, and how it was measured

Anthropic reports the reach of each bug from its own measurements:

- **Routing error.** "At the worst impacted hour on August 31, 16% of Sonnet 4 requests were affected." "Approximately 30% of Claude Code users who made requests during this period had at least one message routed to the wrong server type". On Bedrock, misrouted traffic peaked at 0.18% of Sonnet 4 requests, and on Vertex AI it stayed below 0.0004%.
- **Output corruption and the top-k bug.** The post gives the affected models, platforms and dates, but no share of requests. Third-party platforms were not affected by these two.

The post measures how many requests and users were affected, not how much worse the affected answers were.

## Why it happened

- **Three different failures, overlapping in time.** Each bug produced different symptoms on different platforms at different rates, which gave the team "a confusing mix of reports".
- **A fix that hid a bug.** In December 2024, Anthropic had found that its TPU implementation "would occasionally drop the most probable token when temperature was zero" and deployed a workaround. "The December workaround had been inadvertently masking this problem": when the August change removed it, the deeper compiler bug in approximate top-k came to the surface. See [Decoding and sampling](#decoding-sampling) and [GPU kernels and ML compilers](#gpu-kernels-compilers).
- **Evals that did not see it.** The evaluations "simply didn't capture the degradation users were reporting", partly because Claude often recovers from isolated mistakes. In the post's words: "More fundamentally, we relied too heavily on noisy evaluations."
- **Limited visibility into real traffic.** Privacy controls limit engineers' access to user interactions that were not sent as feedback, which made the bugs harder to reproduce, and the team had no clear way to link user reports to specific changes.

## What changed afterwards

- **Exact top-k.** The team switched from approximate to exact top-k and standardized some operations on fp32 precision, and says it "accepted the minor efficiency impact".
- **Deployment checks.** "We've added detection tests for unexpected character outputs to our deployment process."
- **More sensitive evals, run on production.** New evaluations aim to "more reliably differentiate between working and broken implementations", and the team says "we will run them continuously on true production systems to catch issues such as the context window load balancing error."
- **Better tools for user reports.** Tooling to debug feedback from the community faster, without sacrificing user privacy.

The post was published as these changes started, so it does not report whether they worked.

## Lessons

The postmortem's own lesson is about evals: offline quality checks that are noisy, or that miss errors a model recovers from, can stay green while users see a real decline. The wiki's reading, for anyone who serves models:

- **Watch quality in production, not only before release.** Continuous evals on live systems catch routing and configuration faults that never appear in a test environment. See [Online evaluation](#online-evaluation).
- **Treat user reports as a signal.** Here, users were the first detector. A way to connect reports to recent changes shortens the investigation. See [Incidents and on-call](#incidents-on-call).
- **Expect the same model to behave differently on different stacks.** Hardware, compilers and routing all sit between the weights and the answer. See [Nondeterminism and reproducible inference](#inference-nondeterminism).

## Disclosure

None.

## Sources

- Sam McAllister, Anthropic, [“A postmortem of three recent issues”](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues), Anthropic Engineering, 17 September 2025.

## Related

- [About field notes](#about-field-notes)
- [Serving engines](#serving-engines)
- [Routing and autoscaling model servers](#inference-fleet-scaling)
- [Reliability engineering](#reliability-engineering)
- [SLOs and error budgets for AI systems](#slos-error-budgets)
