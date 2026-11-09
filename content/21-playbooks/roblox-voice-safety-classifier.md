---
id: roblox-voice-safety-classifier
book: 21
order: "21.78"
title: "Roblox's voice safety classifier: moderating live voice chat in 30 languages"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [content-moderation, audio-classification, weak-supervision, distillation, gaming, public-record]
visuals: []
type: playbook
account: public-record
industry: "Gaming (online platform with voice chat)"
use_case: "Classifying voice chat audio for policy violations such as harassment, profanity and sexual content, to warn people who break the rules"
outcome: "v3 reaches 61% recall at a 1% false positive rate, weighted by Roblox voice chat language distribution; 14% higher recall and 5% higher precision (relative) than v2 on the languages v2 supports"
measured_how: "Recall at a 1% false positive rate, weighted by voice chat language distribution; the June 2026 newsroom post says every model was evaluated on human-labeled datasets, and the v3 model card gives per-language recall and precision on internal held-out sets at a 1% false positive rate for each language; set sizes and collection period not stated"
prerequisites: [classification-metrics, guard-models-moderation]
replications: []
---
> [!tldr]
> Roblox built an audio classifier that flags policy violations in voice chat without a full transcription. It was trained on machine-made labels, with human labels added from v2, and tested on human labels. Its June 2026 post on v3 reports "61% recall weighted by Roblox voice chat language distribution at 1% false positive rate". The sources do not say how large the test sets were.

> [!note] From the public record
> Built from Roblox's own published account, "Upgrading Our Voice Safety Classifier With 22 New Languages and Sharper Detection Capabilities" (June 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

"Roblox facilitates millions of minutes of voice data daily across 30 languages", the v3 post says, "a massive challenge in real-time safety at scale." In the 2024 post, the classifier feeds a consequence model that notifies rule breakers, "initially with warnings and then with more drastic actions if the behavior persists". At the start, Roblox "had almost no large-scale human-labeled real-world data".

## Why this approach

The 2024 post explains two choices.

