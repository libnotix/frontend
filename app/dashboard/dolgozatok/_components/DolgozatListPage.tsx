"use client";

import { memo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, FileText, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { parseSavedExamsList, type SavedExamListItem } from "./savedExamsList";

const NEW_EXAM_HREF = "/dashboard/dolgozatok/uj";

function formatUpdatedAt(value: string | undefined): string | null {
  if (!value) return null;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toLocaleString("hu-HU", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function DolgozatListPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exams, setExams] = useState<SavedExamListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const legacyId = searchParams.get("id");
  useEffect(() => {
    if (legacyId && /^\d+$/.test(legacyId)) {
      router.replace(`/dashboard/dolgozatok/${legacyId}`);
    }
  }, [legacyId, router]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await api.examsGetRaw();
      const json = await res.raw.json().catch(() => null);
      setExams(parseSavedExamsList(json));
    } catch {
      setLoadError("Nem sikerült betölteni a dolgozatokat.");
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col overflow-x-hidden">
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-10 pt-8 md:px-6 md:pb-12 md:pt-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Dolgozatok</h1>
              <p className="text-muted-foreground mt-1 max-w-xl text-balance text-sm md:text-base">
                Válassz egy meglévő dolgozatot, vagy hozz létre újat.
              </p>
            </div>
            <Button
              asChild
              size="default"
              className="h-11 shrink-0 gap-1.5 rounded-xl px-5 text-[15px] font-semibold shadow-sm"
            >
              <Link href={NEW_EXAM_HREF}>
                <Plus className="size-4" aria-hidden />
                Új dolgozat
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 md:min-h-[50vh]">
              <Loader2 className="text-primary mb-4 size-12 animate-spin" />
              <p className="text-muted-foreground animate-pulse">Dolgozatok betöltése...</p>
            </div>
          ) : loadError ? (
            <div className="ring-foreground/10 bg-card/75 flex flex-col items-center gap-4 rounded-2xl p-10 text-center ring-1 backdrop-blur-sm">
              <p className="text-destructive text-sm md:text-base">{loadError}</p>
              <Button type="button" variant="secondary" onClick={() => void refresh()}>
                Újra
              </Button>
            </div>
          ) : exams.length === 0 ? (
            <div className="ring-foreground/10 bg-card/50 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/80 p-12 text-center ring-1 backdrop-blur-sm md:p-16">
              <FileText className="text-muted-foreground mb-1 size-10 opacity-60" />
              <p className="text-foreground text-base font-medium">Még nincs mentett dolgozat</p>
              <p className="text-muted-foreground max-w-sm text-sm">
                A „Új dolgozat” gombbal elindíthatsz egyet; a kártyák itt fognak megjelenni.
              </p>
            </div>
          ) : (
            <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {exams.map((exam) => {
                const when = formatUpdatedAt(exam.updatedAt);
                return (
                  <li key={exam.id} className="min-w-0">
                    <Link
                      href={`/dashboard/dolgozatok/${exam.id}`}
                      className="ring-foreground/10 bg-card/75 group flex h-full min-h-[7.5rem] flex-col justify-between gap-3 rounded-2xl p-5 ring-1 backdrop-blur-sm transition-shadow duration-200 hover:border-primary/20 hover:shadow-md border border-border/50"
                    >
                      <div className="min-w-0">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="bg-primary/8 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                            <FileText className="size-4" aria-hidden />
                          </div>
                          <ChevronRight
                            className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </div>
                        <p className="line-clamp-2 font-semibold leading-snug text-foreground">{exam.title}</p>
                        {when ? (
                          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">Utoljára: {when}</p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export const DolgozatListPage = memo(DolgozatListPageInner);
