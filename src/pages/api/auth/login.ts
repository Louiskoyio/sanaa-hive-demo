// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

const DJANGO = process.env.DJANGO_API_BASE!; // e.g. http://127.0.0.1:8000
const PROD = process.env.NODE_ENV === "production";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const cookieBase = { httpOnly: true, sameSite: "lax" as const, path: "/" };
const maxAge = { access: 60 * 20, refresh: 60 * 60 * 24 * 7 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password, remember } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    // Our custom SimpleJWT view now accepts email (via 'username' field)
    const dj = await fetch(`${DJANGO}/api/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await dj.json().catch(() => ({} as any));

    if (!dj.ok || !data?.access || !data?.refresh) {
      return res.status(dj.status || 401).json({ error: data?.detail || "Invalid credentials" });
    }

    // If you want "remember me" to shorten/extend the refresh lifetime locally:
    const refreshAge = remember ? maxAge.refresh : 60 * 60 * 24 * 2; // e.g. 2 days when unchecked

    res.setHeader("Set-Cookie", [
      serialize(ACCESS_TOKEN_COOKIE, data.access, {
        ...cookieBase, maxAge: maxAge.access, secure: PROD,
      }),
      serialize(REFRESH_TOKEN_COOKIE, data.refresh, {
        ...cookieBase, maxAge: refreshAge, secure: PROD,
      }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Login API error" });
  }
}
