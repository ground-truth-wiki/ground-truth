---
id: validation-tuning
book: 1
order: "1.4.2"
title: Validation, tuning and leakage
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [cross-validation, hyperparameter-search, leakage, model-selection, splits]
visuals: []
prerequisites: [classical-ml]
---
> [!tldr]
> Validation estimates how a model will do on data it has never seen, and tuning searches for the settings that look best under that estimate. Both fail in the same quiet way: information from the evaluation data leaks into training or selection, and every number comes out too good. Split the way your data was generated (by group, by time), fit every preprocessing step inside the training fold, and touch the test set once.

## Key ideas

- **Hold data out, then rotate.** A model scored on the data it was trained on can look perfect by repeating labels, so part of the data is held out as a test set; k-fold cross-validation rotates which fold is held out, stratified k-fold keeps class proportions in every fold, and the scikit-learn guide notes that most authors prefer 5- or 10-fold over leave-one-out ([scikit-learn: Cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html)).
- **The i.i.d. assumption rarely holds.** When samples share a source (the same user, patient, document or template), split by group so no group sits on both sides; when data is ordered in time, train on the past and test on the future with growing windows, as `GroupKFold` and `TimeSeriesSplit` do ([scikit-learn: Cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html)).
- **Leakage is information you will not have at prediction time.** In scikit-learn's own example, picking 25 of 10,000 random features using all the data before the split scores 0.76 accuracy on random labels, while picking them on the training split alone gives the expected 0.5; a pipeline that fits every step only on the training fold prevents this ([scikit-learn: Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html)).
- **Tuning and reporting on the same folds is optimistic.** Cawley and Talbot show that overfitting the model-selection criterion biases the final estimate by amounts often comparable to the differences between learning algorithms ([Cawley and Talbot, 2010](https://www.jmlr.org/papers/v11/cawley10a.html)). Tune on a development set and report on a separate evaluation set, or nest the tuning loop inside an outer cross-validation, which the scikit-learn guide calls best practice ([scikit-learn: Tuning hyper-parameters](https://scikit-learn.org/stable/modules/grid_search.html)).
- **Search smarter than a grid.** Hyperparameters such as `C` or `alpha` are not learned by the estimator but passed to it ([scikit-learn: Tuning hyper-parameters](https://scikit-learn.org/stable/modules/grid_search.html)), and random search is more efficient than a grid because on most datasets only a few of them really matter ([Bergstra and Bengio, 2012](https://www.jmlr.org/papers/v13/bergstra12a.html)). Bayesian optimization models the score as a Gaussian process to pick the next trial ([Snoek et al., 2012](https://arxiv.org/abs/1206.2944)), and Hyperband gives many random configurations a small budget and only the promising ones more ([Li et al., 2016](https://arxiv.org/abs/1603.06560)).
- **Curves diagnose bias and variance, with a modern caveat.** If training and validation scores are both low the model underfits; if training is high and validation low it overfits, and a learning curve shows whether more data would help ([scikit-learn: Validation curves](https://scikit-learn.org/stable/modules/learning_curve.html)). Very large models can pass the point where they fit the training data exactly and improve again, the "double descent" curve that extends the textbook U shape ([Belkin et al., 2018](https://arxiv.org/abs/1812.11118)).

## Planned visuals

- `stepper`: k-fold, group k-fold and time-series splits animated over the same dataset, fold by fold, showing how one user's rows cross from training into testing under plain k-fold and stay on one side under group k-fold.
- `compare`: a leaky flow (feature selection or scaling fit on all data, then split) next to a pipeline fit inside each fold, linked to the 0.76 versus 0.5 accuracy of the scikit-learn example.
- `chart`: illustrative validation and learning curves, training and validation score against one hyperparameter and against training-set size, with the underfitting and overfitting regions labeled.

## Talk like an expert

Practitioners speak of the **development set** and the **held-out test set**, **group** and **temporal leakage**, **nested CV**, **search budget**, **early stopping** and **permutation tests**, and their first question about any score is "what was the split, and was anything fit before it?"

## Go deeper

- scikit-learn, [Common pitfalls and recommended practices](https://scikit-learn.org/stable/common_pitfalls.html): leakage, pipelines and controlled randomness.
- Cawley and Talbot, [“On Over-fitting in Model Selection and Subsequent Selection Bias in Performance Evaluation” (2010)](https://www.jmlr.org/papers/v11/cawley10a.html).
- Snoek et al., [“Practical Bayesian Optimization of Machine Learning Algorithms” (2012)](https://arxiv.org/abs/1206.2944).
- Akiba et al., [“Optuna: A Next-generation Hyperparameter Optimization Framework” (2019)](https://arxiv.org/abs/1907.10902).

## Related

- [Classical ML essentials](#classical-ml)
- [Statistics for evals](#eval-statistics)
- [Building eval datasets](#eval-datasets)
- [Feature engineering and preprocessing](#feature-engineering)
- [Classification and regression metrics](#classification-metrics)
- [Learning rate, batch size and schedules](#training-hyperparameters)
