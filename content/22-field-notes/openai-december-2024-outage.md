---
id: openai-december-2024-outage
book: 22
order: "22.12"
title: "OpenAI's December 2024 outage: a telemetry rollout overwhelms the Kubernetes control plane"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incidents, postmortems, kubernetes, phased-rollouts, public-record]
visuals: []
type: field-note
account: public-record
industry: "AI platform (API, ChatGPT and Sora)"
use_case: "A new telemetry service rolled out to all of OpenAI's Kubernetes clusters to collect detailed control plane metrics"
outcome: "All OpenAI services saw significant degradation or complete unavailability from 3:16 PM to 7:38 PM PST on December 11, 2024; ChatGPT and Sora fully recovered at 7:01 PM PST, the API at 7:38 PM PST"
measured_how: "A common start of degradation, per-product recovery times and an incident timeline for December 10 and 11, 2024; no error rates, request volumes or customer counts (OpenAI status page write-up, undated)"
prerequisites: [incidents-on-call, reliability-engineering]
replications: []
---
> [!tldr]
> On December 11, 2024, the configuration of a new telemetry service made every node in each of OpenAI's Kubernetes clusters run resource-intensive Kubernetes API operations. The API servers were overwhelmed, the control plane went down in most large clusters, DNS-based service discovery broke, and all OpenAI services saw significant degradation or complete unavailability from 3:16 PM to 7:38 PM PST. The fix needed the control plane the incident had taken down, so OpenAI plans break-glass access to the API servers and work to decouple the data plane from the control plane.

> [!note] From the public record
> Built from OpenAI's own published account, "API, ChatGPT & Sora Facing Issues" (December 2024 incident; the write-up shows no publication date), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

As of the write-up, "OpenAI operates hundreds of Kubernetes clusters globally." Each has a control plane "responsible for cluster administration" and a data plane "from where we actually serve workloads like model inference." The data plane can run largely on its own, "but DNS relies on the control plane": services cannot find one another without it.

As part of "a push to improve reliability across the organization", OpenAI was improving its cluster-wide observability tooling. "At 3:12 PM PST, we deployed a new telemetry service to collect detailed Kubernetes control plane metrics." The event "was not caused by a security incident or a recent launch."

## What happened

The timeline gives times without a time zone; the impact section uses PST.

1. **December 10, 2024.** The service was deployed to a staging cluster and "verified to be working as expected".
2. **December 11, 2:23 PM.** The change was merged and the deployment pipeline triggered.
3. **2:51 PM to 3:20 PM.** "The change was applied to all clusters".
4. **3:13 PM.** "Alerts fired, notifying engineers". The write-up says detection worked, "a few minutes before customers started seeing impact."
5. **3:16 PM.** Minor customer impact began. The timeline marks the root cause as identified at the same time.
6. **3:27 PM.** Engineers began moving traffic away from impacted clusters.
7. **3:40 PM.** Maximum customer impact.
8. **4:36 PM.** First cluster recovered.
9. **7:38 PM.** All clusters recovered.

To bring the clusters back online, engineers worked three paths at once: scaling down cluster size, blocking network access to Kubernetes admin APIs, and scaling up the Kubernetes API servers. "By pursuing all three in parallel, we eventually restored enough control to remove the offending service." Some clusters stayed degraded because "many services tried to download resources simultaneously", saturating resource limits.

## Impact, and how it was measured

The write-up measures impact as time windows per product:

- **All services.** Between 3:16 PM PST and 7:38 PM PST on December 11, 2024, "all OpenAI services experienced significant degradation or complete unavailability."
- **ChatGPT.** "Substantial recovery occurred at 5:45 PM, with full recovery at 7:01 PM PST."
- **API.** "Substantial recovery occurred at 5:36 PM, with full recovery across all models at 7:38 PM PST."
- **Sora.** "Fully recovered at 7:01 PM PST."

**Not measured:** the write-up gives no error rates, request volumes, or number of affected customers or regions, and does not say what counts as substantial recovery. It does not say how many clusters lost their control plane beyond "most of our large clusters".

## Why it happened

The configuration caused every node in each cluster "to execute resource-intensive Kubernetes API operations whose cost scaled with the size of the cluster." With thousands of nodes doing this at once, the API servers were overwhelmed, "taking down the Kubernetes control plane in most of our large clusters." Services that relied on DNS to find each other then began to fail. The write-up names three conditions that combined:

- **Tests did not reach the failing size.** "The change was tested in a staging cluster, where no issues were observed." The impact was specific to clusters above a certain size. CPU and memory were checked in all clusters, but "no precautions were taken to assess Kubernetes API server load". The rollout "monitored service health but lacked sufficient cluster health monitoring protocols."
- **DNS caching hid the failure.** The cache on each node delayed visible failures "long enough for the rollout to continue." Services failed as cached records expired over the following 20 minutes.
- **The fix needed the broken control plane.** Removing the service required the Kubernetes control plane, which the load on the API servers made unreachable. Remediation was slow because of "the locked out effect".

## What changed afterwards

The write-up lists five measures, as plans:

- **Robust phased rollouts** for all infrastructure configuration changes, with monitoring that checks service workloads and clusters, "including the Kubernetes control plane".
- **Fault injection testing:** the data plane should survive longer without the control plane, and tests will "intentionally roll out bad changes" to check detection and rollback.
- **Emergency control plane access:** "We do not yet have a mechanism to ensure access to the API server" under such load, so OpenAI will build break-glass mechanisms.
- **Decoupling the data plane and control plane**, so that "the control plane is not load bearing" for mission critical services.
- **Faster recovery:** improved caching and dynamic rate limiters for cluster startup resources, and regular exercises that rapidly replace an entire cluster.

The write-up does not report whether these measures were completed or worked. It closes with an apology: "We’ve fallen short of our own expectations."

## Lessons

The write-up states no lessons under that name. Its prevention list comes closest, starting with phased rollouts that monitor cluster health as well as service health.

The wiki's reading: three points for teams that serve models on shared clusters.

- **Platform changes are changes too.** A service added to improve reliability caused the outage, and its cost grew with cluster size, which staging was too small to show. Infrastructure changes need the same staged rollout and health gates as model changes. See [CI/CD for AI](#ci-cd-for-ai).
- **Caches can hide a failure until it is everywhere.** Node-level DNS caching kept services working for minutes, so the rollout went on. Watch shared dependencies, not only service symptoms. See [Observability and tracing](#observability-tracing).
- **Keep a way in that does not depend on what failed.** The rollback path ran through the overloaded API servers. See [Incidents and on-call](#incidents-on-call) and [Reliability engineering](#reliability-engineering). Recovery itself caused a load spike, the problem in [Rate limits, quotas and overload control](#rate-limits-overload).

## Disclosure

None.

## Sources

- OpenAI (no author shown), [“API, ChatGPT & Sora Facing Issues”](https://status.openai.com/incidents/ctrsv3lwd797/write-up), incident write-up on the OpenAI status page, undated; covers the incident of December 11, 2024. Read November 2026.

## Related

- [About field notes](#about-field-notes)
- [Incidents and on-call](#incidents-on-call)
- [Reliability engineering](#reliability-engineering)
- [CI/CD for AI](#ci-cd-for-ai)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
