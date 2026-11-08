---
id: structured-generation-engines
book: 5
order: "5.6.1"
title: Structured generation engines
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [constrained-decoding, grammars, json-schema, structured-outputs, serving]
visuals: []
prerequisites: [structured-outputs, decoding-sampling]
---
> [!tldr]
> A structured generation engine compiles a schema, regex or grammar into a mask over the vocabulary at every decoding step, so the model can only emit tokens that keep the output valid. Regular patterns become finite-state machines, nested formats such as JSON need a pushdown automaton with a stack, and the engineering is in making masks cheap: precompute what you can, cache compiled grammars, and handle tokens that do not line up with grammar symbols. The engine guarantees validity, not quality, so leave room for reasoning before the constrained part.

## Key ideas

- **Masks come from automata.** Willard and Louf recast guided generation as transitions between the states of a finite-state machine and built an index over the vocabulary, so each step only considers tokens that keep a regex or grammar match alive; this is the method behind Outlines (Willard and Louf, [“Efficient Guided Generation for Large Language Models”](https://arxiv.org/abs/2307.09702) (2023)). Context-free grammars such as JSON need a stack to track nesting, so XGrammar builds a byte-level pushdown automaton, which also copes with tokens that cross grammar-element boundaries or split a Unicode character (Dong et al., [“XGrammar: Flexible and Efficient Structured Generation Engine for Large Language Models”](https://arxiv.org/abs/2411.15100) (2024)).
- **Precompute most of the mask.** XGrammar splits the vocabulary into context-independent tokens, prechecked and cached by the automaton node at the top of the stack, and context-dependent tokens checked at runtime, which for Llama-3.1 with a JSON grammar were fewer than 1% (1,134 of about 128,000); it reports speedups of up to 100 times over existing solutions ([Dong et al., 2024](https://arxiv.org/abs/2411.15100)). llguidance takes another route, an Earley parser on top of a lazily built lexer, and reports about 50 µs of CPU time per token for a 128k-token vocabulary with negligible startup cost ([llguidance repository](https://github.com/guidance-ai/llguidance)).
- **Grammar notations and schema conversion.** Engines typically accept a subset of JSON Schema, regular expressions and a grammar language: GBNF in llama.cpp, a Lark-like format in llguidance ([llguidance repository](https://github.com/guidance-ai/llguidance)). llama.cpp converts a subset of JSON Schema to GBNF, skips unsupported features silently, does not inject the schema into the prompt except for tool calling, and warns that writing `x? x? x?` for bounded repetition can make sampling extremely slow, so use `x{0,N}` instead ([llama.cpp grammars guide](https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md)).
- **Where engines run (as of November 2026).** vLLM offers xgrammar and guidance backends with `auto` as the default, takes `choice`, `regex`, `json`, `grammar` and `structural_tag` constraints, and advises that grammars spanning reasoning or tool-call boundaries require the token ids the parser expects, using token-level structural-tag elements with the XGrammar backend, rather than text literals ([vLLM structured outputs docs](https://docs.vllm.ai/en/latest/features/structured_outputs.html)). The llguidance repository lists integrations in vLLM, SGLang and llama.cpp and states that it powers OpenAI's Structured Outputs for JSON Schema ([llguidance repository](https://github.com/guidance-ai/llguidance)).
- **Hosted modes compile your schema too, within limits (as of November 2026).** OpenAI's Structured Outputs requires every field to be required and `additionalProperties: false`, allows up to 5,000 object properties, 10 levels of nesting and 1,000 enum values, adds latency to the first request with a new schema on fine-tuned models, and can return a refusal outside the schema ([OpenAI Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs)); its custom tools accept Lark or regex grammars, enforced with LLGuidance ([OpenAI function calling guide](https://developers.openai.com/api/docs/guides/function-calling)). Claude's structured outputs compile schemas into grammars cached for 24 hours from last use and cap a request at 20 strict tools, 24 optional parameters, 16 union-typed parameters and a 180-second compilation timeout ([Claude structured outputs docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)).
- **Constrain the answer, not the thinking, and test grammars offline.** Tam et al. found that stricter format constraints degraded reasoning more, while answering in natural language first and converting to the format in a second step scored nearly the same as unrestricted answers for most models (Tam et al., [“Let Me Speak Freely? A Study on the Impact of Format Restrictions on Performance of Large Language Models”](https://aclanthology.org/2024.emnlp-industry.91) (2024)). Before deploying, compile each grammar and run strings that must pass and must fail through it; llama.cpp's guide advises using its command-line converter to see warnings for schema features it skipped, and `llama-gbnf-validator` to test the resulting grammar ([llama.cpp grammars guide](https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md)).

## Planned visuals

- `stepper`: a pushdown automaton consuming a small JSON object token by token, showing the stack, the cached mask for context-independent tokens and the runtime check for context-dependent ones, with one token that crosses a grammar boundary. Illustrative.
- `compare`: a JSON Schema and the GBNF grammar it converts to, side by side, with linked highlights from each schema keyword to the rules it produces and a note on a feature the converter skips. Illustrative.
- `diagram`: where the engine sits: schema or grammar, compiler and grammar cache, per-step mask, sampler, inside a serving engine or behind a hosted API, with each part linking to its chapter.

## Talk like an expert

Experts talk about **token masks**, **finite-state** and **pushdown automata**, **context-independent tokens**, **grammar compilation** and **grammar caching**, **GBNF** and **Lark**, and ask three questions of any engine: how long the first compile takes, what the per-token mask costs at batch size, and which schema features it silently drops.

## Go deeper

- Willard and Louf, [“Efficient Guided Generation for Large Language Models”](https://arxiv.org/abs/2307.09702) (2023).
- Dong et al., [“XGrammar: Flexible and Efficient Structured Generation Engine for Large Language Models”](https://arxiv.org/abs/2411.15100) (2024).
- The [llguidance repository](https://github.com/guidance-ai/llguidance) and the [llama.cpp grammars guide](https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md).
- [vLLM structured outputs docs](https://docs.vllm.ai/en/latest/features/structured_outputs.html).

## Related

- [Structured outputs](#structured-outputs)
- [Decoding and sampling](#decoding-sampling)
- [Serving engines](#serving-engines)
- [Tool use and tool design](#agent-tools)
- [Prompt sensitivity and robust prompt testing](#prompt-robustness)
