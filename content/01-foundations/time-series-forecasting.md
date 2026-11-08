---
id: time-series-forecasting
book: 1
order: "1.15"
title: Time series and forecasting
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [time-series, forecasting, arima, capacity-planning, foundation-models]
visuals: []
prerequisites: [classical-ml, probability-information]
---
> [!tldr]
> A time series is a sequence of measurements in time order, and forecasting predicts its future values, ideally as a range rather than a single number. For AI engineers it is the math behind request, token, GPU and spend forecasts for [capacity planning](#cost-capacity) and behind alerts on metrics. The one thing to remember: a forecast is worth using only if it beats simple baselines such as seasonal naive on a rolling-origin evaluation that never trains on data from the future.

## Key ideas

- **Order matters, and series have structure.** Autocorrelation measures the linear relationship between a series and its own lagged values ([FPP3: Autocorrelation](https://otexts.com/fpp3/graphics.html#sec-acf)), and trend and seasonality make a series non-stationary, meaning its statistical properties depend on when you observe it; differencing can help stabilize the mean and logarithms can help stabilize the variance ([FPP3: Stationarity](https://otexts.com/fpp3/arima.html#sec-stationarity)). Classical decomposition into trend, seasonal and remainder parts is no longer recommended ([FPP3: Classical decomposition](https://otexts.com/fpp3/decomposition.html#sec-classical-decomposition)), while STL (Seasonal and Trend decomposition using Loess) handles any type of seasonality, not only monthly or quarterly data, lets the seasonal pattern change over time and, with a robust fit, pushes outliers into the remainder, where values more than 3 interquartile ranges from the central half of the data can be flagged as outliers ([FPP3: STL decomposition](https://otexts.com/fpp3/decomposition.html#sec-stl); [FPP3: Missing values and outliers](https://otexts.com/fpp3/practical.html#sec-missing-outliers)).
- **Every model must beat the simple baselines.** The mean method forecasts the historical average, the naive method repeats the last value, the seasonal naive method repeats the last value from the same season, and the drift method extends the average historical change. If a new method does not beat these benchmarks, Hyndman and Athanasopoulos write, it "is not worth considering" ([FPP3: Simple forecasting methods](https://otexts.com/fpp3/toolbox.html#sec-simple-methods)).
- **Exponential smoothing and ARIMA are the classic workhorses.** Exponential smoothing forecasts with weighted averages of past observations whose weights decay exponentially with age, Holt-Winters adds seasonality, and the ETS state space models behind these methods add prediction intervals and model selection by information criteria ([FPP3: Exponential smoothing](https://otexts.com/fpp3/exponential-smoothing.html)); ARIMA models instead describe the autocorrelations in the data ([FPP3: ARIMA models](https://otexts.com/fpp3/arima.html)). In Python, statsmodels implements ARIMA, Holt-Winters, ETS, STL, the ACF and PACF, and the ADF and KPSS stationarity tests ([statsmodels: Time series analysis](https://www.statsmodels.org/stable/tsa.html)).
- **Many related series: global models and coherent hierarchies.** A global model fits one function across a whole group of series instead of one model per series, and for groups of similar series global methods outperform local ones (Montero-Manso and Hyndman, [“Principles and Algorithms for Forecasting Groups of Time Series: Locality and Globality”](https://arxiv.org/abs/2008.00444) (2020)); libraries such as mlforecast train one regressor, for example LightGBM, on lags, transformations of lags and date features of all series together ([mlforecast documentation](https://nixtlaverse.nixtla.io/mlforecast/index.html)). When series aggregate, for example per region and in total, forecasts should add up the same way the data do, which bottom-up, top-down and middle-out approaches guarantee and which reconciliation methods such as MinT achieve using all the information in the hierarchy ([FPP3: Hierarchical and grouped series](https://otexts.com/fpp3/hierarchical-forecasting.html)).
- **Evaluate on a rolling origin and choose the metric on purpose.** Time-series cross-validation moves the forecast origin forward, and each training set contains only observations from before its test point ([FPP3: Time series cross-validation](https://otexts.com/fpp3/toolbox.html#sec-tscv)); a quantile forecast is scored with the quantile score, or pinball loss, which equals the absolute error at the median ([FPP3: Evaluating distributional accuracy](https://otexts.com/fpp3/toolbox.html#sec-distaccuracy)). Minimizing MAE gives median forecasts and minimizing RMSE gives mean forecasts, MAPE is infinite or undefined when an actual value is zero and penalizes negative errors more heavily, Hyndman and Koehler recommend not using sMAPE, and MASE scales errors by the in-sample error of one-step naive forecasts, so a value below one means the forecast beats that benchmark on average ([FPP3: Evaluating point forecast accuracy](https://otexts.com/fpp3/toolbox.html#sec-accuracy)).
- **Time-series foundation models forecast zero-shot (as of November 2026).** Chronos scales and quantizes values into a fixed vocabulary of tokens and trains T5-family models on them, with zero-shot accuracy on new datasets comparable to, and occasionally better than, models trained on those datasets (Ansari et al., [“Chronos: Learning the Language of Time Series”](https://arxiv.org/abs/2403.07815) (2024)), and TimesFM, a patched-decoder model, comes close to supervised per-dataset models (Das et al., [“A decoder-only foundation model for time-series forecasting”](https://arxiv.org/abs/2310.10688) (2023)). Newer versions add covariates: Chronos-2 handles univariate, multivariate and covariate-informed tasks zero-shot (Ansari et al., [“Chronos-2: From Univariate to Universal Forecasting”](https://arxiv.org/abs/2510.15821) (2025)), and TimesFM 3.0, announced in the TimesFM repository in August 2026, introduces native multivariate forecasting and flexible covariate support; its downloadable weights are restricted to non-commercial, non-production use, while commercial use runs through Google Cloud services such as BigQuery ML ([google-research/timesfm](https://github.com/google-research/timesfm)).

## Planned visuals

- `stepper`: evaluation on a rolling origin: the training window grows one step at a time, the model forecasts the next few points, the error is recorded and the origin moves forward, with a random split alongside that leaks the future into training.
- `chart`: an illustrative hourly request series decomposed with STL into trend, daily seasonality and remainder, with one outlier standing out in the remainder against its interquartile-range limits.
- `calculator`: MAE, RMSE, MAPE and MASE for a short series and its forecast, where setting one actual value to zero makes MAPE undefined while MASE stays usable.

## Talk like an expert

Forecasters speak of the **horizon**, the **seasonal naive** baseline, **rolling-origin** evaluation, **MASE**, **pinball loss**, **prediction intervals**, **global models** and **coherent** forecasts. Their first question about any claimed improvement is "better than seasonal naive, at which horizon, scored on a rolling origin?", and for a foundation model they also ask whether the test series could have been in its pretraining data.

## Go deeper

- Hyndman and Athanasopoulos, [*Forecasting: Principles and Practice*, 3rd edition](https://otexts.com/fpp3/), a textbook that is free to read online.
- [statsmodels: Time series analysis](https://www.statsmodels.org/stable/tsa.html), the reference for statsmodels' ARIMA, ETS, STL and stationarity-test tools.
- Montero-Manso and Hyndman, [“Principles and Algorithms for Forecasting Groups of Time Series: Locality and Globality” (2020)](https://arxiv.org/abs/2008.00444).
- Ansari et al., [“Chronos: Learning the Language of Time Series” (2024)](https://arxiv.org/abs/2403.07815).

## Related

- [Classical ML essentials](#classical-ml)
- [Validation, tuning and leakage](#validation-tuning)
- [Anomaly detection and distribution shift](#anomaly-drift-detection)
- [Cost and capacity](#cost-capacity)
- [Decision trees, ensembles and gradient boosting](#trees-and-ensembles)
