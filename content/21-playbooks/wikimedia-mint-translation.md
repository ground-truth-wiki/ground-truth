---
id: wikimedia-mint-translation
book: 21
order: "21.81"
title: "MinT: open machine translation on CPUs for Wikipedia translators"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [machine-translation, low-resource-languages, open-models, self-hosting, public-record]
visuals: []
type: playbook
account: public-record
industry: "Nonprofit media (Wikipedia and open knowledge)"
use_case: "Machine translation drafts from open-source models in Wikipedia's Content Translation tool, which editors are encouraged to improve"
outcome: "At launch, MinT was available in Content Translation for 155 languages, 44 with no other machine translation option; in recent months after launch, monthly published translations were consistently over 1,000 with a peak of 2,150 in August 2023, and the monthly deletion rate did not rise"
measured_how: "Language counts at launch (Wikimedia Foundation Language team, June 2023); monthly published translations and the monthly deletion rate (shown only as a graph) from the team's analytics dashboard, with no sample or method details (November 2023)"
prerequisites: [multilingual-models, nlp-tasks]
replications: []
---
> [!tldr]
> In June 2023 the Wikimedia Foundation's Language team launched MinT, which runs open-source translation models on Wikimedia Foundation infrastructure, on CPUs, to give Wikipedia translators a starting point. At launch it covered 155 languages in Content Translation, 44 of them with no other machine translation option. In November 2023 the team reported "over 1,000 published translations" a month, up from a level that "rarely reached 500", with no rise in the monthly deletion rate.

> [!note] From the public record
> Built from the Wikimedia Foundation's own published accounts, "MinT: Supporting underserved languages with open machine translation" (June 2023) and "Unlocking the World's Languages in Wikipedia: A look into MinT's Impact so far" (November 2023), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Content Translation is the Wikipedia tool for translating articles between languages. It "uses machine translation as a starting point when it is available", and editors then improve the draft, "making sure to keep humans in the loop" (see [Human in the loop](#human-in-the-loop)).

