---
id: encoders-and-decoders
book: 2
order: "2.4.1"
title: Encoders, decoders and encoder-decoders
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [encoders, decoders, bert, t5, cross-attention]
visuals: []
prerequisites: [transformer-block, attention]
---
> [!tldr]
> Transformers come in three families built from the same blocks: encoders that read a whole input at once, decoders that write one token at a time looking only backward, and encoder-decoders whose decoder also attends to the encoder's output. As of November 2026, decoder-only models dominate text generation, while encoders still power embeddings, rerankers and classifiers. Remember that the attention pattern and the training objective decide the family; the building blocks are largely shared.

## Key ideas

- **Three attention patterns.** A fully visible (bidirectional) mask lets every token see every other token, as in BERT and in T5's encoder; a causal mask lets a token see only earlier tokens; and in an encoder-decoder, each decoder block adds an attention layer over the encoder's output (cross-attention). A prefix LM mixes the first two in one stack: fully visible over the input, causal over the output (Raffel et al., [“Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer”](https://arxiv.org/abs/1910.10683) (2019)).
- **Each family has its objective.** BERT masks 15% of the WordPiece tokens and predicts them, plus next sentence prediction (Devlin et al., [“BERT”](https://arxiv.org/abs/1810.04805) (2018)); ModernBERT drops next sentence prediction and masks 30% (Warner et al., [“Smarter, Better, Faster, Longer”](https://arxiv.org/abs/2412.13663) (2024)). Decoders predict the next token ([Hugging Face LLM course](https://huggingface.co/learn/llm-course/chapter1/6)), while T5 replaces each corrupted span with a sentinel token and trains the decoder to output the dropped spans, a denoising objective called span corruption ([Raffel et al.](https://arxiv.org/abs/1910.10683)).
- **Why decoder-only won generation, and the counterevidence.** As of November 2026, major generative model families such as Llama, Gemma and DeepSeek V3 are decoder-only ([Hugging Face LLM course](https://huggingface.co/learn/llm-course/chapter1/6)): one stack trains on next-token prediction and generates by appending tokens, reusing cached keys and values ([the KV cache](#kv-cache)). In a controlled study with models of over 5B parameters, causal decoders had the best zero-shot generalization after plain pretraining, but non-causal models with masked objectives did best after multitask fine-tuning (Wang et al., [“What Language Model Architecture and Pretraining Objective Work Best for Zero-Shot Generalization?”](https://arxiv.org/abs/2204.05832) (2022)), and in T5's comparison the encoder-decoder with a denoising objective performed best on all tasks ([Raffel et al.](https://arxiv.org/abs/1910.10683)).
- **Where encoders still win.** Encoder-only models offer a strong performance-size trade-off for retrieval and classification compared with larger decoders, and they serve semantic search in RAG, classification, entity recognition and toxic-prompt detection; ModernBERT modernized the design with RoPE, GeGLU, almost no bias terms, global attention in every third layer and 128-token sliding windows elsewhere, and 8,192-token inputs ([Warner et al.](https://arxiv.org/abs/2412.13663)). A classic cross-encoder reranker is BERT fine-tuned to score query-passage pairs (Nogueira and Cho, [“Passage Re-ranking with BERT”](https://arxiv.org/abs/1901.04085) (2019)), and the Llama Prompt Guard 2 86M attack detector is built on mDeBERTa-base ([model card](https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M)).
- **Cross-attention or tokens in the sequence for images.** Flamingo conditions a frozen language model on images through new cross-attention layers interleaved between its layers (Alayrac et al., [“Flamingo”](https://arxiv.org/abs/2204.14198) (2022)), and Llama 3's vision adapter is also a series of cross-attention layers ([Llama 3 report](https://arxiv.org/html/2407.21783v3)). LLaVA instead projects image features into the word embedding space and puts the resulting visual tokens in the sequence (Liu et al., [“Visual Instruction Tuning”](https://arxiv.org/abs/2304.08485) (2023)).
- **Read the family from the config.** The `architectures` field names the head: [BERT's config](https://huggingface.co/google-bert/bert-base-uncased/blob/main/config.json) says `BertForMaskedLM`, [ModernBERT's](https://huggingface.co/answerdotai/ModernBERT-base/blob/main/config.json) `ModernBertForMaskedLM`, [Qwen3-8B's](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json) `Qwen3ForCausalLM`, and [T5's](https://huggingface.co/google-t5/t5-small/blob/main/config.json) `T5ForConditionalGeneration` together with `"is_encoder_decoder": true` ([Hugging Face Transformers: configuration](https://huggingface.co/docs/transformers/main_classes/configuration)).

## Planned visuals

- **`stepper`:** the four attention masks as matrices, one per frame: fully visible, causal, prefix LM, and cross-attention from decoder rows to encoder columns, with the model families that use each.
- **`diagram`:** the three families as stacks side by side, with cross-attention arrows from encoder to decoder and each output head linked to its chapter ([embeddings](#embeddings), [reranking](#reranking), generation).
- **`tree`:** which family fits which job: vectors for search, scores for reranking, labels for classification and guards, text for generation and translation.

## Talk like an expert

Experts say encoder-only, decoder-only and encoder-decoder (or seq2seq), talk about fully visible, causal and prefix masks and about masked, causal and span-corruption objectives, and recognize a checkpoint by its head class (`ForMaskedLM`, `ForCausalLM`, `ForConditionalGeneration`). They pick an encoder when the output is a vector, a score or a label, and a decoder when the output is text.

## Go deeper

- Devlin et al., [“BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding”](https://arxiv.org/abs/1810.04805) (2018).
- Raffel et al., [“Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer”](https://arxiv.org/abs/1910.10683) (2019).
- Warner et al., [“Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for Fast, Memory Efficient, and Long Context Finetuning and Inference”](https://arxiv.org/abs/2412.13663) (2024).
- [Hugging Face LLM course: Transformer architectures](https://huggingface.co/learn/llm-course/chapter1/6).

## Related

- [The transformer block](#transformer-block)
- [The transformer end to end](#transformer-overview)
- [Embeddings](#embeddings)
- [Reranking](#reranking)
- [Classic NLP tasks: classification, tagging, extractive QA, summarization and translation](#nlp-tasks)
- [Vision-language models](#vision-language-models)
