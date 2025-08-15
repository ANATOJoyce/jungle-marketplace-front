import { getSession } from "~/utils/session.server";
import type { Product } from "~/types/product";
import type { Store } from "~/types/store";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
  produits: Product[];
  errorMessage?: string; // Ajouter un message d'erreur
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  try {
    //  Récupérer le store lié à l’utilisateur
    const storeRes = await fetch(`${process.env.NEST_API_URL}/store/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
console.log(storeRes)
    if (!storeRes.ok) {
      const errorText = await storeRes.text();
      console.error("Erreur API (store/me):", errorText);
      return json<LoaderData>({ produits: [], errorMessage: errorText });
    }

    const storeData = await storeRes.json();
    const store: Store = storeData.data;

    if (!store?.id) {
      return json<LoaderData>({ produits: [] });
    }

    //  Récupérer les produits liés au store
    const prodRes = await fetch(
      `${process.env.NEST_API_URL}/product/me?storeId=${store.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!prodRes.ok) {
      const errorText = await prodRes.text();
      console.error("Erreur API (product/me):", errorText);
      return json<LoaderData>({ produits: [], errorMessage: errorText });
    }

    const prodData = await prodRes.json();
    const produits: Product[] = prodData.data || [];

    return json<LoaderData>({ produits });

  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return json<LoaderData>({ produits: [], errorMessage: "Une erreur est survenue lors du chargement des données." });
  }
};

export default function ProduitsList() {
  const { produits, errorMessage } = useLoaderData<LoaderData>();

  if (errorMessage) {
    return <p>Erreur: {errorMessage}</p>;
  }

  if (!produits || produits.length === 0) {
    return <p>Aucun produit disponible.</p>;
  }

  return (
    <div>
      <h1>Produits disponibles</h1>
      <ul>
        {produits.map((produit) => (
          <li key={produit.id}>
            <h2>{produit.title}</h2>
            <p>Statut : {produit.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
