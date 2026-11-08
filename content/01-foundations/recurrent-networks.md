---
id: recurrent-networks
book: 1
order: "1.5.3"
title: Recurrent networks, LSTMs and sequence-to-sequence models
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [rnn, lstm, seq2seq, sequence-modeling, history]
visuals: []
prerequisites: [neural-networks]
---
> [!tldr]
> A recurrent neural network (RNN) reads a sequence one step at a time and carries a hidden state, a fixed-size summary of everything seen so far, from each step to the next. Gated versions such as the LSTM made long sequences easier to train and powered early neural machine translation, whose attention mechanism led directly to the transformer. The one thing to remember: recurrence makes each inference step cheap but makes training sequential, which is why transformers replaced RNNs and why state-space models and linear attention bring recurrent inference back.

## Key ideas

- **One state, carried forward.** At each step the hidden state is updated as H_t = φ(X_t W_xh + H_{t−1} W_hh + b_h), with the same parameters at every step, so the parameter count does not grow with the length of the sequence ([Dive into Deep Learning, “Recurrent Neural Networks”](https://d2l.ai/chapter_recurrent-neural-networks/rnn.html)).
- **Backpropagation through time, and its gradients.** Training unrolls the network over the sequence and backpropagates through it; the gradients involve high powers of W_hh, whose eigenvalues below 1 vanish and above 1 diverge, so in practice gradients are computed over truncated subsequences ([Dive into Deep Learning, “Backpropagation Through Time”](https://d2l.ai/chapter_recurrent-neural-networks/bptt.html)). Pascanu et al. analyzed vanishing and exploding gradients in RNNs and proposed clipping the gradient norm against the exploding case (Pascanu et al., [“On the difficulty of training Recurrent Neural Networks”](https://arxiv.org/abs/1211.5063) (2012)).
- **Gates make memory trainable.** The LSTM of Hochreiter and Schmidhuber (1997) adds a memory cell with a self-connection of fixed weight 1 and three sigmoid gates, input, forget and output, that decide what to write, what to keep and what to expose, which alleviates vanishing gradients ([Dive into Deep Learning, “Long Short-Term Memory (LSTM)”](https://d2l.ai/chapter_recurrent-modern/lstm.html); [Olah, “Understanding LSTM Networks” (2015)](https://colah.github.io/posts/2015-08-Understanding-LSTMs/)). The GRU replaces the three gates with a reset gate and an update gate and often performs comparably while computing faster, and a bidirectional RNN runs two RNNs in opposite directions over the same input, which suits tasks such as part-of-speech tagging that use context on both sides, while next-token prediction may condition only on the left context ([Dive into Deep Learning, “Gated Recurrent Units (GRU)”](https://d2l.ai/chapter_recurrent-modern/gru.html); [“Bidirectional Recurrent Neural Networks”](https://d2l.ai/chapter_recurrent-modern/bi-rnn.html)).
- **Encoder-decoder models.** Sutskever et al. encoded a sentence with a multilayer LSTM into one fixed-size vector and decoded the translation with another deep LSTM, and found that reversing the word order of source sentences helped (Sutskever et al., [“Sequence to Sequence Learning with Neural Networks”](https://arxiv.org/abs/1409.3215) (2014)). In training, the decoder is fed the true target tokens (teacher forcing); at inference it is fed its own predictions, which can be chosen by beam search, which keeps the k most probable partial outputs at each step, with greedy search as the case k = 1 ([Dive into Deep Learning, “Sequence-to-Sequence Learning for Machine Translation”](https://d2l.ai/chapter_recurrent-modern/seq2seq.html); [“Beam Search”](https://d2l.ai/chapter_recurrent-modern/beam-search.html)).
- **Attention, the bridge to the transformer.** Bahdanau et al. called the fixed-length vector a bottleneck and let the decoder soft-search the source sentence for the parts relevant to each target word (Bahdanau et al., [“Neural Machine Translation by Jointly Learning to Align and Translate”](https://arxiv.org/abs/1409.0473) (2014)). The transformer kept [attention](#attention) and dropped recurrence, because the inherently sequential nature of RNNs precludes parallelization within training examples (Vaswani et al., [“Attention Is All You Need”](https://arxiv.org/abs/1706.03762) (2017)).
- **Recurrence comes back for inference.** Writing attention as a linear dot product of kernel feature maps cuts its cost from quadratic to linear in sequence length, permits an iterative implementation that speeds up autoregressive generation, and reveals its relationship to RNNs (Katharopoulos et al., [“Transformers are RNNs”](https://arxiv.org/abs/2006.16236) (2020)), and Mamba’s selective state-space layers run in a recurrent mode with linear scaling in sequence length; see [beyond the transformer](#beyond-transformers) and [linear attention and hybrid models](#linear-attention-hybrids) (Gu and Dao, [“Mamba: Linear-Time Sequence Modeling with Selective State Spaces”](https://arxiv.org/abs/2312.00752) (2023)).

## Planned visuals

- **`stepper`: an RNN unrolled through time.** Four steps forward, updating the hidden state, then backpropagation through time with the gradient shrinking or growing at each step, then truncation and gradient clipping as the two fixes.
- **`diagram`: inside an LSTM cell.** The cell state as a straight path, with the forget, input and output gates on it; clicking a gate shows its equation and what it controls.
- **`compare`: sequence-to-sequence without and with attention.** On the left, every source word squeezed into one vector; on the right, the decoder’s attention weights over all encoder states for each output word.

## Talk like an expert

Experts talk about **hidden state**, **unrolling**, **truncated BPTT**, **gradient clipping**, **gating**, **teacher forcing**, **greedy decoding**, **beam width** and **encoder-decoder attention**, and they frame RNNs versus transformers as sequential training with constant memory per step against parallel training with a cache that grows with the context.

## Go deeper

- [Dive into Deep Learning, “Recurrent Neural Networks”](https://d2l.ai/chapter_recurrent-neural-networks/rnn.html) and the chapter on modern RNNs that follows it.
- [Olah, “Understanding LSTM Networks” (2015)](https://colah.github.io/posts/2015-08-Understanding-LSTMs/).
- Pascanu, Mikolov and Bengio, [“On the difficulty of training Recurrent Neural Networks”](https://arxiv.org/abs/1211.5063) (2012).
- Bahdanau, Cho and Bengio, [“Neural Machine Translation by Jointly Learning to Align and Translate”](https://arxiv.org/abs/1409.0473) (2014).

## Related

- [Neural networks](#neural-networks)
- [Attention step by step](#attention)
- [Beyond the transformer](#beyond-transformers)
- [Linear attention and hybrid models](#linear-attention-hybrids)
- [What a language model is: from n-grams to neural networks](#language-modeling)
