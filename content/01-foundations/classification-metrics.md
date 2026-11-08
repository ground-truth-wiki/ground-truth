---
id: classification-metrics
book: 1
order: "1.4.1"
title: Classification and regression metrics
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [metrics, calibration, thresholds, class-imbalance, evaluation]
visuals:
  - classification-metrics-base-rate:calculator
  - classification-metrics-threshold-sweep:stepper
  - classification-metrics-reliability:chart
  - classification-metrics-decision:calculator
prerequisites: [classical-ml, probability-information]
---
> [!tldr]
> Every classification metric asks the confusion matrix a different question; the right one depends on how rare positives are, what errors cost, and whether you need labels, probabilities or sets. For rare positives, read precision-recall next to ROC, check calibration before trusting scores, and set thresholds from costs.

## Why it matters
Routers, guard models and LLM judges are classifiers. A guard model with a high ROC AUC can still bury reviewers in false alarms; a router that reads uncalibrated scores as probabilities can send the wrong share of traffic to the expensive model. Your metric decides which failure you see.

## Intuition
Picture a smoke alarm. Recall asks how many fires it catches; precision asks how many alarms are real fires. Its hardware fixes the true and false positive rates, but the share of its alarms that are real depends on how often fires happen.

```viz
{"id":"classification-metrics-base-rate","component":"calculator","title":"At 1% prevalence, a detector that catches 95% of positives and flags only 5% of negatives is wrong on 84% of its alarms","caption":"The detector's rates stay fixed; only the share of positives changes. With these rates, accuracy and balanced accuracy do not move, while precision and MCC collapse as positives get rare.","alt":"Calculator: from item count, prevalence, true positive rate and false positive rate, it computes the four confusion-matrix counts, precision, accuracy, balanced accuracy and the Matthews correlation coefficient.","data":"formula","try":"Set the prevalence to 0.5, then to 0.001, and watch precision.","inputs":{"n":10000,"prevalence":0.01,"tpr":0.95,"fpr":0.05},"input_meta":{"n":{"label":"Items","min":1,"step":1000},"prevalence":{"label":"Share of items that are positive","min":0,"max":1,"step":0.001},"tpr":{"label":"True positive rate (recall)","min":0,"max":1,"step":0.01},"fpr":{"label":"False positive rate","min":0,"max":1,"step":0.01}},"outputs":[{"id":"tp","label":"True positives (real alarms)","expr":"n * prevalence * tpr","unit":"count"},{"id":"fp","label":"False positives (false alarms)","expr":"n * (1 - prevalence) * fpr","unit":"count"},{"id":"fn","label":"False negatives (missed)","expr":"n * prevalence * (1 - tpr)","unit":"count"},{"id":"tn","label":"True negatives","expr":"n * (1 - prevalence) * (1 - fpr)","unit":"count"},{"id":"precision","label":"Precision: share of alarms that are real","expr":"tp / (tp + fp)","unit":"pct","main":true},{"id":"accuracy","label":"Accuracy","expr":"(tp + tn) / n","unit":"pct"},{"id":"balanced","label":"Balanced accuracy","expr":"(tpr + 1 - fpr) / 2","unit":"pct"},{"id":"mcc","label":"Matthews correlation coefficient","expr":"(tp * tn - fp * fn) / sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn))"}],"assumptions":["Binary classification at one fixed threshold.","The true and false positive rates do not depend on prevalence (the score distributions within each class stay the same)."],"tests":[{"inputs":{},"expect":{"precision":0.1610169,"accuracy":0.95,"balanced":0.95,"mcc":0.3800487},"tol":0.00001},{"inputs":{"prevalence":0.5},"expect":{"precision":0.95,"mcc":0.9},"tol":0.00001},{"inputs":{"prevalence":0.001},"expect":{"precision":0.018664,"mcc":0.1294227},"tol":0.0001}]}
```

