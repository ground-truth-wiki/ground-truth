---
id: rag-evaluation
book: 6
order: "6.14"
title: Evaluating RAG
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [rag-evals, ndcg, faithfulness]
visuals:
  - ndcg-explorer:explorer
  - rag-metric-map:diagram
  - faithfulness-compare:compare
---
> [!tldr]
> Evaluate retrieval and generation separately. Retrieval metrics ask whether the right passages came back and how high; generation metrics ask whether the answer is faithful to them and actually answers the question. Build a labeled set, measure both, and slice the results.

## Why it matters
“The RAG system gives bad answers” has two very different causes with different fixes: the right passage was not retrieved, or it was retrieved and the model ignored or distorted it. A single end-to-end score cannot tell them apart. Separate metrics turn every regression into a diagnosis.

## Intuition
When a student fails an open-book exam, you check two things: did they find the right pages, and did they read them correctly? Retrieval metrics grade the first, generation metrics the second.

```viz
{"id":"ndcg-explorer","component":"explorer","model":"ndcg","title":"Moving a relevant result from rank 3 to rank 1 leaves recall unchanged but raises nDCG and MRR","caption":"Toggle which results are relevant and change k. Precision and recall ignore order; MRR rewards the first hit; nDCG rewards every relevant result, more the higher it ranks.","alt":"Explorer with six ranked results whose relevance can be toggled, showing precision, recall, MRR and nDCG at k.","data":"formula","try":"Make only result 6 relevant, then only result 1: recall@6 is identical, nDCG is not."}
```

## How it works
**Retrieval metrics** need labels: for each question, which passages are relevant.
- **Recall@k:** the share of relevant passages in the top k. The ceiling on answer quality.
- **Precision@k:** the share of the top k that is relevant. Matters when the context budget is tight.
- **Hit rate:** whether at least one relevant passage is in the top k.
- **MRR** (mean reciprocal rank): the average of 1 ÷ rank of the first relevant result; good when one passage is enough.
- **nDCG** (normalized discounted cumulative gain): sums the relevance of each result, discounted by the logarithm of its rank, divided by the best possible score:

```math
\mathrm{DCG@k} = \sum_{i=1}^{k} \frac{\mathrm{rel}_i}{\log_2(i+1)} \qquad \mathrm{nDCG@k} = \frac{\mathrm{DCG@k}}{\mathrm{IDCG@k}}
```

