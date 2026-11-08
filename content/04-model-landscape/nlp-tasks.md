---
id: nlp-tasks
book: 4
order: "4.4.1"
title: "Classic NLP tasks: classification, tagging, extractive QA, summarization and translation"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [nlp, text-classification, named-entity-recognition, encoders, task-models]
visuals: []
prerequisites: [specialist-models]
---
> [!tldr]
> Classic NLP tasks are defined by the shape of their output: one label for a whole text (classification), one label per token (tagging), a span copied from the input (extractive question answering), or new text (summarization and translation). Each can be solved with a fine-tuned encoder and a small task head, a sequence-to-sequence model, or a prompted LLM with structured outputs. With labeled data for the task, a fine-tuned small encoder can still beat a zero-shot prompted large model.

## Key ideas

- **Labels for texts, tokens and pairs.** Text classification gives a whole text one label, such as a sentiment, topic or intent, and is scored with the measures in [classification metrics](#classification-metrics). Token classification gives every token a label; in named entity recognition, `B-` marks the beginning of an entity, `I-` a token inside it and `O` a token outside any entity, and seqeval scores the result with precision, recall, F1 and accuracy ([Hugging Face, Token classification](https://huggingface.co/docs/transformers/tasks/token_classification)). Natural language inference classifies a pair of texts: does the hypothesis follow from the premise (entailment), does its negation follow (contradiction), or neither (neutral)? ([Dive into Deep Learning, 16.4](https://d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-and-dataset.html)).
- **Spans versus generated text.** Extractive question answering predicts the start and end positions of the answer inside a given context, while abstractive question answering writes the answer ([Hugging Face, Question answering](https://huggingface.co/docs/transformers/tasks/question_answering)); SQuAD, the dataset the Hugging Face question answering guide uses, has over 100,000 crowdsourced questions whose answers are spans of Wikipedia passages (Rajpurkar et al., [“SQuAD: 100,000+ Questions for Machine Comprehension of Text”](https://arxiv.org/abs/1606.05250) (2016)), scored by exact match and F1 ([Hugging Face LLM course, 7.7](https://huggingface.co/learn/llm-course/chapter7/7)). Summarization and translation generate text and are scored against references with [reference-based text metrics](#text-generation-metrics), ROUGE for summaries and SacreBLEU for translation in the Hugging Face course ([7.5](https://huggingface.co/learn/llm-course/chapter7/5), [7.4](https://huggingface.co/learn/llm-course/chapter7/4)).
- **Three ways to solve each task.** You can use a fine-tuned encoder with a task head, as in the Transformers guides that fine-tune DistilBERT for entity recognition and question answering ([token classification](https://huggingface.co/docs/transformers/tasks/token_classification), [question answering](https://huggingface.co/docs/transformers/tasks/question_answering)); a sequence-to-sequence model such as T5, which casts every text problem as text in, text out, with a task prefix such as `summarize:` (Raffel et al., [“Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer”](https://arxiv.org/abs/1910.10683) (2019)); or a prompted LLM whose answer is constrained to a schema, see [structured outputs](#structured-outputs). [Encoders](#encoders-and-decoders) are still being built for this work: ModernBERT was trained on 2 trillion tokens with a native 8,192-token context and evaluated on classification and retrieval (Warner et al., [“Smarter, Better, Faster, Longer”](https://arxiv.org/abs/2412.13663) (2024)).
- **Subwords, padding and long inputs need care.** A word-level label must be realigned when the tokenizer splits a word: map tokens to words with `word_ids`, label only the first subtoken, and give special tokens and the other subtokens the label `-100` so the loss ignores them ([Hugging Face, Token classification](https://huggingface.co/docs/transformers/tasks/token_classification)). For question answering, truncate only the context (`truncation="only_second"`) and split long contexts into overlapping windows; the course uses a maximum length of 384 tokens with a stride of 128 ([Hugging Face LLM course, 7.7](https://huggingface.co/learn/llm-course/chapter7/7)). Padding each batch to its longest sequence and truncating to the model's maximum length works in most cases ([Hugging Face, Padding and truncation](https://huggingface.co/docs/transformers/main/en/pad_truncation)).
- **A fine-tuned encoder or a prompted LLM?** Zero-shot prompting promises to remove the need for manually labeled training data and task-specific training. One study tested that promise on sentiment, approval, emotion and party-position classification of news, tweets and speeches. Fine-tuned BERT-style models beat zero-shot ChatGPT (GPT-3.5 and GPT-4) and Claude 3 Opus in every case the authors examined, their performance began to saturate after around 200 labels, and they are small enough to store, train and run on a local machine (Bucher and Martini, [“Fine-Tuned 'Small' LLMs (Still) Significantly Outperform Zero-Shot Generative AI Models in Text Classification”](https://arxiv.org/abs/2406.08660) (2024)). That makes them a case of [small and local models](#small-local-models).
- **The classic benchmarks saturated,** the pattern described in [benchmark literacy](#benchmark-literacy). When SQuAD was released, a logistic regression model reached 51.0% F1 against 86.8% for humans ([Rajpurkar et al.](https://arxiv.org/abs/1606.05250)); by 2019, performance on the GLUE suite had surpassed the level of non-expert humans, leaving little headroom, which is why SuperGLUE introduced harder tasks (Wang et al., [“SuperGLUE: A Stickier Benchmark for General-Purpose Language Understanding Systems”](https://arxiv.org/abs/1905.00537) (2019)). Today SQuAD serves as a fine-tuning exercise in the [Hugging Face course](https://huggingface.co/learn/llm-course/chapter7/7).

## Planned visuals

- **`tokens`:** one sentence split into subwords with its BIO labels, showing which subtokens carry a label and which get `-100`.
- **`compare`:** the same entity recognition request solved two ways, an encoder with a token-classification head and a prompted LLM returning a JSON schema, with their inputs, outputs and what each costs per call (illustrative).
- **`tree`:** fine-tuned encoder or prompted LLM, by labeled data, volume, latency budget, need for calibrated scores and how often the label set changes.

## Talk like an expert

Experts say **sequence classification**, **token classification**, **BIO tagging**, **span extraction**, **entity-level F1**, **exact match** and **text-to-text**, and start every design with the shape of the output. They often prototype with a prompted LLM, consider a fine-tuned encoder for production, and measure both on the same labeled set.

## Go deeper

- [Hugging Face LLM course, chapter 7: Classical NLP tasks](https://huggingface.co/learn/llm-course/chapter7/1).
- Jurafsky and Martin, [Speech and Language Processing, 3rd edition draft](https://web.stanford.edu/~jurafsky/slp3/), chapters on text classification, sequence labeling, masked language models and machine translation.
- Warner et al., [“Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for Fast, Memory Efficient, and Long Context Finetuning and Inference”](https://arxiv.org/abs/2412.13663) (2024).
- Bucher and Martini, [“Fine-Tuned 'Small' LLMs (Still) Significantly Outperform Zero-Shot Generative AI Models in Text Classification”](https://arxiv.org/abs/2406.08660) (2024).

## Related

- [Specialist models](#specialist-models)
- [Encoders, decoders and encoder-decoders](#encoders-and-decoders)
- [Structured outputs](#structured-outputs)
- [Classification and regression metrics](#classification-metrics)
- [Metrics and graders](#metrics-graders)
- [Small and local models](#small-local-models)
