---
id: chat-templates
book: 5
order: "5.8.1"
title: Chat templates, message roles and prompt formats
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [chat-templates, message-roles, special-tokens, open-weight-models, harmony]
visuals: []
prerequisites: [model-specific-notes, tokenization]
---
> [!tldr]
> A chat model never sees a list of messages. A chat template renders roles, tool definitions, tool calls and reasoning into one token sequence marked with special control tokens, and the model works well only in the exact format it was trained on. Hosted APIs do this for you; with open weights you own it, and a wrong template, a missing generation prompt or a duplicated BOS token degrades quality without any error.

## Key ideas

- **Messages become one token sequence.** Every chat is still a sequence of tokens: the list of role and content messages is rendered with control tokens, such as `<|im_start|>` and `<|im_end|>` around each message in ChatML, the format used by models like SmolLM2 and Qwen 2 ([Hugging Face LLM Course, chapter 11.2](https://huggingface.co/learn/llm-course/chapter11/2)). Even models fine-tuned from the same base can use different formats, as Mistral-7B-Instruct with its `[INST]` markers and Zephyr-7B with `<|user|>` and `<|assistant|>` do, and Hugging Face's documentation warns that with the wrong control tokens these models perform drastically worse ([Hugging Face Transformers, chat templates](https://huggingface.co/docs/transformers/en/chat_templating)).
- **Roles carry rank.** In OpenAI's Model Spec, the chain of command puts platform rules above developer instructions and developer instructions above user instructions, while assistant and tool messages, quoted text and attachments carry no authority, so instructions inside them are treated as information ([OpenAI Model Spec, 2025-04-11](https://model-spec.openai.com/2025-04-11.html)); see the [instruction hierarchy](#model-specs-instruction-hierarchy) and [prompt injection](#prompt-injection). Inside a message the structure is yours to choose: OpenAI's guide suggests Markdown headings and lists to mark sections and XML tags to delimit material such as reference documents ([OpenAI prompt engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering)).
- **Templates ship with the tokenizer.** A chat template is a Jinja template saved with the tokenizer (as `chat_template.jinja`) and applied by `apply_chat_template`, which passes any extra keyword arguments into the template; `add_generation_prompt` appends the header that starts an assistant reply, without which the model may continue the user's message, and `continue_final_message` removes the end tokens so the model continues a prefilled reply, and the two cannot be combined ([Hugging Face, writing a chat template](https://huggingface.co/docs/transformers/en/chat_templating_writing); [chat templates](https://huggingface.co/docs/transformers/en/chat_templating)). Thinking toggles live in templates too: Qwen3's `enable_thinking` defaults to true and wraps reasoning in a `<think>` block, and its model card says history should hold only the final output, not the thinking ([Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B)).
- **Tools are rendered as text the model was trained on.** Tools reach the template as JSON schemas (Python functions are converted), tool calls go in the `tool_calls` field of an assistant message and results in `tool` messages, and a template may reformat all of this radically: Command-R's template renders tool definitions as Python function headers ([Hugging Face, writing a chat template](https://huggingface.co/docs/transformers/en/chat_templating_writing)). Transformers expects tool-call arguments as a dict while the OpenAI API sends a JSON string, a mismatch its docs say can cause errors or strange model behavior ([Hugging Face, tool use](https://huggingface.co/docs/transformers/en/chat_extras)).
- **Harmony adds channels to roles.** OpenAI's gpt-oss models were trained on the harmony format and do not work correctly without it; it ranks roles system > developer > user > assistant > tool, routes chain of thought to an `analysis` channel that should not be shown to users, function tool calls usually to `commentary` and the answer to `final`, and marks messages with tokens such as `<|start|>`, `<|channel|>`, `<|message|>`, `<|end|>`, `<|return|>` and `<|call|>`. Earlier analysis is dropped once a reply ends in the final channel, except during tool calling, and API providers and tools such as Ollama handle the format for you ([OpenAI harmony response format](https://developers.openai.com/cookbook/articles/openai-harmony)).
- **Special-token bugs are silent, and servers apply the template for you.** Some tokenizers add BOS and EOS tokens themselves, so rendering with `tokenize=False` and tokenizing again can duplicate them unless you pass `add_special_tokens=False` ([Hugging Face, chat templates](https://huggingface.co/docs/transformers/en/chat_templating)), and Jinja whitespace that was not present in training can harm performance ([Hugging Face, writing a chat template](https://huggingface.co/docs/transformers/en/chat_templating_writing)). vLLM's OpenAI-compatible server applies the model's own template on the server and rejects every chat request if the model has none, unless you pass one with `--chat-template` ([vLLM online serving docs](https://docs.vllm.ai/en/latest/serving/online_serving/)).

## Planned visuals

- `compare`: the same three-message conversation rendered by a ChatML-style template, a Mistral `[INST]` template and harmony, with linked highlights on each role marker, the generation prompt and the end tokens. Illustrative.
- `code-walk`: a short Jinja chat template where each highlighted line lights up the part of the rendered text it produces: the BOS token, each role header, the tool definitions and the generation prompt.
- `stepper`: a tool-call round trip as the model sees it: tool definitions in the system turn, the assistant's tool call, the tool result message and the generation prompt for the final answer. Illustrative.

## Talk like an expert

Experts say **chat template**, **control** or **special tokens**, **generation prompt**, **prefill**, **chain of command** and **channels**, and when an open model underperforms their first check is the rendered prompt: print the exact string the template produced and compare it with the format the model card documents.

## Go deeper

- Hugging Face Transformers, [Chat templates](https://huggingface.co/docs/transformers/en/chat_templating) and [Writing a chat template](https://huggingface.co/docs/transformers/en/chat_templating_writing).
- OpenAI, [harmony response format](https://developers.openai.com/cookbook/articles/openai-harmony) (cookbook).
- [OpenAI Model Spec](https://model-spec.openai.com/2025-04-11.html), version of 2025-04-11, on the chain of command.
- Hugging Face LLM Course, [chapter 11.2: chat templates](https://huggingface.co/learn/llm-course/chapter11/2).

## Related

- [Model-specific notes](#model-specific-notes)
- [Supervised fine-tuning](#sft)
- [Tokenization](#tokenization)
- [Prompt injection](#prompt-injection)
- [Serving engines](#serving-engines)
- [Model APIs in practice](#model-apis)
