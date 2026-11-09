---
id: apple-photos-people-recognition
book: 21
order: "21.6"
title: "Apple Photos: recognizing people on the device"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [computer-vision, on-device, embeddings, clustering, public-record]
visuals: []
type: playbook
account: public-record
industry: "Consumer software (the Photos app on iOS, iPad OS and Mac OS)"
use_case: "Recognizing the people in a user's photo library on the device: grouping them into a gallery of known people and assigning new person observations to them"
outcome: "Face embedding generation in less than 4ms on recent iOS hardware, an 8x improvement over an equivalent model on GPU; worst-subset accuracy 0.86 and best-subset accuracy 0.96 for the final training method"
measured_how: "Latency on unnamed recent iOS hardware; accuracy on the worst and best performing subsets of a large and diverse dataset of unstated size; no period stated (Apple Machine Learning Research, July 2021)"
prerequisites: [representation-learning, edge-on-device]
replications: []
---
> [!tldr]
> Apple built people recognition for Photos that runs entirely on the device: embeddings of faces and upper bodies, a two-pass clustering into a gallery of known people, and sparse coding to assign new observations. Apple reports face embeddings in "less than 4ms" on recent iOS hardware and a worst-subset accuracy of 0.86 for its final training method. It reports no accuracy measured in users' libraries.

> [!note] From the public record
> Built from Apple's own published account, "Recognizing People in Photos Through Private On-Device Machine Learning" (July 2021), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Photos, on iOS, iPad OS and Mac OS, uses machine learning "running privately on-device" to curate and organize images, Live Photos and videos. An algorithm the article calls foundational to this recognizes people from their visual appearance. Identity information feeds the People Album, search by name, and a private, on-device knowledge graph that powers the Memories feature.

The article names two challenges. People can appear "at arbitrary scales, lighting, pose, and expression", images can come from any camera, and the subject is not always posing. And results must be equitable: Apple wants the same experience "no matter the photographic subject’s skin color, age, or gender."

## Why this approach

