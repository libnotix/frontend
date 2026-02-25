"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  className: z.string().min(1, "Kötelező mező"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateClass() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      className: "",
      description: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // 2. Send the request to the /classes endpoint (standard naming)
    const response = await fetch(`${baseUrl}/classes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Most backends need the token. Since this is a Client Component, 
        // standard fetch will usually send cookies automatically if 
        // the backend is on the same domain, or you might need:
        // "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Hiba a mentés során");
    }

    router.push("/dashboard/classes/classlist");
    router.refresh();
  } catch (error) {
    console.error("Submission error:", error);
    alert("Nem sikerült létrehozni az osztályt.");
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-background text-white">


      <main className="flex-1 flex justify-center items-center p-6">
        <Card className="w-full max-w-md bg-[#0a0a0a] border border-[#262626] rounded-none shadow-none">
          <CardContent className="p-8">
            <div className="mb-8">
              <h1 className="text-lg font-bold text-white tracking-tight">Osztály létrehozása</h1>
              <p className="text-[12px] text-gray-500 mt-1 italic">Töltsd ki az alábbi adatokat</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="className" className="text-[11px] font-medium text-gray-400 ml-1">
                  Osztály neve
                </Label>
                <Input
                  id="className"
                  placeholder="Pl. 12.A"
                  className={`bg-[#1c1c1c] border-[#262626] rounded-none text-sm text-white focus-visible:ring-1 focus-visible:ring-gray-500 transition-all ${errors.className ? "border-red-600" : ""}`}
                  {...register("className")}
                />
                {errors.className && (
                  <p className="text-red-500 text-[10px] font-medium ml-1 italic">
                    {errors.className.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[11px] font-medium text-gray-400 ml-1">
                  Leírás (opcionális)
                </Label>
                <Input
                  id="description"
                  placeholder="szoveg"
                  className="bg-[#1c1c1c] border-[#262626] rounded-none text-sm text-white focus-visible:ring-1 focus-visible:ring-gray-500 transition-all"
                  {...register("description")}
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="submit"
                  className="w-full bg-orange-400 text-black hover:bg-orange-500 rounded-none py-2 text-[12px] font-bold transition-colors"
                >
                  Létrehozás
                </Button>
                <Link
                  href="/dashboard/classes/classlist"
                  className="w-full bg-[#1c1c1c] text-white py-2 rounded-none text-[12px] font-medium text-center hover:bg-[#262626] transition-colors"
                >
                  Mégse
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

