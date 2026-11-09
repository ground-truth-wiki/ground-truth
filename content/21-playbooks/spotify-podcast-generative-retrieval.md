---
id: spotify-podcast-generative-retrieval
book: 21
order: "21.80"
title: "Spotify GLIDE: generative retrieval with Semantic IDs for podcast discovery"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [media, recommender-systems, generative-retrieval, semantic-ids, public-record]
visuals: []
type: playbook
account: public-record
industry: "Media (audio streaming and podcasts)"
use_case: "Generating podcast episode candidates that help listeners discover shows outside their listening habits on the Spotify Home surface"
outcome: "Non-habitual streams per user increased by 5.4% and new-show non-habitual streams by 14.3% (α<0.01), with no regressions in overall engagement or user satisfaction"
measured_how: "21-day randomized user-level A/B test against the existing production recommendation system, podcast listeners in English-speaking markets who were active in the 30 days prior, Home surface, approximately 20M impressions per cell (Spotify paper on arXiv, March 2026)"
prerequisites: [recommender-systems]
replications: []
---
> [!tldr]
> Spotify built GLIDE, a recommender in which a compact open-weight LLM generates episode identifiers called Semantic IDs, short token sequences that stand for catalog items. Added as one more candidate source, it raised non-habitual streams per user by 5.4% and new-show non-habitual streams by 14.3% on the Home surface in a 21-day A/B test, within production cost and latency constraints.

> [!note] From the public record
> Built from Spotify's own published account, "Deploying Semantic ID-based Generative Retrieval for Large-Scale Podcast Discovery at Spotify" (March 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper opens: "Podcast listening is often grounded in a set of favorite shows, while listener intent can evolve over time." Models that rely mainly on past interactions "tend to emphasize familiar content". The paper focuses on recommendations that support discovery alongside established listening patterns.

Discovery is defined per user and show. A show is habitual if the user listened to it for 10 minutes or more in the past 28 days. Every other show is non-habitual: unfamiliar (never listened) or familiar (some past listening, no current habit). The goal is a ranked list of episodes from non-habitual shows that the user is likely to listen to next.

## Why this approach

