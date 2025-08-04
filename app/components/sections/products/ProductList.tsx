// components/sections/products/ProductList.tsx
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

type Product = {
  id: string;
  title: string;
  price: number;
  status: string;
};

type Props = {
  products: Product[];
};

export function ProductList({ products }: Props) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Produits</h1>
        <Button to="/products/new">+ Ajouter un produit</Button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nom</th>
            <th className="p-2 text-left">Sales </th>
            <th className="p-2 text-left">Statut</th>
            <th className="p-2 text-left">Collection</th>
            <th className="p-2 text-left">Variants</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.price}€</td>
              <td className="p-2">{p.status}</td>
              <td className="p-2">
                <Link
                  to={`/products/${p.id}/edit`}
                  className="text-indigo-600 hover:underline"
                >
                  Modifier
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
