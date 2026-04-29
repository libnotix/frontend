"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getServerApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { addStudentSchema, type AddStudentInputs } from "@/lib/schemas";
import type { ClassesPost201Response } from "@/api";
import type { Student } from "@/api/models";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserCircleIcon, Mail01Icon } from "@hugeicons/core-free-icons";

async function fetchClassDetail(classId: number): Promise<{
  classData: ClassesPost201Response;
  students: Student[];
}> {
  const api = await getServerApi();
  const [classRes, studentsRes] = await Promise.all([
    api.classesIdGet({ id: classId }),
    api.classesIdStudentsGet({ id: classId }),
  ]);
  return {
    classData: classRes,
    students: studentsRes.students ?? [],
  };
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = typeof params.id === "string" ? Number(params.id) : NaN;

  const [classData, setClassData] = useState<ClassesPost201Response | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<Pick<Student, "id" | "firstName" | "lastName"> | null>(
    null,
  );
  const [removingStudent, setRemovingStudent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddStudentInputs>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!Number.isFinite(classId)) return;

    let cancelled = false;
    void (async () => {
      setLoadError(null);
      try {
        const data = await fetchClassDetail(classId);
        if (cancelled) return;
        setClassData(data.classData);
        setStudents(data.students);
      } catch (error) {
        console.error("Failed to load class:", error);
        const msg = await getApiErrorMessage(error, "Nem sikerült betölteni az osztályt.");
        if (!cancelled) setLoadError(msg);
        toast.error(msg);
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 401
        ) {
          router.push("/auth/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [classId, router]);

  useEffect(() => {
    if (!dialogOpen) {
      reset({ firstName: "", lastName: "", email: "" });
    }
  }, [dialogOpen, reset]);

  const displayName = classData?._class?.name ?? "Osztály";

  const onAddStudent = async (values: AddStudentInputs) => {
    if (!Number.isFinite(classId)) return;
    try {
      const api = await getServerApi();
      await api.classesIdStudentsPost({
        id: classId,
        createStudentRequest: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email === "" ? undefined : values.email,
        },
      });
      toast.success("Diák hozzáadva.");
      setDialogOpen(false);
      try {
        const data = await fetchClassDetail(classId);
        setClassData(data.classData);
        setStudents(data.students);
        setLoadError(null);
      } catch (error) {
        console.error("Failed to refresh class:", error);
        toast.error(await getApiErrorMessage(error, "Nem sikerült frissíteni az osztály adatait."));
      }
    } catch (error) {
      console.error("Failed to add student:", error);
      toast.error(await getApiErrorMessage(error, "Nem sikerült hozzáadni a diákot."));
    }
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove?.id || !Number.isFinite(classId)) return;
    setRemovingStudent(true);
    try {
      const api = await getServerApi();
      await api.classesIdStudentsStudentIdDelete({
        id: classId,
        studentId: studentToRemove.id,
      });
      setStudents((prev) => prev.filter((s) => s.id !== studentToRemove.id));
      toast.success("Diák eltávolítva az osztályból.");
      setStudentToRemove(null);
    } catch (error) {
      console.error("Failed to remove student:", error);
      toast.error(await getApiErrorMessage(error, "Nem sikerült eltávolítani a diákot."));
    } finally {
      setRemovingStudent(false);
    }
  };

  if (!Number.isFinite(classId)) {
    return (
      <div className="p-6">
        <p className="text-destructive text-sm">Érvénytelen osztályazonosító.</p>
        <Button asChild variant="link" className="mt-2 px-0">
          <Link href="/dashboard/classes">Vissza</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        <LoadingSpinner className="size-8 text-primary" />
        <p className="text-sm">Betöltés…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="w-fit gap-2 rounded-full px-0 text-muted-foreground" asChild>
              <Link href="/dashboard/classes">
                <ArrowLeft className="size-4" />
                Összes osztály
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{displayName}</h1>
              {loadError ? (
                <p className="mt-2 text-sm text-destructive">{loadError}</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Diákok kezelése ·{" "}
                  {students.length === 1 ? "1 diák" : `${students.length} diák`}
                </p>
              )}
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" className="rounded-full shrink-0">
                  Diák hozzáadása
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onAddStudent)} noValidate>
                  <DialogHeader>
                    <DialogTitle>Új diák</DialogTitle>
                    <DialogDescription>
                      Vezeték- és keresztnevük kötelező. Az e-mail opcionális, ha szeretnél értesítést vagy megosztást.
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="gap-5 py-4">
                    <Field data-invalid={!!errors.lastName}>
                      <FieldLabel htmlFor="student-lastName">Vezetéknév</FieldLabel>
                      <FieldContent>
                        <Input
                          id="student-lastName"
                          autoComplete="family-name"
                          placeholder="Pl. Kovács"
                          aria-invalid={!!errors.lastName}
                          {...register("lastName")}
                        />
                        <FieldError errors={[errors.lastName]} />
                      </FieldContent>
                    </Field>
                    <Field data-invalid={!!errors.firstName}>
                      <FieldLabel htmlFor="student-firstName">Keresztnév</FieldLabel>
                      <FieldContent>
                        <Input
                          id="student-firstName"
                          autoComplete="given-name"
                          placeholder="Pl. János"
                          aria-invalid={!!errors.firstName}
                          {...register("firstName")}
                        />
                        <FieldError errors={[errors.firstName]} />
                      </FieldContent>
                    </Field>
                    <Field data-invalid={!!errors.email}>
                      <FieldLabel htmlFor="student-email">E-mail</FieldLabel>
                      <FieldDescription>Opcionális.</FieldDescription>
                      <FieldContent>
                        <Input
                          id="student-email"
                          type="email"
                          autoComplete="email"
                          placeholder="kovacs.janos@pelda.hu"
                          aria-invalid={!!errors.email}
                          {...register("email")}
                        />
                        <FieldError errors={[errors.email]} />
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="rounded-full">
                        Mégse
                      </Button>
                    </DialogClose>
                    <Button type="submit" className="rounded-full">
                      Mentés
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.length > 0 ? (
            students.map((student) => (
              <Card
                key={student.id}
                className="relative border border-border bg-card/50 shadow-sm transition-colors hover:bg-card/80"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 size-9 rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  onClick={() =>
                    student.id != null &&
                    setStudentToRemove({
                      id: student.id,
                      firstName: student.firstName ?? "",
                      lastName: student.lastName ?? "",
                    })
                  }
                  aria-label={`Diák eltávolítása: ${student.lastName} ${student.firstName}`}
                >
                  <Trash2 className="size-4" />
                </Button>
                <CardContent className="p-5 pt-12">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <HugeiconsIcon icon={UserCircleIcon} size={26} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold">
                        {student.lastName} {student.firstName}
                      </p>
                      {student.email && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <HugeiconsIcon icon={Mail01Icon} size={14} className="shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-primary/30 bg-muted/20 px-8 py-14 text-center">
              <p className="font-medium text-foreground">Még nincsenek diákok</p>
              <p className="mt-2 text-sm text-muted-foreground">Adj hozzá diákot a gombbal.</p>
              <Button
                type="button"
                className="mt-6 rounded-full"
                onClick={() => setDialogOpen(true)}
              >
                Első diák hozzáadása
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={studentToRemove != null}
        onOpenChange={(open) => !open && !removingStudent && setStudentToRemove(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan eltávolítod ezt a diákot?</AlertDialogTitle>
            <AlertDialogDescription>
              {studentToRemove ? (
                <>
                  <strong className="text-foreground">
                    {studentToRemove.lastName} {studentToRemove.firstName}
                  </strong>{" "}
                  {
                    "törlődik az osztály névsorából. A diák profilja nem kerül automatikusan végleges törlésre — csak az osztályhoz rendelés szűnik meg."
                  }
                </>
              ) : (
                "Ez a művelet nem vonható vissza."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingStudent}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                void confirmRemoveStudent();
              }}
              disabled={removingStudent}
            >
              {removingStudent ? "Eltávolítás…" : "Eltávolítás"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
