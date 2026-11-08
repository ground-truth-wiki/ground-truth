---
id: multimodal-rag
book: 6
order: "6.12"
title: Multimodal RAG
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [multimodal, colpali, visual-retrieval]
visuals:
  - visual-rag-variants:diagram
  - chart-compare:compare
---
> [!tldr]
> Many answers live in charts, slides, scans and screenshots. Multimodal RAG either converts them to text before indexing, or retrieves page images directly with vision-language embeddings and lets a vision model read them. Audio and video are handled by transcribing with timestamps and retrieving segments.

## Why it matters
Converting a slide deck to text throws away the chart that holds the answer; OCR of a scanned form loses which number belongs to which box. Enterprises are full of such documents. Multimodal RAG lets the system find and read them as images, which recovers information that text pipelines silently drop.

## Intuition
Imagine searching a photo album. You can write a caption for every photo and search the captions, or you can search the photos themselves with a system that understands pictures. Captions are cheap and lossy; visual search is costly and faithful.

```viz
{"id":"visual-rag-variants","component":"diagram","title":"Convert pages to text and lose the layout, or retrieve page images and keep it","caption":"Switch tabs to compare the two pipelines. Many systems combine them: text retrieval for most pages, visual retrieval for figure-heavy ones.","alt":"Two pipeline diagrams: converting page images to text before retrieval, and retrieving page images directly with a visual embedder and a vision-language model.","data":"illustrative","w":580,"h":140,"variants":[
{"name":"Convert, then retrieve","note":"OCR and captions turn pages into text chunks. Cheap and works with any text index; loses layout, charts and visual detail.","nodes":[{"id":"page","label":"Page image","role":"data","x":0,"y":40,"w":110,"h":56},{"id":"ocr","label":"OCR and\ncaptions","x":140,"y":40,"w":110,"h":56},{"id":"idx","label":"Text index","role":"data","x":280,"y":40,"w":110,"h":56},{"id":"llm","label":"Text model","role":"model","x":420,"y":40,"w":160,"h":56}],"edges":[{"from":"page","to":"ocr"},{"from":"ocr","to":"idx"},{"from":"idx","to":"llm","label":"text chunks"}]},
{"name":"Retrieve images directly","note":"A visual embedder encodes page images patch by patch; queries match patches through late interaction; a vision-language model reads the retrieved pages. Keeps everything the page shows, at higher storage and inference cost.","nodes":[{"id":"page","label":"Page image","role":"data","x":0,"y":40,"w":110,"h":56},{"id":"emb","label":"Visual\nembedder","role":"model","x":140,"y":40,"w":110,"h":56},{"id":"idx","label":"Multi-vector\nindex","role":"data","x":280,"y":40,"w":110,"h":56},{"id":"vlm","label":"Vision-language\nmodel","role":"model","x":420,"y":40,"w":160,"h":56,"link":"#vision-language-models"}],"edges":[{"from":"page","to":"emb"},{"from":"emb","to":"idx","label":"patch vectors"},{"from":"idx","to":"vlm","label":"page images"}]}]}
```

