"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm, Resolver } from "react-hook-form";

type FormValues = {
  email: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors: any = {};

  if (!values.email) {
    errors.email = {
      type: "required",
      message: "Kötelező megadni az e-mail címet"
    };
  } else if (!emailRegex.test(values.email)) {
    errors.email = {
      type: "pattern",
      message: "Érvénytelen e-mail formátum"
    };
  }

  return {
    // Always return the values as they are, even if there are errors
    values: Object.keys(errors).length > 0 ? {} : values,
    errors: errors,
  };
};

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver });

  const onSubmit = async ({ email }: FormValues) => {
    const res = await fetch("https://unshrewish-mason-navigational.ngrok-free.dev/auth/login/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      alert("Failed to send OTP");
      return;
    }
  };

  return (
    <div className="container flex items-center justify-center mx-auto h-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Bejelentkezés</CardTitle>
          <CardDescription>Add meg az E-mail címed a bejelentkezéshez</CardDescription>
          <CardAction>
            <Button variant="link">
              <Link href="/createaccount" className="opacity-50">Fiók létrehozása</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="grid gap-2 pb-6">
              <Label>Email</Label>
              <Input placeholder="jdoe@gmail.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full">Login</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default memo(LoginPage);
