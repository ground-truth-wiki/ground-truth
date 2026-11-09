---
id: sec-presto-voice-ordering
book: 22
order: "22.8"
title: "Presto Voice: an SEC order on drive-thru AI that relied on human agents"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [voice-agents, human-in-the-loop, regulation, evaluation-metrics, public-record]
visuals: []
type: field-note
account: public-record
industry: "Restaurant technology (drive-thru ordering at quick-service restaurants)"
use_case: "Presto Voice, AI-assisted speech recognition to automate aspects of drive-thru order taking"
outcome: "Settled SEC findings: filings claimed Presto Voice eliminated human order taking, but the first in-house version required human agent intervention, including entering the order, in all instances, and a later pilot version required a human agent to enter orders approximately 70% of the time"
measured_how: "Findings of the SEC's settled cease-and-desist order, File No. 3-22413 (14 January 2025), covering statements from November 2021 to May 2023 and the company's own disclosures of October to December 2023; no order volumes or samples given"
prerequisites: [human-in-the-loop, voice-agents]
replications: []
---
> [!tldr]
> Presto Automation sold Presto Voice, an AI speech recognition product for drive-thru ordering. A settled SEC order found that its in-house version needed off-site human agents for most orders, while Presto told investors it eliminated human order taking and reported automation rates that left out those agents. The lesson: an automation rate means little until you say which humans it counts.

> [!note] From the public record
> Built from an official record: the U.S. Securities and Exchange Commission's settled cease-and-desist order against Presto Automation Inc. and the SEC's summary of it, "SEC Charges Restaurant-Technology Company Presto Automation for Misleading Statements About AI Product" (January 2025), linked under Sources. Neither its authors nor the team wrote or reviewed this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Presto Automation Inc. is a restaurant technology company in California. In the SEC's words, "Presto Voice employs AI-assisted speech recognition technology to automate aspects of drive-thru order taking at quick-service restaurants". For the general architecture of such systems, see [Voice and realtime agents](#voice-agents) and [Speech recognition models](#speech-recognition).

Presto went public through a merger with a special purpose acquisition company completed on 21 September 2022, and was listed on the Nasdaq until September 2024. The order is a settlement: Presto consented to it "without admitting or denying the findings", and the findings are not binding on any other person or entity.

## What happened

- **Before the merger announcement: a licensed engine.** As of 2021, Presto had no commercially deployable voice AI of its own. Shortly before announcing the merger plan, it licensed technology from a provider the order calls "Supplier A" (and elsewhere names as Hi Auto) for Presto Voice-branded units. Its executives understood this solution was "supported by human agents to some extent".
- **November 2021 to September 2022: third-party units only.** Every deployed unit ran on Supplier A's technology, at the restaurants of Presto's largest Presto Voice customer, "Customer A". A press release furnished on 10 November 2021 described ordering "via automated speech recognition with over 94% accuracy even in noisy environments."
- **2022: an in-house version.** Presto began developing its own voice AI in early 2022 and deployed it to new customers from September 2022, while the Supplier A units stayed in service.
- **2022 and 2023: the claims.** In five registration statements filed between 21 October 2022 and 1 May 2023, Presto claimed that Presto Voice "eliminat[es] human order taking." Investor presentations furnished with Forms 8-K of 12 January 2022, 11 April 2022, 26 July 2022 and 11 January 2023 reported "automated order completion" rates of 95% to 99% at Customer A's restaurants. The January 2023 presentation also claimed "non-intervention" rates greater than 95%.
- **June 2023: a pilot.** A more advanced in-house version, with an AI order-taking component, was piloted at select locations.
- **October to December 2023: disclosure.** After learning of the SEC investigation, Presto disclosed its reliance on Supplier A and on human agents.
- **14 January 2025: the settled order.**

## Impact, and how it was measured

The order states findings, not a measurement method:

