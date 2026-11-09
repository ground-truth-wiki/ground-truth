---
id: google-flood-forecasting
book: 21
order: "21.110"
title: "Google's flood forecasting: from gauged rivers in India and Bangladesh to ungauged basins worldwide"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [flood-forecasting, time-series, lstm, early-warning, public-record]
visuals: []
type: playbook
account: public-record
industry: "Disaster early warning (riverine floods)"
use_case: "Forecasting river stage and flood inundation with ML models and sending flood alerts to agencies and the public, then extending river forecasts to ungauged basins worldwide"
outcome: "In 1-year cross-validation on 2014–2020 data, the LSTM stage model was significantly better than the linear model (0.67 vs. 0.60 medians of Persistent-NSE); in the 2021 monsoon about 115 000 000 notifications were sent and reached about 22 000 000 people; in 2024 a global model was, on average, statistically as accurate as GloFAS nowcasts up to 5 days in advance"
measured_how: "1-year cross-validation on 2014–2020 data for 167 target gauges in India and Bangladesh, plus 2021 notification counts (Nevo et al., HESS, August 2022); F1 on 2-year return period events in 2,092 watersheds, 2014-2023, against GloFAS version 4 (Google Research blog, March 2024)"
prerequisites: [time-series-forecasting, recurrent-networks]
replications: []
---
> [!tldr]
> Google Research ran an ML flood warning system in India and Bangladesh that sent "about 115 000 000 notifications" during the 2021 monsoon. An ML inundation model beat a physics-based hydraulic model on 9 of 11 areas, and the hydraulic model was dropped. Later global models extended river forecasts to basins without gauges.

> [!note] From the public record
> Built from Google Research's own published accounts, "Flood forecasting with machine learning models in an operational framework" (August 2022), "Using AI to expand global access to reliable flood forecasts" (March 2024) and "An improved flood forecasting AI model, trained and evaluated globally" (November 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper describes a system for real-time flood warnings to agencies and the public, "with a focus on riverine floods in large, gauged rivers". It has run in India since 2018 and in Bangladesh since 2020. In 2021 it covered a flood-prone area close to 470 000 km2 with a population of more than 354 000 000. Scaling further hit a data problem: "A low percentage of global river watersheds (basins) have streamflow gauges", says the March 2024 post.

## Why this approach

