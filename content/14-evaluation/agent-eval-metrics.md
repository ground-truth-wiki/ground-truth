---
id: agent-eval-metrics
book: 14
order: "14.6.1"
title: Agent eval metrics and benchmark design
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [agent-evals, tool-calling, trajectory, pass-k, benchmarks]
visuals: []
prerequisites: [evaluating-agents, metrics-graders]
---
> [!tldr]
> Agent eval metrics turn the transcript of a multi-step, tool-using run into numbers: was each tool call right, did the path make sense, did the final state come out right without collateral damage, how reliably, and at what cost. A benchmark built from such metrics is only as good as its tasks and checks. The one thing to remember: grade the end state first and the path second, run every task several times, and report reliability and cost next to capability.

## Key ideas

- **Name the parts before you measure them.** A task is one test with inputs and success criteria, a trial is one attempt at it, a grader scores one aspect of a trial, the transcript is the full record of the trial, and the outcome is the final state of the environment; the evaluation harness runs the evals, while the agent harness lets the model act, so every agent eval measures model and harness together ([Anthropic, “Demystifying evals for AI agents” (2026)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). Capability suites should start with low pass rates and regression suites should sit near 100%, and capability tasks that pass reliably “graduate” into the regression suite to catch drift ([Anthropic, 2026](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).
- **Score tool calls in layers.** The Berkeley Function Calling Leaderboard checks calls by AST evaluation (right function name, only documented parameters, exact types, values from an accepted list), by executable evaluation (run the call and check its output), and by relevance detection, where no offered function fits and the right answer is no call at all ([Berkeley Function Calling Leaderboard blog](https://gorilla.cs.berkeley.edu/blogs/8_berkeley_function_calling_leaderboard.html)). In your own evals, test the tool name, the arguments, the result and the resulting state as separate checks, because a valid-looking call can still be wrong, for example when the user did not approve the action or the system skipped a required check ([Husain and Shankar, “AI Evals: Everything You Need to Know” (2026)](https://hamel.dev/blog/posts/evals-faq/)).
- **Match trajectories, or have a judge read them, then locate the failure.** As of November 2026, LangChain's agentevals compares an agent's tool calls with a reference trajectory in strict (same calls, same order), unordered, subset or superset mode, with tool arguments matched exactly, ignored, or as a subset or superset of the reference arguments, and also offers an LLM judge that grades a trajectory without any reference ([agentevals](https://github.com/langchain-ai/agentevals)). To see where runs break, Husain and Shankar build a transition failure matrix whose rows are the last successful state and whose columns are the step where the first failure occurred ([Husain and Shankar, 2026](https://hamel.dev/blog/posts/evals-faq/)).
- **Check state, give partial credit and simulate the user.** AppWorld grades with state-based unit tests that accept different ways of completing a task and also check for unexpected changes, which the authors call collateral damage ([Trivedi et al., “AppWorld: A Controllable World of Apps and People for Benchmarking Interactive Coding Agents” (2024)](https://arxiv.org/abs/2407.18901)), and TheAgentCompany splits each of its 175 tasks into weighted checkpoints, scoring 0.5 × (checkpoint points earned ÷ total points) + 0.5 × full completion ([Xu et al., “TheAgentCompany: Benchmarking LLM Agents on Consequential Real World Tasks” (2024)](https://arxiv.org/abs/2412.14161)). τ-bench pairs the agent with an LLM-simulated user and compares the final database with an annotated goal state ([Yao et al., “τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains” (2024)](https://arxiv.org/abs/2406.12045)), and τ²-bench adds dual control, where the user also acts on the shared environment with tools, reporting significant drops when agents move from no-user to dual-control tasks ([Barres et al., “τ²-Bench: Evaluating Conversational Agents in a Dual-Control Environment” (2025)](https://arxiv.org/abs/2506.07982)).
- **Measure reliability, not just capability.** Estimate pass@k without bias by sampling n ≥ k attempts, counting the c that pass and averaging 1 − C(n − c, k) ÷ C(n, k) over tasks; with k = 1 this is c ÷ n, the mean pass@1 over n trials ([Chen et al., “Evaluating Large Language Models Trained on Code” (2021)](https://arxiv.org/abs/2107.03374)). pass^k asks for success on all k trials, and in the 2024 τ-bench paper gpt-4o scored below 25% pass^8 in the retail domain ([Yao et al., 2024](https://arxiv.org/abs/2406.12045)); over long horizons runs vary widely, and in Vending-Bench, with runs of over 20 million tokens, performance varied greatly across runs and every model had runs that derailed, with no clear link to the point where the context window filled ([Backlund and Petersson, “Vending-Bench: A Benchmark for Long-Term Coherence of Autonomous Agents” (2025)](https://arxiv.org/abs/2502.15840)).
- **Report cost, and check that the benchmark measures what it claims.** Kapoor et al. argue that accuracy-only leaderboards produce needlessly complex and costly agents, and that cost and accuracy should be reported and optimized together ([Kapoor et al., “AI Agents That Matter” (2024)](https://arxiv.org/abs/2407.01502)). Zhu et al. require task validity (a task is solvable if and only if the agent has the target capability) and outcome validity (the check truly indicates success), and show that flaws such as insufficient tests or counting empty responses as successes can misstate performance by up to 100% in relative terms ([Zhu et al., “Establishing Best Practices for Building Rigorous Agentic Benchmarks” (2025)](https://arxiv.org/abs/2507.02825)); see [how benchmarks break](#benchmark-validity).

## Planned visuals

- **`explorer`** (the existing `passk` model, extended): enter n trials and c successes per task and compare the unbiased pass@k estimator with the naive 1 − (1 − c/n)ᵏ and with pass^k, showing how far the naive estimate falls below the unbiased one.
- **`heatmap`:** a transition failure matrix for an illustrative support agent, with the last successful state on one axis and the first failed step on the other, so the hot cells point at the step to fix first.
- **`compare`:** two trajectories for the same task scored four ways (strict match, unordered match, superset match and a state-based check), showing a valid alternative path that strict matching fails and a run with collateral damage that only the state check catches (illustrative).

## Talk like an expert

Experts separate **outcome** from **trajectory**, and **capability** from **regression** suites, and they quote **pass@k** only next to **pass^k**, **cost per task** and the number of **trials**. Before trusting any agent benchmark, they ask about **task validity** and **outcome validity**: could the task be passed without the skill, and could the check pass a run that failed?

## Go deeper

- [Anthropic, “Demystifying evals for AI agents” (2026)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): the vocabulary, grader types, partial credit and capability versus regression suites.
- [Trivedi et al., “AppWorld” (2024)](https://arxiv.org/abs/2407.18901): state-based checks that allow alternative paths and catch collateral damage.
- [Zhu et al., “Establishing Best Practices for Building Rigorous Agentic Benchmarks” (2025)](https://arxiv.org/abs/2507.02825): the Agentic Benchmark Checklist for task and outcome validity.
- [Chen et al., “Evaluating Large Language Models Trained on Code” (2021)](https://arxiv.org/abs/2107.03374): the unbiased pass@k estimator.

## Related

- [Evaluating agents](#evaluating-agents)
- [Metrics and graders](#metrics-graders)
- [Evaluation harnesses](#eval-harnesses)
- [How benchmarks are built and why they break](#benchmark-validity)
- [Coding-agent benchmarks: SWE-bench, Terminal-Bench and their harnesses](#coding-agent-benchmarks)
- [Statistics for evals](#eval-statistics)
