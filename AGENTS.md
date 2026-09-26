# Repository Instructions

- Treat [`_site/`](/Users/dan/dev/website/_site) as a committed deployment artifact. Do not ignore it.
- Before committing or pushing any change that affects the site, run `bun run build`.
- After building, include the updated [`_site/`](/Users/dan/dev/website/_site) files in the same commit as the source changes.
- Do not commit local-only directories such as `.tmp/`, `.bunx-cache/`, or `node_modules/`.
- This repository is intended to deploy the committed [`_site/`](/Users/dan/dev/website/_site) output directly. Cloudflare Pages should be configured with build command `exit 0` and build output directory `_site`.

## Playground games

- Keep each game visually distinct. Do not force every game into the main website's layout or one shared visual style.
- Respect the player's intelligence: remove decorative headings, subtitles, instructional filler, and repeated explanations. Keep only text that helps someone choose a game, understand a rule, or take an action.
- Standalone game pages should not include navigation back to the main website. Keep any navigation inside a multi-game experience focused on its own game selection.
- Design for portrait phones first, with readable controls and clear touch states.
