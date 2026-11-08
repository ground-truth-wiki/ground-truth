---
id: anomaly-drift-detection
book: 1
order: "1.4.7"
title: Anomaly detection and distribution shift
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [anomaly-detection, distribution-shift, drift, outliers, monitoring]
visuals: []
prerequisites: [classical-ml, probability-information]
---
> [!tldr]
> Anomaly detection flags single inputs that look unlike the rest; shift detection asks whether a whole stream of inputs or labels has moved away from the data a model learned from. Both matter because models rarely fail loudly under shift: they keep returning answers that are quietly worse. The one thing to remember: every detector is a score plus a threshold, and the threshold decides how many false alarms you accept to miss fewer real problems.

## Key ideas

- **Outliers, novelties and contamination.** In outlier detection the training data itself contains anomalies, and the detector fits the dense regions while ignoring them; in novelty detection the training data is clean, and the question is whether a new observation is unusual. In scikit-learn, a detector’s `predict` method applies a threshold to a raw score, and the `contamination` parameter, the expected proportion of outliers in the data, controls that threshold ([scikit-learn user guide, “Novelty and Outlier Detection”](https://scikit-learn.org/stable/modules/outlier_detection.html); [scikit-learn documentation, `IsolationForest`](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html)).
- **Five ideas of “unusual”.** An isolation forest splits the data at random, and anomalies end up isolated after noticeably fewer splits; local outlier factor compares a point’s local density with its neighbors’; a one-class SVM learns a frontier around normal data; an elliptic envelope fits a robust covariance estimate and scores points by their Mahalanobis distance ([scikit-learn user guide](https://scikit-learn.org/stable/modules/outlier_detection.html)). An autoencoder trained on mostly normal data reconstructs normal inputs well and anomalies badly, so its reconstruction error is usually used directly as the anomaly score (Ruff et al., [“A Unifying Review of Deep and Shallow Anomaly Detection”](https://arxiv.org/abs/2009.11732) (2021)).
- **Thresholds are a cost decision, made with few labels.** Labeled anomalies are often nonexistent, which is why most detectors are unsupervised, yet even a few labeled anomalies can improve detection significantly. Ruff et al. describe setting the threshold from the cost of each kind of error or from hard limits: if analysts can review only k alarms a day, optimize precision among the top k. When costs are unclear, threshold-free measures help: AUROC, whose random baseline is always 0.5, and the area under the precision–recall curve, which is more informative on highly imbalanced test sets; with no clear preference between them, they recommend reporting both ([Ruff et al. (2021)](https://arxiv.org/abs/2009.11732)).
- **Three kinds of shift.** Under covariate shift the inputs P(x) change while P(y | x) stays fixed; under label shift the label frequencies P(y) change while P(x | y) stays fixed; under concept shift the meaning of the labels itself changes ([Dive into Deep Learning, “Environment and Distribution Shift”](https://d2l.ai/chapter_linear-classification/environment-and-distribution-shift.html)). On the ten datasets of the WILDS benchmark, with real shifts across hospitals, camera traps, and time and place in satellite images, standard training yields substantially lower out-of-distribution than in-distribution performance (Koh et al., [“WILDS: A Benchmark of in-the-Wild Distribution Shifts”](https://arxiv.org/abs/2012.07421) (2020)).
- **Detecting shift means comparing two samples.** Monitoring tools compare a reference window with a current window, column by column: as of November 2026, Evidently’s defaults use the Kolmogorov–Smirnov test for numerical columns and the chi-squared test for categorical columns with more than two labels up to 1,000 objects, and switch to Wasserstein distance (numerical) or Jensen–Shannon distance (categorical) above that, with PSI among about 20 methods on offer ([Evidently documentation, “Customize Data Drift”](https://docs.evidentlyai.com/metrics/customize_data_drift)). For high-dimensional inputs, Rabanser et al. found that two-sample tests after reducing dimensionality with a pretrained classifier detected shift best, and that domain-discriminating approaches helped characterize a shift and judge whether it is harmful. Lipton et al.’s Black Box Shift Estimation recovers a shifted label distribution from a fixed classifier’s confusion matrix and average predictions, without new labels, as long as that matrix is invertible (Rabanser et al., [“Failing Loudly: An Empirical Study of Methods for Detecting Dataset Shift”](https://arxiv.org/abs/1810.11953) (2019); Lipton et al., [“Detecting and Correcting for Label Shift with Black Box Predictors”](https://arxiv.org/abs/1802.03916) (2018)).
- **LLM systems drift too.** The same ideas apply when the inputs are prompts and their embeddings, and a sudden spike in spend is an anomaly in the same sense; the pipeline checks and monitoring operations around them live in [data validation, drift and skew](#data-validation-drift), [cost and capacity](#cost-capacity) and [online evaluation](#online-evaluation). For text, as of November 2026, Evidently’s default trains a classifier to tell current from reference text, and its own comparison of five embedding-drift methods names this model-based approach a good default ([Evidently documentation](https://docs.evidentlyai.com/metrics/customize_data_drift); Filippova and Samuylova, [“Shift happens: we compared 5 methods to detect drift in ML embeddings”](https://evidentlyai.com/blog/embedding-drift-detection) (2023)).

## Planned visuals

- **`calculator`: why alerts get ignored.** From daily event volume, the true anomaly rate, and a detector’s recall and false-positive rate, compute alerts per day and the share of alerts that are real, showing how a rare event buries real alerts under false ones. Formula-based, with tests.
- **`compare`: covariate, label and concept shift.** Side-by-side panels that show which of P(x), P(y) and P(y | x) changes and which stays fixed, with one worked example per kind.
- **`stepper`: catching drift with a domain classifier.** Embed a reference window and a current window of prompts, train a classifier to tell them apart, and read its ROC AUC: near 0.5 means no detectable shift, well above it means drift; the last step checks whether the task metric moved too.

## Talk like an expert

Experts talk about **contamination**, **reference and current windows**, **covariate shift**, **label shift**, **concept drift**, **two-sample tests**, **domain classifiers** and **precision at k**. They keep “the data moved” apart from “the model got worse”, and ask which of the two an alert actually measures.

## Go deeper

- Ruff et al., [“A Unifying Review of Deep and Shallow Anomaly Detection”](https://arxiv.org/abs/2009.11732) (2021), Proceedings of the IEEE: one framework for density, one-class and reconstruction methods, plus evaluation advice.
- Rabanser, Günnemann and Lipton, [“Failing Loudly: An Empirical Study of Methods for Detecting Dataset Shift”](https://arxiv.org/abs/1810.11953) (NeurIPS 2019).
- Lipton, Wang and Smola, [“Detecting and Correcting for Label Shift with Black Box Predictors”](https://arxiv.org/abs/1802.03916) (ICML 2018).
- Lu et al., [“Learning under Concept Drift: A Review”](https://arxiv.org/abs/2004.05785) (2018), IEEE TKDE: drift in streaming data, organized into detection, understanding and adaptation.

## Related

- [Classical ML essentials](#classical-ml)
- [Online evaluation](#online-evaluation)
- [Data validation, drift and skew](#data-validation-drift)
- [Classification and regression metrics](#classification-metrics)
- [Observability and tracing](#observability-tracing)
- [Cost and capacity](#cost-capacity)
