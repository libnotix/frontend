"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

export function DolgozatMetaFields() {
   const { control, formState } = useFormContext();

   return (
      <div className="flex flex-col gap-1 mb-8 w-full">
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
         {formState.errors.title?.message ? (
            <p className="text-sm text-destructive text-center">{String(formState.errors.title.message)}</p>
         ) : null}
      </div>
   );
}
