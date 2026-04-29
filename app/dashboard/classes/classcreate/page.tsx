"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { getServerApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { createClassSchema, type CreateClassInputs } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CreateClassPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const pageActiveRef = useRef(true);
  useEffect(() => {
    pageActiveRef.current = true;
    return () => {
      pageActiveRef.current = false;
    };
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateClassInputs>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      className: "",
      classNumber: undefined as unknown as number,
    },
  });

  const onSubmit = async (values: CreateClassInputs) => {
    const routeAtStart = pathnameRef.current;
    setSubmitting(true);
    try {
      const api = await getServerApi();
      await api.classesPost({
        createClassRequest: {
          name: values.className,
          classNumber: values.classNumber,
        },
      });
      if (pageActiveRef.current && pathnameRef.current === routeAtStart) {
        toast.success("Az osztály létrejött.");
        router.push("/dashboard/classes");
        router.refresh();
      }
    } catch (error) {
      console.error("Create class failed", error);
      if (pageActiveRef.current && pathnameRef.current === routeAtStart) {
        toast.error(await getApiErrorMessage(error, "Nem sikerült létrehozni az osztályt."));
      }
    } finally {
      if (pageActiveRef.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <Button variant="ghost" size="sm" className="w-fit gap-2 rounded-full px-0 text-muted-foreground" asChild>
          <Link href="/dashboard/classes">
            <ArrowLeft className="size-4" />
            Vissza az osztályokhoz
          </Link>
        </Button>

        <Card className="border border-border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Új osztály</CardTitle>
            <CardDescription>
              Add meg a megjelenített nevet és az évfolyamot. Később bármikor módosíthatod a részleteket.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <FieldGroup>
                <Field data-invalid={!!errors.className}>
                  <FieldLabel htmlFor="className">Osztály neve</FieldLabel>
                  <FieldContent>
                    <Input
                      id="className"
                      autoComplete="off"
                      placeholder="Pl. 10.B"
                      disabled={submitting}
                      aria-invalid={!!errors.className}
                      {...register("className")}
                    />
                    <FieldError errors={[errors.className]} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!errors.classNumber}>
                  <FieldLabel htmlFor="classNumber">Évfolyam</FieldLabel>
                  <FieldDescription>1-től 20-ig (pl. tizedik évfolyam: 10).</FieldDescription>
                  <FieldContent>
                    <Controller
                      name="classNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="classNumber"
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={20}
                          placeholder="Pl. 10"
                          disabled={submitting}
                          aria-invalid={!!errors.classNumber}
                          value={field.value === undefined || Number.isNaN(field.value) ? "" : field.value}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") {
                              field.onChange(undefined);
                              return;
                            }
                            const n = Number(v);
                            field.onChange(Number.isNaN(n) ? undefined : n);
                          }}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    <FieldError errors={[errors.classNumber]} />
                  </FieldContent>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner className="size-4" />
                    Létrehozás…
                  </span>
                ) : (
                  "Osztály létrehozása"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
