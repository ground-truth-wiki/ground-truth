---
id: model-types
book: 4
order: "4.0"
title: "Model types: base, instruct, reasoning and omni"
level: foundation
stability: moving
reviewed: "2026-11"
status: full
tags: [model-types, base-models, reasoning-models, multimodal, model-ids]
visuals:
  - model-types-map:diagram
  - model-types-chat-template:stepper
  - model-types-moe-calculator:calculator
  - model-types-book-map:tree
prerequisites: [mental-models, transformer-block]
---
> [!tldr]
> A model’s type says what training made it do. Pretraining makes a base model that continues text; post-training makes an instruct model that answers through a chat template; reinforcement learning adds reasoning, now often a switch on the same model. Read the type, the parameter counts and the limits before you compare two models.

## Why it matters
Many baffling results are type mismatches: a base model asked a question, an instruct model fed text without its template, a reasoning model thinking hard about a lookup, a mixture-of-experts model sized by the wrong parameter count. The model page tells you the type in a minute; this chapter gives you the vocabulary the rest of Book 4 assumes.

## Intuition
A base model is a graduate who has read a whole library but never held a job. Ask it a question and it may answer, or write three more questions. Post-training is the job training: conversation conventions, when to stop, what to refuse. Specialists are graduates retrained for one narrow job, such as turning text into vectors.

```viz
{"id":"model-types-map","component":"diagram","title":"Most model types start from one pretrained base, trained further for a different job","caption":"Illustrative and simplified: real recipes repeat and mix stages. Omni models are pretrained across modalities from the start, so their edge is dashed. Click a box for its chapter.","alt":"Diagram: a base model leads to an instruct model through post-training, then to a reasoning or hybrid model through reinforcement learning; a dashed edge leads to an omni model; another edge leads to specialists such as embedding models, rerankers and guard models.","data":"illustrative","try":"Click the specialists box for models built for one narrow job.","w":600,"h":200,"nodes":[
{"id":"base","label":"Base model","sub":"continues text","role":"model","x":0,"y":70,"w":160,"h":60,"link":"#pretraining-data"},
{"id":"instruct","label":"Instruct model","sub":"answers turns","role":"model","x":210,"y":0,"w":160,"h":60,"link":"#sft"},
{"id":"reasoning","label":"Reasoning or hybrid","sub":"can think first","role":"model","x":420,"y":0,"w":180,"h":60,"link":"#reasoning-models"},
{"id":"omni","label":"Omni model","sub":"text, image, audio","role":"model","x":420,"y":70,"w":180,"h":60,"link":"#multimodal-apps"},
{"id":"specialists","label":"Specialists","sub":"embedding, reranker, guard","role":"tool","x":260,"y":140,"w":220,"h":60,"link":"#specialist-models"}],
"edges":[{"from":"base","to":"instruct","label":"post-training","dx":-20},{"from":"instruct","to":"reasoning","label":"RL"},{"from":"base","to":"omni","label":"same recipe, more modalities","style":"dashed"},{"from":"base","to":"specialists","label":"adapt for one job","dx":8}]}
```

