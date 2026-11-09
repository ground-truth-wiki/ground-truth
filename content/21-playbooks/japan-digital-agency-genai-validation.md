---
id: japan-digital-agency-genai-validation
book: 21
order: "21.98"
title: "Japan's Digital Agency: testing generative AI on government work"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [public-sector, model-selection, eval-datasets, procurement, public-record]
visuals: []
type: playbook
account: public-record
industry: "Public sector (Japanese central and local government)"
use_case: "A chat platform with a choice of LLMs for national and local government staff, plus scored tests of generative AI on nine administrative use cases such as public comment processing and confidentiality classification"
outcome: "90% or more of surveyed users said it helped work efficiency and output quality (self-reported); per-use-case score rates included 98% for confidentiality classification and 60% (40% for the cited location) for finding the source of a public comment"
measured_how: "Survey of about 750 registered users with 256 respondents (response rate about 34%), 22 to 28 March 2024, plus test sets per use case, run and scored by FIXER's team with a double check by Digital Agency project staff, December 2023 to March 2024 (Digital Agency, from contractor FIXER Inc.'s final report, May 2024)"
prerequisites: [choosing-a-model, eval-datasets]
replications: []
---
> [!tldr]
> From December 2023 to March 2024, Japan's Digital Agency and its contractor FIXER Inc. gave 767 registered government users a chat platform with ten LLMs, and tested generative AI on nine administrative use cases. In the public comment use case, classification scored 90%, while tasks that needed an understanding of context scored lower. On procurement, the report says GPT-4 Turbo and Claude 3 gave different results by task, so the requirements, not a vendor, should set which LLM to buy.

