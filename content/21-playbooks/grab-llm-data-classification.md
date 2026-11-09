---
id: grab-llm-data-classification
book: 21
order: "21.39"
title: "Grab: tagging sensitive data columns with an LLM"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [data-governance, pii-detection, text-classification, prompt-engineering, public-record]
visuals: []
type: playbook
account: public-record
industry: "Ride-hailing, delivery and financial services (Southeast Asian superapp)"
use_case: "Tagging each column or field of data entities, such as database tables and Kafka message schemas, with tags from an internal classification scheme, such as types of PII or business metrics, which users are then asked to verify"
outcome: "More than 20,000 data entities scanned within a month of rollout; users change less than one tag on average on acknowledged tables; 80% of data owners in an internal survey said the process helped them"
measured_how: "Entities scanned in the first month, tags changed by users on acknowledged tables, and an internal survey of data owners in September 2023 with no sample size stated; time saved is a back-of-the-envelope estimate (Grab Tech Blog, originally published October 2023, page dated 15 July 2024)"
prerequisites: [data-governance, structured-outputs]
replications: []
---
> [!tldr]
> Grab added GPT3.5 to Gemini, its internal service that tags data entity columns with labels such as PII for users to verify weekly. Within a month it had scanned "more than 20,000 data entities", and users change "less than one tag" on average on acknowledged tables. No precision or recall is reported.

> [!note] From the public record
> Built from Grab's own published account, "LLM-powered data classification for data entities at scale" (originally published October 2023, page dated 15 July 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

To protect sensitive data, Grab first ran manual campaigns in which data producers tagged whole schemas with sensitivity tiers, from Tier 1 (highly sensitive) to Tier 4 (no sensitive information). As a result, "half of all schemas were marked as Tier 1, enforcing the strictest access control measures". One Tier 1 table could put a schema of hundreds of tables at Tier 1, so many tables that should have been more accessible sat behind strict controls.

Moving access control down to tables "could not be done safely due to the lack of table classification in the data lake". More manual campaigns were not feasible: tables took much longer to classify than schemas, and app developers "interpreted internal data classification policies and external data regulations differently". Grab's Data Engineering and Data Governance teams set out to automate it, starting with PII detection. See [Data quality and governance](#data-governance).

## Why this approach

The first version of Gemini, an internal service "named before Google announced the Gemini model!", used a third-party classification service plus regex classifiers from the data governance team. That tool "did not allow customisations of its machine learning classifiers", and "the regex patterns produced too many false positives during our evaluation". In-house classifiers would have needed a dedicated data science team and manually labeled training data.

An LLM let governance staff state requirements as prompts, and "the LLM can be customised effortlessly without code or model training". Both engines run side by side: "Since we are still in the process of evaluating two engines, both of the engines are working concurrently."

## The approach

1. **Requests.** Data platforms send scan requests to Gemini, which groups them into mini-batches through a message queue at fixed intervals. A workflow-level rate limiter guards against throttling by the service providers. See [Rate limits, quotas and overload control](#rate-limits-overload).
2. **Classification.** The prompt makes the model a database column tag classifier that assigns tags "based on table name and column name", one per column, from a curated tag library such as Personal.ID, Personal.Name, Personal.Contact_Info, Geo.Geohash and None.
3. **Fixed output.** The model returns JSON pairs of column_name and assigned_tag for downstream processing. Techniques the team found useful: clear requirements, [few-shot examples](#in-context-learning), the DTO (Data Transfer Object) schema the output must follow, and a default None tag for when the model "cannot make a decision or is confused". See [Structured outputs](#structured-outputs).
4. **Verification.** Predictions go to a Kafka queue, and the data platforms "inform respective users weekly to verify the classified tags", which also feeds prompt changes. See [Human in the loop](#human-in-the-loop).
5. **Downstream use.** With rules from Grab's data privacy office, the tags set each entity's sensitivity tier, which "will be leveraged for enforcing the Attribute-based Access Control (ABAC) policies" and Dynamic Data Masking.

## The stack

As of the post (originally published October 2023, page dated 15 July 2024):

- Gemini, Grab's internal orchestration service.
- Two engines side by side: an unnamed third-party classification service and GPT3.5, whose context length was "4000 tokens for GPT3.5 at the time of development" (around 3000 words).
- Azure OpenAI, where "all Azure OpenAI model deployments share the same quota under one account, which is set at 240K tokens per minute".
- Kafka for publishing predictions, with integrations into Grab's metadata management and production database management platforms.

## Results, and how they were measured

- **Volume.** "Within a month since its rollout, we have scanned more than 20,000 data entities", "averaging around 300-400 entities per day".
- **User corrections.** The team found the model "surprisingly accurate with its great semantic understanding": "For acknowledged tables, users on average change less than one tag." The post does not say how many tables were acknowledged.
- **Owner survey.** In an internal survey of data owners in September 2023, "80% reported that this new tagging process helped them in tagging their data entities". No sample size is given.
- **Time saved, estimated.** From "a quick back-of-the-envelope calculation": "Assuming it takes a data owner approximately 2 minutes to classify each entity", "we are saving approximately 360 man-days per year for the company".
- **Cost.** "Cost wise, for the current load, it is extremely affordable contrary to common intuition." No figures are given.
- **Regulatory sandbox.** In the Singapore government's regulatory sandbox, Grab says it "successfully demonstrated how LLMs can efficiently and effectively perform data classification". The editor's note links this to the Infocomm Media Development Authority's Privacy Enhancing Technology Sandbox, which concluded in March 2024. No results are published.

**Not measured:** the post reports no precision or recall against a labeled set, no comparison of the two engines, and no change in how many schemas or tables sit at Tier 1 after the rollout.

## What failed

- **Earlier approaches.** Manual tiering over-restricted access. Later, the third-party tool's classifiers could not be customised, and the regex patterns gave too many false positives.
- **LLM limits.** The context length and the shared token quota constrain requests, and the output is "typically in free text format", which made prompt engineering necessary.
- **Verification remains mandatory.** The team plans to "remove the verification mandate for users once the accuracy reaches a certain level", a level the post does not define.

## What the team would do differently

The post states no lessons beyond the prompt techniques above. Its next steps: "We are currently exploring feeding sample data and user feedback to greatly increase accuracy." It is testing a confidence output so that "we would only trouble users when the LLM is uncertain of its answers" (see [Uncertainty and confidence estimation for LLMs](#llm-uncertainty)), building pipelines to "calculate the metrics of each version of the prompt", and planning to reach more data platforms.

The wiki's reading: the evidence is how many tags users change and a survey, not a labeled test set. Per-prompt metrics would be needed to justify dropping the weekly verification.

## Disclosure

None.

## Sources

- Hualin Liu, Stefan Jaro, Harvey Li, Jerome Tong, Andrew Lam, Chamal Sapumohotti, Feng Cheng and Aaqib Kufran, Grab, [“LLM-powered data classification for data entities at scale”](https://engineering.grab.com/llm-powered-data-classification), Grab Tech Blog, 15 July 2024 (editor's note: originally published October 2023).

## Related

- [About playbooks](#about-playbooks)
- [Data quality and governance](#data-governance)
- [Privacy](#privacy)
- [Structured outputs](#structured-outputs)
- [Human in the loop](#human-in-the-loop)