The paper names transformer recommenders such as SASRec or TIGER as a natural baseline (see [Recommender systems](#recommender-systems)). Two production requirements motivated a language-grounded formulation instead: objectives differ between surfaces and usages, and discovery "requires language-level understanding" of topics beyond interaction patterns.

Other design choices, with the reasons the paper gives:

- **Semantic IDs (SIDs), not item text.** Items described by titles often cost more to serve, because prompts get longer.
- **IDs from content, not collaborative signals.** New episodes "must be recommendable immediately", and content-based embeddings stay stable unless episode metadata is revised.
- **A soft prompt, not a text profile.** Long-term interests written as text give a long context. One embedding token carries them instead.
- **A compact open-weight backbone** of up to ~1B parameters, to balance expressiveness with latency and cost efficiency.

## The approach

1. **Turn episodes into SIDs.** A text encoder embeds each episode's title and description. Residual K-Means quantizes the embedding into 4 levels of 256 codes, adding 1024 SID tokens to the vocabulary.
2. **Ground the IDs.** The model learns to translate both ways between SIDs and text descriptors: first only the new token embeddings are trained, then the Transformer blocks are adapted with [LoRA](#peft-methods).
3. **Instruction tuning.** The prompt combines a soft prompt from a production user embedding, lightweight user context, recent listening as SIDs, and a "familiar" or "unfamiliar" control token, so one model serves both goals.
4. **Counter bias in training data** by sampling across surfaces, upweighting streams from exploration placements, and capping examples per episode.
5. **Serve as a candidate source.** Event-triggered requests allow precomputing and caching where appropriate. [Beam search](#decoding-sampling) with 30 beams yields 30 candidates. When episodes share an SID, a daily-updated popularity tie-breaker picks the most popular eligible episode. The existing ranker scores the candidates.

## The stack

As of March 2026, the paper names a Llama 3.2 1B-based backbone, a proprietary text encoder fine-tuned on podcast data following the multilingual BGE-M3 architecture, Residual K-Means (K=256, M=4), LoRA, and user embeddings from an existing production personalization model. Evaluation combines Recall@30, HitRate@30 and NDCG@30, internal human evaluations with Spotify employees and a profile-aware LLM judge. The paper does not name the judge model, the inference engine or the serving hardware.

## Results, and how they were measured

**Online.** Spotify ran "a 21-day randomized user-level online experiment on podcast listeners in English-speaking markets", limited to listeners active in the 30 days before. Control used the existing production recommendation system; treatment added GLIDE candidates to the pool. On the Home surface, each cell covered approximately 20M impressions.

- "non-habitual streams per user increased by 5.4%" (α<0.01).
- "new-show non-habitual streams increased by 14.3%" (α<0.01).
- Guardrails were preserved, "with no regressions in overall engagement or user satisfaction".
- GLIDE candidates accounted for ~34% of recommendations in treatment, which the paper cites to support attributing the lift to them.
- "The system met production cost and latency constraints, remaining within the allocated serving budget for candidate generation."

**Offline** (relative changes, from a 7-day sliding window of streaming logs):

- Against a SID-only baseline, the paper reports for GLIDE "a +29.9% improvement in Recall@30 and a +31.2% improvement in NDCG@30".
- Relative to RQ-VAE, R-KMeans scored +9.52% in HitRate@30.
- The unfamiliar control token gave "a +11.8% relative improvement in Recall@30" on unfamiliar items over a single-task model.
- Grounding gave "a +8.34% relative lift in Recall@5".

**Not measured:** the paper gives no absolute values for the retrieval or online metrics, no user count for the test (the abstract says "millions of users"), no confidence intervals, no latency or cost figures, and no rate of invalid SIDs in production. It reports no online results beyond the 21 days, the Home surface or English-speaking markets.

## What failed

- **Wide-beam decoding hit serving bottlenecks.** In the initial deployment, "CPU-side request orchestration increased latency under load", and accelerators were under-utilized by many small, sequential decoding steps. Scaling orchestration and tuning the serving configuration raised throughput by up to 8× under the same latency objectives, so beam width could grow from 14 to 30.
- **Simpler decoding lost quality.** In an offline ablation, replacing beam search with greedy decoding "results in a 27.07% relative drop in Recall@30". With sampling-based decoding, "generation frequently collapses to low-quality or invalid SIDs".
- **One objective drifted to the familiar.** A single-task model collapsed toward the dominant mode of the data.
- **Offline recall disagreed with the judges once.** In one evaluation round, the LLM judge and human evaluators preferred one variant while recall favored another, which "exhibited stronger popularity bias". See [LLM-as-judge done right](#llm-as-judge).

## What the team would do differently

The paper lists nothing it would redo. Its lesson is about evaluation: "offline retrieval metrics alone are insufficient to capture discovery-oriented success".

The wiki's reading: GLIDE did not replace the recommender. It entered as one candidate source in front of an existing ranker and was judged in an [online controlled experiment](#online-experiments) against the production system. That keeps the change small and reversible.

## Disclosure

None.

## Sources

- Edoardo D'Amico, Marco De Nadai, Praveen Chandar, Divita Vohra, Shawn Lin, Max Lefarov, Paul Gigioli, Gustavo Penha, Ilya Kopysitsky, Ivo Joel Senese, Darren Mei, Francesco Fabbri, Oguz Semerci, Yu Zhao, Vincent Tang, Brian St. Thomas, Alexandra Ranieri, Matthew N.K. Smith, Aaron Bernkopf, Bryan Leung, Ghazal Fazelnia, Mark VanMiddlesworth, Timothy Christopher Heath, Petter Pehrson Skiden, Alice Y. Wang, Doug J. Cole, Andreas Damianou, Maya Hristakeva, Reid Wilbur, Tarun Chillara, Vladan Radosavljevic, Pooja Chitkara, Sainath Adapa, Juan Elenter, Bernd Huber, Jacqueline Wood, Saaketh Vedantam, Jan Stypka, Sandeep Ghael, Martin D. Gould, David Murgatroyd, Yves Raimond, Mounia Lalmas and Paul N. Bennett, Spotify, [“Deploying Semantic ID-based Generative Retrieval for Large-Scale Podcast Discovery at Spotify”](https://arxiv.org/abs/2603.17540), arXiv preprint arXiv:2603.17540v1 (cs.IR), 18 March 2026.

## Related

- [About playbooks](#about-playbooks)
- [Recommender systems](#recommender-systems)
- [Online controlled experiments for AI features](#online-experiments)
- [LLM-as-judge done right](#llm-as-judge)
- [Latency and throughput](#latency-throughput)
