---
id: msf-antibiogo
book: 21
order: "21.90"
title: "Antibiogo: a smartphone app that reads antibiotic susceptibility tests"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, computer-vision, expert-systems, medical-devices, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (clinical microbiology laboratories in low- and middle-income countries)"
use_case: "A smartphone app that semi-automatically measures inhibition zones on antimicrobial susceptibility tests with image processing and machine learning, then applies expert rules to give S/I/R results to laboratory technicians"
outcome: "Overall category agreement with an expert microbiologist of 88.8% (95% CI 87.9–89.7), ranging per pathogen from 67.1% to 98.1%; 10.2% minor, 1.6% major and 0.25% very major discrepancies"
measured_how: "Clinical performance evaluation under European in-vitro diagnostic regulations, 378 fresh isolates of 11 pathogens in three laboratories (Amman, Koutiala, Dakar) in 2022, against an expert microbiologist masked to the app's interpretation (Rapoud et al., MSF Scientific Day abstract, May 2024)"
prerequisites: [classification-metrics, edge-on-device]
replications: []
---
> [!tldr]
> The Médecins Sans Frontières (MSF) Foundation built Antibiogo, a smartphone app that helps laboratory technicians read and interpret antimicrobial susceptibility tests where expert microbiologists are scarce. In a 2022 evaluation in three laboratories, "The overall category agreement was 88.8% (95% CI 87.9–89.7)" against an expert microbiologist, but only 67.1% for *Pseudomonas aeruginosa*. The app was CE-marked in 2022 and, as of January 2024, had been implemented in five MSF laboratories and in public laboratories in Mali.

> [!note] From the public record
> Built from MSF's own published account, "Antibiogo as an innovative solution to detect antimicrobial resistance: from an operational need to a CE-marked diagnostic test available for low-income and middle-income countries" (May 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The account is a conference abstract and its slide deck. The abstract starts from antimicrobial resistance (AMR), which "could cause 10 million deaths per year by 2050". But for antimicrobial susceptibility testing (AST), "interpretation is complex and requires expert clinical microbiologists", who are lacking in low- and middle-income countries (LMIC). The slides split AST into two steps: measuring the inhibition zone, then interpreting it and applying expert rules.

The slides say where the need came from. In the laboratories MSF built from scratch, and in local ones it assessed and supported, they report "Always same observation: Absence of interpretation". The abstract adds: "It will take 400 years to address the shortfall of microbiologists in LMIC at the present rate of training."

## Why this approach

Neither source describes alternatives that were weighed. The abstract's answer to the shortfall: "In the meantime, technology can help fill the gap." The app supports laboratory technicians, with the "Possibility of sending report for approval by external microbiologist" (see [Human in the loop](#human-in-the-loop)).

The team also built a regulated product: "Antibiogo is not an App, it is a Software as medical device". That meant technical documentation, a quality management system as per ISO 13485, and a clinical evaluation under EU rules for medical devices.

## The approach

"Antibiogo combines image processing, machine learning, and expert system technologies" to give a final result: Susceptible, Intermediate or Resistant (S/I/R). The slides list the steps:

1. The technician takes a picture.
2. Image processing and AI give a "semi automatic measurement of IZD", the inhibition zone diameters.
3. An expert system applies breakpoints and expert rules.
4. The app identifies resistance mechanisms, raises an "IPC alert in case of MDR", returns results with comments to technicians and clinicians, and extrapolates to antibiotics not tested.

**The evaluation (2022).** Three laboratories took part: the MSF Reconstructive Surgery Hospital in Amman (Jordan), the MSF Paediatric Hospital in Koutiala (Mali) and the Pasteur Institute in Dakar (Senegal). Routine clinical AST was processed in parallel with Antibiogo. An expert microbiologist "masked to Antibiogo interpretation" interpreted the pictures and the zone diameters measured with the app. The slides add weekly quality controls with reference strains and daily Antibiogo quality checks, and classify disagreements, with the microbiologist as "Gold standard":

- **Minor:** one side says I, the other S or R.
- **Major:** the microbiologist says S, Antibiogo says R.
- **Very major:** the microbiologist says R, Antibiogo says S.

**The rollout.** Implementation was done "by an Antibiogo team member", with 5 days of training: 2 hours on Antibiogo, the rest on good AST practices. A qualitative survey followed after implementation and 3 months later. Mali was the "first national scale up", in "Sept 2023", with 7 hospitals "between Sept-Nov 23".

## The stack

