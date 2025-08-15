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

export default function CreatePromotionForm() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<PromotionType | null>(null);
  const [details, setDetails] = useState<any>({});
  const [campaign, setCampaign] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const payload = {
        type,
        ...details,
        ...campaign,
      };

      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/promotion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la création");
      }

      navigate("/dashboard/promotions");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-orange-600 mb-6">Créer une promotion</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {step === 1 && (
        <StepType type={type} onSelect={(val) => setType(val)} onNext={() => type && setStep(2)} />
      )}

      {step === 2 && type && (
        <StepDetails
          type={type}
          data={details}
          onChange={setDetails}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <StepCampaign
          data={campaign}
          onChange={setCampaign}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
  type Props = {
  type: PromotionType | null;
  onSelect: (type: PromotionType) => void;
  onNext: () => void;
};

function StepType({ type, onSelect, onNext }: Props) {
  const types: { label: string; value: PromotionType }[] = [
    { label: "Remise fixe sur produits", value: "fixed_product" },
    { label: "Remise fixe sur commande", value: "fixed_order" },
    { label: "Remise % sur produits", value: "percent_product" },
    { label: "Remise % sur commande", value: "percent_order" },
    { label: "Acheter X, obtenir Y", value: "buy_x_get_y" },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Type de promotion</h2>
      <div className="grid gap-4">
        {types.map((opt) => (
          <button
            key={opt.value}
            className={`border px-4 py-2 rounded-md ${
              type === opt.value ? "bg-orange-600 text-white" : "bg-white"
            }`}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        className="mt-6 px-6 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
        disabled={!type}
        onClick={onNext}
      >
        Continuer
      </button>
    </div>
  );
}

type StepDetailsProps = {
  type: PromotionType;
  data: any;
  onChange: (d: any) => void;
  onBack: () => void;
  onNext: () => void;
};

function StepDetails({ type, data, onChange, onBack, onNext }: StepDetailsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Détails - {type}</h2>

      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Nom"
          className="border p-2 rounded w-full"
          value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Code promo (facultatif)"
          className="border p-2 rounded w-full"
          value={data.code || ""}
          onChange={(e) => onChange({ ...data, code: e.target.value })}
        />

        <input
          type="number"
          placeholder="Valeur"
          className="border p-2 rounded w-full"
          value={data.value || ""}
          onChange={(e) => onChange({ ...data, value: Number(e.target.value) })}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.includeTaxes || false}
            onChange={(e) => onChange({ ...data, includeTaxes: e.target.checked })}
          />
          Inclure les taxes
        </label>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="text-orange-600 underline">
          Retour
        </button>
        <button onClick={onNext} className="bg-orange-600 text-white px-6 py-2 rounded">
          Suivant
        </button>
      </div>
    </div>
  );
}

type StepCampaignProps = {
  data: any;
  onChange: (d: any) => void;
  onBack: () => void;
  onSubmit: () => void;
};

function StepCampaign({ data, onChange, onBack, onSubmit }: StepCampaignProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Campagne</h2>

      <input
        type="text"
        placeholder="Nom de la campagne"
        className="border p-2 rounded w-full mb-4"
        value={data.campaignName || ""}
        onChange={(e) => onChange({ ...data, campaignName: e.target.value })}
      />

      <input
        type="date"
        className="border p-2 rounded w-full mb-4"
        value={data.startDate || ""}
        onChange={(e) => onChange({ ...data, startDate: e.target.value })}
      />

      <input
        type="date"
        className="border p-2 rounded w-full mb-4"
        value={data.endDate || ""}
        onChange={(e) => onChange({ ...data, endDate: e.target.value })}
      />

      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="text-orange-600 underline">
          Retour
        </button>
        <button onClick={onSubmit} className="bg-orange-600 text-white px-6 py-2 rounded">
          Enregistrer
        </button>
      </div>
    </div>
  );
}


}
