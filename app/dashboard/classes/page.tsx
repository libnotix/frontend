"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInputs } from "@/lib/schemas";
import { useRegister } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserCircleIcon,
  Mail01Icon,
  UserAccountIcon,
  Tick01Icon
} from "@hugeicons/core-free-icons";

const CreateAccount = () => {
  const router = useRouter();
  const registerMutation = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success("Sikeres regisztráció!");
      router.push("/auth/login"); // Redirect to login after successful registration
    } catch (err) {
      console.error(err);
      toast.error("Hiba történt a regisztráció közben.");
    }
  };

  return (
    <AuthLayout
      title="Regisztráció"
      description="Hozz létre egy új fiókot!"
      showBack
    >
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vezetéknév</Label>
                <div className="relative">
                  <Input
                    placeholder="Minta"
                    className="pl-10"
                    {...register("lastName")}
                  />
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <HugeiconsIcon icon={UserCircleIcon} size={18} />
                  </div>
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-500 font-medium animate-pulse">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Keresztnév</Label>
                <div className="relative">
                  <Input
                    placeholder="János"
                    className="pl-10"
                    {...register("firstName")}
                  />
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <HugeiconsIcon icon={UserCircleIcon} size={18} />
                  </div>
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-500 font-medium animate-pulse">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="minta@gmail.com"
                  className="pl-10"
                  {...register("email")}
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                </div>
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-medium animate-pulse">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Felhasználónév</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="MintaJanos"
                  className="pl-10"
                  {...register("username")}
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <HugeiconsIcon icon={UserAccountIcon} size={18} />
                </div>
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 font-medium animate-pulse">
                  {errors.username.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 mt-6"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <LoadingSpinner /> : (
                <span className="flex items-center gap-2">
                  Regisztráció <HugeiconsIcon icon={Tick01Icon} size={16} />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            Már van fiókod?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium transition-colors">
              Bejelentkezés
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default memo(CreateAccount);
