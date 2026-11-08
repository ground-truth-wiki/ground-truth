---
id: document-ocr-models
book: 8
order: "8.2.1"
title: OCR and document parsing models
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [ocr, document-ai, layout-analysis, table-recognition, document-parsing]
visuals: []
prerequisites: [document-screen-understanding]
---
> [!tldr]
> Document parsing turns page images into text with structure. Classic OCR pipelines detect and recognize text, layout and table models recover regions and cells, and vision-language models now read whole pages and emit structured text in one pass. Remember that generative parsers can invent plausible text, so evaluate on your own document types with tests that catch omissions and inventions, not only with edit distance.

## Key ideas

- **Classic OCR is a pipeline, scored by character error rate.** PP-OCR, an open system, chains a text detector, a direction classifier and a text recognizer (Du et al., [“PP-OCR: A Practical Ultra Lightweight OCR System”](https://arxiv.org/abs/2009.09941) (2020)). Its output is scored with character error rate, CER = (substitutions + deletions + insertions) ÷ reference characters, which can exceed 1 when a system inserts text: “hello world” read for “hello” scores 1.2 ([Hugging Face Evaluate: CER](https://github.com/huggingface/evaluate/blob/main/metrics/cer/README.md)).
- **Layout analysis labels regions before anything is read.** DocLayNet annotates 80,863 pages from financial reports, manuals, scientific articles, laws and regulations, patents and government tenders with 11 classes (Caption, Footnote, Formula, List-item, Page-footer, Page-header, Picture, Section-header, Table, Text and Title). Its authors built it because earlier datasets such as PubLayNet and DocBank come only from scientific article repositories and severely lack layout variety (Pfitzmann et al., [“DocLayNet: A Large Human-Annotated Dataset for Document-Layout Analysis”](https://arxiv.org/abs/2206.01062) (2022); [DocLayNet repository](https://github.com/DS4SD/DocLayNet)). Baseline object detectors trained on it still trailed human inter-annotator agreement by about 10% ([Pfitzmann et al., 2022](https://arxiv.org/abs/2206.01062)).
- **Tables and forms need structure, not just text.** PubTabNet pairs 568k table images with HTML, and its TEDS metric compares predicted and true HTML trees by tree edit distance, which captures multi-hop cell misalignment and OCR errors better than the earlier metric (Zhong et al., [“Image-based table recognition: data, model, and evaluation”](https://arxiv.org/abs/1911.10683) (2019)). For forms and receipts, LayoutLM pretrained on text together with each word's 2D position, added image features of each word for downstream tasks, and raised the state of the art on form understanding from 70.72 to 79.27 F1 (Xu et al., [“LayoutLM: Pre-training of Text and Layout for Document Image Understanding”](https://arxiv.org/abs/1912.13318) (2019)).
- **OCR-free models read the page end to end.** Donut skipped OCR because it adds compute, generalizes poorly across languages and document types, and passes its errors downstream (Kim et al., [“OCR-free Document Understanding Transformer”](https://arxiv.org/abs/2111.15664) (2021)), and Nougat converts scientific documents, whose PDFs lose mathematical expressions in particular, into a markup language (Blecher et al., [“Nougat: Neural Optical Understanding for Academic Documents”](https://arxiv.org/abs/2308.13418) (2023)). VLM-based parsers carry this further: olmOCR fine-tunes a 7B vision-language model on about 260,000 pages to emit plain text in reading order with sections, tables, lists and equations preserved, at an estimated $176 per million pages against more than $6,240 for GPT-4o at February 2025 batch prices (Poznanski et al., [“olmOCR: Unlocking Trillions of Tokens in PDFs with Vision Language Models”](https://arxiv.org/abs/2502.18443) (2025)).
- **Generative OCR can invent text.** The olmOCR team found that prompting with the page image alone led models to complete unfinished sentences or invent larger texts when the image was ambiguous, and their benchmark also tests for other common failures such as switching languages and repeating output; adding the PDF's own extracted text and its positions to the prompt (“document anchoring”) gave significantly fewer hallucinations ([Poznanski et al., 2025](https://arxiv.org/abs/2502.18443)). For the same reason, their olmOCR-Bench scores pages with simple pass-or-fail tests, like software unit tests, instead of soft metrics such as edit distance, which can miss small but important extraction errors ([Poznanski et al., 2025](https://arxiv.org/abs/2502.18443)).
- **Benchmark by document type, then route.** OmniDocBench spans nine document sources, including handwritten notes and densely typeset newspapers, with 19 layout categories and 15 attribute labels, and shows that pipeline tools and end-to-end VLMs each have strengths and weaknesses that differ by document type (Ouyang et al., [“OmniDocBench: Benchmarking Diverse PDF Document Parsing with Comprehensive Annotations”](https://arxiv.org/abs/2412.07626) (2024)); OCRBench found large multimodal models weak on handwritten, multilingual and non-semantic text and on mathematical expressions (Liu et al., [“OCRBench: On the Hidden Mystery of OCR in Large Multimodal Models”](https://arxiv.org/abs/2305.07895) (2023)). Question-answering suites test understanding rather than transcription: DocVQA has 50,000 questions on more than 12,000 document images, with humans at 94.36% accuracy (Mathew et al., [“DocVQA: A Dataset for VQA on Document Images”](https://arxiv.org/abs/2007.00398) (2020)), and ChartQA's 9.6K human-written and 23.1K generated questions target complex reasoning over charts, including logical and arithmetic operations (Masry et al., [“ChartQA: A Benchmark for Question Answering about Charts with Visual and Logical Reasoning”](https://arxiv.org/abs/2203.10244) (2022)).

## Planned visuals

- **`tree`:** route a page by type and quality (born-digital with a text layer, clean scan, complex layout, handwriting, charts) to text extraction, classic OCR, a layout pipeline or a VLM parser, with each leaf linked to its chapter.
- **`compare`:** classic OCR output and VLM Markdown output for the same page, illustrative, with linked highlights on a misread digit, a recovered table and an invented sentence completion.
- **`calculator`:** character error rate from substitutions, deletions, insertions and reference length, with a test for the documented case where CER exceeds 1.

## Talk like an expert

Practitioners talk in CER, TEDS, layout classes and reading order, separate born-digital PDFs, which already carry text, from scans, which do not ([Poznanski et al., 2025](https://arxiv.org/abs/2502.18443)), and compare open pipelines such as Docling, an MIT-licensed package built on DocLayNet layout analysis and TableFormer that runs on commodity hardware (Auer et al., [“Docling Technical Report”](https://arxiv.org/abs/2408.09869) (2024)), with VLM parsers and cloud document AI on their own pages.

## Go deeper

- Poznanski et al., [“olmOCR: Unlocking Trillions of Tokens in PDFs with Vision Language Models”](https://arxiv.org/abs/2502.18443) (2025), for VLM-based parsing, its failure modes and unit-test evaluation.
- Ouyang et al., [“OmniDocBench: Benchmarking Diverse PDF Document Parsing with Comprehensive Annotations”](https://arxiv.org/abs/2412.07626) (2024).
- Pfitzmann et al., [“DocLayNet: A Large Human-Annotated Dataset for Document-Layout Analysis”](https://arxiv.org/abs/2206.01062) (2022).
- Kim et al., [“OCR-free Document Understanding Transformer”](https://arxiv.org/abs/2111.15664) (2021).

## Related

- [Document and screen understanding](#document-screen-understanding)
- [Ingestion and parsing](#ingestion-parsing)
- [Document-processing and extraction pipelines](#document-extraction)
- [Multimodal RAG](#multimodal-rag)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
