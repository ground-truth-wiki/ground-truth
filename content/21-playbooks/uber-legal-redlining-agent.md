---
id: uber-legal-redlining-agent
book: 21
order: "21.100"
title: "Uber's Legal Redlining Agent: reviewing contract redlines inside Word"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [legal, contract-review, feedback-loops, office-add-ins, public-record]
visuals: []
type: playbook
account: public-record
industry: "Mobility and delivery (in-house legal)"
use_case: "A Microsoft Word add-in that suggests actions, comments, a risk level and counter-language for a counterparty's contract redlines, for lawyers to accept, reject or modify"
outcome: "An over 20% reduction in average contract review time and 91% accuracy in AI-generated decisions since launch with the Legal team"
measured_how: "No method, baseline, sample or period stated for either figure; the agent was piloted with Uber's Legal team in 2025 (Uber, October 2026)"
prerequisites: [rag-fundamentals, human-in-the-loop]
replications: []
---
> [!tldr]
> Uber built the Legal Redlining Agent, a Microsoft Word add-in that suggests how its lawyers should answer a counterparty's changes to a contract. A plain RAG prototype grew into a system with lawyer feedback, time-weighted retrieval, a rules engine and a tone prompt whose content lawyers write. Uber reports "an over 20% reduction in average contract review time" and "91% accuracy in AI-generated decisions", without saying how either was measured.

> [!note] From the public record
> Built from Uber's own published account, "Scaling AI in Legal: Building Uber's Redlining Agent" (October 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

"At Uber, thousands of contracts are negotiated every year." The post calls their review "time-consuming, repetitive, and often a bottleneck for deals, onboarding, and launches". The aim was to automate the repeatable redline work and free lawyers' time for complex judgment calls.

## Why this approach

"Lawyers live in Word, so asking them to copy-paste between tools would kill adoption." So the agent runs inside Word.

Decisions are split in two. Policies that are not negotiable go to a deterministic rules engine: "If a rule matches, it acts as a hard guardrail, overriding the model." Negotiable matters, such as tone and strategy, go to a feedback loop that learns from lawyers. See [Guardrails and control](#guardrails-control). The post compares no other designs apart from its own earlier iterations.

## The approach

For each change a counterparty proposes, the add-in suggests an action, a comment that justifies it with legal reasoning, and a risk level. Lawyers review each suggestion, "deciding whether to accept, reject, or modify it". The post describes four iterations and a rules database:

1. **RAG.** The system retrieved the sections of the Legal team's playbooks most similar to a counterparty's change and passed them, with the change, to an LLM. See [RAG fundamentals](#rag-fundamentals).
2. **Feedback.** The first version stored the lawyer's decision and a thumbs-down signal. Later versions added comments and the final text the lawyer used: "This granular data proved to be a turning point." A similarity search with metadata filtering narrows the pool "to about 20 pertinent documents", an LLM checks them against the intent of both sides, and exponential decay weighting, with a half-life "currently set to 365 days", favors recent decisions. See [The data flywheel](#data-flywheel).
3. **Tone.** A final LLM call adjusts the style of the output. Engineering manages the structure of the prompt, and lawyers write its content: an objective, the preferred style and conversation starters as few-shot examples. The objective uses "a proactive and pessimistic AI reflection technique" in a single prompt, and "The lack of loops also limits token usage and latency."
4. **Agentic modifications.** When the decision is to modify, the agent drafts counter-language from historical feedback and rules, because "the real time-saver for a lawyer is drafting the counter-proposal."
5. **Rules database.** Lawyers attach rules to text in template contracts. "A rule encapsulates Uber’s stance, any fallback positions, and an example of the desired application response." A rule fires only on strict semantic matches, and a final LLM step checks the output against it.

## The stack

As of October 2026: a Word add-in built on React and TypeScript, using Microsoft's Office JavaScript API to read tracked changes and apply modifications; a Python back end running a LangGraph workflow that does intent detection, risk assessment and policy lookup in parallel; OpenSearch with nomic-embed-text-v15 embeddings for rules and feedback; Redis for session state; and Uber's GenAI Gateway. The text names no model beyond "state-of-the-art LLMs"; the alt text of one diagram (Figure 9) mentions "tone adjustment using GPT 5.2". Continuous LLM-as-a-judge evaluations track the quality of retrieved context and adherence to company rules. See [LLM-as-judge done right](#llm-as-judge).

## Results, and how they were measured

- **Review time and accuracy.** "Since launching with our Legal team, we’ve seen an over 20% reduction in average contract review time" and "91% accuracy in AI-generated decisions."
- **Feedback volume.** The feedback store "now contains thousands of previous interactions."
- **User comment.** The post quotes one user: "It saved me real time; especially with comment suggestions."

The agent was piloted with Uber's Legal team in 2025.

**Not measured:** the post gives no baseline review time, no number of contracts, decisions or lawyers behind the two figures, and no measurement period. It does not say how accuracy was judged, publishes no values for its judge metrics, and reports no cost.

## What failed

- **Plain RAG.** Search keys differed from the playbook text, and "This inconsistency led to unreliable application decisions." Replies were "either overly defensive or excessively positive", and for cases the playbooks did not cover, "The application produced effectively random responses".
- **Thin feedback.** A decision and a thumbs-down "provided a basic error signal but lacked important nuances."
- **Tone.** "Early outputs oscillated between two failure modes": "sometimes overly defensive and adversarial; other times inappropriately accommodating and eager to please".
- **Free drafting.** "Simple generative text often hallucinates terms or drifts from the contract’s defined terms".
- **Word integration.** The Office JavaScript API "is inherently slow", deleted text in tracked changes returns empty strings, and "The tracked changes API has edge cases that cause crashes on certain document structures," so the team caches aggressively, keeps its own text state and loads documents defensively.

## What the team would do differently

The post states lessons rather than things it would redo. "The most durable lesson wasn’t about the model or architecture;" it was about bringing an agent into lawyers' daily work. Prompts that directly shape the output format should be managed by subject matter experts or end users, with AI teams guiding them. Of the in-house lawyers who wrote the conversation starters in the tone prompt, the post says: "Within days, they’d tuned it to match their voice precisely." See [Prompt and config management](#prompt-config-management).

Next, Uber is exploring agentic harnesses such as Claude Code and OpenCode with skills, and plans to explore legal ontologies and knowledge graphs.

The wiki's reading: without a published method, the headline figures are hard to compare with others. The design choices transfer better: rules that override the model, feedback weighted by recency, and experts who own the tone prompts.

## Disclosure

None.

## Sources

- Austin Greco, Meghana Somasundara and Frank Tenente (the author bios also list Sean Po and Rush Tehrani), Uber, [“Scaling AI in Legal: Building Uber's Redlining Agent”](https://www.uber.com/at/en/blog/building-ubers-redlining-agent/), Uber blog, 8 October 2026.

## Related

- [About playbooks](#about-playbooks)
- [The data flywheel](#data-flywheel)
- [Human in the loop](#human-in-the-loop)
- [Guardrails and control](#guardrails-control)
- [Prompt and config management](#prompt-config-management)
