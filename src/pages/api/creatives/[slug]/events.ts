// pages/api/creatives/[slug]/events.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  if (!slug || Array.isArray(slug)) {
    return res.status(400).json({ error: "Invalid slug" });
  }

  const DJ = (process.env.DJANGO_API_BASE || process.env.NEXT_PUBLIC_DJANGO_API_BASE || "").replace(/\/+$/, "");
  if (!DJ) {
    return res.status(500).json({ error: "Server misconfigured: DJANGO_API_BASE is missing" });
  }

  const upstreamUrl = `${DJ}/api/creatives/${encodeURIComponent(slug)}/events/`;

  try {
    const headers: Record<string, string> = { accept: "application/json" };
    const upstream = await fetch(upstreamUrl, { method: "GET", headers });

    const status = upstream.status;
    const ct = upstream.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await upstream.json().catch(() => ({}));
      return res.status(status).json(data);
    } else {
      const text = await upstream.text().catch(() => "");
      return res.status(status).send(text);
    }
  } catch (err: any) {
    console.error("slug/events proxy error:", err);
    return res.status(502).json({ error: "Events proxy failed", detail: String(err?.message || err) });
  }
}
