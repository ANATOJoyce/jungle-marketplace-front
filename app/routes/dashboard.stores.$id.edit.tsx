import { useLoaderData, useNavigate, Form } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { FormInput } from "~/components/FormInput";
import { Button } from "~/components/ui/Button";
import { getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/store/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
    console.log(res)
  if (!res.ok) {
    throw new Response("Boutique introuvable", { status: 404 });
  }

  const store = await res.json();
  return json(store);
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const default_region_id = formData.get("default_region_id");

  if (typeof name !== "string" || typeof default_region_id !== "string") {
    return json({ error: "Champs invalides." }, { status: 400 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/store/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, default_region_id }),
  });

  if (!res.ok) {
    const data = await res.json();
    return json({ error: data.message || "Erreur de mise à jour" }, { status: 400 });
  }

  return redirect("/dashboard/stores");
};

export default function EditStore() {
  const store = useLoaderData<any>();
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto py-10 space-y-6">
      <h2 className="text-xl font-bold text-center text-orange-600">
        Modifier la boutique
      </h2>

      <Form method="post" className="space-y-4">
        <FormInput label="Nom" name="name" defaultValue={store.name} required />

        <FormInput
          label="Région principale"
          name="default_region_id"
          type="select"
          defaultValue={store.default_region_id}
          options={[
            { value: "region1", label: "Région Paris" },
            { value: "region2", label: "Région Lyon" },
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
