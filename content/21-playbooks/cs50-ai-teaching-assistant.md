---
id: cs50-ai-teaching-assistant
book: 21
order: "21.102"
title: "The CS50 Duck: an AI tutor built to guide students, not hand out answers"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [education, tutoring, llm-as-judge, fine-tuning, public-record]
visuals: []
type: playbook
account: public-record
industry: "Education (a university introductory computer science course and its online courses)"
use_case: "An AI tutor, the CS50 Duck, that answers students' course questions in chat, in VS Code and on the course forum while guiding them toward solutions instead of giving them"
outcome: "Summer 2023: 22 out of 25 curricular and 30 out of 39 administrative forum answers judged correct; Fall 2024: TFs preferred the few-shot and fine-tuned versions over the original 60% of the time"
measured_how: "A senior staff member reviewed the Duck's 64 forum answers from Summer 2023 (Liu et al., SIGCSE 2024); 72 TFs made 480 pairwise multi-turn comparisons in Fall 2024 (Liu et al., SIGCSE TS 2025)"
prerequisites: [prompting-fundamentals, llm-as-judge]
replications: []
---
> [!tldr]
> Harvard's CS50 built the CS50 Duck, a GPT-4 tutor with "pedagogical guardrails" meant to guide students, not hand them solutions. On the course forum, "22 out of 25 (88%) curricular answers were correct" in Summer 2023. Code blocks became more frequent after a switch to GPT-4o, and teaching fellows preferred few-shot and fine-tuned versions over the original 60% of the time.

> [!note] From the public record
> Built from the CS50 team's own published accounts, "Teaching CS50 with AI: Leveraging Generative Artificial Intelligence in Computer Science Education" (March 2024) and "Improving AI in CS50: Leveraging Human Feedback for Better Learning" (February 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

CS50 is Harvard University's introductory computer science course. A 500-student class on campus has diverse needs, and in the course's MOOC, with "more than 5 million registrants", students often have only other students to ask. The course had banned tools such as ChatGPT and GitHub Copilot. Its goal was to "approximate a 1:1 teacher-to-student ratio" with software that guides students without disclosing answers.

## Why this approach

