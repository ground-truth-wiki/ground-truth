---
id: speech-synthesis
book: 8
order: "8.5.2"
title: Speech synthesis and voice cloning
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [tts, voice-cloning, vocoders, speech-evaluation, consent]
visuals: []
prerequisites: [speech-audio]
---
> [!tldr]
> Text-to-speech (TTS) turns text into a waveform in stages: a front end decides what to say and how to pronounce it, a model predicts acoustic features or audio tokens, and a vocoder or codec decoder renders sound. Modern models clone a voice from a few seconds of reference audio, which powers voice agents and accessibility and makes consent and misuse safeguards part of the engineering. Remember that one text has many valid renditions, so TTS is judged by listening tests plus intelligibility and speaker-similarity checks, not against a single reference.

## Key ideas

- **Pronunciation comes before sound.** A synthesizer first normalizes written forms such as dates and numbers into words, converts them to phonemes and plans prosody (pitch, timing, pauses, emphasis), and only then produces the waveform. SSML lets you steer these steps before you blame the model: `say-as` marks the type of a text construct such as a date, `phoneme` gives an explicit pronunciation in an alphabet such as IPA, and `lexicon` points to an external pronunciation dictionary (W3C, [Speech Synthesis Markup Language (SSML) Version 1.1](https://www.w3.org/TR/speech-synthesis11/) (2010)).
- **The classic neural recipe: spectrogram, then vocoder.** Tacotron 2 predicts mel spectrograms from characters with a sequence-to-sequence network and turns them into audio with a modified WaveNet vocoder, reaching a mean opinion score (MOS) of 4.53 against 4.58 for professionally recorded speech (Shen et al., [“Natural TTS Synthesis by Conditioning WaveNet on Mel Spectrogram Predictions”](https://arxiv.org/abs/1712.05884) (2017)). GAN vocoders made the second stage fast: HiFi-GAN generates 22.05 kHz audio 167.9 times faster than real time on a single V100 GPU (Kong et al., [“HiFi-GAN: Generative Adversarial Networks for Efficient and High Fidelity Speech Synthesis”](https://arxiv.org/abs/2010.05646) (2020)).
- **Zero-shot cloning treats speech as tokens.** VALL-E is a language model over the discrete codes of a neural audio codec, trained on 60,000 hours of English speech; given a 3-second recording of an unseen speaker, it continues in that voice and keeps the speaker's emotion and acoustic environment (Wang et al., [“Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers”](https://arxiv.org/abs/2301.02111) (2023)). Flow-matching models generate all frames at once instead: Voicebox learns to infill speech from audio context and text (Le et al., [“Voicebox: Text-Guided Multilingual Universal Speech Generation at Scale”](https://arxiv.org/abs/2306.15687) (2023)), and F5-TTS drops the duration model and phoneme alignment and reports an inference real-time factor of 0.15 (Chen et al., [“F5-TTS: A Fairytaler that Fakes Fluent and Faithful Speech with Flow Matching”](https://arxiv.org/abs/2410.06885) (2024)).
- **Semantic tokens and streaming for live use.** CosyVoice has a language model generate supervised semantic tokens, taken from a multilingual speech recognizer with vector quantization inserted into its encoder, and a flow-matching model turns them into speech (Du et al., [“CosyVoice: A Scalable Multilingual Zero-shot Text-to-speech Synthesizer based on Supervised Semantic Tokens”](https://arxiv.org/abs/2407.05407) (2024)). In a voice agent the number that matters is time to first audio ([voice agents](#voice-agents)), and CosyVoice 2 uses a chunk-aware causal flow-matching model so that one model serves both streaming and non-streaming synthesis (Du et al., [“CosyVoice 2: Scalable Streaming Speech Synthesis with Large Language Models”](https://arxiv.org/abs/2412.10117) (2024)).
- **Evaluate with listeners, ASR and speaker verification.** Because TTS is a one-to-many mapping, evaluation leans on listening tests in which people rate perceived quality on a scale from 1 to 5, reported as a MOS ([Hugging Face Audio Course: Evaluating text-to-speech models](https://huggingface.co/learn/audio-course/chapter6/evaluation)). Cloning papers add automatic checks: VALL-E checks robustness, whether the right words come out, as the word error rate of a HuBERT-Large recognizer on its output and speaker similarity with a WavLM-TDNN speaker-verification model ([Wang et al., 2023](https://arxiv.org/abs/2301.02111)), and learned predictors such as UTMOS estimate MOS directly from audio (Saeki et al., [“UTMOS: UTokyo-SaruLab System for VoiceMOS Challenge 2022”](https://arxiv.org/abs/2204.02152) (2022)).
- **Consent, disclosure and detection.** As of November 2026, Microsoft's professional voice service requires a recording of the voice talent reading a consent statement and uses it to verify that the talent is the speaker in the fine-tuning data ([Microsoft Learn: Add voice talent consent](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/professional-voice-create-consent)), and in the US the FCC ruled in February 2024 that AI-generated voices are “artificial” voices under the Telephone Consumer Protection Act, so such calls need the called party's prior express consent unless an emergency purpose or an exemption applies ([FCC 24-17](https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf)). For detection, ASVspoof 2019 provides synthesized, converted and replayed speech for training spoofing countermeasures (Wang et al., [“ASVspoof 2019: A large-scale public database of synthesized, converted and replayed speech”](https://arxiv.org/abs/1911.01601) (2019)), and AudioSeal embeds a watermark in generated speech whose detection is localized down to the sample level (San Roman et al., [“Proactive Detection of Voice Cloning with Localized Watermarking”](https://arxiv.org/abs/2401.17264) (2024)).

## Planned visuals

- `stepper`: one sentence with a date, an acronym and a person's name through the pipeline: normalization, phonemes, prosody, acoustic model and vocoder, showing where each mispronunciation arises and the SSML element that fixes it.
- `compare`: three model families side by side: mel spectrogram plus vocoder (Tacotron 2 with HiFi-GAN), codec language model (VALL-E) and flow matching (F5-TTS), by what is generated, autoregressive or not, cloning from a prompt, and streaming.
- `trace`: time to first audio for streaming TTS inside a voice agent, from the first text chunk to the first audio chunk and playback, labeled illustrative.

## Talk like an expert

Experts talk about text normalization, grapheme-to-phoneme conversion, prosody, mel spectrograms, vocoders, codec tokens, flow matching, zero-shot cloning, real-time factor, time to first audio, MOS, CMOS and SMOS, ASR-based WER and speaker similarity. They judge a voice product by three questions: does it say the words right, does it sound like the right person, and did that person agree.

## Go deeper

- Shen et al., [“Natural TTS Synthesis by Conditioning WaveNet on Mel Spectrogram Predictions”](https://arxiv.org/abs/1712.05884) (2017).
- Wang et al., [“Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers”](https://arxiv.org/abs/2301.02111) (2023).
- Chen et al., [“F5-TTS: A Fairytaler that Fakes Fluent and Faithful Speech with Flow Matching”](https://arxiv.org/abs/2410.06885) (2024).
- W3C, [Speech Synthesis Markup Language (SSML) Version 1.1](https://www.w3.org/TR/speech-synthesis11/) (2010).

## Related

- [Speech and audio](#speech-audio)
- [Voice and realtime agents](#voice-agents)
- [Speech recognition models](#speech-recognition)
- [Neural audio codecs and audio tokens](#audio-codecs-tokens)
- [Synthetic media, provenance and deepfakes](#synthetic-media-provenance)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
