---
id: distributions-and-estimation
book: 1
order: "1.2.1"
title: Distributions, estimation and sampling
level: foundation
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [probability, statistics, bayes, maximum-likelihood, sampling]
visuals: []
prerequisites: [probability-information]
---
> [!tldr]
> A language model is a probability distribution over the next token, and almost every number an AI engineer reads, from a training loss to an eval score, is an estimate computed from samples. This chapter covers the tools for both: distributions and conditioning, Bayes' theorem, expectations, estimators and their errors, and sampling. The one thing to remember: an estimate without its standard error is only half a result.

## Key ideas

- **Random variables, conditioning and Bayes.** A random variable maps outcomes to values ([*Dive into Deep Learning*, section 2.6](https://d2l.ai/chapter_preliminaries/probability.html)). A discrete one gives each value a probability, a continuous one is described by a density, and density values are not probabilities themselves ([*Dive into Deep Learning*, section 22.6](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/random-variables.html)). Conditioning renormalizes a joint distribution, P(B | A) = P(A, B) ÷ P(A), and Bayes' theorem turns a prior and a likelihood into a posterior, where base rates dominate: in the book's example, with a test that wrongly flags about 1% of healthy patients and a disease that 0.15% of people have, a positive result means only about a 13% chance of disease ([*Dive into Deep Learning*, section 2.6](https://d2l.ai/chapter_preliminaries/probability.html)).
- **The chain rule, independence and autoregression.** The chain rule of conditional probabilities factors any joint distribution into a product of conditionals ([Goodfellow et al., *Deep Learning*, section 3.6](https://www.deeplearningbook.org/contents/prob.html)), and an autoregressive language model is exactly this factorization over tokens: the probability of a text is the product of each token's probability given the tokens before it ([Hugging Face, “Perplexity of fixed-length models”](https://huggingface.co/docs/transformers/perplexity)); see [what a language model is](#language-modeling). Most standard errors assume independent, identically distributed (i.i.d.) samples, an assumption that breaks when eval questions come in related groups ([Miller, “Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations” (2024)](https://arxiv.org/abs/2411.00640)).
- **Expectation, variance and the common distributions.** Expectation is a probability-weighted average and variance the expected squared deviation from it; covariance measures how two variables move together, but only linearly, and correlation rescales it to lie between −1 and 1 ([*Dive into Deep Learning*, section 22.6](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/random-variables.html)). The common distributions include the Bernoulli (one pass or fail), the binomial (a count of passes), the uniform, the Poisson and the Gaussian, and the central limit theorem explains why a sum of many small independent contributions is close to Gaussian ([*Dive into Deep Learning*, section 22.8](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/distributions.html)).
- **Estimators, standard errors and tests.** An estimator is judged by its bias and its variance, and its mean squared error is the squared bias plus the variance ([Goodfellow et al., *Deep Learning*, section 5.4.4](https://www.deeplearningbook.org/contents/ml.html)). A p-value is the probability of a test statistic at least as extreme as the one observed if the null hypothesis holds ([*Dive into Deep Learning*, section 22.10](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/statistics.html)). The central limit theorem gives the standard error of an average eval score, which for pass-or-fail questions is √(p(1 − p) ÷ n), and clustered questions need clustered standard errors; [statistics for evals](#eval-statistics) builds on this ([Miller, “Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations” (2024)](https://arxiv.org/abs/2411.00640)).
- **Maximum likelihood and MAP.** Maximum likelihood picks the parameters under which the data is most probable, and minimizing the average negative log-likelihood, which turns products into sums, is the same as minimizing cross-entropy ([*Dive into Deep Learning*, section 22.7](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/maximum-likelihood.html)). MAP estimation adds a log-prior, and a zero-mean Gaussian prior on the weights is exactly an L2 penalty ([Deisenroth et al., *Mathematics for Machine Learning* (2020), section 9.2.4](https://mml-book.github.io/book/mml-book.pdf)), which equals weight decay for plain SGD but not for adaptive optimizers such as Adam ([Loshchilov and Hutter, “Decoupled Weight Decay Regularization” (2017)](https://arxiv.org/abs/1711.05101)).
- **Monte Carlo, importance sampling and sampling tokens.** Monte Carlo estimation replaces an expectation with an average over samples, and importance sampling draws from another distribution q and reweights each sample by p ÷ q, which keeps the estimate unbiased but can inflate its variance ([Goodfellow et al., *Deep Learning*, chapter 17](https://www.deeplearningbook.org/contents/monte_carlo.html)); PPO's probability ratio πθ(a | s) ÷ πθ_old(a | s) is such a weight, inherited from the importance-sampled objective of TRPO ([Schulman et al., “Trust Region Policy Optimization” (2015)](https://arxiv.org/abs/1502.05477); [Schulman et al., “Proximal Policy Optimization Algorithms” (2017)](https://arxiv.org/abs/1707.06347)). Sampling a token is a draw from a categorical distribution, which the Gumbel-max trick writes as the argmax of log-probabilities plus Gumbel noise ([Jang et al., “Categorical Reparameterization with Gumbel-Softmax” (2016)](https://arxiv.org/abs/1611.01144)), and the reparameterization trick writes a sample as a deterministic function of parameters and independent noise so gradients can pass through it ([Kingma and Welling, “Auto-Encoding Variational Bayes” (2013)](https://arxiv.org/abs/1312.6114)).

## Planned visuals

- **`calculator`: Bayes and base rates.** Inputs for prevalence, sensitivity and false-positive rate; outputs the posterior probability after one and after two positive tests, with the textbook example as a test case.
- **`explorer`: the central limit theorem and the standard error.** Sliders for the pass rate and the number of questions redraw the sampling distribution of an eval score and its interval, showing the error shrinking like 1 ÷ √n. The existing `ci` explorer model may cover part of this.
- **`stepper`: sampling one token.** Logits become probabilities, Gumbel noise is added to the log-probabilities, and the argmax picks a token; repeated runs fill a histogram that matches the categorical distribution.

## Talk like an expert

Experts say "likelihood", "prior", "posterior", "i.i.d.", "estimator", "standard error", "importance weight" and "Monte Carlo estimate", and they ask what the sample size and the unit of independence are before trusting any number. They read a loss as a negative log-likelihood and an eval score as a noisy estimate of a population mean.

## Go deeper

- [*Dive into Deep Learning*, section 2.6, Probability and statistics](https://d2l.ai/chapter_preliminaries/probability.html), and the [appendix sections 22.6 to 22.10](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/index.html).
- Deisenroth, Faisal and Ong, [*Mathematics for Machine Learning*](https://mml-book.github.io/) (2020): chapter 6 on probability and chapter 8 on maximum likelihood and MAP estimation.
- Goodfellow, Bengio and Courville, [*Deep Learning*](https://www.deeplearningbook.org/contents/TOC.html): chapter 3 and chapter 17.
- Miller, [“Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations”](https://arxiv.org/abs/2411.00640) (2024).

## Related

- [Probability, statistics and information theory](#probability-information)
- [Statistics for evals](#eval-statistics)
- [Loss functions](#loss-functions)
- [Decoding and sampling](#decoding-sampling)
- [Reinforcement learning primer](#rl-primer)
