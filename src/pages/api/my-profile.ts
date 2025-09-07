// pages/api/my-profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

const DJANGO = process.env.DJANGO_API_BASE!; // e.g. http://localhost:8000

async function djGet(path: string, access: string) {
  const url = `${DJANGO}${path}`;
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
    return r;
  } catch {
    return new Response(null, { status: 503 }) as unknown as Response;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const cookies = parse(req.headers.cookie || "");
  const access = cookies[ACCESS_TOKEN_COOKIE];
  if (!access) return res.status(401).json({ error: "Not authenticated" });

  // 1) who am I?
  const meResp = await djGet("/api/auth/me/", access);
  if (meResp.status === 401) return res.status(401).json({ error: "Not authenticated" });
  if (meResp.status === 503) return res.status(503).json({ error: "Upstream unavailable" });
  if (!meResp.ok) return res.status(meResp.status).json({ error: "Failed to fetch user" });

  const me = await meResp.json(); // { id, username, email, is_creator }
  const userId = me?.id;
  if (!userId) return res.status(404).json({ error: "User not found" });

  // 2) fetch the CreativeProfile by PK = userId
  const cpResp = await djGet(`/api/creatives/${userId}/`, access);
  if (cpResp.status === 404) return res.status(404).json({ error: "Creative profile not found", me });
  if (cpResp.status === 503) return res.status(503).json({ error: "Upstream unavailable" });
  if (!cpResp.ok) return res.status(cpResp.status).json({ error: "Failed to fetch creative profile" });

  const creative = await cpResp.json();

  // Merge and return
  return res.status(200).json({
    me,
    creative, // expect: display_name, location, bio, website, avatar_url, verified, tags, ...
  });
}
