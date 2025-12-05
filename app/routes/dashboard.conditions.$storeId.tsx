// app/routes/dashboard/conditions/create.tsx
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { useState } from "react";
import { getSession } from "~/utils/session.server";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/FormInput";
import { Promotion } from "~/types/promotion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PromotionCondition {
  _id: string;
  allowedUsers: Customer[];
  allowedProducts: Product[];
  type: Promotion["type"];
  createdAt: string;
  updatedAt: string;
}

type Customer = { _id: string; name: string };
type Product = { _id: string; title: string; variants?: { stock?: number }[]; totalStock?: number };

type Selectable = {
  users: Customer[];
  products: Product[];
};

type LoaderSuccess = {
  user: any;
  token: string;
  storeId: string;
  selectable: Selectable;
};

type LoaderError = {
  error: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = session.get("currentStoreId");

  if (!token) return redirect("/loginshop");
  if (!storeId) return json<LoaderError>({ error: "Aucune boutique active sélectionnée." }, { status: 400 });

  let selectable: Selectable = { users: [], products: [] };
  try {
    const res = await fetch(`${process.env.NEST_API_URL}/conditions/selectable/${storeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) selectable = await res.json();
  } catch (err) {
    console.error("Erreur récupération selectable:", err);
  }

  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  return json<LoaderSuccess>({ user: payload, token, storeId, selectable });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = session.get("currentStoreId");

  if (!token) return redirect("/loginshop");
  if (!storeId) return json({ error: "Aucune boutique active sélectionnée." }, { status: 400 });

  const formData = await request.formData();
  const promotionType = formData.get("type") as PromotionCondition["type"];
  const allowedUsers = formData.get("allowedUsers");
  const allowedProducts = formData.getAll("allowedProducts");

  const users = allowedUsers ? [allowedUsers.toString()] : [];
  const products = allowedProducts.map(p => p.toString()).filter(Boolean);

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/promotions/conditions/${storeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: promotionType,
        allowedUsers: users.length ? users : undefined,
        allowedProducts: products.length ? products : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) return json({ error: data.message || "Erreur lors de la création de la condition." }, { status: 400 });
    return redirect(`/dashboard/promotions/create?success=Condition créée`);
  } catch (err) {
    console.error("Erreur création condition:", err);
    return json({ error: "Erreur réseau ou serveur." }, { status: 500 });
  }
}

export default function CreateConditionPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [type, setType] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  if ("error" in data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{data.error}</p>
      </div>
    );
  }

  const { storeId, selectable } = data;

  const typeOptions = [
    { value: "amount_off_products", label: "Réduction sur produits" },
    { value: "amount_off_order", label: "Réduction sur commande" },
    { value: "buy_x_get_y", label: "Achetez X obtenez Y" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-lg w-full p-6 shadow-md rounded-2xl bg-white">
        <h2 className="text-xl font-bold mb-4 text-center">
          Créer une condition 
        </h2>

        {actionData?.error && <p className="text-red-600 mb-4 text-center">{actionData.error}</p>}

        <Form method="post" className="space-y-4">
          {/* TYPE RADIO */}
          <FormInput
            label="Type de promotion"
            name="type"
            type="radio"
            required
            options={typeOptions}
            onChange={e => setType(e.target.value)}
          />

          {/* USERS */}
          {(type === "amount_off_order" || type === "buy_x_get_y") && (
            <div>
              <label className="font-semibold block mb-2">Utilisateurs autorisés</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="allowedUsers" value="vip" />
                  Client VIP seulement
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="allowedUsers" value="new" />
                  Les nouveaux seulement
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="allowedUsers" value="all" />
                  Tout le monde
                </label>
              </div>
            </div>
          )}

          {/* PRODUITS */}
          {type === "amount_off_products" && (
            <div>
              <label className="font-semibold block mb-2">Produits autorisés</label>
              <div className="flex gap-2 items-center mb-2">
                <Button type="button" onClick={() => setShowProductModal(true)}>
                  + Ajouter les produits
                </Button>
                {selectedProducts.length > 0 && <span>{selectedProducts.length} produit(s) sélectionné(s)</span>}
              </div>

              {/* Inputs cachés pour envoyer les produits sélectionnés */}
              {selectedProducts.map(id => (
                <input key={id} type="hidden" name="allowedProducts" value={id} />
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Retour
            </Button>
            <Button type="submit">Créer la condition</Button>
          </div>
        </Form>

        {/* Modal Produits */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 relative">
              <button
                onClick={() => setShowProductModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-black"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Sélectionner des produits</h2>
              <div className="max-h-64 overflow-y-auto border rounded p-2 space-y-2">
                {selectable.products.length > 0 ? (
                  selectable.products.map(product => (
                    <label key={product._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={product._id}
                        checked={selectedProducts.includes(product._id)}
                        onChange={e => {
                          const id = e.target.value;
                          setSelectedProducts(prev =>
                            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
                          );
                        }}
                      />
                      {product.title} ({product.variants?.length ?? 0} variante(s))
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500">Aucun produit disponible</p>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowProductModal(false)}>Valider</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
