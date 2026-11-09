---
id: panasonic-connect-generative-ai
book: 21
order: "21.109"
title: "Panasonic Connect's ConnectAI: one year of a company-wide AI assistant"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [manufacturing, enterprise-assistants, time-savings, knowledge-management, public-record]
visuals: []
type: playbook
account: public-record
industry: "Manufacturing and B2B solutions (Japan)"
use_case: "An internal AI assistant built on OpenAI's large language models for about 12,400 employees in Japan, extended to answer from confidential quality-control documents with the sources shown"
outcome: "Employees self-reported about 20 minutes saved per use; the company reports 186,000 working hours saved in one year (18.6万時間), 1,396,639 accesses in 12 months, and no information leaks or copyright problems in 16 months"
measured_how: "Employee self-reports of time saved per use and access counts, June 2023 to May 2024, plus an employee rating of 3.5 out of 5 for the quality-control AI, with no sample sizes given (Panasonic Connect press release, 25 June 2024)"
prerequisites: [measuring-ai-impact, grounding-citations]
replications: []
---
> [!tldr]
> Panasonic Connect gave about 12,400 employees in Japan ConnectAI, an assistant built on OpenAI's large language models, and later added an AI that answers from confidential quality-control documents. After one year it reported 186,000 working hours saved (18.6万時間 in the release) and said employees estimated about 20 minutes saved per use. It reported no problems such as information leaks in 16 months. It names answering company-specific questions and guaranteeing the accuracy of answers as major challenges.

> [!note] From the public record
> Built from Panasonic Connect's own published account, "パナソニック コネクト 生成AI導入1年の実績と今後の活用構想" (June 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Panasonic Connect is the Panasonic group's core company for B2B solutions, with about 28,300 employees worldwide. When it rolled out a generative AI assistant from February 2023, it set three goals: "（1）生成AIによる業務生産性向上、（2）社員のAIスキル向上、（3）シャドーAI利用リスクの軽減" (translated: "(1) improving work productivity with generative AI, (2) improving employees' AI skills, (3) reducing the risk of shadow AI use").

A second problem came from quality control. The release says quality control in manufacturing depends on the know-how of experienced staff, so information is hard to share, and searching cases and examining and judging them takes a great deal of time. It also names the problem of passing on knowledge and know-how when skilled employees retire.

## Why this approach

The release does not describe alternatives that were considered. It credits a culture of supporting people who take on challenges, from top management to the front line, for making a large and fast rollout possible. To solve the challenges listed under What failed, "自社データと生成AIの連携を行ってきました" (translated: "we have been linking our own data with generative AI"). The steps it describes are a trial on public company information, then confidential documents.

The wiki's reading: answering from a fixed set of internal documents and showing where an answer is quoted from is the pattern described in [RAG fundamentals](#rag-fundamentals) and [Grounding and citations](#grounding-citations). The release does not say how its retrieval works.

## The approach

1. **A company-wide assistant.** From February 2023, ConnectAI went to all of about 12,400 employees in Japan. The interface was customized "プロンプトエンジニアリングの観点に基づき" (translated: "based on the perspective of prompt engineering"), with 15 sample prompts for common daily tasks on the top screen.
2. **A trial on public information.** In September 2023, the company ran a trial, open to all employees, of a company-specific AI that answered from about 3,700 website pages, 495 news release pages and 3,200 pages of the external Panasonic Connect homepage. The trial confirmed "一定の精度で回答できること" (translated: "that it could answer with a certain level of accuracy"), with no metric given.
3. **Confidential quality-control documents.** From April 2024, the AI also answers from 630 quality-control items and 11,743 pages of confidential information, so employees can ask about quality in product design, based on quality-control rules and past cases. A function shows where an answer is quoted from, so employees can check themselves whether it is true.
4. **Prompt correction.** From 17 June 2024, a "プロンプト添削機能" (translated: "prompt correction function") was added, because more specific prompts tend to get fast and accurate answers.

## The stack

As of June 2024: ConnectAI, an internal assistant service built on OpenAI's large language models, which the release also calls ChatGPT-based, plus the prompt correction function and the company-specific AI with its source display. The release names no model version, hosting, retrieval method, access controls or costs.