**Generation metrics** compare the answer with the question, the retrieved context and sometimes a reference:
- **Faithfulness:** are all claims supported by the retrieved context? See [grounding](#grounding-citations).
- **Answer relevance:** does it address the question asked?
- **Context precision and recall:** did the retrieved context contain what a correct answer needs, and little else? These need a reference answer.
- **Correctness:** does it match a reference answer, where you have one?

```viz
{"id":"rag-metric-map","component":"diagram","title":"Each metric compares two things, and the pair tells you which stage it grades","caption":"Arrows connect the inputs each metric compares. Retrieval metrics need relevance labels; faithfulness needs only the context and the answer, so it can run on live traffic.","alt":"Diagram connecting question, retrieved context, answer and reference labels by the RAG metrics that compare them.","data":"illustrative","w":600,"h":250,"nodes":[
{"id":"q","label":"Question","role":"human","x":0,"y":0,"w":160,"h":52},
{"id":"ctx","label":"Retrieved context","role":"data","x":440,"y":0,"w":160,"h":52},
{"id":"ans","label":"Answer","role":"model","x":440,"y":196,"w":160,"h":52},
{"id":"ref","label":"Labels and reference","role":"human","x":0,"y":196,"w":160,"h":52,"link":"#eval-datasets"}],
"edges":[{"from":"q","to":"ctx","label":"recall@k, nDCG (with labels)"},{"from":"ctx","to":"ans","label":"faithfulness"},{"from":"q","to":"ans","label":"answer relevance"},{"from":"ref","to":"ans","label":"correctness"},{"from":"ref","to":"ctx","label":"context recall","curve":-30}]}
```

**Tooling.** RAGAS (Es et al., 2023) popularized LLM-scored faithfulness, relevance and context metrics; DeepEval, TruLens-style feedback functions and eval platforms provide similar scorers. Treat every LLM-scored metric as a judge that needs calibration against human labels. See [LLM-as-judge](#llm-as-judge).

**Synthetic test sets.** Generate questions from your documents with a model, then filter and review them by hand. They bootstrap an eval quickly but skew toward questions phrased like the documents; mix in real user questions as soon as you have them. See [eval datasets](#eval-datasets).

## In practice
```viz
{"id":"faithfulness-compare","component":"compare","title":"A fluent answer can be unfaithful in one clause, and that clause is what the metric must catch","caption":"Illustrative context and answer. Hover the marks: one claim is supported, one is not, so faithfulness is 50%.","alt":"Comparison of retrieved context and a generated answer, highlighting a supported and an unsupported claim.","data":"illustrative","mono":false,"a":{"title":"Retrieved context","text":"Refunds are available within 30 days of purchase for annual plans. Monthly plans can be cancelled at any time but are not refunded.","mono":false},"b":{"title":"Generated answer","text":"You can get a refund within 30 days on an annual plan. Monthly plans are refunded for the unused days.","mono":false},"links":[{"a":"Refunds are available within 30 days of purchase for annual plans.","b":"You can get a refund within 30 days on an annual plan.","note":"Supported: the claim follows from the context."},{"a":"are not refunded","b":"Monthly plans are refunded for the unused days.","note":"Contradicted: the answer invents a pro-rata refund. One of two claims is supported, so faithfulness is 0.5."}]}
```

A practical evaluation plan:
1. **Label 50 to 200 real questions** with their relevant passages and, for some, reference answers.
2. **Measure retrieval** (recall@k and nDCG@k at your k) for every retrieval change.
3. **Measure generation** (faithfulness and answer relevance with a calibrated judge) for every prompt or model change.
4. **Slice** by question type, document type and difficulty; averages hide regressions.
5. **Run faithfulness on a sample of production traffic**; it needs no labels.

## Numbers to know
> [!number]
> Formulas and rules of thumb. nDCG uses a log₂ discount: rank 1 counts fully, rank 3 counts half. Fifty labeled questions detect large retrieval changes; a few hundred detect small ones. See [statistics for evals](#eval-statistics).

## Pitfalls and anti-patterns
> [!pitfall] One end-to-end score
> A single “answer quality” number cannot tell a retrieval miss from a generation error, so every regression becomes a guessing game.

- **Uncalibrated LLM metrics.** Faithfulness judges have error rates; measure them.
- **Only synthetic questions.** They flatter retrieval because they reuse the documents’ wording.
- **Ignoring k.** Recall@5 and recall@50 answer different questions; report the k your generator actually sees.

## Talk like an expert
The vocabulary: **recall@k**, **precision@k**, **hit rate**, **MRR**, **nDCG**, **faithfulness**, **answer relevance**, **context precision and recall**, **synthetic test set**. Experts report recall@k first and ask about it whenever answer quality drops. The live debate is how much LLM-scored metrics can replace human labels; most teams calibrate them on a labeled sample and use them at scale.

> [!hottake] Recall@k is the only retrieval metric most teams need.
> **The counterargument:** when the context budget is small or many passages compete, order matters, and rank-aware metrics such as nDCG catch regressions recall hides.

## Check yourself
```quiz
rag-evaluation
```

## Go deeper
- Es et al., “RAGAS: Automated Evaluation of Retrieval Augmented Generation” (2023).
- Järvelin and Kekäläinen, “Cumulated Gain-Based Evaluation of IR Techniques” (2002), the origin of nDCG.

## Related
- [RAG fundamentals](#rag-fundamentals)
- [Metrics and graders](#metrics-graders)
- [Building eval datasets](#eval-datasets)
- [LLM-as-judge done right](#llm-as-judge)
- [Grounding and citations](#grounding-citations)
- [Graph RAG methods](#graph-rag)
- [Hallucination and factuality](#hallucination-factuality)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Retrieval benchmarks and test collections](#retrieval-test-collections)
