---
id: lexicon-guide
book: 20
order: "20.1"
title: Lexicon
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [glossary, lexicon]
visuals:
  - lexicon-anatomy:compare
  - term-families:tree
---
> [!tldr]
> The Lexicon is the Bible’s glossary: every term with a one-line definition, what it means in practice, its aliases and the chapters that use it. Dotted underlines anywhere in the text open it; flashcards turn it into study.

## Why it matters
AI engineering is a vocabulary-heavy field where the same idea has several names and the same acronym several meanings. A shared, consistent vocabulary makes reading, discussion and design reviews faster and more precise.

## Intuition
The Lexicon is the index at the back of a textbook, crossed with a phrasebook: it tells you what a word means and how practitioners use it.

```widget
lexicon
```

## How it works
```viz
{"id":"lexicon-anatomy","component":"compare","title":"What a Lexicon entry contains, and why each part is there","caption":"An entry as you see it and as it is stored. Hover the marks.","alt":"Comparison of a rendered Lexicon entry and its stored fields.","data":"illustrative","mono":false,"a":{"title":"As you see it","text":"KV cache: the stored keys and values of previous tokens, reused so each new token does not recompute them. In practice: it often limits how many users a GPU can serve. Also called: key-value cache. Used in: The KV cache, Memory math.","mono":false},"b":{"title":"As it is stored","text":"id, term, definition, in practice, aliases, chapters, abbreviation. Aliases drive automatic underlining; chapters build the “used in” links; abbreviations feed the Acronym decoder.","mono":false},"links":[{"a":"Also called: key-value cache.","b":"aliases","note":"Aliases let the Lexicon recognize the term in every spelling."},{"a":"Used in: The KV cache, Memory math.","b":"chapters","note":"Links back to where the term matters."}]}
```

```viz
{"id":"term-families","component":"tree","title":"Term families, with a starting entry for each","caption":"Expand a family; each leaf links to a chapter where its terms are used most.","alt":"Tree of Lexicon term families with a representative chapter for each.","data":"illustrative","open":1,"root":{"label":"Term families","children":[
{"label":"Model internals","children":[{"label":"Attention, KV cache, RoPE, mixture of experts","link":"#attention"}]},
{"label":"Training","children":[{"label":"SFT, DPO, RLVR, LoRA","link":"#sft"}]},
{"label":"Retrieval","children":[{"label":"BM25, reranker, nDCG, chunking","link":"#rag-fundamentals"}]},
{"label":"Agents and protocols","children":[{"label":"Agent loop, tool use, MCP, A2A","link":"#agent-loop"}]},
{"label":"Evaluation","children":[{"label":"Eval set, LLM-as-judge, pass^k","link":"#why-evals"}]},
{"label":"Production and security","children":[{"label":"TTFT, gateway, prompt injection, sandbox","link":"#inference-fundamentals"}]}]}}
```

**Terms stay consistent.** Each concept has one preferred name; alternatives are aliases. New chapters add terms as they are written.

## In practice
- Search the Lexicon from anywhere with Ctrl K; filter by letter or Book.
- Study with flashcards for a few minutes a day.
- Link to a term with its address, such as `#term-kv-cache`.

## Numbers to know
> [!number]
> Fact: the Lexicon holds several hundred terms and grows with each version; see the counter on its page.

## Pitfalls and anti-patterns
> [!pitfall] Using one acronym for several things
> Expand acronyms the first time in any document; the [Acronym decoder](#acronym-decoder) lists the collisions.

## Talk like an expert
Experts use precise terms and expand ambiguous ones. The live debate in vocabulary is whether new terms (“context engineering”, “harness”) describe new practices or rename old ones.

> [!hottake] Half of AI jargon is old ideas with new names.
> **The counterargument:** new names often mark real shifts in practice, such as from single prompts to managed context across long agent runs.

## Check yourself
```quiz
lexicon-guide
```

## Go deeper
- The [Lexicon](#lexicon) and [flashcards](#flashcards) pages.

## Related
- [Acronym decoder](#acronym-decoder)
- [Talking shop](#talking-shop)
- [How to use this Bible](#how-to-use)
- [The rest of the alphabet soup](#protocol-soup)
- [Interview prep](#interview-prep)
