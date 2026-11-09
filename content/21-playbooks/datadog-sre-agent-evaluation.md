---
id: datadog-sre-agent-evaluation
book: 21
order: "21.10"
title: "Datadog Bits Investigation: evaluating an SRE agent on replayed incidents"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [evaluating-agents, eval-datasets, observability, regression-testing, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools (observability and monitoring)"
use_case: "An offline evaluation platform for Bits Investigation, an autonomous agent that investigates production incidents, with test cases built from real incidents"
outcome: "Validation time per label dropped by more than 95% in a single week; roughly a 30% increase in the quality of root causes in the generated labels; label creation rate increased by an order of magnitude"
measured_how: "Datadog's own figures for label validation time, label quality and label creation rate, with no baseline, sample or measurement method stated; the full evaluation set runs weekly, and Bits runs against tens of thousands of scenarios every week (Datadog engineering blog, April 2026)"
prerequisites: [evaluating-agents, eval-datasets]
replications: []
---
> [!tldr]
> Datadog built an offline evaluation platform for Bits Investigation, its autonomous agent for investigating production incidents. Each test case pairs a known root cause with a snapshot of the signals that were available when the issue occurred. The full set runs every week, and the post says Bits runs against "tens of thousands of scenarios" each week. Having the agent propose each label's root cause analysis for reviewers to check cut validation time per label by "more than 95% in a single week". Adding realistic noise lowered the pass rate but, in the team's words, made its evaluations "predictive of production behavior".

> [!note] From the public record
> Built from Datadog's own published account, "How we built a real-world evaluation platform for autonomous SRE agents at scale" (April 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Bits Investigation is, in the post's words, Datadog's "autonomous agent for investigating production incidents." It reasons across metrics, logs, traces, monitor configuration and more to determine, triage and remediate the root cause of an issue.

Early in development, before customers used it, the team "added a feature that extracted the service name from the monitor under investigation" and put it into the agent's initial context. It worked in a handful of internal test cases but caused regressions in unrelated scenarios that went unseen "until we began seeing widespread investigation misses internally." The team had no standard way to catch such regressions or to track quality across changes.

## Why this approach

The team first tested tools in isolation, but "Failures often emerged from interactions between steps, not from a single tool call." It also tried rerunning live investigations as online evaluation, which "did not scale": investigations could not be replayed once the underlying signals expired. Off-the-shelf eval frameworks "assume clean inputs and static test sets". So the team built an offline system to replay realistic scenarios and measure the agent's behavior "in a controlled, repeatable way". See [Evaluating agents](#evaluating-agents).

## The approach

1. **Labels.** Each label is one scenario with a ground truth, which defines the root cause, and a world snapshot, which captures the signals that were available when the issue occurred. In the post's example, a Kubernetes pod being OOM killed, the snapshot keeps the telemetry queries for memory metrics, container logs and deployment events "rather than raw data". "The agent never sees the root cause directly."
2. **Orchestration.** An orchestration layer runs investigations against the shared label set across model and configuration variants, and reporting tracks performance over time.
3. **Label collection.** A manual internal campaign built labels from Datadog's own alerts, but the set was "nowhere near representative of the real world." The team then moved label creation into the product: customer feedback on a Bits AI investigation, plus the investigation itself, becomes a new label. See [The data flywheel](#data-flywheel).
4. **Agentic validation.** Bits now proposes a ground truth and signal set, and reviewers validate and refine it. Each generated label gets confidence scores on dimensions including thoroughness, specificity and accuracy, and anything below a defined threshold goes to human review. The team also ran "several alignment studies with human judges". See [Label quality](#label-quality).
5. **Noise.** Snapshots are expanded with related components found from the root cause chain, such as ones on the same platform, team or monitor, or with a similar name.
6. **Segments and weekly runs.** Labels can be segmented by technology, problem type, monitor type and investigation difficulty. Scores are stored per scenario and run, with metrics such as pass@k: whether the agent succeeds on at least one of k attempts. The full set runs weekly, and the team alerts on significant deviations in overall performance. See [Agent eval metrics and benchmark design](#agent-eval-metrics).

For scoring, the team looks at the agent's trajectory, not only its conclusion: "how close it got to the correct answer", investigation depth, and whether it surfaced valuable telemetry. The post names no judge model, rubric or pass criterion.

## The stack

As of April 2026: results are tracked "in Datadog dashboards and Datadog Agent Observability" and sent as Slack notifications. The only model named is Claude Opus 4.5, which the team ran against its full label set within days of it becoming available. The models behind Bits and the platform's software are not named.

## Results, and how they were measured

- **Validation time.** "Validation time per label dropped by more than 95% in a single week." No baseline time is given.
- **Label quality.** "We observed roughly a 30% increase in the quality of root causes in the generated labels", meaning root causes that would hold up under a "5 Whys" analysis in a postmortem. The post does not say how this figure was measured or by whom.
- **Label volume.** "Embedding label creation in the product increased our label creation rate by an order of magnitude." No counts are given.
- **Effect of noise.** Regenerating narrow labels with a broader scope "reduced our pass rate by roughly 11% and decreased our label count by 35%." The post gives no pass rate before or after, and does not say whether the 11% is relative or in percentage points.
- **Scale.** "Every week, we run Bits against tens of thousands of scenarios drawn from real incidents."
- **A caught regression.** A new tool reasoning strategy looked great on a small subset of cases; "upon running the full set, we reported the regression immediately."

**Not measured:** absolute pass rates, and how the agent performs for customers in production.

## What failed

- **Manual labeling** burned engineering hours faster than it created labels, and later "manual review could not keep up" as label ingestion grew.
- **Clean snapshots.** "Without that noise, evaluation results looked better than they should have." The post compares it to "an open-book exam with only the relevant pages."
- **Narrow early labels.** Many had to be discarded and regenerated. "Snapshotting telemetry is a one-way door": "Once telemetry expires, its structure and signals cannot be reconstructed."

## What the team would do differently

The post names three lessons it would act on again, and sooner:

- **Invest in label collection and processing early.** People scale linearly, while evaluation needs grow faster as the agent expands into new domains.
- **Build the platform to be extensible from the start.** The team built a new agent architecture for a v2 release "only weeks after releasing the Bits Investigation Agent", which it credits to a platform designed to evolve with the agent.
- **Use evaluation data to steer product direction.** Segmented results show where Bits is weak, and the team adds labels there, even "for capabilities the agent does not yet support".

The platform now also serves other Datadog agents and teams, such as APM and Database Monitoring.

The wiki's reading: the team accepted a lower pass rate to get scores that track production. An evaluation set easier than the real environment reports progress that is not there. See [Building eval datasets](#eval-datasets).

## Disclosure

None.

## Sources

- Benjamin Barton, Datadog, [“How we built a real-world evaluation platform for autonomous SRE agents at scale”](https://www.datadoghq.com/blog/engineering/bits-ai-eval-platform/), Datadog engineering blog, 7 April 2026.

## Related

- [About playbooks](#about-playbooks)
- [Evaluating agents](#evaluating-agents)
- [Building eval datasets](#eval-datasets)
- [CI/CD for AI](#ci-cd-for-ai)
- [Incidents and on-call](#incidents-on-call)
