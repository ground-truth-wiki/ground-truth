---
id: waymo-crash-rates-human-benchmarks
book: 22
order: "22.18"
title: Waymo's rider-only crash rates against human benchmarks, by crash type
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [autonomous-vehicles, safety-evaluation, benchmarks, statistics, public-record]
visuals: []
type: field-note
account: public-record
industry: "Transportation (driverless ride-hailing)"
use_case: "An SAE Level 4 automated driving system running a ride-hailing service with no driver behind the steering wheel"
outcome: "Crashed vehicle rates 79% lower for Any-Injury-Reported, 81% lower for Airbag Deployment and 85% lower for Suspected Serious Injury+ crashes than aligned human benchmarks, all locations combined"
measured_how: "Crashed vehicle rates in incidents per million miles over 56.7 million rider-only miles through January 2025 in Phoenix, San Francisco, Los Angeles and Austin, against human benchmarks from state police-reported crash and VMT data with a dynamic spatial benchmark adjustment, overall and in 11 crash type groups (Kusano et al., Waymo, 2025)"
prerequisites: [eval-statistics]
replications: []
---
> [!tldr]
> Waymo compared its driverless ride-hailing fleet with human benchmarks over 56.7 million miles through January 2025, split into 11 crash types. It reports significantly lower rates of Any-Injury-Reported, Airbag Deployment and Suspected Serious Injury+ crashes, with the largest total crash reduction in vehicle-to-vehicle intersection crashes. Benchmarks were aligned by vehicle type, road type and location.

> [!note] From the public record
> Built from Waymo's own published account, "Comparison of Waymo Rider-Only Crash Rates by Crash Type to Human Benchmarks at 56.7 Million Miles" (May 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Waymo runs a ride-hailing service with an SAE Level 4 automated driving system (ADS) in Rider-Only (RO) configuration, "without a driver behind the steering wheel". As of the study, it used Chrysler Pacifica (not actively in operation) and Jaguar I-Pace (active) vehicles, mostly on surface streets. It follows an earlier study of the first 7.1 million Waymo RO miles. Its disclosure reads: "All authors are employed by Waymo LLC."

## What happened

Most RO driving was in 2023 and beyond ("98% of the miles"). Through January 2025 the fleet drove 31.159 million miles in Phoenix, 18.260 million in San Francisco, 6.448 million in Los Angeles and 0.834 million in Austin.

The method:

1. **ADS data.** Crashes came from the NHTSA Standing General Order (SGO). "RO mileage was provided by the company via a public website."
2. **Human benchmarks.** "Human benchmarks were developed from state vehicle miles traveled (VMT) and police-reported crash data" from California, Arizona and Texas, mostly from 2022. Limited to passenger vehicles and surface streets, they were reweighted on level-13 S2 cells to match where the fleet drives.
3. **Crash types and outcomes.** Eleven crash type groups and three outcomes: Any-Injury-Reported, Airbag Deployment and Suspected Serious Injury+. Police-Reported and Any Property Damage or Injury results went to the online supplement as "considered less credible".
4. **Underreporting.** Only the Any-Injury-Reported benchmark was corrected, for the 33% of injury crashes estimated not to be reported to police.
5. **Serious injuries.** Police reports for the three SGO crashes reported as "Serious" or "Fatality" left two that qualified.
6. **Statistics.** 95% confidence intervals for the ratio of two Poisson rates, using Clopper-Pearson limits.

## Impact, and how it was measured

