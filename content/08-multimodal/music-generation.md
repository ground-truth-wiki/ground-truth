---
id: music-generation
book: 8
order: "8.5.4"
title: Music and sound generation
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [music-generation, text-to-audio, audio-diffusion, clap, audio-evaluation]
visuals: []
prerequisites: [speech-audio]
---
> [!tldr]
> Music and sound generators turn a text prompt, a melody or an audio clip into new audio: songs, instrumentals, continuations and sound effects. They reuse the two big families from speech and images, language models over codec tokens (Jukebox, MusicLM, MusicGen) and latent diffusion conditioned on text-audio embeddings (AudioLDM, Stable Audio Open). Remember that automatic quality metrics are weak proxies for what listeners hear, and that the rights to training data are being fought over in court.

## Key ideas

- **From raw-audio codes to text-to-music.** Jukebox compressed raw audio into discrete codes with a multi-scale VQ-VAE and modeled them with autoregressive transformers, conditioned on artist, genre and unaligned lyrics, producing songs coherent for up to multiple minutes (Dhariwal et al., [“Jukebox: A Generative Model for Music”](https://arxiv.org/abs/2005.00341) (2020)). MusicLM framed text-to-music as hierarchical sequence-to-sequence modeling at 24 kHz, can restyle a hummed or whistled melody to match a caption, and released MusicCaps, 5.5k music-text pairs written by experts (Agostinelli et al., [“MusicLM: Generating Music From Text”](https://arxiv.org/abs/2301.11325) (2023)).
- **One language model over several codebooks, with melody control.** MusicGen is a single transformer over four EnCodec codebooks of 32 kHz audio, trained on 20,000 hours of licensed music; it conditions on text or on a melody, given as a chromagram computed after the Demucs source separator splits the reference into drums, bass, vocals and other and the drums and bass are dropped (Copet et al., [“Simple and Controllable Music Generation”](https://arxiv.org/abs/2306.05284) (2023)). The same separators produce stems: Hybrid Transformer Demucs reports 9.20 dB SDR on the MUSDB benchmark when trained with extra data (Rouard et al., [“Hybrid Transformers for Music Source Separation”](https://arxiv.org/abs/2211.08553) (2022)).
- **Latent diffusion conditioned on CLAP.** CLAP learns a shared embedding space for audio and text by contrastive pretraining, and its authors released LAION-Audio-630K, 633,526 audio-text pairs (Wu et al., [“Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation”](https://arxiv.org/abs/2211.06687) (2022)); AudioLDM trains latent diffusion on CLAP audio embeddings alone and swaps in the text embedding only at sampling time, which also allows zero-shot text-guided edits such as style transfer (Liu et al., [“AudioLDM: Text-to-Audio Generation with Latent Diffusion Models”](https://arxiv.org/abs/2301.12503) (2023)). Stable Audio Open is an open-weights text-to-audio model trained on Creative Commons data that generates 44.1 kHz stereo (Evans et al., [“Stable Audio Open”](https://arxiv.org/abs/2407.14358) (2024)).
- **Evaluation: distribution metrics, alignment scores and listeners.** Fréchet Audio Distance adapts FID to audio by comparing embedding statistics of generated and reference sets without per-item references; in the original study, on music enhancement, it correlated with human ratings at 0.52 (Kilgour et al., [“Fréchet Audio Distance: A Metric for Evaluating Music Enhancement Algorithms”](https://arxiv.org/abs/1812.08466) (2018)). MusicGen reports FAD with VGGish embeddings, a KL divergence over AudioSet classifier labels, a CLAP score for text alignment and crowd ratings of overall quality and of text relevance, each on a scale from 1 to 100 ([Copet et al., 2023](https://arxiv.org/abs/2306.05284)).
- **Memorization and labels.** MusicLM's authors found exact memorization of training examples rare but an approximate match for 1% of examples, and acknowledged the risk of misappropriating creative content ([Agostinelli et al., 2023](https://arxiv.org/abs/2301.11325)). To label output, SynthID embeds an inaudible watermark in generated audio that Google says survives added noise, MP3 compression and speed changes, and as of November 2026 its detector checks images, video and audio ([Google DeepMind SynthID](https://deepmind.google/models/synthid/)).
- **Rights disputes, as a dated snapshot (not legal advice).** In June 2024, Universal, Sony and Warner labels sued Suno in the US District Court for the District of Massachusetts, alleging that its service was built by copying their sound recordings without permission ([complaint against Suno](https://www.riaa.com/wp-content/uploads/2024/06/Suno-complaint-file-stamped20.pdf)). In October 2025 Universal settled its own lawsuit against Udio and signed licenses for recorded music and publishing ([Music Business Worldwide, October 2025](https://www.musicbusinessworldwide.com/universal-music-settles-udio-lawsuit-strikes-deal-for-licensed-ai-music-platform)). Warner settled with Suno in November 2025, while Universal and Sony kept suing ([Music Business Worldwide, May 2026](https://www.musicbusinessworldwide.com/suno-fights-to-keep-warner-music-settlement-terms-away-from-umg-and-sony/)), and in September 2026 the two filed a second suit in the same court over Suno's v6 models, alleging infringement of 60,202 recordings ([Variety, September 2026](https://au.variety.com/2026/music/news/sony-music-universal-music-sue-suno-label-backed-model-40495/)). This is the state as of November 2026; check the current dockets before relying on it.

## Planned visuals

- `tree`: tasks (text-to-music, melody conditioning, continuation, sound effects, stems) and approaches (codec language models: Jukebox, MusicLM, MusicGen; latent diffusion: AudioLDM, Stable Audio Open), with links to the chapters on codecs and diffusion.
- `compare`: a codec language model and a latent diffusion model for audio, side by side: what is generated, how text and melody condition it, generation speed, length limits and editing.
- `timeline`: dated milestones from Jukebox (2020) through MusicLM and MusicGen (2023) and Stable Audio Open (2024), plus the June 2024 Suno lawsuit, the 2025 settlements and the September 2026 suit.

## Talk like an expert

Experts talk about codec tokens, codebook patterns, latent diffusion, CLAP conditioning, chromagram melody conditioning, stems and source separation, FAD and its embedding model, CLAP score and memorization audits. Before asking how a model sounds, they ask what it was trained on, under which license, and which embedding network produced its FAD.

## Go deeper

- Copet et al., [“Simple and Controllable Music Generation”](https://arxiv.org/abs/2306.05284) (2023).
- Agostinelli et al., [“MusicLM: Generating Music From Text”](https://arxiv.org/abs/2301.11325) (2023).
- Liu et al., [“AudioLDM: Text-to-Audio Generation with Latent Diffusion Models”](https://arxiv.org/abs/2301.12503) (2023).
- Evans et al., [“Stable Audio Open”](https://arxiv.org/abs/2407.14358) (2024).

## Related

- [Speech and audio](#speech-audio)
- [Neural audio codecs and audio tokens](#audio-codecs-tokens)
- [Diffusion and flow matching](#diffusion-flow-matching)
- [Synthetic media, provenance and deepfakes](#synthetic-media-provenance)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
- [Data licensing, copyright and consent](#data-licensing-consent)
