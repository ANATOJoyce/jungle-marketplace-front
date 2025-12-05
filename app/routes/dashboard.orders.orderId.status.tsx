import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const orderId = params.orderId;

  if (!token) return redirect("/login");
  if (!orderId) return json({ success: false, error: "Aucun ID de commande fourni." }, { status: 400 });

  // On pourrait récupérer le détail de la commande depuis l'API ici
  try {
    const response = await fetch(`${process.env.NEST_API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      return json({ success: false, error: text }, { status: response.status });
    }

    const order = await response.json();
    return json({ success: true, order });
  } catch (err: any) {
    return json({ success: false, error: err.message || "Erreur serveur" }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const orderId = params.orderId;

  if (!token) return redirect("/login");
  if (!orderId) return json({ success: false, error: "Aucun ID de commande fourni." }, { status: 400 });

  const formData = await request.formData();
  const newStatus = formData.get("status");

  if (typeof newStatus !== "string" || !newStatus) {
    return json({ success: false, error: "Le statut est invalide." }, { status: 400 });
  }

  try {
    const response = await fetch(`${process.env.NEST_API_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      const text = await response.text();
      return json({ success: false, error: text }, { status: response.status });
    }

    return redirect(`/dashboard/orders/${orderId}`);
  } catch (err: any) {
    return json({ success: false, error: err.message || "Erreur inconnue" }, { status: 500 });
  }
};
