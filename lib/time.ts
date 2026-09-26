export function formatDate(date: string) {
  const value = new Date(date);
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(value);
  return `${value.getUTCDate()} ${month} ${value.getUTCFullYear()}`;
}

export function readingTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
