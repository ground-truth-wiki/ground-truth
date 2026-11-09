---
id: github-secret-detection-model
book: 21
order: "21.12"
title: "GitHub secret scanning: a small classifier for generic secrets"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [security, secret-scanning, text-classification, fine-tuning, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools (code hosting and security)"
use_case: "Detecting generic secrets, such as passwords and connection strings, in repository content: regex filters find candidates and a fine-tuned classifier judges each one in context"
outcome: "Against the previous LLM pipeline: 13% higher precision and 19% higher recall offline, repository owner-weighted acceptance up 11.5% in an A/B experiment, median post-push scan execution time 86% lower, more than 98% cost savings"
measured_how: "Offline precision and recall on the same public traffic, then a customer A/B experiment, both against the previous LLM pipeline; no sample sizes or periods stated (GitHub blog, October 2026)"
prerequisites: [classification-metrics, encoders-and-decoders]
replications: []
---
> [!tldr]
> GitHub shipped a new scanner for generic secrets: regex filters find candidate strings, and a fine-tuned ModernBERT classifier judges each one in its context. Against the previous LLM-based pipeline, GitHub reports higher precision and recall, an 11.5% rise in owner-weighted acceptance and "More than 98% cost savings", and the speed gain made it practical to extend generic secret detection to push protection.

> [!note] From the public record
> Built from GitHub's own published account, "GitHub’s model for secret detection: Finding more secrets with less noise" (October 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

GitHub secret scanning works at two moments: push protection scans changes before a push is accepted, and post-push scanning creates alerts after code has been committed. The post describes the balance: "Catch too little, and real credentials can remain in a repository." Too many alerts can leave developers investigating strings that are not secrets.

Generic secrets make that balance hard. Unlike structured credentials, they may have no distinctive prefix, length, alphabet or checksum, and their syntax overlaps with build identifiers, checksums, asset hashes and sample values. In the post's words, "The same string could be a real credential or a documentation placeholder". The post calls such lookalikes hard negatives: strings that match a credential pattern but are not usable credentials.

## Why this approach

The post explains why it did not rely on more rules: "Adding more rules can suppress some of them, but each exception risks hiding a real secret." A learned classifier can use signals such as file path, secret type, variable names and nearby code or text.

Regexes stay: "The important design choice is that the model does not replace deterministic scanning." They find candidates quickly; the classifier decides which are likely real.

GitHub chose ModernBERT because "it is compact, efficient, and well suited for classification over code-adjacent text." The model must make a calibrated decision over short candidate windows, with high throughput and low latency. The post calls a fine-tuned encoder classifier "a better serving shape than a general-purpose LLM for this stage of the pipeline", since it can be trained directly on the decision boundary. See [Encoders, decoders and encoder-decoders](#encoders-and-decoders). The post does not say which other models, if any, were compared.

## The approach

1. **Scan** repository content, commits, pull requests and other scanned surfaces.
2. **Generate candidates.** Regex filters flag credential-like strings with high recall.
3. **Classify.** The classifier reads each candidate with its file path, secret type and a bounded amount of surrounding context, and scores how likely it is a real secret.
4. **Alert or suppress.** High-confidence findings become alerts; placeholders, test fixtures and checksums are filtered out.

Training data mixed product-derived examples with human validation, regex candidates with human annotations and weak labels, and [synthetic examples](#synthetic-data) for sparse, difficult cases. Rows sharing a repository, candidate value or example were grouped before splitting, so near-duplicates could not appear in both training and evaluation (see [Validation, tuning and leakage](#validation-tuning)). Synthetic rows passed deterministic validation and model-based quality review before inclusion.

The goal was to "preserve or improve recall while reducing false positives and serving cost." The threshold was selected offline, then validated on production-like traffic before rollout.

## The stack

As of October 2026: regex filters for candidate generation, and a fine-tuned ModernBERT classifier exported to ONNX format with 8-bit [quantization](#quantization), running on GitHub's inference infrastructure. The post gives no model size or hardware, and names the baseline only as "the previous LLM pipeline" and "remote LLM calls".

## Results, and how they were measured

GitHub measured in two stages, both against the previous LLM pipeline: an offline evaluation "against the production baseline on the same public traffic", then a customer A/B experiment (see [Online controlled experiments for AI features](#online-experiments)).

- **Precision and recall (offline, post-push).** "the new pipeline achieved 13% higher precision and 19% higher recall than the previous LLM pipeline". The post does not say whether these are relative changes or percentage points. See [Classification and regression metrics](#classification-metrics).
- **Acceptance (A/B).** "Repository owner-weighted acceptance increased by 11.5%." GitHub weights acceptance by repository owner to reduce the influence of customers who bulk-resolve large volumes of alerts at once. The results table describes the metric as "Customer acceptance of detected findings"; a summary graphic labels the same figure "Owner-weighted alert precision".
- **Speed.** The classifier "reduced median post-push scan execution time by 86% compared with the previous LLM-based pipeline."
- **Cost.** "More than 98% cost savings compared with the LLM-based pipeline."
- **Coverage.** "That efficiency made it practical to extend generic secret detection to push protection".

**Not measured:** the post gives no sample sizes, dates or duration for either evaluation, no absolute precision, recall, acceptance, scan time or cost, no confidence intervals, and no results for push protection or for regex or classifier alone.

## What failed

The post reports no incidents or abandoned attempts. The limits it names belong to the alternatives: rules risk hiding real secrets, and regexes alone match hard negatives easily. One difficulty in building the classifier: "The challenge was finding representative data for cases in which syntax alone is misleading." The post also says the classifier "makes a best effort" to tell a string that looks like a secret from a likely real one.

## What the team would do differently

The post does not say what the team would redo. It lists lessons. "Hybrid systems are powerful": the combination of regex and ModernBERT "outperforms either approach used alone for this product constraint". "We also learned that model size is not the same as model usefulness." In the post's view, a smaller fine-tuned classifier can be the right answer when the task is narrow, the decision boundary is measurable and serving efficiency is critical. And: "The most important training principle was to make the model see the confusing examples."

GitHub next plans production feedback loops to find new false negatives and false positives, and is exploring single-step detection and extraction.

The wiki's reading: every reported number is a change against an unnamed LLM pipeline, without absolute values or sample sizes, so the post shows the direction of the change better than its size. The pattern, a cheap high-recall filter in front of a small classifier trained on hard negatives, may suit other narrow detection tasks.

## Disclosure

None.

## Sources

- Batu Ozturkler & Shengyu Fu, GitHub, [“GitHub’s model for secret detection: Finding more secrets with less noise”](https://github.blog/ai-and-ml/githubs-model-for-secret-detection-finding-more-secrets-with-less-noise/), The GitHub Blog, 13 October 2026, updated 14 October 2026.

## Related

- [About playbooks](#about-playbooks)
- [Classification and regression metrics](#classification-metrics)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Online controlled experiments for AI features](#online-experiments)
- [Cost engineering](#cost-engineering)
