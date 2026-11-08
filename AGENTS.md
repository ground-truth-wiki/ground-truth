# AGENTS.md

You are a coding agent working for a human who wants to contribute to Ground Truth Wiki, an open knowledge base for AI engineering. Read this whole file before you change anything, and follow it exactly. It has three parts:

1. [The rulebook](#1-the-rulebook): what every page must be.
2. [The contributor workflow](#2-the-contributor-workflow): what you do, step by step.
3. [Maintainer commands](#3-maintainer-commands): only for maintainers and stewards working inside this repository.

The human you work for is the author of the contribution and is accountable for it. You draft, check and propose. You never decide on their behalf what they stand behind.

## 1. The rulebook

1. **Verifiability.** Every factual claim has a source a reader can check, or reproducible evidence.
2. **Accuracy.** The accuracy rules in [STYLE_GUIDE.md](STYLE_GUIDE.md#accuracy-and-honesty) apply to every page.
3. **Freshness.** Every page carries a stability value and a review date, and is reviewed on schedule: volatile pages after 3 months, moving pages after 6, evergreen pages after 12.
4. **Neutrality.** Contested topics present the main positions fairly, and the page does not pick a winner. A chapter's hot take always comes with its strongest counterargument.
5. **Disclosure.** Contributors declare when they write about a company, product or project they work for or are paid by.
6. **No marketing.** Pages explain; they don't sell.
7. **Protect others.** Real case studies are anonymized unless the organization agreed to be named.
8. **Human accountability.** A named human stands behind every contribution. AI may draft, check and propose, but never approves.
9. **Credit.** Everyone who contributes is named on the pages they shaped.
10. **Openness.** Content stays under CC BY-SA 4.0, forever.

[GOVERNANCE.md](GOVERNANCE.md) explains who decides what, and how these rules can change.

**Never invent anything.** No made-up facts, numbers, benchmark scores, prices, dates, versions, papers, authors, quotes, URLs, companies, people or results, not even as examples. If you are not sure, leave it out, or ask the human for a source. This matters more than anything else in this file.

## 2. The contributor workflow

Do these steps in this order. Do not skip one, and stop where a step says to stop.

1. **Check the sign-in.** Run `gh auth status`. If the human is not signed in, ask them to run `gh auth login` and choose GitHub.com, HTTPS and "Login with a web browser". Wait until they are done.
2. **Ask what they want to contribute,** unless they already said it. One topic per pull request: a chapter, a fix, a glossary term, a visual, a playbook or a field note.
3. **Fork and branch.**
   ```sh
   gh repo fork ground-truth-wiki/ground-truth --clone
   cd ground-truth
   git switch -c <type>/<short-slug>      # for example fix/kv-cache-numbers or term/speculative-decoding
   npm install
   ```
   Use one of these types: `chapter`, `fix`, `term`, `visual`, `playbook`, `field-note`, `docs`.
4. **Look for duplicates.**
   ```sh
   npm run search -- <a few words about the topic>
   gh pr list --repo ground-truth-wiki/ground-truth --state open --search "<words>"
   gh issue list --repo ground-truth-wiki/ground-truth --search "<words>"
   ```
   If similar work exists, tell the human what you found and suggest improving the existing page or pull request instead. Continue only if they still want a new one.
5. **Claim wanted work.** If the work matches an open issue labeled `wanted`, claim it so nobody else starts the same thing:
   ```sh
   gh issue comment <number> --repo ground-truth-wiki/ground-truth --body "/claim"
   ```
   A person can hold 2 claims at a time. A claim without a pull request is released after 14 days.
6. **Create or open the file.**
   - New chapter: `npm run new -- chapter <id> --book <n> --title "Title"` (a seed; add `--full` for a full chapter)
   - New playbook: `npm run new -- playbook <id> --title "Title"`
   - New field note: `npm run new -- field-note <id> --title "Title"`
   - A playbook or field note built from an organization's own published account: add `--public-record`, and follow the public-record rules in [STYLE_GUIDE.md](STYLE_GUIDE.md#playbooks-and-field-notes).
   - New glossary term: `npm run new -- term <id> --term "Name"`
   - A fix: edit the existing file. Never change an id; never delete a page.
7. **Write it.** Follow [STYLE_GUIDE.md](STYLE_GUIDE.md) for text and [docs/VISUAL_LANGUAGE.md](docs/VISUAL_LANGUAGE.md) for visuals. Replace every `TODO:` the template left. Every factual claim needs a source the human can check; ask them for sources rather than supplying your own from memory. If they work for or are paid by a company, product or project the change is about, note it for the pull request (rule 5). When you review a chapter in full, set `reviewed` to the current month.
8. **Check it.** Run `npm run validate` and `npm run build`, and fix every error. Warnings in files you did not touch are not yours to fix in this pull request.
9. **Show the human the full change** (`git diff main`, and the complete text of new files). Ask them to read all of it and to confirm, in their own words, that they stand behind it. **Do not continue without that confirmation.** If they want changes, make them and show the change again.
10. **Open the pull request.**
    ```sh
    git add -A && git commit -m "<type>: <what changed>"
    git push -u origin HEAD
    gh pr create --repo ground-truth-wiki/ground-truth --title "<type>: <what changed>" --body-file <filled-template>
    ```
    Fill every section of [.github/pull_request_template.md](.github/pull_request_template.md). The "Why" section is written by the human, or approved by them word for word. Under "AI tools used", name every AI tool involved, yourself included. Tick "I read this change in full and stand behind it" only after the human has confirmed it in step 9.

Also:

- **One topic per pull request.** Small pull requests are reviewed fast; large ones wait.
- **Respect the limits.** A contributor with fewer than 3 merged pull requests can have 2 open at a time, others 5. Extra pull requests are turned into drafts automatically.
- **Never mass-generate content.** Do not open pull requests the human has not read, and do not split one generated batch into many pull requests.
- After the pull request is open, CI checks it and posts a preview link. Help the human answer review comments; push fixes to the same branch.

### Where things live

| Path | What it is |
|---|---|
| `content/<NN>-<book>/<id>.md` | Chapters: YAML frontmatter plus Markdown. The folder number is the book. |
| `data/glossary/<id>.json` | One glossary term per file. |
| `data/quizzes/<chapter-id>.json` | The quiz questions of one chapter. |
| `data/*.json` | Books, timeline, paths, matrices, cheat sheets, tools, wizards, debates, changelog, aliases. |
| `templates/` | Starting points for every kind of file. |
| `schemas/` | JSON Schemas; every field is described there. |
| `engine/` | The engine. Do not change it in a content pull request. |
| `source/` | The original, read-only. Never touch it. |

### Commands

| Command | What it does |
|---|---|
| `npm run validate` | Checks everything; errors name the file and line. |
| `npm run build` | Builds `dist/ground-truth.html`, the complete site in one file. Open it in a browser to check your change. |
| `npm run dev` | Rebuilds on every change and serves the site at http://localhost:8080. |
| `npm run search -- <terms>` | Finds existing chapters and terms. |
| `npm run new -- <kind> <id> …` | Creates a file from a template. |
| `npm run freshness` | Lists chapters due for review. |
| `npm run roundtrip` | Proves the build still matches the original, apart from approved changes. |

## 3. Maintainer commands

These commands are for the owner, maintainers and stewards working in Claude Code (or another agent) inside this repository. Each one:

- works on a new branch, never on `main`, and ends in pull requests that follow the same template and rules as anyone else's;
- splits large runs into reviewable pull requests, one book at a time;
- follows the rulebook and STYLE_GUIDE.md, and never invents facts;
- leaves the decision to merge to a human reviewer.

| Command | What it does |
|---|---|
| `status` | Report coverage by book (`npm run status`): full and seed chapters, visuals per chapter, the freshness backlog (`npm run freshness`) and the open pull requests waiting for review (`gh pr list --state open`). Changes nothing. |
| `continue` | Pick up the next work in this order: chapters the freshness report lists, then seed chapters in the priority order of [docs/COVERAGE_MAP.md](docs/COVERAGE_MAP.md), then approved planned topics from that map. Do 10 to 15 chapters, one pull request per book. |
| `deepen <book number or chapter id>` | Bring one book or chapter to the full template (STYLE_GUIDE.md): TL;DR, intuition, mechanics, practice, numbers, pitfalls, expert talk, 2 to 4 quiz questions, sources, related chapters, and 2 to 4 visuals with at least one interactive. Set `status: full` and `reviewed` to the current month. Add glossary terms the chapter introduces. |
| `visualize <book number or chapter id>` | Build the planned visuals, replace weak ones, and add an interactive visual for each core mechanism, following docs/VISUAL_LANGUAGE.md and its quality bar. Report what changed in the pull request. |
| `add: <paper, link, release notes or notes>` | File the new material everywhere it belongs: the chapters it changes, glossary terms, a timeline event and quiz questions, each with its source. Material that fits nowhere yet goes into Book 19 (the frontier) and is promoted later. |
| `refresh` | Update the chapters the freshness report lists: check every dated fact against its primary source (use web search if you have it, and cite what you used), fix what changed, and set `reviewed` to the current month. One pull request per book. |
| `audit` | Check accuracy and consistency against the rulebook and STYLE_GUIDE.md. Fix what is clearly wrong in pull requests, and open a "Report a problem" issue for everything that needs a source or a decision. |

### Rules for every change

- **Ids are permanent.** If one must change, add the old id to `data/aliases.json`, so old links keep working.
- **Nothing is deleted** without the owner's approval. Deepening a chapter replaces its seed body and sets `status: full`.
- **Releases, not version bumps.** Pull requests do not touch the version or the changelog; maintainers do that when they tag a release (GOVERNANCE.md).
- **New research goes where it belongs,** with glossary terms, a timeline event and quiz questions.
- **Planned topics become wanted pages.** After a proposal is accepted, add a `planned` row to docs/COVERAGE_MAP.md and run `npm run wanted -- --sync` in the same pull request. Once it is merged, `npm run wanted -- --issues` opens the issues people can claim.
- **The engine changes rarely.** A change goes in its own pull request, is as small as possible, carries a `gt:` comment, and is added to `build/roundtrip-allowlist.json` (see [engine/README.md](engine/README.md)).

### Never

- Push to `main`, approve a pull request, or merge your own work.
- Put secrets, tokens or personal data in a file, a commit, an issue or a pull request.
- Edit anything in `source/`.
- Invent a fact, a source or a result, or present illustrative numbers as real.
