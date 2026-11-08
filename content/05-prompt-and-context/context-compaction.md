---
id: context-compaction
book: 5
order: "5.4.1"
title: Compaction, context editing and reasoning state
level: expert
stability: volatile
reviewed: "2026-11"
status: seed
tags: [compaction, prompt-compression, context-editing, reasoning-state, agents]
visuals: []
prerequisites: [context-engineering, prompt-caching]
---
> [!tldr]
> When a long session nears its context limit, something has to give: you summarize old turns, clear old tool results or thinking, compress the prompt, or move state into files. Reasoning models add a second problem: their reasoning state travels as signed or encrypted blocks that must be returned unchanged, and every edit to earlier context breaks the prompt cache from that point on. Start with the cheapest method that keeps the task succeeding, and measure task success after compaction, not only tokens saved.

## Key ideas

- **Several ways to carry less forward.** You can summarize older turns into a brief (compaction), clear old tool results or thinking blocks, compress the prompt itself, or offload state to files and keep only references; Anthropic calls tool-result clearing one of the safest, lightest-touch forms of compaction and describes structured notes, such as a to-do list or a NOTES.md file, kept outside the window and read back later (Anthropic, [“Effective context engineering for AI agents”](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (2025)). Prompt compression comes in two families: hard methods such as Selective Context, LLMLingua and LLMLingua-2 delete less informative tokens and keep natural language, while soft methods such as gist tokens encode the prompt into continuous vectors people cannot read (Li et al., [“Prompt Compression for Large Language Models: A Survey”](https://arxiv.org/abs/2410.12388) (2024)).
- **Simple masking is a strong baseline.** On SWE-bench Verified with five model configurations, replacing environment observations older than a window of recent turns with a placeholder, while keeping the agent's full reasoning and actions, roughly halved cost against the raw agent and matched the solve rate of LLM summarization; a hybrid of the two cut cost by a further 7% against masking and 11% against summarization (Lindenbauer et al., [“The Complexity Trap: Simple Observation Masking Is as Efficient as LLM Summarization for Agent Context Management”](https://arxiv.org/abs/2508.21433) (2025)).
- **Write and test the compaction prompt, and know when to start fresh.** Anthropic describes Claude Code's compaction as keeping architectural decisions, unresolved bugs and implementation details while dropping redundant tool outputs, and advises tuning the prompt for recall first and precision second ([Anthropic, 2025](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)); test the summary by asking whether a fresh model can continue the task from it alone. For multi-session work, Anthropic's long-running harness states that compaction is not sufficient and has each new session start by reading a progress file and the git log (Anthropic, [“Effective harnesses for long-running agents”](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (2025)).
- **Providers now compact for you (as of November 2026).** Claude offers compaction on demand (beta header `compact-2026-09-04`, top-level `compaction` parameter) or at a token threshold, with options to keep recent turns word for word or compact in the background, and separate context editing that clears old tool results (`clear_tool_uses_20250919`) or old thinking (`clear_thinking_20251015`) by rule (Anthropic, [compaction](https://platform.claude.com/docs/en/build-with-claude/compaction) and [context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing) docs). OpenAI's Responses API compacts server-side when `context_management` sets a `compact_threshold`, or on request through `/responses/compact`, and returns an encrypted, opaque compaction item that you pass back in later requests (OpenAI, [compaction guide](https://developers.openai.com/api/docs/guides/compaction)).
- **Reasoning state must round-trip unchanged (as of November 2026).** Claude requires the entire unmodified thinking block, with its signature, next to the tool results it belongs to, and returns an error if the block was modified ([Claude context windows docs](https://platform.claude.com/docs/en/build-with-claude/context-windows)); OpenAI's Responses API needs the reasoning items returned with function calls passed back with the tool outputs, in their original order, and in stateless mode (`store` false or Zero Data Retention) each reasoning item carries an `encrypted_content` field by default ([OpenAI reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)); and Gemini 4 and Gemini 3 models return a 400 error when the first function call in any step of the current turn lacks its thought signature. A proxy, serializer or gateway that drops, edits or reorders these blocks breaks the contract, so test the round trip; Gemini discourages injecting function calls it did not generate and documents a dummy signature for cases where that cannot be avoided, such as a trace moved over from another model (Google, [thought signatures](https://aistudio.google.com/docs/thought-signatures)).
- **Every edit costs cache, and kept reasoning costs input.** Judge a scheme on tokens per step, cache hit rate and task success after compaction: Claude's docs state that clearing tool results invalidates cached prefixes (so clear enough tokens at once to justify the new cache write), that clearing thinking invalidates the cache at that point ([context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing)), and that on models that keep earlier thinking blocks, those blocks are billed as input tokens in later requests ([context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)).

## Planned visuals

- `compare`: the same coding-agent history after LLM summarization and after observation masking, with linked highlights showing what each keeps (actions, reasoning, recent observations) and what each drops. Illustrative.
- `sequence`: one tool-call round trip with reasoning on, step by step, showing the thinking block, encrypted reasoning item or thought signature that must come back unchanged, and the error when a gateway drops or reorders it. Depicts the provider docs as of November 2026.
- `diagram`: a cached prompt prefix with three edit points (tool-result clearing, thinking clearing, compaction), shading everything after each point as a cache miss, so a reader sees why append-only context is cheap.

## Talk like an expert

Experts talk about **compaction**, **observation masking**, **tool-result clearing**, **thinking-block clearing**, **prompt compression**, **reasoning items** and **thought signatures**, and judge every context operation by what it costs in cache misses and what it does to the next step's success; their default is to keep context append-only until a threshold, then make one deliberate cut.

## Go deeper

- Lindenbauer et al., [“The Complexity Trap: Simple Observation Masking Is as Efficient as LLM Summarization for Agent Context Management”](https://arxiv.org/abs/2508.21433) (2025).
- Li et al., [“Prompt Compression for Large Language Models: A Survey”](https://arxiv.org/abs/2410.12388) (2024).
- Anthropic, [Compaction overview](https://platform.claude.com/docs/en/build-with-claude/compaction) and [Context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing) in the Claude API docs.
- OpenAI, [Reasoning models](https://developers.openai.com/api/docs/guides/reasoning) guide, on keeping reasoning items in context.

## Related

- [Context engineering](#context-engineering)
- [Prompt caching and token economics](#prompt-caching)
- [Long-running and durable agents](#long-running-agents)
- [Reasoning models and test-time compute](#reasoning-models)
- [Memory](#agent-memory)
- [Model APIs in practice](#model-apis)