> [!note] From the public record
> Built from Japan's Digital Agency's own published account, "行政における生成AIの適切な利活用に向けた技術検証の環境整備" (May 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The Digital Agency wanted to learn how administrative work should use generative AI, which tasks it could improve, and by how much. In a part marked as the contractor's own understanding, the report says "行政における生成AIの活用はまだ限定的で、非効率な状況" (translated: "the use of generative AI in public administration is still limited, and the situation is inefficient"). The agency also wanted an environment fit for confidentiality level 2 information.

The report is a slide deck made from the final report of the contractor, FIXER Inc. Its first page says "文中の主張や解釈は政府を代表した意見ではなく事業者による解釈に基づいております" (translated: "the claims and interpretations in the text are not opinions representing the government but are based on the contractor's interpretation").

## Why this approach

The procurement specification required at least three LLMs, and the platform ended with 10. One stated aim of the project was to avoid future vendor lock-in. For each use case the team picked a model by the task: GPT-4 Turbo where high quality was needed, Claude 2.1 or Claude 3 Sonnet where prompts carried many tokens, and GPT-3.5 for a legal search feature, for speed. See [Choosing a model](#choosing-a-model).

## The approach

1. **A platform for staff.** 767 registered users on the web platform and 158 on a Slack bot, with 12 training sessions and 30 platform updates on user requests.
2. **A funnel for use cases.** A quick check with fictional data and 2 to 3 test questions decided whether a task became a use case. Then came a small test (about 10 questions per step on part of the real data), a full test on all of it, and review by the staff.
3. **Scoring.** Criteria for correctness and clarity came from user interviews, with partial points except on clear-cut criteria such as confidentiality. Some test sets added questions the supplied data could not answer, to check that the model says it does not know. See [Building eval datasets](#eval-datasets).
4. **Use cases** included public comments, procurement labelling, guidebook and personnel rule answers, Diet answer drafts, glossaries, code conversion and confidentiality classification.

## The stack

As of March 2024: FIXER's GaiXer platform in a dedicated environment. Azure OpenAI Services served GPT-3.5, GPT-3.5-16K, GPT-4, GPT-4-32K and GPT-4 Turbo; Amazon Bedrock served Llama 2 Chat 13B, Claude 2, Claude 2.1 and Claude 3 Sonnet; the Japanese LLM Swallow 70B instruct was offered too. Features included web search RAG through Google and Bing, learning sets of uploaded files retrieved by vector search, prompt templates, a PlayGround that runs several LLMs side by side, and a checker that alerts on confidentiality level 2 and 3 information.

## Results, and how they were measured

- **Survey.** Of about 750 registered users, "回答者: 256人 (回収率: 約34%)" (translated: "respondents: 256 (response rate: about 34%)"). "利用者調査では、90%以上の利用者が業務効率化および成果物の品質に効果ありと回答した。" (translated: "in the user survey, 90% or more of users answered that it was effective for work efficiency and output quality"). This is self-reported.
- **Public comments** (10 comments): classification 90%, draft answers 90% (60% for the answer part), and "意見元抽出：60%(参照箇所の得点率は40%)" (translated: "source extraction: 60% (score rate for the cited location was 40%)"). The report says the last two need context and the data formats were messy.
- **Procurement labelling** (10 specifications): exact project name 100%, appropriate labels 50%, because extra labels came with the correct ones.
- **Guidebook answers** (588 test cases): "総合回答得点率は85%と高スコアとなった" (translated: "the overall answer score rate was a high 85%"). The main method put a guidebook summary in a long system prompt. RAG was also tried on two low-scoring questions per chapter: "システムプロンプトと比較して、RAGは得点率が26％低く" (translated: "compared with the system prompt, RAG's score rate was 26% lower"). See [Context engineering](#context-engineering).
- **Personnel rules** (the report lists 62 test cases for this use case): correct citation 72%, in a third trial on 16 questions. Re-running 5 questions with Claude 3 instead of Claude 2.1, with the same prompt, raised the score rate from 33% to 67%.
- **Diet answers** (10 questions): 1 draft matched the real answer in outline; 7 did when given keywords from it as hints.
- **Confidentiality classification** (50 test cases): classification 98%, rationale 80%.

**Not measured:** the report states no measured task times. Its time savings are estimates, from survey answers (the question says "感覚値で構いません", translated: "a rough sense is fine") and from step times based on interviews with staff and assumed case counts. FIXER's team ran and scored the tests, with a double check by Digital Agency project staff.

## What failed

- **Low use.** "技術検証基盤を週2回以上利用したのは登録者の約4割であった。" (translated: "about 40% of registered users used the platform twice a week or more"). Rare users most often said they were busy or did not know which tasks suit it.
- **Answering for staff.** In the guidebook use case, the report concludes: "RAG有無にかかわらず、LLMを用いて行政職員レベルの正確性を以て回答代行させることは容易でない結果となった" (translated: "with or without RAG, it proved not easy to have an LLM answer on staff's behalf with the accuracy of an official").
- **Confidentiality.** "機密性分類２判定は100%精度での回答は困難。よって防止策的な利用は非推奨。" (translated: "classifying confidentiality level 2 with 100% accuracy is difficult; therefore preventive use is not recommended"). The report suggests batch audits of logs after the fact instead.

## What the team would do differently

On buying models: "ユースケースでGPT-4 TurboとClaude 3の回答品質を比較したところ、課題によって異なる結果となった" (translated: "comparing the answer quality of GPT-4 Turbo and Claude 3 in the use cases gave different results by task"). So "どのLLMを調達するか、ベンダーに任せず、要件で方針を示すことが望ましい" (translated: "it is desirable to state in the requirements which LLM to procure, rather than leave it to the vendor"). For drafting specifications, it suggests trials on a SaaS or similar that can compare several LLMs. It proposes test cases designed per use case. And since "人間との協働が前提である以上、LLMの回答精度だけを評価する意味は限定的" (translated: "as long as working with humans is the premise, evaluating only the LLM's answer accuracy has limited meaning"), it proposes setting the accuracy each use case needs. To spread use, it says each task needs LLM, prompts and learning data provided as a set, besides training. See [Human in the loop](#human-in-the-loop).

The wiki's reading: several scored test sets had only 10 items, so those scores point to tasks worth a larger test rather than measure production accuracy.

## Disclosure

None.

## Sources

- No individual authors named, Digital Agency (Government of Japan), based on the final report of the contractor FIXER Inc., [“行政における生成AIの適切な利活用に向けた技術検証の環境整備”](https://www.digital.go.jp/assets/contents/node/information/field_ref_resources/19c125e9-35c5-48ba-a63f-f817bce95715/e03a8092/20240510_resources_ai_r5mainresults.pdf) (translated: "Setting up an environment for technical validation toward the appropriate use of generative AI in public administration"), PDF slide report in Japanese, first published 13 May 2024, corrected 17 May 2024.
- No individual authors named, Digital Agency (Government of Japan), [“In fiscal 2023, we conducted a technology validation for the appropriate use of generative AI in Digital Agency and administration.”](https://www.digital.go.jp/en/news/19c125e9-35c5-48ba-a63f-f817bce95715), Digital Agency news, 13 May 2024, updated 17 May 2024. Japanese original: [“2023年度 デジタル庁・行政における生成AIの適切な利活用に向けた技術検証を実施しました”](https://www.digital.go.jp/news/19c125e9-35c5-48ba-a63f-f817bce95715).

## Related

- [About playbooks](#about-playbooks)
- [Choosing a model](#choosing-a-model)
- [Building eval datasets](#eval-datasets)
- [Scoping AI features: when to use AI and what success means](#ai-use-case-scoping)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
