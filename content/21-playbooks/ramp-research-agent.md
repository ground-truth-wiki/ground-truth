---
id: ramp-research-agent
book: 21
order: "21.42"
title: "Ramp Research: an agentic data analyst in Slack"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [data-analysis, agents, context-engineering, agent-evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Financial technology (internal analytics)"
use_case: "An in-house AI agent in Slack that answers employees' data questions, using metadata from dbt, Looker and Snowflake plus documentation written by domain owners"
outcome: "Over 1,800 data questions answered across more than 1,200 conversations with 300 users since launch in early August; 1,476 questions answered in #ramp-research-beta in the last 4 weeks, against 66 in #help-data"
measured_how: "Counts of questions, conversations and users in Slack, from launch to the post's date and over the last 4 weeks before it; no accuracy metric reported (Ramp Builders blog, September 2025)"
prerequisites: [data-analysis-agents, context-engineering]
replications: []
---
> [!tldr]
> Ramp built Ramp Research, an in-house AI analyst agent that answers employees' data questions in Slack from indexed dbt, Looker and Snowflake metadata plus documentation written by domain owners. In the last 4 weeks before the post it answered 1,476 questions, against 66 answered in the #help-data channel, and Ramp reports "a 10-20x increase in the number of questions people ask". The post measures volume, not accuracy.

> [!note] From the public record
> Built from Ramp's own published account, "Meet Ramp Research: Our Agentic Data Analyst" (September 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Data questions at Ramp went to the #help-data channel, where each one ended up "stacking up behind a single on-call analyst". The answer, in the post's words, "lands hours later, after the decision window has narrowed". The team calls this the data bottleneck: decisions wait and "most questions go unasked, as people hesitate to add to the growing queue of requests".

## Why this approach

The post does not compare alternative designs in detail. The reason it gives for an agent is scale: "Our analytics warehouse has thousands of tables and views, and many questions require row-level inspection to get right." Rather than relying only on generic compression methods such as keyword or vector search, the team let the agent explore the data and reason through it the way a human analyst would. Slack was the interface because it is Ramp's internal hub. For the wider category, see [Data-analysis and notebook agents](#data-analysis-agents).

## The approach

1. **Index the data context.** At Ramp, that context "lives in dbt, Looker, and Snowflake". The team aggregated and indexed this metadata so the agent can fetch the right models and form precise queries. This is the [context engineering](#context-engineering) layer.
2. **Add domain knowledge.** Domain owners on the analytics team wrote technical documentation on their areas. The documents sit in a file system the agent can open as needed.
3. **Let the agent explore.** The agent got tools to inspect column values, branch and backtrack. See [Tool use and tool design](#agent-tools).
4. **Build for Slack.** The agent runs as a Slack app, with in-thread CSV previews and stateful threads for multi-turn conversations. Teams have also added it to alert channels, to diagnose failed transactions, and to project channels, to scope out new features.
5. **Test the context and the steps.** After two earlier designs (see What failed), the team built "a Python mini-framework in our dbt project" that checks the final answer and also the intermediate steps, including expected tool calls, table references and query shape. The post says this closed the feedback loop: "update context, run tests, and confirm improvements". See [Evaluating agents](#evaluating-agents).

The post adds: "Ramp Research does not have access to any personally identifiable information (PII)."

## The stack

As of September 2025, the post names a Slack app as the interface; metadata from dbt, Looker and Snowflake, aggregated and indexed; domain-owner documentation in a file system; agent tools to inspect column values, branch and backtrack; in-thread CSV previews; and a Python mini-framework for tests in Ramp's dbt project. It does not name the language model, the agent framework or the search index.

## Results, and how they were measured

- **Usage since launch.** Since launching in early August, Ramp Research "answered over 1,800 data questions across more than 1,200 conversations with 300 different users", as of the post's date, 18 September 2025.
- **Agent against help channel.** "In the last 4 weeks, Ramp Research answered 1,476 questions in #ramp-research-beta, compared to 66 answered in #help-data." These are counts of answered questions in two channels over the same period, not a comparison of answer quality.
- **More questions asked.** "The result is a 10-20x increase in the number of questions people ask." The post attributes most of the growth to questions that "previously died in drafts or never left someone’s head". It does not say how the range was measured or against which period.
- **Adoption.** The #ramp-research-beta channel "now has 500+ members".
- **Multi-turn threads.** Stateful threads gave an "end-to-end improvement" in the agent's performance, the post says, with no number.

The post's "one- or two-point lift in decision quality" is part of a card-counting analogy, not a measurement.

**Not measured:** the post reports no answer accuracy or error rate, no results from its test suite, no measured response time (it says answers come in minutes, not hours) and no cost figures.

## What failed

- **Metadata alone was not enough.** Even with the indexed context, "the agent struggled to connect its understanding of our data to the different domains of Ramp’s business". Much of that knowledge was tacit and lived with domain owners, hence their documentation.
- **Checking answers.** Early on, users had to open Redash or Snowflake to inspect data and verify answers. The team then added in-thread CSV previews.
- **Human review did not scale.** The first evaluation design pinged domain owners in Slack for every in-domain question. The post says this "didn’t scale, as effort still increased with request volume and reintroduced the core bottleneck". See [Human in the loop](#human-in-the-loop).
- **End-to-end tests did not explain failures.** The second design listed high-priority concepts per domain, with domain experts, and tested them end to end. "These exposed blind spots but gave little diagnosis as to why Ramp Research would pass or fail." Tests on intermediate steps followed.

## What the team would do differently

The post states no lessons about what it would redo. Its "Looking Forward" section says that teams are starting to use the agent to automate existing workflows, such as generating customer case studies and detecting common fraud patterns. It says that making the agent available internally via a headless API will let teams customize it further. It also says that further automating the maintenance and improvement of the context layer would let the team expand its coverage beyond the analytics database.

The wiki's reading: the evaluation path transfers best. Human review of each answer grew with demand, so the team moved to tests on the shared context and on intermediate steps, which show where a failure comes from. The headline numbers measure demand, not correctness: the post does not say how many of the 1,476 answers were right.

## Disclosure

None.

## Sources

- Faiz Hilaly, Cesar Duran and Jay Sobel, Ramp, [“Meet Ramp Research: Our Agentic Data Analyst”](https://engineering.ramp.com/post/meet-ramp-research), Ramp Builders blog, 18 September 2025.

## Related

- [About playbooks](#about-playbooks)
- [Data-analysis and notebook agents](#data-analysis-agents)
- [Context engineering](#context-engineering)
- [Evaluating agents](#evaluating-agents)
- [Human in the loop](#human-in-the-loop)
