import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { productStatusColors } from "~/components/ui/productStatusColors";
import { Product } from "~/types/product";
import { ProductVariant } from "~/types/product-variant";
import { SalesChannel } from "~/types/sales-channel";

// Interface pour les produits paginés
interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number; 
}
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const salesChannelId = url.searchParams.get("salesChannelId") || "";

  const apiUrl = new URL(`${process.env.PUBLIC_NEST_API_URL}/product/public/pagination`);
  apiUrl.searchParams.append("page", page.toString());
  apiUrl.searchParams.append("limit", limit.toString());
  if (search) apiUrl.searchParams.append("search", search);
  if (status) apiUrl.searchParams.append("status", status);
  if (salesChannelId) apiUrl.searchParams.append("salesChannelId", salesChannelId);

  try {
    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
      throw new Response("Failed to fetch products", { status: response.status });
    }

    const data = await response.json();
    console.log('Réponse complète de l\'API:', data);  // Log de la réponse complète

    // Assure-toi de récupérer les produits dans le bon champ 'data'
    return json({
      products: data.data || [], // Remplacer 'products' par 'data'
      total: data.meta?.total || 0, // Assure-toi de récupérer 'total' à partir de 'meta'
      page: data.meta?.page || 1,
      limit: data.meta?.pageSize || 10,
      totalPages: data.meta?.totalPages || 1,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({
      products: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  }
}
// Composant principal pour afficher la liste des produits
export default function ProductListPage() {
  // Récupère les données du loader
  const { products, total, page, totalPages } = useLoaderData<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>();

  // Débogage des données
  console.log({ products, total, page, totalPages });

  // Fonction de gestion de la pagination
  const handlePageChange = (newPage: number) => {
    // Remplacer cette logique par un appel pour changer la page (Redirection ou mise à jour du loader)
    console.log("Navigating to page", newPage);
  };

  return (
    <div>
      <h1>Liste des Produits</h1>

      {/* Tableau des produits */}
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Variantes</th>
            <th>Statut</th>
            <th>Canaux de Vente</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => (
            <tr key={product.id}>
              <td>{product.title}</td>

              {/* Affichage des variantes */}
              <td>
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((variant: ProductVariant) => (
                    <span key={variant.id}>{variant.sku}, </span>
                  ))
                ) : (
                  <span>Aucune variante disponible</span>
                )}
              </td>

              {/* Affichage du statut avec couleur */}
              <td>
                <span
                  style={{
                    color:
                      productStatusColors[product.status as keyof typeof productStatusColors] ||
                      "#000000",
                  }}
                >
                  {product.status}
                </span>
              </td>

              {/* Affichage des canaux de vente */}
              <td>
                {product.sales_channels && product.sales_channels.length > 0 ? (
                  product.sales_channels.map((channel: SalesChannel) => (
                    <span key={channel.id}>{channel.name}, </span>
                  ))
                ) : (
                  "Aucun canal de vente"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <p>
          Page {page} sur {totalPages} - Total de {total} produits
        </p>
        <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
          Précédent
        </button>
        <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
          Suivant
        </button>
      </div>
    </div>
  );
}
