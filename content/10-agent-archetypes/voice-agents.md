---
id: voice-agents
book: 10
order: "10.4"
title: Voice and realtime agents
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [voice, realtime, latency, turn-taking]
visuals:
  - voice-latency:trace
  - voice-architectures:diagram
---
> [!tldr]
> Voice agents listen, think and speak in real time. Cascaded pipelines chain speech recognition, a language model and speech synthesis; speech-to-speech models handle audio end to end. Everything is judged by latency to first audio, natural turn-taking and interruptions, and graceful handling of noise and accents.

## Why it matters
Voice is the most natural interface for many tasks, from customer support lines to in-car assistants, and the least forgiving: people notice pauses of a fraction of a second. Building voice agents means engineering for latency and conversation dynamics, not just text quality.

## Intuition
A phone conversation has a rhythm. People typically take turns with gaps of a few hundred milliseconds, interrupt each other, and say “mm-hm” without taking the turn. A voice agent that waits two seconds to reply, or talks over every interruption, feels broken no matter how smart it is.

```viz
{"id":"voice-latency","component":"trace","title":"About a second from the end of speech to the first sound of the reply, spent across five stages","caption":"An illustrative cascaded pipeline. Click a span for details. Each stage streams into the next; the largest single cost is the language model’s time to first token.","alt":"Span waterfall of voice agent latency: end-of-turn detection, final transcription, language model time to first token, speech synthesis to first audio and network.","data":"illustrative","spans":[
{"name":"full turn","start":0,"dur":1050,"depth":0,"kind":"agent"},
{"name":"end-of-turn detection","start":0,"dur":250,"depth":1,"kind":"tool","note":"Voice activity detection plus a turn model decide the user is done."},
{"name":"speech recognition final","start":250,"dur":120,"depth":1,"kind":"tool","note":"Streaming ASR already has most words; it finalizes the transcript."},
{"name":"model time to first token","start":370,"dur":420,"depth":1,"kind":"model","note":"Short prompts and a fast model keep this low."},
{"name":"speech synthesis to first audio","start":790,"dur":160,"depth":1,"kind":"tool","note":"Streaming TTS starts speaking before the sentence is complete."},
{"name":"network and playback","start":950,"dur":100,"depth":1,"kind":"data"}]}
```

## How it works
**Two architectures.**

```viz
{"id":"voice-architectures","component":"diagram","title":"Chain three specialists, or use one model that hears and speaks","caption":"Switch tabs. Cascades are flexible and easy to inspect; speech-to-speech models are faster and keep tone of voice, with less control.","alt":"Diagram variants comparing a cascaded voice pipeline of ASR, LLM and TTS with a speech-to-speech model.","data":"illustrative","w":560,"h":120,"variants":[
{"name":"Cascaded","note":"Speech recognition, a text model and speech synthesis, each swappable. Easy to log, evaluate and add tools; loses tone and emotion in the text step; latency adds up across stages.","nodes":[{"id":"mic","label":"Audio in","role":"human","x":0,"y":32,"w":90,"h":56},{"id":"asr","label":"Speech to text","role":"tool","x":120,"y":32,"w":110,"h":56},{"id":"llm","label":"Language model","role":"model","x":260,"y":32,"w":120,"h":56},{"id":"tts","label":"Text to speech","role":"tool","x":410,"y":32,"w":150,"h":56}],"edges":[{"from":"mic","to":"asr"},{"from":"asr","to":"llm","label":"text"},{"from":"llm","to":"tts","label":"text"}]},
{"name":"Speech to speech","note":"One realtime model takes audio in and produces audio out, keeping tone and handling interruptions natively. Lower latency; harder to inspect, constrain and evaluate.","nodes":[{"id":"mic","label":"Audio in","role":"human","x":0,"y":32,"w":120,"h":56},{"id":"s2s","label":"Realtime speech model","role":"model","x":180,"y":32,"w":200,"h":56},{"id":"out","label":"Audio out","role":"human","x":440,"y":32,"w":120,"h":56}],"edges":[{"from":"mic","to":"s2s","label":"audio"},{"from":"s2s","to":"out","label":"audio"}]}]}
```

**Realtime APIs and frameworks.** Providers offer realtime speech APIs over WebSockets or WebRTC (OpenAI’s Realtime API, Google’s Gemini Live API and others); frameworks such as LiveKit Agents and Pipecat handle audio transport, turn detection and pipeline orchestration; telephony connects through SIP and providers such as Twilio.

**Turn-taking.** Voice activity detection finds speech; end-of-turn models decide when the user has finished; barge-in handling stops the agent when the user interrupts. Backchannels (“mm-hm”) should not end the user’s turn.

**Latency budget.** Stream everything: partial transcripts, model tokens, synthesized audio. Keep prompts short and prefixes cached; use fast models for the first response; fill unavoidable waits naturally (“Let me check that”).

**Tools in voice.** Tool calls add delay; say something while they run, and keep tools fast. See [tool design](#agent-tools).

## In practice
- Measure latency from the end of the user’s speech to the first audio, at p50 and p95, on real networks.
- Test with noise, accents, crosstalk and phone-line audio.
- Design interruptions: the agent stops talking immediately and listens.
- Confirm critical details (amounts, dates, names) by reading them back.
- Log transcripts and audio (with consent) for evaluation. See [eval recipes](#eval-recipes).

## Numbers to know
> [!number]
> Rules of thumb. Gaps between turns in human conversation are typically a few hundred milliseconds (Stivers et al., 2009). Voice agents that answer within about a second feel responsive; beyond two seconds, users start repeating themselves or hanging up.

## Pitfalls and anti-patterns
> [!pitfall] Waiting for the whole answer before speaking
> Non-streaming pipelines add seconds of silence. Stream every stage.

- **Talking over interruptions.** Barge-in must stop playback at once.
- **Reading long text aloud.** Write responses for the ear: short sentences, no lists or URLs.
- **Testing only with clean studio audio.** Real calls are noisy.

## Talk like an expert
The vocabulary: **cascaded pipeline**, **speech-to-speech**, **ASR** and **TTS**, **voice activity detection**, **end-of-turn detection**, **barge-in**, **backchannel**, **time to first audio**, **WebRTC**, **SIP**. Experts quote latency to first audio and interruption handling before accuracy. The live debate is cascade versus speech-to-speech: control and observability against latency and naturalness.

> [!hottake] For voice agents, latency is a feature users notice more than intelligence.
> **The counterargument:** a fast agent that misunderstands or gives wrong answers fails faster; for high-stakes calls such as banking or healthcare, accuracy and confirmation steps matter more than shaving off milliseconds.

## Check yourself
```quiz
voice-agents
```

## Go deeper
- Stivers et al., “Universals and cultural variation in turn-taking in conversation” (2009).
- LiveKit Agents and Pipecat documentation; your provider’s realtime API documentation.

## Related
- [Speech and audio models](#speech-audio)
- [Streaming](#streaming)
- [Latency and throughput](#latency-throughput)
- [Customer-support agents](#support-agents)
- [Agent UX](#agent-ux)
