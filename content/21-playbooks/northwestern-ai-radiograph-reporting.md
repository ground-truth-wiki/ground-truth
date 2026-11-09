---
id: northwestern-ai-radiograph-reporting
book: 21
order: "21.91"
title: "Northwestern Medicine: generative draft reports for radiographs"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, radiology, multimodal, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Healthcare (12-hospital tertiary care academic health system)"
use_case: "A generative model drafts plain radiograph reports inside the reporting software for radiologists to verify and edit, and its report text was analyzed in a shadow deployment to flag unexpected pneumothorax"
outcome: "Mean documentation time 159.8 seconds with model assistance against 189.2 seconds without, reported as a 15.5% documentation efficiency increase, with no difference in clinical accuracy on peer review of 800 studies"
measured_how: "Prospective cohort of 23,960 radiographs (11,980 each with and without model use), 15 November 2023 to 24 April 2024, plus blinded peer review by 4 raters (Huang et al., JAMA Network Open, June 2025)"
prerequisites: [vision-language-models, human-in-the-loop]
replications: []
---
> [!tldr]
> Northwestern Medicine gave a limited set of radiologists generative draft reports for plain radiographs inside their reporting software, to verify and edit. In a prospective cohort study of 23,960 radiographs, model-assisted interpretations were faster, "representing a 15.5% documentation efficiency increase", and peer review found no difference in clinical accuracy. A shadow deployment also used the generated report text to flag unexpected pneumothorax.

> [!note] From the public record
> Built from Northwestern Medicine's own published account, "Efficiency and Quality of Generative AI–Assisted Radiograph Reporting" (June 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper cites rising demand for radiological services and radiologist shortages worldwide. To the authors' knowledge, no prospective clinical evaluation of generative draft reporting had been published. The study asked whether clinical use of the drafts is associated with documentation efficiency, the clinical accuracy and textual quality of reports, and prompt detection of pneumothorax requiring intervention.

## Why this approach

The introduction gives two reasons. First, a sufficiently accurate draft can be a starting point "so that the radiologist need not type or dictate from scratch or from a predefined template", much as an attending radiologist verifies and edits a trainee's report. Second, a generated draft "contains language remarking on the severity and chronicity of findings", which the authors argue identifies urgent studies "more reliably than classification-based strategies." The paper does not describe other designs the team considered and rejected.

## The approach

