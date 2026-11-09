---
id: getyourguide-generative-listings
book: 21
order: "21.53"
title: "AI-drafted activity listings at GetYourGuide: a failed test, then a launch"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [travel, marketplaces, content-generation, online-experiments, public-record]
visuals: []
type: playbook
account: public-record
industry: "Travel (online marketplace for activities)"
use_case: "A generative AI step in the supplier product-creation wizard that turns an activity provider's existing text into draft listing content and fills structured fields"
outcome: "In the first test the primary success metric showed a decrease and the feature was not launched; after UI changes and a refined LLM, drop-off from the AI input page fell by 5 percentage points, the post reports an increase in all success metrics, and the feature launched to 100% of the user base"
measured_how: "Two experiments with activity providers assigned to A or B (first test: 75% treatment with opt-in, 25% control; split of the second test not stated); primary metric the percentage of activities submitted out of those that start the wizard; no sample size, duration or metric values given (GetYourGuide Careers blog, April 2025)"
prerequisites: [online-experiments]
replications: []
---
> [!tldr]
> GetYourGuide added a generative AI step to its 16-step product creation wizard: activity providers paste content they already have, and the AI drafts the listing and fills structured fields. In the first A/B test the primary success metric showed a decrease, so the feature was not launched. A second test followed clearer UI copy, a refined LLM and a new way to measure. The post reports "an increase in all our success metrics" and a launch to the whole user base.

> [!note] From the public record
> Built from GetYourGuide's own published account, "Revolutionizing the Experience Marketplace: The dual impact of Generative AI on Suppliers and Consumers" (April 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Activity providers on GetYourGuide create a new product in a 16-step wizard, where they add descriptions, photos, availability, pricing and locations. Feedback and research showed the process was long: "activity providers were sometimes spending up to an hour manually creating a new product with our wizard".

Content quality was the second problem. Despite instructions, tips and examples, provider content "can contain missing or contradictory information" and may lack a traveler-friendly tone. The post links this to traveler confusion, lower conversion for new products and "a high ratio of travelers needing to contact our care department" before booking. Travelers see what providers create, so the change reaches both sides of the marketplace.

## Why this approach

The post does not describe other options the team weighed. It states the team's belief that generative AI would make product creation faster and easier and improve content quality. It also names challenges. AI outputs are hard to evaluate because "these systems often act as black boxes". "One common pitfall is scope creep": underestimating the limits of AI and over-promising what it can do. See [Scoping AI features](#ai-use-case-scoping).

## The approach

1. **Input.** The provider pastes existing content, such as text from their own website, into an input box.
2. **Generation.** The system writes free-text sections, such as the full description, and fills structured fields, such as transport type and location tags. For the full-scale rollout, the post says: "The AI auto-completes 8 key steps, allowing activity providers to review content in minutes".
3. **First experiment.** Providers, not travelers, were assigned to A or B: 75% went to treatment, where they could opt in to the AI feature, and 25% to control. Smaller earlier tests had indicated an adoption rate of around 60%, so the team expected "around 50% of activities being created via AI". Travelers could not be assigned separately, because "a product created through AI could not also have a non-AI created version".
4. **Changes for the second experiment.** Ahead of the second test, the AI page was shown as a step inside the normal wizard, with the left-side menu and progress bar visible. The visual design and microcopy of the AI input page were reworked to say what the tool would and would not do. "We also refined the LLM to improve the content quality and to automatically fill out more sections." The post also reports building an experimentation framework that measured both supply-side and demand-side impact and accounted for skew from certain providers. It does not say when this was built. See [Online controlled experiments for AI features](#online-experiments).

## The stack

As of April 2025, the post names no model or vendor. It refers to "the LLM" and "the AI model". The new Supply Data Products team "did the heavy lifting for setting up the AI model". The in-house experimentation platform's functions were not fully accessible for experiments on activity providers. Qualitative feedback came from Hotjar surveys. The post says the second part of its series will cover the permutation testing framework and toolkit used to measure success.

## Results, and how they were measured

- **First experiment.** The primary success metric "measures the percentage of activities that get submitted out of the ones that start the product creation wizard". "Our treatment group lagged behind the control group." The outcome: "With our primary success metric showing a decrease, we closed the experiment to A and did not launch the feature."
- **Drop-off in the second experiment.** "The UI improvements reduced user drop-off from the AI input page to the following page in product creation by 5 percentage points". Users also had similar times on the pages not assisted by AI, so time on those manual pages fell compared with the first experiment.
- **Overall.** "The end result of our efforts was an increase in all our success metrics." Providers were more likely to complete onboarding, and the post reports "a solid increase in activity performance for activities onboarded through AI".
- **Launch.** "We closed the experiment and launched the feature to 100% of our user base."
- **Qualitative.** The post reports "instances where supply partners progressed through the product creation process in just 14 minutes from start to finish".

**Not measured:** the post gives no sample size, no experiment duration, and no values for the primary success metric or for activity performance in either test. It reports no measure of the accuracy of generated content and no figures for care contacts or conversion. The 14 minutes describe individual instances, not an average, and the manual process is described only as "sometimes" taking "up to an hour".

## What failed

- **Confusion about the AI step.** The post names "user confusion and a lack of trust" as a significant pitfall during AI feature launches. Providers landed on the AI page, thought they were in the wrong place and started over: the UI did not explain the tool.
- **Pages left to fill by hand.** Providers in the treatment group spent longer on pages the AI did not fill and were frustrated by them. "Different prompts for different experiences impacted the way activity providers behaved during the activity creation process."
- **Measurement.** Groups A and B differed significantly on traveler and supplier metrics even before the experiment, and some providers could skew results toward A or B depending on their assignment. The planned standard A/B analysis would not hold.

## What the team would do differently

The post frames its lessons as what led to success rather than what it would redo: learn why a failure happened instead of giving up; monitor metrics for travelers and providers, segmented by key dimensions; keep one central master file and a single "master table"; involve analysts from the start; study outliers; and monitor for issues in advance. On the interface: "Clear UI copy that outlines both the benefits and limitations of AI tools is crucial for user engagement."

The wiki's reading: the problems the post reports from the first test are mostly about the interface and the measurement, not the quality of the generated text. The second test changed the UI, the LLM and the analysis at the same time, so the post's overall gain cannot be split between them; only the drop-off change is tied to the UI. On two-sided marketplaces, decide before launch how to measure the side you cannot randomize. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) and [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).

## Disclosure

None.

## Sources

- Marcus Hunt and Hussain Hayat, GetYourGuide, [“Revolutionizing the Experience Marketplace: The dual impact of Generative AI on Suppliers and Consumers”](https://www.getyourguide.careers/posts/revolutionizing-the-experience-marketplace-the-dual-impact-of-generative-ai-on-suppliers-and-consumers), GetYourGuide Careers blog (Data Analytics), 23 April 2025.

## Related

- [About playbooks](#about-playbooks)
- [Online controlled experiments for AI features](#online-experiments)
- [AI product and UX](#ai-product-ux)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Scoping AI features: when to use AI and what success means](#ai-use-case-scoping)
