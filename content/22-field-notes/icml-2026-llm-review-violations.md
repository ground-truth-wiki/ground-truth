---
id: icml-2026-llm-review-violations
book: 22
order: "22.35"
title: ICML 2026 detects LLM use in reviews with hidden PDF instructions
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [research, peer-review, prompt-injection, watermarking, public-record]
visuals: []
type: field-note
account: public-record
industry: "Research (machine learning conference peer review)"
use_case: "Hidden instructions watermarked into every submission PDF to detect LLM use by reviewers who had agreed not to use LLMs"
outcome: "795 reviews (~1% of all reviews) by 506 reviewers under the no-LLM policy detected to have used LLMs; 497 papers desk-rejected; 51 reviewers detected to have used LLMs in more than half of their reviews, the threshold for removal from the reviewer pool"
measured_how: "Reviews flagged by a per-paper hidden-phrase watermark and each checked by a human, across ICML 2026 reviews under Policy A; family-wise false-positive probability 0.0001, no recall estimate (ICML 2026 chairs' blog post, 18 March 2026, updated 26 March 2026)"
prerequisites: [ai-research-publishing, prompt-injection]
replications: []
---
> [!tldr]
> ICML 2026 hid instructions in every submission PDF that would lead an LLM to put two randomly chosen phrases into a review. It detected "795 reviews (~1% of all reviews)" by 506 reviewers who had agreed not to use LLMs, and desk-rejected 497 papers. 51 reviewers used LLMs in more than half of their reviews, the threshold for removal from the reviewer pool. The chairs say the method "may only catch some of the most egregious and careless uses of LLMs in reviewing".

> [!note] From the public record
> Built from ICML 2026's own published account, "On Violations of LLM Review Policies" (March 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

ICML 2026 had two policies for LLM use in reviewing: "Policy A (Conservative): No LLM use allowed." and "Policy B (Permissive): LLMs allowed to help understand the paper and related works, and polish reviews." The chairs write that "the community is divided on the best way to use LLMs in peer review", with issues such as author consent colliding with preferred reviewer workflows.

Reviewers chose which policy they would like to operate under and were then assigned to one. Only those who explicitly selected Policy A, or said they were okay with either, were assigned to Policy A, and "no reviewer who strongly preferred Policy B was assigned to Policy A". The post also refers to a designated Reciprocal Reviewer for a submission, without explaining that scheme.

## What happened

The method was based on recent work by Rao, Kumar, Lakkaraju and Shah, which the post links.

1. **Pre-deadline test.** In experiments shortly before the submission deadline, "frontier LLMs generally (though not always) followed the injected instructions".
2. **Watermark.** The chairs built a dictionary of 170,000 phrases and sampled two at random for each paper. Each submitted PDF carried instructions, "visible only to an LLM", to include the two phrases in the review. A human reading the PDF would not directly see them.
3. **Checking.** Generic AI-text detectors were not used. A human checked every flagged review, also to make sure it was not simply mentioning that the watermark was present.
4. **Enforcement, for Policy A only.** Flagged Policy A reviews were removed. A reviewer with more than half of their reviews flagged lost all their reviews and was removed from the pool. If a submission's designated Reciprocal Reviewer produced a flagged review, that submission was rejected.
5. **Publication.** The post appeared on 18 March 2026 and was updated on 26 March 2026.

The watermark was known publicly for almost the entire review period.

## Impact, and how it was measured

- **Detected reviews.** "795 reviews (~1% of all reviews) written by 506 unique reviewers who were assigned Policy A (no LLMs)" were detected to have used LLMs.
- **Desk rejections.** "This year, we desk-rejected 497 papers (~2% of all submissions)", corresponding to submissions of 398 reciprocal reviewers.
- **Removal threshold.** "51 Policy A reviewers were detected to have used LLMs in more than half of their reviews", "which is about 10% of the total of 506 detected reviewers".
- **False positives.** For incorrectly flagging even a single Policy A review: "This probability is 0.0001 (the family-wise error rate)." The post does not show the calculation. See [Statistics for evals](#eval-statistics) on error rates across many tests.
- **Pre-deadline test.** "Success rates were over 80% for most models, potentially depending on the method chosen by some LLMs to read the PDF."
- **Correction.** The first version said the papers were co-authored by 506 reciprocal reviewers. The update corrects this to 398: "the remaining 108 flagged reviewers were not reciprocal reviewers of active submissions".

The chairs add: "we are not making a judgment call about the quality of flagged reviews or the reviewers’ intentions".

**Not measured:** the post gives no estimate of how many Policy A reviews used LLMs undetected, no totals for submissions, reviews or reviewers behind the "~1%" and "~2%", no split between the policies, no per-model results for the pre-deadline test, no derivation of the 0.0001 figure, and no mention of appeals.

## Why it happened

The post does not analyze why reviewers broke the policy. It treats each case as "a violation of the policy they agreed to abide by". The chairs say the method may only catch cases "where the reviewer is inputting the PDF to the LLM and then directly copy-pasting the output from the LLM".

They add that it "will not always be successful in detecting LLM generated reviews", and: "Note that this is not a difficult measure to circumvent, particularly if it is known publicly". A reviewer could remove or work around the watermark, the review text could be modified, or the LLM may ignore the hidden instructions.

## What changed afterwards

Removing reviews meant "ACs may need to find new reviewers". Some submissions with a full set of reviews were desk-rejected, and some reviewers whose submissions were desk-rejected may become unresponsive. The chairs write: "We regret the disruption this will cause in the peer review process." They were in direct communication with the affected senior area chairs and area chairs (SACs and ACs).

The update thanks reviewers who reached out "acknowledging the policy violation and accepting responsibility". The post does not say whether the method will be used again. Its opening says that "ICML is actively working to adapt."

## Lessons

The source's own conclusion: the initiative "focused only on one particular action (breaking previously agreed-upon rules for LLM usage)" and still found it in ~1% of all reviews. The chairs hope strong action reminds the community that "the thing we must protect most actively is our trust in each other".

The wiki's reading:

- **Hidden instructions in a document are prompt injection, here used as a tripwire.** The same channel is open to attackers in any system that feeds untrusted documents to an LLM. See [Prompt injection](#prompt-injection).
- **A low false-positive rate says nothing about recall.** The 0.0001 figure is about wrongful flags. The counts show detected cases, not how common LLM use was. Detector limits are covered in [Synthetic media, provenance and deepfakes](#synthetic-media-provenance).
- **A clear, opt-in rule made enforcement easier to defend.** Action applied only to reviewers who had accepted the no-LLM policy, and the post judges the breach of that agreement, not review quality. See [How AI research is published](#ai-research-publishing).
- **Enforcement mid-process has costs.** Removed reviews and desk rejections fell on area chairs and on papers that were already fully reviewed.

## Disclosure

None.

## Sources

- ICML 2026 Program Chairs Alekh Agarwal, Miroslav Dudik, Sharon Li, Martin Jaggi, Scientific Integrity Chair Nihar B. Shah, and Communications Chairs Katherine Gorman and Gautam Kamath, ICML 2026, [“On Violations of LLM Review Policies”](https://blog.icml.cc/2026/03/18/on-violations-of-llm-review-policies/), ICML blog, 18 March 2026, updated 26 March 2026.

## Related

- [About field notes](#about-field-notes)
- [How AI research is published: arXiv, conferences and peer review](#ai-research-publishing)
- [Prompt injection](#prompt-injection)
- [Synthetic media, provenance and deepfakes](#synthetic-media-provenance)
- [Statistics for evals](#eval-statistics)
