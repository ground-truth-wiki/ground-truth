---
id: classical-ml
book: 1
order: "1.4"
title: Classical ML essentials
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [ml, metrics, overfitting]
visuals:
  - bias-variance:chart
  - pr-calculator:calculator
---
> [!tldr]
> Classical machine learning supplies the vocabulary AI engineers still use daily: training, validation and test splits, overfitting and the bias–variance trade-off, precision, recall and F1, ROC curves, and baselines such as logistic regression and gradient-boosted trees, which remain the right tool for many tabular problems.

## Why it matters
Evaluating classifiers, routers, judges and guard models uses exactly these metrics. Many “AI” problems on structured data are still best solved by classical models, and knowing when saves cost and complexity.

## Intuition
A model that memorizes the practice exam aces it and fails the real one. Classical ML is the discipline of measuring on questions the model has never seen.

```viz
{"id":"bias-variance","component":"chart","type":"line","title":"Training error keeps falling with model complexity; test error falls, then rises","caption":"Illustrative classic curves. Too simple underfits (high bias); too complex overfits (high variance). Very large modern networks can show a second descent, but the held-out test remains the judge.","alt":"Illustrative line chart of training and test error against model complexity, with test error forming a U shape.","data":"illustrative","x":{"label":"Model complexity"},"y":{"label":"Error","unit":"pct","min":0,"max":0.5},"series":[{"name":"Training error","points":[[1,0.4],[2,0.28],[3,0.18],[4,0.1],[5,0.05],[6,0.02]]},{"name":"Test error","points":[[1,0.42],[2,0.31],[3,0.24],[4,0.23],[5,0.27],[6,0.34]]}]}
```

## How it works
**Splits.** Train on one set, tune on a validation set, report once on a held-out test set. Leakage between them makes every number optimistic. See [eval datasets](#eval-datasets).

**Overfitting and regularization.** Complex models fit noise; regularization (weight penalties, dropout, early stopping, more data) trades a little training accuracy for better generalization.

**Classification metrics.** Precision is the share of predicted positives that are right; recall the share of actual positives found; F1 their harmonic mean. Accuracy misleads on imbalanced classes.

```viz
{"id":"pr-calculator","component":"calculator","title":"94% accuracy can hide a classifier that misses a third of the cases that matter","caption":"Enter confusion-matrix counts. Defaults: 80 true positives, 20 false positives, 40 false negatives, 860 true negatives.","alt":"Calculator for precision, recall, F1 and accuracy from confusion-matrix counts.","data":"formula","outputs":[{"id":"precision","label":"Precision","expr":"tp / (tp + fp)","unit":"pct"},{"id":"recall","label":"Recall","expr":"tp / (tp + fn)","unit":"pct"},{"id":"f1","label":"F1","expr":"2 * precision * recall / (precision + recall)","unit":"pct","main":true},{"id":"accuracy","label":"Accuracy","expr":"(tp + tn) / (tp + fp + fn + tn)","unit":"pct"}],"inputs":{"tp":80,"fp":20,"fn":40,"tn":860},"input_meta":{"tp":{"label":"True positives"},"fp":{"label":"False positives"},"fn":{"label":"False negatives"},"tn":{"label":"True negatives"}},"assumptions":["Binary classification; compute per class for multiclass problems."],"tests":[{"inputs":{},"expect":{"precision":0.8,"recall":0.6666667,"f1":0.7272727,"accuracy":0.94},"tol":0.00001},{"inputs":{"fn":0},"expect":{"recall":1,"f1":0.8888889},"tol":0.00001}]}
```

**Thresholds and ROC.** Most classifiers output scores; the threshold trades precision for recall. ROC curves and the area under them (AUC) summarize ranking quality across thresholds; precision–recall curves are more informative for rare positives.

**Baselines.** Logistic regression, decision trees, random forests and gradient boosting (XGBoost, LightGBM) remain strong on tabular data; always compare an LLM solution against one.

## In practice
- Report per-class precision and recall for routers, judges and guard models.
- Choose thresholds by the cost of each error type.
- For tabular prediction, try gradient boosting before an LLM.

## Numbers to know
> [!number]
> Formulas. Precision = TP ÷ (TP + FP); recall = TP ÷ (TP + FN); F1 = 2PR ÷ (P + R). A ROC AUC of 0.5 is random ranking.

## Pitfalls and anti-patterns
> [!pitfall] Reporting accuracy on imbalanced data
> A fraud detector that predicts “not fraud” for everything is 99% accurate and useless.

- **Tuning on the test set.** The test set becomes a validation set.

## Talk like an expert
The vocabulary: **train/validation/test split**, **leakage**, **overfitting**, **regularization**, **precision**, **recall**, **F1**, **ROC AUC**, **threshold**, **gradient boosting**. Experts ask for per-class metrics and the threshold used. The live debate is how far LLMs replace classical models on structured data; mostly they do not.

> [!hottake] For tabular data, gradient-boosted trees still beat LLMs.
> **The counterargument:** LLMs can use unstructured context and need no feature engineering, and for small datasets with rich text fields they can win.

## Check yourself
```quiz
classical-ml
```

## Go deeper
- Hastie, Tibshirani and Friedman, *The Elements of Statistical Learning*.
- Grinsztajn et al., “Why do tree-based models still outperform deep learning on tabular data?” (2022).

## Related
- [Metrics and graders](#metrics-graders)
- [Neural networks](#neural-networks)
- [Probability and information theory](#probability-information)
- [Building eval datasets](#eval-datasets)
- [Eval recipes by system type](#eval-recipes)
- [Explaining model predictions](#model-interpretability)
- [Time series and forecasting](#time-series-forecasting)
- [Recommender systems](#recommender-systems)
- [Learning to rank](#learning-to-rank)
- [Feature stores and training-serving consistency](#feature-stores)
- [Fairness metrics and bias measurement](#fairness-bias)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Classification and regression metrics](#classification-metrics)
- [Validation, tuning and leakage](#validation-tuning)
- [Feature engineering and preprocessing](#feature-engineering)
- [Linear models, kernels and other classic learners](#linear-and-kernel-models)
- [Decision trees, ensembles and gradient boosting](#trees-and-ensembles)
- [Clustering and dimensionality reduction](#clustering-dimensionality-reduction)
- [Anomaly detection and distribution shift](#anomaly-drift-detection)
