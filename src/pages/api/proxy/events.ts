import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "node:stream";

export const config = {
  api: { bodyParser: false }, // forward raw stream (multipart-safe)
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
    const incomingContentType = req.headers["content-type"];
    const incomingLen = req.headers["content-length"];

    // Only forward what we need; do NOT invent a multipart boundary.
    const headers: Record<string, string> = {
      Authorization: `Bearer ${access}`,
      ...(incomingContentType ? { "Content-Type": String(incomingContentType) } : {}),
      ...(incomingLen ? { "Content-Length": String(incomingLen) } : {}),
    };

    // Forward raw request stream (works for JSON and multipart) — NOTE: duplex:'half' is required
    const dj = await fetch(`${DJANGO}/api/events/`, {
      method: "POST",
      headers,
      body: req as any,         // Node IncomingMessage is acceptable
      // @ts-expect-error - undici requires duplex when streaming a request body
      duplex: "half",
    });

    // Mirror content-type if present
    const ct = dj.headers.get("content-type");
    if (ct) res.setHeader("content-type", ct);

    // Stream response back to client if possible
    if (dj.body) {
      
      const nodeStream = Readable.fromWeb(dj.body as any);
      res.status(dj.status);
      nodeStream.pipe(res);
      return;
    }

    // Fallback: buffer
    const buf = Buffer.from(await dj.arrayBuffer());
    res.status(dj.status).send(buf);
  } catch (err) {
    console.error("Proxy /api/proxy/events error:", err);
    return res.status(500).json({ error: "Proxy error" });
  }
}
