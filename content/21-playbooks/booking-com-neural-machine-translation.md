---
id: booking-com-neural-machine-translation
book: 21
order: "21.51"
title: Booking.com's in-house neural machine translation, from one domain to many
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [machine-translation, domain-adaptation, human-evaluation, e-commerce, public-record]
visuals: []
type: playbook
account: public-record
industry: "Travel and e-commerce (online accommodation booking)"
use_case: "Translating travel content, such as property descriptions, user reviews and messages, with in-house neural machine translation models"
outcome: "2017: async SGD on 8 GPUs cut average time per epoch from 6h11m to 56 minutes; 2021: per language pair, one tagged multi-domain model scored a higher average human adequacy than per-domain top10 models for Arabic and German, and a lower one for Russian"
measured_how: "Average time per epoch of the English-German model on 1, 2, 4, 6 and 8 GPUs (Levin et al., September 2017); 4-point human adequacy on 250 samples per language per domain for 3 language pairs and 3 domains, plus sacreBLEU (Stergiadis et al., MT Summit XVIII, August 2021)"
prerequisites: [nlp-tasks, text-generation-metrics]
replications: []
---
> [!tldr]
> Two Booking.com papers describe its in-house neural machine translation (NMT) for travel content. In 2017, training on 8 GPUs cut average time per epoch "from 6h11m to 1h23m for sync and to only 56 minutes for async", and BLEU did not reflect the corpus size human raters scored best. In 2021, one model fine-tuned on three sub-domains with tags outperformed per-domain models on average, and the ACL Anthology abstract says such models "are now live at Booking.com".

> [!note] From the public record
> Built from Booking.com's own published accounts, "Toward a full-scale neural machine translation in production: the Booking.com use case" (September 2017) and "Multi-Domain Adaptation in Neural Machine Translation Through Multidimensional Tagging" (August 2021), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In 2017 the paper describes Booking.com as "operating in 43 different languages". The team held tens of millions of human-translated travel sentence pairs, but training such a system can be computationally expensive and often leads to "unacceptably long product development iteration cycles". Travel text also contains many entities, such as distances and times.

The 2021 paper names three content types: property descriptions, user reviews and messages, each with distinct linguistic characteristics. Fine-tuning a model per domain and per language "can lead to an unscalable fleet of models to be developed and maintained".

## Why this approach

The 2017 paper says the team's earlier experiments "consistently show the superiority of neural machine translation (NMT) systems over the more traditional statistical ones".

The 2021 baseline, which prior experiments found best, fine-tunes one model per domain on back-translated plus genuine in-domain data ("top10", after Edunov et al., 2018), and "was actually our customer-facing production system at the time for several languages". Multidimensional tagging (MDT) instead fine-tunes one model on all three domains and marks each sentence with tokens for its domain and for whether it is synthetic.

## The approach

The 2017 work, mostly on English-German property descriptions:

