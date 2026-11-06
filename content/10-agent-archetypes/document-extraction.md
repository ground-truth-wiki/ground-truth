---
id: document-extraction
book: 10
order: "10.7"
title: Document-processing and extraction pipelines
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [extraction, schemas, review]
visuals:
  - extraction-pipeline:stepper
  - validation-compare:compare
  - review-cost:calculator
---
> [!tldr]
> Document extraction turns invoices, contracts, forms and reports into structured data: classify, parse, extract to a schema, validate with rules, route low-confidence results to people, and measure field-level accuracy. The goal is a high straight-through rate with errors caught before they reach downstream systems.

## Why it matters
Businesses process millions of documents by hand. Models can now read them, including scans, tables and handwriting, and fill structured records. The economics depend on how many documents go straight through without human review and how many errors slip past, so validation and routing matter as much as the model.

## Intuition
An extraction pipeline is a mailroom with a careful clerk: sort each document by type, read it, copy the details onto a form, check the form adds up, and put anything doubtful in the supervisor’s tray.

```viz
{"id":"extraction-pipeline","component":"stepper","title":"Seven steps from a scanned invoice to a validated record","caption":"Step through an illustrative invoice. Validation catches the error the model made; routing sends that document to a person.","alt":"Stepper of a document extraction pipeline: ingest, classify, parse, extract, validate, route and export.","data":"illustrative","frames":[
{"label":"Ingest","caption":"A scanned PDF arrives by email; it is stored with its source and a document id."},
{"label":"Classify","caption":"A small model labels it: invoice, from a known supplier, in English."},
{"label":"Parse","caption":"Layout-aware parsing and OCR, or a vision model for the hard pages, produce text with tables preserved. See the ingestion chapter."},
{"label":"Extract","caption":"A schema-constrained call fills the invoice fields.","code":"{\"supplier\": \"Northwind Ltd\", \"invoice_no\": \"INV-20417\",\n \"date\": \"2026-10-28\", \"net\": 1250.00, \"vat\": 250.00,\n \"total\": 1520.00, \"currency\": \"EUR\"}"},
{"label":"Validate","caption":"Rules check the record: net plus VAT should equal total. It does not (1,250 + 250 = 1,500, not 1,520), so the total field is flagged.","code":"check net + vat == total   FAIL (1500.00 != 1520.00)\ncheck supplier in vendor master   OK\ncheck invoice_no not seen before   OK"},
{"label":"Route","caption":"The failed check sends the document to a human reviewer with the flagged field highlighted on the page image."},
{"label":"Export","caption":"The corrected record goes to the accounting system; the correction becomes a labeled example for evals."}]}
```

## How it works
**Classification.** Route documents by type, language and quality; each type has its own schema and rules.

