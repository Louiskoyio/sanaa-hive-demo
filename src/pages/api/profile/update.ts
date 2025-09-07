// pages/api/me/profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

const DJANGO = process.env.DJANGO_API_BASE!; // e.g. http://127.0.0.1:8000

export const config = { api: { bodyParser: false } }; // we forward FormData stream

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!["GET", "PATCH"].includes(req.method || "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const access = cookies[ACCESS_TOKEN_COOKIE];
  if (!access) return res.status(401).json({ error: "Not authenticated" });

  // Forward raw stream for multipart; or empty body for GET
  const headers: Record<string, string> = {
    Authorization: `Bearer ${access}`,
  };
  // DO NOT set Content-Type here; node will keep the multipart boundary from the incoming request

  try {
    const dj = await fetch(`${DJANGO}/api/me/creative-profile/`, {
      method: req.method,
      headers: headers as any,
      body: req.method === "PATCH" ? (req as any) : undefined, // stream through
      // @ts-ignore duplex is required by Undici when streaming a body
      duplex: req.method === "PATCH" ? "half" : undefined,
    });

    const ct = dj.headers.get("content-type") || "application/json";
    res.status(dj.status);
    res.setHeader("content-type", ct);
    const buf = Buffer.from(await dj.arrayBuffer());
    res.end(buf);
  } catch (e) {
    console.error("proxy /api/me/profile error:", e);
    res.status(502).json({ error: "Proxy error" });
  }
}
