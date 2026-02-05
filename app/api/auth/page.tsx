"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyOTP() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");

  const verify = async () => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (res.ok) alert("OTP Verified!");
    else alert("OTP Failed");
  };

  return (
    <div className="container flex flex-col items-center justify-center mx-auto h-full gap-4">
      <h2>Enter OTP sent to {email}</h2>
      <Input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        placeholder="123456"
      />
      <Button onClick={verify}>Verify OTP</Button>
    </div>
  );
}