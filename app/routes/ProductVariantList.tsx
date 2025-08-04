// app/routes/variants/index.tsx
import { Link, useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

type VariantWithRelations = {
  id: string;
  title: string;
  sku: string;
  barcode?: string;
  product?: { title: string };
  prices: { amount: number; currency: string }[];
  inventory_quantity: number;
  created_at: string;
};

export const loader: LoaderFunction = async () => {
  const response = await fetch('http://localhost:3000/product/liste-variant');
  const variants = await response.json();
  return json({ variants });
};

export default function VariantsIndex() {
  const { variants } = useLoaderData<{ variants: VariantWithRelations[] }>();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Variantes de Produit</h1>
        <Link
          to="/variants/new"
          className="btn btn-primary"
        >
          + Nouvelle Variante
        </Link>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Produit</th>
                <th>SKU</th>
                <th>Code-barres</th>
                <th>Prix</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.title}</td>
                  <td>{variant.product?.title || '-'}</td>
                  <td>{variant.sku}</td>
                  <td>{variant.barcode || '-'}</td>
                  <td>
                    {variant.prices[0] 
                      ? `${(variant.prices[0].amount / 100).toFixed(2)} ${variant.prices[0].currency}`
                      : '-'}
                  </td>
                  <td>
                    <Link to={`/variants/${variant.id}`} className="link link-primary">
                      Éditer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}