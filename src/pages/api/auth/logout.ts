import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, cookieBase } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Set-Cookie", [
    serialize(ACCESS_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0 }),
    serialize(REFRESH_TOKEN_COOKIE, "", { ...cookieBase, maxAge: 0 }),
  ]);
  return res.status(200).json({ ok: true });
}
