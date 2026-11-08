---
id: voice-turn-taking
book: 10
order: "10.4.1"
title: Turn-taking, interruptions and latency in voice agents
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [voice-agents, turn-taking, voice-activity-detection, barge-in, latency]
visuals: []
prerequisites: [voice-agents]
---
> [!tldr]
> A voice agent decides many times a second whether the user has finished, is only pausing, or is just saying “mm-hm”, and it must go quiet the moment it is interrupted. It does this with voice activity detection, a turn model and a pipeline that can be cancelled at every stage, and it is judged by the time from the end of the user's speech to the first sound of its reply. Remember that every end-of-turn setting trades cutting people off against leaving dead air.

## Key ideas

- **Human conversation sets a tight bar.** Across 10 languages, people avoid overlapping talk and keep silence between turns short, and each language's average gap lies within about 250 ms of the cross-language mean (Stivers et al., [“Universals and cultural variation in turn-taking in conversation”](https://doi.org/10.1073/pnas.0903616106) (2009)). The Voice AI primer calls a 500 ms response typical between people, measures voice-to-voice latency from the end of the user's speech to the start of the agent's speech, sets 1,500 ms as the target, and says p95 matters as well as p50 ([“Voice AI & Voice Agents: An Illustrated Primer”](https://voiceaiandvoiceagents.com/), updated June 2026).
- **Voice activity detection is the first gate, and its settings trade speed for false triggers.** Silero VAD is a model of about 2 MB that processes an audio chunk of 30 ms or more in under 1 ms on one CPU thread and supports 8 kHz and 16 kHz audio ([Silero VAD README](https://github.com/snakers4/silero-vad)). OpenAI's `server_vad` exposes the classic knobs: `threshold` (higher needs louder audio, for noisy rooms), `prefix_padding_ms` (audio kept from just before speech starts) and `silence_duration_ms` (shorter values end turns sooner) ([OpenAI Realtime VAD guide](https://developers.openai.com/api/docs/guides/realtime-vad)); streaming recognizers add their own endpointing, and Deepgram marks a result `speech_final` when its VAD detects a long enough pause, 10 ms by default as of November 2026 ([Deepgram endpointing docs](https://developers.deepgram.com/docs/endpointing)).
- **Semantic turn detection judges what was said, not just the silence.** OpenAI's `semantic_vad` estimates from the words so far whether the user has finished speaking and waits longer when they probably have not, with an `eagerness` setting (`low`, `medium` or `auto`, `high`) that controls the maximum wait ([OpenAI Realtime VAD guide](https://developers.openai.com/api/docs/guides/realtime-vad)). As of November 2026, LiveKit's default audio turn detector encodes the user's audio directly and supports 14 languages ([LiveKit turn detector docs](https://docs.livekit.io/agents/logic/turns/turn-detector/)), and Pipecat's default stop strategy since v0.0.102 is Smart Turn v3, an open BSD-licensed model of about 8M parameters on a Whisper Tiny backbone that covers 23 languages and runs next to a VAD set to a short silence ([Pipecat Smart Turn docs](https://docs.pipecat.ai/server/utilities/turn-detection/smart-turn-overview); [smart-turn README](https://github.com/pipecat-ai/smart-turn)).
- **Barge-in needs a pipeline that can be cancelled at every stage.** Interruption handling requires every part of the pipeline to be cancellable, with client playout stopped and buffers flushed, and echo cancellation, which keeps the agent from hearing itself, must run on the device because it is very sensitive to latency ([Voice AI primer](https://voiceaiandvoiceagents.com/)). After an interruption, LiveKit truncates the conversation history to the part of the speech the user actually heard, tells real interruptions from backchanneling in its adaptive mode, and treats a VAD trigger with no transcribed words as a false interruption after which the agent resumes speaking ([LiveKit Agents: turns](https://docs.livekit.io/agents/logic/turns/)).
- **Full-duplex models drop the turn machinery, and benchmarks now test them.** Moshi casts spoken dialogue as speech-to-speech generation, models the user's and its own audio as parallel streams without explicit speaker turns, and reports a theoretical latency of 160 ms and 200 ms in practice (Défossez et al., [“Moshi: a speech-text foundation model for real-time dialogue”](https://arxiv.org/abs/2410.00037) (2024)). Full-Duplex-Bench scores such models on pause handling, backchanneling, turn-taking and interruption management with automatic metrics (Lin et al., [“Full-Duplex-Bench: A Benchmark to Evaluate Full-duplex Spoken Dialogue Models on Turn-taking Capabilities”](https://arxiv.org/abs/2503.04721) (2025)).
- **Most of the latency budget is spent before the model speaks.** The primer's example budget totals 1,293 ms, with language-model time to first byte (650 ms) and transcription plus endpointing (300 ms) the largest parts, warns that a telephony provider adding a few hundred milliseconds puts you over budget, and advises speaking before a slow function call runs ([Voice AI primer](https://voiceaiandvoiceagents.com/)). Preemptive generation starts the language model before the end of turn is confirmed and discards the draft if the context changes, which LiveKit enables by default for the LLM only, as of November 2026 ([LiveKit, “Agent speech and audio”](https://docs.livekit.io/agents/multimodality/audio/)), and for noisy rooms and phone lines LiveKit recommends noise suppression or voice isolation before VAD and recognition, with a telephony-tuned noise-cancellation model for SIP callers ([LiveKit turn-taking tuning](https://docs.livekit.io/agents/logic/turns/tuning/)).

## Planned visuals

- `trace`: one turn from the end of the user's speech to the first audio of the reply, with VAD silence, the turn-model decision, the final transcript, model time to first token, speech synthesis and network, using the primer's example budget with its source; a second variant shows preemptive generation overlapping the turn decision.
- `stepper`: a barge-in frame by frame: the agent is speaking, the user starts, VAD fires, playback stops and buffers flush, and the agent's turn in the history is cut to what was heard; a branch shows a false interruption with no words and the agent resuming.
- `diagram`: half-duplex versus full-duplex, as two variants: a cascade gated by VAD and a turn detector, and a Moshi-style model with parallel user and agent audio streams.

## Talk like an expert

Experts talk about **endpointing**, the **VAD threshold** and **silence timeout**, **semantic turn detection**, **barge-in**, **backchannels**, **false interruptions**, **echo cancellation**, **half-duplex** versus **full-duplex**, and **voice-to-voice latency** at p50 and p95, and they treat every turn-taking setting as a trade between interrupting the user and leaving dead air, tuned on recordings of real calls.

## Go deeper

- [OpenAI Realtime voice activity detection guide](https://developers.openai.com/api/docs/guides/realtime-vad).
- [LiveKit Agents: turns](https://docs.livekit.io/agents/logic/turns/), with its turn detector and tuning pages.
- Défossez et al., [“Moshi: a speech-text foundation model for real-time dialogue”](https://arxiv.org/abs/2410.00037) (2024).
- Lin et al., [“Full-Duplex-Bench: A Benchmark to Evaluate Full-duplex Spoken Dialogue Models on Turn-taking Capabilities”](https://arxiv.org/abs/2503.04721) (2025).

## Related

- [Voice and realtime agents](#voice-agents)
- [Telephony and transport for voice agents](#voice-telephony)
- [Speech and audio](#speech-audio)
- [Speech recognition models](#speech-recognition)
- [Latency and throughput](#latency-throughput)
- [Agent UX](#agent-ux)
