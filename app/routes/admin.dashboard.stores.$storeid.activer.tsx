import { ActionFunction, json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

type Store = {
  id: string;
  name: string;
  status: string;
};

export const loader = async ({ params, request }: any) => {
  const url = `${process.env.NEST_API_URL}/store/${params.storeid}`;
  const res = await fetch(url, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  console.log("URL appelée :", url);
  console.log("Status retour API :", res.status);

  const textBody = await res.text();
  console.log("Body retour API :", textBody);

  if (!res.ok) {
    throw json(
      { message: "Impossible de récupérer le store", details: textBody },
      { status: res.status }
    );
  }

  const store: Store = JSON.parse(textBody);
  return json(store);  //  renvoie tout l'objet store
};



export const action: ActionFunction = async ({ params }) => {
  const storeId = params.storeid; // <-- récupéré depuis l'URL
  console.log("storeId depuis params:", storeId);

  if (!storeId) {
    return json({ success: false, error: "Aucun storeId fourni" }, { status: 400 });
  }

  // Appel à ton API Nest
  const res = await fetch(`${process.env.NEST_API_URL}/store/${storeId}/activate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Erreur activation:", text);
    return json({ success: false, error: text }, { status: res.status });
  }

  return redirect("/admin/dashboard/stores"); // <-- redirige vers la liste après activation
};