## Results, and how they were measured

The release covers use from June 2023 to May 2024. Its per-use time figure comes from asking employees how much time they saved when they used generative AI.

- **Time per use.** "1回あたり平均約20分の削減につながっていることが確認できました" (translated: "it was confirmed that this led to a reduction of about 20 minutes per use on average"). Simple, search-engine-like questions saved relatively little time; creating base data for strategy work saved a lot.
- **Hours saved.** Also taking this data into account, the release reports "1年で全社員18.6万時間の労働時間を削減" (translated: "reduced working hours by 186,000 hours across all employees in one year").
- **Use.** "アクセス回数（12ヶ月）1,396,639回" (translated: "number of accesses (12 months): 1,396,639"), and "直近3か月の利用回数は前年の同期間と比較して41％増" (translated: "use in the most recent 3 months rose 41% compared with the same period a year earlier").
- **Skills.** Uses that bring productivity gains of an hour or more, such as strategy and product planning, grew, as did manufacturing questions about materials and production processes. No numbers are given.
- **Risk.** "16か月の間に情報漏洩、著作権侵害などの問題は発生せず" (translated: "no problems such as information leaks or copyright infringement occurred in 16 months").
- **Quality-control AI.** "回答に対する社員の評価は3.5点（5点満点）" (translated: "employees' rating of the answers is 3.5 points (out of 5)"), which the release calls a high level.

The release says all three goals were achieved but gives no targets they were measured against.

**Not measured:** the release does not explain how the 186,000 hours were calculated. The only time data it describes are employees' own estimates, with no observed baseline and no survey sample size. There is no sample size for the 3.5 rating, no accuracy measure for any answers, and no cost figure for the assistant.

The wiki's reading: these are adoption and self-report figures, not measured productivity. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) for why self-reported time savings need a baseline.

## What failed

The release reports no incidents or error rates, but names limits:

- **Answer gaps and accuracy.** Based on its experience so far, it sees "自社固有の質問や最新の公開情報に回答できないこと" (translated: "not being able to answer company-specific questions or questions about the latest public information") and "回答の正確性を担保できないこと" (translated: "not being able to guarantee the accuracy of answers") as major challenges.
- **Data.** "自社データの整備が非常に重要であると改めて認識しています" (translated: "we have recognized once again that preparing our own data is very important").
- **Autonomy.** For the autonomous enterprise it expects in the future, a footnote says models must evolve further, and that checks on whether a judgment is correct and safety mechanisms against unexpected behaviour are needed.

## What the team would do differently

The release states plans rather than things it would redo:

- **A corpus.** Prepare company data systematically and build a "パナソニック コネクトコーパス" (translated: "Panasonic Connect Corpus"). See [Data quality and governance](#data-governance).
- **More domains.** Extend beyond quality control to HR training support, internal IT support and customer centers. In HR, it is first introducing an AI that suggests suitable training to employees.
- **More data.** Add structured data from business systems to unstructured PowerPoint, Excel and PDF files, so that answers can be based on numbers.
- **Personal answers.** Once the data is ready, consider an AI that answers according to each person's job type and permissions.
- **Agents.** The company expects AI to move from answering single questions toward agents, and toward an enterprise that runs with minimal human intervention. See [Autonomy levels and human oversight](#autonomy-and-oversight).

## Disclosure

None.

## Sources

- No individual authors named, Panasonic Connect Co., Ltd. (パナソニック コネクト株式会社), [“パナソニック コネクト 生成AI導入1年の実績と今後の活用構想”](https://news.panasonic.com/jp/press/jn240625-1) (translated: "Panasonic Connect: results of one year of introducing generative AI and plans for future use"), subtitle "～1年で労働時間を18.6万時間削減～" (translated: "186,000 working hours saved in one year"), press release in Japanese, Panasonic Newsroom Japan, 25 June 2024.

## Related

- [About playbooks](#about-playbooks)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Grounding and citations](#grounding-citations)
- [Data quality and governance](#data-governance)
- [Enterprise readiness](#enterprise-readiness)
