---
id: gov-uk-chat
book: 21
order: "21.3"
title: "GOV.UK Chat: answering questions from government guidance"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, rag, guardrails, chat-assistants, public-record]
visuals: []
type: playbook
account: public-record
industry: Public sector (UK central government)
use_case: An AI assistant that answers the public's questions about tax, benefits, visas and other services from published GOV.UK guidance
outcome: Answer accuracy rose from 76% to 90% across all topics; 88% of in-scope questions answered; average answer time 10.7 seconds
measured_how: Two public pilots over 18 months (web and GOV.UK app), with accuracy judged by subject matter experts and automated evaluation against GOV.UK content standards (Government Digital Service, March 2026)
prerequisites: [rag-fundamentals]
replications: []
---
> [!tldr]
> The UK's Government Digital Service built GOV.UK Chat, an assistant that answers questions only from published GOV.UK guidance, and tested it in two public pilots. Accuracy rose from 76% to 90%, its guardrails held against 508 jailbreak attempts, and the main open problem is speed: answers took 10.7 seconds on average.

> [!note] From the public record
> Built from the Government Digital Service's own account, "5 things we learned testing GOV.UK Chat: an AI assistant for government" (March 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

GDS built GOV.UK Chat for people with questions about government services such as tax, benefits and visas, and tested it with the public in two pilots before any wider release. Users in the pilots said it saved them time, and some avoided a phone call to a department's call centre.

## Why this approach

The assistant answers only from government guidance: the post says it "exclusively draws on guidance published on GOV.UK". Answering only from a fixed body of documents is the job [retrieval-augmented generation](#rag-fundamentals) is built for, although the post does not describe its retrieval design. The choice also fixes the scope: questions outside published guidance, or questions that need a person's own records, stay out of reach by design. The team tested a range of models, including open-source ones, and chose on accuracy while keeping latency acceptable.

## The approach

GDS ran two public pilots over 18 months:

1. **A web pilot,** in which 10,136 users asked 23,838 questions.
2. **A GOV.UK app pilot,** in which 641 people, invited through iOS TestFlight, asked 2,670 questions over 4 weeks.

Around the pilots the team ran a large research programme, including usability tests, diary studies, surveys, reviews of question and answer pairs, and an answer speed study with 144 participants. When ambiguous questions went unanswered, the team taught Chat to ask a clarifying question, which raised the share of in-scope questions it answers. Users see accuracy warnings and links to check each answer at its source.

## The stack

As of March 2026: the latest version runs on Amazon Bedrock with Anthropic's Claude models, and the system is built so that newer models can be swapped in. Safety guardrails screen for jailbreaking. A reply from the product lead under the post adds that the data pipeline uses LLMs only where necessary and prefers smaller, more efficient models where it can.

## Results, and how they were measured

- **Accuracy.** Data science work and better models helped "increase answer accuracy scores from 76%, our earliest benchmark, to our latest figure of 90% accuracy across all topics". Accuracy was judged by subject matter experts and automated evaluation tools, and an answer counted as accurate only if it met all the standards of published GOV.UK content. Partial answers were often rated inaccurate. The post does not say which sample of questions the 90% comes from.
- **Answer rate.** "Our answer rate for in-scope questions is now 88% with plans to improve further."
- **Usefulness.** "In a follow-up survey of GOV.UK app users, 73% found GOV.UK Chat useful, and 64% were satisfied with GOV.UK Chat." The post gives no sample size for this survey.
- **Safety.** "During the two pilots, there were 508 attempts to ‘jailbreak’ GOV.UK Chat", and the post reports that the guardrails stopped all of them.
- **Speed.** "GOV.UK Chat responses are slower than we’d ideally like; an average 10.7 seconds for an answer".

**Not measured:** the post says Chat scores higher than widely used consumer AI assistants on government questions but publishes no comparison data, and it reports no measured effect on call-centre demand.

## What failed

- **Partial answers.** Inaccurate answers often covered some parts of a question but not all, and the post is plain that "GOV.UK Chat can make mistakes."
- **Questions it could not answer.** Some in-scope questions went unanswered because they were phrased ambiguously, and some users wanted advice based on their personal information, which Chat does not support.
- **Speed against accuracy.** Newer, more capable models were slower. In the speed study, satisfaction rose when answers were simulated as faster. Streaming the answer would help, but it would mean redesigning some safety guardrails, which the post calls "a substantial bit of work".
- **Jailbreaks.** They were all stopped in the pilots, but the post calls jailbreaking an ongoing risk to manage. See [Jailbreaks and misuse](#jailbreaks-misuse).

## What the team would do differently

The post lists what comes next rather than what it would redo: raise the answer rate further, make answers faster without losing quality, possibly by streaming, and build a handover to a department's customer support in the same interface for questions Chat cannot handle. Chat is to be released to GOV.UK app users first, and the team plans to test ways to offer it on the GOV.UK website later in 2026.

## Disclosure

None.

## Sources

- Sam Dub and Sharon McDonald, Government Digital Service, [“5 things we learned testing GOV.UK Chat: an AI assistant for government”](https://insidegovuk.blog.gov.uk/2026/03/16/5-things-we-learned-testing-gov-uk-chat-an-ai-assistant-for-government/), Inside GOV.UK blog, 16 March 2026.

## Related

- [About playbooks](#about-playbooks)
- [RAG fundamentals](#rag-fundamentals)
- [Evaluating RAG](#rag-evaluation)
- [Guardrails and control](#guardrails-control)
- [Latency and throughput](#latency-throughput)
- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
