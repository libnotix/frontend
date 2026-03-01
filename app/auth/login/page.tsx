"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginStartSchema,
  loginEndSchema,
  LoginStartInputs,
  LoginEndInputs,
} from "@/lib/schemas";
import { useLoginStart, useLoginEnd } from "@/hooks/useAuth";
import { setAuthCookies } from "@/actions/auth";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ArrowRight, Mail } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<"start" | "end">("start");
  const [email, setEmail] = useState("");

  const loginStartMutation = useLoginStart();
  const loginEndMutation = useLoginEnd();

  const {
    register: registerStart,
    handleSubmit: handleSubmitStart,
    formState: { errors: errorsStart },
  } = useForm<LoginStartInputs>({
    resolver: zodResolver(loginStartSchema),
  });

  const {
    handleSubmit: handleSubmitEnd,
    formState: { errors: errorsEnd },
    setValue,
  } = useForm<LoginEndInputs>({
    resolver: zodResolver(loginEndSchema),
  });

  const onStartSubmit = async (data: LoginStartInputs) => {
    try {
      await loginStartMutation.mutateAsync(data);
      setEmail(data.email);
      setValue("email", data.email);
      setStep("end");
      toast.success("Kód elküldve!");
    } catch (error) {
      console.error(error);
      toast.error("Hiba történt a kód küldése közben.");
    }
  };

  const onEndSubmit = async (data: LoginEndInputs) => {
    try {
      const response = await loginEndMutation.mutateAsync(data);
      console.log("Login success:", response);

      if (response.accessToken && response.refreshToken) {
        await setAuthCookies(response.accessToken, response.refreshToken);
        toast.success("Sikeres bejelentkezés!");
        router.push("/");
      } else {
        toast.error("Hiba: Nem érkezett token.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Hiba történt a bejelentkezés közben.");
    }
  };

  return (
    <AuthLayout
      title="Bejelentkezés"
      description={
        step === "start"
          ? "Add meg az E-mail címed a bejelentkezéshez"
          : `Írd be az e-mailben kapott kódot (${email})`
      }
    >
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          {step === "start" ? (
            <form
              onSubmit={handleSubmitStart(onStartSubmit)}
              autoComplete="off"
              className="space-y-4 animate-fade-in"
            >
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Input
                    placeholder="jdoe@gmail.com"
                    className="pl-10"
                    {...registerStart("email")}
                  />
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <Mail />
                  </div>
                </div>
                {errorsStart.email && (
                  <p className="text-xs text-red-500 font-medium animate-pulse">
                    {errorsStart.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
                disabled={loginStartMutation.isPending}
              >
                {loginStartMutation.isPending ? (
                  <LoadingSpinner />
                ) : (
                  "Kód küldése"
                )}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleSubmitEnd(onEndSubmit)}
              className="space-y-6 animate-fade-in-right"
            >
              <div className="space-y-2 flex flex-col items-center">
                <Label className="mb-2">Kód</Label>
                <InputOTP
                  maxLength={6}
                  onChange={(value) => setValue("otp", value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {errorsEnd.otp && (
                  <p className="text-xs text-red-500 font-medium animate-pulse text-center">
                    {errorsEnd.otp.message}
                  </p>
                )}
                {errorsEnd.email && (
                  <p className="text-xs text-red-500 font-medium text-center">
                    Email hiba: {errorsEnd.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
                  disabled={loginEndMutation.isPending}
                >
                  {loginEndMutation.isPending ? (
                    <LoadingSpinner />
                  ) : (
                    <span className="flex items-center gap-2">
                      Belépés <ArrowRight />
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setStep("start")}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Vissza
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        {step === "start" && (
          <CardFooter className="justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              Nincs még fiókod?{" "}
              <Link
                href="/auth/register"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Regisztráció
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </AuthLayout>
  );
};

export default memo(LoginPage);
