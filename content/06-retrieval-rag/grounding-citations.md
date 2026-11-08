---
id: grounding-citations
book: 6
order: "6.13"
title: Grounding and citations
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [citations, attribution, hallucination]
visuals:
  - citation-check:stepper
  - citation-compare:compare
---
> [!tldr]
> Grounding means every claim in an answer traces to a source; citations let users check it. Ask for quotes, verify that they exist in the sources, flag or remove unsupported claims, and let the model say “not found”. Nothing eliminates hallucination, but these steps make it visible.

## Why it matters
An answer that sounds right and cites nothing forces users to trust or to redo the work. An answer with checkable citations lets them verify in seconds, and lets you measure faithfulness automatically. For legal, medical, financial and policy questions, uncited answers are a liability; cited but wrong answers are worse, which is why citations must be checked, not just produced.

## Intuition
A good analyst’s memo has footnotes, and a good editor checks that each footnote actually says what the sentence claims. Grounding is both halves: writing the footnotes and checking them.

```viz
{"id":"citation-check","component":"stepper","title":"Checking citations one by one catches the claim that no source supports","caption":"Step through an illustrative check of a three-claim answer. The first two quotes appear in their sources; the third does not, so the claim is flagged before the user sees it.","alt":"Stepper verifying the citations of a generated answer: two claims supported, one unsupported claim caught and removed.","data":"illustrative","frames":[
{"label":"Draft","caption":"The model drafts an answer from five retrieved passages, quoting each source it relies on.","code":"1. Adoption leave is 16 weeks. [p.12: \"16 weeks of paid leave\"]\n2. It must start within 12 months. [p.12: \"within 12 months of the placement\"]\n3. Part-time staff get 20 weeks. [p.13: \"part-time employees receive 20 weeks\"]"},
{"label":"Check 1","caption":"The quote for claim 1 appears verbatim in page 12. Supported.","panel":"Found: “Employees receive 16 weeks of paid leave…” on page 12."},
{"label":"Check 2","caption":"The quote for claim 2 appears in page 12. Supported.","panel":"Found: “…to be taken within 12 months of the placement.”"},
{"label":"Check 3","caption":"The quote for claim 3 does not appear in page 13. Page 13 actually says part-time staff get the same weeks, paid pro rata.","panel":"Not found. Page 13: “Part-time employees receive the same number of weeks, paid pro rata.”"},
{"label":"Repair","caption":"The unsupported claim is corrected from the actual text, or removed and replaced with “not stated in the sources”.","code":"3. Part-time staff get the same 16 weeks, paid pro rata. [p.13]"},
{"label":"Deliver","caption":"Every remaining claim links to a passage the user can open. The faithfulness check result is logged for evaluation."}]}
```

## How it works
**Attribution.** Tie each claim, ideally each sentence, to the passage that supports it. Some model APIs return citations natively as spans of the provided documents; otherwise ask for quoted evidence in a structured format.

**Quote extraction first.** For long documents, asking the model to extract the relevant quotes before answering, then answer only from those quotes, improves faithfulness and makes checking easy.

**Groundedness checks.**
- **String checks:** verify that each quoted span exists in the cited source, with normalization for whitespace and punctuation. Cheap and exact.
- **Entailment checks:** ask a calibrated judge whether the source supports the claim, for paraphrased claims. See [LLM-as-judge](#llm-as-judge).
- **Coverage checks:** flag sentences with no citation at all.

**Hallucination mitigation.** Retrieval quality, explicit permission to answer “the sources don’t say”, low temperature for factual tasks, structured outputs for quotes, and post-hoc checks all reduce hallucination. None reduces it to zero, so design the interface to show uncertainty. See [AI product and UX](#ai-product-ux).

## In practice
```viz
{"id":"citation-compare","component":"compare","title":"A citation is only useful if the user can click it and see the sentence","caption":"The same answer with no citations and with checkable ones. Hover the marks.","alt":"Comparison of an uncited answer and an answer with quoted, page-level citations.","data":"illustrative","mono":false,"a":{"title":"Uncited","text":"You get 16 weeks of adoption leave, which you need to take within a year. Part-time employees have the same entitlement. Contact HR for details.","mono":false},"b":{"title":"Cited and checkable","text":"You get 16 weeks of paid leave for an adoption [Handbook p.12: “16 weeks of paid leave”], to be taken within 12 months of the placement [p.12]. Part-time employees receive the same number of weeks, paid pro rata [p.13]. The handbook does not say whether leave can be split.","mono":false},"links":[{"a":"You get 16 weeks of adoption leave","b":"[Handbook p.12: “16 weeks of paid leave”]","note":"A quote plus a page lets the user verify in seconds."},{"a":"Part-time employees have the same entitlement.","b":"paid pro rata [p.13]","note":"The cited version keeps the detail that the uncited one smoothed away."},{"a":"Contact HR for details.","b":"The handbook does not say whether leave can be split.","note":"Stating what the sources do not cover is more useful than a generic redirect."}]}
```

An answer format that makes checking automatic:

```json
{
  "answer": "You get 16 weeks of paid leave for an adoption.",
  "claims": [
    {"text": "16 weeks of paid leave", "source_id": "handbook-2026", "page": 12,
     "quote": "Employees receive 16 weeks of paid leave"}
  ],
  "not_found": ["whether leave can be split"]
}
```

Validate every `quote` against its source before rendering; drop or flag claims that fail.

## Numbers to know
> [!number]
> Rules of thumb. Exact-quote checks cost almost nothing and catch fabricated quotes immediately. Track the share of claims with valid citations as a production metric; a sudden drop usually means a retrieval or prompt change broke something.

## Pitfalls and anti-patterns
> [!pitfall] Citations that are never checked
> Models can cite a real document for a claim it does not support. A citation without verification is decoration.

- **Document-level citations only.** “Source: handbook.pdf” makes users search 40 pages.
- **No way to say “not found”.** The model fills gaps from memory instead.
- **Rendering model-written links unchecked.** Links can be fabricated or, worse, exfiltration channels. See [prompt injection](#prompt-injection).

## Talk like an expert
The vocabulary: **grounding**, **attribution**, **faithfulness**, **groundedness**, **quote extraction**, **entailment check**, **abstention**. Experts distinguish “the answer is correct” from “the answer is supported by the provided sources”, and measure the second automatically. The live debate is how much to trust native citation features versus independent checking; most teams do both.

> [!hottake] An answer without checkable citations should never ship in an enterprise assistant.
> **The counterargument:** for brainstorming, drafting and general explanations, citations add friction without value; grounding requirements should match the stakes of the question.

## Check yourself
```quiz
grounding-citations
```

## Go deeper
- Gao et al., “Enabling Large Language Models to Generate Text with Citations” (2023).
- Your model provider’s documentation on citation features, where available.

## Related
- [RAG fundamentals](#rag-fundamentals)
- [Evaluating RAG](#rag-evaluation)
- [Agent UX](#agent-ux)
- [AI product and UX](#ai-product-ux)
- [Structured outputs](#structured-outputs)
- [Hallucination and factuality](#hallucination-factuality)
