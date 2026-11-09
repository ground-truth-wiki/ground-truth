---
id: ntsb-uber-atg-tempe-crash
book: 22
order: "22.17"
title: "Uber ATG's test vehicle crash in Tempe: what the NTSB found"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [autonomous-vehicles, human-oversight, automation-complacency, safety-culture, public-record]
visuals: []
type: field-note
account: public-record
industry: "Transportation (automated vehicle testing)"
use_case: "Public-road testing of a developmental automated driving system, with one human operator as the backup"
outcome: "A test vehicle in autonomous mode struck and fatally injured a pedestrian; the system detected her 5.6 seconds before impact but never classified her as a pedestrian"
measured_how: "NTSB investigation of one crash trip on 18 March 2018 using ADS data, camera video, HMI data and phone records, plus Volvo and ATG simulations; no fleet-level rates (NTSB/HAR-19/03, November 2019)"
prerequisites: [autonomy-and-oversight]
replications: []
---
> [!tldr]
> On 18 March 2018, a Volvo XC90 controlled by Uber ATG's developmental automated driving system fatally injured a pedestrian in Tempe, Arizona. The system detected her 5.6 seconds before impact but "never accurately classified her as a pedestrian or predicted her path". The design relied on the operator, who was distracted by her phone. The NTSB found the probable cause in her failure to monitor, with contributing factors at ATG "all a consequence of its inadequate safety culture".

> [!note] From the public record
> Built from an official record: the National Transportation Safety Board's accident report, "Collision Between Vehicle Controlled by Developmental Automated Driving System and Pedestrian, Tempe, Arizona, March 18, 2018" (November 2019), linked under Sources. Neither its authors nor the team wrote or reviewed this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

As of the crash, the Uber Advanced Technologies Group (ATG) tested its automated driving system (ADS), software version 2018.071.3pl, in modified 2017 Volvo XC90s on premapped routes on public roads, at a maximum speed of 45 mph. One operator in the driver's seat had to monitor it and take control in an emergency. In September and October 2017, ATG had gone from two people per vehicle to one after adding a tablet interface, a change it said "allowed the company to increase the number of test vehicles".

Volvo's own forward collision warning (FCW) and automatic emergency braking (AEB) were off whenever the ADS drove: according to both companies, the radars of both systems operated on the same frequencies, and the brake module had not been designed to assign priority between their braking commands. And on detecting an emergency, the ADS suppressed braking for 1 second without alerting the operator, which ATG did "because of concerns about false alarms". If maximum allowed braking (0.71 g) could not then avoid a collision, the ADS was designed not to apply it only to mitigate the crash.

## What happened

At 9:58 p.m. on 18 March 2018, the vehicle was travelling in autonomous mode at 45 mph on N. Mill Avenue when a pedestrian pushing a bicycle began crossing where there was no crosswalk.

1. **5.6 seconds before impact,** radar detected her as a vehicle. Her classification then alternated between vehicle, other and bicycle. After each change the system ignored her tracking history, so it could not correctly predict her path.
2. **1.2 seconds before impact,** the system placed her on its path, recognized an emergency and suppressed braking for 1 second.
3. **0.2 seconds before impact,** it sounded an alert and initiated a plan for a gradual slowdown.
4. **0.02 seconds before impact,** the operator began steering, at a speed of 39 mph.

Phone records showed the operator was streaming a television show; she looked back at the road about 1 second before impact.

## Impact, and how it was measured

The pedestrian died. The NTSB used ADS data, video, phone records, site observations and simulations.

- **Detection.** "The ADS detected the pedestrian 5.6 seconds before impact", but "the system design did not include consideration for jaywalking pedestrians".
- **Attention.** While the vehicle was moving, the operator "spent 34 percent of her time gazing down toward the bottom of the center console". Had she been attentive, the NTSB estimates, she would have had 2 to 4 seconds to detect and respond.
- **The switched-off layer.** Volvo's simulation, assuming ideal sensors, showed "the FCW would have alerted the driver 2.5 seconds before impact, and that the AEB would have activated 1.4 seconds before impact". With AEB alone and no driver response, it predicted no collision in 17 out of 20 variations of the pedestrian's movement.

