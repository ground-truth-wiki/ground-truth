---
id: waymo-software-recall
book: 22
order: "22.19"
title: "Waymo's voluntary software recall: two vehicles mispredict the same towed pickup truck"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [autonomous-vehicles, motion-prediction, recalls, incidents, public-record]
visuals: []
type: field-note
account: public-record
industry: "Transportation (autonomous ride-hailing)"
use_case: "Motion prediction in Waymo's 5th Generation Automated Driving System, fixed by a fleet-wide software update after two collisions with the same towed pickup truck"
outcome: "Two collisions in Phoenix on December 11, 2023 with no injuries and minor vehicle damage; the recall report lists 444 vehicles potentially involved, all updated between December 20, 2023 and January 12, 2024"
measured_how: "Descriptions of the two collisions and a dated timeline, with no fleet-level rates and no test results for the fix (Waymo blog post of February 13, 2024, and Waymo's Part 573 Safety Recall Report 24E-013 to NHTSA)"
prerequisites: [anomaly-drift-detection]
replications: []
---
> [!tldr]
> On December 11, 2023 in Phoenix, two Waymo vehicles hit the same pickup truck a few minutes apart. The pickup was being towed backwards and at an angle across two lanes, and Waymo says the Waymo AV "incorrectly predicted the future motion of the towed vehicle". Nobody was hurt, the whole fleet had a software fix by January 12, 2024, and Waymo then filed a voluntary recall with NHTSA.

> [!note] From the public record
> Built from Waymo's own published accounts, "Voluntary recall of our previous software" (February 2024) and its filing to the National Highway Traffic Safety Administration, "Part 573 Safety Recall Report 24E-013" (February 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Waymo runs driverless vehicles that carry ride-hail passengers. As of February 2024, its post says "we have driven over 10 million fully autonomous miles" and "served over 1 million ride-hail trips". The recalled equipment is, in the report's words, the "5th Generation Automated Driving System (ADS) prior to the 12/20/2023 driverless software release", with production dates of "MAR 17, 2022 - DEC 20, 2023". Waymo owns every affected vehicle and never sold or offered them for sale. Neither source describes how the system predicts the motion of other vehicles or what kind of model it uses.

## What happened

1. **December 11, 2023, Phoenix.** In the report's words, "a Waymo AV operating in Phoenix, Arizona made contact with a pickup truck being towed backwards and at an angle relative to the towing vehicle." The tow truck was "improperly traveling straight in the middle shared turn lane", and the pickup partly occupied the lane to its right. The Waymo vehicle was approaching from behind in that lane when its own front left made contact with the pickup. The tow truck did not pull over or stop.
2. **Minutes later.** The post says "a few minutes later another Waymo vehicle made contact with the same pickup truck", which the report says was "still occupying multiple lanes". "Neither Waymo vehicle was transporting riders at the time".
3. **After the collisions.** The post says that on December 11, 2023, Waymo informed the Phoenix Police Department and the Arizona Department of Public Safety of the two collisions. Per the report, Waymo escalated the events to its "Field Safety process" and "developed and evaluated an expedited software update to mitigate the issue".
4. **December 15, 2023.** Waymo informed NHTSA of the incidents.
5. **December 20, 2023.** Waymo began deploying the update. The post mentions "four subsequent conversations with NHTSA staff" between December 2023 and February 2024. The report dates further discussions with NHTSA on 12/20/2023, 1/17/2024, 2/5/2024 and 2/7/2024.
6. **January 12, 2024.** "Our entire fleet was updated with software to address this rare issue between December 20, 2023 and January 12, 2024."
7. **February 2024.** Waymo's Safety Board decided the circumstances "warranted submitting this report to NHTSA", a decision the report dates "2/7/2023", as printed. The post, dated February 13, 2024, says: "Earlier today, we voluntarily filed a recall report with the National Highway Traffic Safety Administration (NHTSA)". The report as NHTSA publishes it shows a submission date of "FEB 16, 2024".

