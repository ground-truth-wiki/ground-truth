---
id: meta-ai-root-cause-isolation
book: 21
order: "21.73"
title: Root cause isolation at Meta with a fine-tuned Llama 2 ranker
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incident-response, root-cause-analysis, fine-tuning, ranking, public-record]
visuals: []
type: playbook
account: public-record
industry: "Social media (internal reliability tooling for a web monorepo)"
use_case: "Suggesting a top five of code changes that might be the root cause of a reliability investigation, using the information available at the investigation's start"
outcome: "In backtesting, \"42% of these investigations had the root cause in the top five suggested code changes\" (historical investigations; the post reports the 42% for investigations related to Meta's web monorepo)"
measured_how: "The post says \"exhaustive backtesting, with historical investigations and the information available at their start\"; number of investigations, period and baseline not stated (Engineering at Meta blog, June 2024)"
prerequisites: [incidents-on-call, reranking]
replications: []
---
> [!tldr]
> Meta built a system that suggests which code changes may have caused an issue under investigation. A heuristic retriever cuts thousands of changes to a few hundred, and a fine-tuned Llama 2 (7B) model ranks them down to five. In backtesting, Meta reports "42% accuracy in identifying root causes for investigations at their creation time related to our web monorepo."

> [!note] From the public record
> Built from Meta's own published accounts, "Leveraging AI for efficient incident response" (June 2024) and "The Evolution of AIOps at Meta: Beyond the Buzz" (December 2023), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The 2024 post names the problem: "Investigating issues in systems dependent on monolithic repositories can present scalability challenges", due to the accumulating number of changes across many teams. Responders also need to build context before they start, such as what is broken, which systems are involved and who might be impacted. The team focused on building a system "capable of identifying potential code changes that might be the root cause for a given investigation." See [Incidents and on-call](#incidents-on-call).

An earlier account by Meta's AIOps team (December 2023) does not cover this system but gives context: in a 2022 analysis by Meta's Reliability Engineering team of its worst critical incidents, "more than 50% of incidents were attributed to code changes and the deployment of config changes."

## Why this approach

The post does not compare the overall design with other ways of finding a root cause. Inside the ranker, the team "explored different ranking algorithms and prompting scenarios" and found that ranking through election "was most effective to accommodate context window limitations and enable the model to reason across different changes." It gives no numbers for the alternatives.

The wiki's reading: a cheap retriever followed by a costlier model-based ranker is the two-stage pattern described in [Reranking](#reranking).

## The approach

1. **Retrieve.** A heuristics-based retriever reduces the search space "from thousands of changes to a few hundred". The post's examples of what it uses are code and directory ownership and the runtime code graph of impacted systems.
2. **Rank by election.** A ranker built on a Llama model reduces the hundreds of changes to a list of the top five. Each prompt holds at most 20 changes and asks the model for the top five. The outputs of all requests are aggregated, and the process repeats until five candidates remain.
3. **Train.** Continued pre-training (CPT) on "limited and approved internal wikis, Q&As, and code" came first. A [supervised fine-tuning](#sft) (SFT) phase then mixed Llama 2’s original SFT data with more internal context and a root cause analysis (RCA) dataset of "~5,000 instruction-tuning examples". Each example holds details of 2-20 changes from the retriever, including the known root cause, and what was known at the investigation's start, such as its title and observed impact. The information is thin at that point, which the post says "allows us to perform better in similar real-world scenarios".
4. **Teach ranked output.** The model's log probabilities (logprobs) ranked the candidate changes. New examples expected a list in that order, root cause first, and re-running SFT with them let the model answer prompts asking for ranked lists.

## The stack

As of June 2024, the post names a heuristics-based retriever, a Llama 2 (7B) model trained with CPT and SFT, logprobs for ranking, and confidence measurement. It does not name serving or training infrastructure.

As of December 2023, the earlier account names Meta's wider investigation tools: Dr Patternson (Dr P) for automated runbooks, an Analysis Algorithms Service, and Event Isolation, built on "ML-based ranking models". The 2024 post does not link its system to these.

## Results, and how they were measured

- **Top five.** The post describes "exhaustive backtesting" with historical investigations and "the information available at their start". The result: "42% of these investigations had the root cause in the top five suggested code changes." The post calls these "promising results".
- **Retrieval.** The retriever narrows thousands of changes to a few hundred "without significant reduction in accuracy". No recall figure is given.
- **Main lever.** "The biggest lever to achieving 42% accuracy was fine-tuning a Llama 2 (7B) model". No accuracy is given without fine-tuning.

The 2023 account measures the earlier tools, not this system. Using them in critical-alert investigations "has been correlated with an approximately 50% decrease in MTTR for critical alerts", and Event Isolation, on average, "filters out 80% of the uninteresting events during an active investigation".

**Not measured:** the 2024 post does not state how many investigations were backtested, over which period, or against which baseline, such as the retriever alone. It says AI-based systems are used for root cause isolation in internal tools, but reports no adoption, no time saved and no share of answers withheld.

## What failed

The post reports no failed experiments. It names these risks and limits:

- **Wrong answers.** The post says AI in this context "can potentially suggest wrong root causes and mislead engineers." In response, employee-facing features prioritize "closed feedback loops and explainability of results", so responders can reproduce and validate the results themselves.
- **Fewer answers.** Low-confidence answers are not recommended to users, "sacrificing reach in favor of precision". See [Uncertainty and confidence estimation for LLMs](#llm-uncertainty).
- **Context window.** Election ranking, with at most 20 changes per prompt, was found most effective to accommodate context window limitations.

The 2023 account adds two cautions from Meta's wider AIOps work: "Relying solely on automation can result in false positives and missed critical issues", and "We still don’t have a great solution for service dependency analysis".

## What the team would do differently

The 2024 post states no such lessons. It looks ahead: expanding the systems "to autonomously execute full workflows and validate their results", and using AI "to detect potential incidents prior to code push".

The 2023 account lists four lessons from Meta's AIOps work: data is everything, automate but also assist, focus on explainability, and continuous learning. On the last, it says AIOps "is not a one-time implementation".

The wiki's reading: with the root cause in the top five for 42% of backtested investigations, the suggestions are a starting point a responder still checks. Reproducible results and silence at low confidence fit that. See [Human in the loop](#human-in-the-loop).

## Disclosure

None.

## Sources

- Diana Hsu, Michael Neu, Mohamed Farrag and Rahul Kindi, Meta, [“Leveraging AI for efficient incident response”](https://engineering.fb.com/2024/06/24/data-infrastructure/leveraging-ai-for-efficient-incident-response/), Engineering at Meta blog, 24 June 2024.
- Nitin Gupta and Madhura Parikh, Meta, [“The Evolution of AIOps at Meta: Beyond the Buzz”](https://atscaleconference.com/the-evolution-of-aiops-at-meta-beyond-the-buzz/), @Scale conference articles, 13 December 2023.

## Related

- [About playbooks](#about-playbooks)
- [Incidents and on-call](#incidents-on-call)
- [Reranking](#reranking)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Uncertainty and confidence estimation for LLMs](#llm-uncertainty)
