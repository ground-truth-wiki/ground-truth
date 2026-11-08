---
id: ir-foundations
book: 6
order: "6.0"
title: Information retrieval foundations
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [information-retrieval, inverted-index, tf-idf, bm25, search-engines]
visuals:
  - ir-foundations-index-stepper:stepper
  - ir-foundations-saturation:chart
  - ir-foundations-bm25-calculator:calculator
  - ir-foundations-engine:diagram
prerequisites: [linear-algebra, probability-information]
---
> [!tldr]
> Information retrieval finds documents that satisfy an information need. A search engine analyzes text into terms, indexes which documents contain each term, and ranks matches with functions such as BM25, which reward rare terms, saturate repeats and correct for length. Dense retrieval, hybrid search and RAG build on these ideas.

## Why it matters
Every RAG system is a retrieval system first. When it misses the answer, the cause often has a classic name: query and document use different words, one side was stemmed and the other not, a common term drowned out a rare one, or a long document won on volume. BM25 is a strong baseline: on 18 datasets evaluated zero-shot, “BM25 is a robust baseline” ([Thakur et al., “BEIR: A Heterogenous Benchmark for Zero-shot Evaluation of Information Retrieval Models” (2021)](https://arxiv.org/abs/2104.08663)).

## Intuition
A search engine works like the index at the back of a textbook: look up a term, jump to where it appears, never reread the book. Then it ranks the matches.

The user has an **information need**, and the query is a lossy translation of it: a document is relevant if it addresses the need, “not because it just happens to contain all the words in the query” ([Manning et al., *Introduction to Information Retrieval*](https://nlp.stanford.edu/IR-book/html/htmledition/information-retrieval-system-evaluation-1.html), IIR below). **Relevance** is not **marginal relevance**: a duplicate of a page already read is just as relevant but adds nothing new ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/critiques-and-justifications-of-the-concept-of-relevance-1.html)). One concept also travels under many words, which costs recall: **vocabulary mismatch**. Query expansion attacks it from the query side ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/relevance-feedback-and-query-expansion-1.html)), and dense embeddings can place “bad guy” close to “villain” ([Karpukhin et al., 2020](https://arxiv.org/abs/2004.04906)).

```viz
{"id":"ir-foundations-index-stepper","component":"stepper","title":"An inverted index answers a query by looking up terms, never by scanning documents","caption":"Illustrative three-document collection with a simple analyzer: lowercase, split on non-letters, drop seven stop words, stem. Positions count every original token, so dropped words leave gaps.","alt":"Stepper: three short help-center documents are analyzed into stemmed terms with positions, inverted into a dictionary with document frequencies and postings lists, and used to answer a stemmed query, a Boolean AND query, a phrase query, and a query whose words appear in no document.","data":"illustrative","try":"Step to the phrase query and check why document 3 fails.","frames":[
{"label":"Documents","caption":"Three short help-center documents, each with an id.","code":"1  How to request a refund for a credit card payment\n2  Your card was charged twice? Request a refund.\n3  Credit limits and card fees"},
{"label":"Analyze","caption":"The analyzer turns document 2 into terms with positions. “Your”, “was” and “a” are stop words; “charged” stems to **charg**, which need not be a word.","tokens":["card@2","charg@4","twice@5","request@6","refund@8"],"code":"Your card was charged twice? Request a refund.\n-> card@2  charg@4  twice@5  request@6  refund@8"},
{"label":"Invert","caption":"Sort the (term, document) pairs and group them: a dictionary of terms, each with its document frequency (df) and a postings list of documents and positions, sorted by document id.","code":"term     df  postings (doc: positions)\ncard      3  1:[9]  2:[2]  3:[4]\ncharg     1  2:[4]\ncredit    2  1:[8]  3:[1]\nfee       1  3:[5]\nlimit     1  3:[2]\npayment   1  1:[10]\nrefund    2  1:[5]  2:[8]\nrequest   2  1:[3]  2:[6]\ntwice     1  2:[5]"},
{"label":"Analyze the query","caption":"The query “Refunds?” goes through the **same** analyzer and becomes refund, which is in the dictionary. A query side without the stemmer would look up “refunds” and find nothing.","tokens":["refund"],"code":"Refunds?  -> refund  -> documents 1, 2"},
{"label":"Boolean AND","caption":"refund AND card: walk both sorted postings lists together and keep shared documents. Start with the shortest list. The answer is a set, not a ranking.","code":"refund  -> 1, 2\ncard    -> 1, 2, 3\nAND     -> 1, 2"},
{"label":"Phrase","caption":"“credit card” needs card exactly one position after credit. Document 1 has credit@8 and card@9; document 3 has credit@1 and card@4, so only document 1 matches.","code":"credit  -> 1:[8]  3:[1]\ncard    -> 1:[9]  2:[2]  3:[4]\nphrase  -> 1 (8 then 9); document 3 fails (1 then 4)"},
{"label":"Mismatch","caption":"“money back” becomes money and back. Neither is in the dictionary, so nothing comes back, although documents 1 and 2 are about exactly that. This is vocabulary mismatch.","code":"money  -> not in the dictionary\nback   -> not in the dictionary\nresult -> no documents"}]}
```

## How it works
**Text analysis.** An analyzer runs character filters, a tokenizer, and token filters that lowercase, drop stop words or add synonyms ([Elastic docs](https://www.elastic.co/docs/manage-data/data-store/text-analysis/anatomy-of-an-analyzer)). Stemming chops suffixes by heuristic; lemmatization returns the dictionary form: “saw” might stem to “s”, but lemmatize to “see” as a verb and “saw” as a noun ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/stemming-and-lemmatization-1.html)). Index and query must share the analyzer, so both “are changed into the same form of tokens” ([Elastic docs](https://www.elastic.co/docs/manage-data/data-store/text-analysis/index-search-analysis)).

**The inverted index.** The dictionary maps each term to its document frequency and a postings list of document ids, sorted so lists merge in one pass, a structure “essentially without rivals” for ad hoc text search ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html)). Positions enable phrase queries ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/positional-indexes-1.html)). **Boolean retrieval**, the starting point, intersects and unions postings into an unordered set ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/processing-boolean-queries-1.html)).

