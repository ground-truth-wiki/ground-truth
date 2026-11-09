---
id: ayinde-high-court-fake-citations
book: 22
order: "22.33"
title: "Fake case citations in two English cases: the High Court on lawyers and generative AI"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [legal, hallucination, citations, regulation, public-record]
visuals: []
type: field-note
account: public-record
industry: "Legal services (litigation in the courts of England and Wales)"
use_case: "Lawyers putting unchecked legal research, from actual or suspected use of generative AI tools, into court documents"
outcome: "Five fake cases cited in Ayinde; 45 citations listed in Al-Haroun, 18 of them to cases that do not exist; referrals to regulators, no contempt proceedings"
measured_how: "Citations checked by the defendant's searches in Ayinde and by a judicial assistant's schedule in Al-Haroun; Divisional Court judgment of 6 June 2025 after a hearing on 23 May 2025"
prerequisites: [hallucination-factuality, grounding-citations]
replications: []
---
> [!tldr]
> In two cases referred to a Divisional Court of the High Court in England and Wales, documents put before the court cited cases that do not exist: five in a judicial review over housing, and 18 of the 45 citations listed in a damages claim against a bank. The court held that freely available generative AI tools are "not capable of conducting reliable legal research", and that "The critical safeguard is to check any output by reference to an authoritative source."

> [!note] From the public record
> Built from an official record: a judgment of the High Court of Justice, King's Bench Division, Divisional Court, "Ayinde -v- London Borough of Haringey, and Al-Haroun -v- Qatar National Bank" (June 2025), linked under Sources. Neither its authors nor the team wrote or reviewed this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Two cases were referred to a Divisional Court and listed together under the Hamid jurisdiction: the court's power to regulate its own procedures and "to enforce duties that lawyers owe to the court". The referrals arise from "the actual or suspected use by lawyers of generative artificial intelligence tools" for written arguments or witness statements "which are not then checked". The court adds that artificial intelligence "can be a useful tool in litigation", but that its use must take place "with an appropriate degree of oversight".

- **Ayinde:** a claim for judicial review against the London Borough of Haringey over interim accommodation. A law centre, a charity, acted for the claimant, and a pupil barrister settled and signed the grounds.
- **Al-Haroun:** a claim for damages of £89.4 million against Qatar National Bank and QNB Capital for alleged breaches of a financing agreement.

## What happened

**Ayinde.** Five cited cases did not exist, and the grounds misstated the effect of section 188(3) of the Housing Act 1996.

1. **4 and 18 February 2025:** the defendant's solicitor wrote that the five cases could not be found, then that they did not exist.
2. **5 March 2025:** the law centre sent a reply drafted by counsel, proposing that "the citation errors can be corrected on the record".
3. **3 April 2025:** a judge heard the defendant's wasted costs application. He ordered the barrister and the law centre each to pay £2,000 and required referrals to the regulators. He was "not in a position to determine whether she did use AI."

**Al-Haroun.** A judge dismissed the claimant's application to set aside an order extending the defendants' time for evidence, and referred the papers with a schedule of references prepared by a judicial assistant.

Both cases were referred on 9 May 2025 and heard on 23 May 2025, and judgment was handed down on 6 June 2025.

## Impact, and how it was measured

- **Al-Haroun.** The schedule "lists forty five citations that had been put before the court", and "In eighteen instances, the case cited does not exist." Many real cases did not contain the quotations or support the propositions. One fake authority was "a decision that was attributed to Dias J", the judge it was cited to.
- **Ayinde.** Five fake cases, and £2,000 in wasted costs each for the barrister and the law centre.

**Not measured:** the judgment does not establish whether generative AI was used in Ayinde, and does not name the AI tools used in Al-Haroun. Apart from the wasted costs orders, it does not quantify the time or cost caused, and it does not count how often such cases occur.

## Why it happened

**The tools.** In the court's words, such tools "may cite sources that do not exist", and a footnote says the information such tools produce is "a result of their operational design". See [Hallucination and factuality](#hallucination-factuality).

**Ayinde.** The cause was not established. The barrister denied using AI tools, later adding that she may have relied on AI-generated search summaries unknowingly; the court was given no evidence that the fake cases came from them. It saw two possible scenarios, deliberate fake citations or AI use with an untruthful denial, either of which would be a contempt. She accepted negligence and apologised, and she and her counsel pointed to inexperience, little supervision and a difficult working and home environment; her chambers' director disputed the supervision account. The law centre, an overstretched charity, had not checked citations from counsel; the court found its supervising solicitor's response to the warnings "inadequate".

**Al-Haroun.** The claimant said the citations were generated using "publicly available artificial intelligence tools, legal search engines and online sources". The solicitor used them without checking.

**The profession.** Guidance from the Bar Council, the regulators and the judiciary already existed, but "promulgating such guidance on its own is insufficient to address the misuse of artificial intelligence."

## What changed afterwards

- **Ayinde.** The court found the threshold for contempt by the barrister met but did not start proceedings, for five reasons that include possible failings of those who supervised her. That decision "is not a precedent", and lawyers who do not comply with their obligations "risk severe sanction". The court referred the barrister and the supervising solicitor to their regulators. The law centre's chief executive says he has told colleagues that "all citations referred to by any counsel must be checked".
- **Al-Haroun.** The court was satisfied the solicitor did not realise the true position, so the contempt threshold was not met. He had referred himself to the Solicitors Regulation Authority, and the court also referred him.
- **The profession.** The court said a copy of the judgment would be sent to the Bar Council, the Law Society and the Council of the Inns of Court, and invited them to consider further steps "as a matter of urgency". The judgment does not record what they did.

## Lessons

The court's own lessons:

- Lawyers must check AI research "by reference to authoritative sources", such as official legislation and judgment databases, also when relying on others' work.
- "A lawyer is not entitled to rely on their lay client for the accuracy of citations of authority".
- Leaders such as heads of chambers and managing partners, and those who regulate legal services, must take "practical and effective measures". In future Hamid hearings, the court will ask whether the leadership responsibilities were fulfilled.
- In the court's view, the risks are not materially reduced by "asking the tool not to provide an answer if it is not sure", or by asking it about the weaknesses of the case.

The wiki's reading:

- **Whether a citation exists is checkable.** A tool that drafts citations should resolve each one against a primary index. See [Grounding and citations](#grounding-citations).
- **Asking a model to admit doubt is not a control.** See [Uncertainty and confidence estimation for LLMs](#llm-uncertainty).
- **Put the check where the accountability sits.** Each hand-off, from client to solicitor or from counsel to law centre, passed the citations on unchecked. See [Human in the loop](#human-in-the-loop).

## Disclosure

None.

## Sources

- Dame Victoria Sharp, President of the King's Bench Division, and Mr Justice Johnson (judgment of the court), High Court of Justice, King's Bench Division, Divisional Court, [“Ayinde -v- London Borough of Haringey, and Al-Haroun -v- Qatar National Bank”](https://www.judiciary.uk/wp-content/uploads/2025/06/Ayinde-v-London-Borough-of-Haringey-and-Al-Haroun-v-Qatar-National-Bank.pdf), [2025] EWHC 1383 (Admin), approved judgment handed down 6 June 2025, published on the Courts and Tribunals Judiciary website ([case page](https://www.judiciary.uk/judgments/ayinde-v-london-borough-of-haringey-and-al-haroun-v-qatar-national-bank/)).

## Related

- [About field notes](#about-field-notes)
- [Hallucination and factuality](#hallucination-factuality)
- [Grounding and citations](#grounding-citations)
- [Human in the loop](#human-in-the-loop)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
