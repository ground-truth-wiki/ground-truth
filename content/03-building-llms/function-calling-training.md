---
id: function-calling-training
book: 3
order: "3.8.1"
title: Training models for tool use and function calling
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [tool-use, function-calling, sft, chat-templates, agentic-rl]
visuals: []
prerequisites: [sft, agentic-rl]
---
> [!tldr]
> A model calls a function by writing text in a format it learned in training: the chat template renders tool schemas into the prompt, and tool calls and results into special tokens or tagged text. Teams teach tool use with SFT on multi-turn trajectories, with tool outputs masked from the loss, and then with RL on whole trajectories. Remember that the trained format is part of the model, so fine-tune and serve it with exactly that template.

## Key ideas

- **Chat templates turn schemas into tokens.** A template receives tools as a list of JSON schemas in the `tools` variable, tool calls as a `tool_calls` list on assistant messages and results as `tool`-role messages, and renders them in the model's own trained format; Command-R, for example, renders tools as Python function headers, and the Transformers docs warn that whitespace and special tokens must match training exactly ([Hugging Face Transformers, “Writing a chat template”](https://huggingface.co/docs/transformers/main/en/chat_templating_writing)). Some models mark tool calls with special tokens, others keep the structure in plain text ([Lambert, “Tool Use and Function Calling”, RLHF book](https://rlhfbook.com/c/13-tools)), and hosted APIs do the rendering for you: as of November 2026, Anthropic's API adds a special tool-use system prompt whenever tools are passed ([Anthropic, “Tool use with Claude”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)).
- **SFT data is trajectories, and tool outputs are masked.** A training example is a message list with tool calls and tool results plus a `tools` column of JSON schemas, a shape that TRL's SFT and DPO trainers accept as of November 2026 ([Hugging Face TRL, Dataset formats](https://huggingface.co/docs/trl/dataset_formats)). The tokens of tool outputs are masked from the loss, so the model learns only from the calls and answers it generates ([Lambert, RLHF book](https://rlhfbook.com/c/13-tools)); in TRL, `assistant_only_loss=True` does this, but only with a chat template that marks the assistant's generated spans ([Hugging Face TRL, SFT Trainer](https://huggingface.co/docs/trl/sft_trainer)).
- **Reasoning across tool calls is a training and serving choice.** Some models keep their reasoning tokens between tool calls within one turn and erase them between turns to save serving cost, which is a design decision rather than a rule ([Lambert, RLHF book](https://rlhfbook.com/c/13-tools)). Providers differ: as of November 2026, Anthropic's docs say Claude Opus 4.5 and models numbered 4.6 and higher keep earlier turns' thinking blocks in context, while Claude Sonnet 4.5, Claude Haiku 4.5 and earlier models strip them ([Anthropic, “Extended thinking”](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)).
- **Tool-use data grew from self-supervision to synthetic API corpora.** Toolformer taught a model to insert calls to a calculator, a Q&A system, two search engines, a translator and a calendar, self-supervised from a handful of demonstrations per API ([Schick et al., “Toolformer: Language Models Can Teach Themselves to Use Tools” (2023)](https://arxiv.org/abs/2302.04761)). ToolLLM used ChatGPT to build ToolBench over 16,464 real REST APIs ([Qin et al., “ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs” (2023)](https://arxiv.org/abs/2307.16789)), and Gorilla fine-tuned LLaMA to write API calls with a documentation retriever and introduced APIBench ([Patil et al., “Gorilla: Large Language Model Connected with Massive APIs” (2023)](https://arxiv.org/abs/2305.15334)).
- **RL scores whole trajectories.** In tool-use RL the model works through a full trajectory with its environment and tools before any reward arrives, which is closer to classic RL than per-sample RLHF ([Lambert, RLHF book](https://rlhfbook.com/c/13-tools)); see [agentic RL](#agentic-rl). As of November 2026, TRL's GRPOTrainer can train agents over several tool-calling turns ([Hugging Face TRL, GRPO Trainer](https://huggingface.co/docs/trl/grpo_trainer)), and its DistillationTrainer runs tools during generation, masks tool-result tokens out of the loss and needs a chat template that does not re-render earlier messages when a tool message is appended ([Hugging Face TRL, Distillation Trainer](https://huggingface.co/docs/trl/distillation_trainer)).
- **Evaluation measures calls and reliability, and trained formats carry into deployment.** BFCL checks serial and parallel calls by matching abstract syntax trees and also tests abstention and stateful multi-step use; its authors find single-turn calls handled well while memory, dynamic decisions and long-horizon reasoning remain open ([Patil et al., “The Berkeley Function Calling Leaderboard (BFCL)” (ICML 2025)](https://proceedings.mlr.press/v267/patil25a.html)). τ-bench compares the final database state with the goal and reports pass^k, success on all of k tries, where gpt-4o solved under 50% of tasks and scored under 25% pass^8 in retail ([Yao et al., “τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains” (2024)](https://arxiv.org/abs/2406.12045)); and for tools such as bash and the text editor, Anthropic says it publishes the schema and trains Claude on it (as of November 2026), so the tool format a harness uses is part of what the model learned ([Anthropic, “Tool use with Claude”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)).

## Planned visuals

- **`compare`:** one tool-calling exchange as structured messages (tools, user, assistant `tool_calls`, tool result, answer) beside the same exchange rendered by a chat template, with linked highlights from each message to its tokens (illustrative).
- **`sequence`:** a multi-turn tool trajectory as training data, step by step, with each message marked as trained or masked and the reasoning between calls kept or dropped.
- **`chart`:** pass@k and pass^k against k for a fixed per-try success rate p, computed as 1 − (1 − p)^k and p^k, to show why reliability falls as k grows (formula).

## Talk like an expert

Experts talk about tool schemas, `tool_calls` and the tool role, chat templates, loss masking and assistant-only loss, interleaved thinking, parallel calls, abstention, AST matching and pass^k. They ask which format a model was trained on before blaming it for bad calls, and they report pass^k when reliability matters.

## Go deeper

- Lambert, [“Tool Use and Function Calling”](https://rlhfbook.com/c/13-tools), chapter of the RLHF book.
- Hugging Face Transformers, [“Writing a chat template”](https://huggingface.co/docs/transformers/main/en/chat_templating_writing), section on templates for tools.
- Patil et al., [“The Berkeley Function Calling Leaderboard (BFCL): From Tool Use to Agentic Evaluation of Large Language Models”](https://proceedings.mlr.press/v267/patil25a.html) (ICML 2025).
- Yao et al., [“τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains”](https://arxiv.org/abs/2406.12045) (2024).

## Related

- [Agentic RL and environments](#agentic-rl)
- [Tool use and tool design](#agent-tools)
- [Supervised fine-tuning](#sft)
- [Structured outputs](#structured-outputs)
- [Model APIs in practice](#model-apis)
- [Evaluating agents](#evaluating-agents)
