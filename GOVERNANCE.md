# Governance

Ground Truth Wiki is written and reviewed in public. This document holds the rulebook every page follows, who decides what, and how those decisions, including the rulebook itself, can change.

## The rulebook

These ten rules apply to all content, now and later. AGENTS.md and CONTRIBUTING.md repeat them in the same words.

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

## Roles

| Role | Who | What they do |
|---|---|---|
| Contributor | Anyone with a GitHub account | Opens pull requests and issues, following [CONTRIBUTING.md](CONTRIBUTING.md). |
| Steward | One or more per book | Reviews and approves pull requests that touch their book. Keeps the book coherent, current and true to the rulebook. Listed in [.github/CODEOWNERS](.github/CODEOWNERS). |
| Maintainer | A small group with merge rights | Reviews and merges, runs the maintainer commands in [AGENTS.md](AGENTS.md#maintainer-commands), tags releases, enforces the [code of conduct](CODE_OF_CONDUCT.md). |
| Owner | The project's founder ([@7oaker](https://github.com/7oaker)) | A maintainer who also approves deletions, changes to the rulebook and new maintainers. |

Until the first stewards join, the owner is the code owner of every book.

### Becoming a steward

Stewards are contributors who already do the work. Anyone can nominate themselves or someone else in GitHub Discussions, in the "Stewards" category, naming the book and linking to merged pull requests in it. A nomination is accepted when a maintainer supports it and no maintainer objects within 7 days. A steward who has been inactive for 6 months is thanked and moved to emeritus, and can return at any time.

### Becoming a maintainer

Maintainers are chosen from active stewards. The owner proposes a new maintainer in Discussions, and the nomination is accepted when no maintainer objects within 14 days.

## How decisions are made

- **Everyday changes** happen in pull requests. A change is merged when it passes CI, its author has confirmed they read it in full and stand behind it, and a code owner of the touched files approves it. A maintainer merges.
- **Bigger changes**, such as a new book, a change to a template or the visual language, or a new tool for contributors, start as a proposal in GitHub Discussions, in the "Proposals" category. A proposal stays open for at least 7 days and is accepted by lazy consensus: when no steward or maintainer raises an unresolved objection. If consensus fails, the maintainers decide by majority, and the owner breaks ties.
- **Deletions** of chapters, terms or other content need the owner's approval. Chapter ids are permanent; when one has to change, the old id goes into `data/aliases.json` so that old links keep working.

## Changing the rulebook

A change to the rulebook starts as a proposal in Discussions and stays open for at least 14 days. It is accepted when the owner and a majority of maintainers approve it. Rule 10 cannot be weakened: content published under CC BY-SA 4.0 stays under it.

## Releases

Contributors do not bump version numbers, because then every pull request would edit the same files. Maintainers tag releases instead. A release bumps the version in `data/meta.json` (minor for new content, patch for fixes), adds one entry to `data/changelog.json` with the date, the chapters changed since the last release and a one-line summary, and is published with `git tag vX.Y.Z`. Chapters record their own review date in `reviewed`, which the author of each review updates.

## Content tiers (planned)

Today, **merged means reviewed**: every merged page was approved by a code owner. As the community grows, pages will carry one of three tiers:

| Tier | Meaning |
|---|---|
| Draft | Merged and readable, but not yet checked by anyone besides the author and one reviewer. |
| Reviewed | Checked against its sources by a steward of its book. |
| Canon | Confirmed by a quorum of independent reviewers. The quorum starts at 3 and grows with the community, capped at 50. |

The exact rules for tiers will be decided through a proposal once there are enough stewards to make them meaningful.

## Conduct and security

Everyone in the project follows the [code of conduct](CODE_OF_CONDUCT.md). Security problems are reported privately, as described in [SECURITY.md](SECURITY.md).
