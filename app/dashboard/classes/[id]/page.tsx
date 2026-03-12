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

export default function ClassWomb() {
  const params = useParams();
  const classId = params.id;
  const className = params.name;

  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const loadData = async () => {
      try {
        const api = await getServerApi();
        const data = await api.classesIdGet({ id: Number(classId) });
        console.log("API Response:", data); //feladom https://cdn.discordapp.com/attachments/904747047511527464/1481430143988662332/image.png?ex=69b348d5&is=69b1f755&hm=0ad0d782730d2f6c01a258283de3c70f3f948270e62e86b4bcc4b7ee0f1ea54b
        setClassData(data);
      } catch (error) {
        console.error("Hiba az adatok betöltésekor:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      loadData();
      console.log(classId);

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
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
                variant="outline">Diák hozzáadása</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm ml-2">
              <DialogHeader>
                <DialogTitle>Diák hozzáadása</DialogTitle>
                <DialogDescription>
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <Label htmlFor="name-1">Name</Label>
                  <Input id="name-1" name="name" placeholder="diák neve" />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Mégsem</Button>
                </DialogClose>
                <Button type="submit">Mentés</Button>
              </DialogFooter>
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

      <div className="grid gap-6">
        <div className="border border-[#262626] bg-[#0a0a0a] p-20 rounded-xl text-center">
          <p className="text-gray-500">
            Még nincsenek diákok
          </p>
        </div>
      </div>
    </div>
  );
}
