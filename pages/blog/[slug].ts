import { PostLayout } from "../../components/layouts/post";
import { marked } from "marked";
import { PostData } from "../../lib/types";

export default function PostPage(post: PostData) {
  // Convert markdown to HTML
  const content = marked(post.content);

  return PostLayout({ title: post.data.title }, content, post);
}

