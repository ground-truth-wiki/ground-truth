---
id: nao-dwp-fraud-model
book: 22
order: "22.31"
title: DWP's Universal Credit advances fraud model under audit
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, fraud-detection, fairness, human-in-the-loop, audits, public-record]
visuals: []
type: field-note
account: public-record
industry: "Public sector (UK central government, welfare benefits)"
use_case: "A machine learning model that scores Universal Credit advance requests for fraud risk and refers high-risk ones to a caseworker"
outcome: "Estimated savings of £4.4 million from 2022-23 to 2024-25 and around three times more effective at identifying fraud risk than a randomised control group sample, while older claimants and non-UK nationals were over-referred for review"
measured_how: "DWP's savings estimate, a single stratified random sample, and relative likelihoods of referral and correct referral for advances risk-scored from 1 April 2024 to 31 March 2025, at most one per claimant and contract (DWP fairness assessment, July 2025; National Audit Office report HC 1336, October 2025)"
prerequisites: [fairness-bias, classification-metrics]
replications: []
---
> [!tldr]
> Since May 2022 the UK Department for Work & Pensions (DWP) has used a machine learning model to flag Universal Credit advance requests for caseworker review. The National Audit Office reports estimated savings of £4.4 million and a model "around three times more effective" at identifying fraud risk than a randomised control group sample. DWP's own fairness analysis showed, in the auditors' words, older claimants and non-UK nationals "being over referred for review", and DWP plans to retrain the model.

> [!note] From the public record
> Built from an official record, the National Audit Office's value for money report on the Department for Work & Pensions, "Tackling benefit overpayments due to fraud and error" (October 2025), and from the department's own published account, "Universal Credit Advances Model - Fairness Assessment" (July 2025), both linked under Sources. Neither their authors nor the team wrote or reviewed this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Most figures here come from DWP's own fairness assessment, which the National Audit Office (NAO) report draws on.

DWP provided 1.4 million Universal Credit (UC) advances in 2024 to 2025, and estimates that fraud and error on them that year "lies between £0million and £60million". A machine learning model scores each new advance request for the probability that it contains fraud or error. DWP calls it "the only machine learning model currently deployed at scale into live service".

As of October 2025, in the NAO's description, requests that score above a threshold go to a caseworker, and payment is paused until the caseworker responds. "Decisions about whether an advance should be paid are made by DWP staff, not the model." Age is the only protected characteristic the model uses, because it can affect the value of the advance. The sources do not state the model type, the full feature set or the threshold.

## What happened

1. **May 2022.** DWP starts using the model.
2. **Early 2024.** DWP carries out a fairness analysis but does not publish it, because it considered this "would undermine the effectiveness of the model as a fraud prevention control".
3. **January 2025.** The Committee of Public Accounts says it remains concerned about the potential negative impact on protected groups and vulnerable customers. It recommends that DWP share its 2024 fairness results, which DWP does in a private briefing in June 2025.
4. **17 July 2025.** DWP publishes its fairness assessment for 1 April 2024 to 31 March 2025, which it calls "experimental analysis".
5. **22 October 2025.** The NAO publishes its report and a press release.

## Impact, and how it was measured

