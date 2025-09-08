// pages/api/me/profile/avatar.ts
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: false }, // important: allow streaming multipart body
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH" && req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", "PATCH, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const DJ = (process.env.DJANGO_API_BASE || process.env.NEXT_PUBLIC_DJANGO_API_BASE || "").replace(/\/+$/, "");
  if (!DJ) {
    return res.status(500).json({ error: "Server misconfigured: DJANGO_API_BASE (or NEXT_PUBLIC_DJANGO_API_BASE) is not set" });
  }

  // Must match your Django avatar endpoint (e.g., MeCreativeAvatarView)
  const upstreamUrl = `${DJ}/api/me/creative-profile/avatar/`;

  try {
    // Build headers to forward
    const headers: Record<string, string> = {};
    const ct = req.headers["content-type"];
    if (ct) headers["content-type"] = Array.isArray(ct) ? ct[0] : ct;
    const cl = req.headers["content-length"];
    if (cl) headers["content-length"] = Array.isArray(cl) ? cl[0] : cl;

    // Forward auth/cookies
    const auth = req.headers["authorization"];
    if (auth) headers["authorization"] = Array.isArray(auth) ? auth[0] : auth;
    const cookie = req.headers["cookie"];
    if (cookie) headers["cookie"] = Array.isArray(cookie) ? cookie.join("; ") : cookie;

    headers["accept"] = "application/json, text/plain, */*";

    const init: RequestInit & { duplex?: "half" } = {
      method: req.method,
      headers,
      // Stream the raw body to Django (DELETE has no body)
      body: req.method === "DELETE" ? undefined : (req as any),
      // Node 18+ streaming uploads require this flag:
      duplex: "half",
    };

    const upstream = await fetch(upstreamUrl, init);

    // Propagate Set-Cookie if Django sends any
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) res.setHeader("set-cookie", setCookie);

    const upstreamCT = upstream.headers.get("content-type") || "";
    const status = upstream.status;

    if (upstreamCT.includes("application/json")) {
      const data = await upstream.json().catch(() => ({}));
      return res.status(status).json(data);
    } else {
      const text = await upstream.text().catch(() => "");
      return res.status(status).send(text);
    }
  } catch (err: any) {
    console.error("Avatar proxy error:", err);
    return res.status(502).json({ error: "Avatar proxy failed", detail: String(err?.message || err) });
  }
}