Instead of forbidding AI, the team built its own tools with guardrails. It grounded answers with [retrieval-augmented generation](#rag-fundamentals), "without needing to fine-tune or retrain an LLM". When the system prompt alone proved limited, it tried [few-shot examples](#in-context-learning), then [fine-tuning](#fine-tuning-practice), because examples travel with every request and more than a few "can be costly and exacerbate instruction dilution".

## The approach

From Summer 2023, tools on one backend, CS50.ai, reached approximately 70 summer students, then thousands online and approximately 500 on campus in Fall 2023. The CS50 Duck chats on the CS50.ai website, in VS Code and on the Ed forum, where every answer is subject to "endorsement, amendment, or deletion by a human staff member".

CS50.ai wraps each query in a system prompt with course rules. For forum questions it retrieves 30-second segments of lecture captions. A guard screens for [prompt injection](#prompt-injection) and ends the session on a confirmed attack. Hearts throttle usage: 10 per student, one regained every three minutes.

In 2024 an evaluation platform let teaching fellows (TFs) pick the more pedagogically sound of two responses, single-turn or in multi-turn conversations; for single-turn sets, GPT-4 also chose. The versions compared:

- **V0:** the system prompt in use.
- **V1:** added instructions to ask leading questions instead of diagnosing errors.
- **V2:** V1 plus 4 example interactions.
- **V3:** a fine-tuned GPT-4o-mini, trained on 50 curated example conversations over 5 epochs.

## The stack

As of March 2024: GPT-4 hosted on Microsoft Azure, via OpenAI's Chat Completion API; text-embedding-ada-002 via OpenAI's Embeddings API; ChromaDB; prompts in YAML files; Ed via HTTP requests. As of February 2025: GPT-4o on Azure; GPT-4o-mini as the base model for all versions in the Fall 2024 comparison, as only it could then be fine-tuned; OpenAI's Eval framework with a customized "Battle" template and GPT-4; ChatBot Arena's open-source code for Elo ratings.

## Results, and how they were measured

- **Forum accuracy, Summer 2023.** A senior staff member outside the development team reviewed the Duck's 64 answers on Ed: "22 out of 25 (88%) curricular answers were correct" and "30 out of 39 (77%) administrative answers were correct." As a baseline, the paper cites a study where ChatGPT was "correct only 48% of the time" on software engineering topics.
- **Forum endorsement, Fall 2023.** Staff endorsed 70 of 180 answers. The paper says this "would seem to suggest an accuracy of only 39%" but suspects it understates accuracy, as questions per student on Ed fell from 1.1 (Summer 2023) to 0.28 (Fall 2023).
- **Students, Fall 2023.** In a non-anonymous mid-semester survey, 47% rated the tools "very helpful", 26% "helpful", 21% "somewhat helpful" and 6% "not helpful"; the response count is not given.
- **Scale and cost.** The first paper: "our costs remain reasonable at approximately $1.90 per student per month and $0.05 per prompt", even with "extensive user activity in November". By mid-November 2024, "approximately 211,000 students had used the duck", at "an average cost of $1.50 per student per year".
- **Single-turn, 2024.** On 50 student queries, 29 TFs made 1,309 comparisons, split roughly evenly between V0 and V1. GPT-4 ran 10 times; its most frequent choice per query was compared with the development team's choice, the top choice of all TFs, or that of TFs with at least two semesters. "The model was consistent with human preferences 82% of the time".
- **Multi-turn, Fall 2024.** 72 TFs at Harvard University and Yale University made 480 comparisons. They preferred the few-shot and fine-tuned versions "over the original version (V0) 60% of the time". Elo ratings ranked V0 last; the data could not separate V2 from V3.

**Not measured:** learning outcomes, any control group, or how many code blocks were complete solutions. How cost was computed, and whether V2 or V3 reached students, is not stated.

## What failed

- **Confident errors.** "AI tends to exhibit a tone of complete and authoritative confidence even when wrong".
- **Stale knowledge.** The authors attribute weaker administrative answers to GPT-4's training cutoff and an evolving syllabus.
- **Instruction dilution.** With system prompts "close to 1,000 tokens", the tools often generated overly helpful examples that, with minor adjustments, "could become a complete solution". Of 10 million chat messages, "approximately 2.1 million responses" contained code blocks.
- **A model change increased code blocks.** Moving from GPT-4 to GPT-4o "increased the frequency of code block generation unexpectedly": from 20% to 25% of messages and 44% to 56% of conversations. See [Model versions, previews and deprecations](#model-lifecycle).
- **The prompt-only fix overcorrected.** "V0 tended to offer assistance too readily, while V1 often failed to provide sufficient support."
- **Synthetic students fell short.** Realistic student-like queries for multi-turn evaluation proved hard to generate, so the team concluded human evaluators are best suited.

## What the team would do differently

The first paper holds that the "guardrailed" approach gives "a definite advantage over the alternative of forbidding it altogether". The second concludes that the system prompt alone is not enough, that "a limited amount of high-quality data can achieve satisfactory results", and that multi-turn evaluation better reflects real use. Next: prompt routing to shorter system prompts, to cut token costs, and answers tailored to student proficiency.

The wiki's reading: a provider's model update is a change to your product; the GPT-4o switch moved the behavior the guardrails existed to stop. If a match with any one of three references counted, the 82% judge agreement is a looser bar than agreement with one panel; see [LLM-as-judge done right](#llm-as-judge).

## Disclosure

None.

## Sources

- Rongxin Liu, Carter Zenke, Charlie Liu, Andrew Holmes, Patrick Thornton and David J. Malan, Harvard University (Charlie Liu: Yale University), [“Teaching CS50 with AI: Leveraging Generative Artificial Intelligence in Computer Science Education”](https://cs.harvard.edu/malan/publications/V1fp0567-liu.pdf), Proceedings of the 55th ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE 2024), Portland, OR, USA, 20 to 23 March 2024, doi:10.1145/3626252.3630938.
- Rongxin Liu, Julianna Zhao, Benjamin Xu, Christopher Perez, Yuliia Zhukovets and David J. Malan, Harvard University (Benjamin Xu: Yale University), [“Improving AI in CS50: Leveraging Human Feedback for Better Learning”](https://cs.harvard.edu/malan/publications/fp0627-liu.pdf), Proceedings of the 56th ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE TS 2025), Pittsburgh, PA, USA, 26 February to 1 March 2025, doi:10.1145/3641554.3701945.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Model versions, previews and deprecations](#model-lifecycle)
- [In-context learning and example design](#in-context-learning)
- [Fine-tuning in practice](#fine-tuning-practice)
