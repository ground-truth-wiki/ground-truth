---
id: speech-audio
book: 8
order: "8.5"
title: Speech and audio
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [asr, tts, speech]
visuals:
  - transcription-trace:trace
  - speech-tasks:tree
---
> [!tldr]
> Speech models transcribe (ASR), speak (TTS), translate, identify speakers and, increasingly, converse end to end. Accuracy depends on audio quality, accents and domain vocabulary; latency and voice quality decide user experience; consent and voice-cloning safeguards are essential.

## Why it matters
Meetings, calls, podcasts and voice interfaces generate vast amounts of audio. Transcription feeds search, analytics and RAG; synthesis powers voice agents and accessibility. Getting audio right is mostly engineering: segmentation, vocabulary, diarization and latency.

## Intuition
A transcription pipeline is a court stenographer team: one person notes who is speaking, others type in parallel, an editor fixes names and punctuation, and the record is stamped with times.

```viz
{"id":"transcription-trace","component":"trace","title":"A one-hour recording transcribed in parallel chunks in about a minute","caption":"Illustrative batch transcription. Click a span for details. Voice activity detection splits the audio so chunks can run in parallel.","alt":"Span waterfall of a batch transcription job: voice activity detection, parallel chunk transcription, diarization, punctuation and alignment.","data":"illustrative","spans":[
{"name":"transcribe meeting (60 min)","start":0,"dur":70000,"depth":0,"kind":"agent"},
{"name":"voice activity detection","start":0,"dur":6000,"depth":1,"kind":"tool","note":"Find speech segments; drop silence."},
{"name":"ASR: chunks 1 to 20","start":6000,"dur":40000,"depth":1,"kind":"model","note":"Chunks run in parallel with overlap at the edges."},
{"name":"speaker diarization","start":6000,"dur":30000,"depth":1,"kind":"model","note":"Who spoke when."},
{"name":"merge, punctuation, custom vocabulary","start":46000,"dur":14000,"depth":1,"kind":"tool","note":"Fix product names and acronyms."},
{"name":"word timestamps and export","start":60000,"dur":10000,"depth":1,"kind":"data"}]}
```

## How it works
**ASR.** Encoder-decoder models such as Whisper (Radford et al., 2022) and commercial services transcribe speech; streaming ASR returns partial results for live use. Accuracy is measured by word error rate and drops with noise, accents, crosstalk and jargon.

**TTS.** Neural synthesis produces natural, expressive voices with low latency; streaming TTS starts speaking before the text is complete.

**Speech-to-speech and realtime.** Models that hear and speak directly reduce latency and preserve tone. See [voice agents](#voice-agents).

```viz
{"id":"speech-tasks","component":"tree","title":"Seven speech tasks and the main engineering concern of each","caption":"Expand a task.","alt":"Tree of speech and audio tasks with their main engineering concerns.","data":"illustrative","open":1,"root":{"label":"Speech and audio tasks","children":[
{"label":"Batch transcription","children":[{"label":"Accuracy on domain words; segmentation for parallelism"}]},
{"label":"Live transcription","children":[{"label":"Latency of partial results; stability of corrections"}]},
{"label":"Diarization","children":[{"label":"Overlapping speech; unknown speaker counts"}]},
{"label":"Speech synthesis","children":[{"label":"Naturalness, latency, pronunciation of names"}]},
{"label":"Voice cloning","children":[{"label":"Consent, verification and misuse safeguards","link":"#responsible-ai"}]},
{"label":"Speech translation","children":[{"label":"Latency versus accuracy in real time"}]},
{"label":"Audio understanding","children":[{"label":"Events, music and sound beyond speech"}]}]}}
```

**Domain adaptation.** Custom vocabulary, prompting with expected terms and fine-tuning improve recognition of names and jargon.

## In practice
- Measure word error rate on your own recordings, not benchmarks.
- Provide domain vocabulary; post-process with a language model for names and formatting, carefully.
- Keep timestamps so transcripts can be cited and audio replayed. See [multimodal RAG](#multimodal-rag).
- Get consent for recording and for voice cloning; label synthetic voices.

## Numbers to know
> [!number]
> Rules of thumb. Batch transcription runs many times faster than real time on GPUs. Word error rates rise sharply on noisy phone audio and heavy accents.

## Pitfalls and anti-patterns
> [!pitfall] Letting a language model “clean up” transcripts unchecked
> It can silently change what people said. Keep the raw transcript and track edits.

## Talk like an expert
The vocabulary: **ASR**, **word error rate**, **streaming ASR**, **diarization**, **VAD**, **TTS**, **voice cloning**, **speech-to-speech**, **custom vocabulary**. Experts quote WER on their own audio and latency at the 95th percentile. The live debate is consent and safeguards for voice cloning.

> [!hottake] Transcription is a solved problem.
> **The counterargument:** accuracy on noisy, accented, multi-speaker, jargon-heavy audio, which is most real audio, still has a long way to go.

## Check yourself
```quiz
speech-audio
```

## Go deeper
- Radford et al., “Robust Speech Recognition via Large-Scale Weak Supervision” (2022).

## Related
- [Voice and realtime agents](#voice-agents)
- [Multimodal RAG](#multimodal-rag)
- [Multimodal applications](#multimodal-apps)
- [Specialist models](#specialist-models)
- [Privacy](#privacy)
