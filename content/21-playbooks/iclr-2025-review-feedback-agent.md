---
id: iclr-2025-review-feedback-agent
book: 21
order: "21.103"
title: "ICLR 2025: a randomized trial of LLM feedback on peer reviews"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [research, peer-review, randomized-trial, llm-pipelines, public-record]
visuals: []
type: playbook
account: public-record
industry: "Education and research (peer review at an AI conference)"
use_case: "A multi-LLM agent that gives conference reviewers optional feedback on vague comments, content misunderstandings and unprofessional remarks in their reviews"
outcome: "26.6% of reviews that received feedback were updated, against 9.4% of control reviews; annotators preferred the modified review 89% of the time in 100 examples; no statistically significant difference in acceptance rates"
measured_how: "Randomized controlled study at ICLR 2025: 22,467 reviews selected for feedback (18,946 received it) and 22,364 control reviews, feedback posted October 15 to November 12, 2024; updates by edit distance, blinded preference by two AI researchers (Thakkar et al., arXiv, April 2025)"
prerequisites: [online-experiments, llm-as-judge]
replications: []
---
> [!tldr]
> At ICLR 2025, a Stanford team and the program chairs ran a randomized study of Review Feedback Agent, a pipeline of five LLMs that gave reviewers optional feedback on their reviews. 26.6% of reviews that received feedback were updated, against 9.4% in the control group, and acceptance rates did not differ significantly.

