---
id: nyu-langone-nyutron
book: 21
order: "21.92"
title: "NYUTron: a language model trained on clinical notes predicts hospital readmissions"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, clinical-prediction, pretraining, fine-tuning, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (academic health system)"
use_case: "A language model pretrained on the health system's own clinical notes, fine-tuned for clinical and operational predictions, and run on discharge summaries as physicians sign them to predict 30-day readmission"
outcome: "In a prospective, single-arm, non-interventional trial, an AUC of 78.70% for 30-day readmission, with 82.30% recall and 20.58% precision"
measured_how: "Prospective trial from January to April 2022 on 29,286 discharged encounters, with 3,271 patients returning within 30 days, plus retrospective temporal test sets for five tasks (Jiang et al., Nature, June 2023)"
prerequisites: [classification-metrics]
replications: []
---
> [!tldr]
> NYU Langone Health pretrained NYUTron, a 109 million-parameter BERT model, on 7.25 million of its own clinical notes and fine-tuned it for five prediction tasks. Reading discharge summaries as physicians signed them, it predicted 30-day readmission with an AUC of 78.70% in a prospective trial from January to April 2022. The trial was non-interventional, and the paper does not report an effect on patient outcomes.

> [!note] From the public record
> Built from NYU Langone Health's own published account, "Health system-scale language models are all-purpose prediction engines" (June 2023), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

"Existing structured data-based clinical predictive models have limited use in everyday practice", the paper states, because structured inputs make data processing, development and deployment complex. It calls this the "last-mile problem". The authors theorized that LLMs "could potentially solve the last-mile problem" in medical predictive analytics "by simply reading the notes written by physicians".

## Why this approach

The paper's claim is that clinical notes can train language models that work as "all-purpose clinical predictive engines with low-resistance development and deployment": one model, pretrained on the notes, then fine-tuned for each task. Baselines were structured features plus XGBoost (such as LACE for readmission), tf-idf+xgb, a randomly initialized BERT ("random-init"), models pretrained on non-clinical text, and "web-wiki+bio+clinical", pretrained on text including clinical notes from University of Florida Health.

The authors view "the flexibility of our approach in using an encoder architecture (BERT)" as "a virtue": it "relies on only unstructured text inputs to generate a single prediction". They note that large generative LLMs "are highly dependent on user inputs and prompting". They did not compare larger decoder-based models.

## The approach

"Our language model-based approach has four steps: data collection, pretraining, fine-tuning and deployment."

