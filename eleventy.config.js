import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
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

  eleventyConfig.addFilter("readingTime", (content) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
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
}
