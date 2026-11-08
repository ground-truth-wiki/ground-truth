# Design

The design brief for Ground Truth Wiki, from section 8 of the editorial masterprompt (`source/editorial-masterprompt.md`), and how the engine implements it today. Visuals follow their own guide, [VISUAL_LANGUAGE.md](VISUAL_LANGUAGE.md).

## The brief

- **Subject:** the craft of AI engineering. The visual language comes from its own materials: tokens, attention maps, embedding spaces, agent graphs, traces, and the rigor of a well-made reference book.
- **Audience and job:** an ambitious engineer who reads for hours and looks things up in seconds. Long-form comfort and instant lookup come first.
- **Personality:** a serious reference with a playful streak. The playfulness lives in the hero, the fun layer (XP, levels, badges, one easter egg) and the writing, never in the way of reading. (The original brief kept a light "Bible" flavor in the feature names; Ground Truth Wiki uses neutral names: Glossary, Timeline, Cheat sheets, Debates.)
- **Boldness in one place:** the home hero is the memorable moment. It is a live toy language model: the site name split into tokens with their attention weights, and a temperature slider that makes the model write the tagline one token at a time. Everything else stays quiet and disciplined.
- **Typography:** one or two clearly distinct families, a clear type scale, body lines under about 75 characters, generous line height, excellent code type.
- **Color:** light and dark themes of equal quality, plus one accent color and icon per book, used consistently in navigation, headers and cards.
- **Avoid generic looks:** cream paper with a serif and a clay accent, near-black with one acid accent, identical rounded cards with soft shadows, and all-caps labels above every heading.
- **Layout:** three columns on desktop (navigation, chapter, on this page) and one column with drawers on mobile.
- **Quality floor:** keyboard navigation, visible focus, proper roles for the tree and dialogs, AA contrast, respect for reduced motion, and motion only where it answers an action.

## As implemented

All values live as CSS variables in [engine/styles.css](../engine/styles.css). Change them there, never inline.

### Type

| Use | Family | Fallbacks |
|---|---|---|
| Interface, headings | Bricolage Grotesque (variable, optical sizes) | Segoe UI, system-ui, Helvetica Neue, Arial |
| Body text | Literata (variable, optical sizes, with italics) | Iowan Old Style, Palatino, Georgia |
| Code | JetBrains Mono (400 and 600) | SFMono-Regular, Menlo, Consolas |

The fonts are self-hosted (SIL Open Font License); see `scripts/lib/vendor.mjs`. Body text is 16 px Literata with a line height of 1.7, the interface is set at 15 px, and chapter titles at about 37 px on a desktop. The body measure is `--measure: 68ch`, and readers can change text size and line width in Preferences.

### Color

| Token | Light | Dark |
|---|---|---|
| `--paper` (reading surface) | `#FFFFFF` | `#11151D` |
| `--bg` (navigation and fields) | `#F6F7F9` | `#11151D` |
| `--surface` | `#FFFFFF` | `#171C26` |
| `--ink` | `#14171D` | `#E8EBF1` |
| `--ink-2` | `#394049` | `#C5CBD6` |
| `--link` | `oklch(46% .16 262)` | `oklch(79% .11 262)` |
| `--acc` | `oklch(47% .15 var(--acc-h))` | `oklch(80% .11 var(--acc-h))` |

The light theme is the default, whatever the system setting. Readers can switch to dark with the theme button, or choose dark or "Match the system" in Preferences; both themes are complete, not an inverted afterthought.

**Book accents.** Each book has a hue in `data/books.json` (`hue`, from 0 to 360). Book pages and chapters set `--acc-h` to it, so the accent, its background and its line color all follow from one number. The 21 hues are spread around the color wheel so neighbouring books differ. A new book picks a hue that is not close to its neighbours'.

**Role colors** for visuals are separate from book accents; see [VISUAL_LANGUAGE.md](VISUAL_LANGUAGE.md#one-visual-language).

### Shape and space

Radii are `--r-sm: 6px`, `--r-md: 10px` and `--r-lg: 14px`. The header is `--top: 56px` tall. The style is flat: thin lines (`--line`, `--line-2`) instead of shadows.

### Layout and breakpoints

Three columns from 1,200 px: navigation (272 px, on `--bg`), the chapter on the white reading surface, and on this page (236 px). Below that, "On this page" becomes a drawer, and below 900 px the navigation does too. Further breakpoints at 760, 700, 640 and 420 px tune tables, the hero and the search palette. Print styles (`@media print`) give clean chapter and cheat-sheet printouts.

### Chapter pages and navigation

A chapter opens with its breadcrumbs, its book and number, the title, one quiet line of facts (level, reading time, stability, review date, status, tags) and one tool strip between hairlines. Deep dives, the chapters with a three-part number such as 2.3.1, are indented and set smaller in the navigation, and book maps leave them out and list them below, so the main path through a book stays visible.

These rules are the design layer at the end of `engine/styles.css`, marked `gt: reading layout`; they override the original rules above them.

### Brand

The mark is a faceted compass arrow. In the header it is an inline SVG whose four facets use `--mark-1` to `--mark-4`, so it works in both themes. The favicon is a 48 px PNG embedded in `engine/shell.html` and `engine/static.html`; `docs/assets/apple-touch-icon.png` (180 px) and `docs/assets/icon-512.png` hold the same icon for devices and other uses.

### Icons

Interface icons (`ic-*`) and visual glyphs (`g-*`) are one inline SVG sprite in [engine/shell.html](../engine/shell.html). Icons are drawn on a 24 px grid with a 1.8 px stroke and round caps, like the glyphs.

## Changing the design

Design changes are engine changes: they go in their own pull request, start as a proposal in Discussions when they are more than a fix, and follow [engine/README.md](../engine/README.md#changing-the-engine). Check every change in both themes, at 360 px and on a desktop, by keyboard and by touch.