1. **Data collection.** "NYU Notes" holds 7.25 million clinical notes from 387,144 patients across four hospitals, curated from January 2011 to May 2020, plus five labelled task datasets.
2. **Pretraining.** A 109 million-parameter BERT model trained with masked language modelling "for 3 weeks (96 epochs) on 24 NVIDIA A100 GPUs". See [The pretraining run, end to end](#pretraining-run).
3. **Fine-tuning.** One model per task: 30-day all-cause readmission, in-hospital mortality, comorbidity index, length of stay and insurance denial. See [Fine-tuning in practice](#fine-tuning-practice).
4. **Deployment.** Trained models were converted into Onnx and then TensorRT "to obtain sub-millisecond-scale inference results" and served by NYUTriton, "a modified version of NVIDIA’s Triton Inference Server". When a discharge summary is signed in Epic, an HL7 FHIR interface sends it to NYUTriton, which passes the readmission prediction to an orchestration server, "which writes the result to a database and generates an email to the signing physician." See [Serving engines](#serving-engines).

## The stack

As of June 2023:

- **Model:** NYUTron, a 109 million-parameter BERT model.
- **Pretraining hardware:** 24 NVIDIA A100 GPUs with 40 GB of VRAM.
- **Inference:** NYUTriton on a dedicated server with an AMD Threadripper 3960X, two RTX 3090 GPUs and 128 GB of DDR5 system memory.
- **Integration:** Epic, an HL7 FHIR interface, an orchestration server and a database.

The data "cannot be made publicly available". The competing-interests statement lists authors employed by NVIDIA and states that the work "was performed exclusively within the NYU Langone Health System".

## Results, and how they were measured

- **Five tasks, retrospective.** On the four prediction tasks (in-hospital mortality, readmission, length of stay and insurance denial), NYUTron "had an area under the curve (AUC) of 78.7–94.9%", with "an improvement of 5.36–14.7% in AUC from traditional clinical predictive models". On comorbidity index imputation, its median AUC was 89.4% ± 0.275%. For readmission, the temporal test median AUC was 79.87% ± 0.168%. Comparing a random split with a temporal split, "the random test AUC was 84.13%, whereas the temporal test AUC was 80.2%".
- **Other text models, readmission.** Against tf-idf+xgb, "NYUTron had a 12.8% higher median AUC"; against models pretrained on non-clinical text, "NYUTron’s median AUC was 2.37% to 3.23% higher". "A separate LLM, web-wiki+bio+clinical, had similar performance as NYUTron."
- **Physicians.** Against six physicians on 20 discharge summaries (11 positive, 9 negative): "On small samples, NYUTron was competitive with a small group of physicians", and "Median physician performance was worse than that of NYUTron".
- **Prospective trial.** From January to April 2022, "there were 29,286 discharged encounters, with 3,271 patients (11.17%) returning within 30 days." "NYUTron predicted 2,692 of the 3,271 readmissions (82.30% recall) with 20.58% precision." Its AUC was 78.70%. See [Classification and regression metrics](#classification-metrics).
- **Physician review.** After the trial, a physician panel reviewed 100 readmissions that NYUTron identified: "61% were unplanned readmissions", 50% would have resulted in a penalty under CMS guidelines, and 27% were preventable at the time of discharge. The caption and main text say six physicians; the Methods say ten, reviewing in pairs. Per the Methods, each of the five largest departments gave 20 cases: the 10 highest and 10 lowest predicted probabilities.

**Not measured:** the trial was single-arm and non-interventional, so it has no comparison group and no measured effect on readmissions, patient outcomes or operations. The paper gives no inference cost and no data on how physicians responded to the emails.

## What failed

The paper reports risks and limits rather than failures:

- **Over-reliance.** "physicians and administrators could over-rely" on the predictions "owing to its seamless integration with existing medical workflows, thereby leading to undesirable outcomes."
- **Supervision and drift.** "there should be a level of continuous supervision to capture human–machine interactions" and to mitigate the risk of model drift over time. See [Data validation, drift and skew](#data-validation-drift).
- **Compute.** Besides the 3-week pretraining, fine-tuning "used 8 A100 GPUs for 6 hours per run". "This amount of computation is not commonly accessible to research groups", though the authors note it is less than in similar industry projects.
- **Variation.** NYUTron "is sensitive to notes from different clinical departments and patients with different demographics", and "its performance fluctuates over months".
- **Open questions.** "The ultimate validation of our approach must come from randomized controlled trials" of interventions tied to individual task predictions, and the authors call for the "development of standardized assessments for sources of bias".

## What the team would do differently

The paper gives recommendations: "high-quality datasets for fine-tuning are more valuable than pretraining", and "we recommend that users locally fine-tune an externally pretrained language model" when computational ability is limited. Across sites, "pretraining with data from all sites and local fine-tuning is the best way to optimize performance." For the intervention trials it plans, it recommends "the consideration of different levels of intervention depending on the predicted risk".

The wiki's reading: the prospective AUC (78.70%) stayed close to the retrospective temporal result (79.87%), so the model appears to have held up on live notes. At 20.58% precision, an intervention on every flag would reach many patients who were not readmitted, so the advice on tiered interventions matters as much as the AUC.

## Disclosure

None.

## Sources

- Lavender Yao Jiang, Xujin Chris Liu, Nima Pour Nejatian, Mustafa Nasir-Moin, Duo Wang, Anas Abidin, Kevin Eaton, Howard Antony Riina, Ilya Laufer, Paawan Punjabi, Madeline Miceli, Nora C. Kim, Cordelia Orillac, Zane Schnurman, Christopher Livia, Hannah Weiss, David Kurland, Sean Neifert, Yosef Dastagirzada, Douglas Kondziolka, Alexander T. M. Cheung, Grace Yang, Ming Cao, Mona Flores, Anthony B. Costa, Yindalon Aphinyanaphongs, Kyunghyun Cho and Eric Karl Oermann, NYU Langone Health, [“Health system-scale language models are all-purpose prediction engines”](https://www.nature.com/articles/s41586-023-06160-y), Nature 619, 357-362, published online 7 June 2023, figures corrected 4 July 2023, issue of 13 July 2023, doi:10.1038/s41586-023-06160-y.

## Related

- [About playbooks](#about-playbooks)
- [Classification and regression metrics](#classification-metrics)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Serving engines](#serving-engines)
- [Data validation, drift and skew](#data-validation-drift)
