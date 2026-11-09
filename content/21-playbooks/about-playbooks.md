---
id: about-playbooks
book: 21
order: "21.1"
title: About playbooks
level: foundation
stability: moving
reviewed: "2026-11"
status: seed
tags: [playbooks, contributing]
visuals: []
type: playbook
---
> [!tldr]
> A playbook shows how one team used AI for one real use case in one industry: the problem, the approach, the stack, the results and how they were measured, and what failed. This page explains what belongs here and how to add one, and lists the playbooks by industry.

## The playbooks, by industry

Grouped by the industry of the organization. Each page says at the top whether it is a first-hand account or built from the public record.

### Software and developer tools

- [Human-in-the-loop coding agents in Jira at Atlassian](#atlassian-hula-jira-agents)
- [Apple's on-device scene analysis: one shared vision backbone for many features](#apple-on-device-scene-analysis)
- [Apple Photos: recognizing people on the device](#apple-photos-people-recognition)
- [RovoDev Code Reviewer: LLM review comments on Atlassian's pull requests](#atlassian-rovodev-code-reviewer)
- [BitsAI-CR: two-stage LLM code review at ByteDance](#bytedance-bitsai-code-review)
- [Cloudflare's internal AI engineering stack: gateway, MCP portal and AI code review](#cloudflare-internal-ai-engineering-stack)
- [Datadog Bits Investigation: evaluating an SRE agent on replayed incidents](#datadog-sre-agent-evaluation)
- [GitHub Copilot: training and evaluating a custom code-completion model](#github-copilot-completions-model)
- [GitHub secret scanning: a small classifier for generic secrets](#github-secret-detection-model)
- [Google: a randomized trial of AI coding features and developer speed](#google-ai-development-speed-rct)
- [AutoCommenter: LLM best-practice comments in Google's code review](#google-autocommenter-code-review)
- [Google: repairing broken builds with ML-suggested fixes](#google-build-repair-ml)
- [Migrating int32 IDs to int64 at Google with an LLM](#google-code-migrations-llm)
- [Google: drafting security incident summaries with an LLM](#google-incident-response-genai)
- [Hybrid ML and semantic-engine code completion at Google](#google-ml-code-completion)
- [ML-suggested edits that resolve code review comments at Google](#google-resolving-review-comments)
- [Google: migrating TensorFlow models to JAX with a multi-agent system](#google-tensorflow-to-jax-migration-agents)
- [Intercom Fin: a fine-tuned embedding model and an in-house reranker](#intercom-fin-retrieval)
- [Intercom Fin: smaller fine-tuned models in place of one large-LLM prompt](#intercom-fin-small-llms)
- [LinkedIn LANTERN: distilling LLMs into small models for job-fit ratings and explanations](#linkedin-lantern-distillation)
- [RAG over a knowledge graph of support tickets at LinkedIn](#linkedin-rag-knowledge-graph-support)
- [Notion's Auto: evaluating a model router on replayed real tasks](#notion-model-router)
- [Notion: two years of scaling vector search for AI Q&A](#notion-vector-search-scale)
- [Salesforce Horizon Agent: text-to-SQL in Slack with consensus voting](#salesforce-text-to-sql)
- [Converting Enzyme tests to React Testing Library at Slack: an AST codemod plus an LLM](#slack-enzyme-to-rtl-migration)
- [Zoominfo: a four-phase evaluation and rollout of GitHub Copilot](#zoominfo-copilot-study)

### AI and cloud providers

- [RCAgent: root cause analysis of Flink jobs with a locally hosted LLM agent](#alibaba-rcagent-root-cause)
- [Cloudflare's Infire: an in-house inference engine in Rust for edge GPUs](#cloudflare-infire-inference-engine)
- [Cursor's fast apply: a fine-tuned model and speculative edits for whole-file code edits](#cursor-fast-apply-speculative-edits)
- [Dropbox Dash: adapting an LLM relevance judge to cheaper models with DSPy](#dropbox-dash-relevance-judge-dspy)
- [Dropbox: AI summaries and answers in web file previews](#dropbox-file-preview-ai-answers)
- [Dropbox: choosing an embedding model for multilingual file search](#dropbox-semantic-search-model-selection)
- [Xpert: recommending the first incident query to Microsoft's on-call engineers](#microsoft-xpert-incident-queries)

### Finance and insurance

- [ANZ Bank: a controlled GitHub Copilot experiment before rollout](#anz-bank-copilot-study)
- [Grab Hubble: LLM-written table docs and a chatbot for data discovery](#grab-data-discovery-llm)
- [Grab: tagging sensitive data columns with an LLM](#grab-llm-data-classification)
- [Grab's Catwalk: replacing a legacy ONNX server with NVIDIA Triton](#grab-triton-model-serving)
- [Nubank: customer-support agents built around evaluation](#nubank-support-agents-evaluation)
- [Ramp Research: an agentic data analyst in Slack](#ramp-research-agent)
- [Ramp Sheets: agents that write monitors, triage alerts and propose fixes](#ramp-sheets-self-maintaining)
- [Uber invoice processing: OCR and GPT-4 with human review](#uber-invoice-processing)
- [Upstart's credit model under the CFPB's first No-Action Letter](#upstart-cfpb-fair-lending)

### Commerce and marketplaces

- [Adevinta: a four-week pilot to choose an AI coding assistant](#adevinta-se-ai-tooling-evaluation)
- [Airbnb's content policy classifier: a fine-tuned small model against frontier APIs](#airbnb-llm-classifier-benchmark)
- [Migrating Android dependency injection from Koin to Hilt at Allegro with an agent skill](#allegro-gradle-migration-agents)
- [Allegro: judging search relevance with LLMs in four languages](#allegro-search-relevance-llm-judge)
- [Deep Inventory Management: reinforcement learning for inventory buying by Amazon researchers](#amazon-deep-inventory-management)
- [Booking.com's in-house neural machine translation, from one domain to many](#booking-com-neural-machine-translation)
- [GetYourGuide's Automerge: an AI pipeline that fixes and merges dependency updates](#getyourguide-ai-pull-request-workflow)
- [AI-drafted activity listings at GetYourGuide: a failed test, then a launch](#getyourguide-generative-listings)
- [Shopify Sidekick: post-training an open model to take over a frontier model's subagent](#shopify-open-model-task-experts)
- [Shopify Sidekick: tool sprawl, calibrated LLM judges and reward hacking in a merchant assistant](#shopify-sidekick-agentic-lessons)
- [Wayfair Tarragon: spotting damaged packages on the sorter with YOLO](#wayfair-package-damage-detection)
- [Validating product dimensions at Wayfair with a multimodal LLM](#wayfair-product-dimensions)
- [Wayfair Wilma: flagging supplier transfer tickets that need an associate](#wayfair-supplier-transfer-intervention)
- [Zalando: mining incident postmortems with a multi-stage LLM pipeline](#zalando-postmortem-analysis)
- [Zalando: mapping supplier spreadsheets with a RAG flywheel](#zalando-rag-data-ingestion)
- [Zalando: an LLM judge checks search quality before new markets launch](#zalando-search-quality-ai-judge)
- [Zalando: migrating B2B apps between UI component libraries with GPT-4o](#zalando-ui-library-migration)

### Travel, mobility and delivery

- [DB Regio Bus: a phone voicebot that books on-demand buses](#db-regio-rufbus-voicebot)
- [RCACopilot: predicting root cause categories of cloud incidents at Microsoft](#microsoft-rcacopilot)
- [Uber FixrLeak: repairing Java resource leaks with AST checks and an LLM](#uber-fixrleak)
- [Uber Genie: a RAG copilot for on-call Slack channels](#uber-genie-on-call-copilot)
- [Uber PerfInsights: finding Go performance antipatterns with LLMs](#uber-perfinsights)
- [Uber QueryGPT: generating SQL from natural-language questions](#uber-querygpt)
- [Uber AutoCover: generating and repairing software tests with a multi-agent pipeline](#uber-test-generation-agents)
- [uReview: Uber's in-house AI code reviewer with graded and filtered comments](#uber-ureview-code-review)

### Media, social and gaming

- [LinkedIn's assistant for jobs and the feed: what came easy and where it struggled](#linkedin-generative-ai-product-lessons)
- [LinkedIn's SQL Bot: text-to-SQL over an enterprise data lake](#linkedin-sql-bot)
- [Root cause isolation at Meta with a fine-tuned Llama 2 ranker](#meta-ai-root-cause-isolation)
- [CodeCompose: fine-tuned code completion at Meta](#meta-codecompose)
- [Meta's DrP: on-call investigation playbooks written as code](#meta-drp-investigations)
- [Meta: mutation-guided test generation for privacy hardening](#meta-mutation-guided-test-generation)
- [TestGen-LLM: extending human-written unit tests with LLMs at Meta](#meta-testgen-llm)
- [Roblox's voice safety classifier: moderating live voice chat in 30 languages](#roblox-voice-safety-classifier)
- [Verification loops and an LLM judge for Spotify's background coding agent](#spotify-background-coding-agents)
- [Spotify GLIDE: generative retrieval with Semantic IDs for podcast discovery](#spotify-podcast-generative-retrieval)
- [MinT: open machine translation on CPUs for Wikipedia translators](#wikimedia-mint-translation)

### Healthcare

- [A randomized trial of ambient AI scribes at UCLA Health](#ucla-ambient-scribes-trial)
- [AI in Danish breast screening: one reader for likely normal mammograms](#capital-region-denmark-ai-mammography)
- [Ambient voice technology across NHS care settings: the GOSH Phase 4 evaluation](#gosh-ambient-voice-technology)
- [TREWS: sepsis alerts, provider confirmation and patient outcomes at five hospitals](#johns-hopkins-trews-sepsis-alerts)
- [Kaiser Permanente's Advance Alert Monitor: early warnings with nurse review](#kaiser-advance-alert-monitor)
- [Kaiser Permanente: the first year of an AI scribe for clinical notes](#kaiser-ambient-ai-scribes)
- [Ambient voice technology for clinical notes at the London Ambulance Service](#london-ambulance-ambient-voice)
- [MASAI: AI triage and detection support in Swedish mammography screening](#masai-ai-mammography-screening)
- [Ambient AI documentation pilots at Mass General Brigham and Emory Healthcare](#mass-general-emory-ambient-documentation)
- [Antibiogo: a smartphone app that reads antibiotic susceptibility tests](#msf-antibiogo)
- [Northwestern Medicine: generative draft reports for radiographs](#northwestern-ai-radiograph-reporting)
- [NYUTron: a language model trained on clinical notes predicts hospital readmissions](#nyu-langone-nyutron)
- [PubMed Best Match: learning to rank for biomedical literature search](#pubmed-best-match)
- [AI-drafted replies to patient messages at UC San Diego Health](#ucsd-ai-drafted-patient-replies)
- [Testing an ambient AI scribe in a randomized trial before rollout at UW Health](#uw-ambient-documentation-studies)

### Public sector

- [GOV.UK Chat: answering questions from government guidance](#gov-uk-chat)

## What belongs here

- **One real use case per page,** from work that was actually done, in one industry: retail, healthcare, the public sector or any other.
- **The whole story:** the problem, why this approach, what was built, the stack, the results, what failed, and what the team would do differently.
- **Results only as measured,** with the metric, the baseline, the sample and the period. "We did not measure this" is a fine answer; an estimate presented as a result is not.
- **People and organizations protected:** a playbook names an organization only if it agreed to be named (rule 7), and every author discloses ties to the vendors they mention (rule 5). A public-record playbook names the organization because the organization published the account itself.
- **Two kinds of account.** A playbook is either first-hand, told or approved by the people who did the work, or it comes from the public record: built only from an account the organization published itself, such as an engineering blog post or a paper by the team, with every claim quoted and linked. A "From the public record" note at the top of such a page says so, and the team is always welcome to replace it with its own first-hand story.

## What does not belong here

- Hypothetical or composite case studies, or anything invented to make a point.
- Product announcements, vendor case studies written to sell, and benchmarks without a method (rule 6).
- Stories retold from news coverage. A public-record playbook is built from the organization's own account, never from articles about it.
- Tutorials without a real deployment behind them. Those belong in the chapters of Books 0 to 20.

## How to add a playbook

- **With a coding agent:** give it the contribution prompt from [CONTRIBUTING.md](https://github.com/ground-truth-wiki/ground-truth/blob/main/CONTRIBUTING.md). It runs `npm run new -- playbook <id> --title "…"`, which starts from the playbook template, and you fill in each section.
- **Without one:** fill in the "Share a playbook" form on GitHub. A maintainer turns it into a page with you, and nothing is published before you approve it.
- **From the public record:** run `npm run new -- playbook <id> --title "…" --public-record` and follow the public-record rules in [STYLE_GUIDE.md](https://github.com/ground-truth-wiki/ground-truth/blob/main/STYLE_GUIDE.md#playbooks-and-field-notes).

## How playbooks are reviewed

A steward reads every playbook like a careful editor: are the results measured as described, is the organization anonymized or did it agree to be named, are the claims about tools sourced and dated, and is anything selling rather than explaining? On a public-record page, the steward also opens the published account and checks every quote and number against it. Other teams who try the same approach can add their result under `replications`, so a playbook grows stronger, or weaker, with evidence.

## Talk like an expert

Practitioners trust a playbook more for its "what failed" section than for its results: failures are where the transferable lessons live.

## Related

- [About field notes](#about-field-notes)
- [Why evals are the core skill](#why-evals)
- [Error analysis first](#error-analysis)
- [Lessons from public engineering write-ups](#public-writeups)
