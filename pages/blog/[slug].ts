import { PostLayout } from "../../components/layouts/post";
import { PostData } from "../../lib/types";
import { marked } from "marked";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";

const parser = marked.use(
  markedShiki({
    async highlight(code, lang) {
      return await codeToHtml(code, { lang, theme: "gruvbox-dark-medium" });
    },
  }),
);

export default async function PostPage(post: PostData) {
  const content = await parser.parse(post.content);

  return PostLayout({ title: post.data.title }, content, post);
}
