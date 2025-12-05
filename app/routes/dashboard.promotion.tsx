// app/routes/dashboard/promotions/create.tsx
import { useState } from "react";
import { useNavigate, useActionData, Form, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

type PromotionType =
  | "AMOUNT_OFF_PRODUCT"
  | "AMOUNT_OFF_ORDER"
  | "PERCENT_OFF_PRODUCT"
  | "PERCENT_OFF_ORDER"
  | "BUY_X_GET_Y";

  type PromotionMethod = "CODE_PROMO" | "AUTOMATIC";

  type PromotionStatus = "draft" | "active" | "expired" | "deleted";



type Product = { _id: string; title: string };
type Region = { id: string; name: string };

type LoaderData = {products: Product[];regions: Region[];};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = session.get("currentStoreId");

  if (!token) return redirect("/login");

  const url = new URL(request.url);


  try {
    // Produits
    const productsRes = await fetch(`${process.env.NEST_API_URL}/product/store/${storeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("produit",productsRes)
    if (!productsRes.ok) throw new Error("Impossible de récupérer les produits");
    const productsData = await productsRes.json();
console.log("productsData", productsData);
    // S'assurer que products est un tableau
    const products = Array.isArray(productsData.data) ? productsData.data : [];
    console.log('porduit',products)

    // Régions
    const regionsRes = await fetch(`${process.env.NEST_API_URL}/regions/countries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!regionsRes.ok) throw new Error("Impossible de récupérer les régions");
    const regionsData = await regionsRes.json();

    const regions = Array.isArray(regionsData) ? regionsData : regionsData.items || [];

    return json({ products, regions });
  } catch (err) {
    console.error(err);
    return json({
      products: [],
      regions: [],
      error: "Erreur lors de la récupération des données.",
    });
  }
}

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = session.get("currentStoreId");

  if (!token) return redirect("/login");

  const formData = await request.formData();
  const type = formData.get("type");
  const method = (formData.get("method") as string) || "AUTOMATIC";
  const code = formData.get("code");
  const value = formData.get("value");
  const status = formData.get("status");

  // Créer un tableau de conditions à partir des sélections du formulaire
  const conditions: string[] = [];

  const productIds = formData.getAll("productIds") as string[];
  const regionIds = formData.getAll("regionIds") as string[];

  if (productIds.length > 0) conditions.push(`products:${productIds.join(",")}`);
  if (regionIds.length > 0) conditions.push(`regions:${regionIds.join(",")}`);

  try {
    const response = await fetch(`${process.env.NEST_API_URL}/promotions/${storeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type,
        method,
        code,
        value,
        status,
        condition: conditions, // <-- ici
        storeId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: errorData.message || "Erreur lors de la création" });
    }

    return redirect(`/dashboard/stores/${storeId}/promotions`);
  } catch (err) {
    console.error(err);
    return json({ error: "Erreur serveur lors de la création de la promotion" });
  }
};

export default function CreatePromotion() {
  const navigate = useNavigate();
  const actionData = useActionData<{ error?: string }>();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<PromotionType | null>(null);

  const loaderData = useLoaderData<LoaderData>();
  const { products, regions } = loaderData;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {step === 1 && (
        <StepType
          type={type}
          onSelect={(t) => setType(t)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && type && (
        <StepDetails
          type={type}
          products={products}
          regions={regions}
          onBack={() => setStep(1)}
        />
      )}
      {actionData?.error && (
        <p className="text-red-500 mt-4">{actionData.error}</p>
      )}
    </div>
  );
}

function StepType({
  type,
  onSelect,
  onNext,
}: {
  type: PromotionType | null;
  onSelect: (t: PromotionType) => void;
  onNext: () => void;
}) {
const types: { label: string; value: PromotionType }[] = [
  { label: "Remise fixe produits", value: "AMOUNT_OFF_PRODUCT" },
  { label: "Remise fixe commande", value: "AMOUNT_OFF_ORDER" },
  { label: "Pourcentage produits", value: "PERCENT_OFF_PRODUCT" },
  { label: "Pourcentage commande", value: "PERCENT_OFF_ORDER" },
  { label: "Acheter X, obtenir Y", value: "BUY_X_GET_Y" },
];

  return (
    <div className="p-6 border rounded-xl bg-white">
      <h2 className="text-lg font-bold mb-4">Type de promotion</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {types.map((t) => (
          <button
            key={t.value}
            className={`p-4 border rounded ${
              type === t.value ? "bg-orange-600 text-white" : "bg-gray-50"
            }`}
            onClick={() => onSelect(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 text-right">
        <button
          disabled={!type}
          onClick={onNext}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
function StepDetails({
  type,
  products,
  regions,
  onBack,
}: {
  type: PromotionType;
  products: Product[];
  regions: Region[];
  onBack: () => void;
}) {
  const [showConditions, setShowConditions] = useState(false);

  return (
    <Form method="post" className="p-6 border rounded-xl bg-white">
      <input type="hidden" name="type" value={type} />

      {/* Statut */}
      <div className="mb-4">
        <label className="block mb-1">Statut</label>
        <select name="status" className="border p-2 rounded w-full">
          <option value="draft">Brouillon</option>
          <option value="active">Actif</option>
          <option value="expired">Expiré</option>
          <option value="deleted">Supprimé</option>
        </select>
      </div>

      {/* Méthode */}
      <div className="mb-4">
        <label className="block mb-1">Méthode</label>
        <select name="method" className="border p-2 rounded w-full">
          <option value="AUTOMATIC">Automatique</option>
          <option value="CODE_PROMO">Code Promo</option>
        </select>
      </div>

      {/* Code promotionnel */}
      <div className="mb-4">
        <label className="block mb-1">Code promotion</label>
        <input type="text" name="code" className="border p-2 rounded w-full" />
      </div>

      {/* Valeur ou pourcentage */}
      <div className="mb-4">
        <label className="block mb-1">
          {type.includes("PERCENT") ? "Pourcentage" : "Montant"}
        </label>
        <input type="number" name="value" className="border p-2 rounded w-full" />
      </div>

      {/* Bouton Ajouter une condition */}
      <div className="mb-4">
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowConditions(true)}
        >
          Ajouter une condition
        </button>
      </div>

      {/* Affichage des conditions uniquement après avoir cliqué */}
      {showConditions && (
        <>
          {/* Produits applicables */}
          {type !== "AMOUNT_OFF_ORDER" && type !== "PERCENT_OFF_ORDER" && (
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              Produits applicables
            </label>
            <select name="productIds" multiple className="border p-2 rounded w-full">
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}


          {/* Régions */}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Régions</label>
            <select name="regionIds" multiple className="border p-2 rounded w-full">
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex justify-between mt-6">
        <button type="button" onClick={onBack} className="bg-gray-300 px-4 py-2 rounded">
          Retour
        </button>
        <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded">
          Créer la promotion
        </button>
      </div>
    </Form>
  );
}