## Impact, and how it was measured

The sources describe the impact in words and counts, not rates:

- **Harm.** "this unusual scenario resulted in no injuries and minor vehicle damage." The report adds: "The two events were both same-direction contacts and had low relative speeds."
- **Scope.** The report gives "Number of potentially involved : 444" and "Estimated percentage with defect : 100 %", and says "The affected vehicle population all have received the updated software."
- **Service.** "Our ride-hailing service is not and has not been interrupted by this update."
- **Risk.** Waymo's further analysis, per the report, "confirmed the low severity of the events" and an "exceptionally low likelihood" of meeting this configuration. Neither source publishes that analysis or a number.

**Not measured:** neither source gives speed figures, repair costs, how often this towing configuration occurs in Waymo's driving, or any test results for the fix. The post says Waymo was "rigorously testing, and validating a fix" but publishes no metrics.

## Why it happened

The post names the cause: "due to the persistent orientation mismatch of the towed pickup truck and tow truck combination", "the Waymo AV incorrectly predicted the future motion of the towed vehicle."

The report describes the configuration in more detail: "the rearmost axle of the towed vehicle had a significant steer angle applied", so the towed vehicle sat at a persistent angle and was "persistently not tracking behind the towing vehicle". It states the risk as: "Incorrect prediction of the future motion of another vehicle may result in an increased risk of a collision."

The report's "Description of the Cause" field reads "NR", which the form defines as "Not Reported". Neither source explains what in the software produced the wrong prediction, or why the second vehicle met the same pickup after the first contact.

## What changed afterwards

- **The fix.** "Software containing the remedy was deployed in a new software release." It reached the entire fleet by January 12, 2024, and "Production ADS-equipped vehicles receive the latest software release."
- **The recall.** "Typically a recall serves to inform the owner of a vehicle of a required repair." Here it "serves to inform the public of a software update that we began to deploy across our fleet in December 2023". Because Waymo had updated the vehicles it owns, the report says "there is no need for notifications to owners, dealers or distributors".
- **Nothing further reported.** Neither source describes other process changes, or data from traffic showing that the fix worked.

## Lessons

The post's own framing: "This voluntary recall reflects how seriously we take our responsibility to safely deploy our technology" and "to transparently communicate with the public."

The wiki's reading, for teams that put prediction software into the physical world:

- **Rare configurations are where predictors break.** A pickup towed backwards and steered across two lanes is an input ordinary traffic seldom produces. Flagging such inputs is the job of [anomaly and shift detection](#anomaly-drift-detection), and turning each into a permanent test case is the job of [eval datasets](#eval-datasets).
- **One model, many copies, the same mistake.** Every vehicle runs the same software, and the second contact followed the first within minutes. Treat one incident as a signal for the whole fleet. See [Incidents and on-call](#incidents-on-call).
- **A fleet fix is a release.** The sources do not say how the update was staged or checked. A fleet-wide fix deserves the same staged rollout and release gates as any model change. See [CI/CD for AI](#ci-cd-for-ai) and, for the physical setting, [Embodied and robotics agents](#embodied-agents).

## Disclosure

None.

## Sources

- Mauricio Peña, Chief Safety Officer, Waymo, [“Voluntary recall of our previous software”](https://waymo.com/blog/2024/02/voluntary-recall-of-our-previous-software/), Waymo blog (Company News), February 13, 2024.
- Waymo LLC, [“Part 573 Safety Recall Report 24E-013”](https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24E013-2218.PDF), submitted to the National Highway Traffic Safety Administration under 49 CFR §573, published by NHTSA, submission date FEB 16, 2024.

## Related

- [About field notes](#about-field-notes)
- [Anomaly detection and distribution shift](#anomaly-drift-detection)
- [Incidents and on-call](#incidents-on-call)
- [Embodied and robotics agents](#embodied-agents)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
