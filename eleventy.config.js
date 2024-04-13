const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "./public/": "/public/",
    "./node_modules/prism-themes/themes/prism-gruvbox-dark.css":
      "/public/prism.css",
  });

  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });

  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addFilter("shortenAndSortByDate", (posts) => {
    posts = posts.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    return posts.slice(0, 3);
  });

  eleventyConfig.addFilter("sortByDate", (posts) => {
    return posts.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addFilter("format", (date) => {
    return new Intl.DateTimeFormat("en-au", { dateStyle: "medium" }).format(
      new Date(date),
    );
  });

  return {
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: false,
    dir: {
      input: "src",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
  };
};
