---
id: aaai-26-ai-review-pilot
book: 21
order: "21.101"
title: "AAAI-26: an AI review for every paper in full review"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [peer-review, scientific-research, prompt-chaining, human-evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Education and research (scientific conference peer review)"
use_case: "One clearly labeled AI review, without scores or recommendations, added alongside the human reviews of every AAAI-26 main-track paper in full review"
outcome: "Reviews for all 22,977 full-review papers in less than 24 hours at less than $1 per paper; 53.9% of survey respondents judged them useful, 20.2% did not"
measured_how: "Voluntary survey with 5,834 responses from authors, PC, SPC and ACs on a five-point Likert scale, plus the SPECS benchmark of 783 synthetic errors in 120 AAAI-25 papers (Biswas et al., arXiv, April 2026)"
prerequisites: [ai-research-publishing, prompt-chaining]
replications: []
---
> [!tldr]
> For AAAI-26, the pilot team added one clearly labeled AI review, with no scores, to every main-track paper in full review, using a multi-stage pipeline on OpenAI's gpt-5. It reviewed all 22,977 papers in less than 24 hours at less than $1 per paper, and 53.9% of survey respondents judged the AI reviews useful.

> [!note] From the public record
> Built from the AAAI-26 AI Review Pilot team's own published account, "AI-Assisted Peer Review at Scale: The AAAI-26 AI Review Pilot" (April 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

AAAI "received more than 30,000 initial submissions for 2026", "up from approximately 15,000 for 2025". Its Aug.–Nov. 2025 review process needed over 28,000 Program Committee (PC) members, Senior Program Committee members (SPCs) and Area Chairs (ACs). The authors describe "increasingly overburdened reviewers with more papers assigned" and compressed timelines (see [How AI research is published](#ai-research-publishing)). The authors state that before AAAI-26 "there had been no conference-wide live study of AI-generated reviews" at a major conference.

## Why this approach

The team found, as earlier studies had, that "simply asking off-the-shelf LLMs to review papers does not lead to high-quality reviews". Earlier studies found that criterion-specific prompts can improve identification of specific error types, so the system chains one stage per criterion (see [Prompt patterns and chaining](#prompt-chaining)).

The AI review was kept additive: "The AI review system did not include any scores or recommendations, and no human reviewers were replaced in the process." It joined at least two human reviews in Phase 1 of the two-phase process.

## The approach

1. **Preprocessing.** Initial testing showed that "the PDF version of the paper alone is insufficient for accurately reading equations and tables", so olmOCR converted each paper to markdown. Later stages got both versions. See [OCR and document parsing models](#document-ocr-models).
2. **Five review stages:** story, presentation, evaluations, correctness and significance, each seeing earlier stages' results. The evaluations and correctness stages could run Python code; the significance stage used web search.
3. **Draft, self-critique, final review,** in a fixed structure with strengths, weaknesses and APA references.
4. **Staged rollout.** Outputs for an initial batch of 30% of the papers were inspected by hand before the rest ran.
5. **Quality checks.** A critic model screened the reviews for revealed author identities, offensive language, possible bias and missing structure, and the authors inspected every flagged review. See [Human in the loop](#human-in-the-loop).

The prompts are withheld "to reduce the risk of prompt-targeted optimization or prompt injection attacks in future deployments".

## The stack

As of April 2026, for the AAAI-26 deployment: OpenAI gpt-5 with "high" reasoning effort, on the flex tier, with the built-in code_interpreter and web_search_preview tools; a Zero Data Retention agreement, so "model inputs and outputs were not logged"; olmOCR; OpenAI o4-mini as the critic; the GPTZero API; gpt-5.4 for survey coding and the benchmark; and OpenReview. OpenAI donated the API credits in kind as an AAAI-26 sponsor.

## Results, and how they were measured

- **Scale and cost.** "All reviews were generated in less than 24 hours", "with a modest cost of less than $1 per paper". Total spend is not stated.
- **Survey.** A voluntary Likert-scale questionnaire on every review drew 5,834 responses: 3075 from authors, 2184 from PC members, 550 from SPCs and 25 from ACs. The authors note that "self-selection bias must also be considered".
- **AI against human reviews.** "AI reviews were preferred to human reviews on six of the nine criteria". All nine differences in mean rating were significant (Mann-Whitney U test, α=0.01). The largest AI advantage was in identifying technical errors (+0.67). Respondents also judged AI reviews more likely to overemphasize minor issues (-0.38), contain technical errors (-0.22) and include wrong or unhelpful suggestions (-0.11).
- **Usefulness.** "53.9% of respondents judged the AI reviews useful, compared with 20.2% who did not".
- **Complementary role.** Among PC, SPC and AC respondents, 46.6% agreed that the AI review found concerns a human reviewer would have had difficulty catching (21.3% disagreed). But "49.4% agreed that the AI review overlooked points that a human reviewer would likely have caught", and "only 13.8% reported that the AI review changed their evaluation or interpretation of the paper".
- **Benchmark.** SPECS has an LLM insert 783 synthetic errors into 120 accepted AAAI-25 papers, and an LLM judge checks whether each review caught its error (see [LLM-as-judge done right](#llm-as-judge)). Recall across all criteria was 0.6386 for the full system and 0.4291 for a single-prompt baseline: "For every criterion, the AAAI-26 AI Review System significantly improves upon the baseline". Two human reviewers checked 35 sampled perturbations and agreed that 22 were valid scientific errors and 9 minor.
- **Citations.** In 100 sampled reviews with 1356 citations, GPTZero marked 2 as "fake" and 8 as "unsure". Manual checks found the unsure ones correct, one "fake" a correct citation to a technical reference manual, and the other a real paper with the wrong venue. See [Grounding and citations](#grounding-citations).

**Not measured:** the paper gives no survey response rate and does not measure whether the AI reviews changed which papers were accepted. It tests error detection directly only on synthetic errors in published papers.

## What failed

- **Equations and tables.** Even with olmOCR, respondents reported "errors in reading some equations and tables".
- **Big-picture judgment.** The most frequent negative theme in the 320 usable free-form responses was weak judgment of novelty, significance and impact.
- **Length.** Reviews were "longer than readers preferred".
- **Lost findings.** On SPECS, the significance stage caught some errors that "the final generated review does not explicitly identify".
- **Community concerns.** Respondents warned that "authors might optimize papers for AI preferences rather than scientific quality" and that reliance could erode reviewing skill.

## What the team would do differently

The paper does not list planned changes. It calls the length problem "straightforward to mitigate via tighter output-length controls" and says "Further study is needed" on how best to combine AI systems and human reviewers.

The wiki's reading: a labeled, additive review without scores can inform decisions without making them. In a chained pipeline, the final synthesis step can drop what an earlier stage found, so check intermediate outputs too.

## Disclosure

None.

## Sources

- Joydeep Biswas, Sheila Schoepp, Gautham Vasan, Anthony Opipari, Arthur Zhang, Zichao Hu, Sebastian Joseph, Matthew Lease, Junyi Jessy Li, Peter Stone, Kiri L. Wagstaff, Matthew E. Taylor and Odest Chadwicke Jenkins, AAAI-26 AI Review Pilot, [“AI-Assisted Peer Review at Scale: The AAAI-26 AI Review Pilot”](https://arxiv.org/abs/2604.13940), arXiv:2604.13940v1 [cs.AI], 15 April 2026. The University of Texas at Austin, University of Alberta, University of Michigan, Oregon State University, Sony AI and Alberta Machine Intelligence Institute.

## Related

- [About playbooks](#about-playbooks)
- [How AI research is published: arXiv, conferences and peer review](#ai-research-publishing)
- [Prompt patterns and chaining](#prompt-chaining)
- [LLM-as-judge done right](#llm-as-judge)
- [Grounding and citations](#grounding-citations)