**Vector space and TF-IDF.** Documents and queries become term vectors ranked by cosine similarity ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html); see [linear algebra](#linear-algebra)), each term weighted by frequency and rarity, for N documents of which df_t contain t ([IIR on idf](https://nlp.stanford.edu/IR-book/html/htmledition/inverse-document-frequency-1.html), [on tf-idf](https://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html)):

```math
\mathrm{idf}_t = \log \frac{N}{\mathrm{df}_t}, \qquad \text{tf-idf}_{t,d} = \mathrm{tf}_{t,d} \times \mathrm{idf}_t
```

A term in every document weighs zero.

**The probability ranking principle.** Ranking by decreasing probability of relevance is optimal under 1/0 loss if the probabilities are known exactly; they never are ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/the-10-loss-case-1.html); see [probability](#probability-information)).

**BM25, step by step** ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/okapi-bm25-a-non-binary-model-1.html); [Robertson and Zaragoza, “The Probabilistic Relevance Framework: BM25 and Beyond” (2009)](https://doi.org/10.1561/1500000019)):

1. **IDF:** sum the IDF of the matched query terms.
2. **Saturation:** replace tf with (k1 + 1)·tf / (k1 + tf). Repeats add less and less, never more than k1 + 1 times the IDF; k1 = 0 is binary.
3. **Length:** multiply k1 by B = (1 − b) + b·L_d / L_ave. b = 1 normalizes fully, b = 0 not at all.

```math
\mathrm{BM25}(q,d) = \sum_{t \in q} \mathrm{idf}_t \cdot \frac{(k_1 + 1)\,\mathrm{tf}_{t,d}}{k_1\left((1-b) + b\,\frac{L_d}{L_{ave}}\right) + \mathrm{tf}_{t,d}}
```

The IDF log((N − df + 0.5)/(df + 0.5)) goes negative for terms in over half the documents; IIR suggests a floor of zero, and Lucene adds 1 inside the log ([Lucene docs](https://lucene.apache.org/core/10_0_0/core/org/apache/lucene/search/similarities/BM25Similarity.html)).

```viz
{"id":"ir-foundations-saturation","component":"chart","type":"line","title":"BM25 counts the first occurrence fully, then levels off below k1 + 1; log tf keeps climbing","caption":"Formula view of the term-frequency factor (k1 + 1)·tf / (k1 + tf) for a document of average length, at three values of k1, beside the sublinear 1 + ln(tf) of some TF-IDF variants. Raw tf, as in plain TF-IDF, would be the diagonal and leave the chart just after tf = 4.","alt":"Line chart of the BM25 term-frequency factor against tf from 0 to 20. All curves equal 1 at tf = 1. With k1 = 0.5 the factor reaches 1.46 at tf = 20, with k1 = 1.2 it reaches 2.08, with k1 = 2 it reaches 2.73. The curve 1 + ln(tf) is above 3 by tf = 8 and reaches about 4 at tf = 20.","data":"formula","depicts":"BM25 as given by Manning et al. (2008) and Robertson and Zaragoza (2009)","try":"Compare the step from tf = 1 to 2 with the step from 10 to 20 on the k1 = 1.2 curve.","x":{"label":"Occurrences of the term in the document (tf)"},"y":{"label":"Term-frequency factor","min":0,"max":4.5},"series":[{"name":"BM25, k1 = 0.5","points":[[0,0],[1,1],[2,1.2],[3,1.286],[4,1.333],[5,1.364],[6,1.385],[8,1.412],[10,1.429],[15,1.452],[20,1.463]]},{"name":"BM25, k1 = 1.2","points":[[0,0],[1,1],[2,1.375],[3,1.571],[4,1.692],[5,1.774],[6,1.833],[8,1.913],[10,1.964],[15,2.037],[20,2.075]]},{"name":"BM25, k1 = 2","points":[[0,0],[1,1],[2,1.5],[3,1.8],[4,2],[5,2.143],[6,2.25],[8,2.4],[10,2.5],[15,2.647],[20,2.727]]},{"name":"1 + ln(tf)","points":[[0,0],[1,1],[2,1.693],[3,2.099],[4,2.386],[5,2.609],[6,2.792],[8,3.079],[10,3.303],[15,3.708],[20,3.996]]}]}
```

```viz
{"id":"ir-foundations-bm25-calculator","component":"calculator","title":"One term’s BM25 score: rarity raises it, repeats saturate, extra length taxes it","caption":"Defaults are illustrative: a term in 50 of 1,000 documents, appearing 3 times in a document 20% longer than average. Formula as in Manning et al. (2008), with Lucene’s IDF; the classic IDF is shown for comparison.","alt":"Calculator for the BM25 contribution of one query term from the number of documents, the document frequency, the term frequency, the document length, the average length, k1 and b. It outputs the Lucene IDF, the classic IDF that can go negative, the length factor, the saturated term frequency and the score.","data":"formula","try":"Set df to 600 to watch the classic IDF turn negative, then set tf to 30 to see saturation.","formula":"idf × tf × (k1 + 1) / (tf + k1 × ((1 − b) + b × dl / avgdl))","inputs":{"N":1000,"df":50,"tf":3,"dl":120,"avgdl":100,"k1":1.2,"b":0.75},"input_meta":{"N":{"label":"Documents in the collection (N)","min":1,"step":1},"df":{"label":"Documents containing the term (df)","min":1,"step":1},"tf":{"label":"Occurrences in this document (tf)","min":0,"step":1},"dl":{"label":"Length of this document","unit":"terms","min":1,"step":1},"avgdl":{"label":"Average document length","unit":"terms","min":1,"step":1},"k1":{"label":"k1 (saturation)","min":0,"step":0.1},"b":{"label":"b (length normalization)","min":0,"max":1,"step":0.05}},"outputs":[{"id":"idf","label":"IDF, Lucene form (never negative)","expr":"ln(1 + (N - df + 0.5) / (df + 0.5))","unit":""},{"id":"idf_classic","label":"Classic IDF (negative when df is over N/2)","expr":"ln((N - df + 0.5) / (df + 0.5))","unit":""},{"id":"length_factor","label":"Length factor B","expr":"(1 - b) + b * dl / avgdl","unit":""},{"id":"tf_part","label":"Saturated term frequency (below k1 + 1)","expr":"tf * (k1 + 1) / (tf + k1 * length_factor)","unit":""},{"id":"score","label":"BM25 contribution of this term","expr":"idf * tf_part","unit":"","main":true}],"assumptions":["One query term; a document’s score is the sum over the query terms it contains.","Natural logarithms. The base scales every IDF by the same factor, so it never changes the ranking.","Published versions differ on the constant (k1 + 1) in the numerator; it rescales scores without reordering them (Robertson and Zaragoza, 2009)."],"tests":[{"inputs":{},"expect":{"idf":2.9867814,"idf_classic":2.9350148,"length_factor":1.15,"tf_part":1.5068493,"score":4.5006296},"tol":0.00001},{"inputs":{"df":600},"expect":{"idf":0.5109921,"idf_classic":-0.4050489,"score":0.7699882},"tol":0.00001},{"inputs":{"dl":100,"tf":1},"expect":{"length_factor":1,"tf_part":1,"score":2.9867814},"tol":0.00001}]}
```

**BM25F.** A match in the title can be stronger evidence than one in the body. BM25F sums each term’s weighted frequencies across fields before saturating, instead of adding per-field scores ([Robertson and Zaragoza](https://doi.org/10.1561/1500000019)); Elasticsearch’s `combined_fields` query is based on it ([Elastic docs](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-combined-fields-query)).

**Query likelihood.** The language-modeling approach ranks by the probability that a [language model](#language-modeling) of the document generates the query. Smoothing with the collection model, λ·P(t | M_d) + (1 − λ)·P(t | M_c), avoids zeros and does part of the term weighting ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/estimating-the-query-generation-probability-1.html)).

**Feedback and expansion.** Rocchio moves the query vector toward the centroid of documents marked relevant and away from the centroid of those marked nonrelevant ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/the-rocchio71-algorithm-1.html)). Pseudo-relevance feedback treats the top results as relevant and expands from them ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/pseudo-relevance-feedback-1.html)). doc2query expands documents instead, appending queries a model predicts they answer ([Nogueira et al., “Document Expansion by Query Prediction” (2019)](https://arxiv.org/abs/1904.08375)).

**End to end.**

```viz
{"id":"ir-foundations-engine","component":"diagram","title":"A search engine builds its index offline and answers every query online through the same analyzer","caption":"The classic pipeline, after Manning, Raghavan and Schütze. Click a stage for the chapter that covers its job in RAG. Dashed arrows are lookups into data built offline.","alt":"Diagram with two rows. Offline: crawl, parse, analyze and index, plus a PageRank score computed from the link graph. Online: the user's query is analyzed with the same analyzer, matched against postings, ranked with BM25 and other signals including PageRank, and served as a results page.","data":"illustrative","w":600,"h":222,"groups":[{"label":"Offline: build the index","x":0,"y":0,"w":600,"h":92},{"label":"Online: answer a query","x":0,"y":126,"w":600,"h":96}],"nodes":[
{"id":"crawl","label":"Crawl","sub":"fetch pages","role":"external","x":8,"y":28,"w":104,"h":52},
{"id":"parse","label":"Parse","sub":"text, links","x":128,"y":28,"w":104,"h":52,"link":"#ingestion-parsing"},
{"id":"analyze","label":"Analyze","sub":"tokens to terms","x":248,"y":28,"w":104,"h":52},
{"id":"index","label":"Index","sub":"postings, df","role":"data","x":368,"y":28,"w":104,"h":52,"link":"#vector-databases"},
{"id":"pagerank","label":"PageRank","sub":"link authority","role":"data","x":488,"y":28,"w":104,"h":52},
{"id":"query","label":"Query","sub":"user's words","role":"human","x":8,"y":158,"w":104,"h":52},
{"id":"qanalyze","label":"Analyze","sub":"same analyzer","x":128,"y":158,"w":104,"h":52,"link":"#query-understanding"},
{"id":"retrieve","label":"Retrieve","sub":"walk postings","x":248,"y":158,"w":104,"h":52,"link":"#hybrid-retrieval"},
{"id":"rank","label":"Rank","sub":"BM25, signals","x":368,"y":158,"w":104,"h":52,"link":"#reranking"},
{"id":"serve","label":"Serve","sub":"results page","x":488,"y":158,"w":104,"h":52,"link":"#rag-fundamentals"}],
"edges":[{"from":"crawl","to":"parse"},{"from":"parse","to":"analyze"},{"from":"analyze","to":"index"},{"from":"query","to":"qanalyze"},{"from":"qanalyze","to":"retrieve"},{"from":"retrieve","to":"rank"},{"from":"rank","to":"serve"},{"from":"index","to":"retrieve","style":"dashed"},{"from":"pagerank","to":"rank","style":"dashed"}]}
```

IIR covers each stage ([system](https://nlp.stanford.edu/IR-book/html/htmledition/putting-it-all-together-1.html), [crawling](https://nlp.stanford.edu/IR-book/html/htmledition/web-crawling-and-indexes-1.html)). [Apache Lucene](https://lucene.apache.org/core/) is an open-source search library written in Java; Elasticsearch is built on it ([Elastic docs](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search)), and OpenSearch defaults to Lucene’s BM25 ([OpenSearch docs](https://docs.opensearch.org/latest/search-plugins/keyword-search/)). Web engines add query-independent signals such as PageRank: the share of time a random surfer, following links and sometimes teleporting, spends on a page ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/pagerank-1.html)).

**Where each idea reappears.**

| Classic idea | Reappears as |
|---|---|
| Vector space model | Dense retrieval: [embeddings](#embeddings), [vector search](#vector-search) |
| IDF, saturation, postings | Learned sparse retrieval with “a log-saturation effect on term weights” ([Formal et al., “SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking” (2021)](https://arxiv.org/abs/2107.05720)) |
| Lexical plus other evidence | [Hybrid retrieval](#hybrid-retrieval) |
| Pseudo-relevance feedback | LLM query expansion ([Jagerman et al., “Query Expansion by Prompting Large Language Models” (2023)](https://arxiv.org/abs/2305.03653)), HyDE ([query understanding](#query-understanding)) |
| Probability ranking | [Reranking](#reranking) |
| Relevance judgments | [Evaluating RAG](#rag-evaluation) |

## In practice
BM25 from scratch, in plain Python:

```python
import math
import re
from collections import Counter, defaultdict

STOP = {"a", "and", "for", "how", "to", "was", "your"}

def analyze(text):
    # Run the same function on documents and queries. A real analyzer also stems.
    return [t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in STOP]

def build_index(docs):
    postings = defaultdict(dict)  # term -> {doc_id: term frequency}
    lengths = {}
    for doc_id, text in docs.items():
        terms = analyze(text)
        lengths[doc_id] = len(terms)
        for term, tf in Counter(terms).items():
            postings[term][doc_id] = tf
    return postings, lengths

def bm25(query, postings, lengths, k1=1.2, b=0.75):
    n = len(lengths)
    avgdl = sum(lengths.values()) / n
    scores = Counter()
    for term in analyze(query):
        docs = postings.get(term, {})
        idf = math.log(1 + (n - len(docs) + 0.5) / (len(docs) + 0.5))
        for doc_id, tf in docs.items():
            norm = k1 * (1 - b + b * lengths[doc_id] / avgdl)
            scores[doc_id] += idf * tf * (k1 + 1) / (tf + norm)
    return scores.most_common()

docs = {
    1: "How to request a refund for a credit card payment",
    2: "Your card was charged twice? Request a refund.",
    3: "Credit limits and card fees",
}
postings, lengths = build_index(docs)
print(bm25("credit card refund", postings, lengths))
# [(1, 1.043...), (3, 0.640...), (2, 0.586...)]: the short document 3 beats document 2
```

In Elasticsearch, a field’s `analyzer` serves indexing and search unless `search_analyzer` overrides it ([Elastic docs](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/analyzer)). The similarity block restates the defaults; tuned values go there ([Elastic docs](https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity)):

```json
{
  "settings": {
    "index": {
      "similarity": { "tuned_bm25": { "type": "BM25", "k1": 1.2, "b": 0.75 } }
    },
    "analysis": {
      "analyzer": {
        "english_text": { "tokenizer": "standard", "filter": ["lowercase", "stop", "english_stemmer"] }
      },
      "filter": { "english_stemmer": { "type": "stemmer", "language": "english" } }
    }
  },
  "mappings": {
    "properties": {
      "body": { "type": "text", "analyzer": "english_text", "similarity": "tuned_bm25" }
    }
  }
}
```

- **Tune k1 and b only on judged queries** you will not report results on ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/information-retrieval-system-evaluation-1.html)).
- **Keep a BM25 run in every retrieval evaluation.**

## Numbers to know
> [!number]
> Facts and rules of thumb. [Elasticsearch](https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity) and [OpenSearch](https://docs.opensearch.org/latest/search-plugins/keyword-search/) default to k1 = 1.2 and b = 0.75 (as of November 2026), as does [Lucene 10.0’s BM25Similarity](https://lucene.apache.org/core/10_0_0/core/org/apache/lucene/search/similarities/BM25Similarity.html). Untuned, [IIR](https://nlp.stanford.edu/IR-book/html/htmledition/okapi-bm25-a-non-binary-model-1.html) suggests k1 of 1.2 to 2 and b = 0.75; [Robertson and Zaragoza](https://doi.org/10.1561/1500000019) find 0.5 < b < 0.8 and 1.2 < k1 < 2 reasonable. Rocchio: α = 1, β = 0.75, γ = 0.15 ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/the-rocchio71-algorithm-1.html)). PageRank teleport probability: about 0.1 ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/pagerank-1.html)). For a test collection, 50 information needs is the usual minimum ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/information-retrieval-system-evaluation-1.html)).

## Pitfalls and anti-patterns
> [!pitfall] Different analyzers at index and query time
> Stem documents but not queries, and “refunds” finds nothing. Use one analyzer per field on both sides; a separate search analyzer suits special cases such as prefix matching ([Elastic docs](https://www.elastic.co/docs/manage-data/data-store/text-analysis/index-search-analysis)).

- **Over-stemming.** Porter maps operate, operating and operational to “oper”, so queries such as “operating system” lose precision ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/stemming-and-lemmatization-1.html)).
- **Stop words in phrases.** Dropping “to” breaks “flights to London” ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/dropping-common-terms-stop-words-1.html)).
- **Raw scores as confidence.** OpenSearch’s 3.0 switch to Lucene’s native BM25 cut scores about 2.2 times without changing rankings ([OpenSearch docs](https://docs.opensearch.org/latest/search-plugins/keyword-search/)); never threshold across indexes or versions.
- **Query drift.** Pseudo-relevance feedback on “copper mines” whose top hits are about Chile drifts toward Chile ([IIR](https://nlp.stanford.edu/IR-book/html/htmledition/pseudo-relevance-feedback-1.html)).

## Talk like an expert
The vocabulary: **information need**, **analyzer**, **postings**, **IDF**, **saturation**, **BM25F**, **query likelihood**, **pseudo-relevance feedback**, **first-stage retrieval**. Experts ask “what does BM25 get?” before trusting a new retriever. The live debate: how much lexical retrieval adds once neural retrievers are trained for the domain.

> [!hottake] BM25 is the baseline every retriever must beat, and many fail outside their training domain.
> **The counterargument:** trained for the task, dense retrieval wins clearly: DPR beat a strong Lucene-BM25 system by 9 to 19 points of top-20 passage accuracy on four of five open-domain QA datasets ([Karpukhin et al., “Dense Passage Retrieval for Open-Domain Question Answering” (2020)](https://arxiv.org/abs/2004.04906)). On the fifth, SQuAD, BM25 won; the authors point to high lexical overlap between its questions and passages.

## Check yourself
```quiz
ir-foundations
```

## Go deeper
- Manning, Raghavan and Schütze, [*Introduction to Information Retrieval*](https://nlp.stanford.edu/IR-book/) (2008).
- Robertson and Zaragoza, [“The Probabilistic Relevance Framework: BM25 and Beyond” (2009)](https://doi.org/10.1561/1500000019).
- Zobel and Moffat, [“Inverted Files for Text Search Engines” (2006)](https://doi.org/10.1145/1132956.1132959), on storing, building and querying inverted indexes.

## Related
- [RAG fundamentals](#rag-fundamentals)
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Query understanding](#query-understanding)
- [Evaluating RAG](#rag-evaluation)
- [Retrieval benchmarks and test collections](#retrieval-test-collections)
- [Learning to rank](#learning-to-rank)
