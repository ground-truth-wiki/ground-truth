---
id: multilingual-models
book: 4
order: "4.8"
title: Multilingual and low-resource language models
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [multilingual, low-resource-languages, tokenization, cross-lingual-transfer, evaluation]
visuals: []
prerequisites: [tokenization, choosing-a-model]
---
> [!tldr]
> Training data for language models is heavily skewed toward English, and cost, quality and safety can all get worse in languages with less data. Tokenizers charge some languages several times more tokens for the same text, models sometimes answer in the wrong language, and translated benchmarks hide cultural gaps. Remember to test every language you ship on its own, with natively written examples, because an average over languages hides the weakest one.

## Key ideas

- **Training data is skewed toward English, and low-resource data is often poor.** By the fastText language detector, 89.70% of Llama 2's pretraining documents were English, 8.38% were of unknown language (partly code), and no other language reached 0.2% ([Touvron et al., “Llama 2: Open Foundation and Fine-Tuned Chat Models” (2023)](https://arxiv.org/abs/2307.09288)); and a manual audit of 205 language-specific corpora from five major public web-mined datasets found at least 15 with no usable text and many that were mislabeled or used nonstandard or ambiguous language codes ([Kreutzer et al., “Quality at a Glance” (2021)](https://arxiv.org/abs/2103.12028)). See [pretraining data](#pretraining-data).
- **Tokenizers tax some languages.** The same text translated into different languages can need up to 15 times as many tokens, which raises cost and latency and shrinks how much content fits in the context window ([Petrov et al., “Language Model Tokenizers Introduce Unfairness Between Languages” (2023)](https://arxiv.org/abs/2305.15425)). See [tokenization](#tokenization) and [training and using tokenizers](#tokenizers-in-practice).
- **Languages help each other until capacity runs out.** XLM-R, trained on more than two terabytes of CommonCrawl text in 100 languages, beat multilingual BERT by 14.6% in average XNLI accuracy, and its authors named the "curse of multilinguality": at fixed model size, adding languages first helps low-resource ones, then hurts all of them (XNLI accuracy fell from 71.8% to 67.7% going from 7 to 100 languages), while more capacity relieves it ([Conneau et al., “Unsupervised Cross-lingual Representation Learning at Scale” (2019)](https://arxiv.org/abs/1911.02116)). Whether the curse persists at scale is open: one study fits a scaling law for how much to grow model size and data when adding languages ([Longpre et al., “ATLAS” (2025)](https://arxiv.org/abs/2510.22037)), while another argues that many reported regressions stem from correctable deficiencies in data quality and composition rather than fundamental capacity limits ([Carranza et al., “ÜberWeb” (2026)](https://arxiv.org/abs/2602.15210)).
- **Massively multilingual models exist, and wrong-language answers are a known failure.** Aya follows instructions in 101 languages, more than half of them lower-resourced, and outperformed mT0 and BLOOMZ on most tasks ([Üstün et al., “Aya Model” (2024)](https://arxiv.org/abs/2402.07827)). On a benchmark of 15 languages, even strong models did not reliably answer in the user's language, base and English-centric models were worse, complex prompts and high sampling temperatures made it worse, and few-shot prompting, multilingual fine-tuning and preference tuning reduced it partly ([Marchisio et al., “Understanding and Mitigating Language Confusion in LLMs” (2024)](https://arxiv.org/abs/2406.20052)).
- **Translated benchmarks carry their source culture, and safety training does not transfer evenly.** In MMLU, 28% of questions need culturally sensitive knowledge and 84.9% of the questions that need geographic knowledge are about North America or Europe, and model rankings change between the full set and its culturally sensitive subset; the authors released Global MMLU, covering 42 languages, with culturally sensitive and culturally agnostic subsets ([Singh et al., “Global MMLU” (2024)](https://arxiv.org/abs/2412.03304)). Translating unsafe AdvBench prompts into low-resource languages got GPT-4 to give actionable harmful answers 79% of the time, with much lower attack success in high- and mid-resource languages ([Yong et al., “Low-Resource Languages Jailbreak GPT-4” (2023)](https://arxiv.org/abs/2310.02446)). See [jailbreaks and misuse](#jailbreaks-misuse).
- **Retrieval and translation are design choices, not afterthoughts.** On MMTEB, a benchmark of more than 500 embedding tasks in over 250 languages, the best publicly available model was multilingual-e5-large-instruct with only 560 million parameters ([Enevoldsen et al., “MMTEB” (2025)](https://arxiv.org/abs/2502.13595)), so check [embeddings](#embeddings) on your languages before trusting an English leaderboard. Translating the input into English first can help: in tests on five tasks, having the model translate its own non-English input ("self-translate") consistently beat answering directly ([Etxaniz et al., “Do Multilingual Language Models Think Better in English?” (2023)](https://arxiv.org/abs/2308.01223)), so compare a translation pipeline against native generation when you [choose a model](#choosing-a-model).

## Planned visuals

- `chart`: tokens needed for the same sentence across a dozen languages and several tokenizers, from the measurements in Petrov et al. (2023), on a log axis, showing the token premium per language.
- `chart`: the curse of multilinguality, XNLI accuracy against the number of pretraining languages at fixed and increased model size, from Conneau et al. (2019).
- `tree`: choosing and testing a model for a non-English product: language coverage and token cost, language-confusion checks, natively written evals per language, safety tests in each language, and translation pipeline versus native generation.

## Talk like an expert

Experts say **high- and low-resource languages**, **token premium** or **fertility**, **cross-lingual transfer**, **curse of multilinguality**, **language confusion** and **culturally sensitive subset**, and they report results per language rather than one multilingual average.

## Go deeper

- Conneau et al., [“Unsupervised Cross-lingual Representation Learning at Scale”](https://arxiv.org/abs/1911.02116) (2019).
- Petrov et al., [“Language Model Tokenizers Introduce Unfairness Between Languages”](https://arxiv.org/abs/2305.15425) (2023).
- Singh et al., [“Global MMLU: Understanding and Addressing Cultural and Linguistic Biases in Multilingual Evaluation”](https://arxiv.org/abs/2412.03304) (2024).
- Üstün et al., [“Aya Model: An Instruction Finetuned Open-Access Multilingual Language Model”](https://arxiv.org/abs/2402.07827) (2024).

## Related

- [Tokenization](#tokenization)
- [Choosing a model](#choosing-a-model)
- [Embeddings](#embeddings)
- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Pretraining data](#pretraining-data)