The article explains single design choices, not a comparison of systems. Faces are frequently occluded or turned away from the camera, so the system also uses upper bodies, which within one context "usually show constant characteristics" such as clothing. To combine the two, Apple settled on distances computed in each embedding space separately, rather than a single learned vector or a concatenation. To assign identity, it chose sparse coding over several exemplars per cluster as a generalization of nearest-neighbor classification. The article says this gives better accuracy, particularly when clusters are relatively small and when more than one cluster could belong to the same identity. The end-to-end process runs on the device, "keeping the recognition processing private". See [Edge and on-device AI](#edge-on-device).

## The approach

Both phases of recognition work on embeddings (see [Representation learning and embeddings](#representation-learning)):

1. **Extract embeddings.** A deep neural network finds faces and upper bodies in each image, a matching routine pairs them, and two separate networks turn the crops into embeddings.
2. **Build a gallery.** Apple developed a "novel agglomerative clustering algorithm" that updates clusters incrementally. A conservative first pass combines face and upper-body distances, but compares upper bodies only within one "moment", assets linked by metadata such as time and location. A second pass of hierarchical agglomerative clustering (HAC) uses faces only, across moments. Clustering runs "typically overnight during device charging", and heuristics plus user input decide which clusters form the gallery. See [Clustering and dimensionality reduction](#clustering-dimensionality-reduction).
3. **Assign identity.** Each cluster keeps a set of exemplars. A new observation goes to the cluster with the maximum total "energy" of its sparse code. Photos uses this to identify people quickly as photos are taken.
4. **Filter unclear faces.** The pipeline filters out detections that are false positives or out-of-distribution. The article does not say how. Separately, it fine-tunes an embedding confidence branch on non-face crops and out-of-domain data to detect out-of-distribution samples.
5. **Train for fairness.** Some of the most effective datasets use "a paid crowd-sourced model with a managed crowd", with participants across the globe spanning age groups, genders and ethnicities. Augmentations are added incrementally during training. For face masks worn during the COVID-19 pandemic, the team designed a synthetic mask augmentation. See [Fairness metrics and bias measurement](#fairness-bias).

## The stack

As of July 2021, as the article names it:

- **Face embedding network:** inspired by AirFace with significantly increased depth, bottlenecks inspired by MobileNetv3, channel attention inspired by Squeeze and Excitation, and a linear global depth-wise convolution as in MobileFaceNet.
- **Loss:** softmax cross-entropy with an additive angular margin penalty, in a procedure the article calls similar to ArcFace. A "margin-mining softmax", using a strategy similar to Support Vector Guided Softmax and CurricularFace, gives hard examples more weight.
- **Training:** from random initialization with AdamW and a learning rate schedule based on the One Cycle Policy.
- **Runtime:** the model runs end-to-end on the Apple Neural Engine (ANE). The work is available in Photos running iOS 15.

The architectures of the detector and the upper-body network, and the size of the training data, are not stated.

## Results, and how they were measured

- **Latency.** "On recent iOS hardware, face embedding generation completes in less than 4ms." "This gives an 8x improvement over an equivalent model running on GPU".
- **Accuracy across subgroups.** Figure 7 shows accuracy on the worst and best performing subsets of "a large and diverse dataset". With no augmentation and a large margin softmax, worst-subset accuracy was 0.23 and best-subset 0.66. With margin-mining softmax alone, 0.68 and 0.84. With augmentations added, "worst subset accuracy is 0.86 while the best subset accuracy is 0.96". The article says the final method "helps bridge the gap between sub-groups".
- **Clustering speed.** Figure 3 compares processing time per iteration with typical average linkage clustering. At iteration 65, "our approach processing time is 3.5 seconds", against 205.8 seconds.
- **Product.** Apple states, without a figure: "This latest advancement, available in Photos running iOS 15, significantly improves person recognition."

**Not measured:** the article gives no figure for recognition accuracy in users' libraries, clustering precision or recall, the upper-body embeddings, the filtering step or the mask augmentation, the size and composition of the evaluation dataset or how its subsets are defined, the device and library size behind the timings, and a measurement period.

## What failed

- **Upper bodies change.** Upper-body embeddings are less robust than face embeddings because they "rely on a person’s temporary appearance", so the first pass compares them only within one moment.
- **Merges are permanent.** The first pass is "fairly conservative because when it joins two instances, they are permanently associated", which gives high precision but many smaller clusters for the second pass to grow.
- **Bad detections pollute the gallery.** Unfiltered, they "would start appearing in the gallery and start impacting recognition accuracy". See [Anomaly detection and distribution shift](#anomaly-drift-detection).
- **Training limits.** "The additive angular margin loss can present convergence issues with modern smaller networks" and often works only in a fine tuning step. The article says its approach avoids this. Modern neural networks also "can be overconfident when seeing samples far from the training distribution."

## What the team would do differently

The article states no lessons. On data, it says: "We’re constantly improving the variety in our datasets while also monitoring for bias".

The wiki's reading: two choices carry over to other systems. Make the step that cannot be undone conservative and recover recall in a later pass, and report accuracy for the worst subgroup, not only an average.

## Disclosure

None.

## Sources

- No byline (acknowledgments name Floris Chabert, Jingwen Zhu, Brett Keating and Vinay Sharma), Apple, [“Recognizing People in Photos Through Private On-Device Machine Learning”](https://machinelearning.apple.com/research/recognizing-people-photos), Apple Machine Learning Research, July 28, 2021.

## Related

- [About playbooks](#about-playbooks)
- [Edge and on-device AI](#edge-on-device)
- [Representation learning and embeddings](#representation-learning)
- [Fairness metrics and bias measurement](#fairness-bias)
- [Clustering and dimensionality reduction](#clustering-dimensionality-reduction)
