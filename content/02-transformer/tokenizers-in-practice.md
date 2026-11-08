---
id: tokenizers-in-practice
book: 2
order: "2.1.1"
title: Training and using tokenizers
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [tokenizers, bpe, sentencepiece, vocabulary, special-tokens]
visuals: []
prerequisites: [tokenization]
---
> [!tldr]
> A tokenizer is a small trained pipeline: it normalizes text, splits it into rough words, applies a learned subword model, adds special tokens, and decodes ids back to text. Training one means choosing the algorithm, the corpus, the splitting rules and the vocabulary size; using one well means measuring it on your own data. Remember that the tokenizer is part of the model: a checkpoint only works with its own tokenizer, and every new token needs a new embedding row.

## Key ideas

- **A pipeline, not one algorithm.** Encoding runs normalization, pre-tokenization, a subword model (BPE, Unigram, WordLevel or WordPiece) and post-processing, and a decoder maps ids back to text. A changed normalizer or pre-tokenizer calls for retraining, while the post-processor that inserts special tokens such as BERT's `[CLS]` and `[SEP]` can change without it ([Hugging Face Tokenizers: the tokenization pipeline](https://huggingface.co/docs/tokenizers/pipeline)).
- **Three ways to learn subwords.** BPE starts from characters or bytes and repeatedly merges the most frequent adjacent pair, WordPiece merges the pair that is most frequent relative to its parts, and Unigram starts from a large candidate set and prunes the tokens whose removal hurts the training likelihood least ([Hugging Face Transformers: tokenization algorithms](https://huggingface.co/docs/transformers/tokenizer_summary)). SentencePiece trains subword models directly from raw sentences, so it needs no language-specific word splitting (Kudo and Richardson, [“SentencePiece”](https://arxiv.org/abs/1808.06226) (2018)), and it keeps the space as a visible symbol, `▁`, that decoding turns back into a space ([tokenization algorithms](https://huggingface.co/docs/transformers/tokenizer_summary)).
- **Splitting rules and bytes decide the edge cases.** GPT-2 made BPE byte-level, with a base vocabulary of 256 byte values so any string can be encoded, and blocked merges across character categories so variants such as “dog.” and “dog!” do not each take a vocabulary slot (Radford et al., [“Language Models are Unsupervised Multitask Learners”](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) (2019)). SentencePiece-based tokenizers can instead fall back to UTF-8 bytes only for unseen characters, and both PaLM and LLaMA split every number into single digits (Chowdhery et al., [“PaLM”](https://arxiv.org/abs/2204.02311) (2022); Touvron et al., [“LLaMA”](https://arxiv.org/abs/2302.13971) (2023)).
- **Vocabulary size and corpus mix are a trade.** A larger vocabulary packs text into fewer tokens but adds rows to the embedding table and the output layer, and Tao et al. argue that the compute-optimal vocabulary size grows with the compute budget (Tao et al., [“Scaling Laws with Vocabulary”](https://arxiv.org/abs/2407.13623) (2024)). Llama 3 combined 100K tiktoken tokens with 28K extra tokens for non-English languages, and on English data it reached 3.94 characters per token against 3.17 for the Llama 2 tokenizer (Llama Team, [“The Llama 3 Herd of Models”](https://arxiv.org/html/2407.21783v3) (2024)).
- **Measure it on your own text.** Fertility, the average number of subwords per word, and the share of words split at all reveal languages a tokenizer over-segments (Rust et al., [“How Good is Your Tokenizer?”](https://arxiv.org/abs/2012.15613) (2021)). The same content translated into different languages can differ in token length by up to 15 times (Petrov et al., [“Language Model Tokenizers Introduce Unfairness Between Languages”](https://arxiv.org/abs/2305.15425) (2023)).
- **Special tokens are never split, and adding tokens means resizing.** A marker such as `<|endoftext|>` must always stay one token with one id ([Stanford CS336 assignment 1 handout](https://github.com/stanford-cs336/assignment1-basics/blob/main/cs336_assignment1_basics.pdf)), and Llama 3's chat format uses special header and termination tokens ([Llama 3 report](https://arxiv.org/html/2407.21783v3)). After you add tokens, `resize_token_embeddings` appends new rows, as of November 2026 initialized by default from the mean and covariance of the old embeddings ([Hugging Face Transformers: models](https://huggingface.co/docs/transformers/main_classes/model)), and tiktoken asks you to give an encoding a new name if you change its special tokens ([tiktoken](https://github.com/openai/tiktoken)).

## Planned visuals

- **`stepper`:** one sentence through the pipeline, frame by frame: normalization, pre-tokenization, BPE merges, special tokens added, then decoding back to the original text.
- **`chart`:** characters per token and fertility for several tokenizers on the same parallel text in several languages, as real measurements with their source and date.
- **`calculator`:** embedding and output-layer parameters as a function of vocabulary size and model width, next to the tokens a larger vocabulary saves on a sample document.

## Talk like an expert

Experts talk about merges, pre-tokenization regexes, byte fallback, fertility and compression in characters per token, and they treat the tokenizer as part of the weights: they test round trips (decoding the encoded text returns the input), as [nanochat](https://github.com/karpathy/nanochat)'s tokenizer tests do, and they know that the last tokens of a prompt can skew the continuation (greedy tokenization bias), which the `token_healing` option of Hugging Face's `generate` addresses by replacing those tail tokens with their extensions ([Hugging Face Transformers: generation](https://huggingface.co/docs/transformers/main_classes/text_generation)). The live alternative is byte-level, tokenizer-free modeling, covered in [Beyond the transformer](#beyond-transformers).

## Go deeper

- Sennrich et al., [“Neural Machine Translation of Rare Words with Subword Units”](https://arxiv.org/abs/1508.07909) (2016).
- Kudo and Richardson, [“SentencePiece: A simple and language independent subword tokenizer and detokenizer for Neural Text Processing”](https://arxiv.org/abs/1808.06226) (2018).
- [Hugging Face Tokenizers: the tokenization pipeline](https://huggingface.co/docs/tokenizers/pipeline).
- [Stanford CS336 assignment 1 handout](https://github.com/stanford-cs336/assignment1-basics/blob/main/cs336_assignment1_basics.pdf) (Spring 2026), which walks through training a byte-level BPE tokenizer from scratch.

## Related

- [Tokenization](#tokenization)
- [Supervised fine-tuning](#sft)
- [Multilingual and low-resource language models](#multilingual-models)
- [The pretraining run, end to end](#pretraining-run)
- [Model-specific notes](#model-specific-notes)
- [Beyond the transformer](#beyond-transformers)
