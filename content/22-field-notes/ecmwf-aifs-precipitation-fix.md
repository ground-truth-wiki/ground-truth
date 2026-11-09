---
id: ecmwf-aifs-precipitation-fix
book: 22
order: "22.27"
title: "ECMWF's AIFS 1.1.0: bounding the outputs to fix precipitation forecasts"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [weather-forecasting, physical-constraints, model-updates, public-sector, public-record]
visuals: []
type: field-note
account: public-record
industry: "Public sector (medium-range weather forecasting)"
use_case: "Updating an operational machine-learned weather forecast model, AIFS Single, released as version 1.1.0 to correct a precipitation forecast issue"
outcome: "Approximately a one-day gain in 24-hour precipitation forecast skill over both the IFS and the previous AIFS version; improvements of around 4–6 % across all variables, lead times and pressure levels relative to the previous version"
measured_how: "Forecasts for 2023 verified against SYNOP observations (SEEPS for 24-hour precipitation) and IFS analyses, a scorecard against the previous, pre-operational AIFS version, and a version retrained without bounding, scored on June-July-August 2023 (ECMWF paper on arXiv, September 2025)"
prerequisites: [ai-for-physical-sciences, loss-functions]
replications: []
---
> [!tldr]
> ECMWF's machine-learned forecast model AIFS became operational on 25 February 2025, and version 1.1.0 followed on 27 August 2025 "to correct a precipitation forecast issue in the initial version". The update adds bounding layers to the model's output. The new version produces no negative precipitation and substantially reduces light precipitation. A retraining without bounding lets the authors attribute the precipitation gain mainly to the bounding.

> [!note] From the public record
> Built from ECMWF's own published account, "An update to ECMWF's machine-learned weather forecast model AIFS" (September 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The European Centre for Medium-Range Weather Forecasts (ECMWF) developed AIFS as its own machine-learned forecast model. The version here, AIFS Single, is trained with a mean-squared error (MSE) loss. It is "supported 24/7 alongside ECMWF’s physics-based system, the IFS", and its forecast data are freely available.

