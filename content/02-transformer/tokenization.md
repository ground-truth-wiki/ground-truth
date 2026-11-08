---
id: tokenization
book: 2
order: "2.1"
title: Tokenization
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [tokens, bpe, tokenizer]
visuals:
  - bpe-playground:tokens
  - chars-per-token:chart
---
> [!tldr]
> Models read tokens, not characters: subword pieces learned from data, mostly with byte-pair encoding. Tokenization decides cost, context usage, how well a model handles languages, numbers and code, and a surprising number of strange failures.

## Why it matters
Every price, context limit and rate limit is measured in tokens. The same text can cost several times more in one language than another, numbers can split into odd pieces, and a trailing space can change an answer. Engineers who understand tokenization estimate costs correctly and debug failures that look mysterious otherwise.

## Intuition
A tokenizer is a shorthand system. Common words get one symbol; rare words are spelled from smaller pieces. A shorthand designed mostly for English text writes English compactly and everything else at length.

```viz
{"id":"bpe-playground","component":"tokens","title":"BPE learns its vocabulary by merging the most frequent pair, one merge at a time","caption":"A toy tokenizer trained only on the text in the box. Move the merges slider from 0 and watch characters fuse into frequent words and word pieces.","alt":"Token strip of the input text with token ids, a merge-count slider and a log of merges learned.","data":"illustrative","try":"Paste a sentence in another language and compare characters per token.","text":"The tokenizer tokenizes tokens. Tokenization turns text into tokens, and tokens into numbers.","merges":14}
```

## How it works
**Byte-pair encoding.** Start from bytes or characters; repeatedly merge the most frequent adjacent pair into a new token; stop at a target vocabulary size (Sennrich et al., 2016, for subword translation). Byte-level BPE, used since GPT-2, starts from the 256 byte values, so any text can be encoded without unknown tokens.

**Other schemes.** WordPiece (used in BERT) and the Unigram language-model method in SentencePiece (Kudo, 2018) choose subwords differently but serve the same purpose. Tokenizer-free approaches that operate on bytes directly are an active research area. See [beyond the transformer](#beyond-transformers).

**Vocabulary size.** Larger vocabularies (GPT-2 had about 50,000 tokens; Llama 3 about 128,000) encode text in fewer tokens, especially for non-English languages and code, at the cost of a larger embedding table.

**Efficiency varies by content.**

```viz
{"id":"chars-per-token","component":"chart","type":"bar","title":"English prose packs about four characters per token; many other scripts pack far fewer","caption":"Illustrative rules of thumb, not measurements: characters per token for typical modern tokenizers. Exact numbers vary by tokenizer and text; measure your own content.","alt":"Illustrative bar chart of characters per token for English prose, code, German, Hindi and Chinese.","data":"illustrative","categories":["English prose","Source code","German","Hindi","Chinese"],"y":{"label":"Characters per token","min":0,"max":5},"series":[{"name":"Characters per token","points":[[0,4],[1,3],[2,3.3],[3,1.8],[4,1.3]]}]}
```

**Quirks.** Numbers may split into irregular chunks, which hurts arithmetic; leading spaces are part of tokens, so “ word” and “word” differ; rare strings can become “glitch tokens” the model barely saw in training; and chat templates add special tokens that count toward limits. See [supervised fine-tuning](#sft).

## In practice
- Count tokens with the provider’s tokenizer or token-counting endpoint, not a character rule, for anything that matters.
- Budget non-English and code-heavy workloads with measured token counts.
- Keep exact strings (ids, numbers) intact; prefer tools for arithmetic.
- Watch for whitespace and formatting differences in prompts that change tokenization and caching. See [prompt caching](#prompt-caching).

## Numbers to know
> [!number]
> Rules of thumb. About four characters or three quarters of a word per token for English prose; fewer characters per token for many other scripts. Vocabulary sizes of modern models range from tens of thousands to a few hundred thousand tokens.

## Pitfalls and anti-patterns
> [!pitfall] Estimating costs from word counts
> Word-based estimates can be off by a factor of two or more for non-English text, code and structured data. Measure tokens.

- **Assuming tokenizers match across models.** Counts and limits differ between families.
- **Relying on the model for digit-level work.** Tokenized numbers make arithmetic fragile; use code.

## Talk like an expert
The vocabulary: **token**, **byte-pair encoding**, **byte-level BPE**, **vocabulary size**, **special tokens**, **fertility** (tokens per word), **glitch token**. Experts quote limits and prices in tokens and know their tokenizer’s quirks. The live debate is whether tokenizer-free models will replace subword tokenization.

> [!hottake] Tokenization is responsible for more weird model behavior than any other single design choice.
> **The counterargument:** most user-facing errors come from reasoning, knowledge and context problems; tokenization explains a distinctive minority of failures, mainly with numbers, spelling and rare strings.

## Check yourself
```quiz
tokenization
```

## Go deeper
- Sennrich, Haddow and Birch, “Neural Machine Translation of Rare Words with Subword Units” (2016).
- Kudo and Richardson, “SentencePiece” (2018).

## Related
- [Embeddings and position](#positional-encoding)
- [The transformer block](#transformer-block)
- [Cost engineering](#cost-engineering)
- [Prompt caching](#prompt-caching)
- [Numbers every AI engineer should know](#numbers-to-know)
- [What a language model is: from n-grams to neural networks](#language-modeling)
- [The transformer end to end](#transformer-overview)
- [Multilingual and low-resource language models](#multilingual-models)
- [Chat templates, message roles and prompt formats](#chat-templates)
- [Visual tokenizers and autoregressive image generation](#autoregressive-image-generation)
- [Neural audio codecs and audio tokens](#audio-codecs-tokens)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Training and using tokenizers](#tokenizers-in-practice)
