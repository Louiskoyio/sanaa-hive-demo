export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

export const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export function cookieMaxAgeSeconds(mins: number) { return mins * 60; }
export function days(n: number) { return n * 24 * 60 * 60; }
