// app/utils/auth.server.ts
import { getSession, commitSession } from "~/utils/session.server";
import { redirect } from "@remix-run/node";
// Au lieu de `import jwtDecode from "jwt-decode";`
import { jwtDecode } from "jwt-decode";

export async function requireUserToken(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  let token = session.get("accessToken");

  if (!token) {
    throw redirect("/login");
  }

  try {
    const decoded: any = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      // accessToken expiré → essayer refresh
      const refreshToken = session.get("refreshToken");
      if (!refreshToken) throw redirect("/login");

      const res = await fetch(`${process.env.NEST_API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw redirect("/login");

      const data = await res.json();
      token = data.accessToken;

      // Sauvegarde nouveau token
      session.set("accessToken", token);

      return {
        token,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      };
    }

    return { token, headers: {} };
  } catch (err) {
    console.error("Erreur JWT:", err);
    throw redirect("/login");
  }
}
