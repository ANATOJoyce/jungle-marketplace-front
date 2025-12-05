import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }) => {
  const categoryId = params.categoryId;
  const products = await fetch(`https://api.example.com/categories/${categoryId}/products`).then(res => res.json());
  return json(products);
};

export default function CategoryDetails() {
  const products = useLoaderData();

  return (
    <div>
      <h1>Produits</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}