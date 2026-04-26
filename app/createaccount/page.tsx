import { memo } from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CreateAccount = () => {
  return (
    <div className='container flex items-center justify-center mx-auto h-full rounded-[1rem]'>
      <Card className="w-full max-w-sm rounded-[1rem]">
        <CardHeader>
          <CardTitle>Bejelentkezés</CardTitle>
          <CardDescription className='opacity-50 w-full'>
                  Add meg az E-mail címed és a jelszavad a fiókod létrehozásához

    </CardDescription>
          <CardAction>
            <Button variant="link">Fiók létrehozása</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Jelszó</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline opacity-50"
                  >
                    Elfelejtett jelszó
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Bejelentkezés
          </Button>
          <Button variant="outline" className="w-full">
            Bejelentkezés Google-al
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default memo(CreateAccount);