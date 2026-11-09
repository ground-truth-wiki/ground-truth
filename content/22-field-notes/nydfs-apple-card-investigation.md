---
id: nydfs-apple-card-investigation
book: 22
order: "22.15"
title: "Apple Card credit decisions under a New York regulator's review"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [finance, credit-underwriting, fairness, explainability, regulation, public-record]
visuals: []
type: field-note
account: public-record
industry: "Financial services (consumer credit cards)"
use_case: "The complex underwriting model behind Apple Card credit decisions and credit terms"
outcome: "No evidence of deliberate or disparate impact discrimination against women, but deficiencies in customer service and transparency"
measured_how: "Regression analysis by the DFS Consumer Examinations Unit of underwriting data for nearly 400,000 New York applicants from the card's launch to the first complaints, plus records, interviews and complaint reviews (NYDFS, March 2021)"
prerequisites: [fairness-bias]
replications: []
---
> [!tldr]
> In November 2019, allegations surfaced on Twitter that Goldman Sachs Bank USA offered women lower Apple Card credit limits. The New York State Department of Financial Services found no evidence of deliberate or disparate impact discrimination, but "deficiencies in customer service and transparency". In the rush to roll out the card, the report says, the Bank "seemed unprepared" for outcomes that might surprise applicants.

> [!note] From the public record
> Built from an official record: the report the New York State Department of Financial Services published on its investigation of Apple Card underwriting, "Report on Apple Card Investigation" (March 2021), linked under Sources. Neither its authors nor the team wrote or reviewed this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Apple and Goldman Sachs launched Apple Card in August 2019. The card was offered by Apple Inc. and underwritten by Goldman Sachs Bank USA (the Bank), a New York State-chartered bank. Although advertisements said the card was "created by Apple, not a bank", Goldman Sachs was responsible for credit policy, underwriting decisions and customer service. In the first few months, "millions of Americans, including hundreds of thousands of New Yorkers, applied for Apple Cards."

The report calls the system a "complex underwriting model" that let applicants start using the card right away. It does not describe the model's design, and it does not say whether it used machine learning.

## What happened

- **From 7 November 2019: the allegations.** In a series of tweets, a consumer said that, although he and his wife file joint tax returns, he was offered a credit limit "20 times higher than her offer". He ascribed the difference to sex discrimination and complained that a customer service agent could not explain the algorithms or the basis for the difference.
- **Within days: the Bank's first response.** After re-reviewing the credit files, the Bank raised the wife's limit to match her spouse's, as it did for a second couple whose case was raised on Twitter. It also eliminated a six-month waiting period for appeals of credit decisions.
- **The investigation.** DFS reviewed "several thousand pages of records and written responses from the Bank and Apple", interviewed applicants who complained, and analyzed underwriting data.
- **March 2021: the report.** DFS published its findings.

## Impact, and how it was measured

DFS checked for disparate treatment (intentional use of prohibited classifications such as sex) and disparate impact (neutral policies with unequal outcomes for protected classes).

- **Disparate impact.** The Consumer Examinations Unit (CEU) used "a very large data set of the Bank’s Apple Card underwriting data for nearly 400,000 New York applicants", covering applications from the launch until the first discrimination complaints. It used regression analysis, "a standard technique", and "CEU’s analysis did not bear out violations of fair lending laws." DFS found that "women and men with equivalent credit characteristics had similar Apple Card application outcomes."
- **Fair lending program.** DFS found the Bank had a program to ensure its lending policy and "underlying statistical model" did not consider prohibited characteristics and would not produce disparate impacts.
- **Disparate treatment.** The Department "did not find evidence of unlawful intentional discrimination against women" or other protected classes.
- **Individual complaints.** At the Department's request, the Bank explained its decision for each person who sent DFS a discrimination complaint. It identified factors such as credit score, indebtedness, income, credit utilization and missed payments, none of them an unlawful basis for a credit determination.
- **Spouses.** Couples who complained of different treatment "typically had different credit scores" and different credit profiles.

**Not measured:** The report publishes no regression results, disparity figures or approval rates by sex, and it does not describe how the model was built or how the Bank's fair lending program tested it. It does not state how many complaints DFS received or how many declined applicants were invited to Path to Apple Card.

## Why it happened

The report says "the problems might have been prevented by better management of the product’s roll-out". It points to issues in the process around the model:

- **Lack of transparency.** Federal law requires lenders to explain only credit denials, not the reasons for the terms of credit granted. The Bank could explain every complainant's decision to DFS, but the lack of transparency to complainants "seemed to produce confusion that could have been mitigated."
- **A slow appeal path.** "Requiring account holders to wait six months to appeal credit terms frustrated applicants" who were surprised by their limits and rates.
- **Launch pressure.** In the report's words, "in the rush to roll out Apple Card, the Bank seemed unprepared" for the possibility that its model "would produce outcomes that might surprise applicants." These issues "were compounded by internal deadlines and pressure on the Bank" to roll out the card by a particular date.

## What changed afterwards

- **Appeals.** The Bank dropped the six-month wait after the media scrutiny of November 2019, which the report says showed it "was capable of reviewing credit terms and offering modifications more quickly".
- **Path to Apple Card.** Launched during discussions with DFS and introduced in June 2020, it gives invited declined applicants step-by-step instructions that "if completed satisfactorily, will lead to approval". At the time of the report, "More than 70,000 consumers have enrolled in the Path to Apple Card program", and "nearly 5,000 applicants have been approved for an Apple Card."
- **Explanations online.** The Apple Card website section "A Closer Look at our Application Process" shows data the Bank draws on in setting credit terms.
- **A second-look program, ended.** In the months after launch, some applicants with limited or no credit history could offer their Apple customer data for underwriting. The Bank ended this "after concluding that the data did not improve underwriting accuracy." The report gives no date for the end. DFS found no violations in it.

## Lessons

The report says that "a more nimble policy for credit term review" at the card's introduction "would have provided consumers with a greater sense of fair treatment".

The wiki's reading: these points are for teams that put a model behind decisions about people.

- **Passing a fairness test is not the same as being understood.** No fair lending violations were found, yet consumers without an explanation of their terms suspected bias. Explain decisions to the people affected, not only to the regulator. See [Explaining model predictions](#model-interpretability).
- **Compare like with like.** DFS found that women and men with equivalent credit characteristics had similar outcomes. Teams can run that comparison before launch and keep the records. See [Fairness metrics and bias measurement](#fairness-bias).
- **Build the appeal path with the model.** A fast review of surprising outcomes is part of the system. See [Human in the loop](#human-in-the-loop) and [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).

## Disclosure

None.

## Sources

- New York State Department of Financial Services, [“Report on Apple Card Investigation”](https://www.dfs.ny.gov/reports_and_publications/202103_report_apple_card_investigation), report on the investigation of Apple Card underwriting by Goldman Sachs Bank USA, March 2021 (PDF).

## Related

- [About field notes](#about-field-notes)
- [Fairness metrics and bias measurement](#fairness-bias)
- [Explaining model predictions](#model-interpretability)
- [US AI law and policy](#us-ai-law)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
