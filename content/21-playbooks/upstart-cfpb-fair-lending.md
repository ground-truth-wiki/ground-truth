---
id: upstart-cfpb-fair-lending
book: 21
order: "21.45"
title: "Upstart's credit model under the CFPB's first No-Action Letter"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [finance, credit-underwriting, fairness, regulation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Finance (consumer lending)"
use_case: "Credit underwriting and pricing with alternative data and machine learning, compared with a traditional model under a regulator's No-Action Letter"
outcome: "As reported by the lender, its model approved 27% more applicants than the traditional model and yielded 16% lower average APRs for approved loans, with no disparities requiring further fair lending analysis for minority, female, and 62 and older applicants"
measured_how: "The lender's own simulations comparing its model with a hypothetical traditional model on its applicant pool, under its compliance plan; sample size and data window not stated; not replicated by the Bureau (CFPB blog, August 2019)"
prerequisites: [fairness-bias]
replications: []
---
> [!tldr]
> Upstart Network, a lender that uses alternative data and machine learning to underwrite and price credit, received a No-Action Letter from the Consumer Financial Protection Bureau in 2017. Under the letter it provides the Bureau with information comparing its model with a traditional one. In 2019 the Bureau shared the lender's results: the tested model "approves 27% more applicants than the traditional model", with lower average APRs. For the groups reported, the results show no disparities that require further fair lending analysis under the lender's compliance plan. The Bureau did not replicate these figures.

> [!note] From the public record
> Built from an official record: a post on the Consumer Financial Protection Bureau's blog that reports results Upstart Network provided under its No-Action Letter, "An update on credit access and the Bureau’s first No-Action Letter" (August 2019), linked under Sources. Neither its authors nor the team wrote or reviewed this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post frames the problem as access to credit. For some consumers, it says, using "alternative data" to evaluate creditworthiness "may be a way to increase access to credit or decrease the cost of credit." Alternative data "includes information not typically found in core credit files". The Bureau estimates that "26 million Americans are credit invisible", and that another 19 million have a credit history that has gone stale or is insufficient to produce a credit score under most scoring models.

The Bureau's 2017 Request for Information noted that alternative data and models have significant potential benefits for consumers but that the practice "also presents certain significant potential risks." Later in 2017 the Bureau announced a No-Action Letter to Upstart Network. It "references the application of the Equal Credit Opportunity Act (ECOA)" and its implementing regulation, Regulation B, to the lender's use of alternative data and machine learning in its underwriting and pricing model.

## Why this approach

The post does not say why Upstart chose machine learning or which alternatives it considered. It describes Upstart as "a company that uses alternative data and machine learning in making credit underwriting and pricing decisions". "Over the last 22 months", the lender worked to answer several key questions, including these two:

1. **Access to credit:** whether the model "expands access to credit, including lower-priced credit", overall and for applicant segments.
2. **Fair lending:** whether its outcomes "result in greater disparities" than the traditional model by race, ethnicity, sex, or age, and if so, whether groups with similar model-predicted default risk "actually default at the same rate".

## The approach

As a condition of the letter, Upstart agreed to a model risk management and compliance plan that "requires it to analyze and appropriately address risks to consumers" and to "assess the real-world impact of alternative data and machine learning."

Under the letter, the lender provides the Bureau with information comparing outcomes from its own model, the "tested model", with a hypothetical model "that uses traditional application and credit file variables and does not employ machine learning", the "traditional model". The results come from simulations and analyses the lender ran under its plan, and "reflect the net effect of both the alternative data and the machine learning methodology" as applied to its applicant pool. The lender agreed to let the Bureau share key highlights.

The wiki's reading: running both models over the same applicants is a counterfactual test. It shows what changes when one model replaces another, but it cannot show how the extra approved loans perform. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## The stack

As of August 2019, the post names data categories and the method only. The model uses "traditional underwriting data and various categories of alternative data", "including information related to borrowers’ education and employment history", with machine learning. No algorithm, features, tools or infrastructure are named. See [Feature engineering and preprocessing](#feature-engineering) for how such inputs become features.

## Results, and how they were measured

All results are "provided by the NAL Recipient", and "the simulations and analyses were not separately replicated by the Bureau."

- **Approval and price.** The tested model "approves 27% more applicants than the traditional model" and "yields 16% lower average APRs for approved loans."
- **Across groups.** The expansion "occurs across all tested race, ethnicity, and sex segments", with the tested model "increasing acceptance rates by 23-29% and decreasing average APRs by 15-17%."
- **Specific segments.** Consumers the post calls near prime, "with FICO scores from 620 to 660 are approved approximately twice as frequently." "Applicants under 25 years of age are 32% more likely to be approved." "Consumers with incomes under $50,000 are 13% more likely to be approved."
- **Fair lending.** For "minority, female, and 62 and older applicants", the approval rate and APR results "show no disparities that require further fair lending analysis under the compliance plan."

The post gives no number of applicants and no data window for the simulations.

**Not measured:** the post reports no default rates, loan performance or losses, and no answer to whether groups with similar predicted default risk "actually default at the same rate". The comparison is with a hypothetical model, and the results come from the lender's simulations and analyses.

## What failed

The post reports no failures. It states these limits:

- **Not independently checked.** The Bureau shares the lender's own figures without replicating them.
- **Specific to one lender.** The letter "is specific to the facts and circumstances of the NAL Recipient" and "does not serve as an endorsement of the use of any particular variables or modeling techniques". Neither the letter nor the post endorses the lender or its products.
- **Results may not transfer.** Effective compliance management and fair lending analysis results "may vary depending on a number of factors", including the applicant pool and the lender's use of data and models.

## What the team would do differently

The post states no lessons from Upstart. The Bureau concludes that "more work remains to be done" on access to affordable credit. It encourages lenders to "develop innovative means of increasing fair, equitable, and nondiscriminatory" access to credit, particularly for credit invisibles, "while maintaining a compliance management program" that addresses risks of legal violations.

The wiki's reading, for teams that put a model in front of a regulated decision:

- **Set the baseline before the claim.** Every result here is relative to a defined traditional model on the same applicants. See [Fairness metrics and bias measurement](#fairness-bias).
- **Test by group, on both decision and price.** The plan checked approval rates and APRs for protected groups, not only overall results.
- **Published is not verified.** A regulator sharing a lender's results is not the same as reproducing them, and the post says so. See [AI risk management and impact assessments](#ai-risk-management) and [US AI law and policy](#us-ai-law).
- **Close the loop on outcomes.** Whether predicted risk matches actual default by group stays unanswered in the post.

## Disclosure

None.

## Sources

- Patrice Alexander Ficklin and Paul Watkins, Consumer Financial Protection Bureau, [“An update on credit access and the Bureau’s first No-Action Letter”](https://www.consumerfinance.gov/about-us/blog/update-credit-access-and-no-action-letter/), Consumer Financial Protection Bureau blog, 6 August 2019. The page is now marked as archived content.

## Related

- [About playbooks](#about-playbooks)
- [Fairness metrics and bias measurement](#fairness-bias)
- [US AI law and policy](#us-ai-law)
- [AI risk management and impact assessments](#ai-risk-management)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
