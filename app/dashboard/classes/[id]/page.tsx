"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getServerApi } from "@/lib/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Student } from "@/api/models"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon, Mail01Icon } from "@hugeicons/core-free-icons"

export default function ClassWomb() {
  const params = useParams();
  const classId = params.id;
  const className = params.name;

  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({ firstName: "", lastName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      const api = await getServerApi();
      const [classRes, studentsRes] = await Promise.all([
        api.classesIdGet({ id: Number(classId) }),
        api.classesIdStudentsGet({ id: Number(classId) })
      ]);
      console.log("Class API Response:", classRes);
      console.log("Students API Response:", studentsRes);
      setClassData(classRes);
      setStudents(studentsRes.students || []);
    } catch (error) {
      console.error("Hiba az adatok betöltésekor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.firstName || !newStudent.lastName) {
      alert("Az ütő- és vezetéknevedet meg kell adnod!");
      return;
    }

    setIsSubmitting(true);
    try {
      const api = await getServerApi();
      await api.classesIdStudentsPost({
        id: Number(classId),
        createStudentRequest: {
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          email: newStudent.email || undefined,
        },
      });

      alert("Diák sikeresen hozzáadva!");
      setIsDialogOpen(false);
      setNewStudent({ firstName: "", lastName: "", email: "" });
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Hiba a diák hozzáadásakor:", error);
      alert("Hiba történt a diák hozzáadása során.");
    } finally {
      setIsSubmitting(false);
    }
  };



  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  if (loading) {
    return <div className="p-10 text-white animate-pulse">Betöltés...</div>;
  }
  return (
    <div className="p-10 text-white">
      <div className="flex flex-1 justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight border-2 border p-1 rounded-[10px] solid border-orange-500 ">
            {classData?._class?.name || "Valami nem jo"}
          </h1>
        </div>

        <div className="m-auto flex">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                Diák hozzáadása
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm ml-2">
              <form onSubmit={handleAddStudent}>
                <DialogHeader>
                  <DialogTitle>Diák hozzáadása</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vezetéknév</Label>
                    <Input
                      id="lastName"
                      placeholder="Pl. Kovács"
                      value={newStudent.lastName}
                      onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Keresztnév</Label>
                    <Input
                      id="firstName"
                      placeholder="Pl. János"
                      value={newStudent.firstName}
                      onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcionális)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="kovacs.janos@pelda.hu"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">Mégsem</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-black">
                    {isSubmitting ? "Mentés..." : "Mentés"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <div className="ml-2">
            <Button asChild className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-black font-bold">
              <label htmlFor="picture">
                Névsor feltöltése
              </label>
            </Button>
            <Input id="picture" type="file" className="hidden" />
          </div>
        </div>

      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {students.length > 0 ? (
          students.map((student) => (
            <Card key={student.id} className="border-none shadow-lg bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                    <HugeiconsIcon icon={UserCircleIcon} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold truncate">
                      {student.lastName} {student.firstName}
                    </p>
                    {student.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <HugeiconsIcon icon={Mail01Icon} size={14} />
                        <p className="truncate">{student.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full border border-[#262626] bg-[#0a0a0a] p-20 rounded-xl text-center">
            <p className="text-gray-500">
              Még nincsenek diákok
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
