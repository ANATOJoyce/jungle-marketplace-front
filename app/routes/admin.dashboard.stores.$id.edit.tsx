import { useLoaderData, useNavigate, Form, useActionData } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { FormInput } from "~/components/FormInput";
import { Button } from "~/components/ui/Button";
import { getSession } from "~/utils/session.server";
import { useState } from "react";

// ----------- TYPES -----------
type Store = {
  id: string;
  name: string;
  status: "active" | "inactive";
  metadata?: any;
  default_sales_channel_id?: string;
  default_region_id?: string;
  default_location_id?: string | null;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  supported_currencies?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type ActionData = {
  error?: string;
};

// ----------- LOADER -----------
export const loader: LoaderFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  const res = await fetch(`${process.env.NEST_API_URL}/store/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Response("Boutique introuvable", { status: 404 });
  }

  const storeData: Store = await res.json();
  return json(storeData);
};

// ----------- ACTION -----------
export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const status = formData.get("status");

  if (typeof status !== "string") {
    return json<ActionData>({ error: "Champs invalides." }, { status: 400 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  const res = await fetch(`${process.env.NEST_API_URL}/store/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return json<ActionData>({ error: data.message || "Erreur de mise à jour" }, { status: 400 });
  }

  return redirect(`/admin/dashboard/stores`);
};

// ----------- COMPOSANT PRINCIPAL -----------
export default function EditStore() {
  const store = useLoaderData<Store>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>(store.status);

  return (
    <div className="max-w-lg mx-auto py-10 space-y-6">
      <h2 className="text-xl font-bold text-center text-orange-600">
        Modifier la boutique
      </h2>

      {actionData?.error && (
        <div className="text-red-600 text-center">{actionData.error}</div>
      )}

      <Form method="post" className="space-y-4">
        <FormInput
        label="Status"
        name="status"
        type="select"
        value={status}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
        options={[
          { value: "inactive", label: "Inactif" },
          { value: "active", label: "Actif" },
        ]}
      />
        <div className="flex gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </Form>
    </div>
  );
}
