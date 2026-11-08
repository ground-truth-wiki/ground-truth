---
id: speech-recognition
book: 8
order: "8.5.1"
title: Speech recognition models
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [asr, whisper, ctc, word-error-rate, diarization]
visuals: []
prerequisites: [speech-audio]
---
> [!tldr]
> Automatic speech recognition (ASR) turns audio into text. Modern systems are CTC encoders, streaming transducers, attention encoder-decoders such as Whisper, or audio encoders attached to a language model, and each expects its input audio sampled and featurized exactly as in training. Remember that a word error rate means little until you know the text normalization, the language and whose audio it was measured on.

## Key ideas

- **The model hears features, not raw sound.** In the original paper, Whisper resamples all audio to 16,000 Hz and computes an 80-channel log-magnitude Mel spectrogram on 25 ms windows with a 10 ms stride, then processes 30-second segments (Radford et al., [“Robust Speech Recognition via Large-Scale Weak Supervision”](https://arxiv.org/abs/2212.04356) (2022)), while Whisper large-v3 uses 128 Mel frequency bins instead of 80 ([openai/whisper-large-v3 model card](https://huggingface.co/openai/whisper-large-v3)); encoder-only models such as Wav2Vec2 instead produce one hidden state per 20 ms of audio from a convolutional feature encoder ([Hugging Face Audio Course: CTC architectures](https://huggingface.co/learn/audio-course/chapter3/ctc)). Audio must be resampled and featurized the way the model expects before inference.
- **CTC and transducers avoid hand-made alignments.** A CTC encoder predicts a character for every frame and uses a blank token so that repeated frames collapse correctly (“_ER_RRR_ORR” becomes “ERROR”), often with an external language model acting as a spellchecker ([Hugging Face Audio Course: CTC architectures](https://huggingface.co/learn/audio-course/chapter3/ctc)). The RNN transducer adds a prediction network that models each output symbol given the previous ones, and maps any input sequence to any output sequence without a predefined alignment (Graves, [“Sequence Transduction with Recurrent Neural Networks”](https://arxiv.org/abs/1211.3711) (2012)); a streaming transducer for mobile devices, designed to use context such as contact lists, outperformed a conventional CTC-based model in both latency and accuracy in a number of evaluation categories (He et al., [“Streaming End-to-end Speech Recognition For Mobile Devices”](https://arxiv.org/abs/1811.06621) (2018)).
- **Encoders: convolution plus attention, pretrained without labels.** The Conformer combines convolution for local features with attention for global context, and reports 2.1% and 4.3% word error rate on LibriSpeech test and test-other without a language model (Gulati et al., [“Conformer: Convolution-augmented Transformer for Speech Recognition”](https://arxiv.org/abs/2005.08100) (2020)). wav2vec 2.0 pretrains on unlabeled audio by masking latent speech features and solving a contrastive task; after pretraining on 53,000 hours, fine-tuning on only 10 minutes of labeled speech still reached 4.8% and 8.2% on LibriSpeech clean and other (Baevski et al., [“wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations”](https://arxiv.org/abs/2006.11477) (2020)).
- **Whisper and LLM-based ASR write text with a decoder.** Whisper is an encoder-decoder trained on 680,000 hours of weakly supervised multilingual and multitask data; special tokens choose the language, transcription or translation into English, and timestamps at 20 ms resolution, the sizes run from 39M to 1,550M parameters, and long audio is transcribed by shifting the 30-second window by predicted timestamps, with beam search and temperature fallback to avoid repetition loops ([Radford et al., 2022](https://arxiv.org/abs/2212.04356)). LLM-based ASR prepends audio embeddings from a small Conformer encoder to the text embeddings of a language model such as LLaMA-7B (Fathullah et al., [“Prompting Large Language Models with Speech Recognition Abilities”](https://arxiv.org/abs/2307.11795) (2023)).
- **Word error rate, done right.** WER is (S + D + I) / N, substitutions, deletions and insertions over the number of reference words, so it can exceed 100%; normalizing case and punctuation lowers it, so normalize references and predictions the same way before comparing, and use character error rate for languages without word boundaries, such as Mandarin and Japanese ([Hugging Face Audio Course: Evaluation metrics for ASR](https://huggingface.co/learn/audio-course/chapter5/evaluation)). Accuracy follows training data: Whisper's authors estimate that word error rate halves for every 16× more training data in a language, and most languages had less than 1,000 hours ([Radford et al., 2022](https://arxiv.org/abs/2212.04356)), and on Common Voice Dhivehi whisper-small starts above 100% WER ([Hugging Face Audio Course](https://huggingface.co/learn/audio-course/chapter5/evaluation)), so test on your own audio.
- **Who spoke when.** Diarization is scored with the diarization error rate, (false alarm + missed detection + speaker confusion) / total reference speech; a collar removes a margin around each reference turn boundary from scoring, research often uses 500 ms (250 ms on each side), and the default is no collar, so state the collar and whether overlapping speech counts ([pyannote.metrics reference](https://pyannote.github.io/pyannote-metrics/reference.html)).

## Planned visuals

- `calculator`: word error rate from substitutions, deletions, insertions and reference length, with tests for the worked example “the cat sat on the mat” and for a short reference where WER passes 100%.
- `stepper`: CTC decoding from frame-level predictions to text: per-frame characters, collapsing repeats within groups, removing blanks, and an optional language-model correction.
- `compare`: CTC encoder, RNN transducer, Whisper-style encoder-decoder and LLM-based ASR side by side: streaming, latency, use of a language model, timestamps and typical failure modes.

## Talk like an expert

Experts talk about log-mel features, CTC blanks, transducers, Conformers, self-supervised pretraining, normalized WER, CER, DER with a collar, and word timestamps. Before comparing two numbers they ask which normalizer, which collar and which audio, and they evaluate on a sample of their own recordings.

## Go deeper

- Radford et al., [“Robust Speech Recognition via Large-Scale Weak Supervision”](https://arxiv.org/abs/2212.04356) (2022).
- Baevski et al., [“wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations”](https://arxiv.org/abs/2006.11477) (2020).
- [Hugging Face Audio Course: Evaluation metrics for ASR](https://huggingface.co/learn/audio-course/chapter5/evaluation).
- [pyannote.metrics reference](https://pyannote.github.io/pyannote-metrics/reference.html).

## Related

- [Speech and audio](#speech-audio)
- [Voice and realtime agents](#voice-agents)
- [Speech synthesis and voice cloning](#speech-synthesis)
- [Neural audio codecs and audio tokens](#audio-codecs-tokens)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
- [Responsible AI in practice](#responsible-ai)
