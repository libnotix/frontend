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

const CreateAccount = () => {
  return (
    <div className="container flex items-center justify-center mx-auto h-full rounded-[1rem]">
      <Card className="w-full max-w-sm rounded-[1rem]">
        <CardHeader>
          <CardTitle>Regisztráció</CardTitle>
          <CardDescription>Hozz létre egy új fiókot!</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="lastName">Vezetéknév</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Minta"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstName">Keresztnév</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="János"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="minta@gmail.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Felhasználónév</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="MintaJanos"
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            <Link href="/login">Regisztráció</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default memo(CreateAccount);
