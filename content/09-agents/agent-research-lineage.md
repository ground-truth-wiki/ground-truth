---
id: agent-research-lineage
book: 9
order: "9.1.1"
title: "Language agents: research lineage and the CoALA framework"
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [agent-history, coala, language-agents, research-lineage, surveys]
visuals: []
prerequisites: [what-is-an-agent]
---
> [!tldr]
> A language agent is a system that uses a large language model to reason, plan and act in an environment. Between 2021 and 2023 a short run of papers turned tool-using models into agents, and the CoALA framework gives them one vocabulary: memory modules, internal versus external actions, and a decision cycle. When you read a new agent paper, ask which of those three things it changes.

## Key ideas

- **Symbolic, traditional and language agents.** In symbolic AI, cognitive architectures such as Soar wrapped a production system with sensory grounding and memory: a working memory plus long-term procedural, semantic and episodic memories. Traditional agents often needed handcrafted rules or reinforcement learning, which made it hard to generalize to new environments. The research term **language agent** means a system that uses LLMs “as a core computation unit to reason, plan, and act” ([Sumers et al., “Cognitive Architectures for Language Agents” (2023)](https://arxiv.org/abs/2309.02427)).
- **From tools to closed loops, 2021 to 2022.** WebGPT fine-tuned GPT-3 to search and navigate a text-based browser and collect references for its answers, MRKL proposed combining neural models with discrete knowledge and reasoning modules, and Inner Monologue fed language feedback such as success detection and scene descriptions back into a robot's planner. ReAct then interleaved reasoning traces with actions, so that reasoning guides acting and actions gather information for reasoning ([Nakano et al., “WebGPT” (2021)](https://arxiv.org/abs/2112.09332); [Karpas et al., “MRKL Systems” (2022)](https://arxiv.org/abs/2205.00445); [Huang et al., “Inner Monologue” (2022)](https://arxiv.org/abs/2207.05608); [Yao et al., “ReAct” (2022)](https://arxiv.org/abs/2210.03629)).
- **Tools, controllers, skills and memory, 2023.** Toolformer trained a model, self-supervised from a handful of demonstrations per API, to decide which APIs to call and how to use their results, and Mialon et al. called such models “augmented language models”; HuggingGPT used ChatGPT as a controller that plans tasks and dispatches them to Hugging Face models. Voyager grew a library of executable code skills in Minecraft, and Generative Agents stored a memory stream that it retrieved, reflected on and planned from ([Schick et al., “Toolformer” (2023)](https://arxiv.org/abs/2302.04761); [Mialon et al., “Augmented Language Models: a Survey” (2023)](https://arxiv.org/abs/2302.07842); [Shen et al., “HuggingGPT” (2023)](https://arxiv.org/abs/2303.17580); [Wang et al., “Voyager” (2023)](https://arxiv.org/abs/2305.16291); [Park et al., “Generative Agents” (2023)](https://arxiv.org/abs/2304.03442)).
- **Many agents, then the engineering turn.** CAMEL had agents cooperate through role-playing, AutoGen let developers program conversations between agents, and MetaGPT encoded standardized operating procedures (SOPs) as an assembly line of roles ([Li et al., “CAMEL” (2023)](https://arxiv.org/abs/2303.17760); [Wu et al., “AutoGen” (2023)](https://arxiv.org/abs/2308.08155); [Hong et al., “MetaGPT” (2023)](https://arxiv.org/abs/2308.00352)). The ideas then moved into products: as of November 2026, model APIs return structured tool calls that your code runs, providers ship agent SDKs, and protocols such as the Model Context Protocol (introduced in November 2024) standardize how agents reach tools and data ([Anthropic, “Tool use with Claude”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview); [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/); [Anthropic, “Introducing the Model Context Protocol”](https://www.anthropic.com/news/model-context-protocol)).
- **CoALA's memory and actions.** Working memory holds the variables of the current decision cycle, and long-term memory is episodic (past experience), semantic (knowledge about the world and the agent) or procedural (the LLM's weights and the agent's code). External **grounding** actions act on physical, dialogue or digital environments, and internal actions are **retrieval** (read long-term memory), **reasoning** (update working memory with the LLM) and **learning** (write long-term memory) ([Sumers et al. (2023)](https://arxiv.org/abs/2309.02427)).
- **The decision cycle, and placing a new paper.** Each cycle plans by proposing, evaluating and selecting a grounding or learning action, then executes it; CoALA's own table casts ReAct as reasoning plus digital grounding with only a proposal step, Voyager as writing procedural memory (its skills), Generative Agents as using episodic and semantic memory, and Tree of Thoughts as proposing, evaluating and selecting thoughts. To place a new agent paper, ask which memory it reads and writes, which actions it adds, and which stage of the cycle it changes ([Sumers et al. (2023)](https://arxiv.org/abs/2309.02427)).

## Planned visuals

- **`timeline`:** the lineage from WebGPT (December 2021) through MRKL, Inner Monologue, ReAct, Toolformer, HuggingGPT, Generative Agents, Voyager, CAMEL, AutoGen and MetaGPT to MCP (November 2024), each event linked to its paper.
- **`diagram`:** the CoALA architecture: working memory as the hub, the three long-term memories, the LLM, and grounding to the environment, with arrows for retrieval, reasoning, learning and grounding; variants overlay ReAct, Voyager and Generative Agents.
- **`stepper`:** one decision cycle (proposal, evaluation, selection, execution) traced through a ReAct step and a Tree of Thoughts step, showing which stages each one skips.

## Talk like an expert

Researchers say **language agent**, **grounding action**, **decision cycle** and **procedural memory**, and describe a new system by what it adds to memory, to the action space or to decision making. A sharp question about any agent paper is whether the LLM proposes actions, evaluates them, or both.

## Go deeper

- [Sumers, Yao, Narasimhan and Griffiths, “Cognitive Architectures for Language Agents” (2023)](https://arxiv.org/abs/2309.02427): the CoALA framework; its v3 is the TMLR camera-ready version.
- [Wang et al., “A Survey on Large Language Model based Autonomous Agents” (2023)](https://arxiv.org/abs/2308.11432): a unified framework of profiling, memory, planning and action modules, revised through March 2025.
- [Xi et al., “The Rise and Potential of Large Language Model Based Agents: A Survey” (2023)](https://arxiv.org/abs/2309.07864): agents as brain, perception and action, from single agents to agent societies.
- [Weng, “LLM Powered Autonomous Agents” (2023)](https://lilianweng.github.io/posts/2023-06-23-agent/): an agent system broken down into planning, memory and tool use.

## Related

- [What is an agent?](#what-is-an-agent)
- [The agent loop](#agent-loop)
- [Memory](#agent-memory)
- [Agent memory architectures and benchmarks](#agent-memory-architectures)
- [Planning and reasoning strategies](#planning-reasoning)
- [Multi-agent systems](#multi-agent)
