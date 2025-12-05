import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { getSession, commitSession } from "~/utils/session.server";

// Loader (optionnel ici, tu peux juste garder pour GET si besoin)
export const loader: LoaderFunction = async ({ request, params }) => {
  return json({ message: "Cette route attend un POST pour se connecter à une boutique" });
};

// Action pour connecter la boutique
export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const storeId = params.storeId;

  if (!storeId) throw new Response("ID de boutique manquant", { status: 400 });

  const apiUrl = `${process.env.NEST_API_URL}/store/${storeId}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return json({ error: "Impossible de récupérer la boutique", details: errorText }, { status: res.status });
    }

    const store = await res.json();
    if (store.status !== "active") {
      return json({ error: "Cette boutique n'est pas active" }, { status: 403 });
    }

    // Mettre à jour la session
    session.set("currentStoreId", storeId);

    //  Retourner un message de confirmation au lieu d’une redirection
    return json(
      {
        message: `Vous êtes connecté à la boutique "${store.name}"`,
        store: { _id: store._id, name: store.name },
      },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  } catch (err: any) {
    return json({ error: "Erreur serveur", details: err.message || err }, { status: 500 });
  }
};
