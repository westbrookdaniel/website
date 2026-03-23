# Website for [Me](https://westbrookdaniel.com/)

## Deployment

This repo commits the generated static site in [`_site/`](/Users/dan/dev/website/_site).

Before pushing changes that affect the site:

1. Run `bun run build`.
2. Commit both the source changes and the regenerated [`_site/`](/Users/dan/dev/website/_site) output together.

For Cloudflare Pages, deploy the committed [`_site/`](/Users/dan/dev/website/_site) directory directly instead of rebuilding in CI. Per Cloudflare's Pages docs, projects that do not need a build should use build command `exit 0` and the appropriate output directory. Source: [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).
