---
id: api-shapes
book: 4
order: "4.7.1"
title: Chat Completions, Responses and Messages
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [model-apis, responses-api, messages-api, reasoning-tokens, compatibility]
visuals: []
prerequisites: [model-apis]
---
> [!tldr]
> Three request shapes dominate model APIs: Chat Completions exchanges role-tagged messages, OpenAI's Responses API exchanges typed items, and Anthropic's Messages API exchanges content blocks. They differ most where agents feel it: who keeps conversation state, how hidden reasoning is billed and carried between turns, which tools run on the provider's servers, and how streams are shaped. "OpenAI-compatible" promises a request shape, not the same behavior, so test reasoning, tools and streaming before you switch.

## Key ideas

- **Three data models.** Chat Completions takes and returns an array of `messages`, with the text in `choices[0].message.content`; Responses takes `input` (a string or a list of items) and returns a typed `output` array whose items, such as `message`, `reasoning`, `function_call` and `function_call_output`, you handle by `type` ([OpenAI, “Migrate to the Responses API”](https://developers.openai.com/api/docs/guides/migrate-to-responses)). Anthropic's Messages API returns a `content` array of blocks such as `text`, `thinking` and `tool_use`, and your code sends tool output back in a `tool_result` block ([Anthropic, “Using the Messages API”](https://platform.claude.com/docs/en/build-with-claude/working-with-messages); [Anthropic, “Thinking”](https://platform.claude.com/docs/en/build-with-claude/thinking); [Anthropic, “Tool use with Claude”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)).
- **Server-side state still costs tokens.** As of November 2026, responses are stored by default, `previous_response_id` chains a new turn to the last one, and the Conversations API keeps a persistent conversation object, but all prior input tokens in the chain are still billed as input, and `store: false` turns storage off ([OpenAI, “Migrate to the Responses API”](https://developers.openai.com/api/docs/guides/migrate-to-responses)). The Messages API is stateless, so you send the full conversation on every call; its message threads, in beta, let the API keep the conversation so that later requests send only new messages, and a thread expires 5 minutes after its last request ([Anthropic, “Using the Messages API”](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)). OpenAI shut down its older Assistants API on 26 August 2026 in favor of Responses and Conversations ([OpenAI, “Deprecations”](https://developers.openai.com/api/docs/deprecations)).
- **Reasoning is hidden, billed and carried in different ways.** In both APIs reasoning tokens are billed as output even when you never see them: OpenAI reports them in `usage.output_tokens_details.reasoning_tokens` and takes model-dependent `reasoning.effort` values, while Anthropic bills the full thinking even when a `thinking` block returns only a summary or nothing, depending on its `display` setting ([OpenAI, “Reasoning models”](https://developers.openai.com/api/docs/guides/reasoning); [Anthropic, “Thinking”](https://platform.claude.com/docs/en/build-with-claude/thinking)). To carry reasoning across turns without server state, you replay OpenAI's reasoning items with their `encrypted_content`, or return Anthropic's thinking blocks unchanged so the server can decrypt their `signature` (as of November 2026); the multi-turn details are in [Compaction, context editing and reasoning state](#context-compaction).
- **Server tools versus client tools.** Client tools run in your code: the model stops with a tool call, you run it and send back the result. Server tools run on the provider's infrastructure: as of November 2026, Anthropic lists `web_search`, `web_fetch`, `code_execution` and `tool_search` among its server tools, and Responses offers hosted web search, file search, code interpreter, computer use, remote MCP servers and image generation, none of which Chat Completions provides natively ([Anthropic, “Tool use with Claude”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview); [OpenAI, “Migrate to the Responses API”](https://developers.openai.com/api/docs/guides/migrate-to-responses)).
- **Streams have different grammars.** As of November 2026, a Messages stream sends `message_start`, then for each content block a `content_block_start`, one or more `content_block_delta` events and a `content_block_stop`, then `message_delta` events whose usage counts are cumulative and a final `message_stop`; each thinking block streams as `thinking_delta` events followed by a single `signature_delta` ([Anthropic, “Streaming messages”](https://platform.claude.com/docs/en/build-with-claude/streaming); [Anthropic, “Thinking”](https://platform.claude.com/docs/en/build-with-claude/thinking)). Responses streams typed, semantic events such as `response.created`, `response.output_text.delta` and `response.completed` ([OpenAI, “Streaming API responses”](https://developers.openai.com/api/docs/guides/streaming-responses)).
- **“OpenAI-compatible” is a narrow promise.** Hugging Face's router, for example, is a drop-in replacement for the Chat Completions API that covers chat tasks only, and as of November 2026 Amazon Bedrock exposes five shapes side by side: the Messages, Responses, Chat Completions, Converse and Invoke APIs ([Hugging Face, “Inference Providers”](https://huggingface.co/docs/inference-providers/index); [AWS, Amazon Bedrock overview](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)). A matching request shape does not guarantee matching reasoning, tool, caching or streaming behavior behind it ([Gateways and routers](#gateways-routers)).

## Planned visuals

- **`compare`:** the same two-turn conversation with one tool call written as a Chat Completions request, a Responses request and a Messages request, with linked highlights on roles, items, blocks and where the tool result goes.
- **`sequence`:** a streamed Messages response with thinking and a tool call, event by event with each payload shown, and a variant for the Responses event stream.
- **`diagram`:** where state and reasoning live: history held by the client versus responses stored on the server, with encrypted reasoning items and signed thinking blocks crossing the boundary.

## Talk like an expert

Engineers talk about **items** versus **content blocks**, **stateless** versus **stored** responses, **reasoning tokens**, **encrypted reasoning**, **thinking signatures**, **server tools** and **OpenAI-compatible endpoints**. They debug from the raw request and the raw event stream rather than the SDK's convenience text, and treat each shape as a data model with its own rules for state, reasoning and tools.

## Go deeper

- [OpenAI, “Migrate to the Responses API”](https://developers.openai.com/api/docs/guides/migrate-to-responses): items versus messages, stored state and hosted tools.
- [OpenAI, “Reasoning models”](https://developers.openai.com/api/docs/guides/reasoning): reasoning tokens, effort, summaries and encrypted reasoning.
- [Anthropic, “Thinking”](https://platform.claude.com/docs/en/build-with-claude/thinking): adaptive thinking, display modes, signatures and billing.
- [Anthropic, “Streaming messages”](https://platform.claude.com/docs/en/build-with-claude/streaming): the event flow of a Messages stream.

## Related

- [Model APIs in practice](#model-apis)
- [Reasoning models and test-time compute](#reasoning-models)
- [Structured outputs](#structured-outputs)
- [Prompt caching and token economics](#prompt-caching)
- [Gateways and routers](#gateways-routers)
- [Streaming](#streaming)
