import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

const DJANGO = process.env.DJANGO_API_BASE!; // e.g. http://127.0.0.1:8000
const PROD = process.env.NODE_ENV === "production";

// cookie helpers
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const cookieBase = { httpOnly: true, sameSite: "lax" as const, path: "/" };
const maxAge = { access: 60 * 20, refresh: 60 * 60 * 24 * 7 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "Missing username or password" });

    // IMPORTANT: SimpleJWT endpoint, not /api/auth/login/
    const dj = await fetch(`${DJANGO}/api/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await dj.json().catch(() => ({} as any));

    if (!dj.ok || !data?.access || !data?.refresh) {
      // Bubble up Django/DRF error so the UI shows the real reason
      return res.status(dj.status || 401).json({ error: data?.detail || "Invalid credentials" });
    }

    res.setHeader("Set-Cookie", [
      serialize(ACCESS_TOKEN_COOKIE, data.access, {
        ...cookieBase, maxAge: maxAge.access, secure: PROD,
      }),
      serialize(REFRESH_TOKEN_COOKIE, data.refresh, {
        ...cookieBase, maxAge: maxAge.refresh, secure: PROD,
      }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "Login API error" });
  }
}
