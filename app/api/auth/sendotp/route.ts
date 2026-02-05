import { NextResponse } from "next/server";

declare global {
  var otpStore: Record<string, { otp: number; expiresAt: number }>;
}

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  const store = globalThis.otpStore || {};
  const record = store[email];

  if (!record) return NextResponse.json({ error: "No OTP found" }, { status: 400 });
  if (Date.now() > record.expiresAt) return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  if (parseInt(otp) !== record.otp) return NextResponse.json({ error: "OTP invalid" }, { status: 400 });

  // delete OTP after use
  delete store[email];

  return NextResponse.json({ success: true });
}