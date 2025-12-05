// app/routes/dashboard/conditions/produits/$storeId.tsx
import {
  json,
  LoaderFunctionArgs,
  redirect,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useSearchParams, Form } from "@remix-run/react";
import { Product } from "~/types/product";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { getSession } from "~/utils/session.server";
import { Button } from "~/components/ui/Button";

interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const search = url.searchParams.get("search") || "";

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = params.storeId;

  if (!token) return redirect("/login");

  if (!storeId) {
    return json({
      products: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      error: "ID de boutique manquant.",
    });
  }

  try {
    const apiUrl = new URL(`${process.env.NEST_API_URL}/product/store/${storeId}`);
    apiUrl.searchParams.append("page", page.toString());
    apiUrl.searchParams.append("limit", limit.toString());
    if (search) apiUrl.searchParams.append("search", search);

    const response = await fetch(apiUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Impossible de récupérer les produits");

    const data = await response.json();

    const productsWithTotalStock = data.data.map((product: any) => ({
      ...product,
      totalStock: product.variants?.reduce(
        (sum: number, v: any) => sum + (v.stock || 0),
        0
      ) ?? 0,
    }));

    return json({
      products: productsWithTotalStock,
      total: data.meta?.total || 0,
      page: data.meta?.page || 1,
      limit: data.meta?.pageSize || 10,
      totalPages: data.meta?.totalPages || 1,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return json({
      products: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      error: "Une erreur est survenue lors de la récupération des produits.",
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = params.storeId;

  if (!token) return redirect("/login");
  if (!storeId) {
    return json({ error: "ID de boutique manquant." }, { status: 400 });
  }

  const formData = await request.formData();
  const selected = formData.getAll("allowedProducts");

  try {
    // Ici tu peux enregistrer la condition
    const res = await fetch(
      `${process.env.NEST_API_URL}/promotions/conditions/${storeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "amount_off_products",
          allowedProducts: selected,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return json({ error: data.message || "Erreur API." }, { status: 400 });
    }

    return redirect(`/dashboard/promotions/create?success=Produits ajoutés`);
  } catch (err) {
    console.error("Erreur action produits:", err);
    return json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export default function ProductSelectPage() {
  const { products, total, page, totalPages, error } =
    useLoaderData<PaginatedProducts>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Sélectionner des produits ({total})
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        <Form method="post">
          {products.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-50 to-amber-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Sélection
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Produit
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Variantes
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Stock Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-amber-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          name="allowedProducts"
                          value={product._id}
                        />
                      </td>
                      <td className="px-6 py-4">{product.title}</td>
                      <td className="px-6 py-4">
                        {product.variants?.length > 0
                          ? `${product.variants.length} variante(s)`
                          : "Aucune"}
                      </td>
                      <td className="px-6 py-4">{product.totalStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Aucun produit disponible</p>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
            </Button>
            <span>
              Page {page} / {totalPages}
            </span>
            <Button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Suivant <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit">Enregistrer</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
