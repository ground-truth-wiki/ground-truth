---
id: meta-drp-investigations
book: 21
order: "21.75"
title: "Meta's DrP: on-call investigation playbooks written as code"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incident-response, on-call, observability, automation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Technology (large-scale online services)"
use_case: "Automating the investigation step of incident response: on-call playbooks written as code (analyzers) that run when an alert fires, with statistical and ML-based analysis libraries"
outcome: "Average MTTR improvement of 20% over the period of study for incidents that used DrP, compared with incidents that did not"
measured_how: "Time from detection to resolution of incidents that went through a post-mortem, DrP and non-DrP groups over a full year, quasi-experimental, thousands of incidents with no exact count (Meta, arXiv preprint, December 2025)"
prerequisites: [incidents-on-call]
replications: []
---
> [!tldr]
> Meta built DrP, a platform where teams write on-call investigation playbooks as code, called analyzers, that can run automatically when an alert fires. As of December 2025 it covered 300+ teams and executed 50K automated analyses per day, and the paper reports that "the average MTTR improvement over the period of study was 20%". The team first aimed for full automation, then pivoted to assisting on-call engineers.

> [!note] From the public record
> Built from Meta's own published account, "DrP: Meta's Efficient Investigations Platform at Scale" (December 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In the paper's words, "Investigation processes followed by on-call engineers are often manual or rely on ad-hoc scripts." On-call engineers relied on playbooks in wikis, and "These wikis often become outdated or incomplete, forcing engineers to depend on tribal knowledge and ad-hoc solutions." The abstract links this to slower mitigation, on-call toil, and hours or days spent triaging incidents. See [Incidents and on-call](#incidents-on-call).

## Why this approach

The idea is to "codify the manual playbooks and tribal knowledge prevalent in organizations". "We call such codified playbooks analyzers." The authors argue that the investigation step "has largely been ignored", while there is "a large body of work to improve alerting" and many domain-specific root cause analysis techniques. The paper does not describe other designs that were considered.

## The approach

1. **An SDK.** Teams write analyzers in Python or PHP, with typed APIs to query telemetry. Analyzers can call other analyzers, such as those of dependent services.
2. **Analysis libraries.** Fast dimensional analysis, anomaly detection, event isolation and time series correlation. "Event isolation assistance has a suite of ML-based ranking models." See [Anomaly detection and distribution shift](#anomaly-drift-detection).
3. **Backtesting.** Stored inputs and outputs of past analyses allow "integration tests on historical data (default 30 days) for modified analyzers", run during pull request review.
4. **Triggers and actions.** Alerts and SLO violations trigger analyzers, and a post-processing tier posts findings to the alert page and task or takes other actions. "The process from alert to analysis output typically takes a few minutes".

## The stack

As of December 2025: the DrP SDK in Python and PHP, "a MySQL backed queue store to persist the requests", worker tiers that run analyzer binaries, a multi-step CI/CD system with canary testing, and integrations with Meta's alerting systems, an internal SLO tool, team dashboards, a UI and a CLI. See [Observability and tracing](#observability-tracing). LLM-based libraries appear only as ongoing work: "We are also actively looking into integrating LLM based libraries into the DrP SDK as part of ongoing work."

## Results, and how they were measured

- **Scale.** "DrP has been running in production for the past 5 years and executes 50K automated analyses per day." The paper also reports "over 250K alerts processed every 30 days" and "over 99.9% availability of the DrP backend".
- **MTTR.** MTTR "is calculated as the time difference between detection and resolution timestamps." The study compared incidents "that used DrP during investigation" with incidents handled with manual or ad-hoc tools, over "a full year". Only incidents "that went through a post-mortem process" count, incidents with incomplete information were filtered out, and the paper speaks of "thousands of incidents" without an exact number. Result: "Overall, the average MTTR improvement over the period of study was 20%."
- **Adoption depth.** Teams with at least 10 analyzers "achieved substantially higher MTTR reductions ranging from 50% to 80%", and "Teams with fewer than 5 analyzers showed modest improvements (10-15%)". A table compares the MTTR of eight teams in equivalent periods before and after adopting DrP. Team 1 (136 analyzers) shows an 81.98% improvement, Team 3 (66 analyzers) 84.31%, and Team 8 (12 analyzers) 7.35%.
- **On-call load.** A simulation of three investigation scenarios counted steps as a proxy for on-call load: "the gains made by DrP in reduction of on-call load increases from 4X to 20X" as complexity grows.
- **One team.** Platform C, an ML robustness use case, used DrP to "reduce the P50 time to isolate the problematic prediction models from 3 hours to 30 minutes."

**Not measured:** the authors say their "quasi-experimental design cannot eliminate all potential confounds present in randomized controlled trials". The paper does not give the exact number of incidents or the calendar dates of the study year, and it does not separate the effect of the ML-based libraries from that of the codified playbooks.

## What failed

- **Full automation.** "Our initial vision was complete automation of the investigation workflows." Analyzers were hard to keep up to date, statistical and ML analysis "do result in false positives and negatives", and "engineers and on-calls don't always trust a fully automated system". The team pivoted "towards an assistive approach". See [Autonomy levels and human oversight](#autonomy-and-oversight).
- **Deployment.** Early inefficiencies and failures in the deployment system meant code was "sometimes taking days" to reach production. The paper gives a current p99 deployment time of 12 hours.
- **Testing.** "Initially, manual integration tests via CLI were recommended, but they were hard to enforce, causing runtime failures." The team built backtesting to solve this.
- **Data and upkeep.** Issues with observability data "made it hard to correlate data from different sources", and "Keeping analyzers up-to-date has had challenges that has needed continuous investment from teams."

## What the team would do differently

The paper's lessons: build a community of analyzer authors, invest in developer experience because "analyzer development is not the mainstream project for most software engineers", and integrate early with alerting, which gave "immediate relief to on-call engineers". Under the heading "Do not over-index on AI based systems for diagnosis", it concludes that "building analyzers with a combination of rule based suggestions based on community expertise augmented with AI is a better approach." For future work, the team is extending DrP with generative AI based analysis.

The wiki's reading: the 50% to 80% range for teams with at least 10 analyzers does not hold for every row of the paper's own table, since Team 8 has 12 analyzers and a 7.35% improvement. Teams that write many analyzers may also differ from other teams in ways that affect MTTR. The pivot to assistance fits the case for keeping a [human in the loop](#human-in-the-loop) when automated diagnosis can be wrong.

## Disclosure

None.

## Sources

- Shubham Somani, Vanish Talwar, Madhura Parikh, Eduardo Hernandez, Jimmy Wang, Shreya Shah, Chinmay Gandhi, Sanjay Sundarajan, Neeru Sharma, Srikanth Kamath, Nitin Gupta, Benjamin Renard, Ohad Yahalom and Chris Davis, Meta, [“DrP: Meta's Efficient Investigations Platform at Scale”](https://arxiv.org/abs/2512.04250), arXiv preprint 2512.04250 (cs.SE), version 1, 3 December 2025.

## Related

- [About playbooks](#about-playbooks)
- [Incidents and on-call](#incidents-on-call)
- [Observability and tracing](#observability-tracing)
- [Anomaly detection and distribution shift](#anomaly-drift-detection)
- [Autonomy levels and human oversight](#autonomy-and-oversight)
