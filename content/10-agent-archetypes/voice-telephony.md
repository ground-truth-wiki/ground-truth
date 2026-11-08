---
id: voice-telephony
book: 10
order: "10.4.2"
title: Telephony and transport for voice agents
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [voice-agents, telephony, sip, webrtc, dtmf]
visuals: []
prerequisites: [voice-agents]
---
> [!tldr]
> A voice agent reaches people through two kinds of connection: apps and browsers, where WebRTC carries the audio, and the phone network, where SIP sets up the call and RTP carries narrowband audio. The phone side brings its own features (keypad tones, transfers, voicemail detection) and its own rules on consent and disclosure. Remember that on a phone call the line, not the model, often sets the limits on audio quality and latency.

## Key ideas

- **Use WebRTC rather than raw WebSockets for client audio.** WebRTC is a W3C Recommendation (version of 13 March 2025) that defines browser APIs for sending real-time media and application data ([W3C, “WebRTC: Real-Time Communication in Browsers”](https://www.w3.org/TR/webrtc/)). The Voice AI primer advises against WebSockets for client-server real-time media in production and recommends WebRTC where conversational latency matters, noting that browsers, WebRTC mobile SDKs and telephony stacks include echo cancellation while a custom WebSocket app may have none ([“Voice AI & Voice Agents: An Illustrated Primer”](https://voiceaiandvoiceagents.com/), updated June 2026).
- **The phone network is SIP for signaling and RTP for media.** SIP is “an application-layer control (signaling) protocol for creating, modifying, and terminating sessions”; it negotiates codecs and other media details in an SDP offer and answer, and the audio itself travels over RTP, usually on a different path from the signaling (Rosenberg et al., [RFC 3261, “SIP: Session Initiation Protocol”](https://www.rfc-editor.org/rfc/rfc3261) (2002)). Platforms connect to carriers through SIP trunks: in LiveKit, inbound trunks with dispatch rules decide which room a caller joins and outbound trunks place calls ([LiveKit telephony docs](https://docs.livekit.io/telephony/)), and the primer warns that a telephony provider adding a few hundred milliseconds can push an agent past its 1,500 ms latency target ([Voice AI primer](https://voiceaiandvoiceagents.com/)).
- **Phone audio is narrowband, and keypad input is a separate signal.** Twilio Media Streams sends call audio over a WebSocket as base64-encoded `audio/x-mulaw` at 8000 Hz, mono; a unidirectional stream (`<Start><Stream>`) only listens, a bidirectional stream (`<Connect><Stream>`) can play audio back, and the server sends a `clear` message to interrupt audio it has already sent, which empties Twilio's buffer ([Twilio Media Streams](https://www.twilio.com/docs/voice/media-streams); [WebSocket messages](https://www.twilio.com/docs/voice/media-streams/websocket-messages)). The primer calls 8 kHz telephony audio noticeably low quality by modern standards ([Voice AI primer](https://voiceaiandvoiceagents.com/)), and DTMF keypad digits travel as RTP events defined in RFC 4733, which obsoletes RFC 2833 (Schulzrinne and Taylor, [RFC 4733, “RTP Payload for DTMF Digits, Telephony Tones, and Telephony Signals”](https://www.rfc-editor.org/rfc/rfc4733) (2006)); in Twilio Media Streams, as of November 2026, DTMF is unsupported on unidirectional streams and inbound-only on bidirectional ones ([Twilio Media Streams](https://www.twilio.com/docs/voice/media-streams)).
- **Transfers are cold or warm.** A cold transfer hands the caller on with the SIP REFER method (Sparks, [RFC 3515, “The Session Initiation Protocol (SIP) Refer Method”](https://www.rfc-editor.org/rfc/rfc3515) (2003)), and in LiveKit the agent is no longer involved once it starts the transfer. LiveKit's warm, agent-assisted transfer puts the caller on hold, briefs a human in a private consultation room with the context of the call, connects the two and leaves, or goes back to the caller if nobody answers ([LiveKit warm transfer docs](https://docs.livekit.io/telephony/features/transfers/warm/)).
- **Outbound calls need voicemail detection and noise handling.** Twilio's answering machine detection reports `human`, `machine_start`, `fax` or `unknown`, or with `DetectMessageEnd` waits for the greeting to end so a message can be left; shorter timeouts answer faster but return more `unknown` results, and Twilio warns that detection will not always be right ([Twilio answering machine detection](https://www.twilio.com/docs/voice/answering-machine-detection)). In LiveKit, noise suppression runs before voice activity detection and recognition ([LiveKit turn-taking tuning](https://docs.livekit.io/agents/logic/turns/tuning/)), and Krisp noise cancellation can be enabled on inbound trunks and on outbound calls ([LiveKit telephony docs](https://docs.livekit.io/telephony/)).
- **AI voices on calls fall under consent and disclosure rules.** In the United States, the FCC's Declaratory Ruling FCC 24-17 (released 8 February 2024) confirms that the TCPA's restrictions on “artificial or prerecorded voice” cover current AI technologies that generate human voices, so such calls need the called party's prior express consent absent an emergency purpose or exemption ([FCC 24-17](https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf)). In the EU, Article 50(1) of the AI Act requires providers to design systems that interact with people so that those people are informed they are talking to an AI system unless that is obvious, a transparency duty that has applied since 2 August 2026 ([Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng)); this is information, not legal advice, as of November 2026.

## Planned visuals

- `sequence`: an inbound phone call end to end, with carrier, SIP trunk, media bridge and agent: the INVITE with its SDP offer and answer, RTP audio in both directions, a DTMF event, and a cold transfer with REFER; a variant shows a warm transfer through a consultation room.
- `diagram`: three ways audio reaches an agent, as variants: an app or browser over WebRTC, a phone over a SIP trunk, and a phone through a media-stream bridge over a WebSocket, each labeled with its audio format and where echo cancellation runs.
- `compare`: the same caller handed over by a cold transfer and by a warm transfer with a spoken summary, marking what the human knows when they pick up.

## Talk like an expert

Experts talk about **SIP trunks**, **dispatch rules**, **mu-law at 8 kHz**, **DTMF**, **cold** and **warm transfers**, **SIP REFER**, **answering machine detection** and **bidirectional media streams**, and they treat the phone leg as its own system, with its own latency, audio limits and legal rules, separate from the agent behind it.

## Go deeper

- Rosenberg et al., [RFC 3261, “SIP: Session Initiation Protocol”](https://www.rfc-editor.org/rfc/rfc3261) (2002).
- [LiveKit telephony docs](https://docs.livekit.io/telephony/), on trunks, dispatch rules, DTMF and transfers.
- [Twilio Media Streams](https://www.twilio.com/docs/voice/media-streams), for the WebSocket bridge pattern.
- [FCC Declaratory Ruling FCC 24-17](https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf) (2024), on AI-generated voices under the TCPA.

## Related

- [Voice and realtime agents](#voice-agents)
- [Turn-taking, interruptions and latency in voice agents](#voice-turn-taking)
- [Customer-support and enterprise workflow agents](#support-agents)
- [Task-oriented dialogue: from intents and slots to LLM agents](#dialogue-systems)
- [Governance, regulation and law](#governance-regulation)
