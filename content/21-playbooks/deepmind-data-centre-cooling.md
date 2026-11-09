---
id: deepmind-data-centre-cooling
book: 21
order: "21.107"
title: Google data centre cooling under direct AI control
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [data-centres, industrial-control, energy-efficiency, autonomy, public-record]
visuals: []
type: playbook
account: public-record
industry: "Data centres (Google's own infrastructure)"
use_case: "A cloud-based AI that pulls a sensor snapshot every five minutes and directly controls data centre cooling, with its actions verified by the local control system and operators supervising"
outcome: "Consistent energy savings of around 30 percent on average after a matter of months; over nine months, performance rose from a 12 percent improvement at the initial launch of autonomous control to around a 30 percent improvement"
measured_how: "Cooling energy efficiency in kW/ton relative to the historical baseline before AI control, over nine months (graph from September 2017 to July 2018); the system runs in multiple Google data centres, but the post gives no number and does not say which sites the figures cover (DeepMind and Google blog post, 17 August 2018)"
prerequisites: [autonomy-and-oversight, ai-energy]
replications: []
---
> [!tldr]
> DeepMind and Google moved an AI system for Google's data centre cooling from recommendations, carried out by hand, to controlling the cooling directly, behind several safety checks. The post reports energy savings "of around 30 percent on average". Measured in kW/ton against the historical baseline before AI control, performance rose over nine months from a 12 percent improvement at the initial launch of autonomous control to around a 30 percent improvement.

> [!note] From the public record
> Built from DeepMind and Google's own published account, "Safety-first AI for autonomous data centre cooling and industrial control" (August 2018), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In 2016, DeepMind and Google built an AI-powered recommendation system to improve the energy efficiency of Google's data centres, which the post describes as already highly optimised. The reasoning was that "even minor improvements would provide significant energy savings" and reduce CO2 emissions (see [Energy, power and AI data centers](#ai-energy)).

Operators said the system had taught them new best practices, such as spreading the cooling load across more, rather than less, equipment. But "implementing the recommendations required too much operator effort and supervision." They asked whether similar savings were possible without manual implementation.

## Why this approach

The answer, prompted by that feedback, was to let the AI act: "our AI system is directly controlling data centre cooling", while operators supervise it. The post does not describe other designs the team weighed.

The post describes one deliberate limit on the controller. The team "purposefully constrained the system’s optimisation boundaries" to a narrower operating regime to put safety and reliability first, which the post calls "a risk/reward trade off in terms of energy reductions." See [Autonomy levels and human oversight](#autonomy-and-oversight).

## The approach

As the post describes it, the control loop has four steps:

1. **Sense.** Every five minutes, the cloud-based AI "pulls a snapshot of the data centre cooling system from thousands of sensors".
2. **Predict.** Deep neural networks "predict how different combinations of potential actions will affect future energy consumption".
3. **Choose.** The system picks the actions that minimise energy consumption "while satisfying a robust set of safety constraints."
4. **Check and act.** The actions go back to the data centre, where the local control system verifies them before they are implemented.

The post says the team uses "eight different mechanisms" so that the system behaves as intended. The text explains two:

- **Uncertainty estimation.** The agent calculates its confidence in every potential action. "Actions with low confidence are eliminated from consideration."
- **Two-layer verification.** Actions are vetted against safety constraints defined by the data centre operators, then checked again by the local control system against its own constraints.

A graphic lists the other six: continuous monitoring, automatic failover to a neutral state, smooth transfer during failovers, constant communication between the cloud and the physical infrastructure, rules and heuristics as a backup, and a human override that "will supersede any AI actions." Operators can exit AI control mode at any time, and control then passes to the on-site rules and heuristics. See [Human in the loop](#human-in-the-loop) and [Guardrails and control](#guardrails-control).

## The stack

As of August 2018, the post names a cloud-based AI system, deep neural networks, thousands of sensors on the cooling system, and the local control system at the data centre, with on-site rules and heuristics as the fallback. It does not name a model architecture, training method, framework, cloud product, or the cooling equipment the system controls.

## Results, and how they were measured

- **Energy savings.** After "only a matter of months", "the system is already delivering consistent energy savings of around 30 percent on average, with further expected improvements."
- **Trend.** "Over nine months, our AI control system performance increases from a 12 percent improvement", at the initial launch of autonomous control, "to around a 30 percent improvement."
- **Metric and baseline.** Performance is measured by "a common industry metric for cooling energy efficiency, kW/ton (or energy input per ton of cooling achieved)", "relative to the historical baseline before AI control."
- **The graph.** Its description says it covers September 2017 to July 2018 and plots "Trailing twelve-month AI performance" next to a rising number of training examples. The post says "these systems get better over time with more data".
- **Sites.** The system runs "in multiple Google data centres".
- **An operator's observation.** An operator describes the AI learning "to take advantage of winter conditions and produce colder than normal water", which reduces the energy needed for cooling.

**Not measured:** The post gives no number of data centres, no absolute energy, cost or CO2 figures, and no results per site. It does not say how the baseline accounts for weather or load, reports no failovers, incidents or rollbacks during operation, and gives no figure for the 2016 recommendation system.

## What failed

- **Recommendations took too much effort.** Operators found that carrying out the 2016 system's advice by hand took too much effort and supervision.
- **Energy reductions traded for safety.** The post says the narrower operating regime means a risk/reward trade-off in energy reductions.
- **Failures in operation.** The post reports none. Failover and the rules-based backup are described as design features, not as events.

## What the team would do differently

The post states no lessons about what it would redo. It states plans instead: "Our optimisation boundaries will also be expanded as the technology matures", and it expects further gains with more data. It closes by saying "data centres are just the beginning" and that the approach could apply in other industrial settings.

The wiki's reading:

- **Let the model propose and something simpler check.** Constraint checks in the cloud and in the local control system stand between the neural networks and the plant, and a rules-based mode takes over on exit. In this design, the learned model is not the last line of defence.
- **Advice has a cost.** The recommendation system was limited by the effort it took operators to carry it out, a cost that accuracy figures alone would not show.
- **Ask what the baseline controls for.** A gain against a historical baseline can mix the controller's effect with weather and load, and the post does not describe an adjustment for them. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure


None.

## Sources

- Chris Gamble and Jim Gao, DeepMind and Google, [“Safety-first AI for autonomous data centre cooling and industrial control”](https://deepmind.google/discover/blog/safety-first-ai-for-autonomous-data-centre-cooling-and-industrial-control/), Google DeepMind blog, 17 August 2018.

## Related

- [About playbooks](#about-playbooks)
- [Autonomy levels and human oversight](#autonomy-and-oversight)
- [Guardrails and control](#guardrails-control)
- [Energy, power and AI data centers](#ai-energy)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
