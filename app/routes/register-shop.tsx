import { json, redirect, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/FormInput";

//  Loader : vérifie session + récupère l'utilisateur
//  Loader : vérifie session + récupère l'utilisateur
  export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    if (!token) {
      return redirect("/login");
    }

    // Décoder le token pour extraire les infos de l'utilisateur
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    return json({ user: payload });
  };
//  Action : soumission du formulaire
export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    return redirect("/login");
  }

  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  console.log(token, "token")
  console.log(payload, "payload")
  // Récupérer l'email au lieu de sub
  const ownerId = payload.sub;
  console.log(ownerId, "ownerId")
  const formData = await request.formData();
  const name = formData.get("name");
  const default_sales_channel_id = formData.get("default_sales_channel_id");
  const default_region_id = formData.get("default_region_id");

  if (
    typeof name !== "string" ||
    typeof default_sales_channel_id !== "string" ||
    typeof default_region_id !== "string"
  ) {
    return json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL || "http://localhost:3000"}/store/create-shop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // si nécessaire côté Nest
      },
      body: JSON.stringify({
        name,
        default_sales_channel_id,
        default_region_id,
        owner:ownerId, // Utiliser  de l'utilisateur comme owner
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return json({ error: data.message || "Erreur lors de la création." }, { status: 400 });
    }

    return redirect("/dashboard?success=Boutique créée avec succès");
  } catch (err) {
    return json({ error: "Erreur réseau ou serveur." }, { status: 500 });
  }
};

////  Composant React
export default function RegisterShop() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const regionOptions = [
    { value: "region1", label: "Région Paris" },
    { value: "region2", label: "Région Lyon" },
  ];

  const salesChannelOptions = [
    { value: "whatsapp", label: "Boutique en ligne" },
    { value: "physical", label: "Magasin physique" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full p-6 shadow-[0_0_20px_#a3a29fff] rounded-2xl bg-white">
        <h2 className="text-xl font-bold mb-4 text-center">Créer votre boutique</h2>

        {actionData?.error && (
          <p className="text-red-600 mb-4 text-center">{actionData.error}</p>
        )}

        <Form method="post" className="space-y-4" noValidate>
          <FormInput
            label="Nom de la boutique"
            name="name"
            required
            placeholder="Ma Boutique"
          />

          <FormInput
            label="Canal de vente principal"
            name="default_sales_channel_id"
            type="select"
            required
            options={salesChannelOptions}
          />

          <FormInput
            label="Région principale"
            name="default_region_id"
            type="select"
            required
            options={regionOptions}
          />

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => history.back()}>
              Retour
            </Button>
            <Button type="submit">Créer la boutique</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
