---
id: gates-giz-farmer-advisory-learnings
book: 22
order: "22.37"
title: "AI advisory for smallholder farmers: five voice and chat pilots in Kenya and Bihar"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [agriculture, voice-agents, low-resource-languages, rag, public-record]
visuals: []
type: field-note
account: public-record
industry: "Agriculture (smallholder farming, development programmes)"
use_case: "Voice and chat AI advisory services that answer smallholder farmers' questions in Kenya and Bihar, India"
outcome: "Net promoter score of 60 on average in cohorts in a user study of over 800 farmers; voice latency below 5 seconds not consistently reached"
measured_how: "60 decibels user study of over 800 smallholder farmers (38% women), NPS against global, Kenyan and Bihar benchmarks of digital farmer services; study date and per-MVP samples not stated (Collis et al., arXiv, November 2025)"
prerequisites: [voice-agents, rag-fundamentals]
replications: []
---
> [!tldr]
> Under the AIEP Initiative, funded by the Gates Foundation and implemented by GIZ, five cohorts built AI advisory MVPs that answer smallholder farmers' questions by voice and chat in Kenya and Bihar, India. A study of over 800 farmers found a net promoter score of 60 on average in cohorts. Latency was "a consistent challenge for all AIEP MVPs", and the paper names low-resource languages and corpus curation as further key challenges.

> [!note] From the public record
> Built from the AIEP Initiative's own published account, "Building AI-based advisory services for smallholder farmers: Technical learnings from the AIEP Initiative" (November 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Traditional extension systems "struggle to provide their service and support at scale", with "ratios of extension agents to farmers below 1 to 750 in India" and 1 to 1000 in Kenya. The AIEP Initiative is funded by the Gates Foundation and implemented by GIZ's FAIR Forward programme, with support from CLEAR Global.

"The AIEP initiative started in 2023 by selecting four cohorts out of more than 100 applications", and a fifth cohort joined later. The five MVPs:

- **dynAg**, led by the CGIAR, in Bihar, through the ai.sakhi app and IVR.
- **FarmerChat**, from Digital Green, Karya, Gooey.ai and Gramvaani, now a generative AI chatbot.
- **Tech4Her**, from DeHaat and Dalberg.
- **The Viamo cohort**, in Kenya and Bihar, built on Viamo's IVR service.
- **A WhatsApp bot** in Kenya from Opportunity International, SafariCom DigiFarm and Gooey.ai.

The services run "in English, Swahili, and Hindi mostly through machine translation (MT)". Gikuyu in Kenya and Bhojpuri in Bihar are harder.

## What happened

"The collective MVP development started in late 2023 and continued until early 2025."

As of November 2025, all five MVPs share a two-part architecture. An interface component (IVR, WhatsApp or app) chains speech recognition (ASR), machine translation and speech synthesis (TTS). A reasoning component combines LLMs with query orchestration, external data such as weather, soil and market prices, and retrieval-augmented generation over curated content, with "dozens to more than 100 different sources of agricultural information" in most cohorts. The WhatsApp cohort uses Gooey.ai's low-code AI orchestration platform. The paper does not name the LLMs the cohorts used.

In the paper's illustrative walkthrough, an imagined bean farmer in Embu County, Kenya, calls in. Her speech goes through ASR, translation into English, a query classifier that fetches a weather forecast, the LLM, translation back into Swahili and TTS. She "hears it on her phone between 5 and 8 seconds later."

## Impact, and how it was measured

- **Satisfaction.** "A first user study conducted by 60 decibels of over 800 smallholder farmers, 38% of which were women" found that the net promoter score "is 60 on average in cohorts which exceeds global (NPS 46), Kenyan (NPS 26) and Bihar (NPS 40) benchmarks". The benchmarks are for digital farmer services and were collected by 60 decibels. "Importantly, women report a higher NPS than men."
- **Gaps.** "the completeness and relevance of the information provided stands out" as an area to improve, and "It is the main reason why farmers would not recommend solutions to others."
- **Acting on advice.** Of those who had not applied the information, 50% said "the availability of inputs or financial constraints kept them from taking action."
- **Sample skew.** Educational attainment was above the average smallholder farmer's, "with 30% of the survey participants reporting a university, polytechnical, or other higher degree."
- **Latency.** It "has been a consistent challenge for all AIEP MVPs". One cohort "managed to reduce average latency by a factor of 25 to just below 10 seconds".

