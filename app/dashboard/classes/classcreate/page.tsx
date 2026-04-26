"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getServerApi } from "@/lib/api";
import z from "zod";

const formSchema = z.object({
  className: z.string().min(1, "Kötelező mező"),
  classNumber: z.number().min(1, "Kötelező mező"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateClass() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { className: "", classNumber: "" as any },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const api = await getServerApi();

      await api.classesPost({
        createClassRequest: {
          name: values.className,
          classNumber: values.classNumber,
        },
      });

      router.push("/dashboard/classes/classlist");
      router.refresh();
    } catch (error: any) {
      console.error(
        "kurva anyád",
        error,
      );
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-white p-6">
      <main className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-[#262626] p-8 rounded-lg">
          <h1 className="text-xl font-bold mb-6 text-center">
            Osztály létrehozása
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 uppercase">
                Osztály neve
              </label>
              <input
                {...register("className")}
                className="w-full bg-[#111] border  border-[#262626] p-3 text-sm focus:border-orange outline-none"
                placeholder="Pl. 10.B"
                disabled={isLoading}
              />
              {errors.className && (
                <p className="text-red-500 text-[10px]">
                  {errors.className.message}
                </p>
              )}
              <label className="text-[11px] text-gray-400 uppercase">
                Évfolyam
              </label>
              <input
                type="number"
                {...register("classNumber", { valueAsNumber: true })}
                className="w-full bg-[#111] border  border-[#262626] p-3 text-sm focus:border-orange outline-none"
                placeholder="Pl. 10"
                disabled={isLoading}
              />
              {errors.classNumber && (
                <p className="text-red-500 text-[10px]">
                  {errors.classNumber.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-400 text-black py-3 text-sm font-bold hover:opacity-80 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Létrehozás..." : "LÉTREHOZÁS"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
