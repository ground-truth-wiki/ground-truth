# Repository settings

Every GitHub setting of `ground-truth-wiki/ground-truth` that the project relies on, and why. Settings applied with the GitHub CLI show the command, so they can be checked or reapplied.

## Applied

| Setting | Value | Why | How |
|---|---|---|---|
| Description | "An open, community-reviewed course, reference and playground for AI engineering, written and reviewed in public." | The one sentence people see in search results and on the repository page | `gh repo edit --description "…"` |
| Topics | ai, ai-engineering, llm, agents, rag, mcp, evals, wiki, knowledge-base, open-source, education | Helps people find the project | `gh repo edit --add-topic …` |
| Discussions | on | Questions, ideas, proposals and steward nominations live there (GOVERNANCE.md) | `gh repo edit --enable-discussions` |
| Delete head branches after merge | on | Keeps the branch list clean, and lets GitHub retarget stacked pull requests automatically | `gh repo edit --delete-branch-on-merge` |
| Default token permissions for workflows | read | A workflow gets write access only where it asks for it explicitly | `gh api -X PUT repos/{owner}/{repo}/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false` |
| Workflows may approve pull requests | no | Rule 8: AI and automation never approve | same command |
| Labels | 31 project labels | Triage, wanted pages, books, content types | `npm run setup-labels` |
| Code owners | `.github/CODEOWNERS` | Asks the owner (later the book's steward) for a review automatically | file in the repository |
| Issue forms | "Share a playbook", "Report a problem"; blank issues off | Structured reports; everything else goes to Discussions | `.github/ISSUE_TEMPLATE/` |

## At launch (only possible on a public repository)

GitHub offers these only for public repositories. The Launch step applies them right after the repository goes public.

| Setting | Value | Why | How |
|---|---|---|---|
| Private vulnerability reporting | on | Security problems are reported privately (SECURITY.md) | `gh api -X PUT repos/{owner}/{repo}/private-vulnerability-reporting` |
| Approval for workflows from forks | first-time contributors | A maintainer looks at a first-time contributor's pull request before any workflow runs on it | `gh api -X PUT repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval -f approval_policy=first_time_contributors` |
| Branch protection on `main` | pull request required, 1 approval, code owner review, CI passing (the "Validate, round trip and build" and "Pull request description" checks), no force pushes, no deletion | Nothing reaches `main` without review and green checks | `gh api -X PUT repos/{owner}/{repo}/branches/main/protection` (see the Launch checklist) |

## Done by hand

GitHub has no API for these, so a person does them once.

| Setting | Where | What |
|---|---|---|
| Social preview image | Settings, General, Social preview, Edit, Upload an image | Upload `docs/assets/social-preview.png` (1280 x 640). Regenerate it when the counts on it change a lot. |
| Discussion categories | Discussions, the pencil next to Categories, New category | Add **Proposals** (format: open-ended discussion) and **Stewards** (open-ended discussion), which GOVERNANCE.md refers to. |

## Secrets and variables

Secrets are never written in files or chat. The owner stores them with `gh secret set <NAME>` and pastes the value when asked.

| Name | Kind | Used by | Needed for |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | secret | `ai-review.yml` | Optional. Without it, the AI review simply does not run. |
| `CLOUDFLARE_API_TOKEN` | secret | `deploy.yml`, `preview.yml` | Deploying the site (docs/DEPLOY.md) |
| `CLOUDFLARE_ACCOUNT_ID` | variable | `deploy.yml`, `preview.yml` | Deploying the site |

## How the workflows stay safe

Pull requests come from forks, so:

- **`ci.yml`** runs contributor code, and therefore has no secrets and a read-only token.
- **`pr-limits.yml`**, **`claim.yml`** and **`ai-review.yml`** need write access to comment or label, so they never check out or run pull request code. They read metadata through the GitHub API; the AI review reads the diff through the API and its model has no file, shell or web tools.
- **`preview.yml`** (Phase 6) deploys the site that `ci.yml` already built, downloaded as an artifact; it never checks out or runs contributor code.
- **Every action is pinned to a commit SHA**, so a moved tag cannot change what runs.