**Classify the audio, not a transcript.** "At Roblox scale, invoking the ASR to transcribe all voice communications would be prohibitively slow and resource intensive." So the team trained a compact model that works on raw audio, with low latency as "A central requirement". See [Guard models and content moderation](#guard-models-moderation).

**Machines label the training data, people label the test data.** Machine labeling let the team "label the volume of training data we needed for our models in weeks instead of years". For the final check they used human labels, because "we didn’t trust machine labels to perform the final validation of the resulting model". The post describes training on "machine-labeled data with weak supervision"; see [Active learning and weak supervision](#active-learning-weak-supervision).

## The approach

1. **English first (2024).** A pipeline split audio at silences, transcribed it with open-source ASR models, and labeled the text with Roblox's in-house text filter. Moderators who already classified abuse reports supplied evaluation labels. The v3 post says v1 "used 2,400 hours of machine-labeled English data for model training."
2. **A small, distilled model.** A fine-tuned WavLM base+ was too slow for production, so the final candidate used "a student-teacher distillation setup, with a Whisper encoder as the teacher network" and a WavLM-based student. The 2025 post says the first open-source release "was based on a WavLM base+ model". See [Distillation, merging and compression](#distillation-merging).
3. **More languages, then human labels (2025).** v2 trained on more than 100,000 hours of machine-labeled speech, then fine-tuned on human-labeled data. Outputs were calibrated per head and language during distillation.
4. **Scale (2026).** For v3, "we used 250,000 hours of machine-labeled multilingual data and 29,000 hours of human-labeled multilingual data", adding 22 languages and two policy violation categories. "Every model was evaluated using human-labeled datasets."

## The stack

As of November 2026, the v3 model card on Hugging Face (undated) says: "The model is a transformer distilled from a larger teacher model." The card does not name the base architecture or the teacher model; the 2025 post said v2 was "still based on the WavLM architecture". The v3 model takes 16 kHz audio, with an intended segment length of up to 15 seconds, and outputs one sigmoid score for each of eight policy heads, from harassment and profanity to disruptive audio, plus auxiliary heads that detect the language. The card lists 30 supported languages. It is licensed under Apache 2.0.

The v3 post says Roblox's internal systems grew "from 94.6M to 320M parameters" over two years. It does not say whether the open-source model matches them, or what hardware serves v3; the 2024 post says the model deployed then ran on Roblox's own CPU infrastructure.

## Results, and how they were measured

From the v3 post:

- **Recall.** V3 "achieves 61% recall weighted by Roblox voice chat language distribution at 1% false positive rate".
- **Against v2.** "14% greater recall and 5% greater precision, compared with the previous version". The model card specifies relative gains, over the languages v2 supports, weighted by voice chat language distribution.
- **Throughput.** Internal systems "now handle 10,000 requests per second at peak."
- **Abuse reports.** "Following the initial launch and notification implementation, U.S. abuse report rates dropped over 50% per hour of speech." The 2025 post had already reported this reduction.

The card adds per-language results "on internal held-out sets measuring whether the given phrase contained abuse or not", excluding disruptive audio, at a 1% false positive rate per language. Recall runs from 29.5% (Czech) to 75.2% (Polish).

The 2025 post measured v2 differently: "a recall of 59.1% on English-language voice chat data at a 1% false-positive rate".

The wiki's reading: these numbers come from different setups (English only, language-weighted, per language), and the posts do not say whether the test sets stayed the same. Compare within a release, not across. See [Classification and regression metrics](#classification-metrics).

**Not measured:** the sources do not state the size or collection period of the test sets, or the baseline and exact period for the drop in abuse reports. They do not separate the classifier's effect from that of the notifications, and they give no production figures for false positives or appeals.

## What failed

- **Machine labels miss nuance.** "Labels based on speech transcripts and text-based classification can’t fully capture the nuances observed in voice chat content." The 2025 fix was fine-tuning on human labels.
- **Policies change.** "the target labels can become obsolete if the labeling policy changes over time". The fix was a separate head for the old policy.
- **Test results may not carry over.** The 2024 post says strong results "do not necessarily translate directly across all use cases". On all voice chat, where violations are rarer than in abuse reports, "there is a greater chance of false-positive results". Production experiments started "(at conservative thresholds)".
- **Limits of v3.** The card warns "Accuracy may degrade on longer segments", and Croatian and Serbian share one language head.

The v3 post reports no failures.

## What the team would do differently

None of the posts says what the team would redo. The v3 post says "each update has been shaped by what we’ve learned running our internal models at scale across our community", and explains the open release: "Voice safety is too important to solve in isolation."

## Disclosure

None.

## Sources

- Naren Koneru (Vice President, Engineering), Vesa Silvola and Janne Pylkkonen, Roblox, [“Upgrading Our Voice Safety Classifier With 22 New Languages and Sharper Detection Capabilities”](https://about.roblox.com/newsroom/2026/06/upgrading-voice-safety-classifier-22-languages-sharper-detection-capabilities), Roblox newsroom, 17 June 2026.
- Roblox, [“Roblox voice safety classifier v3”](https://huggingface.co/Roblox/voice-safety-classifier-v3), model card on Hugging Face, undated, read November 2026.
- Naren Koneru (Vice President, Engineering) and Janne Pylkkonen, Roblox, [“Launching More Languages for Our Open-Source Voice Safety Model”](https://about.roblox.com/newsroom/2025/04/updating-ml-voice-safety-more-languages), Roblox newsroom, 2 April 2025.
- Kiran Bhat (Senior Technical Director of Engineering), Roblox, [“Deploying ML for Voice Safety”](https://about.roblox.com/newsroom/2024/07/deploying-ml-for-voice-safety), Roblox newsroom, 8 July 2024.

## Related

- [About playbooks](#about-playbooks)
- [Guard models and content moderation](#guard-models-moderation)
- [Active learning and weak supervision](#active-learning-weak-supervision)
- [Classification and regression metrics](#classification-metrics)
- [Multilingual and low-resource language models](#multilingual-models)