## How it works
**The confusion matrix.** At a threshold, count true and false positives and negatives (TP, FP, FN, TN), as in [classical ML essentials](#classical-ml). Recall, the true positive rate, is TP ÷ (TP + FN); the false positive rate (FPR) is FP ÷ (FP + TN); precision is TP ÷ (TP + FP). Recall and FPR stay within one true class, so prevalence cannot move them; precision mixes both.

**Curves.** The ROC curve plots recall against FPR; its area, ROC AUC, is the chance that a random positive outscores a random negative ([Google ML Crash Course](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc)). The precision-recall (PR) curve plots precision against recall. ROC plots look the same on balanced and imbalanced data, while the PR baseline is the positive share, so [Saito and Rehmsmeier (2015)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0118432) recommend PR plots for imbalanced problems. **Average precision** summarizes the PR curve ([scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.average_precision_score.html)).

```viz
{"id":"classification-metrics-threshold-sweep","component":"stepper","title":"Lowering the threshold buys recall with false alarms","caption":"Illustrative scores for 20 items, 5 of them positive. Each frame flags every item that scores at or above the threshold; the last frame lines up all five operating points.","alt":"Stepper over five thresholds showing the confusion matrix of 20 illustrative items, then a table of recall, false positive rate and precision per threshold.","data":"illustrative","frames":[
{"label":"Threshold 0.9","caption":"Only the top item is flagged, and it is a real positive. Precision 1.00, recall 0.20, FPR 0.00.","panel":"Positives score 0.95, 0.85, 0.65, 0.45 and 0.25. Negatives score 0.75, 0.55, 0.35, 0.35, 0.15, 0.15, 0.12 and eight values below 0.10.","matrix":{"title":"Confusion matrix","rows":["Actual positive","Actual negative"],"cols":["Flagged","Not flagged"],"values":[[1,4],[0,15]],"min":0,"max":15,"fmt":0}},
{"label":"Threshold 0.7","caption":"The negative at 0.75 becomes the first false alarm. Precision 0.67, recall 0.40, FPR 0.07.","matrix":{"title":"Confusion matrix","rows":["Actual positive","Actual negative"],"cols":["Flagged","Not flagged"],"values":[[2,3],[1,14]],"min":0,"max":15,"fmt":0}},
{"label":"Threshold 0.5","caption":"Precision 0.60, recall 0.60, FPR 0.13.","matrix":{"title":"Confusion matrix","rows":["Actual positive","Actual negative"],"cols":["Flagged","Not flagged"],"values":[[3,2],[2,13]],"min":0,"max":15,"fmt":0}},
{"label":"Threshold 0.3","caption":"Two negatives tied at 0.35 enter together. Precision 0.50, recall 0.80, FPR 0.27.","matrix":{"title":"Confusion matrix","rows":["Actual positive","Actual negative"],"cols":["Flagged","Not flagged"],"values":[[4,1],[4,11]],"min":0,"max":15,"fmt":0}},
{"label":"Threshold 0.1","caption":"Every positive is caught, at the price of seven false alarms. Precision 0.42, recall 1.00, FPR 0.47.","matrix":{"title":"Confusion matrix","rows":["Actual positive","Actual negative"],"cols":["Flagged","Not flagged"],"values":[[5,0],[7,8]],"min":0,"max":15,"fmt":0}},
{"label":"All thresholds","caption":"ROC plots recall against FPR; PR plots precision against recall. Over all thresholds, ROC AUC is 0.91 and average precision 0.79. For comparison, a random scorer's ROC AUC is 0.5, and the PR baseline is the positive share, 0.25.","matrix":{"title":"Rates per threshold","rows":["0.9","0.7","0.5","0.3","0.1"],"cols":["Recall","FPR","Precision"],"values":[[0.2,0,1],[0.4,0.07,0.67],[0.6,0.13,0.6],[0.8,0.27,0.5],[1,0.47,0.42]],"min":0,"max":1,"fmt":2}}]}
```

**One number at a threshold.** **F-beta** is a weighted harmonic mean of precision and recall; [scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.fbeta_score.html) describes β = 2 as making recall twice as important. That is a preference, not a cost. **Balanced accuracy** is the mean recall over classes. The **Matthews correlation coefficient** (MCC) correlates predictions with labels, from −1 to +1 with 0 for random, and uses all four cells, unlike F1 ([scikit-learn](https://scikit-learn.org/stable/modules/model_evaluation.html)).

**Multiclass and multilabel.** Averaging per-class scores, **macro** weights classes equally and highlights rare ones; **weighted** weights them by support; **micro** pools the counts and, in single-label multiclass, equals accuracy; **samples** averages per item in multilabel tasks ([scikit-learn](https://scikit-learn.org/stable/modules/model_evaluation.html)).

**Probabilities.** **Log loss** punishes confident mistakes hardest ([probability and information theory](#probability-information)); the **Brier score** is the probability's squared error. Both are strictly proper but mix calibration with discrimination, so a lower Brier score does not prove better calibration ([scikit-learn](https://scikit-learn.org/stable/modules/calibration.html)).

**Calibration.** A calibrated model's 0.8 predictions are right about 80% of the time. A **reliability diagram** plots each bin's observed rate against its mean score. [Guo et al. (2017)](https://arxiv.org/abs/1706.04599) found modern networks poorly calibrated, measuring the gap with expected calibration error over M equal-width bins:

```math
\text{ECE} = \sum_{m=1}^{M} \frac{|B_m|}{n}\,\bigl|\text{acc}(B_m) - \text{conf}(B_m)\bigr|
```

Measurement choices matter: [Nixon et al., “Measuring Calibration in Deep Learning” (2019)](https://arxiv.org/abs/1904.01685) find that the choice of calibration measure can change how recalibration methods rank, and recommend adaptive bins, which keep rankings more stable as the bin count varies.

```viz
{"id":"classification-metrics-reliability","component":"chart","type":"line","title":"An overconfident model's curve is flatter than the diagonal; recalibration pulls it back","caption":"Illustrative reliability diagram with ten equal-width bins. Where the curve sits below the diagonal, the model's probabilities are too high; where it sits above, too low. Platt and temperature scaling change the probabilities, not the ranking.","alt":"Illustrative line chart of observed fraction of positives against mean predicted probability: a diagonal for perfect calibration, an overconfident model whose curve is flatter than the diagonal, and the same model after recalibration close to the diagonal.","data":"illustrative","x":{"label":"Mean predicted probability in the bin","min":0,"max":1},"y":{"label":"Observed fraction of positives","min":0,"max":1},"series":[{"name":"Perfect calibration","points":[[0,0],[1,1]]},{"name":"Overconfident model","points":[[0.05,0.14],[0.15,0.21],[0.25,0.29],[0.35,0.37],[0.45,0.45],[0.55,0.52],[0.65,0.58],[0.75,0.64],[0.85,0.71],[0.95,0.79]]},{"name":"After recalibration","points":[[0.05,0.06],[0.15,0.14],[0.25,0.26],[0.35,0.34],[0.45,0.46],[0.55,0.54],[0.65,0.66],[0.75,0.74],[0.85,0.86],[0.95,0.94]]}]}
```

**Recalibration** fits a monotone map from scores to probabilities on held-out data, never training data. **Platt scaling** fits a sigmoid and suits small sets; **isotonic regression** fits any increasing step and matches or beats Platt above about 1,000 samples ([scikit-learn](https://scikit-learn.org/stable/modules/calibration.html)); **temperature scaling** divides logits by one learned T, leaving accuracy unchanged, and Guo et al. found it surprisingly effective.

**Prediction sets.** Split conformal prediction ([Angelopoulos and Bates (2021)](https://arxiv.org/abs/2107.07511)) scores n held-out examples by one minus the true label's probability, takes the ⌈(n+1)(1−α)⌉/n quantile q̂ of those scores, and returns every label whose probability is at least 1 − q̂. With i.i.d. data, coverage is at least 1 − α, and at most 1 − α + 1/(n+1) when the scores have no ties. The guarantee is marginal, averaged over inputs, not per group.

**Class imbalance.** Undersampling, oversampling, SMOTE ([Chawla et al., “SMOTE: Synthetic Minority Over-sampling Technique” (2002)](https://arxiv.org/abs/1106.1813)) and class weights teach the model a false base rate; [Google's crash course](https://developers.google.com/machine-learning/crash-course/overfitting/imbalanced-datasets) notes that downsampling introduces prediction bias this way. [van den Goorbergh et al., “The harm of class imbalance corrections for risk prediction models: illustration and simulation using logistic regression” (2022)](https://arxiv.org/abs/2202.09101) found that resampling and SMOTE strongly overestimated minority probabilities in logistic regression without better ROC AUC; moving the threshold matched their sensitivity and specificity. Theorem 2 of [Elkan, “The Foundations of Cost-Sensitive Learning” (2001)](https://cseweb.ucsd.edu/~elkan/rescale.pdf) maps a probability back to the real base rate.

**Thresholds from costs.** With calibrated probabilities and free correct decisions, flag when p ≥ c_FP ÷ (c_FP + c_FN) (Elkan). Tune on [validation data](#validation-tuning), never training data ([scikit-learn](https://scikit-learn.org/stable/modules/classification_threshold.html)).

**Regression.** MAE is minimized by the median, MSE by the mean, and RMSE is MSE in target units. R² is 1 at best, 0 for predicting the mean, and can go negative. MAPE explodes near zero targets. Pinball loss scores a quantile; at the median it is half the MAE ([scikit-learn](https://scikit-learn.org/stable/modules/model_evaluation.html)).

**Baselines.** Report a dummy, such as scikit-learn's DummyClassifier or DummyRegressor, beside every score.

## In practice
In scikit-learn 1.9, current as of November 2026:

```python
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.dummy import DummyClassifier
from sklearn.frozen import FrozenEstimator
from sklearn.metrics import (average_precision_score, brier_score_loss, log_loss,
                             matthews_corrcoef, roc_auc_score)

# clf is fitted on the training split; the calibration and test splits are disjoint from it.
cal = CalibratedClassifierCV(FrozenEstimator(clf), method="sigmoid").fit(X_cal, y_cal)
p = cal.predict_proba(X_test)[:, 1]
prior = DummyClassifier(strategy="prior").fit(X_train, y_train).predict_proba(X_test)[:, 1]

print("AP", average_precision_score(y_test, p), "random", y_test.mean())
print("ROC AUC", roc_auc_score(y_test, p))
print("log loss", log_loss(y_test, p), "dummy", log_loss(y_test, prior))
print("Brier", brier_score_loss(y_test, p))
frac_pos, mean_pred = calibration_curve(y_test, p, n_bins=10, strategy="quantile")  # reliability diagram

cost_fp, cost_fn = 1.0, 20.0                    # your own costs, in one unit
y_hat = (p >= cost_fp / (cost_fp + cost_fn)).astype(int)
print("MCC", matthews_corrcoef(y_test, y_hat))
```

- **Routers.** [Ong et al., “RouteLLM: Learning to Route LLMs with Preference Data” (2024)](https://arxiv.org/abs/2406.18665) route to the strong model when its predicted win probability reaches a threshold α; sweep α and plot quality against strong-model calls ([gateways and routers](#gateways-routers)).
- **Guard models.** [Inan et al., “Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations” (2023)](https://arxiv.org/abs/2312.06674) score with the first output token's probability and report AUPRC, which focuses on the unsafe class ([guard models](#guard-models-moderation), [guardrails](#guardrails-control)).
- **LLM judges.** Report a judge's true positive and true negative rates against human labels ([LLM-as-judge](#llm-as-judge)), with intervals ([eval statistics](#eval-statistics)); calibrate its confidence before use ([LLM uncertainty](#llm-uncertainty)).

```viz
{"id":"classification-metrics-decision","component":"calculator","title":"A 0.9 from a model trained on balanced data is about 8% at 1% prevalence; costs then decide whether to flag","caption":"First undo the training base rate with Elkan's Theorem 2, then compare the corrected probability with the cost threshold. Flag when the expected cost of flagging is the smaller one. Costs are illustrative.","alt":"Calculator: from a model score, the positive share in training and in production, and the costs of a false positive and a false negative, it computes the corrected probability, the cost-optimal threshold and the expected cost of flagging and of not flagging.","data":"formula","try":"Set the training share to 0.01 so it matches production: the score no longer changes.","inputs":{"p_model":0.9,"base_train":0.5,"base_real":0.01,"cost_fp":1,"cost_fn":20},"input_meta":{"p_model":{"label":"Model score (probability at the training base rate)","min":0,"max":1,"step":0.01},"base_train":{"label":"Share of positives in the training data","min":0,"max":1,"step":0.01},"base_real":{"label":"Share of positives in production","min":0,"max":1,"step":0.001},"cost_fp":{"label":"Cost of a false positive","unit":"any unit"},"cost_fn":{"label":"Cost of a false negative","unit":"same unit"}},"outputs":[{"id":"p_real","label":"Probability at the production base rate","expr":"base_real * (p_model - p_model * base_train) / (base_train - p_model * base_train + base_real * p_model - base_train * base_real)","unit":"pct","main":true},{"id":"threshold","label":"Cost-optimal threshold","expr":"cost_fp / (cost_fp + cost_fn)","unit":"pct"},{"id":"cost_flag","label":"Expected cost if you flag","expr":"(1 - p_real) * cost_fp"},{"id":"cost_pass","label":"Expected cost if you do not flag","expr":"p_real * cost_fn"}],"assumptions":["The score is calibrated at the training base rate.","Only the base rate differs between training and production; the score distributions within each class are the same.","Correct decisions cost nothing, and costs are the same for every item."],"tests":[{"inputs":{},"expect":{"p_real":0.0833333,"threshold":0.047619,"cost_flag":0.9166667,"cost_pass":1.6666667},"tol":0.00001},{"inputs":{"p_model":0.5},"expect":{"p_real":0.01,"cost_flag":0.99,"cost_pass":0.2},"tol":0.00001},{"inputs":{"base_train":0.01},"expect":{"p_real":0.9},"tol":0.00001}]}
```

> [!try]
> On held-out data, compare average precision with ROC AUC, and a 0.5 threshold with c_FP ÷ (c_FP + c_FN) for your real costs.

## Numbers to know
> [!number]
> Formulas. Random scoring gives ROC AUC 0.5 and average precision close to the positive share on large test sets ([scikit-learn](https://scikit-learn.org/stable/modules/model_evaluation.html)). If a miss costs 20 false alarms, flag above 1/21, about 0.05 ([Elkan, 2001](https://cseweb.ucsd.edu/~elkan/rescale.pdf)). Split conformal with n = 500 and α = 0.1 covers 90% to about 90.2% ([Angelopoulos and Bates, 2021](https://arxiv.org/abs/2107.07511)).

## Pitfalls and anti-patterns
> [!pitfall] Judging a rare-event detector by ROC AUC
> ROC AUC ignores prevalence, so a detector can look excellent while most alarms are false. Report average precision and precision at your threshold.

- **Reading resampled scores as probabilities.** Correct the base rate first.
- **Calibrating on training data.** The calibrator then pushes probabilities toward 0 and 1 ([scikit-learn](https://scikit-learn.org/stable/modules/calibration.html)).

## Talk like an expert
The vocabulary: **operating point**, **prevalence**, **AUPRC**, **proper scoring rule**, **ECE**, **marginal coverage**, **prior shift**. Experts ask "which threshold, what prevalence, which baseline?" before reading a number. The live debate is the default curve: PR shows how an imbalanced deployment will feel, while ROC ignores prevalence and so compares across datasets.

> [!hottake] Most class-imbalance fixes are threshold choices in disguise.
> Fit a calibrated model on real data and move the threshold. **The counterargument:** under severe imbalance many batches hold no minority example, so downsampling with upweighting can make training work, and its bias is correctable ([Google ML Crash Course](https://developers.google.com/machine-learning/crash-course/overfitting/imbalanced-datasets)). The 2022 evidence covers only logistic regression.

## Check yourself
```quiz
classification-metrics
```

## Go deeper
- Saito and Rehmsmeier, [“The Precision-Recall Plot Is More Informative than the ROC Plot When Evaluating Binary Classifiers on Imbalanced Datasets” (2015)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0118432).
- Guo et al., [“On Calibration of Modern Neural Networks” (2017)](https://arxiv.org/abs/1706.04599).
- Angelopoulos and Bates, [“A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification” (2021)](https://arxiv.org/abs/2107.07511).

## Related
- [Classical ML essentials](#classical-ml)
- [Metrics and graders](#metrics-graders)
- [LLM-as-judge done right](#llm-as-judge)
- [Statistics for evals](#eval-statistics)
- [Uncertainty and confidence estimation for LLMs](#llm-uncertainty)
- [Validation, tuning and leakage](#validation-tuning)
