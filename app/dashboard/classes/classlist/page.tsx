"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { getServerApi } from "@/lib/api"

import type { SchoolClass } from "@/api"

type FormValues = {
  classes: SchoolClass[]
}

export default function ClassList() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const { reset, watch, setValue } = useForm<FormValues>({
    defaultValues: { classes: [] }
  })

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("Biztosan törlöd ezt az osztályt?")) return

    try {
      const api = await getServerApi();

      await api.classesIdDelete({ id });

      const updatedClasses = classes.filter((cls) => cls.id !== id);
      setValue("classes", updatedClasses);

      alert("Osztály sikeresen törölve.");
    } catch (error) {
      console.error("Hiba a törlés során:", error);
      alert("Hiba történt a törlés közben.");
    }
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        const api = await getServerApi()
        const response = await api.classesGet()

        const classesArray = response.classes || []
        reset({ classes: classesArray })
      } catch (error: any) {
        console.error("Failed to fetch classes:", error)
        if (error?.response?.status === 401) {
          console.error("Session expired")
          router.push("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [reset, router])
  const classes = watch("classes")

  if (loading) {
    return <div className="min-h-screen bg-background p-6 text-white text-center">Betöltés...</div>
  }


  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Osztályaim</h1>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {classes.length > 0 ? (
            classes.map((cls) => (
              <Card
                key={cls.id}
                className="group relative border border-[#262626] bg-gradient-to-b from-[#111111] to-[#0a0a0a] shadow-lg rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-orange-500/10 transition-all duration-300"
              >
                <Button
                  variant="destructive"
                  className="max-w-[100px] absolute right-0.5 mr-2 z-20 bg-white/5 hover:bg-red-500 hover:text-white text-gray-300 border border-white/10 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => handleDelete(cls.id)}
                >
                  Törlés
                </Button>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">{cls.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Osztály {cls.classNumber ? `(${cls.classNumber}. évf.)` : ''}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full bg-white/5 hover:bg-orange-500 hover:text-white text-gray-300 border border-white/10 transition-all duration-300 rounded-xl"
                    onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                  >
                    Megnyitás
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border-2  border-orange-400 rounded-2xl bg-[#0a0a0a]/50">
              <div className="text-gray-500 text-lg mb-2 font-medium">Nincs még osztályod</div>
              <p className="text-gray-600 text-sm">Hozz létre egyet az alábbi gombbal kezdésként.</p>
            </div>
          )}
        </div>

        <Link href="/dashboard/classes/classcreate">
          <Card className="mt-6 cursor-pointer  border-2 border-orange-400 bg-transparent flex items-center justify-center py-8 hover:bg-white/5 hover:border-white transition-all">
            <span className="text-sm font-medium text-white">+ Új osztály létrehozása</span>
          </Card>
        </Link>
      </div>
    </div>
  )
}