- **Savings.** DWP estimates that from 2022-23 to 2024-25 the model "generated savings of £4.4 million that would otherwise have been overpaid".
- **Effectiveness.** DWP compares confirmed fraud among the model's high-risk referrals with a random sample that mixes low-risk and high-risk advances in equal proportions: "This comparison finds the model to be 2.9 times more effective at identifying Advances that are fraudulent."
- **Fairness method.** For each group, DWP compares the share of advances predicted high risk with the share of high-risk referrals confirmed as fraudulent. Each is a relative likelihood against the largest group, with 95% confidence intervals, and a value outside 0.80 to 1.25 is called "notable". See [Fairness metrics and bias measurement](#fairness-bias) and [Classification and regression metrics](#classification-metrics).
- **Age.** Against claimants aged 35 to 44, the relative likelihood of referral was 1.35 for ages 45-54, 2.80 for 55-65 and 49.24 for 66+, and of a correct referral 0.86, 0.58 and 0.23. The 66+ group is 0.1% of observations, and its results "should be treated with caution due to the small sample size."
- **Nationality.** Against UK nationals, non-UK nationals had a relative likelihood of referral of 2.27 and of correct referral of 0.97, the latter not statistically significant.
- **Other characteristics.** For UC couple contracts and claimants who reported an illness, both measures were lower, which DWP assessed as a 'good' outcome.
- **Payment delay.** Referred advances that were then approved had a median payment delay of 1 day, against 0 days for advances not referred by any fraud control. Advances under other fraud controls had the same median delay.

**Not measured:** the sources give no cost for the model, since DWP "cannot disaggregate these from its wider spending on data analytics". They do not say how the £4.4 million was estimated, and give no sample sizes or absolute referral and confirmation rates.

## Why it happened

The sources do not identify a confirmed cause for the disparities. DWP says some statistical disparities between groups may arise because fraudsters misrepresent their circumstances and "fraud risk is not evenly distributed across all claim types". It will retrain the model because "improved alignment to Advances fraud risks could reduce the measured inconsistencies".

Data limited the analysis. Equality questions in a UC claim are optional, and DWP analyses a characteristic only with at least 70% completion. Among claimants the model referred as high risk, completion fell below that, so of the nine protected characteristics only age, taken from the date of birth, could be tested. DWP therefore could not analyse intersectionality, and notes that "disparities measured for one characteristic may be a result of intersectionality with another."

## What changed afterwards

According to the NAO, DWP concluded that it remains "reasonable and proportionate to continue operating the Universal Credit advances model as a fraud prevention control". DWP sees "minimal concerns of discrimination, unfair treatment or detrimental impact on legitimate claimants", and says the model "will be retrained", followed by further fairness analysis. As of October 2025, the sources report no result from retraining.

The NAO sets out the other side. A referral requires claimants to find and provide additional evidence, "which create an administrative burden for those selected for review". Stakeholders told the NAO that "without greater transparency it was not possible to scrutinise effectively DWP’s use of artificial intelligence."

## Lessons

The NAO recommends that DWP build on its existing use of data analytics to explore how emerging technologies may help to detect and prevent fraud and error, taking account of cost-effectiveness. It notes that public bodies must balance transparency "with the risk of making it easier for fraudsters to take advantage".

The wiki's reading:

- **Compare referral rates with outcomes.** The signal was groups referred more often whose referrals were not more often confirmed as fraud.
- **Keep a random control sample.** It gave DWP its effectiveness figure and a watch on missed fraud. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **A human decision does not make a referral free.** Each referral meant extra evidence and a paused payment. See [Human in the loop](#human-in-the-loop).
- **Plan for missing fairness data.** Only one protected characteristic could be tested. See [AI risk management and impact assessments](#ai-risk-management).

## Disclosure

None.

## Sources

- National Audit Office (study team Margaret Anderson, Sarah Dixon and Katie Taylor, under the direction of Laura Brackwell; Report by the Comptroller and Auditor General), [Tackling benefit overpayments due to fraud and error](https://www.nao.org.uk/reports/tackling-benefit-overpayments-due-to-fraud-and-error/), value for money report on the Department for Work & Pensions, HC 1336, 22 October 2025. [Full report (PDF)](https://www.nao.org.uk/wp-content/uploads/2025/10/Tackling-benefit-overpayments-due-to-fraud-and-error.pdf).
- National Audit Office (no individual author named), [DWP begins to make headway tackling benefit fraud and error](https://www.nao.org.uk/press-releases/dwp-begins-to-make-headway-tackling-benefit-fraud-and-error/), press release, 22 October 2025.
- Department for Work & Pensions (no individual author named), [Universal Credit Advances Model - Fairness Assessment](https://www.gov.uk/government/publications/fairness-assessment-including-statistical-analysis-of-the-universal-credit-advances-machine-learning-model-1-april-2024-to-31-march-2025/universal-credit-advances-model-fairness-assessment), research and analysis, GOV.UK, 17 July 2025.

## Related

- [About field notes](#about-field-notes)
- [Fairness metrics and bias measurement](#fairness-bias)
- [Human in the loop](#human-in-the-loop)
- [AI risk management and impact assessments](#ai-risk-management)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