- **All crashes.** The study found "a statistically significant lower crashed vehicle rate" for all crashes in all three outcomes. All locations combined, Waymo had 48 Any-Injury-Reported events (0.85 against 4.04 incidents per million miles, -79%, 95% confidence interval -85% to -71%), 18 Airbag Deployment events (0.32 against 1.69, -81%, -90% to -69%) and 2 Suspected Serious Injury+ events (0.04 against 0.24, -85%, -99% to -39%).
- **Against the benchmark count.** The fleet had "181 fewer Any-Injury-Reported, 78 fewer Airbag Deployment, and 11 fewer Suspected Serious Injury+" crashes.
- **Los Angeles.** Its aggregate comparisons were not significant "due to limited mileage".
- **By crash type.** Vehicle-to-vehicle (V2V) intersection crashes represented "the largest total crash reduction", "with a 96% reduction in Any-injury-reported (87%-99% confidence interval)" and "a 91% reduction in Airbag Deployment (76%-98% confidence interval)". Cyclist, Motorcycle, Pedestrian, Secondary Crash, Single Vehicle and V2V Lateral crashes were also significantly reduced for Any-Injury-Reported in all locations combined.
- **Increases.** "There was no statistically significant disbenefit found in any of the 11 crash type groups." Splitting front-to-rear (F2R) crashes did find "a statistically significant increase in F2R Struck crashes at the Any-Injury-Reported outcome level in Phoenix".
- **Serious injuries.** Both were Secondary Crashes; in one, the Waymo vehicle was stationary in traffic. Without the dynamic benchmark adjustment, the reduction lost significance in Phoenix and San Francisco but stayed significant in all locations combined, so the authors present it "as an indication of a result".

**Not measured:** the study "did not account for crash contribution", made no multiple comparison corrections, did not adjust for time of day, had no Abbreviated Injury Scale codes for the ADS crashes, and had too few serious injury crashes to split that outcome by crash type; the RO mileage is self-reported.

## Why it happened

For Any-Injury-Reported and Airbag Deployment, the authors credit frequent crash modes: "By significantly reducing crashes in these frequent crash modes", the service achieved its overall reductions. Intersection crashes were 57% of Airbag Deployment and 39% of Any-Injury-Reported crashes in the mileage blended benchmark. In all of Waymo's 4 Any-Injury-Reported and 5 Airbag Deployment V2V intersection crashes, its vehicle was responding to another road user. The authors suggest the ADS gets its lower rate by "not initiating conflicts that lead to crashes at intersections".

## What changed afterwards

The paper reports no change to the service. It names further work: more ADS miles, more objective assessments of crash contribution, and continued monitoring of serious and fatal severity injury outcomes. Data files with full results and the list of SGO cases were published as supplemental downloads.

## Lessons

The source's lessons: the crash type breakdown "provides unique insight into the direction and magnitude of safety impact", and increases in sub-groups "should be considered in the context of the overall safety benefit of the system", citing red light enforcement cameras and front crash prevention systems, which reduced some crashes but increased rear-end crashes. The paper also warns that "care should be taken when considering the statistical significance of individual comparisons".

The wiki's reading:

- **The baseline is most of the method.** Most of the paper's methods section describes the human benchmark, not the fleet's crash count. See [How benchmarks are built and why they break](#benchmark-validity).
- **Rare outcomes give wide intervals.** Two serious injury crashes gave an interval of -99% to -39%, and significance in Phoenix and San Francisco hinged on one adjustment. See [Statistics for evals](#eval-statistics).
- **Split the aggregate.** A headline of no significant disbenefit sat beside a significant increase in one sub-group in one city. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Note who measured.** The operator wrote the study and supplied the mileage; the published case list and data files let others check it.

## Disclosure

None.

## Sources

- K. D. Kusano, J. M. Scanlon, Y. Chen, T. McMurry, T. Gode and T. Victor, Waymo, [“Comparison of Waymo Rider-Only Crash Rates by Crash Type to Human Benchmarks at 56.7 Million Miles”](https://blog.waymo.com/research/comparison-of-waymo-rider-only-crash-rates-by-crash-type-to-human-benchmarks/), Waymo research page (no date shown, tagged 2025), citing Traffic Injury Prevention 26(sup1), S8-S20, 2025, doi:10.1080/15389588.2025.2499887.
- Kristofer D. Kusano, John M. Scanlon, Yin-Hsiu Chen, Timothy L. McMurry, Tilia Gode and Trent Victor, Waymo LLC, [“Comparison of Waymo Rider-Only Crash Rates by Crash Type to Human Benchmarks at 56.7 Million Miles”](https://arxiv.org/abs/2505.01515), arXiv:2505.01515, 2 May 2025, marked "Accepted for publication in Traffic Injury Prevention". The full text, used for the methods, appendix and limitations.

## Related

- [About field notes](#about-field-notes)
- [Statistics for evals](#eval-statistics)
- [How benchmarks are built and why they break](#benchmark-validity)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Embodied and robotics agents](#embodied-agents)
