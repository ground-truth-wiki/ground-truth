---
id: text-generation-metrics
book: 14
order: "14.4.1"
title: "Reference-based text metrics: from BLEU to COMET"
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [bleu, rouge, bertscore, comet, text-metrics]
visuals: []
prerequisites: [metrics-graders]
---
> [!tldr]
> Reference-based metrics score an output by comparing it with human-written references: by exact match, by overlapping words or characters, by embedding similarity, or with a model trained on human ratings. They are cheap and reproducible, and still defensible where outputs are constrained, as in translation (next to a learned metric), extractive question answering and speech recognition, but they reward resembling the reference, not being right. Remember: a metric is only as good as its measured agreement with human judgments, and a difference between two scores means little without a significance test.

## Key ideas

- **Exact checks fit short answers and transcripts.** SQuAD scores extractive answers with exact match and with F1 over the answer's bag of tokens, both ignoring punctuation and the articles a, an and the, and both taking the best score over all reference answers ([Rajpurkar et al., “SQuAD: 100,000+ Questions for Machine Comprehension of Text” (2016)](https://arxiv.org/abs/1606.05250)). Speech recognition uses word error rate, (S + D + I) / N: substituted, deleted and inserted words divided by the number of words in the reference ([Hugging Face Evaluate, WER metric card](https://github.com/huggingface/evaluate/blob/main/metrics/wer/README.md)).
- **BLEU counts clipped n-gram overlap, and its settings change the number.** BLEU multiplies the geometric mean of modified n-gram precisions (up to 4-grams, each n-gram count clipped to its maximum count in any one reference) by a brevity penalty of exp(1 − r/c) when the candidate corpus is not longer than the reference, all computed over the whole corpus rather than averaged per sentence ([Papineni et al., “BLEU: a Method for Automatic Evaluation of Machine Translation” (2002)](https://aclanthology.org/P02-1040/)). Differences between common configurations, mostly in tokenization and reference normalization, moved scores by up to 1.8 points, so two BLEU scores are comparable only when they were computed the same way, and SacreBLEU prints a signature such as `BLEU|nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.0.0` with every score so that others know exactly what was done ([Post, “A Call for Clarity in Reporting BLEU Scores” (2018)](https://aclanthology.org/W18-6319/); [SacreBLEU](https://github.com/mjpost/sacrebleu)).
- **ROUGE, METEOR and chrF reward recall and looser matches.** ROUGE-N is n-gram recall against reference summaries and ROUGE-L scores their longest common subsequence ([Lin, “ROUGE: A Package for Automatic Evaluation of Summaries” (2004)](https://aclanthology.org/W04-1013/)), while METEOR matches unigrams by surface form, stem and synonym, weights recall above precision, and scales the result down by a fragmentation penalty that grows with the number of separate matched chunks ([Banerjee and Lavie, “METEOR: An Automatic Metric for MT Evaluation with Improved Correlation with Human Judgments” (2005)](https://aclanthology.org/W05-0909/)). chrF is an F-score over character n-grams that needs no tokenizer ([Popović, “chrF: character n-gram F-score for automatic MT evaluation” (2015)](https://aclanthology.org/W15-3049/)), and chrF++ adds word unigrams and bigrams ([Popović, “chrF++: words helping character n-grams” (2017)](https://aclanthology.org/W17-4770/)).
- **Embedding and learned metrics compare meaning.** BERTScore greedily matches each token to its most similar token in the other sentence by cosine similarity of contextual embeddings, optionally weighted by inverse document frequency, so paraphrases are not punished for lacking exact words ([Zhang et al., “BERTScore: Evaluating Text Generation with BERT” (2019)](https://arxiv.org/abs/1904.09675)). COMET goes further: it reads the source, the translation and the reference with a cross-lingual pretrained encoder and is trained to predict human quality judgments ([Rei et al., “COMET: A Neural Framework for MT Evaluation” (2020)](https://arxiv.org/abs/2009.09025)).
- **Metrics are themselves evaluated against people, and that decides where they still fit.** The WMT metrics shared task ranks metrics by how well they correlate with human ratings at the system and segment level; with expert MQM ratings in 2022, the organizers found that BLEU, spBLEU and chrF correlate poorly with humans and that neural metrics are better and more robust across domains ([Freitag et al., “Results of WMT22 Metrics Shared Task: Stop Using BLEU – Neural Metrics Are Better and More Robust” (2022)](https://aclanthology.org/2022.wmt-1.2/)). Overlap metrics remain defensible where outputs are constrained (translation with learned metrics beside them, extractive QA, WER for transcripts), but reference-based metrics like BLEU and ROUGE have relatively low correlation with human judgments, especially on tasks that need creativity and diversity, which is why G-Eval uses an LLM as the judge instead, tested on summarization and dialogue generation ([Liu et al., “G-Eval: NLG Evaluation using GPT-4 with Better Human Alignment” (2023)](https://arxiv.org/abs/2303.16634)); see [LLM-as-judge](#llm-as-judge).
- **A metric difference needs a significance test and enough data.** Paired bootstrap resampling over test sentences gives significance and confidence intervals for BLEU differences ([Koehn, “Statistical Significance Tests for Machine Translation Evaluation” (2004)](https://aclanthology.org/W04-3250/)), and SacreBLEU implements both paired bootstrap and paired approximate randomization ([SacreBLEU](https://github.com/mjpost/sacrebleu)). Even then, a typical 2,000-sentence translation test set has only about 75% power to detect a 1 BLEU point difference ([Card et al., “With Little Power Comes Great Responsibility” (2020)](https://arxiv.org/abs/2010.06595)); see [statistics for evals](#eval-statistics).

## Planned visuals

- **`compare`:** one source sentence with a correct paraphrase and a fluent but wrong translation side by side, with the BLEU, chrF, BERTScore and COMET each would receive, showing that overlap metrics can rank the wrong answer higher (illustrative, scores computed with the named tools).
- **`stepper`:** BLEU computed by hand on a two-sentence corpus: count n-grams, clip them against the reference, take the geometric mean, apply the brevity penalty, then show how a different tokenizer changes the result and the SacreBLEU signature.
- **`tree`:** pick a metric by output type: short extractive answers to exact match and token F1, transcripts to WER, translations to chrF plus a learned metric such as COMET, summaries and open-ended text to an LLM judge, code to execution.

## Talk like an expert

Practitioners say **n-gram precision**, **brevity penalty**, **signature**, **segment-level versus system-level correlation**, **MQM** and **paired bootstrap**, and they never quote a BLEU number without its signature and test set. The standing question is not “what is the score?” but “how well does this metric agree with human judgments on outputs like mine?”

## Go deeper

- [Papineni et al., “BLEU: a Method for Automatic Evaluation of Machine Translation” (2002)](https://aclanthology.org/P02-1040/): the original definition, including clipping and the corpus-level brevity penalty.
- [Post, “A Call for Clarity in Reporting BLEU Scores” (2018)](https://aclanthology.org/W18-6319/): why BLEU scores from different setups are not comparable, and the SacreBLEU fix.
- [Rei et al., “COMET: A Neural Framework for MT Evaluation” (2020)](https://arxiv.org/abs/2009.09025): the learned-metric approach that uses source, hypothesis and reference.
- [Freitag et al., “Results of WMT22 Metrics Shared Task” (2022)](https://aclanthology.org/2022.wmt-1.2/): how metrics are meta-evaluated against expert human ratings.

## Related

- [Metrics and graders](#metrics-graders)
- [LLM-as-judge done right](#llm-as-judge)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Statistics for evals](#eval-statistics)
- [Task-specific recipes](#eval-recipes)
- [Speech recognition models](#speech-recognition)
