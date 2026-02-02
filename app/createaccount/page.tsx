
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
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};

const CreateAccount = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await handleRegister(data);
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (data: Inputs) => {
    const response = await fetch(
      "https://unshrewish-mason-navigational.ngrok-free.dev/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    console.log(response);
  };

  return (
    <div className="container flex items-center justify-center mx-auto h-full rounded-[1rem]">
      <Card className="w-full max-w-sm rounded-[1rem]">
        <CardHeader>
          <CardTitle>Regisztráció</CardTitle>
          <CardDescription>Hozz létre egy új fiókot!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="lastName">Vezetéknév</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Minta"
                  {...register("lastName")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstName">Keresztnév</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="János"
                  {...register("firstName")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="minta@gmail.com"
                  {...register("email")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Felhasználónév</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="MintaJanos"
                  {...register("username")}
                />
              </div>
              <div className="gap-2 mt-5">
                <Button type="submit" className="w-full">
                  Regisztráció
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(CreateAccount);
