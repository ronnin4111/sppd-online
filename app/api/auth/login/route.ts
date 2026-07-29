import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "../../../auth";

export async function POST(request: Request) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !passwordHash) {
    return NextResponse.json(
      { error: "Konfigurasi akun admin belum lengkap." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: unknown;
    password?: unknown;
  };
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const valid =
    email === configuredEmail && (await bcrypt.compare(password, passwordHash));

  if (!valid) {
    return NextResponse.json(
      { error: "Email atau kata sandi tidak sesuai." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(configuredEmail), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