**Not measured:** the report gives no autonomous miles or disengagement rates for the fleet, and it describes ATG's later changes without measuring their effect.

## Why it happened

The probable cause was "the failure of the vehicle operator to monitor the driving environment and the operation of the automated driving system". Contributing were ATG's "(1) inadequate safety risk assessment procedures, (2) ineffective oversight of vehicle operators", and (3) lack of adequate mechanisms for addressing operators' automation complacency, "all a consequence of its inadequate safety culture". Further factors were the impaired pedestrian's crossing outside a crosswalk and the Arizona Department of Transportation's "insufficient oversight of automated vehicle testing".

The report calls the operator's distraction "a typical effect of automation complacency". Yet in ATG's design, the "primary countermeasure in an emergency situation was the vehicle operator". ATG had inward-facing cameras, but "supervisors said that they rarely reviewed the camera videos", and it had no safety division or formal safety plan.

## What changed afterwards

ATG stopped public-road testing on 19 March 2018 and resumed on 20 December 2018, as of the report only on a 1-mile loop in Pittsburgh at up to 25 mph. The report describes these changes by ATG:

- Volvo's FCW and AEB stay on during ADS operation, and the ADS no longer suppresses braking: it brakes "even if only to mitigate a crash".
- Path prediction allows for jaywalking and keeps tracking history across reclassifications. In ATG's simulation, its September 2018 software would have detected and classified the pedestrian "at a distance of about 88 meters (290 feet), 4.5 seconds before impact".
- Two "mission specialists" per vehicle, new training, and a Nauto fleet management system that chimes when the driver's-seat specialist looks away from the road for several seconds and reports to a supervisor.
- A separate safety department. ATG has begun establishing a safety management system (SMS) and expects full implementation to take 4 to 5 years.

The NTSB found that keeping Volvo's FCW and AEB available "added a layer of safety redundancy", and that the second operator with attentiveness monitoring "begins to address the oversight deficiencies". It recommended that ATG complete the implementation of its SMS.

## Lessons

The NTSB's own conclusion: because the ADS was developmental, "with associated limitations and expectations of failure", the risk from its limitations "depends on safety redundancies and mitigation strategies".

The wiki's reading, for teams relying on a person to catch AI errors:

- **A human monitor is a weak layer on its own.** The report, citing research: "the better the automation system, the more likely the operator is to become complacent". See [autonomy levels and human oversight](#autonomy-and-oversight) and [human in the loop](#human-in-the-loop).
- **Count the layers before removing one.** Each removal had a stated reason; together they left the operator as the last layer. See [safety cases](#safety-cases).
- **Monitoring nobody reviews is not oversight.** See [AI risk management](#ai-risk-management).

## Disclosure

None.

## Sources

- National Transportation Safety Board (no individual authors listed), [“Collision Between Vehicle Controlled by Developmental Automated Driving System and Pedestrian, Tempe, Arizona, March 18, 2018”](https://ntsb.gov/investigations/accidentreports/reports/har1903.pdf), Highway Accident Report NTSB/HAR-19/03 (PB2019-101402), adopted 19 November 2019, corrected copy reissued 26 June 2020 (PDF).
- National Transportation Safety Board, [“Collision Between Vehicle Controlled by Developmental Automated Driving System and Pedestrian”](https://www.ntsb.gov/investigations/Pages/HWY18MH010.aspx), investigation page HWY18MH010, ntsb.gov, undated.

## Related

- [About field notes](#about-field-notes)
- [Autonomy levels and human oversight](#autonomy-and-oversight)
- [Human in the loop](#human-in-the-loop)
- [AI risk management and impact assessments](#ai-risk-management)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
