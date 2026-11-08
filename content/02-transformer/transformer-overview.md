---
id: transformer-overview
book: 2
order: "2.0"
title: The transformer end to end
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [transformer, architecture, overview, next-token-prediction, learning-path]
visuals:
  - transformer-overview-journey:stepper
  - transformer-overview-train-vs-generate:compare
  - transformer-overview-families:diagram
  - transformer-overview-map:tree
prerequisites: [neural-networks, linear-algebra]
---
> [!tldr]
> A transformer language model turns text into token ids, looks up a vector for each, passes the vectors through a stack of identical blocks, and turns the last position’s vector into a probability for every possible next token. Training scores every position of a known text in one parallel pass; generation picks one token, appends it and runs the stack again.

## Why it matters
Many practical facts follow from this loop. Limits and prices are counted in tokens because the model reads tokens. Output is slower per token than input because it comes one token at a time. Temperature acts only at the last step. And a pretrained model continues text rather than answering questions, which is why [post-training](#post-training-overview) exists. The rest of this book, and much of [inference](#inference-fundamentals), zooms into this one picture.

## Intuition
Picture an assembly line that writes one word per run. Each station (a block) reads a shared clipboard, the residual stream, and adds its notes. At the end, an inspector reads the clipboard at the last position and announces odds for every word in the dictionary. One word is drawn, stapled to the sentence, and the line runs again.

```viz
{"id":"transformer-overview-journey","component":"stepper","title":"Every new token costs one full trip through the stack, then joins the input for the next trip","caption":"Illustrative: the probabilities are made up for teaching, not taken from a real model. The lit row shows where the computation is; click a row to open its chapter.","alt":"Stepper following the prompt “The capital of France is” from text to token ids, embeddings, attention and feed-forward in each block, a final norm, the unembedding to logits, softmax and sampling of the next token “ Paris”, which is appended before the loop repeats.","data":"illustrative","try":"Step to “Append and repeat” and ask which rows have to run again for the next token.","diagram":{"w":460,"h":460,"layer_h":44,"layers":[{"id":"text","label":"Prompt text","sub":"“The capital of France is”","role":"context"},{"id":"ids","label":"Token ids","sub":"text split into pieces, one integer per piece","role":"token","link":"#tokenization"},{"id":"embed","label":"Token embedding","sub":"each id becomes a vector of width d","role":"model","link":"#positional-encoding"},{"id":"att","label":"Block 1: attention","sub":"each position gathers from earlier ones","role":"model","link":"#attention"},{"id":"ffn","label":"Block 1: feed-forward","sub":"each position transformed on its own","role":"model","link":"#transformer-block"},{"id":"rest","label":"Blocks 2 to N","sub":"same shape, own weights, same stream","role":"model","link":"#transformer-block"},{"id":"norm","label":"Final norm","sub":"rescale the stream once more","role":"model"},{"id":"unembed","label":"Unembedding","sub":"one score (logit) per vocabulary entry","role":"model"},{"id":"sample","label":"Softmax and sampling","sub":"probabilities, then one next token","role":"token","link":"#decoding-sampling"}]},
"frames":[
{"label":"Text","highlight":["text"],"caption":"The prompt arrives as a string. The model never works on characters directly."},
{"label":"Token ids","highlight":["ids"],"caption":"The tokenizer splits the text into pieces from a fixed vocabulary and replaces each piece with its integer id. A leading space is part of a piece, shown here as ␣.","tokens":["The","␣capital","␣of","␣France","␣is"]},
{"label":"Embed","highlight":["embed"],"caption":"Each id selects one row of a learned table: a vector of d numbers. Five tokens become five vectors, and together they start the residual stream.","tokens":["The","␣capital","␣of","␣France","␣is"]},
{"label":"Attention","highlight":["att"],"caption":"Attention lets each position mix in information from the positions before it. A causal mask hides everything to the right. The result is added back to the stream."},
{"label":"Feed-forward","highlight":["ffn"],"caption":"A feed-forward network transforms each position separately, and its result is also added back. Attention moves information between positions; the feed-forward layer processes it in place."},
{"label":"More blocks","highlight":["rest"],"caption":"The same block shape repeats N times, each with its own weights. The stream keeps width d all the way through; only its contents change."},
{"label":"Final norm","highlight":["norm"],"caption":"A last normalization rescales each position’s vector. For the next token, only the last position matters: the vector at “ is” now has to say what comes after it."},
{"label":"Logits","highlight":["unembed"],"caption":"The unembedding matrix turns that vector into one score, a logit, for every entry in the vocabulary: 50,257 numbers for GPT-2’s vocabulary, all from one vector."},
{"label":"Softmax and sample","highlight":["sample"],"caption":"Softmax turns logits into probabilities that sum to 1 over the whole vocabulary. A decoding rule picks one token, here the most likely: “ Paris”. Illustrative values.","matrix":{"title":"Next-token probabilities, top four (illustrative)","rows":["␣Paris","␣a","␣the","␣located"],"cols":["p"],"values":[[0.62],[0.08],[0.06],[0.03]],"min":0,"max":1}},
{"label":"Append and repeat","highlight":["text","ids"],"caption":"The new token joins the input and the whole trip runs again for the next position. With a KV cache, earlier positions are not recomputed. Generation stops at an end-of-sequence token or a length limit.","tokens":["The","␣capital","␣of","␣France","␣is","␣Paris"]}]}
```

## How it works
**One forward pass.** A transformer is a token embedding, a series of residual blocks and a token unembedding ([Elhage et al., “A Mathematical Framework for Transformer Circuits” (2021)](https://transformer-circuits.pub/2021/framework/index.html)):

1. **Tokenize:** text becomes integer ids from a fixed vocabulary. See [tokenization](#tokenization).
2. **Embed:** each id selects a learned vector of width d. The original transformer adds positional encodings here ([Vaswani et al., “Attention Is All You Need” (2017)](https://arxiv.org/abs/1706.03762)); see [embeddings and position](#positional-encoding).
3. **Blocks:** N identical blocks of self-attention and a feed-forward network, each adding its output to the residual stream. See [attention](#attention) and [the transformer block](#transformer-block).
4. **Final norm and unembedding:** a last normalization, added by GPT-2 after its final self-attention block ([Radford et al., “Language Models are Unsupervised Multitask Learners” (2019)](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)), then a matrix giving one logit per vocabulary entry. The original transformer reuses the embedding table here, which is called tied embeddings.
5. **Softmax and sampling:** logits become probabilities, and a decoding rule picks one token. See [decoding and sampling](#decoding-sampling).

**Training: every position at once.** In training the whole text is known. At every position the model is scored on the token that actually comes next, so the labels are the inputs shifted by one ([Hugging Face, causal language modeling](https://huggingface.co/docs/transformers/tasks/language_modeling)). For a text of T tokens, the loss is the mean cross-entropy over the T − 1 predictions (the last token has nothing after it to predict):

```math
\mathcal{L} = -\frac{1}{T-1}\sum_{t=1}^{T-1} \log p_\theta\left(x_{t+1} \mid x_1, \dots, x_t\right)
```

The causal mask hides everything to the right of each position, so all T − 1 predictions come out of one parallel pass without leaking answers. Feeding the true previous tokens instead of the model’s own guesses is called teacher forcing ([Zhang et al., “Dive into Deep Learning”, sequence-to-sequence chapter](https://d2l.ai/chapter_recurrent-modern/seq2seq.html)). More in [what a language model is](#language-modeling) and [the pretraining run](#pretraining-run).

**Generation: one token at a time.** At inference the future is unknown, so the model produces it autoregressively, feeding each new token back in. Prefill processes the whole prompt in parallel and yields the first output token; decode then produces the rest one at a time ([Agrawal et al., “Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve” (2024)](https://arxiv.org/abs/2403.02310)). A [KV cache](#kv-cache) keeps earlier keys and values, so each decode step computes only the new token.

```viz
{"id":"transformer-overview-train-vs-generate","component":"compare","title":"Training scores every position in one parallel pass; generation has to make one pass per new token","caption":"Illustrative example: the same sentence as the stepper above, seen by training and by generation. Hover the marks.","alt":"Comparison of training with teacher forcing, where five shifted predictions come out of one pass, and generation, where a prefill pass is followed by one decode pass per new token.","data":"illustrative","a":{"title":"Training (teacher forcing)","text":"sees                       predicts\nThe                      → capital\nThe capital              → of\nThe capital of           → France\nThe capital of France    → is\nThe capital of France is → Paris\n\nAll five rows run in one parallel pass.\nThe causal mask hides the right side.\nLoss: mean cross-entropy of the rows.\nInputs are always the real text."},"b":{"title":"Generation (autoregressive)","text":"prefill: the whole prompt, one pass\n  The capital of France is → Paris\ndecode 1: feed Paris back in\n  … France is Paris → .\ndecode 2: feed . back in\n  … is Paris . → <end>\n\nEach step waits for the one before it.\nInputs include the model’s own guesses,\nmistakes and all."},"links":[{"a":"All five rows run in one parallel pass.","b":"Each step waits for the one before it.","note":"Training knows every next token in advance, so all positions are scored at once. Generation does not, so it is sequential."},{"a":"Inputs are always the real text.","b":"Inputs include the model’s own guesses,","note":"This train-test mismatch is called exposure bias."},{"b":"prefill: the whole prompt, one pass","note":"Prefill is parallel like training, because the prompt is known in advance."},{"a":"Loss: mean cross-entropy of the rows.","note":"Cross-entropy here is minus the log of the probability the model gave the true next token."}]}
```

**Three families.** The original transformer has an encoder that reads the input and a decoder that writes the output. [Raffel et al., “Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer” (2019)](https://arxiv.org/abs/1910.10683) single out the attention mask as a major difference between the variants. Decoder-only models keep one causal stack. Encoder-only models such as BERT see both sides and learn by predicting 15% of tokens masked out ([Devlin et al., “BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding” (2018)](https://arxiv.org/abs/1810.04805)). Encoder-decoders keep both, joined by cross-attention. Details: [encoders, decoders and encoder-decoders](#encoders-and-decoders).

```viz
{"id":"transformer-overview-families","component":"diagram","title":"The three families differ mainly in what each position is allowed to see","caption":"Illustrative schematic. Switch tabs. Solid arrows carry vectors forward; the dashed arrow is generation feeding its own output back in.","alt":"Diagram variants of the three transformer families: decoder-only with one causal stack and a generation loop, encoder-only with one bidirectional stack producing vectors, and encoder-decoder with an encoder whose output the decoder reads through cross-attention.","data":"illustrative","w":550,"h":100,"variants":[
{"name":"Decoder-only","note":"One stack with a causal mask: each position sees only the positions to its left. Trained to predict the next token; generates by appending its own output and running again. GPT-2 has this shape.","h":100,"nodes":[{"id":"seq","label":"Text so far","sub":"prompt + own output","role":"context","x":0,"y":0,"w":190,"h":56},{"id":"dec","label":"Decoder stack","sub":"causal attention","role":"model","x":225,"y":0,"w":180,"h":56},{"id":"out","label":"Next token","role":"token","x":430,"y":0,"w":120,"h":56}],"edges":[{"from":"seq","to":"dec"},{"from":"dec","to":"out"},{"from":"out","to":"seq","curve":-90,"style":"dashed","label":"append"}]},
{"name":"Encoder-only","note":"One stack, no mask: every position sees the whole input. BERT trains it by hiding 15% of tokens and predicting them. The output is one vector per token, used for classification, embeddings and search rather than for writing text.","h":100,"nodes":[{"id":"txt","label":"Whole input","sub":"all tokens at once","role":"context","x":0,"y":0,"w":190,"h":56},{"id":"enc","label":"Encoder stack","sub":"sees left and right","role":"model","x":225,"y":0,"w":180,"h":56},{"id":"vec","label":"Vectors","sub":"per token","role":"data","x":430,"y":0,"w":120,"h":56}],"edges":[{"from":"txt","to":"enc"},{"from":"enc","to":"vec"}]},
{"name":"Encoder-decoder","note":"Two stacks. The encoder reads the whole input; the decoder writes the output causally and reads the encoder’s vectors through cross-attention. The 2017 transformer and T5 have this shape.","h":200,"nodes":[{"id":"src","label":"Input text","sub":"all tokens at once","role":"context","x":0,"y":0,"w":170,"h":56},{"id":"enc","label":"Encoder stack","sub":"sees left and right","role":"model","x":205,"y":0,"w":190,"h":56},{"id":"sofar","label":"Output so far","sub":"starts empty","role":"context","x":0,"y":100,"w":170,"h":56},{"id":"dec","label":"Decoder stack","sub":"causal, reads encoder","role":"model","x":205,"y":100,"w":190,"h":56},{"id":"out","label":"Next token","role":"token","x":430,"y":100,"w":120,"h":56}],"edges":[{"from":"src","to":"enc"},{"from":"enc","to":"dec","label":"cross-attention","dx":62},{"from":"sofar","to":"dec"},{"from":"dec","to":"out"},{"from":"out","to":"sofar","curve":-80,"style":"dashed","label":"append"}]}]}
```

**A map of this book.** The core path follows one token end to end; optional chapters go wider or deeper.

```viz
{"id":"transformer-overview-map","component":"tree","title":"Each chapter of Book 2 zooms into one stage of the token’s journey","caption":"Illustrative grouping by stage. Expand a stage, then open a chapter. “Core path” chapters are enough to follow one token end to end; “optional” chapters go wider or deeper.","alt":"Tree of Book 2 chapters grouped by the stage of the forward pass they explain, each marked as core path or optional.","data":"illustrative","open":1,"root":{"label":"Book 2, in the order a token meets it","children":[
{"label":"Text to token ids","children":[{"label":"Tokenization (2.1)","link":"#tokenization","note":"core path"},{"label":"Training and using tokenizers (2.1.1)","link":"#tokenizers-in-practice","note":"optional"}]},
{"label":"Embeddings and position","children":[{"label":"Embeddings and position (2.2)","link":"#positional-encoding","note":"core path"},{"label":"RoPE scaling and context extension (2.2.1)","link":"#rope-scaling","note":"optional"}]},
{"label":"Inside a block: attention","children":[{"label":"Attention step by step (2.3)","link":"#attention","note":"core path"},{"label":"Efficient attention and long context (2.7)","link":"#long-context","note":"optional"},{"label":"Sparse and local attention (2.7.1)","link":"#sparse-and-local-attention","note":"optional"}]},
{"label":"Inside a block: the whole block","children":[{"label":"The transformer block (2.4)","link":"#transformer-block","note":"core path"},{"label":"Encoders, decoders and encoder-decoders (2.4.1)","link":"#encoders-and-decoders","note":"core path"},{"label":"Architecture choices in modern LLMs (2.4.2)","link":"#architecture-choices","note":"optional"},{"label":"Mixture of Experts (2.5)","link":"#mixture-of-experts","note":"optional"},{"label":"MoE routing and load balancing (2.5.1)","link":"#moe-routing","note":"optional"}]},
{"label":"Generating: memory for past tokens","children":[{"label":"The KV cache (2.6)","link":"#kv-cache","note":"core path"},{"label":"KV-cache compression, eviction and offloading (2.6.1)","link":"#kv-cache-compression","note":"optional"}]},
{"label":"Logits to the next token","children":[{"label":"Decoding and sampling (2.8)","link":"#decoding-sampling","note":"core path"},{"label":"Nondeterminism and reproducible inference (2.8.1)","link":"#inference-nondeterminism","note":"optional"}]},
{"label":"Around and beyond the stack","children":[{"label":"Beyond the transformer (2.9)","link":"#beyond-transformers","note":"optional"},{"label":"Linear attention and hybrid models (2.9.1)","link":"#linear-attention-hybrids","note":"optional"},{"label":"Mechanistic interpretability (2.10)","link":"#mech-interp","note":"optional"},{"label":"Sparse autoencoders, transcoders and circuit tracing (2.10.1)","link":"#sae-circuit-tracing","note":"optional"},{"label":"Probes, lenses and steering (2.10.2)","link":"#probes-and-steering","note":"optional"}]}]}}
```

## In practice
Both modes fit in a few lines of Hugging Face Transformers (as of November 2026). The model id is a placeholder for any decoder-only checkpoint.

```python
import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "<model-id>"  # placeholder: any decoder-only checkpoint
tok = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

ids = tok("The capital of France is", return_tensors="pt").input_ids  # (1, T)

with torch.no_grad():
    # Training view: one parallel pass scores every position.
    logits = model(ids).logits                          # (1, T, vocab)
    loss = F.cross_entropy(logits[0, :-1], ids[0, 1:])  # position t predicts token t+1

    # Generation view: one new token per pass, appended to the input.
    for _ in range(5):
        next_id = model(ids).logits[:, -1].argmax(-1, keepdim=True)  # greedy
        ids = torch.cat([ids, next_id], dim=-1)

print(f"loss {loss.item():.2f}", tok.decode(ids[0]))
```

With `labels=ids`, the model shifts the labels and computes this loss itself ([Hugging Face GPT-2 docs](https://huggingface.co/docs/transformers/model_doc/gpt2)). `model.generate` runs the loop, with options for a KV cache (`use_cache`) and sampling (`do_sample`) ([Hugging Face generation docs](https://huggingface.co/docs/transformers/main_classes/text_generation), as of November 2026). The [caching guide](https://huggingface.co/docs/transformers/cache_explanation) shows the loop above with a cache.

- **Latency:** the prompt shares one parallel prefill pass; each output token adds a sequential step. See [inference fundamentals](#inference-fundamentals).
- **Family:** writing text needs a decoder; cheap embedding or classification is what encoders do well. See [embeddings](#embeddings).

> [!try]
> Print `logits.shape` in the snippet. The last number is the vocabulary size: that many scores come out at every position, on every pass.

## Numbers to know
> [!number]
> Rules of thumb, each from its source.
> - **The original transformer:** 6 encoder and 6 decoder blocks, width 512, about 65 million parameters in the base model ([Vaswani et al., 2017](https://arxiv.org/abs/1706.03762)).
> - **GPT-2:** 12 to 48 blocks, width 768 to 1,600, 50,257 tokens of vocabulary ([Radford et al., 2019](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)).
> - **Compute per token:** about 2N floating-point operations for a forward pass and about 6N for training (forward plus backward), for N non-embedding parameters ([Kaplan et al., “Scaling Laws for Neural Language Models” (2020)](https://arxiv.org/abs/2001.08361)).
> - **Loss baseline:** guessing evenly over V tokens scores ln V nats, about 10.8 for GPT-2. Training has to beat that.

## Pitfalls and anti-patterns
> [!pitfall] Shifting the labels twice
> Hugging Face causal language models such as GPT-2 shift labels internally, so you pass `labels=input_ids` ([GPT-2 docs](https://huggingface.co/docs/transformers/model_doc/gpt2)). Shift them yourself too and the model silently learns to predict two tokens ahead. Check one batch by hand: position t’s label should be input token t+1.

- **No causal mask in custom code.** Every position sees its own answer, and the training loss looks impossibly good. See [attention](#attention).

## Talk like an expert
The vocabulary: **autoregressive**, **teacher forcing**, **residual stream**, **unembedding**, **tied embeddings**, **prefill and decode**, **decoder-only**, **encoder-only**, **encoder-decoder**, **exposure bias**. Experts describe a model by its family, depth, width and vocabulary, and reason about serving cost as prefill plus decode. Following Elhage et al., they describe each attention and feed-forward layer as reading from and writing to the residual stream.

The live debate is about the objective. [Ranzato et al., “Sequence Level Training with Recurrent Neural Networks” (2015)](https://arxiv.org/abs/1511.06732) named the gap between teacher forcing and generation exposure bias, and [Gloeckle et al., “Better & Faster Large Language Models via Multi-token Prediction” (2024)](https://arxiv.org/abs/2404.19737) argue that teacher forcing with next-token prediction latches onto local patterns and overlooks “hard” decisions. On the other side, plain next-token training let GPT-2 begin learning tasks without explicit supervision ([Radford et al., 2019](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)).

> [!hottake] Decoder-only won; learn the other two families only to read old papers.
> **The counterargument:** encoder-only models still offer a strong performance-size trade-off for retrieval and classification ([Warner et al., “Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for Fast, Memory Efficient, and Long Context Finetuning and Inference” (2024)](https://arxiv.org/abs/2412.13663)), and in Raffel et al.’s controlled comparison the encoder-decoder with a denoising objective performed best on every task they measured, at the same compute cost as the decoder-only variants, though with twice their parameters.

## Check yourself
```quiz
transformer-overview
```

## Go deeper
- [Vaswani et al., “Attention Is All You Need” (2017)](https://arxiv.org/abs/1706.03762), the defining paper.
- [Alammar, “The Illustrated Transformer” (2018)](https://jalammar.github.io/illustrated-transformer/), a visual walk-through of the whole model.
- [Raffel et al., “Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer” (2019)](https://arxiv.org/abs/1910.10683), section 3.2, on the families.
- [Stanford CS336, “Language Modeling from Scratch” (Spring 2025)](https://cs336.stanford.edu/spring2025/), whose first assignment builds and trains a minimal language model.

## Related
- [Tokenization](#tokenization)
- [Attention step by step](#attention)
- [The transformer block](#transformer-block)
- [The KV cache](#kv-cache)
- [Decoding and sampling](#decoding-sampling)
- [What a language model is](#language-modeling)
