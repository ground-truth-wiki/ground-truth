---
id: google-incident-response-genai
book: 21
order: "21.17"
title: "Google: drafting security incident summaries with an LLM"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [security, incident-response, summarization, prompt-engineering, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Technology (security and privacy incident response at Google)"
use_case: "Drafting summaries of security and privacy incidents, and executive updates on behalf of the Incident Commander, for a human to review before use"
outcome: "51% time saved per incident summary drafted by an LLM versus a human; LLM summaries rated 10% higher than their human-written equivalents in a comparison where the author was not revealed; time ICs spent writing executive summaries reduced by 53%"
measured_how: "Time savings chart with sample size 300; 50 human-written and 50 LLM-written summaries presented to security teams without revealing the author; no rating scale, rater count, timing method or period stated (Google Online Security Blog, April 2024)"
prerequisites: [prompting-fundamentals, human-in-the-loop]
replications: []
---
> [!tldr]
> Google's security and privacy incident response teams built a tool in which an LLM drafts incident summaries for a human to accept, edit or discard. The post reports "51% time saved, per incident summary drafted by an LLM, versus a human", and, in a follow-up experiment, a 53% cut in the time Incident Commanders spent writing executive summaries.

> [!note] From the public record
> Built from Google's own published account, "Accelerating incident response using generative AI" (April 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Google summarizes security and privacy incidents for executives, leads and partner teams. The post says this can be tedious and time-consuming, and depends heavily on the audience and the complexity of the incident. The team estimates that "writing a thorough summary can take nearly an hour and more complex communications can take multiple hours." Effective communication informs executives so they can take any necessary actions, and helps meet regulatory requirements.

## Why this approach

The team "hypothesized that we could use generative AI to digest information much faster", freeing incident responders for more critical tasks. It tested whether LLMs could write summaries on par with humans. The tool was meant to be "complementing the work of our teams, vs. solely writing communications." The post names no other options it considered.

## The approach

1. **Structure the input.** Incident data is "messy and often unstructured": free-form text, logs, images, links, impact stats, timelines and code snippets. Long, noisy sections of code and logs became self-closing tags (`<Code Section/>` and `<Logs/>`), to keep the structure, save tokens and reduce the risk of hallucinations. During prompt engineering the team added tags such as `<Title>`, `<Actions Taken>`, `<Impact>`, `<Mitigation History>` and `<Comment>`, so the input mirrors the team's incident communication templates. See [Context engineering](#context-engineering).
2. **Refine the prompt.** Version 1 was a short task. Version 2 told the model to be concise and explained that a good summary covers the main incident response steps (coordination and resolution). The final prompt "inserted 2 human-crafted summary examples" and a `<Good Summary>` tag, which marks high-quality summaries and tells the model to start with the summary without repeating the task. See [In-context learning and example design](#in-context-learning).
3. **Keep a human in the loop.** A 'Generate Summary' button fills a text field with the LLM's draft. A human accepts it, edits it or discards it: "any LLM generated draft must be reviewed by a human." See [Human in the loop](#human-in-the-loop).
4. **Extend to executive updates.** The team then ran an experiment to draft executive communications on behalf of the Incident Commander (IC). These have sections such as summary, root cause, impact and mitigation, a specific structure and format, and writing best practices such as a neutral tone.

## The stack

As of April 2024, the post does not name the model, its vendor or its platform. Because incidents can contain confidential, sensitive and privileged data, the infrastructure stores no data: "Every component of this pipeline - from the user interface to the LLM to output processing - has logging turned off." The LLM does not use any input or output for re-training. Instead, the team uses "metrics and indicators to ensure it is working properly", without naming them. See [Privacy](#privacy).

## Results, and how they were measured

- **Blind comparison.** The team "took 50 human-written summaries from native and non-native English speakers, and 50 LLM-written ones" from the final prompt, and showed them to security teams without revealing the author. The post says the LLM-written summaries "covered all of the key points", and that "they were rated 10% higher than their human-written equivalents, and cut the time necessary to draft a summary in half."
- **Time per summary.** The post reports "51% time saved, per incident summary drafted by an LLM, versus a human." The chart caption gives "sample size: 300".
- **Executive updates.** "LLM-generated drafts, reduced time ICs spent writing executive summaries by 53% of time", "while delivering at least on-par content quality in terms of factual accuracy and adherence to writing best practices."

**Not measured:** the post does not say how drafting time was measured, when the 300 samples were collected, who rated the summaries or on what scale, or how the blind experiment and the 300 samples relate. It gives no sample size for the 53% figure, and no figures on how often drafts were accepted, edited or discarded.

## What failed

- **Short inputs.** "The only edge cases we have seen were around hallucinations when the input size was small in relation to the prompt size." The LLM made up most of the summary and key points were incorrect. The fix is in code: "If the input size is smaller than 200 tokens, we won’t call the LLM for a summary and let the humans write it." See [Hallucination and factuality](#hallucination-factuality).
- **Prompt version 1.** Summaries were too long, especially for executives, missed impact and mitigation, did not follow the team's writing practices and pulled in irrelevant data from email threads. The model struggled to tell which information was most relevant and up to date.
- **Prompt version 2.** Summaries still did not always match the expected format. At times the model lost sight of the task or did not take all guidelines into account. It still struggled to stick to the latest updates, and the team noticed "a tendency to draw conclusions on hypotheses with some minor hallucinations".
- **Risks that remain.** Human review of every draft is required to mitigate hallucinations and errors, but "human misinterpretation of a fact or statement generated by the LLM can also happen." The post's answer is to ensure human accountability and to monitor quality and feedback over time.

## What the team would do differently

The post states no lessons of this kind. Under "What's next" it says the team is exploring other security uses, such as teaching an LLM to rewrite C++ code to memory-safe Rust.

The wiki's reading: the habits transfer to other drafting tasks: tag the input to mirror the output template, add a few human-written examples, skip the model when the input is too thin, and keep a human accountable. The time figures appear as "51% faster", "51% time saved" and "in half", with no timing method, so a reader cannot tell how they relate.

## Disclosure

None.

## Sources

- Lambert Rosique and Jan Keller (Security Workflow Automation), and Diana Kramer, Alexandra Bowen and Andrew Cho (Privacy and Security Incident Response), Google, [“Accelerating incident response using generative AI”](https://security.googleblog.com/2024/04/accelerating-incident-response-using.html), Google Online Security Blog, 26 April 2024.

## Related

- [About playbooks](#about-playbooks)
- [Prompting fundamentals](#prompting-fundamentals)
- [In-context learning and example design](#in-context-learning)
- [Hallucination and factuality](#hallucination-factuality)
- [Human in the loop](#human-in-the-loop)
