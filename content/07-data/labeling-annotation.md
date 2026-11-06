---
id: labeling-annotation
book: 7
order: "7.2"
title: Labeling and annotation
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [labeling, annotation, kappa]
visuals:
  - kappa-calculator:calculator
  - annotation-steps:stepper
---
> [!tldr]
> Labels are only as good as their guidelines and annotators. Write clear guidelines with examples, pilot them, measure agreement between annotators, adjudicate disagreements, use experts where judgment matters, and use model pre-labels and LLM judges to scale, calibrated against people.

## Why it matters
Eval sets, fine-tuning data and judge calibration all depend on labels. Inconsistent labels make evals noisy and fine-tunes confused; ambiguous guidelines hide disagreements about what “good” means.

## Intuition
Labeling is grading exams with several teachers. Without a shared marking scheme, the same answer gets different grades, and the grades say more about the teacher than the student.

```viz
{"id":"annotation-steps","component":"stepper","title":"Six steps from a fuzzy task to labels you can trust","caption":"A standard annotation workflow, illustrated for labeling answer quality.","alt":"Stepper of an annotation workflow: guidelines, pilot, agreement, adjudication, scaling and quality assurance.","data":"illustrative","frames":[
{"label":"Guidelines","caption":"Define each label with examples and counter-examples: what counts as “correct”, “partially correct” and “wrong”."},
{"label":"Pilot","caption":"Two or three annotators label the same 50 items independently."},
{"label":"Agreement","caption":"Measure agreement (Cohen’s kappa); low agreement means the guidelines are ambiguous, not that annotators are careless."},
{"label":"Adjudicate","caption":"Discuss disagreements, decide, and update the guidelines with the new examples."},
{"label":"Scale","caption":"Label the full set, with model pre-labels or a calibrated judge for clear cases and people for hard ones."},
{"label":"QA","caption":"Re-label a random sample to monitor drift, and track agreement over time."}]}
```

## How it works
**Agreement.** Raw agreement overstates consistency because some agreement happens by chance; Cohen’s kappa corrects for it:

```viz
{"id":"kappa-calculator","component":"calculator","title":"85% raw agreement can be only moderate agreement once chance is removed","caption":"Enter counts for two annotators labeling items yes or no. Kappa near 1 is strong agreement; near 0 is chance.","alt":"Calculator for observed agreement, chance agreement and Cohen’s kappa from a two-by-two table of annotator labels.","data":"formula","outputs":[{"id":"n","label":"Items","expr":"both_yes + a_yes_b_no + a_no_b_yes + both_no","unit":"count"},{"id":"po","label":"Observed agreement","expr":"(both_yes + both_no) / n","unit":"pct"},{"id":"pe","label":"Chance agreement","expr":"((both_yes + a_yes_b_no) * (both_yes + a_no_b_yes) + (a_no_b_yes + both_no) * (a_yes_b_no + both_no)) / (n * n)","unit":"pct"},{"id":"kappa","label":"Cohen’s kappa","expr":"(po - pe) / (1 - pe)","unit":"count","main":true}],"inputs":{"both_yes":40,"a_yes_b_no":10,"a_no_b_yes":5,"both_no":45},"input_meta":{"both_yes":{"label":"Both said yes"},"a_yes_b_no":{"label":"A yes, B no"},"a_no_b_yes":{"label":"A no, B yes"},"both_no":{"label":"Both said no"}},"assumptions":["Two annotators, two labels; use Fleiss’ kappa or Krippendorff’s alpha for more."],"tests":[{"inputs":{},"expect":{"po":0.85,"pe":0.5,"kappa":0.7},"tol":0.000001},{"inputs":{"both_yes":45,"a_yes_b_no":5},"expect":{"kappa":0.8},"tol":0.000001}]}
```

**Who labels.** Crowd workers for simple, high-volume tasks; trained annotators for consistent judgment; domain experts for medicine, law, code and safety. Pay and training affect quality.

**Model assistance.** Pre-labels speed humans up but bias them toward the model; LLM judges can label at scale once calibrated on a human-labeled sample. See [LLM-as-judge](#llm-as-judge).

**Tooling.** Annotation platforms (Label Studio, Argilla and commercial services) manage queues, guidelines, agreement and review.

## In practice
- Pilot guidelines on 50 items with two annotators before labeling thousands.
- Target kappa of about 0.6 or higher for subjective labels before scaling.
- Keep disagreements and their resolutions; they become guideline examples.

## Numbers to know
> [!number]
> Formula. κ = (pₒ − pₑ) ÷ (1 − pₑ). Common reading: below 0.4 weak, 0.4 to 0.6 moderate, 0.6 to 0.8 substantial, above 0.8 strong.

## Pitfalls and anti-patterns
> [!pitfall] Blaming annotators for low agreement
> Disagreement usually means the guidelines leave room for interpretation; fix the guidelines.

## Talk like an expert
The vocabulary: **guidelines**, **pilot**, **inter-annotator agreement**, **Cohen’s kappa**, **adjudication**, **gold questions**, **pre-labeling**, **expert annotators**. Experts report agreement with every labeled dataset. The live debate is how much LLM labeling can replace human annotation; calibration against people remains the safeguard.

> [!hottake] Writing the labeling guidelines is the real work of defining quality.
> **The counterargument:** guidelines without the labeled examples and adjudications that test them are just opinions; the labeling itself reveals what the guidelines missed.

## Check yourself
```quiz
labeling-annotation
```

## Go deeper
- Cohen, “A Coefficient of Agreement for Nominal Scales” (1960).
- Label Studio and Argilla documentation.

## Related
- [Data strategy](#data-strategy)
- [LLM-as-judge done right](#llm-as-judge)
- [Building eval datasets](#eval-datasets)
- [Supervised fine-tuning](#sft)
- [Synthetic data](#synthetic-data)