- **The original in-house version.** Speech recognition turned the customer's voice into text, and off-site human agents, including in the Philippines and India, entered the order. It "required human agent intervention, including entering the order, in all instances."
- **The advanced pilot version.** It "required a human agent to enter the orders approximately 70% of the time", from June 2023 through at least December 2023.
- **What the reported rates counted.** Both rates described orders "completed without restaurant staff involvement (but not without any human involvement)". While only Supplier A units were deployed, the data came from Supplier A and "was not independently verified by Presto".
- **Presto's own later figures.** In November 2023 it disclosed that "over 70% of orders taken by our Presto Voice solution require human agent intervention." In December 2023 it clarified that the 70% referred to the few pilot locations, that human agents intervened on 100% of orders at the substantial majority of original-version locations, and that its non-intervention rate across all restaurants powered by its own technology "was on average 85%".
- **The legal result.** The SEC found violations of the Securities Act and the Exchange Act, ordered Presto to cease and desist, and imposed no civil penalty.

**Not measured:** the order gives no order volumes, no number of restaurants or units and no sample for any rate, does not say how the 70% figure was computed, and does not assess recognition accuracy, order errors or investor losses.

## Why it happened

- **The design depended on people.** The original version "was designed to rely on this human support and was not capable of processing orders without it."
- **Vendor capability was not understood.** For the Supplier A units, Presto "lacked a detailed understanding" of the technology and of the human involvement behind its performance.
- **The gap was known.** The reliance on humans was "well known inside Presto throughout 2022 and beyond". In January 2023 one executive raised concerns that Presto was "telling investors Presto AI is running 95%+ accuracy" without disclosing that "AI is doing NONE of the work and all orders are processed by humans."
- **No disclosure controls.** From September 2022 through December 2024, Presto had no established process to draft, review or approve its reports, and "no one at Presto was formally responsible" for their accuracy.

## What changed afterwards

In a Form 10-K of 11 October 2023, Presto named Supplier A and disclosed for the first time that off-site human agents "enter, review, validate and correct orders received by Presto Voice". Presto adopted a press release review policy in December 2023, but never implemented disclosure controls for its periodic or current reports. Presto also voluntarily met the SEC staff on multiple occasions and provided presentations and factual summaries. The SEC's summary says it imposed no civil penalty based on this cooperation and the remedial efforts. The Commission also considered Presto's current financial condition. The order does not say whether the product's level of automation changed.

## Lessons

The order draws no engineering lessons; its findings concern what investors were told. The wiki's reading:

- **Count every human in the loop.** An automation rate that leaves out off-site agents describes the restaurant's workload, not the AI's. Define who counts as an intervention before reporting the number. See [Human in the loop](#human-in-the-loop).
- **Name the metric by what it measures.** Recognition accuracy, staff non-intervention and full automation are three different numbers. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Verify a vendor's numbers before you repeat them.** A licensed engine's reported rates carry the vendor's definitions and whatever human support the vendor uses.
- **Assign an owner to capability claims.** When no one checks public statements against the system as built, claims drift from the product.

## Disclosure

None.

## Sources

- U.S. Securities and Exchange Commission (no byline; investigation by Tamara McCreary and Kathleen Galloway of the Fort Worth Regional Office, supervised by Nikolay Vydashenko and B. David Fraser, with the assistance of Jason Rose), [“SEC Charges Restaurant-Technology Company Presto Automation for Misleading Statements About AI Product”](https://www.sec.gov/enforcement-litigation/administrative-proceedings/33-11352-s), administrative proceeding summary, File No. 3-22413, 14 January 2025.
- U.S. Securities and Exchange Commission, by the Commission (Vanessa A. Countryman, Secretary), In the Matter of Presto Automation Inc., [“Order Instituting Cease-and-Desist Proceedings Pursuant to Section 8A of the Securities Act of 1933 and Section 21C of the Securities Exchange Act of 1934, Making Findings, and Imposing a Cease-and-Desist Order”](https://www.sec.gov/files/litigation/admin/2025/33-11352.pdf), Securities Act Release No. 11352, Exchange Act Release No. 102177, File No. 3-22413, 14 January 2025.

## Related

- [About field notes](#about-field-notes)
- [Human in the loop](#human-in-the-loop)
- [Voice and realtime agents](#voice-agents)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