As of September 2025, AIFS pairs attention-based graph neural networks as encoder and decoder with a transformer processor, on a grid of approximately 0.25° (N320). It predicts 6 hours ahead and reaches longer lead times by feeding its own forecasts back in, which the paper calls rollout (see [Time series and forecasting](#time-series-forecasting)).

## What happened

1. **October 2023.** A pre-operational test phase starts, with forecasts public under ECMWF's open data policy.
2. **25 February 2025.** "The first operational version, AIFS 1.0.0 replacing AIFS 0.2.1, was implemented on 25 February 2025."
3. **27 August 2025.** AIFS 1.1.0 is released to correct the precipitation issue.
4. **23 September 2025.** The paper on 1.1.0 is submitted to arXiv.

The paper does not say what the issue in 1.0.0 was or how it was found. Instead it examines "the previous AIFS version", the pre-operational AIFS 0.2.1. In a forecast started on 1 June 2023, it shows "spurious negative precipitation values and an excess of light rainfall", and frequent cases of convective precipitation exceeding total precipitation. Against SYNOP station observations over Europe for 2023, it "systematically over-forecasts light precipitation events" below 1 mm.

## Impact, and how it was measured

These results use 2023 forecasts, compared with the pre-operational version, the IFS, or both.

- **Precipitation.** On the SEEPS skill score for 24-hour precipitation against SYNOP observations: "The revised AIFS demonstrates approximately a one-day gain in forecast skill relative to both IFS and the previous AIFS version." The IFS baseline covers cycles 47r3 and 48r1. "The new version of the AIFS produces no negative values in the output".
- **Attribution.** A retrained version without total precipitation bounding, scored with SEEPS for June-July-August 2023: "the revised AIFS version without bounding performs similarly to the previous AIFS version".
- **All variables.** A 2023 scorecard shows "improvements of around 4–6 % across all variables, lead times, and pressure levels relative to the previous AIFS version". The largest, "up to 12% gains in normalized difference in the short range", are in total precipitation.
- **Against the IFS.** For anomaly correlation of geopotential at 500 hPa and temperature at 850 hPa in the Northern Hemisphere: "In the medium range, AIFS outperforms the IFS by 12 to 24 hours in skill." Verification is against the operational IFS analysis, which also initialises the forecasts.
- **Heavy rain.** "both the previous and the revised AIFS models underperform IFS for thresholds exceeding 10mm in terms of PSS, but remains competitive".

**Not measured:** the paper reports no verification of operational forecasts after the 27 August 2025 release, no separate comparison with the operational 1.0.0, no forecast or station counts, and no measure of the effect on forecast users.

## Why it happened

In the paper's words, the earlier model's output "is not constrained, leading to a frequent occurrence of negative values", and "machine-learned forecast models lack such guarantees by default". The pre-operational model clipped negative values at inference time, but their presence still highlights "a lack of physical consistency in the model". In the previous version, convective precipitation was "predicted independently of total precipitation", although it "should never exceed it".

For heavy rain, the authors name smoothing from the loss function and the model's coarser grid (0.25° against the IFS's 0.1°) as the likely cause. They also link MSE smoothing to a total cloud cover distribution much flatter than observed, under-predicting clear skies and overcast conditions.

## What changed afterwards

Compared with the pre-operational version, AIFS 1.1.0 adds a final layer of activation functions that bound certain output variables, applied during training:

- ReLU keeps total precipitation, runoff, total column water, surface solar radiation and specific humidity at zero or above.
- HardTanh keeps total cloud cover and soil moisture between 0 and 1.
- FractionBounding predicts convective precipitation and snowfall as fractions of total precipitation, and low, medium and high cloud cover as fractions of total cloud cover.

The release also adds training data (ERA5 for 1979–2022 instead of 1979–2020, and operational analyses for 2016–2022 instead of 2019–2020). Rollout fine-tuning now uses only operational analyses, not ERA5 first. Pressure-level loss weights get a minimum of 0.2 to avoid excessively low values in the stratosphere. New variables include soil moisture, 100-metre winds and snowfall. The authors aim to investigate LeakyReLU-based approaches, which, unlike standard ReLU, allow weight updates from changes in the negative space.

## Lessons

The source's own lessons: hard-constraining outputs "increases the physical realism of forecast fields and the light-precipitation forecast skill". Because AIFS relies on ECMWF's operational analyses for real-time forecasting, "it is important to fine-tune them regularly using up-to-date data" as new IFS cycles shift the data (see [Data validation, drift and skew](#data-validation-drift)). Rollout fine-tuning enhances smoothing, and the authors see "an important design trade-off" between forecast realism and MSE-based verification scores.

The wiki's reading:

- **Build limits into the model.** Clipping at inference already existed; the gain came mainly from bounding during training. See [AI for weather, climate and materials](#ai-for-physical-sciences).
- **Run the ablation.** The release bundled more data, a new schedule, new variables and bounding; only the retraining without bounding isolated the precipitation gain.
- **Look at distributions, not only averages.** The light-rain bias and flat cloud cover appear in frequency bias and distribution plots. See [Loss functions](#loss-functions) and [Classification and regression metrics](#classification-metrics).
- **Check the baseline of a fix.** The release was meant to correct the initial operational version, but the paper measures against the pre-operational one.

## Disclosure

None.

## Sources

- Gabriel Moldovan, Ewan Pinnington, Ana Prieto Nemesio, Simon Lang, Zied Ben Bouallègue, Jesper Dramsch, Mihai Alexe, Mario Santa Cruz, Sara Hahner, Harrison Cook, Helen Theissen, Mariana Clare, Cathal O'Brien, Jan Polster, Linus Magnusson, Gert Mertes, Florian Pinault, Baudouin Raoult, Patricia de Rosnay, Richard Forbes and Matthew Chantry, European Centre for Medium-Range Weather Forecasts (ECMWF), [An update to ECMWF's machine-learned weather forecast model AIFS](https://arxiv.org/abs/2509.18994), arXiv:2509.18994 (physics.ao-ph), submitted 23 September 2025 (v1). The document's own date line reads March 2025.

## Related

- [About field notes](#about-field-notes)
- [AI for weather, climate and materials](#ai-for-physical-sciences)
- [Time series and forecasting](#time-series-forecasting)
- [Loss functions](#loss-functions)
- [Data validation, drift and skew](#data-validation-drift)
