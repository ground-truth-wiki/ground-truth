---
id: ftc-rite-aid-facial-recognition
book: 22
order: "22.23"
title: "Rite Aid's in-store facial recognition: an FTC case on unmeasured false matches"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [facial-recognition, fairness, regulation, retail, public-record]
visuals: []
type: field-note
account: public-record
industry: "Retail (store security at a US retailer)"
use_case: "AI-based facial recognition in stores to flag customers who matched a database of persons of interest"
outcome: "FTC charges of thousands of false-positive matches, no accuracy testing before deployment and no tracking of the false-positive rate; a five-year ban on facial recognition for surveillance"
measured_how: "Allegations from the FTC's complaint, summarized in its press release of 19 December 2023, covering 2012 to 2020; no false-positive rate, sample or exact store count given"
prerequisites: [classification-metrics, fairness-bias]
replications: []
---
> [!tldr]
> From 2012 to 2020, Rite Aid used AI-based facial recognition in its stores to flag possible shoplifters. The FTC charged that the system "generated thousands of false-positive matches", that its accuracy was not tested before deployment, and that the harm fell disproportionately on people of color. A proposed order would ban the retailer from facial recognition for surveillance for five years.

> [!note] From the public record
> Built from an official record: the US Federal Trade Commission's press release on its complaint and proposed order against Rite Aid, "Rite Aid Banned from Using AI Facial Recognition After FTC Says Retailer Deployed Technology without Reasonable Safeguards" (December 2023), linked under Sources. Neither its authors nor the team wrote or reviewed this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

In the FTC's words, "from 2012 to 2020, Rite Aid deployed artificial intelligence-based facial recognition technology" to identify customers "who may have been engaged in shoplifting or other problematic behavior", in "hundreds of stores". According to the complaint, the retailer "contracted with two companies to help create a database of images of individuals" it considered "persons of interest", with their names and other information. Employees acted on the system's match alerts. The release does not name the companies or describe the models.

The release attributes these charges to the FTC's complaint. It contains no response from Rite Aid and does not say whether Rite Aid admitted the charges.

## What happened

- **12 November 2010:** the FTC issues a data security order against Rite Aid, as its later decision records.
- **2012 to 2020:** Rite Aid uses facial recognition in its stores. At some point it "switched to a technology that enabled employees to report a “bad match”". The release gives no date for the switch.
- **19 December 2023:** after a 3-0 Commission vote, the FTC files a complaint and a proposed stipulated order in the Eastern District of Pennsylvania. "Rite Aid is currently going through bankruptcy proceedings", so the order needs approval from the bankruptcy court and the district court.
- **26 February 2024:** according to the FTC's later decision, the district court enters the stipulated order, "resolving the 2023 Complaint".
- **5 March 2024:** with Rite Aid's consent, the Commission reopens and modifies the 2010 order.

## Impact, and how it was measured

The release gives counts in words, not measured rates:

- **False matches.** "The system generated thousands of false-positive matches, the FTC says." It sometimes matched customers with people enrolled "based on activity thousands of miles away", or "flagged the same person at dozens of different stores".
- **Actions on alerts.** "Employees, acting on false positive alerts, followed consumers around its stores, searched them," ordered them to leave, called the police and publicly accused them, "sometimes in front of friends or family". Consumers were not told about the technology.
- **Unequal impact.** The technology was "more likely to generate false positives in stores located in plurality-Black and Asian communities" than in stores in "plurality-White communities". The release's subtitle says it falsely tagged consumers, "particularly women and people of color", as shoplifters.
- **The image database.** "The company collected tens of thousands of images of individuals, many of which were low-quality", from security cameras, employee phone cameras "and even news stories".

**Not measured:** the release gives no count or rate of false positives, no number of people flagged or wrongly accused, no exact number of stores, no accuracy figure for any group, and no method behind the comparison between communities.

## Why it happened

The release summarizes the complaint: Rite Aid failed to

- consider and mitigate the risks of misidentification, "including heightened risks to certain consumers because of their race or gender";
- "Test, assess, measure, document, or inquire about the accuracy of its facial recognition technology before deploying it", including asking either vendor about accuracy testing;
- prevent the use of low-quality images, "increasing the likelihood of false-positive match alerts";
- regularly monitor or test accuracy after deployment, "failing to implement or enforce any procedure for tracking the rate of false positive matches";
- adequately train employees and "flag that the technology could generate false positives." Once the "bad match" report was required, "the company did not take action to ensure employees followed this policy."

Separately, the FTC says Rite Aid violated the 2010 order by failing to adequately implement a comprehensive information security program, including oversight of its service providers.

## What changed afterwards

The proposed order bans Rite Aid from "using facial recognition technology for surveillance purposes for five years". It requires safeguards for any automated biometric system that tracks consumers or flags them as security risks, and requires Rite Aid "to discontinue using any such technology if it cannot control potential risks to consumers." Rite Aid must also delete, and direct third parties to delete, the images collected, "as well as any algorithms or other products that were developed using those images and photos". It must notify consumers when their biometric information is enrolled in a database, investigate and respond in writing to complaints, post notice in stores, delete biometric information within five years, and run a data security program with independent assessments.

The FTC's March 2024 decision records that the district court entered the order, but does not mention the bankruptcy court. Neither source reports how the safeguards worked.

## Lessons

The record draws no engineering lessons. The wiki's reading:

- **Measure accuracy before launch, including a vendor's.** Otherwise no one knows what an alert is worth. See [Classification and regression metrics](#classification-metrics).
- **Slice errors by group and by place.** A gap between neighborhoods shows only if you look. See [Fairness metrics and bias measurement](#fairness-bias).
- **Track false positives in production.** A report button nobody uses produces no rate. See [Online evaluation](#online-evaluation).
- **Gate the reference images.** Low-quality enrollment images raise false matches. See [Data quality and governance](#data-governance).
- **Tell the person acting on an alert that it can be wrong.** See [Human in the loop](#human-in-the-loop).
- **Expect remedies to reach the model.** The order covers algorithms built from the images. See [AI risk management and impact assessments](#ai-risk-management).

## Disclosure

None.

## Sources

- Federal Trade Commission, Office of Public Affairs (no byline; the release names Robin Wetherill, Leah Frazier, Diana Chang, Christopher Erickson and Brian Welke of the FTC's Bureau of Consumer Protection as the principal attorneys), [“Rite Aid Banned from Using AI Facial Recognition After FTC Says Retailer Deployed Technology without Reasonable Safeguards”](https://www.ftc.gov/node/82185), press release, 19 December 2023.
- Federal Trade Commission, by the Commission (April J. Tabor, Secretary), In the Matter of Rite Aid Corporation, Docket No. C-4308, [“Decision”](https://www.ftc.gov/system/files/ftc_gov/pdf/c4308riteaidorderreopeningproceedings.pdf), reopening the 2010 proceeding and modifying the 2010 order, issued 5 March 2024.

## Related

- [About field notes](#about-field-notes)
- [Fairness metrics and bias measurement](#fairness-bias)
- [AI risk management and impact assessments](#ai-risk-management)
- [US AI law and policy](#us-ai-law)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
