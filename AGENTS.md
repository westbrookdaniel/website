# Repository Instructions

- Treat [`_site/`](/Users/dan/dev/website/_site) as a committed deployment artifact. Do not ignore it.
- Before committing or pushing any change that affects the site, run `bun run build`.
- After building, include the updated [`_site/`](/Users/dan/dev/website/_site) files in the same commit as the source changes.
- Do not commit local-only directories such as `.tmp/`, `.bunx-cache/`, or `node_modules/`.
- This repository is intended to deploy the committed [`_site/`](/Users/dan/dev/website/_site) output directly. Cloudflare Pages should be configured with build command `exit 0` and build output directory `_site`.
