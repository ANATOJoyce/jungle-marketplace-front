import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { getSession } from "~/utils/session.server";
import { Order } from "~/types/order";
import { User, CreditCard, Package, Calendar } from "lucide-react";

// Types
interface LoaderData {
  order: Order | null;
  error?: string;
}

// Loader
export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const orderId = params.orderId;

  if (!token) return redirect("/login");
  if (!orderId) return json({ order: null, error: "ID de commande manquant." });

  try {
    const response = await fetch(`${process.env.NEST_API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      return json({ order: null, error: `Erreur backend: ${text}` });
    }

    const data = await response.json();
    return json({ order: data.order || null });
  } catch (err) {
    console.error(err);
    return json({ order: null, error: "Erreur lors de la récupération de la commande." });
  }
}

// Action pour les boutons
export async function action({ request, params }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  const orderId = params.orderId;

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return redirect("/login");
  if (!orderId) return json({ error: "ID de commande manquant" }, { status: 400 });

  try {
    switch (actionType) {
      case "shipped":
      case "delivered":
      case "confirmed":
        await fetch(`${process.env.NEST_API_URL}/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: actionType }),
        });
        break;

      case "delete":
        await fetch(`${process.env.NEST_API_URL}/orders/${orderId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        return redirect("/dashboard/orders");

      case "edit":
        return redirect(`/dashboard/orders/${orderId}/edit`);

      case "notify_cancel":
      case "notify_return":
        console.log(`Notification envoyée pour ${actionType}`);
        break;

      default:
        return json({ error: "Action inconnue" }, { status: 400 });
    }

    return redirect(`/dashboard/orders/${orderId}`);
  } catch (err: any) {
    console.error(err);
    return json({ error: err.message }, { status: 500 });
  }
}

// Utilitaires
const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
    confirmed: { label: "Confirmée", className: "bg-green-100 text-green-800 border border-green-200" },
    shipped: { label: "Expédiée", className: "bg-purple-100 text-purple-800 border border-purple-200" },
    delivered: { label: "Livrée", className: "bg-green-100 text-green-800 border border-green-200" },
    canceled: { label: "Annulée", className: "bg-red-100 text-red-800 border border-red-200" },
    returned: { label: "Retournée", className: "bg-pink-100 text-pink-800 border border-pink-200" },
  };
  return statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-100 text-gray-800 border border-gray-200" };
};

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const getAvailableActions = (status: string) => {
  switch (status) {
    case "confirmed":
      return [
        { label: "Marquer comme expédiée", value: "shipped", type: "primary" },
        { label: "Marquer comme livrée", value: "delivered", type: "primary" },
      ];
    case "shipped":
      return [{ label: "Marquer comme livrée", value: "delivered", type: "primary" }];
    case "delivered":
      return [{ label: "Supprimer", value: "delete", type: "danger" }];
    case "canceled":
      return [{ label: "Notifier le client", value: "notify_cancel", type: "secondary" }];
    case "returned":
      return [
        { label: "Modifier", value: "edit", type: "secondary" },
        { label: "Supprimer", value: "delete", type: "danger" },
        { label: "Notifier le client", value: "notify_return", type: "secondary" },
      ];
    default:
      return [];
  }
};

const getButtonStyles = (type: string) => {
  switch (type) {
    case "primary": return "bg-blue-600 hover:bg-blue-700 text-white";
    case "danger": return "bg-red-600 hover:bg-red-700 text-white";
    case "secondary": return "bg-gray-600 hover:bg-gray-700 text-white";
    default: return "bg-gray-200 text-gray-800";
  }
};

// Composant

export default function OrderDetailPage() {
  const { order, error } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6 text-gray-600">Commande introuvable</div>;

  return (
    <div className="min-h-screen bg--50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded shadow p-4 mb-6 text-white">
        <h1 className="text-2xl font-bold">Commande #{order.display_id}</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-800`}>
            {getStatusBadge(order.status).label}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {formatDate(order.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Package className="w-5 h-5"/> Articles commandés</h2>
            <table className="w-full mt-4 border">
              <thead className="bg-gradient-to-r from-gray-600 to-gray-800 text-white">
                <tr>
                  <th className="px-2 py-1 text-left">Produit</th>
                  <th className="px-2 py-1 text-left">Quantité</th>
                  <th className="px-2 py-1 text-left">Prix unitaire</th>
                  <th className="px-2 py-1 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => {
                  const quantity = Number(item.quantity ?? 0);
                  const unitPrice = Number(item.unit_price ?? 0);
                  const total = quantity * unitPrice;
                  const productName = (item.item as any)?.title ?? "Produit inconnu";
                  return (
                    <tr key={idx}>
                      <td className="px-2 py-1">{productName}</td>
                      <td className="px-2 py-1">{quantity}</td>
                      <td className="px-2 py-1">{unitPrice.toFixed(2)} {String(order.currency_code)}</td>
                      <td className="px-2 py-1">{total.toFixed(2)} {String(order.currency_code)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-between mt-4 font-bold text-lg">
              <span>Total commande :</span>
              <span>{Number(order.total ?? 0).toFixed(2)} {String(order.currency_code)}</span>
            </div>
          </div>

          {/* Actions disponibles */}
          {getAvailableActions(order.status).length > 0 && (
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-semibold mb-2">Actions disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {getAvailableActions(order.status).map(action => (
                  <Form key={action.value} method="post">
                    <input type="hidden" name="actionType" value={action.value} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded text-white bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900`}
                    >
                      {isSubmitting ? "Traitement..." : action.label}
                    </button>
                  </Form>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client */}
          <div className="bg-white rounded shadow p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5"/> Client</h3>
            <div className="mt-2">
              <p><strong>Nom:</strong> {order.customer?.name ?? "—"}</p>
              <p><strong>Téléphone:</strong> {order.customer?.phone ?? "—"}</p>
              <p><strong>Client depuis:</strong> {formatDate(order.customer?.createdAt)}</p>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded shadow p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5"/> Paiement</h3>
            {order.payments?.length ? (
              <div className="mt-2 space-y-1">
                {order.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-800 text-white`}>
                      {getStatusBadge(p.status).label}
                    </span>
                    <span>{Number(p.amount ?? 0).toFixed(2)} {String(order.currency_code)}</span>
                  </div>
                ))}
              </div>
            ) : <p>Aucun paiement enregistré</p>}
          </div>

          {/* Résumé */}
          <div className="bg-white rounded shadow p-4">
            <h3 className="text-lg font-semibold">Résumé</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Nombre d'articles</span>
                <span>{order.items?.reduce((sum, i) => sum + Number(i.quantity ?? 0), 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Devise</span>
                <span className="text-gray-900 font-medium">{String(order.currency_code)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 border-t pt-2">
                <span>Total</span>
                <span>{Number(order.total ?? 0).toFixed(2)} {String(order.currency_code)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
