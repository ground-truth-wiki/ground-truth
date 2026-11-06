---
id: ingestion-parsing
book: 6
order: "6.2"
title: Ingestion and parsing
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [parsing, pdf, ocr, ingestion]
visuals:
  - parser-compare:compare
  - format-tree:tree
---
> [!tldr]
> Retrieval quality is capped by parsing quality. Extract text, structure, tables and metadata faithfully from PDFs, web pages, Office files, slides and images before you embed a single chunk, and look at the parsed output with your own eyes.

## Why it matters
Most RAG failures that look like model problems start here: a table flattened into a word salad, two columns interleaved line by line, headings lost so chunks cannot be placed, a scanned page with no text at all. Every later stage inherits these errors, and no amount of reranking or prompting can recover information the parser destroyed.

## Intuition
Parsing is transcribing a book for someone who will only ever read your transcript. If you skip the footnotes, merge the columns and turn tables into run-on sentences, the reader’s understanding is wrong no matter how clever they are.

```viz
{"id":"parser-compare","component":"compare","title":"Naive extraction interleaves columns and flattens tables; layout-aware parsing keeps both","caption":"The same PDF page parsed two ways. Hover the marks. The naive output is what many default libraries return from a two-column page with a table.","alt":"Comparison of naive PDF text extraction and layout-aware parsing of a two-column page with a table.","data":"illustrative","a":{"title":"Naive text extraction","text":"4.2 Parental leave   Table 3: Leave by tenure\nEmployees receive 16  Tenure Weeks Pay\nweeks of paid leave,  <1 year 12 100%\nto be taken within    1-5 years 16 100%\n12 months of the      >5 years 20 100%\nbirth or adoption.\nPage 12"},"b":{"title":"Layout-aware parsing","text":"## 4.2 Parental leave\nEmployees receive 16 weeks of paid leave, to be\ntaken within 12 months of the birth or adoption.\n\n### Table 3: Leave by tenure\n| Tenure    | Weeks | Pay  |\n|-----------|-------|------|\n| <1 year   | 12    | 100% |\n| 1-5 years | 16    | 100% |\n| >5 years  | 20    | 100% |\n\n(metadata: page 12, section 4.2)"},"links":[{"a":"4.2 Parental leave   Table 3: Leave by tenure","b":"## 4.2 Parental leave","note":"Naive extraction reads straight across both columns; the heading and the table title collide."},{"a":"Employees receive 16  Tenure Weeks Pay","b":"Employees receive 16 weeks of paid leave, to be","note":"Sentences are cut and mixed with table cells, so no chunk contains a clean statement."},{"a":"1-5 years 16 100%","b":"| 1-5 years | 16    | 100% |","note":"A Markdown table keeps rows and columns, so “16 weeks for 1 to 5 years” stays answerable."},{"a":"Page 12","b":"(metadata: page 12, section 4.2)","note":"Page and section become metadata for citations instead of stray text."}]}
```

## How it works
**Formats differ.** HTML has structure but also navigation, ads and boilerplate. PDFs are drawing instructions, not documents: text may be in any order, and scanned PDFs have no text layer at all. Word files carry real structure; slides carry meaning in layout and speaker notes; spreadsheets are tables, not prose; email has threads, quotes and attachments.

