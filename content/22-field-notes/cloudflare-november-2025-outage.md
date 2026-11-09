---
id: cloudflare-november-2025-outage
book: 22
order: "22.5"
title: "Cloudflare's November 2025 outage: a bot-scoring model's feature file doubles in size"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incidents, postmortems, data-validation, bot-detection, public-record]
visuals: []
type: field-note
account: public-record
industry: "Internet infrastructure (CDN and network security)"
use_case: "A machine learning model in the core proxy that generates a bot score for every request, fed by a feature file generated every five minutes by a ClickHouse query"
outcome: "Significant failures to deliver core network traffic from 11:20 UTC on 18 November 2025; core traffic largely normal by 14:30 and all systems normal at 17:06; the post calls it Cloudflare's worst outage since 2019"
measured_how: "Volume of HTTP 5xx status codes served by the network, a UTC timeline and per-product impact for 18 November 2025 (Cloudflare postmortem by Matthew Prince, 18 November 2025)"
prerequisites: [incidents-on-call, data-validation-drift]
replications: []
---
> [!tldr]
> On 18 November 2025, a database permissions change made the feature file for Cloudflare's bot-scoring model double in size. In the FL2 proxy, the Bot Management module hit its limit of 200 features and panicked. Errors continued until a known good file was deployed from 14:30 UTC. The first follow-up the post lists: harden ingestion of Cloudflare-generated configuration files "in the same way we would for user-generated input".

> [!note] From the public record
> Built from Cloudflare's own published account, "Cloudflare outage on November 18, 2025" (November 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

As of the post's date, a request to Cloudflare passes an HTTP and TLS layer, then the core proxy (FL, for "Frontline"), then Pingora. Inside the core proxy, modules apply each customer's configuration. One of them is Bot Management, which includes "a machine learning model that we use to generate bot scores for every request traversing our network".

The model reads a "feature" configuration file, where each feature is one trait it uses to predict whether a request was automated. A query on a ClickHouse database cluster generated the file every five minutes. The file was published to the entire network, and the post says it must be rolled out frequently and rapidly "as bad actors change their tactics quickly". Because it preallocates memory for performance, the module limits the number of features at runtime: "Currently that limit is set to 200, well above our current use of ~60 features."

Unrelated to the incident, Cloudflare was migrating customer traffic to a new version of its proxy, internally known as FL2. Both the old proxy (FL) and FL2 were affected, with different impact. The post does not describe how the model was trained or evaluated.

## What happened

All times are UTC on 18 November 2025.

1. **11:05.** A database access control change made users' implicit access to underlying tables in a database called r0 explicit.
2. **11:20.** Failures began, says the post's opening. Its timeline marks 11:28 as the time first errors were observed on customer HTTP traffic.
3. **11:31.** An automated test detected the issue. The first symptom looked like a degraded Workers KV response rate.
4. **Fluctuation.** The ClickHouse cluster was being updated gradually, and "Bad data was only generated if the query ran on a part of the cluster which had been updated." Every five minutes, a good or a bad file could go out, so the network recovered and failed again. That pattern, and the status page going down by coincidence, led the team to suspect an attack.
5. **13:05.** Bypasses for Workers KV and Cloudflare Access reduced impact.
6. **14:24.** The team stopped creating and propagating new Bot Management files and saw recovery with the old one.
7. **14:30.** A known good file, inserted manually into the distribution queue, was deployed globally and a restart of the core proxy was forced: "Core traffic was largely flowing as normal by 14:30."
8. **17:06.** "As of 17:06 all systems at Cloudflare were functioning as normal."

## Impact, and how it was measured

The post measures impact with a chart of HTTP 5xx status codes against "the expected baseline of 5xx errors" before 11:20, a timeline and a table of affected products.

- **Two proxies, two failures.** Customers on FL2 saw HTTP 5xx errors. Customers on FL saw no errors, but "bot scores were not generated correctly, resulting in all traffic receiving a bot score of zero." "Customers that had rules deployed to block bots would have seen large numbers of false positives."
- **Dependent products.** Turnstile failed to load, Workers KV returned elevated 5xx errors, and most dashboard users could not log in. Access authentication failed for most users until the rollback was initiated at 13:05.
- **Latency.** The CDN showed "significant increases in latency", as debugging and observability systems consumed large amounts of CPU.
- **Severity.** "Today was Cloudflare's worst outage since 2019."

**Not measured:** the post gives no count of failed requests or affected customers, no error rate or latency figure in its text, and no count of the false positives caused by zero bot scores.

## Why it happened

The feature file was built from a query on `system.columns` that did not filter by database name. In the post's words, "there were assumptions made in the past" that such a query would return only the "default" database. After the permissions change, it also returned the columns of the underlying tables in r0, "effectively more than doubling the rows in the response". This affected the number of rows, that is features, in the final file.

When the file, now with more than 200 features, reached the network's machines, the limit was hit. The FL2 Rust code did not handle the error and panicked: "thread fl2_worker_thread panicked: called Result::unwrap() on an Err value". The core proxy returned 5xx errors for traffic that depended on the bots module, which also affected Workers KV and Access.

## What changed afterwards

The post lists four follow-ups:

- "Hardening ingestion of Cloudflare-generated configuration files in the same way we would for user-generated input"
- "Enabling more global kill switches for features"
- "Eliminating the ability for core dumps or other error reports to overwhelm system resources"
- "Reviewing failure modes for error conditions across all core proxy modules"

The post was published on the day of the outage and calls itself "the beginning, though not the end" of this work. It does not report whether the changes worked.

## Lessons

The post does not state lessons as such. Its first follow-up is to harden ingestion of Cloudflare-generated configuration files as for user-generated input.

The wiki's reading: these points are for teams that serve a model from frequently refreshed inputs.

- **The model's input file is part of its contract.** A separate pipeline produced the file. In FL2, the check against the feature limit raised an error that the code did not handle. Checks on row counts and duplicate names at the hand-off are the gate described in [Data validation, drift and skew](#data-validation-drift).
- **Decide what bad input does before it arrives.** One proxy panicked; the other kept serving with scores of zero, which meant false positives for customers who blocked bots. Keeping the last good file is one form of [graceful degradation](#reliability-engineering).
- **Fast propagation cuts both ways.** The path that ships new bot features quickly also shipped the bad file everywhere. On kill switches and one-step rollback, see [Incidents and on-call](#incidents-on-call) and [Prompt and config management](#prompt-config-management).

## Disclosure

None.

## Sources

- Matthew Prince, Cloudflare, [“Cloudflare outage on November 18, 2025”](https://blog.cloudflare.com/18-november-2025-outage/), Cloudflare Blog, 18 November 2025.

## Related

- [About field notes](#about-field-notes)
- [Incidents and on-call](#incidents-on-call)
- [Reliability engineering](#reliability-engineering)
- [Data validation, drift and skew](#data-validation-drift)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
