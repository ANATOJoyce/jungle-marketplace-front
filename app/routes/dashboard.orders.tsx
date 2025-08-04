import React, { useState } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  User,
  ShoppingCart,
  Mail,
  MapPin,
  CreditCard,
  Code,
} from "lucide-react";

// Déclare LoaderData ici
type LoaderData =
  | { order: any } // Remplace 'any' par un type plus précis si possible
  | { error: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("id");

  if (!orderId) {
    // Simule une commande si aucun ID n’est passé, pour test uniquement
    return json({
      order: {
        id: "123",
        items: [
          { id: "item1", title: "Produit A", quantity: 2, price: 10 },
          { id: "item2", title: "Produit B", quantity: 1, price: 20 }
        ],
        total: 40,
        customer: { name: "Jean Dupont", email: "jean@example.com" },
        shipping_address: { address_1: "123 rue Exemple" },
        payments: [
          { status: "paid", amount: 40 }
        ]
      },
      order2: {
        id: "test123",
        items: [
          { id: "item1", title: "Produit A", quantity: 2, price: 10 },
          { id: "item2", title: "Produit B", quantity: 1, price: 20 }
        ],
        total: 40,
        customer: { name: "Jean Dupont", email: "jean@example.com" },
        shipping_address: { address_1: "123 rue Exemple" },
        payments: [
          { status: "paid", amount: 40 }
        ]
      }

    });
  }

  // Ici, ton appel réel à l’API pour récupérer une commande
  const res = await fetch(`${process.env.NEST_API_URL}/orders/${orderId}`);
  if (!res.ok) {
    return json({ error: "Order not found" }, { status: 404 });
  }

  const order = await res.json();
  return json({ order });
}


export default function OrderDetailsPage() {

   const data = useLoaderData<LoaderData>();

  if ("error" in data) {
    return <p>Erreur : {data.error}</p>;
  }

  const { order } = data;

  if (!order) return <p className="text-red-500">Commande introuvable.</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Commande {order.id}</h1>
      </div>

      {/* Summary */}
      <section>
        <h2 className="text-xl font-semibold">Résumé de la commande</h2>
        <div className="border rounded p-4 space-y-2">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.title} x {item.quantity}</span>
              <span>{item.price} CFA</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{order.total} CFA</span>
          </div>
        </div>
      </section>

      {/* Customer */}
      <section>
        <h2 className="text-xl font-semibold">Client</h2>
        <div className="border rounded p-4 space-y-1">
          <div className="flex items-center gap-2"><User size={16} />{order.customer?.name}</div>
          <div className="flex items-center gap-2"><Mail size={16} />{order.customer?.email}</div>
          <div className="flex items-center gap-2"><MapPin size={16} />{order.shipping_address?.address_1}</div>
        </div>
      </section>

      {/* Payment */}
      <section>
        <h2 className="text-xl font-semibold">Paiements</h2>
        <div className="border rounded p-4 space-y-2">
          {order.payments?.map((payment: any, i: number) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <span>Statut</span>
                <span>{payment.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant</span>
                <span>{payment.amount} CFA</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Unfulfilled Items */}
      <section>
        <h2 className="text-xl font-semibold">Produits non expédiés</h2>
        <div className="border rounded p-4 text-sm">
          <p>Aucun article en attente d'expédition.</p>
        </div>
      </section>

      {/* Fulfillment Section */}
      {order.fulfillments?.map((fulfillment: any, i: number) => (
        <section key={i}>
          <h2 className="text-xl font-semibold">Fulfillment #{i + 1}</h2>
          <div className="border rounded p-4">
            {fulfillment.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.title}</span>
                <span>{item.quantity}</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Activity Section */}
      <section>
        <h2 className="text-xl font-semibold">Activité</h2>
        <div className="border rounded p-4 text-sm">
          {order.activities?.map((event: any, i: number) => (
            <div key={i} className="flex justify-between">
              <span>{event.description}</span>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
          )) || <p>Aucune activité enregistrée.</p>}
        </div>
      </section>


    </div>
  );
}
