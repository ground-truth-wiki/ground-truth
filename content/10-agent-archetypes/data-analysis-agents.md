---
id: data-analysis-agents
book: 10
order: "10.3.1"
title: Data-analysis and notebook agents
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [data-analysis, code-interpreter, notebooks, text-to-sql, analyst-agents]
visuals: []
prerequisites: [research-analyst-agents]
---
> [!tldr]
> A data-analysis agent answers questions by writing and running code or SQL against real data, in a sandboxed interpreter or a notebook, and reports numbers that came from execution. Hosted code-execution tools, notebook integrations and text-to-SQL agents provide the building blocks, while benchmarks such as BIRD, Spider 2.0 and DABstep show that multi-step analysis on realistic data is still hard. Remember that a number from executed code can still be wrong: grain, joins and filters need their own checks.

## Key ideas

- **Hosted interpreters run the code in a container.** OpenAI's code interpreter runs Python in a sandboxed container that holds uploaded and generated files, returns generated files such as charts as file citations, and expires a container after 20 minutes without use, losing its in-memory state, as of November 2026 ([OpenAI code interpreter guide](https://developers.openai.com/api/docs/guides/tools-code-interpreter)). Anthropic's code execution tool runs Bash and Python in a container with 5 GiB of RAM, 1 CPU, no internet access and only pre-installed libraries such as pandas and scikit-learn; a container can be reused by its id and expires 30 days after creation, as of November 2026 ([Anthropic code execution tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool)).
- **State and retention are design choices.** Anthropic's tool is not eligible for zero data retention and keeps container data for up to 30 days, and with its newer tool versions and programmatic tool calling the Python interpreter's state persists across requests that reuse a container, while every other request starts in a new one ([Anthropic code execution tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool)). A persistent session saves reloading data; independent processes hold no hidden state. The mini-swe-agent harness deliberately runs every action as an independent subprocess instead of keeping a stateful shell, and its README credits this for the agent's stability and for making sandboxing and scaling trivial ([mini-swe-agent README](https://github.com/SWE-agent/mini-swe-agent)).
- **Notebooks can be the agent's workspace.** Jupyter AI adds a chat interface to JupyterLab in which agents such as Claude, Codex, GitHub Copilot and Gemini connect through the Agent Client Protocol and work on notebooks through a built-in Jupyter MCP server, as of November 2026 ([Jupyter AI README](https://github.com/jupyterlab/jupyter-ai)); see [the Agent Client Protocol](#agent-client-protocol).
- **Text-to-SQL benchmarks moved to enterprise scale.** BIRD has over 12,751 question-SQL pairs on 95 databases totaling 33.4 GB, scored by execution accuracy (EX) and a reward-based efficiency score (R-VES), with a human baseline of 92.96 EX ([BIRD](https://bird-bench.github.io/)). Its interactive extension, BIRD-Interact, has 600 tasks, and GPT-5 completed only 8.67% of them in conversational mode and 17.00% in agentic mode (Huo et al., [“BIRD-INTERACT: Re-imagining Text-to-SQL Evaluation for Large Language Models via Lens of Dynamic Interactions”](https://arxiv.org/abs/2510.05318) (2025)). Spider 2.0 has 632 enterprise workflow problems on systems such as BigQuery and Snowflake, often with over 1,000 columns, and an o1-preview-based agent solved 21.3% of them against 91.2% on Spider 1.0 and 73.0% on BIRD (Lei et al., [“Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows”](https://arxiv.org/abs/2411.07763) (2024)); its reference agents for the Lite and Snow settings must output CSV result files rather than SQL ([Spider 2.0](https://spider2-sql.github.io/)).
- **Data-science benchmarks test whole analyses.** DS-1000 has 1,000 data-science problems across seven Python libraries, adapted from StackOverflow so models cannot simply recall the answers, and graded by running tests (Lai et al., [“DS-1000: A Natural and Reliable Benchmark for Data Science Code Generation”](https://arxiv.org/abs/2211.11501) (2022)). DABstep has over 450 multi-step analysis tasks from a financial analytics platform with factoid answers checked automatically, and the best agent reached 14.55% on the hardest tasks at publication (Egg et al., [“DABstep: Data Agent Benchmark for Multi-step Reasoning”](https://arxiv.org/abs/2506.23719) (2025)).
- **Know the failure modes, then bound and check.** In Spider 2.0's error analysis of 300 randomly sampled examples, the largest categories were erroneous data analysis (35.5%), wrong schema linking (27.6%), wrong filter conditions (11.5%) and JOIN errors (8.3%) ([Lei et al., 2024](https://arxiv.org/abs/2411.07763)). Evaluate analyses with a tolerance on numbers and a review of the method, not only the final figure, and bound the agent with read-only roles, row and runtime caps and reconciliation against a trusted total, as the parent chapters recommend ([Research and analyst agents](#research-analyst-agents); [Structured and code retrieval](#structured-code-retrieval)).

## Planned visuals

- `stepper`: an agent answering a revenue question in a notebook: load the data, inspect the schema, join two tables, catch a join fan-out by comparing row counts, fix the join, chart the result and export a notebook that reruns cleanly.
- `compare`: the same analysis in a persistent kernel and in fresh processes, showing the speed gain of one and the hidden-state risk it carries against the reproducibility of the other.
- `matrix`: hosted code-execution tools (OpenAI code interpreter, Anthropic code execution) by runtime, limits, network access, container lifetime and data retention, dated as of November 2026.

## Talk like an expert

Experts talk about **execution accuracy**, **schema linking**, **grain**, **join fan-out**, **semantic layers**, **stateful kernels**, **container retention** and **reproducible exports**, and they ask “what is one row of this table?” before they trust any aggregate built on it.

## Go deeper

- [Anthropic code execution tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool) and [OpenAI code interpreter](https://developers.openai.com/api/docs/guides/tools-code-interpreter) documentation.
- Lei et al., [“Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows”](https://arxiv.org/abs/2411.07763) (2024).
- The [BIRD benchmark](https://bird-bench.github.io/) and its leaderboard, read with dates.
- Egg et al., [“DABstep: Data Agent Benchmark for Multi-step Reasoning”](https://arxiv.org/abs/2506.23719) (2025).

## Related

- [Research and analyst agents](#research-analyst-agents)
- [Structured and code retrieval](#structured-code-retrieval)
- [Sandboxes and execution environments](#sandboxes)
- [Deep research systems](#deep-research)
- [Evaluating agents](#evaluating-agents)
- [Playbook: Salesforce Horizon Agent: text-to-SQL in Slack with consensus voting](#salesforce-text-to-sql)