1. **The model.** A multimodal encoder-decoder transformer "trained using an institutional dataset to produce free-text radiology reports." It takes the current study, a single comparison study and basic clinical data, including the interpreting radiologist's name and the reason for examination. See [Vision-language model architectures and training](#vlm-architectures).
2. **Workflow integration.** A server receives imaging and clinical data from the health record as acquisitions complete, generates the draft and logs all activity to a monitoring database. The draft appears in a reporting software template "within seconds of image acquisition", and radiologists verify and edit it, the pattern described in [Human in the loop](#human-in-the-loop).
3. **Phased rollout.** During the study period, the template was available "to a limited set of radiologists" in a phased rollout by practice location and imaging section across the 12-hospital system.
4. **Pneumothorax flagging.** A prioritization system analyzed the generated report text from 5 February to 24 April 2024 "in a shadow deployment that ran in real time without surfacing alerts to clinicians." It targeted emergent pneumothorax in patients with low pretest probability.
5. **Evaluation design.** Each radiologist's model-assisted studies were compared with their own most recent studies before first model use, matched by chest or nonchest type, read without trainees. Four peer reviewers, blinded to model use and to the reading radiologist, rated randomly sampled reports.

## The stack

As of June 2025, as the paper names it:

- **Text decoder:** "a 125 million parameter Open Pretrained Transformer (OPT-125M) model".
- **Image encoder:** a base-sized 86 million parameter vision transformer with patch size 16 (ViT-B/16).
- **Clinical systems:** Epic (Epic Systems) as the health record and PowerScribe (Nuance Communications) as the reporting software.
- **Serving:** an inference server and a monitoring database. "Inference completed in a median of 3 seconds (IQR, 2-4 seconds)."

The main text names no training data size and no hardware; training details are in a supplement this page did not use.

## Results, and how they were measured

- **Documentation time.** Across 23,960 radiographs (11,980 each with and without model use), "Interpretations with model assistance (mean [SE], 159.8 [27.0] seconds)" were faster than the baseline "(mean [SE], 189.2 [36.2] seconds)", "(P = .02), representing a 15.5% documentation efficiency increase." 12 radiologists read the chest radiographs and 15 the nonchest ones.
- **Checks.** Leaving out one radiologist at a time "did not alter the overall association". For a control group of radiologists without the model (10,897 studies each before and after implementation), the analysis "found no evidence for change in documentation efficiency".
- **Quality.** "Peer review of 800 studies showed no difference in clinical accuracy (χ2 = 0.68; P = .41)" "or textual quality (χ2 = 3.62; P = .06)". Addenda were made in 16 (0.13%) of 11,980 premodel reports and 17 (0.14%) of 11,980 model-assisted reports.
- **Pneumothorax.** Of 97,651 studies screened, 78 were flagged, and 56 (71.8%) were true pneumothoraxes per the final report. Flags were available in a median of 24.0 seconds after study completion, while radiologist notifications took a median of 24.5 minutes. The system "had a sensitivity of 72.7% and specificity of 99.9%" for unexpected pneumothorax warranting notification, producing "just over 1 alert per day".

**Not measured:** the main text does not define when documentation timing starts and stops, how many radiologists had access in total, or what the system cost. It does not measure patient outcomes, the effect of flags on care, or longer-term productivity.

## What failed

- **Missed pneumothoraxes.** Of the 9 qualifying studies the system did not flag, all but 1 were described by the radiologist as "small," "suspected," or "uncertain", while the generated report said there was no significant pneumothorax.
- **Flags from late data.** Six flagged studies that led to calls to the clinical team did not meet the criteria on retrospective examination, "due to delayed availability of patient location information and prior imaging interpretations in the EHR."
- **Nonchest reports.** The median word error rate of drafts against final reports was 0.31 for chest and 0.63 for nonchest studies. Efficiency still improved for chest and musculoskeletal radiographs "despite the relatively higher word error rate for nonchest reports".
- **Limits of the design.** The study was not randomized, radiologists served as their own controls, and "the radiographs and radiologists studied may not be representative of other populations."

## What the team would do differently

The paper does not say. It names next steps: double reading of radiographs, longitudinal study of performance drift, productivity and burnout, more clinical context, and flagging of other clinical findings. Because the design was nonrandomized, "further experimental evidence is needed".

The wiki's reading: peer review rated the final reports, not the raw drafts, so the quality result describes radiologist and model together. A randomized design, as in [Online controlled experiments for AI features](#online-experiments), would answer the question the authors leave open. See also [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure

None.

## Sources

- Jonathan Huang, Matthew T. Wittbrodt, Caitlin N. Teague, Eric Karl, Galal Galal, Michael Thompson, Ajay Chapa, Ming-Lun Chiu, Bradley Herynk, Richard Linchangco, Ali Serhal, J. Alex Heller, Samir F. Abboud and Mozziyar Etemadi, Northwestern University Feinberg School of Medicine and Northwestern Medicine, [“Efficiency and Quality of Generative AI–Assisted Radiograph Reporting”](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2834943), JAMA Network Open 2025;8(6):e2513921, published online 5 June 2025, doi:10.1001/jamanetworkopen.2025.13921. The paper's disclosures state that several authors have patents in varying states of the application process, and that one author has patents licensed to Northwestern Medicine.

## Related

- [About playbooks](#about-playbooks)
- [Human in the loop](#human-in-the-loop)
- [Vision-language models](#vision-language-models)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Classification and regression metrics](#classification-metrics)
