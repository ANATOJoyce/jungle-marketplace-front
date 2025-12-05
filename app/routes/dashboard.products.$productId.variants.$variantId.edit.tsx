import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Edit } from "lucide-react";
import { useState } from "react";
import { LoaderFunction, ActionFunction, json, redirect } from "react-router-dom";
import { getSession } from "~/utils/session.server";

// Loader : récupérer la variante

type Variant = {
  _id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  productId: string;
};

type ActionData = {
  error?: string;
};



export const loader: LoaderFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return redirect("/login");

  const res = await fetch(`${process.env.NEST_API_URL}/products/${params.productId}/variants/${params.variantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Response("Échec de récupération de la variante", { status: 500 });

  const variant = await res.json();
  return json({ variant });
};

// Action : mettre à jour la variante
export const action: ActionFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return redirect("/login");

  const formData = await request.formData();
  const updatedData = {
    size: formData.get("size"),
    color: formData.get("color"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
  };

  const res = await fetch(`${process.env.NEST_API_URL}/products/${params.productId}/variants/${params.variantId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) {
    return json({ error: "Échec de la modification" }, { status: 400 });
  }

  return redirect(`/dashboard/products/${params.productId}`);
};

export default function EditVariantPage() {
const { variant } = useLoaderData<{ variant: Variant }>();
  const actionData = useActionData<ActionData>();
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-md mx-auto mt-6 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Edit className="h-5 w-5" /> Modifier la variante
      </h2>

      {actionData?.error && (
        <p className="text-red-500 mb-2">{actionData.error}</p>
      )}

      <Form
        method="post"
        onSubmit={() => setLoading(true)}
        className="space-y-3"
      >
        <div>
          <label className="block mb-1">Taille</label>
          <input
            name="size"
            defaultValue={variant.size}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Couleur</label>
          <input
            name="color"
            defaultValue={variant.color}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Prix</label>
          <input
            type="number"
            name="price"
            defaultValue={variant.price}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Stock</label>
          <input
            type="number"
            name="stock"
            defaultValue={variant.stock}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {loading ? "Modification..." : "Enregistrer"}
        </button>
      </Form>
    </div>
  );
}