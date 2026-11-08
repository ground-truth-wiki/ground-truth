---
id: feature-engineering
book: 1
order: "1.4.3"
title: Feature engineering and preprocessing
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [features, preprocessing, encoding, feature-selection, tabular-data]
visuals: []
prerequisites: [classical-ml]
---
> [!tldr]
> Feature engineering turns raw columns, categories and text into numbers a model can learn from: scaling, encoding, imputing, crossing and selecting. It matters most for linear models and kernels, less for trees, and for text a pretrained embedding model can replace it. Every transform is learned from data, so fit it on the training split only and run the exact same code at serving time.

## Key ideas

- **Put numbers on a common footing.** L1 and L2 penalties and the RBF kernel may assume features centered on zero with variances of the same order, so a feature with a much larger variance can dominate; standard, min-max and robust scalers fix the scale, while quantile and power transforms (Box-Cox, Yeo-Johnson) reshape skewed distributions ([scikit-learn: Preprocessing data](https://scikit-learn.org/stable/modules/preprocessing.html)). Decision trees, by contrast, need little data preparation ([scikit-learn: Decision trees](https://scikit-learn.org/stable/modules/tree.html)).
- **Encode categories without leaking the target.** One-hot encoding suits a handful of categories and can send unseen or infrequent ones to a shared bucket, ordinal codes imply an order the model will believe, and target encoding (the category's mean target) suits high-cardinality columns but needs cross-fitting, where each fold is encoded with statistics from the other folds ([scikit-learn: Preprocessing data](https://scikit-learn.org/stable/modules/preprocessing.html)). For huge vocabularies, the hashing trick maps features straight to column indices with a hash function, trading inspectability for speed and memory ([scikit-learn: Feature extraction](https://scikit-learn.org/stable/modules/feature_extraction.html)); Weinberger et al. analyzed it as a dimensionality reduction for large-scale multitask learning ([Weinberger et al., 2009](https://arxiv.org/abs/0902.2206)).
- **Give linear models their nonlinearity, and keep missingness visible.** Feature crosses (Cartesian products of categorical or bucketed features), polynomial and spline features let a linear model fit interactions and curves, but crossing sparse features makes even sparser ones ([Google ML Crash Course: Feature crosses](https://developers.google.com/machine-learning/crash-course/categorical-data/feature-crosses); [scikit-learn: Preprocessing data](https://scikit-learn.org/stable/modules/preprocessing.html)). Impute missing values with a constant or a column statistic and add a missingness indicator, since which values were missing can be informative; scikit-learn's tree ensembles accept missing values natively ([scikit-learn: Imputation](https://scikit-learn.org/stable/modules/impute.html)).
- **Text features went from counts to embeddings.** Bag of words counts words and ignores their order, n-grams recover short phrases, and TF-IDF down-weights words that appear everywhere ([scikit-learn: Feature extraction](https://scikit-learn.org/stable/modules/feature_extraction.html)). A pretrained text encoder can replace this step: SetFit, for example, fine-tunes a sentence transformer on a few labeled text pairs and trains a classification head on its embeddings ([Tunstall et al., 2022](https://arxiv.org/abs/2209.11055)).
- **Select features inside the pipeline.** A variance threshold drops near-constant features without looking at the labels, while univariate tests, L1-penalized models, recursive feature elimination and forward or backward sequential selection score features against the target; scikit-learn recommends running selection as a pipeline step ([scikit-learn: Feature selection](https://scikit-learn.org/stable/modules/feature_selection.html)), which keeps it fit on training data only ([scikit-learn: Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html)).
- **Training-serving skew undoes good features.** Rules of ML names three causes (different handling of data in the training and serving pipelines, data that changed between training and serving, and a feedback loop between the model and the algorithm) and recommends reusing code between the training and serving pipelines and saving the features used at serving time ([Zinkevich, Rules of Machine Learning](https://developers.google.com/machine-learning/guides/rules-of-ml)). Feature stores add point-in-time joins: Feast scans back from each training row's timestamp, within a TTL, so the row never sees feature values from after its own timestamp ([Feast: Point-in-time joins](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)).

## Planned visuals

- `stepper`: target encoding with cross-fitting, fold by fold, showing each row's category mean computed without its own label, next to the leaky version that encodes every row with statistics that include it.
- `diagram`: a column-transformer pipeline: numeric columns through an imputer and a scaler, categorical columns through one-hot or target encoding, text through TF-IDF or an embedding model, all fit on the training split and reused unchanged at serving time.
- `compare`: training-time feature code next to serving-time feature code, with linked highlights on the three causes of training-serving skew from Rules of ML.

## Talk like an expert

Experts talk about **fit and transform**, **cross-fitting**, **high-cardinality categoricals**, **feature crosses**, **missingness indicators**, **training-serving skew** and **point-in-time correctness**, and they treat every learned transform as part of the model: versioned, tested and shipped with it.

## Go deeper

- scikit-learn, [Preprocessing data](https://scikit-learn.org/stable/modules/preprocessing.html): scalers, transforms, encoders, discretization, polynomial and spline features.
- Zinkevich, [Rules of Machine Learning](https://developers.google.com/machine-learning/guides/rules-of-ml): feature engineering and training-serving skew in production.
- Weinberger et al., [“Feature Hashing for Large Scale Multitask Learning” (2009)](https://arxiv.org/abs/0902.2206).

## Related

- [Classical ML essentials](#classical-ml)
- [Validation, tuning and leakage](#validation-tuning)
- [Decision trees, ensembles and gradient boosting](#trees-and-ensembles)
- [Linear models, kernels and other classic learners](#linear-and-kernel-models)
- [Embeddings](#embeddings)
- [Feature stores and training-serving consistency](#feature-stores)
