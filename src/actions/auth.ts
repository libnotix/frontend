"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ACCESS_TOKEN_COOKIE = "tnrsgd_accessToken";
const REFRESH_TOKEN_COOKIE = "tnrsgd_refreshToken";

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function deleteAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAuthCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  return { accessToken, refreshToken };
}

export async function refreshTokenAction() {
  const { refreshToken } = await getAuthCookies();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    
    if (data.accessToken && data.refreshToken) {
        await setAuthCookies(data.accessToken, data.refreshToken);
        return data.accessToken;
    }
  } catch (error) {
    console.error("RefreshTokenAction Error:", error);
  }

  return null;
}

export async function logout() {
  await deleteAuthCookies();
  redirect("/auth/login");
}
