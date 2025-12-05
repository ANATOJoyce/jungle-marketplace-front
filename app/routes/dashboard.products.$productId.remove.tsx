import { LoaderFunctionArgs, ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { Product } from "~/types/product";

interface LoaderData {
  product: Product | null;
  error?: string;
}

/* ---------------- LOADER ---------------- */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const productId = params.productId;

  if (!token) return redirect("/login");
  if (!productId) return json({ product: null, error: "ID du produit manquant." });

  try {
    const response = await fetch(`${process.env.NEST_API_URL}/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Produit introuvable");

    const data = await response.json();
    return json({ product: data });
  } catch (err) {
    console.error(err);
    return json({ product: null, error: "Erreur lors de la récupération du produit." });
  }
}

/* ---------------- ACTION ---------------- */
export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const productId = params.productId;

  if (!token) return redirect("/login");
  if (!productId) return json({ success: false, error: "ID du produit manquant." });

  try {
    // Récupérer d'abord le produit pour connaître le storeId
    const productRes = await fetch(`${process.env.NEST_API_URL}/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!productRes.ok) throw new Error("Produit introuvable");
    const productData = await productRes.json();
    const storeId = productData.storeId;

    // Supprimer le produit
    const response = await fetch(`${process.env.NEST_API_URL}/product/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Échec de la suppression du produit");

    return redirect(`/dashboard/stores/${storeId}/products`);
  } catch (err) {
    console.error(err);
    return json({ success: false, error: "Erreur lors de la suppression." });
  }
}


/* ---------------- COMPONENT ---------------- */
export default function RemoveProductModal() {
  const { product, error } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  if (error) return <div className="text-red-500">{error}</div>;
  if (!product) return <div>Produit introuvable</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-red-600">
           Supprimer le produit
        </h1>

        <p className="text-center">
          Es-tu sûr de vouloir supprimer le produit{" "}
          <strong>{product.title}</strong> ?
          <br />
          Cette action est{" "}
          <span className="text-red-600 font-bold">irréversible</span>.
        </p>

        <Form method="post" className="flex gap-4 justify-center pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </Form>
      </div>
    </div>
  );
}
