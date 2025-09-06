// pages/api/auth/refresh.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse, serialize } from "cookie";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  cookieBase,
  cookieMaxAgeSeconds,
} from "@/lib/auth";

const DJANGO = process.env.DJANGO_API_BASE!;
const PROD = process.env.NODE_ENV === "production";

// keep this in one place so it's easy to match Django's SIMPLE_JWT.ACCESS_TOKEN_LIFETIME
const ACCESS_TOKEN_TTL_MIN = 20;       // <-- match your Django 20 minutes
const REFRESH_TOKEN_TTL_DAYS = 7;      // <-- whatever you use in Django (default 1 day or your value)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cookies = parse(req.headers.cookie || "");
  const refresh = cookies[REFRESH_TOKEN_COOKIE];

  if (!refresh) {
    // no refresh -> clear access cookie too
    res.setHeader("Set-Cookie", [
      serialize(ACCESS_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0 }),
      serialize(REFRESH_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0 }),
    ]);
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const dj = await fetch(`${DJANGO}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    const data = await dj.json().catch(() => ({} as any));

    if (!dj.ok || !data?.access) {
      // refresh failed -> clear cookies
      res.setHeader("Set-Cookie", [
        serialize(ACCESS_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0 }),
        serialize(REFRESH_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0 }),
      ]);
      return res.status(401).json({ error: data?.detail || "Refresh failed" });
    }

    const setCookies: string[] = [];

    // Always set new ACCESS token cookie
    setCookies.push(
      serialize(ACCESS_TOKEN_COOKIE, data.access, {
        ...cookieBase,
        maxAge: cookieMaxAgeSeconds(ACCESS_TOKEN_TTL_MIN), // 20 minutes
        secure: PROD,
      })
    );

    // If you enabled SimpleJWT ROTATE_REFRESH_TOKENS=True, Django will return a new `refresh`.
    // If present, update the refresh cookie too.
    if (data.refresh) {
      setCookies.push(
        serialize(REFRESH_TOKEN_COOKIE, data.refresh, {
          ...cookieBase,
          maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
          secure: PROD,
        })
      );
    }

    res.setHeader("Set-Cookie", setCookies);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Refresh error" });
  }
}
