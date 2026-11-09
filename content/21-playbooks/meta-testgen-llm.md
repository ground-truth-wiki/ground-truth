---
id: meta-testgen-llm
book: 21
order: "21.77"
title: "TestGen-LLM: extending human-written unit tests with LLMs at Meta"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [test-generation, code-generation, developer-tools, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "Social media (Instagram and Facebook apps)"
use_case: "Extending existing human-written Kotlin unit test classes for Android apps with LLM-generated test cases, kept only if they build, pass reliably and add line coverage"
outcome: "196 of 1,979 test classes improved over three test-a-thons; 73% of TestGen-LLM test improvements accepted by developers"
measured_how: "Deployment data from three Instagram and Facebook test-a-thons, 29 October to 29 December 2023, plus an evaluation-mode experiment on 86 Reels and Stories test classes, with line coverage as the measure of improvement (Alshahwan et al., Meta, February 2024)"
prerequisites: [test-time-search]
replications: []
---
> [!tldr]
> Meta built TestGen-LLM, a tool that asks LLMs to add test cases to existing human-written Kotlin test classes and keeps only those that build, pass reliably and add line coverage. Over three test-a-thons in late 2023 it was applied to 1,979 test classes and improved 196 of them, and the paper reports that "73% of TestGen-LLM test improvements were accepted by developers."

> [!note] From the public record
> Built from Meta's own published account, "Automated Unit Test Improvement using Large Language Models at Meta" (February 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

TestGen-LLM is part of what the authors call "our overall mission to automate unit test generation for Android code". It extends existing, human-written Kotlin test classes with test cases "that cover previously missed corner cases, and that increase overall test coverage". Scale shaped the rollout: the central repository receives well over 100,000 commits per week, and small issues in a tool deployed without prior trials "can become considerably magnified at scale".

## Why this approach

The LLMs sit inside a larger workflow: "A filtration process discards any test case that cannot be guaranteed to meet the assurances." The filters are the paper's answer to [hallucination](#hallucination-factuality). The authors list advantages of improving existing code and tests rather than constructing them from scratch:

- Each diff (Meta's name for a code change) documents its own coverage gain.
- Existing tests are kept, so there is no regression by construction.
- Test cases compose, so different models, prompts and settings can each contribute. The paper calls this an ensemble approach.
- The tool only recommends; the engineer decides what lands.

The paper does not compare TestGen-LLM with a non-LLM test generator.

## The approach

Candidate tests must pass three filters. The code must build. Failing tests are discarded, because without an automatable test oracle the tool cannot tell a found bug from a wrong assertion, and a test must pass "on every one of five executions" to count as not flaky. Each test must add coverage.

The rollout went in stages:

1. **Initial trial.** Eight diffs went into code review. Reviewers asked for per-test-case guarantees and full coverage details, and both were added.
2. **Instagram test-a-thon, November 2023.** In a test-a-thon, engineers set aside focused time to write tests. When an engineer submitted a diff, the tool ran on the directory of that test class.
3. **Evaluation mode.** On Reels and Stories, the team compared two models, four prompts and several temperatures, then set the defaults: temperature zero (best, with a low effect size; see [Decoding and sampling](#decoding-sampling)), LLM2 and the extend_coverage prompt.
4. **December 2023 test-a-thons.** On Instagram, diffs were generated without human intervention, but two of the authors considered them before they went to engineers. On Facebook, recommendations went to engineers automatically, with no additional context.

## The stack

As of February 2024: two LLMs that Meta built for general internal use, called only LLM1 and LLM2 because details are "commercially sensitive"; four prompt templates (extend_test, extend_coverage, corner_cases and statement_to_complete); Kotlin test classes for Android, submitted as diffs to Meta's continuous integration and code review system. Coverage is line coverage only: Jacoco can in theory collect branch coverage, but the paper says this "is not available at the scale of testing required by Meta".

## Results, and how they were measured

- **Evaluation mode.** Over 86 test classes (31 for Stories and 55 for Reels), "75% of test classes had at least one new test case that builds correctly", 57% had one that also passes reliably, and 25% had one that also increases line coverage. The abstract states these figures as shares of test cases.
- **First Instagram test-a-thon.** "During the first test-a-thon, 36 engineers landed 105 unit test diffs, of which 16 were generated by TestGen-LLM." The tool created 17 diffs and ranked sixth by number of tests generated. "The median number of lines of code added by a TestGen-LLM test in the test-a-thon was 2.5."
- **Second Instagram test-a-thon, December 2023.** Of 42 diffs, 36 were accepted, 4 rejected or abandoned and 2 withdrawn.
- **Facebook test-a-thon.** Of 280 diffs, 144 were accepted, 64 rejected or abandoned, 61 got no review and 11 were withdrawn. Over 50% were accepted, "a figure which rises to almost 70% of those which received a review by developers."
- **Overall.** Between 29 October and 29 December 2023, "196 test classes were successfully improved, while the TestGen-LLM tool was applied to a total of 1,979 test classes." The results section calls this "approximately 10%"; the abstract says "it improved 11.5% of all classes to which it was applied". "Over all, 73% of TestGen-LLM test improvements were accepted by developers."
- **Per attempt.** 490 of 8,996 generation trials on Facebook and 831 of 23,535 on Instagram passed all filters.

**Not measured:** the paper reports no bugs found, no engineer time saved and no long-term maintenance cost of the landed tests, and it does not say which diffs form the denominator of the 73% figure.

## What failed

- **Missing assertions.** One diff was rejected for "Failing to include an assertion in the test case." In November, another was abandoned for the same reason; the generated code marked the assertion as a "TODO".
- **Low-value tests.** Other rejections were for testing a trivial getter and, twice, for breaking the single-responsibility-per-test principle. "The 2 withdrawn diffs each added coverage, but we recognized that the files covered were unimportant."
- **Duplicates.** Both models "often generated almost identical tests for the same prompt; different in name only." The team added a filter for previously seen tests.
- **Limits of the evidence.** The authors say the tool may have benefited from the November test-a-thon's focus on testing, and line coverage is "merely an expedient proxy for ‘improvement’".

The wiki's reading: the filters guarantee that a test builds, is stable and adds coverage, not that it is worth keeping. Reviewers still rejected filtered tests, so the [human review step](#human-in-the-loop) does real work. The setup is a generate-and-verify loop of the kind described in [test-time search](#test-time-search), and the December Facebook run resembles a [review bot](#cloud-and-ci-coding-agents) in CI.

## What the team would do differently

The paper states next steps rather than a redo: flagging to code reviewers when most of the coverage gain falls outside the class under test, which may signal inadequate mocking; offering assertion-less tests as hints to engineers; re-prompting when a test covers only part of a method; measures beyond line coverage, with mutation coverage named as likely the best but hard to run at Meta's scale; and linter-based filters, because the models copy existing styles and can pick up deprecated coding habits.

## Disclosure

None.

## Sources

- Nadia Alshahwan, Jubin Chheda, Anastasia Finegenova, Beliz Gokkaya, Mark Harman, Inna Harper, Alexandru Marginean, Shubho Sengupta and Eddy Wang, Meta Platforms, [“Automated Unit Test Improvement using Large Language Models at Meta”](https://arxiv.org/abs/2402.09171), arXiv:2402.09171, 14 February 2024; paper for the 32nd ACM Symposium on the Foundations of Software Engineering (FSE 24).

## Related

- [About playbooks](#about-playbooks)
- [Test-time search, sampling and verification](#test-time-search)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Human in the loop](#human-in-the-loop)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
