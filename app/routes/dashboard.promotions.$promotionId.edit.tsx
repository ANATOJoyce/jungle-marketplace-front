/*// Champs à afficher au vendeur
- Code promo (ex: "SALE2025")
- Type de remise (select: 'percentage' ou 'fixed')
- Valeur (input: nombre → 10 = 10% ou 10€)
- Produits ciblés (checkbox produits)
- Groupes de clients (optionnel)
- Région (optionnel)
- Montant min du panier (optionnel)
- Dates de début / fin (optionnel)
*/
// app/routes/dashboard/promotions/create.tsx
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");
  return null;
};

type PromotionType =
  | "fixed_product"
  | "fixed_order"
  | "percent_product"
  | "percent_order"
  | "buy_x_get_y";

type StepTypeProps = {
  type: PromotionType | null;
  onSelect: (type: PromotionType) => void;
  onNext: () => void;
};

export function StepType({ type, onSelect, onNext }: StepTypeProps) {
  const types: { label: string; value: PromotionType; description: string }[] = [
    {
      label: "💰 Remise fixe sur produits",
      value: "fixed_product",
      description: "Appliquer un montant fixe sur un ou plusieurs produits spécifiques.",
    },
    {
      label: "🛒 Remise fixe sur commande",
      value: "fixed_order",
      description: "Réduire un montant fixe sur le total de la commande.",
    },
    {
      label: "📉 Remise en % sur produits",
      value: "percent_product",
      description: "Appliquer un pourcentage de réduction sur certains produits.",
    },
    {
      label: "🏷️ Remise en % sur commande",
      value: "percent_order",
      description: "Réduire un pourcentage sur le total du panier.",
    },
    {
      label: "🎁 Acheter X, obtenir Y",
      value: "buy_x_get_y",
      description: "Offrir un produit gratuit ou une réduction après un certain achat.",
    },
  ];

  return (
    <div className="p-6 border rounded-2xl shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Sélectionnez le type de promotion
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {types.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`text-left border rounded-xl p-4 transition-all ${
              type === opt.value
                ? "bg-orange-600 text-white shadow-lg"
                : "hover:border-orange-400 bg-gray-50"
            }`}
          >
            <p className="font-semibold">{opt.label}</p>
            <p className="text-sm opacity-80">{opt.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold disabled:opacity-50"
          onClick={onNext}
          disabled={!type}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
type StepDetailsProps = {
  type: "fixed_product";
  data: any;
  onChange: (d: any) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepDetailsFixedProduct({
  data,
  onChange,
  onBack,
  onNext,
}: StepDetailsProps) {
  const handleAddCondition = (section: "who" | "what") => {
    const key = section === "who" ? "whoConditions" : "whatConditions";
    onChange({
      ...data,
      [key]: [...(data[key] || []), { attribute: "", operator: "in", value: "" }],
    });
  };

  const handleConditionChange = (
    section: "who" | "what",
    index: number,
    field: string,
    value: string
  ) => {
    const key = section === "who" ? "whoConditions" : "whatConditions";
    const updated = [...(data[key] || [])];
    updated[index][field] = value;
    onChange({ ...data, [key]: updated });
  };

  const handleRemoveCondition = (section: "who" | "what", index: number) => {
    const key = section === "who" ? "whoConditions" : "whatConditions";
    const updated = [...(data[key] || [])];
    updated.splice(index, 1);
    onChange({ ...data, [key]: updated });
  };

  return (
    <div className="p-6 border rounded-2xl shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Détails — Montant fixe sur les produits
      </h2>

      {/* Méthode d’application */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Méthode d’application
        </label>
        <select
          className="border p-2 rounded w-full"
          value={data.method || ""}
          onChange={(e) => onChange({ ...data, method: e.target.value })}
        >
          <option value="">Choisir...</option>
          <option value="CODE">Code promotionnel</option>
          <option value="AUTOMATIC">Automatique</option>
        </select>
      </div>

      {/* Statut */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statut
        </label>
        <select
          className="border p-2 rounded w-full"
          value={data.status || ""}
          onChange={(e) => onChange({ ...data, status: e.target.value })}
        >
          <option value="DRAFT">Brouillon</option>
          <option value="ACTIVE">Actif</option>
        </select>
      </div>

      {/* Code promo */}
      {data.method === "CODE" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code promotion
          </label>
          <input
            type="text"
            placeholder="Ex: 50OFF"
            className="border p-2 rounded w-full"
            value={data.code || ""}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
          />
        </div>
      )}

      {/* Taxes */}
      <label className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          checked={data.includeTaxes || false}
          onChange={(e) => onChange({ ...data, includeTaxes: e.target.checked })}
        />
        <span>Inclure les taxes dans la promotion</span>
      </label>

      {/* Devise */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Devise
        </label>
        <input
          type="text"
          placeholder="EUR, USD, etc."
          className="border p-2 rounded w-full"
          value={data.currency || ""}
          onChange={(e) => onChange({ ...data, currency: e.target.value })}
        />
      </div>

      {/* Valeur et quantité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Valeur de la promotion
          </label>
          <input
            type="number"
            placeholder="Montant (ex: 10)"
            className="border p-2 rounded w-full"
            value={data.promotionValue || ""}
            onChange={(e) => onChange({ ...data, promotionValue: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Quantité maximale par article
          </label>
          <input
            type="number"
            placeholder="Ex: 1"
            className="border p-2 rounded w-full"
            value={data.maxQuantity || ""}
            onChange={(e) => onChange({ ...data, maxQuantity: e.target.value })}
          />
        </div>
      </div>

      {/* Allocation */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Application de la réduction
        </label>
        <select
          className="border p-2 rounded w-full"
          value={data.allocation || ""}
          onChange={(e) => onChange({ ...data, allocation: e.target.value })}
        >
          <option value="">Choisir...</option>
          <option value="EACH">Chaque produit</option>
          <option value="ONCE">Une seule fois</option>
        </select>
      </div>

      {/* Conditions — QUI peut l’utiliser */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Qui peut utiliser ce code ?</h3>
        {(data.whoConditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) =>
                handleConditionChange("who", i, "attribute", e.target.value)
              }
            >
              <option value="">Attribut</option>
              <option value="customer_group">Groupe client</option>
              <option value="region">Région</option>
              <option value="country">Pays</option>
              <option value="sales_channel">Canal de vente</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) =>
                handleConditionChange("who", i, "operator", e.target.value)
              }
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) =>
                handleConditionChange("who", i, "value", e.target.value)
              }
            />

            <button
              className="text-red-500"
              onClick={() => handleRemoveCondition("who", i)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          className="mt-2 text-orange-600 underline"
          onClick={() => handleAddCondition("who")}
        >
          + Ajouter une condition
        </button>
      </div>

      {/* Conditions — SUR QUELS PRODUITS */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">
          Sur quels produits la promotion s’applique-t-elle ?
        </h3>
        {(data.whatConditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) =>
                handleConditionChange("what", i, "attribute", e.target.value)
              }
            >
              <option value="">Attribut</option>
              <option value="product">Produit</option>
              <option value="category">Catégorie</option>
              <option value="collection">Collection</option>
              <option value="type">Type</option>
              <option value="tag">Tag</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) =>
                handleConditionChange("what", i, "operator", e.target.value)
              }
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) =>
                handleConditionChange("what", i, "value", e.target.value)
              }
            />

            <button
              className="text-red-500"
              onClick={() => handleRemoveCondition("what", i)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          className="mt-2 text-orange-600 underline"
          onClick={() => handleAddCondition("what")}
        >
          + Ajouter une condition
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="text-orange-600 underline">
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="bg-orange-600 text-white px-6 py-2 rounded"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
type StepDetailsFixedOrderProps = {
  type: "fixed_order";
  data: any;
  onChange: (d: any) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepDetailsFixedOrder({
  data,
  onChange,
  onBack,
  onNext,
}: StepDetailsFixedOrderProps) {
  const handleAddCondition = () => {
    onChange({
      ...data,
      conditions: [...(data.conditions || []), { attribute: "", operator: "in", value: "" }],
    });
  };

  const handleConditionChange = (index: number, field: string, value: string) => {
    const updated = [...(data.conditions || [])];
    updated[index][field] = value;
    onChange({ ...data, conditions: updated });
  };

  const handleRemoveCondition = (index: number) => {
    const updated = [...(data.conditions || [])];
    updated.splice(index, 1);
    onChange({ ...data, conditions: updated });
  };

  return (
    <div className="p-6 border rounded-2xl shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Détails — Montant fixe sur la commande
      </h2>

      {/* Méthode d’application */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Méthode d’application
        </label>
        <select
          className="border p-2 rounded w-full"
          value={data.method || ""}
          onChange={(e) => onChange({ ...data, method: e.target.value })}
        >
          <option value="">Choisir...</option>
          <option value="CODE">Code promotionnel</option>
          <option value="AUTOMATIC">Automatique</option>
        </select>
      </div>

      {/* Statut */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
        <select
          className="border p-2 rounded w-full"
          value={data.status || ""}
          onChange={(e) => onChange({ ...data, status: e.target.value })}
        >
          <option value="DRAFT">Brouillon</option>
          <option value="ACTIVE">Actif</option>
        </select>
      </div>

      {/* Code promo */}
      {data.method === "CODE" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code promotion
          </label>
          <input
            type="text"
            placeholder="Ex: ORDER50"
            className="border p-2 rounded w-full"
            value={data.code || ""}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
          />
        </div>
      )}

      {/* Taxes */}
      <label className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          checked={data.includeTaxes || false}
          onChange={(e) => onChange({ ...data, includeTaxes: e.target.checked })}
        />
        <span>Inclure les taxes dans la promotion</span>
      </label>

      {/* Devise */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
        <input
          type="text"
          placeholder="EUR, USD, etc."
          className="border p-2 rounded w-full"
          value={data.currency || ""}
          onChange={(e) => onChange({ ...data, currency: e.target.value })}
        />
      </div>

      {/* Valeur */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Valeur de la promotion</label>
        <input
          type="number"
          placeholder="Montant de la remise (ex: 10)"
          className="border p-2 rounded w-full"
          value={data.promotionValue || ""}
          onChange={(e) => onChange({ ...data, promotionValue: e.target.value })}
        />
      </div>

      {/* Conditions - QUI peut utiliser le code */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Qui peut utiliser ce code ?</h3>
        {(data.conditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) => handleConditionChange(i, "attribute", e.target.value)}
            >
              <option value="">Attribut</option>
              <option value="customer_group">Groupe client</option>
              <option value="region">Région</option>
              <option value="country">Pays</option>
              <option value="sales_channel">Canal de vente</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) => handleConditionChange(i, "operator", e.target.value)}
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) => handleConditionChange(i, "value", e.target.value)}
            />

            <button
              className="text-red-500"
              onClick={() => handleRemoveCondition(i)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          className="mt-2 text-orange-600 underline"
          onClick={handleAddCondition}
        >
          + Ajouter une condition
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="text-orange-600 underline">
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="bg-orange-600 text-white px-6 py-2 rounded"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
type StepDetailsPercentProductProps = {
  type: "percent_product";
  data: any;
  onChange: (d: any) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepDetailsPercentProduct({
  data,
  onChange,
  onBack,
  onNext,
}: StepDetailsPercentProductProps) {
  /** --- Gestion dynamique des conditions --- **/

  // Conditions "Who can use"
  const addUsageCondition = () => {
    onChange({
      ...data,
      usageConditions: [
        ...(data.usageConditions || []),
        { attribute: "", operator: "in", value: "" },
      ],
    });
  };

  const updateUsageCondition = (i: number, field: string, value: string) => {
    const updated = [...(data.usageConditions || [])];
    updated[i][field] = value;
    onChange({ ...data, usageConditions: updated });
  };

  const removeUsageCondition = (i: number) => {
    const updated = [...(data.usageConditions || [])];
    updated.splice(i, 1);
    onChange({ ...data, usageConditions: updated });
  };

  // Conditions "What items apply"
  const addItemCondition = () => {
    onChange({
      ...data,
      itemConditions: [
        ...(data.itemConditions || []),
        { attribute: "", operator: "in", value: "" },
      ],
    });
  };

  const updateItemCondition = (i: number, field: string, value: string) => {
    const updated = [...(data.itemConditions || [])];
    updated[i][field] = value;
    onChange({ ...data, itemConditions: updated });
  };

  const removeItemCondition = (i: number) => {
    const updated = [...(data.itemConditions || [])];
    updated.splice(i, 1);
    onChange({ ...data, itemConditions: updated });
  };

  return (
    <div className="p-6 border rounded-2xl shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Détails — Pourcentage sur les produits
      </h2>

      {/* Méthode */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Méthode d’application</label>
        <select
          className="border p-2 rounded w-full"
          value={data.method || ""}
          onChange={(e) => onChange({ ...data, method: e.target.value })}
        >
          <option value="">Choisir...</option>
          <option value="CODE">Code promotionnel</option>
          <option value="AUTOMATIC">Automatique</option>
        </select>
      </div>

      {/* Statut */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Statut</label>
        <select
          className="border p-2 rounded w-full"
          value={data.status || ""}
          onChange={(e) => onChange({ ...data, status: e.target.value })}
        >
          <option value="DRAFT">Brouillon</option>
          <option value="ACTIVE">Actif</option>
        </select>
      </div>

      {/* Code */}
      {data.method === "CODE" && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Code promotion</label>
          <input
            type="text"
            placeholder="Ex: SAVE20"
            className="border p-2 rounded w-full"
            value={data.code || ""}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
          />
        </div>
      )}

      {/* Taxes */}
      <label className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          checked={data.includeTaxes || false}
          onChange={(e) => onChange({ ...data, includeTaxes: e.target.checked })}
        />
        <span>Inclure les taxes dans le calcul de la remise</span>
      </label>

      {/* Pourcentage */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Valeur de la remise (%)</label>
        <input
          type="number"
          placeholder="Ex: 15"
          className="border p-2 rounded w-full"
          value={data.percentage || ""}
          onChange={(e) => onChange({ ...data, percentage: e.target.value })}
        />
      </div>

      {/* Quantité maximale */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Quantité maximale applicable
        </label>
        <input
          type="number"
          placeholder="Ex: 2"
          className="border p-2 rounded w-full"
          value={data.maxQuantity || ""}
          onChange={(e) => onChange({ ...data, maxQuantity: e.target.value })}
        />
      </div>

      {/* Allocation */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Mode d’application</label>
        <select
          className="border p-2 rounded w-full"
          value={data.allocation || ""}
          onChange={(e) => onChange({ ...data, allocation: e.target.value })}
        >
          <option value="each">Chaque article</option>
          <option value="once">Une seule fois (selon quantité max)</option>
        </select>
      </div>

      {/* Who can use */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Qui peut utiliser ce code ?</h3>
        {(data.usageConditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) => updateUsageCondition(i, "attribute", e.target.value)}
            >
              <option value="">Attribut</option>
              <option value="customer_group">Groupe client</option>
              <option value="region">Région</option>
              <option value="country">Pays</option>
              <option value="sales_channel">Canal de vente</option>
              <option value="currency">Devise</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) => updateUsageCondition(i, "operator", e.target.value)}
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) => updateUsageCondition(i, "value", e.target.value)}
            />

            <button
              className="text-red-500"
              onClick={() => removeUsageCondition(i)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          className="mt-2 text-orange-600 underline"
          onClick={addUsageCondition}
        >
          + Ajouter une condition
        </button>
      </div>

      {/* What items apply */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">
          Sur quels produits la promotion s’applique-t-elle ?
        </h3>
        {(data.itemConditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) => updateItemCondition(i, "attribute", e.target.value)}
            >
              <option value="">Attribut</option>
              <option value="product">Produit</option>
              <option value="category">Catégorie</option>
              <option value="collection">Collection</option>
              <option value="type">Type</option>
              <option value="tag">Tag</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) => updateItemCondition(i, "operator", e.target.value)}
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) => updateItemCondition(i, "value", e.target.value)}
            />

            <button
              className="text-red-500"
              onClick={() => removeItemCondition(i)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          className="mt-2 text-orange-600 underline"
          onClick={addItemCondition}
        >
          + Ajouter une condition
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="text-orange-600 underline">
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="bg-orange-600 text-white px-6 py-2 rounded"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
type StepDetailsPercentOrderProps = {
  type: "percent_order";
  data: any;
  onChange: (d: any) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepDetailsPercentOrder({
  data,
  onChange,
  onBack,
  onNext,
}: StepDetailsPercentOrderProps) {
  const addCondition = () => {
    onChange({
      ...data,
      usageConditions: [
        ...(data.usageConditions || []),
        { attribute: "", operator: "in", value: "" },
      ],
    });
  };

  const updateCondition = (i: number, field: string, value: string) => {
    const updated = [...(data.usageConditions || [])];
    updated[i][field] = value;
    onChange({ ...data, usageConditions: updated });
  };

  const removeCondition = (i: number) => {
    const updated = [...(data.usageConditions || [])];
    updated.splice(i, 1);
    onChange({ ...data, usageConditions: updated });
  };

  return (
    <div className="p-6 border rounded-2xl shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Détails — Pourcentage sur la commande
      </h2>

      {/* Méthode */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Méthode</label>
        <select
          className="border p-2 rounded w-full"
          value={data.method || ""}
          onChange={(e) => onChange({ ...data, method: e.target.value })}
        >
          <option value="">Choisir...</option>
          <option value="CODE">Code promotionnel</option>
          <option value="AUTOMATIC">Automatique</option>
        </select>
      </div>

      {/* Statut */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Statut</label>
        <select
          className="border p-2 rounded w-full"
          value={data.status || ""}
          onChange={(e) => onChange({ ...data, status: e.target.value })}
        >
          <option value="DRAFT">Brouillon</option>
          <option value="ACTIVE">Actif</option>
        </select>
      </div>

      {/* Code */}
      {data.method === "CODE" && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Code promotion</label>
          <input
            type="text"
            placeholder="Ex: SAVE10"
            className="border p-2 rounded w-full"
            value={data.code || ""}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
          />
        </div>
      )}

      {/* Taxes */}
      <label className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          checked={data.includeTaxes || false}
          onChange={(e) => onChange({ ...data, includeTaxes: e.target.checked })}
        />
        <span>Inclure les taxes dans le calcul de la remise</span>
      </label>

      {/* Pourcentage */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Valeur de la remise (%)</label>
        <input
          type="number"
          placeholder="Ex: 15"
          className="border p-2 rounded w-full"
          value={data.percentage || ""}
          onChange={(e) => onChange({ ...data, percentage: e.target.value })}
        />
      </div>

      {/* Who can use */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Qui peut utiliser ce code ?</h3>
        {(data.usageConditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) => updateCondition(i, "attribute", e.target.value)}
            >
              <option value="">Attribut</option>
              <option value="customer_group">Groupe client</option>
              <option value="region">Région</option>
              <option value="country">Pays</option>
              <option value="sales_channel">Canal de vente</option>
              <option value="currency">Devise</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) => updateCondition(i, "operator", e.target.value)}
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) => updateCondition(i, "value", e.target.value)}
            />

            <button
              className="text-red-500"
              onClick={() => removeCondition(i)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          className="mt-2 text-orange-600 underline"
          onClick={addCondition}
        >
          + Ajouter une condition
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="text-orange-600 underline">
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="bg-orange-600 text-white px-6 py-2 rounded"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
type StepDetailsBuyXGetYProps = {
  type: "buy_x_get_y";
  data: any;
  onChange: (d: any) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepDetailsBuyXGetY({
  data,
  onChange,
  onBack,
  onNext,
}: StepDetailsBuyXGetYProps) {
  // Conditions pour "Who can use"
  const addUsageCondition = () => {
    onChange({
      ...data,
      usageConditions: [
        ...(data.usageConditions || []),
        { attribute: "", operator: "in", value: "" },
      ],
    });
  };

  const updateUsageCondition = (i: number, field: string, value: string) => {
    const updated = [...(data.usageConditions || [])];
    updated[i][field] = value;
    onChange({ ...data, usageConditions: updated });
  };

  const removeUsageCondition = (i: number) => {
    const updated = [...(data.usageConditions || [])];
    updated.splice(i, 1);
    onChange({ ...data, usageConditions: updated });
  };

  // Conditions Buy X
  const addBuyCondition = () => {
    onChange({
      ...data,
      buyConditions: [
        ...(data.buyConditions || []),
        { attribute: "", operator: "in", value: "" },
      ],
    });
  };

  const updateBuyCondition = (i: number, field: string, value: string) => {
    const updated = [...(data.buyConditions || [])];
    updated[i][field] = value;
    onChange({ ...data, buyConditions: updated });
  };

  const removeBuyCondition = (i: number) => {
    const updated = [...(data.buyConditions || [])];
    updated.splice(i, 1);
    onChange({ ...data, buyConditions: updated });
  };

  // Conditions Get Y
  const addGetCondition = () => {
    onChange({
      ...data,
      getConditions: [
        ...(data.getConditions || []),
        { attribute: "", operator: "in", value: "" },
      ],
    });
  };

  const updateGetCondition = (i: number, field: string, value: string) => {
    const updated = [...(data.getConditions || [])];
    updated[i][field] = value;
    onChange({ ...data, getConditions: updated });
  };

  const removeGetCondition = (i: number) => {
    const updated = [...(data.getConditions || [])];
    updated.splice(i, 1);
    onChange({ ...data, getConditions: updated });
  };

  return (
    <div className="p-6 border rounded-2xl shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Détails — Buy X Get Y
      </h2>

      {/* Méthode */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Méthode</label>
        <select
          className="border p-2 rounded w-full"
          value={data.method || ""}
          onChange={(e) => onChange({ ...data, method: e.target.value })}
        >
          <option value="">Choisir...</option>
          <option value="CODE">Code promotionnel</option>
          <option value="AUTOMATIC">Automatique</option>
        </select>
      </div>

      {/* Statut */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Statut</label>
        <select
          className="border p-2 rounded w-full"
          value={data.status || ""}
          onChange={(e) => onChange({ ...data, status: e.target.value })}
        >
          <option value="DRAFT">Brouillon</option>
          <option value="ACTIVE">Actif</option>
        </select>
      </div>

      {/* Code */}
      {data.method === "CODE" && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Code promotion</label>
          <input
            type="text"
            placeholder="Ex: BUY3GET1"
            className="border p-2 rounded w-full"
            value={data.code || ""}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
          />
        </div>
      )}

      {/* Who can use */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Qui peut utiliser ce code ?</h3>
        {(data.usageConditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) => updateUsageCondition(i, "attribute", e.target.value)}
            >
              <option value="">Attribut</option>
              <option value="customer_group">Groupe client</option>
              <option value="region">Région</option>
              <option value="country">Pays</option>
              <option value="sales_channel">Canal de vente</option>
              <option value="currency">Devise</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) => updateUsageCondition(i, "operator", e.target.value)}
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) => updateUsageCondition(i, "value", e.target.value)}
            />

            <button
              className="text-red-500"
              onClick={() => removeUsageCondition(i)}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className="mt-2 text-orange-600 underline"
          onClick={addUsageCondition}
        >
          + Ajouter une condition
        </button>
      </div>

      {/* Buy X */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">
          Qu’est-ce qui doit être acheté pour débloquer la promo ? (Buy X)
        </h3>
        <input
          type="number"
          placeholder="Quantité minimum requise"
          className="border p-2 rounded w-full mb-3"
          value={data.quantityX || ""}
          onChange={(e) => onChange({ ...data, quantityX: e.target.value })}
        />

        {(data.buyConditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) => updateBuyCondition(i, "attribute", e.target.value)}
            >
              <option value="">Attribut</option>
              <option value="category">Catégorie</option>
              <option value="collection">Collection</option>
              <option value="type">Type</option>
              <option value="tag">Tag</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) => updateBuyCondition(i, "operator", e.target.value)}
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) => updateBuyCondition(i, "value", e.target.value)}
            />

            <button className="text-red-500" onClick={() => removeBuyCondition(i)}>
              ✕
            </button>
          </div>
        ))}

        <button className="mt-2 text-orange-600 underline" onClick={addBuyCondition}>
          + Ajouter une condition
        </button>
      </div>

      {/* Get Y */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">
          Quels produits sont offerts ? (Get Y)
        </h3>
        <input
          type="number"
          placeholder="Quantité offerte"
          className="border p-2 rounded w-full mb-3"
          value={data.quantityY || ""}
          onChange={(e) => onChange({ ...data, quantityY: e.target.value })}
        />

        {(data.getConditions || []).map((cond: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              className="border p-2 rounded w-1/3"
              value={cond.attribute}
              onChange={(e) => updateGetCondition(i, "attribute", e.target.value)}
            >
              <option value="">Attribut</option>
              <option value="category">Catégorie</option>
              <option value="collection">Collection</option>
              <option value="type">Type</option>
              <option value="tag">Tag</option>
            </select>

            <select
              className="border p-2 rounded w-1/4"
              value={cond.operator}
              onChange={(e) => updateGetCondition(i, "operator", e.target.value)}
            >
              <option value="in">In</option>
              <option value="not_in">Not in</option>
            </select>

            <input
              type="text"
              className="border p-2 rounded w-1/3"
              placeholder="Valeur"
              value={cond.value}
              onChange={(e) => updateGetCondition(i, "value", e.target.value)}
            />

            <button className="text-red-500" onClick={() => removeGetCondition(i)}>
              ✕
            </button>
          </div>
        ))}

        <button className="mt-2 text-orange-600 underline" onClick={addGetCondition}>
          + Ajouter une condition
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="text-orange-600 underline">
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="bg-orange-600 text-white px-6 py-2 rounded"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
