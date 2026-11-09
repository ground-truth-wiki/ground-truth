---
id: ecmwf-aifs-operational
book: 21
order: "21.97"
title: "ECMWF's AIFS: running a machine-learning weather model in operations"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, weather-forecasting, model-rollout, rollback, public-record]
visuals: []
type: playbook
account: public-record
industry: "Public sector (medium-range weather forecasting)"
use_case: "Running a machine-learning weather model (AIFS Single, then AIFS ENS) operationally next to the physics-based IFS, through version upgrades, a rollback and an IFS cycle change"
outcome: "In ECMWF's 2025 verification, AIFS Single and AIFS ENS showed superior skill to the IFS for most upper-air and surface parameters, with medium-range error reductions typically of the order of 5–15%, but larger tropical cyclone intensity errors"
measured_how: "ECMWF's annual verification of its 2025 operational forecasts against the IFS control and ensemble, summarized for its Technical Advisory Committee; sample and exact period not stated (ECMWF Newsletter 187, May 2026)"
prerequisites: [ai-for-physical-sciences]
replications: []
---
> [!tldr]
> ECMWF made AIFS Single v1, a machine-learning weather model, operational on 25 February 2025, next to its physics-based IFS, and added the ensemble AIFS ENS on 1 July 2025. A fix release was rolled back over a metadata error. An IFS upgrade, Cycle 50r1, degraded AIFS v1 forecast skill when AIFS v1 was initialised with 50r1 analysis, so v2 was fine-tuned on 50r1 data. In 2025 verification, both AIFS models "show superior skill for most upper-air and surface parameters" compared with the IFS.

> [!note] From the public record
> Built from ECMWF's own published accounts, "Implementation of AIFS Single v1" (last updated November 2025), "Implementation of AIFS v2" (May 2026) and "Forecast performance 2025" (May 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The European Centre for Medium-Range Weather Forecasts (ECMWF) runs the physics-based Integrated Forecasting System (IFS). Its machine-learning Artificial Intelligence Forecasting System (AIFS) had run as an experimental version, v0.2.1. AIFS Single v1 replaced it and is "supported operationally", with data on the same schedule as IFS data. The sources do not state why ECMWF chose to run an ML model operationally.

## Why this approach

