"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Class = {
  id: string
  name: string
  median: number
}

export default function ClassList() {
    const router = useRouter()
//mocks
  const classes: Class[] = [
    { id: "1", name: "12.A", median: 4.32 },
    { id: "2", name: "11.B", median: 3.45 },
    { id: "3", name: "10.C", median: 2.76 },
  ]

  const getMedianStyles = (median: number) => {
    if (median < 3) return "text-red-600 bg-red-600/10"
    if (median < 4) return "text-yellow-600 bg-yellow-600/10"
    return "text-green-600 bg-green-600/10"
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          
          <div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {classes.map((cls) => {
              const medianStyles = getMedianStyles(cls.median)
              return (
                <Card
                  key={cls.id}
                  className="border border-border shadow-none rounded-xl transition hover:border-primary/40 overflow-hidden"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold tracking-tight">
                        {cls.name}
                      </h3>
                      <div className={`px-2.5 py-0.5 rounded-md text-sm font-bold ${medianStyles}`}>
                        {cls.median.toFixed(2)}
                      </div>
                    </div>

                    <div className="space-y-3">
                     ide jon valami szoveg
                    </div>

                    <Button
                      variant="secondary"
                      className="w-full rounded-lg font-medium"
                      onClick={() => router.push(`/classes/${cls.id}`)}
                    >
                      Megnyitás
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card 
            className="mx-auto cursor-pointer flex items-center justify-center border border-solid border-border/60 bg-muted/30 shadow-none rounded-xl max-w-[300] max-h-[80] transition hover:border-primary/40 ">
            <Link href={"/dashboard/classes/classcreate"} className="w-full h-full">
            <CardContent className="flex items-center justify-center py-6">
              <div className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                <span className="text-xl leading-none">+</span>
                Új osztály létrehozása
              </div>
            </CardContent>
            </Link>
          </Card>

        </div>
      </main>
    </div>
  )
}
