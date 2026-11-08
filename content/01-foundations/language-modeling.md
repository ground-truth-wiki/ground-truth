---
id: language-modeling
book: 1
order: "1.10"
title: "What a language model is: from n-grams to neural networks"
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [language-models, n-grams, perplexity, autoregressive, next-token-prediction]
visuals:
  - language-modeling-chain:stepper
  - language-modeling-smoothing:calculator
  - language-modeling-perplexity:calculator
  - language-modeling-generalize:compare
prerequisites: [probability-information, neural-networks]
---
> [!tldr]
> A language model gives a probability to each possible next token given the tokens before it, and through the chain rule to whole sequences. N-gram models get these probabilities by counting; neural models compute them from learned word vectors, so they generalize to unseen text. LLMs do the same job at scale: trained and scored on next-token prediction, writing one sampled token at a time.

## Why it matters
Much LLM behavior follows from this definition. A distribution needs a rule for picking from it, hence temperature. Perplexity means something only with a fixed tokenizer and clean test data. N-grams have a simple, clear formalization, so [Jurafsky and Martin](https://web.stanford.edu/~jurafsky/slp3/3.pdf) use them to introduce perplexity, sampling and interpolation.

## Intuition
Picture autocomplete that shows odds instead of one suggestion. After “i want”, “to” is likely, “chinese” possible, “want” never seen. An n-gram model stores those odds in a table, one row per recent context, filled by counting. A neural model computes the row for any context, even a new one. Either way, a sentence’s probability is the product of one next-word probability per word.

```viz
{"id":"language-modeling-chain","component":"stepper","title":"A language model scores a sentence by multiplying one next-word probability per step","caption":"Bigram probabilities counted in the Berkeley Restaurant Project corpus (9,332 sentences, 1,446 word types), as published by Jurafsky and Martin. Each row shows only 8 of the 1,446 possible next words, so it does not sum to 1.","alt":"Stepper that scores the sentence “i want chinese food” with a bigram model. Each step shows the model’s probabilities for eight possible next words after the current word, and the running product: 0.25, then 0.0825, 0.00054, 0.00028 and finally about 0.00019 after the end symbol.","data":"real","source":"Jurafsky and Martin, Speech and Language Processing, 3rd ed. draft, chapter 3, Figure 3.2 and section 3.1.2","asof":"2026-08","try":"Step to “want → chinese” and compare the cell for “chinese” with the cell for “to”.","frames":[
{"label":"Start","caption":"Every sentence begins with a start symbol. In this corpus, P(i | <s>) = 0.25: a quarter of the sentences start with “i”. Running product: **0.25**.","tokens":["<s>","i"]},
{"label":"i → want","caption":"The model’s whole prediction after “i” is one row of the table. “want” takes 0.33 of it. Running product: 0.25 × 0.33 = **0.0825**.","tokens":["<s>","i","want"],"matrix":{"title":"P(next word | i), 8 of 1,446 columns","rows":["after “i”"],"cols":["i","want","to","eat","chinese","food","lunch","spend"],"values":[[0.002,0.33,0,0.0036,0,0,0,0.00079]],"min":0,"max":0.66,"fmt":5,"cell":58}},
{"label":"want → chinese","caption":"After “want”, the safe bet is “to” (0.66). “chinese” gets 0.0065, so the product drops to **0.00054**. The zero for “want want” means that pair was never counted, so the model calls it impossible.","tokens":["<s>","i","want","chinese"],"matrix":{"title":"P(next word | want), 8 of 1,446 columns","rows":["after “want”"],"cols":["i","want","to","eat","chinese","food","lunch","spend"],"values":[[0.0022,0,0.66,0.0011,0.0065,0.0065,0.0054,0.0011]],"min":0,"max":0.66,"fmt":5,"cell":58}},
{"label":"chinese → food","caption":"“food” is the likely word after “chinese”: 0.52. Running product: **0.00028**.","tokens":["<s>","i","want","chinese","food"],"matrix":{"title":"P(next word | chinese), 8 of 1,446 columns","rows":["after “chinese”"],"cols":["i","want","to","eat","chinese","food","lunch","spend"],"values":[[0.0063,0,0,0,0,0.52,0.0063,0]],"min":0,"max":0.66,"fmt":5,"cell":58}},
{"label":"food → </s>","caption":"The end symbol is predicted too: P(</s> | food) = 0.68. The sentence gets 0.25 × 0.33 × 0.0065 × 0.52 × 0.68 ≈ **0.00019**.","tokens":["<s>","i","want","chinese","food","</s>"]},
{"label":"Compare and generate","caption":"Jurafsky and Martin compute 0.000031 for “i want english food” with the same model, about six times less: people in this corpus asked for Chinese food more often. To generate instead of score, run the same loop but sample each next word from its row.","tokens":["<s>","i","want","english","food","</s>"]}]}
```

## How it works
**The chain rule.** Any joint probability splits exactly into next-word probabilities ([Jurafsky and Martin, chapter 3](https://web.stanford.edu/~jurafsky/slp3/3.pdf)):

```math
P(w_1, \dots, w_n) = \prod_{k=1}^{n} P(w_k \mid w_1, \dots, w_{k-1})
```

Predicting left to right like this is called autoregressive. The hard part is each conditional: language is creative, so a long history may never have occurred in any corpus.

**The Markov assumption and counting.** An n-gram model keeps only the last n − 1 words; a bigram model uses P(w_k | w_{k−1}), whose maximum likelihood estimate is a relative frequency, C(w_{k−1} w_k) / C(w_{k−1}). In the restaurant corpus, “i want” occurs 827 times and “i” 2,533 times, so P(want | i) ≈ 0.33. Implementations add log probabilities, because long products underflow.

**Zeros and smoothing.** In Jurafsky and Martin’s Shakespeare corpus, 29,066 word types allow about 844 million bigrams, and most never occur. An unseen pair gets probability 0, which makes any sentence containing it impossible. Laplace (add-one) smoothing adds 1 to every count and the vocabulary size V to every denominator; add-k adds a fraction. Interpolation mixes trigram, bigram and unigram estimates with weights tuned on held-out data. Back-off uses the longest n-gram that has a count.

```viz
{"id":"language-modeling-smoothing","component":"calculator","title":"Add-one smoothing rescues unseen pairs but takes a lot from seen ones","caption":"Defaults are the bigram “want to” in the Berkeley Restaurant Project corpus, from Jurafsky and Martin: 608 of the 927 uses of “want” are followed by “to”, and the vocabulary has 1,446 word types. Add-one smoothing cuts its probability from 66% to 26%; the adjusted count shows the same loss as a count.","alt":"Calculator: unsmoothed and add-k smoothed bigram probability, and the adjusted count, from the count of the pair, the count of the previous word, the vocabulary size and k.","data":"formula","try":"Set the pair count to 0 to see what an unseen pair gets, then set k to 0.01.","inputs":{"count_pair":608,"count_prev":927,"vocab":1446,"k":1},"input_meta":{"count_pair":{"label":"Count of the pair, such as C(want to)","min":0,"step":1},"count_prev":{"label":"Count of the previous word, such as C(want)","min":1,"step":1},"vocab":{"label":"Vocabulary size V","min":1,"step":1},"k":{"label":"k (1 is add-one, or Laplace)","min":0,"step":0.01}},"outputs":[{"id":"mle","label":"Unsmoothed probability (maximum likelihood)","expr":"100 * count_pair / count_prev","unit":"%"},{"id":"smoothed","label":"Add-k smoothed probability","expr":"100 * (count_pair + k) / (count_prev + k * vocab)","unit":"%","main":true},{"id":"adjusted","label":"Adjusted count, comparable with the raw pair count","expr":"(count_pair + k) * count_prev / (count_prev + k * vocab)","unit":""}],"assumptions":["Each of the V possible next words gets k extra counts, so the smoothed probabilities still sum to 1.","Counts come from training text only.","Choose k on a development set, never on the test set."],"tests":[{"inputs":{},"expect":{"mle":65.587918,"smoothed":25.663717,"adjusted":237.902655},"tol":0.00001},{"inputs":{"count_pair":0},"expect":{"mle":0,"smoothed":0.0421408,"adjusted":0.3906448},"tol":0.00001,"note":"An unseen pair; Jurafsky and Martin give 0.00042 and an adjusted count of 0.39"},{"inputs":{"count_pair":827,"count_prev":2533},"expect":{"smoothed":20.809249,"adjusted":527.098266},"tol":0.00001,"note":"P(want | i); Jurafsky and Martin give 0.21 and an adjusted count of 527"}]}
```

**Perplexity.** Score a held-out test set once, after tuning on a development set. Perplexity is the test set’s inverse probability, normalized by its length N:

```math
\text{PPL}(W) = P(w_1 \dots w_N)^{-1/N} = \exp\Big(-\frac{1}{N}\sum_{i=1}^{N} \ln P(w_i \mid w_{<i})\Big)
```

Lower is better. Its log is the cross-entropy loss that neural models minimize ([Hugging Face docs](https://huggingface.co/docs/transformers/perplexity)); see [information theory for language models](#information-theory-for-llms).

```viz
{"id":"language-modeling-perplexity","component":"calculator","title":"Perplexity is an inverse geometric mean, so one near-zero prediction dominates it","caption":"Defaults are the five bigram predictions for “i want chinese food” from the stepper above. A perplexity of about 5.6 means the model was as uncertain as if it chose among 5.6 equally likely words at each step.","alt":"Calculator: perplexity, average negative log-likelihood in nats and cross-entropy in bits per token, from five per-token probabilities.","data":"formula","try":"Set token 3 to 0.0011 and token 4 to 0.5 to score “i want english food”, then set any one probability to 0.000001.","inputs":{"p1":0.25,"p2":0.33,"p3":0.0065,"p4":0.52,"p5":0.68},"input_meta":{"p1":{"label":"Token 1: P(i | <s>)","min":0,"max":1,"step":0.01},"p2":{"label":"Token 2: P(want | i)","min":0,"max":1,"step":0.01},"p3":{"label":"Token 3: P(chinese | want)","min":0,"max":1,"step":0.0001},"p4":{"label":"Token 4: P(food | chinese)","min":0,"max":1,"step":0.01},"p5":{"label":"Token 5: P(</s> | food)","min":0,"max":1,"step":0.01}},"outputs":[{"id":"perplexity","label":"Perplexity","expr":"pow(p1 * p2 * p3 * p4 * p5, -1 / 5)","unit":"","main":true},{"id":"nll","label":"Average negative log-likelihood","expr":"-(ln(p1) + ln(p2) + ln(p3) + ln(p4) + ln(p5)) / 5","unit":"nats per token"},{"id":"bits","label":"Cross-entropy","expr":"nll / ln(2)","unit":"bits per token"}],"assumptions":["Five predictions: four words and the end symbol. The start symbol is given, not predicted.","Perplexity equals e to the power of the average negative log-likelihood in nats.","A probability of exactly 0 makes perplexity infinite, shown as a dash."],"tests":[{"inputs":{},"expect":{"perplexity":5.5516757,"nll":1.7140998,"bits":2.4729233},"tol":0.00001},{"inputs":{"p1":0.5,"p2":0.5,"p3":0.5,"p4":0.5,"p5":0.5},"expect":{"perplexity":2,"nll":0.6931472,"bits":1},"tol":0.00001},{"inputs":{"p3":0.0011,"p4":0.5},"expect":{"perplexity":7.9824258},"tol":0.00001,"note":"“i want english food”"}]}
```

**Sampling.** To generate, draw the next word from the distribution, append it and repeat until the end symbol. LLMs run the same loop, shaped by [temperature and top-p](#decoding-sampling). Samples also expose overfitting: in Jurafsky and Martin’s Shakespeare example, the 4-gram sample “It cannot be but so” comes word for word from *King John*.

**Neural language models.** [Bengio et al., “A Neural Probabilistic Language Model” (2003)](https://www.jmlr.org/papers/v3/bengio03a.html) attacked the curse of dimensionality: the joint distribution of 10 consecutive words from a 100,000-word vocabulary has potentially 10^50 − 1 free parameters. Their network learns a 30- to 100-dimensional vector per word and predicts the next word from those vectors. Similar words get nearby vectors, so one training sentence raises the probability of many similar ones. They report perplexity 10 to 20% better than a smoothed trigram. See [representation learning](#representation-learning).

```viz
{"id":"language-modeling-generalize","component":"compare","title":"A count table finds no overlap where learned word vectors find a close neighbor","caption":"Illustrative, built on the example sentences from Bengio et al. (2003). The two sentences share no bigram and no trigram, only the word “in”. Hover the marks.","alt":"Side-by-side comparison of a trigram model and a neural language model that were both trained on “The cat is walking in the bedroom” and are asked about “A dog was running in a room”. The trigram model finds no shared trigrams and falls back to word frequencies; the neural model maps cat to dog, the to a, is to was, walking to running and bedroom to room, so it gives the new sentence a similar probability.","data":"illustrative","a":{"title":"Trigram model (counts)","text":"Seen in training:\n  The cat is walking in the bedroom\nAt test time:\n  A dog was running in a room\n\nTrigrams shared with training: none\nFallback: shorter n-grams, down to word frequencies\nCounts about “cat” say nothing about “dog”"},"b":{"title":"Neural model (learned vectors)","text":"Seen in training:\n  The cat is walking in the bedroom\nAt test time:\n  A dog was running in a room\n\nNearby vectors: cat ≈ dog, the ≈ a, is ≈ was,\n  walking ≈ running, bedroom ≈ room\nSimilar inputs get similar probabilities\nOne sentence lifts many similar sentences"},"links":[{"a":"Trigrams shared with training: none","b":"Nearby vectors: cat ≈ dog, the ≈ a, is ≈ was,\n  walking ≈ running, bedroom ≈ room","note":"A count table treats every word as unrelated to every other word. Learned vectors place words with similar roles near each other."},{"a":"Fallback: shorter n-grams, down to word frequencies","b":"Similar inputs get similar probabilities","note":"Back-off and interpolation generalize by using less context. The neural model generalizes by using similar context."},{"a":"Counts about “cat” say nothing about “dog”","b":"One sentence lifts many similar sentences","note":"In Bengio et al.’s words, each training sentence informs the model about a combinatorial number of other sentences."}]}
```

**From recurrence to attention.** [Mikolov et al., “Recurrent neural network based language model” (2010)](https://www.isca-archive.org/interspeech_2010/mikolov10_interspeech.html) note that feedforward networks usually see five to ten preceding words. Their recurrent model carries a hidden state with no fixed context limit; a mix of such models cut perplexity by about half against a back-off model ([recurrent networks](#recurrent-networks)). [Vaswani et al., “Attention Is All You Need” (2017)](https://arxiv.org/abs/1706.03762) replaced recurrence with [attention](#attention), which trains in parallel ([the transformer end to end](#transformer-overview)).

**Units.** Tokens can be characters, words or subwords. Subword tokenizers such as BPE build any word from known pieces, so test text never holds an unknown token ([Jurafsky and Martin](https://web.stanford.edu/~jurafsky/slp3/3.pdf); see [tokenization](#tokenization)).

**Causal versus masked.** A causal model predicts each token from the ones before it, like GPT-style models. A masked model such as BERT picks 15% of the tokens at random, hides most of them behind a `[MASK]` token, and predicts them from both sides ([Devlin et al., “BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding” (2018)](https://arxiv.org/abs/1810.04805)). That suits encoders, not left-to-right generation, and perplexity is not well defined for it ([Hugging Face docs](https://huggingface.co/docs/transformers/perplexity)); see [encoders and decoders](#encoders-and-decoders).

**What scale changes.** The factorization, objective and sampling loop stay the same; what changes is how each conditional is computed, and over how much context. Loss falls as a power law in model size, data and compute ([Kaplan et al., “Scaling Laws for Neural Language Models” (2020)](https://arxiv.org/abs/2001.08361); see [scaling laws](#scaling-laws)), and GPT-3 did new tasks from a few examples in its prompt ([Brown et al., “Language Models are Few-Shot Learners” (2020)](https://arxiv.org/abs/2005.14165)). Yet “making language models bigger does not inherently make them better at following a user’s intent” ([Ouyang et al., “Training language models to follow instructions with human feedback” (2022)](https://arxiv.org/abs/2203.02155)); that is the job of [post-training](#post-training-overview).

## In practice
A bigram model with add-k smoothing, perplexity and sampling, trained on Jurafsky and Martin’s three-sentence example:

```python
import math
import random
from collections import Counter

def pad(sentence):
    return ["<s>"] + sentence.split() + ["</s>"]

def train(sentences):
    contexts, pairs = Counter(), Counter()
    for s in sentences:
        toks = pad(s)
        contexts.update(toks[:-1])
        pairs.update(zip(toks[:-1], toks[1:]))
    vocab = sorted({t for s in sentences for t in pad(s)[1:]})  # words plus </s>
    return contexts, pairs, vocab

def prob(model, prev, word, k=1.0):
    """Add-k smoothed P(word | prev). k=0 is the unsmoothed maximum-likelihood estimate."""
    contexts, pairs, vocab = model
    return (pairs[(prev, word)] + k) / (contexts[prev] + k * len(vocab))

def perplexity(model, sentences, k=1.0):
    nll, n = 0.0, 0
    for s in sentences:
        toks = pad(s)
        for prev, word in zip(toks[:-1], toks[1:]):
            nll -= math.log(prob(model, prev, word, k))  # k=0 and an unseen pair: log(0) fails
            n += 1
    return math.exp(nll / n)

def sample(model, k=1.0, max_len=20):
    vocab, prev, out = model[2], "<s>", []
    for _ in range(max_len):
        prev = random.choices(vocab, weights=[prob(model, prev, w, k) for w in vocab])[0]
        if prev == "</s>":
            break
        out.append(prev)
    return " ".join(out)

model = train(["I am Sam", "Sam I am", "I do not like green eggs and ham"])
print(prob(model, "<s>", "I", k=0))              # 0.667, as in Jurafsky and Martin
print(perplexity(model, ["I am ham"], k=1.0))    # 6.42 on a held-out sentence
print(perplexity(model, ["I am ham"], k=0.1))    # 3.88: less mass moved to unseen pairs
print(sample(model, k=0.1))                      # random, different on every run
```

With Hugging Face, a causal model returns the mean negative log-likelihood per token as `loss` when the labels are the input ids ([docs](https://huggingface.co/docs/transformers/perplexity)):

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "<model-id>"  # a causal (decoder-only) model
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

ids = tokenizer("Text the model did not see in training.", return_tensors="pt").input_ids
with torch.no_grad():
    loss = model(ids, labels=ids).loss  # mean negative log-likelihood per predicted token, in nats
print(torch.exp(loss).item())           # perplexity
```

- **Compare like for like:** same test text, tokenizer and context handling.
- **Keep test text out of training,** and score long text with a sliding window, not disjoint chunks.
- **Confirm on the task.** A lower perplexity does not guarantee a better application.

## Numbers to know
> [!number]
> Reference points and rules of thumb. Uniform guessing over V tokens gives perplexity V; a perfect model gives 1 ([Dive into Deep Learning, 9.3](https://d2l.ai/chapter_recurrent-neural-networks/language-model.html)). Wall Street Journal perplexity, trained on 38 million words: 962 for unigrams, 170 for bigrams, 109 for trigrams ([Jurafsky and Martin](https://web.stanford.edu/~jurafsky/slp3/3.pdf)). The joint distribution of 10 words from a 100,000-word vocabulary: potentially 10^50 − 1 free parameters ([Bengio et al., 2003](https://www.jmlr.org/papers/v3/bengio03a.html)).

## Pitfalls and anti-patterns
> [!pitfall] Comparing perplexity across tokenizers
> Perplexity is normalized per token, so the same text scores differently when a tokenizer splits it into more or fewer pieces. [Jurafsky and Martin](https://web.stanford.edu/~jurafsky/slp3/3.pdf) call perplexities comparable only with identical vocabularies, and the [Hugging Face docs](https://huggingface.co/docs/transformers/perplexity) warn that tokenization directly affects it. Compare on one tokenization.

- **Unsmoothed zeros.** One unseen pair makes perplexity infinite.

## Talk like an expert
The vocabulary: **autoregressive**, **Markov assumption**, **n-gram**, **smoothing**, **interpolation**, **back-off**, **perplexity**, **causal** and **masked language modeling**. Experts call the objective next-token prediction. The live debate is how much next-token prediction alone explains; see [Do language models reason?](#reasoning-debate).

> [!hottake] An LLM is a trigram model with a better way to share statistics.
> Same chain rule, objective and sampling loop; only the function that fills each row changed. **The counterargument:** that hides what scale adds. GPT-3 did new tasks from examples in its prompt, and a trigram model sees only two words back, so it cannot use such examples. Post-training also tunes models to follow instructions, so a chat model no longer just models its training text.

## Check yourself
```quiz
language-modeling
```

## Go deeper
- Jurafsky and Martin, [*Speech and Language Processing*, 3rd ed. draft, chapter 3, “N-gram Language Models”](https://web.stanford.edu/~jurafsky/slp3/3.pdf) (draft of 19 August 2026).
- [Bengio et al., “A Neural Probabilistic Language Model” (2003)](https://www.jmlr.org/papers/v3/bengio03a.html).
- Karpathy, [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html): video lectures that build a character-level bigram model, then work up to GPT, in code.

## Related
- [Probability, statistics and information theory](#probability-information)
- [The transformer end to end](#transformer-overview)
- [Tokenization](#tokenization)
- [Decoding and sampling](#decoding-sampling)
- [Recurrent networks, LSTMs and sequence-to-sequence models](#recurrent-networks)
- [Information theory for language models](#information-theory-for-llms)
