import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

// Définir le type pour les données d'action
type ActionData = 
  | { error: string } 
  | { success: boolean; orderId: any };

export async function action({ request }: ActionFunctionArgs) {
  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: "Produit Test",
          quantity: 2,
          unit_price: 15,
        },
      ],
      total: 30,
      customer: {
        name: "Client Test",
        email: "client@example.com",
      },
      shipping_address: {
        address_1: "123 rue test",
      },
    }),
  });

  if (!res.ok) {
    return json({ error: "Erreur lors de la création de la commande" }, { status: 500 });
  }

  const data = await res.json();
  return json({ success: true, orderId: data._id });
}

export default function CreateTestOrderPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Créer une commande de test</h1>
      <Form method="post">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Créer une commande
        </button>
      </Form>

      {actionData && "error" in actionData ? (
        <p className="text-red-600 mt-4">{actionData.error}</p>
      ) : null}

      {actionData && "success" in actionData && actionData.success ? (
        <div className="mt-4 text-green-600">
          ✅ Commande créée avec succès !<br />
          ID : <code>{actionData.orderId}</code>
          <br />
          👉 <a
            className="underline text-blue-600"
            href={`/dashboard.orders?id=${actionData.orderId}`}
          >
            Voir la commande
          </a>
        </div>
      ) : null}
    </div>
  );
}
