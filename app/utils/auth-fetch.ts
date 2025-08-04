export async function authFetch(url: string, options: RequestInit = {}) {
  if (typeof window === "undefined") {
    throw new Error("authFetch doit être appelé côté client uniquement");
  }

  const access_token = localStorage.getItem("access_token") || "";

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${access_token}`,
  };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) {
      window.location.href = "/login";
      return res;
    }

    const refreshRes = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      headers.Authorization = `Bearer ${data.access_token}`;
      res = await fetch(url, { ...options, headers });
    } else {
      window.location.href = "/login";
    }
  }

  return res;
}