**OCR versus vision-model parsing.** Classic OCR turns pixels into characters cheaply and literally. Vision-language models can read layout, tables, charts and handwriting and return Markdown or JSON, at higher cost and with some risk of inventing content. Many pipelines use OCR for bulk text and a VLM for hard pages. See [document understanding](#document-screen-understanding).

**Layout-aware parsers.** Tools such as Unstructured, Docling, LlamaParse, Marker and MinerU detect reading order, headings, lists, tables and figures, and output structured text. Compare them on your own documents; results vary by document type.

**Metadata extraction.** Capture source, title, author, date, section path, page numbers and access-control lists with every element. Metadata powers filters, citations and permission-aware retrieval. See [production RAG](#production-rag).

**Cleaning.** Remove repeated headers and footers, page numbers, navigation and cookie banners; fix hyphenation across line breaks; normalize whitespace and encodings; deduplicate near-identical documents.

## In practice
Route each format to the right treatment:

```viz
{"id":"format-tree","component":"tree","title":"Each format has its own trap, and its own fix","caption":"Expand a format to see what usually goes wrong and what to do. Test on a sample of real documents before committing to a parser.","alt":"Tree of document formats with their common parsing problems and recommended handling.","data":"illustrative","open":1,"root":{"label":"What kind of document is it?","children":[
{"label":"Digital PDF","children":[{"label":"Trap: column order and tables. Use a layout-aware parser; keep page numbers."}]},
{"label":"Scanned PDF or image","children":[{"label":"Trap: no text layer. OCR for bulk text, a vision model for tables and handwriting; spot-check for invented text.","link":"#document-screen-understanding"}]},
{"label":"HTML","children":[{"label":"Trap: boilerplate. Extract the main content; keep heading levels and links."}]},
{"label":"Word","children":[{"label":"Trap: tracked changes and comments. Decide whether to include them; keep styles as headings."}]},
{"label":"Slides","children":[{"label":"Trap: meaning in layout. Keep slide titles, text boxes and speaker notes; describe charts."}]},
{"label":"Spreadsheets","children":[{"label":"Trap: tables are not prose. Keep them as tables or route to text-to-SQL.","link":"#structured-code-retrieval"}]},
{"label":"Email","children":[{"label":"Trap: quoted history. Strip quotes, keep thread structure, parse attachments separately."}]}]}}
```

A minimal ingestion record:

```python
# Pseudocode: what to keep for every parsed element.
Element(
    doc_id="handbook-2026", source="sharepoint://hr/handbook-2026.pdf",
    section_path=["4 Leave", "4.2 Parental leave"], page=12,
    kind="paragraph",               # or "table", "list", "figure", "code"
    text="Employees receive 16 weeks of paid leave...",
    acl=["all-employees"], updated="2026-09-14", parser="layout-v3",
)
```

Before indexing a new source, print the parsed output for twenty random pages and read it. It takes ten minutes and catches most problems.

## Numbers to know
> [!number]
> Rules of thumb. Vision-model parsing costs far more per page than OCR or text extraction, so reserve it for pages that need it. Scanned documents and tables are where parsers differ most; compare them on a sample of 20 to 50 of your own pages.

## Pitfalls and anti-patterns
> [!pitfall] Never looking at the parsed text
> Teams tune chunk sizes and embedding models for weeks without noticing that the parser interleaved two columns. Read the output first.

- **Dropping metadata.** Without page and section, you cannot cite or filter.
- **Trusting VLM transcriptions blindly.** Spot-check numbers against the image.
- **One parser for everything.** Route by format and quality.

## Talk like an expert
The vocabulary: **text layer**, **reading order**, **layout-aware parsing**, **OCR**, **vision-model parsing**, **element types**, **boilerplate removal**, **section path**. Experts say “show me the parsed text” before any other RAG question. The live debate is whether vision models will make traditional parsing obsolete by reading page images directly; see [multimodal RAG](#multimodal-rag).

> [!hottake] Better parsing beats a better embedding model for most enterprise RAG.
> **The counterargument:** for clean, born-digital text such as wikis and tickets, parsing is easy and the gains are in retrieval and ranking.

## Check yourself
```quiz
ingestion-parsing
```

## Go deeper
- Documentation and benchmarks for Unstructured, Docling, LlamaParse, Marker and MinerU, read against your own documents.

## Related
- [Chunking](#chunking)
- [Document and screen understanding](#document-screen-understanding)
- [Unstructured data pipelines](#unstructured-pipelines)
- [RAG fundamentals](#rag-fundamentals)
- [Production RAG](#production-rag)
