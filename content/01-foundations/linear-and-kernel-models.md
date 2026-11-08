---
id: linear-and-kernel-models
book: 1
order: "1.4.4"
title: Linear models, kernels and other classic learners
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [linear-models, regularization, svm, logistic-regression, knn]
visuals: []
prerequisites: [classical-ml, linear-algebra]
---
> [!tldr]
> Linear and logistic regression, support vector machines, nearest neighbors, naive Bayes and Gaussian processes are the classic learners: fast, well understood and often good enough. The linear ones share one recipe, an average loss plus a penalty, so picking one largely means picking a loss, a regularizer and a feature map. They remain the baseline to beat and a cheap classifier on top of text embeddings.

## Key ideas

- **Least squares needs a penalty when features correlate.** Ordinary least squares becomes highly sensitive to noise when features are nearly linearly dependent (multicollinearity); ridge (L2) shrinks coefficients, lasso (L1) sets some exactly to zero, elastic net mixes both and tends to keep correlated features together, and the penalty strength is chosen by cross-validation or by an information criterion such as AIC or BIC ([scikit-learn: Linear models](https://scikit-learn.org/stable/modules/linear_model.html)).
- **Logistic regression and GLMs change the link and the loss.** Logistic regression is a linear classifier despite its name, fit as binary, one-vs-rest or multinomial; generalized linear models pair a link function with a distribution's deviance, such as Poisson with a log link for counts, Gamma for positive skewed targets, and the Tweedie family that covers these through one power parameter, while quantile regression predicts conditional quantiles and resists outliers ([scikit-learn: Linear models](https://scikit-learn.org/stable/modules/linear_model.html)).
- **One formula unifies them: empirical risk plus a penalty.** Minimize the average loss over the training data plus α times a penalty; hinge loss gives a linear SVM, log loss gives logistic regression, and squared error gives ridge or lasso depending on the penalty ([scikit-learn: Stochastic gradient descent](https://scikit-learn.org/stable/modules/sgd.html)). A small classifier trained on text embeddings is a cheap modern use: SetFit, for example, fine-tunes a sentence transformer on a few labeled text pairs and then trains a classification head on its embeddings ([Tunstall et al., 2022](https://arxiv.org/abs/2209.11055)).
- **SVMs maximize the margin, and kernels bend it.** The decision function depends only on the support vectors, `C` trades training errors against a smooth boundary (it is an inverse regularization strength), inputs should be scaled because SVMs are not scale invariant, and the kernel trick maps data implicitly into a higher-dimensional space ([scikit-learn: Support vector machines](https://scikit-learn.org/stable/modules/svm.html)). Kernelized SVMs do not scale well to large datasets, so the Nystroem method and random features approximate the kernel with an explicit feature map that a fast linear model can use; for Nystroem, the cost drops from cubic to linear in the number of samples ([scikit-learn: Kernel approximation](https://scikit-learn.org/stable/modules/kernel_approximation.html)).
- **Nearest neighbors remember, naive Bayes multiplies.** k-nearest neighbors stores the training data and votes among the closest points, a larger k smooths noise but blurs boundaries, and a KD-tree index loses its speed as dimensions grow, one face of the curse of dimensionality ([scikit-learn: Nearest neighbors](https://scikit-learn.org/stable/modules/neighbors.html)). Naive Bayes assumes features are independent given the class; it is fast and a decent classifier but a bad probability estimator, so its `predict_proba` outputs should not be taken seriously ([scikit-learn: Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html)).
- **Gaussian processes give uncertainty at a price.** A GP's kernel is a covariance function, its predictions are Gaussian distributions with confidence intervals, and it loses efficiency once features exceed a few dozen ([scikit-learn: Gaussian processes](https://scikit-learn.org/stable/modules/gaussian_process.html)). Bayesian optimization uses exactly this: it models a learning algorithm's performance as a function of its hyperparameters with a GP ([Snoek et al., 2012](https://arxiv.org/abs/1206.2944)).

## Planned visuals

- `chart`: illustrative regularization paths, coefficients against penalty strength for ridge and lasso side by side, with lasso coefficients hitting exactly zero one after another.
- `chart`: hinge, log and squared loss plotted against the margin y·f(x), showing why the SVM ignores points beyond the margin and logistic regression never fully does.
- `embedding-map`: k-nearest-neighbor classification with a draggable query point among labeled points, where changing k flips the vote near a class boundary.

## Talk like an expert

Experts say **penalty** and **regularization strength**, **inverse regularization C**, **link function**, **support vectors**, **kernel trick** and **calibrated versus uncalibrated scores**; they frame every classic learner as a choice of loss, penalty and feature map, and fit a regularized linear baseline before anything bigger.

## Go deeper

- James et al., [*An Introduction to Statistical Learning*](https://www.statlearning.com/), with editions in R and Python: regression, classification, resampling, regularization and SVMs.
- Rasmussen and Williams, [*Gaussian Processes for Machine Learning* (2006)](https://gaussianprocess.org/gpml/).
- scikit-learn, [Support vector machines](https://scikit-learn.org/stable/modules/svm.html): margins, kernels, scaling and complexity.

## Related

- [Classical ML essentials](#classical-ml)
- [Decision trees, ensembles and gradient boosting](#trees-and-ensembles)
- [Loss functions](#loss-functions)
- [Classification and regression metrics](#classification-metrics)
- [High-dimensional geometry](#high-dimensional-geometry)
- [Feature engineering and preprocessing](#feature-engineering)
