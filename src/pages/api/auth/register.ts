// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: false } }; // keep raw stream
const DJANGO = process.env.DJANGO_API_BASE!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const headers: Record<string, string> = {};
    if (req.headers["content-type"]) headers["content-type"] = String(req.headers["content-type"]);
    if (req.headers.cookie) headers["cookie"] = String(req.headers.cookie);

    const dj = await fetch(`${DJANGO}/api/creatives/register/`, {
      method: "POST",
      headers,
      body: req as any,          // stream the multipart body through
      // @ts-expect-error: undici option for streaming bodies
      duplex: "half",
    });

    const contentType = dj.headers.get("content-type") || "application/json";
    res.status(dj.status);
    res.setHeader("content-type", contentType);
    const buf = Buffer.from(await dj.arrayBuffer());
    res.end(buf);
  } catch (e) {
    console.error("Proxy register error", e);
    res.status(502).json({ error: "Proxy error" });
  }
}
