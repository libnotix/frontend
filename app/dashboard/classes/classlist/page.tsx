"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Define the shape of your Class object
type Class = {
  id: string
  name: string
  median: number
}

type FormValues = {
  classes: Class[]
}

export default function ClassList() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const { reset, watch } = useForm<FormValues>({
    defaultValues: { classes: [] }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token")

        const response = await fetch(`https://tanarseged-b.vrolandd.hu/classes`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json"
          }
        })

        if (response.ok) {
          const data = await response.json()

          const classesArray = Array.isArray(data) ? data : data.classes || []
          reset({ classes: classesArray })
        } else if (response.status === 401) {
          console.error("Session expired")
          router.push("/login") 
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [reset, router])

  const classes = watch("classes")

  const getMedianStyles = (median: number) => {
    if (median < 3) return "text-red-600 bg-red-600/10"
    if (median < 4) return "text-yellow-600 bg-yellow-600/10"
    return "text-green-600 bg-green-600/10"
  }

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
              <Card key={cls.id} className="border border-[#262626] bg-[#0a0a0a] shadow-none rounded-xl overflow-hidden hover:border-gray-500 transition-colors">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-white">{cls.name}</h3>
                    <div className={`px-2.5 py-0.5 rounded-md text-sm font-bold ${getMedianStyles(cls.median)}`}>
                      {cls.median ? cls.median.toFixed(2) : "N/A"}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-orange text-black hover:bg-gray-200"
                    onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                  >
                    Megnyitás
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 italic">
              Még nem hoztál létre osztályt.
            </div>
          )}
        </div>

        <Link href="/dashboard/classes/classcreate">
          <Card className="mt-6 cursor-pointer border-dashed border-2 border-[#262626] bg-transparent flex items-center justify-center py-8 hover:bg-white/5 hover:border-white transition-all">
            <span className="text-sm font-medium text-white">+ Új osztály létrehozása</span>
          </Card>
        </Link>
      </div>
    </div>
  )
}