## How it works
**Convert, then retrieve.** Run OCR on scans, extract text from slides, and have a vision model write captions or descriptions of charts and figures. Index the text as usual. Cheap at query time and compatible with existing pipelines, but the description is only as good as what the captioner noticed. See [ingestion and parsing](#ingestion-parsing).

**Visual document retrieval.** ColPali (Faysse et al., 2024) embeds each page image into many patch vectors with a vision-language model and matches query tokens against them with late interaction, like ColBERT for images. Layout, tables and figures count toward relevance without any OCR. Storage is larger because each page has many vectors.

**Generation from images.** Pass the retrieved page images, not their text, to a vision-language model and ask it to answer with page citations. Watch image-token costs and resolution limits. See [vision-language models](#vision-language-models).

**Audio and video.** Transcribe with timestamps (and speaker labels where useful), segment by topic or time, embed the segments, and return timestamps so users can jump to the moment. For video, sample frames and caption or embed them alongside the transcript.

**Hybrids.** Use text retrieval for text-heavy pages and visual retrieval for figure-heavy ones, or retrieve with both and fuse. See [hybrid retrieval](#hybrid-retrieval).

## In practice
```viz
{"id":"chart-compare","component":"compare","title":"OCR reads a chart’s labels; a vision model reads what the chart says","caption":"Illustrative outputs for the same bar chart. Hover the marks: the answer to “did Q3 revenue fall?” is only in the second.","alt":"Comparison of OCR output from a revenue bar chart and a vision-model description of the same chart.","data":"illustrative","mono":false,"a":{"title":"OCR output","text":"Quarterly revenue ($M) Q1 Q2 Q3 Q4 2025 12 15 14 18 Source: finance","mono":false},"b":{"title":"Vision-model description","text":"Bar chart of quarterly revenue in 2025, in millions of dollars: Q1 12, Q2 15, Q3 14, Q4 18. Revenue dipped slightly in Q3, then reached its high in Q4. Source: finance.","mono":false},"links":[{"a":"Q1 Q2 Q3 Q4 2025 12 15 14 18","b":"Q1 12, Q2 15, Q3 14, Q4 18","note":"OCR loses which number belongs to which bar; the description keeps the pairing."},{"b":"Revenue dipped slightly in Q3","note":"The trend is visual information OCR cannot capture. Verify extracted numbers against the image before trusting them."}]}
```

Decision rules:
- **Mostly text with occasional figures:** convert and caption figures; index text.
- **Slides, scans, forms and dashboards:** retrieve page images directly, or caption every page with a vision model.
- **Numbers that matter:** have the model quote the values it read and spot-check them; vision models can misread digits.
- **Audio and video:** transcripts with timestamps, then segment retrieval.

## Numbers to know
> [!number]
> Rules of thumb. A page image can cost hundreds to thousands of tokens for a vision model, depending on resolution; check your provider’s formula. Multi-vector page embeddings use many vectors per page, so index storage is a multiple of single-vector text indexes.

## Pitfalls and anti-patterns
> [!pitfall] Captioning once and trusting it forever
> A caption describes what the captioner noticed, not what a future question needs. For figure-heavy corpora, keep the images retrievable.

- **Downscaling too far.** Small text and chart labels become unreadable.
- **No page citations.** Users need to see the page the answer came from.
- **Ignoring cost.** Vision calls at query time add up; cache answers for repeated pages.

## Talk like an expert
The vocabulary: **visual document retrieval**, **ColPali**, **patch embeddings**, **late interaction**, **caption-then-retrieve**, **image tokens**, **timestamped transcripts**. Experts ask “is the answer in the pixels or the text?” before choosing a pipeline. The live debate is whether visual retrieval replaces text parsing for documents altogether as vision models get cheaper.

> [!hottake] For enterprise documents, retrieving page images will beat parsing them within a few years.
> **The counterargument:** text pipelines are cheaper, faster, easier to cite and filter, and good enough for the large majority of born-digital documents; visual retrieval will be a complement for hard pages, not a replacement.

## Check yourself
```quiz
multimodal-rag
```

## Go deeper
- Faysse et al., “ColPali: Efficient Document Retrieval with Vision Language Models” (2024).
- Radford et al., “Robust Speech Recognition via Large-Scale Weak Supervision” (2022), the Whisper paper, for transcription.

## Related
- [Video, 3D and world models](#video-world-models)
- [Vision-language models](#vision-language-models)
- [Document and screen understanding](#document-screen-understanding)
- [Ingestion and parsing](#ingestion-parsing)
- [RAG fundamentals](#rag-fundamentals)
- [Multimodal applications](#multimodal-apps)
- [Vision-language model architectures and training](#vlm-architectures)
- [Video understanding](#video-understanding)
