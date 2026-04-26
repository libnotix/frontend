"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DolgozatMetaFieldsProps = {
   onSave: () => void;
   onDelete?: () => void;
   isSaving: boolean;
   saveStatusMessage: string | null;
};

export function DolgozatMetaFields({ onSave, onDelete, isSaving, saveStatusMessage }: DolgozatMetaFieldsProps) {
   const { control, formState } = useFormContext();

   return (
      <div className="flex flex-col gap-2 mb-8 w-full">
         <Controller
            name="title"
            control={control}
            render={({ field }) => (
               <Input
                  {...field}
                  className="font-semibold py-6 pl-2 border-none shadow-none px-0 focus-visible:ring-0 bg-transparent w-full text-center"
                  placeholder="Új Dolgozat"
                  style={{ fontSize: "24px" }}
               />
            )}
         />
         <div className="flex flex-wrap items-start justify-center gap-4">
            <div className="flex flex-col items-center gap-1 min-w-[8rem]">
               <Button type="button" onClick={onSave} disabled={isSaving}>
                  {isSaving ? "Mentés..." : "Mentés"}
               </Button>
               {saveStatusMessage ? (
                  <p className="text-xs text-muted-foreground text-center max-w-md">{saveStatusMessage}</p>
               ) : null}
            </div>
            {onDelete ? (
               <Button type="button" variant="destructive" onClick={onDelete} disabled={isSaving}>
                  Törlés
               </Button>
            ) : null}
         </div>
         {formState.errors.title?.message ? (
            <p className="text-sm text-destructive text-center">{String(formState.errors.title.message)}</p>
         ) : null}
      </div>
   );
}