**Not measured:** the paper does not state when the user study ran, how many users each MVP had, or what share of farmers applied the advice. Effects on yields and livelihoods have not yet been evaluated. The latency figures come without a sample or period, and the cohorts collected a set of standard indicators whose values the paper does not report.

## Why it happened

On latency, the authors call the main driver an open question. The number of model inference calls, "at least four" (ASR, MT, LLM and TTS), "might be one driver". If not, network latency is "the second key driver". See [Turn-taking, interruptions and latency in voice agents](#voice-turn-taking).

On language, "low-resource ASR/MT integration and nonstandard scripts hinder end-to-end quality". The word "mushroom", pronounced "mushraum" in Hindi, was transliterated as "machchharon" and then "got translated to mosquitoes in the English translated prompt", and Google and Bhashini MT models read some spellings of the Hindi word for paddy as a word meaning money. For Gikuyu with ASR and MT combined, "Performance is substantially poorer", which "might be due to how models handle diacritics in Gikuyu". See [Multilingual and low-resource language models](#multilingual-models).

On content, "Accessing and validating the content for this knowledge base remains a very manual and time-consuming process." RAG "is not a full safety mechanism", and "our evaluation capabilities are only emerging".

## What changed afterwards

Some cohorts cut latency with in-country model providers or hosting and smaller audio files. dynAg added a denoiser to improve ASR performance, and many cohorts used speech detection models to cut out silence. Moving more tasks into the LLM "is a current topic of testing".

Digital Green, Karya and Gooey.ai worked on Gikuyu ASR: "The teams collected 275 hours of voice samples from more than 500 farmers", "of which 76 hours were validated (with a pass rate of 81%)", and the fine-tuned MMS model "showed very good performance".

A Golden Q&A set of "114 quality-assured English questions and answers", with reference answers by agronomists, is kept private over data leakage concerns. Agronomists "rated the performance of various LLMs very highly, without statistically significant differences between them". The paper finds that "an LLM-as-a-judge approach generally yields similar evaluations to human agronomists, albeit slightly lower at times". See [LLM-as-judge done right](#llm-as-judge). Partners are preparing "rigorous evaluations of the impact on yields and livelihood".

## Lessons

The paper's recommendations: mix skills in the team and work with native speakers, which "massively accelerates the development process"; check access to content first; use "a multi-channel approach, e.g. combining WhatsApp with a telephone line"; build on existing tools, deploy early and plan for costs at scale.

The wiki's reading:

- **Time each stage of a voice chain.** At least four model calls plus the network add up; measure each before choosing a fix.
- **Test the chain, not the parts.** Gikuyu ASR performed well alone, and substantially poorer once translation was added.
- **Satisfaction is not impact.** An NPS from a sample more educated than the average farmer says nothing yet about yields. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure

None.

## Sources

- Stewart Collis, Florence Kinyua, Vikram Kumar, Howard Lakougna, Christian Merz, Kirti Pandey and Christian Resch, on behalf of the AIEP Initiative (Gates Foundation, GIZ, CLEAR Global), [“Building AI-based advisory services for smallholder farmers: Technical learnings from the AIEP Initiative”](https://arxiv.org/html/2601.11537), arXiv:2601.11537v1 [cs.HC], 27 November 2025.

## Related

- [About field notes](#about-field-notes)
- [Voice and realtime agents](#voice-agents)
- [Multilingual and low-resource language models](#multilingual-models)
- [Speech recognition models](#speech-recognition)
- [LLM-as-judge done right](#llm-as-judge)
