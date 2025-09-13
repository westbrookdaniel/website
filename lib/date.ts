export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-au", { dateStyle: "medium" }).format(
    new Date(date),
  );
}