The tool already integrated "an Apertium instance", where adding languages "requires advanced linguistic expertise", and "open API clients from otherwise-closed platforms such as Google Translate." The NLLB-200 model in particular could support "Wikipedias in 44 languages for which machine translation was not available", plus 23 languages with no Wikipedia yet: "a total of 67 languages without machine translation support". [Multilingual and low-resource language models](#multilingual-models) explains why such languages are hard.

## Why this approach

The June 2023 post presents MinT as "a translation service that is open", with "a quality level that is comparable to the proprietary services." As support it cites editor feedback and the usage reports below, not quality scores.

MinT runs translation models "released by other organizations with an open source license" (see [Model licenses and openness definitions](#model-licenses)). It runs on Wikimedia Foundation infrastructure. A "previous unsuccessful attempt to integrate OPUS models" ran into a hosting limit there: the GPU architecture required for models such as NLLB-200 and OPUS "relied on proprietary drivers", and this was "not acceptable for the maintainers of the Wikimedia infrastructure."

## The approach

The post calls steps 1 to 3 "a long journey expanding for about four years".

1. **OpusMT, from January 2019.** A test instance in Content Translation supported Assamese, Central Bikol and Tsonga, but "performance quickly became a blocker."
2. **NLLB-200, hosted by Meta.** In 2021, before NLLB-200 was publicly announced in 2022, the research team at Meta connected with the Language team. Meta agreed to run it "as an external service for a period of a year", to evaluate the model on pilot wikis, initially for 6 languages. Later "17 additional languages were supported" with NLLB-200, "reaching a total of 23 languages."
3. **Self-hosting on CPUs.** MinT runs optimized versions of the models "using Ctranslate2 to avoid the need for GPU acceleration." "We achieved translation performance similar to GPU by using the optimized models with just CPUs." See [Serving engines](#serving-engines).
4. **Editors fix drafts, and the fixes feed back.** Translated Wikipedia articles are added to the OPUS repository "as new resources to improve the translation quality for the next version of the model."

## The stack

As of June 2023:

- **Models:** "MinT is running the optimized version of NLLB-200, OPUS, IndicTrans2, and Softcatalà translation models", from Meta, the University of Helsinki, AI4Bharat@IIT Madras and the non-profit Softcatalà.
- **Inference and hosting:** the OpenNMT Ctranslate2 library, on CPUs only, on Wikimedia Foundation infrastructure.
- **Data loop:** the OPUS repository, plus open communities such as Tatoeba.

## Results, and how they were measured

At launch (June 2023 post):

- **Coverage.** "MinT is available in Content Translation for 155 languages" "(44 of them with MinT as the only machine translation option available)".
- **Signals for NLLB-200.** From two linked usage reports: "NLLB-200 currently has the lowest percent of articles created with content translation that are deleted (0.13%)", and "the highest percent of translations modified under 10%", which the quoted report reads as "a signal of good machine translation quality." The reports cover "the initial period" of the pilot and the period "after the addition of new languages". The other services' figures are not given.
- **Uptake.** "Most (82% so far) of the Luganda translators have used MinT as the starting point".

After launch (November 2023 post, from the team's analytics dashboard):

- **Volume.** "In the past, monthly translation activities rarely reached 500." In recent months following the introduction of MinT, "we've consistently seen over 1,000 published translations, with a peak of 2,150 in August." The previous year's August "had only 225 published translations".
- **Rank among services.** Between August and September 2023, MinT "did not hold the top position" but facilitated "3634 translations in the content and section translation tool", "being the second most-used machine translation support service."
- **Deletion rate.** The team reads a rising deletion rate as "a first indication of poor quality translation or the translation tool's misuse". It reports that "the increase in translation activity after MinT did not increase the monthly deletion rate." The text gives no percentage, only a graph. See [Online evaluation](#online-evaluation).
- **New languages.** The post counts "55 language Wikipedias" getting machine translation support for the first time.

**Not measured:** neither post reports automatic or human quality scores, CPU against GPU timings, hardware or cost, or a sample and period for the 0.13% and 82% figures. The November post does not define a "published translation" or discuss causes of the rise other than MinT.

## What failed

- **GPUs first.** The OpusMT test instance could not reach "the full potential of the project": acceptable performance needed GPUs, and the GPU architecture required relied on proprietary drivers.
- **The wrong language variant.** "Cantonese Wikipedia editors preferred not to have access to translations using the NLLB-200 model", because its training data "was based on a variant of the language that was not useful for the Cantonese Wikipedia." The post does not say what was done about it.
- **Low-resource quality.** Quality "may be initially low for languages with low resources."
- **Markup.** Extending MinT to the Translate extension brings "new challenges, like supporting the translation of contents with Wikitext and other markup".

## What the team would do differently

Neither post states lessons or what the team would change. The June post lists next steps: more languages, more projects beyond Content Translation, and more models, since "MinT was designed to support multiple translation models". By November the team was exploring "possibly exposing the API as an infrastructure to other communities."

The wiki's reading: the blocker was an infrastructure requirement, not model quality, and an inference library that made CPU serving workable removed it. The posts report quality through production signals (deletions, and how much editors changed drafts), not benchmark scores. Few edits fit good drafts but would also fit light review, and the posts do not separate the two.

## Disclosure

None.

## Sources

- Pau Giner, Wikimedia Foundation, [“MinT: Supporting underserved languages with open machine translation”](https://diff.wikimedia.org/2023/06/13/mint-supporting-underserved-languages-with-open-machine-translation/), Diff (Wikimedia blog), 13 June 2023, updated 27 June 2023.
- Uzoma Ozurumba, Wikimedia Foundation, [“Unlocking the World's Languages in Wikipedia: A look into MinT's Impact so far”](https://diff.wikimedia.org/2023/11/20/unlocking-the-worlds-languages-in-wikipedia-a-look-into-mints-impact-so-far/), Diff (Wikimedia blog), 20 November 2023, updated 6 February 2024.

## Related

- [About playbooks](#about-playbooks)
- [Multilingual and low-resource language models](#multilingual-models)
- [Classic NLP tasks: classification, tagging, extractive QA, summarization and translation](#nlp-tasks)
- [Serving engines](#serving-engines)
- [Model licenses and openness definitions](#model-licenses)
