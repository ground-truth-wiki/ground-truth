---
id: learning-resources
book: 20
order: "20.6.2"
title: "Courses and textbooks: a curriculum map"
level: foundation
stability: moving
reviewed: "2026-11"
status: seed
tags: [courses, textbooks, learning, curriculum, career]
visuals: []
prerequisites: [how-to-use]
---
> [!tldr]
> A short list of courses and books, most of them free online, spans what Ground Truth teaches, from building a language model from scratch to shipping AI applications. Choose by profile: application engineers start with AI engineering and agent courses, model engineers with build-it-yourself series and CS336, and researcher-adjacent readers with NLP courses and textbooks. The one thing to remember: course pages change every term, so check the current offering and pair every course with a project you build and evaluate. Every entry below was checked in November 2026.

## Key ideas

- **University courses where you build the model yourself.** Stanford CS336, "Language Modeling from Scratch" (Tatsunori Hashimoto and Percy Liang, offered in spring 2024, 2025 and 2026), expects Python, deep learning, systems optimization, calculus, linear algebra, probability and machine learning; its five assignments cover a tokenizer, transformer and optimizer, then systems (including a Triton FlashAttention2), scaling laws, filtering Common Crawl into pretraining data, and supervised fine-tuning plus RL for math reasoning, with lectures on YouTube, and it maps to [Book 2](#book-2), [Book 3](#book-3) and [Book 15](#book-15) ([Stanford CS336, Spring 2026](https://cs336.stanford.edu/)). CMU's Advanced NLP (11-711, Spring 2026, taught by Sean Welleck after earlier terms by Graham Neubig) has no hard prerequisites but expects Python, probability and linear algebra and highly recommends prior deep learning experience, opens with a "Build Your Own LLaMa" assignment and ends in a reimplementation and a final project ([CMU 11-711 Advanced NLP, Spring 2026](https://cmu-l3.github.io/anlp-spring2026/)).
- **Courses for the foundations.** Stanford CS224N (Winter 2026, Diyi Yang and Yejin Choi) runs from word vectors, backpropagation and transformers to post-training, agents, reasoning, interpretability and multimodality, and the full Spring 2024 lectures are free on YouTube; it maps to [Book 1](#book-1), [Book 2](#book-2) and [Book 5](#book-5) ([Stanford CS224N](https://web.stanford.edu/class/cs224n/)). MIT 6.S191, Introduction to Deep Learning (2026 edition), is a short bootcamp of lectures and software labs that needs only basic linear algebra and calculus, with free videos, MIT-licensed materials and archived sites back to 2017 ([MIT 6.S191](https://introtodeeplearning.com/)).
- **Seminars and MOOCs closer to the frontier.** Stanford CS25, "Transformers United", in its sixth iteration in 2026, is a guest-speaker seminar that anyone can join by livestream, with recordings online ([Stanford CS25](https://web.stanford.edu/class/cs25/)). Berkeley's Large Language Model Agents MOOC (Fall 2024) and Advanced Large Language Model Agents (Spring 2025) cover reasoning, planning, tool use, code generation, theorem proving, multi-agent collaboration, and privacy and safety through recorded lectures, quizzes and labs, and map to [Book 9](#book-9), [Book 10](#book-10) and [Book 19](#book-19) ([LLM Agents, Fall 2024](https://llmagents-learning.org/f24); [Advanced LLM Agents, Spring 2025](https://llmagents-learning.org/sp25)).
- **Build-it-yourself videos and practical courses.** Andrej Karpathy's Neural Networks: Zero to Hero is eight free videos (about 14.5 hours) that go from backpropagation in micrograd to building GPT and its tokenizer, for people with solid Python and introductory math ([Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)). fast.ai's free Practical Deep Learning for Coders only asks that you can code (a year of experience is enough) and have followed a high school math course, and its 2022 Part 1 has 9 lessons of about 90 minutes, plus a Part 2, "Deep Learning Foundations to Stable Diffusion" ([fast.ai](https://course.fast.ai/)); Hugging Face's free LLM Course, which started as its NLP course, teaches the Transformers, Datasets and Tokenizers libraries, fine-tuning, dataset curation and reasoning models ([Hugging Face LLM Course](https://huggingface.co/learn/llm-course/chapter1/1)).
- **Textbooks and an open roadmap.** Dive into Deep Learning is an interactive book with code, math and discussions, implemented in PyTorch, NumPy/MXNet, JAX and TensorFlow, which its site says has been adopted at 500 universities from 70 countries ([Dive into Deep Learning](https://d2l.ai/)), and Jurafsky and Martin's Speech and Language Processing, free as a third-edition draft last released on 19 August 2026, now opens with a volume on large language models ([Speech and Language Processing, 3rd edition draft](https://web.stanford.edu/~jurafsky/slp3/)). Chip Huyen's AI Engineering (O'Reilly, 2025) runs in ten chapters from foundation models and evaluation through prompt engineering, RAG and agents, finetuning, dataset engineering and inference optimization to architecture and user feedback ([chiphuyen/aie-book](https://github.com/chiphuyen/aie-book); [AI Engineering, table of contents](https://github.com/chiphuyen/aie-book/blob/main/ToC.md)), and Maxime Labonne's free LLM course splits into optional fundamentals, an "LLM Scientist" track and an "LLM Engineer" track with Colab notebooks ([mlabonne/llm-course](https://github.com/mlabonne/llm-course)).
- **Three sequences, each paired with projects.** An application engineer can read AI Engineering alongside the Hugging Face course and then take the Berkeley agents MOOC, following the [Zero to AI Engineer in 12 weeks](#path-zero-to-ai-engineer) path; a model engineer can go from Zero to Hero to CS336 and the LLM Scientist track; a researcher-adjacent reader can take CS224N or CMU 11-711 with Speech and Language Processing, then CS25 and the [Talk Like a Researcher](#path-talk-like-a-researcher) path. Pair every unit with a rung of the [project ladder](#project-ladder), and recheck the course page before you start, since CS224N itself warns that "assignments change from year to year; please do not do assignments from previous years!" ([Stanford CS224N](https://web.stanford.edu/class/cs224n/)).

## Planned visuals

- **`matrix`:** the curriculum table: each resource with its level, prerequisites, format, cost, the Ground Truth books it maps to, and the date its page was last checked.
- **`tree`:** choose a sequence by reader profile (application engineer, model engineer, researcher-adjacent), with each step linked to its course and to the project-ladder rung it pairs with.
- **`graph`:** suggested order between resources, such as Zero to Hero before CS336 and CS224N before CS25, so a reader can see what to take first.

## Talk like an expert

Practitioners name courses by number ("CS336", "224N", "6.S191") and judge a curriculum by what you built, not what you watched: did you implement the tokenizer and train the model, or only follow the lecture?

## Go deeper

- [Stanford CS336, Language Modeling from Scratch](https://cs336.stanford.edu/): the current offering, with links to earlier terms, lecture videos and assignments.
- [Jurafsky and Martin, Speech and Language Processing, 3rd edition draft](https://web.stanford.edu/~jurafsky/slp3/): an NLP textbook free online as a draft that is re-released with updated chapters, now opening with a volume on large language models.
- [Zhang et al., Dive into Deep Learning](https://d2l.ai/): deep learning from preliminaries through attention and transformers to optimization, computer vision and recommender systems, with code in several frameworks.
- [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/chapter1/1): hands-on work with open models, datasets and tokenizers on the Hub.

## Related

- [Who’s who and where to learn](#whos-who)
- [Learning paths and the project ladder](#project-ladder)
- [The Canon](#the-canon)
- [Interview prep](#interview-prep)
- [How AI research is published: arXiv, conferences and peer review](#ai-research-publishing)
