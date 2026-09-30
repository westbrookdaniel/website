# Website for [Me](https://westbrookdaniel.com/)

## Deployment

This repo commits the generated static site in [`_site/`](/Users/dan/dev/website/_site).

Before pushing changes that affect the site:

1. Run `bun run build`.
2. Commit both the source changes and the regenerated [`_site/`](/Users/dan/dev/website/_site) output together.

For Cloudflare Pages, deploy the committed [`_site/`](/Users/dan/dev/website/_site) directory directly instead of rebuilding in CI. Per Cloudflare's Pages docs, projects that do not need a build should use build command `exit 0` and the appropriate output directory. Source: [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

## Justice typography

The site bundles [`@kitlangton/justice`](https://justice.kitlangton.com/) for progressive paragraph justification in blog-post bodies only. The normal generated HTML stays intact for search engines and readers without JavaScript; nothing is sent to an external typesetting service.

- Only plain-text paragraphs and list items inside the blog-post body (`main .prose`) are eligible. Short/single-line content stays native.
- Justice currently supports horizontal, space-delimited, single-font LTR text. Paragraphs containing links, emphasis, inline code, images or explicit line breaks keep their original native rendering; home, blog index, post descriptions/metadata, playground, headings, navigation, code blocks, blockquotes and standalone games are unchanged.
- The adapter waits for fonts, remeasures on resize/font changes, and restores source before HTMX history snapshots. Unsupported scripts, nonbreaking spaces, tiny measures, unbreakable overflow and measurement failures fall back to normal wrapping. Add `data-justice-skip` to a block or ancestor to opt out.
- Rendering adds inline line wrappers around the exact original text, without hidden duplicate content or generated hyphens. Native selection remains available, and print output uses native wrapping.

Run `bun test tests/justice.test.ts` for source-preservation and fallback checks, `node --test tests/cards.test.js` for existing game tests, and `bun run build` to regenerate the committed output. Browser checks should include a plain-text article, mixed-markup article, narrow/wide resizing, selection/copy, font loading, and HTMX navigation with Back/Forward.
