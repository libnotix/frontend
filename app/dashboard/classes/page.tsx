"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getServerApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { SchoolClass } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ClassListPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const api = await getServerApi();
        const response = await api.classesGet();
        if (!cancelled) setClasses(response.classes ?? []);
      } catch (error: unknown) {
        console.error("Failed to fetch classes:", error);
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 401
        ) {
          router.push("/auth/login");
          return;
        }
        toast.error(await getApiErrorMessage(error, "Nem sikerült betölteni az osztályokat."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const classToDelete = deleteId != null ? classes.find((c) => c.id === deleteId) : undefined;

  const confirmDelete = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      const api = await getServerApi();
      await api.classesIdDelete({ id: deleteId });
      setClasses((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success("Az osztályt töröltük.");
      setDeleteId(null);
    } catch (error) {
      console.error("Delete class failed:", error);
      toast.error(await getApiErrorMessage(error, "Nem sikerült törölni az osztályt."));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        <LoadingSpinner className="size-8 text-primary" />
        <p className="text-sm">Osztályok betöltése…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <GraduationCap className="size-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Osztályaim</h1>
              <p className="text-sm text-muted-foreground">
                Hozz létre osztályokat, és kezeld a diákokat egy helyen.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 rounded-full">
            <Link href="/dashboard/classes/classcreate">
              <Plus className="mr-2 size-4" />
              Új osztály
            </Link>
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.length > 0 ? (
            classes.map((cls) => (
              <Card
                key={cls.id}
                size="sm"
                className="group gap-0 overflow-hidden border border-border bg-card/40 py-0 shadow-sm transition-colors hover:border-primary/40"
              >
                <CardContent className="flex flex-col gap-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {cls.name}
                      </h2>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {cls.classNumber != null ? `${cls.classNumber}. évfolyam` : "Évfolyam nincs megadva"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      onClick={() => cls.id != null && setDeleteId(cls.id)}
                      aria-label={`Osztály törlése: ${cls.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full rounded-full border border-border bg-background/80 hover:bg-primary/10 hover:text-foreground"
                    onClick={() => cls.id != null && router.push(`/dashboard/classes/${cls.id}`)}
                  >
                    Megnyitás
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/40 bg-muted/20 px-8 py-16 text-center">
              <GraduationCap className="mb-3 size-12 text-muted-foreground" aria-hidden />
              <p className="text-lg font-medium text-foreground">Még nincs osztályod</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Hozz létre egy osztályt, és add hozzá a diákokat az osztály nézetben.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link href="/dashboard/classes/classcreate">Első osztály létrehozása</Link>
              </Button>
            </div>
          )}
        </div>

        {classes.length > 0 && (
          <Link
            href="/dashboard/classes/classcreate"
            className="block rounded-3xl border border-dashed border-primary/50 bg-muted/10 p-8 text-center transition-colors hover:border-primary hover:bg-muted/30"
          >
            <span className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <Plus className="size-4 text-primary" />
              Új osztály létrehozása
            </span>
          </Link>
        )}
      </div>

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && !deleting && setDeleteId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törlöd ezt az osztályt?</AlertDialogTitle>
            <AlertDialogDescription>
              {classToDelete?.name ? (
                <>
                  Az <strong className="text-foreground">{classToDelete.name}</strong> osztály és a hozzá tartozó
                  kapcsolatok eltávolításra kerülnek.{" "}
                  {"Ez a művelet nem vonható vissza."}
                </>
              ) : (
                "Ez a művelet nem vonható vissza."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Törlés…" : "Törlés"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