**Parsing.** Layout-aware parsers and OCR for text and tables; vision-language models for scans, handwriting and complex layouts. See [ingestion and parsing](#ingestion-parsing).

**Schema-constrained extraction.** Define the record with types, enums and descriptions, and use structured outputs so every result parses. Ask for the source location (page and region) of each value for review. See [structured outputs](#structured-outputs).

**Validation.** Cross-field arithmetic (totals, dates in order), reference data (known vendors, valid account numbers), duplicates, and format checks. Validation catches errors no confidence score reveals.

**Confidence and routing.** Combine validation results, model-reported uncertainty, agreement between two extraction passes, and document quality to decide between straight-through processing and human review.

**Human review.** Show the page image with the extracted value and its location; let reviewers correct quickly; feed corrections back as labeled data. See [the data flywheel](#data-flywheel).

## In practice
```viz
{"id":"validation-compare","component":"compare","title":"A confident extraction with a wrong total, caught by one arithmetic rule","caption":"The model’s output and the validation report. Hover the marks.","alt":"Comparison of an extracted invoice record and the validation checks that flag its total.","data":"illustrative","a":{"title":"Extracted record","text":"supplier:   Northwind Ltd\ninvoice_no: INV-20417\nnet:        1250.00\nvat:        250.00\ntotal:      1520.00\ncurrency:   EUR"},"b":{"title":"Validation","text":"net + vat == total     FAIL\n  1250.00 + 250.00 = 1500.00\nsupplier known         OK\ninvoice_no unique      OK\ncurrency allowed       OK\n-> route to review: field total, page 1"},"links":[{"a":"total:      1520.00","b":"net + vat == total     FAIL","note":"A misread digit that looks perfectly plausible on its own."},{"b":"-> route to review: field total, page 1","note":"The reviewer sees exactly which field to check and where."}]}
```

Estimate the cost of review before choosing a design:

```viz
{"id":"review-cost","component":"calculator","title":"Raising straight-through processing from 80% to 95% cuts review hours by three quarters","caption":"Defaults are illustrative. Model cost per document is usually small next to human review time.","alt":"Calculator for monthly human review hours and total monthly cost from document volume, straight-through rate, review minutes, reviewer cost and model cost per document.","data":"formula","outputs":[{"id":"review_hours","label":"Review hours per month","expr":"docs * (1 - straight_through) * review_min / 60","unit":"count"},{"id":"monthly","label":"Monthly cost (review plus model)","expr":"review_hours * hourly_cost + docs * model_cost","unit":"usd","main":true}],"inputs":{"docs":20000,"straight_through":0.8,"review_min":4,"hourly_cost":40,"model_cost":0.03},"input_meta":{"docs":{"label":"Documents per month"},"straight_through":{"label":"Straight-through rate","unit":"0 to 1, no human review"},"review_min":{"label":"Minutes per reviewed document"},"hourly_cost":{"label":"Reviewer cost per hour","unit":"$"},"model_cost":{"label":"Model cost per document","unit":"$, parsing plus extraction"}},"assumptions":["Reviewed documents take the same time on average.","Errors that slip through straight-through processing are not costed here; track them separately."],"tests":[{"inputs":{},"expect":{"review_hours":266.6667,"monthly":11266.67},"tol":0.0001},{"inputs":{"straight_through":0.95},"expect":{"review_hours":66.6667,"monthly":3266.67},"tol":0.0001}]}
```

Measure:
- Field-level precision and recall, by document type and field. See [eval recipes](#eval-recipes).
- Straight-through rate and the error rate among straight-through documents.
- Reviewer time per document and correction patterns.

## Numbers to know
> [!number]
> Rules of thumb. Human review time usually dominates cost; each point of straight-through rate saves review hours. A few cross-field rules often catch a large share of extraction errors.

## Pitfalls and anti-patterns
> [!pitfall] Trusting a model’s confidence instead of validating
> Models can be confidently wrong about a digit. Arithmetic and reference checks are more reliable than self-reported confidence.

- **Document-level accuracy only.** One wrong field can matter more than nine right ones.
- **No source locations.** Reviewers waste time hunting for the value on the page.
- **Corrections that are never reused.** They are your best training and eval data.

## Talk like an expert
The vocabulary: **straight-through processing**, **field-level accuracy**, **cross-field validation**, **reference data**, **confidence routing**, **human-in-the-loop review**, **schema**. Experts quote straight-through rate together with the error rate of what went straight through. The live debate is how far vision-language models make dedicated document AI products unnecessary.

> [!hottake] In document extraction, validation rules are worth more than a better model.
> **The counterargument:** rules only catch inconsistencies; a value that is wrong but consistent, such as a misread supplier name that exists in the master list, needs better reading, which better models provide.

## Check yourself
```quiz
document-extraction
```

## Go deeper
- The [ingestion and parsing](#ingestion-parsing) and [structured outputs](#structured-outputs) chapters.
- Documentation for document-AI services from cloud providers, for comparison with general models.

## Related
- [Ingestion and parsing](#ingestion-parsing)
- [Structured outputs](#structured-outputs)
- [Document and screen understanding](#document-screen-understanding)
- [Human in the loop](#human-in-the-loop)
- [The data flywheel](#data-flywheel)
