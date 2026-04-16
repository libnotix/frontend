export const AVAILABLE_TASK_TYPES = [
   { id: "item-1", text: "Feleletválasztós" },
   { id: "item-2", text: "Igaz/Hamis" },
   { id: "item-3", text: "Rövid válasz" },
   { id: "item-4", text: "Párosítás" },
   { id: "item-5", text: "Hosszú válasz" },
] as const;

export function taskTypeLabel(typeId: string): string | undefined {
   return AVAILABLE_TASK_TYPES.find((item) => item.id === typeId)?.text;
}
