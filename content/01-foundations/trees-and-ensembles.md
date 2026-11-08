---
id: trees-and-ensembles
book: 1
order: "1.4.5"
title: Decision trees, ensembles and gradient boosting
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [decision-trees, random-forests, gradient-boosting, tabular-data, ensembles]
visuals: []
prerequisites: [classical-ml]
---
> [!tldr]
> A decision tree predicts by asking a sequence of yes-or-no questions about the features. One tree overfits and is unstable, but many trees averaged (random forests) or added up one after another (gradient boosting) have long been the strongest default for tabular data. A tuned gradient-boosted model is still the baseline to beat, but as of November 2026 tabular foundation models lead the TabArena benchmark on tables of up to 100,000 training rows.

## Key ideas

- **One tree is greedy, readable and unstable.** CART grows a binary tree by picking, at each node, the split with the best impurity reduction (Gini or entropy for classes, squared error for regression); trees need little data preparation, but they overfit unless depth, leaf size or cost-complexity pruning limit them, and a small change in the data can produce a completely different tree ([scikit-learn: Decision trees](https://scikit-learn.org/stable/modules/tree.html)).
- **Bagging averages the instability away.** A random forest trains each tree on a bootstrap sample and considers a random subset of features at each split, extremely randomized trees also draw split thresholds at random, and the samples a tree never saw give a free out-of-bag estimate of generalization error ([scikit-learn: Ensembles](https://scikit-learn.org/stable/modules/ensemble.html)).
- **Boosting is gradient descent in function space.** AdaBoost reweights the examples earlier learners got wrong, while gradient boosting fits each new tree to the negative gradient of the loss, the steepest-descent view of boosting that Friedman set out for general loss functions ([Friedman, 2001](https://doi.org/10.1214/aos/1013203451)). A small learning rate (shrinkage), row subsampling and early stopping on a validation loss are the main brakes against overfitting ([scikit-learn: Ensembles](https://scikit-learn.org/stable/modules/ensemble.html)).
- **Modern libraries made boosting fast and practical.** XGBoost added sparsity-aware split finding and a weighted quantile sketch ([Chen and Guestrin, 2016](https://arxiv.org/abs/1603.02754)), LightGBM added gradient-based one-side sampling and exclusive feature bundling ([Ke et al., 2017](https://papers.nips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html)), and CatBoost added ordered boosting and a categorical-feature method against a prediction shift caused by target leakage ([Prokhorenkova et al., 2017](https://arxiv.org/abs/1706.09516)). scikit-learn's histogram-based boosting handles missing values and categorical splits natively and accepts monotonic and interaction constraints ([scikit-learn: Ensembles](https://scikit-learn.org/stable/modules/ensemble.html)).
- **Read importances with care, and combine models deliberately.** Impurity-based importances come from training data and favor high-cardinality features, so permutation importance on held-out data is the safer reading; voting averages different models, and stacking trains a final estimator on their cross-validated predictions ([scikit-learn: Ensembles](https://scikit-learn.org/stable/modules/ensemble.html)).
- **Trees led on typical tables; foundation models now challenge them.** On 45 medium-sized datasets (about 10,000 samples), tree models stayed ahead of deep learning because neural networks struggle with uninformative features, with irregular functions, and with preserving the orientation of the data ([Grinsztajn et al., 2022](https://arxiv.org/abs/2207.08815)). TabPFN, a tabular foundation model, then beat all previous methods, including the gradient-boosted trees that had dominated tabular data for 20 years, on datasets of up to 10,000 samples ([Hollmann et al., 2025](https://doi.org/10.1038/s41586-024-08328-6)). The TabArena living benchmark found gradient-boosted trees still strong, deep learning catching up with ensembling and larger budgets, and foundation models best on smaller datasets ([Erickson et al., 2025](https://arxiv.org/abs/2506.16791)); as of November 2026, foundation models hold the top places of its [leaderboard](https://tabarena.ai) on both its small (1,001 to 10,000 training rows) and medium (10,001 to 100,000) subsets, with the best tree-based entries below them, and the ranking changes often.

## Planned visuals

- `stepper`: gradient boosting on a one-dimensional regression, round by round: each shallow tree fits the current residuals (the negative gradient of squared error), and the ensemble's prediction moves toward the data by the learning rate.
- `diagram`: bagging next to boosting, with parallel trees on bootstrap samples averaged on one side and a chain of trees each correcting the last on the other.
- `tree`: a decision guide for tabular problems: a gradient-boosted model, a tabular foundation model, an LLM, or LLM-extracted fields feeding a gradient-boosted model, by dataset size, share of free text and latency budget.

## Talk like an expert

Experts say **GBDT**, **shrinkage**, **boosting rounds**, **early stopping**, **OOB score**, **permutation importance** and **monotonic constraints**, and they treat a tuned gradient-boosted model as the baseline any tabular deep model, foundation model or LLM must beat on the same splits.

## Go deeper

- Friedman, [“Greedy Function Approximation: A Gradient Boosting Machine” (2001)](https://doi.org/10.1214/aos/1013203451).
- Chen and Guestrin, [“XGBoost: A Scalable Tree Boosting System” (2016)](https://arxiv.org/abs/1603.02754).
- Grinsztajn et al., [“Why do tree-based models still outperform deep learning on tabular data?” (2022)](https://arxiv.org/abs/2207.08815).
- Hollmann et al., [“Accurate predictions on small data with a tabular foundation model” (2025)](https://doi.org/10.1038/s41586-024-08328-6), the TabPFN paper in Nature; code and current model versions in the [TabPFN repository](https://github.com/PriorLabs/TabPFN).

## Related

- [Classical ML essentials](#classical-ml)
- [Linear models, kernels and other classic learners](#linear-and-kernel-models)
- [Feature engineering and preprocessing](#feature-engineering)
- [Explaining model predictions](#model-interpretability)
- [Validation, tuning and leakage](#validation-tuning)
