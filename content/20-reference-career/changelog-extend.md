---
id: changelog-extend
book: 20
order: "20.10"
title: Changelog and how to extend
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [changelog, extending]
visuals:
  - update-stepper:stepper
  - extend-tree:tree
---
> [!tldr]
> Every version of Ground Truth is recorded with the chapters it changed. Extending it follows fixed rules: chapter ids are permanent, updates never delete content, deepened chapters replace their seed bodies, and every update bumps the version, adds a changelog entry and updates review dates. Full instructions live on the [Extend me](#extend-me) page.

## Why it matters
A reference meant to last for years needs a disciplined way to grow and stay current. Clear rules keep links stable, content trustworthy and history visible.

## Intuition
The changelog is a ship’s log: every change dated and described, so anyone can see how the vessel got here.

## Changelog
```widget
changelog
```

## How it works
```viz
{"id":"update-stepper","component":"stepper","title":"How an update is made and checked","caption":"The process every version follows.","alt":"Stepper of the update process: plan, write, validate, test, record and publish.","data":"illustrative","frames":[
{"label":"Plan","caption":"Choose chapters to add or deepen, in the documented order, or respond to a request."},
{"label":"Write","caption":"Replace seed bodies with full chapters, with visuals, quizzes, glossary terms and links."},
{"label":"Validate","caption":"Check structure, links, visual specs, calculator tests, quiz ids and inbound links."},
{"label":"Test","caption":"Load every route in a headless browser and check for errors."},
{"label":"Record","caption":"Bump the version, add a changelog entry and update review dates."},
{"label":"Publish","caption":"Publish to the same artifact so links and progress keep working."}]}
```

```viz
{"id":"extend-tree","component":"tree","title":"Ways to extend Ground Truth","caption":"Expand each kind of request. The Extend me page has the exact formats.","alt":"Tree of ways to extend Ground Truth: continue, deepen, add, refresh and fix.","data":"illustrative","open":1,"root":{"label":"Extension requests","children":[
{"label":"Continue","children":[{"label":"Work through the next planned improvements in order"}]},
{"label":"Deepen a chapter","children":[{"label":"Expand a chapter with more depth, visuals or questions"}]},
{"label":"Add a topic","children":[{"label":"A new chapter, term, timeline event or tool, inserted without renumbering"}]},
{"label":"Refresh","children":[{"label":"Re-check volatile chapters against current sources and update dates","link":"#sota-snapshot"}]},
{"label":"Fix","children":[{"label":"Correct an error; the fix is recorded in the changelog"}]}]}}
```

**Rules.** Ids are permanent and renamed ids map through aliases; inserted chapters take decimal positions; content is not deleted; volatile chapters carry review dates.

## In practice
- Check [What’s new](#whats-new) after each version.
- Report errors with the chapter id and the claim; fixes appear in the changelog.

## Numbers to know
> [!number]
> Fact: every version is listed with its date and chapters; volatile chapters show their review dates.

## Pitfalls and anti-patterns
> [!pitfall] Editing a published chapter without recording it
> Unrecorded changes make the history untrustworthy.

## Talk like an expert
Experts treat documentation like software: versioned, tested and changelogged. The debate is how often a living reference should be refreshed versus kept stable.

> [!hottake] A reference without a changelog cannot be trusted.
> **The counterargument:** for evergreen material, frequent changes add noise; stability can be as valuable as currency.

## Check yourself
```quiz
changelog-extend
```

## Go deeper
- The [Extend me](#extend-me) page for formats and schema.

## Related
- [What’s new](#whats-new)
- [Glossary](#lexicon-guide)
- [How to use Ground Truth](#how-to-use)
- [Learning paths and the project ladder](#project-ladder)
- [Watchlist](#watchlist)
