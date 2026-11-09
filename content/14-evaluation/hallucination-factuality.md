---
id: hallucination-factuality
book: 14
order: "14.12"
title: Hallucination and factuality
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [hallucination, factuality, faithfulness, abstention, calibration]
visuals:
  - hallucination-factuality-two-references:diagram
  - hallucination-factuality-abstention-score:calculator
  - hallucination-factuality-claim-pipeline:stepper
  - hallucination-factuality-levers:tree
prerequisites: [why-evals, metrics-graders]
---
> [!tldr]
> A hallucination is a fluent claim without support: false about the world (a factuality error) or unsupported by the supplied source (a faithfulness error). Models guess because training cannot pin down rare facts and most evals give “I don’t know” no more credit than a wrong answer. Count right, wrong and abstained answers, and make a wrong answer cost more than silence.

## Why it matters
Users act on confident wrong answers. Under plain accuracy, guessing never scores worse than abstaining, so a model tuned for accuracy learns to bluff ([Kalai et al., 2025](https://arxiv.org/abs/2509.04664)). The error type picks the fix: distorting a retrieved passage is a generation bug; a wrong rare fact needs retrieval or abstention.

## Intuition
Picture a witness holding a file. Does the testimony match the file, and is it true? The answers split when the witness adds details from memory, or the file is out of date.

```viz
{"id":"hallucination-factuality-two-references","component":"diagram","title":"Faithfulness and factuality check an answer against two different references, and can disagree","caption":"Illustrative refund policy. Switch tabs: an answer can be faithful and false (a stale source) or unfaithful and true (a correct detail the source lacks). Intrinsic and extrinsic follow Maynez et al. (2020).","alt":"Diagram with tabs. An answer is compared with a supplied source (faithfulness) and with the world (factuality). Five cases: faithful and true; intrinsic error, unfaithful and false; extrinsic but true; extrinsic and false; faithful to a stale source but false.","data":"illustrative","try":"Open “Stale source”: the answer is perfectly grounded and still wrong.","w":600,"h":212,"variants":[
{"name":"Faithful and true","note":"The answer restates the source, and the source is right. Both checks pass.","nodes":[{"id":"src","label":"Supplied source","sub":"“Refunds within 30 days”","role":"data","x":0,"y":0,"w":235,"h":60},{"id":"world","label":"The world","sub":"policy today: 30 days","role":"external","x":365,"y":0,"w":235,"h":60},{"id":"ans","label":"Answer","sub":"“Refunds within 30 days”","role":"model","x":150,"y":150,"w":300,"h":60}],"edges":[{"from":"ans","to":"src","label":"supported: faithful"},{"from":"ans","to":"world","label":"true: factual"}]},
{"name":"Intrinsic error","note":"Intrinsic: the answer uses the source’s own terms but misrepresents them. Unfaithful, and here also false.","nodes":[{"id":"src","label":"Supplied source","sub":"“Refunds within 30 days”","role":"data","x":0,"y":0,"w":235,"h":60},{"id":"world","label":"The world","sub":"policy today: 30 days","role":"external","x":365,"y":0,"w":235,"h":60},{"id":"ans","label":"Answer","sub":"“Refunds only after 30 days”","role":"model","x":150,"y":150,"w":300,"h":60}],"edges":[{"from":"ans","to":"src","label":"distorts: unfaithful"},{"from":"ans","to":"world","label":"false: not factual"}]},
{"name":"Extrinsic, true","note":"Extrinsic: the answer adds something the source does not say. It happens to be true, but nothing in the source lets anyone check it.","nodes":[{"id":"src","label":"Supplied source","sub":"“Refunds within 30 days”","role":"data","x":0,"y":0,"w":235,"h":60},{"id":"world","label":"The world","sub":"30 days; start by email","role":"external","x":365,"y":0,"w":235,"h":60},{"id":"ans","label":"Answer","sub":"“30 days; start one by email”","role":"model","x":150,"y":150,"w":300,"h":60}],"edges":[{"from":"ans","to":"src","label":"not in source: unfaithful"},{"from":"ans","to":"world","label":"true: factual"}]},
{"name":"Extrinsic, false","note":"The added detail is invented. In the summaries Maynez et al. studied, over 90% of extrinsic hallucinations were wrong.","nodes":[{"id":"src","label":"Supplied source","sub":"“Refunds within 30 days”","role":"data","x":0,"y":0,"w":235,"h":60},{"id":"world","label":"The world","sub":"policy today: 30 days","role":"external","x":365,"y":0,"w":235,"h":60},{"id":"ans","label":"Answer","sub":"“30 days, minus a 10% fee”","role":"model","x":150,"y":150,"w":300,"h":60}],"edges":[{"from":"ans","to":"src","label":"not in source: unfaithful"},{"from":"ans","to":"world","label":"false: not factual"}]},
{"name":"Stale source","note":"The retrieved document is last year’s policy. The answer is faithful to it and wrong about the world. A faithfulness check alone passes it.","nodes":[{"id":"src","label":"Supplied source","sub":"last year: 30 days","role":"data","x":0,"y":0,"w":235,"h":60},{"id":"world","label":"The world","sub":"policy today: 14 days","role":"external","x":365,"y":0,"w":235,"h":60},{"id":"ans","label":"Answer","sub":"“Refunds within 30 days”","role":"model","x":150,"y":150,"w":300,"h":60}],"edges":[{"from":"ans","to":"src","label":"supported: faithful"},{"from":"ans","to":"world","label":"false: not factual"}]}]}
```

Now give the witness an exam that never penalizes wrong answers. Guessing is smart, and models are trained and graded on such exams.

## How it works
**Terms.** *Hallucination* now covers failures of both faithfulness and factuality; [Farquhar et al., “Detecting hallucinations in large language models using semantic entropy” (2024)](https://doi.org/10.1038/s41586-024-07421-0) call one subset *confabulations*: wrong, arbitrary claims that change with the random seed. *Factuality* is agreement with the world; *faithfulness*, or groundedness, agreement with a supplied source. [Maynez et al., “On Faithfulness and Factuality in Abstractive Summarization” (2020)](https://arxiv.org/abs/2005.00661) split source errors into *intrinsic* (misrepresenting the source) and *extrinsic* (adding what it lacks).

**Why models guess.** A [language model](#language-modeling) learns a distribution over text, not a fact table. Kalai et al. show that its error rate is at least about twice the rate at which it would mislabel statements as valid or invalid if its own probabilities were used as the test. For arbitrary facts such as birthdays, a well-calibrated base model should hallucinate on at least about the share seen exactly once in training. In [Min et al., “FActScore: Fine-grained Atomic Evaluation of Factual Precision in Long Form Text Generation” (2023)](https://arxiv.org/abs/2305.14251), ChatGPT’s score on biographies fell from about 80% for the most frequent people to under 20% for the rarest (their Figure 2). [Post-training](#post-training-overview) then targets benchmarks that, in Kalai et al.’s review, mostly give abstaining no credit.

**Misconceptions.** On [Lin et al., “TruthfulQA: Measuring How Models Mimic Human Falsehoods” (2021)](https://arxiv.org/abs/2109.07958), 817 questions that some humans answer falsely, the best model was truthful on 58% and humans on 94%. The largest models were generally the least truthful, as expected if they learn falsehoods from their training data. Yet larger models were more factual in [Lee et al., “Factuality Enhanced Language Models for Open-Ended Text Generation” (2022)](https://arxiv.org/abs/2206.04624) and in long answers (SAFE, below).

**Short answers and abstention.** SimpleQA ([Wei et al., 2024](https://arxiv.org/abs/2411.04368)) has 4,326 questions with one indisputable answer, graded *correct*, *incorrect* (hedged contradictions included) or *not attempted*. Its F-score, the harmonic mean of overall correct and correct given attempted, still pays a model to guess when it is at least 50% sure. Kalai et al. propose stating a confidence target t in the prompt: +1 for right, 0 for “I don’t know”, −t/(1 − t) for wrong, so answering pays only above confidence t. SimpleQA’s calibration tests found the models overconfident; see [uncertainty estimation](#llm-uncertainty).

```viz
{"id":"hallucination-factuality-abstention-score","component":"calculator","title":"Guessing raises accuracy for free; a stated penalty for wrong answers makes abstaining pay","caption":"Illustrative counts for 100 questions graded like SimpleQA (Wei et al., 2024), scored with the confidence-target rule of Kalai et al. (2025). At t = 0 the score is plain accuracy. The default model abstains on 40 questions.","alt":"Calculator: from counts of correct, incorrect and not-attempted answers and a confidence target t, it computes accuracy, correct given attempted, the SimpleQA F-score, the penalty t/(1 − t) and the penalized score per question.","data":"formula","try":"Set correct to 50, incorrect to 50 and not attempted to 0: the model guessed on its 40 unsure questions and got a quarter right. Accuracy rises, the F-score stays put, the score drops to 0.","inputs":{"correct":40,"incorrect":20,"not_attempted":40,"t":0.5},"input_meta":{"correct":{"label":"Correct answers","min":0,"step":1},"incorrect":{"label":"Incorrect answers","min":0,"step":1},"not_attempted":{"label":"Not attempted (“I don’t know”)","min":0,"step":1},"t":{"label":"Confidence target t","min":0,"max":0.99,"step":0.05}},"outputs":[{"id":"total","label":"Questions","expr":"correct + incorrect + not_attempted","unit":"count"},{"id":"accuracy","label":"Overall correct (accuracy)","expr":"correct / total","unit":"pct"},{"id":"cga","label":"Correct given attempted","expr":"correct / (correct + incorrect)","unit":"pct"},{"id":"fscore","label":"F-score (harmonic mean of the two)","expr":"2 * accuracy * cga / (accuracy + cga)","unit":"pct"},{"id":"penalty","label":"Penalty per wrong answer, t ÷ (1 − t)","expr":"t / (1 - t)","unit":"points"},{"id":"score","label":"Score per question (+1 right, 0 abstain, −penalty wrong)","expr":"(correct - penalty * incorrect) / total","main":true}],"assumptions":["Each answer is graded correct, incorrect or not attempted against one reference.","The target t is stated in the prompt, so the model can aim for it (Kalai et al., 2025).","Answering beats abstaining in expectation only when the chance of being right exceeds t."],"tests":[{"inputs":{},"expect":{"accuracy":0.4,"cga":0.6666667,"fscore":0.5,"penalty":1,"score":0.2},"tol":0.00001},{"inputs":{"correct":50,"incorrect":50,"not_attempted":0},"expect":{"accuracy":0.5,"fscore":0.5,"score":0},"tol":0.00001},{"inputs":{"t":0.9},"expect":{"penalty":9,"score":-1.4},"tol":0.00001},{"inputs":{"t":0},"expect":{"score":0.4},"tol":0.00001}]}
```

**Long answers, claim by claim.** FActScore splits an answer into atomic facts and reports the share a knowledge source supports: precision only, so a model can raise it by saying less. [SAFE (Wei et al., 2024)](https://arxiv.org/abs/2403.18802) checks each fact with search and adds recall (F1@K):

```viz
{"id":"hallucination-factuality-claim-pipeline","component":"stepper","title":"Checking a long answer claim by claim turns one verdict into many, and K sets how much a short answer loses","caption":"Illustrative run of the SAFE pipeline (Wei et al., 2024) on a short answer. Every stage before the score is a model call or a search, so every one of them can err.","alt":"Stepper through claim-level factuality checking: a response is split into facts, each fact is made self-contained, irrelevant facts are set aside, the rest are checked with search, and precision, recall and F1@K are computed.","data":"illustrative","depicts":"SAFE and F1@K, Wei et al. (2024)","diagram":{"w":600,"h":56,"nodes":[{"id":"resp","label":"Response","role":"model","align":"center","glyph":false,"x":0,"y":0,"w":90,"h":56},{"id":"split","label":"Split into\nfacts","role":"model","align":"center","glyph":false,"x":102,"y":0,"w":90,"h":56},{"id":"self","label":"Make self-\ncontained","role":"model","align":"center","glyph":false,"x":204,"y":0,"w":90,"h":56},{"id":"rel","label":"Relevant?","role":"model","align":"center","glyph":false,"x":306,"y":0,"w":90,"h":56},{"id":"rate","label":"Search\nand rate","role":"external","align":"center","glyph":false,"x":408,"y":0,"w":90,"h":56},{"id":"score","label":"Score","role":"data","align":"center","glyph":false,"x":510,"y":0,"w":90,"h":56}],"edges":[{"from":"resp","to":"split"},{"from":"split","to":"self"},{"from":"self","to":"rel"},{"from":"rel","to":"rate"},{"from":"rate","to":"score"}]},
"frames":[
{"label":"Response","highlight":["resp"],"caption":"Prompt: “Tell me about the Eiffel Tower.” The answer mixes true claims, one false claim and an aside.","code":"The Eiffel Tower is in Paris. It was built for the 1889 World's Fair\nand is made of wrought iron. It is 500 meters tall. I would love to visit it."},
{"label":"Split","highlight":["split"],"caption":"A model splits each sentence into individual facts.","code":"1. The Eiffel Tower is in Paris.\n2. It was built for the 1889 World's Fair.\n3. It is made of wrought iron.\n4. It is 500 meters tall.\n5. I would love to visit it."},
{"label":"Self-contained","highlight":["self"],"caption":"Each fact is rewritten to stand alone: pronouns become the entity they refer to, so a search can check it.","code":"2. The Eiffel Tower was built for the 1889 World's Fair.\n3. The Eiffel Tower is made of wrought iron.\n4. The Eiffel Tower is 500 meters tall."},
{"label":"Relevance","highlight":["rel"],"caption":"Facts that do not help answer the prompt are set aside and not scored. Fact 5 is about the writer, not the tower.","code":"5. I would love to visit it.   -> irrelevant, not scored"},
{"label":"Search and rate","highlight":["rate"],"caption":"For each relevant fact, the checker issues search queries step by step and decides whether the results support it. The results support facts 1 to 3; none supports a height of 500 meters.","code":"1 supported   2 supported   3 supported   4 not supported"},
{"label":"Score","highlight":["score"],"caption":"S = 3 supported, N = 1 not supported. Precision is S ÷ (S + N), recall is min(S ÷ K, 1) for a preferred number of facts K, and F1@K is their harmonic mean.","code":"precision = 3 / 4 = 0.75\nK = 3:   recall = 1.00   F1@3  = 0.86\nK = 10:  recall = 0.30   F1@10 = 0.43"}]}
```

**Checkers err too.** FActScore’s “under 2% error” compares whole-model scores, not individual facts. SAFE agreed with crowd annotators on 72% of about 16,000 facts and won 76 of 100 disagreements; its misses came from reasoning, search and rewriting. Calibrate a claim checker like any [judge](#llm-as-judge).

**Grounded answers.** In [Jacovi et al., “The FACTS Grounding Leaderboard: Benchmarking LLMs’ Ability to Ground Responses to Long-Form Input” (2025)](https://arxiv.org/abs/2501.03200), a response to a document of up to 32k tokens must first answer the request, then fails on any unsupported claim. Three judges from three vendors are averaged to offset self-preference: in the paper, models rated their own outputs 3.23% higher on average. Of the 1,719 examples, 859 stay private. See [grounding and citations](#grounding-citations) and [evaluating RAG](#rag-evaluation).

**Without a reference.** SelfCheckGPT samples several answers: known facts recur, invented ones diverge ([Manakul et al., “SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative Large Language Models” (2023)](https://arxiv.org/abs/2303.08896)). Semantic entropy clusters samples that entail each other both ways and takes the entropy over clusters ([Kuhn et al., “Semantic Uncertainty: Linguistic Invariances for Uncertainty Estimation in Natural Language Generation” (2023)](https://arxiv.org/abs/2302.09664)):

```math
\mathrm{SE}(x) = -\sum_{c} p(c \mid x)\,\log p(c \mid x)
```

Both rest on consistency, so neither flags an error the model repeats every time (Farquhar et al.).

## In practice
Grade into three buckets ([metrics and graders](#metrics-graders)) and report all of them:

```python
from collections import Counter

CONFIDENCE_RULE = (
    "Answer only if you are more than {t:.0%} confident. A wrong answer costs "
    "{penalty:g} points, a correct answer earns 1 point, and \"I don't know\" earns 0."
)

def factuality_report(grades, thresholds=(0.0, 0.5, 0.9)):
    """grades: one of "correct", "incorrect", "not_attempted" per question."""
    n, total = Counter(grades), len(grades)
    attempted = n["correct"] + n["incorrect"]
    report = {
        "correct": n["correct"] / total,
        "incorrect": n["incorrect"] / total,
        "not_attempted": n["not_attempted"] / total,
        "correct_given_attempted": n["correct"] / attempted if attempted else 0.0,
    }
    for t in thresholds:  # t = 0 is plain accuracy
        penalty = t / (1 - t)
        report[f"score@{t}"] = (n["correct"] - penalty * n["incorrect"]) / total
    return report
```

**A factuality eval for your domain.**
1. Collect 100 or more real questions with references ([why evals](#why-evals), [eval datasets](#eval-datasets)).
2. Read failures ([error analysis](#error-analysis)) and define severity: say 0 harmless, 1 minor, 2 misleading, 3 changes a decision.
3. Set t from the cost of a severity-3 error, state it in the prompt, report with intervals ([statistics for evals](#eval-statistics)).
4. Validate your claim checker against human labels.

**Levers.** Retrieval supplies facts, but binary grading still rewards guessing when search fails (Kalai et al.). As of November 2026, Anthropic’s [guide to reducing hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) recommends permission to say “I don’t know”, quoting a long document before answering, and retracting claims no quote supports; it notes these reduce hallucinations but do not eliminate them. [Dhuliawala et al., “Chain-of-Verification Reduces Hallucination in Large Language Models” (2023)](https://arxiv.org/abs/2309.11495) check a draft with independently answered questions. Top-p sampling can hurt factuality (Lee et al.; see [decoding](#decoding-sampling)).

```viz
{"id":"hallucination-factuality-levers","component":"tree","title":"Each mitigation lever removes one kind of hallucination and leaves the others","caption":"Expand a lever to see what it buys and what it does not. Click a leaf for the chapter that owns it.","alt":"Tree of five mitigation levers: retrieval, permission to abstain, verification, decoding settings and uncertainty signals, each with what it buys and what it does not.","data":"illustrative","open":1,"root":{"label":"Which lever, and what does it buy?","children":[
{"label":"Retrieval","children":[{"label":"Buys: facts the model never saw, or saw once","link":"#rag-fundamentals"},{"label":"Does not buy: faithfulness to what it retrieved, or abstaining when search finds nothing","link":"#grounding-citations"}]},
{"label":"Permission to abstain","children":[{"label":"Buys: fewer wrong answers on questions it cannot answer"},{"label":"Costs: more “I don’t know”; track the abstention rate and design the interface for it","link":"#ai-product-ux"}]},
{"label":"Verification after drafting","children":[{"label":"Buys: unsupported quotes and claims caught before users see them","link":"#grounding-citations"},{"label":"Costs: extra calls, and the checker’s own error rate","link":"#llm-as-judge"}]},
{"label":"Decoding settings","children":[{"label":"Buys: fewer arbitrary slips from sampling the tail","link":"#decoding-sampling"},{"label":"Does not buy: knowledge the model lacks"}]},
{"label":"Uncertainty signals","children":[{"label":"Buys: a flag to refuse, retrieve or escalate on confabulations","link":"#llm-uncertainty"},{"label":"Does not buy: detection of errors the model makes consistently"}]}]}}
```

**Reading leaderboards and vendor claims.** Ask which reference, which judge, how abstentions count and whether the split is private. As of November 2026, Vectara’s [hallucination leaderboard](https://github.com/vectara/hallucination-leaderboard) scores summaries with its own commercial HHEM-2.3 model and reports refusals as an answer rate; its FAQ notes that copying the document scores zero hallucinations. See [benchmark literacy](#benchmark-literacy).

> [!try]
> Grade 50 real answers into the three buckets; compute the score at t = 0 and t = 0.75.

## Numbers to know
> [!number]
> Rules of thumb. With a penalty of t/(1 − t) per wrong answer, answering pays only above confidence t: penalty 1 at t = 0.5, 9 at t = 0.9 (Kalai et al., 2025). A calibrated base model errs on at least about the share of arbitrary facts seen once in training (Kalai et al., 2025).

## Pitfalls and anti-patterns
> [!pitfall] Shipping on accuracy alone
> Accuracy cannot tell abstaining from bluffing. Report all three rates and a penalized score.

- **Grounded is not true.** A faithful answer from a stale document is still wrong; date your sources.
- **Precision-only scores.** They rise when the model says less; add F1@K or an abstention rate.
- **Self-judging.** Use judges from other model families ([judge models and meta-evaluation](#judge-models-meta-evaluation)).

## Talk like an expert
The vocabulary: **confabulation**, **intrinsic and extrinsic**, **faithfulness** or **groundedness**, **confidence target**, **semantic entropy**. Experts ask “against which reference?” and “what does ‘I don’t know’ score?” before reading a hallucination rate. The live debate is whether hallucination can be trained away or only managed; Kalai et al. argue for rescoring mainstream benchmarks over new hallucination evals.

> [!hottake] Most hallucination is an incentive problem, not a knowledge problem.
> **The counterargument:** Kalai et al.’s own bound makes rare-fact errors statistical; a consistently wrong model will not abstain; and abstaining has a price: TruthfulQA counts “No comment” as true, though it tells users nothing.

## Check yourself
```quiz
hallucination-factuality
```

## Go deeper
- Kalai et al., [“Why Language Models Hallucinate” (2025)](https://arxiv.org/abs/2509.04664).
- Wei et al., [“Measuring short-form factuality in large language models” (2024)](https://arxiv.org/abs/2411.04368).
- Wei et al., [“Long-form factuality in large language models” (2024)](https://arxiv.org/abs/2403.18802).

## Related
- [Grounding and citations](#grounding-citations)
- [Evaluating RAG](#rag-evaluation)
- [Uncertainty and confidence estimation for LLMs](#llm-uncertainty)
- [LLM-as-judge done right](#llm-as-judge)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Decoding and sampling](#decoding-sampling)
- [Field note: Fake case citations in two English cases: the High Court on lawyers and generative AI](#ayinde-high-court-fake-citations)