1. **Training.** Compare SGD with learning rate decay, Adam, Adagrad and Adadelta, then synchronous and asynchronous SGD on 2, 4, 6 and 8 GPUs (see [Distributed training](#distributed-training)), and corpus sizes of 1M, 2.5M, 5M, 7.5M and 10M sentences.
2. **Tokenization.** Byte-pair encoding plus case features, so that book, Book and BOOK share one token (see [Tokenization](#tokenization)).
3. **Named entities.** Regular expressions swap distances, times and dates for placeholders, restored in target-language format after translation. In-house language specialists help refine the patterns.
4. **Human evaluation.** Two independent professional translators score each sentence for adequacy and fluency. The corpus-size comparison used "200 randomly selected sentences".
5. **Business sensitivity framework (BSF).** Find sentences about a sensitive aspect, such as parking, with word2vec-grown keyword lists. Classify the aspect in source and translation, and flag the sentence when they differ.

The 2021 work covers three language pairs (Arabic-English, German-English and Russian-English) across Reviews, Messaging and Descriptions. Back-translated in-domain text ([synthetic data](#synthetic-data)) is mixed 1:1 with upsampled genuine data, and tagged for MDT.

## The stack

As of September 2017: OpenNMT with LSTM encoder and decoder, attention, joint BPE and case features; single-GPU tests on an NVIDIA Tesla K80. BSF uses word2vec and a bag-of-ngrams linear model.

As of August 2021: transformer-base in OpenNMT-tf v1.25 with 32k BPE vocabularies. Base models took around 5 days on 8 NVIDIA V100 GPUs; fine-tuning took around 16 hours on one GPU for both the baseline and MDT. Scoring used an internal human evaluation tool and sacreBLEU.

## Results, and how they were measured

- **Training speed (2017).** On 8 GPUs, average time per epoch fell "from 6h11m to 1h23m for sync and to only 56 minutes for async". The paper sums up that async "is able to reduce the training time by about 85%".
- **Business-sensitive errors (2017).** On a hold-out set of 500 examples, the parking classifiers averaged precision of 0.97 (English) and 0.96 (German). On the English/German corpus, of English sentences that BSF annotated as free parking, "99.4% also get predicted as “Free parking” in German". Of those BSF annotated as non-free parking (a class that includes ambiguous sentences), 5.1% were predicted as free parking in German.
- **Multi-domain quality (2021).** Professional translators scored 250 samples per language per domain on a 4-point adequacy scale, alongside sacreBLEU. "On average MDT does not only match, but in fact outperforms the strong top10" baseline. Average human scores for MDT against top10 were 3.47 and 3.38 (Arabic), 3.80 and 3.71 (German), and 3.40 and 3.47 (Russian). Without tags, the German model did worse on Reviews and Messaging for human raters and on all three domains for BLEU.
- **Production (2021).** The ACL Anthology abstract says "MDT models are now live at Booking.com", in an engine that "serves millions of translations a day in over 40 different languages".

**Not measured:** neither paper reports a deployment date, production latency, monetary cost, or effect on users or bookings. The 2021 claim that MDT cuts development and maintenance costs "by a factor of N" is argued, not measured. The 2017 paper gives no number for the placeholders' effect and does not say how many BSF flags were real translation errors.

## What failed

- **Entities in plain NMT.** "mistranslated distances constitute one of the most common error types when NMT is applied naively on raw text", even with over 10M sentence pairs. In one example, a 55-minute car ride became a 5-minute one.
- **BLEU and human raters disagreed.** Human raters judged the 10M model best; BLEU did not: "had we only looked at BLEU, we could have easily made the wrong conclusion". In 2021, German MDT beat top10 on Messaging and Descriptions for human raters, but not on BLEU.
- **Hardware and optimizers.** On 2 GPUs, async was about as slow as one GPU, since one GPU only holds the master parameters. Adagrad "performed very poorly on our model".
- **Limits of the 2021 study.** The authors call their evaluation limited: "two dimensions: 3 sub-domains and 2 data sources; three language pairs".

## What the team would do differently

Neither paper says. The 2017 paper concludes that BLEU "alone can be a poor way of tracing MT system improvement". The 2021 paper treats human scoring as "the gold standard" and selects checkpoints by validation loss, "completely ignoring BLEU at model selection".

The wiki's reading: in both papers human raters decided and BLEU sometimes disagreed. Teams with customer-facing text can copy this: a fixed sample scored by professional translators, plus targeted checks for costly errors.

## Disclosure

None.

## Sources

- Pavel Levin, Nishikant Dhanuka, Talaat Khalil, Fedor Kovalev and Maxim Khalilov, Booking.com, [“Toward a full-scale neural machine translation in production: the Booking.com use case”](https://arxiv.org/abs/1709.05820), arXiv:1709.05820, 18 September 2017 (v2 25 September 2017), presented at MT Summit XVI, Commercial MT Users and Translators Track.
- Emmanouil Stergiadis, Satendra Kumar, Fedor Kovalev and Pavel Levin, Booking.com, [“Multi-Domain Adaptation in Neural Machine Translation Through Multidimensional Tagging”](https://aclanthology.org/2021.mtsummit-up.27/), Proceedings of Machine Translation Summit XVIII: Users and Providers Track, Virtual, Association for Machine Translation in the Americas, August 2021, pages 396-420.

## Related

- [About playbooks](#about-playbooks)
- [Reference-based text metrics: from BLEU to COMET](#text-generation-metrics)
- [Multilingual and low-resource language models](#multilingual-models)
- [Distributed training](#distributed-training)
- [Synthetic data](#synthetic-data)
