---
id: wayfair-product-dimensions
book: 21
order: "21.57"
title: Validating product dimensions at Wayfair with a multimodal LLM
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [e-commerce, product-catalog, multimodal, data-quality, public-record]
visuals: []
type: playbook
account: public-record
industry: "E-commerce (online retail catalog)"
use_case: "A multimodal LLM that extracts product dimensions from listing text and dimensional images and flags conflicts with supplier-provided dimensions for the supplier to review"
outcome: "Over 85% precision and more than 70% recall for conflict detection, against less than 50% precision and 7% recall for earlier ML-based methods"
measured_how: "Precision and recall of conflict detection over three phases: approximately 5,000 human-labeled records, a Merchandising QA review of products not used in development, and a supplier-reviewed pilot on over 100 thousand products; no dates given (Wayfair Tech Blog, January 2026)"
prerequisites: [vision-language-models, classification-metrics]
replications: []
---
> [!tldr]
> Wayfair built a check that uses Gemini 2.5 Flash to read a product's text and dimensional images and flag conflicts with the dimensions its supplier provided, for the supplier to review. The team reports "over 85% precision and more than 70% recall for conflict detection", against less than 50% precision and 7% recall for earlier ML-based methods. The post does not break these figures down by evaluation phase.

> [!note] From the public record
> Built from Wayfair's own published account, "How We Validate Product Dimensions at Scale With Multimodal GenAI" (January 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post opens with a sofa listed at six feet that "actually measures closer to seven feet": a customer who may lose some trust in buying online, or send the sofa back. A product can have many measurements, in different units, from several suppliers. Wayfair may want one reading of height, width and depth across all sofas that a single supplier may not follow. And a specification may get changed over time without cross-referencing the rest of the listing, so a customer may be confronted with conflicting information. Wayfair manages "a catalog of over 40 million products from over 20 thousand global suppliers", with thousands of new items added daily.

## Why this approach

The post compares the model with earlier ML-based methods, which it does not describe, and with people: it is "more cost-effective to deploy an AI model at scale than to hire a fleet of humans" to review product data around the clock.

The model uses two categories of product data: text and dimensional images (see [Vision-language models](#vision-language-models)). The post does not list which other models or designs were compared. The process calls the model several times, and the team found that Gemini 2.5 Flash, deployed via the Gemini Batch API, "offered the right trade off between strength of reasoning required, model cost and prediction turnaround time". See [Asynchronous and batch AI workloads](#async-batch-workloads).

## The approach

The model receives textual attributes (product names, descriptions, feature bullets and other values), dimensional images that show the product's measurements, and the supplier's dimensional values. The work runs as a chain of steps (see [Prompt patterns and chaining](#prompt-chaining)):

1. **Extract.** The model extracts dimensional values from the text and from the images independently, each with a confidence score (from 0 to 1, in a figure).
2. **Reconcile.** The model combines the two into one suggested value, and is prompted to give a value only when the two sources do not conflict.
3. **Compare.** The suggested value is compared with the supplier-provided value.
4. **Postprocess.** Rules drop cases where the model's confidence is low or the difference is small, so only meaningful conflicts are flagged.

The prompt carries dimension standards defined by the Wayfair Merchandising team, instructions for hard cases, and examples. Two snippets show rules: a set of components with no fixed way of putting them together, such as a collection of figurines, is skipped with the reason "Set"; an adjustable product, such as an easel adjustable from 50 to 70 inches, gets a dimension range unless the definitions say which end to use. The authors write that the separate steps give them "the right points to interject the experience-guided direction". When the process flags a problem, Wayfair asks the supplier to review it and change the product data.

## The stack

As of January 2026, as the post names it: Gemini 2.5 Flash, "a Google model", served through the Gemini Batch API; prompts with dimension definitions, case-specific instructions and examples; and rule-based postprocessing with confidence scores and tolerance rules. Nothing else is named.

## Results, and how they were measured

Evaluation ran in three phases:

1. A curated set of approximately 5,000 human-labeled records, used "to choose the best model design".
2. A run on products not used during development, with the flags validated by an internal QA process run by the Wayfair Merchandising team. No sample size is given.
3. A pilot in which the team "applied the model to over 100 thousand products in the Wayfair catalog", with suppliers reviewing the flagged cases.

The headline result: "Our model consistently achieves over 85% precision and more than 70% recall for conflict detection". The post says that completing the three phases with these results made the team confident the model was ready for full production release. The baseline is earlier ML-based methods, "which had less than 50% precision and 7% recall", measured on data the post does not describe. See [Classification and regression metrics](#classification-metrics).

Because suppliers review each flag, the team prioritizes precision over recall. The post says the process "does not need to have perfect precision", but "if we flood our suppliers with false positives we risk losing their trust and engagement."

**Not measured:** the post does not give the 85% and 70% figures per phase, or the number of records behind them. It gives no evaluation dates, no cost figures, no count of products flagged or corrected in production, and no effect on returns or complaints. Its statement that the model "has shown strong performance relative to a human doing the same task" comes with no numbers.

## What failed

The post reports limits, not production failures.

- **Dimensions are not self-evident.** "It is a mistake to think the width of a product is always self-apparent." Irregular shapes (an inflatable palm tree), extendable ones (a dining table with an extension leaf) and multi-piece products (a sectional sofa) make it "challenging for even humans to agree on the primary dimensions".
- **Small differences.** "Not all disagreements are equally egregious." Small differences generally have little impact on user experience, the post says. To avoid exhausting suppliers with requests for tiny changes, tolerance rules flag only disagreements above a meaningful threshold, which the post does not give.
- **Cost.** "The per-use cost of a GenAI multimodal reasoning model is always a concern" across the catalog.

## What the team would do differently

The post states no regrets; its two lessons are the first two items above. Next, the team wants to lower the cost per application, add sources of product data or other features to improve precision, and, with sufficiently high precision, correct a value directly without the supplier's validation.

The wiki's reading: because a person, the supplier, reviews every flag, the reviewer's patience sets the precision target. Automatic correction would remove that reviewer, and the post makes it conditional on sufficiently high precision. See [Human in the loop](#human-in-the-loop).

## Disclosure

None.

## Sources

- Zhendong Sun, Guillermo Mosse, Nick Coleman, Vinny DeGenova, Carolyn Phillips and Vipul Dalsukrai, Wayfair, [“How We Validate Product Dimensions at Scale With Multimodal GenAI”](https://www.aboutwayfair.com/careers/tech-blog/how-we-validate-product-dimensions-at-scale-with-multimodal-genai), Wayfair Tech Blog, 15 January 2026.

## Related

- [About playbooks](#about-playbooks)
- [Document-processing and extraction pipelines](#document-extraction)
- [Multimodal applications](#multimodal-apps)
- [Building eval datasets](#eval-datasets)
- [Data quality and governance](#data-governance)
