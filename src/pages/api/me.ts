// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse, serialize } from "cookie";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,           // <-- add this import
  cookieBase,
  cookieMaxAgeSeconds,
} from "@/lib/auth";

const DJANGO = process.env.DJANGO_API_BASE!;
const PROD = process.env.NODE_ENV === "production";

const ACCESS_TTL_MIN = 20; // keep in sync with SIMPLE_JWT access lifetime

async function fetchMe(access: string) {
  try {
    return await fetch(`${DJANGO}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
  } catch {
    // e.g. Django restarting / refused
    // fabricate a 503-like response shape to keep logic simple
    return new Response(null, { status: 503 }) as unknown as Response;
  }
}

async function refreshAccess(refresh: string) {
  try {
    const r = await fetch(`${DJANGO}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null as any);
    return (j && j.access) ? String(j.access) : null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || "");
  let access = cookies[ACCESS_TOKEN_COOKIE] || "";
  const refresh = cookies[REFRESH_TOKEN_COOKIE] || "";

  // Try once with current access
  if (access) {
    const r1 = await fetchMe(access);
    if (r1.status === 200) {
      const data = await r1.json();
      return res.status(200).json({ authenticated: true, user: data });
    }
    if (r1.status === 503) {
      return res.status(503).json({ authenticated: false, error: "Upstream unavailable" });
    }
    // if 401, we’ll attempt refresh below
  }

  // If unauthorized and we have a refresh token, refresh server-side and retry once
  if (refresh) {
    const newAccess = await refreshAccess(refresh);
    if (newAccess) {
      // set fresh access cookie for the client
      res.setHeader(
        "Set-Cookie",
        serialize(ACCESS_TOKEN_COOKIE, newAccess, {
          ...cookieBase,
          maxAge: cookieMaxAgeSeconds(ACCESS_TTL_MIN),
          secure: PROD,
        })
      );

      // retry /me with the new token
      const r2 = await fetchMe(newAccess);
      if (r2.status === 200) {
        const data = await r2.json();
        return res.status(200).json({ authenticated: true, user: data });
      }

      if (r2.status === 503) {
        return res.status(503).json({ authenticated: false, error: "Upstream unavailable" });
      }

      // still unauthorized after refresh → clear cookies
      if (r2.status === 401) {
        res.setHeader("Set-Cookie", [
          serialize(ACCESS_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0, secure: PROD }),
          serialize(REFRESH_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0, secure: PROD }),
        ]);
        return res.status(401).json({ authenticated: false, error: "Not authenticated" });
      }
    } else {
      // refresh failed → clear cookies
      res.setHeader("Set-Cookie", [
        serialize(ACCESS_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0, secure: PROD }),
        serialize(REFRESH_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0, secure: PROD }),
      ]);
      return res.status(401).json({ authenticated: false, error: "Session expired" });
    }
  }

  // No access and no refresh (or access failed and no refresh) → unauthenticated
  return res.status(401).json({ authenticated: false });
}
