---
id: multimodal-apps
book: 8
order: "8.6"
title: Multimodal applications
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [multimodal, realtime, video]
visuals:
  - multimodal-arch:diagram
  - multimodal-patterns:tree
---
> [!tldr]
> Multimodal applications combine text, images, documents, audio and video in one product: assistants that see screenshots, agents that read PDFs and listen to calls, tools that generate images from conversations. Route each modality to the right model, convert where it helps, and keep costs and provenance under control.

## Why it matters
Users increasingly send photos, files, voice notes and screens rather than typed text. Products that handle mixed inputs naturally feel far more capable, and they multiply cost, latency and privacy considerations.

## Intuition
A multimodal app is a reception desk that accepts letters, parcels, phone calls and visitors, and routes each to the right department while keeping one record of the conversation.

```viz
{"id":"multimodal-arch","component":"diagram","title":"Route each input modality, then reason over one combined context","caption":"A common architecture. Click a component for its chapter.","alt":"Diagram of a multimodal application: text, image, document and audio inputs routed through specialist or multimodal models into a shared context and outputs.","data":"illustrative","w":600,"h":230,"nodes":[
{"id":"text","label":"Text","role":"human","x":0,"y":0,"w":120,"h":44},
{"id":"img","label":"Images, screens","role":"data","x":0,"y":62,"w":120,"h":44,"link":"#vision-language-models"},
{"id":"doc","label":"Documents","role":"data","x":0,"y":124,"w":120,"h":44,"link":"#document-screen-understanding"},
{"id":"aud","label":"Audio","role":"data","x":0,"y":186,"w":120,"h":44,"link":"#speech-audio"},
{"id":"route","label":"Router and converters","role":"tool","x":170,"y":86,"w":150,"h":56},
{"id":"llm","label":"Multimodal model","sub":"shared context","role":"model","x":360,"y":86,"w":130,"h":56},
{"id":"out","label":"Text, images, speech","role":"agent","x":520,"y":86,"w":80,"h":56,"link":"#image-generation"}],
"edges":[{"from":"text","to":"route"},{"from":"img","to":"route"},{"from":"doc","to":"route"},{"from":"aud","to":"route"},{"from":"route","to":"llm"},{"from":"llm","to":"out"}]}
```

## How it works
**Native versus converted.** Pass images and audio directly to models that accept them, or convert first (OCR, transcription, captions) when cheaper, more controllable or needed for search.

**Routing.** Small or specialist models for routine conversions, large multimodal models for reasoning across modalities. See [specialist models](#specialist-models).

```viz
{"id":"multimodal-patterns","component":"tree","title":"Five common multimodal product patterns","caption":"Expand a pattern for its key design choice.","alt":"Tree of multimodal application patterns with key design choices.","data":"illustrative","open":1,"root":{"label":"Multimodal patterns","children":[
{"label":"Screenshot or photo question answering","children":[{"label":"Crop and resize; verify read values","link":"#vision-language-models"}]},
{"label":"Document chat","children":[{"label":"Parse and retrieve, with page images for hard pages","link":"#multimodal-rag"}]},
{"label":"Meeting and call intelligence","children":[{"label":"Transcribe with timestamps and speakers, then summarize with citations","link":"#speech-audio"}]},
{"label":"Voice assistants","children":[{"label":"Streaming pipeline or speech-to-speech","link":"#voice-agents"}]},
{"label":"Creative generation","children":[{"label":"Image or video generation with review and labeling","link":"#image-generation"}]}]}}
```

**Costs.** Images and audio consume many tokens; long video is expensive. Cache conversions and avoid re-sending media in every turn.

**Privacy.** Photos, recordings and screens often contain personal or confidential information; apply the same controls as text. See [privacy](#privacy).

## In practice
- Convert once, store the derived text with links back to the media.
- Keep media out of logs or redact it; store references.
- Evaluate each modality separately before end to end.

## Numbers to know
> [!number]
> Rules of thumb. An image costs hundreds to thousands of tokens; an hour of audio produces roughly ten thousand words of transcript.

## Pitfalls and anti-patterns
> [!pitfall] Resending the same images every turn
> Costs multiply across a conversation; reference stored conversions instead.

## Talk like an expert
The vocabulary: **native multimodality**, **modality routing**, **conversion**, **image tokens**, **timestamps**, **provenance**. Experts design per-modality pipelines and evaluate each. The live debate is how quickly any-to-any models make conversion pipelines unnecessary.

> [!hottake] Most multimodal apps should convert to text early.
> **The counterargument:** conversion loses information (layout, tone, visual detail) that native multimodal reasoning keeps, and native models are getting cheaper fast.

## Check yourself
```quiz
multimodal-apps
```

## Go deeper
- This Bible’s Book 8 chapters on each modality.

## Related
- [Vision-language models](#vision-language-models)
- [Speech and audio](#speech-audio)
- [Multimodal RAG](#multimodal-rag)
- [Image generation](#image-generation)
- [Voice and realtime agents](#voice-agents)
