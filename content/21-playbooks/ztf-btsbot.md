---
id: ztf-btsbot
book: 21
order: "21.105"
title: "BTSbot: a CNN that scans sky-survey alerts and triggers spectroscopic follow-up"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [astronomy, convolutional-networks, alert-triage, automation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Education and research (time-domain astronomy, Zwicky Transient Facility)"
use_case: "A multi-modal CNN that scores ZTF alerts as bright transients, then automatically saves them and requests spectroscopic follow-up for the Bright Transient Survey, work human scanners did daily"
outcome: "Test split: all bright transients recovered, purity 84.6% (bts_p1) and 93.0% (bts_p2), on par with scanners in speed; October 2023 in production: 296 sources selected, 93% real extragalactic transients"
measured_how: "Completeness, purity and time to save or trigger against human scanners on a held-out 10% test split and a 41-night present-day sample before launch, plus one month of production, October 2023 (Rehemtulla et al., arXiv, January 2024)"
prerequisites: [convolutional-networks, classification-metrics]
replications: []
---
> [!tldr]
> The Zwicky Transient Facility's Bright Transient Survey (BTS) built BTSbot, a multi-modal convolutional neural network that picks bright transients from survey alerts and requests their spectra without a human scanner. It "recovers all bright transients in our test split", as fast as scanners but at slightly lower purity. In production in October 2023 it selected 296 sources, "93% of which were real extragalactic transients".

> [!note] From the public record
> Built from the ZTF Bright Transient Survey team's own published account, "The Zwicky Transient Facility Bright Transient Survey. III. BTSbot: Automated Identification and Follow-up of Bright Transients with Deep Learning" (January 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

BTS aims to obtain a classification spectrum for every bright extragalactic transient (peak magnitude 18.5 or brighter) in the ZTF public survey. The BTS alert filter cuts the survey's more than 10⁵ alerts per night to about 50 new candidates, of which about 7 are new real bright transients. Experts ("scanners") inspect every candidate and request spectra for the real ones. Scanning "has required a significant time investment" over about 5 years. The paper expects the nightly data rate of the Vera C. Rubin Observatory's LSST to "significantly surpass our collective capacity for human scanning".

## Why this approach

Models that use extracted features alone, the paper says, ignore "potentially valuable information present in the images". BTSbot takes image cutouts and extracted features together. See [Convolutional neural networks](#convolutional-networks). It gets custom features computed from the light curve, not the full curve, partly because "there is no established method in the literature" for representing partial light curves of so many source types.

On the test split, an images-only CNN reached 94.3% completeness and a features-only network 99.8%, against 100.0% for the multi-modal model, which also had the highest purity.

## The approach

1. **Training data.** Labels come from past BTS data: spectroscopically confirmed bright extragalactic transients are positives; variable sources, dim transients and candidates scanners never saved are negatives. The set held 608,943 alerts from 19,558 sources, split by source 81%, 9% and 10% into train, validation and test (see [Validation, tuning and leakage](#validation-tuning)).
2. **Inputs.** Each alert gives a 63×63×3 image of science, reference and difference cutouts plus 25 extracted features, including custom ones such as days since peak.
3. **Model.** A VGG-like image branch and a dense feature branch feed layers that output a score between 0 and 1. Of 20 trials with different initializations, the one with the best test split performance became the production model.
4. **Policies.** Scores are per alert; follow-up is per source. Under bts_p1, a source with at least two alerts scoring 0.5 or more at magnitude 19 or brighter is saved and the SED machine (SEDM) spectrograph is triggered at priority 1. bts_p2 also needs one alert at 18.5 mag or brighter and triggers at priority 2.
5. **Integration.** The alert broker Kowalski adds BTSbot's score to each alert packet. Candidates go to Fritz, ZTF's marshal, and auto-saving and auto-triggering filters for each policy save sources and trigger SEDM. Each action is posted as a comment on the source page, where scanners can see it and modify the trigger (see [Human in the loop](#human-in-the-loop)).

## The stack

As of January 2024: TensorFlow with the Keras API, the Adam optimizer and Weights and Biases sweeps. Kowalski stores alerts in MongoDB. SEDM spectra are reduced by pySEDM, classified by SNIascore or a scanner, and reported to the Transient Name Server (TNS). Training took about 32 hours on an Intel Xeon 6230 CPU; inference takes "less than a hundredth of a second on a laptop CPU" per alert.

## Results, and how they were measured

**Test split.** Completeness (share of bright transients the policy selects) and purity (share of selected sources that are actually bright transients) are counted per source under each policy (see [Classification and regression metrics](#classification-metrics)).

- "BTSbot recovers all bright transients in our test split and performs on par with scanners in terms of identification speed". Median differences were -0.0381 days to save and -0.0147 days to trigger, BTSbot first.
- "Overall purity for bts_p2 is 93.0%, and overall purity for bts_p1 is 84.6%."
- Scanner purity over the present-day window below is "98.5% scanner saving purity" and "96.7% scanner triggering purity"; the comparison uses 95.6% for triggering, where "BTSbot’s purity falls slightly" short.

**Present-day sample.** To check for data shift, the team simulated BTSbot on alerts from 19 August to 29 September 2023, before launch: 251 bright transients and 1,652 non-bright transients. Completeness was 98.7% and purity 81.0% (bts_p1) and 92.0% (bts_p2). See [Anomaly detection and distribution shift](#anomaly-drift-detection).

**Production.** In October 2023, BTSbot "selected 296 sources in real-time, 93% of which were real extragalactic transients" (92.6% in the body), running v1.0; the paper presents v1.0.1 and says "Both versions yield nearly identical performance." SN 2023tyk became "the first transient to be fully automatically detected, identified, spectroscopically classified, and publicly reported".

**Not measured:** no figure for scanner time saved, although the abstract describes "a significant reduction in the human-time needed to scan", and no count of bright transients missed in production.

## What failed

- **Purity.** More conservative policies could raise it, likely "at the cost of completeness or speed".
- **False positives.** On the test split, bts_p1 had 92 false positives and 0 false negatives; 53 were real dim transients, and nearly all others were cataclysmic variables (CVs), active galactic nuclei (AGN) or quasars. Many bts_p2 false positives are CVs, which "could be better rejected by increasing the score threshold to 0.8".
- **Limits.** Scanning also involves retrieving host galaxy redshifts from NED and classifications from TNS, tasks that the paper says "remain to be automated or made more efficient". The authors call a comprehensive transition to automated scanning "unlikely (and not necessarily desirable)".

## What the team would do differently

The paper does not state what the team would do differently. Its design "prioritized completeness of bright transients over other metrics like purity and speed", and after a few months in production new policies focused on purity were put in place to run BTSbot "with minimal intervention".

The wiki's reading: one model gave 84.6% or 93.0% purity depending on the policy, so the policy layer, not the model, decides how much spectrograph time borderline sources get. Because the production model was picked on the test split, the 20-trial median test accuracy (94.1%, against 94.9%) and the present-day sample are fairer checks.

## Disclosure

None.

## Sources

- Nabeel Rehemtulla, Adam A. Miller, Theophile Jegou Du Laz, Michael W. Coughlin, Christoffer Fremling, Daniel A. Perley, Yu-Jing Qin, Jesper Sollerman, Ashish A. Mahabal, Russ R. Laher, Reed Riddle, Ben Rusholme and Shrinivas R. Kulkarni, Northwestern University, California Institute of Technology, University of Minnesota, Liverpool John Moores University and Stockholm University, [“The Zwicky Transient Facility Bright Transient Survey. III. BTSbot: Automated Identification and Follow-up of Bright Transients with Deep Learning”](https://arxiv.org/abs/2401.15167), arXiv 2401.15167 (astro-ph.IM), version 1, 26 January 2024.

## Related

- [About playbooks](#about-playbooks)
- [AI for science, math and code](#ai-for-science)
- [Convolutional neural networks](#convolutional-networks)
- [Classification and regression metrics](#classification-metrics)
- [Human in the loop](#human-in-the-loop)
