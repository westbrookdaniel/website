import { PostLayout } from "../../components/layouts/post";
import { PostData } from "../lib/types";
import { marked } from "marked";

export default function PostPage(post: PostData) {
  // Convert markdown to HTML
  const content = marked(post.content);
  
  return PostLayout(
    { title: post.data.title },
    content,
    post
  );
}