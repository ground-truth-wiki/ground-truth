---
id: agent-facing-web
book: 12
order: "12.13.4"
title: "The web for agents: llms.txt, NLWeb, signed agents and content preferences"
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [llms-txt, nlweb, web-bot-auth, ai-preferences, web-agents]
visuals: []
prerequisites: [why-protocols]
---
> [!tldr]
> Websites are growing a second layer for machines: Markdown summaries for models (llms.txt), natural-language query endpoints (NLWeb), cryptographic identity for bots and agents (Web Bot Auth), machine-readable usage preferences (AI Preferences) and discovery documents. As of November 2026, robots.txt and HTTP Message Signatures are IETF standards, Web Bot Auth and AI Preferences are working-group drafts, llms.txt is a convention, and NLWeb and the discovery documents are project specifications. Remember: these signals describe a site and identify a caller, but none of them enforces anything by itself.

## Key ideas

- **llms.txt is a Markdown map of a site for models.** Proposed by Jeremy Howard on 3 September 2024, the file lives at `/llms.txt` and has one required element, an H1 with the site or project name, followed by an optional blockquote summary, optional detail and H2 sections that list links; an `Optional` section holds secondary links an agent can skip when context is short, and pages should offer a clean Markdown version at the same URL with `.md` appended or replacing the extension (`index.html.md` or `index.md` for URLs without a file name), advertised with `rel="alternate" type="text/markdown"` ([llmstxt.org](https://llmstxt.org/)).
- **Publishing it is cheap; counting on it is not.** As of November 2026, support depends on the product: Google Search says “You don't need to create new machine readable files, AI text files, or markup to appear in these features” ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)), while Chrome's Lighthouse checks llms.txt in its Agentic Browsing category ([Lighthouse Agentic Browsing](https://developer.chrome.com/docs/lighthouse/agentic-browsing)), flags a page only when fetching the file causes a server error, and marks a missing file as not applicable, because providing it is optional “at the moment” ([llms.txt audit](https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt)). Treat it as a courtesy to agents and coding tools, not as a ranking or access mechanism.
- **NLWeb turns a site into something you can ask.** The open-source NLWeb project in Microsoft's GitHub organization builds on the Schema.org and RSS markup sites already publish, defines an `ask` method for natural-language questions, answers in JSON using Schema.org types, and states that “Every NLWeb instance also acts as an MCP server” ([microsoft/NLWeb](https://github.com/microsoft/NLWeb)). One site can then serve people with HTML, browser agents through the same pages, and API-minded agents through MCP; see [computer-use agents](#computer-use-agents).
- **Signed requests replace guessing who a bot is.** The IETF Web Bot Auth working group is chartered to standardize cryptographic authentication of automated clients, including “AI agents retrieving or interacting with content on behalf of end users”; it authenticates the agent, not the end user, and leaves bot intent and reputation out of scope ([Web Bot Auth charter](https://datatracker.ietf.org/wg/webbotauth/about/)). Its working-group draft has agents sign requests with HTTP Message Signatures ([RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html)) tagged `web-bot-auth`, with a `Signature-Agent` header that points to a key directory at `/.well-known/http-message-signatures-directory` ([draft-ietf-webbotauth-httpsig-protocol-01](https://datatracker.ietf.org/doc/draft-ietf-webbotauth-httpsig-protocol/), 29 October 2026).
- **Identity is also the hook for commerce and paid access.** Visa's Trusted Agent Protocol (14 October 2025, developed with Cloudflare) builds on HTTP Message Signatures, is aligned with Web Bot Auth, and carries agent intent, consumer recognition and optional payment information to merchants ([Visa](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21716.html)). x402 goes further and answers a request with `402 Payment Required` and a `PAYMENT-REQUIRED` header, so an agent can pay and retry ([x402](https://github.com/x402-foundation/x402)); see [agentic commerce](#agentic-commerce-protocols).
- **Preferences say what may be done with content; discovery files say what a site offers.** robots.txt is a standard, but its rules “are not a form of access authorization” ([RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)); the IETF AI Preferences drafts add a vocabulary with `train-ai`, `ai-use` and `search` ([draft-ietf-aipref-vocab-08](https://datatracker.ietf.org/doc/draft-ietf-aipref-vocab/)) and attach it through a `Content-Usage` HTTP header or robots.txt rule ([draft-ietf-aipref-attach-05](https://datatracker.ietf.org/doc/draft-ietf-aipref-attach/)), with enforcement out of scope ([AI Preferences charter](https://datatracker.ietf.org/wg/aipref/about/)); see [data licensing and consent](#data-licensing-consent). For discovery, agents read A2A agent cards at `/.well-known/agent-card.json` ([A2A specification](https://a2a-protocol.org/latest/specification/)) and MCP Server Cards, recommended at `<streamable-http-url>/server-card` and listable in an AI Catalog at `/.well-known/ai-catalog.json` ([SEP-2127](https://modelcontextprotocol.io/seps/2127-mcp-server-cards.md)).

## Planned visuals

- `diagram`: the machine-facing layer of one website: robots.txt with `Content-Usage`, llms.txt and `.md` pages, an NLWeb `ask` endpoint that is also an MCP server, an agent card, an MCP Server Card and a signature key directory, each badged as standard, draft or convention and linked to its chapter.
- `sequence`: a signed agent request: the agent sends `Signature-Input`, `Signature` and `Signature-Agent`, the site fetches the key directory and verifies, then answers with content and a `Content-Usage` header, or with `402 Payment Required`; each header shown.
- `compare`: a browser agent and an API agent visiting the same site, with linked highlights on what each reads (HTML and Markdown pages versus NLWeb, MCP and agent cards) and how each is identified.

## Talk like an expert

Experts split the agent-facing web into three questions: can the agent read this (llms.txt, Markdown pages, NLWeb), who is asking (signed requests under Web Bot Auth, not user-agent strings), and what may it do with the content (robots.txt, `Content-Usage`). For every signal they ask whether it is an RFC, a working-group draft or a convention, and who, if anyone, honors it.

## Go deeper

- [The /llms.txt file](https://llmstxt.org/), the proposal and its format.
- [microsoft/NLWeb](https://github.com/microsoft/NLWeb), the repository and protocol description.
- Meunier and Major, [HTTP Message Signatures for automated traffic](https://datatracker.ietf.org/doc/draft-ietf-webbotauth-httpsig-protocol/), the Web Bot Auth working-group draft.
- [IETF AI Preferences working group](https://datatracker.ietf.org/wg/aipref/about/), with links to the vocabulary and attachment drafts.

## Related

- [The rest of the alphabet soup](#protocol-soup)
- [Browser automation for agents: Playwright, CDP and agent libraries](#browser-automation-stack)
- [Agent identity and delegated authorization](#agent-identity-delegation)
- [Agentic commerce and payment protocols](#agentic-commerce-protocols)
- [Data licensing, copyright and consent](#data-licensing-consent)
- [Computer-use and browser agents](#computer-use-agents)
