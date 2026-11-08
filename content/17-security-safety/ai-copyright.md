---
id: ai-copyright
book: 17
order: "17.10.4"
title: "Copyright and AI: training, outputs and litigation"
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [copyright, fair-use, litigation, training-data, indemnity]
visuals: []
prerequisites: [governance-regulation]
---
> [!tldr]
> "Is AI legal under copyright?" is really several separate questions: is copying for training allowed, was the data acquired lawfully, do the model or its outputs contain protected works, can AI outputs be protected, and who is liable. Courts answer them differently by country and by case, so read each ruling for its question, its procedural stage and its date. This is a snapshot as of November 2026 and information, not legal advice.

## Key ideas

- **Training and acquisition are separate questions.** On 23 June 2025 the court in Bartz v. Anthropic held that training models on books was fair use, and so was scanning print books Anthropic had bought, but sent the pirated copies in its central library to trial ([order on fair use](https://storage.courtlistener.com/recap/gov.uscourts.cand.434709/gov.uscourts.cand.434709.231.0.pdf)). The case then settled for USD 1.5 billion, and the court granted final approval on 20 July 2026 ([Wikipedia, “Bartz v. Anthropic”](https://en.wikipedia.org/wiki/Bartz_v._Anthropic); [settlement website](https://www.anthropiccopyrightsettlement.com/)).
- **In the US, fair use turns on market harm, and judges weigh it differently.** In Kadrey v. Meta (25 June 2025) Meta won because the authors had not shown market harm, yet the judge wrote that training on protected works without permission will “in most cases” likely be illegal, because the resulting models can flood the market with competing works ([order](https://storage.courtlistener.com/recap/gov.uscourts.cand.415175/gov.uscourts.cand.415175.598.0.pdf)). On 29 September 2026 the Third Circuit held in Thomson Reuters v. Ross that Westlaw headnotes are copyrightable and that copying them to train a competing legal search tool, which “was not a generative AI”, was not fair use ([opinion](https://www2.ca3.uscourts.gov/opinarch/252153p.pdf)); as of November 2026, the US Copyright Office's Part 3 report on training is still a pre-publication version from 9 May 2025 ([US Copyright Office](https://www.copyright.gov/ai/)).
- **Memorization is where European courts have drawn a line.** In November 2025 the Munich Regional Court held in GEMA v. OpenAI that song lyrics memorized in model weights are reproductions, that the text-and-data-mining exception does not cover them, and that OpenAI, not its users, is liable; the judgment is not final ([Norton Rose Fulbright](https://www.nortonrosefulbright.com/en-cn/knowledge/publications/656613b2/germany-delivers-landmark-copyright-ruling-against-openai-what-it-means-for-ai-and-ip)). On 31 July 2026 the same Munich court ruled for GEMA against Suno, finding that songs fully absorbed into the model's parameters are reproductions and that Suno is responsible for the outputs; that judgment is not final either ([LTO](https://www.lto.de/recht/hintergruende/h/landgericht-muenchen-i-gema-suno-ki-modell-training-songs-musikkomposition-urheberrechte), in German). Earlier, in September 2024, the Hamburg Regional Court had dismissed a photographer's claim against LAION over copying his work to build an AI training dataset ([Wikipedia, “Artificial intelligence and copyright”](https://en.wikipedia.org/wiki/Artificial_intelligence_and_copyright)); in the UK, Getty Images v. Stability AI (November 2025) found the model weights were not an “infringing copy” because they did not store the works, and Getty dropped its training claim because training did not happen in the UK ([Mishcon de Reya](https://www.mishcon.com/news/getty-images-v-stability-ai-unpacking-the-high-courts-judgment?publication=7570)).
- **Purely machine-made works get no US copyright.** The D.C. Circuit held on 18 March 2025 in Thaler v. Perlmutter that the Copyright Act requires a human author ([opinion](https://media.cadc.uscourts.gov/opinions/docs/2025/03/23-5233.pdf)), and on 2 March 2026 the Supreme Court declined to hear the case ([Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/03/supreme-court-denies-review-in-ai-authorship-case)); the Copyright Office covered copyrightability in Part 2 of its report (29 January 2025) ([US Copyright Office](https://www.copyright.gov/ai/)). Jurisdictions differ: the Beijing Internet Court recognized copyright in an AI-generated image on 27 November 2023 ([Wikipedia](https://en.wikipedia.org/wiki/Artificial_intelligence_and_copyright)).
- **Provider indemnities shift risk, with conditions.** Microsoft's commitment (September 2023, later renamed the Customer Copyright Commitment) defends commercial customers and pays adverse judgments, but only if they used the products' “guardrails and content filters” and did not try to generate infringing material ([Microsoft](https://blogs.microsoft.com/on-the-issues/2023/09/07/copilot-copyright-commitment-ai-legal-concerns/)). Google Cloud's two indemnities (October 2023) cover training data and, for listed services, generated output; the output indemnity does not apply if the customer intentionally created or used output to infringe ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/protecting-customers-with-generative-ai-indemnification)).
- **Engineering reduces the exposure.** Memorization grows with model size, with how often an example is duplicated in training data and with prompt length (Carlini et al., [“Quantifying Memorization Across Neural Language Models”](https://arxiv.org/abs/2202.07646) (2022)), and verbatim training text can be extracted from a model by querying it (Carlini et al., [“Extracting Training Data from Large Language Models”](https://arxiv.org/abs/2012.07805) (2020)); the mitigations follow: deduplicate training data, test for memorization, filter verbatim output and log data lineage. In the EU, general-purpose model providers must also keep a copyright policy that respects opt-outs and publish a training-content summary ([AI Act, Article 53](https://artificialintelligenceact.eu/article/53/)), covered in depth in [data licensing, copyright and consent](#data-licensing-consent) and [the EU AI Act](#eu-ai-act).

## Planned visuals

- **`tree`:** the separate legal questions (training copies, acquisition, memorization in the model, outputs, copyrightability, liability), each expanded to the leading rulings that answered it, with court, date and stage.
- **`timeline`:** the dated rulings, reports and settlements from 2023 to 2026 across the US, Germany, the UK and China, with appeals marked as pending where they are.
- **`compare`:** the Microsoft and Google indemnities side by side: what is covered, which services, and the conditions a customer must meet.

## Talk like an expert

Experts name the question before the answer (**input** side: training copies and acquisition; **output** side: **regurgitation** and substantial similarity; **authorship**) and always the stage: a ruling on a **motion to dismiss** only says claims may proceed, **summary judgment** decides on the record, a **settlement** sets no precedent, and an **appeal** can reverse. The four **fair use factors**, **market dilution**, the EU **TDM opt-out** and **indemnity conditions** are the working vocabulary.

## Go deeper

- US Copyright Office, [“Copyright and Artificial Intelligence”](https://www.copyright.gov/ai/), Parts 1 to 3 (2024 to 2025).
- [Order on fair use](https://storage.courtlistener.com/recap/gov.uscourts.cand.434709/gov.uscourts.cand.434709.231.0.pdf), Bartz v. Anthropic, N.D. Cal. (2025), and the [Third Circuit opinion](https://www2.ca3.uscourts.gov/opinarch/252153p.pdf) in Thomson Reuters v. Ross (2026).
- Carlini et al., [“Quantifying Memorization Across Neural Language Models”](https://arxiv.org/abs/2202.07646) (2022).

## Related

- [Governance, regulation and law](#governance-regulation)
- [Data licensing, copyright and consent](#data-licensing-consent)
- [Pretraining data](#pretraining-data)
- [Data quality and governance](#data-governance)
- [The EU AI Act in depth](#eu-ai-act)
- [Supply chain and model security](#supply-chain-security)
