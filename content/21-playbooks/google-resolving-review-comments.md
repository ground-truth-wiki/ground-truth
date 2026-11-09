---
id: google-resolving-review-comments
book: 21
order: "21.19"
title: "ML-suggested edits that resolve code review comments at Google"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-review, developer-tools, code-generation, ai-ux, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (internal developer tools)"
use_case: "Suggesting the code edit that addresses a reviewer's comment, shown to the code author in the code review tool and the IDE"
outcome: "40% to 50% of previewed suggested edits applied by code authors; suggestions above target confidence for around 50% of relevant reviewer comments; preview rate ~20% in beta and ~40% at launch"
measured_how: "Logged preview and apply events in an internal beta and the full internal launch, plus an offline evaluation at a 50% target precision; sample and period not stated (Google Research blog, May 2023)"
prerequisites: [classification-metrics, ai-product-ux]
replications: []
---
> [!tldr]
> Google trained a model to predict the code edit that addresses a reviewer's comment, and shows it to the author in the code review tool and the IDE. The post reports that "40% to 50% of all previewed suggested edits are applied by code authors". A prominent "Show ML-edit" button raised the preview rate from ~20% in the beta to ~40% at launch.

> [!note] From the public record
> Built from Google's own published account, "Resolving code review comments with ML" (May 2023), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Reviewers ask authors for code changes in comments written in natural language. The post says review takes "a significant amount of the code authors’ and the code reviewers’ time". "At Google, we see millions of reviewer comments per year", and authors need "an average of ~60 minutes active shepherding time" between sending a change for review and submitting it. In Google's measurements, the work to address comments "grows almost linearly with the number of comments". The post names one opportunity for ML: proposing code changes based on a comment's text.

## Why this approach

The post does not name the alternatives it explored. It explains two choices.

The first is the precision target. A higher target shows fewer suggested edits, and a lower one shows more incorrect ones. "Incorrect suggested edits take the developers time and reduce the developers’ trust in the feature." The team found that "a target precision of 50% provides a good balance". See [Classification and regression metrics](#classification-metrics).

The second is where the suggestion appears. Based on insights from the user studies, the post calls the code review tool integration "most suitable for a streamlined review experience". The IDE integration adds functionality, including 3-way merging.

## The approach

1. **Train.** The model is pre-trained on coding tasks and developer activities, then fine-tuned on reviewed code changes, the reviewer comments, and the edits authors made to address them. Google's monorepo lets the training data include "all unrestricted code used to build Google's most recent software, as well as previous versions".
2. **Iterate on the data.** The team compared datasets with one reviewer comment per file against datasets with several, tried classifiers to clean the training data, and chose the model with the best offline precision and recall.
3. **Calibrate.** The model and the suggestion filtering were tuned so that 50% of suggested edits on the evaluation dataset are correct.
4. **Serve.** For every new reviewer comment, the system queries the model. If the model is confident in the prediction and "a few additional heuristics are satisfied", the suggested edit goes to the code review frontend and the IDE. See [Uncertainty and confidence estimation for LLMs](#llm-uncertainty).
5. **Show and log.** In the code review tool, the author can preview, apply and rate the suggestion inside the comment. The IDE supports 3-way merging when the author has conflicting local changes. Preview and apply events are logged. See [Online evaluation](#online-evaluation).
6. **Roll out in steps.** User studies, an internal beta with a "Was this helpful?" button, then the full internal launch.

## The stack

As of May 2023, the post describes the model only as an application of "large sequence models (using the DIDACT methodology)". It does not give the model's name or size, and does not name the code review tool, the IDE or the supported languages. The work credits Google's Core Systems & Experiences team, Google Research and DeepMind.

## Results, and how they were measured

A dedicated pipeline turns the logged preview and apply events into acceptance rates.

- **Offline coverage.** "Offline evaluations indicate that the model addresses 52% of comments with a target precision of 50%."
- **Online coverage.** The post says the beta and full internal launch confirm the offline metrics: "we see model suggestions above our target model confidence for around 50% of all relevant reviewer comments". It does not define which comments are relevant.
- **Apply rate.** "40% to 50% of all previewed suggested edits are applied by code authors."
- **Preview rate.** In the beta, "code authors only previewed ~20% of all generated suggested edits". A UX change led to "an overall preview rate of ~40% at launch".
- **Where edits are applied.** "more than 70% of these are applied in the code review tool and fewer than 30% are applied in the IDE".
- **Comments addressed.** The changes raised "the overall fraction of reviewer comments that are addressed with an ML-suggested edit by a factor of 2 from beta to the full internal launch". The post does not give the fraction itself.

**Not measured:** the post gives no number of developers or changes, and no measurement periods. Its only count of comments is at scale: "these results help automate the resolution of hundreds of thousands of comments each year". The time saving is an expectation: "We expect that to reduce time spent on code reviews by hundreds of thousands of hours annually at Google scale." The post says "A 12-week A/B experiment across all Google developers" will further measure the productivity impact, but gives no results from it. See [Online controlled experiments for AI features](#online-experiments).

## What failed

- **Incorrect suggestions.** Feedback marked "not helpful" in the beta identified recurring failure patterns. The team added serving-time heuristics to filter them. The post says "we traded quantity for quality and observed an increased real-world acceptance rate", but gives no number and does not list the patterns.
- **Discoverability.** The beta "showed a discoverability challenge". The fix was "a prominent “Show ML-edit” button" next to the reviewer comment.
- **Conflicts.** Suggested edits in the code review tool were "often not applicable due to conflicting changes that the author did during the review process". A new button opens the IDE in a merge view.

## What the team would do differently

The post states no regrets. Next steps: raise the model's quality and recall, improve discoverability, and investigate showing suggested edits to reviewers while they draft comments and expanding the feature into the IDE for natural-language commands.

The wiki's reading: the offline metrics did not show the discoverability problem; the beta's preview rate did. Log previews and applies separately, and treat the button as part of the system. See [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).

## Disclosure

None.

## Sources

- Alexander Frömmgen, Staff Software Engineer, and Lera Kharatyan, Senior Software Engineer, Core Systems & Experiences, Google, [“Resolving code review comments with ML”](https://research.google/blog/resolving-code-review-comments-with-ml/), Google Research blog, 23 May 2023.

## Related

- [About playbooks](#about-playbooks)
- [AI product and UX](#ai-product-ux)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Online evaluation](#online-evaluation)
- [Online controlled experiments for AI features](#online-experiments)
