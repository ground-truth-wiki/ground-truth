---
id: uber-invoice-processing
book: 21
order: "21.44"
title: "Uber invoice processing: OCR and GPT-4 with human review"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [finance, document-extraction, ocr, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Finance operations (accounts payable at Uber)"
use_case: "Extracting header fields and line items from supplier invoices in over 25 languages, with human review before invoices go to the ERP system"
outcome: "2x reduction in manual invoicing; 90% overall accuracy; average handling time reduced by 70%; 25-30% cost saving compared to the manual process"
measured_how: "Production results reported without a period or invoice volume; accuracy scored at header and line level, but the level behind the 90% is not stated; models compared on the last year of invoice data, 90% training and 10% test (Uber blog, April 2025)"
prerequisites: [document-extraction]
replications: []
---
> [!tldr]
> Uber built an invoice pipeline on its document platform TextSense: OCR, then OpenAI GPT-4 models extract the data, business rules refine it, and human reviewers check it before invoices go to the ERP system. The team chose GPT-4 over fine-tuned models such as Meta Llama 2 and Google Flan T5. It reports a "2x reduction in manual invoicing" and average handling time reduced by 70%, without stating the period or volume behind these numbers.

> [!note] From the public record
> Built from Uber's own published account, "Advancing Invoice Document Processing at Uber using GenAI" (April 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post says Uber "faces considerable challenges in processing a high volume of invoices daily." Suppliers submit invoices on a supplier platform or by email, and "Invoices are processed via RPA bots with an eyeball check or completely manually and ingested into the ERP application."

The post says "a significant portion of invoices still require manual handling", average handling time was high, and "human interventions heighten the risk of errors". The input is varied: "Uber works with thousands of suppliers, each using varying invoice templates and formats." Invoices "arrive in over 25 languages", some are handwritten, scanned or several pages long, and "Each invoice contains 15-20 attributes along with line information that needs to be captured accurately."

## Why this approach

The post says RPA was enough while there were few formats, but it did not scale and needed manual rule-setting for new formats.

To pick a model, the team used past invoices and their attachments as ground truth: "We considered the last year of invoice data for training and took 90% for training data and 10% for test data." They fine-tuned and evaluated models such as seq2seq, Meta Llama 2 and Google Flan T5 (see [Fine-tuning in practice](#fine-tuning-practice)). T5 showed "great accuracy of over 90% for the invoice header fields", but "we saw a considerable drop in accuracy while predicting the second line onwards."

OpenAI GPT-4 models "demonstrated better performance in accuracy and adaptability." The post states the trade-off: "Even though the LLM model had slightly higher header accuracy, GenAI was the winner for line prediction." And: "So, based on the cost-benefit analysis, GenAI was a clear winner in terms of overall accuracy." The post does not define its labels "LLM model" and "GenAI" in this comparison. The comparison table is an image, and the text gives no cost figures and no numbers beyond the T5 header result. The post says GPT-4's ability to handle complex, unstructured data and its potential for future ensemble approaches "made it the preferred choice." See [Choosing a model](#choosing-a-model).

## The approach

Uber built TextSense, "a common document processing platform", with a modular design that aims for "minimal coding and extensive configurations" when new country-specific templates are onboarded. Its steps:

1. **Ingestion.** "an ingestion service reads the open tickets and extracts supplier emails and any associated PDFs." PDFs can also be uploaded in a web app.
2. **Pre-processing.** Image augmentation for low-resolution scans and handwriting, and conversion of multi-page documents into standardized formats.
3. **OCR.** Uber's Vision Gateway CV platform extracts the text. See [OCR and document parsing models](#document-ocr-models).
4. **LLM extraction.** Trained or pre-trained LLMs extract specific data elements, with "periodic re-training and feedback loops".
5. **Post-processing.** Business rules refine the output and prepare it for human review.
6. **Validation and review.** Data is cross-checked against existing databases or rules. Reviewers see "a side-by-side comparison of the PDF data versus the data extracted from the models", with alerts and soft warnings. Approved invoices "are sent to the ERP system for approval and vendor payments." See [Human in the loop](#human-in-the-loop).
7. **Monitoring.** Processing speed, accuracy rates and cost efficiency.

For labeling, the team found that "many invoices come from a small subset of suppliers." High-volume suppliers are profiled first, and suppliers whose field-level accuracy falls below a threshold are targeted for labeling of key fields such as invoice number, date and amount. The threshold is not stated.

## The stack

As of April 2025, the post names:

- **TextSense,** Uber's document processing platform.
- **Uber's Vision Gateway CV platform** for OCR.
- **OpenAI GPT-4 models** for extraction. No specific variant or hosting is stated.
- **Uber's Cadence workflow platform** for workflows.
- **A review UI** for human reviewers, and an ERP system the post does not name.

## Results, and how they were measured

- **Manual work.** "We’ve seen a 2x reduction in manual invoicing."
- **Accuracy.** An "overall accuracy rate of 90%", and "35% of submitted invoices achieved a near-perfect accuracy of 99.5%, and 65% achieved more than 80% accuracy."
- **Handling time.** "The solution reduced the average handling time of invoice processing by 70%."
- **Cost.** "They have also resulted in a 25-30% cost saving compared to the manual process."

Accuracy is calculated at header and line level, with exact matching for some fields (such as invoice number) and fuzzy matching for others (such as invoice description). The post does not say which level the 90% refers to.

**Not measured:** the post gives no period, invoice volume or baseline values for the production results. It does not say how the handling time or cost figures were calculated, or which data the 90% accuracy figure comes from. It reports no accuracy by language, no error rate after human review and no model running costs. The 90/10 split is described for model selection only.

## What failed

- **Rules and RPA.** They needed "continual updates and manual intervention for error correction", and did not handle high volumes well.
- **Fine-tuned models on line items.** Fine-tuning helped with existing data patterns and business rules, but it "also led to hallucinations, especially for the line information." See [Hallucination and factuality](#hallucination-factuality).
- **GenAI on existing patterns.** In the post's words, "GenAI wasn’t adept at detecting our existing invoice data patterns", although "it was very good at predicting what was available in the documents."
- **Not yet hands-off.** Human review remains part of the flow. The post lists fully automated processing as a next step, not a result.

## What the team would do differently

The post states no lessons about what it would redo. Its next steps: improve accuracy, "build a document classification layer", and "enable fully automated end-to-end processing for cases where 100% accuracy is met historically". It also plans "an ensemble approach" chaining more sophisticated models.

The wiki's reading:

- **Score line items apart from headers.** In Uber's comparison, header accuracy was close and line prediction separated the options. See [Document-processing and extraction pipelines](#document-extraction).
- **Keep rules and people after the model.** Uber plans full automation only where history shows 100% accuracy.
- **Label where volume meets error.** Labeling high-volume suppliers below an accuracy threshold points effort where most invoices are.

## Disclosure

None.

## Sources

- Rohit Subudhi, Rakesh Vagvala, Sushil Kumar Jain Devichand, Indrani Bose and Balaram Baral, Uber, ["Advancing Invoice Document Processing at Uber using GenAI"](https://www.uber.com/blog/advancing-invoice-document-processing-using-genai/), Uber blog, 17 April 2025.

## Related

- [About playbooks](#about-playbooks)
- [Document-processing and extraction pipelines](#document-extraction)
- [OCR and document parsing models](#document-ocr-models)
- [Human in the loop](#human-in-the-loop)
- [Choosing a model](#choosing-a-model)