> [!note] From the public record
> Built from the ICLR 2025 program chairs' and the Stanford team's own published account, "Can LLM feedback enhance review quality? A randomized study of 20K reviews at ICLR 2025" (April 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The authors describe peer review at AI conferences as "stressed by rapidly rising submission volumes". ICLR had "year-over-year submission increases of 47% in 2024 and 61% in 2025", reaching 11,603 submissions in 2025. The goal was "to enhance review quality and, in particular, reduce low-information content reviews." It targeted vague critiques, questions that overlooked parts of the paper could address, and unprofessional statements. See [How AI research is published](#ai-research-publishing).

## Why this approach

The agent commented on reviews and made no direct changes to them, and it "was not designed to suggest new ideas to add to the review". The team chose the backbone model by a blind preference evaluation of feedback from GPT-4o, Gemini 1.5 Flash and Claude Sonnet 3.5; the paper gives no scores. It chained several LLMs because "one LLM was insufficient to generate high-quality feedback and format it correctly". See [Prompt patterns and chaining](#prompt-chaining). The pilot ran as a randomized controlled trial "to enable us to make causal inferences". See [Online controlled experiments for AI features](#online-experiments).

## The approach

1. **Randomization.** Papers were split at random into three equal groups: none, half or all of their reviews would receive feedback.
2. **Trigger.** One hour after a selected review was first submitted on OpenReview, the agent posted feedback as a reply, visible only to the reviewer and the program chairs and not a factor in decisions. Reviewers were told it came from an LLM.
3. **Pipeline.** Input was the paper's text and the review, without scores. Two parallel actor LLMs drafted feedback "to optimize for feedback diversity". An aggregator merged the lists, a critic "removed any feedback that was too superficial or nitpicky", and a formatter produced pairs of reviewer comment and feedback.
4. **Reliability tests.** Four LLM-based tests checked that the feedback was constructive, addressed the reviewer rather than the authors, did not simply restate the comment, and was correctly formatted. On a failure the pipeline ran once more; after a second failure nothing was posted. See [Guardrails and control](#guardrails-control).
5. **Tuning.** The team refined prompts on 50 ICLR 2024 reviews it perceived as low quality, running them through the tests "until we achieved a 100% pass rate."

## The stack

As of April 2025: Claude Sonnet 3.5 (June 20, 2024) as the backbone, pypdf's PdfReader for paper text, and an API wrapper that posted through the OpenReview interface. Claude Sonnet 3.5 also judged whether feedback was incorporated. The code is public at github.com/zou-group/review_feedback_agent. The acknowledgements thank Anthropic for helping increase rate limits.

## Results, and how they were measured

The paper counts 44,831 reviews on 11,553 papers, excluding desk-rejected submissions. Among all ICLR 2025 reviews, 22,467 were randomly selected for feedback and 22,364 formed the control group. The agent posted feedback to 18,946 reviews from October 15 to November 12, 2024. "Over 96% of generated feedback for ICLR 2025 reviews passed all reliability tests."

- **Updates.** "Of the 18,946 reviews that successfully received feedback, 5,031 (26.6%) reviews were updated". In the control group, "only 2,103 (9.4%) were updated". Updated means an edit distance greater than 5; for controls, at least one hour after posting.
- **Incorporation.** An LLM pipeline, with "a 92% accuracy rate" on 222 hand-labeled items, judged incorporation: "we estimate that 12,222 feedback items were incorporated into revised reviews." See [LLM-as-judge done right](#llm-as-judge).
- **Quality.** Two human AI researchers compared initial and modified reviews blind, on updated reviews that received 3-4 feedback items and where the proportion of incorporated feedback exceeded 0.60: "Human annotators preferred modified reviews 89% of the time (out of 100 examples)".
- **Length.** Updated reviews grew by an average of 80.3 words, against 2.1 for reviews not updated. Selection for feedback "causally increased the length of author rebuttals by an average of 48 words".
- **Decisions.** Acceptance was 32.3% for papers in the feedback group and 30.8% in the control group, but "this difference was not statistically significant."
- **Cost.** "Each review took roughly one minute to run through our entire pipeline and cost around 50 cents."

**Not measured:** whether reviews became more accurate or decisions better. The paper reports no survey of reviewers or authors. Its conclusion of "more engagement and satisfaction among both groups" follows its analysis of rebuttal lengths, reply lengths and score edits. The quality comparison has no agreement figure for its two raters, and the total cost of the study is not stated.

## What failed

- **No feedback.** 829 selected reviews got none because their feedback failed the reliability tests, and 2,692 were judged not to need any.
- **Few comments on misunderstandings.** The agent "rarely chose to comment on content misunderstandings": it had to be certain of an error and quote the paper, with no tolerance for hallucination.
- **Selection effects.** Early submitters updated more often, which the authors say affects comparisons of updated and not-updated reviews. Counting selected reviews that got no feedback "could dilute the actual effect of the feedback."
- **Narrow scope.** The three categories "may not capture all aspects of review quality."

## What the team would do differently

The paper lists next steps: more feedback categories, reasoning models for complex issues, newer reliability-test methods, and runs at future conferences. The blog post adds that "more research and rigorous assessments are needed to understand how AI can responsibly enhance peer review."

The wiki's reading: caution sits in several places: the critic, the tests after it, and the rule that a comment on a misunderstanding needs certainty and a quote from the paper. Failed feedback is dropped. The price shows in misunderstandings, where the agent said little. The randomization supports group-level effects; comparisons of reviewers who did and did not update are observational.

## Disclosure

None.

## Sources

- Nitya Thakkar, Mert Yuksekgonul, Jake Silberg, Animesh Garg, Nanyun Peng, Fei Sha, Rose Yu, Carl Vondrick and James Zou, Stanford University with the ICLR 2025 program chairs, [“Can LLM feedback enhance review quality? A randomized study of 20K reviews at ICLR 2025”](https://arxiv.org/abs/2504.09737), arXiv:2504.09737, 13 April 2025.
- James Zou and Nitya Thakkar, for the Review Feedback Agent Team and the ICLR 2025 Program Chairs, ICLR, [“Leveraging LLM feedback to enhance review quality”](https://blog.iclr.cc/2025/04/15/leveraging-llm-feedback-to-enhance-review-quality/), ICLR Blog, 15 April 2025.

## Related

- [About playbooks](#about-playbooks)
- [How AI research is published: arXiv, conferences and peer review](#ai-research-publishing)
- [Online controlled experiments for AI features](#online-experiments)
- [LLM-as-judge done right](#llm-as-judge)
- [Guardrails and control](#guardrails-control)
