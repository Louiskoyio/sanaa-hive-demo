// pages/api/me/profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

const DJANGO = process.env.DJANGO_API_BASE!; // e.g. "http://127.0.0.1:8000"

// Let multipart stream through unchanged when needed
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || "");
  const access = cookies[ACCESS_TOKEN_COOKIE];
  if (!access) return res.status(401).json({ error: "Not authenticated" });

  const upstream = `${DJANGO}/api/me/creative-profile/`;
  const baseHeaders: Record<string, string> = { Authorization: `Bearer ${access}` };

  try {
    if (req.method === "GET") {
      const r = await fetch(upstream, {
        method: "GET",
        headers: { ...baseHeaders, "Cache-Control": "no-cache" },
      });
      const ct = r.headers.get("content-type") || "application/json";
      res.status(r.status).setHeader("content-type", ct);
      const buf = Buffer.from(await r.arrayBuffer());
      return res.end(buf);
    }

    if (req.method === "PATCH") {
      // If the client set content-type to JSON, forward JSON; otherwise forward raw stream (multipart)
      const incomingCT = (req.headers["content-type"] || "").toString().toLowerCase();
      const isJson = incomingCT.includes("application/json");

      const r = await fetch(upstream, {
        method: "PATCH",
        headers: isJson ? { ...baseHeaders, "Content-Type": "application/json" } : baseHeaders,
        body: isJson ? (await getRawBody(req)) : (req as any),
        // @ts-ignore duplex is required when streaming a body on Node/undici
        duplex: isJson ? undefined : "half",
      });

      const ct = r.headers.get("content-type") || "application/json";
      res.status(r.status).setHeader("content-type", ct);
      const buf = Buffer.from(await r.arrayBuffer());
      return res.end(buf);
    }

    res.setHeader("Allow", "GET,PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("proxy /api/me/profile error:", e);
    return res.status(502).json({ error: "Proxy error" });
  }
}

// Read raw body when content-type is JSON (since bodyParser is disabled)
function getRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
