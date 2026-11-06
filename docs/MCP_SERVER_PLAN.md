# MCP server: plan

A design for a later, read-only Model Context Protocol (MCP) server, so coding agents and assistants can look things up in Ground Truth Wiki while they work. It is not built yet; this note fixes the scope so it can be built in one pull request.

## Goals

- Agents can search chapters, read a chapter, look up a glossary term and list playbooks and field notes, with links back to the site.
- **Read-only.** No tool changes anything, anywhere.
- **No server of our own.** The project runs no servers, so the MCP server runs locally next to the agent (stdio transport), reading either a local clone or the site's static files.
- **No secrets, no tracking.** It needs no key, sends nothing about the user, and makes no request except to fetch the site's static files when no local clone is given.

## Tools

All four tools are read-only (annotation `readOnlyHint: true`) and return JSON with a `url` to the page on the site, so agents can cite it.

| Tool | Input | Returns |
|---|---|---|
| `search_chapters` | `query` (string), optional `limit` (default 10, at most 50), optional `type` (`chapter`, `playbook`, `field-note`) | Ranked matches: `id`, `title`, `book`, `order`, `type`, `status`, `tldr`, `url`, `score` |
| `get_chapter` | `id` (string; old ids are resolved through `data/aliases.json`) | `id`, `title`, `book`, `order`, `level`, `stability`, `reviewed`, `status`, `tags`, `markdown` (the chapter body), `url`, and a `stale` flag when the chapter is past its review date |
| `get_glossary_term` | `term` (an id, name, abbreviation or alias) | `id`, `term`, `def`, `practice`, `aliases`, `abbr`, `chapters` (with their URLs) |
| `list_playbooks` | optional `type` (`playbook` or `field-note`, default both), optional `industry` | `id`, `title`, `type`, `industry`, `use_case`, `outcome`, `measured_how`, `reviewed`, `url` |

`get_chapter` returns the Markdown as written, including `viz` blocks; a later option can replace visuals with their title, caption and alt text, as `llms-full.txt` readers would want.

## Data

Two sources, the same shapes:

1. **A local clone** (`--repo <path>`): the server reads `content/`, `data/glossary/` and `data/aliases.json` with the same loaders the build uses (`scripts/lib/project.mjs`), and ranks results with the same scoring as `npm run search` (moved into `scripts/lib/search.mjs` so both share it).
2. **The published site** (default): the site build adds three static files, so the server needs no clone:
   - `/api/v1/index.json`: every chapter's metadata and TL;DR, and every glossary term;
   - `/api/v1/chapters/<id>.json`: one chapter with its body;
   - `/api/v1/aliases.json`.

   The server fetches `index.json` once per session and individual chapters on demand. The files are cached like other assets and change only when the site is deployed.

## Shape of the code

- `mcp/server.mjs`, plain Node.js ES modules like the rest of the repository, using the official MCP SDK for JavaScript at an exact pinned version, with the stdio transport only.
- It follows the current MCP specification at the time it is built (the stateless 2026-07-28 revision, per the November 2026 freshness baseline in STYLE_GUIDE.md) and lists tools in a deterministic order.
- Run with `node mcp/server.mjs` from a clone, or through an `npx` command documented in the README. Agents configure it like any local MCP server.
- Tests: each tool against a fixed snapshot of the content, plus a check in CI that the server starts and lists exactly four tools.

## Safety

- Chapter text is content, not instructions. The tool descriptions say so, and the server returns text without rendering it.
- Inputs are validated (lengths, allowed characters for ids), and file access is limited to the content and data folders of the configured clone.
- The server never writes files, never runs commands, and never contacts any host except the configured site address.

## Out of scope for the first version

Writing or proposing changes (contributors use AGENTS.md and pull requests), quizzes, the timeline and matrices, and any hosted, remote version.
