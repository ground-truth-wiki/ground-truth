---
id: responsible-ai
book: 17
order: "17.11"
title: Responsible AI in practice
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [fairness, transparency, accessibility]
visuals:
  - fairness-slices:chart
  - counterfactual-compare:compare
---
> [!tldr]
> Responsible AI turns values into checks: measure performance and errors across groups, test with counterfactual inputs, document models and systems, label synthetic content, support accessibility, and give people a way to contest decisions. Most of it is evaluation and documentation done for the people affected.

## Why it matters
A system that works well on average can fail badly for specific groups: speakers of some dialects, users of assistive technology, names that look unusual to the model. Those failures harm people, erode trust and increasingly carry legal risk. They are also invisible unless someone slices the data.

## Intuition
A bridge rated for the average truck may still fail under the heaviest one. Responsible AI is checking the loads that averages hide, and posting the limits where everyone can read them.

```viz
{"id":"fairness-slices","component":"chart","type":"bar","title":"An 8% average error rate hides a 19% error rate for one group","caption":"Illustrative error rates of a speech-to-text feature by speaker group. The average looks acceptable; one slice is more than twice as bad.","alt":"Illustrative bar chart of error rates by speaker group, with one group much higher than the average.","data":"illustrative","categories":["All users","Group A","Group B","Group C","Group D"],"y":{"label":"Word error rate","unit":"pct","min":0,"max":0.25},"series":[{"name":"Error rate","points":[[0,0.08],[1,0.06],[2,0.07],[3,0.09],[4,0.19]]}]}
```

## How it works
**Fairness evaluation.** Define the groups that matter for your use case (language, dialect, region, age, disability and, where lawful and appropriate, protected characteristics), and report quality and error metrics per slice, with intervals. Choose metrics for the harm: false rejections, wrong answers, lower-quality service. Different fairness definitions can conflict; pick and justify one. See [statistics for evals](#eval-statistics).

**Counterfactual testing.** Change only one attribute, such as a name or a dialect marker, and check whether outputs change when they should not. Matched pairs are cheap and revealing:

```viz
{"id":"counterfactual-compare","component":"compare","title":"Two applications identical except for the name receive different scores","caption":"An illustrative counterfactual test of a screening assistant. Hover the marks. Any systematic difference across many such pairs is a finding.","alt":"Comparison of two identical job applications differing only in the applicant’s name, with different model scores.","data":"illustrative","mono":false,"a":{"title":"Application 1","text":"Name: Applicant name A\nExperience: 6 years backend engineering, Postgres, Go\nEducation: BSc Computer Science\nModel score: 8.1 / 10","mono":false},"b":{"title":"Application 2","text":"Name: Applicant name B\nExperience: 6 years backend engineering, Postgres, Go\nEducation: BSc Computer Science\nModel score: 7.2 / 10","mono":false},"links":[{"a":"Name: Applicant name A","b":"Name: Applicant name B","note":"The only difference between the inputs."},{"a":"Model score: 8.1 / 10","b":"Model score: 7.2 / 10","note":"One pair proves little; run hundreds and test the average difference with an interval."}]}
```

**Documentation.** Model cards (Mitchell et al., 2019) describe intended use, evaluation results and limitations; datasheets for datasets (Gebru et al., 2018) document how data was collected and what it contains. System cards from model developers extend this to deployed systems. Write the equivalent for your own features.

**Content provenance.** Label AI-generated content where required or expected. The C2PA standard attaches signed provenance metadata to media; watermarking schemes such as Google DeepMind’s SynthID embed signals in generated text, images, audio and video. Neither is foolproof; combine them with disclosure in the interface.

**Accessibility.** AI features should work with screen readers, keyboard navigation and captions, and AI can itself improve accessibility, for example with image descriptions and transcription. Test with assistive technology users.

**Human oversight and recourse.** For consequential decisions, keep a person accountable, explain the main factors where possible, and give affected people a way to contest outcomes. See [human in the loop](#human-in-the-loop).

## In practice
A responsible-AI review for a feature:
- Who could be harmed, and how? List affected groups and harms.
- Which slices will we measure, with what metrics and minimum sample sizes?
- Which counterfactual tests will we run?
- What does the model or system card say about intended use and limitations?
- How is AI involvement disclosed, and is generated content labeled?
- How can people contest or correct outcomes?
- Who owns monitoring after launch?

## Numbers to know
> [!number]
> Rules of thumb. Slices need enough cases for intervals narrow enough to act on, often a few hundred per group for small differences. Counterfactual tests need many pairs; a single pair is an anecdote.

## Pitfalls and anti-patterns
> [!pitfall] Reporting only the average
> Averages are where unequal performance hides. Always slice.

- **Fairness metrics chosen after the fact** to make results look good.
- **Model cards written once and never updated.**
- **Disclosure buried in terms of service** instead of the interface.

## Talk like an expert
The vocabulary: **slice-based evaluation**, **disparate error rates**, **counterfactual fairness**, **matched pairs**, **model card**, **datasheet**, **system card**, **content provenance**, **C2PA**, **watermarking**, **recourse**. Experts treat responsible AI as measurable requirements with owners, not as values statements. The live debate is which fairness definitions to use when they conflict, and how to evaluate open-ended generative systems for subtler harms such as stereotyping.

> [!hottake] Responsible AI is just evaluation done for the people your averages leave out.
> **The counterargument:** some responsible-AI questions, such as whether a system should be built at all, who it shifts power to, and what consent it relies on, cannot be answered by measurement and need deliberate judgment.

## Check yourself
```quiz
responsible-ai
```

## Go deeper
- Mitchell et al., “Model Cards for Model Reporting” (2019); Gebru et al., “Datasheets for Datasets” (2018).
- The C2PA specification and Google DeepMind’s SynthID documentation.
- NIST’s work on bias in AI, such as Special Publication 1270 (2022).

## Related
- [Safety evals](#safety-evals)
- [Statistics for evals](#eval-statistics)
- [Governance and regulation](#governance-regulation)
- [AI product and UX](#ai-product-ux)
- [Privacy](#privacy)
- [Explaining model predictions](#model-interpretability)
- [Reading model cards and system cards](#model-documentation)
- [Dataset documentation: datasheets, data cards and Croissant](#dataset-documentation)
- [Synthetic media, provenance and deepfakes](#synthetic-media-provenance)
- [The EU AI Act in depth](#eu-ai-act)
- [AI risk management and impact assessments](#ai-risk-management)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Fairness metrics and bias measurement](#fairness-bias)