## How it works
**Base versus instruct.** Pretraining on a huge corpus creates a base model; fine-tuning on data formatted as messages turns it into a chat model ([Hugging Face, “Chat templates”](https://huggingface.co/docs/transformers/main/en/chat_templating)). Scale alone does not make an assistant: in Ouyang et al., [“Training language models to follow instructions with human feedback”](https://arxiv.org/abs/2203.02155) (2022), human evaluators preferred a 1.3B-parameter InstructGPT model to the 175B GPT-3. See [post-training](#post-training-overview).

Pick a base model for your own post-training, for plain continuation, or when calibrated probabilities matter: OpenAI, [“GPT-4 Technical Report”](https://arxiv.org/abs/2303.08774) (2023), found that post-training hurt calibration.

**Chat templates are the contract.** A chat model still continues one token sequence. Its template turns role-and-content messages into a string with control tokens, and two models fine-tuned from the same base can use different tokens. With the wrong ones, the Hugging Face guide warns, performance gets drastically worse. See [chat templates](#chat-templates).

```viz
{"id":"model-types-chat-template","component":"stepper","title":"A chat model sees one string: the template turns messages into the control tokens it was trained on","caption":"Illustrative conversation. The rendered strings follow the chat templates in the tokenizer configurations of zephyr-7b-beta and Mistral-7B-Instruct-v0.1 on Hugging Face.","alt":"Stepper: a list of messages is rendered by a chat template into a string with control tokens, a generation prompt is appended, the model continues until an end token, a second model from the same base expects different tokens, and a hosted API hides the template.","data":"illustrative","depicts":"Hugging Face Transformers chat templates: zephyr-7b-beta and Mistral-7B-Instruct-v0.1 formats","try":"Compare step 3 with step 5: same base model, different control tokens.","frames":[
{"label":"Messages","caption":"Your code holds a list of messages, each with a role and content. A hosted chat API accepts much the same shape.","code":"[{\"role\": \"system\", \"content\": \"You are terse.\"},\n {\"role\": \"user\", \"content\": \"Name one prime number.\"}]"},
{"label":"Render","caption":"The tokenizer’s chat template joins the messages into one string. Control tokens mark who speaks and where each turn ends.","tokens":["<|system|>","You are terse.","</s>","<|user|>","Name one prime number.","</s>"],"code":"<|system|>\nYou are terse.</s>\n<|user|>\nName one prime number.</s>\n"},
{"label":"Generation prompt","caption":"`add_generation_prompt=True` appends the assistant header. Without it, the model may continue the user’s message instead of replying.","tokens":["<|system|>","You are terse.","</s>","<|user|>","Name one prime number.","</s>","<|assistant|>"],"code":"<|system|>\nYou are terse.</s>\n<|user|>\nName one prime number.</s>\n<|assistant|>\n"},
{"label":"Generate","caption":"The model simply continues the string until it emits the end-of-turn token it learned in fine-tuning. The text before that token is the reply.","tokens":["<|assistant|>","7","</s>"]},
{"label":"Another contract","caption":"Mistral-7B-Instruct-v0.1 comes from the same base model as Zephyr but expects `[INST]` markers, and its template folds the system prompt into the first user turn. Feed it Zephyr’s tokens and quality drops.","tokens":["<s>","[INST]","You are terse.","Name one prime number.","[/INST]"],"code":"<s> [INST] You are terse.\n\nName one prime number. [/INST]","panel":"The template belongs to the fine-tuned model, not to its family or its base."},
{"label":"Hosted API","caption":"A hosted API takes messages like those in step 1, so you never write control tokens. A self-hosted OpenAI-compatible server such as vLLM needs a template, from the model’s tokenizer configuration or one you supply."}]}
```

A self-hosted vLLM server rejects chat requests for a model without a template ([vLLM, “Online serving”](https://docs.vllm.ai/en/stable/serving/online_serving/#chat-template)).

**Reasoning, non-reasoning and hybrid.** A reasoning model is trained, usually with reinforcement learning, to think before it answers (see [reasoning models](#reasoning-models)). Anthropic called Claude 3.7 Sonnet “the first hybrid reasoning model on the market” ([Anthropic, February 2025](https://www.anthropic.com/news/claude-3-7-sonnet)): it answers directly or thinks first, within a token budget. Yang et al., [“Qwen3 Technical Report”](https://arxiv.org/abs/2505.09388) (2025), unifies both modes the same way. As of November 2026, Anthropic’s current models think adaptively, steered by an effort setting, and some cannot turn thinking off ([Anthropic, “Thinking”](https://platform.claude.com/docs/en/build-with-claude/thinking)). Thinking tokens are billed as output.

**Omni models versus pipelines.** A pipeline chains specialists: speech recognition, a text model, speech synthesis. Hurst et al., [“GPT-4o System Card”](https://arxiv.org/abs/2410.21276) (2024), describes “an autoregressive omni model” trained end to end, where one network processes text, vision and audio. OpenAI’s [voice agents guide](https://developers.openai.com/api/docs/guides/voice-agents) covers both designs and, as of November 2026, suggests the pipeline when each stage needs to be visible or replaceable. See [speech and audio](#speech-audio).

**Non-generative types.** Embedding models map text to vectors (Reimers et al., [“Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks”](https://arxiv.org/abs/1908.10084), 2019), rerankers score a query and a passage together (Nogueira et al., [“Passage Re-ranking with BERT”](https://arxiv.org/abs/1901.04085), 2019), and guard models classify content for safety. The line blurs: Llama Guard is an instruction-tuned Llama 2 7B (Inan et al., [“Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations”](https://arxiv.org/abs/2312.06674), 2023). See [embeddings](#embeddings), [reranking](#reranking) and [guard models](#guard-models-moderation).

**Dense versus mixture of experts.** A dense model uses every parameter for every token. A [mixture-of-experts](#mixture-of-experts) model routes each token to a few experts: all its total parameters sit in memory, but only the active ones work on each token. Mixtral 8x7B has 47B total and 13B active (Jiang et al., [“Mixtral of Experts”](https://arxiv.org/abs/2401.04088), 2024); DeepSeek-V3 has 671B and 37B (DeepSeek-AI, [“DeepSeek-V3 Technical Report”](https://arxiv.org/abs/2412.19437), 2024).

```viz
{"id":"model-types-moe-calculator","component":"calculator","title":"Memory follows total parameters; compute per token follows active parameters","caption":"Defaults are DeepSeek-V3’s reported 671B total and 37B active parameters at 16-bit precision. Set active equal to total to see a dense model of the same size. Weights only: the KV cache and activations come on top.","alt":"Calculator: memory for weights from total parameters and bytes per parameter, forward compute per token from active parameters, and the ratio of total to active parameters.","data":"formula","try":"Set total to 47 and active to 13 for Mixtral 8x7B, then raise active to 47 to see what a dense model of that size would cost per token.","depicts":"DeepSeek-V3 Technical Report (2024) and Mixtral of Experts (2024)","inputs":{"total_b":671,"active_b":37,"bytes_per_param":2},"input_meta":{"total_b":{"label":"Total parameters","unit":"billions","min":0.1,"step":0.1},"active_b":{"label":"Active parameters per token","unit":"billions","min":0.1,"step":0.1},"bytes_per_param":{"label":"Precision","options":[["BF16 or FP16, 2 bytes",2],["FP8 or INT8, 1 byte",1],["INT4, 0.5 bytes",0.5]]}},"outputs":[{"id":"weights_gb","label":"Memory for weights","expr":"total_b * bytes_per_param","unit":"GB","main":true},{"id":"forward_flop","label":"Forward compute per token","expr":"2 * active_b * 1000000000","unit":"flop"},{"id":"ratio","label":"Total ÷ active","expr":"total_b / active_b","unit":"x"}],"assumptions":["Forward compute is about 2 FLOPs per active parameter per token (Kaplan et al., 2020), ignoring attention terms that grow with context.","1 GB = 10⁹ bytes. Weights only: no KV cache, activations or framework overhead.","Every expert stays in memory, although each token uses only a few."],"tests":[{"inputs":{},"expect":{"weights_gb":1342,"forward_flop":74000000000,"ratio":18.135135},"tol":0.0001},{"inputs":{"total_b":47,"active_b":13},"expect":{"weights_gb":94,"forward_flop":26000000000},"tol":0.0001},{"inputs":{"total_b":70,"active_b":70,"bytes_per_param":1},"expect":{"weights_gb":70,"ratio":1}}]}
```

**Capability classes.** Foundation models are trained on broad data at scale and adapt to many tasks (Bommasani et al., [“On the Opportunities and Risks of Foundation Models”](https://arxiv.org/abs/2108.07258), 2021). “Frontier” is relative: Anderljung et al., [“Frontier AI Regulation: Managing Emerging Risks to Public Safety”](https://arxiv.org/abs/2307.03718) (2023), use it for highly capable foundation models that could have dangerous capabilities. “Small” has no agreed cutoff. See [frontier families](#frontier-families) and [small and local models](#small-local-models).

## In practice
**Read the model ID.** An ID packs family, tier, version and sometimes a snapshot date. In `claude-haiku-4-5-20251001` the date marks a snapshot, and the alias `claude-haiku-4-5` points to the latest snapshot of that version; from the 4.6 generation on, dateless IDs such as `claude-opus-4-6` are pinned snapshots themselves ([Anthropic, “Model IDs and versioning”](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)). `mistralai/Mistral-7B-Instruct-v0.1` reads as organization, family, size, type and version. Pin IDs in production; see [model versions and deprecations](#model-lifecycle).

**Read the limits.** The context window holds the whole request, input and output; max output caps one response, and thinking tokens count toward it ([Anthropic, “Context windows”](https://platform.claude.com/docs/en/build-with-claude/context-windows)).

**Read the cutoffs.** The reliable knowledge cutoff is the date through which knowledge is most extensive and reliable; the training data cutoff covers the broader range of data. For Claude Haiku 4.5 they are February and July 2025 ([Anthropic, “Claude Haiku 4.5”](https://platform.claude.com/docs/en/models/haiku-4-5/overview)).

**Look at the template before you trust a self-hosted model:**

```python
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("<instruct-model-id>")
messages = [
    {"role": "system", "content": "You are terse."},
    {"role": "user", "content": "Name one prime number."},
]
# add_generation_prompt appends the assistant header, so the model replies
# instead of continuing the user's message
print(tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True))
```

Then go where your question leads:

```viz
{"id":"model-types-book-map","component":"tree","title":"Book 4 answers four questions: what exists, how to read claims, how to choose, how to call","caption":"Expand a question and click a chapter. Some chapters are seeds that will grow.","alt":"Tree of Book 4 chapters grouped by question: what exists, how to read claims about a model, how to choose one, and how to call it.","data":"illustrative","open":1,"root":{"label":"Book 4: the model landscape","children":[
{"label":"What exists?","children":[{"label":"Frontier model families","link":"#frontier-families"},{"label":"Reasoning models and test-time compute","link":"#reasoning-models"},{"label":"Small and local models","link":"#small-local-models"},{"label":"Specialist models","link":"#specialist-models"},{"label":"Multilingual and low-resource language models","link":"#multilingual-models"}]},
{"label":"How do I read claims about a model?","children":[{"label":"Reading model cards and system cards","link":"#model-documentation"},{"label":"Benchmark literacy","link":"#benchmark-literacy"},{"label":"Arenas and leaderboards","link":"#arenas-leaderboards"}]},
{"label":"How do I choose?","children":[{"label":"Choosing a model","link":"#choosing-a-model"},{"label":"Model licenses and openness definitions","link":"#model-licenses"},{"label":"Model versions, previews and deprecations","link":"#model-lifecycle"}]},
{"label":"How do I call it?","children":[{"label":"Model APIs in practice","link":"#model-apis"},{"label":"Chat Completions, Responses and Messages","link":"#api-shapes"},{"label":"Cloud AI platforms and inference providers","link":"#cloud-ai-platforms"},{"label":"Model hubs and the Hugging Face ecosystem","link":"#hugging-face-ecosystem"}]}]}}
```

## Numbers to know
> [!number]
> Rules of thumb. Forward compute is about 2 FLOPs per parameter per token (Kaplan et al., [“Scaling Laws for Neural Language Models”](https://arxiv.org/abs/2001.08361), 2020); for mixture-of-experts models, count active parameters. Weight memory is total parameters × bytes per parameter: 7B parameters at 16 bits need about 14 GB before any [KV cache](#kv-cache). As of November 2026, Anthropic lists a 1M-token context window and 128K max output for each current model ([Anthropic, “Models overview”](https://platform.claude.com/docs/en/models/overview)).

## Pitfalls and anti-patterns
> [!pitfall] Prompting a base model like an assistant
> A base model continues text, so a question may get more questions. Use the instruct variant, or frame the task as a document to complete (see [in-context learning](#in-context-learning)).

> [!pitfall] Formatting chat prompts by hand
> Wrong control tokens, or special tokens added twice, hurt quality silently. Use `apply_chat_template`; if you tokenize its string output later, pass `add_special_tokens=False` (Hugging Face guide).

- **Sizing GPUs by active parameters.** Every expert must fit in memory. See [memory math](#memory-math).
- **Reading the context window as answer length.** Max output is far smaller, and thinking spends it too.
- **Trusting knowledge up to the training data cutoff.** Coverage after the reliable cutoff is thin; plan for [grounding](#grounding-citations).

## Talk like an expert
The vocabulary: **base model**, **instruct model**, **chat template**, **control tokens**, **hybrid reasoning**, **adaptive thinking**, **effort**, **omni model**, **cascaded pipeline**, **total and active parameters**, **snapshot**, **alias**. Experts name the type before the brand (“the 8B base, not the instruct”) and quote mixture-of-experts models by both counts. The live debate is whether model types stay separate or merge into one model with dials.

> [!hottake] “Reasoning model” is becoming a request setting, not a model type.
> Hybrid and adaptive models put thinking on a dial: the choice moves from which model to how much effort. **The counterargument:** Qwen3 launched with both modes in one model, but its 2507 update shipped separate [non-thinking](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507) and [thinking-only](https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507) checkpoints. Separate weights can still be the better trade-off.

## Check yourself
```quiz
model-types
```

## Go deeper
- Ouyang et al., [“Training language models to follow instructions with human feedback”](https://arxiv.org/abs/2203.02155) (2022).
- Hurst et al., [“GPT-4o System Card”](https://arxiv.org/abs/2410.21276) (2024).
- [Hugging Face, “Chat templates”](https://huggingface.co/docs/transformers/main/en/chat_templating).
- [Anthropic, “Models overview”](https://platform.claude.com/docs/en/models/overview).

## Related
- [Frontier model families](#frontier-families)
- [Reasoning models and test-time compute](#reasoning-models)
- [Specialist models](#specialist-models)
- [Model APIs in practice](#model-apis)
- [Post-training: from base model to assistant](#post-training-overview)
- [Model versions, previews and deprecations](#model-lifecycle)