The sources describe no alternatives, only the design. AIFS Single v1 is not trained on observations: "No observations are used to train AIFS Single v1", and it starts from "the operational IFS control initial condition, regridded to an N320 grid". The architecture is identical to the experimental versions; the training regime and pressure-level scaling were revised. v1 is the first version implemented using the Anemoi framework, whose open source components enable "the user community to run AIFS themselves". See [AI for weather, climate and materials](#ai-for-physical-sciences).

## The approach

1. **Training v1.** Pre-training on ERA5 for 1979 to 2022, 260,000 steps. Then rollout training on operational IFS analyses for 2016 to 2022, 7900 optimizer steps.
2. **Release.** Announcement and test data on 11 February 2025, then implementation with the 06 UTC run on 25 February 2025. Scorecards compared v1 with the IFS and with v0.2.1 "across 2024".
3. **Fix release v1.1.** To address point rain artefacts, v1.1 was retrained with a lower "(by a factor 100) contribution from soil moisture", giving "equivalent (but not identical) skill and bias". It went live on 31 July 2025, was reverted on 1 August and was re-implemented on 27 August 2025.
4. **v2.** Planned "alongside IFS 50r1". It adds waves, snow cover and a 10 hPa level, gives AIFS ENS a new multi-scale loss, and was fine-tuned on current operational analyses and experimental 50r1 data.

## The stack

As of November 2025 (v1) and May 2026 (v2): the Anemoi framework, with models released on Hugging Face; ERA5 and IFS analyses as training data; the AdamW optimizer; an N320 grid (~32 km) with 13 pressure levels in v1, disseminated at 0.25°; GRIB 2 output archived in MARS. v2 encodes through MultIO.

## Results, and how they were measured

- **Against the IFS in 2025.** "Both AIFS Single and AIFS ENS show superior skill for most upper-air and surface parameters" compared to the IFS control and ensemble forecasts. "Error reductions in the medium range are typically of the order of 5–15%." Precipitation is improved "by about 10% in the medium range, equivalent to 0.5–1 forecast day".
- **Tropical cyclones.** TC "position errors are reduced substantially in the AIFS compared to the IFS", but "TC intensity errors are generally larger due to a weak-intensity bias".
- **Technical Advisory Committee** (20–21 October 2025): compared to the physics-based forecasts, ML forecasts "lead on skill for many parameters and are less jumpy".
- **v2, before implementation.** Against IFS 50r1, "significant wave height errors reduced by around 10%", as RMSE against satellite altimeter observations. At 50 and 100 hPa, "a 3-day improvement in skill between AIFS Single v2 and AIFS Single v1".

**Not measured:** the sources give no sample sizes or verification periods for the 5–15% and 10% figures (one figure compares AIFS ENS and IFS ENS for August 2025–February 2026) and defer full results to ECMWF Technical Memorandum No. 931. The v1 page's evaluation text gives no numbers. The v2 article reports results before v2 went live. No source measures the effect on users or how many runs the rollback affected.

## What failed

- **Point rain artefacts in v1,** traced to "an unphysical relationship between soil moisture and precipitation", "caused by an overemphasis of soil moisture in the training".
- **The v1.1 rollback.** After launch, "a technical issue was identified with stepRange parameter in AIFS Single v1.1 for six accumulated variables", an issue "related to GRIB2 metadata". ECMWF reverted to v1.0, re-disseminated the affected products and re-archived the affected runs. So "the scientific issue that had previously been reported is present again in the forecast". The page does not say why testing missed the error.
- **An upstream change.** ECMWF reports that "substantial updates to the analysis in IFS Cycle 50r1 caused noticeable degradations in AIFS v1 forecast skill", "with errors in 2-metre temperature increasing by up to 20%". After fine-tuning, "a small negative impact remains for 2-metre temperature in the Arctic".
- **Calibration.** On the v1 page, total cloud cover and surface short-wave downwards radiation forecasts have lower mean squared error than the IFS "at the cost of forecasts that are less well-calibrated".
- **Skill over time.** The committee "recognised that the performance of AIFS is similar to several other machine learning forecasts", "including a small decrease in skill during the last 12 months". No cause is given.

## What the team would do differently

The sources do not say. The v2 article notes that better physical realism "did not translate directly into better verification scores", emphasising "the need to look at diagnostics when seeking to improve physical consistency in the AIFS". It also reports that in tests, AIFS forecast skill "is improved when more recent operational analysis data is included in the training".

The wiki's reading: a model initialized from another system inherits that system's changes, so an upstream upgrade is a [distribution shift](#data-validation-drift) to test before it ships. A rollback is a [version decision](#model-lifecycle) with a price: here it brought back a known bug. And the release broke in output metadata, not in the model, which argues for checking metadata in [CI](#ci-cd-for-ai).

## Disclosure

None.

## Sources

- Created by Meghan Plumridge, last updated by Milana Vuckovic, ECMWF, [“Implementation of AIFS Single v1”](https://confluence.ecmwf.int/spaces/FCST/pages/496875126/Implementation+of+AIFS+Single+v1), Forecast User space, ECMWF Confluence wiki, last updated 24 November 2025.
- Mariana Clare, Sara Hahner, Harrison Cook, Gert Mertes, Josh Kousal and Annelize van Niekerk, ECMWF, [“Implementation of AIFS v2”](https://www.ecmwf.int/en/newsletter/187/news/implementation-aifs-v2), ECMWF Newsletter Number 187, Spring 2026, published May 2026.
- Thomas Haiden and Matthieu Chevallier, ECMWF, [“Forecast performance 2025”](https://www.ecmwf.int/en/newsletter/187/news/forecast-performance-2025), ECMWF Newsletter Number 187, Spring 2026, published May 2026.

## Related

- [About playbooks](#about-playbooks)
- [AI for weather, climate and materials](#ai-for-physical-sciences)
- [Model versions, previews and deprecations](#model-lifecycle)
- [CI/CD for AI](#ci-cd-for-ai)
- [Data validation, drift and skew](#data-validation-drift)
