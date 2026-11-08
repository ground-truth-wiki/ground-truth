# Contributing to Ground Truth Wiki

Ground Truth Wiki is an open knowledge base for AI engineering: chapters, interactive visuals, quizzes and tools that explain how modern AI systems are built, evaluated, secured and run. Anyone can improve it. You don't need to know Git: your coding agent does the technical work, and you decide what goes in.

## What you need

1. **A GitHub account.** Sign up at [github.com](https://github.com/signup) if you don't have one.
2. **The GitHub CLI** (`gh`), a small program that lets your agent talk to GitHub. Install it from [cli.github.com](https://cli.github.com).
3. **A coding agent**, such as Claude Code, Codex or Cursor.

## One-time setup

Open a terminal and run:

```sh
gh auth login
```

Choose **GitHub.com**, then **HTTPS**, then **Login with a web browser**, and approve in the browser. That's all.

## Contribute with your agent

Start your coding agent in an empty folder and paste this prompt, with your idea at the end:

```text
Contribute to Ground Truth Wiki: github.com/ground-truth-wiki/ground-truth. Read AGENTS.md first and follow it exactly. What I want to contribute: …
```

For example: "…a correction to the KV cache chapter: the memory formula is missing the batch size", or "…a new glossary term for speculative decoding", or "…a playbook on how we use RAG for customer support tickets".

Your agent will then:

1. make your own copy of the project (a "fork") and check that nobody is already working on the same thing;
2. write or change the page, following the style guide;
3. run the checks;
4. **show you the full change and ask you to confirm that you read it and stand behind it.** Nothing is sent before you say yes;
5. open a pull request: a proposal to merge your change, which you explain in your own words.

You can also [edit any page directly on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files) with the "Edit on GitHub" link on the site; GitHub opens the pull request for you. Then fill in the template by hand.

## Contribute without a coding agent

- **Share a playbook:** how your team used AI for a real problem, what worked, what failed and how you measured it. [Fill in the form](https://github.com/ground-truth-wiki/ground-truth/issues/new?template=share-a-playbook.yml) and a maintainer will turn it into a page with you.
- **Report a problem:** something wrong or out of date. [Fill in the form](https://github.com/ground-truth-wiki/ground-truth/issues/new?template=report-a-problem.yml), with a source if you have one.
- **Ask a question or suggest an idea** in [Discussions](https://github.com/ground-truth-wiki/ground-truth/discussions).

## How review works

1. **Automatic checks** run on every pull request: the content checks, a build of the whole site, and a check that the pull request template is filled in (the "Why" section, the AI disclosure, and your confirmation that you read the change).
2. **A preview link** is posted on the pull request, so you and the reviewers can see the change on a real copy of the site.
3. **A reviewer** for the book you changed (its steward) reads the change and checks it against its sources. They may ask questions or request changes. Answer in the pull request; your agent can push fixes to the same branch.
4. **A maintainer merges** it, and your GitHub name appears in the credits of the pages you shaped.

## Limits, and why they exist

- **Open pull requests:** 2 at a time while you have fewer than 3 merged pull requests, then 5. Extra pull requests are turned into drafts automatically, with a friendly comment.
- **One topic per pull request.** A fix, a chapter or a term, not all three.
- **Claims:** you can claim up to 2 issues labeled `wanted` by commenting `/claim`. A claim without a pull request is released after 14 days, so others can pick it up.
- **No mass-generated content.** Every pull request needs a human who read it in full.

Reviewing takes far longer than generating text, especially now that agents can write a chapter in minutes. The limits keep review fast and the quality high, and they make sure every page has a person standing behind it.

## The rulebook

Every page follows these ten rules. [GOVERNANCE.md](GOVERNANCE.md) explains how they are enforced and changed.

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

## Licenses

By contributing, you agree that your contribution is published under the project's licenses: [CC BY-SA 4.0](LICENSE-CONTENT) for content and data, [MIT](LICENSE) for code. Everyone in the project follows the [code of conduct](CODE_OF_CONDUCT.md).

## For developers

```sh
git clone https://github.com/ground-truth-wiki/ground-truth.git
cd ground-truth
npm install
npm run dev        # http://localhost:8080, rebuilds on every change
npm run validate   # checks everything
```

Node.js 20 or newer. [AGENTS.md](AGENTS.md) lists every command and where everything lives.
