---
id: atlassian-hula-jira-agents
book: 21
order: "21.2"
title: Human-in-the-loop coding agents in Jira at Atlassian
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [coding-agents, human-in-the-loop, software-engineering, public-record]
visuals: []
type: playbook
account: public-record
industry: Software (developer and collaboration tools)
use_case: Agents that plan and write code for Jira issues, with an engineer approving each stage
outcome: 56 of 95 raised pull requests merged; 8% of the 663 issues worked with the agents ended in a merged change
measured_how: Online funnel over 663 Jira issues from early July to mid-September 2024, plus a survey of 109 practitioners (Takerngsaksiri et al., ICSE SEIP 2025)
prerequisites: [coding-agents, human-in-the-loop]
replications: []
---
> [!tldr]
> Atlassian put LLM agents into Jira that draft a coding plan and then the code for an issue, with the assigned engineer approving each step. The rollout grew from 260 practitioners in early July 2024 to 2,600 by mid-September. Of 663 issues worked this way, 56 ended in a merged pull request: "8% of the issues interacted with HULA".

> [!note] From the public record
> Built from the paper by Atlassian engineers and university co-authors, "Human-In-the-Loop Software Development Agents" (Takerngsaksiri et al., 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Research on LLM agents for software engineering was, in the paper's words, "evaluated based on historical benchmark datasets", "rarely considers human feedback at each stage" and "has not been deployed in practice". The team wanted to know what happens when such agents meet real Jira issues and real engineers inside a large software company.

## Why this approach

The team kept a human in charge of every stage instead of letting the agent run end to end: the engineer assigned to the issue can steer the plan and the code before anything reaches a repository. That answers the gap the paper starts from, agents tested only offline and without human feedback. For the trade-offs between human approval and more autonomy, see [Autonomy levels and human oversight](#autonomy-and-oversight).

## The approach

The framework, HULA, has three agents: an "AI Planner Agent", an "AI Coding Agent" and a "Human Agent", which is the engineer assigned to the issue. The interface lives in Jira.

1. **Set up the task.** The engineer picks a Jira issue and its code repository.
2. **Plan.** The planner reads the issue's summary and description, finds the relevant files and writes a plan of changes per file. The engineer can accept it, regenerate it with extra instructions, or edit the file list and the plan directly. Coding starts only after the engineer approves the plan.
3. **Code.** The coding agent writes the changes file by file and refines them with feedback from tools such as compilers and linters, until the code passes or it reaches a maximum number of attempts. The engineer reviews the changes and can ask for another round.
4. **Raise a pull request.** After a second approval, the changes become a pull request in Bitbucket, or the engineer takes the generated code into a new branch and edits it first.

The rollout started with an alpha group of 45 engineers in two teams for two weeks, opened to 260 practitioners in early July 2024 and, by the paper's account, "By mid-September 2024, the deployment expanded to 2,600 practitioners."

## The stack

As of the paper (2024 deployment): GPT-4 as the backbone model, in a framework the authors call architecture-agnostic; Jira for the interface; Bitbucket for pull requests; compilers and linters as feedback tools. For the offline evaluation, GPT-4 also served as a judge of code similarity. See [Inside coding agents](#coding-agent-internals) for how localization, editing and verification usually work.

## Results, and how they were measured

**Online, on 663 real issues from early July to mid-September 2024.** The paper reports each step of the funnel:

| Step | Count | Rate the paper gives |
|---|---|---|
| Issues worked with HULA | 663 | |
| Plans generated | 527 | 79% |
| Plans approved | 433 | 82% of generated plans |
| Code generated | 376 | 87% of approved plans |
| Pull requests raised | 95 | 25% of issues with generated code |
| Pull requests merged | 56 | 59% of raised pull requests |

In the paper's words: "Of these, 56 PRs were successfully merged, leading to a merged PR rate of 59%", and "8% of the issues interacted with HULA had successfully merged HULA-assisted PRs into the code repositories."

**Offline.** On SWE-bench Verified, the paper reports perfect file localization for 84% of tasks and fully passing tests for 31%. On an internal set of 369 Atlassian issues, perfect file localization dropped to 15%. Benchmarks and their limits are covered in [Coding-agent benchmarks](#coding-agent-benchmarks).

**Survey.** 146 practitioners were invited and 109 answered, a response rate of 75%. "Without human involvement, 33% of the participants agreed that the generated code solved their task", and 54% disagreed that the generated code contained no defects.

**Not measured:** the paper reports no measured time or effort savings (only what engineers perceived), has no control group of issues worked without HULA, and does not explain why most generated code never became a pull request.

## What failed

The survey's most common challenges were incorrect code functionality (25 responses), incomplete code changes (17), the high effort of writing detailed issue descriptions (14) and the difficulty of going back to change an earlier stage (14). The authors also note that Agile Jira issues often hold little more than a user story or "a one-liner description", which leaves the agents too little to work with. The funnel itself shows the drop-off: of 376 issues with generated code, 95 reached a pull request.

## What the team would do differently

The paper states two lessons. First: "The performance of an LLM-based software development agent heavily relies on a detailed input description", which raises the question of what information an issue needs and how to add it automatically. Second: "Evaluating functional correctness should go beyond passing unit test cases", because tests are costly, coarse and show the presence of defects, not their absence. The authors point to better ways to revisit earlier stages and to judging readability and maintainability, not only correctness.

## Disclosure

None.

## Sources

- Wannita Takerngsaksiri, Jirat Pasuksmit, Patanamon Thongtanunam, Chakkrit Tantithamthavorn, Ruixiong Zhang, Fan Jiang, Jing Li, Evan Cook, Kun Chen and Ming Wu, [“Human-In-the-Loop Software Development Agents”](https://arxiv.org/abs/2411.12924), arXiv 2411.12924, first submitted 19 November 2024, version 2 of 10 January 2025; accepted at ICSE SEIP 2025. Monash University, the University of Melbourne and Atlassian.

## Related

- [About playbooks](#about-playbooks)
- [Coding agents](#coding-agents)
- [Human in the loop](#human-in-the-loop)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
