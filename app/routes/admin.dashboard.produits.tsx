import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";

import { format } from "date-fns";

type ProductsPublishedPageProps = {
  loaderData: Product[];
};


type Variant = {
  _id: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
};

type Store = {
  _id: string;
  name: string;
};

type Product = {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  description?: string;
  totalStock?: number;
  createdAt: string;
  storeId?: Store;
  variants?: Variant[];
};

export const loader: LoaderFunction = async () => {
  const res = await fetch(`${process.env.NEST_API_URL}/product/published`);

  if (!res.ok) {
    throw new Response("Impossible de récupérer les produits publiés", { status: 500 });
  }

  const products = await res.json();

  return json({ products });
};

export default function ProductsPublishedPage() {
  const { products } = useLoaderData<{ products: Product[] }>();

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Produits publiés</h1>

      <div className="overflow-x-auto shadow rounded-lg border">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Produit</th>
              <th className="px-4 py-3 text-left">Boutique</th>
              <th className="px-4 py-3 text-left">Prix</th>
              <th className="px-4 py-3 text-left">Stock total</th>
              <th className="px-4 py-3 text-left">Créé le</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const variantStock = p.variants?.reduce(
                (s: number, v: Variant) => s + (v.stock ?? 0),
                0
              ) ?? 0;

              const totalStock = (p.totalStock ?? 0) + variantStock;

              return (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>

                  <td className="px-4 py-3 font-semibold">{p.title}</td>

                  <td className="px-4 py-3">
                    {p.storeId?.name ?? "Inconnu"}
                  </td>

                  <td className="px-4 py-3">{p.price} CFA</td>

                  <td className="px-4 py-3">{totalStock}</td>

                  <td className="px-4 py-3">
                    {format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        to={`/dashboard/product/${p._id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                      >
                        Voir
                      </Link>

                      <Link
                        to={`/dashboard/products/${p._id}/edit`}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm"
                      >
                        Modifier
                      </Link>

                      <Link
                        to={`/dashboard/products/${p._id}/delete`}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
                      >
                        Supprimer
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}