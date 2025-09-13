export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-au", { dateStyle: "medium" }).format(
    new Date(date),
  );
}

export function readingTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
