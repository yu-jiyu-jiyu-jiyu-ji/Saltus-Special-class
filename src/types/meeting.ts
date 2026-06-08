export type HomeworkItem = {
  id: string;
  text: string;
  completed: boolean;
};

export function parseHomeworkItems(value: unknown): HomeworkItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is HomeworkItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as HomeworkItem).id === "string" &&
        typeof (item as HomeworkItem).text === "string" &&
        typeof (item as HomeworkItem).completed === "boolean",
    )
    .map((item) => ({
      id: item.id,
      text: item.text.trim(),
      completed: item.completed,
    }))
    .filter((item) => item.text.length > 0);
}

export function createHomeworkItem(text: string): HomeworkItem {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
  };
}
