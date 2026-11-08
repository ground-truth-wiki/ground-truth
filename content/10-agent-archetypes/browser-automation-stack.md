---
id: browser-automation-stack
book: 10
order: "10.2.1"
title: "Browser automation for agents: Playwright, CDP and agent libraries"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [browser-automation, playwright, chrome-devtools-protocol, web-agents, computer-use]
visuals: []
prerequisites: [computer-use-agents]
---
> [!tldr]
> A browser agent sits on a stack: a control protocol (WebDriver, WebDriver BiDi or the Chrome DevTools Protocol), an automation library such as Playwright or Puppeteer, and an agent layer that turns the page into something a model can read and act on. Much of the engineering lives in the lower layers: what the model sees, which browser profile it uses, and which steps stay plain code. Remember that every page the agent reads is untrusted input, so isolation and approvals matter more than clever prompts.

## Key ideas

- **Three control protocols sit at the bottom.** Classic WebDriver is a W3C remote-control interface for browsers with an HTTP wire protocol ([W3C WebDriver, Working Draft](https://www.w3.org/TR/webdriver2/)), and WebDriver BiDi extends it with bidirectional communication, so the browser can push events to the client instead of only answering commands ([W3C WebDriver BiDi, Editor's Draft](https://w3c.github.io/webdriver-bidi/), 6 November 2026). Puppeteer controls Chrome or Firefox over the Chrome DevTools Protocol (CDP) or WebDriver BiDi, and runs headless by default ([Puppeteer](https://pptr.dev/)).
- **Playwright offers one API for three engines, with built-in waiting.** Playwright drives Chromium, Firefox and WebKit, headless or headed, waits until elements are actionable before it acts, and finds elements by role, label, placeholder or test id instead of brittle CSS paths; it describes itself as automation “for testing, scripting, and AI agents” ([Playwright](https://playwright.dev/)).
- **MCP servers give agents a browser without vision.** Playwright MCP hands the model the page as an accessibility snapshot with element references rather than pixels, so no vision model is needed; its profile is persistent by default, `--isolated` starts every session fresh, and its README recommends the more token-efficient Playwright CLI for high-throughput coding agents ([Playwright MCP README](https://github.com/microsoft/playwright-mcp)). Chrome DevTools MCP lets a coding agent control and inspect a live Chrome (performance traces, network requests, console messages) and warns that it exposes the browser's content to the MCP client ([Chrome DevTools MCP README](https://github.com/ChromeDevTools/chrome-devtools-mcp)).
- **Agent libraries and hosted browsers add a natural-language layer.** Browser Use is an MIT-licensed open-source browser agent for Python and TypeScript that can control a local browser, its own cloud browser or an existing remote browser over CDP ([Browser Use README](https://github.com/browser-use/browser-use)), and Stagehand offers `act`, `observe` and `extract`, can cache repeated actions on Browserbase's servers, re-resolves an action when the site changes, and has `observe` return real selectors, so a script can fill in credentials without them ever reaching the model ([Stagehand README](https://github.com/browserbase/stagehand)). OpenAI's computer-use guide runs the tool against a local Playwright browser, partner-hosted browsers or desktops (Browserbase, Browser Use, Daytona and E2B Desktop) or an OpenAI-hosted browser, as of November 2026 ([OpenAI computer use guide](https://developers.openai.com/api/docs/guides/tools-computer-use)).
- **Isolate the browser and gate consequential actions, because pages attack.** OpenAI's guide asks for an isolated browser or VM with an allowlist of sites and actions, confirmation of consequential actions so users stay in control of purchases, sending data and destructive changes, and treating screen content as untrusted ([OpenAI computer use guide](https://developers.openai.com/api/docs/guides/tools-computer-use)). Brave showed in August 2025 that the Comet agentic browser fed page content to its model without separating it from the user's instructions, so a hidden comment could hijack a “summarize this page” request, and that a first fix was incomplete ([Brave, “Agentic Browser Security: Indirect Prompt Injection in Perplexity Comet”](https://brave.com/blog/comet-prompt-injection/) (2025)). Bot detection is a separate limit: even Browser Use, which offers stealth cloud browsers, says no browser configuration guarantees that every CAPTCHA can be avoided or solved ([Browser Use README](https://github.com/browser-use/browser-use)).
- **Pages can offer tools instead of being scraped.** The draft WebMCP API lets a web application register JavaScript tools that agents can call, through `document.modelContext.registerTool`; it is a Draft Community Group Report of the Web Machine Learning Community Group (2 November 2026), not a W3C standard ([WebMCP](https://webmachinelearning.github.io/webmcp/)). Until that spreads, the parent chapter's rule holds: prefer an API or MCP server when one exists, and keep the steps you already know as plain script ([Computer-use and browser agents](#computer-use-agents)); see [the web for agents](#agent-facing-web).

## Planned visuals

- `diagram`: the stack from control protocol (WebDriver, BiDi, CDP) to library (Playwright, Puppeteer) to agent layer (MCP servers, Browser Use, Stagehand, provider computer-use tools) to hosted browsers, with each part linking to its chapter.
- `compare`: the same login step as a Playwright script, a Stagehand `act` call and an accessibility-snapshot tool call, highlighting what the model sees and where the credentials live.
- `sequence`: an indirect prompt injection in an agentic browser, step by step: the user asks for a summary, the page returns hidden instructions, the model proposes an action, and an approval gate stops it.

## Talk like an expert

Experts talk about **CDP**, **BiDi**, **locators**, **auto-waiting**, **accessibility snapshots**, **element refs**, **isolated profiles**, **storage state** and **self-healing selectors**, and they ask three questions first: what does the model actually see, whose session does this browser hold, and which steps can stay plain code?

## Go deeper

- [W3C WebDriver BiDi](https://w3c.github.io/webdriver-bidi/), the Editor's Draft of the bidirectional protocol.
- [Playwright](https://playwright.dev/) documentation, and the [Playwright MCP README](https://github.com/microsoft/playwright-mcp).
- [OpenAI computer use guide](https://developers.openai.com/api/docs/guides/tools-computer-use), for environments and safety rules.
- Brave, [“Agentic Browser Security: Indirect Prompt Injection in Perplexity Comet”](https://brave.com/blog/comet-prompt-injection/) (2025).

## Related

- [Computer-use and browser agents](#computer-use-agents)
- [Computer-use and web agent benchmarks](#computer-use-benchmarks)
- [MCP server types and catalog](#mcp-server-catalog)
- [Sandboxes and execution environments](#sandboxes)
- [Prompt injection](#prompt-injection)
- [The web for agents: llms.txt, NLWeb, signed agents and content preferences](#agent-facing-web)
