---
id: video-understanding
book: 8
order: "8.1.2"
title: Video understanding
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [video-understanding, frame-sampling, temporal-grounding, long-video, multimodal]
visuals: []
prerequisites: [vision-language-models]
---
> [!tldr]
> Multimodal models typically read a video as a sequence of sampled frames, and some add its audio track, so the sampling rate sets both the token bill and which moments the model can see at all. Long videos are handled by clipping, lowering the frame rate or letting the model navigate the timeline, and time itself has to be encoded before a model can point at a moment. Remember that a high benchmark score may come from language priors or single frames rather than from understanding what happened when.

## Key ideas

- **Frame sampling sets the token bill.** As of November 2026, the Gemini API samples 1 frame per second by default and counts 66 tokens per frame at low media resolution (the default, according to its documentation) or 258 otherwise, plus 32 tokens per second of audio: about 100 tokens per second of video at low resolution and about 300 at high resolution. A 10-minute clip therefore costs roughly 60,000 or 180,000 tokens, and a model with a 1M-token context window takes up to 3 hours of video at low resolution or 1 hour at high resolution ([Gemini API: Video understanding](https://aistudio.google.com/docs/video-understanding)). Other models sample differently: Qwen2-VL's authors sampled videos at two frames per second (Wang et al., [“Qwen2-VL: Enhancing Vision-Language Model's Perception of the World at Any Resolution”](https://arxiv.org/abs/2409.12191) (2024)).
- **Per-frame encoders versus spacetime tokens.** Flamingo encoded frames sampled at 1 fps independently with its image encoder and added learned temporal embeddings (Alayrac et al., [“Flamingo: a Visual Language Model for Few-Shot Learning”](https://arxiv.org/abs/2204.14198) (2022)), while ViViT turns a clip into spatio-temporal tokens and proposes variants that factorize space and time to handle the long token sequences (Arnab et al., [“ViViT: A Video Vision Transformer”](https://arxiv.org/abs/2103.15691) (2021)). Qwen2-VL sits in between: 3D convolutions with a depth of two process tubes spanning two frames instead of single-frame patches, so it can take in more frames for the same sequence length ([Wang et al., 2024](https://arxiv.org/abs/2409.12191)).
- **Time must be encoded before a model can point at moments.** Qwen2.5-VL aligns the temporal part of its multimodal rotary position embedding with absolute timestamps and trains with dynamic frame rates, which its authors credit for hours-long video input and second-level event localization (Bai et al., [“Qwen2.5-VL Technical Report”](https://arxiv.org/abs/2502.13923) (2025)). In prompts, you refer to moments with MM:SS timestamps such as 01:15, and you can ask for timestamps of salient events in the answer ([Gemini API: Video understanding](https://aistudio.google.com/docs/video-understanding)).
- **Long video: clip, resample or navigate.** Short events can fall between samples, and the Gemini documentation warns that fast action may lose detail at 1 fps; as of November 2026, it lets you clip with start and end offsets, set a custom frame rate (0.5 samples one frame every two seconds), and, on some models, use an agentic mode that inspects the transcript first and loads only the visual segments it needs ([Gemini API: Video understanding](https://aistudio.google.com/docs/video-understanding)).
- **Transcripts carry much of long-video understanding.** Video-MME, 900 videos totaling 254 hours with 2,700 question-answer pairs on clips from about 11 seconds to 1 hour, found that both open and commercial models lost accuracy as videos got longer, and that subtitles helped most on long videos: Gemini 1.5 Pro rose from 67.4% to 77.4% on long videos with subtitles, against 81.7% to 84.5% on short ones (Fu et al., [“Video-MME: The First-Ever Comprehensive Evaluation Benchmark of Multi-modal LLMs in Video Analysis”](https://arxiv.org/abs/2405.21075) (2024)).
- **Benchmarks can overstate temporal understanding.** Across seven video benchmarks, Video-MME among them, Feng et al. found that 9% to 35% of questions could be answered without the video and 21% to 38% remained answerable after the frames were shuffled, and GPT-4o and Gemini 1.5 Pro were largely unaffected by shuffling (Feng et al., [“Breaking Down Video LLM Benchmarks: Knowledge, Spatial Perception, or True Temporal Understanding?”](https://arxiv.org/abs/2505.14321) (2025)). Before trusting a score for a task that depends on the order of events, check how much of the benchmark actually needs the order of frames ([Feng et al., 2025](https://arxiv.org/abs/2505.14321)).

## Planned visuals

- **`calculator`:** tokens and input cost for a video from its duration, frames per second, tokens per frame and audio tokens per second, with tests against the Gemini API's published rates as of November 2026.
- **`compare`:** per-frame image encoding versus spacetime tubes, with linked highlights on how each turns the same clip into tokens and how many it produces.
- **`chart`:** Video-MME accuracy by video length, with and without subtitles, as real data from Fu et al. (2024) with its source and as-of date.

## Talk like an expert

Practitioners talk in frames per second, tokens per second and hours per context window, separate temporal grounding (finding when something happens) from video question answering (saying what happened), and ask whether a benchmark question survives frame shuffling before they trust a score ([Feng et al., 2025](https://arxiv.org/abs/2505.14321)).

## Go deeper

- [Gemini API: Video understanding](https://aistudio.google.com/docs/video-understanding), for a concrete, documented sampling and token scheme.
- Fu et al., [“Video-MME: The First-Ever Comprehensive Evaluation Benchmark of Multi-modal LLMs in Video Analysis”](https://arxiv.org/abs/2405.21075) (2024).
- Bai et al., [“Qwen2.5-VL Technical Report”](https://arxiv.org/abs/2502.13923) (2025), for absolute time encoding.
- Feng et al., [“Breaking Down Video LLM Benchmarks: Knowledge, Spatial Perception, or True Temporal Understanding?”](https://arxiv.org/abs/2505.14321) (2025).

## Related

- [Vision-language models](#vision-language-models)
- [Vision-language model architectures and training](#vlm-architectures)
- [Multimodal applications](#multimodal-apps)
- [Multimodal RAG](#multimodal-rag)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
