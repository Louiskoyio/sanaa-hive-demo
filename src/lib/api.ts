export async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const doFetch = async () => {
    const res = await fetch(input, { credentials: "same-origin", ...init });
    if (!res.ok) throw Object.assign(new Error("HTTP " + res.status), { res });
    return res;
  };

  try {
    return await doFetch();
  } catch (err: any) {
    const status = err?.res?.status;
    if (status !== 401) throw err;

    // try refresh
    const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" });
    if (!r.ok) {
      // refresh failed, bubble up 401
      throw err;
    }

    // retry once
    return await doFetch();
  }
}
