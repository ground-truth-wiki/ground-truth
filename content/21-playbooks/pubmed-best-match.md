---
id: pubmed-best-match
book: 21
order: "21.93"
title: "PubMed Best Match: learning to rank for biomedical literature search"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [learning-to-rank, search-relevance, biomedical-literature, ab-testing, public-record]
visuals: []
type: playbook
account: public-record
industry: "Biomedical research and public sector (US National Library of Medicine)"
use_case: "Ranking PubMed search results by relevance: BM25 retrieval, then a LambdaMART learning-to-rank model trained on click data from search logs reorders the top 500"
outcome: "NDCG 0.48 versus 0.15 for the previous TF-IDF method offline; CTR@20 of 0.39 for Best Match against 0.36 for TF-IDF and 0.32 for date sort in an A/B test; relevance sort use rose from 7.5% to 12% of all PubMed queries"
measured_how: "NDCG on the held-out 30% of a 46,000-query benchmark built from PubMed click logs; A/B test from 1 March to 8 June 2017 with 25% of relevance-sort queries routed to Best Match; share of all PubMed queries using relevance sort, June 2017 to April 2018 (Fiorini et al., PLOS Biology, August 2018)"
prerequisites: [learning-to-rank, ir-foundations]
replications: []
---
> [!tldr]
> The National Center for Biotechnology Information (NCBI), which runs PubMed, replaced its TF-IDF relevance sort with Best Match: BM25 retrieval, then a LambdaMART learning-to-rank model trained on clicks from search logs. Offline it scored 0.48 against 0.15 in NDCG. In an A/B test it had a higher click-through rate than TF-IDF and date sort at every rank position measured. The paper lists known issues with click-derived labels, including a potential position bias.

> [!note] From the public record
> Built from NCBI's own published account, "Best Match: New relevance search for PubMed" (August 2018), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

PubMed, built by NCBI at the US National Library of Medicine, gives access to "more than 28 million scholarly publications in biomedicine". By default it returned matching articles newest first, and "irrelevant results can be returned at the top due to query ambiguity and complexity." Since "over 80% of the user clicks of search results happened on the first page", useful papers further down were easy to miss. A relevance sort added in 2013 used TF-IDF weighting with an artificial boost for recent articles, but its parameters "are based on manual experiments or analyses."

## Why this approach

