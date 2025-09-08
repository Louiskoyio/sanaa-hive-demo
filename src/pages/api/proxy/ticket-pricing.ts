// pages/api/proxy/ticket-pricing.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "node:stream";

export const config = {
  api: { bodyParser: false }, // allow raw stream for flexibility
};

const DJANGO = process.env.DJANGO_API_BASE!; // e.g. http://localhost:8000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const access = req.cookies["accessToken"];
  if (!access) return res.status(401).json({ error: "Not authenticated" });

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${access}`,
      // Forward content type only if present (JSON in this route)
      ...(req.headers["content-type"] ? { "Content-Type": String(req.headers["content-type"]) } : {}),
    };

    const dj = await fetch(`${DJANGO}/api/ticket-pricing/`, {
      method: "POST",
      headers,
      body: req as any,
      // @ts-expect-error undici requires duplex for streaming bodies
      duplex: "half",
    });

    const ct = dj.headers.get("content-type");
    if (ct) res.setHeader("content-type", ct);

    if (dj.body) {
      
      const nodeStream = Readable.fromWeb(dj.body as any);
      res.status(dj.status);
      nodeStream.pipe(res);
      return;
    }
    const buf = Buffer.from(await dj.arrayBuffer());
    res.status(dj.status).send(buf);
  } catch (err) {
    console.error("Proxy /api/proxy/ticket-pricing error:", err);
    return res.status(500).json({ error: "Proxy error" });
  }
}
