---
id: agent-memory
book: 9
order: "9.6"
title: Memory
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [memory, long-term-memory, letta]
visuals:
  - memory-types:diagram
  - memory-paths:sequence
  - memory-write-tree:tree
---
> [!tldr]
> Memory is what an agent carries beyond one context window: facts about the user, records of past sessions, and learned procedures. Every memory system is a write policy, a store and a read policy, and most memory bugs are policy bugs: remembering the wrong things, or retrieving them at the wrong time.

## Why it matters
Without memory, every session starts from zero: users repeat themselves, agents re-learn the same repository, and long tasks cannot survive the end of a context window. With careless memory, agents surface stale facts, leak private details into the wrong conversation, or fill their context with trivia. Memory is retrieval with a write path, and it deserves the same evaluation discipline as [RAG](#rag-fundamentals).

## Intuition
Human memory is a fair model. Working memory is what you are thinking about now. Episodic memory is what happened (“last Tuesday we chose Postgres”). Semantic memory is what you know (“the user prefers TypeScript”). Procedural memory is how to do things (“run the linter before committing”). An agent needs all four, kept in different places and loaded in different ways.

```viz
{"id":"memory-types","component":"diagram","title":"Working memory is the context window; everything else is a store the agent writes to and reads from","caption":"Each long-term store has its own write path and read path. Click a store to read the chapter behind its usual implementation.","alt":"Diagram of an agent with its context window as working memory, connected to episodic, semantic and procedural memory stores with write and read arrows.","data":"illustrative","w":600,"h":250,"nodes":[
{"id":"agent","label":"Agent","role":"agent","x":0,"y":96,"w":130,"h":56},
{"id":"ctx","label":"Working memory","sub":"the context window","role":"context","x":180,"y":96,"w":170,"h":56,"link":"#context-engineering"},
{"id":"epi","label":"Episodic","sub":"what happened","role":"data","x":420,"y":0,"w":180,"h":52,"link":"#long-running-agents"},
{"id":"sem","label":"Semantic","sub":"facts, preferences","role":"data","x":420,"y":98,"w":180,"h":52,"link":"#rag-fundamentals"},
{"id":"pro","label":"Procedural","sub":"skills, instructions","role":"data","x":420,"y":196,"w":180,"h":52,"link":"#skills-plugins"}],
"edges":[{"from":"agent","to":"ctx","both":true},{"from":"ctx","to":"epi","label":"write"},{"from":"sem","to":"ctx","label":"read"},{"from":"pro","to":"ctx","label":"load"}]}
```

## How it works
**Working memory** is the [context window](#context-engineering). It is fast, perfect within its size, and gone at the end of the session or the next compaction.

**Long-term memory comes in three kinds:**
- **Episodic:** records of events, conversations and runs, often summarized. Useful for “what did we decide?”.
- **Semantic:** extracted facts and preferences, such as “the user’s timezone is Europe/Lisbon”. Useful for personalization.
- **Procedural:** how-to knowledge: instruction files such as `CLAUDE.md` or `AGENTS.md`, [skills](#skills-plugins), and learned rules. Useful for doing the job the way this team does it.

**The write policy** decides what to remember, when and in what form. Options: write on every turn, write at the end of a session, or let the agent decide with a memory tool. Good policies extract durable facts, attach a source and a date, and deduplicate or consolidate with what is already stored.

**The store** can be a vector index, a knowledge graph, a relational table, or plain files. Files are popular in coding agents because people can read and edit them. Graph-based stores, such as Zep’s Graphiti, track how facts change over time.

**The read policy** decides what to load and when: always (a small profile in the system prompt), on demand (a search tool the agent calls), or by relevance at the start of each turn. The Generative Agents paper (Park et al., 2023) scored memories by recency, importance and relevance, a useful template.

**Consolidation and forgetting.** Memories conflict and go stale. Periodically merge duplicates, resolve contradictions in favor of newer, sourced facts, and expire what no longer matters. Users must be able to view, correct and delete what an agent remembers. See [privacy](#privacy).

Step through one write and one read:

```viz
{"id":"memory-paths","component":"sequence","title":"Memory is written at the end of one session and read at the start of the next","caption":"Tap each message to see its payload. The write extracts durable facts with sources; the read loads only what is relevant to the new request.","alt":"Sequence diagram of a memory service extracting facts after a session, storing them, and retrieving relevant ones at the start of a later session.","data":"illustrative","actors":[{"id":"user","label":"User","role":"human"},{"id":"agent","label":"Agent","role":"agent"},{"id":"mem","label":"Memory service","role":"tool"},{"id":"store","label":"Store","role":"data"}],
"messages":[
{"from":"user","to":"agent","label":"Session 1 ends","note":"The user and agent spent an hour choosing a database."},
{"from":"agent","to":"mem","label":"Extract memories","payload":{"transcript_ref":"session-0412","instructions":"Extract durable decisions, preferences and facts. Skip chit-chat and raw tool output."},"note":"Extraction runs once per session, not on every turn, to keep costs and noise down."},
{"from":"mem","to":"store","label":"Write 3 items","payload":[{"type":"decision","text":"Chose Postgres with pgvector for the search feature","source":"session-0412","date":"2026-11-02"},{"type":"preference","text":"Prefers TypeScript examples","source":"session-0412"},{"type":"fact","text":"Team runs on AWS in eu-west-1","source":"session-0412"}],"note":"Each memory carries a source and a date, so later conflicts can be resolved."},
{"from":"user","to":"agent","label":"Session 2 starts","payload":"How should we add hybrid search?","note":"Days later, a new conversation."},
{"from":"agent","to":"mem","label":"Retrieve relevant","payload":{"query":"hybrid search","k":5},"note":"Read by relevance to the new request, not everything ever stored."},
{"from":"store","to":"agent","label":"2 memories","kind":"response","payload":["Chose Postgres with pgvector for the search feature (2026-11-02)","Prefers TypeScript examples"],"note":"Only the relevant items enter the context."},
{"from":"agent","to":"user","label":"Answer in context","kind":"response","payload":"Since you chose Postgres with pgvector, add full-text search with tsvector and fuse the rankings. Here is a TypeScript example…","note":"The answer builds on the earlier decision without the user repeating it."}]}
```

## In practice
Decide your policies explicitly:

```viz
{"id":"memory-write-tree","component":"tree","title":"Five questions decide whether something deserves to be remembered","caption":"Expand each question. Most bad memory systems fail the second or the fifth.","alt":"Decision tree for whether an agent should store a memory.","data":"illustrative","open":1,"root":{"label":"Should the agent remember this?","children":[
{"label":"Will it matter in a future session?","children":[{"label":"No: leave it in the transcript, not in memory"}]},
{"label":"Is it stated by the user or verified, not guessed?","children":[{"label":"No: do not store inferences as facts"}]},
{"label":"Does it conflict with something stored?","children":[{"label":"Yes: keep the newer, sourced version and drop or mark the old one"}]},
{"label":"Is it sensitive?","children":[{"label":"Yes: store only with consent, and make it easy to delete","link":"#privacy"}]},
{"label":"Where should it be read?","children":[{"label":"Always: a small profile in the system prompt"},{"label":"On demand: behind a search tool"},{"label":"Procedures: as a skill or instruction file","link":"#skills-plugins"}]}]}}
```

Patterns that work:
- **A small always-on profile** (a few hundred tokens) plus a searchable store for everything else.
- **File-based memory for agents that work in repositories:** a project instructions file plus a progress file. See [long-running agents](#long-running-agents).
- **Memory as a tool.** Give the agent `remember` and `recall` tools and let it decide, with a write policy in the tool description.
- **Evaluate across sessions.** Script multi-session tests: state a preference in session one, check it is used in session three, change it in session four.

Tools and services evolve quickly: MemGPT (Packer et al., 2023), now the Letta platform, treats the context like an operating system’s memory hierarchy; Mem0, Zep with Graphiti, and LangMem offer managed or library memory; several model providers and coding agents ship their own memory features. Check current capabilities before choosing.

## Numbers to know
> [!number]
> Rules of thumb. Keep the always-loaded profile to a few hundred tokens. Retrieve a handful of memories per turn, not dozens. Extraction once per session is usually enough; per-turn extraction multiplies cost and noise.

## Pitfalls and anti-patterns
> [!pitfall] Remembering inferences as facts
> “The user seems to be a beginner” stored as a fact will quietly shape every future answer. Store what users state and what you verified, with sources.

- **No forgetting.** Stale memories outvote current reality.
- **Cross-context leakage.** A memory from a work project surfacing in a personal conversation is a privacy incident.
- **Unbounded recall.** Loading every memory every turn is just a bigger, noisier prompt.
- **Untested memory.** Single-session evals cannot catch memory bugs.

## Talk like an expert
The vocabulary: **working, episodic, semantic and procedural memory**, **write policy** and **read policy**, **consolidation**, **memory as a tool**, **temporal knowledge graph**. Experts describe memory as “retrieval with a write path” and test it with multi-session evals. The live debate is whether long context plus good compaction makes most memory systems unnecessary, and whether models will learn continually so that memory moves into the weights.

> [!hottake] A markdown file the agent maintains beats most memory frameworks.
> **The counterargument:** files do not scale to millions of users, many facts and fine-grained permissions; structured stores with retrieval, provenance and deletion are what personal assistants at scale need.

## Check yourself
```quiz
agent-memory
```

## Go deeper
- Packer et al., “MemGPT: Towards LLMs as Operating Systems” (2023).
- Park et al., “Generative Agents: Interactive Simulacra of Human Behavior” (2023).
- Documentation for Letta, Mem0, Zep and LangMem, for current designs.

## Related
- [Context engineering](#context-engineering)
- [Long-running and durable agents](#long-running-agents)
- [Personal and ambient assistants](#personal-assistants)
- [RAG fundamentals](#rag-fundamentals)
- [Privacy](#privacy)
