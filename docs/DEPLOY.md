# Deploying the site

Ground Truth Wiki is a static site on Cloudflare Pages, deployed by GitHub Actions. There is no server of our own.

## What gets built

`npm run build:site` writes `dist/site/`:

| Path | What it is |
|---|---|
| `index.html` | The full interactive app |
| `<chapter-id>/index.html` | One page per chapter: its own title, a summary from its TL;DR, a canonical URL, link-preview tags, and the chapter text pre-rendered for search engines. It loads the same engine and content as the app, so readers get the interactive chapter. |
| `404.html` | The app again: it resolves old ids and shows "no such page" for the rest |
| `legal/impressum/`, `legal/privacy/`, `contributors/`, `wanted/` | Static pages: the legal pages from `content/legal/`, the contributors from the git history, and the wanted pages from `data/wanted.json` |
| `assets/` | Content, engine, styles and font CSS, named by content hash |
| `vendor/` | Self-hosted libraries and fonts, named by version, with their licenses |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` | For search engines and language models |
| `ground-truth.html` | The whole site in one file that works offline |
| `og.png` | The link-preview image |
| `_headers`, `_redirects` | Cloudflare Pages configuration: a strict Content Security Policy (nothing from other servers), long caching for hashed files, and permanent redirects for old chapter ids |

The output depends only on the commit, so the same commit always builds the same files. Credits come from the full git history, which every workflow fetches.

## The workflows

| Workflow | When | What |
|---|---|---|
| `deploy.yml` | Every push to `main` | Validates, builds with contributors' GitHub handles, and deploys to production |
| `preview.yml` | After CI succeeds on a pull request | Deploys the site CI built (an artifact) as a preview at `pr-<number>.<project>.pages.dev` and comments the link. It never checks out or runs contributor code, removes host configuration files (`_worker.js`, `_routes.json`, `_redirects`, `_headers`) before deploying, and checks that the pull request is at the commit CI built. |
| `release.yml` | A tag `v*`, such as `v3.0.0` | Builds the offline and CDN single files and publishes a GitHub release with the changelog entry of that version |

Until Cloudflare is set up, `deploy.yml` and `preview.yml` finish with a notice and deploy nothing.

## One-time setup

You need a free Cloudflare account. Everything else is done once, in this order.

1. **Sign in with Wrangler**, Cloudflare's command-line tool, and approve in the browser:
   ```sh
   npx wrangler@4.158.0 login
   ```
2. **Create the Pages project** (a maintainer's agent can do this after step 1):
   ```sh
   npx wrangler@4.158.0 pages project create ground-truth-wiki --production-branch main --force
   ```
   `--force` is needed once: as of November 2026, Wrangler creates new projects on Cloudflare Workers unless it is given, and this site's workflows deploy to Cloudflare Pages. Cloudflare derives the address from the project name, here `ground-truth-wiki.pages.dev`; if that name is taken, it adds a suffix. Note the address.
3. **Store the account id** as a repository variable (not a secret; it is not sensitive):
   ```sh
   npx wrangler@4.158.0 whoami          # shows the Account ID
   gh variable set CLOUDFLARE_ACCOUNT_ID --body "<account id>"
   ```
4. **Create an API token** with the least access that works:
   1. Open [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) and click **Create Token**.
   2. Next to **Create Custom Token**, click **Get started**.
   3. Token name: `ground-truth GitHub Actions`.
   4. Permissions: **Account**, **Cloudflare Pages**, **Edit**. Nothing else.
   5. Account Resources: **Include**, and your account.
   6. Click **Continue to summary**, then **Create Token**, and copy the token. Cloudflare shows it only once.
5. **Store the token as a repository secret.** Run this, then paste the token when asked. It never appears on screen or in any file:
   ```sh
   gh secret set CLOUDFLARE_API_TOKEN
   ```
6. **Set the site address** in `site.config.json` (`siteUrl`), here `https://ground-truth-wiki.pages.dev`, and merge that change. Canonical URLs, the sitemap and link previews use it.

The next push to `main` deploys the site.

## Search engines

Every chapter page carries a canonical URL, a description from its TL;DR, link-preview tags and structured data (schema.org `TechArticle` and `BreadcrumbList`); the home page carries `WebSite`. `sitemap.xml` lists every page with its last change, and `robots.txt` points to it.

To see how the site does in search and to ask for indexing:

1. **Google Search Console:** open [search.google.com/search-console](https://search.google.com/search-console), add a property of type **URL prefix** with the site address, and choose the **HTML tag** method. Copy only the `content` value of the tag into `site.config.json`:
   ```json
   "verification": { "google": "<content value>" }
   ```
   Merge that change, wait for the deploy, then click **Verify**. Under **Sitemaps**, submit `sitemap.xml`.
2. **Bing Webmaster Tools:** at [bing.com/webmasters](https://www.bing.com/webmasters), import the site from Google Search Console, or add it and use the meta tag method with `"bing": "<content value>"` in the same `verification` object. Bing's index also feeds other search engines and several AI assistants.

The tokens are not secret; they only prove that whoever controls the site added them.

## A custom domain later

1. In the Cloudflare dashboard: **Workers & Pages**, the `ground-truth-wiki` project, **Custom domains**, **Set up a custom domain**, and enter the domain, such as `groundtruth.example.org`. If the domain's DNS is not on Cloudflare, Cloudflare shows the one CNAME record to add at your DNS provider. HTTPS certificates are issued automatically.
2. Change `siteUrl` in `site.config.json` to the new address and merge it.
3. Optional: in the project's settings, keep the `pages.dev` address from being indexed by search engines by redirecting it to the custom domain (Cloudflare Bulk Redirects), so there is one canonical address.

## When something goes wrong

- **The deploy job only prints a notice:** the secret or the variable is missing. Check with `gh secret list` and `gh variable list`.
- **"Authentication error":** the API token is missing the Cloudflare Pages Edit permission, or it was created for another account.
- **No preview comment:** the preview runs only after CI succeeds. Look at the "Preview" workflow run of the pull request.
- **Credits show names instead of handles:** that happens only in local and preview builds; production builds look up GitHub handles.
