---
id: wayfair-package-damage-detection
book: 21
order: "21.56"
title: "Wayfair Tarragon: spotting damaged packages on the sorter with YOLO"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [logistics, computer-vision, object-detection, data-labeling, public-record]
visuals: []
type: playbook
account: public-record
industry: "Retail and e-commerce logistics (Wayfair fulfillment centers in the US)"
use_case: "Detecting damaged packages in scan-tunnel images on a warehouse sorter and diverting them to a manual review lane within less than one second"
outcome: "Best model performs over 12 times better than a no-skill baseline (3.3%) on holdout PR-AUC; cloud inference adds about 250 ms and stays within a 1s SLA; operational readiness validated at one warehouse"
measured_how: "Holdout PR-AUC against a no-skill baseline equal to the damage base rate; holdout size, period and absolute PR-AUC values not stated in the text (Wayfair Tech Blog, March 2026)"
prerequisites: [classification-metrics, labeling-annotation]
replications: []
---
> [!tldr]
> Wayfair built Tarragon, a YOLO-based computer vision model that checks scan-tunnel images on a warehouse sorter and flags damaged packages for manual review. The system has less than one second to analyze all images of a package and send a diversion signal. To find rare damaged examples to label, the team fine-tuned Gemini 2.0 Flash as a pre-selection classifier. The best model "performs over 12 times better than that No-skill baseline" on PR-AUC, but the post gives no live catch or false-diversion rates.

> [!note] From the public record
> Built from Wayfair's own published account, "Real-Time Package Damage Detection at Scale: Integrating YOLO in Warehouse Operations" (March 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post says quality control currently relies on manual visual inspections, which it calls "difficult to scale and prone to human error". Damaged shipments mean delayed replacements and frustrated customers, and this "also drives up our costs with increased logistical strain."

In a typical Wayfair Fulfillment Center in the US, packages pass through a scan tunnel on a high-speed sorter. Linear cameras capture high-resolution grayscale images from up to six angles. The sorter routes each package to the outbound shipping lane or to the Jackpot manual intervention lane. The time limit is strict: "the system has less than one second to analyze all images and transmit a diversion signal to the sorter hardware."

## Why this approach

To keep up with the sorting hardware, the team chose the YOLO architecture "for its inference efficiency". The post does not say which alternatives it considered. See [Visual grounding, detection and segmentation](#visual-grounding).

The obstacle was data. The post names "the lack of labeled data for our specific warehouse environment" as a significant challenge, and damage is rare, so finding damaged examples by hand was a "needle in a haystack" problem. The team built a hybrid pipeline that uses vision LLMs to choose which images humans label. Choosing the examples worth labeling is the subject of [Active learning and weak supervision](#active-learning-weak-supervision).

For serving, an edge device near the sorter is better for latency, but it needs an inference node next to each sorter, and across the global network that "quickly becomes unmanageable". The team chose a Vertex AI endpoint, "a common practice to deploy ML models at Wayfair". See [Edge and on-device AI](#edge-on-device) for that trade-off.

## The approach

1. **A shared damage scale.** With warehouse associates, the team split a zero-to-four scale: 0 to 2 needs no repair, while 3 or 4 (punctures, tears or significant crushing) needs re-taping or re-boxing.
2. **Pre-selection with a fine-tuned LLM.** The team fine-tuned Gemini 2.0 Flash "with a small amount of hand-labeled data" as a Damaged/NoDamage classifier to pre-select damaged images. Offshore annotators then validated defects and drew bounding boxes.
3. **Clean and noisy sets.** 20% of the data was double-annotated and 80% labeled by a single annotator. The vetted and corrected 20% served for validation and initial YOLO training, the 80% for training augmentation.
4. **Cloud scoring.** An Image Processor preprocesses the images and sends only pre-processed features to the cloud-hosted model. Decisions are cached for low-latency lookups and drive package diversion and downstream Pub/Sub consumers.
5. **A feedback loop.** At the Jackpot lane, associates see the images behind each assessment and log their final repair decisions in a database. The post says this data refines the model as package types and warehouse conditions change.

## The stack

As of March 2026: Tarragon, a YOLO-based detection model (the word YOLO links to the YOLOX repository on GitHub; no version is stated); Gemini 2.0 Flash, fine-tuned for pre-selection; a Vertex AI endpoint; an Image Processor, a decision cache (technology not named) and Pub/Sub consumers; scan tunnels with linear grayscale cameras.

## Results, and how they were measured

- **Detection quality.** The baseline is the damage base rate: "If we simply guessed based on how often damage usually occurs, we would be right only 3.3% of the time." Then: "Our best model performs over 12 times better than that No-skill baseline", measured as PR-AUC on a holdout set. The post shows holdout PR-AUC only in a chart of models trained on different mixes of clean and noisy data. See [Classification and regression metrics](#classification-metrics) for what PR-AUC measures.
- **Label agreement.** "Among the double-labeled set, our human annotators disagreed on 16% of the image-level Damage/No Damage labels." See [Label quality](#label-quality).
- **Labeling effort.** Pre-selection "saved months of manual effort", according to the post, which gives no measurement behind this.
- **Latency.** "While cloud inference adds about 250 ms of latency compared to running inference locally," it stays within the team's 1s Service-Level Agreement. The post calls the extra latency "a small price to pay" for a service that runs 7/24.
- **Deployment.** "We have successfully validated the operational readiness of the Tarragon model at our Erlanger, KY warehouse," with plans to scale it to the rest of the network.

**Not measured:** the text gives no absolute PR-AUC, no sizes of the labeled or holdout sets, no period, and no live figures such as damaged packages caught, false diversions or the precision of the Gemini pre-selection. The claim of "preventing millions in annual losses" comes without figures or method.

## What failed

- **Camera calibration.** "Early in development, we identified a camera calibration issue where images were consistently under or overexposed." The post calls this "a significant blocker". The fix took months of coordination with the hardware vendor, which is not named, and was completed in a single 12-hour maintenance window in early January.
- **Noisy labels.** Adding the single-labeled data at first hurt performance, though a larger, more diverse dataset ultimately improved it.
- **Diminishing returns.** "We found that more data isn't always better." Past a certain volume, which the post does not give, the model stopped improving.

## What the team would do differently

The post names nothing it would redo. Its lessons section names two things. Using generative AI to overcome the data scarcity barrier was "One of our most impactful strategic choices", in the form of fine-tuned multimodal LLMs that pre-select rare positive samples. And warehouse AI projects "must navigate physical realities", as the calibration work showed.

The wiki's reading: check the physical input chain early, because a camera fix can take months to schedule. Measure annotator agreement early, since 16% disagreement limits how sharply a holdout set can judge a model. And a ratio against a no-skill baseline does not show how many damaged packages the sorter catches or how many good ones it diverts.

## Disclosure

None.

## Sources

- Le Zhang, Jacob Baron and Yiman Hou, Wayfair, [“Real-Time Package Damage Detection at Scale: Integrating YOLO in Warehouse Operations”](https://www.aboutwayfair.com/careers/tech-blog/real-time-package-damage-detection-at-scale-integrating-yolo-in-warehouse-operations), Wayfair Tech Blog, 26 March 2026.

## Related

- [About playbooks](#about-playbooks)
- [Visual grounding, detection and segmentation](#visual-grounding)
- [Label quality: agreement, aggregation and label errors](#label-quality)
- [Active learning and weak supervision](#active-learning-weak-supervision)
- [Edge and on-device AI](#edge-on-device)