As of May 2024, the slides describe a "Smartphone based application, Free, Offline and open source" (see [Edge and on-device AI](#edge-on-device)): image processing and AI give a semi-automatic measurement of the zones, and an expert system applies breakpoints and expert rules. Neither source names models, training data, libraries or supported phones.

## Results, and how they were measured

The abstract reports on 378 fresh isolates of 11 different pathogens:

- **Agreement.** "The overall category agreement was 88.8% (95% CI 87.9–89.7)". By pathogen it ranged "from 67.1% (63.2–70.8) (for Pseudomonas aeruginosa)" to 98.1% (94.4–99.6) for *Haemophilus influenzae*.
- **Discrepancies.** Minor (mD), major (MD) and very major (VMD) discrepancies were "10.2% (9.4–11.1) mD, 1.6% MD (1.2–2.3), and 0.25% VMD (0.08–0.59)." The slides give the ISO requirement as below 3% for VMD and MD.
- **Validation.** "From these results, Antibiogo was validated for 11 WHO priority pathogens."
- **Regulation.** "it became the first MSF CE-marked in-vitro diagnostic (IVD) test in May 2022."
- **Use.** "As of January 2024, it has been implemented in five MSF laboratories" (Central African Republic, Democratic Republic of the Congo, Jordan, Mali, Yemen), and in public laboratories in Mali at the Ministry of Health's request.

The two documents differ in places. The slides count 454 isolates and give "Category Agreement" as "89,8%" and a weighted kappa of 0.84 (95% CI: 0.83-0.84). Their method diagram shows 2 external microbiologists. The slide headed "CE mark: greenlight for routine use" is dated "Sept 2022". Neither source explains these differences.

**Not measured:** neither source reports performance in routine use, test volumes, turnaround times, or effects on treatment or patients, and the survey results are not given.

## What failed

- **Lowest agreement for one pathogen.** *Pseudomonas aeruginosa* is the low end of the abstract's per-pathogen range; the slides give 67.05% across 607 pathogen-antibiotic combinations, with a kappa of 0.50.
- **Mostly minor disagreements.** The slides note "Majority of disagreement: minor especially with the introduction of S, IE category in 2019".
- **Still under evaluation.** The slides list *Acinetobacter baumanii* and some enterobacteria (*Enterobacter*, *Citrobacter*, *Serratia*) as under evaluation in Laos and Kenya.
- **Trust.** The slides give Yemen as an example of reluctance and a fear of the black box. See [Explaining model predictions](#model-interpretability).

## What the team would do differently

The sources state no regrets. A slide headed "Lessons learned from Antibiogo" lists: "Health centric and Not technology centric", data protection and data ownership, human autonomy and capacity building, safety, effectiveness and transparency, a responsive and sustainable tool, and affordability.

Next steps: the abstract says "an improved version of the app will be released in 2024". The slides list "development of new features: surveillance and training" in parallel to the scale up. A slide headed "After one year of routine use in MSF hospitals, ready for scale up" lists Cameroon (7 labs), the Central African Republic (3), Ivory Coast (20) and Liberia (4), without saying whether these were done or planned. A slide headed "Antibiogo, In 2025" lists free access for LMIC laboratories on the Play Store, self-training tools on the website, routine use for patient management, and finding the organization and set-up to manage scale up and sustainable funding.

The wiki's reading: the design keeps the learned part narrow (measuring zones) and leaves interpretation to explicit rules. An overall figure can hide a weak class: 88.8% overall sits beside 67.1% for one pathogen, so report per class (see [Classification and regression metrics](#classification-metrics)). And the reference is an expert's reading, so the figures measure agreement with that expert (see [Label quality](#label-quality)).

## Disclosure

None.

## Sources

- Rapoud D, Cramer E, Al Asmar M, Sagara F, Ndiaye B, Dieye Y, Lover AA, Malou N, Médecins Sans Frontières, [“Antibiogo as an innovative solution to detect antimicrobial resistance: from an operational need to a CE-marked diagnostic test available for low-income and middle-income countries”](https://scienceportal.msf.org/assets/8782), abstract, MSF Scientific Day International 2024, MSF Science Portal, 16 May 2024, doi:10.57740/rxwuURR8.
- Rapoud D, Cramer E, Al Asmar M, Sagara F, Ndiaye B, Dieye Y, Lover AA, Malou N, Médecins Sans Frontières, [“Antibiogo as an innovative solution to detect antimicrobial resistance: from an operational need to a CE-marked diagnostic test available for low-income and middle-income countries”](https://scienceportal.msf.org/assets/8795), slide presentation (PDF), MSF Scientific Day International 2024, MSF Science Portal, 16 May 2024, doi:10.57740/2acXDPpuix.

## Related

- [About playbooks](#about-playbooks)
- [Classification and regression metrics](#classification-metrics)
- [Edge and on-device AI](#edge-on-device)
- [Label quality: agreement, aggregation and label errors](#label-quality)
- [Human in the loop](#human-in-the-loop)