The paper gives two reasons: its ML inundation models were more accurate than the physics-based hydraulic model, and "Another advantage of ML models is that they require less manual per-gauge work", which enables expansion to a larger coverage area. For basins without gauges, the 2024 post says ML allows "a single model to be trained on all available river data and to be applied to ungauged basins where no data are available". See [Recurrent networks, LSTMs and sequence-to-sequence models](#recurrent-networks).

## The approach

1. **Stage forecasting.** Gauge data first pass automatic validation and correction. A linear model and an LSTM then forecast river stage from past stage at the target gauge and a few upstream gauges, plus past precipitation. When the LSTM's uncertainty range exceeds a threshold (typically 50 cm), the system picks a shorter lead time. See [Time series and forecasting](#time-series-forecasting).
2. **Inundation mapping.** A thresholding model maps flood extent without a digital elevation model. A manifold model, which needs one, also gives water depth. Both learn from flood maps derived from Sentinel-1 radar images, and both ran in 2021.
3. **Alerts.** Agencies, including India's Central Water Commission (CWC) and the Bangladesh Water Development Board (BWDB), received alerts. The public saw them in Google Search and Google Maps, and as smartphone push notifications in the forecast flood area when the forecast stage exceeded a threshold provided by CWC and BWDB.
4. **Global model (2024).** A "hindcast" LSTM reads one year of historical weather, then a "forecast" LSTM reads seven days of forecast weather. The November 2024 post adds Google DeepMind's medium-range global weather forecasting model as an input, grows training from 5,680 gauges to 15,980 and revises the LSTM architecture.

## The stack

As of August 2022: LSTM and linear stage models, thresholding and manifold inundation models, hourly CWC and BWDB stage data, NASA IMERG Early Run precipitation and Sentinel-1 radar data. As of March 2024: weather data from NASA IMERG, NOAA CPC, ECMWF ERA5-land and ECMWF HRES, HydroATLAS watershed attributes, and Global Runoff Data Center streamflow for 1980 - 2023. As of November 2024: the Google DeepMind weather model as an added input, new training gauges mainly from Caravan, and Flood Hub.

## Results, and how they were measured

- **Stage forecasts.** "The LSTM model was significantly better than the linear model (0.67 vs. 0.60 medians of Persistent-NSE)", so it ran in 2021 for 165 out of 167 target gauges. The test was 1-year cross-validation on 2014–2020 data. Persistent-NSE uses the last observed stage as the baseline forecast. Median RMSE values "are 0.1 and 0.2 m for lead times of 24 and 48 h". An Iowa study of US National Weather Service forecasts is cited, but "the errors are not fully comparable".
- **Inundation.** "The thresholding model outperforms the hydraulic model on 9 of the 11 AOIs", trained on 2016–2019 events and validated on 2020 events, by F1 score (see [Classification and regression metrics](#classification-metrics)). The hydraulic model's manual work and computation limited the comparison to 11 AOIs.
- **Alerts (2021).** "In total, about 115 000 000 notifications were sent and have reached about 22 000 000 people". The system handled 376 target gauges.
- **Global model (March 2024).** "On average, our model is statistically as accurate as GloFAS nowcasts (0–day lead time) up to 5 days in advance", by F1 on 2-year return period events in 2,092 watersheds, 2014-2023, against GloFAS version 4. The post says this also holds over 1-year, 5-year and 10-year events, which are "not shown".
- **Upgrade (November 2024).** "The new model has the same accuracy at a 7-day lead time as the previous model had at five days", by Nash-Sutcliffe efficiency on 3,079 basins. The post says this "enables us to provide critical flood information to 700 million people worldwide", up from 460 million.

**Not measured:** whether alerts led to action. The paper says "preliminary analysis indicates flood alerts being effective", with full results to be reported separately. The sources give no false-alarm or missed-flood rates for live alerts, no method for the 700 million and 460 million figures, and no evaluation period for the 3,079-basin comparison.

## What failed

- **The hydraulic model.** It ran in previous seasons but was found "both less accurate and less scalable than the ML models", at considerably higher computational cost. So "it was decided not to include the hydraulic model in the operational system".
- **Gaps in 2021.** 143 target gauges got alerts without inundation maps, because of "very limited ground truth data or highly irregular flood pattern".
- **Scope.** The system in its present form needs gauges that report stage in real time and have historical records, and "would work best in slow-responding, large rivers". Basins under 1000 km2 and flash floods were future work.
- **Validation.** Globally, forecast quality can be checked against history in only a fraction of locations. Flood Hub's close to 250k forecast points include "virtual gauges" whose forecast was not verified. Flash, urban and coastal floods are not covered.

## What the team would do differently

The paper states lessons from the field: "it was important to provide the alerts in the local language", and to give the expected rise or fall in water stage "rather than the absolute stage". The sources do not say what the team would redo.

The wiki's reading: dropping the hydraulic model rests on a small sample of 11 areas. The alert counts measure delivery, not outcomes. See [AI for weather, climate and materials](#ai-for-physical-sciences).

## Disclosure

None.

## Sources

- Sella Nevo, Efrat Morin, Adi Gerzi Rosenthal, Asher Metzger, Chen Barshai, Dana Weitzner, Dafi Voloshin, Frederik Kratzert, Gal Elidan, Gideon Dror, Gregory Begelman, Grey Nearing, Guy Shalev, Hila Noga, Ira Shavitt, Liora Yuklea, Moriah Royz, Niv Giladi, Nofar Peled Levi, Ofir Reich, Oren Gilon, Ronnie Maor, Shahar Timnat, Tal Shechter, Vladimir Anisimov, Yotam Gigi, Yuval Levin, Zach Moshe, Zvika Ben-Haim, Avinatan Hassidim and Yossi Matias, Google Research and Hebrew University of Jerusalem, [“Flood forecasting with machine learning models in an operational framework”](https://hess.copernicus.org/articles/26/4013/2022/), Hydrology and Earth System Sciences 26, 4013–4032, published 5 August 2022, doi:10.5194/hess-26-4013-2022.
- Yossi Matias and Grey Nearing, Google Research, [“Using AI to expand global access to reliable flood forecasts”](https://research.google/blog/using-ai-to-expand-global-access-to-reliable-flood-forecasts/), Google Research blog, 20 March 2024.
- Deborah Cohen, Google Research, [“An improved flood forecasting AI model, trained and evaluated globally”](https://research.google/blog/a-flood-forecasting-ai-model-trained-and-evaluated-globally/), Google Research blog, 11 November 2024.

## Related

- [About playbooks](#about-playbooks)
- [AI for weather, climate and materials](#ai-for-physical-sciences)
- [Time series and forecasting](#time-series-forecasting)
- [Recurrent networks, LSTMs and sequence-to-sequence models](#recurrent-networks)
- [Classification and regression metrics](#classification-metrics)
