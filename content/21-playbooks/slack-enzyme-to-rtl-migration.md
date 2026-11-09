---
id: slack-enzyme-to-rtl-migration
book: 21
order: "21.28"
title: "Converting Enzyme tests to React Testing Library at Slack: an AST codemod plus an LLM"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-migration, testing, code-generation, developer-productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "Technology (frontend test code at Slack)"
use_case: "Converting more than 15,000 frontend Enzyme unit and integration tests to React Testing Library, with an AST codemod and Claude 2.1 working together"
outcome: "80% conversion success rate on selected files for AST plus LLM (45% automatically converted code for the AST codemod with manual work); approximately 500 of approximately 2,300 test cases converted, executed and passed; 22% of developer time saved, counting only cases where the test case passed"
measured_how: "Manual review of nine test files against frontend developers' conversions, and the pass rate of approximately 2,300 test cases in 338 files; no measurement period stated (Engineering at Slack blog, May 2024)"
prerequisites: [context-engineering]
replications: []
---
> [!tldr]
> Slack set out to move more than 15,000 frontend tests from Enzyme, which lacks native React 18 support, to React Testing Library (RTL). An AST codemod converted 45% of code automatically on the files used for evaluation, and Claude 2.1 alone was inconsistent, so the team gave the LLM the codemod's output and the rendered DOM. The post reports an "80% conversion success rate, based on selected files", with people checking the code before merging.

> [!note] From the public record
> Built from Slack's own published account, "Balancing Old Tricks with New Feats: AI-Powered Conversion From Enzyme to React Testing Library at Slack" (May 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Slack decided "to convert more than 15,000 of our frontend unit and integration Enzyme tests to RTL", because "the absence of native support for React 18 by Enzyme presented a compelling rationale for transitioning to RTL." The team found no adapters or existing tools that fit. The post says converting them "translated to more than 10,000 potential engineering hours."

## Why this approach

**AST alone.** First, the team wrote rules for an abstract syntax tree (AST) codemod. The codebase used 65 Enzyme methods, "each with its own quirks", and exact rules had to be written by hand for each scenario. Some choices need context the AST cannot see, such as whether to use `getByRole` or `getByTestId`, and "AST lacks the capability to incorporate such contextual information." After patterns for 10 methods, the team concluded that AST alone could not handle the task. It annotated every line needing manual work with suggestions and documentation links, and gave frontend teams the codemod to run before finishing by hand.

**LLM alone.** With Slack's DevXP AI team, the team then sent prompts and test code to Anthropic's Claude 2.1. Some conversions were good, but "Conversion success rates fluctuated between 40-60%."

**Both together.** People converting a test draw on several sources, including the rendered DOM and the component code, and the post says "only an LLM was capable of assimilating such disparate types of information". For the general technique, see [Context engineering](#context-engineering).

## The approach

1. **Codemod first.** The codemod converts the simpler cases and annotates the rest. Its partial output goes into the request, which the post says "minimized hallucinations and nonsensical conversions from the LLM". See [Hallucination and factuality](#hallucination-factuality).
2. **Collect the DOM.** Adaptors for Enzyme's rendering methods stored the rendered DOM of each test case, since each could set up the component differently.
3. **Prompt.** One prompt in three parts: "introduction and general context setting", a "main request (10 explicit required tasks and seven optional)", and "the instructions on how to evaluate and present the results". Inputs go in XML tags such as `<code>`, `<codemod>` and `<dom_tree>`. The output must run in Jest without manual changes, and the model checks itself: "If there are any deviations from the specified conditions, list them explicitly." See [A field guide to prompting techniques](#prompting-techniques).
4. **More inputs.** The post lists "prompts, DOM, test file code, React code, test run logs, linter logs, and AST-converted code". It mentions feedback requests but does not describe how test and linter results reach the model.
5. **Run.** On-demand runs delivered "results in just 2-5 minutes", and CI nightly jobs handled hundreds of files. Each nightly run grouped files by conversion status, from fully converted down to less than 20% of test cases passed.
6. **Human check.** "the generated code was manually verified by humans before merging into our main repository". See [Human in the loop](#human-in-the-loop).

## The stack

As of May 2024: Anthropic's Claude 2.1 through an API endpoint, an AST-based codemod, Jest with custom matchers, test run and linter logs, and CI nightly jobs. The post does not name the AST tooling, the linter or the CI system. An October 2024 update says Slack open-sourced a version of the tool on npm, and links to the package `@slack/enzyme-to-rtl-codemod`.

## Results, and how they were measured

- **AST codemod.** Combined with manual work, which the post calls a hybrid method, it "yielded a modest success rate of 45% automatically converted code" across the selected files used for evaluation.
- **AST plus LLM.** "80% conversion success rate, based on selected files". The post does not say how the files were selected.
- **Quality.** Nine test files "(three easy, three medium, and three complex)" were converted by both the LLM and frontend developers, and compared on a quality rubric. "The evaluation revealed that 80% of the content within these files was accurately converted," and the other 20% needed manual intervention.
- **Pass rate.** "We examined the conversion rates of approximately 2,300 individual test cases spread out within 338 files." "Among these, approximately 500 test cases were successfully converted, executed, and passed."
- **Time.** The post reports "a significant saving of 22% of developer time" and notes that "this 22% time saving represents only the documented cases where the test case passed". It does not show the calculation.
- **Adoption.** Files the codemod ran on, divided by all files converted to RTL, "reached approximately 64%".

**Not measured:** no sample for the 40-60%, no period for any figure, no total of tests converted, and no cost. The post does not say whether the nine files are the selected files behind the 80% success rate. As the project neared its conclusion in May 2024, the team was "still in the process of collecting data and evaluating our progress."

## What failed

- **Prompt tuning.** "Our efforts to fine-tune prompts may have complicated matters," the post says, "possibly perplexing the AI model rather than aiding it."
- **Inconsistent output.** LLM-only results "ranged from remarkably effective conversions to disappointingly inadequate ones," depending largely on the task's complexity.
- **One prompt for everything.** A single universal prompt for initial and feedback requests made the requests to the LLM significantly more complex.
- **Files that never ran.** The post calls it "conceivable" that some properly converted test cases sat in files that never ran, because of setup or import syntax issues. The 22% counts no saving for those.

## What the team would do differently

The post does not say what it would redo. It concludes that "AI might not be able to be an ultimate tool for this kind of conversion" and that "custom implementations may be necessary to fully utilize any LLM potential". People verified the generated code before merging.

The wiki's reading:

- **Let deterministic tools go first.** The codemod's partial output gave the model a starting point, and the post credits it with fewer hallucinations.
- **Read the time saving narrowly.** The 22% counts only passing test cases, without a published method. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure

None.

## Sources

- Sergii Gorbachov, Staff Software Engineer, Slack, [“Balancing Old Tricks with New Feats: AI-Powered Conversion From Enzyme to React Testing Library at Slack”](https://slack.engineering/balancing-old-tricks-with-new-feats-ai-powered-conversion-from-enzyme-to-react-testing-library-at-slack/), Engineering at Slack blog, 22 May 2024, updated 3 October 2024.

## Related

- [About playbooks](#about-playbooks)
- [Context engineering](#context-engineering)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Human in the loop](#human-in-the-loop)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
