---
id: notion-model-router
book: 21
order: "21.25"
title: "Notion's Auto: evaluating a model router on replayed real tasks"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [model-routing, llm-as-judge, simulated-environments, knowledge-work, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (productivity and knowledge-work tools)"
use_case: "Notion's model router, Auto, evaluated by replaying sampled real tasks in a simulated Notion environment and scoring the outputs with a calibrated LLM judge"
outcome: "Notion reports that, on average, Auto delivers roughly 90% of the performance of frontier models, like GPT-6 Astra or Claude Opus 5.5, for about a 90% lower cost"
measured_how: "Calibrated LLM judge (calibrated against Elo rankings from pairwise ensemble judging) on thousands of simulated tasks across the most common knowledge-work use cases; the eval set sampled hundreds of real tasks from each of the 20 largest task clusters; data from opted-in customers; no period stated (Notion blog, October 2026)"
prerequisites: [llm-as-judge, gateways-routers]
replications: []
---
> [!tldr]
> Notion evaluated Auto, its model router, by sampling real tasks from its 20 largest task clusters, replaying them in a simulated Notion environment called Gymmy, and scoring the outputs with an LLM judge calibrated against Elo rankings from pairwise judging. Notion reports that Auto "delivers roughly 90% of the performance of frontier models" for "about a 90% lower cost". The post does not describe how the router picks a model, and its text gives no absolute scores and no results from a live test of Auto.

> [!note] From the public record
> Built from Notion's own published account, "Inside Notion’s upgraded model router, Auto" (October 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Auto is "Notion’s model router". The post says the team's priority when developing it was "to deliver high-quality results while making customers’ AI credits go further." The post is about how the team measured that. It argues that "Real-life knowledge work is messy", and that "relying solely on one LLM to judge another’s output doesn’t reliably capture that complexity."

## Why this approach

The post does not say which routing designs were considered, or why a router was chosen over a single model. It explains the evaluation choices instead. The team studied the tasks first, because "the way we reward or penalize a model output depends entirely on the gap" between "what we think it should do and what it actually does." It replayed tasks in a simulated Notion environment so that different models could attempt "the same task using Notion’s actual tools from the same starting state." And it calibrated its judge, because scoring without calibration was too noisy (see What failed, and [LLM-as-judge done right](#llm-as-judge)).

## The approach

1. **Cluster the tasks.** The team grouped common Notion AI use cases into buckets such as “Maintain CRM contacts, interactions, and follow-ups,” selected the 20 largest task clusters and randomly sampled hundreds of real-world tasks from each one. The post says its analyses use data from customers who explicitly opted in to Notion's data-sharing program. See [Building eval datasets](#eval-datasets).
2. **Replay the tasks in Gymmy.** Gymmy is the team's simulated Notion environment. It runs Notion's application code, databases and search services in isolated sandboxes, each loaded with a saved copy of a workspace's data.
3. **Judge in pairs.** An ensemble of frontier models compared the outputs of two models against a custom rubric, and the model a majority of judges picked was the winner. The preferences were turned into Elo scores. [Arenas and leaderboards](#arenas-leaderboards) explains how pairwise results become ratings.
4. **Calibrate one judge.** The team iterated on "the model, judge prompt, and thinking level" until a single LLM judge's rankings of individual outputs "closely matched the Elo rankings." That judge could then score thousands of responses in parallel.
5. **Check the judge against users.** The team compared its scores with the thumbs up and thumbs down that customers gave Notion AI's output.

## The stack

As of October 2026, the post names Auto, the Gymmy environment, and the models used to replay the tasks: GPT-6 Astra, Opus 5.5 (called Claude Opus 5.5 in the results), GPT-6.1 Sol and Auto. It does not name the judge models, publish the rubric, or describe Auto's routing logic and the models it routes between.

## Results, and how they were measured

- **Judge agreement.** "Pairwise and pointwise evaluations agreed more than 80% of the time". The post does not say how many outputs this covers.
- **Agreement with users.** The post reports a "positively correlated agreement" between the judge and customer feedback: "Quality scores usually ranked thumbs-up responses higher". Its text gives no numbers for this.
- **Quality and cost.** The results come from "evaluating thousands of simulated tasks across the most common knowledge-work use cases" with the calibrated judge. "On average, Auto delivers roughly 90% of the performance of frontier models, like GPT-6 Astra or Claude Opus 5.5", "for about a 90% lower cost." The post's charts show the scores, but its text does not state their values.
- **Credits.** For everyday work, "this can help users’ credits go up to 10× further." A table of "Estimated credits per task" gives 5 for Auto and 50 for Opus 5.5 on simple tasks, 10 and 85 on medium tasks, and 25 and 150 on complex tasks. A footnote adds that AI meeting notes uses Auto, and that a one-hour meeting "is estimated to use about 10 Standard credits."

**Not measured:** the post's text gives no absolute quality scores, no exact number of tasks, no period, no latency figures and no comparison with the earlier version of Auto. It reports no live experiment or production outcome, and it does not say how the cost comparison was calculated.

## What failed

- **Direct LLM scoring.** Asking an LLM to score outputs "was not reliable enough, even with a very descriptive evaluation rubric", and "Without proper calibration and even with extensive prompting, we got very noisy evaluations."
- **Judge bias.** "judges could favor their own model provider, or assign different values to the same score across evaluations." See [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation).
- **Pairwise judging at scale.** Running enough comparisons to calculate Elo scores for every new benchmark "would have been both too slow and too costly to scale", so the team moved to one calibrated judge.
- **Limits of the data.** The post says its analyses use data from customers who explicitly opted in to data sharing. Its text does not break the quality results down by task cluster.

## What the team would do differently

The post states no lessons of this kind. It closes by saying that evaluating against actual knowledge work lets the team keep improving "Auto’s balance between quality, speed, and cost", and that as new models are released, "we’ll keep testing them on real Notion tasks" and keep upgrading the router.

The wiki's reading: the reusable part is the chain of checks behind the judge, from pairwise ensemble votes to Elo, from Elo to one judge, and from that judge to user thumbs. The headline numbers are only as strong as that chain, and the post gives the agreement rate but not the judge model, the rubric or the number of outputs behind that rate. A team copying the approach should record those for its own judge, and check the savings against measured cost per task, as in [Cost engineering](#cost-engineering).

## Disclosure

None.

## Sources

- Ghita Houir Alami (Engineering Manager, Notion), Notion, [“Inside Notion’s upgraded model router, Auto”](https://www.notion.com/blog/inside-notions-upgraded-model-router-auto), Notion blog (Tech), 20 October 2026.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Gateways and routers](#gateways-routers)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Building eval datasets](#eval-datasets)
