/** Backend lista / részletes válasz eltérő mezőkkel is adhat címet (`title`, `name`, `exam.title`, …). */

export type SavedExamListItem = { id: number; title: string; updatedAt?: string };

function trimNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

function pickExamTitleFromRecord(record: Record<string, unknown>): string | null {
  const nestedExam = record.exam;
  const fromNested =
    nestedExam && typeof nestedExam === "object"
      ? trimNonEmptyString((nestedExam as Record<string, unknown>).title) ??
        trimNonEmptyString((nestedExam as Record<string, unknown>).name)
      : null;

  return (
    trimNonEmptyString(record.title) ??
    trimNonEmptyString(record.name) ??
    trimNonEmptyString(record.examTitle) ??
    trimNonEmptyString(record.exam_title) ??
    fromNested
  );
}

export function pickExamTitleFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const fromData =
    p.data && typeof p.data === "object" ? pickExamTitleFromRecord(p.data as Record<string, unknown>) : null;
  return pickExamTitleFromRecord(p) ?? fromData;
}

export function parseSavedExamsList(data: unknown): SavedExamListItem[] {
  if (!data || typeof data !== "object") return [];
  const root = data as Record<string, unknown>;
  const raw = root.exams ?? root.items ?? root.data ?? (Array.isArray(data) ? data : null);
  if (!Array.isArray(raw)) return [];
  const rows = raw
    .map((item): SavedExamListItem | null => {
      if (!item || typeof item !== "object") return null;
      const e = item as Record<string, unknown>;
      const id = typeof e.id === "number" ? e.id : Number(e.id);
      if (!Number.isFinite(id) || id <= 0) return null;
      const title = pickExamTitleFromRecord(e) ?? `Dolgozat #${id}`;
      const updatedAt =
        typeof e.updatedAt === "string"
          ? e.updatedAt
          : typeof e.updated_at === "string"
            ? e.updated_at
            : undefined;
      return { id, title, updatedAt };
    })
    .filter((x): x is SavedExamListItem => x !== null);

  return rows.sort((a, b) => {
    const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
    const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
    return tb - ta;
  });
}
