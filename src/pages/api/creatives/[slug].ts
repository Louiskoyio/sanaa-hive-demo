// pages/api/creatives/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";

const DJANGO = (process.env.NEXT_PUBLIC_DJANGO_API_BASE || process.env.DJANGO_API_BASE || "").replace(/\/+$/, "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!DJANGO) return res.status(500).json({ error: "Server missing DJANGO base URL" });
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { slug } = req.query;
  if (!slug || typeof slug !== "string") return res.status(400).json({ error: "Missing slug" });

  try {
    // 👇 hit detail endpoint, not list
    const r = await fetch(`${DJANGO}/api/creatives/${encodeURIComponent(slug)}/`, { cache: "no-store" });
    const ct = r.headers.get("content-type") || "application/json";
    const body = await r.json().catch(() => ({}));

    res.status(r.status).setHeader("content-type", ct);
    return res.end(JSON.stringify(body));
  } catch {
    return res.status(502).json({ error: "Upstream error" });
  }
}
