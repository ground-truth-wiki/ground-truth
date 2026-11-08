---
id: label-quality
book: 7
order: "7.2.1"
title: "Label quality: agreement, aggregation and label errors"
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [inter-annotator-agreement, label-aggregation, label-noise, confident-learning, annotation]
visuals: []
prerequisites: [labeling-annotation]
---
> [!tldr]
> Label quality is measured, not assumed: agreement coefficients show whether annotators share one reading of the guidelines, aggregation models turn several noisy labels into one, and confident learning flags the labels that are probably wrong. It matters for evaluation as much as for training, because a few percent of wrong test labels can change which model looks best. Remember that disagreement is sometimes the signal: for subjective tasks there may be no single right label to recover.

## Key ideas

- **Choose the agreement coefficient that fits your coders and your scale.** Cohen's kappa and Scott's pi both correct raw agreement for chance, kappa from each coder's own label distribution and pi from a pooled one; Fleiss's multi-pi and Davies and Fleiss's multi-kappa extend them to more than two coders, while weighted kappa and Krippendorff's alpha give partial credit for near misses, and alpha also handles any number of coders and missing values (Artstein and Poesio, [“Inter-Coder Agreement for Computational Linguistics”](https://aclanthology.org/J08-4004/) (2008)). NLTK implements kappa, weighted kappa, multi-kappa, pi, S and alpha with pluggable distance functions for nominal, interval or set-valued labels ([NLTK agreement metrics](https://www.nltk.org/api/nltk.metrics.agreement.html)).
- **Agreement bands are conventions, not laws.** The Landis and Koch (1977) bands, which call 0.6 to 0.8 "substantial", are the best-known convention in medical diagnosis; computational linguistics mostly follows content analysis, where 0.8 counts as good and 0.67 to 0.8 allows only tentative conclusions, and Krippendorff later called even 0.8 "a pretty low standard". Weighted coefficients make the thresholds harder still to interpret ([Artstein and Poesio, 2008](https://aclanthology.org/J08-4004/)).
- **Aggregate several labels with a model of the annotators.** Majority vote treats every worker as equally reliable; gold majority vote weights workers by their accuracy on tasks with known answers; and the Dawid and Skene (1979) model gives each worker a confusion matrix and estimates the true labels and the worker error rates together with expectation maximization. The open-source crowd-kit library implements these and others, such as GLAD and MACE ([crowd-kit documentation](https://crowd-kit.readthedocs.io/en/latest/classification/); [crowd-kit](https://github.com/Toloka/crowd-kit)).
- **Wrong labels are memorized in training and reorder models in evaluation.** Deep networks can fit even completely random labels, so they do not simply ignore wrong ones (Zhang et al., [“Understanding deep learning requires rethinking generalization”](https://arxiv.org/abs/1611.03530) (2016)). Across 10 widely used test sets, Northcutt et al. estimate at least 3.3% label errors on average and at least 6% in the ImageNet validation set, and on ImageNet with corrected labels, ResNet-18 beats ResNet-50 once the share of originally mislabeled test examples rises by just 6% (Northcutt et al., [“Pervasive Label Errors in Test Sets Destabilize Machine Learning Benchmarks”](https://arxiv.org/abs/2103.14749) (2021)).
- **Confident learning finds candidate label errors, and people confirm them.** Confident learning estimates the joint distribution of given and true labels, assuming the noise depends on the class, then prunes, counts with probabilistic thresholds and ranks examples to find likely errors (Northcutt et al., [“Confident Learning: Estimating Uncertainty in Dataset Labels”](https://arxiv.org/abs/1911.00068) (2019)); the open-source cleanlab library applies it to any model's predicted probabilities and also infers consensus labels and annotator quality from multi-annotator data ([cleanlab](https://github.com/cleanlab/cleanlab)). Flags are candidates, not verdicts: in the test-set study, crowd workers confirmed 51% of flagged candidates on average ([Northcutt et al., 2021](https://arxiv.org/abs/2103.14749)).
- **Disagreement can be real, and annotators are people.** Plank argues that treating all label variation as noise assumes a single ground truth and overlooks genuine disagreement, subjectivity and multiple plausible answers, which affects data, modeling and evaluation alike (Plank, [“The 'Problem' of Human Label Variation: On Ground Truth in Data, Modeling and Evaluation”](https://arxiv.org/abs/2211.02570) (2022)). Label quality also depends on working conditions: the Partnership on AI lists worker-centered considerations for choosing providers, running pilots, writing instructions, assigning tasks, setting pay, communicating with workers, quality assurance and offboarding ([Partnership on AI, “Responsible Sourcing of Data Enrichment Services”](https://partnershiponai.org/paper/responsible-sourcing-considerations/) (2021)).

## Planned visuals

- `calculator`: Cohen's kappa, Fleiss's multi-pi and Krippendorff's alpha computed live on one small editable table of three coders with ordinal labels and a missing value, showing how the coefficients differ on the same data and how an ordinal distance changes alpha.
- `stepper`: Dawid-Skene on a toy task with five workers: start from majority vote, estimate each worker's confusion matrix, re-estimate the label probabilities, and watch a reliable minority outweigh a careless majority on one item. Illustrative.
- `chart`: two models' accuracy on original and corrected test labels as the share of mislabeled test examples grows, redrawn from the published results of Northcutt et al. (2021), showing where the ranking flips.

## Talk like an expert

Experts say **inter-annotator agreement**, **chance-corrected**, **Krippendorff's alpha**, **gold questions**, **Dawid-Skene**, **label noise**, **confident learning** and **human label variation**; they report which coefficient they used on how many items and coders, and before "fixing" a disagreement they ask whether it is a guideline gap, an annotator error or a genuinely ambiguous item.

## Go deeper

- Artstein and Poesio, [“Inter-Coder Agreement for Computational Linguistics”](https://aclanthology.org/J08-4004/) (2008), Computational Linguistics 34(4).
- Northcutt et al., [“Confident Learning: Estimating Uncertainty in Dataset Labels”](https://arxiv.org/abs/1911.00068) (2019).
- Northcutt et al., [“Pervasive Label Errors in Test Sets Destabilize Machine Learning Benchmarks”](https://arxiv.org/abs/2103.14749) (2021).
- Plank, [“The 'Problem' of Human Label Variation: On Ground Truth in Data, Modeling and Evaluation”](https://arxiv.org/abs/2211.02570) (2022).

## Related

- [Labeling and annotation](#labeling-annotation)
- [Active learning and weak supervision](#active-learning-weak-supervision)
- [Building eval datasets](#eval-datasets)
- [LLM-as-judge done right](#llm-as-judge)
- [Statistics for evals](#eval-statistics)
