---
id: neurips-checklist-assistant
book: 21
order: "21.104"
title: "NeurIPS 2024: an LLM assistant for the author checklist"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [research, peer-review, llm-as-judge, adversarial-robustness, public-record]
visuals: []
type: playbook
account: public-record
industry: "Scientific research (conference peer review)"
use_case: "An optional LLM assistant that reviews authors' answers to the NeurIPS author checklist against their paper before submission"
outcome: "70% of surveyed authors found it concretely useful and 70% planned changes; inaccuracy (20/52) and excessive strictness (14/52) were the top complaints; justifications rewritten by GPT-4o raised scores on 14 of 15 questions"
measured_how: "Pre-usage (539) and post-usage (78) author surveys with 63 authors in both, freeform feedback, 40 re-submission pairs and an adversarial rewrite test, on 234 submissions at NeurIPS 2024 (Goldberg et al., arXiv, November 2024)"
prerequisites: [llm-as-judge, ai-research-publishing]
replications: []
---
> [!tldr]
> The NeurIPS 2024 experiment team offered authors an optional GPT-4 assistant that reviewed their answers to the conference's 15-question author checklist before submission. 234 papers were submitted. 70% of surveyed authors found it concretely useful and 70% planned changes, but inaccuracy and strictness were the top complaints. In a gaming test, GPT-4o rewrote only the justifications, and scores rose on 14 of 15 questions.

> [!note] From the public record
> Built from the NeurIPS 2024 experiment team's own published account, "Usefulness of LLMs as an Author Checklist Assistant for Scientific Papers: NeurIPS'24 Experiment" (November 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

NeurIPS requires authors to append a checklist to their manuscripts, and the paper calls it "a critical component in maintaining standards of research presented at the conference." Its 15 questions, designed by the NeurIPS organizers, cover topics such as claims, limitations, reproducibility, compute, ethics and human subjects. Authors give an answer and a justification for each.

The team asked whether authors see an LLM checklist assistant as a valuable addition, and whether it helps them improve their submissions. For how conference review works, see [How AI research is published](#ai-research-publishing).

## Why this approach

The paper calls LLMs in peer review "contentious and fraught with potential issues". The team chose "a relatively clear-cut and low-risk use case": checking submissions against standards, with results shown only to authors. Reviewers had no access. Earlier studies of checklist compliance looked back at published papers; this assistant ran live, before submission. The paper does not say why it chose GPT-4 or whether alternatives were compared.

## The approach

1. **Recruitment.** A NeurIPS blog post "released 8 days before the abstract submission deadline" invited authors to register. Participation was fully voluntary and separate from the submission system and review process.
2. **Parsing.** A PDF-to-text parser read the paper, appendices and checklist. Papers over 35 pages (or 15,000 words) were cut to the first 15,000 words, with a warning.
3. **One call per question.** The LLM received the question, the author's answer and justification, the guidelines and the paper, and returned a review and a score: 1 for no issues, 0.5 for minor improvements, 0 for critical issues.
4. **Report.** An HTML report showed green for no significant concerns and orange for needs improvement. Scores of 0 and 0.5 were merged because the team worried the evaluations "might be too harsh".
5. **Prompt tuning.** "Tuning was carried out using a dozen papers", some with planted errors. Step-by-step instructions worked better, and the team added instructions such as "use 0 score sparingly".
6. **Use and consent.** Each user could submit up to three times. The Carnegie Mellon University IRB approved the study.

## The stack

As of November 2024: "GPT-4 from OpenAI" through its API, one call per question, with temperature=1, top_p=1 and n=1; Codabench.org with 15 Google Cloud CPU workers; and a PDF-to-text parser the paper does not name. For the analysis, GPT-4 also clustered the feedback. Code, prompts and sample papers are on GitHub. The paper states no cost and no response time.

## Results, and how they were measured

Authors were surveyed before use (mandatory) and after (optional) on a four-point Likert scale; the team also analyzed feedback and re-submissions.

- **Usage.** "A total of 234 papers, each accompanied by a checklist, were submitted to the assistant." The pre-usage survey drew 539 responses, the post-usage survey "only 78 responses", from 63 unique participants.
- **Perceived value.** Among authors in both surveys (n=63), "70% of surveyed authors reported plans to make changes based on the feedback received," and "70% reported that they found the assistant concretely useful". The abstract gives the usefulness figure as "over 70%".
- **Expectations fell.** "It is notable that authors were even more positive before using the tool." The drop was statistically significant for "Excited to Use" and "Useful" (adjusted p-values of 0.007 and 0.013).
- **Feedback.** Each submission was advised to improve on 8 to 13 of the 15 questions.
- **Changes.** 35 respondents described changes they would make. In 40 instances an author resubmitted the same paper (out of 184 distinct paper submissions): 22 changed at least one answer, 39 at least one justification.
- **Responsiveness.** Where authors changed neither answer nor justification, the evaluation stayed the same 81% of the time, improved 7% and got worse 12%. With a changed justification, it improved 13% and got worse 5%; with a changed answer, it improved 15% and got worse 2%. The paper calls these differences high variance, given the small sample, but says they give some evidence that the evaluation responds to authors' changes.

**Not measured:** the paper describes no control group, and says "causal attribution to the assistant is not definitive". It reports no accuracy against a human-checked reference, no effect on acceptance or review outcomes, and no calendar dates for the deployment.

## What failed

- **Accuracy and strictness.** 52 of 78 post-usage responses described issues, led by "inaccuracy (20/52) and excessive strictness (14/52)". Many said it asked for things they believed were already addressed; one said it read a "thought experiment" as a real experiment. Others found feedback too generic (4) or inconsistent for an unchanged paper (3).
- **Text only.** It "did not check figures, tables, and external links", so it may have flagged information as missing that was in those assets.
- **Boilerplate.** "The LLM tends to provide some generic boilerplate for each question."
- **Gaming.** GPT-4o got three attempts to revise only the justifications from the assistant's feedback: "14 out of 15 questions show score increases". It invented a hardware description not in the paper and a placeholder code URL, and these were scored '1'. The paper warns that if such assistants were used as review tools without [human oversight](#human-in-the-loop), they "could be manipulated to raise scores based on persuasive rebuttals".
- **Privacy.** Sending papers to a third-party API "may have discouraged usage among highly privacy sensitive paper authors."

## What the team would do differently

The paper lists future work: better reading of scientific text, handling "multimodal content like figures and tables", measuring and mitigating bias, clearer communication of the assistant's limits, and randomized controlled experiments (see [Online controlled experiments](#online-experiments)).

The wiki's reading: the assistant works like an [LLM judge](#llm-as-judge) with one rubric per question, and the gaming test shows its weak point: a judge that rewards a persuasive justification without checking evidence can be talked up.

## Disclosure

None.

## Sources

- Alexander Goldberg, Ihsan Ullah, Thanh Gia Hieu Khuong, Benedictus Kent Rachmat, Zhen Xu, Isabelle Guyon and Nihar B. Shah, NeurIPS 2024 Checklist Assistant experiment (with the NeurIPS'24 organizers), [“Usefulness of LLMs as an Author Checklist Assistant for Scientific Papers: NeurIPS'24 Experiment”](https://arxiv.org/abs/2411.03417), arXiv:2411.03417, v1 5 November 2024, revised (v2) 8 November 2024.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [How AI research is published: arXiv, conferences and peer review](#ai-research-publishing)
- [Human in the loop](#human-in-the-loop)
