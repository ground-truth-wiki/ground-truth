---
id: nyc-mycity-chatbot-audit
book: 22
order: "22.4"
title: The New York City MyCity chatbot under audit
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, chat-assistants, evals, audits, public-record]
visuals: []
type: field-note
account: public-record
industry: Public sector (city government)
use_case: A generative AI chatbot that answers business owners' and residents' questions about city services
outcome: 50 of the 70 users who rated answers in July and August 2025 were dissatisfied, and identical questions got different answers; the city office disputed the findings and rejected all seven audit recommendations
measured_how: Audit IT25PAR20028 by the Office of the New York City Comptroller (30 December 2025), based on the city office's own chatbot reports and user feedback for July and August 2025 and on the auditors' own test questions
prerequisites: [online-evaluation]
replications: []
---
> [!tldr]
> New York City's MyCity chatbot answered questions about city services from official content. It launched in September 2023 and was still in beta at the end of 2025. A city audit found that most users who rated it were dissatisfied, that it gave different answers to the same question, and that the office running it computed accuracy in a way that, the auditors found, produced higher rates. The office disagreed. The lesson: how you count quality is part of the system.

> [!note] From the public record
> Built from an official record: the audit report the Office of the New York City Comptroller published on the MyCity system, "Audit Report on the New York City Office of Technology and Innovation's MyCity System" (December 2025), linked under Sources. Neither the auditors nor the team wrote or reviewed this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

MyCity is New York City's portal for city services and benefits, built by the Office of Technology and Innovation (OTI). As part of its business services, OTI developed an AI chatbot to answer business owners' questions. "The Chatbot was launched in September 2023; in March 2025, it was expanded to include content from the 311 service." OTI describes the chatbot as a beta tool whose answers draw on MyCity Business content and the city's 311 knowledge articles.

The chatbot was one finding in a larger audit. The audit asked whether MyCity streamlines the delivery of services and benefits and lets the city track agency performance in real time, and it reports that OTI had spent more than $100 million on MyCity by October 2025.

## What happened

- **Early 2024: the first reports.** "In early 2024, users reported that Chatbot provided incorrect and inconsistent answers to identical questions."
- **July and August 2025: OTI's own data.** More than 2,200 questions were asked in these two months. OTI's weekly reports for July and August named high- and medium-priority issues to fix, "including language problems and inconsistent or inaccurate responses".
- **During the audit: independent tests.** The auditors tested the chatbot with legitimate questions about city procedures, with problem questions previously reported in the media, with inappropriate content, and in languages other than English.
- **30 December 2025: the report.** The Comptroller's office published the audit with seven recommendations and OTI's written response.

## Impact, and how it was measured

- **User feedback.** Of the questions asked in July and August 2025, 70 got a thumbs-up or thumbs-down rating. "Of these, 50 out of 70 respondents (71.4%) submitted negative feedback", and 19 of the 70 said the answer was not helpful.
- **Questions it should have answered.** For topics such as trash collection schedules, business licenses and cash assistance, the chatbot replied: "I'm sorry, but I don't have information on that. My knowledge is currently limited to New York City government topics." Of 48 user questions in OTI's own weekly analysis that it should have answered, it did not answer 23, five of them about childcare.
- **Inconsistency.** Asked about business trash disposal, the chatbot first gave that refusal and then, asked the same question again, a detailed answer. Phrasing mattered too: "any summer camp park program for kid 5 year old" got no useful answer while a reworded question did, and writing "NYC" or "nyc" changed the result. The auditors warn that users with learning disabilities, or who speak English as a second language, may be affected most.
- **Speed.** OTI's own performance scans showed 90th-percentile response times for chatbot questions on 311 topics of 12.4 to 16.2 seconds, against a city standard of 5 seconds.

**The dispute over accuracy.** In its response, OTI said the chatbot "consistently provides over 95% accuracy" week to week, with nearly zero hallucinations and negative feedback around 2.25% of all responses. The auditors answered that OTI divided by the number of recorded prompts and responses rather than the number of questions asked: "Had OTI calculated accuracy rates based on the number of questions asked, rates would have ranged from 84.8% to 92.7% for August 2025." OTI's rate also left out answers it had rated as having "Room for Improvement", and its August report recorded no inconsistent responses, although the auditors' own tests found them. On feedback, the auditors objected that dividing by all prompts "inappropriately assumes that users who don't respond are satisfied".

## Why it happened

The report points to several causes. OTI officials acknowledged the inconsistencies and noted that, as a "generative AI", the chatbot may not always answer consistently; the auditors replied that the NIST AI Risk Management Framework expects AI systems to be reliable and consistent across circumstances. OTI also keeps updating the content behind the chatbot, which the auditors say may make its answers change. And the quality reporting itself was weak: the accuracy metric used a generous denominator, and OTI could show only a one-page summary of the chatbot testing it did in 2023.

## What changed afterwards

OTI reported fixing some issues and added a disclaimer that the chatbot is in beta and "may give inaccurate or incomplete information". According to OTI officials, there were no plans to take it out of beta. The auditors' seventh recommendation asked OTI to run structured "AI red-teaming" to find flaws such as inaccurate or inconsistent answers. OTI disagreed, said it already runs red-teaming and other tests, and repeated an accuracy rate of 95 to 99%. OTI disagreed with all seven recommendations of the audit, and the Comptroller's office says it will follow up on their status periodically.

## Lessons

The audit's own lesson is about evidence: a chatbot's quality claims are only as good as the testing and the metrics behind them. The wiki's reading:

- **Define your metrics before someone audits them.** Accuracy per recorded response and accuracy per question asked tell different stories, and leaving out answers with "Room for Improvement" changes both. See [Statistics for evals](#eval-statistics).
- **Silence is not satisfaction.** Most users never rate an answer; treating them as satisfied hides the signal from those who do. See [Online evaluation](#online-evaluation).
- **Test for consistency, not only correctness.** Ask the same question twice, change the case and the phrasing, and try other languages. See [Nondeterminism and reproducible inference](#inference-nondeterminism) and [Multilingual and low-resource language models](#multilingual-models).
- **Keep testing records.** A red-team exercise that leaves only a one-page summary cannot show what was tested. See [Safety and red-team evals](#safety-evals).

## Disclosure

None.

## Sources

- Office of the New York City Comptroller, [“Audit Report on the New York City Office of Technology and Innovation’s MyCity System”](https://comptroller.nyc.gov/reports/audit-report-on-the-new-york-city-office-of-technology-and-innovations-mycity-system/), audit IT25PAR20028, 30 December 2025, with OTI's written response. [Full report (PDF)](https://comptroller.nyc.gov/wp-content/uploads/2026/02/MyCity-System-Development-Public-Final-report-12-30-25-final-copy.pdf).

## Related

- [About field notes](#about-field-notes)
- [Online evaluation](#online-evaluation)
- [Statistics for evals](#eval-statistics)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