The paper cites studies showing that machine learning on large-scale datasets builds "more robust ranking models", and it adopted [learning to rank](#learning-to-rank) (L2R). A two-stage design, "in which the two separate steps, retrieval and reordering, can be optimized independently", gave efficiency and flexibility. The paper calls LambdaMART, its second stage, "a robust and fast approach". The main text does not say whether other learned rankers were compared. No existing dataset met the need and a large one could not be curated by hand, so the team used clicks in search logs as pseudo-relevance labels, "a common industry practice".

## The approach

1. **Retrieval.** PubMed retrieves matching documents and orders them with BM25 (see [Lexical and hybrid retrieval](#hybrid-retrieval)), a layer "very similar to the previous relevance system" from 2013.
2. **Reranking.** "the top 500 results are then re-ranked by LambdaMART", a model trained offline.
3. **Labels.** A benchmark of 46,000 unique queries with click-derived labels, split at random: 70% for training, 30% held out for testing.
4. **Features.** Document features (such as publication year, publication type and past usage), query-document features (such as the BM25 score, term matches in fields such as the title, and 19 text-proximity features) and query features (such as query length). In ablation, document and query-document features were the most critical, especially publication year, past usage and the BM25 score; query features had "a relatively minor effect".
5. **Rollout.** An A/B test, then production in June 2017. A banner offers Best Match on informational searches under the default "Most Recent" sort, and a toggle lets users switch, with the choice saved for later searches.

## The stack

As of August 2018: an end-to-end pipeline on the open source search platform Solr, with BM25 as the first stage and LambdaMART as the second. The research source code is on GitHub (ncbi-nlp/PubMed-Best-Match). The main text names no LambdaMART library, hardware or retraining schedule.

## Results, and how they were measured

- **Offline.** On the held-out 30%, the ranker could "obtain more than 3-fold increases in ranking quality" over the previous TF-IDF method, "(0.48 versus 0.15 in NDCG scores)".
- **A/B test.** Of queries where users chose relevance sort, "we routed 25% of them to the newly proposed Best Match algorithm"; the rest stayed on TF-IDF. From 1 March to 8 June 2017 it covered 133,822,362 searches by date, 7,527,507 routed to TF-IDF and 2,509,169 routed to Best Match. CTR is "the fraction of queries with at least one user click on the top-ranked results" (see [Online controlled experiments for AI features](#online-experiments)).
- **Click-through.** In Table 1, CTR@20 was 0.32 for date sort, 0.36 for TF-IDF and 0.39 for Best Match. "All improvements in CTRs by Best Match are statistically significant with 99% confidence (paired t test)." The paper reports "40% improvement for CTR@3 versus 22% for CTR@20 in comparison with date sort results" and gives no relative figure against TF-IDF.
- **Usage.** "From June 2017 to April 2018, the overall usage of relevance search has increased from 7.5% to 12% (a 60% increase) of all PubMed queries."
- **Scale.** Against a real-world requirement of approximately 200 queries per second, the paper says that at maximum the system can process "approximately 700 queries per second at an average of approximately 70 ms per query", with 100 threads running in parallel (see [Latency and throughput](#latency-throughput)).

**Not measured:** the paper reports no cost, no human relevance judgments (offline quality rests on click-derived labels only) and no measure of satisfaction beyond clicks.

## What failed

The paper reports no failures. It lists "several known issues" with its click-based labels, and one gap between offline and online results:

- **Sparse labels.** In 2016, of about 150,000 queries a month run under Best Match, "only hundreds of them met the threshold to build a gold standard".
- **Missed and false labels.** Users "often do not explore the entire set of search results", so relevant documents may be missed, and a clicked article "could still be irrelevant to the user information need".
- **Potential position bias.** "we do not account for the position in which clicked documents were ranked". The team was experimenting with ways to account for this when creating training data.
- **Offline versus online.** "algorithmic improvements in NDCG scores can translate into more modest real-world improvements in CTR scores". The team believes this is because search quality is "just one of the factors affecting CTRs".

## What the team would do differently

The paper states no regrets. Its next steps are to collect "several thousands of recurrent queries every few months to better train the ranker over time" and to account for click position in training data. On deep-learning rankers it says "more work is warranted with regards to retrieval quality, robustness, and scalability". It calls Best Match "more appropriate" for informational searches than for known-item ones.

The wiki's reading: the two-stage design let NCBI keep its existing first stage and change only the reranker. The gap between the NDCG gain and the CTR gain is a reason to test a ranker online, not only on click-derived labels; see [Retrieval benchmarks and test collections](#retrieval-test-collections). The rise in relevance-sort usage came while the banner and toggle were also being introduced, and the paper does not split the rise between the ranker and these interface changes.

## Disclosure

None.

## Sources

- Nicolas Fiorini, Kathi Canese, Grisha Starchenko, Evgeny Kireev, Won Kim, Vadim Miller, Maxim Osipov, Michael Kholodov, Rafis Ismagilov, Sunil Mohan, James Ostell and Zhiyong Lu, National Center for Biotechnology Information (NCBI), National Library of Medicine, NIH, [“Best Match: New relevance search for PubMed”](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.2005343), PLOS Biology 16(8): e2005343, 28 August 2018, doi:10.1371/journal.pbio.2005343.
- The same article on PubMed Central, [“Best Match: New relevance search for PubMed”](https://pmc.ncbi.nlm.nih.gov/articles/PMC6112631/) (PMC6112631), used for the values of Table 1, which the journal page shows only as an image.

## Related

- [About playbooks](#about-playbooks)
- [Learning to rank](#learning-to-rank)
- [Reranking](#reranking)
- [Online controlled experiments for AI features](#online-experiments)
- [Retrieval benchmarks and test collections](#retrieval-test-collections)
