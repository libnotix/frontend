export const draftKeys = {
  all: ["drafts"] as const,
  byId: (draftId: string) => [...draftKeys.all, "detail", draftId] as const,
};

