// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse, serialize } from "cookie";
import { ACCESS_TOKEN_COOKIE, cookieBase, cookieMaxAgeSeconds } from "@/lib/auth";

const DJANGO = process.env.DJANGO_API_BASE!;
const PROD = process.env.NODE_ENV === "production";

async function fetchMe(access: string) {
  return fetch(`${DJANGO}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || "");
  let access = cookies[ACCESS_TOKEN_COOKIE];

  const tryOnce = async () => {
    if (!access) return null;
    const r = await fetchMe(access);
    if (r.status === 200) return r.json();
    if (r.status === 401) {
      // try refresh
      const rr = await fetch(`${process.env.NEXT_PUBLIC_BASE_ORIGIN}/api/auth/refresh`, { method: "POST", headers: { cookie: req.headers.cookie || "" } });
      if (!rr.ok) return null;
      // read new access from Set-Cookie on this same response? Not available here.
      // So instead re-read after refresh by calling our own endpoint again with updated cookie from client on next request.
      // For immediate response, we can pull access from 'set-cookie' is not possible here. Simpler approach:
      // Call Django again by reading fresh cookie from a temp header is not available.
      // Workaround: Let client re-call /api/me after refresh. For now, return a "refreshed" hint.
      return "__RETRY__";
    }
    return null;
  };

  const result = await tryOnce();
  if (result === "__RETRY__") {
    // Hint client to retry once; also extend access cookie maxAge a bit optimistically if present.
    if (access) {
      res.setHeader("Set-Cookie",
        serialize(ACCESS_TOKEN_COOKIE, access, { ...cookieBase, maxAge: cookieMaxAgeSeconds(10), secure: PROD })
      );
    }
    return res.status(401).json({ authenticated: false, retry: true });
  }

  if (!result) return res.status(401).json({ authenticated: false });
  return res.status(200).json({ authenticated: true, user: result });
}
