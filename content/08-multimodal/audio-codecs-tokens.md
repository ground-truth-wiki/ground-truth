---
id: audio-codecs-tokens
book: 8
order: "8.5.3"
title: Neural audio codecs and audio tokens
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [audio-codecs, residual-vector-quantization, audio-tokens, speech-language-models, full-duplex]
visuals: []
prerequisites: [speech-audio, tokenization]
---
> [!tldr]
> A neural audio codec compresses a waveform into a short grid of discrete tokens and decodes it back to sound, which lets language models read and write audio the way they handle text. Codecs such as SoundStream, EnCodec and DAC stack residual vector quantizers, so every frame becomes several tokens, and the number of codebooks trades bitrate and quality against sequence length. Remember that audio tokens are expensive context, and that the order in which a model generates its codebooks decides how many steps generation takes.

## Key ideas

- **Why audio needs tokenizing.** Audio arrives as thousands of samples per second, so models work on codec frames instead: in VALL-E's setup, EnCodec turns 24 kHz audio into 75 frames per second with 8 codes per frame, so 10 seconds become a 750 × 8 matrix of 6,000 tokens (Wang et al., [“Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers”](https://arxiv.org/abs/2301.02111) (2023)). Rates vary widely by design: AudioLM's semantic tokens run at 25 per second and its acoustic tokens at 600 per second (Borsos et al., [“AudioLM: a Language Modeling Approach to Audio Generation”](https://arxiv.org/abs/2209.03143) (2022)), and as of November 2026 the Gemini API counts 32 tokens per second of audio, 1,920 per minute ([Gemini API: Audio understanding](https://aistudio.google.com/docs/audio)).
- **Encoder, residual vector quantizer, decoder.** SoundStream trains a fully convolutional encoder and decoder end to end with a residual vector quantizer (RVQ) between them, in which each quantizer codes what the previous ones left over, so every extra level adds tokens and detail. Structured dropout of quantizer layers during training lets one model work across bitrates from 3 to 18 kbps, and at 3 kbps it beat Opus at 12 kbps in listening tests (Zeghidour et al., [“SoundStream: An End-to-End Neural Audio Codec”](https://arxiv.org/abs/2107.03312) (2021)).
- **Adversarial losses, listening tests and wider coverage.** EnCodec trains with a multiscale spectrogram adversary and a loss balancer, and its MUSHRA listening tests, which include a hidden reference and a low anchor and score quality from 1 to 100, found it ahead of every evaluated baseline, including Opus and Lyra-v2, at the same bitrate (Défossez et al., [“High Fidelity Neural Audio Compression”](https://arxiv.org/abs/2210.13438) (2022)). DAC compresses 44.1 kHz audio about 90 times into tokens at 8 kbps, with one model for speech, music and environmental sound (Kumar et al., [“High-Fidelity Audio Compression with Improved RVQGAN”](https://arxiv.org/abs/2306.06546) (2023)).
- **Semantic tokens versus acoustic tokens.** Codec tokens reconstruct sound well but carry little long-term structure, so AudioLM adds semantic tokens from k-means clusters of a self-supervised speech model (w2v-BERT) and generates in three stages: semantic tokens, then the first 4 SoundStream quantizer levels, then the remaining 8 ([Borsos et al., 2022](https://arxiv.org/abs/2209.03143)). HuBERT units, another kind of self-supervised token, come from a model that learns by predicting offline k-means cluster labels for masked stretches of speech (Hsu et al., [“HuBERT: Self-Supervised Speech Representation Learning by Masked Prediction of Hidden Units”](https://arxiv.org/abs/2106.07447) (2021)).
- **Generating several codebooks at once.** With 4 codebooks at 50 frames per second, flattening all codes into one sequence takes 6,000 autoregressive steps for 30 seconds of music, while MusicGen's “delay” pattern offsets the codebooks in time and reaches similar quality in 1,500 steps (Copet et al., [“Simple and Controllable Music Generation”](https://arxiv.org/abs/2306.05284) (2023)). VALL-E splits the work differently: an autoregressive model predicts the first quantizer and a non-autoregressive model fills in quantizers 2 to 8 ([Wang et al., 2023](https://arxiv.org/abs/2301.02111)).
- **Full-duplex speech models.** Moshi models its own speech and the user's speech as two parallel streams, so there are no explicit turns, predicts time-aligned text tokens as an “inner monologue” before its audio tokens, and reports a latency of 160 ms in theory and 200 ms in practice (Défossez et al., [“Moshi: a speech-text foundation model for real-time dialogue”](https://arxiv.org/abs/2410.00037) (2024)); its Mimi codec reduces 24 kHz audio to 12.5 frames per second at 1.1 kbps ([kyutai-labs/moshi](https://github.com/kyutai-labs/moshi)). Hosted speech-to-speech APIs offer the same kind of live conversation, but do not assume a particular codec behind them: as of November 2026, OpenAI's guide says its realtime model “works directly with audio” without describing how audio is represented inside the model ([OpenAI Realtime API guide](https://developers.openai.com/api/docs/guides/realtime)).

## Planned visuals

- `stepper`: residual vector quantization of one frame: the encoder vector, the nearest code in codebook 1, the residual, codebook 2 and so on, with the reconstruction improving as levels are added and the bitrate rising.
- `calculator`: audio tokens from frame rate × codebooks × duration, with presets for published configurations (VALL-E's EnCodec at 75 Hz × 8, AudioLM's SoundStream at 50 Hz × 12) and a test that 10 seconds at 75 Hz × 8 gives 6,000 tokens.
- `diagram`: codebook orderings as grids of codebook by time, as variants for flattening, parallel, delay and coarse-first, each with its number of autoregressive steps for 30 seconds of audio from the MusicGen paper.

## Talk like an expert

Experts talk about frame rate, codebooks and RVQ levels, bitrate in kbps, quantizer dropout, semantic versus acoustic tokens, delay patterns, MUSHRA scores, inner monologue and full duplex. Before asking how good a representation sounds, they ask how many tokens per second it costs and how many autoregressive steps it takes to generate.

## Go deeper

- Zeghidour et al., [“SoundStream: An End-to-End Neural Audio Codec”](https://arxiv.org/abs/2107.03312) (2021).
- Défossez et al., [“High Fidelity Neural Audio Compression”](https://arxiv.org/abs/2210.13438) (2022).
- Borsos et al., [“AudioLM: a Language Modeling Approach to Audio Generation”](https://arxiv.org/abs/2209.03143) (2022).
- Défossez et al., [“Moshi: a speech-text foundation model for real-time dialogue”](https://arxiv.org/abs/2410.00037) (2024).

## Related

- [Speech and audio](#speech-audio)
- [Speech synthesis and voice cloning](#speech-synthesis)
- [Music and sound generation](#music-generation)
- [Tokenization](#tokenization)
- [Visual tokenizers and autoregressive image generation](#autoregressive-image-generation)
- [Voice and realtime agents](#voice-agents)
