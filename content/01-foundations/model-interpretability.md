---
id: model-interpretability
book: 1
order: "1.14"
title: Explaining model predictions
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [explainability, shap, feature-importance, lime, interpretability]
visuals: []
prerequisites: [classical-ml]
---
> [!tldr]
> Explaining a model answers "why this prediction?" for one case (a local explanation) or "what drives this model?" across a dataset (a global explanation). You can pick a model people can read directly, or explain a trained black box with permutation importance, partial dependence, SHAP, LIME or counterfactuals. Remember that every explanation describes the model, not the world, and that correlated features quietly distort several of them.

## Key ideas

- **Interpretable by design, or explained after training.** Linear and logistic regression, their extensions such as GLMs and GAMs, decision trees, decision rules and RuleFit are interpretable models, while post-hoc methods explain a model after it is trained, either one prediction at a time (local) or as its average behavior across a dataset (global), and model-agnostic methods use only inputs and outputs ([Molnar: Methods overview](https://christophm.github.io/interpretable-ml-book/overview.html); [Molnar: GLM, GAM and more](https://christophm.github.io/interpretable-ml-book/extend-lm.html)). [Mechanistic interpretability](#mech-interp) is a different project: it aims to understand the computational mechanisms inside a neural network (Sharkey et al., [“Open Problems in Mechanistic Interpretability”](https://arxiv.org/abs/2501.16496) (2025)).
- **Permutation importance, best measured on held-out data.** It shuffles one feature and measures how much the model's score drops, and on a held-out set it shows which features the model relies on to generalize. Impurity-based importance from trees is strongly biased toward high-cardinality features and, when the model overfits, can rank highly features that do not predict on unseen data. If two features are correlated, permuting one leaves the model the other, so both look less important than they are, and in every case the result says how important a feature is for this model, not how predictive it is in itself ([scikit-learn: Permutation feature importance](https://scikit-learn.org/stable/modules/permutation_importance.html)).
- **Partial dependence and ICE assume independence; ALE does not.** A partial dependence plot (PDP) shows the expected prediction as one feature varies, an individual conditional expectation (ICE) plot draws one line per sample and their average is the PDP, and both assume the feature is independent of the others, so correlated features make them average over absurd data points ([scikit-learn: Partial dependence and ICE](https://scikit-learn.org/stable/modules/partial_dependence.html)). Accumulated local effects (ALE) plots need no such extrapolation and are far less expensive to compute than partial dependence plots (Apley and Zhu, [“Visualizing the Effects of Predictor Variables in Black Box Supervised Learning Models”](https://arxiv.org/abs/1612.08468) (2016)).
- **Shapley values and SHAP: additive, principled and expensive.** A Shapley value is a feature's average marginal contribution across all coalitions of features; the values for one prediction add up to that prediction minus the average prediction, exact computation grows exponentially with the number of features, and a Shapley value is not the change in prediction when the feature is removed ([Molnar: Shapley values](https://christophm.github.io/interpretable-ml-book/shapley.html)). SHAP rests on the result that, within the class of additive feature importance measures, one solution is unique in having a set of desirable properties, a class that unifies six earlier methods (Lundberg and Lee, [“A Unified Approach to Interpreting Model Predictions”](https://arxiv.org/abs/1705.07874) (2017)).
- **Local surrogates, counterfactuals, anchors and global surrogates.** LIME explains one prediction by fitting an interpretable model to the black box's outputs on perturbed samples weighted by their closeness to the instance (Ribeiro et al., [“"Why Should I Trust You?": Explaining the Predictions of Any Classifier”](https://arxiv.org/abs/1602.04938) (2016)), but choosing that neighborhood is unsolved for tabular data and repeated sampling can change the explanation ([Molnar: LIME](https://christophm.github.io/interpretable-ml-book/lime.html)). A counterfactual is the smallest feature change that turns the prediction into a chosen output, an anchor is an if-then rule that keeps the prediction fixed for at least a chosen share of the neighbors it covers, and a global surrogate is an interpretable model trained to mimic the black box, whose fidelity is measured with R-squared and whose conclusions are about the model, not the data ([Molnar: Counterfactuals](https://christophm.github.io/interpretable-ml-book/counterfactual.html); [Anchors](https://christophm.github.io/interpretable-ml-book/anchors.html); [Surrogate models](https://christophm.github.io/interpretable-ml-book/global.html)).
- **Evaluate explanations, and know when they are owed.** Doshi-Velez and Kim propose evaluating interpretability on a real task with domain experts, on a simple task with lay people, or on a proxy task without humans, and individual explanations are judged on properties such as fidelity and stability ([Molnar: Evaluation](https://christophm.github.io/interpretable-ml-book/evaluation.html); Doshi-Velez and Kim, [“Towards A Rigorous Science of Interpretable Machine Learning”](https://arxiv.org/abs/1702.08608) (2017)). As of November 2026, the GDPR gives people a right to "meaningful information about the logic involved" in solely automated decisions with legal or similarly significant effects, and Article 86 of the EU AI Act sets out a right to "clear and meaningful explanations" for people affected by decisions based on certain high-risk systems listed in its Annex III; this is information, not legal advice ([GDPR, Articles 15 and 22](https://eur-lex.europa.eu/eli/reg/2016/679/oj); [EU AI Act, Article 86](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)).

## Planned visuals

- `chart`: a SHAP waterfall for one illustrative prediction, with one bar per feature stepping from the base value (the average prediction) to the model's output, so the reader sees that the attributions add up.
- `stepper`: permutation importance step by step: score the model on held-out data, shuffle one column, score again and read the drop; then add a near-copy of the top feature and watch both importances shrink.
- `compare`: a partial dependence plot on two correlated features, with the impossible grid points it averages over highlighted, next to an ALE plot of the same model.

## Talk like an expert

Practitioners separate **local** from **global** explanations and **feature importance** from **feature effects**, and speak of **SHAP values**, the **background dataset**, **fidelity** and the **Rashomon effect** (several different explanations fit equally well, as with counterfactuals; [Molnar: Counterfactuals](https://christophm.github.io/interpretable-ml-book/counterfactual.html)). Their first questions about any explanation are: faithful to which model, computed on which data, and what happened to the correlated features?

## Go deeper

- Molnar, [*Interpretable Machine Learning*, 3rd edition (2025)](https://christophm.github.io/interpretable-ml-book/), free to read online, with a chapter on each post-hoc method on this page.
- Lundberg and Lee, [“A Unified Approach to Interpreting Model Predictions” (2017)](https://arxiv.org/abs/1705.07874).
- Ribeiro et al., [“"Why Should I Trust You?": Explaining the Predictions of Any Classifier” (2016)](https://arxiv.org/abs/1602.04938).
- Rudin, [“Stop Explaining Black Box Machine Learning Models for High Stakes Decisions and Use Interpretable Models Instead” (2019)](https://arxiv.org/abs/1811.10154), the case for interpretable models over explained black boxes.

## Related

- [Classical ML essentials](#classical-ml)
- [Decision trees, ensembles and gradient boosting](#trees-and-ensembles)
- [Linear models, kernels and other classic learners](#linear-and-kernel-models)
- [Mechanistic interpretability](#mech-interp)
- [Responsible AI in practice](#responsible-ai)
- [Governance, regulation and law](#governance-regulation)
