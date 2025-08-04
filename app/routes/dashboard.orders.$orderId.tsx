
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { OrderDetails } from "~/types/orderdetails";
import { formatCurrency } from "~/utils/formatCurrency";

export async function loader({ params }: LoaderFunctionArgs) {
  const res = await fetch(`http://localhost:3000/orders/${params.id}`);

  if (!res.ok) {
    throw new Response("Commande non trouvée", { status: 404 });
  }

  const order: OrderDetails = await res.json();
  return json(order);
}

export default function OrderDetailPage() {
  const order = useLoaderData<OrderDetails>();

    const { total, currency_code } = order;

  let locale = "en-US"; // Par défaut
  let currency = currency_code.code; // Par exemple, "USD", "EUR", "GBP"

  if (currency === "EUR") {
    locale = "fr-FR";  // Europe (France)
  } else if (currency === "NGN") {
    locale = "en-NG";  // Afrique (Nigeria)
  } else if (currency === "ZAR") {
    locale = "en-ZA";  // Afrique (Afrique du Sud)
  } else if (currency === "GBP") {
    locale = "en-GB";  // Royaume-Uni
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Commande #{order.display_id ?? order.id}
      </h1>

    <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Date :</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status :</strong> {order.status}</p>
          <p><strong>Client :</strong> {order.customer?.first_name} {order.customer?.last_name}</p>
          <p><strong>Email :</strong> {order.customer?.email}</p>
        </div>

        <div>
          <p><strong>Canal de vente :</strong> {order.store}</p>
          <p><strong>Paiement :</strong> {order.payments?.[0]?.status}</p>
          <p><strong>Expédition :</strong> {order.fulfillments?.[0]?.shipped_at ? "Envoyé" : "En attente"}</p>
            <p><strong>Total :</strong> {formatCurrency(total, currency, locale)}</p>        </div>
        </div>
    </div>
  );
}
